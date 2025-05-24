
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { motion } from "framer-motion"

import InternalNavbar from "@/components/internal-navbar"
import PersonalInfoStep from "@/components/onboarding/personal-info-step"
import InterestsStep from "@/components/onboarding/interests-step"
import SkillsStep from "@/components/onboarding/skills-step"
import GoalsStep from "@/components/onboarding/goals-step"
import CompletionStep from "@/components/onboarding/completion-step"
import OnboardingHeader from "@/components/onboarding/onboarding-header"

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    location: "",
    interests: [],
    skills: [],
    skillLevels: {},
    goals: [],
    educationLevel: "",
    bio: "",
  })
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [existingData, setExistingData] = useState(null)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const data = await response.json()
          
          console.log("Fetched user data:", data)
          
          // If user is already onboarded, redirect to feed
          if (data.user && data.user.onboardingCompleted) {
            router.push("/feed")
            return
          }

          // If user has existing profile data, populate the form
          if (data.user && data.user.profile) {
            setExistingData(data.user.profile)
            
            // Populate form with existing data
            setUserData({
              firstName: data.user.profile.firstName || "",
              lastName: data.user.profile.lastName || "",
              email: data.user.email || "",
              birthdate: data.user.profile.birthdate || "",
              location: data.user.profile.location || "",
              interests: data.user.profile.interests || [],
              skills: data.user.profile.skills || [],
              skillLevels: data.user.profile.skillLevels || {},
              goals: data.user.profile.goals || [],
              educationLevel: data.user.profile.educationLevel || "",
              bio: data.user.profile.bio || "",
            })

            // Calculate how far along they are in the process
            calculateCompletionPercentage(data.user.profile)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Calculate completion percentage based on filled fields
  const calculateCompletionPercentage = (profile) => {
    let fieldsCompleted = 0
    let totalFields = 8 // Total number of required fields across all steps
    
    // Check personal info fields
    if (profile.firstName) fieldsCompleted++
    if (profile.lastName) fieldsCompleted++
    if (profile.location) fieldsCompleted++
    if (profile.bio) fieldsCompleted++
    
    // Check other sections
    if (profile.interests && profile.interests.length > 0) fieldsCompleted++
    if (profile.skills && profile.skills.length > 0) fieldsCompleted++
    if (profile.goals && profile.goals.length > 0) fieldsCompleted++
    if (profile.educationLevel) fieldsCompleted++
    
    const percentage = Math.round((fieldsCompleted / totalFields) * 100)
    setCompletionPercentage(percentage)
  }

  // Handle the update of user data from steps
  const handleUpdateUserData = (stepData) => {
    setUserData((prev) => {
      const newData = { ...prev, ...stepData }
      calculateCompletionPercentage(newData)
      return newData
    })
  }

  // Navigate to the next step
  const handleNextStep = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 5))
  }

  // Navigate to the previous step
  const handlePreviousStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1))
  }

  // Submit the onboarding data
  const handleSubmitOnboarding = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        toast.success("Onboarding completed successfully!")
        router.push("/feed")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to complete onboarding")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <OnboardingHeader completionPercentage={completionPercentage} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {isLoading ? (
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
              <p className="text-slate-600">Loading your profile data...</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              {step === 1 && (
                <PersonalInfoStep 
                  data={userData} 
                  updateData={handleUpdateUserData} 
                  onNext={handleNextStep}
                />
              )}
              {step === 2 && (
                <InterestsStep 
                  data={userData} 
                  updateData={handleUpdateUserData} 
                  onNext={handleNextStep}
                  onBack={handlePreviousStep}
                />
              )}
              {step === 3 && (
                <SkillsStep 
                  data={userData} 
                  updateData={handleUpdateUserData}
                  onNext={handleNextStep}
                  onBack={handlePreviousStep}
                />
              )}
              {step === 4 && (
                <GoalsStep 
                  data={userData}
                  updateData={handleUpdateUserData}
                  onNext={handleNextStep}
                  onBack={handlePreviousStep}
                />
              )}
              {step === 5 && (
                <CompletionStep 
                  data={userData}
                  completionPercentage={completionPercentage}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmitOnboarding}
                  onBack={handlePreviousStep}
                />
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${step * 20}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Personal Info</span>
                <span>Interests</span>
                <span>Skills</span>
                <span>Goals</span>
                <span>Complete</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
