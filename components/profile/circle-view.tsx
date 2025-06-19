"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  Building,
  MessageCircle,
  Calendar,
  Star,
  ChevronRight,
  UserPlus,
  Filter,
  Inbox,
  UserMinus,
  Trash2,
  Crown,
  Shield,
  Eye,
  Settings,
} from "lucide-react";
import AddConnectionDialog from "./add-connection-dialog";
import ConnectionRequestsView from "./connection-requests-view";

interface Connection {
  id: string;
  connectionType: string;
  connectedAt: string;
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    profileImageUrl?: string;
    role: string;
    bio?: string;
    location?: string;
    status: "online" | "offline" | "away";
    lastInteraction: string;
  };
}

interface Circle {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
  creator: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  memberships: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
      role: string;
      bio?: string;
      status?: "online" | "offline" | "away";
    };
  }>;
  _count: {
    memberships: number;
  };
}

// Circle Badges Section Component
function CircleBadgesSection() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const response = await fetch("/api/circles");
        if (response.ok) {
          const data = await response.json();
          setCircles(data);
        }
      } catch (error) {
        console.error("Error fetching circles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <Crown className="h-4 w-4" />;
      case "shield":
        return <Shield className="h-4 w-4" />;
      case "star":
        return <Star className="h-4 w-4" />;
      case "graduation-cap":
        return <GraduationCap className="h-4 w-4" />;
      case "building":
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Circle Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            My Circle Badges
          </CardTitle>
          <Badge variant="secondary">{circles.length} circles</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {circles.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No circle badges yet</p>
            <p className="text-xs">Create your first circle!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Compact Circular Grid Layout - Optimized for side panel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {circles.map((circle) => (
                <div
                  key={circle.id}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() =>
                    setExpandedCircle(
                      expandedCircle === circle.id ? null : circle.id,
                    )
                  }
                >
                  {/* Circle Badge */}
                  <div className="relative mb-2">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                      style={{ backgroundColor: circle.color }}
                    >
                      <div className="scale-75">
                        {getIconComponent(circle.icon)}
                      </div>
                    </div>
                    {/* Member count indicator */}
                    {circle._count.memberships > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="text-xs leading-none">
                          {circle._count.memberships}
                        </span>
                      </div>
                    )}
                    {/* Default badge indicator */}
                    {circle.isDefault && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center">
                        <Crown className="h-1.5 w-1.5" />
                      </div>
                    )}
                  </div>

                  {/* Circle Name */}
                  <span className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium truncate w-16">
                    {circle.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Expanded Circle Details */}
            {expandedCircle && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                {(() => {
                  const selectedCircle = circles.find(
                    (c) => c.id === expandedCircle,
                  );
                  if (!selectedCircle) return null;

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: selectedCircle.color }}
                          >
                            <div className="scale-75">
                              {getIconComponent(selectedCircle.icon)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {selectedCircle.name}
                              </h3>
                              {selectedCircle.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            {selectedCircle.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {selectedCircle.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedCircle(null)}
                        >
                          ✕
                        </Button>
                      </div>

                      {/* Circle Members */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Circle Members ({selectedCircle._count.memberships})
                        </h4>
                        {selectedCircle.memberships.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-3">
                            No members yet
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {selectedCircle.memberships.map((membership) => (
                              <div
                                key={membership.user.id}
                                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg"
                              >
                                <div className="relative">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={membership.user.profileImageUrl}
                                      alt={`${membership.user.firstName} ${membership.user.lastName}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {membership.user.firstName?.[0]}
                                      {membership.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  {membership.user.status && (
                                    <div
                                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getStatusColor(membership.user.status)}`}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {membership.user.firstName}{" "}
                                    {membership.user.lastName}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {membership.user.role}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0"
                                >
                                  <MessageCircle className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CircleViewProps {
  student: any;
}

export default function CircleView({ student }: CircleViewProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"connections" | "requests">(
    "connections",
  );

  // Use real student data
  const studentName = student?.profile
    ? `${student.profile.firstName} ${student.profile.lastName}`
    : "Student";
  const tagline = student?.profile?.tagline;
  const bio = student?.profile?.bio;
  const currentEducation = student?.educationHistory?.find(
    (edu: any) => edu.is_current || edu.isCurrent,
  );

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/connections/requests?type=received");
      if (response.ok) {
        const data = await response.json();
        const pending = data.filter(
          (req: any) => req.status === "pending",
        ).length;
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    }
  };

  const handleConnectionRequestSent = () => {
    // Refresh data when a new connection request is sent
    fetchConnections();
    fetchPendingRequests();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchConnections(), fetchPendingRequests()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate stats from real data
  const totalConnections = connections.length;
  const mentorConnections = connections.filter(
    (c) => c.user.role === "mentor",
  ).length;
  const institutionConnections = connections.filter(
    (c) => c.user.role === "institution",
  ).length;

  const removeConnection = async (connectionId: string) => {
    try {
      // Optimistically update the UI
      setConnections((prevConnections) =>
        prevConnections.filter((connection) => connection.id !== connectionId),
      );

      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to remove connection");
        // Revert the UI update if the API call fails
        fetchConnections();
      }
    } catch (error) {
      console.error("Error removing connection:", error);
      // Revert the UI update if there's an error
      fetchConnections();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Circle
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-blue-600 border-blue-200 bg-blue-50"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{totalConnections}</span>
              <span className="text-xs text-gray-500">Total</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-green-600 border-green-200 bg-green-50"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="font-medium">{mentorConnections}</span>
              <span className="text-xs text-gray-500">Mentors</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-purple-600 border-purple-200 bg-purple-50"
            >
              <Building className="h-3.5 w-3.5" />
              <span className="font-medium">{institutionConnections}</span>
              <span className="text-xs text-gray-500">Institutions</span>
            </Badge>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with mentors, peers, and institutions
        </p>
      </div>

      {/* Navigation Tabs with Action Buttons */}
      <div className="flex justify-between items-center border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView("connections")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeView === "connections"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            My Connections
          </button>
          <button
            onClick={() => setActiveView("requests")}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center space-x-2 ${
              activeView === "requests"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Requests</span>
            {pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequests}
              </Badge>
            )}
          </button>
        </div>

        {/* Action Buttons - Only show for connections view */}
        {activeView === "connections" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <AddConnectionDialog
              onConnectionRequestSent={handleConnectionRequestSent}
            />
          </div>
        )}
      </div>

      {/* Content based on active view */}
      {activeView === "connections" ? (
        <div className="space-y-6">
          {/* Horizontal Layout: Circle Badges and Connections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Circle Badges Section - Takes 4 columns on large screens */}
            <div className="lg:col-span-4">
              <CircleBadgesSection />
            </div>

            {/* Connections Section - Takes 8 columns on large screens */}
            <div className="lg:col-span-8">
              <Card>
                <CardHeader className="pb-4"></CardHeader>
                <CardContent className="pt-0">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6 mt-1">
                      <TabsTrigger value="all">
                        All ({totalConnections})
                      </TabsTrigger>
                      <TabsTrigger value="mentors">
                        Mentors ({mentorConnections})
                      </TabsTrigger>
                      <TabsTrigger value="peers">
                        Peers (
                        {
                          connections.filter((c) => c.user.role === "student")
                            .length
                        }
                        )
                      </TabsTrigger>
                      <TabsTrigger value="institutions">
                        Institutions ({institutionConnections})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      {connections.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No connections yet</p>
                          <p className="text-sm">
                            Start by adding some connections!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {connections.map((connection) => (
                            <div
                              key={connection.id}
                              className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage
                                      src={
                                        connection.user.profileImageUrl ||
                                        connection.user.avatar
                                      }
                                      alt={connection.user.name}
                                    />
                                    <AvatarFallback className="text-sm">
                                      {connection.user.firstName?.[0]}
                                      {connection.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                  />
                                </div>

                                <div className="w-full">
                                  <h3 className="font-medium text-xs truncate">
                                    {connection.user.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1"
                                  >
                                    {connection.user.role}
                                  </Badge>
                                </div>

                                {connection.user.bio && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                    {connection.user.bio}
                                  </p>
                                )}

                                <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Message"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Schedule"
                                  >
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeConnection(connection.id)
                                    }
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Remove"
                                  >
                                    <UserMinus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                {connection.user.lastInteraction}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="mentors" className="mt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {connections
                          .filter((c) => c.user.role === "mentor")
                          .map((connection) => (
                            <div
                              key={connection.id}
                              className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage
                                      src={
                                        connection.user.profileImageUrl ||
                                        connection.user.avatar
                                      }
                                      alt={connection.user.name}
                                    />
                                    <AvatarFallback className="text-sm">
                                      {connection.user.firstName?.[0]}
                                      {connection.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                  />
                                  <Star className="absolute -top-1 -left-1 h-4 w-4 text-yellow-500 bg-white rounded-full p-0.5" />
                                </div>

                                <div className="w-full">
                                  <h3 className="font-medium text-xs truncate">
                                    {connection.user.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1 bg-green-50 text-green-700 border-green-200"
                                  >
                                    mentor
                                  </Badge>
                                </div>

                                {connection.user.bio && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                    {connection.user.bio}
                                  </p>
                                )}

                                <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Message"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Schedule"
                                  >
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeConnection(connection.id)
                                    }
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Remove"
                                  >
                                    <UserMinus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                {connection.user.lastInteraction}
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="peers" className="mt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {connections
                          .filter((c) => c.user.role === "student")
                          .map((connection) => (
                            <div
                              key={connection.id}
                              className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage
                                      src={
                                        connection.user.profileImageUrl ||
                                        connection.user.avatar
                                      }
                                      alt={connection.user.name}
                                    />
                                    <AvatarFallback className="text-sm">
                                      {connection.user.firstName?.[0]}
                                      {connection.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                  />
                                </div>

                                <div className="w-full">
                                  <h3 className="font-medium text-xs truncate">
                                    {connection.user.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    peer
                                  </Badge>
                                </div>

                                {connection.user.bio && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                    {connection.user.bio}
                                  </p>
                                )}

                                <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Message"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Schedule"
                                  >
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeConnection(connection.id)
                                    }
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Remove"
                                  >
                                    <UserMinus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                {connection.user.lastInteraction}
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="institutions" className="mt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {connections
                          .filter((c) => c.user.role === "institution")
                          .map((connection) => (
                            <div
                              key={connection.id}
                              className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage
                                      src={
                                        connection.user.profileImageUrl ||
                                        connection.user.avatar
                                      }
                                      alt={connection.user.name}
                                    />
                                    <AvatarFallback className="text-sm">
                                      {connection.user.firstName?.[0]}
                                      {connection.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                  />
                                  <Building className="absolute -top-1 -left-1 h-4 w-4 text-purple-600 bg-white rounded-full p-0.5" />
                                </div>

                                <div className="w-full">
                                  <h3 className="font-medium text-xs truncate">
                                    {connection.user.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-200"
                                  >
                                    institution
                                  </Badge>
                                </div>

                                {connection.user.bio && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                    {connection.user.bio}
                                  </p>
                                )}

                                <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Message"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Schedule"
                                  >
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeConnection(connection.id)
                                    }
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Remove"
                                  >
                                    <UserMinus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                {connection.user.lastInteraction}
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <ConnectionRequestsView />
      )}
    </div>
  );
}
