import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Text, XStack, YStack, Button } from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
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
            icon={<Feather name="arrow-left" size={20} color="#1a2634" />}
            backgroundColor="#f5f5f5"
            color="#1a2634"
            onPress={() => router.back()}
          />
          
        </XStack>
        <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
          利用規約
        </Text>
      </XStack>

      <ScrollView style={{ flex: 1 }}>
        <YStack padding="$4" gap="$4">
          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              1. はじめに
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              本規約は、当アプリケーションの利用に関する条件を定めるものです。ユーザーは本規約に同意した上で、当アプリケーションを利用するものとします。
            </Text>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              2. 利用資格
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              当アプリケーションは、以下の条件を満たすユーザーが利用できます：
            </Text>
            <YStack paddingLeft="$4" gap="$2">
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 本規約に同意していること
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 適切なデバイスとインターネット接続を有していること
              </Text>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              3. 禁止事項
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              ユーザーは、以下の行為を行ってはなりません：
            </Text>
            <YStack paddingLeft="$4" gap="$2">
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 法令または公序良俗に反する行為
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 当アプリケーションの運営を妨害する行為
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 他のユーザーに迷惑をかける行為
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • 当アプリケーションの改変や逆コンパイル
              </Text>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              4. 免責事項
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              当アプリケーションは、以下の事項について一切の責任を負いません：
            </Text>
            <YStack paddingLeft="$4" gap="$2">
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • ユーザー間のトラブル
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • データの損失や漏洩
              </Text>
              <Text fontSize="$4" color="#666" lineHeight={24}>
                • アプリケーションの利用により生じた損害
              </Text>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              5. 知的財産権
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              当アプリケーションに関する知的財産権は、開発者に帰属します。ユーザーは、当アプリケーションの複製、改変、再配布等を行うことはできません。
            </Text>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              6. 規約の変更
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              当アプリケーションは、必要に応じて本規約を変更することがあります。変更があった場合は、アプリケーション内で通知します。
            </Text>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" color="#1a2634" fontWeight="600">
              7. 準拠法
            </Text>
            <Text fontSize="$4" color="#666" lineHeight={24}>
              本規約の解釈にあたっては、日本法を準拠法とします。
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
