import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Users, Award, ArrowRight } from "lucide-react"

export default function ProgramsSection() {
  const programs = [
    {
      id: 1,
      name: "Computer Science",
      level: "Undergraduate",
      duration: "4 years",
      students: 850,
      description:
        "Stanford's Computer Science program prepares students for careers in software development, artificial intelligence, and more.",
      tags: ["AI", "Machine Learning", "Software Engineering", "Data Science"],
      featured: true,
    },
    {
      id: 2,
      name: "Business Administration",
      level: "Graduate",
      duration: "2 years",
      students: 420,
      description:
        "The MBA program at Stanford Graduate School of Business is a full-time, two-year general management program.",
      tags: ["Finance", "Marketing", "Entrepreneurship", "Leadership"],
      featured: true,
    },
    {
      id: 3,
      name: "Electrical Engineering",
      level: "Undergraduate",
      duration: "4 years",
      students: 620,
      description:
        "The Electrical Engineering program focuses on the fundamentals of physics, computer science, and engineering design.",
      tags: ["Circuits", "Signal Processing", "Robotics", "Energy Systems"],
      featured: false,
    },
    {
      id: 4,
      name: "Psychology",
      level: "Undergraduate",
      duration: "4 years",
      students: 580,
      description: "Stanford's Psychology program explores human behavior, mental processes, and social interactions.",
      tags: ["Clinical Psychology", "Cognitive Science", "Developmental Psychology"],
      featured: false,
    },
    {
      id: 5,
      name: "Medicine",
      level: "Graduate",
      duration: "4 years",
      students: 480,
      description:
        "The Stanford School of Medicine offers a four-year MD program that prepares students for leadership in medicine.",
      tags: ["Clinical Practice", "Medical Research", "Public Health"],
      featured: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Featured Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {programs
                .filter((program) => program.featured)
                .map((program) => (
                  <div key={program.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">{program.name}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {program.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {program.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {program.students} students
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 my-2">{program.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {program.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      Learn more <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Program Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Undergraduate Programs</span>
                  <span className="font-semibold">65+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Graduate Programs</span>
                  <span className="font-semibold">90+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Professional Certificates</span>
                  <span className="font-semibold">40+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Online Courses</span>
                  <span className="font-semibold">200+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Student-Faculty Ratio</span>
                  <span className="font-semibold">5:1</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-sm mb-2">Schools & Colleges</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>School of Engineering</li>
                  <li>School of Humanities & Sciences</li>
                  <li>Graduate School of Business</li>
                  <li>School of Medicine</li>
                  <li>School of Law</li>
                  <li>School of Education</li>
                  <li>School of Earth, Energy & Environmental Sciences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Application Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Undergraduate</h4>
                  <p className="text-gray-600 text-sm">Early Action: November 1</p>
                  <p className="text-gray-600 text-sm">Regular Decision: January 5</p>
                </div>
                <div>
                  <h4 className="font-medium">Graduate</h4>
                  <p className="text-gray-600 text-sm">Varies by program</p>
                  <p className="text-gray-600 text-sm">Most deadlines: December - January</p>
                </div>
                <a href="#" className="text-blue-600 hover:underline text-sm block mt-2">
                  View All Application Deadlines
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
