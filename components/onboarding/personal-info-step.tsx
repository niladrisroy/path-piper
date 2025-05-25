"use client"

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the PersonalInfo schema with Zod
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters" }).optional(),
  location: z.string().optional(),
  educationLevel: z.string().optional(),
  ageGroup: z.string(),
  profileImage: z.any().optional(),
});

// Create a type from the schema
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
  initialData: PersonalInfo;
  onComplete: (data: PersonalInfo) => void;
  onNext?: () => void;
}

export default function PersonalInfoStep({ initialData, onComplete, onNext }: PersonalInfoStepProps) {
  // Ensure initialData has default values for all fields
  const defaultData: PersonalInfo = {
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

  // Debug: More explicit form data output
  useEffect(() => {
    console.log("Form data after useState initialization:", formData);
    // Check if the form fields actually have values
    const formFields = document.querySelectorAll('input, select, textarea');
    console.log("DOM form fields:");
    formFields.forEach((field: any) => {
      if (field.id) {
        console.log(`${field.id}: ${field.value || "EMPTY"}`);
      }
    });
  }, [formData]);

  // Apply initial data when it changes (useful for async data loading)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Updating form data with new initial data");
      const newData = {
        ...defaultData,
        ...Object.fromEntries(
          Object.entries(initialData).filter(([_, v]) => v !== undefined && v !== null)
        )
      };
      setFormData(newData);

      // Also update react-hook-form data
      if (form) {
        console.log("Updating react-hook-form values");
        form.reset(newData);
      }
    }
  }, [initialData]);

  // Setup react-hook-form
  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialFormData
  });

  // Handle form submission
  const onSubmit = (data: PersonalInfo) => {
    console.log("Form submitted with data:", data);
    onComplete(data);
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-2">
          This information helps others get to know you better
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little about yourself"
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Share your interests, goals, or anything else you'd like others to know.
                </FormDescription>
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
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="pre_school">Pre-School</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="post_graduate">Post Graduate</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="ageGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your age group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="early-childhood">Early Childhood (0-8)</SelectItem>
                      <SelectItem value="elementary">Elementary (9-11)</SelectItem>
                      <SelectItem value="middle-school">Middle School (12-14)</SelectItem>
                      <SelectItem value="high-school">High School (15-18)</SelectItem>
                      <SelectItem value="young-adult">Young Adult (19+)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}