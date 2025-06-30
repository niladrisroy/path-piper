
"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Plus, X, Search, Heart, Award } from 'lucide-react'
import { toast } from 'sonner'
import { getPlaceholderText } from '@/data/institution-placeholders'

interface Interest {
  id: number
  name: string
  category?: string
}

interface InterestCategory {
  name: string
  interests: Interest[]
}

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

interface EditSectionDialogProps {
  section: string
  childId: string
  currentData: any
  onUpdate: () => void
  children: React.ReactNode
}

export default function EditSectionDialog({
  section,
  childId,
  currentData,
  onUpdate,
  children
}: EditSectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  
  // Interests state
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [filteredInterestCategories, setFilteredInterestCategories] = useState<InterestCategory[]>([])
  const [interestSearchTerm, setInterestSearchTerm] = useState("")
  const [customInterest, setCustomInterest] = useState("")
  
  // Skills state  
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [filteredSkillCategories, setFilteredSkillCategories] = useState<SkillCategory[]>([])
  const [skillSearchTerm, setSkillSearchTerm] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState(3)

  const [institutionTypes, setInstitutionTypes] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      fetchOptions()
      initializeFormData()
    }
  }, [open, section])

  // Filter interests based on search
  useEffect(() => {
    if (interestSearchTerm.trim() === "") {
      setFilteredInterestCategories(interestCategories)
      return
    }

    const term = interestSearchTerm.toLowerCase()
    const filtered = interestCategories
      .map((category) => ({
        name: category.name,
        interests: category.interests.filter((interest) => interest.name.toLowerCase().includes(term)),
      }))
      .filter((category) => category.interests.length > 0)

    setFilteredInterestCategories(filtered)
  }, [interestSearchTerm, interestCategories])

  // Filter skills based on search
  useEffect(() => {
    if (skillSearchTerm.trim() === "") {
      const categoriesWithCustom = [...skillCategories]
      
      // Add custom skills from user's existing skills if any
      const customSkills = selectedSkills.filter(skill => 
        !skill.id || skill.id < 0 || skill.category === "Custom"
      ).map(skill => ({
        id: skill.id || -Date.now(),
        name: skill.name
      }))

      if (customSkills.length > 0) {
        const existingCustomCategory = categoriesWithCustom.find(cat => cat.name === "Custom")
        if (existingCustomCategory) {
          existingCustomCategory.skills = [
            ...existingCustomCategory.skills,
            ...customSkills.filter(customSkill => 
              !existingCustomCategory.skills.some(existing => existing.name === customSkill.name)
            )
          ]
        } else {
          categoriesWithCustom.push({
            name: "Custom",
            skills: customSkills
          })
        }
      }

      setFilteredSkillCategories(categoriesWithCustom)
      return
    }

    const term = skillSearchTerm.toLowerCase()
    
    const categoriesWithCustom = [...skillCategories]
    const customSkills = selectedSkills.filter(skill => 
      !skill.id || skill.id < 0 || skill.category === "Custom"
    ).map(skill => ({
      id: skill.id || -Date.now(),
      name: skill.name
    }))

    if (customSkills.length > 0) {
      const existingCustomCategory = categoriesWithCustom.find(cat => cat.name === "Custom")
      if (existingCustomCategory) {
        existingCustomCategory.skills = [
          ...existingCustomCategory.skills,
          ...customSkills.filter(customSkill => 
            !existingCustomCategory.skills.some(existing => existing.name === customSkill.name)
          )
        ]
      } else {
        categoriesWithCustom.push({
          name: "Custom",
          skills: customSkills
        })
      }
    }

    const filtered = categoriesWithCustom
      .map((category) => ({
        name: category.name,
        skills: category.skills.filter((skill) =>
          skill.name.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.skills.length > 0)

    setFilteredSkillCategories(filtered)
  }, [skillSearchTerm, skillCategories, selectedSkills])

  const fetchOptions = async () => {
    try {
      if (section === 'interests') {
        const response = await fetch('/api/interests')
        if (response.ok) {
          const data = await response.json()
          setInterestCategories(data)
          setFilteredInterestCategories(data)
        }
      } else if (section === 'skills') {
        const response = await fetch('/api/skills')
        if (response.ok) {
          const data = await response.json()
          setSkillCategories(data.categories || [])
          setFilteredSkillCategories(data.categories || [])
        }
      } else if (section === 'education') {
        const response = await fetch('/api/institution-types')
        if (response.ok) {
          const data = await response.json()
          setInstitutionTypes(data)
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const initializeFormData = () => {
    switch (section) {
      case 'about':
        setFormData({
          bio: currentData.bio || '',
          location: currentData.location || '',
          tagline: currentData.tagline || ''
        })
        setSocialLinks(currentData.socialLinks || [])
        break
      case 'interests':
        // Transform current interests to match our format
        const currentInterests = currentData.userInterests?.map((ui: any) => ({
          id: ui.interest?.id || ui.interestId,
          name: ui.interest?.name || ui.name,
          category: ui.interest?.category?.name || ui.category
        })) || []
        setSelectedInterests(currentInterests)
        break
      case 'skills':
        // Transform current skills to match our format
        const currentSkills = currentData.userSkills?.map((us: any) => ({
          id: us.skill?.id || us.skillId,
          name: us.skill?.name || us.name,
          level: us.proficiencyLevel || us.proficiency_level || 3,
          category: us.skill?.category?.name || us.category
        })) || []
        setSelectedSkills(currentSkills)
        break
      case 'education':
      case 'goals':
      case 'achievements':
        setFormData({})
        break
    }
  }

  const toggleInterest = (interest: Interest) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id)
    if (isSelected) {
      setSelectedInterests(selectedInterests.filter((i) => i.id !== interest.id))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const addCustomInterest = () => {
    const trimmedInterest = customInterest.trim()
    if (trimmedInterest === "" || selectedInterests.some(i => i.name === trimmedInterest)) return

    const customInterestObj: Interest = {
      id: -Date.now(),
      name: trimmedInterest,
      category: "Custom"
    }

    setSelectedInterests([...selectedInterests, customInterestObj])
    setCustomInterest("")
  }

  const removeInterest = (interestId: number) => {
    setSelectedInterests(selectedInterests.filter(i => i.id !== interestId))
  }

  const addSkill = (skillName: string, skillId?: number) => {
    if (selectedSkills.some((s) => s.name === skillName)) return

    const newSkills = [...selectedSkills, {
      id: skillId,
      name: skillName,
      level: newSkillLevel,
      category: findSkillCategory(skillName)
    }]
    setSelectedSkills(newSkills)
  }

  const addCustomSkill = () => {
    if (!newSkill.trim() || selectedSkills.some((s) => s.name === newSkill)) return

    const newSkills = [...selectedSkills, {
      name: newSkill,
      level: newSkillLevel,
      category: "Custom"
    }]
    setSelectedSkills(newSkills)
    setNewSkill("")
  }

  const removeSkill = (skillName: string) => {
    const newSkills = selectedSkills.filter((s) => s.name !== skillName)
    setSelectedSkills(newSkills)
  }

  const updateSkillLevel = (skillName: string, level: number) => {
    const newSkills = selectedSkills.map((s) =>
      s.name === skillName ? { ...s, level } : s
    )
    setSelectedSkills(newSkills)
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
    switch (level) {
      case 1: return "Beginner"
      case 2: return "Elementary"
      case 3: return "Intermediate"
      case 4: return "Advanced"
      case 5: return "Expert"
      default: return "Intermediate"
    }
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }])
  }

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = socialLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    setSocialLinks(updated)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let data: any = {}
      let requestSection = section

      switch (section) {
        case 'about':
          data = {
            ...formData,
            socialLinks: socialLinks.filter(link => link.platform && link.url)
          }
          if (socialLinks.length > 0) {
            requestSection = 'social-links'
          }
          break
        case 'interests':
          // Convert to interest IDs
          data = { 
            interests: selectedInterests.map(interest => 
              interest.id > 0 ? interest.id.toString() : interest.name
            )
          }
          break
        case 'skills':
          // Convert to skills format expected by API
          data = { 
            skills: selectedSkills.map(skill => ({
              skillId: skill.id && skill.id > 0 ? skill.id : null,
              name: skill.name,
              proficiencyLevel: skill.level
            }))
          }
          break
        case 'education':
        case 'goals':
        case 'achievements':
          data = formData
          break
      }

      const response = await fetch(`/api/parent/child-profile/${childId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section: requestSection,
          data
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile updated successfully!')
      setOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const renderInterestsContent = () => (
    <div className="space-y-6">
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
                value={interestSearchTerm}
                onChange={(e) => setInterestSearchTerm(e.target.value)}
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
          <div className="space-y-6 max-h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {filteredInterestCategories.map((category) => (
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
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-[400px] flex flex-col">
            <Label className="text-lg font-medium mb-4 block">
              Selected Interests ({selectedInterests.length})
            </Label>

            {selectedInterests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Heart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No interests selected</p>
                <p className="text-sm text-gray-400">
                  Choose interests from the left or add your own
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center bg-pathpiper-teal text-white px-3 py-1 rounded-full text-sm"
                    >
                      <span className="font-medium">{interest.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInterest(interest.id)}
                        className="ml-2 p-0 h-auto text-white hover:text-red-200 hover:bg-transparent"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSkillsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Skills */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {/* Add Custom Skill */}
            <div className="space-y-3">
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
              
              {/* Default Level for New Skills */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <Label className="text-sm font-medium mb-2 block">
                  Default Level for New Skills: {getLevelLabel(newSkillLevel)}
                </Label>
                <Slider
                  value={[newSkillLevel]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => setNewSkillLevel(value[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
            </div>

            {/* Search Skills */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search skills..."
                value={skillSearchTerm}
                onChange={(e) => setSkillSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Skill Categories */}
          <div className="space-y-6 max-h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {filteredSkillCategories.map((category) => (
              <div key={category.name}>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => {
                    const isSelected = selectedSkills.some((s) => s.name === skill.name)
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
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-[400px] flex flex-col">
            <Label className="text-lg font-medium mb-4 block">
              Selected Skills ({selectedSkills.length})
            </Label>

            {selectedSkills.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Award className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No skills added yet</p>
                <p className="text-sm text-gray-400">
                  Add skills from the left or create your own
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                {selectedSkills.map((skill, index) => (
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

  const renderFormContent = () => {
    switch (section) {
      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Your location"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="A short tagline"
              />
            </div>
            <div>
              <Label>Social Links</Label>
              {socialLinks.map((link, index) => (
                <div key={index} className="flex space-x-2 mt-2">
                  <Select
                    value={link.platform}
                    onValueChange={(value) => updateSocialLink(index, 'platform', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSocialLink}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                Add Social Link
              </Button>
            </div>
          </div>
        )

      case 'interests':
        return renderInterestsContent()

      case 'skills':
        return renderSkillsContent()

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={formData.institutionName || ''}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                placeholder="Name of the institution"
              />
            </div>
            <div>
              <Label htmlFor="institutionType">Institution Type</Label>
              <Select
                value={formData.institutionTypeId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, institutionTypeId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  {institutionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="degreeProgram">Course/Program</Label>
              <Input
                id="degreeProgram"
                value={formData.degreeProgram || ''}
                onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                placeholder={
                  formData.institutionTypeId
                    ? getPlaceholderText(
                        institutionTypes.find(t => t.id === formData.institutionTypeId)?.slug || 'default',
                        'course'
                      )
                    : 'e.g., Mathematics, Science, Computer Science'
                }
              />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade/Level</Label>
              <Input
                id="gradeLevel"
                value={formData.gradeLevel || ''}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                placeholder={
                  formData.institutionTypeId
                    ? getPlaceholderText(
                        institutionTypes.find(t => t.id === formData.institutionTypeId)?.slug || 'default',
                        'grade'
                      )
                    : 'e.g., Grade 10, 1st Year, Beginner Level'
                }
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(new Date(formData.startDate), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => setFormData({ ...formData, startDate: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about your education..."
                rows={3}
              />
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want to achieve?"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your goal in detail..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.targetDate ? format(new Date(formData.targetDate), 'PPP') : 'Pick a target date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.targetDate ? new Date(formData.targetDate) : undefined}
                    onSelect={(date) => setFormData({ ...formData, targetDate: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )

      case 'achievements':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Achievement Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Name of the achievement"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the achievement..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="earnedDate">Date Earned</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.earnedDate ? format(new Date(formData.earnedDate), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.earnedDate ? new Date(formData.earnedDate) : undefined}
                    onSelect={(date) => setFormData({ ...formData, earnedDate: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )

      default:
        return <div>Section not implemented</div>
    }
  }

  const getSectionTitle = () => {
    switch (section) {
      case 'about': return 'Edit About Information'
      case 'interests': return 'Edit Interests & Passions'
      case 'skills': return 'Edit Skills & Abilities'
      case 'education': return 'Add Education Entry'
      case 'goals': return 'Add Career Goal'
      case 'achievements': return 'Add Achievement'
      default: return 'Edit Section'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getSectionTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {renderFormContent()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
