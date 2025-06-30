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
  Trash2
} from "lucide-react"

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

  useEffect(() => {
    fetchChildProfile()
  }, [childId])

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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
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
                              
                              <p className="text-xs text-gray-500">
                                Achieved: {new Date(achievement.dateOfAchievement).toLocaleDateString()}
                              </p>
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
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.goals && childData.profile.goals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex space-x-4 pb-4" style={{ width: `${childData.profile.goals.length * 300}px`, minWidth: '100%' }}>
                        {childData.profile.goals.map((goal) => (
                          <div key={goal.id} className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-base line-clamp-2 flex-1">{goal.title}</h4>
                                <div className="flex items-center space-x-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditGoal(goal)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteGoal(goal.id, goal.title)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm line-clamp-3">{goal.description}</p>
                              
                              <div className="flex flex-wrap gap-2">
                                {goal.category && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate">
                                    {goal.category}
                                  </span>
                                )}
                                {goal.timeframe && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded truncate">
                                    {goal.timeframe}
                                  </span>
                                )}
                              </div>
                              
                              <div className="pt-2">
                                <span className={`text-xs px-2 py-1 rounded ${goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {goal.completed ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No goals added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connections</CardTitle>
                  <CardDescription>{childData.profile.firstName}'s network</CardDescription>
                </CardHeader>
                <CardContent>
                  {childData.connections && childData.connections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {childData.connections.map((connection) => (
                        <div key={connection.id} className="border rounded-lg p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={connection.user.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(connection.user.firstName, connection.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-medium">{connection.user.firstName} {connection.user.lastName}</h4>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {connection.user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No connections yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
      {editingSection && childData && (
        <EditSectionDialog
          isOpen={!!editingSection}
          onClose={() => {
            setEditingSection(null)
            setEditingItemData(null)
          }}
          section={editingSection}
          childProfile={{
            ...childData.profile,
            ageGroup: 'young_adult' //childData?.student?.ageGroup || 'young_adult'  //Assuming all children are young adults for now
          }}
          onSave={fetchChildProfile}
          childId={childId}
          editingItemData={editingItemData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete {deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1)}
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<span className="font-medium">{deleteConfirmation.name}</span>"?
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}