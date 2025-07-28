import { Stack } from 'expo-router';
import { TamaguiProvider, Text, YStack } from 'tamagui'
import { config } from '@/tamagui.config'
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error: migrationError } = useMigrations(db, migrations);
  
  // フォントの読み込み
  const [fontsLoaded, fontError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    // ベクターアイコンフォントを追加
    Feather: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
    Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      console.log('フォントの読み込みが完了しました');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontError) {
      console.error('フォントの読み込みエラー:', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded) {
    return null;
  }

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TamaguiProvider>
  );
}
