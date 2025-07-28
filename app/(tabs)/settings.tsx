import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Alert } from 'react-native';
import { Separator, Text, XStack, YStack, Card, Button } from 'tamagui';
import { db } from '@/db/client';
import { events, participants, payments, paymentRecipients, categories, eventCategories } from '@/db/schema';
import { Feather } from '@expo/vector-icons';

// 型定義
type SettingItem = {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  theme?: 'default' | 'danger';
};

// 定数
const APP_VERSION = '1.0.0';

const SETTING_ITEMS: SettingItem[] = [
  {
    title: 'プライバシーポリシー',
    icon: <Feather name="shield" size={20} color="#666" />,
    onPress: () => router.push('/(settings)/privacy'),
    showChevron: true,
  },
  {
    title: '利用規約',
    icon: <Feather name="file-text" size={20} color="#666" />,
    onPress: () => router.push('/(settings)/terms'),
    showChevron: true,
  },
  {
    title: 'アプリバージョン',
    description: APP_VERSION,
    icon: <Feather name="info" size={20} color="#666" />,
  },
];

// コンポーネント
const SettingItem = ({ item }: { item: SettingItem }) => {
  return (
    <YStack>
      <XStack
        pressStyle={{ opacity: 0.7 }}
        onPress={item.onPress}
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack gap="$3" alignItems="center">
          {item.icon}
          <YStack>
            <Text 
              fontSize="$5" 
              fontWeight="500" 
              color={item.theme === 'danger' ? '#EF4444' : '#1a2634'}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text fontSize="$3" color="#666" marginTop="$1">
                {item.description}
              </Text>
            )}
          </YStack>
        </XStack>
        {item.showChevron && (
          <Feather name="chevron-right" size={16} color="#666" />
        )}
      </XStack>
      {item.showChevron && <Separator />}
    </YStack>
  );
};



export default function SettingsScreen() {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      console.log('Starting to delete all data...');
      // 外部キー制約があるため、削除順序に注意
      await db.delete(paymentRecipients).execute();
      await db.delete(payments).execute();
      await db.delete(participants).execute();
      await db.delete(eventCategories).execute();
      await db.delete(events).execute();
      await db.delete(categories).execute();
      console.log('All data deleted successfully');
      // 強制的にホーム画面にリフレッシュして遷移
      router.replace('/(tabs)/?forceRefresh=true');
    } catch (error) {
      console.error('Error deleting all data:', error);
      Alert.alert('エラー', 'データの削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteConfirm = () => {
    Alert.alert(
      '全データの削除',
      'この操作は取り消せません。本当に全てのデータを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: isDeleting ? '削除中...' : '削除', 
          style: 'destructive', 
          onPress: handleDeleteAll 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <YStack style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
        <Text fontSize="$8" fontWeight="700" color="#1a2634">設定</Text>
      </YStack>

      <ScrollView style={styles.scrollView}>
        <Card 
          elevate 
          bordered 
          margin="$4" 
          backgroundColor="white"
          borderRadius="$4"
        >
          <Card.Header padded>
            {SETTING_ITEMS.map((item, index) => (
              <SettingItem key={index} item={item} />
            ))}
          </Card.Header>
        </Card>

        <Card 
          elevate 
          bordered 
          margin="$4" 
          backgroundColor="white"
          borderRadius="$4"
        >
          <Card.Header padded>
            <SettingItem 
              item={{
                title: '全データを削除',
                icon: <Feather name="trash-2" size={20} color="#EF4444" />,
                onPress: showDeleteConfirm,
                theme: 'danger'
              }} 
            />
          </Card.Header>
        </Card>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
});

