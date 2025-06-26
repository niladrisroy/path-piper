
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, User, Calendar, GraduationCap, LogOut, Shield, Eye, Settings } from "lucide-react"

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

  const handleStudentClick = async (studentId: string) => {
    try {
      const response = await fetch(`/api/parent/student/${studentId}/login`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to student profile with parent view mode
        router.push(data.redirectUrl)
      } else {
        setError(data.error || 'Failed to access student profile')
      }
    } catch (error) {
      setError('Network error occurred')
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pathpiper-teal/5 via-white to-pathpiper-purple/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pathpiper-teal border-t-transparent mx-auto mb-4"></div>
          <p className="text-pathpiper-teal font-medium">Loading your children's profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pathpiper-teal/5 via-white to-pathpiper-purple/5">
      {/* Header matching main theme */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <div className="h-10">
                  <Image
                    src="/images/pathpiper-logo-full.png"
                    width={180}
                    height={40}
                    alt="PathPiper Logo"
                    className="h-full w-auto"
                    priority
                  />
                </div>
              </Link>
              <div className="hidden md:block h-8 w-px bg-gray-200"></div>
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pathpiper-teal to-pathpiper-blue rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pathpiper-teal to-pathpiper-purple bg-clip-text text-transparent">
                    Parent Portal
                  </h1>
                  <p className="text-sm text-gray-600">{parentEmail}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-pathpiper-teal/20 text-pathpiper-teal hover:bg-pathpiper-teal/5 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile header for small screens */}
      <div className="md:hidden bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pathpiper-teal to-pathpiper-blue rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold bg-gradient-to-r from-pathpiper-teal to-pathpiper-purple bg-clip-text text-transparent">
              Parent Portal
            </h1>
            <p className="text-xs text-gray-600">{parentEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Children</h2>
          <p className="text-gray-600 text-lg">
            Click on any profile to view and manage their account safely
          </p>
        </div>

        {students.length === 0 ? (
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent>
              <div className="w-20 h-20 bg-gradient-to-br from-pathpiper-teal/20 to-pathpiper-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-pathpiper-teal" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Students Found</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                No student profiles are currently linked to your parent account. 
                Students under 16 will appear here after registration and verification.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card 
                key={student.id} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden"
                onClick={() => handleStudentClick(student.id)}
              >
                <CardHeader className="text-center pb-4 bg-gradient-to-br from-pathpiper-teal/5 to-pathpiper-blue/5">
                  <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-white shadow-lg">
                    <AvatarImage src={student.profileImageUrl} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-pathpiper-teal to-pathpiper-blue text-white font-semibold">
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {student.firstName} {student.lastName}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-gray-600">
                    {student.bio || 'No bio available yet'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-pathpiper-teal/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-pathpiper-teal" />
                    </div>
                    <span className="font-medium">
                      {getAgeGroupDisplay(student.age_group)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-pathpiper-blue/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-pathpiper-blue" />
                    </div>
                    <span className="font-medium">
                      {getEducationLevelDisplay(student.educationLevel)}
                    </span>
                  </div>

                  <div className="pt-4">
                    <Badge 
                      className="w-full justify-center py-2 bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue text-white hover:from-pathpiper-teal/90 hover:to-pathpiper-blue/90 transition-all duration-300 group-hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View & Manage Profile
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Safety Information Card */}
        <Card className="mt-12 bg-gradient-to-r from-pathpiper-teal/10 to-pathpiper-blue/10 border-0 rounded-2xl">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pathpiper-teal to-pathpiper-blue rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Child's Safety & Privacy</h3>
                <p className="text-gray-600 leading-relaxed">
                  As a parent, you have full access to monitor and manage your child's PathPiper experience. 
                  All activities are age-appropriate, and you can review their connections, learning progress, 
                  and profile information at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer matching main theme */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} PathPiper. All rights reserved. • Safe • Educational • Parent-Controlled
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
