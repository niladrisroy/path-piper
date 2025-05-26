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
  birthMonth: z.string(),
  birthYear: z.string(),
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
    birthMonth: "",
    birthYear: "",
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
  console.log("PersonalInfoStep - birthMonth value:", initialData.birthMonth || "NOT SET");
  console.log("PersonalInfoStep - birthYear value:", initialData.birthYear || "NOT SET");
  console.log("PersonalInfoStep - educationLevel value:", initialData.educationLevel || "NOT SET");
  
  // Additional debug for empty data
  console.log("PersonalInfoStep - All initialData keys:", Object.keys(initialData));
  console.log("PersonalInfoStep - Empty fields:", Object.entries(initialData).filter(([k, v]) => !v || v === "").map(([k]) => k));

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

  // Setup react-hook-form
  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialFormData
  });

  // Apply initial data when it changes (useful for async data loading)
  useEffect(() => {
    console.log("PersonalInfoStep useEffect triggered with initialData:", initialData);
    
    // Check if we have meaningful data (not just empty strings)
    const hasValidData = initialData && (
      initialData.firstName || 
      initialData.lastName || 
      initialData.birthMonth || 
      initialData.birthYear ||
      initialData.educationLevel ||
      initialData.bio ||
      initialData.location
    );
    
    if (hasValidData) {
      console.log("PersonalInfoStep: Found valid data, updating form");
      const newData = {
        ...defaultData,
        ...Object.fromEntries(
          Object.entries(initialData).filter(([_, v]) => v !== undefined && v !== null)
        )
      };
      console.log("PersonalInfoStep: New form data will be:", newData);
      setFormData(newData);

      // Force update react-hook-form values - use setTimeout to ensure state updates
      setTimeout(() => {
        form.reset(newData);
        console.log("PersonalInfoStep: Form values after reset:", form.getValues());
      }, 0);
    } else {
      console.log("PersonalInfoStep: No valid data found in initialData");
    }
  }, [initialData, form]);

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
              name="birthMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Month</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-200 cursor-not-allowed">
                          <SelectValue placeholder="Month from registration">
                            {field.value && field.value !== "" ? 
                              ["", "January", "February", "March", "April", "May", "June", 
                               "July", "August", "September", "October", "November", "December"][parseInt(field.value)] || "Month from registration"
                              : "Month from registration"
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Year</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Year from registration"
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled
                      className="bg-slate-50 border-slate-200 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                          <SelectValue placeholder="Choose your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="pre_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Pre-School
                          </SelectItem>
                          <SelectItem value="school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            School
                          </SelectItem>
                          <SelectItem value="high_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            High School
                          </SelectItem>
                          <SelectItem value="undergraduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Undergraduate
                          </SelectItem>
                          <SelectItem value="graduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Graduate
                          </SelectItem>
                          <SelectItem value="post_graduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Post Graduate
                          </SelectItem>
                          <SelectItem value="phd" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            PhD
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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