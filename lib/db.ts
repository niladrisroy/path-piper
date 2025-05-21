
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const client = postgres(process.env.DATABASE_URL)
export const db = drizzle(client, { schema })

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
