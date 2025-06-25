"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

interface InstitutionRegistrationProps {
  onComplete: () => void
}

// Required field indicator component
const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>

export default function InstitutionRegistration({ onComplete }: InstitutionRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    institutionName: "",
    category: "",
    institutionTypeId: "",
    contactFirstName: "",
    contactLastName: "",
    contactTitle: "",
    email: "",
    password: "",
    phone: "",
    description: "",
    website: "",
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onComplete()
    }, 1500)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-center">Register Your Institution</h2>
      <p className="text-slate-600 mb-6 text-center">Connect your organization with students and mentors</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institutionName">
              Institution Name
              <RequiredIndicator />
            </Label>
            <Input
              id="institutionName"
              name="institutionName"
              placeholder="Enter institution name"
              value={formData.institutionName}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category
              <RequiredIndicator />
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger className="rounded-lg border-slate-300">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="vocational">Vocational</SelectItem>
                <SelectItem value="arts">Arts & Performance</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institutionTypeId">
            Institution Type ID
            <RequiredIndicator />
          </Label>
          <Select value={formData.institutionTypeId} onValueChange={(value) => handleSelectChange("institutionTypeId", value)}>
            <SelectTrigger className="rounded-lg border-slate-300">
              <SelectValue placeholder="Select institution type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">University</SelectItem>
              <SelectItem value="2">College</SelectItem>
              <SelectItem value="3">School</SelectItem>
              <SelectItem value="4">Training Center</SelectItem>
              <SelectItem value="5">Institute</SelectItem>
              <SelectItem value="6">Academy</SelectItem>
              <SelectItem value="7">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactFirstName">
              Contact First Name
              <RequiredIndicator />
            </Label>
            <Input
              id="contactFirstName"
              name="contactFirstName"
              placeholder="Enter contact person's first name"
              value={formData.contactFirstName}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactLastName">
              Contact Last Name
              <RequiredIndicator />
            </Label>
            <Input
              id="contactLastName"
              name="contactLastName"
              placeholder="Enter contact person's last name"
              value={formData.contactLastName}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactTitle">
            Job Title
            <RequiredIndicator />
          </Label>
          <Input
            id="contactTitle"
            name="contactTitle"
            placeholder="e.g. Career Counselor, Principal"
            value={formData.contactTitle}
            onChange={handleChange}
            required
            className="rounded-lg border-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
              <RequiredIndicator />
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter institutional email"
              value={formData.email}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
            <p className="text-xs text-slate-500">Preferably an institutional email</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="rounded-lg border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password
            <RequiredIndicator />
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500">Password must be at least 8 characters long</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://your-institution.edu"
            value={formData.website}
            onChange={handleChange}
            className="rounded-lg border-slate-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Institution Description
            <RequiredIndicator />
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell students about your institution"
            value={formData.description}
            onChange={handleChange}
            required
            className="rounded-lg border-slate-300 min-h-[100px]"
          />
          <p className="text-xs text-slate-500">This will be visible on your institution profile</p>
        </div>

        <div className="space-y-2">
          <Label>Institution Logo</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <Eye className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 mb-1">Drag and drop your logo here, or click to browse</p>
              <p className="text-xs text-slate-500">PNG, JPG or SVG (max. 2MB)</p>
              <Button type="button" variant="outline" className="mt-4 rounded-lg border-slate-300">
                Upload Logo
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => {
              setFormData({
                ...formData,
                agreeTerms: checked as boolean,
              })
            }}
            required
            className="mt-1 border-slate-300"
          />
          <div>
            <Label htmlFor="agreeTerms" className="text-sm text-slate-600">
              I agree to the{" "}
              <a href="/terms" className="text-purple-500 hover:text-purple-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-purple-500 hover:text-purple-600">
                Privacy Policy
              </a>
              <RequiredIndicator />
            </Label>
            <p className="text-xs text-slate-500">
              By registering, you confirm that you are authorized to represent this institution on PathPiper.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeTerms}
          className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-full py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Registering Institution...
            </div>
          ) : (
            "Register Institution"
          )}
        </Button>
      </form>
    </div>
  )
}