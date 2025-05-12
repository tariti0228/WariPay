import { Stack } from 'expo-router';
import React, { useState,Suspense } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';


import { customDarkTheme, customLightTheme } from '@/src/theme/theme';
import { ThemeContext } from '@/src/theme/types';

import migrations from '@/src/db/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export const DATABASE_NAME = 'wari_pay';

export default function RootLayout() {

  const expoDb = openDatabaseSync(DATABASE_NAME);  
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? customDarkTheme : customLightTheme;
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  

  if (error) {
    console.error('Migration error:', error.message);
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
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
          <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="+not-found"
                options={{ title: 'ページが見つかりません' }}
              />
            </Stack>
          </PaperProvider>
        </ThemeContext.Provider>
      </SQLiteProvider>
    </Suspense>
  );
  
}




