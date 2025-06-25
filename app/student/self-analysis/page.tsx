
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

interface AnalysisCard {
  id: string
  title: string
  content: string
  color: string
  icon: string
}

// Streaming Text Component
function StreamingText({ text, delay = 50, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, delay, onComplete])

  return (
    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
      )}
    </div>
  )
}

// Analysis Card Network Component
function AnalysisCardNetwork({ analysis }: { analysis: string }) {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [streamingCardIndex, setStreamingCardIndex] = useState(0)

  // Parse analysis into cards
  const parseAnalysisIntoCards = (analysisText: string): AnalysisCard[] => {
    const sections = analysisText.split(/(?=##\s)|(?=###\s)|(?=####\s)/).filter(Boolean)
    const cards: AnalysisCard[] = []
    
    const colors = [
      'from-purple-500 to-blue-600',
      'from-blue-500 to-cyan-600', 
      'from-cyan-500 to-teal-600',
      'from-teal-500 to-green-600',
      'from-green-500 to-lime-600',
      'from-yellow-500 to-orange-600',
      'from-orange-500 to-red-600',
      'from-red-500 to-pink-600',
      'from-pink-500 to-purple-600'
    ]
    
    const icons = ['🎯', '💡', '🚀', '⭐', '🔍', '💪', '🌟', '🎨', '📚']

    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) return

      let title = 'Analysis Point'
      let content = section

      // Extract title from markdown headers
      const headerMatch = lines[0].match(/^#{1,4}\s+(.+)/)
      if (headerMatch) {
        title = headerMatch[1]
        content = lines.slice(1).join('\n').trim()
      }

      // Clean content for display
      content = content
        .replace(/#{1,4}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/- /g, '• ')
        .trim()

      if (content) {
        cards.push({
          id: `card-${index}`,
          title,
          content,
          color: colors[index % colors.length],
          icon: icons[index % icons.length]
        })
      }
    })

    return cards
  }

  const cards = parseAnalysisIntoCards(analysis)

  useEffect(() => {
    // Show first card immediately
    if (cards.length > 0) {
      setVisibleCards([0])
      setStreamingCardIndex(0)
    }
  }, [cards.length])

  const handleStreamingComplete = (cardIndex: number) => {
    const nextIndex = cardIndex + 1
    if (nextIndex < cards.length) {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, nextIndex])
        setStreamingCardIndex(nextIndex)
      }, 500)
    }
  }

  const getCardPosition = (index: number) => {
    const row = Math.floor(index / 3)
    const col = index % 3
    return { row, col }
  }

  const renderConnectionLine = (fromIndex: number, toIndex: number) => {
    const fromPos = getCardPosition(fromIndex)
    const toPos = getCardPosition(toIndex)
    
    if (fromPos.row === toPos.row) {
      // Horizontal connection
      return (
        <div 
          className="absolute h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 z-10 animate-pulse"
          style={{
            top: '50%',
            left: '100%',
            width: '2rem',
            transform: 'translateY(-50%)'
          }}
        />
      )
    } else {
      // Vertical connection to next row
      return (
        <div className="absolute flex items-center justify-center z-10">
          <div 
            className="w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 animate-pulse"
            style={{
              height: '3rem',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          <div 
            className="absolute w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translate(-50%, 1.5rem)'
            }}
          />
        </div>
      )
    }
  }

  return (
    <div className="space-y-8">
      {Array.from({ length: Math.ceil(cards.length / 3) }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {cards.slice(rowIndex * 3, (rowIndex + 1) * 3).map((card, colIndex) => {
            const cardIndex = rowIndex * 3 + colIndex
            const isVisible = visibleCards.includes(cardIndex)
            const isStreaming = streamingCardIndex === cardIndex
            
            return (
              <div key={card.id} className="relative">
                <Card 
                  className={`transition-all duration-700 transform ${
                    isVisible 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  } ${isStreaming ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-200 dark:shadow-blue-900' : ''}`}
                >
                  <CardHeader className={`bg-gradient-to-r ${card.color} text-white rounded-t-lg`}>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{card.icon}</span>
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isVisible && (
                      <StreamingText 
                        text={card.content}
                        delay={30}
                        onComplete={() => handleStreamingComplete(cardIndex)}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Connection Lines */}
                {isVisible && cardIndex < cards.length - 1 && (
                  <div className="absolute top-1/2 left-full">
                    {renderConnectionLine(cardIndex, cardIndex + 1)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
      
      {/* Progress Indicator */}
      <div className="flex justify-center items-center space-x-2 mt-8">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Analysis Progress:
        </div>
        <div className="flex space-x-1">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                visibleCards.includes(index)
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {visibleCards.length}/{cards.length}
        </div>
      </div>
    </div>
  )
}

export default function SelfAnalysisPage() {
  const { user, loading, profileData, profileDataLoading } = useAuth()
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [query, setQuery] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

    // Use cached data if available, otherwise fetch
    if (profileData) {
      console.log('🚀 Using cached profile data for self-analysis')
      setStudentData(profileData)
    } else if (!profileDataLoading) {
      fetchStudentData()
    }
  }, [user, loading, router, profileData, profileDataLoading])

  // Format analysis text with proper HTML formatting
  const formatAnalysisText = (text: string) => {
    return text
      // Convert markdown-style headers to HTML
      .replace(/#### (.*?)$/gm, '<h4 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3 flex items-center"><span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>$1</h4>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold text-purple-600 dark:text-purple-400 mt-8 mb-4 flex items-center"><span class="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-6 border-l-4 border-purple-500 pl-4">$1</h2>')
      
      // Convert bullet points to styled lists
      .replace(/- \*\*(.*?)\*\*: (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><div><span class="font-semibold text-blue-700 dark:text-blue-300">$1:</span> <span class="text-gray-700 dark:text-gray-300">$2</span></div></div>')
      .replace(/- (.*?)$/gm, '<div class="flex items-start space-x-3 mb-2"><div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-gray-700 dark:text-gray-300">$1</span></div>')
      
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      
      // Convert numbered lists
      .replace(/(\d+)\. (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"><div class="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full flex-shrink-0">$1</div><span class="text-gray-700 dark:text-gray-300">$2</span></div>')
      
      // Convert line breaks to proper spacing
      .replace(/\n\n/g, '<div class="my-4"></div>')
      .replace(/\n/g, '<br/>')
  }

  const fetchStudentData = async () => {
    try {
      console.log('⚠️ Fallback: Fetching profile data (cache miss)')
      
      const response = await fetch(`/api/student/profile/${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch profile data')
      }
      
      const data = await response.json()
      
      const studentData: StudentData = {
        profile: {
          ...data.profile,
          ageGroup: data.ageGroup || 'young_adult',
          educationLevel: data.educationLevel || 'undergraduate'
        },
        interests: data.profile?.userInterests || [],
        skills: data.profile?.userSkills || [],
        educationHistory: data.educationHistory || [],
        achievements: data.profile?.customBadges || [],
        goals: data.profile?.careerGoals || []
      }

      setStudentData(studentData)
      console.log('📦 Fallback data loaded:', {
        interests: studentData.interests.length,
        skills: studentData.skills.length,
        education: studentData.educationHistory.length,
        goals: studentData.goals.length,
        achievements: studentData.achievements.length
      })
    } catch (error) {
      console.error('Error fetching student data:', error)
      toast.error('Failed to load your profile data')
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

  if (loading || (profileDataLoading && !studentData)) {
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
        <style jsx global>{`
          .analysis-content h2 {
            border-left: 4px solid #8b5cf6;
            padding-left: 1rem;
            margin: 2rem 0 1.5rem 0;
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
          }
          .dark .analysis-content h2 {
            color: #f3f4f6;
          }
          .analysis-content h3 {
            margin: 2rem 0 1rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #7c3aed;
            display: flex;
            align-items: center;
          }
          .dark .analysis-content h3 {
            color: #a78bfa;
          }
          .analysis-content h4 {
            margin: 1.5rem 0 0.75rem 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #2563eb;
            display: flex;
            align-items: center;
          }
          .dark .analysis-content h4 {
            color: #60a5fa;
          }
          
          /* Card Network Animations */
          @keyframes cardSlideIn {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes connectionGlow {
            0%, 100% {
              opacity: 0.6;
              transform: scaleX(1);
            }
            50% {
              opacity: 1;
              transform: scaleX(1.1);
            }
          }
          
          .card-network-enter {
            animation: cardSlideIn 0.7s ease-out;
          }
          
          .connection-line {
            animation: connectionGlow 2s ease-in-out infinite;
          }
          
          /* Streaming text cursor */
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          .streaming-cursor {
            animation: blink 1s infinite;
          }
        `}</style>
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
                        Interests ({Array.isArray(studentData?.interests) ? studentData.interests.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(studentData?.interests) && studentData.interests.slice(0, 6).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest.name || interest.interest?.name}
                          </Badge>
                        ))}
                        {Array.isArray(studentData?.interests) && studentData.interests.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{studentData.interests.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Skills ({Array.isArray(studentData?.skills) ? studentData.skills.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(studentData?.skills) && studentData.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {skill.name || skill.skill?.name}
                          </Badge>
                        ))}
                        {Array.isArray(studentData?.skills) && studentData.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{studentData.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Education ({Array.isArray(studentData?.educationHistory) ? studentData.educationHistory.length : 0})
                      </h4>
                      {Array.isArray(studentData?.educationHistory) && studentData.educationHistory.length > 0 ? (
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
                        <p className="text-xs text-gray-500">{Array.isArray(studentData?.goals) ? studentData.goals.length : 0} goals set</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Achievements
                        </h4>
                        <p className="text-xs text-gray-500">{Array.isArray(studentData?.achievements) ? studentData.achievements.length : 0} achievements</p>
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
                          Analyzing... (30-60s)
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Get AI Analysis
                        </>
                      )}
                    </Button>
                    
                    {isAnalyzing && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          🤖 AI is processing your profile data... This usually takes 30-60 seconds for detailed analysis.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Analysis Results - Card Network */}
                {analysis && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        AI Analysis Network
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Personalized insights flowing through your profile analysis
                      </p>
                    </div>
                    <AnalysisCardNetwork analysis={analysis} />
                  </div>
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
