import { PrismaClient } from '@prisma/client'
import 'server-only'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
        ?.replace('postgres://', 'postgresql://')
        .replace('#', '%23')
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? [] // Disable all logs even in development
    : []
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
    return result
  })
}