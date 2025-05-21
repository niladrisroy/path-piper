
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required')
}

// Create connection string with proper parameters
const connectionString = process.env.POSTGRES_URL + '?sslmode=require'

// Configure postgres client with pooling
const client = postgres(connectionString, {
  max: 1,
  prepare: false,
  ssl: 'require',
  connection: {
    options: '-c statement_timeout=60000'
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
