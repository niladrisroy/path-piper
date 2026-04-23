"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, Map, Trophy } from "lucide-react"
import Image from "next/image"

export default function Discovery() {
  return (
    <section id="discovery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
            Explore 500+ Career Paths — <span className="text-yellow-500">at Your Own Pace</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Take personality-matched quizzes, follow step-by-step career roadmaps, and earn XP as you build skills. Learning about your future shouldn't feel like homework.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: "Interactive Quizzes",
              description: "Personality-matched quizzes reveal career fits you'd never have guessed — backed by Holland Code and MBTI frameworks.",
              icon: <Sparkles className="h-8 w-8 text-yellow-500" />,
              image: "/images/interactive-quizzes.png",
            },
            {
              title: "Career Paths",
              description: "500+ curated career roadmaps with required skills, salary ranges, and real PathPiper mentors in each field.",
              icon: <Map className="h-8 w-8 text-yellow-500" />,
              image: "/images/career-path.png",
            },
            {
              title: "Skill Tracking",
              description: "Earn XP, unlock badges, and climb leaderboards as you complete courses and hit learning milestones.",
              icon: <Trophy className="h-8 w-8 text-yellow-500" />,
              image: "/images/skill-tracking.png",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="h-[14.5rem] relative overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <div className="flex items-center mb-2">
                      {item.icon}
                      <h3 className="text-xl font-bold ml-2">{item.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">{item.description}</p>
                <a href="https://my.pathpiper.com/auth" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 rounded-full"
                  >
                    Explore
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              {/* Removed Pip icon */}
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Your Personalized Growth Plan</h3>
              <p className="text-slate-600 mb-6">
                Based on your interests, skills, and goals, PathPiper creates a customized learning journey to help you
                explore and prepare for your future career.
              </p>
              <div className="space-y-4">
                {[
                  "Curated skill playlists based on your Holland Code career type",
                  "Week-by-week action plans to reach your career goal in 90 days",
                  "Automatic celebration when you hit a milestone (Pip does a little dance)",
                  "One-click resource library: videos, articles, and practice projects",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Replaced with new image */}
              <Image
                src="/images/personalised-growth.png"
                alt="Personalized growth plan"
                width={600}
                height={400}
                className="rounded-xl shadow-md w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
