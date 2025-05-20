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

export default function LearningPath() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Learning Path</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Planned</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {selectedCourse !== null && (
          <motion.div
            className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-xl p-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>

            {/* Course detail view */}
            {(() => {
              const course = learningPathData.find((c) => c.id === selectedCourse)
              if (!course) return null

              const statusColors = {
                completed: "text-green-500",
                "in-progress": "text-blue-500",
                planned: "text-gray-500",
              }

              const statusIcons = {
                completed: CheckCircleIcon,
                "in-progress": ClockIcon,
                planned: LockIcon,
              }

              const StatusIcon = statusIcons[course.status as keyof typeof statusIcons]

              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-full bg-opacity-20 ${statusColors[course.status as keyof typeof statusColors]} bg-current`}
                    >
                      <StatusIcon className={`h-6 w-6 ${statusColors[course.status as keyof typeof statusColors]}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{course.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {course.status === "completed"
                          ? "Completed"
                          : course.status === "in-progress"
                            ? "In Progress"
                            : "Planned"}{" "}
                        • {course.date}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">{course.description}</p>

                  {course.status !== "planned" && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            course.status === "completed" ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Skills Gained</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-pathpiper-teal bg-opacity-10 text-pathpiper-teal rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Resources</h4>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-pathpiper-teal" />
                          <span>Interactive Course Materials</span>
                        </li>
                        <li className="text-sm flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-pathpiper-teal" />
                          <span>Video Tutorials</span>
                        </li>
                        <li className="text-sm flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-pathpiper-teal" />
                          <span>Practice Exercises</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {course.status === "completed" && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUpIcon className="h-4 w-4 text-green-500" />
                        Performance
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">A+</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Final Grade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pathpiper-teal">95%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Quiz Average</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">12</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Projects Completed</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>
        )}

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
                  onClick={() => setSelectedCourse(course.id)}
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
