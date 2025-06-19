The code is modified to include description and avatar image upload fields in the create circle dialog, and the circle display is updated to use uploaded images as icons.
```

```replit_final_file
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Plus, Users, MessageSquare, Share2, Calendar, MapPin, Briefcase, GraduationCap, Mail, Phone, Globe, Instagram, Twitter, Linkedin, Github, Youtube, Facebook, UserPlus, BadgeCheck, Edit, MessageCircle, UserIcon, FolderKanban, Award, BrainIcon, UserCheck, UserX } from "lucide-react"
import CircleManagementDialog from "./circle-management-dialog"

interface ProfileHeaderProps {
  student: any
  currentUser?: any
  connectionCounts?: {
    total: number
    students: number
    mentors: number
    institutions: number
  }
  isViewMode?: boolean
}

export default function ProfileHeader({ student, currentUser, connectionCounts, isViewMode = false }: ProfileHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [actualConnectionCounts, setActualConnectionCounts] = useState(connectionCounts)
  const [circles, setCircles] = useState<any[]>([])
  const [showCreateCircle, setShowCreateCircle] = useState(false)
  const [newCircleName, setNewCircleName] = useState('')
  const [newCircleDescription, setNewCircleDescription] = useState('')
  const [newCircleImagePreview, setNewCircleImagePreview] = useState<string>('')
  const [newCircleImageFile, setNewCircleImageFile] = useState<File | null>(null)
  const [selectedCircle, setSelectedCircle] = useState<any>(null)
  const [showCircleManagement, setShowCircleManagement] = useState(false)
  const [connections, setConnections] = useState<any[]>([])

  // Use passed student data or fallback to mock data
  const studentProp = student || {
    profile: {
      firstName: "Alex",
      lastName: "Johnson", 
      profileImageUrl: "/images/student-profile.png",
    },
    educationHistory: [
      {
        gradeLevel: "11th Grade",
        institutionName: "Westlake High School",
        isCurrent: true
      }
    ]
  }

  const displayName = studentProp.profile ? `${studentProp.profile.firstName} ${studentProp.profile.lastName}` : "Student"
  const currentEducation = studentProp.educationHistory?.find((edu: any) => edu.is_current || edu.isCurrent)
  const gradeLevel = currentEducation?.gradeLevel || currentEducation?.grade_level || "Student"
  const schoolName = currentEducation?.institutionName || currentEducation?.institution_name || "School"
  const profileImage = studentProp.profile?.profileImageUrl || "/images/student-profile.png"
  // Fix tagline access - check multiple possible locations
  const tagline = studentProp.profile?.tagline || studentProp.tagline || studentProp.profile?.bio || "Passionate learner exploring new horizons"

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === studentProp.id

  // Initialize and fetch connection counts
  React.useEffect(() => {
    if (isOwnProfile) {
      // For own profile, use the passed connectionCounts if available
      if (connectionCounts) {
        setActualConnectionCounts(connectionCounts)
      } else {
        // If no connectionCounts passed, fetch for current user
        const fetchOwnConnectionCounts = async () => {
          try {
            const response = await fetch(`/api/connections`, {
              credentials: 'include'
            })
            if (response.ok) {
              const connections = await response.json()

              const counts = {
                total: connections.length,
                students: connections.filter((conn: any) => conn.user.role === 'student').length,
                mentors: connections.filter((conn: any) => conn.user.role === 'mentor').length,
                institutions: connections.filter((conn: any) => conn.user.role === 'institution').length
              }

              setActualConnectionCounts(counts)
            }
          } catch (error) {
            console.error('Error fetching own connection counts:', error)
          }
        }
        fetchOwnConnectionCounts()
      }
    } else {
      // For viewing someone else's profile, always fetch their connection counts
      const fetchViewedUserConnectionCounts = async () => {
        try {
          const response = await fetch(`/api/connections?userId=${studentProp.id}`, {
            credentials: 'include'
          })
          if (response.ok) {
            const connections = await response.json()

            // Count connections by role
            const counts = {
              total: connections.length,
              students: connections.filter((conn: any) => conn.user.role === 'student').length,
              mentors: connections.filter((conn: any) => conn.user.role === 'mentor').length,
              institutions: connections.filter((conn: any) => conn.user.role === 'institution').length
            }

            setActualConnectionCounts(counts)
          }
        } catch (error) {
          console.error('Error fetching connection counts for viewed user:', error)
        }
      }

      if (studentProp.id) {
        fetchViewedUserConnectionCounts()
      }
    }
  }, [isOwnProfile, studentProp.id, connectionCounts])

  // Fetch user's circles and connections
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const response = await fetch('/api/circles', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setCircles(data)
        } else {
          console.error('Error fetching circles:', response.status)
        }
      } catch (error) {
        console.error('Error fetching circles:', error)
      }
    }

    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setConnections(data)
        }
      } catch (error) {
        console.error('Error fetching connections:', error)
      }
    }

    if (isOwnProfile) {
      fetchCircles()
      fetchConnections()
    }
  }, [isOwnProfile])

  const handleCircleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setNewCircleImageFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setNewCircleImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) return

    try {
      let iconValue = 'users' // default icon

      // If image is uploaded, we'll use the image URL as the icon
      if (newCircleImageFile) {
        // For now, we'll use the data URL as the icon
        // In a production app, you'd upload to a storage service first
        iconValue = newCircleImagePreview
      }

      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newCircleName.trim(),
          description: newCircleDescription.trim() || null,
          color: '#3B82F6',
          icon: iconValue
        })
      })

      if (response.ok) {
        setNewCircleName('')
        setNewCircleDescription('')
        setNewCircleImagePreview('')
        setNewCircleImageFile(null)
        setShowCreateCircle(false)
        handleCircleUpdated()
      } else {
        console.error('Failed to create circle')
      }
    } catch (error) {
      console.error('Error creating circle:', error)
    }
  }

  const handleCircleClick = (circle: any) => {
    setSelectedCircle(circle)
    setShowCircleManagement(true)
  }

  const handleCircleUpdated = async () => {
    // Refresh circles after invitations are sent
    try {
      const response = await fetch('/api/circles', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCircles(data)
      }
    } catch (error) {
      console.error('Error refreshing circles:', error)
    }
  }

  // Mock circle members (would come from API in real app)
  const circleMembers = [
    { id: 1, name: "Emma W.", image: "/diverse-students-studying.png", type: "student" },
    { id: 2, name: "Noah T.", image: "/placeholder.svg?key=hwap2", type: "student" },
    { id: 3, name: "Olivia R.", image: "/placeholder.svg?key=oez43", type: "student" },
    { id: 4, name: "Ms. Chen", image: "/diverse-classroom-teacher.png", type: "mentor" },
    { id: 5, name: "Riverdale High", image: "/university-classroom.png", type: "institution" },
  ]

    const handleAddCircle = () => {
        setShowCreateCircle(true)
    }

  return (
    <div>
      <div className="relative">
        {/* Customizable banner */}
        <div className={`h-48 w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue`}></div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative -mt-24 sm:-mt-16 mb-6">
            {/* Profile info - With profile pic inside */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left column - Profile details with profile pic */}
                <div className="md:col-span-3">
                  <div className="flex flex-row gap-4 mb-4">
                    {/* Profile image */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="rounded-full border-4 border-white dark:border-gray-800 overflow-hidden h-20 w-20 sm:h-28 sm:w-28 shadow-md">
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt={displayName}
                          width={112}
                          height={112}
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Name and tagline */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-3xl font-bold truncate">{displayName}</h1>
                        {true && <BadgeCheck className="h-6 w-6 text-pathpiper-teal" />}
                      </div>
                      {tagline && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base truncate">
                          {tagline}
                        </p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {gradeLevel} • {schoolName}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats - Horizontal display with icons and pastel backgrounds */}
                  <div className="flex flex-wrap gap-3 text-xs font-medium mt-4">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-600 dark:text-pink-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-pink-500" data-tooltip="Total connections in their circle" />
                      <span data-tooltip="Total connections in their circle">
                        {actualConnectionCounts?.total || 0} in {isOwnProfile ? 'My' : 'Their'} Circle
                      </span>
                      <div className="ml-1.5 flex items-center gap-1 border-l border-pink-200 dark:border-pink-800/30 pl-1.5">
                        <div className="flex items-center" data-tooltip="Students in their circle">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3 text-pink-500"
                            data-tooltip="Students"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <span className="text-[10px] ml-0.5" data-tooltip="Students in their circle">
                            {actualConnectionCounts?.students || 0}
                          </span>
                        </div>
                        <div className="flex items-center" data-tooltip="Mentors guiding them">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3 text-pink-500"
                            data-tooltip="Mentors"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          <span className="text-[10px] ml-0.5" data-tooltip="Mentors guiding them">
                            {actualConnectionCounts?.mentors || 0}
                          </span>
                        </div>
                        <div className="flex items-center" data-tooltip="Institutions connected with them">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3 text-pink-500"
                            data-tooltip="Institutions"
                          >
                            <rect x="4" y="9" width="16" height="12"></rect>
                            <path d="m12 3-8 6h16l-8-6z"></path>
                            <path d="M8 21v-4"></path>
                            <path d="M16 21v-4"></path>
                            <path d="M12 21v-4"></path>
                          </svg>
                          <span className="text-[10px] ml-0.5" data-tooltip="Institutions connected with them">
                            {actualConnectionCounts?.institutions || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                      <FolderKanban
                        className="h-3.5 w-3.5 text-blue-500"
                        data-tooltip={`Projects ${isOwnProfile ? "you've" : "they've"} created or contributed to`}
                      />
                      <span data-tooltip={`Projects ${isOwnProfile ? "you've" : "they've"} created or contributed to`}>
                        Projects: {studentProp?.projects?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-600 dark:text-amber-300 px-3 py-1.5 rounded-full">
                      <Award className="h-3.5 w-3.5 text-amber-500" data-tooltip={`Badges ${isOwnProfile ? "you've" : "they've"} earned`} />
                      <span data-tooltip={`Badges ${isOwnProfile ? "you've" : "they've"} earned`}>
                        Badges: {studentProp?.customBadges?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 text-teal-600 dark:text-teal-300 px-3 py-1.5 rounded-full">
                      <BrainIcon className="h-3.5 w-3.5 text-teal-500" data-tooltip={`Skills ${isOwnProfile ? "you've" : "they've"} developed`} />
                      <span data-tooltip={`Skills ${isOwnProfile ? "you've" : "they've"} developed`}>
                        Skills: {studentProp?.skills?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Circle preview - Friends circle with add button */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">My Circles</h3>
                    </div>

                    <div className="relative">
                      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-4">
                        {/* Default Friends Circle - Only show for own profile */}
                        {isOwnProfile && (
                          <div className="flex flex-col items-center min-w-[72px]">
                            <div className="relative mb-1">
                              <button
                                onClick={() => handleCircleClick({
                                  id: 'friends',
                                  name: 'Friends',
                                  color: '#ec4899',
                                  icon: 'users',
                                  memberships: connections?.map(conn => ({
                                    user: conn.user
                                  })) || [],
                                  _count: {
                                    memberships: actualConnectionCounts?.total || 0
                                  },
                                  creator: studentProp.profile,
                                  isDefault: true
                                })}
                                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 p-[3px] hover:from-pink-500 hover:to-purple-600 transition-all duration-200"
                              >
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-pink-500 dark:text-pink-400" />
                                  </div>
                                </div>
                              </button>
                            </div>
                            <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                              Friends ({actualConnectionCounts?.total || 0})
                            </span>
                          </div>
                        )}

                        {/* Dynamic Circles from Database */}
                        {circles.map((circle) => (
                          <div 
                            key={circle.id}
                            className="flex flex-col items-center min-w-[72px]"
                          >
                            <div className="relative mb-1">
                              <button
                                onClick={() => handleCircleClick(circle)}
                                className="w-16 h-16 rounded-full p-[3px] hover:opacity-80 transition-all duration-200"
                                style={{ 
                                  background: `linear-gradient(135deg, ${circle.color}, ${circle.color}dd)`
                                }}
                              >
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {circle.icon && circle.icon.startsWith('data:image/') ? (
                                      <img 
                                        src={circle.icon} 
                                        alt={`${circle.name} avatar`}
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            </div>
                            <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                              {circle.name} ({circle._count?.memberships || 0})
                            </span>
                          </div>
                        ))}

                        {/* Add New Circle Button - Only show for own profile */}
                        {isOwnProfile && (
                          <div className="flex flex-col items-center min-w-[72px]">
                            <div className="relative mb-1">
                              <button
                                onClick={() => setShowCreateCircle(true)}
                                className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 p-[3px] hover:from-pathpiper-teal hover:to-pathpiper-blue transition-all duration-200"
                              >
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <Plus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                  </div>
                                </div>
                              </button>
                            </div>
                            <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                              Add Circle
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Create Circle Modal */}
                    <Dialog open={showCreateCircle} onOpenChange={setShowCreateCircle}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New Circle</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="circle-name" className="block text-sm font-medium mb-2">
                              Circle name
                            </label>
                            <Input
                              id="circle-name"
                              value={newCircleName}
                              onChange={(e) => setNewCircleName(e.target.value)}
                              placeholder="Enter circle name"
                              maxLength={50}
                            />
                          </div>

                          <div>
                            <label htmlFor="circle-description" className="block text-sm font-medium mb-2">
                              Description (optional)
                            </label>
                            <textarea
                              id="circle-description"
                              value={newCircleDescription}
                              onChange={(e) => setNewCircleDescription(e.target.value)}
                              placeholder="Describe your circle..."
                              maxLength={200}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pathpiper-teal focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {newCircleDescription.length}/200 characters
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Circle Avatar (optional)
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                {newCircleImagePreview ? (
                                  <img 
                                    src={newCircleImagePreview} 
                                    alt="Circle avatar preview" 
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCircleImageUpload}
                                  className="hidden"
                                  id="circle-image-upload"
                                />
                                <label
                                  htmlFor="circle-image-upload"
                                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md cursor-pointer transition-colors"
                                >
                                  Choose Image
                                </label>
                                {newCircleImagePreview && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewCircleImagePreview('')
                                      setNewCircleImageFile(null)
                                    }}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowCreateCircle(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleCreateCircle}
                              disabled={!newCircleName.trim()}
                            >
                              Create Circle
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Right column - Profile highlights */}
                <div className="md:col-span-2 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                  {/* Circle Invitations Section - Only show for own profile */}
                  {isOwnProfile && (
                    <div className="mb-6">
                      <CircleInvitationsSection onInvitationHandled={handleCircleUpdated} />
                    </div>
                  )}

                  {/* Top Skills section - Dynamic from Database with sorting by proficiency */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {student?.skills && student.skills.length > 0 ? (
                        student.skills
                          .sort((a: any, b: any) => (b.proficiencyLevel || 0) - (a.proficiencyLevel || 0))
                          .slice(0, 5)
                          .map((skill: any, i: number) => (
                          <div
                            key={skill.id || i}
                            className={`px-3 py-1 rounded-full text-xs ${
                              i % 4 === 0
                                ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                                : i % 4 === 1
                                  ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                                  : i % 4 === 2
                                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                                    : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                            }`}
                          >
                            {skill.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  {/* Recent Achievement section */}
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recent Achievement</h3>
                    <div className="bg-sky-50 dark:bg-sky-900/20 p-2 rounded-lg flex items-center gap-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900/40 h-8 w-8 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium">Science Fair Winner</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Awarded 2 weeks ago</p>
                      </div>
                    </div>
                  </div>



                  {/* Recent Badges section */}
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recent Badges</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 h-12 w-12 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 024 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                          >
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400">Math Whiz</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark: