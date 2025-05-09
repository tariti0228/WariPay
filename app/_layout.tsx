import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { db } from '@/src/db';
import migrations from '@/src/db/drizzle/migrations';
import { customDarkTheme, customLightTheme } from '@/src/theme/theme';
import { ThemeContext } from '@/src/theme/types';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const theme = isDarkMode ? customDarkTheme : customLightTheme;
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'ページが見つかりません' }} />
        </Stack>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}




