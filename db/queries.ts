import { db } from './client';
import { events, participants, payments, paymentRecipients, categories, eventCategories } from './schema';
import { eq, sql, inArray } from 'drizzle-orm';

// イベント関連のクエリ
export const eventQueries = {
  // 全イベントを取得
  getAll: () => db.select().from(events),

  // 特定のイベントを取得
  getById: (id: number) => 
    db.select().from(events).where(eq(events.id, id)),

  // イベントを作成
  create: (data: { name: string; date: number; coverImage?: string }) =>
    db.insert(events).values(data).returning(),

  // イベントを更新
  update: (id: number, data: { name?: string; date?: number; coverImage?: string }) =>
    db.update(events).set(data).where(eq(events.id, id)).returning(),

  // イベントを削除
  delete: (id: number) =>
    db.delete(events).where(eq(events.id, id)),

  // カテゴリ別にイベントを取得
  getByCategory: (categoryId: number) =>
    db.select({
      event: events,
      categoryId: eventCategories.categoryId
    })
    .from(events)
    .innerJoin(eventCategories, eq(events.id, eventCategories.eventId))
    .where(eq(eventCategories.categoryId, categoryId)),
};

// カテゴリ関連のクエリ
export const categoryQueries = {
  // 全カテゴリを取得
  getAll: () => db.select().from(categories),

  // 特定のカテゴリを取得
  getById: (id: number) =>
    db.select().from(categories).where(eq(categories.id, id)),

  // カテゴリを作成
  create: (data: { name: string }) =>
    db.insert(categories).values(data).returning(),

  // イベントのカテゴリを取得
  getByEventId: (eventId: number) =>
    db.select({
      category: categories,
    })
    .from(categories)
    .innerJoin(eventCategories, eq(categories.id, eventCategories.categoryId))
    .where(eq(eventCategories.eventId, eventId)),
};

// イベントカテゴリ関連のクエリ
export const eventCategoryQueries = {
  // 全イベントカテゴリ関連を取得
  getAll: () => db.select().from(eventCategories),

  // イベントにカテゴリを追加
  create: (data: { eventId: number; categoryId: number }) =>
    db.insert(eventCategories).values(data).returning(),

  // 複数のカテゴリを一度に追加
  createMany: (data: { eventId: number; categoryId: number }[]) =>
    db.insert(eventCategories).values(data).returning(),

  // イベントのカテゴリを削除
  deleteByEventId: (eventId: number) =>
    db.delete(eventCategories).where(eq(eventCategories.eventId, eventId)),
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

  // 参加者を更新
  update: (id: number, data: { name?: string }) =>
    db.update(participants).set(data).where(eq(participants.id, id)).returning(),
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

  // 支払いを削除
  delete: (id: number) =>
    db.delete(payments).where(eq(payments.id, id)),

  // 支払いを取得
  getById: (id: number) =>
    db.select().from(payments).where(eq(payments.id, id)),

  // 支払いを更新
  update: (id: number, data: {
    amount?: number;
    description?: string;
    type?: string;
    date?: number;
    payerId?: number;
  }) => db.update(payments).set(data).where(eq(payments.id, id)).returning(),
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

  // 特定の支払いの受取者を取得
  getByPaymentId: (paymentId: number) =>
    db.select().from(paymentRecipients).where(eq(paymentRecipients.paymentId, paymentId)),

  // 特定の支払いの受取者を削除
  deleteByPaymentId: (paymentId: number) =>
    db.delete(paymentRecipients).where(eq(paymentRecipients.paymentId, paymentId)),
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

// 清算関連のクエリ
export const settlementQueries = {
  // イベントの参加者別支払い集計を取得
  getParticipantPayments: (eventId: number) =>
    db.select({
      participant: participants,
      paidAmount: sql<number>`COALESCE(SUM(CASE WHEN payments.payer_id = participants.id THEN payments.amount ELSE 0 END), 0)`,
    })
    .from(participants)
    .leftJoin(payments, eq(participants.eventId, payments.eventId))
    .where(eq(participants.eventId, eventId))
    .groupBy(participants.id, participants.name, participants.eventId),

  // 各支払いとその対象者を取得（JavaScript側で計算するため）
  getPaymentDetails: (eventId: number) =>
    db.select({
      payment: payments,
      recipients: sql<string>`GROUP_CONCAT(payment_recipients.participant_id)`,
    })
    .from(payments)
    .leftJoin(paymentRecipients, eq(payments.id, paymentRecipients.paymentId))
    .where(eq(payments.eventId, eventId))
    .groupBy(payments.id, payments.amount, payments.description, payments.type, payments.date, payments.payerId, payments.eventId),
};

// 新しい割り勘計算用のクエリ
export const advancedSettlementQueries = {
  // イベントの全支払いと受益者情報を取得
  getPaymentHistoryForEvent: async (eventId: number) => {
    const payments = await paymentQueries.getByEventId(eventId);
    const participants = await participantQueries.getByEventId(eventId);
    
    const paymentHistory = await Promise.all(
      payments.map(async (payment) => {
        const recipients = await paymentRecipientQueries.getByPaymentId(payment.id);
        return {
          payment,
          recipients: recipients.map(r => r.participantId)
        };
      })
    );
    
    return {
      payments: paymentHistory,
      participants
    };
  }
};