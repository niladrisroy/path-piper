"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, ImagePlus, Plus, Trash2, Save, Calendar, MapPin, Users, Book, Building, Image as ImageIcon, Menu, X } from "lucide-react"
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

  const [activeSection, setActiveSection] = useState("about")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    // About section
    overview: institutionData.overview || "",
    mission: institutionData.mission || "",
    coreValues: Array.isArray(institutionData.coreValues) ? institutionData.coreValues : [""],

    // Programs section
    programs: [
      {
        id: "",
        name: "",
        type: "",
        level: "",
        duration: "",
        durationType: "",
        description: "",
        eligibility: "",
        outcomes: "",
        assessment: "",
        certification: "",
        schedule: ""
      }
    ],

    // Faculty section
    faculty: [
      {
        id: "",
        name: "",
        position: "",
        department: "",
        qualifications: "",
        experience: "",
        specialization: "",
        profileImage: "",
        bio: ""
      }
    ],

    // Facilities section
    facilities: [
      {
        id: "",
        name: "",
        type: "",
        description: "",
        capacity: "",
        features: [""],
        images: [""],
        availability: ""
      }
    ],

    // Events section
    events: [
      {
        id: "",
        title: "",
        description: "",
        eventType: "",
        startDate: "",
        endDate: "",
        location: "",
        imageUrl: "",
        registrationUrl: ""
      }
    ],

    // Gallery section
    gallery: [
      {
        id: "",
        imageUrl: "",
        caption: ""
      }
    ]
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(institutionData.logo)
  const [coverPreview, setCoverPreview] = useState<string | null>(institutionData.coverImage)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Refs for scroll-to-section functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    faculty: useRef<HTMLDivElement>(null),
    facilities: useRef<HTMLDivElement>(null),
    events: useRef<HTMLDivElement>(null),
    gallery: useRef<HTMLDivElement>(null)
  }

  const sections = [
    { id: "about", label: "About", icon: Building },
    { id: "programs", label: "Programs", icon: Book },
    { id: "faculty", label: "Faculty", icon: Users },
    { id: "facilities", label: "Facilities", icon: Building },
    { id: "events", label: "Events", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon }
  ]

  // Auto-scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const centerPoint = containerRect.height / 2

      let currentSection = "about"
      let minDistance = Infinity

      sections.forEach(({ id }) => {
        const element = sectionRefs[id as keyof typeof sectionRefs]?.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const containerRect = containerRef.current!.getBoundingClientRect()

        // Calculate distance from section center to viewport center
        const sectionTop = rect.top - containerRect.top
        const sectionBottom = rect.bottom - containerRect.top
        const sectionCenter = (sectionTop + sectionBottom) / 2
        const distance = Math.abs(sectionCenter - centerPoint)

        if (distance < minDistance) {
          minDistance = distance
          currentSection = id
        }
      })

      setActiveSection(currentSection)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      // Call initially to set correct active section
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Scroll to section when clicking navigation
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs[sectionId as keyof typeof sectionRefs]?.current
    if (element && containerRef.current) {
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      const offsetTop = elementRect.top - containerRect.top + container.scrollTop - 100 // 100px offset from top

      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
    // Close sidebar on mobile after selection
    setIsSidebarOpen(false)
  }

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

  // program functionality
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: '',
      type: '',
      level: '',
      duration: '',
      durationType: 'years',
      description: '',
      eligibility: '',
      outcomes: '',
    },
  ])
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)

  useEffect(() => {
    if (institutionData) {
      setFormData(prev => ({
        ...prev,
        overview: institutionData.overview || '',
        mission: institutionData.mission || '',
        coreValues: Array.isArray(institutionData.coreValues) ? institutionData.coreValues : [''],
      }))

      // Fetch existing programs
      fetchPrograms()
    }
  }, [institutionData])

  const fetchPrograms = async () => {
    try {
      setIsLoadingPrograms(true)
      const response = await fetch('/api/institution/programs')
      if (response.ok) {
        const data = await response.json()
        if (data.programs && data.programs.length > 0) {
          const formattedPrograms = data.programs.map((program: any, index: number) => ({
            id: index + 1,
            name: program.name || '',
            type: program.type || '',
            level: program.level || '',
            duration: program.durationValue?.toString() || '',
            durationType: program.durationType || '',
            description: program.description || '',
            eligibility: program.eligibility || '',
            outcomes: program.learningOutcomes || '',
          }))
          setPrograms(formattedPrograms)
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setIsLoadingPrograms(false)
    }
  }

  const addProgram = () => {
    setPrograms([
      ...programs,
      {
        id: programs.length + 1,
        name: '',
        type: '',
        level: '',
        duration: '',
        durationType: 'years',
        description: '',
        eligibility: '',
        outcomes: '',
      },
    ])
  }

  const removeProgram = (index: number) => {
    const updatedPrograms = [...programs]
    updatedPrograms.splice(index, 1)
    setPrograms(updatedPrograms)
  }

  const updateProgram = (index: number, field: string, value: string) => {
    const updatedPrograms = [...programs]
    updatedPrograms[index] = { ...updatedPrograms[index], [field]: value }
    setPrograms(updatedPrograms)
  }

  // Faculty handlers
  const addFaculty = () => {
    setFormData(prev => ({
      ...prev,
      faculty: [...prev.faculty, {
        id: "",
        name: "",
        position: "",
        department: "",
        qualifications: "",
        experience: "",
        specialization: "",
        profileImage: "",
        bio: ""
      }]
    }))
  }

  const removeFaculty = (index: number) => {
    if (formData.faculty.length > 1) {
      const newFaculty = formData.faculty.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        faculty: newFaculty
      }))
    }
  }

  const updateFaculty = (index: number, field: string, value: string) => {
    const newFaculty = [...formData.faculty]
    newFaculty[index] = { ...newFaculty[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      faculty: newFaculty
    }))
  }

  // Facility handlers
  const addFacility = () => {
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, {
        id: "",
        name: "",
        type: "",
        description: "",
        capacity: "",
        features: [""],
        images: [""],
        availability: ""
      }]
    }))
  }

  const removeFacility = (index: number) => {
    if (formData.facilities.length > 1) {
      const newFacilities = formData.facilities.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        facilities: newFacilities
      }))
    }
  }

  const updateFacility = (index: number, field: string, value: string | string[]) => {
    const newFacilities = [...formData.facilities]
    newFacilities[index] = { ...newFacilities[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      facilities: newFacilities
    }))
  }

  // Event handlers
  const addEvent = () => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, {
        id: "",
        title: "",
        description: "",
        eventType: "",
        startDate: "",
        endDate: "",
        location: "",
        imageUrl: "",
        registrationUrl: ""
      }]
    }))
  }

  const removeEvent = (index: number) => {
    if (formData.events.length > 1) {
      const newEvents = formData.events.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        events: newEvents
      }))
    }
  }

  const updateEvent = (index: number, field: string, value: string) => {
    const newEvents = [...formData.events]
    newEvents[index] = { ...newEvents[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      events: newEvents
    }))
  }

  // Gallery handlers
  const addGalleryItem = () => {
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, {
        id: "",
        imageUrl: "",
        caption: ""
      }]
    }))
  }

  const removeGalleryItem = (index: number) => {
    if (formData.gallery.length > 1) {
      const newGallery = formData.gallery.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        gallery: newGallery
      }))
    }
  }

  const updateGalleryItem = (index: number, field: string, value: string) => {
    const newGallery = [...formData.gallery]
    newGallery[index] = { ...newGallery[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      gallery: newGallery
    }))
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
      // Update basic profile information
      const profileResponse = await fetch('/api/institution/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overview: formData.overview,
          mission: formData.mission,
          coreValues: formData.coreValues.filter(value => value.trim() !== ''),
          logoUrl: logoPreview,
          coverImageUrl: coverPreview,
        }),
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile')
      }

      // Save programs with proper formatting
      const validPrograms = programs.filter(program =>
        program.name.trim() !== '' &&
        program.type.trim() !== '' &&
        program.level.trim() !== '' &&
        program.duration.trim() !== '' &&
        program.description.trim() !== ''
      )

      const programsResponse = await fetch('/api/institution/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programs: validPrograms.map(program => ({
            name: program.name,
            type: program.type,
            level: program.level,
            duration: program.duration,
            durationType: program.durationType || 'years',
            description: program.description,
            eligibility: program.eligibility,
            outcomes: program.outcomes,
          }))
        }),
      })

      if (!programsResponse.ok) {
        throw new Error('Failed to save programs')
      }

      toast({
        title: "Success",
        description: "Profile and programs updated successfully!",
      })
      router.push('/institution/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderAboutSection = () => (
    <Card ref={sectionRefs.about}>
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
  )

  const renderProgramsSection = () => (
    <Card ref={sectionRefs.programs}>
      <CardHeader>
        <CardTitle>Programs & Courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {programs.map((program, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Program {index + 1}</h4>
              {programs.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProgram(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input
                  value={program.name}
                  onChange={(e) => updateProgram(index, 'name', e.target.value)}
                  placeholder="e.g., Bachelor of Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label>Program Type</Label>
                <Select
                  value={program.type}
                  onValueChange={(value) => updateProgram(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={program.level}
                  onValueChange={(value) => updateProgram(index, 'level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={program.duration}
                    onChange={(e) => updateProgram(index, 'duration', e.target.value)}
                    placeholder="e.g., 4, 6, 12"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration Type</Label>
                  <Select value={program.durationType} onValueChange={(value) => updateProgram(index, 'durationType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={program.description}
                onChange={(e) => updateProgram(index, 'description', e.target.value)}
                placeholder="Describe the program curriculum and objectives"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Eligibility</Label>
                <Textarea
                  value={program.eligibility}
                  onChange={(e) => updateProgram(index, 'eligibility', e.target.value)}
                  placeholder="Entry requirements and prerequisites"
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Learning Outcomes</Label>
                <Textarea
                  value={program.outcomes}
                  onChange={(e) => updateProgram(index, 'outcomes', e.target.value)}
                  placeholder="What students will achieve"
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addProgram}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </CardContent>
    </Card>
  )

  const renderFacultySection = () => (
    <Card ref={sectionRefs.faculty}>
      <CardHeader>
        <CardTitle>Faculty & Staff</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.faculty.map((member, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Faculty Member {index + 1}</h4>
              {formData.faculty.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFaculty(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={member.name}
                  onChange={(e) => updateFaculty(index, 'name', e.target.value)}
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={member.position}
                  onChange={(e) => updateFaculty(index, 'position', e.target.value)}
                  placeholder="e.g., Professor, Assistant Professor"
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={member.department}
                  onChange={(e) => updateFaculty(index, 'department', e.target.value)}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label>Experience (Years)</Label>
                <Input
                  value={member.experience}
                  onChange={(e) => updateFaculty(index, 'experience', e.target.value)}
                  placeholder="e.g., 10"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input
                value={member.qualifications}
                onChange={(e) => updateFaculty(index, 'qualifications', e.target.value)}
                placeholder="e.g., PhD in Computer Science, MIT"
              />
            </div>

            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input
                value={member.specialization}
                onChange={(e) => updateFaculty(index, 'specialization', e.target.value)}
                placeholder="e.g., Machine Learning, Data Science"
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={member.bio}
                onChange={(e) => updateFaculty(index, 'bio', e.target.value)}
                placeholder="Brief biography and achievements"
                className="min-h-[80px]"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addFaculty}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty Member
        </Button>
      </CardContent>
    </Card>
  )

  const renderFacilitiesSection = () => (
    <Card ref={sectionRefs.facilities}>
      <CardHeader>
        <CardTitle>Facilities & Infrastructure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.facilities.map((facility, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Facility {index + 1}</h4>
              {formData.facilities.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFacility(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facility Name</Label>
                <Input
                  value={facility.name}
                  onChange={(e) => updateFacility(index, 'name', e.target.value)}
                  placeholder="e.g., Computer Lab, Library"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={facility.type}
                  onValueChange={(value) => updateFacility(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                    <SelectItem value="sports">Sports Facility</SelectItem>
                    <SelectItem value="cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  value={facility.capacity}
                  onChange={(e) => updateFacility(index, 'capacity', e.target.value)}
                  placeholder="e.g., 50 students"
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Input
                  value={facility.availability}
                  onChange={(e) => updateFacility(index, 'availability', e.target.value)}
                  placeholder="e.g., 24/7, Mon-Fri 9AM-6PM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={facility.description}
                onChange={(e) => updateFacility(index, 'description', e.target.value)}
                placeholder="Describe the facility and its features"
                className="min-h-[80px]"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addFacility}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </CardContent>
    </Card>
  )

  const renderEventsSection = () => (
    <Card ref={sectionRefs.events}>
      <CardHeader>
        <CardTitle>Events & Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.events.map((event, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Event {index + 1}</h4>
              {formData.events.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEvent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  value={event.title}
                  onChange={(e) => updateEvent(index, 'title', e.target.value)}
                  placeholder="e.g., Annual Tech Fest"
                />
              </div>

              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={event.eventType}
                  onValueChange={(value) => updateEvent(index, 'eventType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  value={event.startDate}
                  onChange={(e) => updateEvent(index, 'startDate', e.target.value)}
                  type="datetime-local"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  value={event.endDate}
                  onChange={(e) => updateEvent(index, 'endDate', e.target.value)}
                  type="datetime-local"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={event.location}
                  onChange={(e) => updateEvent(index, 'location', e.target.value)}
                  placeholder="e.g., Main Auditorium"
                />
              </div>

              <div className="space-y-2">
                <Label>Registration URL</Label>
                <Input
                  value={event.registrationUrl}
                  onChange={(e) => updateEvent(index, 'registrationUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={event.description}
                onChange={(e) => updateEvent(index, 'description', e.target.value)}
                placeholder="Describe the event, its purpose, and activities"
                className="min-h-[80px]"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEvent}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </CardContent>
    </Card>
  )

  const renderGallerySection = () => (
    <Card ref={sectionRefs.gallery}>
      <CardHeader>
        <CardTitle>Photo Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.gallery.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Image {index + 1}</h4>
              {formData.gallery.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeGalleryItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={item.imageUrl}
                  onChange={(e) => updateGalleryItem(index, 'imageUrl', e.target.value)}
                  placeholder="https://... or upload an image"
                />
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Input
                  value={item.caption}
                  onChange={(e) => updateGalleryItem(index, 'caption', e.target.value)}
                  placeholder="Describe the image"
                />
              </div>

              {item.imageUrl && (
                <div className="w-full h-48 rounded-lg overflow-hidden border">
                  <Image
                    src={item.imageUrl}
                    alt={item.caption || "Gallery image"}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={() => {
                      // Handle image load error
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addGalleryItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-full"
        >
          <Menu className="h-4 w-4 mr-2" />
          Edit Sections
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Side Navigation - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Edit Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      activeSection === id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Edit Sections</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {sections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 rounded-lg ${
                      activeSection === id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 min-w-0">
          <div
            ref={containerRef}
            className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-6 p-2 lg:p-6">
              <div ref={sectionRefs.about}>
                {renderAboutSection()}
              </div>
              <div ref={sectionRefs.programs}>
                {renderProgramsSection()}
              </div>
              <div ref={sectionRefs.faculty}>
                {renderFacultySection()}
              </div>
              <div ref={sectionRefs.facilities}>
                {renderFacilitiesSection()}
              </div>
              <div ref={sectionRefs.events}>
                {renderEventsSection()}
              </div>
              <div ref={sectionRefs.gallery}>
                {renderGallerySection()}
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 sticky bottom-0 bg-white p-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/institution/profile')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}