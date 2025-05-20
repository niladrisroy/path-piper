import { Button } from "@/components/ui/button"
import Image from "next/image"
import Feed from "@/components/feed/feed"
import FeedSidebar from "@/components/feed/feed-sidebar"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-16 pb-16 sm:pt-24 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <FeedSidebar />
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2">
              <Feed />
            </div>

            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                {/* Suggested Connections */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <h3 className="font-medium text-sm mb-3">Suggested Connections</h3>
                  <div className="space-y-3">
                    {/* Connection 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src="/diverse-female-student.png"
                            alt="Olivia Martinez"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Olivia Martinez</p>
                          <p className="text-xs text-gray-500">Westlake High School</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                        Connect
                      </Button>
                    </div>

                    {/* Connection 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src="/asian-professor.png"
                            alt="Dr. James Chen"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Dr. James Chen</p>
                          <p className="text-xs text-gray-500">Computer Science Mentor</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                        Connect
                      </Button>
                    </div>

                    {/* Connection 3 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src="/images/pathpiper-logo.png"
                            alt="Stanford University"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Stanford University</p>
                          <p className="text-xs text-gray-500">Educational Institution</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                        Connect
                      </Button>
                    </div>
                  </div>
                  <Button variant="link" className="text-xs p-0 h-auto mt-2 text-pathpiper-teal">
                    View all suggestions
                  </Button>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <h3 className="font-medium text-sm mb-3">Upcoming Events</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-100 rounded-lg p-3">
                      <h4 className="text-xs font-medium">Science Fair Showcase</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-calendar"
                        >
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>Tomorrow, 3:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Westlake High School</span>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-3">
                      <h4 className="text-xs font-medium">College Application Workshop</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-calendar"
                        >
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>May 25, 4:30 PM</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Virtual Event</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="link" className="text-xs p-0 h-auto mt-2 text-pathpiper-teal">
                    View all events
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
