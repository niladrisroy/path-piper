
import { prisma } from '../prisma'

export async function getInstitutionProfile(id: string) {
  try {
    const profile = await prisma.institutionProfile.findUnique({
      where: {
        id: id
      }
    })

    if (!profile) return null

    // This is a placeholder for fetching related data
    // You would need to create models for events, gallery, and programs in your Prisma schema
    // For now, we'll just return counts and empty arrays
    
    // Assuming you have these models defined in your Prisma schema
    const [eventsCount, programsCount, galleryCount] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) FROM institution_events WHERE institution_id = ${id}`,
      prisma.$queryRaw`SELECT COUNT(*) FROM institution_programs WHERE institution_id = ${id}`,
      prisma.$queryRaw`SELECT COUNT(*) FROM institution_gallery WHERE institution_id = ${id}`
    ])

    // You would need to implement these fetches based on your actual Prisma schema
    // const events = await prisma.institutionEvent.findMany({ where: { institutionId: id } })
    // const gallery = await prisma.institutionGallery.findMany({ where: { institutionId: id } })
    // const programs = await prisma.institutionProgram.findMany({ where: { institutionId: id } })

    return {
      institution: {
        name: profile.institutionName,
        type: profile.institutionType,
        stats: {
          events: Number(eventsCount[0]?.count || 0),
          programs: Number(programsCount[0]?.count || 0),
          gallery: Number(galleryCount[0]?.count || 0)
        },
        contact: {
          website: profile.website
        }
      },
      events: [],  // Replace with actual events when implemented
      gallery: [], // Replace with actual gallery when implemented
      programs: [] // Replace with actual programs when implemented
    }
  } catch (error) {
    console.error('Error fetching institution profile:', error)
    return null
  }
}
