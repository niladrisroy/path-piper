"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreatePost from "./create-post"
import PostWithTrails from "./post-with-trails"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  TrendingUp,
  Trophy,
  Code,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Calendar,
  Filter,
  SortDesc,
  Hash,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface FeedPost {
  id: string
  content: string
  imageUrl?: string
  postType: string
  tags: string[]
  subjects: string[]
  isQuestion: boolean
  isAchievement: boolean
  achievementType?: string
  projectCategory?: string
  difficultyLevel?: string
  engagementScore: number
  viewsCount: number
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
  }
  trails: any[]
  _count: {
    likes: number
    comments: number
    bookmarks: number
  }
}

const POST_TYPE_ICONS = {
  GENERAL: MessageSquare,
  ACHIEVEMENT: Trophy,
  PROJECT: Code,
  QUESTION: HelpCircle,
  DISCUSSION: MessageSquare,
  TUTORIAL: BookOpen,
  RESOURCE_SHARE: Share2,
  EVENT_ANNOUNCEMENT: Calendar,
}

const POST_TYPE_COLORS = {
  GENERAL: "bg-blue-500",
  ACHIEVEMENT: "bg-yellow-500",
  PROJECT: "bg-green-500",
  QUESTION: "bg-purple-500",
  DISCUSSION: "bg-indigo-500",
  TUTORIAL: "bg-orange-500",
  RESOURCE_SHARE: "bg-teal-500",
  EVENT_ANNOUNCEMENT: "bg-red-500",
}

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [postTypeFilter, setPostTypeFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const { user } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'post' | 'trail'; trailOrder?: number } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        filter,
        ...(postTypeFilter !== 'all' && { type: postTypeFilter }),
        ...(subjectFilter !== 'all' && { subject: subjectFilter }),
        ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
      })

      const response = await fetch(`/api/feed/posts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts)

        // Extract unique subjects for filter
        const subjects = new Set<string>()
        data.posts.forEach((post: FeedPost) => {
          post.subjects.forEach(subject => subjects.add(subject))
        })
        setAvailableSubjects(Array.from(subjects))
      } else {
        toast.error("Failed to load posts")
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filter, postTypeFilter, subjectFilter, difficultyFilter])

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/posts/${postId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchPosts() // Refresh to get updated counts
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error("Failed to like post")
    }
  }

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/posts/${postId}/bookmark`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success("Post bookmarked!")
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
      toast.error("Failed to bookmark post")
    }
  }

  const handlePostCreated = () => {
    fetchPosts()
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
      const response = await fetch(`/api/feed/posts/${deletingItem.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Use cookies for authentication
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${deletingItem.type}`)
      }

      if (deletingItem.type === 'post') {
        toast.success('Post deleted successfully')
      } else {
        toast.success('Trail message deleted successfully')
      }

      fetchPosts() // Refresh the feed
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

  const canDelete = (authorId: string) => {
    return user && user.id === authorId
  }

  

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed Filters */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Trophy className="h-4 w-4 mr-1" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="projects">
                <Code className="h-4 w-4 mr-1" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="questions">
                <HelpCircle className="h-4 w-4 mr-1" />
                Questions
              </TabsTrigger>
            </TabsList>

            {/* Advanced Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={postTypeFilter} onValueChange={setPostTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Post Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="QUESTION">Question</SelectItem>
                  <SelectItem value="DISCUSSION">Discussion</SelectItem>
                  <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                </SelectContent>
              </Select>

              {availableSubjects.length > 0 && (
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {availableSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No posts found. Be the first to share something!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostWithTrails 
              key={post.id} 
              post={{
                id: post.id,
                content: post.content,
                imageUrl: post.imageUrl,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                createdAt: post.createdAt,
                author: {
                  id: post.author.id,
                  firstName: post.author.firstName,
                  lastName: post.author.lastName,
                  role: post.author.role,
                  profileImageUrl: post.author.profileImageUrl
                },
                trails: post.trails || []
              }}
              onPostUpdate={fetchPosts}
            />
          ))
        )}
      </div>

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
    </div>
  )
}