
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'

export default function StatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">System Status</h1>
        <button 
          onClick={checkStatus}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? <ReloadIcon className="animate-spin" /> : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Supabase Connection:</span>
                <Badge variant={status?.supabase ? "success" : "destructive"}>
                  {status?.supabase ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Drizzle Connection:</span>
                <Badge variant={status?.drizzle ? "success" : "destructive"}>
                  {status?.drizzle ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
