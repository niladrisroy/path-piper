import { createClientSideSupabaseClient } from "./client"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Subscribe to feed posts changes
export const subscribeToPosts = (callback: (payload: any) => void) => {
  const supabase = createClientSideSupabaseClient()

  const channel = supabase
    .channel("public:feed_posts")
    .on("postgres_changes", { event: "*", schema: "public", table: "feed_posts" }, (payload) => {
      callback(payload)
    })
    .subscribe()

  return channel
}

// Subscribe to post comments
export const subscribeToComments = (postId: string, callback: (payload: any) => void) => {
  const supabase = createClientSideSupabaseClient()

  const channel = supabase
    .channel(`public:post_comments:${postId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
      (payload) => {
        callback(payload)
      },
    )
    .subscribe()

  return channel
}

// Subscribe to post likes
export const subscribeToLikes = (postId: string, callback: (payload: any) => void) => {
  const supabase = createClientSideSupabaseClient()

  const channel = supabase
    .channel(`public:post_likes:${postId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_likes", filter: `post_id=eq.${postId}` },
      (payload) => {
        callback(payload)
      },
    )
    .subscribe()

  return channel
}

// Unsubscribe from a channel
export const unsubscribe = (channel: RealtimeChannel) => {
  const supabase = createClientSideSupabaseClient()
  supabase.removeChannel(channel)
}
