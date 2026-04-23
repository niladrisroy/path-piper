"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Users, Bell } from "lucide-react"
import Image from "next/image"

export default function Safety() {
  const safetyFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-teal-500" />,
      title: "COPPA/GDPR-K Compliant",
      description: "Fully compliant with U.S. COPPA and EU GDPR-K regulations — independently verified. We never sell student data. Ever.",
    },
    {
      icon: <Lock className="h-8 w-8 text-teal-500" />,
      title: "Privacy-First Architecture",
      description: "Zero third-party data brokers. No ad targeting. Your profile data stays yours — always.",
    },
    {
      icon: <Eye className="h-8 w-8 text-teal-500" />,
      title: "Content Moderation",
      description: "Every post is scanned by AI within 200ms, with a human moderation team reviewing flagged content 24/7.",
    },
    {
      icon: <Users className="h-8 w-8 text-teal-500" />,
      title: "Parent Dashboards",
      description: "Parents get a real-time dashboard: see connections, approve mentor relationships, and set content filters — without reading private messages.",
    },
    {
      icon: <Bell className="h-8 w-8 text-teal-500" />,
      title: "Safety Alerts",
      description: "Instant SMS + email alerts if any interaction triggers our safety system. Average response time: under 90 seconds.",
    },
  ]

  return (
    <section id="safety" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
            <span className="text-teal-500">Safety</span> & Compliance
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            PathPiper is the only student social platform built with child safety as a core architectural requirement — not an afterthought.
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mr-4 flex-shrink-0 p-2 bg-teal-50 rounded-full">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-full text-sm font-medium border border-slate-200">🔒 256-bit Encryption</span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-full text-sm font-medium border border-slate-200">✅ COPPA Verified</span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-full text-sm font-medium border border-slate-200">🛡️ GDPR-K Certified</span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-full text-sm font-medium border border-slate-200">👁️ 24/7 Moderation</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 text-white">
              {/* Removed Pip icon */}
              <h3 className="text-2xl font-bold mb-4">Parent-Controlled Experience</h3>
              <p className="mb-6">
                PathPiper gives parents visibility and control over their child's online experience while respecting
                young users' growing independence.
              </p>
              <div className="space-y-4">
                {[
                  "Monitor connections and communications",
                  "Review and approve mentorship relationships",
                  "Set appropriate privacy and safety controls",
                  "Receive regular activity summaries",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center mr-3">
                      <svg className="h-3 w-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Replaced with new image */}
              <Image
                src="/images/parent-controlled.png"
                alt="Parent-controlled experience"
                width={600}
                height={600}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
