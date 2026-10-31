export type TradeType = 'BUY' | 'SELL';
export type TradeOutcome = 'WIN' | 'LOSS' | 'BE';
export type TradeSession = 'London' | 'New York' | 'Asian' | 'Overlap' | 'Other';

export interface Trade {
  id: string;
  pair: string; // e.g. "XAU/USD (Gold)", "EUR/USD", "GBP/USD"
  type: TradeType;
  date: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  pnl: number; // positive = profit, negative = loss
  lotSize: number;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: TradeOutcome;
  session?: TradeSession;
  strategy?: string;
  notes?: string;
}

export interface SummaryStats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakEvens: number;
  winRate: number; // 0 to 100
  grossProfits: number;
  grossLosses: number; // positive number representing total lost
  netPnL: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

export interface PairStat {
  pair: string;
  totalTrades: number;
  wins: number;
  losses: number;
  breakEvens: number;
  winRate: number;
  grossProfits: number;
  grossLosses: number;
  netPnL: number;
  profitFactor: number;
  // Specific weekly and monthly stats for this pair
  monthlyTrades: number;
  monthlyWins: number;
  monthlyLosses: number;
  monthlyWinRate: number;
  monthlyProfits: number;
  monthlyLossesAmount: number;
  weeklyTrades: number;
  weeklyWins: number;
  weeklyLosses: number;
  weeklyWinRate: number;
  weeklyProfits: number;
  weeklyLossesAmount: number;
}

export interface PeriodStat {
  periodKey: string; // e.g. "2026-W44" or "2026-10"
  label: string;
  tradeCount: number;
  wins: number;
  losses: number;
  breakEvens: number;
  winRate: number;
  grossProfits: number;
  grossLosses: number;
  netPnL: number;
}
