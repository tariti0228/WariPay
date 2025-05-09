import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Appbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function PrivacyScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 0 }}>
        <Appbar.BackAction onPress={() => router.push('/(tabs)/settings')} color={theme.colors.onSurface} />
        <Appbar.Content title="プライバシーポリシー" titleStyle={{ color: theme.colors.onSurface }} />
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
          本プライバシーポリシー（以下「本ポリシー」）は、Bills-Splitアプリケーション（以下「本アプリ」）における個人情報の取り扱いについて定めるものです。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          2. 収集する情報
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本アプリでは、以下の情報を収集する場合があります：{"\n"}
          {"\n"}・ユーザーが入力した支払い情報{"\n"}
          ・アプリの利用状況に関する情報{"\n"}
          ・デバイス情報（OSバージョン、デバイスID等）
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          3. 情報の利用目的
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          収集した情報は、以下の目的で利用します：{"\n"}
          {"\n"}・本アプリの機能提供{"\n"}
          ・サービスの改善{"\n"}
          ・不正利用の防止{"\n"}
          ・お問い合わせへの対応
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          4. 情報の管理
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          収集した情報は、適切な安全管理措置を講じて保管します。また、必要な場合を除き、第三者への提供は行いません。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          5. ユーザーの権利
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          ユーザーは、自身の個人情報について、開示、訂正、利用停止等を請求する権利を有します。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          6. クッキー等の利用
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本アプリでは、サービスの改善のためにクッキー等の技術を使用する場合があります。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          7. プライバシーポリシーの変更
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
          marginBottom: 24,
        }}>
          本ポリシーは、必要に応じて変更される場合があります。変更後のポリシーは、本アプリ上で公開された時点から効力を生じます。
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold',
          color: theme.colors.onBackground,
          marginBottom: 16,
        }}>
          8. お問い合わせ
        </Text>
        <Text style={{ 
          lineHeight: 24, 
          color: theme.colors.onBackground,
        }}>
          本ポリシーに関するお問い合わせは、アプリ内の問い合わせフォームよりご連絡ください。
        </Text>
      </ScrollView>
    </View>
  );
} 