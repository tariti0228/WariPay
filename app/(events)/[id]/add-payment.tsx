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
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
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

export default function AddPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = parseInt(id || '0');
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const loadParticipants = async () => {
    try {
      const participantData = await participantQueries.getByEventId(eventId);
      setParticipants(participantData);
      
      // 自動的に全員を対象者として選択
      setSelectedRecipients(participantData.map(p => p.id));
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [eventId]);

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

      // 支払いを作成
      const [newPayment] = await paymentQueries.create({
        amount: amount,
        description: paymentDescription.trim() || undefined,
        type: undefined,
        date: paymentDate.getTime(),
        payerId: parseInt(selectedPayerId),
        eventId: eventId,
      });

      // 支払い受取者を追加
      if (newPayment && selectedRecipients.length > 0) {
        await paymentRecipientQueries.createMany(
          selectedRecipients.map(recipientId => ({
            paymentId: newPayment.id,
            participantId: recipientId,
          }))
        );
      }

      // 前の画面に戻る
      router.back();
    } catch (error) {
      console.error('Failed to save payment:', error);
      alert('支払いの保存に失敗しました');
    }
  };



  // 日付をYYYY-MM-DD形式に変換
  const formatDateForCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
            支払い追加
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
            <YStack gap="$2" position="relative">
              <Text fontSize="$4" color="#1a2634" fontWeight="600">
                日付
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
                      icon={<Feather name="calendar" size={20} color="#1a2634" />}
                      backgroundColor="#f5f5f5"
                      color="#1a2634"
                      onPress={() => setShowCalendar(!showCalendar)}
                    />
                  </XStack>
                  <Calendar
                    current={formatDateForCalendar(paymentDate)}
                    markedDates={{
                      [formatDateForCalendar(paymentDate)]: {
                        selected: true,
                        selectedColor: '#6366f1',
                        selectedTextColor: '#ffffff'
                      }
                    }}
                    onDayPress={(day) => {
                      console.log('Day pressed:', day);
                      setPaymentDate(new Date(day.timestamp));
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