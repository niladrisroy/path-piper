
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Search, Award } from "lucide-react"

interface Skill {
  id?: number
  name: string
  level: number
  category?: string
}

interface SkillCategory {
  name: string
  skills: Array<{ id: number; name: string }>
}

interface SkillsAbilitiesFormProps {
  data: any
  onChange: (sectionId: string, data: Skill[]) => void
  isDirty: boolean
  onDirtyChange: (dirty: boolean) => void
}

export default function SkillsAbilitiesForm({ 
  data, 
  onChange, 
  isDirty, 
  onDirtyChange 
}: SkillsAbilitiesFormProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [originalSkills, setOriginalSkills] = useState<Skill[]>([])
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<SkillCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState(3)
  const [userAgeGroup, setUserAgeGroup] = useState<string>("high_school")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch user age group and skills data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch user data to get age group
        const userResponse = await fetch('/api/auth/user')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          const actualAgeGroup = userData.user?.studentProfile?.age_group || "high_school"
          setUserAgeGroup(actualAgeGroup)
          console.log('🔍 Using user age group for skills:', actualAgeGroup)

          // Fetch skill categories for the user's age group
          const skillsResponse = await fetch(`/api/skills?ageGroup=${actualAgeGroup}`)
          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json()
            setSkillCategories(skillsData.categories || [])
            setFilteredCategories(skillsData.categories || [])
          } else {
            console.error('Failed to fetch skills:', skillsResponse.status)
          }
        } else {
          console.error('Failed to fetch user data:', userResponse.status)
          // Fallback to high_school age group
          setUserAgeGroup("high_school")
          
          const skillsResponse = await fetch(`/api/skills?ageGroup=high_school`)
          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json()
            setSkillCategories(skillsData.categories || [])
            setFilteredCategories(skillsData.categories || [])
          }
        }

        // Fetch user's current skills
        const userSkillsResponse = await fetch('/api/user/skills')
        if (userSkillsResponse.ok) {
          const userSkillsData = await userSkillsResponse.json()
          // Transform user skills to match component format
          const userSkills = userSkillsData.skills?.map((userSkill: any) => ({
            name: userSkill.skills.name,
            level: userSkill.proficiency_level,
            id: userSkill.skill_id,
            category: userSkill.skills.skill_categories?.name || "Other"
          })) || []

          console.log('✅ Loaded user skills:', userSkills)
          setSkills(userSkills)
          setOriginalSkills(userSkills)

          // Update parent component with loaded data
          onChange("skills", userSkills)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter categories based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(skillCategories)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = skillCategories
      .map((category) => ({
        name: category.name,
        skills: category.skills.filter((skill) =>
          skill.name.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.skills.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, skillCategories])

  // Track dirty state
  useEffect(() => {
    const skillsChanged = skills.length !== originalSkills.length ||
      skills.some(skill => {
        const originalSkill = originalSkills.find(orig => orig.name === skill.name)
        return !originalSkill || originalSkill.level !== skill.level
      })
    
    console.log("🔍 Skills dirty bit:", skillsChanged)
    onDirtyChange(skillsChanged)
  }, [skills, originalSkills, onDirtyChange])

  const addSkill = (skillName: string, skillId?: number) => {
    if (skills.some((s) => s.name === skillName)) return

    const newSkills = [...skills, {
      id: skillId,
      name: skillName,
      level: newSkillLevel,
      category: findSkillCategory(skillName)
    }]
    setSkills(newSkills)
    onChange("skills", newSkills)
  }

  const addCustomSkill = () => {
    if (!newSkill.trim() || skills.some((s) => s.name === newSkill)) return

    const newSkills = [...skills, {
      name: newSkill,
      level: newSkillLevel,
      category: "Custom"
    }]
    setSkills(newSkills)
    onChange("skills", newSkills)
    setNewSkill("")
  }

  const removeSkill = (skillName: string) => {
    const newSkills = skills.filter((s) => s.name !== skillName)
    setSkills(newSkills)
    onChange("skills", newSkills)
  }

  const updateSkillLevel = (skillName: string, level: number) => {
    const newSkills = skills.map((s) =>
      s.name === skillName ? { ...s, level } : s
    )
    setSkills(newSkills)
    onChange("skills", newSkills)
  }

  const findSkillCategory = (skillName: string): string => {
    for (const category of skillCategories) {
      if (category.skills.some(skill => skill.name === skillName)) {
        return category.name
      }
    }
    return "Other"
  }

  const getLevelLabel = (level: number) => {
    const isYoungChild = userAgeGroup === "early_childhood" || userAgeGroup === "elementary"
    
    if (isYoungChild) {
      switch (level) {
        case 1: return "Just Started"
        case 2: return "Learning"
        case 3: return "Getting Better"
        case 4: return "Pretty Good"
        case 5: return "Really Good"
        default: return "Getting Better"
      }
    } else {
      switch (level) {
        case 1: return "Beginner"
        case 2: return "Elementary"
        case 3: return "Intermediate"
        case 4: return "Advanced"
        case 5: return "Expert"
        default: return "Intermediate"
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (isDirty) {
        console.log("💾 Skills have changes, saving to database...")
        
        // Filter out skills without IDs (custom skills) and handle them separately
        const skillsWithIds = skills.filter(skill => skill.id)
        
        if (skillsWithIds.length > 0) {
          const response = await fetch('/api/user/skills', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ skills: skillsWithIds }),
          })

          if (!response.ok) {
            console.error('Failed to save skills')
            return
          }
        }
        
        onDirtyChange(false)
        setOriginalSkills([...skills])
        console.log("✅ Skills saved successfully")
      } else {
        console.log("✅ Skills unchanged, skipping database save")
      }
    } catch (error) {
      console.error('Error saving skills:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Skills & Abilities</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Showcase your skills and expertise to help mentors understand your strengths and areas for growth
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Skills */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {/* Add Custom Skill */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add a custom skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomSkill()
                  }
                }}
              />
              <Button
                type="button"
                onClick={addCustomSkill}
                disabled={!newSkill.trim()}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* Search Skills */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Skill Categories */}
          <div className="space-y-6 max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => {
                    const isSelected = skills.some((s) => s.name === skill.name)
                    return (
                      <Button
                        key={skill.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => isSelected ? removeSkill(skill.name) : addSkill(skill.name, skill.id)}
                        className={`transition-all ${
                          isSelected
                            ? 'bg-pathpiper-teal hover:bg-pathpiper-teal/90 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {skill.name}
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

        {/* Selected Skills */}
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-[500px] flex flex-col">
            <Label className="text-lg font-medium mb-4 block">
              Your Skills ({skills.length})
            </Label>

            {skills.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Award className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No skills added yet</p>
                <p className="text-sm text-gray-400">
                  Add skills from the left or create your own
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.id || `${skill.name}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{skill.name}</h4>
                        {skill.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {skill.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.name)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Proficiency Level</span>
                        <span className="font-medium text-pathpiper-teal">
                          {getLevelLabel(skill.level)}
                        </span>
                      </div>
                      <Slider
                        value={[skill.level]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(value) => updateSkillLevel(skill.name, value[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{userAgeGroup === "early_childhood" || userAgeGroup === "elementary" ? "Just Started" : "Beginner"}</span>
                        <span>{userAgeGroup === "early_childhood" || userAgeGroup === "elementary" ? "Really Good" : "Expert"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`w-full max-w-md mx-auto block ${
            isDirty 
              ? 'bg-pathpiper-teal hover:bg-pathpiper-teal/90' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : (isDirty ? 'Save Changes' : 'No Changes')}
        </Button>
      </div>
    </div>
  )
}
