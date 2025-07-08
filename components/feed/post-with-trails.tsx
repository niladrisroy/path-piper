
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Plus, Trash2, Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import CreatePost from "./create-post"

interface Author {
  id: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl: string | null
}

interface Trail {
  id: string
  content: string
  createdAt: string
  author: Author
  trailOrder: number
  likesCount: number
  commentsCount: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: Author
}

interface PostWithTrailsProps {
  post: {
    id: string
    content: string
    imageUrl: string | null
    likesCount: number
    commentsCount: number
    createdAt: string
    author: Author
    trails: Trail[]
    originalPost?: {
      id: string
      content: string
      author: Author
    } | null
  }
  onPostUpdate?: () => void
}

export default function PostWithTrails({ post, onPostUpdate }: PostWithTrailsProps) {
  const [showTrails, setShowTrails] = useState(false)
  const [showAddTrail, setShowAddTrail] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'post' | 'trail'; trailOrder?: number } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showRepostDialog, setShowRepostDialog] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [repostContent, setRepostContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const [trailLikes, setTrailLikes] = useState<Record<string, { liked: boolean; count: number }>>({})
  const [trailComments, setTrailComments] = useState<Record<string, Comment[]>>({})
  const [showTrailComments, setShowTrailComments] = useState<Record<string, boolean>>({})
  const [newTrailComment, setNewTrailComment] = useState<Record<string, string>>({})
  const { user } = useAuth()

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'just now'
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString()
  }

  const handleTrailCreated = () => {
    setShowAddTrail(false)
    onPostUpdate?.()
  }

  const handleDeleteClick = (id: string, type: 'post' | 'trail', trailOrder?: number) => {
    setDeletingItem({ id, type, trailOrder })
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem || !user) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/feed/posts/${deletingItem.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Use cookies for authentication
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      if (deletingItem.type === 'post') {
        toast.success('Post deleted successfully')
      } else {
        toast.success('Trail message deleted successfully')
      }

      onPostUpdate?.()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error(`Failed to delete ${deletingItem.type}`)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingItem(null)
    }
  }

  const canDelete = (authorId: string) => {
    return user && user.id === authorId
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/like`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1)
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error("Failed to like post")
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/comment`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    setIsCommenting(true)
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [...prev, data.comment])
        setCommentsCount(prev => prev + 1)
        setNewComment("")
        toast.success("Comment added successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add comment")
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error("Failed to add comment")
    } finally {
      setIsCommenting(false)
    }
  }

  const handleRepost = async () => {
    setIsReposting(true)
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: repostContent }),
        credentials: 'include'
      })

      if (response.ok) {
        toast.success("Post reposted successfully!")
        setShowRepostDialog(false)
        setRepostContent("")
        onPostUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to repost")
      }
    } catch (error) {
      console.error('Error reposting:', error)
      toast.error("Failed to repost")
    } finally {
      setIsReposting(false)
    }
  }

  const handleTrailLike = async (trailId: string) => {
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/trails/${trailId}/like`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTrailLikes(prev => ({
          ...prev,
          [trailId]: {
            liked: data.liked,
            count: data.liked ? (prev[trailId]?.count || 0) + 1 : Math.max(0, (prev[trailId]?.count || 1) - 1)
          }
        }))
      }
    } catch (error) {
      console.error('Error liking trail:', error)
      toast.error("Failed to like trail")
    }
  }

  const fetchTrailComments = async (trailId: string) => {
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/trails/${trailId}/comment`)
      if (response.ok) {
        const data = await response.json()
        setTrailComments(prev => ({ ...prev, [trailId]: data.comments }))
      }
    } catch (error) {
      console.error('Error fetching trail comments:', error)
    }
  }

  const handleTrailComment = async (trailId: string) => {
    const content = newTrailComment[trailId]
    if (!content?.trim()) return

    try {
      const response = await fetch(`/api/feed/posts/${post.id}/trails/${trailId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTrailComments(prev => ({
          ...prev,
          [trailId]: [...(prev[trailId] || []), data.comment]
        }))
        setNewTrailComment(prev => ({ ...prev, [trailId]: "" }))
        toast.success("Comment added successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add comment")
      }
    } catch (error) {
      console.error('Error adding trail comment:', error)
      toast.error("Failed to add comment")
    }
  }

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments])

  useEffect(() => {
    // Initialize trail likes from post data
    const initialTrailLikes: Record<string, { liked: boolean; count: number }> = {}
    post.trails.forEach(trail => {
      initialTrailLikes[trail.id] = {
        liked: false, // You might want to fetch this from the API
        count: trail.likesCount || 0
      }
    })
    setTrailLikes(initialTrailLikes)
  }, [post.trails])

  return (
    <div className="space-y-3">
      {/* Main Post */}
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50 pointer-events-none"></div>
        <CardContent className="p-6 relative">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-pathpiper-teal/20 shadow-lg">
                  <Image
                    src={post.author.profileImageUrl || "/images/student-profile.png"}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
              </div>
              <div>
                <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-pathpiper-teal/10 to-blue-500/10 text-pathpiper-teal border-pathpiper-teal/30 text-xs py-1 px-3 font-medium shadow-sm"
                  >
                    {post.author.role}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    {formatTimeAgo(post.createdAt)}
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
                    className="text-red-600 focus:text-red-600"
                    onClick={() => handleDeleteClick(post.id, 'post')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{post.content}</p>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={500}
                height={300}
                className="w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Trail indicator */}
          {post.trails.length > 0 && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrails(!showTrails)}
                className="text-pathpiper-teal hover:text-pathpiper-teal hover:bg-gradient-to-r hover:from-pathpiper-teal/10 hover:to-blue-500/10 transition-all duration-200 rounded-full px-4 py-2 font-medium shadow-sm"
              >
                <Plus className={`h-4 w-4 mr-2 transition-transform duration-200 ${showTrails ? 'rotate-45' : ''}`} />
                {showTrails ? 'Hide' : 'Show'} trail ({post.trails.length})
              </Button>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 group ${
                  isLiked 
                    ? 'text-red-500 bg-red-50 dark:bg-red-950/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`}
              >
                <Heart className={`h-4 w-4 group-hover:scale-110 transition-transform duration-200 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{likesCount}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComments(!showComments)}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 group"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">{commentsCount}</span>
              </Button>
              <Dialog open={showRepostDialog} onOpenChange={setShowRepostDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full p-2 transition-all duration-200 group"
                  >
                    <Repeat2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Repost</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={repostContent}
                      onChange={(e) => setRepostContent(e.target.value)}
                      placeholder="Add your thoughts (optional)..."
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowRepostDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleRepost} disabled={isReposting}>
                        {isReposting ? "Reposting..." : "Repost"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full p-2 transition-all duration-200 group"
              >
                <Share className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddTrail(!showAddTrail)}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 rounded-full px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trail
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {showComments && (
        <Card className="border-0 shadow-lg bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Add Comment */}
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={user?.profileImageUrl || "/images/student-profile.png"}
                    alt="Your profile"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[40px] resize-none"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isCommenting}
                    size="sm"
                    className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={comment.user.profileImageUrl || "/images/student-profile.png"}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Trail Form */}
      {showAddTrail && (
        <div className="ml-8">
          <CreatePost
            parentPostId={post.id}
            isTrail={true}
            onPostCreated={handleTrailCreated}
          />
        </div>
      )}

      {/* Trails */}
      {showTrails && post.trails.length > 0 && (
        <div className="ml-8 space-y-4 relative">
          {/* Trail connection line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-indigo-400 to-blue-400 rounded-full shadow-sm"></div>
          
          {post.trails.map((trail, index) => (
            <div 
              key={trail.id}
              className="relative transform transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInRight 0.5s ease-out forwards'
              }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-blue-50/80 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 backdrop-blur-sm ml-6 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-5">
                  {/* Trail indicator */}
                  <div className="absolute -left-3 top-6 w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full border-3 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-700 shadow-md">
                        <Image
                          src={trail.author.profileImageUrl || "/images/student-profile.png"}
                          alt={`${trail.author.firstName} ${trail.author.lastName}`}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-purple-900 dark:text-purple-100">
                            {trail.author.firstName} {trail.author.lastName}
                          </span>
                          <span className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                            {formatTimeAgo(trail.createdAt)}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="text-xs py-1 px-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 font-semibold shadow-sm"
                          >
                            Trail #{trail.trailOrder}
                          </Badge>
                        </div>
                      {canDelete(trail.author.id) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-all duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200"
                                onClick={() => handleDeleteClick(trail.id, 'trail', trail.trailOrder)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Trail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-purple-800 dark:text-purple-200 leading-relaxed font-medium">{trail.content}</p>
                      </div>

                      {/* Trail Actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-200/50 dark:border-purple-700/50">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleTrailLike(trail.id)}
                            className={`flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-200 group text-xs ${
                              trailLikes[trail.id]?.liked 
                                ? 'text-red-500 bg-red-50 dark:bg-red-950/20' 
                                : 'text-purple-600 dark:text-purple-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                            }`}
                          >
                            <Heart className={`h-3 w-3 ${trailLikes[trail.id]?.liked ? 'fill-current' : ''}`} />
                            <span>{trailLikes[trail.id]?.count || 0}</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setShowTrailComments(prev => ({ ...prev, [trail.id]: !prev[trail.id] }))
                              if (!showTrailComments[trail.id]) {
                                fetchTrailComments(trail.id)
                              }
                            }}
                            className="text-purple-600 dark:text-purple-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-200 group text-xs"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>{trailComments[trail.id]?.length || 0}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Trail Comments */}
                      {showTrailComments[trail.id] && (
                        <div className="mt-3 space-y-2">
                          {/* Add Comment */}
                          <div className="flex gap-2">
                            <div className="h-6 w-6 rounded-full overflow-hidden">
                              <Image
                                src={user?.profileImageUrl || "/images/student-profile.png"}
                                alt="Your profile"
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 flex gap-1">
                              <Textarea
                                value={newTrailComment[trail.id] || ""}
                                onChange={(e) => setNewTrailComment(prev => ({ ...prev, [trail.id]: e.target.value }))}
                                placeholder="Comment on this trail..."
                                className="min-h-[30px] text-xs resize-none"
                              />
                              <Button
                                onClick={() => handleTrailComment(trail.id)}
                                disabled={!newTrailComment[trail.id]?.trim()}
                                size="sm"
                                className="bg-purple-500 hover:bg-purple-600 text-white h-8 w-8 p-0"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-2 ml-2">
                            {(trailComments[trail.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <div className="h-5 w-5 rounded-full overflow-hidden">
                                  <Image
                                    src={comment.user.profileImageUrl || "/images/student-profile.png"}
                                    alt={`${comment.user.firstName} ${comment.user.lastName}`}
                                    width={20}
                                    height={20}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-medium text-xs">
                                        {comment.user.firstName} {comment.user.lastName}
                                      </span>
                                      <span className="text-xs text-purple-500">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-purple-800 dark:text-purple-200">{comment.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deletingItem?.type === 'post' ? 'Post' : 'Trail Message'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItem?.type === 'post' 
                ? 'This will permanently delete the post and all its trail messages. This action cannot be undone.'
                : 'This will permanently delete this trail message and reorder the remaining trails. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
