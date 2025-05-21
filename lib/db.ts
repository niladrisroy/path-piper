
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required')
}

// Convert the URL to use connection pooling
const connectionString = process.env.POSTGRES_URL.replace('postgres://', 'postgres://pooler-')

const client = postgres(connectionString, { max: 1 })
export const db = drizzle(client, { schema })

export async function testDrizzleConnection() {
  try {
    // Test the connection by querying the profiles table
    const result = await db.select().from(schema.profiles).limit(1)
    console.log('Drizzle connection successful:', result)
    return true
  } catch (error) {
    console.error('Drizzle connection failed:', error)
    return false
  }
}
