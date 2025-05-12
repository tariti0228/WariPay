import { useThemeContext } from '@/src/theme/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Card, List, Switch, useTheme, Button, Dialog, Portal, Divider } from 'react-native-paper';
import db from '@/src/db/index';
import { events, participants, payments, paymentRecipients } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>設定</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <List.Item
              title="ダークモード"
              description="画面を暗いテーマに切り替えます"
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
              left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <List.Item
              title="プライバシーポリシー"
              titleStyle={styles.listItemTitle}
              left={props => <List.Icon {...props} icon="shield-lock" color={theme.colors.primary} />}
              onPress={() => router.push('/(settings)/privacy')}
              right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="利用規約"
              titleStyle={styles.listItemTitle}
              left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
              onPress={() => router.push('/(settings)/terms')}
              right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <List.Item
              title="アプリバージョン"
              description="1.0.0"
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
              left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              textColor={theme.colors.error}
              style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            >
              全データを削除
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>全データの削除</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              この操作は取り消せません。本当に全てのデータを削除しますか？
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>キャンセル</Button>
            <Button
              onPress={handleDeleteAll}
              textColor={theme.colors.error}
              loading={isDeleting}
              disabled={isDeleting}
            >
              削除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  deleteButton: {
    marginVertical: 8,
    borderRadius: 8,
  },
  dialog: {
    borderRadius: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dialogText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

