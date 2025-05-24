"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"

import OnboardingHeader from "@/components/onboarding/onboarding-header"
import PersonalInfoStep from "@/components/onboarding/personal-info-step"
import InterestsStep from "@/components/onboarding/interests-step"
import SkillsStep from "@/components/onboarding/skills-step"
import GoalsStep from "@/components/onboarding/goals-step"
import CompletionStep from "@/components/onboarding/completion-step"

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
  const [existingData, setExistingData] = useState(null)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const data = await response.json()

          // If user is already onboarded, redirect to feed
          if (data.user && data.user.onboarding_completed) {
            router.push("/feed")
            return
          }

          // If user has existing profile data, populate the form
          if (data.user && data.user.profile) {
            setExistingData(data.user.profile)
            setUserData({
              firstName: data.user.profile.first_name || "",
              lastName: data.user.profile.last_name || "",
              email: data.user.email || "",
              birthdate: data.user.profile.birthdate || "",
              location: data.user.profile.location || "",
              interests: data.user.profile.interests || [],
              skills: data.user.profile.skills || [],
              skillLevels: data.user.profile.skill_levels || {},
              goals: data.user.profile.goals || [],
              educationLevel: data.user.profile.education_level || "",
              bio: data.user.profile.bio || "",
            })

            // Calculate how far along they are in the process
            calculateCompletionPercentage(data.user.profile)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [router])

  // Calculate completion percentage based on filled fields
  const calculateCompletionPercentage = (profile) => {
    let fieldsCompleted = 0
    let totalFields = 8 // Total number of required fields across all steps

    if (profile.first_name) fieldsCompleted++
    if (profile.last_name) fieldsCompleted++
    if (profile.birthdate) fieldsCompleted++
    if (profile.location) fieldsCompleted++
    if (profile.interests && profile.interests.length > 0) fieldsCompleted++
    if (profile.skills && profile.skills.length > 0) fieldsCompleted++
    if (profile.goals && profile.goals.length > 0) fieldsCompleted++
    if (profile.bio) fieldsCompleted++

    const percentage = Math.round((fieldsCompleted / totalFields) * 100)
    setCompletionPercentage(percentage)

    // Set starting step based on completion
    if (percentage >= 75) setStep(4) // Goals step
    else if (percentage >= 50) setStep(3) // Skills step
    else if (percentage >= 25) setStep(2) // Interests step
    else setStep(1) // Personal info step
  }

  const handleNext = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            birthdate: userData.birthdate,
            location: userData.location,
            interests: userData.interests,
            skills: userData.skills,
            skill_levels: userData.skillLevels,
            goals: userData.goals,
            education_level: userData.educationLevel,
            bio: userData.bio,
            onboarding_completed: true,
          },
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setStep(5) // Move to completion step
      } else {
        const error = await response.json()
        toast.error("Failed to update profile: " + (error.message || "Unknown error"))
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <OnboardingHeader completionPercentage={completionPercentage} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm p-6 md:p-8">
          {step === 1 && (
            <PersonalInfoStep 
              userData={userData} 
              setUserData={setUserData}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <InterestsStep
              userData={userData}
              setUserData={setUserData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <SkillsStep
              userData={userData}
              setUserData={setUserData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 4 && (
            <GoalsStep
              userData={userData}
              setUserData={setUserData}
              onNext={handleSubmit}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 5 && (
            <CompletionStep />
          )}
        </div>
      </div>
    </div>
  )
}