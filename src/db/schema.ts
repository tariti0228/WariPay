import { sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// === Schema Definition ===
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: integer('date').notNull(),
  tags: text('tags'),
});

export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  eventId: integer('event_id').references(() => events.id).notNull(),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  description: text('description'),
  type: text('type'),
  date: integer('date').notNull(),
  payerId: integer('payer_id').references(() => participants.id).notNull(),
  eventId: integer('event_id').references(() => events.id).notNull(),
});

export const paymentRecipients = sqliteTable(
  'payment_recipients',
  {
    paymentId: integer('payment_id').references(() => payments.id).notNull(),
    participantId: integer('participant_id').references(() => participants.id).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.paymentId, table.participantId] })
  ]
); 