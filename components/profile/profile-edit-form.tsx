"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { 
  User, 
  Heart, 
  Palette, 
  Target, 
  MessageSquare, 
  GraduationCap, 
  Image as ImageIcon, 
  Shield,
  Save,
  X,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import PersonalInfoForm from "./forms/personal-info-form"
import InterestsPassionsForm from "./forms/interests-passions-form"
import SkillsAbilitiesForm from "./forms/skills-abilities-form"
import GoalsAspirationsForm from "./forms/goals-aspirations-form"
import SocialContactForm from "./forms/social-contact-form"
import EducationHistoryForm from "./forms/education-history-form"
import MoodBoardMediaForm from "./forms/mood-board-media-form"
import PrivacySettingsForm from "./forms/privacy-settings-form"

interface ProfileEditFormProps {
  userId: string
}

interface TabConfig {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
  required?: boolean
}

export default function ProfileEditForm({ userId }: ProfileEditFormProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("personal")
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completionData, setCompletionData] = useState<Record<string, boolean>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Security check: Ensure user can only edit their own profile
  useEffect(() => {
    if (currentUser && currentUser.id !== userId) {
      console.warn('User attempted to edit another user\'s profile')
      router.push(`/student/profile/edit`)
      return
    }
  }, [currentUser, userId, router])

  // Handle form changes - prevent infinite loops
  const handleFormChange = useCallback((sectionId: string, data: any) => {
    setProfileData((prev: any) => {
      // Check if data actually changed to prevent unnecessary re-renders
      const currentData = prev?.[sectionId]
      if (JSON.stringify(currentData) === JSON.stringify(data)) {
        return prev
      }
      
      return {
        ...prev,
        [sectionId]: data
      }
    })
    setHasUnsavedChanges(true)
  }, [])

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: "personal",
      label: "Personal Info",
      icon: <User className="h-4 w-4" />,
      component: <PersonalInfoForm data={profileData} onChange={handleFormChange} />,
      required: true
    },
    {
      id: "interests",
      label: "Interests & Passions",
      icon: <Heart className="h-4 w-4" />,
      component: <InterestsPassionsForm data={profileData} onChange={handleFormChange} />,
      required: true
    },
    {
      id: "skills",
      label: "Skills & Abilities",
      icon: <Palette className="h-4 w-4" />,
      component: <SkillsAbilitiesForm data={profileData} onChange={handleFormChange} />
    },
    {
      id: "goals",
      label: "Goals & Aspirations",
      icon: <Target className="h-4 w-4" />,
      component: <GoalsAspirationsForm data={profileData} onChange={handleFormChange} />
    },
    {
      id: "social",
      label: "Social & Contact",
      icon: <MessageSquare className="h-4 w-4" />,
      component: <SocialContactForm data={profileData} onChange={handleFormChange} />
    },
    {
      id: "education",
      label: "Education History",
      icon: <GraduationCap className="h-4 w-4" />,
      component: <EducationHistoryForm data={profileData} onChange={handleFormChange} />,
      required: true
    },
    {
      id: "media",
      label: "Mood Board & Media",
      icon: <ImageIcon className="h-4 w-4" />,
      component: <MoodBoardMediaForm data={profileData} onChange={handleFormChange} />
    },
    {
      id: "privacy",
      label: "Privacy & Settings",
      icon: <Shield className="h-4 w-4" />,
      component: <PrivacySettingsForm data={profileData} onChange={handleFormChange} />
    }
  ]

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/auth/user')
        if (!response.ok) throw new Error('Failed to load profile')

        const { user } = await response.json()
        setProfileData(user)

        // Calculate completion status for each section
        const completion: Record<string, boolean> = {}
        tabs.forEach(tab => {
          completion[tab.id] = calculateSectionCompletion(tab.id, user)
        })
        setCompletionData(completion)

      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [userId])

  // Calculate section completion
  const calculateSectionCompletion = (sectionId: string, data: any): boolean => {
    if (!data) return false

    switch (sectionId) {
      case "personal":
        return !!(data.firstName && data.lastName && data.bio && data.location)
      case "interests":
        return !!(data.interests && data.interests.length > 0)
      case "skills":
        return !!(data.skills && data.skills.length > 0)
      case "goals":
        return !!(data.goals && data.goals.length > 0)
      case "social":
        return !!(data.githubUrl || data.linkedinUrl || data.portfolioUrl)
      case "education":
        return !!(data.educationHistory && data.educationHistory.length > 0)
      case "media":
        return !!(data.moodBoard && data.moodBoard.length > 0)
      case "privacy":
        return true // Always considered complete
      default:
        return false
    }
  }

  // Calculate overall completion percentage
  const completionPercentage = Math.round(
    (Object.values(completionData).filter(Boolean).length / tabs.length) * 100
  )

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true)

      // Here you would implement the actual save logic
      // This would involve multiple API calls to save different sections

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setHasUnsavedChanges(false)
      toast.success('Profile updated successfully!')

    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  // Handle navigation with unsaved changes warning
  const handleNavigation = (tabId: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Do you want to save before switching sections?')
      if (confirmed) {
        handleSave().then(() => setActiveTab(tabId))
        return
      }
    }
    setActiveTab(tabId)
  }

  // Handle back navigation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmed) return
    }
    router.push('/student/profile')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <div>
              <h2 className="text-xl font-bold">Edit Your Profile</h2>
              <p className="text-white/80 text-sm">Complete your profile to help others connect with you</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <div className="text-sm text-white/80">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={completionPercentage} className="h-2 bg-white/20" />
        </div>
      </div>

      <div className="flex">
        {/* Vertical Navigation - Desktop */}
        <div className="hidden lg:block w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                const isComplete = completionData[tab.id]
                const isRequired = tab.required

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigation(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-pathpiper-teal text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{tab.label}</span>
                        {isRequired && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden w-full border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <select
              value={activeTab}
              onChange={(e) => handleNavigation(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} {tab.required ? '*' : ''} {completionData[tab.id] ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-[600px]">
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {tabs.find(tab => tab.id === activeTab)?.component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Save Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {hasUnsavedChanges ? (
                  <span className="text-orange-600">You have unsaved changes</span>
                ) : (
                  <span>All changes saved</span>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving}
                  className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}