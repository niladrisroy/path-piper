"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase-types"
import { Upload, X, Loader2 } from "lucide-react"

interface FileUploadProps {
  bucket: string
  path: string
  onUploadComplete: (url: string) => void
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function FileUpload({
  bucket,
  path,
  onUploadComplete,
  accept = "image/*",
  maxSizeMB = 5,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${path}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)

      onUploadComplete(publicUrl)
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Upload failed. Please try again.")
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUploadComplete("")
  }

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded-md object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-500 mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {accept.replace("*", "")} (Max: {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isUploading} />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
