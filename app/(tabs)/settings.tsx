import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AlertDialog, Separator, Text, XStack, YStack, Card, Button } from 'tamagui';
import { db } from '@/db/client';
import { events, participants, payments, paymentRecipients } from '@/db/schema';

// 型定義
type SettingItem = {
  title: string;
  description?: string;
  icon: string;
  onPress?: () => void;
  showChevron?: boolean;
};

// 定数
const APP_VERSION = '1.0.0';

const SETTING_ITEMS: SettingItem[] = [
  {
    title: 'プライバシーポリシー',
    icon: 'shield-lock',
    onPress: () => router.push('/(settings)/privacy'),
    showChevron: true,
  },
  {
    title: '利用規約',
    icon: 'file-document',
    onPress: () => router.push('/(settings)/terms'),
    showChevron: true,
  },
  {
    title: 'アプリバージョン',
    description: APP_VERSION,
    icon: 'information',
  },
];

// コンポーネント
const SettingItem = ({ item }: { item: SettingItem }) => {
  return (
    <YStack>
      <XStack
        pressStyle={{ opacity: 0.7 }}
        onPress={item.onPress}
      >
        <XStack gap="$2">
          <Text fontSize="$6" fontWeight="500">
            {item.title}
          </Text>
          {item.description && (
            <Text fontSize="$4" opacity={0.7}>
              {item.description}
            </Text>
          )}
        </XStack>
        {item.showChevron && (
          <Text fontSize="$6" opacity={0.5}>
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
        >
          <AlertDialog.Title>全データの削除</AlertDialog.Title>
          <AlertDialog.Description>
            この操作は取り消せません。本当に全てのデータを削除しますか？
          </AlertDialog.Description>
          <XStack gap="$3" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
            <AlertDialog.Cancel asChild>
              <Button>キャンセル</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                theme="red"
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
      <YStack style={{ paddingHorizontal: 16, paddingTop: 24 }}>
        <Text fontSize="$8" fontWeight="bold">設定</Text>
      </YStack>

      <ScrollView style={styles.scrollView}>
        <Card elevate bordered margin="$4">
          <Card.Header padded>
            {SETTING_ITEMS.map((item, index) => (
              <SettingItem key={index} item={item} />
            ))}
          </Card.Header>
        </Card>

        <Card elevate bordered margin="$4">
          <Card.Header padded>
            <Button
              theme="red"
              onPress={() => setDeleteDialogVisible(true)}
            >
              全データを削除
            </Button>
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
  },
  scrollView: {
    flex: 1,
  },
});

