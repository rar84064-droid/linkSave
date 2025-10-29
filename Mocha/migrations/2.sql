
-- Add index for status column only (other indexes already exist)
CREATE INDEX IF NOT EXISTS idx_scanned_links_status ON scanned_links(status);

-- Add a new table for threat intelligence
CREATE TABLE IF NOT EXISTS threat_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  threat_type TEXT NOT NULL, -- 'phishing', 'malware', 'suspicious', 'spam'
  confidence_level INTEGER DEFAULT 50, -- 1-100
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Populate with common malicious domains
INSERT OR IGNORE INTO threat_domains (domain, threat_type, confidence_level) VALUES
('bit.ly', 'suspicious', 30),
('tinyurl.com', 'suspicious', 25),
('t.co', 'suspicious', 20),
('goo.gl', 'suspicious', 25),
('short.link', 'suspicious', 35),
('ow.ly', 'suspicious', 30),
('tiny.cc', 'suspicious', 40);
