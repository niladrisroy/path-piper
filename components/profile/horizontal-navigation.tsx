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
          {tabs.map((tab) => {
            // Map tab.id to the appropriate icon
            let Icon
            switch (tab.id) {
              case "about":
                Icon = UserIcon
                break
              case "circle":
                Icon = CircleIcon
                break
              case "skills":
                Icon = BrainIcon
                break
              case "projects":
                Icon = FolderKanbanIcon
                break
              case "achievements":
                Icon = TrophyIcon
                break
              case "learning":
                Icon = GraduationCapIcon
                break
              // Institution profile specific tabs
              case "programs":
                Icon = BookOpenIcon
                break
              case "faculty":
                Icon = UsersIcon
                break
              case "facilities":
                Icon = MapPinIcon
                break
              case "events":
                Icon = CalendarIcon
                break
              case "gallery":
                Icon = ImageIcon
                break
              default:
                Icon = UserIcon
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
