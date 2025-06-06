"use client"

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
  Filter
} from "lucide-react"

interface Connection {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'offline' | 'away'
  lastInteraction: string
  connectionType: 'mentor' | 'peer' | 'institution'
  mutualConnections?: number
}

interface CircleViewProps {
  student: any
}

export default function CircleView({ student }: CircleViewProps) {
  // Mock data for connections
  const connections: Connection[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder-user.jpg",
      role: "Computer Science Professor",
      status: "online",
      lastInteraction: "2 hours ago",
      connectionType: "mentor",
      mutualConnections: 5
    },
    {
      id: "2", 
      name: "MIT",
      avatar: "/placeholder-logo.png",
      role: "Educational Institution",
      status: "offline",
      lastInteraction: "1 day ago",
      connectionType: "institution"
    },
    {
      id: "3",
      name: "Alex Chen",
      avatar: "/placeholder-user.jpg", 
      role: "Computer Science Student",
      status: "away",
      lastInteraction: "30 minutes ago",
      connectionType: "peer",
      mutualConnections: 3
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
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
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-600">Total Connections</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-gray-600">Mentors</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-gray-600">Institutions</div>
          </CardContent>
        </Card>
      </div>

      {/* Connections Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Connections</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mentors">Mentors</TabsTrigger>
              <TabsTrigger value="peers">Peers</TabsTrigger>
              <TabsTrigger value="institutions">Institutions</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {connections.map((connection) => (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={connection.avatar} alt={connection.name} />
                              <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.status)}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{connection.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {connection.connectionType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{connection.role}</p>
                            {connection.mutualConnections && (
                              <p className="text-xs text-gray-500">
                                {connection.mutualConnections} mutual connections
                              </p>
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
                        </div>
                      </div>
                    </CardContent>

                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                      <span>Last interaction: {connection.lastInteraction}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mentors" className="mt-4">
              <div className="space-y-3">
                {connections
                  .filter(c => c.connectionType === 'mentor')
                  .map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.avatar} alt={connection.name} />
                                <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.status)}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{connection.name}</h3>
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                              <p className="text-sm text-gray-600">{connection.role}</p>
                              {connection.mutualConnections && (
                                <p className="text-xs text-gray-500">
                                  {connection.mutualConnections} mutual connections
                                </p>
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
                          </div>
                        </div>
                      </CardContent>

                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.lastInteraction}</span>
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
                  .filter(c => c.connectionType === 'peer')
                  .map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.avatar} alt={connection.name} />
                                <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.status)}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{connection.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  peer
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{connection.role}</p>
                              {connection.mutualConnections && (
                                <p className="text-xs text-gray-500">
                                  {connection.mutualConnections} mutual connections
                                </p>
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
                          </div>
                        </div>
                      </CardContent>

                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.lastInteraction}</span>
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
                  .filter(c => c.connectionType === 'institution')
                  .map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.avatar} alt={connection.name} />
                                <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(connection.status)}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{connection.name}</h3>
                                <Building className="h-4 w-4 text-purple-600" />
                              </div>
                              <p className="text-sm text-gray-600">{connection.role}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>

                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.lastInteraction}</span>
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
    </div>
  )
}