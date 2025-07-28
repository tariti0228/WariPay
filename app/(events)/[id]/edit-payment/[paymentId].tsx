import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { 
  YStack, 
  XStack, 
  Text, 
  Button, 
  Input,
  RadioGroup,
  Checkbox,
  Label
} from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { 
  eventQueries, 
  participantQueries, 
  paymentQueries, 
  paymentRecipientQueries
} from '@/db/queries';

type Participant = {
  id: number;
  name: string;
  eventId: number;
};

type Payment = {
  id: number;
  amount: number;
  description: string | null;
  type: string | null;
  date: number;
  payerId: number;
  eventId: number;
};

export default function EditPaymentScreen() {
  const { id, paymentId } = useLocalSearchParams<{ id: string; paymentId: string }>();
  const eventId = parseInt(id || '0');
  const paymentIdNum = parseInt(paymentId || '0');
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const participantData = await participantQueries.getByEventId(eventId);
      const paymentData = await paymentQueries.getById(paymentIdNum);
      
      setParticipants(participantData);
      
      if (paymentData.length > 0) {
        const payment = paymentData[0];
        setPaymentAmount(payment.amount.toString());
        setPaymentDescription(payment.description || '');
        setSelectedPayerId(payment.payerId.toString());
        setPaymentDate(new Date(payment.date));
        
        // Get payment recipients
        const recipients = await paymentRecipientQueries.getByPaymentId(paymentIdNum);
        setSelectedRecipients(recipients.map((r: any) => r.participantId));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId, paymentIdNum]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    try {
      // バリデーション
      if (!paymentAmount.trim()) {
        alert('金額を入力してください');
        return;
      }

      const amount = parseFloat(paymentAmount.trim());
      if (isNaN(amount) || amount <= 0) {
        alert('有効な金額を入力してください（0より大きい数値）');
        return;
      }

      if (amount > 10000000) {
        alert('金額が大きすぎます（1000万円以下で入力してください）');
        return;
      }

      if (!selectedPayerId) {
        alert('支払い者を選択してください');
        return;
      }

      if (selectedRecipients.length === 0) {
        alert('対象者を最低1人選択してください');
        return;
      }

      if (!paymentDescription.trim()) {
        alert('支払い内容を入力してください');
        return;
      }

      if (paymentDescription.trim().length > 100) {
        alert('支払い内容は100文字以内で入力してください');
        return;
      }

      // Update payment
      await paymentQueries.update(paymentIdNum, {
        amount: amount,
        description: paymentDescription.trim() || undefined,
        date: paymentDate.getTime(),
        payerId: parseInt(selectedPayerId),
      });

      // Delete existing recipients and add new ones
      await paymentRecipientQueries.deleteByPaymentId(paymentIdNum);
      
      if (selectedRecipients.length > 0) {
        await paymentRecipientQueries.createMany(
          selectedRecipients.map(recipientId => ({
            paymentId: paymentIdNum,
            participantId: recipientId,
          }))
        );
      }

      router.back();
    } catch (error) {
      console.error('Failed to update payment:', error);
      alert('支払いの更新に失敗しました');
    }
  };

  // 日付をYYYY-MM-DD形式に変換
  const formatDateForCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
            支払い編集
          </Text>
          <Button 
            size="$3" 
            circular 
            icon={<Feather name="save" size={20} color="#1a2634" />} 
            backgroundColor="#f5f5f5" 
            color="#1a2634"
            onPress={handleSave}
          />
        </XStack>

        <ScrollView>
          <YStack padding="$4" gap="$4">
            {/* 金額入力 */}
            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                金額
              </Text>
              <Input
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="金額を入力"
                keyboardType="numeric"
                returnKeyType="done"
                borderWidth={1}
                borderColor="#e0e0e0"
                borderRadius="$2"
                padding="$3"
                fontSize="$3"
              />
            </YStack>

            {/* 支払い内容 */}
            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                支払い内容
              </Text>
              <Input
                value={paymentDescription}
                onChangeText={setPaymentDescription}
                placeholder="ランチ代、交通費など"
                borderWidth={1}
                borderColor="#e0e0e0"
                borderRadius="$2"
                padding="$3"
                fontSize="$3"
              />
            </YStack>

            {/* 日付選択 */}
            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                支払い日
              </Text>
              <Input
                value={paymentDate.toLocaleDateString('ja-JP')}
                placeholder="日付を選択"
                borderWidth={1}
                borderColor="#e0e0e0"
                borderRadius="$2"
                padding="$3"
                onPressIn={() => setShowCalendar(true)}
                editable={false}
              />
              
              {showCalendar && (
                <YStack backgroundColor="white" borderRadius="$2" padding="$2">
                  <Calendar
                    onDayPress={(day) => {
                      setPaymentDate(new Date(day.timestamp));
                      setShowCalendar(false);
                    }}
                    markedDates={{
                      [formatDateForCalendar(paymentDate)]: {
                        selected: true,
                        selectedColor: '#1a2634'
                      }
                    }}
                  />
                </YStack>
              )}
            </YStack>

            {/* 支払い者選択 */}
            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                支払い者
              </Text>
              <RadioGroup 
                value={selectedPayerId} 
                onValueChange={setSelectedPayerId}
                gap="$2"
              >
                {participants.map((participant) => (
                  <XStack key={participant.id} alignItems="center" gap="$3">
                    <RadioGroup.Item value={participant.id.toString()} id={`payer-${participant.id}`}>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label 
                      htmlFor={`payer-${participant.id}`} 
                      fontSize="$3" 
                      color="#1a2634"
                      flex={1}
                    >
                      {participant.name}
                    </Label>
                  </XStack>
                ))}
              </RadioGroup>
            </YStack>

            {/* 対象者選択 */}
            <YStack gap="$2">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                対象者（複数選択可）
              </Text>
              <YStack gap="$3">
                {participants.map((participant) => (
                  <XStack key={participant.id} alignItems="center" gap="$3">
                    <Checkbox
                      id={`recipient-${participant.id}`}
                      checked={selectedRecipients.includes(participant.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecipients(prev => [...prev, participant.id]);
                        } else {
                          setSelectedRecipients(prev => prev.filter(id => id !== participant.id));
                        }
                      }}
                    >
                      <Checkbox.Indicator>
                        <Feather name="check" size={16} color="#1a2634" />
                      </Checkbox.Indicator>
                    </Checkbox>
                    <Label 
                      htmlFor={`recipient-${participant.id}`} 
                      fontSize="$3" 
                      color="#1a2634"
                      flex={1}
                    >
                      {participant.name}
                    </Label>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
} 