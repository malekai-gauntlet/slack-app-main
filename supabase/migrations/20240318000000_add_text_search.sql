-- Add text search capabilities to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS content_search tsvector 
GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

-- Create a GIN index for faster full-text search
CREATE INDEX IF NOT EXISTS messages_content_search_idx 
ON messages USING GIN (content_search);

-- Function to update existing messages
CREATE OR REPLACE FUNCTION update_content_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_search := to_tsvector('english', coalesce(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update content_search
CREATE TRIGGER messages_content_search_update
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_content_search(); 