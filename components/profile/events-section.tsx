import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react"

export default function EventsSection() {
  const events = [
    {
      id: 1,
      title: "Annual Innovation Summit",
      date: "June 15-17, 2023",
      time: "9:00 AM - 5:00 PM",
      location: "Stanford Memorial Auditorium",
      image: "/innovation-conference-speakers.png",
      description:
        "Join industry leaders, researchers, and entrepreneurs for three days of discussions on the future of technology and innovation.",
      category: "Conference",
      attendees: 1200,
      featured: true,
    },
    {
      id: 2,
      title: "Computer Science Research Symposium",
      date: "July 8, 2023",
      time: "10:00 AM - 4:00 PM",
      location: "Gates Computer Science Building",
      image: "/computer-science-education.png",
      description:
        "Undergraduate and graduate students present their latest research projects in artificial intelligence, data science, and more.",
      category: "Academic",
      attendees: 350,
      featured: true,
    },
  ]

  const upcomingEvents = [
    {
      id: 3,
      title: "Stanford Arts Festival",
      date: "August 5-7, 2023",
      time: "Various Times",
      location: "Stanford Arts District",
      category: "Cultural",
    },
    {
      id: 4,
      title: "Graduate School Information Session",
      date: "September 12, 2023",
      time: "3:00 PM - 5:00 PM",
      location: "Tresidder Memorial Union",
      category: "Information",
    },
    {
      id: 5,
      title: "Alumni Homecoming Weekend",
      date: "October 20-22, 2023",
      time: "Various Times",
      location: "Main Campus",
      category: "Alumni",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Featured Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="sm:w-1/3 relative h-40 sm:h-40 rounded-lg overflow-hidden">
                    <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center rounded-full border border-transparent bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="sm:w-2/3">
                    <h3 className="text-lg font-bold">{event.title}</h3>

                    <div className="space-y-1 my-2">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Users className="h-3.5 w-3.5 text-gray-500" />
                        <span>{event.attendees} expected attendees</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>

                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      View Details <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <span className="inline-flex items-center rounded-full border border-transparent bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {event.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2">
                <a href="#" className="text-blue-600 hover:underline text-sm block">
                  View All Events
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Academic
                </span>
                <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                  Conference
                </span>
                <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  Cultural
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Alumni
                </span>
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  Sports
                </span>
                <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  Workshop
                </span>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                  Information
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
