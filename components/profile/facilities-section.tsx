"use client"
import { MapPin, Phone, Mail, Globe } from "lucide-react"

interface InstitutionData {
  id: string
  institutionName: string
  website: string | null
  profile?: {
    location: string | null
    email: string | null
    phone: string | null
  }
}

interface FacilitiesSectionProps {
  institutionData: InstitutionData
}

export default function FacilitiesSection({ institutionData }: FacilitiesSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Contact Information
      </h3>

      <div className="space-y-3">
        {institutionData.profile?.location && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {institutionData.profile.location}
              </p>
            </div>
          </div>
        )}

        {institutionData.profile?.email && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <a 
                href={`mailto:${institutionData.profile.email}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {institutionData.profile.email}
              </a>
            </div>
          </div>
        )}

        {institutionData.profile?.phone && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <a 
                href={`tel:${institutionData.profile.phone}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {institutionData.profile.phone}
              </a>
            </div>
          </div>
        )}

        {institutionData.website && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Globe className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
              <a 
                href={institutionData.website.startsWith('http') ? institutionData.website : `https://${institutionData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {institutionData.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}

        {!institutionData.profile?.location && !institutionData.profile?.email && !institutionData.profile?.phone && !institutionData.website && (
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No contact information available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}