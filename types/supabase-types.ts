export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      feed_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          timeframe?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          timeframe?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_events: {
        Row: {
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
        Insert: {
          id?: string
          institution_id: string
          title: string
          description: string
          event_type: string
          start_date: string
          end_date?: string | null
          location?: string | null
          image_url?: string | null
          registration_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          title?: string
          description?: string
          event_type?: string
          start_date?: string
          end_date?: string | null
          location?: string | null
          image_url?: string | null
          registration_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_events_institution_id_fkey"
            columns: ["institution_id"]
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_gallery: {
        Row: {
          id: string
          institution_id: string
          image_url: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          image_url: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          image_url?: string
          caption?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_gallery_institution_id_fkey"
            columns: ["institution_id"]
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_profiles: {
        Row: {
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
        Insert: {
          id: string
          institution_name: string
          institution_type: string
          category: string
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_name?: string
          institution_type?: string
          category?: string
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_programs: {
        Row: {
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
        Insert: {
          id?: string
          institution_id: string
          name: string
          type: string
          level: string
          duration: string
          duration_type: string
          description: string
          eligibility?: string | null
          outcomes?: string | null
          assessment?: string | null
          certification?: string | null
          schedule?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          type?: string
          level?: string
          duration?: string
          duration_type?: string
          description?: string
          eligibility?: string | null
          outcomes?: string | null
          assessment?: string | null
          certification?: string | null
          schedule?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_programs_institution_id_fkey"
            columns: ["institution_id"]
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          id: string
          mentor_id: string
          time_slot: string
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          time_slot: string
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          time_slot?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_experience: {
        Row: {
          id: string
          mentor_id: string
          title: string
          organization: string
          start_date: string
          end_date: string | null
          current: boolean
          description: string | null
          type: string
          credential_id: string | null
          credential_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          title: string
          organization: string
          start_date: string
          end_date?: string | null
          current?: boolean
          description?: string | null
          type: string
          credential_id?: string | null
          credential_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          title?: string
          organization?: string
          start_date?: string
          end_date?: string | null
          current?: boolean
          description?: string | null
          type?: string
          credential_id?: string | null
          credential_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_experience_mentor_id_fkey"
            columns: ["mentor_id"]
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_expertise: {
        Row: {
          id: string
          mentor_id: string
          subject: string
          description: string | null
          years_experience: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          subject: string
          description?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          subject?: string
          description?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_expertise_mentor_id_fkey"
            columns: ["mentor_id"]
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
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
        Insert: {
          id: string
          profession: string
          organization?: string | null
          years_experience?: number | null
          verified?: boolean
          onboarding_completed?: boolean
          hours_per_week?: number
          max_mentees?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profession?: string
          organization?: string | null
          years_experience?: number | null
          verified?: boolean
          onboarding_completed?: boolean
          hours_per_week?: number
          max_mentees?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          id: string
          mentor_id: string
          student_id: string
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          student_id: string
          status: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          student_id?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          role: string
          first_name: string
          last_name: string
          bio: string | null
          location: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: string
          first_name: string
          last_name: string
          bio?: string | null
          location?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: string
          first_name?: string
          last_name?: string
          bio?: string | null
          location?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          id: string
          age_group: string
          education_level: string
          parent_email: string | null
          parent_verified: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          age_group: string
          education_level: string
          parent_email?: string | null
          parent_verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          age_group?: string
          education_level?: string
          parent_email?: string | null
          parent_verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          proficiency_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          proficiency_level: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          proficiency_level?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_post_comments: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      decrement_post_likes: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      increment_post_comments: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      increment_post_likes: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
