"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpenIcon, CheckCircleIcon, ClockIcon, LockIcon, TrendingUpIcon } from "lucide-react"

// Mock learning path data
const learningPathData = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    description: "Fundamentals of computer science and programming",
    status: "completed",
    progress: 100,
    date: "January 2022",
    skills: ["Programming Basics", "Algorithms", "Data Structures"],
  },
  {
    id: 2,
    title: "Web Development Fundamentals",
    description: "Learn HTML, CSS, and JavaScript basics",
    status: "completed",
    progress: 100,
    date: "March 2022",
    skills: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: 3,
    title: "Advanced JavaScript",
    description: "Deep dive into JavaScript and modern frameworks",
    status: "in-progress",
    progress: 65,
    date: "Current",
    skills: ["ES6+", "React", "Node.js"],
  },
  {
    id: 4,
    title: "Data Science Essentials",
    description: "Introduction to data analysis and visualization",
    status: "in-progress",
    progress: 30,
    date: "Current",
    skills: ["Python", "Data Analysis", "Statistics"],
  },
  {
    id: 5,
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning concepts and applications",
    status: "planned",
    progress: 0,
    date: "Upcoming",
    skills: ["ML Algorithms", "TensorFlow", "Data Modeling"],
  },
]

export default function LearningPath({ student }: { student: any }) {
  // Check if there's any learning path data
  const hasLearningData = student.learningPath && (
    (student.learningPath.currentCourses && student.learningPath.currentCourses.length > 0) ||
    (student.learningPath.completedCourses && student.learningPath.completedCourses.length > 0) ||
    (student.learningPath.recommendations && student.learningPath.recommendations.length > 0)
  )

  if (!hasLearningData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Path</h2>
          <p className="text-gray-600 dark:text-gray-400">Track progress and discover new opportunities</p>
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Learning Path Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">
              This section will showcase learning courses and recommendations. Database tables for learning paths are not yet implemented.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Path</h2>
        <p className="text-gray-600 dark:text-gray-400">Track progress and discover new opportunities</p>
      </div>

      <div className="relative">
        {/* Course detail view */}
        {/*<motion.div
            className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-xl p-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </motion.div>*/}

        <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
          {learningPathData.map((course, index) => {
            const isCompleted = course.status === "completed"
            const isInProgress = course.status === "in-progress"
            const isPlanned = course.status === "planned"

            const dotColor = isCompleted
              ? "bg-green-500"
              : isInProgress
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-600"

            const cardBorder = isCompleted
              ? "border-green-200 dark:border-green-900"
              : isInProgress
                ? "border-blue-200 dark:border-blue-900"
                : "border-gray-200 dark:border-gray-700"

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 relative"
              >
                <div
                  className={`absolute -left-[13px] h-6 w-6 rounded-full border-4 border-white dark:border-gray-800 ${dotColor}`}
                ></div>

                <div
                  className={`bg-white dark:bg-gray-800 border ${cardBorder} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{course.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{course.description}</p>

                  {!isPlanned && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 2).map((skill, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 2 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                          +{course.skills.length - 2}
                        </span>
                      )}
                    </div>
                    <button className="text-xs text-pathpiper-teal hover:underline">View Details</button>
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