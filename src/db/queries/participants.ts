import { db } from '@/src/db';
import { participants } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

// 全参加者を取得
export const getParticipants = async () => {
  try {
    const result = await db.select().from(participants);
    return result;
  } catch (error) {
    console.error('Error loading participants:', error);
    throw error;
  }
};

// 特定の参加者を取得
export const getParticipantById = async (id: number) => {
  try {
    const result = await db.select().from(participants).where(eq(participants.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error loading participant:', error);
    throw error;
  }
};

// イベントの参加者を取得
export const getParticipantsByEventId = async (eventId: number) => {
  try {
    const result = await db.select().from(participants).where(eq(participants.eventId, eventId));
    return result;
  } catch (error) {
    console.error('Error loading participants by event:', error);
    throw error;
  }
};

// 参加者を作成
export const createParticipant = async (participant: NewParticipant) => {
  try {
    const result = await db.insert(participants).values(participant).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating participant:', error);
    throw error;
  }
};

// 参加者を更新
export const updateParticipant = async (id: number, participant: Partial<NewParticipant>) => {
  try {
    const result = await db
      .update(participants)
      .set(participant)
      .where(eq(participants.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
};

// 参加者を削除
export const deleteParticipant = async (id: number) => {
  try {
    const result = await db.delete(participants).where(eq(participants.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
}; 