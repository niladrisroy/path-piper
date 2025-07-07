
"use client"

import { useState, useEffect } from "react"
import { Building, ExternalLink, Calendar, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ConnectedInstitution {
  id: string
  institutionName: string
  institutionType: string
  logoUrl?: string
  website?: string
  verified: boolean
  connectedAt: string
}

export default function ConnectedInstitutions() {
  const [connectedInstitutions, setConnectedInstitutions] = useState<ConnectedInstitution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConnectedInstitutions()
  }, [])

  const fetchConnectedInstitutions = async () => {
    try {
      const response = await fetch('/api/student/connected-institutions', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setConnectedInstitutions(data)
      }
    } catch (error) {
      console.error('Error fetching connected institutions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pathpiper-teal mx-auto"></div>
      </div>
    )
  }

  if (connectedInstitutions.length === 0) {
    return null
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-4 flex items-center">
        <Building className="h-5 w-5 mr-2 text-pathpiper-teal" />
        Connected Institutions
      </h4>
      
      <div className="grid gap-4 md:grid-cols-2">
        {connectedInstitutions.map((institution) => (
          <Card key={institution.id} className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={institution.logoUrl || ''} alt={institution.institutionName} />
                <AvatarFallback>
                  <Building className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h5 className="font-semibold text-sm truncate">{institution.institutionName}</h5>
                  {institution.verified && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mb-2">{institution.institutionType}</p>
                
                <div className="flex items-center text-xs text-gray-400 mb-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  Connected {new Date(institution.connectedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                
                {institution.website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(institution.website, '_blank')}
                    className="p-0 h-auto text-xs text-pathpiper-teal hover:text-pathpiper-teal/80"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
