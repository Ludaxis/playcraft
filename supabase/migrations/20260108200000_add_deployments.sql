-- Add deployments table and storage bucket for one-click deploy

-- Create deployments table
CREATE TABLE IF NOT EXISTS playcraft_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'published', 'failed')),
  build_log TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id),
  UNIQUE(subdomain)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON playcraft_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_subdomain ON playcraft_deployments(subdomain);

-- Enable RLS
ALTER TABLE playcraft_deployments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own deployments"
  ON playcraft_deployments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own deployments"
  ON playcraft_deployments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own deployments"
  ON playcraft_deployments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own deployments"
  ON playcraft_deployments FOR DELETE
  USING (user_id = auth.uid());

-- Create storage bucket for deployments (public for serving)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('deployments', 'deployments', true, 52428800) -- 50MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies for deployments bucket
CREATE POLICY "Public read access for deployments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deployments');

CREATE POLICY "Users can upload to their own deployment folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deployments' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can update their own deployments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'deployments' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete their own deployments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deployments' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_deployment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deployment_updated_at_trigger
  BEFORE UPDATE ON playcraft_deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_deployment_updated_at();
