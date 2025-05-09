import { db } from '@/src/db';
import { paymentRecipients } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export type PaymentRecipient = typeof paymentRecipients.$inferSelect;
export type NewPaymentRecipient = typeof paymentRecipients.$inferInsert;

// 支払いの受取人を取得
export const getRecipientsByPaymentId = async (paymentId: number) => {
  try {
    const result = await db
      .select()
      .from(paymentRecipients)
      .where(eq(paymentRecipients.paymentId, paymentId));
    return result;
  } catch (error) {
    console.error('Error loading recipients by payment:', error);
    throw error;
  }
};

// 参加者の受取支払いを取得
export const getPaymentsByRecipientId = async (participantId: number) => {
  try {
    const result = await db
      .select()
      .from(paymentRecipients)
      .where(eq(paymentRecipients.participantId, participantId));
    return result;
  } catch (error) {
    console.error('Error loading payments by recipient:', error);
    throw error;
  }
};

// 受取人を追加
export const addRecipient = async (recipient: NewPaymentRecipient) => {
  try {
    const result = await db.insert(paymentRecipients).values(recipient).returning();
    return result[0];
  } catch (error) {
    console.error('Error adding recipient:', error);
    throw error;
  }
};

// 受取人を削除
export const removeRecipient = async (paymentId: number, participantId: number) => {
  try {
    const result = await db
      .delete(paymentRecipients)
      .where(
        eq(paymentRecipients.paymentId, paymentId) &&
        eq(paymentRecipients.participantId, participantId)
      )
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error removing recipient:', error);
    throw error;
  }
}; 