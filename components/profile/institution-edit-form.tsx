"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, ImagePlus, Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InstitutionData {
  id: string
  name: string
  type: string
  category?: string
  location: string
  bio: string
  logo: string
  coverImage: string
  website: string
  verified: boolean
  founded?: number | null
  tagline: string
  overview?: string
  mission?: string
  coreValues?: string[]
}

interface InstitutionEditFormProps {
  institutionData: InstitutionData
}

export default function InstitutionEditForm({ institutionData }: InstitutionEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    overview: institutionData.overview || "",
    mission: institutionData.mission || "",
    coreValues: institutionData.coreValues || [""]
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(institutionData.logo)
  const [coverPreview, setCoverPreview] = useState<string | null>(institutionData.coverImage)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCoreValueChange = (index: number, value: string) => {
    const newCoreValues = [...formData.coreValues]
    newCoreValues[index] = value
    setFormData(prev => ({
      ...prev,
      coreValues: newCoreValues
    }))
  }

  const addCoreValue = () => {
    setFormData(prev => ({
      ...prev,
      coreValues: [...prev.coreValues, ""]
    }))
  }

  const removeCoreValue = (index: number) => {
    if (formData.coreValues.length > 1) {
      const newCoreValues = formData.coreValues.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        coreValues: newCoreValues
      }))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (file: File, type: 'logo' | 'cover'): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/upload/institution-${type}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let logoUrl = logoPreview
      let coverUrl = coverPreview

      // Upload logo if changed
      if (logoFile) {
        const uploadedLogoUrl = await uploadFile(logoFile, 'logo')
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl
        }
      }

      // Upload cover image if changed
      if (coverFile) {
        const uploadedCoverUrl = await uploadFile(coverFile, 'cover')
        if (uploadedCoverUrl) {
          coverUrl = uploadedCoverUrl
        }
      }

      // Filter out empty core values
      const filteredCoreValues = formData.coreValues.filter(value => value.trim() !== "")

      // Update institution profile
      const response = await fetch('/api/institution/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overview: formData.overview,
          mission: formData.mission,
          coreValues: filteredCoreValues,
          logoUrl: logoUrl,
          coverImageUrl: coverUrl
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update institution profile')
      }

      toast({
        title: "Success",
        description: "Institution profile updated successfully",
      })

      // Stay on the edit page after saving
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update institution profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Institution Logo</Label>
            <div
              className="w-32 h-32 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 text-center px-2">
                    Upload Logo
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-slate-500">Recommended: Square image (200x200px)</p>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div
              className="w-full h-48 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  width={800}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="h-10 w-10 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 text-center px-4">
                    Click to upload a cover image for your institution
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-slate-500">Recommended: 1200x400px image</p>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              value={formData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              placeholder="Provide an overview of your institution, its history, and what makes it unique"
              className="min-h-[120px]"
            />
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              placeholder="Describe your institution's mission and purpose"
              className="min-h-[100px]"
            />
          </div>

          {/* Core Values */}
          <div className="space-y-2">
            <Label>Core Values</Label>
            {formData.coreValues.map((value, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={value}
                  onChange={(e) => handleCoreValueChange(index, e.target.value)}
                  placeholder={`Core value ${index + 1}`}
                  className="flex-1"
                />
                {formData.coreValues.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCoreValue(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCoreValue}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Core Value
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/institution/profile')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}