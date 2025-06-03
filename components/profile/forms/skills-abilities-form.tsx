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
  skills: string[]
}

interface SkillsAbilitiesFormProps {
  data: any
  onChange: (sectionId: string, data: Skill[]) => void
}

export default function SkillsAbilitiesForm({ data, onChange }: SkillsAbilitiesFormProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<SkillCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState(3)
  const [loading, setLoading] = useState(true)

  // Load skills from API
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/skills?ageGroup=high_school')
        if (response.ok) {
          const { categories } = await response.json()
          setSkillCategories(categories)
          setFilteredCategories(categories)
        }
      } catch (error) {
        console.error('Error loading skills:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSkills()
  }, [])

  // Update skills when data changes
  useEffect(() => {
    if (data?.skills) {
      setSkills(data.skills)
    }
  }, [data])

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
          skill.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.skills.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, skillCategories])

  // Handle skills change - debounced to prevent infinite loops
  const handleSkillsChange = useCallback((newSkills: Skill[]) => {
    // Only call onChange if skills actually changed
    if (JSON.stringify(skills) !== JSON.stringify(newSkills)) {
      onChange("skills", newSkills)
    }
  }, [skills, onChange])

  const addSkill = (skillName: string, skillId?: number) => {
    if (skills.some((s) => s.name === skillName)) return

    const newSkills = [...skills, {
      id: skillId,
      name: skillName,
      level: newSkillLevel,
      category: findSkillCategory(skillName)
    }]
    setSkills(newSkills)
    handleSkillsChange(newSkills)
  }

  const addCustomSkill = () => {
    if (!newSkill.trim() || skills.some((s) => s.name === newSkill)) return

    const newSkills = [...skills, {
      name: newSkill,
      level: newSkillLevel,
      category: "Custom"
    }]
    setSkills(newSkills)
    handleSkillsChange(newSkills)
    setNewSkill("")
  }

  const removeSkill = (skillName: string) => {
    const newSkills = skills.filter((s) => s.name !== skillName)
    setSkills(newSkills)
    handleSkillsChange(newSkills)
  }

  const updateSkillLevel = (skillName: string, level: number) => {
    const newSkills = skills.map((s) =>
      s.name === skillName ? { ...s, level } : s
    )
    setSkills(newSkills)
    handleSkillsChange(newSkills)
  }

  const findSkillCategory = (skillName: string): string => {
    for (const category of skillCategories) {
      if (category.skills.includes(skillName)) {
        return category.name
      }
    }
    return "Other"
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return "Beginner"
      case 2: return "Elementary"
      case 3: return "Intermediate"
      case 4: return "Advanced"
      case 5: return "Expert"
      default: return "Intermediate"
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
                    const isSelected = skills.some((s) => s.name === skill)
                    return (
                      <Button
                        key={skill}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => isSelected ? removeSkill(skill) : addSkill(skill)}
                        className={`transition-all ${
                          isSelected
                            ? 'bg-pathpiper-teal hover:bg-pathpiper-teal/90 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {skill}
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
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full min-h-[500px]">
            <Label className="text-lg font-medium mb-4 block">
              Your Skills ({skills.length})
            </Label>

            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Award className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No skills added yet</p>
                <p className="text-sm text-gray-400">
                  Add skills from the left or create your own
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto">
                {skills.map((skill) => (
                  <div key={skill.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
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
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>
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