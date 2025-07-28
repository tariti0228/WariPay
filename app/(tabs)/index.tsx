import { router } from 'expo-router';
import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryTabs from '@/components/CategoryTabs';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <YStack flex={1} backgroundColor="white">
      <XStack 
        backgroundColor="white" 
        paddingHorizontal="$4" 
        paddingVertical="$3"
        paddingTop={insets.top}
        borderBottomWidth={1}
        borderBottomColor="#f0f0f0"
        elevation={2}
        alignItems="center"
        justifyContent="center"
        position="relative"
        height={60 + insets.top}
      >
        <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
          イベント
        </Text>
      </XStack>
      
      <YStack flex={1} backgroundColor="white">
        {/* カテゴリタブとイベントリスト */}
        <CategoryTabs />
      </YStack>
    </YStack>
  );
}