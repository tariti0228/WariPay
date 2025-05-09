import { db } from '@/src/db';
import { events, participants } from '@/src/db/schema';
import { and, eq, gte, like, lte } from 'drizzle-orm';

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

interface CreateEventWithParticipants {
  name: string;
  tags?: string;
  participantNames: string[];
}

// 全イベントを取得
export const getEvents = async () => {
  try {
    const result = await db.select().from(events).orderBy(events.date);
    return result;
  } catch (error) {
    console.error('Error loading events:', error);
    throw error;
  }
};

// 特定のイベントを取得
export const getEventById = async (id: number) => {
  try {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error loading event:', error);
    throw error;
  }
};

// イベントを作成
export const createEvent = async ({ name, tags, participantNames }: CreateEventWithParticipants) => {
  try {
    const result = await db.transaction(async (tx) => {
      // イベントを作成
      const [event] = await tx.insert(events).values({
        name,
        tags,
      }).returning();

      // 参加者を作成
      if (participantNames.length > 0) {
        await tx.insert(participants).values(
          participantNames.map(name => ({
            name,
            eventId: event.id,
          }))
        );
      }

      return event;
    });

    return result;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// イベントを更新
export const updateEvent = async (id: number, event: Partial<NewEvent>) => {
  try {
    const result = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// イベントを削除
export const deleteEvent = async (id: number) => {
  try {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// 日付範囲でイベントを取得
export const getEventsByDateRange = async (startDate: string, endDate: string) => {
  try {
    const result = await db
      .select()
      .from(events)
      .where(and(gte(events.date, startDate), lte(events.date, endDate)))
      .orderBy(events.date);
    return result;
  } catch (error) {
    console.error('Error loading events by date range:', error);
    throw error;
  }
};

// イベント名で検索
export const searchEventsByName = async (name: string) => {
  try {
    const result = await db
      .select()
      .from(events)
      .where(like(events.name, `%${name}%`))
      .orderBy(events.date);
    return result;
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
}; 


