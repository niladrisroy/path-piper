"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase-types"
import { useAuth } from "@/contexts/auth-context"
import FeedItem from "./feed-item"
import CreatePost from "./create-post"
import FeedFilter from "./feed-filter"

type FeedPost = {
  id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  user_id: string
  profiles: {
    first_name: string
    last_name: string
    profile_image_url: string | null
  }
}

export default function RealtimeFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)

      const query = supabase
        .from("feed_posts")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters if needed
      if (filter === "following") {
        // This would require a table of followed users
        // query = query.in('user_id', followedUserIds)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching posts:", error)
        return
      }

      setPosts(data as unknown as FeedPost[])
      setIsLoading(false)
    }

    fetchPosts()

    // Set up realtime subscription
    const channel = supabase
      .channel("public:feed_posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_posts",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the new post with profile info
            supabase
              .from("feed_posts")
              .select(`
                *,
                profiles:user_id (
                  first_name,
                  last_name,
                  profile_image_url
                )
              `)
              .eq("id", payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  setPosts((prev) => [data as unknown as FeedPost, ...prev])
                }
              })
          } else if (payload.eventType === "UPDATE") {
            setPosts((prev) => prev.map((post) => (post.id === payload.new.id ? { ...post, ...payload.new } : post)))
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) => prev.filter((post) => post.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, filter])

  const handleCreatePost = async (content: string, imageUrl: string | null) => {
    if (!user) return

    const { error } = await supabase.from("feed_posts").insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
    })

    if (error) {
      console.error("Error creating post:", error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <CreatePost onCreatePost={handleCreatePost} />

      <div className="my-6">
        <FeedFilter currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
          <p className="mt-2 text-gray-500">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <FeedItem
              key={post.id}
              post={{
                id: post.id,
                content: post.content,
                imageUrl: post.image_url,
                likesCount: post.likes_count,
                commentsCount: post.comments_count,
                createdAt: new Date(post.created_at),
                author: {
                  id: post.user_id,
                  name: `${post.profiles.first_name} ${post.profiles.last_name}`,
                  avatarUrl: post.profiles.profile_image_url || "/diverse-avatars.png",
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
