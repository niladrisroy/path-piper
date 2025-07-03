"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FeedItem from "./feed-item"
import CreatePost from "./create-post"
import FeedFilter from "./feed-filter"
import { Bell, Sparkles, Clock, Users, Bookmark } from "lucide-react"
import PostWithTrails from "./post-with-trails"

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("for-you")
  const [feedItems, setFeedItems] = useState(mockFeedItems)

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/feed/posts')
      const data = await response.json()
      if (response.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePostUpdate = () => {
    fetchPosts()
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Feed Header with Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="for-you" className="w-full" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Feed</h1>
              <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-pathpiper-teal transition-colors" />
            </div>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="for-you" className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">For You</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Following</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recent</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <FeedFilter />
        </div>
        <CreatePost onPostCreated={handlePostUpdate} />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Feed Header with Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="for-you" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Feed</h1>
            <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-pathpiper-teal transition-colors" />
          </div>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="for-you" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">For You</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Following</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <FeedFilter />
      </div>

      {/* Create Post */}
      <div className="mb-6">
        <CreatePost onPostCreated={handlePostUpdate} />
      </div>

      {/* Feed Items */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostWithTrails key={post.id} post={post} onPostUpdate={handlePostUpdate} />
        ))}
      </div>
    </div>
  )
}

// Mock data for feed items
const mockFeedItems = [
  {
    id: "1",
    type: "post",
    author: {
      id: "user1",
      name: "Alex Johnson",
      role: "student",
      avatar: "/images/student-profile.png",
      verified: true,
      school: "Westlake High School",
    },
    content:
      "Just finished my science project on renewable energy! 🔬 Check out the solar panel model I built for the science fair next week.",
    media: ["/robotics-competition.png"],
    tags: ["Science", "RenewableEnergy", "ProjectShowcase"],
    likes: 24,
    comments: 5,
    shares: 2,
    timestamp: "2 hours ago",
    isPinned: false,
  },
  {
    id: "2",
    type: "achievement",
    author: {
      id: "user2",
      name: "Emma Wilson",
      role: "student",
      avatar: "/diverse-female-student.png",
      verified: false,
      school: "Riverdale High",
    },
    content:
      "I'm excited to share that I won first place in the regional math competition! Thanks to everyone who helped me prepare, especially my math teacher Ms. Chen.",
    achievement: {
      title: "First Place - Regional Math Competition",
      icon: "trophy",
      color: "amber",
    },
    likes: 56,
    comments: 12,
    shares: 8,
    timestamp: "5 hours ago",
    isPinned: false,
  },
  {
    id: "3",
    type: "event",
    author: {
      id: "inst1",
      name: "Stanford University",
      role: "institution",
      avatar: "/images/pathpiper-logo.png",
      verified: true,
      location: "Stanford, CA",
    },
    content:
      "Join us for our annual Computer Science Innovation Conference! Featuring guest speakers from leading tech companies and research presentations from our faculty.",
    event: {
      title: "Computer Science Innovation Conference",
      date: "June 15, 2023",
      time: "9:00 AM - 5:00 PM",
      location: "Stanford Campus, Building 380",
      image: "/computer-science-research-presentation.png",
    },
    likes: 89,
    comments: 15,
    shares: 32,
    timestamp: "1 day ago",
    isPinned: true,
  },
  {
    id: "4",
    type: "question",
    author: {
      id: "user3",
      name: "Noah Taylor",
      role: "student",
      avatar: "/placeholder.svg?key=hwap2",
      verified: false,
      school: "Eastside Prep",
    },
    content:
      "I'm struggling with calculus derivatives. Can anyone recommend good online resources or tutorials that explain this concept clearly?",
    tags: ["Math", "Calculus", "StudyHelp"],
    likes: 8,
    comments: 14,
    shares: 1,
    timestamp: "3 hours ago",
    isPinned: false,
  },
  {
    id: "5",
    type: "resource",
    author: {
      id: "mentor1",
      name: "Dr. James Chen",
      role: "mentor",
      avatar: "/asian-professor.png",
      verified: true,
      expertise: "Computer Science",
    },
    content:
      "I've created a new tutorial series on machine learning fundamentals for beginners. This covers basic concepts and includes practical exercises to help you get started.",
    resource: {
      title: "Machine Learning Fundamentals",
      type: "Tutorial Series",
      link: "#",
      thumbnail: "/ai-ethics.png",
    },
    likes: 112,
    comments: 23,
    shares: 45,
    timestamp: "2 days ago",
    isPinned: false,
  },
]