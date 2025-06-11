import { router } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, Text, XStack, YStack, H1,View } from 'tamagui';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { events } from '@/db/schema';
import { db } from '@/db/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Airplay } from '@tamagui/lucide-icons';

export default function EventsScreen() {
  const [refreshing, setRefreshing] = useState(false);



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { }} />
        }
      >
        <YStack gap="$4" style={{ paddingTop: 24, justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Hello</Text>
          <Button>Plain</Button>
          <Button alignSelf="center" icon={Airplay} size="$6">
            Large
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView >
  );
}
