"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Calendar, Target, Edit } from "lucide-react"

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
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    category: "",
    timeframe: "",
  })

  // Update goals when data changes
  useEffect(() => {
    if (data?.goals) {
      setGoals(data.goals)
    }
  }, [data])

  // Notify parent of changes
  useEffect(() => {
    onChange("goals", goals)
  }, [goals])

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
      id: Date.now(),
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
    setEditingGoal(goal)
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

  const currentGoal = editingGoal || newGoal

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Aspirations</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Share your goals to help mentors understand what you're working towards and how they can support you
        </p>
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