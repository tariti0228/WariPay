import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
      <Tabs 
        screenOptions={{ 
          headerShown: false,
          tabBarActiveTintColor: 'red',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'カレンダー',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}
