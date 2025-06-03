
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

// Global cache to prevent duplicate API calls across component instances
let globalUserCache: { user: User | null; timestamp: number } | null = null
let globalUserPromise: Promise<User | null> | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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
      } catch (error) {
        console.error('Error in useAuth:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}

// Function to invalidate cache (useful after login/logout)
export function invalidateUserCache() {
  globalUserCache = null
  globalUserPromise = null
}
