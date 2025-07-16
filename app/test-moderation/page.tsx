"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Flag } from "lucide-react"
import { toast } from "sonner"
import ModerationHelper from "@/components/feed/moderation-helper"

// API Status Component
function APIStatusComponent() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/moderation/status')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch API status:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center">Loading API status...</div>
  }

  if (!apiStatus) {
    return <div className="text-center text-red-600">Failed to load API status</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(apiStatus.apis).map(([name, api]: [string, any]) => (
          <div key={name} className="p-3 border rounded-lg">
            <div className="font-medium capitalize">{name.replace(/([A-Z])/g, ' $1')}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(api.status)}>
                {api.enabled ? api.status : 'disabled'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        {apiStatus.summary.totalOnline} of {apiStatus.summary.totalEnabled} enabled APIs are online
      </div>
    </div>
  )
}

interface ModerationResult {
  status: 'approved' | 'pending_review' | 'flagged' | 'rejected'
  riskScore: number
  flags: string[]
  reason?: string
  suggestions?: string[]
  requiresHumanReview: boolean
  safeAlternatives?: string[]
}

const TEST_SCENARIOS = {
  safe: [
    "I love learning math and science!",
    "Had a great day at school today with my friends.",
    "Working on a fun coding project for class.",
    "Can't wait for the science fair next week!"
  ],
  inappropriate: [
    "This teacher is so stupid and I hate school",
    "You're ugly and nobody likes you",
    "I want to hurt myself because everything is terrible",
    "Let's meet up after school, don't tell your parents"
  ],
  borderline: [
    "This assignment is really hard and frustrating",
    "I'm feeling sad about my test results",
    "Can someone help me with this difficult problem?",
    "I disagree with what my classmate said"
  ],
  personal_info: [
    "My phone number is 555-123-4567",
    "I live at 123 Main Street, Anytown USA",
    "My email is student@school.edu",
    "Come to my house at 456 Oak Avenue"
  ]
}

export default function ModerationTestPage() {
  const [testContent, setTestContent] = useState("This is a test message to check moderation")
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHelper, setShowHelper] = useState(false)
  const [testHistory, setTestHistory] = useState<Array<{content: string, result: ModerationResult}>>([])
  const [isRunningAllTests, setIsRunningAllTests] = useState(false)
  const [allTestResults, setAllTestResults] = useState<Array<{
    content: string
    result?: ModerationResult
    error?: string
    category: string
  }>>([])

  const testModeration = async (content: string) => {
    if (!content || content.trim() === '') {
      toast.error('Please enter some content to test')
      return
    }

    setIsLoading(true)
    console.log('Testing moderation for content:', content)

    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          type: 'post',
          userId: 'test-user-id',
          imageUrl: null
        })
      })

      console.log('Moderation API response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Moderation API response data:', data)

      if (!data.moderation) {
        throw new Error('No moderation data in response')
      }

      const result = data.moderation as ModerationResult

      setModerationResult(result)
      setTestHistory(prev => [...prev, { content, result }].slice(-10))

      if (result.status === 'rejected') {
        toast.error("Content rejected - violates safety guidelines")
      } else if (result.status === 'pending_review') {
        toast.warning("Content requires human review")
      } else if (result.status === 'flagged') {
        toast.warning("Content flagged for potential issues")
      } else {
        toast.success("Content approved!")
      }
    } catch (error) {
      console.error('Moderation test failed:', error)
      toast.error(`Failed to test moderation: ${(error as Error).message}`)
      setModerationResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setIsRunningAllTests(true)
    setAllTestResults([])

    const allTestCases = []

    Object.entries(TEST_SCENARIOS).forEach(([category, examples]) => {
      examples.forEach(example => {
        allTestCases.push({ content: example, category })
      })
    })

    const results = []

    for (const testCase of allTestCases) {
      try {
        console.log(`Testing: ${testCase.content}`)

        const response = await fetch('/api/moderation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: testCase.content,
            type: 'post',
            userId: 'batch-test-user-id',
            imageUrl: null
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.moderation) {
          throw new Error('No moderation data in response')
        }

        results.push({
          content: testCase.content,
          result: data.moderation,
          category: testCase.category
        })

        console.log(`✅ Test passed for: ${testCase.content.substring(0, 50)}...`)

      } catch (error) {
        console.error(`❌ Test failed for: ${testCase.content}`, error)
        results.push({
          content: testCase.content,
          error: (error as Error).message,
          category: testCase.category
        })
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setAllTestResults(results)
    setIsRunningAllTests(false)

    const errorCount = results.filter(r => r.error).length
    const successCount = results.filter(r => !r.error).length

    if (errorCount > 0) {
      toast.error(`Tests completed: ${successCount} passed, ${errorCount} failed`)
    } else {
      toast.success(`All ${successCount} tests passed!`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending_review':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'flagged':
        return <Flag className="h-5 w-5 text-orange-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'flagged': return 'bg-orange-100 text-orange-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 25) return 'text-red-600 bg-red-100'
    if (score >= 15) return 'text-orange-600 bg-orange-100'
    if (score >= 5) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  if (showHelper) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ModerationHelper
          content={testContent}
          onSuggestionSelect={(suggestion) => {
            setTestContent(suggestion)
            setShowHelper(false)
          }}
          onClose={() => setShowHelper(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Enter content to test moderation..."
                className="min-h-[120px]"
              />

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    console.log('Test button clicked, content:', testContent)
                    testModeration(testContent)
                  }}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Testing..." : "Test Moderation"}
                </Button>

                <Button 
                  onClick={runAllTests}
                  disabled={isRunningAllTests}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRunningAllTests ? "Running All Tests..." : "🔥 Test All Scenarios"}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => setShowHelper(true)}
                  disabled={!testContent.trim()}
                >
                  Get Suggestions
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => {
                    setTestContent("")
                    setModerationResult(null)
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderation Result</CardTitle>
            </CardHeader>
            <CardContent>
              {moderationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(moderationResult.status)}
                    <Badge className={getStatusColor(moderationResult.status)}>
                      {moderationResult.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getRiskScoreColor(moderationResult.riskScore)}>
                      Risk: {moderationResult.riskScore}
                    </Badge>
                  </div>

                  {moderationResult.reason && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{moderationResult.reason}</AlertDescription>
                    </Alert>
                  )}

                  {moderationResult.flags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Flags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {moderationResult.flags.map((flag, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {flag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {moderationResult.suggestions && moderationResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {moderationResult.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {moderationResult.safeAlternatives && moderationResult.safeAlternatives.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Safe Alternatives:</h4>
                      <div className="space-y-1">
                        {moderationResult.safeAlternatives.map((alt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setTestContent(alt)}
                            className="mr-2 mb-2"
                          >
                            {alt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Enter content and click "Test Moderation" to see results</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pre-built Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="safe">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="safe">Safe Content</TabsTrigger>
                <TabsTrigger value="inappropriate">Inappropriate</TabsTrigger>
                <TabsTrigger value="borderline">Borderline</TabsTrigger>
                <TabsTrigger value="personal_info">Personal Info</TabsTrigger>
              </TabsList>

              {Object.entries(TEST_SCENARIOS).map(([category, examples]) => (
                <TabsContent key={category} value={category} className="space-y-2">
                  {examples.map((example, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm flex-1">{example}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTestContent(example)
                          testModeration(example)
                        }}
                      >
                        Test
                      </Button>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {allTestResults.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                All Test Results
                <Badge variant="outline" className="ml-2">
                  {allTestResults.filter(r => !r.error).length}/{allTestResults.length} passed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="errors">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="errors">
                    Errors ({allTestResults.filter(r => r.error).length})
                  </TabsTrigger>
                  <TabsTrigger value="all">All Results</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="errors" className="space-y-3">
                  {allTestResults.filter(r => r.error).length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">No errors found!</p>
                      <p className="text-sm">All tests passed successfully.</p>
                    </div>
                  ) : (
                    allTestResults.filter(r => r.error).map((test, index) => (
                      <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive">{test.category}</Badge>
                              <span className="text-sm font-medium text-red-800">ERROR</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2 font-mono bg-gray-100 p-2 rounded">
                              {test.content}
                            </p>
                            <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                              <strong>Error:</strong> {test.error}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-3">
                  {allTestResults.map((test, index) => (
                    <div key={index} className={`p-3 border rounded ${test.error ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        {test.error ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          getStatusIcon(test.result?.status || 'unknown')
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{test.category}</Badge>
                            {test.result && (
                              <>
                                <Badge className={getStatusColor(test.result.status)}>
                                  {test.result.status}
                                </Badge>
                                <Badge className={getRiskScoreColor(test.result.riskScore)}>
                                  {test.result.riskScore}
                                </Badge>
                              </>
                            )}
                            {test.error && <Badge variant="destructive">ERROR</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{test.content}</p>
                          {test.error && (
                            <p className="text-xs text-red-600 mt-1">{test.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {allTestResults.filter(r => !r.error).length}
                      </div>
                      <div className="text-sm text-green-700">Passed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {allTestResults.filter(r => r.error).length}
                      </div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {allTestResults.length}
                      </div>
                      <div className="text-sm text-blue-700">Total Tests</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Object.keys(TEST_SCENARIOS).length}
                      </div>
                      <div className="text-sm text-purple-700">Categories</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Results by Category:</h4>
                    {Object.keys(TEST_SCENARIOS).map(category => {
                      const categoryResults = allTestResults.filter(r => r.category === category)
                      const errorCount = categoryResults.filter(r => r.error).length
                      const successCount = categoryResults.filter(r => !r.error).length

                      return (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              ✓ {successCount}
                            </Badge>
                            {errorCount > 0 && (
                              <Badge variant="outline" className="bg-red-100 text-red-700">
                                ✗ {errorCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {testHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Individual Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testHistory.slice().reverse().map((test, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    {getStatusIcon(test.result.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{test.content}</p>
                    </div>
                    <Badge className={getStatusColor(test.result.status)}>
                      {test.result.status}
                    </Badge>
                    <Badge className={getRiskScoreColor(test.result.riskScore)}>
                      {test.result.riskScore}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>External API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <APIStatusComponent />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Moderation System Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <a href="/admin/moderation" target="_blank">
                  View Admin Dashboard
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/feed" target="_blank">
                  Test in Live Feed
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/api/moderation/status" target="_blank">
                  API Status JSON
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        {/* Changed p to div to fix HTML nesting error */}

    </div>
  )
}