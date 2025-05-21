
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './db/schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required')
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
