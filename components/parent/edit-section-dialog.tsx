
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, X, Trash2 } from "lucide-react"

interface EditSectionDialogProps {
  section: string
  childId: string
  currentData?: any
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
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [interests, setInterests] = useState([])
  const [skills, setSkills] = useState([])
  const [institutionTypes, setInstitutionTypes] = useState([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<any[]>([])
  const [socialLinks, setSocialLinks] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      initializeFormData()
      if (section === 'interests' || section === 'skills') {
        fetchOptions()
      }
    }
  }, [isOpen, section])

  const initializeFormData = () => {
    switch (section) {
      case 'about':
        setFormData({
          bio: currentData?.bio || '',
          location: currentData?.location || '',
          tagline: currentData?.tagline || ''
        })
        setSocialLinks(currentData?.socialLinks || [])
        break
      case 'interests':
        setSelectedInterests(currentData?.userInterests?.map((ui: any) => ui.interest.id) || [])
        break
      case 'skills':
        setSelectedSkills(currentData?.userSkills?.map((us: any) => ({
          skillId: us.skill.id,
          proficiencyLevel: us.proficiencyLevel
        })) || [])
        break
      case 'education':
        setFormData({
          institutionName: '',
          institutionTypeId: '',
          degreeProgram: '',
          fieldOfStudy: '',
          subjects: [],
          startDate: '',
          endDate: '',
          isCurrent: false,
          gradeLevel: '',
          gpa: '',
          description: ''
        })
        break
      case 'goals':
        setFormData({
          title: '',
          description: '',
          targetDate: ''
        })
        break
      case 'achievements':
        setFormData({
          title: '',
          description: '',
          earnedDate: new Date().toISOString().split('T')[0]
        })
        break
    }
  }

  const fetchOptions = async () => {
    try {
      if (section === 'interests') {
        const response = await fetch('/api/interests')
        if (response.ok) {
          const data = await response.json()
          setInterests(data)
        }
      } else if (section === 'skills') {
        const response = await fetch('/api/skills')
        if (response.ok) {
          const data = await response.json()
          setSkills(data)
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let data: any = {}

      switch (section) {
        case 'about':
          data = {
            ...formData,
            socialLinks: socialLinks
          }
          break
        case 'interests':
          data = { interests: selectedInterests }
          break
        case 'skills':
          data = { skills: selectedSkills }
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
          section: section === 'about' && socialLinks.length > 0 ? 'social-links' : section,
          data
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile updated successfully!')
      setIsOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }])
  }

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...socialLinks]
    updated[index][field] = value
    setSocialLinks(updated)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const addSubject = (subject: string) => {
    if (subject && !formData.subjects?.includes(subject)) {
      setFormData({
        ...formData,
        subjects: [...(formData.subjects || []), subject]
      })
    }
  }

  const removeSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects?.filter((s: string) => s !== subject) || []
    })
  }

  const renderFormContent = () => {
    switch (section) {
      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="A short tagline..."
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Social Links</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
              </div>
              {socialLinks.map((link, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <Select 
                    value={link.platform} 
                    onValueChange={(value) => updateSocialLink(index, 'platform', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    placeholder="URL"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'interests':
        return (
          <div className="space-y-4">
            <Label>Select Interests</Label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {interests.map((interest: any) => (
                <div key={interest.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`interest-${interest.id}`}
                    checked={selectedInterests.includes(interest.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInterests([...selectedInterests, interest.id])
                      } else {
                        setSelectedInterests(selectedInterests.filter(id => id !== interest.id))
                      }
                    }}
                  />
                  <Label htmlFor={`interest-${interest.id}`} className="text-sm">
                    {interest.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                placeholder="School/College name"
              />
            </div>
            <div>
              <Label htmlFor="degreeProgram">Degree/Program</Label>
              <Input
                id="degreeProgram"
                value={formData.degreeProgram}
                onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                placeholder="e.g., B.Tech, Class 10"
              />
            </div>
            <div>
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              />
              <Label htmlFor="isCurrent">Currently studying here</Label>
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
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want to achieve?"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your goal..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
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
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What was achieved?"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the achievement..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="earnedDate">Date Earned</Label>
              <Input
                id="earnedDate"
                type="date"
                value={formData.earnedDate}
                onChange={(e) => setFormData({ ...formData, earnedDate: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return <div>Section not implemented yet</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {section.charAt(0).toUpperCase() + section.slice(1)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormContent()}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
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
