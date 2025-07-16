
"use client"

import { Suspense } from "react"
import ProtectedLayout from "@/app/protected-layout"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import TrailTest from "@/components/feed/trail-test"

export default function TrailTestPage() {
  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trail Creation Test</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Test the trail creation functionality to ensure it works correctly
              </p>
            </div>
            
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              </div>
            }>
              <TrailTest />
            </Suspense>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
