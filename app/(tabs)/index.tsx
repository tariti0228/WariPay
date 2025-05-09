import Loading from '@/src/components/Loading';
import { getEvents } from '@/src/db/queries/events';
import { events } from '@/src/db/schema';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { Card, FAB, Text, useTheme } from 'react-native-paper';

type Event = typeof events.$inferSelect;

export default function EventsScreen() {
  const theme = useTheme();
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await getEvents();
        setEventsList(result);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ padding: 16 }}>
        {eventsList.map((event) => (
          <Card key={event.id} style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom: 8 }}>
                {event.name}
              </Text>
              {event.date && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {new Date(event.date).toLocaleDateString()}
                </Text>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => router.push('/(events)/create-event')}
      />
      </View>
      </SafeAreaView>
  );
}
