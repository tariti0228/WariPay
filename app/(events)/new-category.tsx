import { router } from 'expo-router';
import React, { useState } from 'react';
import { YStack, Text, XStack, Input, Button, Form } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { categoryQueries } from '@/db/queries';

export default function NewCategoryScreen() {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    try {
      // バリデーション
      if (!name.trim()) {
        alert('カテゴリ名を入力してください');
        return;
      }

      if (name.trim().length > 20) {
        alert('カテゴリ名は20文字以内で入力してください');
        return;
      }

      // カテゴリを作成
      await categoryQueries.create({
        name: name.trim(),
      });

      // ホーム画面に戻る際にリフレッシュを強制
      router.replace('/(tabs)/?needsRefresh=true');
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('カテゴリの作成に失敗しました');
    }
  };

  return (
    <YStack flex={1} backgroundColor="white">
      <SafeAreaView style={{ flex: 1 }}>
        <XStack 
          backgroundColor="white" 
          paddingHorizontal="$4" 
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="#f0f0f0"
          elevation={2}
          alignItems="center"
          justifyContent="center"
          position="relative"
          height={60}
        >
          <Button
            size="$4"
            circular
            icon={<Feather name="arrow-left" size={20} color="#1a2634" />}
            backgroundColor="#f5f5f5"
            color="#1a2634"
            onPress={() => router.back()}
            position="absolute"
            left="$4"
          />
          <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
            新しいカテゴリ
          </Text>
          <Button 
            size="$4" 
            circular 
            icon={<Feather name="save" size={20} color="#1a2634" />} 
            backgroundColor="#f5f5f5" 
            color="#1a2634"
            onPress={handleSubmit}
            position="absolute"
            right="$4"
          />
        </XStack>

        <Form onSubmit={handleSubmit} padding="$4" gap="$4">
          <YStack gap="$2">
            <Text fontSize="$4" color="#1a2634" fontWeight="600">
              カテゴリ名
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="カテゴリ名を入力"
              borderWidth={1}
              borderColor="#e0e0e0"
              borderRadius="$2"
              padding="$3"
            />
          </YStack>
        </Form>
      </SafeAreaView>
    </YStack>
  );
} 