import { router } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from '@tamagui/lucide-icons';
import EventList from '@/components/eventlist';
import type { Event } from '@/db/schema';
import { eventQueries, participantQueries } from '@/db/queries';

export default function EventsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const dbEvents = useLiveQuery(eventQueries.getAll());
  const dbParticipants = useLiveQuery(participantQueries.getAll());

  const handleAddEvent = () => {
    router.push('/(events)/new');
  };

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // クエリを再実行して最新データを取得
      await Promise.all([
        eventQueries.getAll(),
        participantQueries.getAll()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formattedEvents = dbEvents?.data?.map((event: Event) => {
    // 各イベントの参加者数を計算
    const participantCount = dbParticipants?.data?.filter(
      participant => participant.eventId === event.id
    ).length || 0;

    return {
      id: event.id,
      title: event.name,
      date: new Date(event.date).toLocaleDateString('ja-JP'),
      participants: participantCount,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOFnX1BL0H9nsi3kb5lLK-JMepKTUeUAKMogyLS7NMYMeJ36k3zQo-xL9QCCbHFQz6H3IpD99UmWEiLhCDE-vdPlQ292kkK1OYM9R_dgD6QoX-rJ77UROB1nwwy3lbJ6KK9LO467BKHU84YxqjYNP6aXt-abZehSUvbr38nCly7CwFnC_PYGDJFjyVm54GlQpf90bevcNfKFJN6wVitUOMh8w8szfJ4T16RuG8C-3w_hTkZTqvB-sf8gaoFYILeN6cok2JZud4Xk50'
    };
  }) || [];

  return (
    <YStack flex={1} backgroundColor="white">
      <SafeAreaView style={{ flex: 1 }}>
        <XStack 
          backgroundColor="white" 
          paddingHorizontal="$4" 
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="#f0f0f0"
          elevation={2}
          alignItems="center"
          justifyContent="center"
          position="relative"
          height={60}
        >
          <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
            イベント
          </Text>
          <Button 
            size="$4" 
            circular 
            icon={Plus} 
            backgroundColor="#f5f5f5" 
            color="#1a2634"
            onPress={handleAddEvent}
            position="absolute"
            right="$4"
          />
        </XStack>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <EventList 
            events={formattedEvents}
            onAddEvent={handleAddEvent}
          />
        </ScrollView>
      </SafeAreaView>
    </YStack>
  );
}