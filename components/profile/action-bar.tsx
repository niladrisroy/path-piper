"use client"

import { MessageSquareIcon, UserPlusIcon, ShareIcon, BookmarkIcon, MoreHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ActionBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-4 z-10">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ShareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <BookmarkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
