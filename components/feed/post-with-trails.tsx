
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Plus } from "lucide-react"
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

  return (
    <div className="space-y-2">
      {/* Main Post */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src={post.author.profileImageUrl || "/images/student-profile.png"}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-sm">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Badge variant="outline" className="bg-pathpiper-teal/10 text-pathpiper-teal border-pathpiper-teal/20 text-xs py-0 px-2">
                    {post.author.role}
                  </Badge>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Content */}
          <p className="text-sm text-gray-700 mb-3">{post.content}</p>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={500}
                height={300}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Trail indicator */}
          {post.trails.length > 0 && (
            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrails(!showTrails)}
                className="text-pathpiper-teal hover:text-pathpiper-teal hover:bg-pathpiper-teal/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                {showTrails ? 'Hide' : 'Show'} trail ({post.trails.length})
              </Button>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500 flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span className="text-xs">{post.likesCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500 flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.commentsCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500">
                <Repeat2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                <Share className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddTrail(!showAddTrail)}
              className="text-pathpiper-teal hover:text-pathpiper-teal hover:bg-pathpiper-teal/10"
            >
              <Plus className="h-4 w-4 mr-1" />
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
        <div className="ml-8 space-y-2">
          {post.trails.map((trail) => (
            <Card key={trail.id} className="border border-gray-100 shadow-sm bg-gray-50/50">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={trail.author.profileImageUrl || "/images/student-profile.png"}
                      alt={`${trail.author.firstName} ${trail.author.lastName}`}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {trail.author.firstName} {trail.author.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(trail.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-xs py-0 px-1 bg-purple-50 text-purple-600 border-purple-200">
                        #{trail.trailOrder}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{trail.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
