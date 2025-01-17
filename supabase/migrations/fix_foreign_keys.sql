-- First, ensure the messages table has the correct foreign key constraint
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

ALTER TABLE messages
ADD CONSTRAINT messages_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Then, ensure the profiles table has the correct foreign key constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE; 