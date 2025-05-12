import { events, participants } from '@/src/db/schema';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Share } from 'react-native';
import { Appbar, Button, Card, Chip, Divider, FAB, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import Loading from '@/src/components/Loading';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import db from '@/src/db/index';



type Event = typeof events.$inferSelect & {
  participantNames: string[];
};

type Payment = {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
};

export default function EventDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    description: '',
    amount: '',
    paidBy: '',
    participants: [] as string[],
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const result = await db
          .select()
          .from(events)
          .where(eq(events.id, Number(id)))
          .then(async (eventResult) => {
            if (!eventResult[0]) return null;

            const participantsResult = await db
              .select()
              .from(participants)
              .where(eq(participants.eventId, eventResult[0].id));

            return {
              ...eventResult[0],
              participantNames: participantsResult.map(p => p.name),
            };
          });
        setEvent(result);
      } catch (error) {
        console.error('Error loading event:', error);
        setError('イベントの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleAddPayment = () => {
    if (!newPayment.description || !newPayment.amount || !newPayment.paidBy || newPayment.participants.length === 0) {
      return;
    }

    const payment: Payment = {
      id: Date.now(),
      description: newPayment.description,
      amount: Number(newPayment.amount),
      paidBy: newPayment.paidBy,
      participants: newPayment.participants,
    };

    setPayments([...payments, payment]);
    setNewPayment({
      description: '',
      amount: '',
      paidBy: '',
      participants: [],
    });
    setShowAddPayment(false);
  };

  const calculateSettlements = () => {
    const balances: { [key: string]: number } = {};
    
    // 支払い情報から各人の収支を計算
    payments.forEach(payment => {
      const amountPerPerson = Number((payment.amount / payment.participants.length).toFixed(1));
      
      // 支払った人に金額を加算
      balances[payment.paidBy] = (balances[payment.paidBy] || 0) + payment.amount;
      
      // 参加者から金額を減算
      payment.participants.forEach(participant => {
        balances[participant] = (balances[participant] || 0) - amountPerPerson;
      });
    });

    // 支払い指示を計算
    const settlements: { from: string; to: string; amount: number }[] = [];
    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .sort((a, b) => a[1] - b[1]);
    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .sort((a, b) => b[1] - a[1]);

    debtors.forEach(([debtor, debt]) => {
      let remainingDebt = Math.abs(debt);
      for (let i = 0; i < creditors.length && remainingDebt > 0; i++) {
        const [creditor, credit] = creditors[i];
        if (credit <= 0) continue;

        const payment = Number(Math.min(remainingDebt, credit).toFixed(1));
        if (payment > 0) {
          settlements.push({
            from: debtor,
            to: creditor,
            amount: payment,
          });
          remainingDebt -= payment;
          creditors[i][1] -= payment;
        }
      }
    });

    return settlements;
  };

  const handleShare = async () => {
    if (!event) return;

    const settlements = calculateSettlements();
    const settlementText = settlements.map((settlement) => `${settlement.from} → ${settlement.to}: ${settlement.amount.toFixed(1)}円`).join('\n');

    try {
      await Share.share({
        message: `イベント: ${event.name}\n\n支払い状況:\n${settlementText}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>イベントが見つかりません</Text>
        <Button
              mode="contained"
              contentStyle={{ paddingVertical: 8 }}
              style={{ minWidth: 200 }}
              onPress={() => router.replace('/(tabs)/')}
            >
              トップに戻る
            </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 0 }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onSurface} />
        <Appbar.Content title="イベント詳細" titleStyle={{ color: theme.colors.onSurface }} />
        <Appbar.Action icon="share" onPress={handleShare} color={theme.colors.onSurface} />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ marginBottom: 16, color: theme.colors.onSurface }}>
              {event.name}
            </Text>

            {event.date && (
              <View style={{ marginBottom: 16 }}>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                  開催日
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {new Date(event.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </Text>
              </View>
            )}

            {event.tags && (
              <View style={{ marginBottom: 16 }}>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                  タグ
                </Text>
                <View style={{ 
                  backgroundColor: theme.colors.secondaryContainer,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  alignSelf: 'flex-start',
                }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                    {event.tags}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 16, color: theme.colors.onSurface }}>
              支払い状況
            </Text>

            {payments.map((payment) => (
              <View key={payment.id} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {payment.description}
                  </Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {payment.amount}円
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  支払い: {payment.paidBy}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {payment.participants.map((participant) => (
                    <Chip key={participant} mode="outlined" style={{ marginRight: 4 }}>
                      {participant}
                    </Chip>
                  ))}
                </View>
              </View>
            ))}

            <Divider style={{ marginVertical: 16 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              清算方法
            </Text>
            {calculateSettlements().map((settlement, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {settlement.from} → {settlement.to}: {settlement.amount.toFixed(1)}円
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <FAB
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.primary,
          }}
          onPress={() => setShowAddPayment(true)}
        />
      </Portal>

      <Portal>
        <Modal
          visible={showAddPayment}
          onDismiss={() => setShowAddPayment(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            margin: 20,
            borderRadius: 12,
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16, color: theme.colors.onSurface }}>
            支払いを追加
          </Text>

          <TextInput
            label="項目"
            value={newPayment.description}
            onChangeText={(text) => setNewPayment({ ...newPayment, description: text })}
            mode="outlined"
            style={{ marginBottom: 16 }}
          />

          <TextInput
            label="金額"
            value={newPayment.amount}
            onChangeText={(text) => setNewPayment({ ...newPayment, amount: text })}
            mode="outlined"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => {}}
            blurOnSubmit={true}
            style={{ marginBottom: 16 }}
          />

          <Text variant="titleSmall" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
            支払った人
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {event.participantNames.map((name) => (
              <Chip
                key={name}
                selected={newPayment.paidBy === name}
                onPress={() => setNewPayment({ ...newPayment, paidBy: name })}
                style={{ marginBottom: 8 }}
              >
                {name}
              </Chip>
            ))}
          </View>

          <Text variant="titleSmall" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
            参加者
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {event.participantNames.map((name) => (
              <Chip
                key={name}
                selected={newPayment.participants.includes(name)}
                onPress={() => {
                  const participants = newPayment.participants.includes(name)
                    ? newPayment.participants.filter(p => p !== name)
                    : [...newPayment.participants, name];
                  setNewPayment({ ...newPayment, participants });
                }}
                style={{ marginBottom: 8 }}
              >
                {name}
              </Chip>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleAddPayment}
            disabled={!newPayment.description || !newPayment.amount || !newPayment.paidBy || newPayment.participants.length === 0}
            style={{ marginTop: 8 }}
          >
            追加
          </Button>
        </Modal>
      </Portal>
    </View>
  );
} 