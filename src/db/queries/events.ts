import { db } from '@/src/db';
import { events, participants } from '@/src/db/schema';
import { and, eq, gte, like, lte } from 'drizzle-orm';

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

interface CreateEventWithParticipants {
  name: string;
  date: number; // UNIX timestamp in milliseconds
  tags?: string;
  participantNames: string[];
}

// 全イベントを取得
export const getEvents = async () => {
  try {
    const eventsResult = await db.select().from(events).orderBy(events.date);
    const eventsWithParticipants = await Promise.all(
      eventsResult.map(async (event) => {
        const participantsResult = await db
          .select()
          .from(participants)
          .where(eq(participants.eventId, event.id));
        return {
          ...event,
          participantNames: participantsResult.map(p => p.name),
        };
      })
    );
    return eventsWithParticipants;
  } catch (error) {
    console.error('Error loading events:', error);
    throw error;
  }
};

// 特定のイベントを取得
export const getEventById = async (id: number) => {
  try {
    const result = await db.select().from(events).where(eq(events.id, id));
    if (!result[0]) return null;

    const participantsResult = await db
      .select()
      .from(participants)
      .where(eq(participants.eventId, id));

    return {
      ...result[0],
      participantNames: participantsResult.map(p => p.name),
    };
  } catch (error) {
    console.error('Error loading event:', error);
    throw error;
  }
};

// イベントを作成
export const createEvent = async (event: CreateEventWithParticipants) => {
  try {
    const result = await db.transaction(async (tx) => {
      // イベントを作成
      const [newEvent] = await tx
        .insert(events)
        .values({
          name: event.name,
          date: event.date,
          tags: event.tags,
        })
        .returning();

      // 参加者を作成
      const participantValues = event.participantNames.map(name => ({
        name,
        eventId: newEvent.id,
      }));

      await tx.insert(participants).values(participantValues);

      return newEvent;
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
    await db.delete(events).where(eq(events.id, id));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// 日付範囲でイベントを取得
export const getEventsByDateRange = async (startDate: number, endDate: number) => {
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

// 全イベントを削除
export const deleteAllEvents = async () => {
  try {
    await db.delete(events);
  } catch (error) {
    console.error('Error deleting all events:', error);
    throw error;
  }
}; 


