Analysis: The code changes address two issues: the options dialog in the child profile view overflowing its container and the confirmation dialog appearing behind the options dialog. The first change introduces a `setTimeout` in the `handleCircleDisable` function to ensure the options dialog closes before the confirmation dialog opens. The second change updates the `z-index` of the confirmation dialog to ensure it appears on top.
```

```replit_final_file
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import EditSectionDialog from "@/components/parent/edit-section-dialog"
import { 
  User, 
  Edit3, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  Trophy, 
  Users, 
  MapPin,
  Mail,
  Phone,
  Globe,
  LogOut,
  Plus,
  Trash2,
  Eye,
  MessageCircle,
  Settings
} from "lucide-react"
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ChildData {
  id: string
  profile: {
    firstName: string
    lastName: string
    bio?: string
    location?: string
    profileImageUrl?: string
    coverImageUrl?: string
    tagline?: string
    userInterests: Array<{
      id: string
      interest: {
        id: string
        name: string
        category: { name: string }
      }
    }>
    userSkills: Array<{
      id: string
      skill: {
        id: string
        name: string
        category: { name: string }
      }
      proficiencyLevel: number
    }>
    socialLinks: Array<{
      id: string
      platform: string
      url: string
    }>
    goals: Array<{
      id: string
      title: string
      description: string
      category: string
      timeframe: string
      completed: boolean
    }>
    userAchievements: Array<{
      id: string
      name: string
      description: string
      achievementType: {
        name: string
        category: {
          name: string
        }
      }
      dateOfAchievement: string
      achievementImageIcon: string
    }>
  }
  educationHistory: Array<{
    id: string
    institutionName: string
    institutionTypeName?: string
    degreeProgram?: string
    fieldOfStudy?: string
    subjects?: string[]
    startDate: string
    endDate?: string
    isCurrent: boolean
    gradeLevel?: string
    gpa?: number
    achievements?: string[]
    description?: string
  }>
  connections?: Array<{
    id: string
    user: {
      firstName: string
      lastName: string
      profileImageUrl?: string
      role: string
    }
  }>
  achievements?: Array<{
    id: string
    title: string
    description: string
    earnedDate: string
    iconUrl?: string
  }>
}

export default function ParentChildProfilePage() {
  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parentName, setParentName] = useState("")
  const [activeTab, setActiveTab] = useState("about")
  const [circles, setCircles] = useState<any[]>([])
  const [circlesLoading, setCirclesLoading] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    type: 'education' | 'achievement' | 'goal'
    id: string | number
    name: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const childId = params.id as string
  const [selectedCircleMembers, setSelectedCircleMembers] = useState<any[] | null>(null);
  const [circleDisableConfirmation, setCircleDisableConfirmation] = useState<{
    isOpen: boolean
    circleId: string
    circleName: string
    disableType: 'child' | 'all'
  } | null>(null)
  const [isDisablingCircle, setIsDisablingCircle] = useState(false)

  useEffect(() => {
    fetchChildProfile()
  }, [childId])

  useEffect(() => {
    if (activeTab === 'circles' && childData && circles.length === 0) {
      fetchChildCircles()
    }
  }, [activeTab, childData])

  const fetchChildProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/child-profile/${childId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/parent/login')
          return
        }
        if (response.status === 403) {
          setError('You do not have permission to view this profile')
          return
        }
        throw new Error('Failed to fetch child profile')
      }

      const data = await response.json()
      setChildData(data.child)
      setParentName(data.parentName || "Parent")
    } catch (error) {
      console.error('Error fetching child profile:', error)
      setError('Failed to load child profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchChildCircles = async () => {
    try {
      setCirclesLoading(true)
      const response = await fetch(`/api/parent/child-profile/${childId}/circles`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCircles(data.circles || [])
      }
    } catch (error) {
      console.error('Error fetching child circles:', error)
    } finally {
      setCirclesLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/parent/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/parent/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <User className="h-4 w-4" />;
      case "shield":
        return <User className="h-4 w-4" />;
      case "star":
        return <User className="h-4 w-4" />;
      case "graduation-cap":
        return <GraduationCap className="h-4 w-4" />;
      case "building":
        return <User className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  }

  const [editingItemData, setEditingItemData] = useState<any>(null)

  const handleEditEducation = (education: any) => {
    setEditingItemData(education)
    setEditingSection('education')
  }

  const handleEditAchievement = (achievement: any) => {
    setEditingItemData(achievement)
    setEditingSection('achievements')
  }

  const handleEditGoal = (goal: any) => {
    setEditingItemData(goal)
    setEditingSection('goals')
  }

  const handleDeleteEducation = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'education',
      id,
      name
    })
  }

  const handleDeleteAchievement = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'achievement',
      id,
      name
    })
  }

  const handleDeleteGoal = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'goal',
      id,
      name
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return

    setIsDeleting(true)
    try {
      // Use the parent API endpoint for all deletions
      const response = await fetch(`/api/parent/child-profile/${childId}/edit`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section: deleteConfirmation.type === 'achievement' ? 'achievements' : deleteConfirmation.type === 'education' ? 'education' : 'goals',
          itemId: deleteConfirmation.id
        })
      })

      if (response.ok) {
        toast.success(`${deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1)} deleted successfully!`)
        // Refresh the child profile data
        await fetchChildProfile()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to delete ${deleteConfirmation.type}`)
      }
    } catch (error) {
      console.error(`Error deleting ${deleteConfirmation.type}:`, error)
      toast.error(`Failed to delete ${deleteConfirmation.type}`)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmation(null)
    }
  }

  const showCircleMembers = async (circleId: string) => {
    try {
      const response = await fetch(`/api/parent/child-profile/${childId}/circles/${circleId}/members`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedCircleMembers(data.members);
      } else {
        console.error('Failed to fetch circle members');
        setSelectedCircleMembers([]);
      }
    } catch (error) {
      console.error('Error fetching circle members:', error);
      setSelectedCircleMembers([]);
    }
  };

  const handleCircleDisable = (circleId: string, disableType: 'child' | 'all') => {
    const circle = circles.find(c => c.id === circleId);
    if (!circle) return;

    // Close the options dialog first, then show confirmation
    setTimeout(() => {
      setCircleDisableConfirmation({
        isOpen: true,
        circleId,
        circleName: circle.name,
        disableType
      });
    }, 100);
  };

  const confirmCircleDisable = async () => {
    if (!circleDisableConfirmation) return;

    setIsDisablingCircle(true);
    try {
      const response = await fetch(`/api/parent/child-profile/${childId}/circles/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          circleId: circleDisableConfirmation.circleId,
          disableType: circleDisableConfirmation.disableType
        })
      });

      if (response.ok) {
        toast.success(`Circle ${circleDisableConfirmation.disableType === 'child' ? 'disabled for your child' : 'disabled for all members'} successfully!`);
        // Refresh the circles data
        await fetchChildCircles();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to disable circle');
      }
    } catch (error) {
      console.error('Error disabling circle:', error);
      toast.error('Failed to disable circle');
    } finally {
      setIsDisablingCircle(false);
      setCircleDisableConfirmation(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
          <Link href="/" className="h-10">
            <Image
              src="/images/pathpiper-logo-full.png"
              width={180}
              height={40}
              alt="PathPiper Logo"
              className="h-full w-auto"
            />
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
          <Link href="/" className="h-10">
            <Image
              src="/images/pathpiper-logo-full.png"
              width={180}
              height={40}
              alt="PathPiper Logo"
              className="h-full w-auto"
            />
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/parent/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!childData) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
        <Link href="/" className="h-10">
          <Image
            src="/images/pathpiper-logo-full.png"
            width={180}
            height={40}
            alt="PathPiper Logo"
            className="h-full w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/parent/dashboard')}
            className="text-gray-600"
          >
            Back to Dashboard
          </Button>
          <span className="text-gray-700 font-medium">Welcome, {parentName}</span>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          {childData.profile.coverImageUrl && (
            <Image
              src={childData.profile.coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="container mx-auto flex items-end space-x-6">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage 
                src={childData.profile.profileImageUrl} 
                alt={`${childData.profile.firstName} ${childData.profile.lastName}`} 
              />
              <AvatarFallback className="bg-gradient-to-r from-teal-400 to-blue-500 text-white text-2xl font-bold">
                {getInitials(childData.profile.firstName, childData.profile.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="text-white mb-4">
              <h1 className="text-3xl font-bold">
                {childData.profile.firstName} {childData.profile.lastName}
              </h1>
              {childData.profile.tagline && (
                <p className="text-lg opacity-90">{childData.profile.tagline}</p>
              )}
              {childData.profile.location && (
                <div className="flex items-center mt-2 opacity-80">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{childData.profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="circles">Circles</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>About {childData.profile.firstName}</CardTitle>
                    <CardDescription>Personal information and bio</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="about" 
                    childId={childId} 
                    currentData={childData.profile}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {childData.profile.bio ? (
                    <p className="text-gray-700">{childData.profile.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio added yet</p>
                  )}

                  {childData.profile.socialLinks && childData.profile.socialLinks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Social Links</h4>
                      <div className="space-y-2">
                        {childData.profile.socialLinks.map((link) => (
                          <div key={link.id} className="flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span className="capitalize">{link.platform}:</span>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {link.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Interests & Passions</CardTitle>
                    <CardDescription>Things {childData.profile.firstName} is passionate about</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="interests" 
                    childId={childId} 
                    currentData={childData.profile}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.userInterests && childData.profile.userInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {childData.profile.userInterests.map((userInterest) => (
                        <Badge key={userInterest.id} variant="secondary" className="text-sm">
                          {userInterest.interest.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No interests added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Skills & Abilities</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s skill portfolio</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="skills" 
                    childId={childId} 
                    currentData={childData.profile}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.userSkills && childData.profile.userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {childData.profile.userSkills.map((userSkill) => (
                        <Badge key={userSkill.id} variant="secondary" className="text-sm">
                          {userSkill.skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Education History</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s educational journey</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <EditSectionDialog 
                      section="education" 
                      childId={childId} 
                      currentData={null}
                      onUpdate={fetchChildProfile}
                    >
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </EditSectionDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {childData.educationHistory && childData.educationHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex space-x-4 pb-4" style={{ width: `${childData.educationHistory.length * 300}px`, minWidth: '100%' }}>
                        {childData.educationHistory.map((education) => (
                          <div key={education.id} className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                <GraduationCap className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-base truncate">{education.institutionName}</h4>
                                  {education.institutionTypeName && (
                                    <p className="text-sm text-gray-600 truncate">{education.institutionTypeName}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {education.isCurrent && (
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs flex-shrink-0">
                                    Current
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEducation(education)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEducation(education.id, education.institutionName)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {education.degreeProgram && (
                                <p className="font-medium text-sm">{education.degreeProgram}</p>
                              )}
                              {education.fieldOfStudy && (
                                <p className="text-gray-700 text-sm">{education.fieldOfStudy}</p>
                              )}
                              {education.gradeLevel && (
                                <p className="text-sm text-gray-600">Grade: {education.gradeLevel}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {new Date(education.startDate).getFullYear()} - {
                                  education.isCurrent ? 'Present' : 
                                  education.endDate ? new Date(education.endDate).getFullYear() : 'Present'
                                }
                              </p>
                            </div>

                            {education.subjects && education.subjects.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium mb-2">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {education.subjects.slice(0, 3).map((subject, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                  {education.subjects.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{education.subjects.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {education.description && (
                              <p className="mt-3 text-xs text-gray-700 line-clamp-2">{education.description}</p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {education.startDate && format(new Date(education.startDate), 'MMM yyyy')} - {education.isCurrent ? 'Present' : education.endDate ? format(new Date(education.endDate), 'MMM yyyy') : 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No education history added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Achievements & Badges</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s accomplishments</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="achievements" 
                    childId={childId} 
                    currentData={null}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.userAchievements && childData.profile.userAchievements.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex space-x-4 pb-4" style={{ width: `${childData.profile.userAchievements.length * 300}px`, minWidth: '100%' }}>
                        {childData.profile.userAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                {achievement.achievementImageIcon ? (
                                  <img 
                                    src={achievement.achievementImageIcon} 
                                    alt={achievement.name}
                                    className="w-10 h-10 object-cover rounded mt-1 flex-shrink-0"
                                  />
                                ) : (
                                  <Trophy className="w-10 h-10 text-yellow-500 mt-1 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-base truncate">{achievement.name}</h4>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAchievement(achievement)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAchievement(achievement.id, achievement.name)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-gray-600 text-sm line-clamp-2">{achievement.description}</p>

                              {achievement.achievementType && (
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded truncate">
                                    {achievement.achievementType.name}
                                  </span>
                                  {achievement.achievementType.category && (
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded truncate">
                                      {achievement.achievementType.category.name}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {achievement.dateOfAchievement && format(new Date(achievement.dateOfAchievement), 'MMM yyyy')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No achievements added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Goals & Aspirations</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s future plans</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="goals" 
                    childId={childId} 
                    currentData={null}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Plus