
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin, Globe, Mail, Phone, MessageSquare, Shield, Instagram, Facebook, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const socialContactSchema = z.object({
  instagramUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  twitterUrl: z.string().optional().or(z.literal("")),
  behanceUrl: z.string().optional().or(z.literal("")),
  dribbbleUrl: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
})

type SocialContactData = z.infer<typeof socialContactSchema>

interface SocialContactFormProps {
  data: any
  onChange: (sectionId: string, data: SocialContactData) => void
  userId: string
}

interface SocialLink {
  id: string
  platform: string
  url: string
  displayName?: string
}

export default function SocialContactForm({ data, onChange, userId }: SocialContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  const form = useForm<SocialContactData>({
    resolver: zodResolver(socialContactSchema),
    defaultValues: {
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      behanceUrl: "",
      dribbbleUrl: "",
      portfolioUrl: "",
      website: "",
      email: "",
      phone: "",
    }
  })

  // Fetch existing data when component mounts or userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        console.log('⚠️ SocialContactForm: No userId provided, cannot fetch data')
        return
      }

      try {
        setLoading(true)
        console.log('🔄 SocialContactForm: Fetching data for user:', userId)

        // Fetch social links from API
        const response = await fetch('/api/profile/social-contact', {
          method: 'GET',
          credentials: 'include',
        })

        console.log('📡 SocialContactForm: API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log('❌ SocialContactForm: API error response:', errorText)
          throw new Error(`Failed to fetch social contact data: ${response.status} - ${errorText}`)
        }

        const responseData = await response.json()
        console.log('📊 SocialContactForm: Raw API response:', responseData)

        const { profile, socialLinks: links } = responseData
        setSocialLinks(links || [])

        // Convert social links to form format
        const formData: Partial<SocialContactData> = {
          email: profile?.email || "",
          phone: profile?.phone || "",
          instagramUrl: "",
          facebookUrl: "",
          linkedinUrl: "",
          twitterUrl: "",
          behanceUrl: "",
          dribbbleUrl: "",
          portfolioUrl: "",
          website: "",
        }

        // Map social links to form fields - extract handles from URLs
        if (links && Array.isArray(links)) {
          links.forEach((link: SocialLink) => {
            const extractHandle = (url: string, baseUrl: string) => {
              if (!baseUrl) return url // For portfolio and website, return full URL
              return url.replace(baseUrl, '').replace(/\/$/, '') // Remove base URL and trailing slash
            }

            switch (link.platform.toLowerCase()) {
              case 'instagram':
                formData.instagramUrl = extractHandle(link.url, 'https://instagram.com/')
                break
              case 'facebook':
                formData.facebookUrl = extractHandle(link.url, 'https://facebook.com/')
                break
              case 'linkedin':
                formData.linkedinUrl = extractHandle(link.url, 'https://linkedin.com/in/')
                break
              case 'twitter':
              case 'x':
                formData.twitterUrl = extractHandle(link.url, 'https://x.com/')
                break
              case 'behance':
                formData.behanceUrl = extractHandle(link.url, 'https://behance.net/')
                break
              case 'dribbble':
                formData.dribbbleUrl = extractHandle(link.url, 'https://dribbble.com/')
                break
              case 'portfolio':
                formData.portfolioUrl = link.url
                break
              case 'website':
                formData.website = link.url
                break
            }
          })
        }

        console.log('🔄 SocialContactForm: Resetting form with data:', formData)
        form.reset(formData as SocialContactData)
        console.log('✅ SocialContactForm: Form reset completed')

      } catch (error) {
        console.error('❌ SocialContactForm: Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load existing data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    console.log('🎯 SocialContactForm: useEffect triggered with userId:', userId)
    if (userId) {
      fetchData()
    }
  }, [userId]) // Only depend on userId

  // Watch for form changes and call onChange when form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange("social", value)
    })
    return () => subscription.unsubscribe()
  }, [onChange]) // Remove form from dependencies as it's stable

  const handleSave = async (formData: SocialContactData) => {
    try {
      setLoading(true)
      console.log('💾 Saving social contact data:', formData)

      // Prepare social links data - construct full URLs from handles
      const socialLinksData = []

      const constructUrl = (handle: string, baseUrl: string) => {
        if (!baseUrl) return handle // For portfolio and website, use as-is
        return baseUrl + handle.replace(/^\/+/, '') // Remove leading slashes and prepend base URL
      }

      if (formData.instagramUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'instagram', 
          url: constructUrl(formData.instagramUrl.trim(), 'https://instagram.com/') 
        })
      }
      if (formData.facebookUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'facebook', 
          url: constructUrl(formData.facebookUrl.trim(), 'https://facebook.com/') 
        })
      }
      if (formData.linkedinUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'linkedin', 
          url: constructUrl(formData.linkedinUrl.trim(), 'https://linkedin.com/in/') 
        })
      }
      if (formData.twitterUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'x', 
          url: constructUrl(formData.twitterUrl.trim(), 'https://x.com/') 
        })
      }
      if (formData.behanceUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'behance', 
          url: constructUrl(formData.behanceUrl.trim(), 'https://behance.net/') 
        })
      }
      if (formData.dribbbleUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'dribbble', 
          url: constructUrl(formData.dribbbleUrl.trim(), 'https://dribbble.com/') 
        })
      }
      if (formData.portfolioUrl?.trim()) {
        socialLinksData.push({ platform: 'portfolio', url: formData.portfolioUrl.trim() })
      }
      if (formData.website?.trim()) {
        socialLinksData.push({ platform: 'website', url: formData.website.trim() })
      }

      // Save data via API
      const response = await fetch('/api/profile/social-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || null,
          phone: formData.phone || null,
          socialLinks: socialLinksData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save social contact data')
      }

      const result = await response.json()
      console.log('✅ Save response:', result)

      // Update local state with returned data
      if (result.socialLinks) {
        setSocialLinks(result.socialLinks)
      }

      toast({
        title: "Success",
        description: "Social & contact information saved successfully",
      })

    } catch (error) {
      console.error('❌ Error saving social contact data:', error)
      toast({
        title: "Error",
        description: "Failed to save social & contact information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const contactMethods = [
    {
      id: "email",
      label: "Email Address",
      placeholder: "your.email@example.com",
      icon: <Mail className="h-5 w-5" />,
      description: "Your registered email address (cannot be changed here)",
      type: "email"
    },
    {
      id: "phone",
      label: "Phone Number",
      placeholder: "+1 (555) 123-4567",
      icon: <Phone className="h-5 w-5" />,
      description: "Optional phone contact (will be kept private)",
      type: "tel"
    }
  ]

  const socialPlatforms = [
    {
      id: "instagramUrl",
      label: "Instagram",
      placeholder: "yourusername",
      baseUrl: "https://instagram.com/",
      icon: <Instagram className="h-5 w-5" />,
      description: "Share your visual content and daily updates",
      color: "from-pink-500 to-purple-600"
    },
    {
      id: "facebookUrl",
      label: "Facebook",
      placeholder: "yourprofile",
      baseUrl: "https://facebook.com/",
      icon: <Facebook className="h-5 w-5" />,
      description: "Connect with friends and communities",
      color: "from-blue-600 to-blue-700"
    },
    {
      id: "linkedinUrl",
      label: "LinkedIn",
      placeholder: "yourprofile",
      baseUrl: "https://linkedin.com/in/",
      icon: <Linkedin className="h-5 w-5" />,
      description: "Connect professionally with mentors and peers",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "twitterUrl",
      label: "X",
      placeholder: "yourusername",
      baseUrl: "https://x.com/",
      icon: <X className="h-5 w-5" />,
      description: "Share thoughts and engage in conversations",
      color: "from-gray-800 to-gray-900"
    },
    {
      id: "behanceUrl",
      label: "Behance",
      placeholder: "yourprofile",
      baseUrl: "https://behance.net/",
      icon: <Globe className="h-5 w-5" />,
      description: "Showcase your creative projects and designs",
      color: "from-blue-400 to-indigo-600"
    },
    {
      id: "dribbbleUrl",
      label: "Dribbble",
      placeholder: "yourusername",
      baseUrl: "https://dribbble.com/",
      icon: <Globe className="h-5 w-5" />,
      description: "Display your design work and get inspiration",
      color: "from-pink-400 to-rose-500"
    },
    {
      id: "portfolioUrl",
      label: "Portfolio Website",
      placeholder: "https://yourportfolio.com",
      baseUrl: "",
      icon: <Globe className="h-5 w-5" />,
      description: "Showcase your work and achievements",
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: "website",
      label: "Personal Website",
      placeholder: "https://yourwebsite.com",
      baseUrl: "",
      icon: <Globe className="h-5 w-5" />,
      description: "Your personal blog or website",
      color: "from-violet-500 to-purple-600"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Social & Contact</h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Connect with your community by sharing your social profiles and contact information
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-10">
          {/* Contact Information Section */}
          <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                Contact Information
              </CardTitle>
              <CardDescription className="text-base">
                Your primary contact details for professional connections
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactMethods.map((contact) => (
                  <FormField
                    key={contact.id}
                    control={form.control}
                    name={contact.id as keyof SocialContactData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-3 text-lg font-medium">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {contact.icon}
                          </div>
                          <span>{contact.label}</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={contact.type}
                            placeholder={contact.placeholder}
                            readOnly={contact.id === "email"}
                            className={`h-12 text-base ${contact.id === "email" ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500 mt-1">{contact.description}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Profiles Section */}
          <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Social Media Profiles
              </CardTitle>
              <CardDescription className="text-base">
                Share your social presence and creative portfolios
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {socialPlatforms.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control}
                    name={platform.id as keyof SocialContactData}
                    render={({ field }) => (
                      <FormItem>
                        <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-4">
                            <FormLabel className="flex items-center space-x-3 mb-3">
                              <div className={`p-2 bg-gradient-to-r ${platform.color} rounded-lg text-white shadow-sm`}>
                                {platform.icon}
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {platform.label}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                {platform.baseUrl && (
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none z-10 bg-white dark:bg-gray-900 pr-2">
                                    {platform.baseUrl}
                                  </div>
                                )}
                                <Input
                                  placeholder={platform.placeholder}
                                  className={`h-11 ${platform.baseUrl ? "pl-[200px]" : ""} border-gray-300 dark:border-gray-600 focus:border-blue-500`}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                              {platform.description}
                            </p>
                            <FormMessage />
                          </CardContent>
                        </Card>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">
                    Privacy & Safety
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Your contact information will only be shared with verified mentors when you connect with them
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        You can control who sees your social media profiles in Privacy Settings
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Phone numbers are kept private and only used for important notifications
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        You can update or remove this information at any time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span>Save Social & Contact Info</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
