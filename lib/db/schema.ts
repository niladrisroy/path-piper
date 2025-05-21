
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  name: text('name'),
  role: text('role'),
  createdAt: timestamp('created_at').defaultNow()
})
