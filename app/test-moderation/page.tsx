
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
  const [testContent, setTestContent] = useState("")
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHelper, setShowHelper] = useState(false)
  const [testHistory, setTestHistory] = useState<Array<{content: string, result: ModerationResult}>>([])

  const testModeration = async (content: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: 'post',
          userId: 'test-user-id',
          imageUrl: null
        })
      })

      const data = await response.json()
      const result = data.moderation as ModerationResult
      
      setModerationResult(result)
      setTestHistory(prev => [...prev, { content, result }].slice(-10)) // Keep last 10 tests
      
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
      toast.error('Failed to test moderation')
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Content Moderation Testing
          </h1>
          <p className="text-gray-600">Test the AI-powered content moderation system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Input */}
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
                  onClick={() => testModeration(testContent)}
                  disabled={!testContent.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Testing..." : "Test Moderation"}
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

          {/* Results */}
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

        {/* Test Scenarios */}
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

        {/* Test History */}
        {testHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
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

        {/* Quick Links */}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
