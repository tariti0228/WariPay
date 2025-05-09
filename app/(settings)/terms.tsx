import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Appbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function TermsScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 0 }}>
        <Appbar.BackAction onPress={() => router.push('/(tabs)/settings')} color={theme.colors.onSurface} />
        <Appbar.Content title="利用規約" titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ 
          fontSize: 12, 
          color: theme.colors.onSurfaceVariant,
          marginBottom: 24,
        }}>
          最終更新日：2024年3月1日
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          1. はじめに
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本利用規約（以下「本規約」）は、Bills-Splitアプリケーション（以下「本アプリ」）の利用条件を定めるものです。本アプリを利用する際には、本規約に同意していただく必要があります。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          2. 利用資格
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本アプリは、18歳以上の方が利用できます。未成年の方が利用する場合は、保護者の同意が必要です。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          3. 禁止事項
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          以下の行為を禁止します：{"\n"}
          {"\n"}・本アプリの不正利用{"\n"}
          ・他のユーザーへの迷惑行為{"\n"}
          ・本アプリの改変やリバースエンジニアリング{"\n"}
          ・法令や公序良俗に反する行為
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          4. 知的財産権
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本アプリに関する著作権、商標権、その他の知的財産権は、当社または正当な権利を有する第三者に帰属します。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          5. 免責事項
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本アプリの利用により生じた損害について、当社は一切の責任を負いません。ユーザーは自己の責任において本アプリを利用するものとします。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          6. 規約の変更
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          当社は、必要に応じて本規約を変更することがあります。変更後の規約は、本アプリ上で公開された時点から効力を生じます。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          7. 準拠法
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
        }}>
          本規約の解釈にあたっては、日本法を準拠法とします。
        </Text>
      </ScrollView>
    </View>
  );
} 