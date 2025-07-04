
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import RichTextEditor from "@/components/ui/rich-text-editor"
import { 
  ImageIcon, 
  Video, 
  Calendar as CalendarIcon,
  Save,
  Clock,
  Plus, 
  Trophy, 
  Code, 
  HelpCircle, 
  MessageSquare,
  BookOpen,
  Share2,
  Hash,
  X,
  Upload,
  FileText
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { format } from "date-fns"

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
  { value: "EVENT_ANNOUNCEMENT", label: "Event", icon: CalendarIcon, color: "bg-red-500" },
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

const COMMON_SUBJECTS = [
  "Mathematics", "Science", "Physics", "Chemistry", "Biology", "Computer Science",
  "English", "History", "Geography", "Art", "Music", "Sports", "Languages"
]

export default function CreatePost({ parentPostId, isTrail = false, onPostCreated }: CreatePostProps) {
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [showTrailOption, setShowTrailOption] = useState(false)
  const [postType, setPostType] = useState("GENERAL")
  const [tags, setTags] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [achievementType, setAchievementType] = useState("")
  const [projectCategory, setProjectCategory] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showVideoComingSoon, setShowVideoComingSoon] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("")
  const [useRichTextEditor, setUseRichTextEditor] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const selectedPostType = POST_TYPES.find(type => type.value === postType)

  // Auto-save draft functionality
  useEffect(() => {
    if (!autoSaveEnabled || isTrail || !postText.trim()) return

    const timeoutId = setTimeout(() => {
      saveDraft()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [postText, postType, tags, subjects, imageUrl, achievementType, projectCategory, difficultyLevel])

  // Load draft on component mount
  useEffect(() => {
    if (!isTrail) {
      loadDraft()
    }
  }, [])

  const saveDraft = async () => {
    try {
      await fetch('/api/feed/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postText,
          postType,
          tags,
          subjects,
          imageUrl,
          achievementType,
          projectCategory,
          difficultyLevel
        })
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const loadDraft = async () => {
    try {
      const response = await fetch('/api/feed/drafts')
      const data = await response.json()
      
      if (data.draft) {
        setPostText(data.draft.content || "")
        setPostType(data.draft.postType || "GENERAL")
        setTags(data.draft.tags || [])
        setSubjects(data.draft.subjects || [])
        setImageUrl(data.draft.imageUrl)
        setAchievementType(data.draft.achievementType || "")
        setProjectCategory(data.draft.projectCategory || "")
        setDifficultyLevel(data.draft.difficultyLevel || "")
        
        if (data.draft.content) {
          toast.info("Draft loaded", { description: "Your unsaved work has been restored." })
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }

  const clearDraft = async () => {
    try {
      await fetch('/api/feed/drafts', { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/feed-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setImageUrl(data.imageUrl)
        setImagePreview(URL.createObjectURL(file))
        toast.success("Image uploaded successfully!")
      } else {
        toast.error(data.error || "Failed to upload image")
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addSubject = (subject: string) => {
    if (!subjects.includes(subject)) {
      setSubjects([...subjects, subject])
    }
  }

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject))
  }

  const handleSchedulePost = async () => {
    if (!postText.trim()) {
      toast.error("Please write something to schedule")
      return
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error("Please select date and time")
      return
    }

    const [hours, minutes] = scheduledTime.split(':').map(Number)
    const scheduledDateTime = new Date(scheduledDate)
    scheduledDateTime.setHours(hours, minutes, 0, 0)

    if (scheduledDateTime <= new Date()) {
      toast.error("Scheduled time must be in the future")
      return
    }

    setIsPosting(true)
    try {
      const response = await fetch('/api/feed/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postText,
          imageUrl,
          scheduledFor: scheduledDateTime.toISOString(),
          postType,
          tags,
          subjects,
          achievementType: postType === "ACHIEVEMENT" ? achievementType : null,
          projectCategory: postType === "PROJECT" ? projectCategory : null,
          difficultyLevel,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        resetForm()
        setShowScheduleDialog(false)
        toast.success("Post scheduled successfully!")
        onPostCreated?.()
      } else {
        toast.error(data.error || "Failed to schedule post")
      }
    } catch (error) {
      console.error('Error scheduling post:', error)
      toast.error("Failed to schedule post")
    } finally {
      setIsPosting(false)
    }
  }

  const resetForm = () => {
    setPostText("")
    setTags([])
    setSubjects([])
    setAchievementType("")
    setProjectCategory("")
    setDifficultyLevel("")
    setPostType("GENERAL")
    setShowTrailOption(false)
    removeImage()
    clearDraft()
  }

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
          imageUrl,
          parentPostId,
          isTrail,
          postType,
          tags,
          subjects,
          achievementType: postType === "ACHIEVEMENT" ? achievementType : null,
          projectCategory: postType === "PROJECT" ? projectCategory : null,
          difficultyLevel,
          isQuestion: postType === "QUESTION",
          isAchievement: postType === "ACHIEVEMENT",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        resetForm()
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
      const chunks = []
      let remainingText = postText
      
      while (remainingText.length > 0) {
        if (remainingText.length <= 300) {
          chunks.push(remainingText)
          break
        }
        
        let breakPoint = 300
        while (breakPoint > 0 && remainingText[breakPoint] !== ' ') {
          breakPoint--
        }
        if (breakPoint === 0) breakPoint = 300
        
        chunks.push(remainingText.substring(0, breakPoint))
        remainingText = remainingText.substring(breakPoint).trim()
      }

      const mainPostResponse = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: chunks[0],
          imageUrl,
          isTrail: false,
          postType,
          tags,
          subjects,
          achievementType: postType === "ACHIEVEMENT" ? achievementType : null,
          projectCategory: postType === "PROJECT" ? projectCategory : null,
          difficultyLevel,
          isQuestion: postType === "QUESTION",
          isAchievement: postType === "ACHIEVEMENT",
        }),
      })

      const mainPostData = await mainPostResponse.json()
      
      if (!mainPostResponse.ok) {
        throw new Error(mainPostData.error)
      }

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

      resetForm()
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
              {useRichTextEditor ? (
                <RichTextEditor
                  value={postText}
                  onChange={setPostText}
                  placeholder="Continue your trail..."
                  maxLength={300}
                  disabled={isPosting}
                />
              ) : (
                <div className="relative">
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Continue your trail..."
                    className="min-h-[80px] w-full resize-none border border-gray-200 rounded-lg p-3 focus:border-pathpiper-teal focus:ring-1 focus:ring-pathpiper-teal"
                    disabled={isPosting}
                    maxLength={300}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {characterCount}/300
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseRichTextEditor(!useRichTextEditor)}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {useRichTextEditor ? 'Simple' : 'Rich'} Editor
                </Button>
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
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compose" className="space-y-4">
                {/* Post Type Selection */}
                <div className="flex gap-2 flex-wrap">
                  {POST_TYPES.slice(0, 4).map((type) => {
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
                </div>

                {/* Main Content Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Content</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseRichTextEditor(!useRichTextEditor)}
                      className="text-xs h-6"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {useRichTextEditor ? 'Simple' : 'Rich'} Editor
                    </Button>
                  </div>
                  
                  {useRichTextEditor ? (
                    <RichTextEditor
                      value={postText}
                      onChange={setPostText}
                      placeholder={
                        postType === "ACHIEVEMENT" ? "Share your achievement..." :
                        postType === "PROJECT" ? "Tell us about your project..." :
                        postType === "QUESTION" ? "Ask your question..." :
                        "What's on your mind?"
                      }
                      maxLength={300}
                      disabled={isPosting}
                    />
                  ) : (
                    <div className="relative">
                      <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder={
                          postType === "ACHIEVEMENT" ? "Share your achievement..." :
                          postType === "PROJECT" ? "Tell us about your project..." :
                          postType === "QUESTION" ? "Ask your question..." :
                          "What's on your mind?"
                        }
                        className={`min-h-[120px] w-full resize-none border rounded-lg p-3 ${
                          isOverLimit ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pathpiper-teal'
                        } focus:ring-1 ${
                          isOverLimit ? 'focus:ring-red-500' : 'focus:ring-pathpiper-teal'
                        }`}
                        disabled={isPosting}
                        maxLength={isOverLimit ? undefined : 300}
                      />
                      
                      <div className={`absolute bottom-2 right-2 text-xs ${
                        isOverLimit ? 'text-red-500' : characterCount > 250 ? 'text-orange-500' : 'text-gray-400'
                      }`}>
                        {characterCount}/300
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Upload Area */}
                {(imagePreview || imageUrl) && (
                  <div className="relative">
                    <Image
                      src={imagePreview || imageUrl || ''}
                      alt="Upload preview"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover max-h-48 w-auto"
                    />
                    <Button
                      onClick={removeImage}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

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
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Over limit warning */}
                {isOverLimit && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      Your post exceeds 300 characters. Create a trail to share longer content.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {/* Auto-save toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-save drafts</span>
                  <Button
                    variant={autoSaveEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {autoSaveEnabled ? 'On' : 'Off'}
                  </Button>
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Related Subjects</label>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SUBJECTS.map((subject) => (
                      <Button
                        key={subject}
                        variant={subjects.includes(subject) ? "default" : "outline"}
                        size="sm"
                        onClick={() => subjects.includes(subject) ? removeSubject(subject) : addSubject(subject)}
                        className="text-xs"
                      >
                        {subject}
                      </Button>
                    ))}
                  </div>
                  {subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeSubject(subject)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

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

                {/* More Post Types */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">More Post Types</label>
                  <div className="flex gap-2 flex-wrap">
                    {POST_TYPES.slice(4).map((type) => {
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
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {/* Image Upload */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 h-8 w-8 p-0 rounded-full cursor-pointer" 
                      asChild
                      disabled={isUploading}
                    >
                      <span>
                        {isUploading ? (
                          <Upload className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Video Upload - Coming Soon */}
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 h-8 w-8 p-0 rounded-full cursor-not-allowed"
                    onClick={() => setShowVideoComingSoon(true)}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Coming Soon
                  </div>
                </div>

                {/* Schedule Post */}
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-600 h-8 w-8 p-0 rounded-full">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Schedule Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={scheduledDate}
                              onSelect={setScheduledDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Time</label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleSchedulePost} 
                        disabled={!scheduledDate || !scheduledTime || isPosting}
                        className="w-full"
                      >
                        {isPosting ? "Scheduling..." : "Schedule Post"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  className={`${selectedPostType?.color || 'bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue'} text-white rounded-full px-6`}
                >
                  {selectedPostType && <selectedPostType.icon className="h-4 w-4 mr-1" />}
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Video Coming Soon Dialog */}
      <Dialog open={showVideoComingSoon} onOpenChange={setShowVideoComingSoon}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Upload - Coming Soon!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              We're working hard to bring you video upload functionality. Stay tuned for this exciting feature!
            </p>
            <div className="text-sm text-gray-500">
              <p>Features coming soon:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>MP4, MOV, AVI support</li>
                <li>Video compression</li>
                <li>Thumbnail generation</li>
                <li>Progress tracking</li>
              </ul>
            </div>
            <Button onClick={() => setShowVideoComingSoon(false)} className="w-full">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
