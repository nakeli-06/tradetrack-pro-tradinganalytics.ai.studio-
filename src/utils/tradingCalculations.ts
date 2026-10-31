import { Trade, SummaryStats, PairStat, PeriodStat } from '../types/trade';

/**
 * Returns ISO week number and year string (e.g. "2026-W44")
 * Follows standard Monday-to-Sunday trading week
 */
export function getTradeWeekKey(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  // Adjust to nearest Thursday to get correct ISO week
  const day = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  date.setDate(date.getDate() - day + 3);
  const firstThursday = date.getTime();
  date.setMonth(0, 1);
  if (date.getDay() !== 4) {
    date.setMonth(0, 1 + ((4 - date.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - date.getTime()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Returns Year-Month string (e.g. "2026-10")
 */
export function getTradeMonthKey(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Gets start and end date of standard Monday-Sunday week for a given date
 */
export function getWeekBounds(dateInput: string | Date): { start: Date; end: Date; label: string } {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  const day = (d.getDay() + 6) % 7; // Mon = 0
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const formatShort = (dt: Date) =>
    dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return {
    start,
    end,
    label: `${formatShort(start)} - ${formatShort(end)}`,
  };
}

/**
 * Basic stats calculation for any array of trades
 */
export function calculateStats(trades: Trade[]): SummaryStats {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      breakEvens: 0,
      winRate: 0,
      grossProfits: 0,
      grossLosses: 0,
      netPnL: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  let wins = 0;
  let losses = 0;
  let breakEvens = 0;
  let grossProfits = 0;
  let grossLosses = 0;
  let largestWin = 0;
  let largestLoss = 0;

  for (const t of trades) {
    const pnl = Number(t.pnl) || 0;
    if (pnl > 0) {
      wins++;
      grossProfits += pnl;
      if (pnl > largestWin) largestWin = pnl;
    } else if (pnl < 0) {
      losses++;
      const absLoss = Math.abs(pnl);
      grossLosses += absLoss;
      if (absLoss > largestLoss) largestLoss = absLoss;
    } else {
      breakEvens++;
    }
  }

  const decisiveTrades = wins + losses;
  // Win rate calculated as wins / (wins + losses) if decisive, or wins / totalTrades
  const winRate = decisiveTrades > 0 ? (wins / decisiveTrades) * 100 : 0;
  const netPnL = grossProfits - grossLosses;
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? 99.9 : 0;
  const averageWin = wins > 0 ? grossProfits / wins : 0;
  const averageLoss = losses > 0 ? grossLosses / losses : 0;

  return {
    totalTrades: trades.length,
    wins,
    losses,
    breakEvens,
    winRate: Math.round(winRate * 10) / 10,
    grossProfits: Math.round(grossProfits * 100) / 100,
    grossLosses: Math.round(grossLosses * 100) / 100,
    netPnL: Math.round(netPnL * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    averageWin: Math.round(averageWin * 100) / 100,
    averageLoss: Math.round(averageLoss * 100) / 100,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
  };
}

/**
 * Filter trades by specified week key
 */
export function filterTradesByWeek(trades: Trade[], weekKey: string): Trade[] {
  return trades.filter((t) => getTradeWeekKey(t.date) === weekKey);
}

/**
 * Filter trades by specified month key
 */
export function filterTradesByMonth(trades: Trade[], monthKey: string): Trade[] {
  return trades.filter((t) => getTradeMonthKey(t.date) === monthKey);
}

/**
 * Filter trades by pair name (case-insensitive substring or exact match)
 */
export function filterTradesByPair(trades: Trade[], pairQuery: string): Trade[] {
  if (!pairQuery || pairQuery === 'ALL') return trades;
  const q = pairQuery.trim().toLowerCase();
  return trades.filter((t) => t.pair.toLowerCase().includes(q));
}

/**
 * Calculate pair statistics, including overall, weekly, and monthly breakdowns
 */
export function calculatePairStats(
  trades: Trade[],
  referenceDate: Date = new Date()
): PairStat[] {
  const currentWeekKey = getTradeWeekKey(referenceDate);
  const currentMonthKey = getTradeMonthKey(referenceDate);

  // Group trades by standardized pair
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const pairName = t.pair.trim();
    if (!groups.has(pairName)) {
      groups.set(pairName, []);
    }
    groups.get(pairName)!.push(t);
  }

  const result: PairStat[] = [];

  for (const [pair, pairTrades] of groups.entries()) {
    const overallStats = calculateStats(pairTrades);

    // Monthly for this pair
    const monthlyTradesList = pairTrades.filter((t) => getTradeMonthKey(t.date) === currentMonthKey);
    const monthlyStats = calculateStats(monthlyTradesList);

    // Weekly for this pair
    const weeklyTradesList = pairTrades.filter((t) => getTradeWeekKey(t.date) === currentWeekKey);
    const weeklyStats = calculateStats(weeklyTradesList);

    result.push({
      pair,
      totalTrades: overallStats.totalTrades,
      wins: overallStats.wins,
      losses: overallStats.losses,
      breakEvens: overallStats.breakEvens,
      winRate: overallStats.winRate,
      grossProfits: overallStats.grossProfits,
      grossLosses: overallStats.grossLosses,
      netPnL: overallStats.netPnL,
      profitFactor: overallStats.profitFactor,

      monthlyTrades: monthlyStats.totalTrades,
      monthlyWins: monthlyStats.wins,
      monthlyLosses: monthlyStats.losses,
      monthlyWinRate: monthlyStats.winRate,
      monthlyProfits: monthlyStats.grossProfits,
      monthlyLossesAmount: monthlyStats.grossLosses,

      weeklyTrades: weeklyStats.totalTrades,
      weeklyWins: weeklyStats.wins,
      weeklyLosses: weeklyStats.losses,
      weeklyWinRate: weeklyStats.winRate,
      weeklyProfits: weeklyStats.grossProfits,
      weeklyLossesAmount: weeklyStats.grossLosses,
    });
  }

  // Sort pairs by total trades descending
  return result.sort((a, b) => b.totalTrades - a.totalTrades);
}

/**
 * Generates weekly period breakdowns sorted chronologically
 */
export function getWeeklyBreakdown(trades: Trade[]): PeriodStat[] {
  const groups = new Map<string, Trade[]>();

  for (const t of trades) {
    const key = getTradeWeekKey(t.date);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(t);
  }

  const sortedKeys = Array.from(groups.keys()).sort();

  return sortedKeys.map((key) => {
    const periodTrades = groups.get(key)!;
    const stats = calculateStats(periodTrades);
    // Find representative date for label
    const firstTradeDate = periodTrades[0].date;
    const bounds = getWeekBounds(firstTradeDate);

    return {
      periodKey: key,
      label: `${key} (${bounds.label})`,
      tradeCount: stats.totalTrades,
      wins: stats.wins,
      losses: stats.losses,
      breakEvens: stats.breakEvens,
      winRate: stats.winRate,
      grossProfits: stats.grossProfits,
      grossLosses: stats.grossLosses,
      netPnL: stats.netPnL,
    };
  });
}

/**
 * Generates monthly period breakdowns sorted chronologically
 */
export function getMonthlyBreakdown(trades: Trade[]): PeriodStat[] {
  const groups = new Map<string, Trade[]>();

  for (const t of trades) {
    const key = getTradeMonthKey(t.date);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(t);
  }

  const sortedKeys = Array.from(groups.keys()).sort();

  return sortedKeys.map((key) => {
    const periodTrades = groups.get(key)!;
    const stats = calculateStats(periodTrades);
    const [year, month] = key.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      periodKey: key,
      label,
      tradeCount: stats.totalTrades,
      wins: stats.wins,
      losses: stats.losses,
      breakEvens: stats.breakEvens,
      winRate: stats.winRate,
      grossProfits: stats.grossProfits,
      grossLosses: stats.grossLosses,
      netPnL: stats.netPnL,
    };
  });
}
