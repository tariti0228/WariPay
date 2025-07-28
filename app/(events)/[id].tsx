import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { YStack, Text, XStack, Image } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import { router } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eventQueries, participantQueries, paymentQueries, paymentRecipientQueries } from '@/db/queries';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = parseInt(id, 10);

  const event = useLiveQuery(eventQueries.getById(eventId));
  const eventParticipants = useLiveQuery(participantQueries.getByEventId(eventId));
  const eventPayments = useLiveQuery(paymentQueries.getByEventId(eventId));
  const paymentRecipientsData = useLiveQuery(paymentRecipientQueries.getAll());

  if (!event?.data?.[0]) {
    return (
      <YStack flex={1} backgroundColor="white" justifyContent="center" alignItems="center">
        <Text>イベントが見つかりませんでした</Text>
      </YStack>
    );
  }

  const currentEvent = event.data[0];

  // 参加者の支払い集計を計算
  const participantPayments = eventParticipants?.data?.map(participant => {
    const paidAmount = eventPayments?.data
      ?.filter(payment => payment.payerId === participant.id)
      .reduce((sum, payment) => sum + payment.amount, 0) || 0;

    const receivedAmount = eventPayments?.data
      ?.filter(payment => 
        paymentRecipientsData?.data?.some(pr => 
          pr.paymentId === payment.id && pr.participantId === participant.id
        )
      )
      .reduce((sum, payment) => sum + payment.amount, 0) || 0;

    return {
      ...participant,
      paidAmount,
      receivedAmount,
      balance: paidAmount - receivedAmount
    };
  }) || [];

  // 合計金額を計算
  const totalAmount = eventPayments?.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const perPersonAmount = totalAmount / (eventParticipants?.data?.length || 1);

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
        >
          <Button
            size="$4"
            circular
            icon={ArrowLeft}
            backgroundColor="#f5f5f5"
            color="#1a2634"
            onPress={() => router.back()}
          />
          <Text fontSize="$6" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
            イベント詳細
          </Text>
        </XStack>

        <YStack padding="$4" gap="$4">
          <YStack>
            <Text fontSize="$6" color="#1a2634" fontWeight="700">
              {currentEvent.name}
            </Text>
            <Text fontSize="$4" color="#666" marginTop="$2">
              {new Date(currentEvent.date).toLocaleDateString('ja-JP')}
            </Text>
          </YStack>

          <YStack>
            <Text fontSize="$5" color="#1a2634" fontWeight="600" marginBottom="$2">
              参加者 ({eventParticipants?.data?.length || 0}人)
            </Text>
            {participantPayments.map((participant) => (
              <YStack key={participant.id} marginBottom="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$4" color="#666">
                    {participant.name}
                  </Text>
                  <Text fontSize="$4" color={participant.balance >= 0 ? "#4CAF50" : "#F44336"}>
                    ¥{participant.balance.toLocaleString()}
                  </Text>
                </XStack>
                <Text fontSize="$3" color="#999">
                  支払い: ¥{participant.paidAmount.toLocaleString()} / 受取: ¥{participant.receivedAmount.toLocaleString()}
                </Text>
              </YStack>
            ))}
          </YStack>

          <YStack>
            <Text fontSize="$5" color="#1a2634" fontWeight="600" marginBottom="$2">
              支払い履歴
            </Text>
            {eventPayments?.data?.map((payment) => {
              const payer = eventParticipants?.data?.find(p => p.id === payment.payerId);
              const recipients = paymentRecipientsData?.data
                ?.filter(pr => pr.paymentId === payment.id)
                .map(pr => eventParticipants?.data?.find(p => p.id === pr.participantId)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <YStack key={payment.id} marginBottom="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$4" color="#666">
                      {payment.description || '支払い'}
                    </Text>
                    <Text fontSize="$4" color="#1a2634" fontWeight="500">
                      ¥{payment.amount.toLocaleString()}
                    </Text>
                  </XStack>
                  <Text fontSize="$3" color="#999">
                    支払い: {payer?.name} → 受取: {recipients}
                  </Text>
                </YStack>
              );
            })}
          </YStack>

          <YStack>
            <Text fontSize="$5" color="#1a2634" fontWeight="600" marginBottom="$2">
              集計
            </Text>
            <YStack>
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text fontSize="$4" color="#666">合計金額</Text>
                <Text fontSize="$4" color="#1a2634" fontWeight="500">
                  ¥{totalAmount.toLocaleString()}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize="$4" color="#666">1人あたり</Text>
                <Text fontSize="$4" color="#1a2634" fontWeight="500">
                  ¥{perPersonAmount.toLocaleString()}
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
} 