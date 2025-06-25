
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Send, Loader2, User, Target, BookOpen, Award, Lightbulb, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface StudentData {
  profile: any
  interests: any[]
  skills: any[]
  educationHistory: any[]
  achievements: any[]
  goals: any[]
}

export default function SelfAnalysisPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [query, setQuery] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'student') {
      router.push('/feed')
      return
    }

    fetchStudentData()
  }, [user, loading, router])

  const fetchStudentData = async () => {
    try {
      setDataLoading(true)
      
      // Fetch complete student profile data
      const response = await fetch(`/api/student/profile/${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch profile data')
      }
      
      const data = await response.json()
      
      // Fetch additional data that might not be in the main profile endpoint
      const [skillsRes, interestsRes, goalsRes, achievementsRes] = await Promise.all([
        fetch('/api/user/skills'),
        fetch('/api/user/interests'),
        fetch('/api/goals'),
        fetch('/api/achievements')
      ])

      const [skills, interests, goals, achievements] = await Promise.all([
        skillsRes.ok ? skillsRes.json() : [],
        interestsRes.ok ? interestsRes.json() : [],
        goalsRes.ok ? goalsRes.json() : [],
        achievementsRes.ok ? achievementsRes.json() : []
      ])

      const studentData: StudentData = {
        profile: data.profile || {},
        interests: data.interests || interests,
        skills: data.skills || skills,
        educationHistory: data.educationHistory || [],
        achievements: achievements,
        goals: goals
      }

      setStudentData(studentData)
      console.log('🔍 Student data cached for analysis:', studentData)
    } catch (error) {
      console.error('Error fetching student data:', error)
      toast.error('Failed to load your profile data')
    } finally {
      setDataLoading(false)
    }
  }

  const handleAnalysis = async () => {
    if (!query.trim() || !studentData) {
      toast.error('Please enter your question')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/self-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          studentData
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysis(result.analysis)
      toast.success('Analysis complete!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze your profile. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile data...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                AI Self Analysis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get personalized insights about your academic journey, skills, and goals. Our AI analyzes your complete profile to provide tailored guidance and recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Summary */}
              <div className="lg:col-span-1">
                <Card className="h-fit sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Summary
                    </CardTitle>
                    <CardDescription>
                      Your cached profile data for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Basic Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {studentData?.profile?.firstName} {studentData?.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{studentData?.profile?.bio || 'No bio available'}</p>
                    </div>

                    {/* Interests */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Interests ({studentData?.interests?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {studentData?.interests?.slice(0, 6).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest.name || interest.interest?.name}
                          </Badge>
                        ))}
                        {(studentData?.interests?.length || 0) > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{(studentData?.interests?.length || 0) - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Skills ({studentData?.skills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {studentData?.skills?.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {skill.name || skill.skill?.name}
                          </Badge>
                        ))}
                        {(studentData?.skills?.length || 0) > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{(studentData?.skills?.length || 0) - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Education ({studentData?.educationHistory?.length || 0})
                      </h4>
                      {studentData?.educationHistory?.length > 0 ? (
                        <div className="space-y-2">
                          {studentData.educationHistory.slice(0, 2).map((edu, index) => (
                            <div key={index} className="text-xs">
                              <p className="font-medium">{edu.institutionName}</p>
                              <p className="text-gray-500">{edu.degreeProgram}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No education history added</p>
                      )}
                    </div>

                    {/* Goals & Achievements */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Goals
                        </h4>
                        <p className="text-xs text-gray-500">{studentData?.goals?.length || 0} goals set</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Achievements
                        </h4>
                        <p className="text-xs text-gray-500">{studentData?.achievements?.length || 0} achievements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Interface */}
              <div className="lg:col-span-2 space-y-6">
                {/* Query Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ask for Analysis</CardTitle>
                    <CardDescription>
                      Ask any question about your academic journey, career prospects, skill gaps, or get recommendations based on your profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("Analyze my skills and suggest areas for improvement based on my goals.")}
                        className="text-left justify-start"
                      >
                        Skill Gap Analysis
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("What career paths align with my interests and current education?")}
                        className="text-left justify-start"
                      >
                        Career Recommendations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("How can I improve my profile to achieve my goals faster?")}
                        className="text-left justify-start"
                      >
                        Profile Enhancement
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("Give me a reality check - where do I stand in my academic journey?")}
                        className="text-left justify-start"
                      >
                        Reality Check
                      </Button>
                    </div>
                    
                    <Textarea
                      placeholder="Type your question here... For example: 'What are my strengths and weaknesses?', 'How can I improve my profile?', 'What career paths suit me best?'"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    
                    <Button 
                      onClick={handleAnalysis}
                      disabled={!query.trim() || isAnalyzing}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing your profile...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Get AI Analysis
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        AI Analysis Results
                      </CardTitle>
                      <CardDescription>
                        Personalized insights based on your complete profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                          {analysis}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Tips for better analysis:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Be specific about what you want to know</li>
                      <li>• Ask about skill gaps, career alignment, or improvement areas</li>
                      <li>• Complete your profile sections for more accurate insights</li>
                      <li>• Ask follow-up questions to dive deeper into recommendations</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
