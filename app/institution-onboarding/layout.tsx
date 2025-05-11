import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Institution Onboarding - PathPiper",
  description: "Set up your institution profile on PathPiper to connect with students and showcase your programs",
}

export default function InstitutionOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
