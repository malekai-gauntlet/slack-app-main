-- Add dm_user_id column to messages table
ALTER TABLE messages
ADD COLUMN dm_user_id UUID REFERENCES auth.users(id);

-- Add index for faster DM message lookups
CREATE INDEX messages_dm_user_id_idx ON messages(dm_user_id);

-- Add composite index for faster DM conversation lookups
CREATE INDEX messages_dm_conversation_idx ON messages(user_id, dm_user_id) WHERE dm_user_id IS NOT NULL; 