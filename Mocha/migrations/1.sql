
CREATE TABLE scanned_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL, -- 'safe', 'suspicious', 'malicious', 'error'
  scan_details TEXT, -- JSON string with detailed results
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scanned_links_user_id ON scanned_links(user_id);
CREATE INDEX idx_scanned_links_url ON scanned_links(url);
CREATE INDEX idx_scanned_links_scanned_at ON scanned_links(scanned_at);
