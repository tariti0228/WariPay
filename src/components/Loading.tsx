import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const Loading = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export default Loading; 