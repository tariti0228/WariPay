/**
 * 割り勘計算ユーティリティ
 * 提供されたアルゴリズムに基づいて最適な清算方法を計算します
 */

export interface PaymentHistory {
  amount: number;
  payer: string;
  involves: string[];
}

export interface ParticipantBalance {
  name: string;
  balance: number;
  consumption: number;
}

export interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
}

/**
 * 支払い履歴から各参加者の収支を計算
 */
export function calculateBalanceSheet(history: PaymentHistory[]): Map<string, ParticipantBalance> {
  const init = { balance: 0, consumption: 0 };
  
  // Map.prototype.fetch を模倣する関数
  const fetchParticipant = (data: Map<string, ParticipantBalance>, id: string): ParticipantBalance => {
    if (!data.has(id)) {
      data.set(id, { name: id, ...init });
    }
    return data.get(id)!;
  };

  const data = new Map<string, ParticipantBalance>();

  for (const { payer, amount, involves } of history) {
    const record = fetchParticipant(data, payer);
    record.balance += amount;
    
    const debt = Math.ceil(amount / involves.length);
    // 実際の支払者は端数による追加債務を負わない
    const payerDebt = amount - debt * (involves.length - 1);
    
    for (const debtor of involves) {
      const debtorRecord = fetchParticipant(data, debtor);
      const cost = Math.round(amount / involves.length);
      debtorRecord.balance -= cost;
      debtorRecord.consumption += cost;
    }
  }

  return data;
}

/**
 * 収支データから最適な送金表を計算
 */
export function calculateTransactionTable(balanceData: Map<string, ParticipantBalance>): Transaction[] {
  const transaction: Transaction[] = [];
  
  // 収支データをコピーして操作用に準備
  const workingData = new Map<string, ParticipantBalance>();
  for (const [key, value] of balanceData) {
    workingData.set(key, { ...value });
  }
  
  while (true) {
    let paidTooMuch: ParticipantBalance | null = null;
    let paidLess: ParticipantBalance | null = null;
    
    // 最大債権者と最大債務者を見つける
    for (const [_, tbl] of workingData) {
      if (tbl.balance >= (paidTooMuch?.balance || 0)) {
        paidTooMuch = tbl;
      }
      if (tbl.balance <= (paidLess?.balance || 0)) {
        paidLess = tbl;
      }
    }
    
    // 清算完了の条件をチェック
    if (!paidLess || !paidTooMuch || paidLess.balance === 0 || paidTooMuch.balance === 0) {
      break;
    }
    
    const amount = Math.min(paidTooMuch.balance, Math.abs(paidLess.balance));
    
    transaction.push({
      sender: paidLess.name,
      receiver: paidTooMuch.name,
      amount,
    });
    
    paidTooMuch.balance -= amount;
    paidLess.balance += amount;
  }
  
  return transaction;
}

/**
 * 支払い履歴から完全な清算結果を計算
 */
export function calculateSettlement(history: PaymentHistory[]) {
  const balanceSheet = calculateBalanceSheet(history);
  const transactions = calculateTransactionTable(balanceSheet);
  
  return {
    balanceSheet,
    transactions,
    summary: {
      totalAmount: history.reduce((sum, h) => sum + h.amount, 0),
      participantCount: balanceSheet.size,
      transactionCount: transactions.length,
    }
  };
}

/**
 * WariPayのデータ形式から PaymentHistory 形式に変換
 */
export interface WariPayPayment {
  id: number;
  amount: number;
  description: string | null;
  type: string | null;
  date: number;
  payerId: number;
  eventId: number;
}

export interface WariPayParticipant {
  id: number;
  name: string;
  eventId: number;
}

export interface WariPayPaymentRecipient {
  paymentId: number;
  participantId: number;
}

export function convertWariPayDataToHistory(
  payments: WariPayPayment[],
  participants: WariPayParticipant[],
  paymentRecipients: WariPayPaymentRecipient[]
): PaymentHistory[] {
  const participantMap = new Map(participants.map(p => [p.id, p.name]));
  
  return payments.map(payment => {
    const payerName = participantMap.get(payment.payerId) || `Unknown-${payment.payerId}`;
    const recipientIds = paymentRecipients
      .filter(pr => pr.paymentId === payment.id)
      .map(pr => pr.participantId);
    
    const involves = recipientIds
      .map(id => participantMap.get(id))
      .filter((name): name is string => name !== undefined);
    
    return {
      amount: payment.amount,
      payer: payerName,
      involves: involves.length > 0 ? involves : [payerName], // 受益者が不明な場合は支払者のみ
    };
  });
}

/**
 * 清算結果をフォーマットして表示用文字列を生成
 */
export function formatSettlementReport(
  history: PaymentHistory[],
  eventName: string,
  eventDate: number
): string {
  const settlement = calculateSettlement(history);
  
  let report = `💰 ${eventName} の清算結果\n`;
  report += `📅 ${new Date(eventDate).toLocaleDateString('ja-JP')}\n`;
  report += `👥 参加者: ${settlement.summary.participantCount}人\n`;
  report += `💸 総支払額: ¥${settlement.summary.totalAmount.toLocaleString()}\n\n`;
  
  // 送金表
  if (settlement.transactions.length > 0) {
    report += `🔄 送金表:\n`;
    settlement.transactions.forEach(transaction => {
      report += `・${transaction.sender} → ${transaction.receiver}: ¥${transaction.amount.toLocaleString()}\n`;
    });
  } else {
    report += `✅ 清算が完了しています\n`;
  }
  
  // 履歴
  report += `\n📝 履歴:\n`;
  history.forEach(h => {
    if (h.involves.length === 1 && h.involves[0] !== h.payer) {
      report += `・${h.payer} が ${h.involves[0]} に ¥${h.amount.toLocaleString()} を貸した\n`;
    } else {
      report += `・${h.payer} が ${h.involves.join(', ')} の分として ¥${h.amount.toLocaleString()} を支払った\n`;
    }
  });
  
  // 実質支払総額
  report += `\n💳 実質支払総額:\n`;
  Array.from(settlement.balanceSheet.values()).forEach(participant => {
    report += `・${participant.name}: ¥${participant.consumption.toLocaleString()}\n`;
  });
  
  return report;
}