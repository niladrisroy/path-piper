
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, Trash2, Trophy, Upload, Image } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Achievement {
  id: number
  name: string
  description: string
  dateOfAchievement: string
  createdAt: string
  achievementTypeId?: number
  achievementImageIcon?: string
}

interface AchievementCategory {
  id: number
  name: string
}

interface AchievementType {
  id: number
  name: string
  categoryId: number
}

interface AchievementsFormProps {
  userId: string
}

export default function AchievementsForm({ userId }: AchievementsFormProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [categories, setCategories] = useState<AchievementCategory[]>([])
  const [types, setTypes] = useState<AchievementType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateOfAchievement: '',
    categoryId: '',
    achievementTypeId: '',
    achievementImageIcon: ''
  })

  useEffect(() => {
    fetchAchievements()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      fetchTypes(formData.categoryId)
    } else {
      setTypes([])
      setFormData(prev => ({ ...prev, achievementTypeId: '' }))
    }
  }, [formData.categoryId])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAchievements(data.achievements || [])
      } else {
        console.error('Failed to fetch achievements')
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/achievement-categories', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch achievement categories')
      }
    } catch (error) {
      console.error('Error fetching achievement categories:', error)
    }
  }

  const fetchTypes = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/achievement-types?categoryId=${categoryId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTypes(data.types || [])
      } else {
        console.error('Failed to fetch achievement types')
      }
    } catch (error) {
      console.error('Error fetching achievement types:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload/achievement-icon', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, achievementImageIcon: data.url }))
        toast.success('Image uploaded successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.dateOfAchievement || !formData.achievementTypeId) {
      toast.error('Name, description, date, and achievement type are required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          dateOfAchievement: formData.dateOfAchievement,
          achievementTypeId: formData.achievementTypeId,
          achievementImageIcon: formData.achievementImageIcon
        })
      })

      if (response.ok) {
        toast.success('Achievement added successfully!')
        setFormData({ 
          name: '', 
          description: '', 
          dateOfAchievement: '', 
          categoryId: '', 
          achievementTypeId: '', 
          achievementImageIcon: '' 
        })
        setShowAddForm(false)
        await fetchAchievements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add achievement')
      }
    } catch (error) {
      console.error('Error adding achievement:', error)
      toast.error('Failed to add achievement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (achievementId: number) => {
    if (!confirm('Are you sure you want to delete this achievement?')) {
      return
    }

    try {
      const response = await fetch(`/api/achievements?id=${achievementId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Achievement deleted successfully!')
        await fetchAchievements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete achievement')
      }
    } catch (error) {
      console.error('Error deleting achievement:', error)
      toast.error('Failed to delete achievement')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Achievements</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Achievements</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showcase your accomplishments and milestones
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Achievement
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Achievement</CardTitle>
            <CardDescription>
              Add a new achievement to your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Achievement Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., First Place in Science Fair"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your achievement..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value, achievementTypeId: '' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Achievement Type *</Label>
                  <Select
                    value={formData.achievementTypeId}
                    onValueChange={(value) => setFormData({ ...formData, achievementTypeId: value })}
                    disabled={!formData.categoryId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={formData.categoryId ? "Select achievement type" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfAchievement">Date of Achievement *</Label>
                <Input
                  id="dateOfAchievement"
                  type="date"
                  value={formData.dateOfAchievement}
                  onChange={(e) => setFormData({ ...formData, dateOfAchievement: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="achievementImage" className="text-sm font-medium">Achievement Icon</Label>
                <div className="w-full">
                  <div className="p-8 py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-colors hover:border-pathpiper-teal/50">
                    <div className="space-y-4">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload Achievement Icon
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG up to 5MB
                          </p>
                        </div>
                      </div>
                      
                      <Input
                        id="achievementImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-pathpiper-teal file:text-white hover:file:bg-pathpiper-teal/80 file:transition-colors cursor-pointer"
                      />
                    </div>
                    
                    {uploadingImage && (
                      <div className="flex items-center justify-center gap-2 text-sm text-pathpiper-teal p-4 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pathpiper-teal"></div>
                        <span className="font-medium">Uploading image...</span>
                      </div>
                    )}
                    
                    {formData.achievementImageIcon && (
                      <div className="flex items-center gap-3 p-4 mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 flex-1">
                          <Image className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Image uploaded successfully</span>
                        </div>
                        <img 
                          src={formData.achievementImageIcon} 
                          alt="Achievement icon preview" 
                          className="h-12 w-12 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Achievement'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {achievements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No achievements added yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start showcasing your accomplishments by adding your first achievement.
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Achievement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {achievement.achievementImageIcon ? (
                        <img 
                          src={achievement.achievementImageIcon} 
                          alt={achievement.name}
                          className="h-5 w-5 object-cover rounded"
                        />
                      ) : (
                        <Trophy className="h-5 w-5 text-pathpiper-teal" />
                      )}
                      <h4 className="text-lg font-semibold">{achievement.name}</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {format(new Date(achievement.dateOfAchievement), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(achievement.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
