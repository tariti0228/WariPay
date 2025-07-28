import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshControl, ScrollView as RNScrollView } from 'react-native';
import { YStack, XStack, Button, Text, ScrollView } from 'tamagui';
import { eventQueries, participantQueries, categoryQueries, eventCategoryQueries } from '@/db/queries';
import type { Event } from '@/db/schema';
import EventList from './eventlist';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function CategoryTabs() {
  const params = useLocalSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbParticipants, setDbParticipants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [eventCategories, setEventCategories] = useState<any[]>([]);
  const initialLoadComplete = useRef(false);
  const lastRefreshTime = useRef<number>(0);

  const handleRefresh = useCallback(async () => {
    try {
      console.log('Starting data refresh...');
      setRefreshing(true);
      // クエリを実行して最新データを取得
      const [events, participants, cats, eventCats] = await Promise.all([
        eventQueries.getAll(),
        participantQueries.getAll(),
        categoryQueries.getAll(),
        eventCategoryQueries.getAll()
      ]);
      
      setDbEvents(events);
      setDbParticipants(participants);
      setCategories(cats);
      setEventCategories(eventCats);
      
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // カテゴリでフィルタリングされたイベントを取得
  const getFilteredEvents = (categoryId: number | null) => {
    if (!categoryId) {
      return dbEvents || [];
    }

    const eventIdsInCategory = eventCategories
      ?.filter(ec => ec.categoryId === categoryId)
      .map(ec => ec.eventId) || [];

    return dbEvents?.filter(event => 
      eventIdsInCategory.includes(event.id)
    ) || [];
  };

  const formatEvents = (events: Event[]) => {
    return events.map((event: Event) => {
      // 各イベントの参加者数を計算
      const participantCount = dbParticipants?.filter(
        participant => participant.eventId === event.id
      ).length || 0;

      // イベントのカテゴリを取得
      const eventCats = eventCategories?.filter(ec => ec.eventId === event.id) || [];
      const eventCategoryNames = eventCats
        .map(ec => categories?.find(c => c.id === ec.categoryId)?.name)
        .filter(Boolean)
        .join(', ');

      return {
        id: event.id,
        title: event.name,
        date: new Date(event.date).toLocaleDateString('ja-JP'),
        participants: participantCount,
        categories: eventCategoryNames,
        image: event.coverImage || '@/assets/images/event_image.png'
      };
    });
  };

  const allEvents = formatEvents(getFilteredEvents(null));

  // 初回のみデータを取得
  useEffect(() => {
    console.log('CategoryTabs mounted, performing initial data fetch...');
    const initializeData = async () => {
      try {
        setRefreshing(true);
        const [events, participants, cats, eventCats] = await Promise.all([
          eventQueries.getAll(),
          participantQueries.getAll(),
          categoryQueries.getAll(),
          eventCategoryQueries.getAll()
        ]);
        
        setDbEvents(events);
        setDbParticipants(participants);
        setCategories(cats);
        setEventCategories(eventCats);
        
        console.log('Initial data load completed');
        initialLoadComplete.current = true;
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    initializeData();
  }, []);

  // URLパラメータからカテゴリIDを取得して選択状態を復元（必要に応じて）
  useEffect(() => {
    if (params.selectedCategoryId) {
      const categoryId = parseInt(params.selectedCategoryId as string);
      setSelectedCategoryId(categoryId);
    }
  }, [params.selectedCategoryId]);

  // 画面がフォーカスされた時にデータをリフレッシュ
  // 必要な場合のみリフレッシュし、短時間での重複を防ぐ
  useFocusEffect(
    useCallback(() => {
      if (!initialLoadComplete.current) {
        return;
      }
      
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime.current;
      
      // needsRefreshパラメータがある場合、またはある程度時間が経過している場合のみリフレッシュ
      const needsRefresh = params.needsRefresh === 'true';
      const shouldRefresh = needsRefresh || timeSinceLastRefresh > 30000; // 30秒以上経過している場合
      
      if (!shouldRefresh) {
        console.log('CategoryTabs focused but skipping refresh (not needed)');
        return;
      }
      
      console.log('CategoryTabs focused after initial load, refreshing data...');
      
      // データを直接取得してローディング状態を管理
      const refreshData = async () => {
        try {
          setRefreshing(true);
          lastRefreshTime.current = Date.now();
          
          const [events, participants, cats, eventCats] = await Promise.all([
            eventQueries.getAll(),
            participantQueries.getAll(),
            categoryQueries.getAll(),
            eventCategoryQueries.getAll()
          ]);
          
          setDbEvents(events);
          setDbParticipants(participants);
          setCategories(cats);
          setEventCategories(eventCats);
          
          console.log('Data refresh completed');
          
          // needsRefreshパラメータをクリア
          if (needsRefresh) {
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('Failed to refresh data:', error);
        } finally {
          setRefreshing(false);
        }
      };
      
      refreshData();
    }, [params.needsRefresh])
  );

  const handleAddCategory = () => {
    router.push('/(events)/new-category');
  };

  const handleAddEvent = () => {
    console.log('FAB pressed, navigating to new event screen...');
    const params = selectedCategoryId ? { categoryId: selectedCategoryId.toString() } : {};
    router.push({
      pathname: '/(events)/new-event',
      params
    });
  };

  return (
    <YStack flex={1} backgroundColor="white"  position="relative">
      {/* カテゴリタブ（固定ヘッダー） */}
      <YStack 
        backgroundColor="white" 
        borderBottomWidth={1}
        borderBottomColor="#f0f0f0"
        paddingBottom="$2"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" padding="$4" paddingBottom="$2">
            <Button
              size="$3"
              backgroundColor={selectedCategoryId === null ? "#1a2634" : "#f5f5f5"}
              color={selectedCategoryId === null ? "white" : "#1a2634"}
              onPress={() => setSelectedCategoryId(null)}
              borderRadius="$4"
              paddingHorizontal="$3"
            >
              すべて
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                size="$3"
                backgroundColor={selectedCategoryId === category.id ? "#1a2634" : "#f5f5f5"}
                color={selectedCategoryId === category.id ? "white" : "#1a2634"}
                onPress={() => setSelectedCategoryId(category.id)}
                borderRadius="$4"
                paddingHorizontal="$3"
              >
                {category.name}
              </Button>
            ))}
            <Button
              size="$3"
              backgroundColor="#f5f5f5"
              color="#1a2634"
              onPress={handleAddCategory}
              borderRadius="$4"
              paddingHorizontal="$3"
              icon={<Feather name="plus" size={16} color="#1a2634" />}
            >
              カテゴリ追加
            </Button>
          </XStack>
        </ScrollView>
      </YStack>

      {/* イベントリスト（スクロール可能） */}
      <YStack flex={1}>
        <RNScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <EventList 
            events={selectedCategoryId ? formatEvents(getFilteredEvents(selectedCategoryId)) : allEvents}
          />
        </RNScrollView>
      </YStack>

      {/* FAB（Floating Action Button） */}
      <Button
        size="$6"
        circular
        icon={<Feather name="plus" size={24} color="white" />}
        backgroundColor="#1a2634"
        color="white"
        onPress={handleAddEvent}
        position="absolute"
        bottom="$4"
        right="$4"
        zIndex={1000}
        elevation={8}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
      />


    </YStack>
  );
} 