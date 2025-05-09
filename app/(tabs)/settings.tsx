import { useThemeContext } from '@/src/theme/types';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Card, List, Switch, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  const cardStyle = {
    margin: 16,
    backgroundColor: theme.colors.surface
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>

      <View style={{ margin: 16, backgroundColor: theme.colors.surface }}>
        <Text style={{ fontSize: 40, fontWeight: 'bold', backgroundColor: theme.colors.background, color: theme.colors.onSurface }}>設定</Text> 
      </View>

      <ScrollView>
        <Card style={cardStyle}>
          <Card.Content>
            <List.Item
              title="ダークモード"
              description="画面を暗いテーマに切り替えます"
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

        <Card style={cardStyle}>
          <Card.Content>
            <List.Item
              title="プライバシーポリシー"
              left={props => <List.Icon {...props} icon="shield-lock" color={theme.colors.primary} />}
              onPress={() => router.push('/(settings)/privacy')}
              right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Card style={cardStyle}>
          <Card.Content>
            <List.Item
              title="利用規約"
              left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
              onPress={() => router.push('/(settings)/terms')}
              right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Card style={cardStyle}>
          <Card.Content>
            <List.Item
              title="アプリバージョン"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

