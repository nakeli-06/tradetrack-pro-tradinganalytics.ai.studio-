import test from 'node:test';
import assert from 'node:assert/strict';
import { Trade } from '../types/trade';
import {
  calculateStats,
  calculatePairStats,
  filterTradesByMonth,
  filterTradesByWeek,
  getTradeWeekKey,
  getTradeMonthKey,
  getWeeklyBreakdown,
  getMonthlyBreakdown,
} from './tradingCalculations';

const mockTrades: Trade[] = [
  // October 2026 trades
  {
    id: 't1',
    pair: 'XAU/USD (Gold)',
    type: 'BUY',
    date: '2026-10-27T10:30:00Z', // 2026-W44, 2026-10
    pnl: 450,
    lotSize: 1.0,
    status: 'WIN',
  },
  {
    id: 't2',
    pair: 'XAU/USD (Gold)',
    type: 'SELL',
    date: '2026-10-28T14:15:00Z', // 2026-W44, 2026-10
    pnl: -200,
    lotSize: 1.0,
    status: 'LOSS',
  },
  {
    id: 't3',
    pair: 'EUR/USD',
    type: 'BUY',
    date: '2026-10-29T09:00:00Z', // 2026-W44, 2026-10
    pnl: 300,
    lotSize: 2.0,
    status: 'WIN',
  },
  {
    id: 't4',
    pair: 'XAU/USD (Gold)',
    type: 'BUY',
    date: '2026-10-15T11:00:00Z', // 2026-W42, 2026-10
    pnl: 600,
    lotSize: 1.5,
    status: 'WIN',
  },
  {
    id: 't5',
    pair: 'GBP/USD',
    type: 'SELL',
    date: '2026-10-16T15:00:00Z', // 2026-W42, 2026-10
    pnl: -150,
    lotSize: 1.0,
    status: 'LOSS',
  },
  // September 2026 trade
  {
    id: 't6',
    pair: 'XAU/USD (Gold)',
    type: 'BUY',
    date: '2026-09-20T10:00:00Z', // 2026-09
    pnl: -350,
    lotSize: 1.0,
    status: 'LOSS',
  },
];

test('calculateStats correctly aggregates wins, losses, profit, and loss amounts', () => {
  const stats = calculateStats(mockTrades);
  assert.equal(stats.totalTrades, 6);
  assert.equal(stats.wins, 3);
  assert.equal(stats.losses, 3);
  assert.equal(stats.breakEvens, 0);
  assert.equal(stats.winRate, 50); // 3 out of 6 = 50%
  assert.equal(stats.grossProfits, 1350); // 450 + 300 + 600
  assert.equal(stats.grossLosses, 700); // 200 + 150 + 350
  assert.equal(stats.netPnL, 650); // 1350 - 700
  assert.equal(stats.profitFactor, 1.93); // 1350 / 700 = 1.928 -> 1.93
});

test('monthly calculations accurately isolate month trades, win rate, profits and losses', () => {
  const octTrades = filterTradesByMonth(mockTrades, '2026-10');
  assert.equal(octTrades.length, 5); // 5 trades in October 2026

  const octStats = calculateStats(octTrades);
  assert.equal(octStats.totalTrades, 5);
  assert.equal(octStats.wins, 3);
  assert.equal(octStats.losses, 2);
  assert.equal(octStats.winRate, 60); // 3 wins out of 5 trades = 60%
  assert.equal(octStats.grossProfits, 1350);
  assert.equal(octStats.grossLosses, 350); // 200 + 150
  assert.equal(octStats.netPnL, 1000);
});

test('weekly calculations accurately isolate weekly trades, win rate, weekly profits and weekly losses', () => {
  const week44Key = getTradeWeekKey('2026-10-28T00:00:00Z');
  const weekTrades = filterTradesByWeek(mockTrades, week44Key);
  assert.equal(weekTrades.length, 3); // t1 (Gold +450), t2 (Gold -200), t3 (EUR +300)

  const weekStats = calculateStats(weekTrades);
  assert.equal(weekStats.totalTrades, 3);
  assert.equal(weekStats.wins, 2);
  assert.equal(weekStats.losses, 1);
  assert.equal(weekStats.winRate, 66.7); // 2 / 3 = 66.666% -> 66.7%
  assert.equal(weekStats.grossProfits, 750); // 450 + 300
  assert.equal(weekStats.grossLosses, 200); // 200
  assert.equal(weekStats.netPnL, 550); // 750 - 200
});

test('currency pair analytics computes total trades, win rate, profits, and losses per pair (e.g. Gold)', () => {
  // Reference date in Week 44, October 2026
  const refDate = new Date('2026-10-28T12:00:00Z');
  const pairStats = calculatePairStats(mockTrades, refDate);

  // Gold should be first since it has 4 trades
  const gold = pairStats.find((p) => p.pair.includes('Gold'));
  assert.ok(gold, 'Gold pair should be calculated');
  assert.equal(gold.totalTrades, 4);
  assert.equal(gold.wins, 2);
  assert.equal(gold.losses, 2);
  assert.equal(gold.winRate, 50);
  assert.equal(gold.grossProfits, 1050); // 450 + 600
  assert.equal(gold.grossLosses, 550); // 200 + 350
  assert.equal(gold.netPnL, 500);

  // Monthly breakdown for Gold in October 2026 (t1: +450 win, t2: -200 loss, t4: +600 win)
  assert.equal(gold.monthlyTrades, 3);
  assert.equal(gold.monthlyWins, 2);
  assert.equal(gold.monthlyLosses, 1);
  assert.equal(gold.monthlyWinRate, 66.7);
  assert.equal(gold.monthlyProfits, 1050);
  assert.equal(gold.monthlyLossesAmount, 200);

  // Weekly breakdown for Gold in Week 44 (t1: +450 win, t2: -200 loss)
  assert.equal(gold.weeklyTrades, 2);
  assert.equal(gold.weeklyWins, 1);
  assert.equal(gold.weeklyLosses, 1);
  assert.equal(gold.weeklyWinRate, 50);
  assert.equal(gold.weeklyProfits, 450);
  assert.equal(gold.weeklyLossesAmount, 200);
});

test('getWeeklyBreakdown and getMonthlyBreakdown group all periods without error', () => {
  const weekly = getWeeklyBreakdown(mockTrades);
  assert.ok(weekly.length >= 2);

  const monthly = getMonthlyBreakdown(mockTrades);
  assert.equal(monthly.length, 2); // 2026-09 and 2026-10
  assert.equal(monthly[0].periodKey, '2026-09');
  assert.equal(monthly[1].periodKey, '2026-10');
});
