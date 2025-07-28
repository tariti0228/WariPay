import { router } from 'expo-router';
import React, { useState } from 'react';
import { YStack, Text, XStack, Input, Button, Form, TextArea } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Plus, X } from '@tamagui/lucide-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { eventQueries, participantQueries } from '@/db/queries';

type Participant = {
  id: string;
  name: string;
};

export default function NewEventScreen() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [tags, setTags] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [participantList, setParticipantList] = useState<Participant[]>([
    { id: '1', name: '' }
  ]);

  const handleSubmit = async () => {
    try {
      // イベントを作成
      const [newEvent] = await eventQueries.create({
        name,
        date: date.getTime(),
        tags: tags || null,
      });

      // 参加者を追加
      if (newEvent) {
        await participantQueries.createMany(
          participantList
            .filter(p => p.name.trim() !== '')
            .map(p => ({
              name: p.name,
              eventId: newEvent.id
            }))
        );
      }

      // ホーム画面に戻る際にリフレッシュを強制
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to create event:', error);
      // TODO: エラー処理を実装
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const addParticipant = () => {
    setParticipantList([
      ...participantList,
      { id: Date.now().toString(), name: '' }
    ]);
  };

  const removeParticipant = (id: string) => {
    setParticipantList(participantList.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, name: string) => {
    setParticipantList(participantList.map(p => 
      p.id === id ? { ...p, name } : p
    ));
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
            icon={ArrowLeft}
            backgroundColor="#f5f5f5"
            color="#1a2634"
            onPress={() => router.back()}
            position="absolute"
            left="$4"
          />
          <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
            新規イベント
          </Text>
          <Button 
            size="$4" 
            circular 
            icon={Save} 
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
              イベント名
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="イベント名を入力"
              borderWidth={1}
              borderColor="#e0e0e0"
              borderRadius="$2"
              padding="$3"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$4" color="#1a2634" fontWeight="600">
              日付
            </Text>
            <Button
              onPress={() => setShowDatePicker(true)}
              backgroundColor="#f5f5f5"
              borderWidth={1}
              borderColor="#e0e0e0"
              borderRadius="$2"
              padding="$3"
            >
              <Text color="#1a2634">
                {date.toLocaleDateString('ja-JP')}
              </Text>
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$4" color="#1a2634" fontWeight="600">
              タグ（カンマ区切り）
            </Text>
            <TextArea
              value={tags}
              onChangeText={setTags}
              placeholder="タグをカンマ区切りで入力"
              borderWidth={1}
              borderColor="#e0e0e0"
              borderRadius="$2"
              padding="$3"
              numberOfLines={3}
            />
          </YStack>

          <YStack gap="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                参加者
              </Text>
              <Button
                size="$3"
                circular
                icon={Plus}
                backgroundColor="#f5f5f5"
                color="#1a2634"
                onPress={addParticipant}
              />
            </XStack>
            {participantList.map((participant, index) => (
              <XStack key={participant.id} gap="$2" alignItems="center">
                <Input
                  flex={1}
                  value={participant.name}
                  onChangeText={(text) => updateParticipant(participant.id, text)}
                  placeholder={`参加者${index + 1}の名前`}
                  borderWidth={1}
                  borderColor="#e0e0e0"
                  borderRadius="$2"
                  padding="$3"
                />
                {participantList.length > 1 && (
                  <Button
                    size="$3"
                    circular
                    icon={X}
                    backgroundColor="#f5f5f5"
                    color="#1a2634"
                    onPress={() => removeParticipant(participant.id)}
                  />
                )}
              </XStack>
            ))}
          </YStack>
        </Form>
      </SafeAreaView>
    </YStack>
  );
}