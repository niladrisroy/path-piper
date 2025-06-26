
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, User, Calendar, GraduationCap, LogOut } from "lucide-react"

interface StudentProfile {
  id: string
  firstName: string
  lastName: string
  profileImageUrl?: string
  bio?: string
  age_group?: string
  educationLevel?: string
  createdAt: string
}

export default function ParentDashboard() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/parent/students')
      const data = await response.json()

      if (data.success) {
        setStudents(data.students)
        setParentEmail(data.parentEmail)
      } else {
        setError(data.error || 'Failed to load students')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentClick = (studentId: string) => {
    router.push(`/parent/student/${studentId}`)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/parent/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getAgeGroupDisplay = (ageGroup?: string) => {
    const ageGroupMap: Record<string, string> = {
      early_childhood: 'Early Childhood',
      elementary: 'Elementary',
      middle_school: 'Middle School',
      high_school: 'High School',
      young_adult: 'Young Adult'
    }
    return ageGroup ? ageGroupMap[ageGroup] || ageGroup : 'Not specified'
  }

  const getEducationLevelDisplay = (level?: string) => {
    const levelMap: Record<string, string> = {
      pre_school: 'Pre School',
      school: 'School',
      high_school: 'High School',
      undergraduate: 'Undergraduate',
      graduate: 'Graduate',
      post_graduate: 'Post Graduate',
      phd: 'PhD'
    }
    return level ? levelMap[level] || level : 'Not specified'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your children's profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
              <p className="text-sm text-gray-600">{parentEmail}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Children</h2>
          <p className="text-gray-600">
            Click on any profile to view and manage their account
          </p>
        </div>

        {students.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">
                No student profiles are currently linked to your account.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card 
                key={student.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleStudentClick(student.id)}
              >
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={student.profileImageUrl} />
                    <AvatarFallback className="text-lg bg-indigo-100 text-indigo-600">
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">
                    {student.firstName} {student.lastName}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {student.bio || 'No bio available'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {getAgeGroupDisplay(student.age_group)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {getEducationLevelDisplay(student.educationLevel)}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Badge variant="secondary" className="w-full justify-center">
                      View & Manage Profile
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
