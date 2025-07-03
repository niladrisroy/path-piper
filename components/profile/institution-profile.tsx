
"use client"

import { useState, useEffect, useRef } from "react"
import InstitutionProfileHeader from "./institution-profile-header"
import AboutInstitutionSection from "./about-institution-section"
import ProgramsSection from "./programs-section"
import FacultySection from "./faculty-section"
import FacilitiesSection from "./facilities-section"
import EventsSection from "./events-section"
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
  const [activeSection, setActiveSection] = useState("about")
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const sections = [
    { id: "about", label: "About" },
    { id: "programs", label: "Programs" },
    { id: "faculty", label: "Faculty" },
    { id: "facilities", label: "Facilities" },
    { id: "events", label: "Events" },
    { id: "gallery", label: "Gallery" },
  ]

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollTop = containerRef.current.scrollTop
      const containerHeight = containerRef.current.clientHeight

      // Find which section is currently most visible
      let currentSection = "about"
      let maxVisibleArea = 0

      sections.forEach(({ id }) => {
        const element = sectionRefs.current[id]
        if (!element) return

        const rect = element.getBoundingClientRect()
        const containerRect = containerRef.current!.getBoundingClientRect()
        
        // Calculate how much of the section is visible
        const visibleTop = Math.max(rect.top, containerRect.top)
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        
        if (visibleHeight > maxVisibleArea) {
          maxVisibleArea = visibleHeight
          currentSection = id
        }
      })

      setActiveSection(currentSection)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle sidebar navigation click
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollTop = containerRef.current.scrollTop
      const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 20

      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstitutionProfileHeader institutionData={institutionData} />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <nav className="space-y-2">
                  {sections.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1">
            <div 
              ref={containerRef}
              className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="space-y-8 pr-4">
                <div 
                  ref={(el) => sectionRefs.current['about'] = el}
                  id="about"
                  className="scroll-mt-6"
                >
                  <AboutInstitutionSection institutionData={institutionData} />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['programs'] = el}
                  id="programs"
                  className="scroll-mt-6"
                >
                  <ProgramsSection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['faculty'] = el}
                  id="faculty"
                  className="scroll-mt-6"
                >
                  <FacultySection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['facilities'] = el}
                  id="facilities"
                  className="scroll-mt-6"
                >
                  <FacilitiesSection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['events'] = el}
                  id="events"
                  className="scroll-mt-6"
                >
                  <EventsSection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['gallery'] = el}
                  id="gallery"
                  className="scroll-mt-6"
                >
                  <GallerySection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
