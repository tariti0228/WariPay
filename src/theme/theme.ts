import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    tabBar: {
      background: '#6366f1',
      activeTintColor: '#ffffff',
      inactiveTintColor: '#ffffff',
    },
    primary: '#6366f1',
    onSurface: '#1e293b',
    background: '#f8fafc',
    surface: '#ffffff',
  },
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    tabBar: {
      background: '#818cf8',
      activeTintColor: '#ffffff',
      inactiveTintColor: '#ffffff',
    },
    primary: '#818cf8',
    onSurface: '#f1f5f9',
    background: '#0f172a',
    surface: '#1e293b',
  },
}; 