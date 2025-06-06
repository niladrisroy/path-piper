"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, X, GraduationCap, Edit, Calendar, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getPlaceholdersForType } from "@/data/institution-placeholders"
import { MultiSelect } from "@/components/ui/multi-select"
import { getSubjectSuggestions } from "@/data/subject-suggestions"

interface EducationEntry {
  id: number | string
  institutionName: string
  institutionCategory: string
  institutionType: string
  degree?: string
  fieldOfStudy: string
  subjects?: string[]
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

interface InstitutionType {
  id: string
  name: string
  slug: string
}

interface InstitutionCategory {
  id: string
  name: string
  slug: string
  types: InstitutionType[]
}

export default function EducationHistoryForm({ data, onChange }: EducationHistoryFormProps) {
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EducationEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newEntry, setNewEntry] = useState<EducationEntry>({
    id: "",
    institutionName: "",
    institutionCategory: "",
    institutionType: "",
    degree: "",
    fieldOfStudy: "",
    subjects: [],
    startDate: "",
    endDate: "",
    isCurrent: true,
    grade: "",
    description: ""
  })
  const [institutionCategories, setInstitutionCategories] = useState<InstitutionCategory[]>([])

  // Fetch existing education history from database
  useEffect(() => {
    const fetchEducationHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/education', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          const existingEducation = data.education || []
          console.log('📚 Loaded existing education history:', existingEducation)
          setEducationHistory(existingEducation)
        } else {
          console.error('Failed to fetch education history:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching education history:', error)
        toast.error('Failed to load education history')
      } finally {
        setLoading(false)
      }
    }

    const fetchInstitutionTypes = async () => {
      try {
        const response = await fetch('/api/institution-types')
        const data = await response.json()

        if (data.success) {
          setInstitutionCategories(data.data)
        } else {
          console.error('Failed to fetch institution types:', data.error)
        }
      } catch (error) {
        console.error('Error fetching institution types:', error)
      }
    }

    fetchEducationHistory()
    fetchInstitutionTypes()
  }, [])

  // Pass education history data back to parent component whenever it changes
  useEffect(() => {
    onChange('education', educationHistory)
  }, [educationHistory, onChange])

  const handleInputChange = (field: keyof EducationEntry, value: string | number | boolean | string[]) => {
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

  const handleAddEntry = async () => {
    if (!newEntry.institutionName.trim() || !newEntry.subjects?.length) return

    const entryToAdd = {
      ...newEntry,
      id: -Date.now(), // Use negative number for temporary client-side IDs
    }

    const updatedEducation = [...educationHistory, entryToAdd]
    setEducationHistory(updatedEducation)

    // Auto-save to database
    await saveEducationToDatabase(updatedEducation)

    setNewEntry({
      id: "",
      institutionName: "",
      institutionCategory: "",
      institutionType: "",
      degree: "",
      fieldOfStudy: "",
      subjects: [],
      startDate: "",
      endDate: "",
      isCurrent: true,
      grade: "",
      description: ""
    })
    setIsAddingEntry(false)
  }

  const handleEditEntry = (entry: EducationEntry) => {
    setEditingEntry({ ...entry })
    setIsAddingEntry(true)
  }

  const handleSaveEdit = async () => {
    if (!editingEntry?.institutionName.trim() || !editingEntry?.subjects?.length) return

    const updatedEducation = educationHistory.map(entry => 
      entry.id === editingEntry.id ? editingEntry : entry
    )
    setEducationHistory(updatedEducation)

    // Auto-save to database
    await saveEducationToDatabase(updatedEducation)

    setEditingEntry(null)
    setIsAddingEntry(false)
  }

  const handleRemoveEntry = async (id: number | string) => {
    const updatedEducation = educationHistory.filter(entry => entry.id !== id)
    setEducationHistory(updatedEducation)

    // Auto-save to database
    await saveEducationToDatabase(updatedEducation)
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
      subjects: [],
      startDate: "",
      endDate: "",
      isCurrent: true,
      grade: "",
      description: ""
    })
  }

  const saveEducationToDatabase = async (educationToSave: EducationEntry[]) => {
    try {
      setIsSaving(true)
      console.log('💾 Auto-saving education history:', educationToSave)

      const response = await fetch('/api/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ education: educationToSave }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save education history:', errorData)
        throw new Error(errorData.error || 'Failed to save education history')
      }

      const result = await response.json()
      console.log('✅ Education history auto-saved successfully:', result)

      toast.success('Education entry saved successfully!')
    } catch (error) {
      console.error('Error saving education history:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save education entry')

      // Revert the education history state on error
      await fetchEducationFromDatabase()
    } finally {
      setIsSaving(false)
    }
  }

  const fetchEducationFromDatabase = async () => {
    try {
      const response = await fetch('/api/education', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        const existingEducation = data.education || []
        setEducationHistory(existingEducation)
      }
    } catch (error) {
      console.error('Error fetching education history:', error)
    }
  }

  const currentEntry = editingEntry || newEntry

  // Get available institution types based on selected category
  const getAvailableTypes = (categoryId: string) => {
    const category = institutionCategories.find(cat => cat.id === categoryId)
    return category ? category.types : []
  }

  const getCategoryLabel = (categoryId: string) => {
    const category = institutionCategories.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  }

  // Get type label for display
  const getTypeLabel = (categoryId: string, typeId: string) => {
    const category = institutionCategories.find(cat => cat.id === categoryId)
    if (!category) return typeId
    const type = category.types.find(t => t.id === typeId)
    return type ? type.name : typeId
  }

  // Get dynamic placeholders based on institution type
  const getDynamicPlaceholders = (typeId: string) => {
    if (!typeId) return getPlaceholdersForType('default')

    // Find the type slug from the institutionCategories
    for (const category of institutionCategories) {
      const type = category.types.find(t => t.id === typeId)
      if (type) {
        return getPlaceholdersForType(type.slug)
      }
    }
    return getPlaceholdersForType('default')
  }

  // Get institution type slug for subject suggestions
  const getInstitutionTypeSlug = (typeId: string) => {
    if (!typeId) return 'default'

    // Find the type slug from the institutionCategories
    for (const category of institutionCategories) {
      const type = category.types.find(t => t.id === typeId)
      if (type) {
        return type.slug
      }
    }
    return 'default'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Education History</h3>
          <p className="text-gray-600 dark:text-gray-400">Loading your education history...</p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-pathpiper-teal" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Education History</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your educational background from any type of institution - traditional schools, online platforms, bootcamps, vocational training, and more
        </p>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-pathpiper-teal mt-2">
            <Loader2 size={14} className="animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Add/Edit Entry Form */}
        {isAddingEntry && (
          <div className="border border-pathpiper-teal/20 rounded-lg p-6 bg-pathpiper-teal/5">
            <h4 className="font-medium text-pathpiper-teal mb-4">
              {editingEntry ? 'Edit Education Entry' : 'Add Education Entry'}
            </h4>
            <div className="space-y-4">
              {/* Step 1: Institution Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Institution Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentEntry.institutionCategory}
                    onValueChange={(value) => handleInputChange('institutionCategory', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the broad category that best describes your institution
                  </p>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Institution Type <span className="text-red-500">*</span>
                  </Label>
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
                          {type.name}
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

              {/* Step 2: Institution Name */}
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Institution Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={currentEntry.institutionName}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                  placeholder="e.g., Delhi Public School, IIT Delhi, BYJU'S"
                  className="mt-1"
                />
              </div>

              {/* Step 3: Subjects/Courses */}
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Subjects/Courses <span className="text-red-500">*</span>
                </Label>
                <MultiSelect
                  value={currentEntry.subjects || []}
                  onChange={(value) => handleInputChange('subjects', value)}
                  placeholder="Add subjects you studied..."
                  suggestions={getSubjectSuggestions(getInstitutionTypeSlug(currentEntry.institutionType))}
                  className="mt-1"
                  maxItems={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add the subjects or courses you studied at this institution
                </p>
              </div>

              {/* Step 4: Degree/Certificate and Grade/Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Degree/Certificate</Label>
                  <Input
                    value={currentEntry.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    placeholder={getDynamicPlaceholders(currentEntry.institutionType).degree}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Grade/Level</Label>
                  <Input
                    value={currentEntry.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder={getDynamicPlaceholders(currentEntry.institutionType).grade}
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
                  disabled={!currentEntry.institutionName.trim() || !currentEntry.subjects?.length}
                  className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                >
                  {editingEntry ? 'Save Changes' : 'Add Entry'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Education History List */}
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
                        <div className="flex flex-wrap gap-1">
                          {entry.subjects && entry.subjects.length > 0 ? (
                            entry.subjects.map((subject, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-pathpiper-teal/10 text-pathpiper-teal rounded-full">
                                {subject}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 italic">No subjects specified</span>
                          )}
                        </div>
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Education Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{entry.institutionName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveEntry(entry.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}