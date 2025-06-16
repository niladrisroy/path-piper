"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  GraduationCap, 
  Building, 
  MessageCircle, 
  Calendar,
  Star,
  ChevronRight,
  UserPlus,
  Filter,
  Inbox,
  UserMinus,
  Trash2
} from "lucide-react"
import AddConnectionDialog from "./add-connection-dialog"
import ConnectionRequestsView from "./connection-requests-view"

interface Connection {
  id: string
  connectionType: string
  connectedAt: string
  user: {
    id: string
    name: string
    firstName: string
    lastName: string
    avatar?: string
    role: string
    bio?: string
    location?: string
    status: 'online' | 'offline' | 'away'
    lastInteraction: string
  }
}

interface CircleViewProps {
  student: any
}

export default function CircleView({ student }: CircleViewProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'connections' | 'requests'>('connections')

  // Use real student data
  const studentName = student?.profile ? `${student.profile.firstName} ${student.profile.lastName}` : "Student"
  const tagline = student?.profile?.tagline
  const bio = student?.profile?.bio
  const currentEducation = student?.educationHistory?.find((edu: any) => edu.is_current || edu.isCurrent)

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/connections/requests?type=received')
      if (response.ok) {
        const data = await response.json()
        const pending = data.filter((req: any) => req.status === 'pending').length
        setPendingRequests(pending)
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error)
    }
  }

  const handleConnectionRequestSent = () => {
    // Refresh data when a new connection request is sent
    fetchConnections()
    fetchPendingRequests()
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([
        fetchConnections(),
        fetchPendingRequests()
      ])
      setLoading(false)
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  // Calculate stats from real data
  const totalConnections = connections.length
  const mentorConnections = connections.filter(c => c.user.role === 'mentor').length
  const institutionConnections = connections.filter(c => c.user.role === 'institution').length

  const removeConnection = async (connectionId: string) => {
    try {
      // Optimistically update the UI
      setConnections(prevConnections =>
        prevConnections.filter(connection => connection.id !== connectionId)
      );

      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to remove connection');
        // Revert the UI update if the API call fails
        fetchConnections();
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      // Revert the UI update if there's an error
      fetchConnections();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Circle</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect with mentors, peers, and institutions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalConnections}</div>
            <div className="text-sm text-gray-600">Total Connections</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mentorConnections}</div>
            <div className="text-sm text-gray-600">Mentors</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{institutionConnections}</div>
            <div className="text-sm text-gray-600">Institutions</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveView('connections')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeView === 'connections'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My Connections
        </button>
        <button
          onClick={() => setActiveView('requests')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center space-x-2 ${
            activeView === 'requests'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Inbox className="h-4 w-4" />
          <span>Requests</span>
          {pendingRequests > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingRequests}
            </Badge>
          )}
        </button>
      </div>

      {/* Content based on active view */}
      {activeView === 'connections' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>My Connections</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <AddConnectionDialog onConnectionRequestSent={handleConnectionRequestSent} />
              </div>
            </div>
          </CardHeader>
        <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({totalConnections})</TabsTrigger>
                <TabsTrigger value="mentors">Mentors ({mentorConnections})</TabsTrigger>
                <TabsTrigger value="peers">Peers ({connections.filter(c => c.user.role === 'student').length})</TabsTrigger>
                <TabsTrigger value="institutions">Institutions ({institutionConnections})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-3">
                  {connections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No connections yet</p>
                      <p className="text-sm">Start by adding some connections!</p>
                    </div>
                  ) : (
                    connections.map((connection) => (
                      <Card key={connection.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={connection.user.avatar} alt={connection.user.name} />
                                  <AvatarFallback>
                                    {connection.user.firstName[0]}{connection.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`} />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{connection.user.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {connection.user.role}
                                  </Badge>
                                </div>
                                {connection.user.bio && (
                                  <p className="text-sm text-gray-600">{connection.user.bio}</p>
                                )}
                                {connection.user.location && (
                                  <p className="text-xs text-gray-500">{connection.user.location}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeConnection(connection.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>

                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                          <span>Last interaction: {connection.user.lastInteraction}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

            <TabsContent value="mentors" className="mt-4">
              <div className="space-y-3">
                {connections
                  .filter(c => c.user.role === 'mentor')
                  .map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.user.avatar} alt={connection.user.name} />
                                <AvatarFallback>
                                  {connection.user.firstName[0]}{connection.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{connection.user.name}</h3>
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                              {connection.user.bio && (
                                <p className="text-sm text-gray-600">{connection.user.bio}</p>
                              )}
                              {connection.user.location && (
                                <p className="text-xs text-gray-500">{connection.user.location}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeConnection(connection.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>

                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.user.lastInteraction}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="peers" className="mt-4">
              <div className="space-y-3">
                {connections
                  .filter(c => c.user.role === 'student')
                  .map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.user.avatar} alt={connection.user.name} />
                                <AvatarFallback>
                                  {connection.user.firstName[0]}{connection.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{connection.user.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  peer
                                </Badge>
                              </div>
                              {connection.user.bio && (
                                <p className="text-sm text-gray-600">{connection.user.bio}</p>
                              )}
                              {connection.user.location && (
                                <p className="text-xs text-gray-500">{connection.user.location}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeConnection(connection.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>

                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.user.lastInteraction}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="institutions" className="mt-4">
              <div className="space-y-3">
                {connections
                  .filter(c => c.user.role === 'institution')
                  .map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.user.avatar} alt={connection.user.name} />
                                <AvatarFallback>
                                  {connection.user.firstName[0]}{connection.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{connection.user.name}</h3>
                                <Building className="h-4 w-4 text-purple-600" />
                              </div>
                              {connection.user.bio && (
                                <p className="text-sm text-gray-600">{connection.user.bio}</p>
                              )}
                              {connection.user.location && (
                                <p className="text-xs text-gray-500">{connection.user.location}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeConnection(connection.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>

                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.user.lastInteraction}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      ) : (
        <ConnectionRequestsView />
      )}
    </div>
  )
}