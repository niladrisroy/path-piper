
"use client"

import { useState } from "react"
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
  BookOpen,
  Share2,
  Calendar,
  Hash,
  X
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

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
  const { user } = useAuth()

  const selectedPostType = POST_TYPES.find(type => type.value === postType)

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
        setPostText("")
        setTags([])
        setSubjects([])
        setAchievementType("")
        setProjectCategory("")
        setDifficultyLevel("")
        setPostType("GENERAL")
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

      setPostText("")
      setTags([])
      setSubjects([])
      setAchievementType("")
      setProjectCategory("")
      setDifficultyLevel("")
      setPostType("GENERAL")
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
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Continue your trail..."
                className="min-h-[80px] resize-none border border-gray-200 focus:border-pathpiper-teal focus:ring-1 focus:ring-pathpiper-teal"
                disabled={isPosting}
              />
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
                <div className="relative">
                  <Textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder={
                      postType === "ACHIEVEMENT" ? "Share your achievement..." :
                      postType === "PROJECT" ? "Tell us about your project..." :
                      postType === "QUESTION" ? "Ask your question..." :
                      "What's on your mind?"
                    }
                    className={`min-h-[120px] resize-none border ${
                      isOverLimit ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pathpiper-teal'
                    } focus:ring-1 ${
                      isOverLimit ? 'focus:ring-red-500' : 'focus:ring-pathpiper-teal'
                    }`}
                    disabled={isPosting}
                  />
                  
                  <div className={`absolute bottom-2 right-2 text-xs ${
                    isOverLimit ? 'text-red-500' : characterCount > 250 ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {characterCount}/300
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
    </Card>
  )
}
