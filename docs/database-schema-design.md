
# PathPiper Database Schema Design

## Overview
PathPiper uses a PostgreSQL database with Supabase for authentication. The schema is designed to support a comprehensive educational platform with three main user types: Students, Mentors, and Institutions.

## Schema Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PATHPIPER DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                AUTHENTICATION LAYER                                  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                                                  │
│  │   auth.users    │ (Managed by Supabase)                                           │
│  │  ─────────────  │                                                                  │
│  │  • id (UUID)    │ ←──────┐                                                        │
│  │  • email        │        │                                                        │
│  │  • created_at   │        │                                                        │
│  │  • metadata     │        │                                                        │
│  └─────────────────┘        │                                                        │
└──────────────────────────────┼──────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────────────┐
│                              │           CORE PROFILE SYSTEM                        │
├──────────────────────────────┼──────────────────────────────────────────────────────┤
│                              │                                                       │
│  ┌─────────────────────────────▼─────────────────────────────┐                      │
│  │                     profiles                              │                      │
│  │  ──────────────────────────────────────────────────────  │                      │
│  │  • id (UUID) ←─── FK to auth.users                       │                      │
│  │  • role (student|mentor|institution)                     │                      │
│  │  • first_name, last_name                                 │                      │
│  │  • bio, location, tagline                                │                      │
│  │  • profile_image_url, cover_image_url                    │                      │
│  │  • verification_status, theme_preference                 │                      │
│  │  • email, phone (contact info)                           │                      │
│  │  • availability_status, last_active_date                 │                      │
│  │  • profile_views, created_at, updated_at                 │                      │
│  └───────────────────────────┬───────────────────────────────┘                      │
│                              │                                                       │
│                              │                                                       │
│          ┌───────────────────┼───────────────────┐                                 │
│          │                   │                   │                                 │
│          ▼                   ▼                   ▼                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                  │
│  │ student_profiles │ │ mentor_profiles  │ │institution_profiles│                │
│  │ ──────────────── │ │ ──────────────── │ │ ──────────────── │                  │
│  │ • id (UUID)      │ │ • id (UUID)      │ │ • id (UUID)      │                  │
│  │ • education_level│ │ • profession     │ │ • institution_name│                 │
│  │ • age_group      │ │ • organization   │ │ • institution_type│                 │
│  │ • birth_month/yr │ │ • years_experience│ │ • website        │                 │
│  │ • personality_type│ │ • verified       │ │ • logo_url       │                 │
│  │ • learning_style │ │ • onboarding_done│ │ • verified       │                 │
│  │ • favorite_quote │ │ • hours_per_week │ │ • onboarding_done│                 │
│  │ • parent_email   │ │ • max_mentees    │ │ • created_at     │                 │
│  │ • onboarding_done│ │ • created_at     │ │ • updated_at     │                 │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘                  │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                               SOCIAL & CONTENT SYSTEM                                │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │   feed_posts    │    │  post_comments  │    │   post_likes    │                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (UUID)    │◄──┐│  • id (UUID)    │    │  • id (UUID)    │                 │
│  │  • user_id ──────┼─┐ ││  • post_id ─────┼────┤  • post_id ─────┼─────────────────┤
│  │  • content      │ │ ││  • user_id      │    │  • user_id      │                 │
│  │  • image_url    │ │ ││  • content      │    │  • created_at   │                 │
│  │  • likes_count  │ │ ││  • created_at   │    │                 │                 │
│  │  • comments_count│ │ ││  • updated_at   │    └─────────────────┘                 │
│  │  • created_at   │ │ │└─────────────────┘                                        │
│  │  • updated_at   │ │ │                                                            │
│  └─────────────────┘ │ │                                                            │
│                      │ │                                                            │
│  ┌─────────────────┐ │ │  ┌─────────────────┐    ┌─────────────────┐               │
│  │ connection_req  │ │ │  │   connections   │    │   social_links  │               │
│  │  ─────────────  │ │ │  │  ─────────────  │    │  ─────────────  │               │
│  │  • id (UUID)    │ │ │  │  • id (UUID)    │    │  • id (UUID)    │               │
│  │  • sender_id ────┼─┘ │  │  • user1_id ────┼────┤  • user_id ─────┼───────────────┤
│  │  • receiver_id ──┼───┘  │  • user2_id     │    │  • platform     │               │
│  │  • status       │      │  • conn_type    │    │  • url          │               │
│  │  • message      │      │  • connected_at │    │  • display_name │               │
│  │  • created_at   │      │                 │    │  • created_at   │               │
│  │  • updated_at   │      └─────────────────┘    │  • updated_at   │               │
│  └─────────────────┘                             └─────────────────┘               │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           SKILLS & INTERESTS SYSTEM                                  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │skill_categories │    │     skills      │    │   user_skills   │                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (serial)  │◄───┤  • id (serial)  │◄───┤  • id (serial)  │                 │
│  │  • name         │    │  • name         │    │  • user_id ─────┼─────────────────┤
│  │  • age_group    │    │  • category_id  │    │  • skill_id     │                 │
│  │  • created_at   │    │  • created_at   │    │  • proficiency  │                 │
│  │  • updated_at   │    │  • updated_at   │    │  • created_at   │                 │
│  └─────────────────┘    └─────────────────┘    │  • updated_at   │                 │
│                                                 └─────────────────┘                 │
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │interest_categories│   │    interests    │    │ user_interests  │                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (serial)  │◄───┤  • id (serial)  │◄───┤  • id (serial)  │                 │
│  │  • name         │    │  • name         │    │  • user_id ─────┼─────────────────┤
│  │  • age_group    │    │  • category_id  │    │  • interest_id  │                 │
│  │  • created_at   │    │  • created_at   │    │  • created_at   │                 │
│  │  • updated_at   │    │  • updated_at   │    │  • updated_at   │                 │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                 │
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │skill_endorsements│   │    languages    │    │ user_languages  │                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (UUID)    │    │  • id (serial)  │◄───┤  • id (serial)  │                 │
│  │  • endorser_id ──┼────┤  • name         │    │  • user_id ─────┼─────────────────┤
│  │  • endorsed_user │    │  • code         │    │  • language_id  │                 │
│  │  • skill_id     │    │  • created_at   │    │  • proficiency  │                 │
│  │  • comment      │    └─────────────────┘    │  • created_at   │                 │
│  │  • created_at   │                            │  • updated_at   │                 │
│  └─────────────────┘                            └─────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              GOALS & ACHIEVEMENTS                                    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │ career_goals    │    │     goals       │    │ custom_badges   │                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (serial)  │    │  • id (serial)  │    │  • id (UUID)    │                 │
│  │  • user_id ─────┼────┤  • user_id ─────┼────┤  • user_id ─────┼─────────────────┤
│  │  • title        │    │  • title        │    │  • title        │                 │
│  │  • description  │    │  • description  │    │  • description  │                 │
│  │  • target_date  │    │  • category     │    │  • icon_url     │                 │
│  │  • priority     │    │  • timeframe    │    │  • color        │                 │
│  │  • status       │    │  • completed    │    │  • earned_date  │                 │
│  │  • created_at   │    │  • created_at   │    │  • issuer       │                 │
│  │  • updated_at   │    │  • updated_at   │    │  • verification │                 │
│  └─────────────────┘    └─────────────────┘    │  • created_at   │                 │
│                                                 │  • updated_at   │                 │
│  ┌─────────────────┐    ┌─────────────────┐    └─────────────────┘                 │
│  │    hobbies      │    │  user_hobbies   │                                        │
│  │  ─────────────  │    │  ─────────────  │    ┌─────────────────┐                 │
│  │  • id (serial)  │◄───┤  • id (serial)  │    │   mood_board    │                 │
│  │  • name         │    │  • user_id ─────┼────┤  ─────────────  │                 │
│  │  • category     │    │  • hobby_id     │    │  • id (UUID)    │                 │
│  │  • created_at   │    │  • created_at   │    │  • user_id ─────┼─────────────────┤
│  └─────────────────┘    └─────────────────┘    │  • image_url    │                 │
│                                                 │  • caption      │                 │
│                                                 │  • position     │                 │
│                                                 │  • created_at   │                 │
│                                                 │  • updated_at   │                 │
│                                                 └─────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                               EDUCATION SYSTEM                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │institution_cat  │    │institution_types│    │student_education│                 │
│  │  ─────────────  │    │  ─────────────  │    │    _history     │                 │
│  │  • id (serial)  │◄───┤  • id (serial)  │◄───┤  ─────────────  │                 │
│  │  • name         │    │  • category_id  │    │  • id (UUID)    │                 │
│  │  • slug         │    │  • name         │    │  • student_id ──┼─────────────────┤
│  │  • description  │    │  • slug         │    │  • institution_id│                 │
│  │  • created_at   │    │  • description  │    │  • inst_name    │                 │
│  │  • updated_at   │    │  • created_at   │    │  • inst_type_id │                 │
│  └─────────────────┘    │  • updated_at   │    │  • degree_prog  │                 │
│                          └─────────────────┘    │  • field_study  │                 │
│                                                 │  • start_date   │                 │
│                                                 │  • end_date     │                 │
│                                                 │  • is_current   │                 │
│                                                 │  • grade_level  │                 │
│                                                 │  • gpa          │                 │
│                                                 │  • achievements │                 │
│                                                 │  • subjects(json)│                 │
│                                                 │  • created_at   │                 │
│                                                 │  • updated_at   │                 │
│                                                 └─────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                               MENTORSHIP SYSTEM                                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │  mentorships    │    │mentor_expertise │    │mentor_experience│                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (UUID)    │    │  • id (UUID)    │    │  • id (UUID)    │                 │
│  │  • mentor_id ───┼────┤  • mentor_id ───┼────┤  • mentor_id ───┼─────────────────┤
│  │  • student_id ──┼─┐  │  • subject      │    │  • title        │                 │
│  │  • status       │ │  │  • description  │    │  • organization │                 │
│  │  • start_date   │ │  │  • years_exp    │    │  • start_date   │                 │
│  │  • end_date     │ │  │  • created_at   │    │  • end_date     │                 │
│  │  • created_at   │ │  │  • updated_at   │    │  • current      │                 │
│  │  • updated_at   │ │  └─────────────────┘    │  • description  │                 │
│  └─────────────────┘ │                         │  • type         │                 │
│                      │                         │  • credential_id│                 │
│                      │  ┌─────────────────┐    │  • credential_url│                │
│                      │  │mentor_availability│  │  • created_at   │                 │
│                      │  │  ─────────────  │    │  • updated_at   │                 │
│                      │  │  • id (UUID)    │    └─────────────────┘                 │
│                      │  │  • mentor_id ───┼────────────────────────────────────────┘
│                      │  │  • time_slot    │                                         │
│                      │  │  • created_at   │                                         │
│                      │  └─────────────────┘                                         │
│                      │                                                              │
│                      └─────── (Links to student_profiles)                          │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                             INSTITUTION FEATURES                                     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │institution_prog │    │institution_event│    │institution_gall │                 │
│  │  ─────────────  │    │  ─────────────  │    │  ─────────────  │                 │
│  │  • id (UUID)    │    │  • id (UUID)    │    │  • id (UUID)    │                 │
│  │  • inst_id ─────┼────┤  • inst_id ─────┼────┤  • inst_id ─────┼─────────────────┤
│  │  • name         │    │  • title        │    │  • image_url    │                 │
│  │  • type         │    │  • description  │    │  • caption      │                 │
│  │  • level        │    │  • event_type   │    │  • created_at   │                 │
│  │  • duration     │    │  • start_date   │    └─────────────────┘                 │
│  │  • duration_type│    │  • end_date     │                                        │
│  │  • description  │    │  • location     │    (All link to institution_profiles)  │
│  │  • eligibility  │    │  • image_url    │                                        │
│  │  • outcomes     │    │  • registration │                                        │
│  │  • assessment   │    │  • created_at   │                                        │
│  │  • certification│    │  • updated_at   │                                        │
│  │  • schedule     │    └─────────────────┘                                        │
│  │  • created_at   │                                                               │
│  │  • updated_at   │                                                               │
│  └─────────────────┘                                                               │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Key Relationships

### 1. **Authentication & Profile Flow**
- `auth.users` (Supabase) ← → `profiles` (1:1)
- `profiles` → `student_profiles` | `mentor_profiles` | `institution_profiles` (1:1 based on role)

### 2. **Social Network Structure**
- `profiles` → `connection_requests` (many:many for pending connections)
- `profiles` → `connections` (many:many for accepted connections)
- `profiles` → `feed_posts` → `post_comments` + `post_likes`

### 3. **Skills & Learning System**
- `skill_categories` → `skills` → `user_skills` ← `profiles`
- `interest_categories` → `interests` → `user_interests` ← `profiles`
- `skills` ← `skill_endorsements` → `profiles` (endorser/endorsed relationship)

### 4. **Education & Institution System**
- `institution_categories` → `institution_types` 
- `institution_profiles` → `institution_programs` + `institution_events` + `institution_gallery`
- `student_profiles` → `student_education_history` ← `institution_types`

### 5. **Mentorship System**
- `mentor_profiles` → `mentor_expertise` + `mentor_experience` + `mentor_availability`
- `mentor_profiles` ← `mentorships` → `student_profiles`

### 6. **Goals & Achievement System**
- `profiles` → `career_goals` + `goals` + `custom_badges` + `mood_board`
- `hobbies` → `user_hobbies` ← `profiles`
- `languages` → `user_languages` ← `profiles`

## Data Types & Enums

### Custom Enums:
- **user_role**: `student | mentor | institution`
- **age_group**: `early-childhood | elementary | middle-school | high-school | young-adult`
- **education_level**: `pre_school | school | high_school | undergraduate | graduate | post_graduate | phd`
- **experience_type**: `work | education | volunteer | certification`

### Key Constraints:
- **Proficiency Levels**: 1-5 scale for skills
- **Language Proficiency**: `beginner | intermediate | advanced | native`
- **Connection Status**: `pending | accepted | declined | cancelled`
- **Goal Status**: `active | completed | paused | cancelled`
- **Priority Levels**: 1-5 scale for goals

## Security Features
- Row Level Security (RLS) enabled on all tables
- Foreign key constraints ensure data integrity
- Check constraints for valid enum values
- Unique constraints prevent duplicate relationships
- Cascading deletes maintain referential integrity

## Scalability Considerations
- UUID primary keys for distributed systems
- Indexed foreign keys for query performance
- JSON fields for flexible data (subjects in education history)
- Timestamp tracking for audit trails
- Efficient many-to-many relationships through junction tables

This schema design supports PathPiper's comprehensive educational platform while maintaining data integrity, security, and performance.
