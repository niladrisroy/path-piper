
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, User, Calendar } from "lucide-react"

interface ConnectionRequest {
  id: string
  senderId: string
  receiverId: string
  status: string
  message?: string
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
    bio?: string
    location?: string
  }
}

export default function InstitutionNotificationsPage() {
  const { user, loading } = useAuth()
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'institution') {
      router.push('/feed')
      return
    }

    fetchConnectionRequests()
  }, [user, loading, router])

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch('/api/institution/connections/requests')
      if (response.ok) {
        const requests = await response.json()
        setConnectionRequests(requests.filter((req: ConnectionRequest) => req.status === 'pending'))
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleConnectionRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingRequest(requestId)
      const response = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'declined' }),
      })

      if (response.ok) {
        // Remove the request from the list
        setConnectionRequests(prev => prev.filter(req => req.id !== requestId))
      }
    } catch (error) {
      console.error('Error handling connection request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  if (loading || loadingRequests) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Bell className="h-8 w-8 mr-3 text-pathpiper-teal" />
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage connection requests from students
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Connection Requests
                  <Badge variant="secondary">
                    {connectionRequests.length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectionRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No pending requests
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You'll see connection requests from students here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connectionRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={request.sender.profileImageUrl || ''} 
                              alt={`${request.sender.firstName} ${request.sender.lastName}`} 
                            />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {request.sender.firstName} {request.sender.lastName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {request.sender.role}
                              {request.sender.location && ` • ${request.sender.location}`}
                            </p>
                            {request.sender.bio && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {request.sender.bio}
                              </p>
                            )}
                            {request.message && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                                "{request.message}"
                              </p>
                            )}
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleConnectionRequest(request.id, 'accept')}
                            disabled={processingRequest === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectionRequest(request.id, 'decline')}
                            disabled={processingRequest === request.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
