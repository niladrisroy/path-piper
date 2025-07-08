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
import { Camera, ImagePlus, Plus, Trash2, Save, Calendar, MapPin, Users, Book, Building, Image as ImageIcon, Edit } from "lucide-react"
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
  gallery?: Array<{
    id: string
    url: string
    caption: string
  }>
}

interface InstitutionEditFormProps {
  institutionData: InstitutionData
}

export default function InstitutionEditForm({ institutionData }: InstitutionEditFormProps) {
  // CSS to hide scrollbar for webkit browsers
  const hideScrollbarStyle = `
    #form-container::-webkit-scrollbar {
      display: none;
    }
  `
  const router = useRouter()
  const { toast } = useToast()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [activeSection, setActiveSection] = useState("about")
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
        description: "",
        features: [""],
        images: [""],
        learnMoreLink: ""
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

  // Auto-scroll detection for form container
  useEffect(() => {
    const formContainer = document.getElementById('form-container')
    if (!formContainer) return

    const handleScroll = () => {
      const scrollPosition = formContainer.scrollTop + 50 // Small offset

      let currentSection = "about"
      let closestDistance = Infinity

      // Check each section to find which one is currently most visible
      sections.forEach(({ id }) => {
        const element = sectionRefs[id as keyof typeof sectionRefs]?.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const containerRect = formContainer.getBoundingClientRect()

        // Calculate position relative to the scrollable container
        const elementTop = element.offsetTop
        const elementBottom = elementTop + rect.height

        // Check if element is in viewport of the scrollable container
        const viewportTop = formContainer.scrollTop + 50
        const viewportBottom = formContainer.scrollTop + formContainer.clientHeight

        if (elementBottom > viewportTop && elementTop < viewportBottom) {
          const distanceFromTop = Math.abs(elementTop - viewportTop)
          if (distanceFromTop < closestDistance) {
            closestDistance = distanceFromTop
            currentSection = id
          }
        }
      })

      setActiveSection(currentSection)
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    formContainer.addEventListener('scroll', throttledScroll, { passive: true })
    // Call initially to set correct active section
    handleScroll()

    return () => formContainer.removeEventListener('scroll', throttledScroll)
  }, [])

  // Scroll to section when clicking navigation
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs[sectionId as keyof typeof sectionRefs]?.current
    const formContainer = document.getElementById('form-container')

    if (element && formContainer) {
      const offsetTop = element.offsetTop - 20 // Small offset from top

      formContainer.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })

      // Update active section immediately for better UX
      setActiveSection(sectionId)
    }
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

  // Facility functionality
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false)

  useEffect(() => {
    if (institutionData) {
      // Fetch existing facilities
      fetchFacilities()
    }
  }, [institutionData])

  const fetchFacilities = async () => {
    try {
      setIsLoadingFacilities(true)
      const response = await fetch('/api/institution/facilities')
      if (response.ok) {
        const data = await response.json()
        if (data.facilities && data.facilities.length > 0) {
          const formattedFacilities = data.facilities.map((facility: any) => ({
            id: facility.id, // Include ID for existing facilities
            name: facility.name,
            description: facility.description,
            features: facility.features || [''],
            images: facility.images || [''],
            learnMoreLink: facility.learnMoreLink || ''
          }))
          setFormData(prev => ({
            ...prev,
            facilities: formattedFacilities
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error)
    } finally {
      setIsLoadingFacilities(false)
    }
  }

  // Facility handlers
  const addFacility = () => {
    const newFacility = {
      name: '',
      description: '',
      features: [''],
      images: [''],
      learnMoreLink: ''
      // No ID field - this marks it as a new facility
    }
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, newFacility]
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
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  useEffect(() => {
    if (institutionData) {
      // Fetch existing events
      fetchEvents()
    }
  }, [institutionData])

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      const response = await fetch('/api/institution/events')
      if (response.ok) {
        const data = await response.json()
        if (data.events && data.events.length > 0) {
          const formattedEvents = data.events.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
            location: event.location || "",
            imageUrl: event.imageUrl || "",
            registrationUrl: event.registrationUrl || ""
          }))
          setFormData(prev => ({
            ...prev,
            events: formattedEvents
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

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

  const removeEvent = async (index: number) => {
    const eventToRemove = formData.events[index]

    // If it's an existing event (has an ID), delete it from database
    if (eventToRemove.id && eventToRemove.id !== '') {
      try {
        const response = await fetch(`/api/institution/events?id=${eventToRemove.id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete event')
        }

        toast({
          title: "Success",
          description: "Event deleted successfully!",
        })
      } catch (error) {
        console.error('Error deleting event:', error)
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        })
        return // Don't remove from UI if database deletion failed
      }
    }

    // Remove from UI
    const newEvents = formData.events.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      events: newEvents
    }))
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

  const handleFacilityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, facilityIndex: number) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Upload to server first
        const uploadData = new FormData()
        uploadData.append('file', file)

        const response = await fetch('/api/upload/institution-facility', {
          method: 'POST',
          body: uploadData
        })

        if (response.ok) {
          const data = await response.json()
          const newImages = [data.url]
          
          // Update the facility with the uploaded image URL
          updateFacility(facilityIndex, 'images', newImages)
          
          toast({
            title: "Success",
            description: "Image uploaded successfully!",
          })
        } else {
          console.error('Failed to upload facility image')
          toast({
            title: "Error",
            description: "Failed to upload facility image. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error uploading facility image:', error)
        toast({
          title: "Error",
          description: "Failed to upload facility image. Please try again.",
          variant: "destructive",
        })
      }
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

  // Save functions for each section
  const saveAboutSection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/institution/profile', {
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

      if (!response.ok) {
        throw new Error('Failed to update about section')
      }

      toast({
        title: "Success",
        description: "About section updated successfully!",
      })
    } catch (error) {
      console.error('Error updating about section:', error)
      toast({
        title: "Error",
        description: "Failed to update about section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgramsSection = async () => {
    setIsLoading(true)
    try {
      const validPrograms = programs.filter(program =>
        program.name.trim() !== '' &&
        program.type.trim() !== '' &&
        program.level.trim() !== '' &&
        program.duration.trim() !== '' &&
        program.description.trim() !== ''
      )

      const response = await fetch('/api/institution/programs', {
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

      if (!response.ok) {
        throw new Error('Failed to save programs')
      }

      toast({
        title: "Success",
        description: "Programs updated successfully!",
      })
    } catch (error) {
      console.error('Error updating programs:', error)
      toast({
        title: "Error",
        description: "Failed to update programs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveEventsSection = async () => {
    setIsLoading(true)
    try {
      const validEvents = formData.events.filter(event =>
        event.title.trim() !== '' &&
        event.description.trim() !== '' &&
        event.eventType.trim() !== '' &&
        event.startDate.trim() !== ''
      )

      const response = await fetch('/api/institution/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: validEvents,
          preserveExisting: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save events')
      }

      toast({
        title: "Success",
        description: "Events updated successfully!",
      })
    } catch (error) {
      console.error('Error updating events:', error)
      toast({
        title: "Error",
        description: "Failed to update events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

      // Save events - only send new events without IDs or existing events that were modified
      const validEvents = formData.events.filter(event =>
        event.title.trim() !== '' &&
        event.description.trim() !== '' &&
        event.eventType.trim() !== '' &&
        event.startDate.trim() !== ''
      )

      const eventsResponse = await fetch('/api/institution/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: validEvents,
          preserveExisting: true
        }),
      })

      if (!eventsResponse.ok) {
        throw new Error('Failed to save events')
      }

      toast({
        title: "Success",
        description: "Profile, programs, and events updated successfully!",
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

        {/* Save Button for About Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveAboutSection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save About Section'}
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

              <div className="space-y-2">                <Label>Program Type</Label>
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
                  </SelectContent>                </Select>
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

        {/* Save Button for Programs Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveProgramsSection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Programs Section'}
          </Button>
        </div>
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

        {/* Save Button for Faculty Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => {
              toast({
                title: "Info",
                description: "Faculty section saved! (This is a placeholder - implement faculty save API)",
              })
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Faculty Section
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Component for existing facility cards with edit functionality
  const ExistingFacilityCard = ({ facility, onUpdate }: { facility: any, onUpdate: () => void }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState(facility)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
      setIsSaving(true)
      try {
        // Validate required fields
        if (!editData.name.trim() || !editData.description.trim()) {
          toast({
            title: "Error",
            description: "Please fill in facility name and description.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        const response = await fetch('/api/institution/facilities', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            facilities: [editData]
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update facility')
        }

        toast({
          title: "Success",
          description: "Facility updated successfully!",
        })

        setIsEditing(false)
        onUpdate() // Refresh the facilities list
      } catch (error) {
        console.error('Error updating facility:', error)
        toast({
          title: "Error",
          description: "Failed to update facility. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }

    const handleCancel = () => {
      setEditData(facility) // Reset to original data
      setIsEditing(false)
    }

    if (isEditing) {
      return (
        <div className="p-6 border rounded-lg bg-blue-50 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-blue-900">Editing: {facility.name}</h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facility Name</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Library"
              />
            </div>

            <div className="space-y-2">
              <Label>Current Image</Label>
              {editData.images?.[0] && (
                <div className="mt-2">
                  <img 
                    src={editData.images[0]} 
                    alt="Facility" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Facility Description</Label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the facility"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            {editData.features.map((feature: string, featureIndex: number) => (
              <div key={featureIndex} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...editData.features]
                    newFeatures[featureIndex] = e.target.value
                    setEditData(prev => ({ ...prev, features: newFeatures }))
                  }}
                  placeholder={`Feature ${featureIndex + 1}`}
                  className="flex-1"
                />
                {editData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFeatures = editData.features.filter((_: any, i: number) => i !== featureIndex)
                      setEditData(prev => ({ ...prev, features: newFeatures }))
                    }}
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
              onClick={() => {
                const newFeatures = [...editData.features, ""]
                setEditData(prev => ({ ...prev, features: newFeatures }))
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Learn More Link</Label>
            <Input
              value={editData.learnMoreLink || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, learnMoreLink: e.target.value }))}
              placeholder={`Learn more about ${editData.name || 'this facility'}`}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="p-6 border rounded-lg bg-gray-50 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="font-semibold text-gray-900">{facility.name}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            </div>
            
            <p className="text-gray-600 mb-3">{facility.description}</p>
            
            {facility.features && facility.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {facility.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {facility.learnMoreLink && (
              <a 
                href={facility.learnMoreLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn more about {facility.name}
              </a>
            )}
          </div>
          
          {facility.images?.[0] && (
            <div className="ml-4">
              <img 
                src={facility.images[0]} 
                alt={facility.name} 
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFacilitiesSection = () => {
    // Separate existing facilities from new ones
    const existingFacilities = formData.facilities.filter(facility => facility.id)
    const newFacilities = formData.facilities.filter(facility => !facility.id)

    return (
      <Card ref={sectionRefs.facilities}>
        <CardHeader>
          <CardTitle>Facilities & Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingFacilities ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading facilities...</p>
            </div>
          ) : (
            <>
              {/* Existing Facilities - Display as individual editable cards */}
              {existingFacilities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Existing Facilities</h3>
                  {existingFacilities.map((facility, index) => (
                    <ExistingFacilityCard 
                      key={facility.id} 
                      facility={facility} 
                      onUpdate={fetchFacilities}
                    />
                  ))}
                </div>
              )}

              {/* New Facilities - Traditional form layout */}
              {newFacilities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">New Facilities</h3>
                  {newFacilities.map((facility, newFacilityIndex) => {
                    // Find the actual index in formData.facilities array
                    const actualIndex = existingFacilities.length + newFacilityIndex
                    return (
                      <div key={`new-facility-${newFacilityIndex}`} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">New Facility {newFacilityIndex + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFacility(actualIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Facility Name</Label>
                            <Input
                              value={facility.name}
                              onChange={(e) => updateFacility(actualIndex, 'name', e.target.value)}
                              placeholder="e.g., Main Library"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Facility Image</Label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFacilityImageUpload(e, actualIndex)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {facility.images?.[0] && (
                                <div className="mt-2">
                                  <img 
                                    src={facility.images[0]} 
                                    alt="Facility preview" 
                                    className="w-32 h-32 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Facility Description</Label>
                          <Textarea
                            value={facility.description}
                            onChange={(e) => updateFacility(actualIndex, 'description', e.target.value)}
                            placeholder="e.g., The Stanford University Libraries hold more than 9.5 million volumes and 6 million digital resources."
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Features</Label>
                          {facility.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...facility.features]
                                  newFeatures[featureIndex] = e.target.value
                                  updateFacility(actualIndex, 'features', newFeatures)
                                }}
                                placeholder={`Feature ${featureIndex + 1} (e.g., 24/7 Access, Study Rooms)`}
                                className="flex-1"
                              />
                              {facility.features.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newFeatures = facility.features.filter((_, i) => i !== featureIndex)
                                    updateFacility(actualIndex, 'features', newFeatures)
                                  }}
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
                            onClick={() => {
                              const newFeatures = [...facility.features, ""]
                              updateFacility(actualIndex, 'features', newFeatures)
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Feature
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Learn More Link</Label>
                          <Input
                            value={facility.learnMoreLink || ''}
                            onChange={(e) => updateFacility(actualIndex, 'learnMoreLink', e.target.value)}
                            placeholder={`Learn more about ${facility.name || 'this facility'}`}
                          />
                          <p className="text-xs text-gray-500">
                            Optional: Add a link for users to learn more about this facility
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add New Facility Button */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFacility}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Facility
                </Button>
              </div>

              {/* Save Button for New Facilities Only */}
              {newFacilities.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        const validNewFacilities = newFacilities.filter(facility =>
                          facility.name.trim() !== '' &&
                          facility.description.trim() !== ''
                        )

                        if (validNewFacilities.length === 0) {
                          toast({
                            title: "Info",
                            description: "Please fill in facility name and description before saving.",
                          })
                          setIsLoading(false)
                          return
                        }

                        const response = await fetch('/api/institution/facilities', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            facilities: validNewFacilities
                          }),
                        })

                        if (!response.ok) {
                          throw new Error('Failed to save facilities')
                        }

                        toast({
                          title: "Success",
                          description: "New facilities saved successfully!",
                        })

                        // Clear new facilities from form and refresh existing facilities
                        setFormData(prev => ({
                          ...prev,
                          facilities: prev.facilities.filter(facility => facility.id) // Keep only existing facilities
                        }))
                        
                        // Refresh the facilities list to show the newly saved facilities
                        await fetchFacilities()
                      } catch (error) {
                        console.error('Error saving new facilities:', error)
                        toast({
                          title: "Error",
                          description: "Failed to save new facilities. Please try again.",
                          variant: "destructive",
                        })
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading || newFacilities.some(f => !f.name.trim() || !f.description.trim())}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save New Facilities'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderEventsSection = () => (
    <Card ref={sectionRefs.events}>
      <CardHeader>
        <CardTitle>Events & Programs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingEvents ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading events...</p>
          </div>
        ) : (
          formData.events.map((event, index) => (
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
                    placeholder="e.g., Annual Tech Conference"
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
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="exhibition">Exhibition</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={event.startDate}
                    onChange={(e) => updateEvent(index, 'startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={event.endDate}
                    onChange={(e) => updateEvent(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={event.description}
                  onChange={(e) => updateEvent(index, 'description', e.target.value)}
                  placeholder="Describe the event and what participants can expect"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={event.location}
                    onChange={(e) => updateEvent(index, 'location', e.target.value)}
                    placeholder="e.g., Main Auditorium, Online"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Registration URL (Optional)</Label>
                  <Input
                    value={event.registrationUrl}
                    onChange={(e) => updateEvent(index, 'registrationUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Image URL (Optional)</Label>
                <Input
                  value={event.imageUrl}
                  onChange={(e) => updateEvent(index, 'imageUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addEvent}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>

        {/* Save Button for Events Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveEventsSection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Events Section'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderGallerySection = () => (
    <Card ref={sectionRefs.gallery}>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.gallery.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Gallery Item {index + 1}</h4>
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

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={item.imageUrl}
                onChange={(e) => updateGalleryItem(index, 'imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Caption</Label>
              <Input
                value={item.caption}
                onChange={(e) => updateGalleryItem(index, 'caption', e.target.value)}
                placeholder="Describe this image"
              />
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
          Add Gallery Item
        </Button>

        {/* Save Button for Gallery Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => {
              toast({
                title: "Info",
                description: "Gallery section saved! (This is a placeholder - implement gallery save API)",
              })
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Gallery Section
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="sticky top-24">
            <nav className="space-y-2">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div 
              id="form-container" 
              className="space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto pr-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {renderAboutSection()}
              {renderProgramsSection()}
              {renderFacultySection()}
              {renderFacilitiesSection()}
              {renderEventsSection()}
              {renderGallerySection()}

              {/* Global Save Button */}
              <div className="flex justify-end pt-8 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save All Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}