-- Database setup for CHILL & TUNE Radio App
-- Run this in your Supabase SQL editor

-- Create viewers table for tracking listener count
CREATE TABLE IF NOT EXISTS viewers (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  username TEXT DEFAULT 'Anonymous',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_viewers_online ON viewers(is_online, last_seen);
CREATE INDEX IF NOT EXISTS idx_viewers_session ON viewers(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE viewers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on viewers" ON viewers
  FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO viewers (session_id, username, is_online) 
VALUES 
  ('sample_viewer_1', 'Sample User 1', true),
  ('sample_viewer_2', 'Sample User 2', true)
ON CONFLICT (session_id) DO NOTHING;

-- Create a function to clean up old offline viewers (optional)
CREATE OR REPLACE FUNCTION cleanup_old_viewers()
RETURNS void AS $$
BEGIN
  DELETE FROM viewers 
  WHERE last_seen < NOW() - INTERVAL '1 hour' 
  AND is_online = false;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run cleanup every hour (optional)
-- SELECT cron.schedule('cleanup-viewers', '0 * * * *', 'SELECT cleanup_old_viewers();');

-- Grant necessary permissions
GRANT ALL ON viewers TO authenticated;
GRANT ALL ON viewers TO anon;
