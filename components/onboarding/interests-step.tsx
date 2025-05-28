"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Search } from "lucide-react"
import { toast } from "sonner"
import type { AgeGroup } from "@/components/onboarding/personal-info-step"

interface InterestCategory {
  name: string
  interests: string[]
}

interface InterestsStepProps {
  initialData: string[]
  onComplete: (data: string[]) => void
  onNext: () => void
  onSkip: () => void
  ageGroup?: AgeGroup // Add ageGroup prop
}

export default function InterestsStep({
  initialData,
  onComplete,
  onNext,
  onSkip,
  ageGroup = "young-adult",
}: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [customInterest, setCustomInterest] = useState("")
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<InterestCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [userAgeGroup, setUserAgeGroup] = useState<AgeGroup>(ageGroup)

  // Fetch interests from database based on user's age group
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch('/api/interests')
        if (!response.ok) {
          throw new Error('Failed to fetch interests')
        }
        const categories = await response.json()
        setInterestCategories(categories)
        setFilteredCategories(categories)
      } catch (error) {
        console.error('Error fetching interests:', error)
        toast.error('Failed to load interests. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterests()
  }, [])

  // Load user's existing interests
  useEffect(() => {
    const fetchUserInterests = async () => {
      try {
        const response = await fetch('/api/user/interests')
        if (response.ok) {
          const { interests } = await response.json()
          setSelectedInterests(interests)
        }
      } catch (error) {
        console.error('Error fetching user interests:', error)
      }
    }

    if (initialData.length === 0) {
      fetchUserInterests()
    }
  }, [initialData])

  // Track dirty state
  useEffect(() => {
    setIsDirty(selectedInterests.length > 0 && !selectedInterests.every(interest => initialData.includes(interest)))
  }, [selectedInterests, initialData])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(interestCategories)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = interestCategories
      .map((category) => ({
        name: category.name,
        interests: category.interests.filter((interest) => interest.toLowerCase().includes(term)),
      }))
      .filter((category) => category.interests.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, interestCategories])

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
    setIsDirty(true)
  }

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const addCustomInterest = () => {
    if (customInterest.trim() === "" || selectedInterests.includes(customInterest)) return
    setSelectedInterests([...selectedInterests, customInterest])
    setCustomInterest("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Save interests to database
      const response = await fetch('/api/user/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests: selectedInterests }),
      })

      if (!response.ok) {
        throw new Error('Failed to save interests')
      }

      toast.success('Interests saved successfully!')
      setIsDirty(false)
      onComplete(selectedInterests)
      onNext()
    } catch (error) {
      console.error('Error saving interests:', error)
      toast.error('Failed to save interests. Please try again.')
    }
  }

  // Determine if we should show simplified UI for younger children
  const isYoungChild = userAgeGroup === "early-childhood" || userAgeGroup === "elementary"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading interests...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Your Interests</h2>
      <p className="text-slate-600 mb-6">
        {isYoungChild
          ? "Select things you like to do and learn about!"
          : "Select topics you're interested in to help us personalize your experience and connect you with relevant mentors and content"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column - Available Interests (3/5 width on md screens) */}
          <div className="md:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder={isYoungChild ? "Find what you like..." : "Search interests..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Add custom interest */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder={isYoungChild ? "Add something you like..." : "Add a custom interest..."}
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                className="rounded-lg"
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>

            {/* Interest categories */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 border border-slate-200 rounded-lg p-4">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="font-semibold text-slate-800 mb-3">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedInterests.includes(interest)
                            ? "bg-teal-100 text-teal-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {interest}
                        {selectedInterests.includes(interest) ? (
                          <X size={14} className="ml-1 inline" />
                        ) : (
                          <Plus size={14} className="ml-1 inline" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Selected Interests (2/5 width on md screens) */}
          <div className="md:col-span-2">
            <div className="border border-slate-200 rounded-lg p-4 h-full">
              <Label className="mb-4 block text-lg font-medium">
                {isYoungChild ? "Things I Like" : "Selected Interests"} ({selectedInterests.length})
              </Label>

              {selectedInterests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="bg-slate-100 rounded-full p-4 mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-2">
                    {isYoungChild ? "You haven't picked anything yet" : "No interests selected yet"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isYoungChild
                      ? "Pick things you like from the left"
                      : "Select interests from the left or add your own"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
                  {selectedInterests.map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center bg-teal-100 text-teal-700 px-3 py-2 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="ml-2 text-teal-500 hover:text-teal-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onSkip} className="text-slate-500 hover:text-slate-700">
            {isYoungChild ? "Skip for now" : "Skip for now"}
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8"
          >
            {isYoungChild ? "Next" : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  )
}
