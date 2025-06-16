
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Users, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface SuggestedUser {
  id: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl?: string
  bio?: string
  location?: string
  sharedInterests: string[]
  totalSharedInterests: number
}

interface SuggestedConnectionsProps {
  student: any
}

export default function SuggestedConnections({ student }: SuggestedConnectionsProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSuggestedConnections = async () => {
    if (!student?.interests || student.interests.length === 0) {
      setLoading(false)
      return
    }

    try {
      const interestIds = student.interests.map((interest: any) => interest.id)
      const response = await fetch(`/api/users/suggested-connections?interests=${interestIds.join(',')}`)
      
      if (response.ok) {
        const suggestions = await response.json()
        setSuggestedUsers(suggestions.slice(0, 5)) // Show top 5
      }
    } catch (error) {
      console.error('Error fetching suggested connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return

    setSendingRequest(receiverId)
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: `Hi! I noticed we share similar interests and would love to connect with you on PathPiper.`
        }),
      })

      if (response.ok) {
        // Remove the user from suggestions since request is sent
        setSuggestedUsers(prev => prev.filter(u => u.id !== receiverId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send connection request')
      }
    } catch (error) {
      console.error('Error sending connection request:', error)
      alert('Failed to send connection request')
    } finally {
      setSendingRequest(null)
    }
  }

  useEffect(() => {
    fetchSuggestedConnections()
  }, [student?.interests])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'institution': return 'bg-purple-100 text-purple-800'
      case 'student': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!student?.interests || student.interests.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-pathpiper-teal" />
            <span>Suggested Connections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm">
              Add interests to your profile to discover people with similar passions!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-pathpiper-teal" />
          <span>Suggested Connections</span>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          People who share your interests
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-pathpiper-teal" />
            <span className="ml-2 text-sm text-gray-500">Finding connections...</span>
          </div>
        ) : suggestedUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm">
              No suggestions found at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedUsers.map((suggestedUser) => (
              <div key={suggestedUser.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => window.open(`/student/profile/view/${suggestedUser.id}`, '_blank')}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={suggestedUser.profileImageUrl} alt={`${suggestedUser.firstName} ${suggestedUser.lastName}`} />
                  <AvatarFallback>
                    {suggestedUser.firstName[0]}{suggestedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">
                      {suggestedUser.firstName} {suggestedUser.lastName}
                    </h4>
                    <Badge variant="outline" className={`text-xs ${getRoleColor(suggestedUser.role)}`}>
                      {suggestedUser.role}
                    </Badge>
                  </div>
                  
                  {suggestedUser.bio && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">{suggestedUser.bio}</p>
                  )}
                  
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs text-pathpiper-teal font-medium">
                      {suggestedUser.totalSharedInterests} shared interest{suggestedUser.totalSharedInterests !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {suggestedUser.sharedInterests.slice(0, 2).map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-pathpiper-teal/10 text-pathpiper-teal border border-pathpiper-teal/20"
                      >
                        {interest}
                      </span>
                    ))}
                    {suggestedUser.sharedInterests.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{suggestedUser.sharedInterests.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent card click when clicking connect button
                    sendConnectionRequest(suggestedUser.id)
                  }}
                  disabled={sendingRequest === suggestedUser.id}
                  className="shrink-0 bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                >
                  {sendingRequest === suggestedUser.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
