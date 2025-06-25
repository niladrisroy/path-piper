` tags.

```text
The code has been updated with a new 'self-analysis' tab, complete with styling and an AI badge, ensuring a prominent and attractive presentation within the horizontal navigation.
```

```
<replit_final_file>
"use client"

import {
  UserIcon,
  BrainIcon,
  FolderKanbanIcon,
  TrophyIcon,
  GraduationCapIcon,
  CircleIcon,
  BookOpenIcon,
  UsersIcon,
  MapPinIcon,
  CalendarIcon,
  ImageIcon,
  HeartIcon,
} from "lucide-react"

interface HorizontalNavigationProps {
  tabs: Array<{ id: string; label: string; icon?: string }>
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function HorizontalNavigation({ tabs, activeTab, setActiveTab }: HorizontalNavigationProps) {
  return (
    <div className="sticky top-16 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto hide-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative
              ${tab.id === 'self-analysis' 
                ? activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
                : activeTab === tab.id
                  ? "bg-pathpiper-teal text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-pathpiper-teal hover:bg-gray-100 dark:hover:bg-gray-700"
              }
              ${tab.id === 'self-analysis' && activeTab !== tab.id ? 'border border-transparent hover:border-purple-200 dark:hover:border-purple-700' : ''}
            `}
          >
            {tab.label}
            {tab.id === 'self-analysis' && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-400 to-blue-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                AI
              </span>
            )}
          </button>
        ))}
        </nav>
      </div>
    </div>
  )
}