import { createClientSideSupabaseClient } from "./client"
import { createServerSideSupabaseClient, createServerActionSupabaseClient } from "./server"
import type { FeedPost, PostComment } from "@/types/database"

// Client-side feed functions
export const createPost = async (
  post: Omit<FeedPost, "id" | "created_at" | "updated_at" | "likes_count" | "comments_count">,
) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("feed_posts")
    .insert({
      ...post,
      likes_count: 0,
      comments_count: 0,
    })
    .select()
    .single()

  return { data, error }
}

export const getFeedPosts = async (limit = 10, offset = 0) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("feed_posts")
    .select(`
      *,
      profile:profiles!feed_posts_user_id_fkey(*)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
}

export const getUserPosts = async (userId: string, limit = 10, offset = 0) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("feed_posts")
    .select(`
      *,
      profile:profiles!feed_posts_user_id_fkey(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
}

export const likePost = async (postId: string, userId: string) => {
  const supabase = createClientSideSupabaseClient()

  // First, check if the user already liked the post
  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single()

  if (existingLike) {
    return { data: existingLike, error: null }
  }

  // Create the like
  const { data, error } = await supabase
    .from("post_likes")
    .insert({
      post_id: postId,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  // Increment the likes count
  await supabase.rpc("increment_post_likes", { post_id: postId })

  return { data, error: null }
}

export const unlikePost = async (postId: string, userId: string) => {
  const supabase = createClientSideSupabaseClient()

  // Delete the like
  const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)

  if (error) {
    return { error }
  }

  // Decrement the likes count
  await supabase.rpc("decrement_post_likes", { post_id: postId })

  return { error: null }
}

export const createComment = async (comment: Omit<PostComment, "id" | "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("post_comments").insert(comment).select().single()

  if (error) {
    return { data: null, error }
  }

  // Increment the comments count
  await supabase.rpc("increment_post_comments", { post_id: comment.post_id })

  return { data, error: null }
}

export const getPostComments = async (postId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("post_comments")
    .select(`
      *,
      profile:profiles!post_comments_user_id_fkey(*)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  return { data, error }
}

export const checkIfUserLikedPost = async (postId: string, userId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("post_likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single()

  return { data, error }
}

// Server-side feed functions
export const getFeedPostsServer = async (limit = 10, offset = 0) => {
  const supabase = createServerSideSupabaseClient()

  const { data, error } = await supabase
    .from("feed_posts")
    .select(`
      *,
      profile:profiles!feed_posts_user_id_fkey(*)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
}

// Server actions for feed
export const serverCreatePost = async (
  post: Omit<FeedPost, "id" | "created_at" | "updated_at" | "likes_count" | "comments_count">,
) => {
  "use server"
  const supabase = createServerActionSupabaseClient()

  const { data, error } = await supabase
    .from("feed_posts")
    .insert({
      ...post,
      likes_count: 0,
      comments_count: 0,
    })
    .select()
    .single()

  return { data, error }
}
