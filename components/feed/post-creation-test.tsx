
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  duration?: number
}

export default function PostCreationTest() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { user } = useAuth()

  const updateTest = (name: string, status: 'success' | 'error', message?: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.duration = duration
        return [...prev]
      }
      return [...prev, { name, status, message, duration }]
    })
  }

  const runTests = async () => {
    if (!user) {
      toast.error("Please log in to run tests")
      return
    }

    setIsRunning(true)
    setTests([])

    // Test 1: Create basic text post
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `Basic test post created at ${new Date().toISOString()}`,
          postType: 'GENERAL'
        })
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Create Basic Post', 'success', `Post ID: ${data.post?.id}`, duration)
      } else {
        const error = await response.json()
        updateTest('Create Basic Post', 'error', `HTTP ${response.status}: ${error.error}`)
      }
    } catch (error) {
      updateTest('Create Basic Post', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 2: Create post with hashtags
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `Post with #hashtags #testing #pathpiper created at ${new Date().toISOString()}`,
          postType: 'GENERAL',
          tags: ['hashtags', 'testing', 'pathpiper']
        })
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Create Post with Hashtags', 'success', `Post ID: ${data.post?.id}`, duration)
      } else {
        const error = await response.json()
        updateTest('Create Post with Hashtags', 'error', `HTTP ${response.status}: ${error.error}`)
      }
    } catch (error) {
      updateTest('Create Post with Hashtags', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 3: Create achievement post
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `🏆 Just completed my first coding project! #achievement #coding`,
          postType: 'ACHIEVEMENT',
          isAchievement: true,
          achievementType: 'Project Completion',
          tags: ['achievement', 'coding']
        })
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Create Achievement Post', 'success', `Post ID: ${data.post?.id}`, duration)
      } else {
        const error = await response.json()
        updateTest('Create Achievement Post', 'error', `HTTP ${response.status}: ${error.error}`)
      }
    } catch (error) {
      updateTest('Create Achievement Post', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 4: Create question post
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `How do I get started with machine learning? Any good resources? #question #ml`,
          postType: 'QUESTION',
          isQuestion: true,
          difficultyLevel: 'beginner',
          tags: ['question', 'ml']
        })
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Create Question Post', 'success', `Post ID: ${data.post?.id}`, duration)
      } else {
        const error = await response.json()
        updateTest('Create Question Post', 'error', `HTTP ${response.status}: ${error.error}`)
      }
    } catch (error) {
      updateTest('Create Question Post', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 5: Create project post
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `Built a weather app using React and OpenWeather API! Check it out: #project #react #javascript`,
          postType: 'PROJECT',
          projectCategory: 'Web Development',
          difficultyLevel: 'intermediate',
          tags: ['project', 'react', 'javascript']
        })
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Create Project Post', 'success', `Post ID: ${data.post?.id}`, duration)
      } else {
        const error = await response.json()
        updateTest('Create Project Post', 'error', `HTTP ${response.status}: ${error.error}`)
      }
    } catch (error) {
      updateTest('Create Project Post', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 6: Test character limit (should fail)
    try {
      const longContent = "A".repeat(300) // Exceeds 287 character limit
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: longContent,
          postType: 'GENERAL'
        })
      })
      const duration = Date.now() - start
      
      if (!response.ok) {
        const error = await response.json()
        if (error.suggestTrail) {
          updateTest('Character Limit Validation', 'success', 'Correctly rejected long content and suggested trail', duration)
        } else {
          updateTest('Character Limit Validation', 'success', 'Correctly rejected long content', duration)
        }
      } else {
        updateTest('Character Limit Validation', 'error', 'Should have rejected long content')
      }
    } catch (error) {
      updateTest('Character Limit Validation', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 7: Fetch created posts
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts?limit=5', {
        credentials: 'include'
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Fetch Posts', 'success', `Fetched ${data.posts?.length || 0} posts`, duration)
      } else {
        updateTest('Fetch Posts', 'error', `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTest('Fetch Posts', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    setIsRunning(false)
    toast.success("Post creation tests completed!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Post Creation Test Suite
          <Button 
            onClick={runTests} 
            disabled={isRunning || !user}
            className="bg-pathpiper-teal hover:bg-pathpiper-blue"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </CardTitle>
        {!user && (
          <p className="text-sm text-red-600">Please log in to run tests</p>
        )}
      </CardHeader>
      <CardContent>
        {tests.length === 0 && !isRunning ? (
          <p className="text-gray-500 text-center py-8">
            Click "Run Tests" to test post creation functionality
          </p>
        ) : (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {test.duration && (
                    <span>{test.duration}ms</span>
                  )}
                  {test.message && (
                    <span className="max-w-xs truncate">{test.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {tests.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Test Summary</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">
                ✓ {tests.filter(t => t.status === 'success').length} Passed
              </span>
              <span className="text-red-600">
                ✗ {tests.filter(t => t.status === 'error').length} Failed
              </span>
              <span className="text-yellow-600">
                ⏳ {tests.filter(t => t.status === 'pending').length} Pending
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
