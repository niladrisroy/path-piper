import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Globe, Users, MapPin, Landmark, GraduationCap } from "lucide-react"

export default function AboutInstitutionSection() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Stanford University, officially Leland Stanford Junior University, is a private research university in
                Stanford, California. The university was founded in 1885 by Leland and Jane Stanford in memory of their
                only child, Leland Stanford Jr., who had died of typhoid fever at age 15 the previous year.
              </p>
              <p>
                Stanford is ranked among the top universities in the world by academic publications. It is known for its
                academic strength, wealth, proximity to Silicon Valley, and ranking as one of the world's most
                prestigious universities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Image
                  src="/university-classroom.png"
                  alt="Stanford University Classroom"
                  width={400}
                  height={250}
                  className="rounded-lg object-cover w-full h-48"
                />
                <Image
                  src="/college-library.png"
                  alt="Stanford University Library"
                  width={400}
                  height={250}
                  className="rounded-lg object-cover w-full h-48"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mission & Values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Mission & Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">Our Mission</h3>
              <p>
                Stanford University's mission is to discover and disseminate knowledge for the benefit of humanity. To
                this end, the university's fundamental purpose is to promote learning, creativity, innovation, and
                research.
              </p>
              <h3 className="font-semibold text-lg mt-4">Core Values</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Academic Excellence</li>
                <li>Diversity and Inclusion</li>
                <li>Dedication to Research</li>
                <li>Freedom of Inquiry and Expression</li>
                <li>Respect for All Community Members</li>
                <li>Commitment to Public Service</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Facts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Quick Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Student Body</span>
                    <span className="text-gray-600">7,645 Undergraduate</span>
                    <span className="text-gray-600 block">9,292 Graduate</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Faculty</span>
                    <span className="text-gray-600">2,288 Faculty members</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Campus Size</span>
                    <span className="text-gray-600">8,180 acres (33.1 km²)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">International</span>
                    <span className="text-gray-600">Students from 90+ countries</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Rankings</span>
                    <span className="text-gray-600">Top 5 globally</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">Stanford University</p>
              <p className="text-gray-600">450 Serra Mall</p>
              <p className="text-gray-600">Stanford, CA 94305</p>
              <p className="text-gray-600">United States</p>
              <div className="pt-2">
                <p className="text-gray-600">Phone: (650) 723-2300</p>
                <p className="text-gray-600">Email: admission@stanford.edu</p>
                <a href="#" className="text-blue-600 hover:underline block mt-2">
                  Visit Website
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
