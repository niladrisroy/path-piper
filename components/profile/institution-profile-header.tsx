"use client"
import Image from "next/image"
import { BadgeCheckIcon, Award, Users, BookOpen, Building, MapPin, Globe } from "lucide-react"

interface InstitutionData {
  id: string
  institutionName: string
  institutionType: string | null
  category: string | null
  website: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  verified: boolean
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

interface InstitutionProfileHeaderProps {
  institutionData: InstitutionData
}

export default function InstitutionProfileHeader({ institutionData }: InstitutionProfileHeaderProps) {
  const displayName = institutionData.institutionName
  const tagline = institutionData.profile?.bio || "Empowering students to reach their potential"
  const location = institutionData.profile?.location || "Location not specified"
  const website = institutionData.website
  const profileImage = institutionData.logoUrl || institutionData.profile?.profileImageUrl || "/placeholder-logo.png"
  const coverImage = institutionData.coverImageUrl || "/university-classroom.png"
  const verified = institutionData.verified
  const institutionType = institutionData.institutionType || "Educational Institution"
  const category = institutionData.category || "Education"

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 sm:h-80 lg:h-96 overflow-hidden">
        <Image
          src={coverImage}
          alt={`${displayName} cover`}
          className="w-full h-full object-cover"
          width={1200}
          height={400}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 sm:-mt-20 lg:-mt-24">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white">
              <Image
                src={profileImage}
                alt={displayName}
                className="w-full h-full object-cover"
                width={160}
                height={160}
              />
            </div>
            {verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <BadgeCheckIcon className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Institution Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {displayName}
                  </h1>
                  {verified && (
                    <BadgeCheckIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                  )}
                </div>
                <p className="text-gray-200 text-sm sm:text-base mb-3 max-w-2xl">
                  {tagline}
                </p>

                {/* Institution Details */}
                <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    <span>{institutionType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{category}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs">Educational Institution</span>
                </div>
                {verified && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-300 px-3 py-1.5 rounded-full">
                    <BadgeCheckIcon className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}