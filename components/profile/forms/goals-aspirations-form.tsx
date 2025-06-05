
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Calendar, Target, Edit, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Goal {
  id: number | string
  title: string
  description: string
  category: string
  timeframe: string
}

interface GoalsAspirationsFormProps {
  data: any
  onChange: (sectionId: string, data: Goal[]) => void
}

const GOAL_CATEGORIES = ["Academic", "Career", "Skill Development", "Personal Growth", "Extracurricular", "Other"]
const TIMEFRAMES = ["1 month", "3 months", "6 months", "1 year", "2+ years", "Ongoing"]

export default function GoalsAspirationsForm({ data, onChange }: GoalsAspirationsFormProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [originalGoals, setOriginalGoals] = useState<Goal[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    category: "",
    timeframe: "",
  })

  // Fetch existing goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/goals', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          const existingGoals = data.goals || []
          console.log('📊 Loaded existing goals:', existingGoals)
          setGoals(existingGoals)
          setOriginalGoals([...existingGoals])
        } else {
          console.error('Failed to fetch goals:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching goals:', error)
        toast.error('Failed to load goals')
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [])

  // Track dirty state
  useEffect(() => {
    const goalsChanged = goals.length !== originalGoals.length ||
      goals.some(goal => {
        const originalGoal = originalGoals.find(orig => orig.id === goal.id)
        return !originalGoal || 
               originalGoal.title !== goal.title ||
               originalGoal.description !== goal.description ||
               originalGoal.category !== goal.category ||
               originalGoal.timeframe !== goal.timeframe
      }) ||
      originalGoals.some(orig => !goals.find(goal => goal.id === orig.id))
    
    setIsDirty(goalsChanged)
  }, [goals, originalGoals])

  // Notify parent of changes
  useEffect(() => {
    onChange("goals", goals)
  }, [goals, onChange])

  const handleInputChange = (field: keyof Goal, value: string) => {
    if (editingGoal) {
      setEditingGoal(prev => prev ? { ...prev, [field]: value } : null)
    } else {
      setNewGoal(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return

    const goalToAdd = {
      ...newGoal,
      id: -Date.now(), // Use negative number for temporary client-side IDs
    }

    setGoals(prev => [...prev, goalToAdd])
    setNewGoal({
      id: "",
      title: "",
      description: "",
      category: "",
      timeframe: "",
    })
    setIsAddingGoal(false)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal({ ...goal })
    setIsAddingGoal(true)
  }

  const handleSaveEdit = () => {
    if (!editingGoal?.title.trim()) return

    setGoals(prev => prev.map(goal => 
      goal.id === editingGoal.id ? editingGoal : goal
    ))
    setEditingGoal(null)
    setIsAddingGoal(false)
  }

  const handleRemoveGoal = (id: number | string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id))
  }

  const handleCancel = () => {
    setIsAddingGoal(false)
    setEditingGoal(null)
    setNewGoal({
      id: "",
      title: "",
      description: "",
      category: "",
      timeframe: "",
    })
  }

  const handleSave = async () => {
    if (!isDirty) {
      toast.info('No changes to save')
      return
    }

    try {
      setIsSaving(true)
      console.log('💾 Saving goals:', goals)

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ goals }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save goals:', errorData)
        throw new Error(errorData.error || 'Failed to save goals')
      }
      
      const result = await response.json()
      console.log('✅ Goals saved successfully:', result)
      
      // Update original goals to match current state
      setOriginalGoals([...goals])
      setIsDirty(false)
      
      toast.success('Goals saved successfully!')
    } catch (error) {
      console.error('Error saving goals:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save goals')
    } finally {
      setIsSaving(false)
    }
  }

  const currentGoal = editingGoal || newGoal

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Aspirations</h3>
          <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-pathpiper-teal" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Aspirations</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Share your goals to help mentors understand what you're working towards and how they can support you
          </p>
        </div>
        {isDirty && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-pathpiper-teal hover:bg-pathpiper-teal/90 flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Goals List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-medium">Your Goals ({goals.length})</Label>
            {!isAddingGoal && (
              <Button
                type="button"
                onClick={() => setIsAddingGoal(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} className="mr-2" />
                Add Goal
              </Button>
            )}
          </div>

          {goals.length === 0 && !isAddingGoal ? (
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No goals added yet</h3>
              <p className="text-gray-500 mb-4">
                Adding goals helps mentors understand your aspirations and provide better guidance
              </p>
              <Button
                type="button"
                onClick={() => setIsAddingGoal(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{goal.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                        {goal.category && (
                          <span className="flex items-center">
                            <Target size={14} className="mr-1" />
                            {goal.category}
                          </span>
                        )}
                        {goal.timeframe && (
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {goal.timeframe}
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        className="text-gray-400 hover:text-pathpiper-teal"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Goal Form */}
          {isAddingGoal && (
            <div className="border border-pathpiper-teal/20 rounded-lg p-6 bg-pathpiper-teal/5 mt-4">
              <h4 className="font-medium text-pathpiper-teal mb-4">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                    Goal Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={currentGoal.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Learn Python Programming"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={currentGoal.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your goal in more detail..."
                    className="mt-1 h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Category</Label>
                    <Select
                      value={currentGoal.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Timeframe</Label>
                    <Select
                      value={currentGoal.timeframe}
                      onValueChange={(value) => handleInputChange('timeframe', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEFRAMES.map((timeframe) => (
                          <SelectItem key={timeframe} value={timeframe}>
                            {timeframe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={editingGoal ? handleSaveEdit : handleAddGoal}
                    disabled={!currentGoal.title.trim()}
                    className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                  >
                    {editingGoal ? 'Save Changes' : 'Add Goal'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
