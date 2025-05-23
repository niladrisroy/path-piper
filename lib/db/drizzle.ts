
import { drizzle } from 'drizzle-orm/node-postgres';
import postgres from 'pg';
import * as schema from './schema-drizzle';

const { Pool } = postgres;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  keepAlive: true,
  max: 20
});

export const db = drizzle(pool, { schema });
