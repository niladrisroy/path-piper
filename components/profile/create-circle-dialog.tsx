
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Users } from "lucide-react"

interface CreateCircleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCircleCreated: () => void
}

export default function CreateCircleDialog({
  open,
  onOpenChange,
  onCircleCreated
}: CreateCircleDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Circle name is required')
      return
    }

    setLoading(true)
    try {
      let iconUrl = null
      
      // Upload image if provided
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('folder', 'circles')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          iconUrl = uploadResult.url
        }
      }

      // Create circle
      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
          icon: iconUrl || 'users' // Use uploaded image URL or default icon
        })
      })

      if (response.ok) {
        setName('')
        setDescription('')
        setColor('#3B82F6')
        setImageFile(null)
        setImagePreview(null)
        onCircleCreated()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create circle')
      }
    } catch (error) {
      console.error('Error creating circle:', error)
      alert('Failed to create circle')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription('')
    setColor('#3B82F6')
    setImageFile(null)
    setImagePreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Create New Circle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Circle Name */}
          <div className="space-y-2">
            <Label htmlFor="circle-name">Circle Name *</Label>
            <Input
              id="circle-name"
              placeholder="Enter circle name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-gray-500">{name.length}/50 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="circle-description">Description</Label>
            <Textarea
              id="circle-description"
              placeholder="Describe what this circle is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-gray-500">{description.length}/200 characters</p>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="circle-color">Circle Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="circle-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-600">{color}</span>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="circle-image">Circle Icon (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('circle-image-input')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Image
                </Button>
                <input
                  id="circle-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imageFile && (
                  <span className="text-sm text-gray-600">{imageFile.name}</span>
                )}
              </div>
              
              {imagePreview && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload an image to use as your circle icon. Max size: 5MB
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Circle icon"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium">{name || 'Circle Name'}</p>
                {description && (
                  <p className="text-sm text-gray-600 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            Create Circle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
