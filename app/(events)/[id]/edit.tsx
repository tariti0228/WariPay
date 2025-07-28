import React, { useState, useEffect } from 'react';
import { YStack, Text, XStack, Input, Button, Form, ScrollView, Image } from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { eventQueries, participantQueries, categoryQueries, eventCategoryQueries } from '@/db/queries';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

type Participant = {
  id: number;
  name: string;
  eventId: number;
};

type Event = {
  id: number;
  name: string;
  date: number;
  coverImage: string | null;
};

type Category = {
  id: number;
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

export default function EventEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = parseInt(id || '0');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [participantList, setParticipantList] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventData, participantData, categoryData, eventCategoryData] = await Promise.all([
        eventQueries.getById(eventId),
        participantQueries.getByEventId(eventId),
        categoryQueries.getAll(),
        categoryQueries.getByEventId(eventId)
      ]);

      if (eventData.length > 0) {
        const eventInfo = eventData[0];
        setEvent(eventInfo);
        setName(eventInfo.name);
        setCoverImage(eventInfo.coverImage || '');
        setDate(new Date(eventInfo.date));
      }

      setParticipantList(participantData);
      setCategories(categoryData);
      
      // 現在のカテゴリを設定
      if (eventCategoryData.length > 0) {
        setSelectedCategoryId(eventCategoryData[0].category.id);
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
      alert('イベントデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const handleSubmit = async () => {
    try {
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

      // イベントを更新
      await eventQueries.update(eventId, {
        name: name.trim(),
        coverImage: coverImage.trim() || '@/assets/images/event_image.png',
        date: date.getTime(),
      });

      // カテゴリの関連付けを更新
      // 既存のカテゴリ関連を削除
      await eventCategoryQueries.deleteByEventId(eventId);
      // 新しいカテゴリが選択されている場合は関連付け
      if (selectedCategoryId) {
        await eventCategoryQueries.create({
          eventId: eventId,
          categoryId: selectedCategoryId
        });
      }

      // 既存の参加者を取得
      const existingParticipants = await participantQueries.getByEventId(eventId);
      
      // 新しい参加者を追加
      const newParticipants = participantList.filter(p => 
        !p.id && p.name.trim() !== ''
      );
      
      if (newParticipants.length > 0) {
        await participantQueries.createMany(
          newParticipants.map(p => ({
            name: p.name,
            eventId: eventId
          }))
        );
      }

      // 既存の参加者を更新
      const updatedParticipants = participantList.filter(p => p.id);
      for (const participant of updatedParticipants) {
        if (participant.name.trim() !== '') {
          await participantQueries.update(participant.id, {
            name: participant.name.trim()
          });
        }
      }

      console.log('Event updated successfully');
      router.replace('/(tabs)/?needsRefresh=true');
    } catch (error: any) {
      console.error('Failed to update event:', error);
      const errorMessage = error?.message || String(error);
      alert(`イベントの更新に失敗しました: ${errorMessage}`);
    }
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
      { id: 0, name: '', eventId: eventId }
    ]);
  };

  const removeParticipant = (index: number) => {
    const newList = [...participantList];
    newList.splice(index, 1);
    setParticipantList(newList);
  };

  const updateParticipant = (index: number, name: string) => {
    const newList = [...participantList];
    newList[index] = { ...newList[index], name };
    setParticipantList(newList);
  };

  const handleBack = () => {
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

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return 'カテゴリを選択';
    const category = categories.find(c => c.id === selectedCategoryId);
    return category ? category.name : 'カテゴリを選択';
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>読み込み中...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

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
            イベント編集
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
                        source={coverImage.startsWith('@/') ? 
                          require('@/assets/images/event_image.png') : 
                          { uri: coverImage }
                        }
                        width={80}
                        height={80}
                        borderRadius="$2"
                        objectFit="cover"
                      />
                    ) : (
                      <YStack alignItems="center" justifyContent="center" gap="$1">
                        <Feather name="camera" size={24} color="#666" />
                        <Text fontSize="$1" color="#666">
                          画像選択
                        </Text>
                      </YStack>
                    )}
                  </Button>
                  {coverImage && !coverImage.startsWith('@/') && (
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
                      icon={<Feather name="x" size={16} color="white" />}
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

            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                カテゴリ
              </Text>
              <YStack gap="$2">
                <Button
                  backgroundColor="#f8f9fa"
                  color="#1a2634"
                  borderWidth={1}
                  borderColor="#e0e0e0"
                  borderRadius="$2"
                  padding="$3"
                  justifyContent="space-between"
                  iconAfter={<Feather name="chevron-down" size={16} color="#1a2634" />}
                  onPress={() => setShowCategorySelector(!showCategorySelector)}
                >
                  {getSelectedCategoryName()}
                </Button>
                
                {showCategorySelector && (
                  <YStack 
                    backgroundColor="white" 
                    borderRadius="$2" 
                    padding="$2" 
                    borderWidth={1} 
                    borderColor="#e0e0e0"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.25}
                    shadowRadius={3.84}
                    elevation={5}
                    gap="$2"
                  >
                    <Button
                      size="$3"
                      backgroundColor={selectedCategoryId === null ? "#1a2634" : "#f5f5f5"}
                      color={selectedCategoryId === null ? "white" : "#1a2634"}
                      onPress={() => {
                        setSelectedCategoryId(null);
                        setShowCategorySelector(false);
                      }}
                      borderRadius="$2"
                    >
                      カテゴリなし
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        size="$3"
                        backgroundColor={selectedCategoryId === category.id ? "#1a2634" : "#f5f5f5"}
                        color={selectedCategoryId === category.id ? "white" : "#1a2634"}
                        onPress={() => {
                          setSelectedCategoryId(category.id);
                          setShowCategorySelector(false);
                        }}
                        borderRadius="$2"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </YStack>
                )}
              </YStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                日付
              </Text>
              <Button
                backgroundColor="#f8f9fa"
                color="#1a2634"
                borderWidth={1}
                borderColor="#e0e0e0"
                borderRadius="$2"
                padding="$3"
                justifyContent="flex-start"
                icon={<Feather name="calendar" size={16} color="#1a2634" />}
                onPress={() => setShowCalendar(!showCalendar)}
              >
                {date.toLocaleDateString('ja-JP')}
              </Button>
              
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
                      icon={<Feather name="x" size={16} color="#1a2634" />}
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
                        selectedColor: '#1a2634',
                        selectedTextColor: '#ffffff'
                      }
                    }}
                    onDayPress={(day) => {
                      setDate(new Date(day.timestamp));
                      setShowCalendar(false);
                    }}
                    theme={{
                      selectedDayBackgroundColor: '#1a2634',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#1a2634',
                      dayTextColor: '#374151',
                      textDisabledColor: '#d1d5db',
                      arrowColor: '#1a2634',
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
                  icon={<Feather name="plus" size={16} color="#1a2634" />}
                  backgroundColor="#f5f5f5"
                  color="#1a2634"
                  onPress={addParticipant}
                />
              </XStack>
              {participantList.map((participant, index) => (
                <XStack key={participant.id || index} gap="$2" alignItems="center">
                  <Input
                    flex={1}
                    value={participant.name}
                    onChangeText={(text) => updateParticipant(index, text)}
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
                      icon={<Feather name="x" size={16} color="#1a2634" />}
                      backgroundColor="#f5f5f5"
                      color="#1a2634"
                      onPress={() => removeParticipant(index)}
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