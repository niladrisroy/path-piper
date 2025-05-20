
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function testPrismaConnection() {
  try {
    await prisma.$connect()
    console.log('Prisma connection successful')
    return true
  } catch (error) {
    console.error('Prisma connection failed:', error)
    return false
  }
}
