
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Send } from "lucide-react"

interface Circle {
  id: string
  name: string
  color: string
  icon: string
  memberships: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
      profileImageUrl?: string
      role: string
    }
  }>
  _count: {
    memberships: number
  }
}

interface Connection {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
  }
}

interface ExistingInvitation {
  id: string
  inviteeId: string
  status: 'pending' | 'accepted' | 'declined'
}

interface CircleManagementDialogProps {
  circle: Circle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCircleUpdated: () => void
}

export default function CircleManagementDialog({
  circle,
  open,
  onOpenChange,
  onCircleUpdated
}: CircleManagementDialogProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [inviteMessage, setInviteMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingInvitations, setExistingInvitations] = useState<ExistingInvitation[]>([])

  useEffect(() => {
    if (open && circle) {
      fetchConnections()
    }
  }, [open, circle])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // For Friends circle, show all connections and no invite functionality
        if (circle?.id === 'friends') {
          setConnections([])
          setExistingInvitations([])
          return
        }
        
        // Filter out users who are already in this circle
        const currentMemberIds = circle?.memberships?.map(m => m.user.id) || []
        const availableConnections = data.filter((conn: Connection) => 
          !currentMemberIds.includes(conn.user.id)
        )
        
        setConnections(availableConnections)
        
        // Fetch existing invitations for this circle
        if (circle?.id) {
          await fetchExistingInvitations()
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const fetchExistingInvitations = async () => {
    try {
      const response = await fetch(`/api/circles/invitations?type=sent&circleId=${circle?.id}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const invitations = await response.json()
        setExistingInvitations(invitations)
      }
    } catch (error) {
      console.error('Error fetching existing invitations:', error)
    }
  }

  const handleSendInvitations = async () => {
    if (!circle || selectedConnections.length === 0) return

    setLoading(true)
    try {
      const promises = selectedConnections.map(connectionId =>
        fetch('/api/circles/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            circleId: circle.id,
            inviteeId: connectionId,
            message: inviteMessage.trim() || `Join my "${circle.name}" circle!`
          })
        })
      )

      const responses = await Promise.all(promises)
      
      // Check if all requests were successful
      const allSuccessful = responses.every(response => response.ok)
      
      if (allSuccessful) {
        setSelectedConnections([])
        setInviteMessage('')
        await fetchExistingInvitations() // Refresh invitations list
        onCircleUpdated()
        onOpenChange(false)
      } else {
        console.error('Some invitations failed to send')
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error sending invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInvitationStatus = (userId: string) => {
    return existingInvitations.find(inv => inv.inviteeId === userId)?.status || null
  }

  const toggleConnection = (connectionId: string) => {
    // Don't allow selection if there's already an invitation
    const status = getInvitationStatus(connectionId)
    if (status && status !== 'declined') return
    
    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  if (!circle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              {circle.icon.startsWith('http') ? (
                <AvatarImage src={circle.icon} />
              ) : (
                <AvatarFallback 
                  className="text-xs"
                  style={{ backgroundColor: circle.color }}
                >
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </AvatarFallback>
              )}
            </Avatar>
            Invite to {circle.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current members */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              {circle.id === 'friends' ? 'All Connections' : 'Current Members'} ({circle._count?.memberships || 0})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {circle.id === 'friends' ? (
                // Show all connections for Friends circle
                circle.memberships?.map((membership) => (
                  <div key={membership.user.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={membership.user.profileImageUrl} />
                      <AvatarFallback className="text-xs">
                        {membership.user.firstName[0]}{membership.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {membership.user.firstName} {membership.user.lastName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {membership.user.role}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                // Show creator and members for custom circles
                <div className="flex flex-wrap gap-2">
                  {/* Show creator first */}
                  <div className="flex items-center gap-1 text-xs">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={circle.creator?.profileImageUrl} />
                      <AvatarFallback className="text-xs">
                        {circle.creator?.firstName?.[0]}{circle.creator?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-16">
                      {circle.creator?.firstName} 
                    </span>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Creator
                    </Badge>
                  </div>
                  
                  {/* Show other members */}
                  {circle.memberships?.slice(0, 5).map((membership) => (
                    <div key={membership.user.id} className="flex items-center gap-1 text-xs">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={membership.user.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {membership.user.firstName[0]}{membership.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-16">
                        {membership.user.firstName}
                      </span>
                    </div>
                  ))}
                  {(circle.memberships?.length || 0) > 5 && (
                    <span className="text-xs text-gray-500">
                      +{(circle.memberships?.length || 0) - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Available connections to invite - Only for custom circles */}
          {circle.id !== 'friends' && (
            <div>
              <h4 className="text-sm font-medium mb-2">Invite Connections</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {connections.length === 0 ? (
                  <p className="text-sm text-gray-500">No available connections to invite</p>
                ) : (
                  connections.map((connection) => {
                    const invitationStatus = getInvitationStatus(connection.user.id)
                    const canInvite = !invitationStatus || invitationStatus === 'declined'
                    
                    return (
                      <div 
                        key={connection.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          canInvite 
                            ? selectedConnections.includes(connection.user.id)
                              ? 'bg-blue-50 border border-blue-200 cursor-pointer'
                              : 'hover:bg-gray-50 cursor-pointer'
                            : 'bg-gray-50 opacity-75'
                        }`}
                        onClick={() => canInvite && toggleConnection(connection.user.id)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={connection.user.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {connection.user.firstName[0]}{connection.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {connection.user.firstName} {connection.user.lastName}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {connection.user.role}
                          </Badge>
                        </div>
                        {invitationStatus && invitationStatus !== 'declined' ? (
                          <Badge 
                            variant={invitationStatus === 'pending' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {invitationStatus === 'pending' ? 'Pending' : 'Accepted'}
                          </Badge>
                        ) : selectedConnections.includes(connection.user.id) ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Invitation message - Only for custom circles */}
          {circle.id !== 'friends' && selectedConnections.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Invitation Message</label>
              <Input
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={`Join my "${circle.name}" circle!`}
                maxLength={200}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {circle.id === 'friends' ? 'Close' : 'Cancel'}
            </Button>
            {circle.id !== 'friends' && (
              <Button 
                onClick={handleSendInvitations}
                disabled={selectedConnections.length === 0 || loading}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Invites ({selectedConnections.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
