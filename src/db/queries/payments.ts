import { db } from '@/src/db';
import { payments } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// 全支払いを取得
export const getPayments = async () => {
  try {
    const result = await db.select().from(payments);
    return result;
  } catch (error) {
    console.error('Error loading payments:', error);
    throw error;
  }
};

// 特定の支払いを取得
export const getPaymentById = async (id: number) => {
  try {
    const result = await db.select().from(payments).where(eq(payments.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error loading payment:', error);
    throw error;
  }
};

// イベントの支払いを取得
export const getPaymentsByEventId = async (eventId: number) => {
  try {
    const result = await db.select().from(payments).where(eq(payments.eventId, eventId));
    return result;
  } catch (error) {
    console.error('Error loading payments by event:', error);
    throw error;
  }
};

// 支払い者の支払いを取得
export const getPaymentsByPayerId = async (payerId: number) => {
  try {
    const result = await db.select().from(payments).where(eq(payments.payerId, payerId));
    return result;
  } catch (error) {
    console.error('Error loading payments by payer:', error);
    throw error;
  }
};

// 支払いを作成
export const createPayment = async (payment: NewPayment) => {
  try {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// 支払いを更新
export const updatePayment = async (id: number, payment: Partial<NewPayment>) => {
  try {
    const result = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// 支払いを削除
export const deletePayment = async (id: number) => {
  try {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}; 