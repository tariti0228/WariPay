import { Link, Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: '画面が見つかりません' }} />
      <SafeAreaView style={{ flex: 1 }}>
        <Surface style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text variant="displayLarge" style={{ color: theme.colors.primary, marginBottom: 16 }}>
              404
            </Text>
            <Text variant="headlineMedium" style={{ marginBottom: 8, textAlign: 'center' }}>
              画面が見つかりません
            </Text>
            <Text variant="bodyLarge" style={{ marginBottom: 32, textAlign: 'center', opacity: 0.7 }}>
              お探しの画面は存在しないか、移動した可能性があります。
            </Text>
            <Link href="/" asChild>
              <Button
                mode="contained"
                contentStyle={{ paddingVertical: 8 }}
                style={{ minWidth: 200 }}
              >
                トップに戻る
              </Button>
            </Link>
          </View>
        </Surface>
      </SafeAreaView>
    </>
  );
} 