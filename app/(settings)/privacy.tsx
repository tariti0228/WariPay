import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Text, XStack, YStack, Button } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons';
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
        height={60}
      >
        {/* 戻るボタン */}
        <Button
          size="$4"
          icon={ArrowLeft}
          backgroundColor="#f5f5f5"
          color="#1a2634"
          onPress={handleGoBack}
          width={44}
          height={44}
          borderRadius="$2"
          position="absolute"
          left="$4"
          zIndex={10}
          // タッチ領域を拡大
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          // より確実なタッチハンドリング
          pressStyle={{ opacity: 0.7, scale: 0.95 }}
        />
        
        {/* タイトル（中央揃え） */}
        <Text 
          fontSize="$6" 
          color="#1a2634" 
          fontWeight="700" 
          flex={1} 
          textAlign="center"
        >
          プライバシーポリシー
        </Text>
        
        {/* 右側のスペーサー（レイアウトバランス用） */}
        <YStack width={44} height={44} />
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
