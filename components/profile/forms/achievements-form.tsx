
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, Trash2, Trophy } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Achievement {
  id: number
  name: string
  description: string
  dateOfAchievement: string
  createdAt: string
}

interface AchievementsFormProps {
  userId: string
}

export default function AchievementsForm({ userId }: AchievementsFormProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateOfAchievement: ''
  })

  useEffect(() => {
    fetchAchievements()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.dateOfAchievement) {
      toast.error('All fields are required')
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
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Achievement added successfully!')
        setFormData({ name: '', description: '', dateOfAchievement: '' })
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
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex gap-2">
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
                      <Trophy className="h-5 w-5 text-pathpiper-teal" />
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
