"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle, Building, BookOpen, Calendar, ImageIcon } from "lucide-react"
import OnboardingHeader from "@/components/onboarding/onboarding-header"
import InstitutionInfoStep from "@/components/onboarding/institution/institution-info-step"
import ProgramsStep from "@/components/onboarding/institution/programs-step"
import EventsStep from "@/components/onboarding/institution/events-step"
import GalleryStep from "@/components/onboarding/institution/gallery-step"
import InstitutionCompletionStep from "@/components/onboarding/institution/completion-step"

// Define the steps for the institution onboarding process
const STEPS = [
  { id: "institution-info", title: "Institution Info", icon: <Building className="h-5 w-5" /> },
  { id: "programs", title: "Programs", icon: <BookOpen className="h-5 w-5" /> },
  { id: "events", title: "Events", icon: <Calendar className="h-5 w-5" /> },
  { id: "gallery", title: "Gallery", icon: <ImageIcon className="h-5 w-5" /> },
  { id: "completion", title: "Complete", icon: <CheckCircle className="h-5 w-5" /> },
]

export default function InstitutionOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [profileData, setProfileData] = useState({
    institutionInfo: {
      name: "",
      description: "",
      location: "",
      type: "",
      website: "",
      logo: null,
      coverImage: null,
    },
    programs: [],
    events: [],
    gallery: [],
  })
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (Object.values(completedSteps).filter(Boolean).length / (STEPS.length - 1)) * 100,
  )

  const handleStepComplete = (stepId: string, data: any) => {
    setProfileData((prev) => ({
      ...prev,
      [stepId]: data,
    }))
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: true,
    }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleJumpToStep = (index: number) => {
    setCurrentStep(index)
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <OnboardingHeader completionPercentage={completionPercentage} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Step navigation */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`p-2 rounded-full ${
                  currentStep === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:text-purple-500 hover:bg-purple-50"
                }`}
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto py-2 scrollbar-hide">
                {STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center"
                    onClick={() => {
                      // Only allow jumping to completed steps or the current step
                      if (completedSteps[step.id] || index <= currentStep) {
                        handleJumpToStep(index)
                      }
                    }}
                  >
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full ${
                        index === currentStep
                          ? "bg-purple-500 text-white"
                          : completedSteps[step.id]
                            ? "bg-purple-100 text-purple-600 cursor-pointer"
                            : "bg-slate-200 text-slate-500"
                      } ${index <= currentStep ? "cursor-pointer" : ""}`}
                    >
                      {completedSteps[step.id] ? <CheckCircle className="h-5 w-5" /> : step.icon}
                    </div>
                    <span
                      className={`hidden md:block ml-2 text-sm ${
                        index === currentStep
                          ? "text-purple-500 font-medium"
                          : completedSteps[step.id]
                            ? "text-slate-700"
                            : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`hidden md:block w-8 h-0.5 mx-2 ${
                          index < currentStep || (completedSteps[step.id] && completedSteps[STEPS[index + 1].id])
                            ? "bg-purple-500"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full text-slate-500 hover:text-purple-500 hover:bg-purple-50"
                >
                  <ArrowRight size={20} />
                </button>
              ) : (
                <div className="w-10"></div> // Placeholder for alignment
              )}
            </div>
          </div>

          {/* Step content */}
          <div className="p-6 md:p-8">
            {currentStep === 0 && (
              <InstitutionInfoStep
                initialData={profileData.institutionInfo}
                onComplete={(data) => handleStepComplete("institutionInfo", data)}
                onNext={handleNext}
              />
            )}
            {currentStep === 1 && (
              <ProgramsStep
                initialData={profileData.programs}
                onComplete={(data) => handleStepComplete("programs", data)}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 2 && (
              <EventsStep
                initialData={profileData.events}
                onComplete={(data) => handleStepComplete("events", data)}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 3 && (
              <GalleryStep
                initialData={profileData.gallery}
                onComplete={(data) => handleStepComplete("gallery", data)}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 4 && (
              <InstitutionCompletionStep profileData={profileData} completionPercentage={completionPercentage} />
            )}
          </div>
        </div>
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
