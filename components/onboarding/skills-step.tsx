"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Plus, X, Search, Award } from "lucide-react"
import { SKILL_CATEGORIES_BY_AGE } from "@/data/age-appropriate-content"
import type { AgeGroup } from "@/components/onboarding/personal-info-step"

interface Skill {
  name: string
  level: number
}

interface SkillsStepProps {
  initialData: Skill[]
  onComplete: (data: Skill[]) => void
  onNext: () => void
  onSkip: () => void
  ageGroup?: AgeGroup // Add ageGroup prop
}

export default function SkillsStep({
  initialData,
  onComplete,
  onNext,
  onSkip,
  ageGroup = "young-adult",
}: SkillsStepProps) {
  const [skills, setSkills] = useState<Skill[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState(3)

  // Get the appropriate skill categories based on age group
  const skillCategories = SKILL_CATEGORIES_BY_AGE[ageGroup]

  const [filteredCategories, setFilteredCategories] = useState(skillCategories)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(skillCategories)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = skillCategories
      .map((category) => ({
        name: category.name,
        skills: category.skills.filter((skill) => skill.toLowerCase().includes(term)),
      }))
      .filter((category) => category.skills.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, skillCategories])

  const addSkill = (skillName: string) => {
    if (skills.some((s) => s.name === skillName)) return

    setSkills([...skills, { name: skillName, level: newSkillLevel }])
  }

  const addCustomSkill = () => {
    if (!newSkill.trim() || skills.some((s) => s.name === newSkill)) return

    setSkills([...skills, { name: newSkill, level: newSkillLevel }])
    setNewSkill("")
  }

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName))
  }

  const updateSkillLevel = (skillName: string, level: number) => {
    setSkills(skills.map((s) => (s.name === skillName ? { ...s, level } : s)))
  }

  // Determine if we should show simplified UI for younger children
  const isYoungChild = ageGroup === "early-childhood" || ageGroup === "elementary"

  const getLevelLabel = (level: number) => {
    if (isYoungChild) {
      switch (level) {
        case 1:
          return "Just Started"
        case 2:
          return "Learning"
        case 3:
          return "Getting Better"
        case 4:
          return "Pretty Good"
        case 5:
          return "Really Good"
        default:
          return "Getting Better"
      }
    } else {
      switch (level) {
        case 1:
          return "Beginner"
        case 2:
          return "Elementary"
        case 3:
          return "Intermediate"
        case 4:
          return "Advanced"
        case 5:
          return "Expert"
        default:
          return "Intermediate"
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(skills)
    onNext()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{isYoungChild ? "Things You Can Do" : "Your Skills"}</h2>
      <p className="text-slate-600 mb-6">
        {isYoungChild
          ? "Tell us what you're good at or learning to do!"
          : "Add skills you already have to help us connect you with relevant opportunities and mentors"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column - Available Skills (3/5 width on md screens) */}
          <div className="md:col-span-3 space-y-4">
            {/* Add custom skill */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={isYoungChild ? "Add something you can do..." : "Add a custom skill..."}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <Button
                type="button"
                onClick={addCustomSkill}
                disabled={!newSkill.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>

            {/* Search skills */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder={isYoungChild ? "Find skills..." : "Search skills..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Skill categories */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 border border-slate-200 rounded-lg p-4">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => {
                      const isSelected = skills.some((s) => s.name === skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => (isSelected ? removeSkill(skill) : addSkill(skill))}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {skill}
                          {isSelected ? (
                            <X size={14} className="ml-1 inline" />
                          ) : (
                            <Plus size={14} className="ml-1 inline" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Selected Skills (2/5 width on md screens) */}
          <div className="md:col-span-2">
            <div className="border border-slate-200 rounded-lg p-4 h-full">
              <Label className="mb-4 block text-lg font-medium">
                {isYoungChild ? "My Skills" : "Your Skills"} ({skills.length})
              </Label>

              {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="bg-slate-100 rounded-full p-4 mb-4">
                    <Award className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-2">
                    {isYoungChild ? "You haven't added any skills yet" : "No skills added yet"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isYoungChild ? "Add skills from the left side" : "Add skills from the left or create your own"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {skills.map((skill) => (
                    <div key={skill.name} className="border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800">{skill.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.name)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">
                            {isYoungChild ? "How good are you at this?" : "Proficiency Level"}
                          </span>
                          <span className="font-medium text-teal-600">{getLevelLabel(skill.level)}</span>
                        </div>
                        <Slider
                          value={[skill.level]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => updateSkillLevel(skill.name, value[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{isYoungChild ? "Just Started" : "Beginner"}</span>
                          <span>{isYoungChild ? "Really Good" : "Expert"}</span>
                        </div>
                      </div>
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
