"use client"

import { useState, useEffect } from "react"
import ProfileHeader from "./profile-header"
import HorizontalNavigation from "./horizontal-navigation"
import AboutSection from "./about-section"
import SkillsCanvas from "./skills-canvas"
import ProjectsShowcase from "./projects-showcase"
import AchievementTimeline from "./achievement-timeline"
import CircleView from "./circle-view"
import ActionBar from "./action-bar"
import Goals from "./goals"; // Import the Goals component


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
          role: "student",
          tagline: studentData.profile?.tagline
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
        educationHistory: studentData.educationHistory?.map((edu: any) => ({
          id: edu.id,
          institutionName: edu.institutionName,
          institutionType: edu.institutionType || {
            name: "Educational Institution",
            category: { name: "General" }
          },
          institutionTypeName: edu.institutionTypeName || edu.institutionType?.name || "Educational Institution",
          degreeProgram: edu.degreeProgram,
          fieldOfStudy: edu.fieldOfStudy,
          subjects: edu.subjects || [],
          startDate: edu.startDate,
          endDate: edu.endDate,
          isCurrent: edu.is_current || edu.isCurrent,
          gradeLevel: edu.gradeLevel || edu.grade_level,
          gpa: edu.gpa,
          achievements: edu.achievements || [],
          description: edu.description
        })) || [],
        socialLinks: studentData.profile?.socialLinks || [],
        careerGoals: studentData.profile?.careerGoals || [],
        customBadges: studentData.profile?.customBadges || [],

        // Placeholder data for sections without database tables
        // These sections will show "Coming Soon" or placeholder content
        projects: [],
        achievements: [],
        learningPath: {          currentCourses: [],
          completedCourses: [],
          recommendations: []
        },
        connections: {
          mentors: [],
          peers: [],
          institutions: []
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
          {activeTab === "about" && <AboutSection student={student} currentUser={currentUser} />}
          {activeTab === "skills" && <SkillsCanvas userId={student.id} skills={student.skills} />}
          {activeTab === "projects" && <ProjectsShowcase student={student} />}
          {activeTab === "achievements" && <AchievementTimeline student={student} />}
          {activeTab === "circle" && <CircleView student={student} />}
          {activeTab === "goals" && <Goals student={student} currentUser={currentUser} />}
        </div>
      </div>

      <ActionBar student={student} currentUser={currentUser} />
    </div>
  )
}
const tabs = [
  { id: "about", label: "About" },
  { id: "circle", label: "My Circle" },
  { id: "skills", label: "Skills Canvas" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "goals", label: "Goals" },
]

// HorizontalNavigation component updated to reflect the Goals tab.
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  Target,
} from "lucide-react";

interface HorizontalNavigationProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const HorizontalNavigation: React.FC<HorizontalNavigationProps> = ({
  tabs,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="border-b">
      <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
        <Tabs
          defaultValue={activeTab}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:text-sky-500 data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="about">
            About
          </TabsContent>
          <TabsContent value="circle">
            My Circle
          </TabsContent>
          <TabsContent value="skills">
            Skills Canvas
          </TabsContent>
          <TabsContent value="projects">
            Projects
          </TabsContent>
          <TabsContent value="achievements">
            Achievements
          </TabsContent>
          <TabsContent value="goals">
            <Goals/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HorizontalNavigation;

// Goals component updated to display user's goals and provide an edit button.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface GoalsProps {
  student: any;
  currentUser: any;
}

const Goals: React.FC<GoalsProps> = ({ student, currentUser }) => {
  const router = useRouter();
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    // Extract career goals from student data
    if (student && student.careerGoals) {
      setGoals(student.careerGoals);
    }
  }, [student]);

  const handleEdit = () => {
    // Redirect to the edit profile section
    router.push("/edit-profile"); // Replace with the actual edit profile route
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Goals</h2>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {goals.length > 0 ? (
        <ul className="list-disc pl-5">
          {goals.map((goal, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {goal}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No goals added yet.</p>
      )}
    </div>
  );
};

export default Goals;