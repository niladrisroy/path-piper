
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required')
}

// Parse connection string components for Supabase direct connection
const url = new URL(process.env.POSTGRES_URL!)
const connectionString = `postgres://${url.username}:${url.password}@${url.hostname}:${url.port}${url.pathname}`

// Configure postgres client with Supabase settings
const client = postgres(connectionString, {
  max: 1,
  ssl: {
    rejectUnauthorized: false,
    mode: 'require'
  }
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
