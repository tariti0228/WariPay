import { db } from './client';
import { events, participants, payments, paymentRecipients } from './schema';
import { eq, sql } from 'drizzle-orm';

// イベント関連のクエリ
export const eventQueries = {
  // 全イベントを取得
  getAll: () => db.select().from(events),

  // 特定のイベントを取得
  getById: (id: number) => 
    db.select().from(events).where(eq(events.id, id)),

  // イベントを作成
  create: (data: { name: string; date: number; tags?: string | null }) =>
    db.insert(events).values(data).returning(),
};

// 参加者関連のクエリ
export const participantQueries = {
  // 全参加者を取得
  getAll: () => db.select().from(participants),

  // 特定のイベントの参加者を取得
  getByEventId: (eventId: number) =>
    db.select().from(participants).where(eq(participants.eventId, eventId)),

  // 参加者を作成
  create: (data: { name: string; eventId: number }) =>
    db.insert(participants).values(data).returning(),

  // 複数の参加者を作成
  createMany: (data: { name: string; eventId: number }[]) =>
    db.insert(participants).values(data).returning(),
};

// 支払い関連のクエリ
export const paymentQueries = {
  // 全支払いを取得
  getAll: () => db.select().from(payments),

  // 特定のイベントの支払いを取得
  getByEventId: (eventId: number) =>
    db.select().from(payments).where(eq(payments.eventId, eventId)),

  // 支払いを作成
  create: (data: {
    amount: number;
    description?: string;
    type?: string;
    date: number;
    payerId: number;
    eventId: number;
  }) => db.insert(payments).values(data).returning(),
};

// 支払い受取者関連のクエリ
export const paymentRecipientQueries = {
  // 全支払い受取者を取得
  getAll: () => db.select().from(paymentRecipients),

  // 支払い受取者を作成
  create: (data: { paymentId: number; participantId: number }) =>
    db.insert(paymentRecipients).values(data).returning(),

  // 複数の支払い受取者を作成
  createMany: (data: { paymentId: number; participantId: number }[]) =>
    db.insert(paymentRecipients).values(data).returning(),
};

// 集計関連のクエリ
export const summaryQueries = {
  // イベントの参加者数を取得
  getParticipantCount: (eventId: number) =>
    db.select({ count: sql<number>`count(*)` })
      .from(participants)
      .where(eq(participants.eventId, eventId)),

  // イベントの合計支払い金額を取得
  getTotalPaymentAmount: (eventId: number) =>
    db.select({ total: sql<number>`sum(amount)` })
      .from(payments)
      .where(eq(payments.eventId, eventId)),
}; 