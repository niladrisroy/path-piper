
import { supabase } from '../supabase'

export async function getFeedPosts() {
  const { data, error } = await supabase
    .from('feed_posts')
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        role,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feed:', error)
    return []
  }

  return data.map(post => ({
    id: post.id,
    type: 'post',
    author: {
      id: post.profiles.id,
      name: post.profiles.name,
      role: post.profiles.role,
      avatar: post.profiles.avatar_url,
      verified: true
    },
    content: post.content,
    media: post.image_url ? [post.image_url] : [],
    likes: post.likes_count,
    comments: post.comments_count,
    timestamp: new Date(post.created_at).toLocaleString(),
    isPinned: false
  }))
}
