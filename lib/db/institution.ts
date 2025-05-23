
'use server'

import { prisma } from '../prisma'

export async function getInstitutions(limit = 10) {
  try {
    const institutions = await prisma.institutionProfile.findMany({
      take: limit,
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return institutions.map(institution => ({
      id: institution.id,
      name: institution.institutionName,
      type: institution.institutionType,
      location: institution.profile.location || 'Unknown location',
      logo: institution.profile.profileImageUrl || '/placeholder-logo.png',
      verified: institution.verified
    }))
  } catch (error) {
    console.error('Error fetching institutions:', error)
    return []
  }
}

export async function getInstitutionById(id: string) {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { id },
      include: {
        profile: true
      }
    })

    if (!institution) {
      return null
    }

    return {
      id: institution.id,
      name: institution.institutionName,
      type: institution.institutionType,
      category: institution.category,
      location: institution.profile.location || 'Unknown location',
      bio: institution.profile.bio || '',
      logo: institution.profile.profileImageUrl || '/placeholder-logo.png',
      coverImage: institution.coverImageUrl || '/university-classroom.png',
      website: institution.website || '',
      verified: institution.verified
    }
  } catch (error) {
    console.error(`Error fetching institution ${id}:`, error)
    return null
  }
}
