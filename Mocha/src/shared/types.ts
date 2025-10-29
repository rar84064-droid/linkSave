import z from "zod";

export const ScanResultSchema = z.object({
  id: z.number(),
  url: z.string(),
  status: z.enum(["safe", "suspicious", "malicious", "error"]),
  scanDetails: z.record(z.any()),
  scannedAt: z.string(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export const ScanLinkRequestSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export type ScanLinkRequest = z.infer<typeof ScanLinkRequestSchema>;
