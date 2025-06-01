"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, MapPin, Award, Plus, Edit, Trash2 } from "lucide-react"
import { getStudentProfile } from "@/lib/db/student"

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

interface EducationHistory {
  id: string
  institutionName: string
  institutionType?: {
    name: string
    category: {
      name: string
    }
  }
  degreeProgram?: string
  fieldOfStudy?: string
  startDate?: Date
  endDate?: Date
  isCurrent: boolean
  gradeLevel?: string
  gpa?: string
  achievements?: string
  description?: string
}

export default function AboutSection({ userData }: { userData: UserData }) {
  const [educationHistory, setEducationHistory] = useState<EducationHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData.role === 'student') {
      fetchEducationHistory()
    }
  }, [userData])

  const fetchEducationHistory = async () => {
    try {
      setLoading(true)
      const studentProfile = await getStudentProfile(userData.id)
      if (studentProfile?.educationHistory) {
        setEducationHistory(studentProfile.educationHistory)
      }
    } catch (error) {
      console.error('Error fetching education history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Present'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="p-8 space-y-8">
      {/* Personal Information */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Full Name</h3>
                <p className="text-gray-600 dark:text-gray-300">{userData.firstName} {userData.lastName}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">{userData.email}</p>
              </div>

              {userData.location && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h3>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {userData.location}
                  </p>
                </div>
              )}

              {userData.student?.educationLevel && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Education Level</h3>
                  <Badge variant="secondary" className="capitalize">
                    {userData.student.educationLevel.replace('_', ' ')}
                  </Badge>
                </div>
              )}

              {userData.student?.age_group && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Age Group</h3>
                  <Badge variant="outline" className="capitalize">
                    {userData.student.age_group.replace('_', ' ')}
                  </Badge>
                </div>
              )}

              {userData.student?.birthMonth && userData.student?.birthYear && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Birth Date</h3>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {userData.student.birthMonth} {userData.student.birthYear}
                  </p>
                </div>
              )}
            </div>

            {userData.bio && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{userData.bio}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Education History - Only for students */}
      {userData.role === 'student' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Education History</h2>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 dark:text-gray-300">Loading education history...</p>
              </CardContent>
            </Card>
          ) : educationHistory.length > 0 ? (
            <div className="space-y-4">
              {educationHistory.map((education, index) => (
                <Card key={education.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {education.institutionName}
                          </h3>
                          {education.isCurrent && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 ml-8">
                          {education.institutionType && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {education.institutionType.category.name}
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {education.institutionType.name}
                              </span>
                            </div>
                          )}

                          {(education.degreeProgram || education.fieldOfStudy) && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {education.degreeProgram && education.fieldOfStudy 
                                ? `${education.degreeProgram} in ${education.fieldOfStudy}`
                                : education.degreeProgram || education.fieldOfStudy
                              }
                            </p>
                          )}

                          {education.gradeLevel && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Grade Level: {education.gradeLevel}
                            </p>
                          )}

                          {education.gpa && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              GPA: {education.gpa}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(education.startDate)} - {formatDate(education.endDate)}
                            </span>
                          </div>

                          {education.achievements && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                Achievements
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {education.achievements}
                              </p>
                            </div>
                          )}

                          {education.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {education.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No education history yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Add your educational background to help others understand your journey.
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Education Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  )
}