-- Add thread-related columns to messages table
ALTER TABLE messages 
  ADD COLUMN parent_message_id UUID REFERENCES messages(id),
  ADD COLUMN thread_participant_count INT DEFAULT 0,
  ADD COLUMN last_reply_at TIMESTAMPTZ,
  ADD COLUMN has_thread BOOLEAN DEFAULT false;

-- Create index for better performance on thread queries
CREATE INDEX idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX idx_messages_has_thread ON messages(has_thread) WHERE has_thread = true;

-- Function to update thread metadata
CREATE OR REPLACE FUNCTION update_thread_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent message's thread metadata
  UPDATE messages
  SET 
    thread_participant_count = (
      SELECT COUNT(*) 
      FROM messages 
      WHERE parent_message_id = NEW.parent_message_id
    ),
    last_reply_at = NOW(),
    has_thread = true
  WHERE id = NEW.parent_message_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update thread metadata
CREATE TRIGGER thread_metadata_update
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.parent_message_id IS NOT NULL)
  EXECUTE FUNCTION update_thread_metadata();

-- Add policies for thread messages
CREATE POLICY "Users can read thread messages" ON messages
  FOR SELECT USING (
    -- Can read if they can see the parent message
    parent_message_id IS NULL OR
    EXISTS (
      SELECT 1 FROM messages parent
      JOIN memberships m ON m.channel_id = parent.channel_id
      WHERE parent.id = messages.parent_message_id
      AND m.user_id = auth.uid()
    ) OR
    -- Or if it's a DM thread they're part of
    EXISTS (
      SELECT 1 FROM messages parent
      WHERE parent.id = messages.parent_message_id
      AND (
        (parent.user_id = auth.uid()) OR
        (parent.dm_user_id = auth.uid())
      )
    )
  );

-- Add policy for creating thread messages
CREATE POLICY "Users can create thread messages" ON messages
  FOR INSERT WITH CHECK (
    -- Can reply if they can see the parent message
    parent_message_id IS NULL OR
    EXISTS (
      SELECT 1 FROM messages parent
      JOIN memberships m ON m.channel_id = parent.channel_id
      WHERE parent.id = parent_message_id
      AND m.user_id = auth.uid()
    ) OR
    -- Or if it's a DM thread they're part of
    EXISTS (
      SELECT 1 FROM messages parent
      WHERE parent.id = parent_message_id
      AND (
        (parent.user_id = auth.uid()) OR
        (parent.dm_user_id = auth.uid())
      )
    )
  );

-- Add function to clean up thread metadata when messages are deleted
CREATE OR REPLACE FUNCTION cleanup_thread_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent message's thread metadata
  UPDATE messages
  SET 
    thread_participant_count = (
      SELECT COUNT(*) 
      FROM messages 
      WHERE parent_message_id = OLD.parent_message_id
      AND id != OLD.id
    ),
    -- Set has_thread to false if this was the last reply
    has_thread = EXISTS (
      SELECT 1 FROM messages 
      WHERE parent_message_id = OLD.parent_message_id
      AND id != OLD.id
    ),
    -- Update last_reply_at to the most recent remaining reply
    last_reply_at = (
      SELECT MAX(created_at)
      FROM messages
      WHERE parent_message_id = OLD.parent_message_id
      AND id != OLD.id
    )
  WHERE id = OLD.parent_message_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup when thread messages are deleted
CREATE TRIGGER thread_metadata_cleanup
  BEFORE DELETE ON messages
  FOR EACH ROW
  WHEN (OLD.parent_message_id IS NOT NULL)
  EXECUTE FUNCTION cleanup_thread_metadata(); 