
"use client"
import { Building, Award, Calendar, Globe } from "lucide-react"

interface InstitutionData {
  id: string
  institutionName: string
  institutionType: string | null
  category: string | null
  website: string | null
  verified: boolean
  onboardingCompleted: boolean
  createdAt: string
}

interface StatsShowcaseProps {
  institutionData: InstitutionData
}

export default function StatsShowcase({ institutionData }: StatsShowcaseProps) {
  const memberSince = new Date(institutionData.createdAt).getFullYear()
  const profileCompletion = institutionData.onboardingCompleted ? 100 : 50

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Institution Overview
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Verification Status</span>
          </div>
          <span className={`text-sm font-medium ${
            institutionData.verified 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {institutionData.verified ? 'Verified' : 'Pending'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Member Since</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {memberSince}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Institution Type</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {institutionData.institutionType || 'Education'}
          </span>
        </div>

        {institutionData.website && (
          <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-teal-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Website</span>
            </div>
            <a 
              href={institutionData.website.startsWith('http') ? institutionData.website : `https://${institutionData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
            >
              Visit
            </a>
          </div>
        )}

        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Profile Completion</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
