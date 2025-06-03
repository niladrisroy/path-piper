
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Search, Heart } from "lucide-react"

interface Interest {
  id: number
  name: string
  category?: string
}

interface InterestCategory {
  name: string
  interests: Interest[]
}

interface InterestsPassionsFormProps {
  data: any
  onChange: (sectionId: string, data: Interest[]) => void
}

export default function InterestsPassionsForm({ data, onChange }: InterestsPassionsFormProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<InterestCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customInterest, setCustomInterest] = useState("")
  const [loading, setLoading] = useState(true)

  // Load interests from API
  useEffect(() => {
    const loadInterests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/interests?ageGroup=high_school')
        if (response.ok) {
          const categories = await response.json()
          setInterestCategories(categories)
          setFilteredCategories(categories)
        }
      } catch (error) {
        console.error('Error loading interests:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInterests()
  }, [])

  // Update selected interests when data changes
  useEffect(() => {
    if (data?.interests) {
      setSelectedInterests(data.interests)
    }
  }, [data])

  // Filter categories based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(interestCategories)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = interestCategories
      .map((category) => ({
        name: category.name,
        interests: category.interests.filter((interest) =>
          interest.name.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.interests.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, interestCategories])

  // Notify parent of changes
  useEffect(() => {
    onChange("interests", selectedInterests)
  }, [selectedInterests])

  const toggleInterest = (interest: Interest) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id)
    if (isSelected) {
      setSelectedInterests(prev => prev.filter(i => i.id !== interest.id))
    } else {
      setSelectedInterests(prev => [...prev, interest])
    }
  }

  const addCustomInterest = () => {
    const trimmedInterest = customInterest.trim()
    if (trimmedInterest === "" || selectedInterests.some(i => i.name === trimmedInterest)) return
    
    const newInterest: Interest = {
      id: -Date.now(), // Temporary negative ID for custom interests
      name: trimmedInterest,
      category: "Custom"
    }
    
    setSelectedInterests(prev => [...prev, newInterest])
    setCustomInterest("")
  }

  const removeInterest = (interestId: number) => {
    setSelectedInterests(prev => prev.filter(i => i.id !== interestId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading interests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interests & Passions</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select topics you're passionate about to help us connect you with like-minded people and relevant content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Interests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Add Custom Interest */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add a custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Interest Categories */}
          <div className="space-y-6 max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.interests.map((interest) => {
                    const isSelected = selectedInterests.some(i => i.id === interest.id)
                    return (
                      <Button
                        key={interest.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleInterest(interest)}
                        className={`transition-all ${
                          isSelected
                            ? 'bg-pathpiper-teal hover:bg-pathpiper-teal/90 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {interest.name}
                        {isSelected ? (
                          <X size={14} className="ml-1" />
                        ) : (
                          <Plus size={14} className="ml-1" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Interests */}
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full min-h-[400px]">
            <Label className="text-lg font-medium mb-4 block">
              Your Interests ({selectedInterests.length})
            </Label>

            {selectedInterests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Heart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No interests selected yet</p>
                <p className="text-sm text-gray-400">
                  Choose interests from the left or add your own
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {selectedInterests.map((interest) => (
                  <div
                    key={interest.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{interest.name}</span>
                      {interest.category && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {interest.category}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterest(interest.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
