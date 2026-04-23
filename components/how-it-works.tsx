"use client"

import { motion } from "framer-motion"
import { UserPlus, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    icon: <UserPlus className="h-8 w-8 text-teal-500" />,
    title: "Create Your Profile",
    description:
      "Sign up free in 2 minutes. Tell PathPiper your interests, goals, and what kind of student you are — and Pip gets to work.",
    color: "from-teal-400/20 to-teal-500/10",
    border: "border-teal-200",
    badge: "bg-teal-500",
  },
  {
    number: "02",
    icon: <Users className="h-8 w-8 text-purple-500" />,
    title: "Meet Your Mentor & Community",
    description:
      "Our AI matches you with mentors and study groups within 24 hours of joining — based on your goals, not just your major.",
    color: "from-purple-400/20 to-purple-500/10",
    border: "border-purple-200",
    badge: "bg-purple-500",
  },
  {
    number: "03",
    icon: <TrendingUp className="h-8 w-8 text-orange-500" />,
    title: "Discover & Grow",
    description:
      "Explore 500+ career paths, earn achievements, and build the skills that colleges, scholarships, and employers actually notice.",
    color: "from-orange-400/20 to-orange-500/10",
    border: "border-orange-200",
    badge: "bg-orange-500",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
            How <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">PathPiper</span> Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From sign-up to your first mentor match — it takes less than 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-teal-300 via-purple-300 to-orange-300 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className={`bg-gradient-to-br ${step.color} border ${step.border} rounded-2xl p-8 h-full flex flex-col items-center text-center relative z-10`}>
                {/* Number badge */}
                <div className={`${step.badge} text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mb-4 shadow-md`}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="https://my.pathpiper.com/auth" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-10 py-6 text-lg shadow-md">
              Get Started Free
            </Button>
          </a>
          <p className="mt-3 text-sm text-slate-500">No credit card required · Free forever for students</p>
        </motion.div>
      </div>
    </section>
  )
}
