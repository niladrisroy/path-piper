
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ExternalLink, MapPin, Calendar, Verified, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FollowingInstitution {
  id: string
  institutionName: string
  institutionType: string
  institutionCategory: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  verified: boolean
  bio?: string
  location?: string
  followedAt: string
}

interface FollowingInstitutionsProps {
  userId: string
}

export default function FollowingInstitutions({ userId }: FollowingInstitutionsProps) {
  const [institutions, setInstitutions] = useState<FollowingInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFollowingInstitutions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/student/following', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch following institutions')
        }

        const data = await response.json()
        
        if (data.success) {
          setInstitutions(data.following)
        } else {
          setError(data.error || 'Failed to load institutions')
        }
      } catch (err) {
        console.error('Error fetching following institutions:', err)
        setError('Failed to load institutions')
      } finally {
        setLoading(false)
      }
    }

    fetchFollowingInstitutions()
  }, [userId])

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Following</h2>
          <Badge variant="secondary" className="animate-pulse px-3 py-1.5 text-sm font-medium">Loading...</Badge>
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex-shrink-0 w-80 animate-pulse bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Following</h2>
          <Badge variant="destructive" className="px-3 py-1.5 text-sm font-medium">Error</Badge>
        </div>
        <div className="text-center py-16">
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 h-10"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (institutions.length === 0) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Following</h2>
          <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">0 institutions</Badge>
        </div>
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No institutions followed yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start following institutions to stay updated with their latest news and opportunities.
          </p>
          <Button variant="outline" className="px-6 py-2 h-10">
            Explore Institutions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Following</h2>
        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
          {institutions.length} institution{institutions.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {institutions.map((institution) => (
          <Card 
            key={institution.id} 
            className="flex-shrink-0 w-80 hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            {/* Cover Image */}
            {institution.coverImageUrl && (
              <div className="h-32 bg-gradient-to-r from-pathpiper-teal to-blue-500 rounded-t-lg overflow-hidden">
                <img 
                  src={institution.coverImageUrl} 
                  alt={`${institution.institutionName} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Logo */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage 
                    src={institution.logoUrl || '/placeholder-logo.png'} 
                    alt={institution.institutionName}
                  />
                  <AvatarFallback>
                    {institution.institutionName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Institution Name and Verification */}
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {institution.institutionName}
                    </h3>
                    {institution.verified && (
                      <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Institution Type */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {institution.institutionType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {institution.institutionCategory}
                    </Badge>
                  </div>

                  {/* Bio */}
                  {institution.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {institution.bio}
                    </p>
                  )}

                  {/* Location */}
                  {institution.location && (
                    <div className="flex items-center space-x-1 mb-3">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {institution.location}
                      </span>
                    </div>
                  )}

                  {/* Following Date */}
                  <div className="flex items-center space-x-1 mb-4">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Following since {(() => {
                        try {
                          const date = new Date(institution.followedAt);
                          if (isNaN(date.getTime())) {
                            return 'recently';
                          }
                          return formatDistanceToNow(date, { addSuffix: true });
                        } catch (error) {
                          return 'recently';
                        }
                      })()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 h-9 text-sm font-medium">
                      View Profile
                    </Button>
                    {institution.website && (
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0" asChild>
                        <a 
                          href={institution.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
