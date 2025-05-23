
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema-drizzle';

const connectionString = process.env.DATABASE_URL;
const ssl = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: ssl ? { rejectUnauthorized: false } : undefined,
  keepAlive: true
});

export const db = drizzle(pool, { schema });
