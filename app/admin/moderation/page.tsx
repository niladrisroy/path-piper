
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, XCircle, Eye, Flag } from "lucide-react"

interface ModerationItem {
  id: string
  type: 'post' | 'comment' | 'profile'
  content: string
  author: {
    id: string
    name: string
    role: string
  }
  status: 'pending_review' | 'flagged' | 'approved' | 'rejected'
  riskScore: number
  flags: string[]
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export default function ModerationDashboard() {
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'reviewed'>('pending')

  useEffect(() => {
    fetchModerationItems()
  }, [filter])

  const fetchModerationItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/moderation?filter=${filter}`)
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching moderation items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/moderation/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchModerationItems() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating moderation status:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'flagged':
        return <Flag className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-100'
    if (score >= 4) return 'text-orange-600 bg-orange-100'
    if (score >= 2) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Moderation Dashboard</h1>
        <p className="text-gray-600">Review and moderate user-generated content</p>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading moderation items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items found for the selected filter
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-yellow-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <CardTitle className="text-lg">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} by {item.author.name}
                      </CardTitle>
                      <Badge variant="outline" className={getRiskScoreColor(item.riskScore)}>
                        Risk: {item.riskScore}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {(item.status === 'pending_review' || item.status === 'flagged') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600"
                            onClick={() => handleModerationAction(item.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600"
                            onClick={() => handleModerationAction(item.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Content:</h4>
                      <p className="bg-gray-50 p-3 rounded text-sm">{item.content}</p>
                    </div>
                    
                    {item.flags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Flags:</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.flags.map((flag) => (
                            <Badge key={flag} variant="secondary" className="text-xs">
                              {flag.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created: {new Date(item.createdAt).toLocaleString()}
                      {item.reviewedAt && (
                        <span className="ml-4">
                          Reviewed: {new Date(item.reviewedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
