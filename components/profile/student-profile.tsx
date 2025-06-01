"use client"

import { useState, useEffect } from "react"
import ProfileHeader from "./profile-header"
import HorizontalNavigation from "./horizontal-navigation"
import AboutSection from "./about-section"
import SkillsCanvas from "./skills-canvas"
import ProjectsShowcase from "./projects-showcase"
import AchievementTimeline from "./achievement-timeline"
import LearningPath from "./learning-path"
import CircleView from "./circle-view"
import ActionBar from "./action-bar"

interface StudentProfileProps {
  studentId?: string
  currentUser?: any
}

export default function StudentProfile({ studentId, currentUser }: StudentProfileProps) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!studentId) {
          // If no studentId provided, this should be handled by the parent component
          throw new Error('No student ID provided')
        }

        const response = await fetch(`/api/student/profile/${studentId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Student profile not found')
          }
          throw new Error('Failed to fetch student profile')
        }

        const studentData = await response.json()
        setStudent(studentData)
      } catch (error) {
        console.error('Error fetching student profile:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchStudentProfile()
    }
  }, [studentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <ProfileHeader />

      <HorizontalNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {activeTab === "about" && <AboutSection />}
          {activeTab === "skills" && <SkillsCanvas />}
          {activeTab === "projects" && <ProjectsShowcase />}
          {activeTab === "achievements" && <AchievementTimeline />}
          {activeTab === "circle" && <CircleView />}
          {activeTab === "learning" && <LearningPath />}
        </div>
      </div>

      <ActionBar />
    </div>
  )
}
const tabs = [
  { id: "about", label: "About" },
  { id: "circle", label: "My Circle" },
  { id: "skills", label: "Skills Canvas" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "learning", label: "Learning Path" },
]