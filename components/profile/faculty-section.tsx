
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ExternalLink, Award, BookOpen, Users, MapPin, Clock, Globe, Linkedin } from "lucide-react"

interface FacultyMember {
  id: string
  name: string
  position: string
  department?: string
  qualifications?: string
  experience?: number
  specialization?: string
  profileImage?: string
  bio?: string
  email?: string
  phone?: string
  website?: string
  linkedin?: string
  researchInterests?: string
  publicationsCount?: number
  yearsAtInstitution?: number
  officeLocation?: string
  officeHours?: string
  isFeatured: boolean
}

export default function FacultySection() {
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/institution/faculty')
      if (response.ok) {
        const data = await response.json()
        setFacultyMembers(data.faculty || [])
      } else {
        setError('Failed to fetch faculty data')
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
      setError('Failed to fetch faculty data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading faculty...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (facultyMembers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Faculty Added</h3>
              <p className="text-gray-500">
                Faculty information has not been added yet. Please check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const featuredFaculty = facultyMembers.filter(member => member.isFeatured)
  const regularFaculty = facultyMembers.filter(member => !member.isFeatured)

  // Calculate faculty stats
  const totalFaculty = facultyMembers.length
  const avgExperience = facultyMembers.filter(f => f.experience).reduce((sum, f) => sum + (f.experience || 0), 0) / facultyMembers.filter(f => f.experience).length || 0
  const totalPublications = facultyMembers.reduce((sum, f) => sum + (f.publicationsCount || 0), 0)
  const departments = [...new Set(facultyMembers.filter(f => f.department).map(f => f.department))].length

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {featuredFaculty.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Featured Faculty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {featuredFaculty.map((faculty) => (
                  <FacultyCard key={faculty.id} faculty={faculty} featured={true} />
                ))}
              </CardContent>
            </Card>
          )}

          {regularFaculty.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Faculty & Staff
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {regularFaculty.map((faculty) => (
                  <FacultyCard key={faculty.id} faculty={faculty} featured={false} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Faculty Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Faculty</span>
                  <span className="font-semibold">{totalFaculty}</span>
                </div>
                {avgExperience > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg. Experience</span>
                    <span className="font-semibold">{Math.round(avgExperience)} years</span>
                  </div>
                )}
                {totalPublications > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Publications</span>
                    <span className="font-semibold">{totalPublications}</span>
                  </div>
                )}
                {departments > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Departments</span>
                    <span className="font-semibold">{departments}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FacultyCard({ faculty, featured }: { faculty: FacultyMember; featured: boolean }) {
  const specializations = faculty.specialization ? faculty.specialization.split(',').map(s => s.trim()) : []

  return (
    <div className={`flex flex-col sm:flex-row gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0 ${featured ? 'bg-blue-50 p-4 rounded-lg' : ''}`}>
      <div className="sm:w-1/4 relative h-40 sm:h-40 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={faculty.profileImage || "/placeholder-user.jpg"}
          alt={faculty.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="sm:w-3/4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold">{faculty.name}</h3>
            <p className="text-gray-600">{faculty.position}</p>
            {faculty.department && (
              <p className="text-gray-500 text-sm">{faculty.department}</p>
            )}
          </div>
          {featured && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        {faculty.qualifications && (
          <p className="text-gray-600 text-sm mb-2">{faculty.qualifications}</p>
        )}

        {faculty.bio && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">{faculty.bio}</p>
        )}

        {specializations.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Areas of Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {specializations.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          {faculty.experience && (
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {faculty.experience} years exp.
            </span>
          )}
          {faculty.officeLocation && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {faculty.officeLocation}
            </span>
          )}
          {faculty.officeHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {faculty.officeHours}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4">
          {faculty.email && (
            <a
              href={`mailto:${faculty.email}`}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </a>
          )}
          {faculty.website && (
            <a
              href={faculty.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
          {faculty.linkedin && (
            <a
              href={faculty.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
