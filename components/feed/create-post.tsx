
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Video, Link, Smile, MapPin, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface CreatePostProps {
  parentPostId?: string
  isTrail?: boolean
  onPostCreated?: () => void
}

export default function CreatePost({ parentPostId, isTrail = false, onPostCreated }: CreatePostProps) {
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [showTrailOption, setShowTrailOption] = useState(false)
  const { user } = useAuth()

  const handlePost = async () => {
    if (!postText.trim()) {
      toast.error("Please write something to post")
      return
    }

    setIsPosting(true)
    try {
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postText,
          parentPostId,
          isTrail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPostText("")
        setShowTrailOption(false)
        toast.success(isTrail ? "Trail added successfully!" : "Post created successfully!")
        onPostCreated?.()
      } else if (data.suggestTrail) {
        setShowTrailOption(true)
        toast.error(data.error)
      } else {
        toast.error(data.error || "Failed to create post")
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error("Failed to create post")
    } finally {
      setIsPosting(false)
    }
  }

  const handleCreateTrail = async () => {
    if (!postText.trim()) {
      toast.error("Please write something to post")
      return
    }

    setIsPosting(true)
    try {
      // Split content into chunks of 300 characters
      const chunks = []
      let remainingText = postText
      
      while (remainingText.length > 0) {
        if (remainingText.length <= 300) {
          chunks.push(remainingText)
          break
        }
        
        // Find the best break point (last space before 300 chars)
        let breakPoint = 300
        while (breakPoint > 0 && remainingText[breakPoint] !== ' ') {
          breakPoint--
        }
        if (breakPoint === 0) breakPoint = 300
        
        chunks.push(remainingText.substring(0, breakPoint))
        remainingText = remainingText.substring(breakPoint).trim()
      }

      // Create main post with first chunk
      const mainPostResponse = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: chunks[0],
          isTrail: false,
        }),
      })

      const mainPostData = await mainPostResponse.json()
      
      if (!mainPostResponse.ok) {
        throw new Error(mainPostData.error)
      }

      // Create trail posts for remaining chunks
      for (let i = 1; i < chunks.length; i++) {
        await fetch('/api/feed/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: chunks[i],
            parentPostId: mainPostData.post.id,
            isTrail: true,
          }),
        })
      }

      setPostText("")
      setShowTrailOption(false)
      toast.success("Trail created successfully!")
      onPostCreated?.()
    } catch (error) {
      console.error('Error creating trail:', error)
      toast.error("Failed to create trail")
    } finally {
      setIsPosting(false)
    }
  }

  const characterCount = postText.length
  const isOverLimit = characterCount > 300 && !isTrail

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* User Avatar */}
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user?.profileImageUrl || "/images/student-profile.png"}
              alt="Your profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          {/* Post Input */}
          <div className="flex-1">
            <div className="relative">
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={isTrail ? "Continue your trail..." : "What's on your mind?"}
                className={`min-h-[80px] resize-none border ${
                  isOverLimit ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pathpiper-teal'
                } focus:ring-1 ${
                  isOverLimit ? 'focus:ring-red-500' : 'focus:ring-pathpiper-teal'
                }`}
                disabled={isPosting}
              />
              
              {/* Character Count */}
              <div className={`absolute bottom-2 right-2 text-xs ${
                isOverLimit ? 'text-red-500' : characterCount > 250 ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {characterCount}/300
              </div>
            </div>

            {/* Over limit warning */}
            {isOverLimit && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Your post exceeds 300 characters. Create a trail to share longer content.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full">
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                {(showTrailOption || isOverLimit) && (
                  <Button
                    onClick={handleCreateTrail}
                    disabled={!postText.trim() || isPosting}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full px-4 hover:from-purple-600 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Trail
                  </Button>
                )}
                
                <Button
                  onClick={handlePost}
                  disabled={!postText.trim() || isOverLimit || isPosting}
                  className="bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue text-white rounded-full px-4"
                >
                  {isTrail ? "Add Trail" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
