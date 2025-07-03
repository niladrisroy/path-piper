"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Users, Award, ArrowRight, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Program {
  id: string
  name: string
  type: string
  level: string
  durationValue: number
  durationType: string
  description: string
  eligibility?: string | null
  learningOutcomes?: string | null
  assessment?: string | null
  certification?: string | null
  schedule?: string | null
}

interface ProgramsSectionProps {
  institutionId?: string
  isOwner?: boolean
}

export default function ProgramsSection({ institutionId, isOwner = false }: ProgramsSectionProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/institution/programs')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setPrograms(data.programs)
          }
        }
      } catch (error) {
        console.error('Error fetching programs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const toggleProgramExpansion = (id: string) => {
    setExpandedProgram(expandedProgram === id ? null : id)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Added Yet</h3>
              <p className="text-gray-500 mb-4">
                {isOwner 
                  ? "Start by adding your first program to showcase what your institution offers."
                  : "This institution hasn't added any programs yet."
                }
              </p>
              {isOwner && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Program
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Programs ({programs.length})
          </CardTitle>
          {isOwner && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {programs.map((program) => (
            <div key={program.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Program header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleProgramExpansion(program.id)}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{program.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {program.type}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {program.level}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {program.durationValue} {program.durationType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle edit
                      }}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <ArrowRight className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedProgram === program.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Expanded program details */}
              {expandedProgram === program.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{program.description}</p>
                  </div>

                  {program.eligibility && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Eligibility/Prerequisites</h5>
                      <p className="text-sm text-gray-600">{program.eligibility}</p>
                    </div>
                  )}

                  {program.learningOutcomes && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Outcomes</h5>
                      <p className="text-sm text-gray-600">{program.learningOutcomes}</p>
                    </div>
                  )}

                  {program.assessment && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Assessment Methods</h5>
                      <p className="text-sm text-gray-600">{program.assessment}</p>
                    </div>
                  )}

                  {program.certification && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Certification/Qualification</h5>
                      <p className="text-sm text-gray-600">{program.certification}</p>
                    </div>
                  )}

                  {program.schedule && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Schedule Information</h5>
                      <p className="text-sm text-gray-600">{program.schedule}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}