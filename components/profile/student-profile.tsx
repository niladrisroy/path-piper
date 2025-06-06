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
  studentData?: any
}

export default function StudentProfile({ studentId, currentUser, studentData }: StudentProfileProps) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    if (studentData) {
      // Transform the real data to match our component's expected structure
      const transformedStudent = {
        id: studentData.id,
        ageGroup: studentData.ageGroup || "young_adult",
        educationLevel: studentData.educationLevel || "undergraduate",
        birthMonth: studentData.birthMonth,
        birthYear: studentData.birthYear,
        personalityType: studentData.personalityType,
        learningStyle: studentData.learningStyle,
        favoriteQuote: studentData.favoriteQuote,
        profile: {
          firstName: studentData.profile?.firstName || "Student",
          lastName: studentData.profile?.lastName || "",
          bio: studentData.profile?.bio || "No bio available",
          location: studentData.profile?.location || "Location not specified",
          profileImageUrl: studentData.profile?.profileImageUrl || "/images/student-profile.png",
          coverImageUrl: studentData.profile?.coverImageUrl,
          verificationStatus: studentData.profile?.verificationStatus || false,
          role: "student"
        },
        interests: studentData.profile?.userInterests?.map((ui: any) => ({
          id: ui.interest.id,
          name: ui.interest.name,
          category: ui.interest.category?.name || "General"
        })) || [],
        skills: studentData.profile?.userSkills?.map((us: any) => ({
          id: us.skill.id,
          name: us.skill.name,
          proficiencyLevel: us.proficiencyLevel || 50,
          category: us.skill.category?.name || "General"
        })) || [],
        educationHistory: studentData.educationHistory || [],
        socialLinks: studentData.profile?.socialLinks || [],
        careerGoals: studentData.profile?.careerGoals || [],
        customBadges: studentData.profile?.customBadges || [],
        
        // Mock data for sections without database tables
        projects: [
          {
            id: "1",
            title: "Personal Website",
            description: "Built a responsive portfolio website using React and Tailwind CSS",
            image: "/images/placeholder.jpg",
            link: "https://example.com",
            technologies: ["React", "Tailwind CSS", "TypeScript"],
            status: "completed",
            completedDate: "2024-01-15"
          },
          {
            id: "2", 
            title: "Learning Management App",
            description: "Developing a mobile app to track learning progress and goals",
            image: "/images/placeholder.jpg",
            technologies: ["React Native", "Node.js", "MongoDB"],
            status: "in_progress",
            progress: 75
          }
        ],
        
        achievements: [
          {
            id: "1",
            title: "Dean's List",
            description: "Achieved Dean's List recognition for academic excellence",
            date: "2024-01-20",
            type: "academic",
            issuer: "University"
          },
          {
            id: "2",
            title: "Hackathon Winner",
            description: "First place in regional coding hackathon",
            date: "2023-11-15",
            type: "competition",
            issuer: "TechFest 2023"
          }
        ],
        
        learningPath: {
          currentCourses: [
            {
              id: "1",
              title: "Advanced React Development",
              provider: "Online Academy",
              progress: 65,
              estimatedCompletion: "2024-03-15"
            },
            {
              id: "2",
              title: "Data Structures & Algorithms",
              provider: "University",
              progress: 80,
              estimatedCompletion: "2024-02-28"
            }
          ],
          completedCourses: [
            {
              id: "3",
              title: "JavaScript Fundamentals",
              provider: "CodeAcademy",
              completedDate: "2023-12-10",
              certificate: true
            }
          ],
          recommendations: [
            {
              id: "1",
              title: "Machine Learning Basics",
              provider: "AI Institute",
              difficulty: "intermediate",
              duration: "6 weeks"
            }
          ]
        },
        
        connections: {
          mentors: [
            {
              id: "1",
              name: "Dr. Sarah Johnson",
              title: "Software Engineering Mentor",
              image: "/images/placeholder-user.jpg",
              status: "active"
            }
          ],
          peers: [
            {
              id: "1",
              name: "Alex Chen",
              commonInterests: ["Programming", "AI"],
              image: "/images/placeholder-user.jpg"
            },
            {
              id: "2", 
              name: "Maria Garcia",
              commonInterests: ["Web Development", "Design"],
              image: "/images/placeholder-user.jpg"
            }
          ],
          institutions: [
            {
              id: "1",
              name: "Tech University",
              relationship: "student",
              image: "/images/placeholder-logo.png"
            }
          ]
        }
      }

      setStudent(transformedStudent)
      setLoading(false)
    }
  }, [studentData])

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
      <ProfileHeader student={student} currentUser={currentUser} />

      <HorizontalNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {activeTab === "about" && <AboutSection student={student} />}
          {activeTab === "skills" && <SkillsCanvas student={student} />}
          {activeTab === "projects" && <ProjectsShowcase student={student} />}
          {activeTab === "achievements" && <AchievementTimeline student={student} />}
          {activeTab === "circle" && <CircleView student={student} />}
          {activeTab === "learning" && <LearningPath student={student} />}
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