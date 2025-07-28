import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AlertDialog, Separator, Text, XStack, YStack, Card, Button } from 'tamagui';
import { db } from '@/db/client';
import { events, participants, payments, paymentRecipients } from '@/db/schema';
import { Shield, FileText, Info, Trash2 } from '@tamagui/lucide-icons';

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
    icon: <Shield size={20} color="#666" />,
    onPress: () => router.push('/(settings)/privacy'),
    showChevron: true,
  },
  {
    title: '利用規約',
    icon: <FileText size={20} color="#666" />,
    onPress: () => router.push('/(settings)/terms'),
    showChevron: true,
  },
  {
    title: 'アプリバージョン',
    description: APP_VERSION,
    icon: <Info size={20} color="#666" />,
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
          <Text fontSize="$5" color="#666">
            →
          </Text>
        )}
      </XStack>
      {item.showChevron && <Separator />}
    </YStack>
  );
};

const DeleteDialog = ({ 
  visible, 
  onDismiss, 
  onDelete, 
  isDeleting 
}: { 
  visible: boolean; 
  onDismiss: () => void; 
  onDelete: () => void; 
  isDeleting: boolean;
}) => {
  return (
    <AlertDialog open={visible} onOpenChange={onDismiss}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          backgroundColor="white"
          borderRadius="$4"
          padding="$4"
        >
          <AlertDialog.Title fontSize="$6" fontWeight="700" color="#1a2634">
            全データの削除
          </AlertDialog.Title>
          <AlertDialog.Description fontSize="$4" color="#666">
            この操作は取り消せません。本当に全てのデータを削除しますか？
          </AlertDialog.Description>
          <XStack gap="$3" justifyContent="flex-end" alignItems="center">
            <AlertDialog.Cancel asChild>
              <Button
                backgroundColor="#f5f5f5"
                color="#1a2634"
                borderWidth={0}
                pressStyle={{ opacity: 0.7 }}
              >
                キャンセル
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                backgroundColor="#EF4444"
                color="white"
                borderWidth={0}
                pressStyle={{ opacity: 0.7 }}
                onPress={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除'}
              </Button>
            </AlertDialog.Action>
          </XStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};

export default function SettingsScreen() {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      await db.delete(events).execute();
      await db.delete(participants).execute();
      await db.delete(payments).execute();
      await db.delete(paymentRecipients).execute();
      setDeleteDialogVisible(false);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error deleting all events:', error);
    } finally {
      setIsDeleting(false);
    }
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
                icon: <Trash2 size={20} color="#EF4444" />,
                onPress: () => setDeleteDialogVisible(true),
                theme: 'danger'
              }} 
            />
          </Card.Header>
        </Card>
      </ScrollView>

      <DeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onDelete={handleDeleteAll}
        isDeleting={isDeleting}
      />
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

