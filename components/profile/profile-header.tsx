"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Award, Star, MessageCircle, Heart, Share2, MoreHorizontal, Edit, BadgeCheck, FolderKanban, BrainIcon, UserPlus } from "lucide-react"

interface ProfileHeaderProps {
  student: any
  currentUser?: any
}

export default function ProfileHeader({ student, currentUser }: ProfileHeaderProps) {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)

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
  const tagline = studentProp.profile?.tagline || "Aspiring Software Engineer | Math & Computer Science Enthusiast"
  
  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === studentProp.id

  // Mock circle members (would come from API in real app)
  const circleMembers = [
    { id: 1, name: "Emma W.", image: "/diverse-students-studying.png", type: "student" },
    { id: 2, name: "Noah T.", image: "/placeholder.svg?key=hwap2", type: "student" },
    { id: 3, name: "Olivia R.", image: "/placeholder.svg?key=oez43", type: "student" },
    { id: 4, name: "Ms. Chen", image: "/diverse-classroom-teacher.png", type: "mentor" },
    { id: 5, name: "Riverdale High", image: "/university-classroom.png", type: "institution" },
  ]

  // Add this style to the head of the component, right after the imports
  const scrollbarHideStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Custom tooltip styles */
  [data-tooltip] {
    position: relative;
    cursor: pointer;
  }

  [data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
    margin-bottom: 4px;
  }
`

  return (
    <>
      <style jsx>{scrollbarHideStyle}</style>
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
                      <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base truncate">
                        {tagline}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {gradeLevel} • {schoolName}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats - Horizontal display with icons and pastel backgrounds */}
                  <div className="flex flex-wrap gap-3 text-xs font-medium mt-4">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-600 dark:text-pink-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-pink-500" data-tooltip="Total connections in your circle" />
                      <span data-tooltip="Total connections in your circle">48 in My Circle</span>
                      <div className="ml-1.5 flex items-center gap-1 border-l border-pink-200 dark:border-pink-800/30 pl-1.5">
                        <div className="flex items-center" data-tooltip="36 Friends in your circle">
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
                            data-tooltip="Friends"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <span className="text-[10px] ml-0.5" data-tooltip="36 Friends in your circle">
                            36
                          </span>
                        </div>
                        <div className="flex items-center" data-tooltip="8 Mentors guiding you">
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
                          <span className="text-[10px] ml-0.5" data-tooltip="8 Mentors guiding you">
                            8
                          </span>
                        </div>
                        <div className="flex items-center" data-tooltip="4 Institutions connected with you">
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
                          <span className="text-[10px] ml-0.5" data-tooltip="4 Institutions connected with you">
                            4
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                      <FolderKanban
                        className="h-3.5 w-3.5 text-blue-500"
                        data-tooltip="Projects you've created or contributed to"
                      />
                      <span data-tooltip="Projects you've created or contributed to">
                        Projects: 12
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-600 dark:text-amber-300 px-3 py-1.5 rounded-full">
                      <Award className="h-3.5 w-3.5 text-amber-500" data-tooltip="Badges you've earned" />
                      <span data-tooltip="Badges you've earned">Badges: 15</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 text-teal-600 dark:text-teal-300 px-3 py-1.5 rounded-full">
                      <BrainIcon className="h-3.5 w-3.5 text-teal-500" data-tooltip="Skills you've developed" />
                      <span data-tooltip="Skills you've developed">Skills: 24</span>
                    </div>
                  </div>

                  {/* Circle preview - Instagram-style story highlights with horizontal scroll */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">My Circles</h3>
                    </div>

                    <div className="relative">
                      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-4">
                        {/* Friend Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                  <Users className="h-6 w-6 text-pink-500 dark:text-pink-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Friends
                          </span>
                        </div>

                        {/* Study Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-blue-500 dark:text-blue-400"
                                  >
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Study
                          </span>
                        </div>

                        {/* Gaming Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-green-500 dark:text-green-400"
                                  >
                                    <path d="M6 11h4a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"></path>
                                    <path d="M17 11h4a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"></path>
                                    <path d="M6 20h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"></path>
                                    <path d="M17 20h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Gaming
                          </span>
                        </div>

                        {/* Trekking Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-amber-500 dark:text-amber-400"
                                  >
                                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Trekking
                          </span>
                        </div>

                        {/* Social Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-purple-500 dark:text-purple-400"
                                  >
                                    <path d="M17 6.1H3"></path>
                                    <path d="M21 12.1H3"></path>
                                    <path d="M15.1 18H3"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Social
                          </span>
                        </div>

                        {/* Coaching Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-teal-500 dark:text-teal-400"
                                  >
                                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Coaching
                          </span>
                        </div>

                        {/* Basketball Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-400 to-rose-500 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-red-500 dark:text-red-400"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M4.93 4.93 19.07 19.07"></path>
                                    <path d="M14.83 9.17 9.17 14.83"></path>
                                    <path d="M14.83 14.83 9.17 9.17"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Basketball
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Profile highlights */}
                <div className="md:col-span-2 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                  {/* Top Skills section */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs">
                        Physics
                      </div>
                      <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs">
                        Coding
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs">
                        Debate
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-xs">
                        Mathematics
                      </div>
                      <div className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs">
                        Chess
                      </div>
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
                            viewBox="0 0 24 24"
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
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 h-12 w-12 rounded-full flex items-center justify-center">
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
                            className="h-6 w-6 text-purple-600 dark:text-purple-400"
                          >
                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                          </svg>
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400">
                          Coding Pro
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 h-12 w-12 rounded-full flex items-center justify-center">
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
                            className="h-6 w-6 text-amber-600 dark:text-amber-400"
                          >
                            <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2Z"></path>
                          </svg>
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400">
                          Top Achiever
                        </span>
                                            </div>
                    </div>
                    <div className="mt-2 text-center">
                      <a
                        href="#"
                        className="text-[10px] text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 fontmedium"
                      >
                        View All Badges
                      </a>
                    </div>
                  </div>

                  <div className="mt-6">
                  {/* Add/Edit Profile button */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {isOwnProfile ? (
                      <Button 
                        size="lg" 
                        className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                        onClick={() => router.push('/student/profile/edit')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button size="lg" className="bg-pathpiper-teal hover:bg-pathpiper-teal/90">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="lg">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}