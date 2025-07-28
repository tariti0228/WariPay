import React, { useState } from 'react';
import { YStack, Text, XStack, Input, Button, Form, TextArea, ScrollView, Image, Popover, Adapt, Sheet } from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { eventQueries, participantQueries, eventCategoryQueries } from '@/db/queries';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

type Participant = {
  id: string;
  name: string;
};

// 日本語ロケール設定
LocaleConfig.locales['ja'] = {
  monthNames: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'ja';

export default function EventScreen() {
  const params = useLocalSearchParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
  
  console.log('EventScreen render:', { categoryId });
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [participantList, setParticipantList] = useState<Participant[]>([
    { id: '1', name: '' }
  ]);

  const handleSubmit = async () => {
    try {
      console.log('Submitting event:', { name, coverImage, date, categoryId, participants: participantList });
      
      // バリデーション
      if (!name.trim()) {
        alert('イベント名を入力してください');
        return;
      }

      if (name.trim().length > 50) {
        alert('イベント名は50文字以内で入力してください');
        return;
      }

      // 参加者のバリデーション
      const validParticipants = participantList.filter(p => p.name.trim() !== '');
      if (validParticipants.length < 2) {
        alert('参加者を2人以上入力してください');
        return;
      }

      // 参加者名の長さチェック
      const longNames = validParticipants.filter(p => p.name.trim().length > 20);
      if (longNames.length > 0) {
        alert('参加者名は20文字以内で入力してください');
        return;
      }

      // 参加者名の重複チェック
      const participantNames = validParticipants.map(p => p.name.trim().toLowerCase());
      const uniqueNames = [...new Set(participantNames)];
      if (participantNames.length !== uniqueNames.length) {
        alert('参加者名が重複しています。異なる名前を入力してください。');
        return;
      }

      // イベントを作成
      console.log('Creating event...');
      const [newEvent] = await eventQueries.create({
        name: name.trim(),
        coverImage: coverImage.trim() || '@/assets/images/event_image.png',
        date: date.getTime(),
      });

      console.log('Event created:', newEvent);

      if (newEvent) {
        // カテゴリIDが指定されている場合は関連付け
        if (categoryId) {
          console.log('Linking to category:', categoryId);
          await eventCategoryQueries.create({
            eventId: newEvent.id,
            categoryId: categoryId
          });
        }

        // 参加者を追加（既にバリデーション済みの validParticipants を使用）
        if (validParticipants.length > 0) {
          console.log('Adding participants:', validParticipants);
          await participantQueries.createMany(
            validParticipants.map(p => ({
              name: p.name.trim(),
              eventId: newEvent.id
            }))
          );
        }
      }

      console.log('Event creation completed successfully');
      // フォームをリセット
      resetForm();
      // データ更新フラグを付けて画面を戻る
      router.replace('/(tabs)/?needsRefresh=true');
    } catch (error: any) {
      console.error('Failed to create event:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error?.message || String(error);
      alert(`イベントの作成に失敗しました: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setName('');
    setCoverImage('');
    setDate(new Date());
    setParticipantList([{ id: '1', name: '' }]);
  };

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  // 日付をYYYY-MM-DD形式に変換
  const formatDateForCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const handleBack = () => {
    resetForm();
    router.back();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('画像の選択に失敗しました');
    }
  };

  const resetToDefault = () => {
    setCoverImage('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <YStack flex={1} backgroundColor="white">
        {/* ヘッダー */}
        <XStack 
          alignItems="center" 
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="#f0f0f0"
          backgroundColor="white"
        >
        <Button
          size="$3"
          circular
          icon={<Feather name="arrow-left" size={20} color="#1a2634" />}
          backgroundColor="#f5f5f5"
          color="#1a2634"
          onPress={handleBack}
        />
        <Text fontSize="$5" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
          新規イベント
        </Text>
        <Button 
          size="$3" 
          circular 
          icon={<Feather name="save" size={20} color="#1a2634" />} 
          backgroundColor="#f5f5f5" 
          color="#1a2634"
          onPress={handleSubmit}
        />
      </XStack>

      {/* フォーム */}
      <ScrollView flex={1} padding="$4">
        <Form onSubmit={handleSubmit} gap="$4">
          <YStack gap="$2">
            <Text fontSize="$4" color="#1a2634" fontWeight="600">
              イベント名とカバー画像
            </Text>
            <XStack gap="$3" alignItems="flex-end">
              <YStack position="relative">
                <Button
                  size="$6"
                  backgroundColor="#f5f5f5"
                  borderWidth={1}
                  borderColor="#e0e0e0"
                  borderRadius="$2"
                  onPress={pickImage}
                  padding="$0"
                  width={80}
                  height={80}
                >
                  {coverImage ? (
                    <Image
                      source={{ uri: coverImage }}
                      width={80}
                      height={80}
                      borderRadius="$2"
                      objectFit="cover"
                    />
                  ) : (
                    <YStack alignItems="center" justifyContent="center" gap="$1">
                      <Feather name="camera" size={20} color="#666" />
                      <Text fontSize="$1" color="#666">
                        画像選択
                      </Text>
                    </YStack>
                  )}
                </Button>
                {coverImage && (
                  <Button
                    size="$2"
                    circular
                    backgroundColor="rgba(0,0,0,0.6)"
                    color="white"
                    position="absolute"
                    top={-5}
                    right={-5}
                    zIndex={10}
                    onPress={resetToDefault}
                    icon={<Feather name="x" size={20} color="white" />}
                    width={24}
                    height={24}
                  />
                )}
              </YStack>
              <Input
                flex={1}
                value={name}
                onChangeText={setName}
                placeholder="イベント名を入力"
                borderWidth={1}
                borderColor="#e0e0e0"
                borderRadius="$2"
                padding="$3"
              />
            </XStack>
          </YStack>

          <YStack gap="$2" position="relative">
            <Text fontSize="$4" color="#1a2634" fontWeight="600">
              日付
            </Text>
            <Input
              value={date.toLocaleDateString('ja-JP')}
              placeholder="日付を選択"
              borderWidth={1}
              borderColor="#e0e0e0"
              borderRadius="$2"
              padding="$3"
              onPressIn={() => setShowCalendar(true)}
              editable={false}
            />
            {showCalendar && (
              <YStack 
                backgroundColor="white" 
                borderRadius="$2" 
                padding="$3" 
                borderWidth={1} 
                borderColor="#e0e0e0"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.25}
                shadowRadius={3.84}
                elevation={5}
                marginTop="$2"
              >
                <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                  <Text fontSize="$4" color="#1a2634" fontWeight="600">
                    日付を選択
                  </Text>
                  <Button
                    size="$3"
                    circular
                    icon={<Feather name="x" size={20} color="#1a2634" />}
                    backgroundColor="#f5f5f5"
                    color="#1a2634"
                    onPress={() => setShowCalendar(false)}
                  />
                </XStack>
                <Calendar
                  current={formatDateForCalendar(date)}
                  markedDates={{
                    [formatDateForCalendar(date)]: {
                      selected: true,
                      selectedColor: '#6366f1',
                      selectedTextColor: '#ffffff'
                    }
                  }}
                  onDayPress={(day) => {
                    console.log('Day pressed:', day);
                    setDate(new Date(day.timestamp));
                    setShowCalendar(false);
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#6366f1',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#6366f1',
                    dayTextColor: '#374151',
                    textDisabledColor: '#d1d5db',
                    arrowColor: '#6366f1',
                    monthTextColor: '#111827'
                  }}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 8,
                    paddingVertical: 16,
                  }}
                  hideExtraDays={true}
                  firstDay={1}
                  enableSwipeMonths={true}
                />
              </YStack>
            )}
          </YStack>

          <YStack gap="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                参加者
              </Text>
              <Button
                size="$3"
                circular
                icon={<Feather name="plus" size={20} color="#1a2634" />}
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
                  placeholder={`参加者の名前を入力`}
                  borderWidth={1}
                  borderColor="#e0e0e0"
                  borderRadius="$2"
                  padding="$3"
                />
                {participantList.length > 1 && (
                  <Button
                    size="$3"
                    circular
                    icon={<Feather name="x" size={16} color="#1a2634" />}
                    backgroundColor="#f5f5f5"
                    color="#1a2634"
                    onPress={() => removeParticipant(participant.id)}
                  />
                )}
              </XStack>
            ))}
          </YStack>
        </Form>
      </ScrollView>
      </YStack>
    </SafeAreaView>
  );
} 