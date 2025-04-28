-- Create enum for prompt status
CREATE TYPE prompt_status AS ENUM ('private', 'public');

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  user_request TEXT NOT NULL,
  analysis_result TEXT,
  final_prompt TEXT,
  metadata JSONB DEFAULT '{"categories": []}',
  model_used TEXT NOT NULL,
  settings JSONB NOT NULL,
  status prompt_status NOT NULL DEFAULT 'private',
  auto_version BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create prompt versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  final_prompt TEXT NOT NULL,
  notes TEXT,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_id, version_number)
);

-- Add RLS policies
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- Allow public access to public prompts
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
  FOR SELECT USING (status = 'public');

-- Allow users to view their own prompts
CREATE POLICY "Users can view own prompts" ON prompts
  FOR SELECT USING (
    (client_id = current_setting('app.client_id', true)) OR
    (user_id = auth.uid())
  );

-- Allow users to insert their own prompts
CREATE POLICY "Users can insert own prompts" ON prompts
  FOR INSERT WITH CHECK (
    (client_id = current_setting('app.client_id', true)) OR
    (user_id = auth.uid())
  );

-- Allow users to update their own prompts
CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE USING (
    (client_id = current_setting('app.client_id', true)) OR
    (user_id = auth.uid())
  ) WITH CHECK (
    (client_id = current_setting('app.client_id', true)) OR
    (user_id = auth.uid())
  );

-- Allow users to delete their own prompts
CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE USING (
    (client_id = current_setting('app.client_id', true)) OR
    (user_id = auth.uid())
  );

-- Allow users to view versions of their own prompts
CREATE POLICY "Users can view versions of own prompts" ON prompt_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompt_versions.prompt_id = prompts.id AND
      ((prompts.client_id = current_setting('app.client_id', true)) OR
       (prompts.user_id = auth.uid()) OR
       (prompts.status = 'public'))
    )
  );

-- Allow users to insert versions for their own prompts
CREATE POLICY "Users can insert versions for own prompts" ON prompt_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompt_versions.prompt_id = prompts.id AND
      ((prompts.client_id = current_setting('app.client_id', true)) OR
       (prompts.user_id = auth.uid()))
    )
  );

-- Create indexes
CREATE INDEX idx_prompts_client_id ON prompts(client_id);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_created_at ON prompts(created_at);
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);

-- Create function to set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER set_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_prompt_versions_updated_at
BEFORE UPDATE ON prompt_versions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to set app.client_id from cookies
CREATE OR REPLACE FUNCTION set_client_id()
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder - in your application code,
  -- you'll need to set this configuration parameter before database operations
  -- using the client ID from cookies
  PERFORM set_config('app.client_id', 'default_client_id', false);
END;
$$ LANGUAGE plpgsql;