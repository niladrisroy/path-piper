
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Github, Linkedin, Globe, Mail, Phone, MessageSquare, Shield, Instagram, Facebook, Twitter } from "lucide-react"

const socialContactSchema = z.object({
  instagramUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  behanceUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  dribbbleUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
})

type SocialContactData = z.infer<typeof socialContactSchema>

interface SocialContactFormProps {
  data: any
  onChange: (sectionId: string, data: SocialContactData) => void
}

export default function SocialContactForm({ data, onChange }: SocialContactFormProps) {
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

  // Update form when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        instagramUrl: data.instagramUrl || "",
        facebookUrl: data.facebookUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        twitterUrl: data.twitterUrl || "",
        behanceUrl: data.behanceUrl || "",
        dribbbleUrl: data.dribbbleUrl || "",
        portfolioUrl: data.portfolioUrl || "",
        website: data.website || "",
        email: data.email || "",
        phone: data.phone || "",
      })
    }
  }, [data, form])

  // Watch for form changes and call onChange when form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange("social", value)
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  const contactMethods = [
    {
      id: "email",
      label: "Email Address",
      placeholder: "your.email@example.com",
      icon: <Mail className="h-5 w-5" />,
      description: "For direct communication with mentors",
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

  const socialLinks = [
    {
      id: "instagramUrl",
      label: "Instagram",
      placeholder: "https://instagram.com/yourusername",
      icon: <Instagram className="h-5 w-5" />,
      description: "Share your visual content and daily updates"
    },
    {
      id: "facebookUrl",
      label: "Facebook",
      placeholder: "https://facebook.com/yourprofile",
      icon: <Facebook className="h-5 w-5" />,
      description: "Connect with friends and communities"
    },
    {
      id: "linkedinUrl",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/in/yourprofile",
      icon: <Linkedin className="h-5 w-5" />,
      description: "Connect professionally with mentors and peers"
    },
    {
      id: "twitterUrl",
      label: "Twitter",
      placeholder: "https://twitter.com/yourusername",
      icon: <Twitter className="h-5 w-5" />,
      description: "Share thoughts and engage in conversations"
    },
    {
      id: "behanceUrl",
      label: "Behance",
      placeholder: "https://behance.net/yourprofile",
      icon: <Globe className="h-5 w-5" />,
      description: "Showcase your creative projects and designs"
    },
    {
      id: "dribbbleUrl",
      label: "Dribbble",
      placeholder: "https://dribbble.com/yourusername",
      icon: <Globe className="h-5 w-5" />,
      description: "Display your design work and get inspiration"
    },
    {
      id: "portfolioUrl",
      label: "Portfolio Website",
      placeholder: "https://yourportfolio.com",
      icon: <Globe className="h-5 w-5" />,
      description: "Showcase your work and achievements"
    },
    {
      id: "website",
      label: "Personal Website",
      placeholder: "https://yourwebsite.com",
      icon: <Globe className="h-5 w-5" />,
      description: "Your personal blog or website"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Social & Contact</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your social media profiles and contact information to help others connect with you
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-8">
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactMethods.map((contact) => (
                <FormField
                  key={contact.id}
                  control={form.control}
                  name={contact.id as keyof SocialContactData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">{contact.icon}</span>
                        <span>{contact.label}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={contact.type}
                          placeholder={contact.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">{contact.description}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Social Media Profiles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialLinks.map((link) => (
                <FormField
                  key={link.id}
                  control={form.control}
                  name={link.id as keyof SocialContactData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">{link.icon}</span>
                        <span>{link.label}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={link.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">{link.description}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Privacy & Safety</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Your contact information will only be shared with verified mentors when you connect with them</li>
                  <li>• You can control who sees your social media profiles in Privacy Settings</li>
                  <li>• Phone numbers are kept private and only used for important notifications</li>
                  <li>• You can update or remove this information at any time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  )
}
