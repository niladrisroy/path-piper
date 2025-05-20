"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrophyIcon, AwardIcon, BadgeIcon as CertificateIcon, MedalIcon, StarIcon } from "lucide-react"

// Mock achievements data
const achievementsData = [
  {
    id: 1,
    title: "First Place - Regional Science Fair",
    date: "May 2023",
    description: "Won first place for the project 'Machine Learning Applications in Climate Prediction'",
    category: "competition",
    icon: TrophyIcon,
    color: "text-yellow-500",
  },
  {
    id: 2,
    title: "Advanced Python Certification",
    date: "March 2023",
    description: "Completed advanced Python programming certification with distinction",
    category: "certification",
    icon: CertificateIcon,
    color: "text-blue-500",
  },
  {
    id: 3,
    title: "Student of the Month",
    date: "February 2023",
    description: "Recognized for outstanding academic performance and leadership",
    category: "award",
    icon: AwardIcon,
    color: "text-purple-500",
  },
  {
    id: 4,
    title: "Math Olympiad Finalist",
    date: "December 2022",
    description: "Selected as one of the top 10 finalists in the National Math Olympiad",
    category: "competition",
    icon: MedalIcon,
    color: "text-green-500",
  },
  {
    id: 5,
    title: "Perfect Attendance",
    date: "November 2022",
    description: "Maintained perfect attendance for the entire semester",
    category: "recognition",
    icon: StarIcon,
    color: "text-red-500",
  },
]

export default function AchievementTimeline() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Achievement Timeline</h2>

      <div className="relative">
        {selectedAchievement !== null && (
          <motion.div
            className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>

            {/* Achievement detail view */}
            {(() => {
              const achievement = achievementsData.find((a) => a.id === selectedAchievement)
              if (!achievement) return null

              const Icon = achievement.icon

              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-full ${achievement.color} bg-opacity-20`}>
                      <Icon className={`h-6 w-6 ${achievement.color}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{achievement.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{achievement.date}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">{achievement.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Skills Demonstrated</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs">
                          Problem Solving
                        </span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                          Critical Thinking
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded text-xs">
                          Data Analysis
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Verified By</h4>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                        <div>
                          <p className="font-medium">Dr. Sarah Johnson</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Science Department Head</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold mb-3">Supporting Evidence</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}

        <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
          {achievementsData.map((achievement, index) => {
            const Icon = achievement.icon

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 relative"
              >
                <div
                  className={`absolute -left-[41px] p-2 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700`}
                >
                  <Icon className={`h-5 w-5 ${achievement.color}`} />
                </div>

                <div
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAchievement(achievement.id)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{achievement.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{achievement.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{achievement.description}</p>

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                    </span>
                    <button className="text-sm text-pathpiper-teal hover:underline">View Details</button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
