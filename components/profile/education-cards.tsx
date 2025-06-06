"use client"

import { motion } from "framer-motion"
import { BookOpenIcon, CalendarIcon, AwardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EducationCards() {
  // Mock education data - ordered with most recent first
  const educationHistory = [
    {
      school: "Westlake High School",
      type: "High School",
      grade: "11th Grade",
      period: "2022 - Present",
      gpa: "4.0",
      subjects: ["AP Computer Science", "AP Calculus", "AP Physics"],
      achievements: ["Honor Roll", "Science Fair Winner", "Math Olympiad Finalist"],
    },
    {
      school: "Oakridge Middle School",
      type: "Middle School",
      grade: "8th Grade",
      period: "2019 - 2022",
      gpa: "3.9",
      subjects: ["Advanced Mathematics", "Introduction to Programming", "Science"],
      achievements: ["Perfect Attendance", "Student of the Year", "Coding Club President"],
    },
    {
      school: "Pinecrest Elementary",
      type: "Elementary School",
      grade: "5th Grade",
      period: "2014 - 2019",
      gpa: "4.0",
      subjects: ["Mathematics", "Science", "English"],
      achievements: ["Spelling Bee Winner", "Math Challenge Champion"],
    },
  ]

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <BookOpenIcon className="h-5 w-5 mr-2 text-pathpiper-teal" />
          Education
        </h3>
        <Button variant="outline" size="sm">
          <AwardIcon className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="overflow-x-auto hide-scrollbar pb-4">
          <div className="flex space-x-4" style={{ minWidth: "min-content" }}>
            {educationHistory.map((education, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
                style={{ width: "320px" }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{education.school}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{education.institutionType?.name || education.type}</p>
                  </div>
                  <span className="px-2 py-1 bg-pathpiper-teal/10 text-pathpiper-teal text-xs rounded-full">
                    {education.grade}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {education.period}
                  <span className="mx-2">•</span>
                  GPA: {education.gpa}
                </div>

                <div className="mb-3">
                  <h5 className="text-sm font-medium mb-1">Current Subjects</h5>
                  <div className="flex flex-wrap gap-1">
                    {education.subjects.map((subject, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-1">Achievements</h5>
                  <ul className="space-y-1">
                    {education.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
