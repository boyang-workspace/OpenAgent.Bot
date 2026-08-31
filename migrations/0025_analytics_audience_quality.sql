-- Keep browser-shaped request traffic separate from conservative automation signals.
ALTER TABLE analytics_daily ADD COLUMN suspected_automation_pageviews INTEGER NOT NULL DEFAULT 0;
ALTER TABLE analytics_daily ADD COLUMN suspected_automation_visitors INTEGER NOT NULL DEFAULT 0;
ALTER TABLE analytics_page_daily ADD COLUMN suspected_automation_pageviews INTEGER NOT NULL DEFAULT 0;
ALTER TABLE analytics_entity_daily ADD COLUMN suspected_automation_views INTEGER NOT NULL DEFAULT 0;

-- Privacy-preserving, session-scoped entry attribution. No raw referrer or session ID is retained in D1.
CREATE TABLE analytics_session_acquisition_daily (
  date TEXT NOT NULL,
  source TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, source)
);

CREATE INDEX idx_analytics_session_acquisition_date ON analytics_session_acquisition_daily(date, sessions DESC);
