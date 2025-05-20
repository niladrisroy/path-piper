export type UserRole = "student" | "mentor" | "institution"
export type AgeGroup = "early-childhood" | "elementary" | "middle-school" | "high-school" | "young-adult"
export type EducationLevel =
  | "pre_school"
  | "school"
  | "high_school"
  | "undergraduate"
  | "graduate"
  | "post_graduate"
  | "phd"
export type ExperienceType = "work" | "education" | "volunteer" | "certification"

export interface Profile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  bio: string | null
  location: string | null
  profile_image_url: string | null
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  age_group: AgeGroup
  education_level: EducationLevel
  parent_email: string | null
  parent_verified: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface MentorProfile {
  id: string
  profession: string
  organization: string | null
  years_experience: number | null
  verified: boolean
  onboarding_completed: boolean
  hours_per_week: number
  max_mentees: number
  created_at: string
  updated_at: string
}

export interface InstitutionProfile {
  id: string
  institution_name: string
  institution_type: string
  category: string
  website: string | null
  logo_url: string | null
  cover_image_url: string | null
  verified: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string | null
  created_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency_level: number
  created_at: string
  updated_at: string
  skill?: Skill // For joined queries
}

export interface Interest {
  id: string
  name: string
  category: string | null
  created_at: string
}

export interface UserInterest {
  id: string
  user_id: string
  interest_id: string
  created_at: string
  interest?: Interest // For joined queries
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  timeframe: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface MentorExpertise {
  id: string
  mentor_id: string
  subject: string
  description: string | null
  years_experience: number | null
  created_at: string
  updated_at: string
}

export interface MentorExperience {
  id: string
  mentor_id: string
  title: string
  organization: string
  start_date: string
  end_date: string | null
  current: boolean
  description: string | null
  type: ExperienceType
  credential_id: string | null
  credential_url: string | null
  created_at: string
  updated_at: string
}

export interface MentorAvailability {
  id: string
  mentor_id: string
  time_slot: string
  created_at: string
}

export interface InstitutionProgram {
  id: string
  institution_id: string
  name: string
  type: string
  level: string
  duration: string
  duration_type: string
  description: string
  eligibility: string | null
  outcomes: string | null
  assessment: string | null
  certification: string | null
  schedule: string | null
  created_at: string
  updated_at: string
}

export interface InstitutionEvent {
  id: string
  institution_id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string | null
  location: string | null
  image_url: string | null
  registration_url: string | null
  created_at: string
  updated_at: string
}

export interface InstitutionGallery {
  id: string
  institution_id: string
  image_url: string
  caption: string | null
  created_at: string
}

export interface Mentorship {
  id: string
  mentor_id: string
  student_id: string
  status: string
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface FeedPost {
  id: string
  user_id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  profile?: Profile // For joined queries
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profile?: Profile // For joined queries
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}
