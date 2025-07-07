"use client"

import { motion } from "framer-motion"
import { BookOpenIcon, CalendarIcon, AwardIcon, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConnectedInstitutions from "./connected-institutions"; // Import the new component
import { useState } from "react";

export default function EducationCards({
  educationHistory,
  isOwnProfile,
  onAddEducation,
  onEditEducation,
  onDeleteEducation,
}: {
  educationHistory: any[]
  isOwnProfile: boolean
  onAddEducation: () => void
  onEditEducation: (education: any) => void
  onDeleteEducation: (id: string) => void
}) {
  const [showConnectedInstitutions, setShowConnectedInstitutions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2 text-pathpiper-teal" />
            Education History
          </h3>
          {isOwnProfile && (
            <motion.button
              onClick={onAddEducation}
              className="bg-pathpiper-teal text-white px-4 py-2 rounded-md hover:bg-pathpiper-teal/90 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Education
            </motion.button>
          )}
        </div>
      </div>

      <div className="p-6">
        {educationHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No education history added yet.</p>
            {isOwnProfile && (
              <p className="text-sm mt-2">
                Add your educational background to showcase your learning journey.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {educationHistory.map((education) => (
              <motion.div
                key={education.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-pathpiper-teal/30 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {education.institutionName}
                    </h4>
                    {education.degree && (
                      <p className="text-gray-700 mb-1">{education.degree}</p>
                    )}
                    {education.fieldOfStudy && (
                      <p className="text-gray-600 mb-2">{education.fieldOfStudy}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(education.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                        {' - '}
                        {education.current 
                          ? 'Present' 
                          : education.endDate 
                            ? new Date(education.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'Present'
                        }
                      </span>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => onEditEducation(education)}
                        variant="ghost"
                        size="sm"
                        className="text-pathpiper-teal hover:text-pathpiper-teal/80"
                      >
                        <AwardIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteEducation(education.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <AwardIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <ConnectedInstitutions />
      </div>
    </div>
  )
}