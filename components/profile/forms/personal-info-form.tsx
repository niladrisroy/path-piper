
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Upload, User } from "lucide-react"

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  educationLevel: z.string().optional(),
  tagline: z.string().max(100, "Tagline must be less than 100 characters").optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
})

type PersonalInfoData = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  data: any
  onChange: (sectionId: string, data: PersonalInfoData) => void
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [coverImagePreview, setCoverImagePreview] = useState<string>("")

  const form = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      location: "",
      educationLevel: "",
      tagline: "",
      profileImageUrl: "",
      coverImageUrl: "",
    }
  })

  // Update form when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        location: data.location || "",
        educationLevel: data.educationLevel || "",
        tagline: data.tagline || "",
        profileImageUrl: data.profileImageUrl || "",
        coverImageUrl: data.coverImageUrl || "",
      })
      
      setProfileImagePreview(data.profileImageUrl || "")
      setCoverImagePreview(data.coverImageUrl || "")
    }
  }, [data, form])

  // Watch for form changes
  const watchedValues = form.watch()
  useEffect(() => {
    const currentData = form.getValues()
    onChange("personal", currentData)
  }, [watchedValues, onChange])

  const handleImageUpload = (type: 'profile' | 'cover', file: File) => {
    // In a real app, you'd upload to a service like Supabase storage
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === 'profile') {
        setProfileImagePreview(result)
        form.setValue('profileImageUrl', result)
      } else {
        setCoverImagePreview(result)
        form.setValue('coverImageUrl', result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us about yourself to help others get to know you better
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Profile Image Upload */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload('profile', file)
                  }}
                  className="hidden"
                  id="profile-image"
                />
                <label htmlFor="profile-image">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-4">
            <Label>Cover Image</Label>
            <div className="space-y-4">
              <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {coverImagePreview ? (
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Upload a cover image</p>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload('cover', file)
                  }}
                  className="hidden"
                  id="cover-image"
                />
                <label htmlFor="cover-image">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Cover
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A short description of yourself (e.g., 'Aspiring Software Developer')"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="City, State/Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pre_school">Pre-School</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="post_graduate">Post Graduate</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  )
}
