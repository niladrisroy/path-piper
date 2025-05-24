
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

import InternalNavbar from "@/components/internal-navbar"
import PersonalInfoStep from "@/components/onboarding/personal-info-step"
import InterestsStep from "@/components/onboarding/interests-step"
import SkillsStep from "@/components/onboarding/skills-step"
import GoalsStep from "@/components/onboarding/goals-step"
import CompletionStep from "@/components/onboarding/completion-step"
import { User, BookOpen, Code, Target, CheckCircle } from "lucide-react"

// Define the steps for the student onboarding process
const STEPS = [
  { id: "personal-info", title: "Personal Info", icon: <User className="h-5 w-5" /> },
  { id: "interests", title: "Interests", icon: <BookOpen className="h-5 w-5" /> },
  { id: "skills", title: "Skills", icon: <Code className="h-5 w-5" /> },
  { id: "goals", title: "Goals", icon: <Target className="h-5 w-5" /> },
  { id: "completion", title: "Complete", icon: <CheckCircle className="h-5 w-5" /> },
]

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
        // Get user data from sessionStorage first
        let sessionData = null;
        try {
          const storedUser = sessionStorage.getItem('user');
          if (storedUser) {
            sessionData = JSON.parse(storedUser);
            console.log("User data from session storage:", sessionData);
          }
        } catch (err) {
          console.warn("Error accessing session storage:", err);
        }

        // Get auth token from localStorage
        let token = null;
        try {
          const supabase = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
          token = supabase?.currentSession?.access_token;
          console.log("Found authentication token:", token ? "Yes" : "No");
        } catch (err) {
          console.warn("Error accessing localStorage for token:", err);
        }

        const response = await fetch("/api/auth/user", {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (response.ok) {
          const data = await response.json()
          console.log("User data from API (detailed):", JSON.stringify(data, null, 2));

          // If user is already onboarded, redirect to feed
          if (data.user && data.user.onboardingCompleted) {
            router.push("/feed")
            return
          }

          // If user has existing profile data, populate the form
          if (data.user) {
            // Set basic user data from main profile
            const initialUserData = {
              firstName: data.user.firstName || sessionData?.name?.split(' ')[0] || "",
              lastName: data.user.lastName || (sessionData?.name?.split(' ').slice(1).join(' ') || ""),
              email: data.user.email || sessionData?.email || "",
              birthdate: "",
              location: data.user.location || "",
              interests: [],
              skills: [],
              skillLevels: {},
              goals: [],
              educationLevel: data.user.educationLevel || "",
              bio: data.user.bio || "",
              ageGroup: data.user.ageGroup || "young-adult",
            };
            
            console.log("Setting initial user data:", initialUserData);
            setUserData(initialUserData);

            // If there's more detailed profile data, use it
            if (data.user.profile) {
              setExistingData(data.user.profile);
              
              const updatedUserData = {
                ...initialUserData,
                firstName: data.user.profile.first_name || data.user.firstName || sessionData?.name?.split(' ')[0] || "",
                lastName: data.user.profile.last_name || data.user.lastName || (sessionData?.name?.split(' ').slice(1).join(' ') || ""),
                email: data.user.email || sessionData?.email || "",
                birthdate: data.user.profile.birthdate || "",
                location: data.user.profile.location || data.user.location || "",
                interests: data.user.profile.interests || [],
                skills: data.user.profile.skills || [],
                skillLevels: data.user.profile.skill_levels || {},
                goals: data.user.profile.goals || [],
                educationLevel: data.user.profile.education_level || data.user.educationLevel || "",
                bio: data.user.profile.bio || data.user.bio || "",
                ageGroup: data.user.profile.age_group || data.user.ageGroup || "young-adult",
              };
              
              console.log("Setting updated user data from profile:", updatedUserData);
              setUserData(updatedUserData);

              // Calculate how far along they are in the process
              calculateCompletionPercentage(data.user.profile);
            }
          }
        } else {
          console.error("Failed to fetch user data:", response.status, response.statusText);
          // Try to use session data if API fails
          if (sessionData) {
            console.log("Using session data as fallback");
            setUserData({
              firstName: sessionData.name?.split(' ')[0] || "",
              lastName: sessionData.name?.split(' ').slice(1).join(' ') || "",
              email: sessionData.email || "",
              birthdate: "",
              location: "",
              interests: [],
              skills: [],
              skillLevels: {},
              goals: [],
              educationLevel: "",
              bio: "",
              ageGroup: "young-adult",
            });
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
    <main className="min-h-screen flex flex-col bg-slate-50">
      <InternalNavbar />
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-16 md:pt-14 w-full">

        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Step navigation */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`p-2 rounded-full ${
                    step === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-teal-500 hover:bg-teal-50"
                  }`}
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-between">
                    {STEPS.map((s, index) => {
                      const isActive = step === index + 1;
                      const isCompleted = step > index + 1;
                      
                      return (
                        <div key={s.id} className="flex flex-col items-center">
                          <div
                            className={`flex items-center justify-center h-10 w-10 rounded-full 
                              ${isActive 
                                ? "bg-teal-500 text-white" 
                                : isCompleted 
                                  ? "bg-teal-100 text-teal-700" 
                                  : "bg-slate-100 text-slate-400"
                              } transition-all duration-200`}
                          >
                            {s.icon}
                          </div>
                          <span 
                            className={`mt-1 text-xs font-medium hidden sm:block
                              ${isActive 
                                ? "text-teal-600" 
                                : isCompleted 
                                  ? "text-slate-700" 
                                  : "text-slate-400"
                              }`}
                          >
                            {s.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="relative mt-2 hidden sm:block">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 rounded-full"></div>
                    <div 
                      className="absolute top-0 left-0 h-1 bg-teal-500 rounded-full" 
                      style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <button
                  onClick={step < 4 ? handleNext : handleSubmit}
                  disabled={step === 5}
                  className={`p-2 rounded-full ${
                    step === 5
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-teal-500 hover:bg-teal-50"
                  }`}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          <div className="p-6 md:p-8">
            {step === 1 && (
              <PersonalInfoStep 
                initialData={{
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  bio: userData.bio,
                  location: userData.location,
                  educationLevel: userData.educationLevel,
                  ageGroup: userData.ageGroup || "young-adult",
                  profileImage: null
                }}
                onComplete={(data) => {
                  setUserData({
                    ...userData,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    bio: data.bio,
                    location: data.location,
                    educationLevel: data.educationLevel,
                    ageGroup: data.ageGroup
                  });
                }}
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
      </div>
    </main>
  )
}
