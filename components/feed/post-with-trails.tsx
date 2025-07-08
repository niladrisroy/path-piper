
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Plus, Trash2 } from "lucide-react"
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
  }
  onPostUpdate?: () => void
}

export default function PostWithTrails({ post, onPostUpdate }: PostWithTrailsProps) {
  const [showTrails, setShowTrails] = useState(false)
  const [showAddTrail, setShowAddTrail] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'post' | 'trail'; trailOrder?: number } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
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
                className="text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 group"
              >
                <Heart className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">{post.likesCount}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 group"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">{post.commentsCount}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full p-2 transition-all duration-200 group"
              >
                <Repeat2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </Button>
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
