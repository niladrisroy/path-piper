"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera } from "lucide-react"

// Define age groups
export type AgeGroup = "early-childhood" | "elementary" | "middle-school" | "high-school" | "young-adult"

interface PersonalInfo {
  firstName: string
  lastName: string
  bio: string
  location: string
  educationLevel: string
  ageGroup: AgeGroup
  profileImage: any // This would be a File in a real implementation
}

interface PersonalInfoStepProps {
  initialData: PersonalInfo
  onComplete: (data: PersonalInfo) => void
  onNext: () => void
}

// Function to get recommended education level based on age group
function getRecommendedEducationLevel(ageGroup: AgeGroup): string {
  switch (ageGroup) {
    case "early-childhood":
      return "pre_school"
    case "elementary":
      return "school"
    case "middle-school":
      return "school"
    case "high-school":
      return "high_school"
    case "young-adult":
      return "undergraduate"
    default:
      return ""
  }
}

// Function to get helper text for education level based on age group
function getEducationLevelHelperText(ageGroup: AgeGroup): string {
  switch (ageGroup) {
    case "early-childhood":
      return "Typically Pre-School for ages 5-7"
    case "elementary":
      return "Typically Elementary School (Grades 1-5) for ages 8-10"
    case "middle-school":
      return "Typically Middle School (Grades 6-8) for ages 11-13"
    case "high-school":
      return "Typically High School (Grades 9-12) for ages 14-17"
    case "young-adult":
      return "Typically Undergraduate or higher for ages 18-25"
    default:
      return ""
  }
}

export default function PersonalInfoStep({ initialData, onComplete, onNext }: PersonalInfoStepProps) {
  // Ensure initialData has default values for all fields
  const defaultData: PersonalInfo = {

  // Debug: More explicit form data output
  useEffect(() => {
    console.log("Form data after useState initialization:", formData);
    // Check if the form fields actually have values
    const formFields = document.querySelectorAll('input, select, textarea');
    console.log("Form field count:", formFields.length);
    formFields.forEach((field: any) => {
      if (field.id) {
        console.log(`Field ${field.id} value:`, field.value);
      }
    });
  }, [formData]);

    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    educationLevel: "",
    ageGroup: "young-adult", // Default to young-adult
    profileImage: null,
  }

  // Merge initial data with form data, ensuring we properly handle undefined values
  const initialFormData = {
    ...defaultData,
    ...Object.fromEntries(
      Object.entries(initialData).filter(([_, v]) => v !== undefined && v !== null)
    )
  }

  console.log("PersonalInfoStep - initialData (raw):", initialData);
  console.log("PersonalInfoStep - initialFormData (merged):", initialFormData);

  // Debug: Log more details about what we received
  console.log("PersonalInfoStep - firstName value:", initialData.firstName || "NOT SET");
  console.log("PersonalInfoStep - lastName value:", initialData.lastName || "NOT SET");
  console.log("PersonalInfoStep - ageGroup value:", initialData.ageGroup || "NOT SET");
  console.log("PersonalInfoStep - educationLevel value:", initialData.educationLevel || "NOT SET");

  const [formData, setFormData] = useState<PersonalInfo>(initialFormData);
  
  // Apply initial data when it changes (useful for async data loading)
  useEffect(() => {
    if (initialData && Object.keys(initialData).some(key => initialData[key])) {
      console.log("PersonalInfoStep - Updating form data from new initialData");
      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(initialData).filter(([_, v]) => v !== undefined && v !== null)
        )
      }));
    }
  }, [initialData]);

  // Debug effect to log form data changes
  useEffect(() => {
    console.log("PersonalInfoStep - formData updated:", formData);
  }, [formData]);
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [educationHelperText, setEducationHelperText] = useState<string>("")
  const [userChangedEducation, setUserChangedEducation] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set initial helper text based on default age group
  useEffect(() => {
    setEducationHelperText(getEducationLevelHelperText(formData.ageGroup))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "ageGroup") {
      const ageGroup = value as AgeGroup
      const recommendedLevel = getRecommendedEducationLevel(ageGroup)

      setEducationHelperText(getEducationLevelHelperText(ageGroup))

      // Only auto-suggest education level if user hasn't manually changed it yet
      if (!userChangedEducation) {
        setFormData((prev) => ({
          ...prev,
          ageGroup,
          educationLevel: recommendedLevel,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          ageGroup,
        }))
      }
    } else if (name === "educationLevel") {
      // Mark that user has manually changed education level
      setUserChangedEducation(true)
      setFormData((prev) => ({
        ...prev,
        educationLevel: value,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }))

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ensure we preserve ageGroup and all fields
    onComplete({
      ...formData,
      ageGroup: formData.ageGroup || 'young-adult'
    })
    onNext()
  }

  const isFormValid =
    formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && formData.educationLevel !== ""

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
      <p className="text-slate-600 mb-6">Let's start with some basic information about you</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About Me</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself, your interests, and what you hope to achieve"
                className="rounded-lg min-h-[120px]"
              />
              <p className="text-xs text-slate-500">This will be displayed on your profile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageGroup">
                  Age Group <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.ageGroup}
                  onValueChange={(value) => handleSelectChange("ageGroup", value)}
                  required
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select your age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early-childhood">Early Childhood (5-7 years)</SelectItem>
                    <SelectItem value="elementary">Elementary (8-10 years)</SelectItem>
                    <SelectItem value="middle-school">Middle School (11-13 years)</SelectItem>
                    <SelectItem value="high-school">High School (14-17 years)</SelectItem>
                    <SelectItem value="young-adult">College/Young Adult (18-25 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationLevel">
                  Education Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) => handleSelectChange("educationLevel", value)}
                  required
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_school">Pre-School</SelectItem>
                    <SelectItem value="school">School (Grade 1-10)</SelectItem>
                    <SelectItem value="high_school">High School (Grade 11-12)</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="post_graduate">Post Graduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
                {educationHelperText && <p className="text-xs text-slate-500">{educationHelperText}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col items-center">
            <Label className="text-center mb-2">Profile Picture</Label>
            <div
              className="w-40 h-40 rounded-full bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-teal-400 transition-colors"
              onClick={triggerFileInput}
            >
              {previewImage ? (
                <Image
                  src={previewImage || "/placeholder.svg"}
                  alt="Profile preview"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 text-center px-4">Click to upload a profile picture</span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              aria-label="Upload profile picture"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Recommended: Square image, at least 400x400px</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={!isFormValid}
            className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}