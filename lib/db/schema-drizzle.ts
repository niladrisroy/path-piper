
import { pgTable, uuid, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: text('role', { enum: ['student', 'mentor', 'institution'] }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  bio: text('bio'),
  location: text('location'),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const studentProfiles = pgTable('student_profiles', {
  id: uuid('id').primaryKey().references(() => profiles.id),
  birthMonth: varchar('birth_month').notNull(),
  birthYear: varchar('birth_year').notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const parentChildRelations = pgTable('parent_child_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => studentProfiles.id),
  parentEmail: text('parent_email').notNull(),
  approvalStatus: text('approval_status').default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
