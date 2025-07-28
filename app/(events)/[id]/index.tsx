import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, RefreshControl, Share, Alert } from 'react-native';
import { 
  YStack, 
  XStack, 
  Text, 
  Card, 
  Button, 
  Image, 
  Separator,
  Sheet
} from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  eventQueries,
  participantQueries,
  paymentQueries,
  settlementQueries,
  paymentRecipientQueries,
  advancedSettlementQueries
} from '@/db/queries';
import {
  calculateSettlement,
  convertWariPayDataToHistory,
  formatSettlementReport,
  type Transaction
} from '@/utils/settlement';

type Event = {
  id: number;
  name: string;
  date: number;
  coverImage: string | null;
};

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

type Settlement = {
  participant: Participant;
  paidAmount: number;
  shouldPayAmount: number;
  balance: number;
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = parseInt(id || '0');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  


  const loadEventData = useCallback(async () => {
    try {
      const eventDataArray = await eventQueries.getById(eventId);
      const { payments: paymentHistory, participants: participantData } =
        await advancedSettlementQueries.getPaymentHistoryForEvent(eventId);

      if (eventDataArray.length > 0) {
        setEvent(eventDataArray[0]);
      }
      setParticipants(participantData);
      
      // 支払いデータを抽出
      const paymentData = paymentHistory.map(ph => ph.payment);
      setPayments(paymentData);
      
      // Calculate total amount
      const total = paymentData.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalAmount(total);

      // 新しい割り勘ロジックを使用して清算を計算
      if (paymentHistory.length > 0 && participantData.length > 0) {
        // WariPayデータを割り勘ロジック用の形式に変換
        const allRecipients = paymentHistory.flatMap(ph =>
          ph.recipients.map(recipientId => ({
            paymentId: ph.payment.id,
            participantId: recipientId
          }))
        );
        
        const history = convertWariPayDataToHistory(
          paymentData,
          participantData,
          allRecipients
        );
        
        const settlement = calculateSettlement(history);
        
        // 新しい送金表を設定
        setTransactions(settlement.transactions);
        
        // 既存のSettlement形式に変換（互換性のため）
        const processedSettlements = participantData.map(participant => {
          const balanceInfo = settlement.balanceSheet.get(participant.name);
          if (!balanceInfo) {
            return {
              participant,
              paidAmount: 0,
              shouldPayAmount: 0,
              balance: 0
            };
          }
          
          const paidAmount = balanceInfo.balance + balanceInfo.consumption;
          return {
            participant,
            paidAmount,
            shouldPayAmount: balanceInfo.consumption,
            balance: balanceInfo.balance
          };
        });
        
        setSettlements(processedSettlements);
      } else {
        setTransactions([]);
        setSettlements([]);
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
    }
  }, [eventId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEventData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  // 画面がフォーカスされた時にデータを再読み込み
  useFocusEffect(
    useCallback(() => {
      loadEventData();
    }, [eventId])
  );

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/(events)/${eventId}/edit`);
  };

  const handleAddPayment = () => {
    router.push(`/(events)/${eventId}/add-payment`);
  };

  const handleDeleteEvent = async () => {
    Alert.alert(
      'イベントを削除',
      'このイベントを削除しますか？全ての支払いデータも削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await eventQueries.delete(eventId);
              router.replace('/(tabs)/?forceRefresh=true');
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('エラー', 'イベントの削除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  const handleDeletePayment = async (paymentId: number) => {
    Alert.alert(
      '支払いを削除',
      'この支払いを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await paymentQueries.delete(paymentId);
              await loadEventData(); // データを再読み込み
            } catch (error) {
              console.error('Failed to delete payment:', error);
              Alert.alert('エラー', '支払いの削除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  const handleEditPayment = (paymentId: number) => {
    router.push(`/(events)/${eventId}/edit-payment/${paymentId}`);
  };

  const showEventOptions = () => {
    setShowOptionsSheet(true);
  };

  const handleShare = async () => {
    try {
      if (!event) return;

      // 新しい割り勘ロジックを使用して共有内容を生成
      const { payments: paymentHistory, participants: participantData } =
        await advancedSettlementQueries.getPaymentHistoryForEvent(eventId);
      
      if (paymentHistory.length > 0) {
        const allRecipients = paymentHistory.flatMap(ph =>
          ph.recipients.map(recipientId => ({
            paymentId: ph.payment.id,
            participantId: recipientId
          }))
        );
        
        const history = convertWariPayDataToHistory(
          paymentHistory.map(ph => ph.payment),
          participantData,
          allRecipients
        );
        
        const shareContent = formatSettlementReport(history, event.name, event.date);
        
        await Share.share({
          message: shareContent,
          title: `${event.name} の清算結果`,
        });
      } else {
        // 支払いがない場合のフォールバック
        let shareContent = `💰 ${event.name} の清算結果\n`;
        shareContent += `📅 ${formatDate(event.date)}\n`;
        shareContent += `👥 参加者: ${participants.length}人\n`;
        shareContent += `💸 総支払額: ${formatCurrency(totalAmount)}\n\n`;
        shareContent += `📝 支払いがありません\n`;
        
        await Share.share({
          message: shareContent,
          title: `${event.name} の清算結果`,
        });
      }
    } catch (error) {
      Alert.alert('エラー', '共有に失敗しました。');
      console.error('Failed to share event data:', error);
    }
  };


  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP');
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPayerName = (payerId: number) => {
    const payer = participants.find(p => p.id === payerId);
    return payer?.name || '不明';
  };




  if (!event) {
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
            icon={<Feather name="arrow-left" size={16} color="#1a2634" />}
            backgroundColor="#f5f5f5"
            color="#1a2634"
            onPress={handleBack}
          />
          <Text fontSize="$5" color="#1a2634" fontWeight="700" flex={1} textAlign="center">
            イベント詳細
          </Text>
          <Button 
            size="$3" 
            circular 
            icon={<Feather name="settings" size={16} color="#1a2634" />} 
            backgroundColor="#f5f5f5" 
            color="#1a2634"
            onPress={showEventOptions}
          />
        </XStack>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <YStack padding="$4" gap="$4">
            {/* イベント情報 */}
            <Card 
              elevate 
              bordered 
              backgroundColor="white" 
              padding="$4"
            >
              <XStack alignItems="center" gap="$3">
                <Image
                  source={event.coverImage?.startsWith('@/') ? 
                    require('@/assets/images/event_image.png') : 
                    event.coverImage ? { uri: event.coverImage } : require('@/assets/images/event_image.png')
                  }
                  width={80}
                  height={80}
                  borderRadius={12}
                  objectFit="cover"
                />
                <YStack flex={1}>
                  <Text color="#1a2634" fontSize="$5" fontWeight="600" marginBottom="$1">
                    {event.name}
                  </Text>
                  <Text color="#666" fontSize="$3" marginBottom="$1">
                    {formatDate(event.date)}
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <Feather name="user" size={16} color="#666" />
                    <Text color="#666" fontSize="$3">
                      {participants.length}人が参加
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
            </Card>

            {/* 清算セクション */}
            <Card
              elevate
              bordered
              backgroundColor="white"
              padding="$4"
            >
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
                <XStack alignItems="center" gap="$2">
                  <Feather name="dollar-sign" size={20} color="#1a2634" />
                  <Text color="#1a2634" fontSize="$4" fontWeight="600">
                    清算
                  </Text>
                </XStack>
                {settlements.length > 0 && (
                  <Button
                    size="$3"
                    backgroundColor="#1a2634"
                    color="white"
                    onPress={handleShare}
                    icon={<Feather name="share" size={16} color="white" />}
                  >
                    共有
                  </Button>
                )}
              </XStack>
              
              {/* 総額表示 */}
              <YStack marginBottom="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="#1a2634" fontSize="$4" fontWeight="600">
                    総額
                  </Text>
                  <Text color="#1a2634" fontSize="$5" fontWeight="700">
                    {formatCurrency(totalAmount)}
                  </Text>
                </XStack>
              </YStack>

              {/* 参加者別収支 */}
              {settlements.length > 0 && (
                <>
                  <Separator marginVertical="$2" />
                  <Text color="#1a2634" fontSize="$4" fontWeight="600" marginBottom="$3">
                    参加者別収支
                  </Text>
                  {settlements.map((settlement, index) => (
                    <YStack key={settlement.participant.id} marginBottom="$2">
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text color="#1a2634" fontSize="$3" fontWeight="500">
                          {settlement.participant.name}
                        </Text>
                        <Text
                          color={settlement.balance >= 0 ? "#22c55e" : "#ef4444"}
                          fontSize="$3"
                          fontWeight="600"
                        >
                          {settlement.balance >= 0 ? '+' : ''}{formatCurrency(settlement.balance)}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
                        <Text color="#666" fontSize="$2">
                          支払い: {formatCurrency(settlement.paidAmount)} / 負担: {formatCurrency(settlement.shouldPayAmount)}
                        </Text>
                      </XStack>
                      {index < settlements.length - 1 && <Separator marginVertical="$1" />}
                    </YStack>
                  ))}
                </>
              )}

              {/* 最適化された精算方法 */}
              {(() => {
                const hasUnbalancedSettlements = settlements.some(s => Math.abs(s.balance) > 0);
                
                if (settlements.length > 0 && hasUnbalancedSettlements && transactions.length > 0) {
                  return (
                    <>
                      <Separator marginVertical="$3" />
                      <XStack alignItems="center" gap="$2" marginBottom="$3">
                        <Feather name="trending-up" size={18} color="#1a2634" />
                        <Text color="#1a2634" fontSize="$4" fontWeight="600">
                          最適化された精算方法
                        </Text>
                      </XStack>
                      <Text color="#666" fontSize="$2" marginBottom="$3">
                        {transactions.length}回の送金で清算完了
                      </Text>
                      {transactions.map((transaction, index) => (
                        <Card
                          key={index}
                          backgroundColor="#f8fafc"
                          padding="$3"
                          marginBottom="$2"
                          borderWidth={1}
                          borderColor="#e2e8f0"
                        >
                          <XStack alignItems="center" justifyContent="space-between">
                            <XStack alignItems="center" gap="$2" flex={1}>
                              <Text color="#1a2634" fontSize="$3" fontWeight="500">
                                {transaction.sender}
                              </Text>
                              <Feather name="arrow-right" size={16} color="#666" />
                              <Text color="#1a2634" fontSize="$3" fontWeight="500">
                                {transaction.receiver}
                              </Text>
                            </XStack>
                            <Text color="#1a2634" fontSize="$4" fontWeight="700">
                              {formatCurrency(transaction.amount)}
                            </Text>
                          </XStack>
                        </Card>
                      ))}
                    </>
                  );
                } else if (totalAmount > 0) {
                  return (
                    <>
                      <Separator marginVertical="$2" />
                      <XStack alignItems="center" justifyContent="center" gap="$2">
                        <Feather name="check-circle" size={18} color="#22c55e" />
                        <Text color="#22c55e" fontSize="$3" fontWeight="500">
                          清算が完了しています
                        </Text>
                      </XStack>
                    </>
                  );
                } else {
                  return (
                    <>
                      <Separator marginVertical="$2" />
                      <XStack alignItems="center" justifyContent="center" gap="$2">
                        <Feather name="info" size={18} color="#666" />
                        <Text color="#666" fontSize="$3">
                          支払いがありません
                        </Text>
                      </XStack>
                    </>
                  );
                }
              })()}
            </Card>

            {/* 支払い一覧 */}
            <Card 
              elevate 
              bordered 
              backgroundColor="white" 
              padding="$4"
            >
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
                <Text color="#1a2634" fontSize="$4" fontWeight="600">
                  支払い一覧
                </Text>
                <Button 
                  size="$3" 
                  backgroundColor="#1a2634" 
                  color="white"
                  onPress={handleAddPayment}
                  icon={<Feather name="plus" size={16} color="white" />}
                >
                  支払い追加
                </Button>
              </XStack>

              
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <YStack key={payment.id} marginBottom="$3">
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1}>
                        <Text color="#1a2634" fontSize="$4" fontWeight="600" marginBottom="$1">
                          {payment.description || '支払い'}
                        </Text>
                        <XStack alignItems="center" gap="$2" marginBottom="$1">
                          <Feather name="user" size={14} color="#666" />
                          <Text color="#666" fontSize="$2">
                            {getPayerName(payment.payerId)}
                          </Text>
                        </XStack>
                        <XStack alignItems="center" gap="$2">
                          <Feather name="calendar" size={14} color="#666" />
                          <Text color="#666" fontSize="$2">
                            {formatDateTime(payment.date)}
                          </Text>
                        </XStack>
                      </YStack>
                      <YStack alignItems="flex-end" gap="$2">
                        <Text color="#1a2634" fontSize="$4" fontWeight="700">
                          {formatCurrency(payment.amount)}
                        </Text>
                        {payment.type && (
                          <Text color="#666" fontSize="$2">
                            {payment.type}
                          </Text>
                        )}
                        <XStack gap="$1">
                          <Button
                            size="$2"
                            circular
                            onPress={() => handleEditPayment(payment.id)}
                            icon={<Feather name="edit" size={12} color="white" />}
                            backgroundColor="#007AFF"
                            color="white"
                          />
                          <Button
                            size="$2"
                            circular
                            onPress={() => handleDeletePayment(payment.id)}
                            icon={<Feather name="trash-2" size={12} color="white" />}
                            backgroundColor="#ff4444"
                            color="white"
                          />
                        </XStack>
                      </YStack>
                    </XStack>
                    {index < payments.length - 1 && <Separator marginVertical="$2" />}
                  </YStack>
                ))
              ) : (
                <Text color="#666" fontSize="$3" textAlign="center">
                  支払いがありません
                </Text>
              )}
            </Card>
          </YStack>
        </ScrollView>

        {/* イベント操作メニュー */}
        <Sheet 
          modal 
          open={showOptionsSheet} 
          onOpenChange={setShowOptionsSheet}
          snapPoints={[25]}
          position={0}
          dismissOnOverlayPress
        >
          <Sheet.Overlay 
            backgroundColor="rgba(0,0,0,0.4)"
          />
          <Sheet.Frame
            backgroundColor="white"
            borderTopLeftRadius="$6"
            borderTopRightRadius="$6"
            paddingHorizontal="$4"
            paddingTop="$2"
            paddingBottom="$4"
          >
            <YStack gap="$2" paddingTop="$3">
              <Button
                size="$4"
                backgroundColor="#f9fafb"
                color="#374151"
                onPress={() => {
                  setShowOptionsSheet(false);
                  handleEdit();
                }}
                justifyContent="center"
                borderRadius="$3"
                marginBottom="$1"
              >
                <XStack alignItems="center" gap="$3">
                  <Feather name="edit" size={18} />
                  <Text fontSize="$4" fontWeight="500">イベントを編集</Text>
                </XStack>
              </Button>
              
              <Button
                size="$4"
                backgroundColor="#f9fafb"
                color="#dc2626"
                onPress={() => {
                  setShowOptionsSheet(false);
                  handleDeleteEvent();
                }}
                justifyContent="center"
                borderRadius="$3"
                marginBottom="$2"
              >
                <XStack alignItems="center" gap="$3">
                  <Feather name="trash-2" size={18} />
                  <Text fontSize="$4" fontWeight="500">イベントを削除</Text>
                </XStack>
              </Button>
              
              <Button
                size="$4"
                backgroundColor="#f3f4f6"
                color="#374151"
                onPress={() => setShowOptionsSheet(false)}
                justifyContent="center"
                borderRadius="$3"
              >
                <Text fontSize="$4" fontWeight="600">キャンセル</Text>
              </Button>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </SafeAreaView>
  );
}
