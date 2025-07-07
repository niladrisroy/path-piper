"use client"

import { motion } from "framer-motion"
import { BookOpenIcon, CalendarIcon, AwardIcon, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConnectedInstitutions from "./connected-institutions"; // Import the new component
import { useState } from "react";

interface EducationCardsProps {
  educationHistory?: any[]
  isViewMode?: boolean
}

export default function EducationCards({ educationHistory: realEducationHistory, isViewMode = false }: EducationCardsProps) {
  // Use real education data only - no fallback to mock data
  const educationHistory = realEducationHistory && realEducationHistory.length > 0 ? 
    realEducationHistory.map((edu: any) => ({
      school: edu.institutionName,
      type: edu.institutionTypeName || "Institution",
      grade: edu.gradeLevel || edu.grade || "Student", 
      period: `${new Date(edu.startDate).getFullYear()} - ${edu.isCurrent ? 'Present' : new Date(edu.endDate || Date.now()).getFullYear()}`,
      gpa: edu.gpa && edu.gpa.trim() ? `GPA: ${edu.gpa}` : null,
      subjects: edu.subjects || [],
      achievements: edu.achievements || [],
    })) : []

    const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <BookOpenIcon className="h-5 w-5 mr-2 text-pathpiper-teal" />
          Education
        </h3>
        {!isViewMode && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/student/profile/edit?section=education'}
          >
            <AwardIcon className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        {educationHistory.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Education History</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No education history has been added yet.
            </p>
          </div>
        ) : (
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{education.type}</p>
                    </div>
                    <span className="px-2 py-1 bg-pathpiper-teal/10 text-pathpiper-teal text-xs rounded-full">
                      {education.grade}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {education.period}
                    {education.gpa && (
                      <>
                        <span className="mx-2">•</span>
                        {education.gpa}
                      </>
                    )}
                  </div>

                  {education.subjects && education.subjects.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Subjects</h5>
                      <div className="flex flex-wrap gap-1">
                        {education.subjects.map((subject, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.achievements && education.achievements.length > 0 && (
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
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Institutions Section */}
        {!isViewMode && (
          <div className="mt-8" key={refreshKey}>
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-pathpiper-teal" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connected Institutions
              </h3>
            </div>
            <ConnectedInstitutions />
          </div>
        )}
      </div>
    </div>
  )
}