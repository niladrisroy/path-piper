
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import InstitutionProfileHeader from "./institution-profile-header"
import AboutInstitutionSection from "./about-institution-section"
import ProgramsSection from "./programs-section"
import EventsSection from "./events-section"
import GallerySection from "./gallery-section"
import FacilitiesSection from "./facilities-section"
import StatsShowcase from "./stats-showcase"

interface InstitutionData {
  id: string
  institutionName: string
  institutionType: string | null
  category: string | null
  website: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  verified: boolean
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
  institutionTypeId: number | null
  profile?: {
    firstName: string
    lastName: string
    bio: string | null
    location: string | null
    profileImageUrl: string | null
    email: string | null
    phone: string | null
  }
}

export default function InstitutionProfile() {
  const { user } = useAuth()
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/institution/profile/${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch institution data')
        }
        const data = await response.json()
        setInstitutionData(data)
      } catch (err) {
        console.error('Error fetching institution data:', err)
        setError('Failed to load institution profile')
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutionData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
      </div>
    )
  }

  if (error || !institutionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'Institution profile data is not available.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <InstitutionProfileHeader institutionData={institutionData} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <AboutInstitutionSection institutionData={institutionData} />
            <ProgramsSection institutionId={institutionData.id} />
            <EventsSection institutionId={institutionData.id} />
            <GallerySection institutionId={institutionData.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StatsShowcase institutionData={institutionData} />
            <FacilitiesSection institutionData={institutionData} />
          </div>
        </div>
      </div>
    </div>
  )
}
