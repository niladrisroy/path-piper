
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './db/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

export const db = drizzle(sql, { schema })

export async function testDrizzleConnection() {
  try {
    await db.select().from(schema.profiles).limit(1)
    console.log('Drizzle connection successful')
    return true
  } catch (error) {
    console.error('Drizzle connection failed:', error)
    return false
  }
}
