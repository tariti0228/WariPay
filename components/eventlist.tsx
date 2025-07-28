import React from 'react'
import { Text, YStack, XStack, Image, Card } from 'tamagui'
import { router } from 'expo-router'

export type Event = {
  id: number
  participants: number
  date: string
  title: string
  image: string
  categories?: string
}

type EventListProps = {
  events: Event[]
  onAddEvent?: () => void
}

export default function EventList({ events, onAddEvent }: EventListProps) {
  const handleEventPress = (eventId: number) => {
    router.push(`/(events)/${eventId}`)
  }

  return (
    <YStack backgroundColor="white" padding="$3" gap="$3">
      {/* イベントリスト */}
      {events.map((event) => (
        <Card
          key={event.id}
          elevate
          bordered
          backgroundColor="white"
          marginVertical="$1"
          padding="$2"
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
          onPress={() => handleEventPress(event.id)}
          animation="quick"
        >
          <XStack alignItems="center" gap="$3">
            <Image
              source={event.image.startsWith('@/') ? require('@/assets/images/event_image.png') : { uri: event.image }}
              width={70}
              height={70}
              borderRadius={12}
              objectFit="cover"
            />
            <YStack flex={1}>
              <Text color="#1a2634" fontSize="$4" fontWeight="500" marginBottom="$1">
                {event.title}
              </Text>
              <Text color="#666" fontSize="$2" marginBottom="$1">
                {event.date}
              </Text>
              <Text color="#666" fontSize="$2" marginBottom="$1">
                {event.participants}人が参加
              </Text>
            </YStack>
          </XStack>
        </Card>
      ))}
      
      {/* イベントがない場合のメッセージ */}
      {events.length === 0 && (
        <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
          <Text color="#666" fontSize="$3" textAlign="center">
            イベントがありません
          </Text>
        </YStack>
      )}
    </YStack>
  )
}
