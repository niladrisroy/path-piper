"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Video, Link, Smile, MapPin } from "lucide-react"

export default function CreatePost() {
  const [postText, setPostText] = useState("")

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* User Avatar */}
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/images/student-profile.png"
              alt="Your profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          {/* Post Input */}
          <div className="flex-1">
            <div
              className="border border-gray-200 rounded-lg p-3 mb-3 min-h-[80px] focus-within:border-pathpiper-teal focus-within:ring-1 focus-within:ring-pathpiper-teal"
              contentEditable
              role="textbox"
              aria-multiline="true"
              onInput={(e) => setPostText(e.currentTarget.textContent || "")}
              suppressContentEditableWarning={true}
              data-placeholder="What's on your mind?"
              style={{
                outline: "none",
              }}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
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
              <Button
                className="bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue text-white rounded-full px-4"
                disabled={!postText.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
