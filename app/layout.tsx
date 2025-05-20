import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "PathPiper - Education-Focused Social Platform",
  description:
    "A global, safe, education-focused social networking platform uniting students, mentors, and institutions.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${nunito.className} font-normal overflow-fix`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
