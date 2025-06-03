"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { GlobeIcon, BrainIcon, EditIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import EducationCards from "./education-cards"

export default function AboutSection({ student: studentProp }) {
  const [isEditing, setIsEditing] = useState(false)

  // Use passed student data or fallback to mock data
  const student = studentProp || {
    bio: "I'm a high school student passionate about technology, mathematics, and science. I love solving complex problems and building projects that make a positive impact. Currently exploring machine learning and web development.",
    location: "San Francisco, CA",
    interests: ["Artificial Intelligence", "Web Development", "Mathematics", "Physics", "Chess", "Photography"],
    socialLinks: {
      github: "#",
      linkedin: "#",
      portfolio: "#",
    },
    moodBoard: [
      "/multiple-monitor-coding.png",
      "/placeholder.svg?key=3nxmd",
      "/placeholder.svg?key=yf3oe",
      "/majestic-mountain-vista.png",
      "/robotics-competition.png",
      "/placeholder.svg?key=ghok1",
    ],
  }

  // Mock circle members (would come from API in real app)
  const circleMembers = [
    { id: 1, name: "Emma W.", image: "/diverse-students-studying.png", type: "student" },
    { id: 2, name: "Noah T.", image: "/placeholder.svg?key=hwap2", type: "student" },
    { id: 3, name: "Ms. Chen", image: "/diverse-classroom-teacher.png", type: "mentor" },
    { id: 4, name: "Olivia R.", image: "/placeholder.svg?key=oez43", type: "student" },
    { id: 5, name: "Riverdale High", image: "/university-classroom.png", type: "institution" },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">About Me</h2>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsEditing(false)}>
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold mb-3">Bio</h3>
            {!isEditing ? (
              <p className="text-gray-700 dark:text-gray-300">{student.bio}</p>
            ) : (
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                rows={4}
                defaultValue={student.bio}
              />
            )}

            <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-400">
              <GlobeIcon className="h-4 w-4" />
              {!isEditing ? (
                <span>{student.location}</span>
              ) : (
                <input
                  type="text"
                  className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  defaultValue={student.location}
                />
              )}
            </div>
          </motion.div>

          {/* Education Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <EducationCards />
          </motion.div>

          {/* Circle Friends - Mini avatars in About section */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-500" />
                Circle Friends
              </h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-pink-500 hover:text-pink-600 p-0">
                View All
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {circleMembers.map((member) => (
                <div key={member.id} className="flex flex-col items-center">
                  <div
                    className={`h-12 w-12 rounded-full overflow-hidden mb-1 ${
                      member.type === "mentor"
                        ? "ring-2 ring-yellow-400"
                        : member.type === "institution"
                          ? "ring-2 ring-blue-400 ring-dashed"
                          : "ring-2 ring-white dark:ring-gray-800"
                    }`}
                  >
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{member.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Badges */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1v4M18 8l2.5-2.5M19 14h4M16 18l2.5 2.5M12 19v4M8 18l-2.5 2.5M5 14H1M8 8L5.5 5.5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <h3 className="font-semibold">Badges</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-amber-500 hover:text-amber-600 p-0">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Academic Excellence Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Academic Excellence</span>
              </div>

              {/* Coding Ninja Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Coding Ninja</span>
              </div>

              {/* Team Player Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Team Player</span>
              </div>

              {/* Creative Thinker Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-pink-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12h1M7 12h1M12 2v1M12 7v1M12 12h1M17 12h1M22 12h1M12 17v1M12 22v1" />
                    <path d="M4.93 4.93l.7.7M12 12l-1.41-1.41" />
                    <path d="M19.07 4.93l-.7.7M15.5 8.5l.7.7" />
                    <path d="M4.93 19.07l.7-.7M12 12l-1.41 1.41" />
                    <path d="M19.07 19.07l-.7-.7M15.5 15.5l.7-.7" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Creative Thinker</span>
              </div>

              {/* Science Whiz Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-teal-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2 2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Science Whiz</span>
              </div>

              {/* Early Bird Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-orange-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Early Bird</span>
              </div>
            </div>
          </motion.div>

          {/* Mood Board */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BrainIcon className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Mood Board</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {student.moodBoard.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden relative">
                  <Image src={image || "/placeholder.svg"} alt="Mood board image" fill className="object-cover" />
                </div>
              ))}

              {isEditing && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}