"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, Home, Search, MessageCircle, User, Menu, X, Settings, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export function InternalNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Navigation items for logged-in users
  const navItems = [
    { name: "Feed", href: "/feed", icon: <Home size={20} /> },
    { name: "Explore", href: "/explore", icon: <Search size={20} /> },
    { name: "Messages", href: "/messages", icon: <MessageCircle size={20} /> },
    { name: "Profile", href: "/student/profile", icon: <User size={20} /> },
  ]

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
              <div className={`transition-all duration-300 h-${scrolled ? "10" : "12"}`}>
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
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
                <Bell size={24} className="text-slate-700 hover:text-teal-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>

            {/* Mobile Navigation Toggle */}
            <button className="md:hidden text-slate-700" onClick={() => setIsOpen(!isOpen)}>
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
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                  <Link
                    href="/settings"
                    className="text-slate-700 hover:text-teal-500 transition-colors py-2 font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={20} />
                    Settings
                  </Link>
                  <Link
                    href="/logout"
                    className="text-slate-700 hover:text-teal-500 transition-colors py-2 font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogOut size={20} />
                    Log Out
                  </Link>
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
                pathname === item.href ? "text-teal-500" : "text-gray-500 hover:text-teal-500"
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
  )
}

export default InternalNavbar
