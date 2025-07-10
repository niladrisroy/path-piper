"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Trash2,
  Edit,
  Send,
  X
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface PostAuthor {
  id: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl?: string
}

interface Trail {
  id: string
  content: string
  imageUrl?: string
  trailOrder: number
  createdAt: string
  author: PostAuthor
  likesCount: number
  commentsCount: number
}

interface Post {
  id: string
  content: string
  imageUrl?: string
  likesCount: number
  commentsCount: number
  createdAt: string
  author: PostAuthor
  trails: Trail[]
}

interface PostWithTrailsProps {
  post: Post
  onPostUpdate: () => void
}

export default function PostWithTrails({ 
  post, 
  onPostUpdate
}: PostWithTrailsProps) {
  const { user } = useAuth()
  const [likedTrails, setLikedTrails] = useState<Set<string>>(new Set())
  const [trailLikeCounts, setTrailLikeCounts] = useState<{[key: string]: number}>({})
  const [showAddTrail, setShowAddTrail] = useState(false)
  const [isSubmittingTrail, setIsSubmittingTrail] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showTrailReactions, setShowTrailReactions] = useState<{[key: string]: boolean}>({})
  const [trailContent, setTrailContent] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{id: string, type: 'post' | 'trail', trailOrder?: number} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const reactionTypes = [
    { type: 'like', emoji: '❤️', label: 'Like' },
    { type: 'love', emoji: '😍', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { type: 'think', emoji: '🤔', label: 'Thinking' }
  ]

  // Initialize trail like states
  useEffect(() => {
    if (post.trails) {
      const likeCounts: Record<string, number> = {}
      post.trails.forEach((trail) => {
        likeCounts[trail.id] = trail.likesCount || 0
      })
      setTrailLikeCounts(likeCounts)
    }
  }, [post.trails])

  const handleAddTrail = async () => {
    if (!trailContent.trim() || !user) {
      toast.error("Please write something before posting")
      return
    }

    setIsSubmittingTrail(true)
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/trails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: trailContent.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add trail')
      }

      toast.success("Trail added successfully!")
      setTrailContent("")
      setShowAddTrail(false)
      onPostUpdate()
    } catch (error) {
      console.error('Error adding trail:', error)
      toast.error("Failed to add trail")
    } finally {
      setIsSubmittingTrail(false)
    }
  }

  const handleDeleteClick = (id: string, type: 'post' | 'trail', trailOrder?: number) => {
    setDeletingItem({ id, type, trailOrder })
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem || !user) {
      console.error('Delete confirmation failed: missing deletingItem or user')
      return
    }

    setIsDeleting(true)
    try {
      let response
      if (deletingItem.type === 'post') {
        response = await fetch(`/api/feed/posts/${deletingItem.id}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      } else {
        response = await fetch(`/api/feed/posts/${post.id}/trails/${deletingItem.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${deletingItem.type}`)
      }

      if (deletingItem.type === 'post') {
        toast.success('Post deleted successfully')
      } else {
        toast.success('Trail message deleted successfully')
      }

      onPostUpdate()
    } catch (error) {
      console.error('Error deleting:', error)
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${deletingItem.type}`
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingItem(null)
    }
  }

  const handleTrailLike = async (trailId: string, currentLikeCount: number) => {
    if (!user) {
      toast.error("Please login to like trails")
      return
    }

    try {
      const response = await fetch(`/api/feed/posts/${post.id}/trails/${trailId}/like`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to toggle trail like')
      }

      const data = await response.json()

      // Update local state
      const newLikedTrails = new Set(likedTrails)
      if (data.liked) {
        newLikedTrails.add(trailId)
        setTrailLikeCounts(prev => ({
          ...prev,
          [trailId]: currentLikeCount + 1
        }))
      } else {
        newLikedTrails.delete(trailId)
        setTrailLikeCounts(prev => ({
          ...prev,
          [trailId]: Math.max(0, currentLikeCount - 1)
        }))
      }
      setLikedTrails(newLikedTrails)

    } catch (error) {
      console.error('Error toggling trail like:', error)
      toast.error("Failed to update trail like")
    }
  }

  const canDelete = (authorId: string) => {
    return user && user.id === authorId
  }

  return (
    <>
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-pathpiper-teal/20">
                <AvatarImage src={post.author.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-pathpiper-teal to-blue-500 text-white font-medium">
                  {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.author.role}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            {canDelete(post.author.id) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(post.id, 'post')}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Post Content */}
          <div className="space-y-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            {post.imageUrl && (
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddTrail(!showAddTrail)}
                className="text-gray-500 hover:text-pathpiper-teal transition-all duration-200"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {post.trails?.length || 0}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 transition-all duration-200">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-yellow-500 transition-all duration-200">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Add Trail Section */}
          {showAddTrail && user && (
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-pathpiper-teal to-blue-500 text-white text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Add to the trail..."
                    value={trailContent}
                    onChange={(e) => setTrailContent(e.target.value)}
                    className="min-h-[80px] border-gray-200 dark:border-gray-700 focus:border-pathpiper-teal focus:ring-pathpiper-teal"
                  />
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddTrail(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddTrail}
                      disabled={isSubmittingTrail || !trailContent.trim()}
                      className="bg-gradient-to-r from-pathpiper-teal to-blue-500 hover:from-pathpiper-teal/90 hover:to-blue-500/90"
                    >
                      {isSubmittingTrail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Add Trail
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trails */}
          {post.trails && post.trails.length > 0 && (
            <div className="space-y-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
              <h5 className="font-medium text-gray-900 dark:text-white flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-pathpiper-teal" />
                Trail ({post.trails.length})
              </h5>
              {post.trails
                .sort((a, b) => a.trailOrder - b.trailOrder)
                .map((trail, index) => (
                  <div
                    key={trail.id}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pathpiper-teal to-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={trail.author.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                              {trail.author.firstName?.[0]}{trail.author.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h6 className="font-medium text-sm text-gray-900 dark:text-white">
                            {trail.author.firstName} {trail.author.lastName}
                          </h6>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {trail.author.role}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(trail.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {canDelete(trail.author.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(trail.id, 'trail', trail.trailOrder)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete Trail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                      {trail.content}
                    </p>

                    {trail.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden mb-3">
                        <Image
                          src={trail.imageUrl}
                          alt="Trail image"
                          width={400}
                          height={200}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTrailLike(trail.id, trailLikeCounts[trail.id] || trail.likesCount || 0)}
                        className={`transition-all duration-200 ${
                          likedTrails.has(trail.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${likedTrails.has(trail.id) ? 'fill-current' : ''}`} />
                        {trailLikeCounts[trail.id] || trail.likesCount || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pathpiper-teal transition-all duration-200">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {trail.commentsCount || 0}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!isDeleting) {
          setShowDeleteDialog(open)
          if (!open) {
            setDeletingItem(null)
          }
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {deletingItem?.type === 'post' 
                ? 'Are you sure you want to delete this post? This will permanently remove the post and all its trail messages. This action cannot be undone.'
                : 'Are you sure you want to delete this trail message? This will permanently remove the message and reorder the remaining trails. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {deletingItem?.type === 'post' ? 'Post' : 'Trail'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}