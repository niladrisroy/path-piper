"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  UserPlus,
  Users,
  Star,
  Filter,
  Building,
  Hash,
  Bell,
  Grid,
  Network,
  TrendingUp,
  UserCircle,
  Sparkles,
  Bookmark,
} from "lucide-react"

export default function CircleView() {
  const [viewType, setViewType] = useState<"grid" | "graph">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [showMilestone, setShowMilestone] = useState(false)

  // For demo purposes, show milestone notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMilestone(true)
      setTimeout(() => setShowMilestone(false), 5000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Mock data for different circle types
  const connections = {
    people: [
      {
        id: 1,
        name: "Emma Wilson",
        role: "Student",
        school: "Westlake High School",
        grade: "11th Grade",
        mutualFriends: 5,
        image: "/diverse-students-studying.png",
        isNew: false,
        lastActive: "2h ago",
      },
      {
        id: 2,
        name: "Noah Thompson",
        role: "Student",
        school: "Westlake High School",
        grade: "10th Grade",
        mutualFriends: 3,
        image: "/placeholder.svg?key=ka2xh",
        isNew: true,
        lastActive: "5m ago",
      },
      {
        id: 3,
        name: "Olivia Rodriguez",
        role: "Student",
        school: "Eastside Academy",
        grade: "11th Grade",
        mutualFriends: 7,
        image: "/placeholder.svg?key=hyxpx",
        isNew: false,
        lastActive: "1d ago",
      },
      {
        id: 4,
        name: "Liam Smith",
        role: "Student",
        school: "Westlake High School",
        grade: "12th Grade",
        mutualFriends: 2,
        image: "/student-with-hat.png",
        isNew: false,
        lastActive: "3h ago",
      },
      {
        id: 5,
        name: "Ava Johnson",
        role: "Student",
        school: "Riverdale High",
        grade: "11th Grade",
        mutualFriends: 4,
        image: "/placeholder.svg?key=52z63",
        isNew: false,
        lastActive: "Just now",
      },
      {
        id: 6,
        name: "Ms. Sarah Chen",
        role: "Mentor",
        specialty: "Computer Science",
        mutualFriends: 1,
        image: "/diverse-classroom-teacher.png",
        isNew: false,
        lastActive: "1h ago",
      },
      {
        id: 7,
        name: "Dr. James Miller",
        role: "Mentor",
        specialty: "Physics",
        mutualFriends: 0,
        image: "/diverse-professor-lecturing.png",
        isNew: true,
        lastActive: "2d ago",
      },
      {
        id: 8,
        name: "Sophia Garcia",
        role: "Student",
        school: "Westlake High School",
        grade: "11th Grade",
        mutualFriends: 8,
        image: "/placeholder.svg?key=scaxm",
        isNew: false,
        lastActive: "4h ago",
      },
    ],
    mentors: [
      {
        id: 6,
        name: "Ms. Sarah Chen",
        role: "Mentor",
        specialty: "Computer Science",
        mutualFriends: 1,
        image: "/diverse-classroom-teacher.png",
        isNew: false,
        lastActive: "1h ago",
      },
      {
        id: 7,
        name: "Dr. James Miller",
        role: "Mentor",
        specialty: "Physics",
        mutualFriends: 0,
        image: "/diverse-professor-lecturing.png",
        isNew: true,
        lastActive: "2d ago",
      },
      {
        id: 9,
        name: "Prof. Lisa Wong",
        role: "Mentor",
        specialty: "Mathematics",
        mutualFriends: 2,
        image: "/math-teacher.png",
        isNew: false,
        lastActive: "Yesterday",
      },
    ],
    institutions: [
      {
        id: 101,
        name: "Westlake High School",
        type: "High School",
        members: 1200,
        image: "/university-classroom.png",
        isNew: false,
        lastActive: "Active now",
      },
      {
        id: 102,
        name: "Riverdale High",
        type: "High School",
        members: 950,
        image: "/bustling-university-campus.png",
        isNew: false,
        lastActive: "3h ago",
      },
      {
        id: 103,
        name: "Eastside Academy",
        type: "Private School",
        members: 450,
        image: "/college-library.png",
        isNew: true,
        lastActive: "1d ago",
      },
    ],
    communities: [
      {
        id: 201,
        name: "Coding Club",
        type: "Interest Group",
        members: 48,
        image: "/multiple-monitor-coding.png",
        isNew: false,
        lastActive: "Active now",
        color: "bg-blue-500",
      },
      {
        id: 202,
        name: "Math Olympiad",
        type: "Academic Group",
        members: 32,
        image: "/placeholder.svg?key=math-olympiad",
        isNew: false,
        lastActive: "2h ago",
        color: "bg-purple-500",
      },
      {
        id: 203,
        name: "Debate Team",
        type: "Activity Group",
        members: 24,
        image: "/placeholder.svg?key=debate-team",
        isNew: true,
        lastActive: "Just now",
        color: "bg-amber-500",
      },
      {
        id: 204,
        name: "Science Enthusiasts",
        type: "Interest Group",
        members: 65,
        image: "/placeholder.svg?key=science-group",
        isNew: false,
        lastActive: "5h ago",
        color: "bg-green-500",
      },
    ],
    trending: [
      {
        id: 301,
        name: "AI Learning Hub",
        type: "Interest Group",
        members: 128,
        growth: "+24% this week",
        image: "/placeholder.svg?key=ai-hub",
        color: "bg-cyan-500",
      },
      {
        id: 302,
        name: "College Prep",
        type: "Support Group",
        members: 215,
        growth: "+18% this week",
        image: "/placeholder.svg?key=college-prep",
        color: "bg-pink-500",
      },
      {
        id: 303,
        name: "Environmental Club",
        type: "Activity Group",
        members: 89,
        growth: "+32% this week",
        image: "/placeholder.svg?key=environmental",
        color: "bg-emerald-500",
      },
    ],
  }

  // Suggested connections
  const suggestedConnections = [
    {
      id: 401,
      name: "Ethan Davis",
      role: "Student",
      school: "Westlake High School",
      grade: "11th Grade",
      mutualFriends: 6,
      image: "/placeholder.svg?key=qqplp",
    },
    {
      id: 402,
      name: "Isabella Martinez",
      role: "Student",
      school: "Riverdale High",
      grade: "10th Grade",
      mutualFriends: 3,
      image: "/placeholder.svg?key=ua5kh",
    },
    {
      id: 403,
      name: "Prof. Robert Taylor",
      role: "Mentor",
      specialty: "Mathematics",
      mutualFriends: 2,
      image: "/math-teacher.png",
    },
    {
      id: 404,
      name: "Photography Club",
      type: "Interest Group",
      members: 42,
      image: "/placeholder.svg?key=photography",
      color: "bg-indigo-500",
    },
  ]

  // Helper function to get the right data based on active tab
  const getActiveTabData = () => {
    switch (activeTab) {
      case "people":
        return connections.people
      case "mentors":
        return connections.mentors
      case "institutions":
        return connections.institutions
      case "communities":
        return connections.communities
      case "all":
      default:
        return [
          ...connections.people.slice(0, 4),
          ...connections.mentors.slice(0, 2),
          ...connections.communities.slice(0, 2),
          ...connections.institutions.slice(0, 1),
        ]
    }
  }

  return (
    <div className="p-4 sm:p-6 relative">
      {/* Circle Milestone notification */}
      {showMilestone && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg z-10 flex items-center gap-2"
        >
          <div className="bg-white/20 rounded-full p-1">
            <Users className="h-5 w-5" />
          </div>
          <span className="font-medium">You just crossed 25 connections!</span>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Circle</h2>
          <p className="text-gray-500 dark:text-gray-400">Your network of connections, communities, and groups</p>
        </div>

        <div className="flex gap-2">
          <Button variant={viewType === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewType("grid")}>
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button variant={viewType === "graph" ? "default" : "outline"} size="sm" onClick={() => setViewType("graph")}>
            <Network className="h-4 w-4 mr-2" />
            Graph
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {/* Search and filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your circle..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pathpiper-teal"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
            </Button>
          </div>

          {/* Circle tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="people" className="flex items-center gap-1">
                <UserCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">People</span>
              </TabsTrigger>
              <TabsTrigger value="mentors" className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mentors</span>
              </TabsTrigger>
              <TabsTrigger value="communities" className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Communities</span>
              </TabsTrigger>
              <TabsTrigger value="institutions" className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Institutions</span>
              </TabsTrigger>
            </TabsList>

            {/* Grid View */}
            {viewType === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {getActiveTabData().map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Card header with image */}
                    <div className="relative h-20 overflow-hidden">
                      {item.color ? (
                        <div className={`absolute inset-0 ${item.color} opacity-20`}></div>
                      ) : (
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={300}
                          height={100}
                          className="object-cover w-full h-full opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                      {/* Role badge */}
                      <div className="absolute top-2 right-2">
                        {item.role === "Mentor" && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Mentor
                          </Badge>
                        )}
                        {item.type === "Interest Group" && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            Group
                          </Badge>
                        )}
                        {item.type === "High School" && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            <Building className="h-3 w-3 mr-1" />
                            School
                          </Badge>
                        )}
                      </div>

                      {/* New indicator */}
                      {item.isNew && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-pink-500 text-white text-xs">New</Badge>
                        </div>
                      )}
                    </div>

                    {/* Card content */}
                    <div className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.role ? `${item.role}` : item.type}
                        </p>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="px-3 pb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {item.lastActive && (
                          <span className="flex items-center gap-1">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.lastActive === "Active now" || item.lastActive === "Just now"
                                  ? "bg-green-500"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            ></span>
                            {item.lastActive}
                          </span>
                        )}
                        {item.growth && (
                          <span className="flex items-center gap-1 text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            {item.growth}
                          </span>
                        )}
                      </span>

                      {item.mutualFriends > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.mutualFriends}
                        </span>
                      )}
                      {item.members && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.members}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Graph View - Placeholder */}
            {viewType === "graph" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-gray-400">
                    <Network className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Circle Network View</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    This interactive graph would show connections between you and your circle members, highlighting
                    communities and relationship strengths.
                  </p>
                </div>
              </div>
            )}
          </Tabs>

          {/* Trending Communities Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-pink-500" />
                Trending Communities
              </h3>
              <Button variant="ghost" size="sm" className="text-pink-500">
                See All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {connections.trending.map((community) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-24 overflow-hidden">
                    <div className={`absolute inset-0 ${community.color} opacity-20`}></div>
                    <Image
                      src={community.image || "/placeholder.svg"}
                      alt={community.name}
                      width={300}
                      height={100}
                      className="object-cover w-full h-full opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="font-medium text-white text-shadow">{community.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/90">{community.type}</p>
                        <p className="text-xs flex items-center gap-1 text-white bg-black/30 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3" />
                          {community.members}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {community.growth}
                    </span>
                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-full">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="md:w-72 shrink-0 space-y-4">
          {/* Suggested connections */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <UserPlus className="h-4 w-4 mr-2 text-pink-500" />
              Grow Your Circle
            </h3>

            <div className="space-y-3">
              {suggestedConnections.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.role || item.type}</p>
                  </div>
                  <Button size="sm" className="shrink-0 h-7 w-7 p-0 rounded-full" variant="ghost">
                    <UserPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="ghost" className="w-full mt-3 text-pink-500 hover:text-pink-600 text-xs">
              See More Suggestions
            </Button>
          </div>

          {/* Saved Circles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Bookmark className="h-4 w-4 mr-2 text-pink-500" />
              Saved Circles
            </h3>

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Users className="h-3.5 w-3.5 mr-2" />
                Study Group (8)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Users className="h-3.5 w-3.5 mr-2" />
                Project Team (5)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Users className="h-3.5 w-3.5 mr-2" />
                Close Friends (12)
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="w-full mt-2 text-pink-500 hover:text-pink-600 text-xs">
              Create New Circle
            </Button>
          </div>

          {/* Circle Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-pink-500" />
              Recent Activity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden shrink-0">
                  <Image
                    src="/diverse-students-studying.png"
                    alt="Emma Wilson"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p>
                    <span className="font-medium">Emma Wilson</span> joined Coding Club
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden shrink-0">
                  <Image
                    src="/math-teacher.png"
                    alt="Prof. Lisa Wong"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p>
                    <span className="font-medium">Prof. Lisa Wong</span> posted in Math Olympiad
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">Yesterday</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 bg-blue-500 flex items-center justify-center text-white">
                  <Hash className="h-4 w-4" />
                </div>
                <div>
                  <p>
                    <span className="font-medium">Debate Team</span> has a new event
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full mt-3 text-pink-500 hover:text-pink-600 text-xs">
              View All Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
