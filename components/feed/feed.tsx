"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreatePost from "./create-post"
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
    if (!deletingItem || !user) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/feed/posts/${deletingItem.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
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

      fetchPosts() // Refresh the feed
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

  const PostCard = ({ post }: { post: FeedPost }) => {
    const PostTypeIcon = POST_TYPE_ICONS[post.postType as keyof typeof POST_TYPE_ICONS] || MessageSquare
    const postTypeColor = POST_TYPE_COLORS[post.postType as keyof typeof POST_TYPE_COLORS] || "bg-blue-500"

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={post.author.profileImageUrl || "/images/student-profile.png"}
                alt={`${post.author.firstName} ${post.author.lastName}`}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {post.author.firstName} {post.author.lastName}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {post.author.role}
                </Badge>
                <div className={`p-1 rounded-full ${postTypeColor}`}>
                  <PostTypeIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
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
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Achievement/Project specific info */}
          {post.isAchievement && post.achievementType && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Trophy className="h-3 w-3 mr-1" />
              {post.achievementType}
            </Badge>
          )}

          {post.postType === "PROJECT" && post.projectCategory && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Code className="h-3 w-3 mr-1" />
              {post.projectCategory}
            </Badge>
          )}

          {post.difficultyLevel && (
            <Badge variant="outline" className="text-xs">
              {post.difficultyLevel} level
            </Badge>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Tags and Subjects */}
          {(post.tags.length > 0 || post.subjects.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {post.subjects.map((subject) => (
                <Badge key={subject} variant="outline" className="text-xs border-gray-300 text-gray-600">
                  {subject}
                </Badge>
              ))}
            </div>
          )}

          {/* Trails */}
          {post.trails.length > 0 && (
            <div className="border-l-2 border-gray-200 pl-4 space-y-2">
              {post.trails.map((trail) => (
                <div key={trail.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-full overflow-hidden">
                      <Image
                        src={trail.author.profileImageUrl || "/images/student-profile.png"}
                        alt={`${trail.author.firstName} ${trail.author.lastName}`}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{trail.author.firstName}</span>
                  </div>
                  <p className="text-gray-700">{trail.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <Heart className="h-4 w-4 mr-1" />
                {post._count.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post._count.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {post.viewsCount} views
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookmark(post.id)}
                className="text-gray-500 hover:text-blue-500"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

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