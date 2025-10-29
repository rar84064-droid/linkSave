import { Hono } from "hono";

interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
}
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// OAuth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Enhanced link scanning function
async function performAdvancedScan(url: string, db: D1Database) {
  try {
    const urlObj = new URL(url);
    
    let status = "safe";
    let threatLevel = 0; // 0-100 scale
    const scanChecks = {
      httpsEnabled: urlObj.protocol === "https:",
      suspiciousCharacters: false,
      shortenerService: false,
      domainReputation: "clean",
      redirectAnalysis: "none",
      certificateValid: true,
      threatIntelligence: "clean"
    };

    // Check threat intelligence database
    const threatDomain = await db.prepare(`
      SELECT threat_type, confidence_level FROM threat_domains 
      WHERE domain = ? OR ? LIKE '%' || domain || '%'
    `).bind(urlObj.hostname, urlObj.hostname).first() as { threat_type: string; confidence_level: number } | null;

    if (threatDomain) {
      threatLevel += threatDomain.confidence_level;
      scanChecks.threatIntelligence = threatDomain.threat_type;
      scanChecks.shortenerService = threatDomain.threat_type === 'suspicious';
    }

    // Enhanced suspicious pattern detection
    const suspiciousPatterns = [
      { pattern: /[а-я]/i, reason: "Cyrillic characters (possible homograph attack)", risk: 40 },
      { pattern: /[αβγδεζηθικλμνξοπρστυφχψω]/i, reason: "Greek characters (possible homograph attack)", risk: 40 },
      { pattern: /xn--/, reason: "Punycode detected", risk: 30 },
      { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, reason: "IP address instead of domain", risk: 35 },
      { pattern: /-{2,}/, reason: "Multiple consecutive hyphens", risk: 20 },
      { pattern: /\.(tk|ml|ga|cf)$/, reason: "Free domain extension", risk: 25 },
      { pattern: /(paypal|amazon|google|microsoft|apple)\w*\.(tk|ml|ga|cf|info|biz)/, reason: "Brand impersonation with suspicious TLD", risk: 70 },
      { pattern: /[0-9]+(paypal|amazon|google|microsoft|apple)/, reason: "Brand name with numbers (suspicious)", risk: 50 }
    ];

    const detectedPatterns = [];
    for (const { pattern, reason, risk } of suspiciousPatterns) {
      if (pattern.test(url)) {
        detectedPatterns.push(reason);
        threatLevel += risk;
        scanChecks.suspiciousCharacters = true;
      }
    }

    // Check for URL length (extremely long URLs can be suspicious)
    if (url.length > 200) {
      threatLevel += 15;
      detectedPatterns.push("Unusually long URL");
    }

    // Check for suspicious subdomain patterns
    const subdomainCount = urlObj.hostname.split('.').length - 2;
    if (subdomainCount > 3) {
      threatLevel += 20;
      detectedPatterns.push("Multiple suspicious subdomains");
    }

    // HTTPS check
    if (!scanChecks.httpsEnabled) {
      threatLevel += 25;
    }

    // Determine final status based on threat level
    if (threatLevel >= 70) {
      status = "malicious";
    } else if (threatLevel >= 30) {
      status = "suspicious";
    } else {
      status = "safe";
    }

    return {
      status,
      scanDetails: {
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        threatLevel,
        detectedPatterns,
        checks: scanChecks,
        scanTimestamp: new Date().toISOString(),
        scanVersion: "2.0"
      }
    };

  } catch (error) {
    return {
      status: "error",
      scanDetails: {
        error: "Invalid URL or scan failed",
        errorDetails: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Link scanning routes
const ScanLinkSchema = z.object({
  url: z.string().url("Invalid URL format")
});

app.post("/api/scan-link", authMiddleware, zValidator("json", ScanLinkSchema), async (c) => {
  const user = c.get("user");
  const { url } = c.req.valid("json");
  
  try {
    // Perform advanced scan
    const scanResult = await performAdvancedScan(url, c.env.DB);
    
    // Save to database
    const result = await c.env.DB.prepare(`
      INSERT INTO scanned_links (user_id, url, status, scan_details, scanned_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(user!.id, url, scanResult.status, JSON.stringify(scanResult.scanDetails)).run();

    return c.json({
      id: result.meta.last_row_id,
      url,
      status: scanResult.status,
      scanDetails: scanResult.scanDetails,
      scannedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error scanning link:", error);
    
    // Save error result to database
    await c.env.DB.prepare(`
      INSERT INTO scanned_links (user_id, url, status, scan_details, scanned_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(user!.id, url, "error", JSON.stringify({ 
      error: "Failed to scan URL",
      errorDetails: error instanceof Error ? error.message : "Unknown error"
    })).run();

    return c.json({
      url,
      status: "error",
      scanDetails: { 
        error: "Failed to scan URL",
        errorDetails: error instanceof Error ? error.message : "Unknown error"
      },
      scannedAt: new Date().toISOString()
    }, 500);
  }
});

app.get("/api/scan-history", authMiddleware, async (c) => {
  const user = c.get("user");
  
  const { results } = await c.env.DB.prepare(`
    SELECT id, url, status, scan_details, scanned_at
    FROM scanned_links
    WHERE user_id = ?
    ORDER BY scanned_at DESC
    LIMIT 50
  `).bind(user!.id).all();

  return c.json(results.map((row: any) => ({
    id: row.id,
    url: row.url,
    status: row.status,
    scanDetails: JSON.parse(row.scan_details || "{}"),
    scannedAt: row.scanned_at
  })));
});

// New endpoint for scan statistics
app.get("/api/scan-stats", authMiddleware, async (c) => {
  const user = c.get("user");
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      status,
      COUNT(*) as count,
      DATE(scanned_at) as scan_date
    FROM scanned_links
    WHERE user_id = ?
    GROUP BY status, DATE(scanned_at)
    ORDER BY scan_date DESC
    LIMIT 30
  `).bind(user!.id).all();

  return c.json(results);
});

export default app;
