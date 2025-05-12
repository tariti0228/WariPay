import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Appbar, Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { events, participants } from '@/src/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import db from '@/src/db/index';

type Event = InferSelectModel<typeof events> & {
  participantNames: string[];
};

export default function EventsScreen() {
  const theme = useTheme();
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsResult = await db
        .select()
        .from(events)
        .orderBy(events.date);

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

      setEventsList(eventsWithParticipants);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 0 }}>
        <Appbar.Content title="イベント一覧" titleStyle={{ color: theme.colors.onSurface }} />
        <Appbar.Action icon="plus" onPress={() => router.push('/create-event')} color={theme.colors.onSurface} />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {eventsList.map((event) => (
          <Card
            key={event.id}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.eventHeader}>
                <Text variant="titleLarge" style={[styles.eventName, { color: theme.colors.onSurface }]}>
                  {event.name}
                </Text>
                <Button
                  mode="text"
                  onPress={() => router.push(`/(events)/${event.id}`)}
                  style={styles.detailButton}
                >
                  詳細
                </Button>
              </View>
              <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(event.date)}
              </Text>
              {event.participantNames.length > 0 && (
                <View style={styles.participantsSection}>
                  <Text variant="bodySmall" style={[styles.participantsLabel, { color: theme.colors.onSurfaceVariant }]}>
                    参加者
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.participantsScroll}
                    contentContainerStyle={styles.participantsContainer}
                  >
                    {event.participantNames.map((name: string, index: number) => (
                      <Chip
                        key={index}
                        style={styles.chip}
                        mode="outlined"
                        textStyle={{ fontSize: 12 }}
                      >
                        {name}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    flex: 1,
  },
  detailButton: {
    marginLeft: 8,
  },
  date: {
    marginBottom: 12,
  },
  participantsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8,
  },
  participantsLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  participantsScroll: {
    flexGrow: 0,
    minHeight: 32,
  },
  participantsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    marginBottom: 0,
  },
});
