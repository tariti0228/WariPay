import { db } from '@/src/db';
import { events, participants, paymentRecipients, payments } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

// 全データを削除（デバッグ用）
export const deleteAllData = async () => {
  try {
    // 外部キー制約があるため、順序に注意
    await db.delete(paymentRecipients);
    await db.delete(payments);
    await db.delete(participants);
    await db.delete(events);
  } catch (error) {
    console.error('Error deleting all data:', error);
    throw error;
  }
};

// イベントと関連データを削除
export const deleteEventAndRelatedData = async (eventId: number) => {
  try {
    // トランザクションを使用して一貫性を保証
    await db.transaction(async (tx) => {
      // 1. 支払い受取人を削除
      const eventPayments = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.eventId, eventId));

      for (const payment of eventPayments) {
        await tx
          .delete(paymentRecipients)
          .where(eq(paymentRecipients.paymentId, payment.id));
      }

      // 2. 支払いを削除
      await tx.delete(payments).where(eq(payments.eventId, eventId));

      // 3. 参加者を削除
      await tx.delete(participants).where(eq(participants.eventId, eventId));

      // 4. イベントを削除
      await tx.delete(events).where(eq(events.id, eventId));
    });
  } catch (error) {
    console.error('Error deleting event and related data:', error);
    throw error;
  }
};

// イベントの参加者と支払い情報を取得
export const getEventDetails = async (eventId: number) => {
  try {
    // イベント情報
    const eventResult = await db.select().from(events).where(eq(events.id, eventId));
    if (!eventResult[0]) return null;

    // 参加者情報
    const participantsResult = await db
      .select()
      .from(participants)
      .where(eq(participants.eventId, eventId));

    // 支払い情報
    const paymentsResult = await db
      .select()
      .from(payments)
      .where(eq(payments.eventId, eventId));

    // 支払い受取人情報
    const paymentRecipientsResult = await db
      .select()
      .from(paymentRecipients)
      .where(eq(paymentRecipients.paymentId, paymentsResult[0]?.id));

    return {
      event: eventResult[0],
      participants: participantsResult,
      payments: paymentsResult,
      paymentRecipients: paymentRecipientsResult,
    };
  } catch (error) {
    console.error('Error getting event details:', error);
    throw error;
  }
};

// 参加者の支払い情報を取得
export const getParticipantPayments = async (participantId: number) => {
  try {
    // 支払い情報
    const paymentsResult = await db
      .select()
      .from(payments)
      .where(eq(payments.payerId, participantId));

    // 受取人情報
    const recipientPaymentsResult = await db
      .select()
      .from(paymentRecipients)
      .where(eq(paymentRecipients.participantId, participantId));

    return {
      payments: paymentsResult,
      recipientPayments: recipientPaymentsResult,
    };
  } catch (error) {
    console.error('Error getting participant payments:', error);
    throw error;
  }
};

// イベントの支払い合計を取得
export const getEventPaymentSummary = async (eventId: number) => {
  try {
    const paymentsResult = await db
      .select()
      .from(payments)
      .where(eq(payments.eventId, eventId));

    const totalAmount = paymentsResult.reduce((sum, payment) => sum + payment.amount, 0);
    const paymentCount = paymentsResult.length;

    return {
      totalAmount,
      paymentCount,
      payments: paymentsResult,
    };
  } catch (error) {
    console.error('Error getting event payment summary:', error);
    throw error;
  }
};

// 参加者の支払い合計を取得
export const getParticipantPaymentSummary = async (participantId: number) => {
  try {
    // 支払った金額
    const paidPaymentsResult = await db
      .select()
      .from(payments)
      .where(eq(payments.payerId, participantId));

    const totalPaid = paidPaymentsResult.reduce((sum, payment) => sum + payment.amount, 0);

    // 受け取った金額
    const receivedPaymentsResult = await db
      .select()
      .from(paymentRecipients)
      .where(eq(paymentRecipients.participantId, participantId));

    const totalReceived = receivedPaymentsResult.reduce(
      (sum) => sum + 0, 
      0
    );

    return {
      totalPaid,
      totalReceived,
      balance: totalPaid - totalReceived,
      paidPayments: paidPaymentsResult,
      receivedPayments: receivedPaymentsResult,
    };
  } catch (error) {
    console.error('Error getting participant payment summary:', error);
    throw error;
  }
}; 