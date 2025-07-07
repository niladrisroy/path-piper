
-- Create institution_faculty table
CREATE TABLE IF NOT EXISTS institution_faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    qualifications TEXT,
    experience TEXT,
    specialization TEXT,
    profile_image TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_facilities table
CREATE TABLE IF NOT EXISTS institution_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    capacity TEXT,
    features JSONB,
    images JSONB,
    availability TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_faculty_institution_id ON institution_faculty(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_facilities_institution_id ON institution_facilities(institution_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_institution_faculty_updated_at 
    BEFORE UPDATE ON institution_faculty 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institution_facilities_updated_at 
    BEFORE UPDATE ON institution_facilities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
