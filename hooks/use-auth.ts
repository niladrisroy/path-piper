
"use client"

import { useEffect, useState, useRef } from 'react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  bio?: string
  location?: string
  profileImageUrl?: string
  [key: string]: any
}

interface CachedProfileData {
  profile: any
  interests: any[]
  skills: any[]
  educationHistory: any[]
  achievements: any[]
  goals: any[]
}

// Global cache to prevent duplicate API calls across component instances
let globalUserCache: { user: User | null; timestamp: number } | null = null
let globalProfileDataCache: { profileData: CachedProfileData | null; timestamp: number } | null = null
let globalUserPromise: Promise<User | null> | null = null
let globalProfileDataPromise: Promise<CachedProfileData | null> | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<CachedProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileDataLoading, setProfileDataLoading] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Prevent duplicate calls in StrictMode
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchUser = async () => {
      try {
        // Check if we have valid cached data
        if (globalUserCache && (Date.now() - globalUserCache.timestamp) < CACHE_DURATION) {
          setUser(globalUserCache.user)
          setLoading(false)
          return
        }

        // If there's already a request in progress, wait for it
        if (globalUserPromise) {
          const cachedUser = await globalUserPromise
          setUser(cachedUser)
          setLoading(false)
          return
        }

        // Make the API call
        globalUserPromise = fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-store'
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            const userData = data.user
            
            // Cache the result
            globalUserCache = {
              user: userData,
              timestamp: Date.now()
            }
            
            return userData
          }
          return null
        }).catch((error) => {
          console.error('Error fetching user:', error)
          return null
        }).finally(() => {
          globalUserPromise = null
        })

        const userData = await globalUserPromise
        setUser(userData)
        
        // If user is a student, fetch and cache their complete profile data
        if (userData && userData.role === 'student') {
          fetchProfileData(userData.id)
        }
      } catch (error) {
        console.error('Error in useAuth:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchProfileData = async (userId: string) => {
      try {
        // Check if we have valid cached profile data
        if (globalProfileDataCache && (Date.now() - globalProfileDataCache.timestamp) < CACHE_DURATION) {
          setProfileData(globalProfileDataCache.profileData)
          return
        }

        // If there's already a request in progress, wait for it
        if (globalProfileDataPromise) {
          const cachedData = await globalProfileDataPromise
          setProfileData(cachedData)
          return
        }

        setProfileDataLoading(true)
        console.log('🔄 Fetching and caching complete profile data...')

        // Make the API call for complete profile data
        globalProfileDataPromise = fetch(`/api/student/profile/${userId}`, {
          credentials: 'include',
          cache: 'no-store'
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            
            const profileData: CachedProfileData = {
              profile: {
                ...data.profile,
                ageGroup: data.ageGroup || 'young_adult',
                educationLevel: data.educationLevel || 'undergraduate'
              },
              interests: data.profile?.userInterests || [],
              skills: data.profile?.userSkills || [],
              educationHistory: data.educationHistory || [],
              achievements: data.profile?.customBadges || [],
              goals: data.profile?.careerGoals || []
            }

            // Cache the result
            globalProfileDataCache = {
              profileData,
              timestamp: Date.now()
            }

            console.log('✅ Profile data cached successfully:', {
              interests: profileData.interests.length,
              skills: profileData.skills.length,
              education: profileData.educationHistory.length,
              goals: profileData.goals.length,
              achievements: profileData.achievements.length
            })
            
            return profileData
          }
          return null
        }).catch((error) => {
          console.error('Error fetching profile data:', error)
          return null
        }).finally(() => {
          globalProfileDataPromise = null
          setProfileDataLoading(false)
        })

        const data = await globalProfileDataPromise
        setProfileData(data)
      } catch (error) {
        console.error('Error in fetchProfileData:', error)
        setProfileDataLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, profileData, profileDataLoading }
}

// Function to invalidate cache (useful after login/logout)
export function invalidateUserCache() {
  globalUserCache = null
  globalUserPromise = null
  globalProfileDataCache = null
  globalProfileDataPromise = null
}

// Function to get cached profile data without triggering a fetch
export function getCachedProfileData(): CachedProfileData | null {
  if (globalProfileDataCache && (Date.now() - globalProfileDataCache.timestamp) < CACHE_DURATION) {
    return globalProfileDataCache.profileData
  }
  return null
}
