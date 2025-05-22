
-- RLS policies for student_profiles table
CREATE POLICY "Users can insert their own student profile"
ON student_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all student profiles"
ON student_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own student profile"
ON student_profiles
FOR UPDATE
USING (auth.uid() = id);
