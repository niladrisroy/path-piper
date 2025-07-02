"use client"
import { Building, Calendar, Award, Users } from "lucide-react"

interface InstitutionData {
  id: string
  institutionName: string
  institutionType: string | null
  category: string | null
  website: string | null
  verified: boolean
  createdAt: string
  profile?: {
    bio: string | null
    location: string | null
  }
}

interface AboutInstitutionSectionProps {
  institutionData: InstitutionData
}

export default function AboutInstitutionSection({ institutionData }: AboutInstitutionSectionProps) {
  const bio = institutionData.profile?.bio
  const joinedDate = new Date(institutionData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        About {institutionData.institutionName}
      </h2>

      {bio ? (
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {bio}
        </p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mb-6 italic">
          No description available. Contact the institution for more information.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Building className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Institution Type</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {institutionData.institutionType || 'Not specified'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Award className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {institutionData.category || 'Education'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Calendar className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Joined PathPiper</p>
            <p className="font-medium text-gray-900 dark:text-white">{joinedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Users className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Verification Status</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {institutionData.verified ? 'Verified Institution' : 'Pending Verification'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}