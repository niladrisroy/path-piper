"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Info, AlertCircle } from "lucide-react"
import { getSupabase } from "@/lib/supabase/client"
import { createUserProfiles, sendParentApprovalEmail } from "@/app/actions/auth-actions"

interface StudentRegistrationProps {
  onComplete: (isUnder16: boolean) => void
}

// Required field indicator component
const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>

export default function StudentRegistration({ onComplete }: StudentRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUnder16, setIsUnder16] = useState(true)
  const [ageDisplay, setAgeDisplay] = useState<{ years: number; months: number; totalMonths: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthMonth: "",
    birthYear: "",
    parentEmail: "",
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    // Reset email exists error when email is changed
    if (name === "email" && emailExists) {
      setEmailExists(false)
      setError(null)
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Check if email exists when email field loses focus
  const checkEmailExists = async () => {
    if (!formData.email || !formData.email.includes("@")) return

    setIsCheckingEmail(true)
    try {
      const supabase = getSupabase()
      if (!supabase) return

      const { data, error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false,
        },
      })

      // If no error, the email exists
      if (!error) {
        setEmailExists(true)
        setError("This email is already registered. Please use a different email or sign in.")
      }
    } catch (err) {
      // Ignore errors here - we're just checking if the email exists
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Calculate age in years and months whenever birth month or year changes
  useEffect(() => {
    if (formData.birthMonth && formData.birthYear) {
      // Get current date components
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1 // Convert to 1-based month for calculation

      // Get birth date components
      const birthYear = Number.parseInt(formData.birthYear, 10)
      const birthMonth = Number.parseInt(formData.birthMonth, 10) // Already 1-based from form

      // Calculate age
      let years = currentYear - birthYear
      let months = currentMonth - birthMonth

      // Adjust years and months if birth month hasn't occurred yet this year
      if (months < 0) {
        years--
        months += 12
      }

      // Calculate total months
      const totalMonths = years * 12 + months

      // Set state
      setAgeDisplay({ years, months, totalMonths })
      setIsUnder16(totalMonths < 192) // 192 months = 16 years
    } else {
      setAgeDisplay(null)
    }
  }, [formData.birthMonth, formData.birthYear])

  // Helper function to determine age group based on years
  const getAgeGroup = (years: number) => {
    if (years < 8) return "early-childhood"
    if (years < 11) return "elementary"
    if (years < 14) return "middle-school"
    if (years < 18) return "high-school"
    return "young-adult"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't proceed if email already exists
    if (emailExists) {
      setError("This email is already registered. Please use a different email or sign in.")
      return
    }

    setIsLoading(true)
    setError(null)
    setStatusMessage(null)

    try {
      const supabase = getSupabase()

      if (!supabase) {
        // If Supabase client isn't available, use demo mode
        console.log("Using demo mode for registration")
        setStatusMessage("Demo mode: Simulating registration process...")
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        onComplete(isUnder16)
        return
      }

      // Step 1: Check if email exists
      setStatusMessage("Checking email availability...")
      const { error: emailCheckError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false,
        },
      })

      // If no error, the email exists
      if (!emailCheckError) {
        setEmailExists(true)
        setError("This email is already registered. Please use a different email or sign in.")
        setIsLoading(false)
        return
      }

      // Step 2: Create the user with Supabase Auth
      setStatusMessage("Creating your account...")
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: "student",
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setEmailExists(true)
          throw new Error("This email is already registered. Please use a different email or sign in.")
        }
        throw new Error(`Authentication error: ${signUpError.message}`)
      }

      if (!authData.user) {
        throw new Error("User creation failed: No user returned from auth")
      }

      console.log("Auth signup successful, user ID:", authData.user.id)

      // Step 3: Create the profile records using the server action
      setStatusMessage("Setting up your profile...")
      const ageGroup = ageDisplay ? getAgeGroup(ageDisplay.years) : "young-adult"
      const parentEmail = isUnder16 ? formData.parentEmail : null

      const result = await createUserProfiles(
        authData.user.id,
        formData.firstName,
        formData.lastName,
        ageGroup,
        parentEmail,
      )

      if (!result.success) {
        throw new Error(`Profile creation failed: ${result.error}`)
      }

      // Step 4: If under 16, send parent approval email
      if (isUnder16 && parentEmail) {
        setStatusMessage("Sending parent approval request...")
        const approvalResult = await sendParentApprovalEmail(
          authData.user.id,
          formData.firstName,
          formData.lastName,
          parentEmail,
        )

        if (!approvalResult.success) {
          console.warn("Parent approval email could not be sent:", approvalResult.error)
          // Continue anyway, we'll handle this later
        }
      }

      setStatusMessage(
        isUnder16
          ? "Account created successfully! A confirmation email has been sent to your email address, and an approval request has been sent to your parent/guardian."
          : "Account created successfully! A confirmation email has been sent to your email address.",
      )

      // Call onComplete with the isUnder16 value
      setTimeout(() => {
        onComplete(isUnder16)
      }, 2000) // Give user time to read the success message
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "An unexpected error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate birth year options (3+ years old)
  const currentYear = new Date().getFullYear()
  const birthYearOptions = []
  for (let i = currentYear - 25; i <= currentYear - 3; i++) {
    birthYearOptions.push(i)
  }

  // Generate month options
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-center">Create Student Account</h2>
      <p className="text-slate-600 mb-6 text-center">Let's get you started on your journey</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          <p className="font-medium">Registration Error</p>
          <p>{error}</p>
        </div>
      )}

      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md mb-4">
          <p className="font-medium">Status</p>
          <p>{statusMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name
              <RequiredIndicator />
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name
              <RequiredIndicator />
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            <RequiredIndicator />
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            onBlur={checkEmailExists}
            required
            className={`rounded-lg ${emailExists ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-300"}`}
          />
          {isCheckingEmail && <p className="text-xs text-slate-500 mt-1">Checking email...</p>}
          {emailExists && <p className="text-xs text-red-500 mt-1">This email is already registered</p>}
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
              minLength={8}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birthMonth">
              Birth Month
              <RequiredIndicator />
            </Label>
            <Select
              value={formData.birthMonth}
              onValueChange={(value) => handleSelectChange("birthMonth", value)}
              required
            >
              <SelectTrigger className="rounded-lg border-slate-300">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthYear">
              Birth Year
              <RequiredIndicator />
            </Label>
            <Select
              value={formData.birthYear}
              onValueChange={(value) => handleSelectChange("birthYear", value)}
              required
            >
              <SelectTrigger className="rounded-lg border-slate-300">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {birthYearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {ageDisplay && (
          <div
            className={`p-4 rounded-lg ${isUnder16 ? "bg-blue-50 border border-blue-100" : "bg-green-50 border border-green-100"}`}
          >
            <div className="flex items-start">
              <div className={`mr-3 mt-1 ${isUnder16 ? "text-blue-500" : "text-green-500"}`}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="font-semibold text-xl mb-1">
                  Age: <span className="text-2xl">{ageDisplay.years}</span> years and{" "}
                  <span className="text-2xl">{ageDisplay.months}</span> months
                </div>
                {isUnder16 ? (
                  <p className="text-sm text-slate-600">
                    As you are under 16 years old, you'll need parent/guardian consent to create an account. Please
                    provide their email below.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    You're 16 or older! You can create your account without parent/guardian consent.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isUnder16 && (
          <div className="space-y-2">
            <div className="flex items-start">
              <Label htmlFor="parentEmail" className="flex-1">
                Parent/Guardian Email
                <RequiredIndicator />
              </Label>
              <div className="group relative">
                <Info size={16} className="text-slate-400 cursor-help" />
                <div className="absolute right-0 w-64 p-2 bg-white rounded-lg shadow-lg border border-slate-200 text-xs text-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  We'll send a verification email to your parent/guardian for consent, as required for users under 16.
                </div>
              </div>
            </div>
            <Input
              id="parentEmail"
              name="parentEmail"
              type="email"
              placeholder="Enter parent/guardian email"
              value={formData.parentEmail}
              onChange={handleChange}
              required={isUnder16}
              className="rounded-lg border-slate-300"
            />
            <p className="text-xs text-slate-500">Required for users under 16 years old</p>
          </div>
        )}

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
          <div className="space-y-1">
            <Label htmlFor="agreeTerms" className="text-sm text-slate-600">
              I agree to the{" "}
              <a href="/terms" className="text-teal-500 hover:text-teal-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-teal-500 hover:text-teal-600">
                Privacy Policy
              </a>
              <RequiredIndicator />
            </Label>
            <p className="text-xs text-slate-500">
              By creating an account, you agree to receive emails from PathPiper about your account and updates.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeTerms || emailExists}
          className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  )
}
