"use client"

import { useState } from "react"
import ProfileHeader from "./profile-header"
import HorizontalNavigation from "./horizontal-navigation"
import AboutSection from "./about-section"
import SkillsCanvas from "./skills-canvas"
import ProjectsShowcase from "./projects-showcase"
import AchievementTimeline from "./achievement-timeline"
import LearningPath from "./learning-path"
import CircleView from "./circle-view"
import ActionBar from "./action-bar"

interface UserData {
  id: string
  firstName: string
  lastName: string
  role: 'student' | 'mentor' | 'institution'
  email: string
  bio?: string
  location?: string
  profileImageUrl?: string
  student?: any
  mentor?: any
  institution?: any
}

export default function StudentProfile({ userData }: { userData: UserData }) {
  const [activeTab, setActiveTab] = useState("about")

  const tabs = [
    { id: "about", label: "About" },
    { id: "circle", label: "My Circle" },
    { id: "skills", label: "Skills Canvas" },
    { id: "projects", label: "Projects" },
    { id: "achievements", label: "Achievements" },
    { id: "learning", label: "Learning Path" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <ProfileHeader userData={userData} />

      <HorizontalNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {activeTab === "about" && <AboutSection userData={userData} />}
          {activeTab === "skills" && <SkillsCanvas userData={userData} />}
          {activeTab === "projects" && <ProjectsShowcase userData={userData} />}
          {activeTab === "achievements" && <AchievementTimeline userData={userData} />}
          {activeTab === "circle" && <CircleView userData={userData} />}
          {activeTab === "learning" && <LearningPath userData={userData} />}
        </div>
      </div>

      <ActionBar />
    </div>
  )
}
