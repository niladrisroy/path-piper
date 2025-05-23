
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.includes('supabase.com') 
        ? process.env.DATABASE_URL?.replace('postgres://', 'postgresql://')
            .replace('#', '%23')
            .concat('&pgbouncer=true&connection_limit=1')
        : process.env.DATABASE_URL,
    },
  },
})

// Log queries in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  prisma.$use(async (params, next) => {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
    return result
  })
}
