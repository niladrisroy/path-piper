
# PathPiper Database Schema

## Feed Posts
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| user_id | uuid | NULL | - | Foreign key to profiles |
| content | text | NOT NULL | - | Post content |
| image_url | text | NULL | - | URL of attached image |
| likes_count | integer | NULL | 0 | Number of likes |
| comments_count | integer | NULL | 0 | Number of comments |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |
| updated_at | timestamp with time zone | NOT NULL | now() | Last update timestamp |

## Goals
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| user_id | uuid | NULL | - | Foreign key to profiles |
| title | text | NOT NULL | - | Goal title |
| description | text | NULL | - | Goal description |
| category | text | NULL | - | Goal category |
| timeframe | text | NULL | - | Goal timeframe |
| completed | boolean | NULL | false | Completion status |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |
| updated_at | timestamp with time zone | NOT NULL | now() | Last update timestamp |

## Institution Events
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| institution_id | uuid | NULL | - | Foreign key to institution_profiles |
| title | text | NOT NULL | - | Event title |
| description | text | NOT NULL | - | Event description |
| event_type | text | NOT NULL | - | Type of event |
| start_date | timestamp with time zone | NOT NULL | - | Event start date/time |
| end_date | timestamp with time zone | NULL | - | Event end date/time |
| location | text | NULL | - | Event location |
| image_url | text | NULL | - | Event image URL |
| registration_url | text | NULL | - | Registration link |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |
| updated_at | timestamp with time zone | NOT NULL | now() | Last update timestamp |

## Institution Gallery
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| institution_id | uuid | NULL | - | Foreign key to institution_profiles |
| image_url | text | NOT NULL | - | Image URL |
| caption | text | NULL | - | Image caption |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |

## Institution Profiles
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | - | Primary key, Foreign key to profiles |
| institution_name | text | NOT NULL | - | Institution name |
| institution_type | text | NOT NULL | - | Type of institution |
| category | text | NOT NULL | - | Institution category |
| website | text | NULL | - | Institution website |
| logo_url | text | NULL | - | Logo image URL |
| cover_image_url | text | NULL | - | Cover image URL |
| verified | boolean | NULL | false | Verification status |
| onboarding_completed | boolean | NULL | false | Onboarding status |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |
| updated_at | timestamp with time zone | NOT NULL | now() | Last update timestamp |

## Institution Programs
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| institution_id | uuid | NULL | - | Foreign key to institution_profiles |
| name | text | NOT NULL | - | Program name |
| type | text | NOT NULL | - | Program type |
| level | text | NOT NULL | - | Program level |
| duration | text | NOT NULL | - | Program duration |
| duration_type | text | NOT NULL | - | Duration unit |
| description | text | NOT NULL | - | Program description |
| eligibility | text | NULL | - | Eligibility criteria |
| outcomes | text | NULL | - | Learning outcomes |
| assessment | text | NULL | - | Assessment methods |
| certification | text | NULL | - | Certification details |
| schedule | text | NULL | - | Program schedule |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |
| updated_at | timestamp with time zone | NOT NULL | now() | Last update timestamp |

## Interests
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| name | text | NOT NULL | - | Interest name |
| category | text | NULL | - | Interest category |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |

## Mentor Availability
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| mentor_id | uuid | NULL | - | Foreign key to mentor_profiles |
| time_slot | text | NOT NULL | - | Available time slot |
| created_at | timestamp with time zone | NOT NULL | now() | Creation timestamp |

## Mentor Experience
| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| mentor_id | uuid | NULL | - | Foreign key to mentor_profiles |
| title | text | NOT NULL | - | Experience title |
| organization | text | NOT NULL | - | Organization name |
| start_date | date | NOT NULL | - | Start date |
| end_date | date | NULL | - | End date |
| current | boolean | NULL | false | Current position flag |
| description | text | NULL | - | Experience description |
