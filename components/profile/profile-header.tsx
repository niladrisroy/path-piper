"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import CircleManagementDialog from "./circle-management-dialog"
import { 
  MapPin, 
  Calendar, 
  Users, 
  Settings, 
  Plus,
  Camera,
  Edit,
  MessageSquare,
  UserPlus,
  Bell,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal,
  Star,
  Award,
  Target,
  BookOpen,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Building
} from "lucide-react"

interface Circle {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  creator: {
    firstName: string
    lastName: string
    profileImageUrl?: string
  }
  memberships: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
      profileImageUrl?: string
      role: string
    }
  }>
  _count: {
    memberships: number
  }
}

interface ProfileHeaderProps {
  profileData: any
  isOwnProfile?: boolean
}

export default function ProfileHeader({ profileData, isOwnProfile = false }: ProfileHeaderProps) {
  const { user } = useAuth()
  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateCircle, setShowCreateCircle] = useState(false)
  const [showCircleManagement, setShowCircleManagement] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [createCircleForm, setCreateCircleForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    iconImage: null as File | null
  })

  // Fetch circles when component mounts
  useEffect(() => {
    fetchCircles()
  }, [])

  const fetchCircles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/circles', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCircles(data)
      } else {
        console.error('Failed to fetch circles')
      }
    } catch (error) {
      console.error('Error fetching circles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCircle = async () => {
    if (!createCircleForm.name.trim()) {
      toast({
        title: "Error",
        description: "Circle name is required",
        variant: "destructive",
      })
      return
    }

    if (createCircleForm.name.trim().length > 50) {
      toast({
        title: "Error", 
        description: "Circle name must be 50 characters or less",
        variant: "destructive",
      })
      return
    }

    try {
      let iconImageUrl = null

      // If there's an uploaded image, we'd typically upload it to a storage service
      // For now, we'll just use the file name as a placeholder
      if (createCircleForm.iconImage) {
        iconImageUrl = createCircleForm.iconImage.name
      }

      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: createCircleForm.name.trim(),
          description: createCircleForm.description.trim() || null,
          color: createCircleForm.color,
          icon: 'users',
          iconImage: iconImageUrl
        }),
      })

      if (response.ok) {
        const newCircle = await response.json()
        setCircles(prev => [...prev, newCircle])
        setShowCreateCircle(false)
        setCreateCircleForm({
          name: '',
          description: '',
          color: '#3B82F6',
          iconImage: null
        })
        toast({
          title: "Success",
          description: "Circle created successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create circle",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating circle:', error)
      toast({
        title: "Error",
        description: "Failed to create circle",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error", 
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setCreateCircleForm(prev => ({
        ...prev,
        iconImage: file
      }))
    }
  }

  const handleCircleClick = (circle: Circle) => {
    setSelectedCircle(circle)
    setShowCircleManagement(true)
  }

  const handleCircleUpdated = async () => {
    // Refresh circles after invitations are sent
    await fetchCircles()
  }

  const handleAddCircle = () => {
    setShowCreateCircle(true)
  }

  // Circle Invitations Section Component
  interface CircleInvitationsSectionProps {
    onInvitationHandled: () => void
  }

  function CircleInvitationsSection({ onInvitationHandled }: CircleInvitationsSectionProps) {
    const [invitations, setInvitations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetchInvitations()
    }, [])

    const fetchInvitations = async () => {
      try {
        const response = await fetch('/api/circles/invitations?type=received', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setInvitations(data)
        }
      } catch (error) {
        console.error('Error fetching invitations:', error)
      } finally {
        setLoading(false)
      }
    }

    const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
      try {
        const response = await fetch(`/api/circles/invitations/${invitationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ action }),
        })

        if (response.ok) {
          toast({
            title: "Success",
            description: `Invitation ${action}ed successfully`,
          })
          fetchInvitations()
          onInvitationHandled()
        } else {
          toast({
            title: "Error",
            description: `Failed to ${action} invitation`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error(`Error ${action}ing invitation:`, error)
        toast({
          title: "Error",
          description: `Failed to ${action} invitation`,
          variant: "destructive",
        })
      }
    }

    if (loading) {
      return <div className="text-center py-4">Loading invitations...</div>
    }

    if (invitations.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No pending circle invitations
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {invitations.map((invitation: any) => (
          <Card key={invitation.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold`}
                  style={{ backgroundColor: invitation.circle.color }}
                >
                  {invitation.circle.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold">{invitation.circle.name}</h4>
                  <p className="text-sm text-gray-500">
                    Invited by {invitation.inviter.firstName} {invitation.inviter.lastName}
                  </p>
                  {invitation.message && (
                    <p className="text-sm text-gray-600 italic mt-1">"{invitation.message}"</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleInvitation(invitation.id, 'accept')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvitation(invitation.id, 'decline')}
                >
                  Decline
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        {/* Customizable banner */}
        <div className={`h-48 w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue`}></div>

        {/* Profile info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-4">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={profileData?.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-white mb-2">
                <h1 className="text-3xl font-bold">
                  {profileData?.firstName} {profileData?.lastName}
                </h1>
                {profileData?.tagline && (
                  <p className="text-lg opacity-90">{profileData.tagline}</p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm opacity-75">
                  {profileData?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profileData?.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 mb-2">
              {isOwnProfile ? (
                <>
                  <Button size="sm" variant="secondary">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" className="bg-pathpiper-teal hover:bg-pathpiper-teal/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button size="sm" variant="secondary">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="secondary">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats and info section */}
      <div className="bg-white dark:bg-gray-900 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-pathpiper-teal">{circles.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Circles</div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pathpiper-blue">127</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Connections</div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">89</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Circles section */}
      <div className="bg-white dark:bg-gray-900 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Circles</h2>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCircle}
                className="text-pathpiper-teal border-pathpiper-teal hover:bg-pathpiper-teal hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Circle
              </Button>
            )}
          </div>

          <Tabs defaultValue="circles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="circles">My Circles</TabsTrigger>
              <TabsTrigger value="invitations">
                Invitations
                {/* You could add a badge here for pending invitations count */}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="circles" className="mt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading circles...</p>
                </div>
              ) : circles.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No circles yet</h3>
                  <p className="mb-4">Create your first circle to connect with others</p>
                  {isOwnProfile && (
                    <Button
                      onClick={handleAddCircle}
                      className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Circle
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {circles.map((circle) => (
                    <Card 
                      key={circle.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleCircleClick(circle)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: circle.color }}
                          >
                            {circle.icon.startsWith('http') ? (
                              <img 
                                src={circle.icon} 
                                alt={circle.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              circle.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {circle.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {circle._count.memberships} members
                            </p>
                          </div>
                        </div>
                        {circle.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {circle.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="mt-6">
              <CircleInvitationsSection onInvitationHandled={handleCircleUpdated} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Circle Dialog */}
      <Dialog open={showCreateCircle} onOpenChange={setShowCreateCircle}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Circle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="circle-name">Circle Name</Label>
              <Input
                id="circle-name"
                value={createCircleForm.name}
                onChange={(e) => setCreateCircleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter circle name (max 50 characters)"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                {createCircleForm.name.length}/50 characters
              </p>
            </div>

            <div>
              <Label htmlFor="circle-description">Description (optional)</Label>
              <Textarea
                id="circle-description"
                value={createCircleForm.description}
                onChange={(e) => setCreateCircleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your circle..."
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {createCircleForm.description.length}/500 characters
              </p>
            </div>

            <div>
              <Label htmlFor="circle-icon">Icon Image (optional)</Label>
              <Input
                id="circle-icon"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {createCircleForm.iconImage && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {createCircleForm.iconImage.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="circle-color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="circle-color"
                  type="color"
                  value={createCircleForm.color}
                  onChange={(e) => setCreateCircleForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={createCircleForm.color}
                  onChange={(e) => setCreateCircleForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateCircle(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCircle}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                Create Circle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Circle Management Dialog */}
      {selectedCircle && (
        <CircleManagementDialog
          circle={selectedCircle}
          open={showCircleManagement}
          onOpenChange={setShowCircleManagement}
          onCircleUpdated={handleCircleUpdated}
        />
      )}
    </div>
  )
}