
"use client"

import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface HorizontalNavigationProps {
  tabs: Tab[]
  activeTab: string
  setActiveTab: (tab: string) => void
  className?: string
}

export default function HorizontalNavigation({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  className 
}: HorizontalNavigationProps) {
  return (
    <div className={cn("border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                activeTab === tab.id
                  ? "border-pathpiper-teal text-pathpiper-teal"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
