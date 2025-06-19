
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Plus, Users, MessageSquare, Share2, Calendar, MapPin, Briefcase, GraduationCap, Mail, Phone, Globe, Instagram, Twitter, Linkedin, Github, Youtube, Facebook, UserPlus, BadgeCheck, Edit, MessageCircle, UserIcon, FolderKanban, Award, BrainIcon, UserCheck, UserX, Upload, Camera } from "lucide-react"
import CircleManagementDialog from "./circle-management-dialog"

interface ProfileData {
  id: string
  firstName: string
  lastName: string
  bio?: string
  location?: string
  profileImageUrl?: string
  tagline?: string
  email?: string
  phone?: string
  coverImageUrl?: string
  role: string
  verificationStatus: boolean
  userInterests?: Array<{
    interest: {
      id: number
      name: string
      category: {
        name: string
      }
    }
  }>
  userSkills?: Array<{
    skill: {
      id: number
      name: string
    }
    proficiencyLevel: number
  }>
  socialLinks?: Array<{
    platform: string
    url: string
    displayName?: string
  }>
  careerGoals?: Array<{
    title: string
    description?: string
    priority: number
    status: string
  }>
  customBadges?: Array<{
    title: string
    description?: string
    color: string
    earnedDate: string
  }>
  student?: {
    educationHistory?: Array<{
      institutionName: string
      degreeProgram?: string
      fieldOfStudy?: string
      gradeLevel?: string
      startDate?: string
      endDate?: string
      isCurrent: boolean
      institutionType?: {
        name: string
        category: {
          name: string
        }
      }
    }>
  }
}

interface Circle {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isDefault?: boolean
  creator?: {
    firstName: string
    lastName: string
    profileImageUrl?: string
  }
  memberships?: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
      profileImageUrl?: string
      role: string
    }
  }>
  _count?: {
    memberships: number
  }
}

interface CircleInvitation {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  circle: {
    id: string
    name: string
    color: string
    icon: string
  }
  inviter: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
  }
  createdAt: string
}

interface ConnectionRequest {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  sender: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
  }
  createdAt: string
}

interface ProfileHeaderProps {
  profileData: ProfileData
  isOwnProfile?: boolean
  connectionStatus?: 'none' | 'pending' | 'connected' | 'sent'
  onConnectionAction?: (action: 'connect' | 'accept' | 'decline', requestId?: string) => void
}

// Create Circle Dialog Component
interface CreateCircleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCircleCreated: () => void
}

function CreateCircleDialog({ open, onOpenChange, onCircleCreated }: CreateCircleDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [icon, setIcon] = useState('users')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ]

  const icons = [
    { value: 'users', label: 'Users' },
    { value: 'heart', label: 'Heart' },
    { value: 'star', label: 'Star' },
    { value: 'book', label: 'Book' },
    { value: 'music', label: 'Music' },
    { value: 'camera', label: 'Camera' },
    { value: 'gamepad', label: 'Games' },
    { value: 'graduation-cap', label: 'Education' }
  ]

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'circle-avatars')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }

    const data = await response.json()
    return data.url
  }

  const handleCreate = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      let avatarUrl = null
      
      // Upload avatar if one is selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile)
      }

      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
          icon: avatarUrl || icon // Use avatar URL if uploaded, otherwise use selected icon
        })
      })

      if (response.ok) {
        setName('')
        setDescription('')
        setColor('#3B82F6')
        setIcon('users')
        setAvatarFile(null)
        setAvatarPreview(null)
        onCircleCreated()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating circle:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Circle Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Circle Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter circle name"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this circle is about (optional)"
              maxLength={200}
              rows={3}
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Circle Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} />
                  ) : (
                    <AvatarFallback style={{ backgroundColor: color }}>
                      <Users className="h-8 w-8 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 cursor-pointer transition-colors"
                >
                  <Camera className="h-3 w-3" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload an image to use as your circle's avatar, or choose an icon below.
                </p>
              </div>
            </div>
          </div>

          {/* Icon Selection (only if no avatar is uploaded) */}
          {!avatarPreview && (
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Icon</label>
              <div className="grid grid-cols-4 gap-2">
                {icons.map((iconOption) => (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setIcon(iconOption.value)}
                    className={`p-3 rounded-lg border transition-colors ${
                      icon === iconOption.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Users className="h-5 w-5 mx-auto" />
                    <span className="text-xs mt-1 block">{iconOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Circle Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === colorOption ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} />
                ) : (
                  <AvatarFallback style={{ backgroundColor: color }}>
                    <Users className="h-4 w-4 text-white" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">{name || 'Circle Name'}</p>
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Circle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Circle Invitations Section Component
interface CircleInvitationsSectionProps {
  onInvitationHandled: () => void
}

function CircleInvitationsSection({ onInvitationHandled }: CircleInvitationsSectionProps) {
  const [invitations, setInvitations] = useState<CircleInvitation[]>([])
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
        setInvitations(data.filter((inv: CircleInvitation) => inv.status === 'pending'))
      }
    } catch (error) {
      console.error('Error fetching circle invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/circles/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
        onInvitationHandled()
      }
    } catch (error) {
      console.error('Error handling invitation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pathpiper-teal"></div>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        No pending circle invitations
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: invitation.circle.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {invitation.inviter.firstName} invited you to "{invitation.circle.name}"
              </p>
              {invitation.message && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  "{invitation.message}"
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleInvitation(invitation.id, 'decline')}
              className="h-7 px-2"
            >
              <UserX className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleInvitation(invitation.id, 'accept')}
              className="h-7 px-2"
            >
              <UserCheck className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfileHeader({ 
  profileData, 
  isOwnProfile = false, 
  connectionStatus = 'none',
  onConnectionAction 
}: ProfileHeaderProps) {
  const router = useRouter()
  const [circles, setCircles] = useState<Circle[]>([])
  const [showCreateCircle, setShowCreateCircle] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [showCircleManagement, setShowCircleManagement] = useState(false)
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [showConnectionRequests, setShowConnectionRequests] = useState(false)

  useEffect(() => {
    if (isOwnProfile) {
      fetchCircles()
      fetchConnectionRequests()
    }
  }, [isOwnProfile])

  const fetchCircles = async () => {
    try {
      const response = await fetch('/api/circles', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCircles(data)
      }
    } catch (error) {
      console.error('Error fetching circles:', error)
    }
  }

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch('/api/connections/requests?type=received', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setConnectionRequests(data.filter((req: ConnectionRequest) => req.status === 'pending'))
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error)
    }
  }

  const handleConnectionAction = (action: 'connect' | 'accept' | 'decline', requestId?: string) => {
    if (onConnectionAction) {
      onConnectionAction(action, requestId)
    }
    
    if (action === 'accept' || action === 'decline') {
      fetchConnectionRequests()
    }
  }

  const openCircleManagement = (circle: Circle) => {
    setSelectedCircle(circle)
    setShowCircleManagement(true)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram
      case 'twitter': return Twitter
      case 'linkedin': return Linkedin
      case 'github': return Github
      case 'youtube': return Youtube
      case 'facebook': return Facebook
      default: return Globe
    }
  }

  const renderConnectionButton = () => {
    if (isOwnProfile) return null
    
    switch (connectionStatus) {
      case 'connected':
        return (
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        )
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled>
            <UserIcon className="h-4 w-4 mr-2" />
            Pending
          </Button>
        )
      case 'sent':
        return (
          <Button variant="outline" size="sm" disabled>
            <UserIcon className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        )
      default:
        return (
          <Button 
            size="sm"
            onClick={() => handleConnectionAction('connect')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        )
    }
  }

  return (
    <div>
      <div className="relative">
        {/* Customizable banner */}
        <div className={`h-48 w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue`}></div>
        
        {/* Profile content */}
        <div className="relative px-4 pb-4">
          {/* Profile picture */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 -mt-16 sm:-mt-12">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-gray-800 mx-auto sm:mx-0">
              <AvatarImage src={profileData.profileImageUrl} />
              <AvatarFallback className="text-xl sm:text-2xl">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 sm:mb-4 sm:ml-auto">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/student/profile/edit')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  {renderConnectionButton()}
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="mt-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {profileData.firstName} {profileData.lastName}
              </h1>
              {profileData.verificationStatus && (
                <BadgeCheck className="h-6 w-6 text-blue-500" />
              )}
            </div>
            
            {profileData.tagline && (
              <p className="text-gray-600 dark:text-gray-400 mb-2">{profileData.tagline}</p>
            )}
            
            {profileData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">{profileData.bio}</p>
            )}

            {/* Location and contact info */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              {profileData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
              )}
              {profileData.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{profileData.phone}</span>
                </div>
              )}
            </div>

            {/* Social links */}
            {profileData.socialLinks && profileData.socialLinks.length > 0 && (
              <div className="flex justify-center sm:justify-start items-center gap-3 mb-4">
                {profileData.socialLinks.map((link, index) => {
                  const IconComponent = getSocialIcon(link.platform)
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal transition-colors"
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            )}

            {/* Quick stats */}
            <div className="flex justify-center sm:justify-start items-center gap-6 text-sm">
              {profileData.userSkills && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profileData.userSkills.length}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Skills</span>
                </div>
              )}
              {profileData.userInterests && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profileData.userInterests.length}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Interests</span>
                </div>
              )}
              {circles.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {circles.reduce((total, circle) => total + (circle._count?.memberships || 0), 0)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Connections</span>
                </div>
              )}
            </div>
          </div>

          {/* Circles section for own profile */}
          {isOwnProfile && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-pathpiper-teal" />
                  My Circles ({circles.length})
                </h3>
                <Button 
                  size="sm" 
                  onClick={() => setShowCreateCircle(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Circle
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {circles.map((circle) => (
                  <div 
                    key={circle.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => openCircleManagement(circle)}
                  >
                    <Avatar className="h-8 w-8">
                      {circle.icon.startsWith('http') ? (
                        <AvatarImage src={circle.icon} />
                      ) : (
                        <AvatarFallback style={{ backgroundColor: circle.color }}>
                          <Users className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{circle.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {circle._count?.memberships || 0} member{(circle._count?.memberships || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
                
                {circles.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No circles yet</p>
                    <p className="text-xs">Create your first circle to organize your connections</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connection requests section */}
          {isOwnProfile && connectionRequests.length > 0 && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-pathpiper-teal" />
                  Connection Requests ({connectionRequests.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {connectionRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.sender.profileImageUrl} />
                        <AvatarFallback>
                          {request.sender.firstName[0]}{request.sender.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {request.sender.firstName} {request.sender.lastName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {request.sender.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectionAction('decline', request.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConnectionAction('accept', request.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
                
                {connectionRequests.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowConnectionRequests(true)}
                  >
                    View All {connectionRequests.length} Requests
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Circle invitations section */}
          {isOwnProfile && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-pathpiper-teal" />
                  Circle Invitations
                </h3>
              </div>
              
              <CircleInvitationsSection onInvitationHandled={fetchCircles} />
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateCircleDialog
        open={showCreateCircle}
        onOpenChange={setShowCreateCircle}
        onCircleCreated={fetchCircles}
      />
      
      <CircleManagementDialog
        circle={selectedCircle}
        open={showCircleManagement}
        onOpenChange={setShowCircleManagement}
        onCircleUpdated={fetchCircles}
      />
    </div>
  )
}
