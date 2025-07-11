"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ImageIcon, 
  Video, 
  Link, 
  Smile, 
  MapPin, 
  Plus, 
  Trophy, 
  Code, 
  HelpCircle, 
  MessageSquare,
  MessageCircle,
  BookOpen,
  Share2,
  Calendar,
  Hash,
  X
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface CreatePostProps {
  parentPostId?: string
  isTrail?: boolean
  onPostCreated?: () => void
}

const POST_TYPES = [
  { value: "GENERAL", label: "General Post", icon: MessageSquare, color: "bg-blue-500" },
  { value: "ACHIEVEMENT", label: "Achievement", icon: Trophy, color: "bg-yellow-500" },
  { value: "PROJECT", label: "Project", icon: Code, color: "bg-green-500" },
  { value: "QUESTION", label: "Question", icon: HelpCircle, color: "bg-purple-500" },
  { value: "DISCUSSION", label: "Discussion", icon: MessageSquare, color: "bg-indigo-500" },
  { value: "TUTORIAL", label: "Tutorial", icon: BookOpen, color: "bg-orange-500" },
  { value: "RESOURCE_SHARE", label: "Resource", icon: Share2, color: "bg-teal-500" },
  { value: "EVENT_ANNOUNCEMENT", label: "Event", icon: Calendar, color: "bg-red-500" },
]

const ACHIEVEMENT_TYPES = [
  "Academic Excellence", "Competition Win", "Project Completion", "Skill Mastery",
  "Leadership", "Community Service", "Research", "Innovation", "Sports", "Arts"
]

const PROJECT_CATEGORIES = [
  "Web Development", "Mobile App", "Data Science", "AI/ML", "IoT", "Robotics",
  "Game Development", "Research", "Art Project", "Science Experiment", "Other"
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" }
]



export default function CreatePost({ parentPostId, isTrail = false, onPostCreated }: CreatePostProps) {
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [postType, setPostType] = useState("GENERAL")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [achievementType, setAchievementType] = useState("")
  const [projectCategory, setProjectCategory] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("")
  const [visibility, setVisibility] = useState("public")
  const { user } = useAuth()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [trailContext, setTrailContext] = useState<any>(null)

  const selectedPostType = POST_TYPES.find(type => type.value === postType)

  // Fetch connections for @ mentions
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections')
        if (response.ok) {
          const data = await response.json()
          setConnections(data)
        }
      } catch (error) {
        console.error('Error fetching connections:', error)
      }
    }

    fetchConnections()
  }, [])

  // Fetch trail context when creating a trail
  useEffect(() => {
    if (isTrail && parentPostId) {
      const fetchTrailContext = async () => {
        try {
          const response = await fetch(`/api/feed/posts/${parentPostId}`)
          if (response.ok) {
            const data = await response.json()
            setTrailContext(data)
          }
        } catch (error) {
          console.error('Error fetching trail context:', error)
        }
      }

      fetchTrailContext()
    }
  }, [isTrail, parentPostId])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const position = e.target.selectionStart
    setPostText(value)
    setCursorPosition(position)
    setHasUnsavedChanges(true) // Indicate changes

    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g
    const extractedHashtags = [...value.matchAll(hashtagRegex)].map(match => match[1])

    // Update tags with extracted hashtags, avoiding duplicates
    const uniqueHashtags = [...new Set([...tags, ...extractedHashtags])]
    if (uniqueHashtags.length !== tags.length || !tags.every(tag => uniqueHashtags.includes(tag))) {
      setTags(uniqueHashtags)
    }

    // Check for @ mentions
    const textUpToCursor = value.substring(0, position)
    const lastAtIndex = textUpToCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = textUpToCursor.substring(lastAtIndex + 1)
      // Check if there's no space after @, meaning we're still typing a mention
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionSearch(textAfterAt.toLowerCase())
        setShowMentions(true)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (connection: any) => {
    const textUpToCursor = postText.substring(0, cursorPosition)
    const textAfterCursor = postText.substring(cursorPosition)
    const lastAtIndex = textUpToCursor.lastIndexOf('@')

    const beforeAt = postText.substring(0, lastAtIndex)
    const mention = `@${connection.user.firstName} ${connection.user.lastName}`
    const newText = beforeAt + mention + ' ' + textAfterCursor

    setPostText(newText)
    setShowMentions(false)
    setHasUnsavedChanges(true) // Indicate changes

    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus()
      const newPosition = beforeAt.length + mention.length + 1
      textareaRef.current?.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const filteredConnections = connections.filter(conn =>
    mentionSearch === '' || 
    conn.user.firstName.toLowerCase().includes(mentionSearch) ||
    conn.user.lastName.toLowerCase().includes(mentionSearch)
  )

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    setHasUnsavedChanges(true) // Indicate changes
  }

  



  const handlePost = async () => {
    if (!postText.trim()) {
      toast.error("Please write something to post")
      return
    }

    // Enforce character limit strictly for all posts
    if (characterCount > 300) {
      toast.error("Content exceeds 300 characters. Please shorten your content.")
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
          parentPostId: parentPostId || undefined,
          postType: isTrail ? "GENERAL" : postType,
          tags: isTrail ? [] : tags,
          achievementType: isTrail ? undefined : (achievementType || undefined),
          projectCategory: isTrail ? undefined : (projectCategory || undefined),
          difficultyLevel: isTrail ? undefined : (difficultyLevel || undefined),
          visibility: isTrail ? "public" : visibility,
          isTrail,
          imageUrl: imageUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPostText("")
        setTags([])
        setAchievementType("")
        setProjectCategory("")
        setDifficultyLevel("")
        setPostType("GENERAL")
        setVisibility("public")
        setImageUrl(null)
        setHasUnsavedChanges(false)
        toast.success(isTrail ? "Trail added successfully!" : "Post created successfully!")
        onPostCreated?.()
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



  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file, file.name)

    try {
      const response = await fetch('/api/upload/feed-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)
      setHasUnsavedChanges(true) // Indicate changes
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const characterCount = postText.length
  const isOverLimit = characterCount > 300 && !isTrail



  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return "You have unsaved changes. Are you sure you want to leave?"
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  if (isTrail) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user?.profileImageUrl || "/images/student-profile.png"}
                alt="Your profile"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              {/* Compact Trail Preview Above Input */}
              {trailContext && (
                <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <div className="text-xs text-purple-700 font-medium mb-2 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Adding to trail
                  </div>

                  {/* Parent Post Preview */}
                  <div className="mb-2 p-2 bg-white rounded border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 w-4 rounded-full overflow-hidden">
                        <Image
                          src={trailContext.author?.profileImageUrl || "/images/student-profile.png"}
                          alt={`${trailContext.author?.firstName} ${trailContext.author?.lastName}`}
                          width={16}
                          height={16}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-xs">{trailContext.author?.firstName}</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">Original</span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{trailContext.content}</p>
                  </div>

                  {/* Recent Trail Messages Preview */}
                  {trailContext.trails && trailContext.trails.length > 0 && (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {trailContext.trails.slice(-2).map((trail: any, index: number) => (
                        <div key={trail.id} className="p-1.5 bg-white rounded border border-purple-100">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="h-3 w-3 rounded-full overflow-hidden">
                              <Image
                                src={trail.author?.profileImageUrl || "/images/student-profile.png"}
                                alt={`${trail.author?.firstName} ${trail.author?.lastName}`}
                                width={12}
                                height={12}
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium text-xs">{trail.author?.firstName}</span>
                            <span className="text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">#{trail.trailOrder}</span>
                          </div>
                          <p className="text-xs text-gray-600 pl-4 line-clamp-1">{trail.content}</p>
                        </div>
                      ))}
                      {trailContext.trails.length > 2 && (
                        <div className="text-xs text-purple-600 text-center py-1">
                          +{trailContext.trails.length - 2} more messages
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={handleTextChange}
                  placeholder="Continue your trail... (Use @ to mention connections, # for hashtags)"
                  className="min-h-[80px] resize-none border border-gray-200 focus:border-pathpiper-teal focus:ring-1 focus:ring-pathpiper-teal"
                  disabled={isPosting}
                />

                {/* Mentions Dropdown for Trail */}
                {showMentions && filteredConnections.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredConnections.slice(0, 5).map((connection) => (
                      <div
                        key={connection.id}
                        onClick={() => insertMention(connection)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={connection.user.profileImageUrl || "/images/student-profile.png"}
                            alt={`${connection.user.firstName} ${connection.user.lastName}`}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {connection.user.firstName} {connection.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {connection.user.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-400">{characterCount} characters</div>
                <Button
                  onClick={handlePost}
                  disabled={!postText.trim() || isPosting}
                  className="bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue text-white rounded-full px-4"
                >
                  Add Trail
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user?.profileImageUrl || "/images/student-profile.png"}
              alt="Your profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          <div className="flex-1">


            <div className="space-y-4">
              {/* Post Type and Visibility Selection */}
              <div className="flex gap-3 flex-wrap items-center justify-between">
                <div className="flex gap-2 flex-wrap items-center">
                  {/* Quick Access Buttons */}
                  {POST_TYPES.slice(0, 2).map((type) => {
                    const Icon = type.icon
                    return (
                      <Button
                        key={type.value}
                        variant={postType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPostType(type.value)}
                        className={`${postType === type.value ? type.color + ' text-white' : ''}`}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {type.label}
                      </Button>
                    )
                  })}
                  
                  {/* All Post Types Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-gray-600">
                        <Plus className="h-4 w-4 mr-1" />
                        More Types
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {POST_TYPES.slice(2).map((type) => {
                        const Icon = type.icon
                        return (
                          <DropdownMenuItem
                            key={type.value}
                            onClick={() => setPostType(type.value)}
                            className={`cursor-pointer ${postType === type.value ? 'bg-gray-100' : ''}`}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Visibility Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        visibility === "public" ? "bg-green-500" :
                        visibility === "private" ? "bg-orange-500" : "bg-red-500"
                      }`}></div>
                      <span className="capitalize">
                        {visibility === "only_me" ? "Only Me" : visibility}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={() => setVisibility("public")}
                      className={`cursor-pointer ${visibility === "public" ? 'bg-green-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Public
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setVisibility("private")}
                      className={`cursor-pointer ${visibility === "private" ? 'bg-orange-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        Private
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setVisibility("only_me")}
                      className={`cursor-pointer ${visibility === "only_me" ? 'bg-red-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        Only Me
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

                {/* Main Content Area */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={handleTextChange}
                  placeholder={
                    postType === "ACHIEVEMENT" ? "Share your achievement... (Use @ to mention connections, # for hashtags)" :
                    postType === "PROJECT" ? "Tell us about your project... (Use @ to mention connections, # for hashtags)" :
                    postType === "QUESTION" ? "Ask your question... (Use @ to mention connections, # for hashtags)" :
                    "What's on your mind? (Use @ to mention connections, # for hashtags)"
                  }
                  className={`min-h-[120px] resize-none border ${
                    isOverLimit ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pathpiper-teal'
                  } focus:ring-1 ${
                    isOverLimit ? 'focus:ring-red-500' : 'focus:ring-pathpiper-teal'
                  }`}
                  disabled={isPosting}
                />

                {/* Mentions Dropdown */}
                {showMentions && filteredConnections.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredConnections.slice(0, 5).map((connection) => (
                      <div
                        key={connection.id}
                        onClick={() => insertMention(connection)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={connection.user.profileImageUrl || "/images/student-profile.png"}
                            alt={`${connection.user.firstName} ${connection.user.lastName}`}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {connection.user.firstName} {connection.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {connection.user.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`absolute bottom-2 right-2 text-xs font-medium ${
                  isOverLimit ? 'text-red-500 bg-red-50 px-2 py-1 rounded' : 
                  characterCount > 250 ? 'text-orange-500 bg-orange-50 px-2 py-1 rounded' : 
                  'text-gray-400'
                }`}>
                  {characterCount}/300
                  {isOverLimit && <span className="ml-1">⚠️</span>}
                </div>
              </div>

              {/* Post Type Specific Fields */}
              {postType === "ACHIEVEMENT" && (
                <Select value={achievementType} onValueChange={setAchievementType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select achievement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACHIEVEMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {postType === "PROJECT" && (
                <Select value={projectCategory} onValueChange={setProjectCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Difficulty Level */}
              {(postType === "PROJECT" || postType === "TUTORIAL" || postType === "QUESTION") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm" variant="outline">
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer hover:text-red-600" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              

              {/* Over limit warning */}
              {isOverLimit && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium mb-1 flex items-center gap-2">
                    <span className="text-amber-500">⚠️</span>
                    Content exceeds 300 characters!
                  </p>
                  <p className="text-xs text-amber-600">
                    Please shorten your content to 300 characters or less.
                  </p>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative mt-4">
                <img 
                  src={imageUrl} 
                  alt="Post image" 
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: '300px' }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* Only show upload buttons if no image is uploaded */}
                {!imageUrl && (
                  <>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Image size should be less than 5MB")
                              return
                            }
                            handleImageUpload(file)
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-gray-100" asChild>
                          <span>
                            <ImageIcon className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                    <div className="relative group">
                      <Button variant="ghost" size="sm" className="text-gray-400 h-8 w-8 p-0 rounded-full cursor-not-allowed">
                        <Video className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Coming Soon
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePost}
                  disabled={!postText.trim() || isPosting || isOverLimit}
                  size="sm"
                  className={`${selectedPostType?.color || 'bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue'} text-white rounded-full px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200 ${isOverLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedPostType && <selectedPostType.icon className="h-4 w-4 mr-1" />}
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}