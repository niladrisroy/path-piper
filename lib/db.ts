
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required')
}

// Configure postgres client for Supabase connection
const client = postgres('postgres://postgres:pathpiper287@db.owikmmifkriuzjkvmsei.supabase.co:5432/postgres', {
  ssl: true,
  max: 1
})

export const db = drizzle(client, { schema })

export async function testDrizzleConnection() {
  try {
    const result = await db.select().from(schema.profiles).limit(1)
    console.log('Drizzle connection successful:', result)
    return true
  } catch (error) {
    console.error('Drizzle connection failed:', error)
    return false
  }
}
