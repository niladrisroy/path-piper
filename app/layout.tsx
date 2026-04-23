import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: {
    default: "PathPiper – Safe Education Social Network for Students & Mentors",
    template: "%s | PathPiper",
  },
  description:
    "PathPiper is the safe, global education social platform connecting students, mentors, and institutions. Discover careers, build skills, and get AI-powered mentorship — all in one place.",
  keywords: [
    "PathPiper",
    "pathpiper.com",
    "education social network",
    "student mentorship platform",
    "safe social network for students",
    "AI mentorship",
    "career discovery for students",
    "education platform",
    "student social media",
    "school networking app",
    "COPPA compliant social network",
    "student career guidance",
    "student mentor matching",
    "safe learning platform for kids",
  ],
  authors: [{ name: "PathPiper", url: "https://pathpiper.com" }],
  creator: "PathPiper",
  publisher: "PathPiper",
  metadataBase: new URL("https://pathpiper.com"),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pathpiper.com",
    siteName: "PathPiper",
    title: "PathPiper – Safe Education Social Network for Students & Mentors",
    description:
      "Connect with mentors, discover careers, and build skills on PathPiper — the safe, global education platform for students.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "PathPiper – Safe Education Social Platform for Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PathPiper – Safe Education Social Network",
    description:
      "AI-powered mentorship, career discovery, and student profiles — all in a safe, COPPA-compliant platform.",
    images: ["/images/og-image.png"],
    creator: "@pathpiper",
    site: "@pathpiper",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "REPLACE_WITH_SEARCH_CONSOLE_TOKEN",
  },
  category: "education",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${nunito.className} font-normal overflow-fix`}>
        {children}
        {/* Google Analytics 4 — replace GA_MEASUREMENT_ID before going live */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  )
}
