
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

export default function TrailTest() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testPostId, setTestPostId] = useState<string>('')
  const [testTrailContent, setTestTrailContent] = useState('This is a test trail message')

  const updateTest = (name: string, status: 'pending' | 'success' | 'error', message: string, duration?: number) => {
    setTestResults(prev => {
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

  const runTrailTests = async () => {
    if (!user) {
      toast.error('Please login to run tests')
      return
    }

    setIsRunning(true)
    setTestResults([])

    try {
      // Test 1: Create a test post first
      updateTest('Create Test Post', 'pending', 'Creating test post...')
      let createdPostId: string | null = null
      
      try {
        const start = Date.now()
        const response = await fetch('/api/feed/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content: `Test post for trail testing - ${new Date().toISOString()}`,
            postType: 'GENERAL',
            visibility: 'public',
            isTrail: false
          })
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          const data = await response.json()
          createdPostId = data.post?.id
          setTestPostId(createdPostId || '')
          updateTest('Create Test Post', 'success', `Post created: ${createdPostId}`, duration)
        } else {
          const error = await response.text()
          updateTest('Create Test Post', 'error', `HTTP ${response.status}: ${error}`)
        }
      } catch (error) {
        updateTest('Create Test Post', 'error', error instanceof Error ? error.message : 'Unknown error')
      }

      // Test 2: Create Trail
      if (createdPostId) {
        updateTest('Create Trail', 'pending', 'Creating trail...')
        let trailId: string | null = null
        
        try {
          const start = Date.now()
          const response = await fetch(`/api/feed/posts/${createdPostId}/trails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              content: testTrailContent,
              imageUrl: null
            })
          })
          const duration = Date.now() - start
          
          if (response.ok) {
            const data = await response.json()
            trailId = data.trail?.id
            updateTest('Create Trail', 'success', `Trail created: ${trailId}, Order: ${data.trail?.trailOrder}`, duration)
          } else {
            const error = await response.text()
            updateTest('Create Trail', 'error', `HTTP ${response.status}: ${error}`)
          }
        } catch (error) {
          updateTest('Create Trail', 'error', error instanceof Error ? error.message : 'Unknown error')
        }

        // Test 3: Fetch Trails
        updateTest('Fetch Trails', 'pending', 'Fetching trails...')
        try {
          const start = Date.now()
          const response = await fetch(`/api/feed/posts/${createdPostId}/trails`, {
            credentials: 'include'
          })
          const duration = Date.now() - start
          
          if (response.ok) {
            const data = await response.json()
            const trailCount = data.trails?.length || 0
            updateTest('Fetch Trails', 'success', `Found ${trailCount} trails`, duration)
          } else {
            updateTest('Fetch Trails', 'error', `HTTP ${response.status}`)
          }
        } catch (error) {
          updateTest('Fetch Trails', 'error', error instanceof Error ? error.message : 'Unknown error')
        }

        // Test 4: Create Multiple Trails (test ordering)
        updateTest('Create Multiple Trails', 'pending', 'Creating multiple trails...')
        try {
          const trailPromises = []
          for (let i = 2; i <= 4; i++) {
            trailPromises.push(
              fetch(`/api/feed/posts/${createdPostId}/trails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  content: `Trail message ${i} - ${new Date().toISOString()}`,
                  imageUrl: null
                })
              })
            )
          }
          
          const start = Date.now()
          const responses = await Promise.all(trailPromises)
          const duration = Date.now() - start
          
          const allSuccessful = responses.every(r => r.ok)
          if (allSuccessful) {
            updateTest('Create Multiple Trails', 'success', `Created ${responses.length} additional trails`, duration)
          } else {
            updateTest('Create Multiple Trails', 'error', `Some trails failed to create`)
          }
        } catch (error) {
          updateTest('Create Multiple Trails', 'error', error instanceof Error ? error.message : 'Unknown error')
        }

        // Test 5: Verify Trail Ordering
        updateTest('Verify Trail Ordering', 'pending', 'Checking trail order...')
        try {
          const start = Date.now()
          const response = await fetch(`/api/feed/posts/${createdPostId}/trails`, {
            credentials: 'include'
          })
          const duration = Date.now() - start
          
          if (response.ok) {
            const data = await response.json()
            const trails = data.trails || []
            const isOrdered = trails.every((trail: any, index: number) => trail.trailOrder === index + 1)
            
            if (isOrdered) {
              updateTest('Verify Trail Ordering', 'success', `All ${trails.length} trails are properly ordered`, duration)
            } else {
              updateTest('Verify Trail Ordering', 'error', `Trail ordering is incorrect`)
            }
          } else {
            updateTest('Verify Trail Ordering', 'error', `HTTP ${response.status}`)
          }
        } catch (error) {
          updateTest('Verify Trail Ordering', 'error', error instanceof Error ? error.message : 'Unknown error')
        }

        // Test 6: Test Trail with Image
        updateTest('Create Trail with Image', 'pending', 'Creating trail with image...')
        try {
          const start = Date.now()
          const response = await fetch(`/api/feed/posts/${createdPostId}/trails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              content: 'Trail with image test',
              imageUrl: 'https://via.placeholder.com/300x200?text=Test+Image'
            })
          })
          const duration = Date.now() - start
          
          if (response.ok) {
            const data = await response.json()
            updateTest('Create Trail with Image', 'success', `Trail with image created: ${data.trail?.id}`, duration)
          } else {
            const error = await response.text()
            updateTest('Create Trail with Image', 'error', `HTTP ${response.status}: ${error}`)
          }
        } catch (error) {
          updateTest('Create Trail with Image', 'error', error instanceof Error ? error.message : 'Unknown error')
        }

      } else {
        updateTest('Create Trail', 'error', 'No test post available')
        updateTest('Fetch Trails', 'error', 'No test post available')
        updateTest('Create Multiple Trails', 'error', 'No test post available')
        updateTest('Verify Trail Ordering', 'error', 'No test post available')
        updateTest('Create Trail with Image', 'error', 'No test post available')
      }

    } catch (error) {
      toast.error('Test suite failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return 'Running...'
      case 'success': return 'Pass'
      case 'error': return 'Fail'
      default: return 'Unknown'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Trail Creation Test Suite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Post ID (optional)</label>
            <Input 
              value={testPostId}
              onChange={(e) => setTestPostId(e.target.value)}
              placeholder="Leave empty to create new post"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Test Trail Content</label>
            <Input 
              value={testTrailContent}
              onChange={(e) => setTestTrailContent(e.target.value)}
              placeholder="Trail message content"
            />
          </div>
        </div>

        {/* Run Tests Button */}
        <div className="flex justify-center">
          <Button 
            onClick={runTrailTests}
            disabled={isRunning || !user}
            className="px-8 py-2"
          >
            {isRunning ? 'Running Tests...' : 'Run Trail Tests'}
          </Button>
        </div>

        {!user && (
          <div className="text-center text-red-600">
            Please login to run tests
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(result.status)} text-white`}>
                    {getStatusText(result.status)}
                  </Badge>
                  <span className="font-medium">{result.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{result.message}</div>
                  {result.duration && (
                    <div className="text-xs text-gray-500">{result.duration}ms</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Test Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {testResults.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Running</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
