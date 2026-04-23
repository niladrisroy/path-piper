"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Users, Target, MessageSquare, Lightbulb } from "lucide-react"
import Image from "next/image"

export default function Mentorship() {
  return (
    <section id="mentorship" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">
              Get Matched with the <span className="text-orange-500">Right Mentor in Minutes</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Stop cold-emailing professors. PathPiper's AI reads your profile, goals, and learning style — then surfaces mentors who are already a 90%+ fit.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Users className="h-6 w-6 text-teal-500" />,
                  title: "Smart Mentor Matching",
                  description: "98% match accuracy based on your interests, goals, schedule, and learning style — not just keywords.",
                },
                {
                  icon: <Target className="h-6 w-6 text-orange-500" />,
                  title: "Structured Goal Setting",
                  description: "Set 30/60/90-day goals with your mentor. Track progress. Celebrate milestones. Stay accountable.",
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
                  title: "Guided Interactions",
                  description: "Structured session templates mean no awkward first meetings — just productive conversations from day one.",
                },
                {
                  icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
                  title: "Inspiration & Motivation",
                  description: "Weekly nudges, streaks, and Pip check-ins keep you on track even when motivation dips.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mt-1 mr-4 p-2 bg-slate-50 rounded-full shadow-sm">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <a href="https://my.pathpiper.com/auth" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white rounded-full px-6 py-2">
                  Find Your Mentor
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-orange-400/10 to-orange-600/10 rounded-3xl blur-lg"></div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Your Mentorship Match</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    98% Match
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-white p-1">
                    <Image
                      src="/images/pip-mascot.png"
                      width={64}
                      height={64}
                      alt="Pip as mentor"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Dr. Sarah Chen</h4>
                    <p className="text-slate-500">Computer Science Professor • 8 years mentoring experience</p>
                    <div className="mt-2 flex space-x-2">
                      {["AI", "Machine Learning", "Python", "Research"].map((tag, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-full text-xs ${
                            i % 4 === 0
                              ? "bg-teal-100 text-teal-700"
                              : i % 4 === 1
                                ? "bg-orange-100 text-orange-700"
                                : i % 4 === 2
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 mr-2">
                      <Image src="/images/pip-mascot.png" width={24} height={24} alt="Pip" className="w-full h-full" />
                    </div>
                    <h4 className="font-medium text-slate-800">Why We Matched You</h4>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-slate-600">
                      <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                      Shared interest in artificial intelligence and machine learning
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                      Compatible learning style and communication preferences
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                      Aligns with your career aspirations in tech research
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
