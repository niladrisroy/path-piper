
-- Ensure auth_id column exists in parent_profile table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parent_profile' 
        AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE parent_profile ADD COLUMN auth_id UUID;
    END IF;
END $$;

-- Create index for better performance if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'parent_profile' 
        AND indexname = 'idx_parent_profile_auth_id'
    ) THEN
        CREATE INDEX idx_parent_profile_auth_id ON parent_profile(auth_id);
    END IF;
END $$;
