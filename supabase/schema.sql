-- projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- endpoints table
CREATE TABLE endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Endpoint',
  url TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  headers JSONB DEFAULT '{}'::jsonb,
  body JSONB,
  auth_token TEXT,
  webhook_url TEXT,
  check_interval_minutes INTEGER NOT NULL DEFAULT 5,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- snapshots table
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- drift_alerts table
CREATE TABLE drift_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
  severity TEXT NOT NULL, -- e.g., 'low', 'medium', 'high', 'critical'
  summary TEXT NOT NULL,
  diff_json JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row-Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE drift_alerts ENABLE ROW LEVEL SECURITY;

-- For MVP, allowing authenticated users full access
CREATE POLICY "Allow full access for authenticated users on projects" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access for authenticated users on endpoints" ON endpoints FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access for authenticated users on snapshots" ON snapshots FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access for authenticated users on drift_alerts" ON drift_alerts FOR ALL TO authenticated USING (true);
