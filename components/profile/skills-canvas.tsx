"use client"

import { useState } from "react"
import { motion } from "framer-motion"

// Mock skills data
const skillsData = [
  { id: 1, name: "Mathematics", level: 85, category: "academic", color: "bg-blue-500" },
  { id: 2, name: "Computer Science", level: 90, category: "academic", color: "bg-purple-500" },
  { id: 3, name: "Physics", level: 75, category: "academic", color: "bg-green-500" },
  { id: 4, name: "Web Development", level: 80, category: "technical", color: "bg-pink-500" },
  { id: 5, name: "Data Analysis", level: 70, category: "technical", color: "bg-yellow-500" },
  { id: 6, name: "Problem Solving", level: 85, category: "soft", color: "bg-red-500" },
  { id: 7, name: "Communication", level: 75, category: "soft", color: "bg-indigo-500" },
  { id: 8, name: "Leadership", level: 65, category: "soft", color: "bg-orange-500" },
  { id: 9, name: "Python", level: 90, category: "technical", color: "bg-teal-500" },
  { id: 10, name: "JavaScript", level: 80, category: "technical", color: "bg-cyan-500" },
  { id: 11, name: "Creative Writing", level: 60, category: "academic", color: "bg-lime-500" },
  { id: 12, name: "Public Speaking", level: 70, category: "soft", color: "bg-amber-500" },
]

type SkillCategory = "all" | "academic" | "technical" | "soft"

export default function SkillsCanvas() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>("all")
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null)

  const filteredSkills =
    selectedCategory === "all" ? skillsData : skillsData.filter((skill) => skill.category === selectedCategory)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Skills Canvas</h2>
        <div className="flex gap-2">
          {(["all", "academic", "technical", "soft"] as SkillCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-pathpiper-teal text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {selectedSkill !== null && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-xl p-6">
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>

            {/* Skill detail view */}
            {(() => {
              const skill = skillsData.find((s) => s.id === selectedSkill)
              if (!skill) return null

              return (
                <div>
                  <h3 className="text-2xl font-bold mb-2">{skill.name}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>Proficiency</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${skill.color}`} style={{ width: `${skill.level}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Related Projects</h4>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-600 dark:text-gray-300">• Advanced Calculator App</li>
                        <li className="text-sm text-gray-600 dark:text-gray-300">• Data Visualization Dashboard</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Courses Completed</h4>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-600 dark:text-gray-300">• Introduction to Algorithms</li>
                        <li className="text-sm text-gray-600 dark:text-gray-300">• Advanced Data Structures</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:col-span-2">
                      <h4 className="font-semibold mb-2">Growth Over Time</h4>
                      <div className="h-32 flex items-end gap-1">
                        {[40, 45, 55, 60, 70, 75, 85, 90].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-pathpiper-teal to-pathpiper-blue rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                        <span>Nov</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {filteredSkills.map((skill) => (
            <motion.div
              key={skill.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelectedSkill(skill.id)}
              className={`
                ${skill.color} bg-opacity-20 dark:bg-opacity-30
                rounded-xl p-4 cursor-pointer
                border-2 border-transparent hover:border-pathpiper-teal
                transition-all duration-200
              `}
              style={{
                height: `${100 + skill.level / 5}px`,
              }}
            >
              <div className="h-full flex flex-col justify-between">
                <h3 className="font-semibold">{skill.name}</h3>
                <div className="flex justify-between items-end">
                  <span className="text-xs uppercase">{skill.category}</span>
                  <span className="text-lg font-bold">{skill.level}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
