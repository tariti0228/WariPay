import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Text, XStack, YStack, Button } from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
        <XStack
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width={80}
          alignItems="center"
          justifyContent="center"
        >
        <Button
            size="$3"
            circular
            icon={<Feather name="arrow-left" size={16} color="#1a2634" />}
            backgroundColor="#f5f5f5"
            color="#1a2634"
            onPress={() => router.back()}
          />
          
        </XStack>
        <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
          プライバシーポリシー
        </Text>
      </XStack>

      <ScrollView style={{ flex: 1 }}>
        {/* 既存のコンテンツ */}
        <YStack padding="$4" gap="$4">
          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              1. 収集する情報
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              当アプリケーションは、以下の情報を収集する場合があります：
            </Text>
            <YStack paddingLeft="$4" gap="$2">
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • イベント情報（イベント名、日付、参加者情報）
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 支払い情報（金額、説明、支払い者、受取者）
              </Text>
            </YStack>
          </YStack>

          {/* 残りのコンテンツは同じ */}
          {/* ... */}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
