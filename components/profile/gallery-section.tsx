import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function GallerySection() {
  const galleryImages = [
    {
      id: 1,
      src: "/bustling-university-campus.png",
      alt: "Bustling university campus with students",
      caption: "Main Campus Quad",
    },
    {
      id: 2,
      src: "/college-library.png",
      alt: "Modern college library",
      caption: "Central Library",
    },
    {
      id: 3,
      src: "/university-classroom.png",
      alt: "Modern university classroom",
      caption: "Interactive Learning Space",
    },
    {
      id: 4,
      src: "/college-sports-field.png",
      alt: "College sports field",
      caption: "Athletic Complex",
    },
    {
      id: 5,
      src: "/university-laboratory.png",
      alt: "Advanced research laboratory",
      caption: "Research Laboratory",
    },
    {
      id: 6,
      src: "/university-info-session.png",
      alt: "University information session",
      caption: "Student Orientation",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Campus Gallery</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative h-64 w-full">
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">{image.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
