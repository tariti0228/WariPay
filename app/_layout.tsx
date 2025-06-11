import { Stack } from 'expo-router';
import { TamaguiProvider, Text, YStack } from 'tamagui'
import { config } from '@/tamagui.config'
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";

export default function RootLayout() {
  const { success, error: migrationError } = useMigrations(db, migrations);

  if (success) {
    console.log('データベースを準備しました');
  }

  if (migrationError) {
    console.error('Migration error:', migrationError.message);
    return (
      <TamaguiProvider config={config}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding={16}>
          <Text color="$red10">データベースエラー: {migrationError.message}</Text>
        </YStack>
      </TamaguiProvider>
    );
  }

  if (!success) {
    console.log('データベースを準備中...');
    return (
      <TamaguiProvider config={config}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding={16}>
          <Text>データベースを準備中...</Text>
        </YStack>
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TamaguiProvider>
  );
}
