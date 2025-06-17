"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  Home,
  Search,
  MessageCircle,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  UserPlus,
  Loader2,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
}

export function InternalNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return;

    setSendingRequest(receiverId);
    try {
      const response = await fetch("/api/connections/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId,
          message: `Hi! I'd like to connect with you on PathPiper.`,
        }),
      });

      if (response.ok) {
        setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request");
    } finally {
      setSendingRequest(null);
    }
  };

  const handleProfileClick = (userId: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(`/student/profile/view/${userId}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "mentor":
        return "bg-green-100 text-green-800";
      case "institution":
        return "bg-purple-100 text-purple-800";
      case "student":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation items for logged-in users
  const navItems = [
    { name: "Feed", href: "/feed", icon: <Home size={20} /> },
    { name: "Explore", href: "/explore", icon: <Search size={20} /> },
    { name: "Messages", href: "/messages", icon: <MessageCircle size={20} /> },
    { name: "Profile", href: "/student/profile", icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Top navigation for desktop and tablet */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="py-3 flex items-center justify-between">
            <Link href="/feed" className="flex items-center">
              <div
                className={`transition-all duration-300 h-${scrolled ? "10" : "12"}`}
              >
                <Image
                  src="/images/pathpiper-logo-full.png"
                  width={scrolled ? 180 : 220}
                  height={scrolled ? 30 : 36}
                  alt="PathPiper Logo"
                  className="h-full w-auto"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative" id="search-container">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-pathpiper-teal" />
                        <span className="ml-2 text-sm text-gray-500">
                          Searching...
                        </span>
                      </div>
                    )}

                    {!searchLoading &&
                      searchQuery.length >= 2 &&
                      searchResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No users found matching "{searchQuery}"</p>
                        </div>
                      )}

                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser.id}
                        className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <div
                          className="flex items-center space-x-3 flex-1 cursor-pointer"
                          onClick={() => handleProfileClick(searchUser.id)}
                        >
                          <Image
                            src={searchUser.profileImageUrl || "/images/default-profile.png"}
                            alt={`${searchUser.firstName} ${searchUser.lastName}`}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-sm text-gray-900">
                                {searchUser.firstName} {searchUser.lastName}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getRoleColor(searchUser.role)}`}
                              >
                                {searchUser.role}
                              </Badge>
                            </div>
                            {searchUser.bio && (
                              <p className="text-xs text-gray-600 truncate">
                                {searchUser.bio}
                              </p>
                            )}
                            {searchUser.location && (
                              <p className="text-xs text-gray-500">
                                {searchUser.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendConnectionRequest(searchUser.id);
                          }}
                          disabled={sendingRequest === searchUser.id}
                          className="shrink-0 bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                        >
                          {sendingRequest === searchUser.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    ))}

                    {searchQuery.length < 2 && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                          Type at least 2 characters to search for users
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {navItems.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-slate-700 hover:text-teal-500 transition-colors font-medium flex items-center gap-1 ${
                    pathname === link.href ? "text-teal-500" : ""
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

              <button className="relative">
                <Bell
                  size={24}
                  className="text-slate-700 hover:text-teal-500 transition-colors"
                />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Navigation Toggle */}
            <button
              className="md:hidden text-slate-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white"
              >
                <div className="py-4 flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-sm text-gray-500">Student</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full"
                    />
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  <Link
                    href="/settings"
                    className="text-slate-700 hover:text-teal-500 transition-colors py-2 font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={20} />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="text-slate-700 hover:text-red-500 transition-colors py-2 font-medium flex items-center gap-2 w-full text-left"
                  >
                    <LogOut size={20} />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href
                  ? "text-teal-500"
                  : "text-gray-500 hover:text-teal-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          <button className="relative flex flex-col items-center p-2 text-gray-500 hover:text-teal-500">
            <Bell size={20} />
            <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
            <span className="text-xs mt-1">Alerts</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default InternalNavbar;