
import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password - PathPiper",
  description: "Reset your PathPiper password",
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
