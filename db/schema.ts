import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// === Schema Definition ===
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: integer('date').notNull(),
  coverImage: text('cover_image'),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const eventCategories = sqliteTable(
  'event_categories',
  {
    eventId: integer('event_id').references(() => events.id).notNull(),
    categoryId: integer('category_id').references(() => categories.id).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.categoryId] })
  ]
);

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

// === Type Exports ===
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type EventCategory = typeof eventCategories.$inferSelect;
export type NewEventCategory = typeof eventCategories.$inferInsert;

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type PaymentRecipient = typeof paymentRecipients.$inferSelect;
export type NewPaymentRecipient = typeof paymentRecipients.$inferInsert; 