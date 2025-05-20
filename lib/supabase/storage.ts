import { createClientSideSupabaseClient } from "./client"
import { createServerSideSupabaseClient } from "./server"
import { v4 as uuidv4 } from "uuid"

// Upload profile image
export const uploadProfileImage = async (file: File, userId: string) => {
  const supabase = createClientSideSupabaseClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${uuidv4()}.${fileExt}`
  const filePath = `profile-images/${fileName}`

  // Upload the file
  const { data, error } = await supabase.storage.from("user-content").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    return { data: null, error }
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage.from("user-content").getPublicUrl(filePath)

  return { data: publicUrlData.publicUrl, error: null }
}

// Upload post image
export const uploadPostImage = async (file: File, userId: string) => {
  const supabase = createClientSideSupabaseClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${uuidv4()}.${fileExt}`
  const filePath = `post-images/${fileName}`

  // Upload the file
  const { data, error } = await supabase.storage.from("user-content").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    return { data: null, error }
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage.from("user-content").getPublicUrl(filePath)

  return { data: publicUrlData.publicUrl, error: null }
}

// Upload institution gallery image
export const uploadGalleryImage = async (file: File, institutionId: string) => {
  const supabase = createClientSideSupabaseClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${institutionId}/${uuidv4()}.${fileExt}`
  const filePath = `gallery-images/${fileName}`

  // Upload the file
  const { data, error } = await supabase.storage.from("institution-content").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    return { data: null, error }
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage.from("institution-content").getPublicUrl(filePath)

  return { data: publicUrlData.publicUrl, error: null }
}

// Delete a file
export const deleteFile = async (filePath: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.storage.from("user-content").remove([filePath])

  return { error }
}

// Server-side function to get a list of files
export const getFilesList = async (userId: string, folder: string) => {
  const supabase = createServerSideSupabaseClient()

  const { data, error } = await supabase.storage.from("user-content").list(`${folder}/${userId}`)

  return { data, error }
}
