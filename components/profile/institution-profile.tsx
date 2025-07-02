"use client"

import { useState } from "react"
import InstitutionProfileHeader from "./institution-profile-header"
import AboutInstitutionSection from "./about-institution-section"
import ProgramsSection from "./programs-section"
import FacultySection from "./faculty-section"
import FacilitiesSection from "./facilities-section"
import EventsSection from "./events-section"
import HorizontalNavigation from "./horizontal-navigation"
import GallerySection from "./gallery-section"

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
}

interface InstitutionProfileProps {
  institutionData: InstitutionData
}

export default function InstitutionProfile({ institutionData }: InstitutionProfileProps) {
  const [activeTab, setActiveTab] = useState("about")

  const tabs = [
    { id: "about", label: "About", icon: "building" },
    { id: "programs", label: "Programs", icon: "book-open" },
    { id: "faculty", label: "Faculty", icon: "users" },
    { id: "facilities", label: "Facilities", icon: "map-pin" },
    { id: "events", label: "Events", icon: "calendar" },
    { id: "gallery", label: "Gallery", icon: "image" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <InstitutionProfileHeader institutionData={institutionData} />

      <HorizontalNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 py-6">
        {activeTab === "about" && <AboutInstitutionSection institutionData={institutionData} />}
        {activeTab === "programs" && <ProgramsSection />}
        {activeTab === "faculty" && <FacultySection />}
        {activeTab === "facilities" && <FacilitiesSection />}
        {activeTab === "events" && <EventsSection />}
        {activeTab === "gallery" && <GallerySection />}
      </div>
    </div>
  )
}