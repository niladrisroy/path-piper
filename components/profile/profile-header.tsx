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
import { Settings, Plus, Users, MessageSquare, Share2, Calendar, MapPin, Briefcase, GraduationCap, Mail, Phone, Globe, Instagram, Twitter, Linkedin, Github, Youtube, Facebook, UserPlus, BadgeCheck, Edit, MessageCircle, UserIcon, FolderKanban, Award, BrainIcon, UserCheck, UserX, Upload, X } from "lucide-react"
import CircleManagementDialog from "./circle-management-dialog"

interface Circle {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isDefault: boolean
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

interface ProfileHeaderProps {
  profile: {
    id: string
    firstName: string
    lastName: string
    role: string
    profileImageUrl?: string
    bio?: string
    location?: string
    website?: string
    email?: string
    phone?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    github?: string
    youtube?: string
    facebook?: string
    student?: {
      educationLevel?: string
      birthMonth?: string
      birthYear?: string
    }
  }
  isOwnProfile: boolean
  connectionStatus?: 'none' | 'pending' | 'connected' | 'blocked'
  onConnect?: () => void
  onMessage?: () => void
}

export default function ProfileHeader({ 
  profile, 
  isOwnProfile, 
  connectionStatus = 'none',
  onConnect,
  onMessage 
}: ProfileHeaderProps) {
  const router = useRouter()
  const [showCreateCircle, setShowCreateCircle] = useState(false)
  const [circles, setCircles] = useState<Circle[]>([])
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [showCircleManagement, setShowCircleManagement] = useState(false)
  const [loading, setLoading] = useState(false)

  // Create circle form state
  const [newCircleName, setNewCircleName] = useState('')
  const [newCircleDescription, setNewCircleDescription] = useState('')
  const [newCircleColor, setNewCircleColor] = useState('#3B82F6')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  useEffect(() => {
    if (isOwnProfile) {
      fetchCircles()
    }
  }, [isOwnProfile])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
  }

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) return

    setLoading(true)
    try {
      let iconValue = 'users' // default icon

      // If image is uploaded, we'll store it as base64 or upload to a service
      // For now, we'll store the base64 data URL in the icon field
      if (uploadedImage && imagePreview) {
        iconValue = imagePreview
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
          color: newCircleColor,
          icon: iconValue
        })
      })

      if (response.ok) {
        await fetchCircles()
        setShowCreateCircle(false)
        setNewCircleName('')
        setNewCircleDescription('')
        setNewCircleColor('#3B82F6')
        setUploadedImage(null)
        setImagePreview(null)
      }
    } catch (error) {
      console.error('Error creating circle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCircleManagement = (circle: Circle) => {
    setSelectedCircle(circle)
    setShowCircleManagement(true)
  }

  const handleAddCircle = () => {
    setShowCreateCircle(true)
  }

  return (
    <div>
      <div className="relative">
        {/* Customizable banner */}
        <div className={`h-48 w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue`}></div>

        {/* Profile information overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Profile image */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.profileImageUrl} />
                <AvatarFallback className="text-3xl bg-white text-pathpiper-teal">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {profile.role === 'mentor' && (
                <BadgeCheck className="absolute -bottom-2 -right-2 h-8 w-8 text-blue-500 bg-white rounded-full p-1" />
              )}
            </div>

            {/* Profile info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <p className="text-lg opacity-90 capitalize">{profile.role}</p>
              {profile.bio && <p className="text-base opacity-80 mt-1">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.student?.educationLevel && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span className="capitalize">{profile.student.educationLevel}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => router.push('/student/profile/edit')}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {connectionStatus === 'none' && (
                    <Button onClick={onConnect} className="bg-white text-pathpiper-teal hover:bg-gray-100">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {connectionStatus === 'pending' && (
                    <Button disabled className="bg-yellow-500 text-white">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Pending
                    </Button>
                  )}
                  {connectionStatus === 'connected' && (
                    <Button onClick={onMessage} className="bg-white text-pathpiper-teal hover:bg-gray-100">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact and social links bar */}
      {(profile.email || profile.phone || profile.website || profile.instagram || profile.twitter || profile.linkedin || profile.github || profile.youtube || profile.facebook) && (
        <div className="bg-gray-50 dark:bg-gray-800 border-b px-6 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.email}</span>
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.phone}</span>
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Website</span>
              </a>
            )}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {profile.linkedin && (
              <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {profile.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Github className="h-4 w-4" />
              </a>
            )}
            {profile.youtube && (
              <a href={`https://youtube.com/@${profile.youtube}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {profile.facebook && (
              <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal">
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Circles section - only show for own profile */}
      {isOwnProfile && (
        <div className="bg-white dark:bg-gray-900 border-b px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Circles</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCircle}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Circle
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {circles.map((circle) => (
              <div
                key={circle.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleCircleManagement(circle)}
              >
                {/* Use uploaded image if available, otherwise fallback to icon */}
                {circle.icon && circle.icon.startsWith('data:image') ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={circle.icon}
                      alt={circle.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: circle.color }}
                  >
                    <Users className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {circle.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {circle._count?.memberships || 0}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Circle Dialog */}
      <Dialog open={showCreateCircle} onOpenChange={setShowCreateCircle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Circle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Circle Name</label>
              <Input
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                placeholder="Enter circle name"
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                value={newCircleDescription}
                onChange={(e) => setNewCircleDescription(e.target.value)}
                placeholder="Describe your circle..."
                rows={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Circle Avatar (Optional)</label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Circle avatar preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: newCircleColor }}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="circle-image-upload"
                      />
                      <label
                        htmlFor="circle-image-upload"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Circle Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newCircleColor}
                  onChange={(e) => setNewCircleColor(e.target.value)}
                  className="w-12 h-8 rounded border cursor-pointer"
                />
                <div className="flex gap-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCircleColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${newCircleColor === color ? 'border-gray-400' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateCircle(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCircle}
                disabled={!newCircleName.trim() || loading}
                className="flex-1"
              >
                Create Circle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Circle Management Dialog */}
      <CircleManagementDialog
        circle={selectedCircle}
        open={showCircleManagement}
        onOpenChange={setShowCircleManagement}
        onCircleUpdated={fetchCircles}
      />
    </div>
  )
}