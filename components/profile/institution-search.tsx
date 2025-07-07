
"use client"

import { useState, useEffect } from "react"
import { Search, Building, ExternalLink, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Institution {
  id: string
  institutionName: string
  institutionType: string
  logoUrl?: string
  website?: string
  overview?: string
  connectionStatus?: string | null
}

interface InstitutionSearchProps {
  onConnectionSent?: () => void
}

export default function InstitutionSearch({ onConnectionSent }: InstitutionSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchInstitutions()
    } else {
      setInstitutions([])
    }
  }, [searchQuery])

  const searchInstitutions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/institutions/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setInstitutions(data)
      }
    } catch (error) {
      console.error('Error searching institutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendConnectionRequest = async (institutionId: string, institutionName: string) => {
    try {
      setSendingRequest(institutionId)
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: institutionId,
          message: `Hi! I'd like to connect with ${institutionName} on PathPiper.`
        }),
      })

      if (response.ok) {
        // Update the institution's connection status locally
        setInstitutions(prev => 
          prev.map(inst => 
            inst.id === institutionId 
              ? { ...inst, connectionStatus: 'pending' }
              : inst
          )
        )
        onConnectionSent?.()
      } else {
        console.error('Failed to send connection request')
      }
    } catch (error) {
      console.error('Error sending connection request:', error)
    } finally {
      setSendingRequest(null)
    }
  }

  const getConnectionButton = (institution: Institution) => {
    if (institution.connectionStatus === 'pending') {
      return (
        <Button variant="outline" size="sm" disabled>
          <Clock className="h-4 w-4 mr-2" />
          Pending
        </Button>
      )
    }

    if (institution.connectionStatus === 'accepted') {
      return (
        <Button variant="outline" size="sm" disabled>
          <CheckCircle className="h-4 w-4 mr-2" />
          Connected
        </Button>
      )
    }

    return (
      <Button 
        size="sm"
        onClick={() => sendConnectionRequest(institution.id, institution.institutionName)}
        disabled={sendingRequest === institution.id}
        className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
      >
        {sendingRequest === institution.id ? 'Sending...' : 'Request'}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search institutions by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pathpiper-teal mx-auto"></div>
        </div>
      )}

      {institutions.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {institutions.map((institution) => (
            <Card key={institution.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={institution.logoUrl || ''} alt={institution.institutionName} />
                    <AvatarFallback>
                      <Building className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{institution.institutionName}</h4>
                    <p className="text-xs text-gray-500">{institution.institutionType}</p>
                    {institution.overview && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{institution.overview}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {institution.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(institution.website, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {getConnectionButton(institution)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {searchQuery.length >= 2 && institutions.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No institutions found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}
