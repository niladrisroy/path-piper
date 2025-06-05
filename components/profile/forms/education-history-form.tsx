
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, X, GraduationCap, Edit, Calendar } from "lucide-react"
import { INSTITUTION_CATEGORIES } from "@/data/institution-types"

interface EducationEntry {
  id: number | string
  institutionName: string
  institutionCategory: string
  institutionType: string
  degree?: string
  fieldOfStudy: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  grade?: string
  description?: string
}

interface EducationHistoryFormProps {
  data: any
  onChange: (sectionId: string, data: EducationEntry[]) => void
}

export default function EducationHistoryForm({ data, onChange }: EducationHistoryFormProps) {
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([])
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EducationEntry | null>(null)
  const [newEntry, setNewEntry] = useState<EducationEntry>({
    id: "",
    institutionName: "",
    institutionCategory: "",
    institutionType: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    isCurrent: true,
    grade: "",
    description: ""
  })

  // Update education history when data changes
  useEffect(() => {
    if (data?.educationHistory) {
      setEducationHistory(data.educationHistory)
    }
  }, [data])

  // Notify parent of changes
  useEffect(() => {
    onChange("education", educationHistory)
  }, [educationHistory])

  const handleInputChange = (field: keyof EducationEntry, value: string | number | boolean) => {
    if (editingEntry) {
      setEditingEntry(prev => {
        if (!prev) return null
        const updated = { ...prev, [field]: value }
        // Reset institution type if category changes
        if (field === 'institutionCategory') {
          updated.institutionType = ""
        }
        return updated
      })
    } else {
      setNewEntry(prev => {
        const updated = { ...prev, [field]: value }
        // Reset institution type if category changes
        if (field === 'institutionCategory') {
          updated.institutionType = ""
        }
        return updated
      })
    }
  }

  const handleAddEntry = () => {
    if (!newEntry.institutionName.trim() || !newEntry.fieldOfStudy.trim()) return

    const entryToAdd = {
      ...newEntry,
      id: Date.now(),
    }

    setEducationHistory(prev => [...prev, entryToAdd])
    setNewEntry({
      id: "",
      institutionName: "",
      institutionCategory: "",
      institutionType: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
      grade: "",
      description: ""
    })
    setIsAddingEntry(false)
  }

  const handleEditEntry = (entry: EducationEntry) => {
    setEditingEntry(entry)
    setIsAddingEntry(true)
  }

  const handleSaveEdit = () => {
    if (!editingEntry?.institutionName.trim() || !editingEntry?.fieldOfStudy.trim()) return

    setEducationHistory(prev => prev.map(entry => 
      entry.id === editingEntry.id ? editingEntry : entry
    ))
    setEditingEntry(null)
    setIsAddingEntry(false)
  }

  const handleRemoveEntry = (id: number | string) => {
    setEducationHistory(prev => prev.filter(entry => entry.id !== id))
  }

  const handleCancel = () => {
    setIsAddingEntry(false)
    setEditingEntry(null)
    setNewEntry({
      id: "",
      institutionName: "",
      institutionCategory: "",
      institutionType: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
      grade: "",
      description: ""
    })
  }

  const currentEntry = editingEntry || newEntry

  // Get available institution types based on selected category
  const getAvailableTypes = (categoryId: string) => {
    const category = INSTITUTION_CATEGORIES.find(cat => cat.id === categoryId)
    return category ? category.types : []
  }

  // Get category label for display
  const getCategoryLabel = (categoryId: string) => {
    const category = INSTITUTION_CATEGORIES.find(cat => cat.id === categoryId)
    return category ? category.label : categoryId
  }

  // Get type label for display
  const getTypeLabel = (categoryId: string, typeId: string) => {
    const category = INSTITUTION_CATEGORIES.find(cat => cat.id === categoryId)
    if (!category) return typeId
    const type = category.types.find(t => t.id === typeId)
    return type ? type.label : typeId
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Education History</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your educational background from any type of institution - traditional schools, online platforms, bootcamps, vocational training, and more
        </p>
      </div>

      <div className="space-y-6">
        {/* Education Entries List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-medium">Education History ({educationHistory.length})</Label>
            {!isAddingEntry && (
              <Button
                type="button"
                onClick={() => setIsAddingEntry(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} className="mr-2" />
                Add Education
              </Button>
            )}
          </div>

          {educationHistory.length === 0 && !isAddingEntry ? (
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No education history added</h3>
              <p className="text-gray-500 mb-4">
                Add your current and past educational experiences from any type of institution
              </p>
              <Button
                type="button"
                onClick={() => setIsAddingEntry(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                Add Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {educationHistory.map((entry) => (
                <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{entry.institutionName}</h4>
                        {entry.isCurrent && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span>{getTypeLabel(entry.institutionCategory, entry.institutionType)}</span>
                          {entry.degree && <span>• {entry.degree}</span>}
                          {entry.grade && <span>• {entry.grade}</span>}
                        </div>
                        <div>{entry.fieldOfStudy}</div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} />
                          <span>
                            {entry.startDate} - {entry.isCurrent ? 'Present' : entry.endDate}
                          </span>
                        </div>
                        {entry.description && (
                          <div className="text-green-600 dark:text-green-400 text-sm">
                            {entry.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                        className="text-gray-400 hover:text-pathpiper-teal"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEntry(entry.id)}
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

          {/* Add/Edit Entry Form */}
          {isAddingEntry && (
            <div className="border border-pathpiper-teal/20 rounded-lg p-6 bg-pathpiper-teal/5 mt-4">
              <h4 className="font-medium text-pathpiper-teal mb-4">
                {editingEntry ? 'Edit Education Entry' : 'Add Education Entry'}
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      Institution Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={currentEntry.institutionName}
                      onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      placeholder="e.g., Westlake High School, Harvard University, Coursera"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      Learning Focus <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={currentEntry.fieldOfStudy}
                      onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                      placeholder="e.g., General Studies, Computer Science, Web Development, Digital Marketing"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Institution Category</Label>
                    <Select
                      value={currentEntry.institutionCategory}
                      onValueChange={(value) => handleInputChange('institutionCategory', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTITUTION_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the broad category that best describes your institution
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Institution Type</Label>
                    <Select
                      value={currentEntry.institutionType}
                      onValueChange={(value) => handleInputChange('institutionType', value)}
                      disabled={!currentEntry.institutionCategory}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue 
                          placeholder={currentEntry.institutionCategory ? "Select specific type" : "Select category first"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTypes(currentEntry.institutionCategory).map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentEntry.institutionCategory 
                        ? `Select the specific type within ${getCategoryLabel(currentEntry.institutionCategory)}`
                        : "Select a category first to see available types"
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Achievement/Credential</Label>
                    <Input
                      value={currentEntry.degree}
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                      placeholder="e.g., High School Diploma, Bachelor's Degree, Professional Certificate, Course Completion"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Learning Stage</Label>
                    <Input
                      value={currentEntry.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                      placeholder="e.g., 12th Grade, Freshman Year, Beginner Level, Advanced Stage"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Start Date</Label>
                    <Input
                      type="date"
                      value={currentEntry.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">End Date</Label>
                    <Input
                      type="date"
                      value={currentEntry.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      disabled={currentEntry.isCurrent}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentEntry.isCurrent}
                    onCheckedChange={(checked) => handleInputChange('isCurrent', checked)}
                  />
                  <Label className="text-gray-700 dark:text-gray-300">
                    I currently attend this institution
                  </Label>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Description (optional)</Label>
                  <Textarea
                    value={currentEntry.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Awards, honors, notable achievements, projects completed..."
                    className="mt-1 h-20"
                  />
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
                    onClick={editingEntry ? handleSaveEdit : handleAddEntry}
                    disabled={!currentEntry.institutionName.trim() || !currentEntry.fieldOfStudy.trim()}
                    className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                  >
                    {editingEntry ? 'Save Changes' : 'Add Entry'}
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
