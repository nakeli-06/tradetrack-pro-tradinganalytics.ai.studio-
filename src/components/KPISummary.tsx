import React from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { SummaryStats, PeriodStat } from '../types/trade';
import { formatCurrency, formatCurrencyNeutral, formatPercent } from '../utils/formatters';

interface KPISummaryProps {
  // Weekly Metrics
  selectedWeekKey: string;
  onSelectWeekKey: (key: string) => void;
  availableWeeks: PeriodStat[];
  weeklyStats: SummaryStats;

  // Monthly Metrics
  selectedMonthKey: string;
  onSelectMonthKey: (key: string) => void;
  availableMonths: PeriodStat[];
  monthlyStats: SummaryStats;

  // Overall Stats
  overallStats: SummaryStats;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  selectedWeekKey,
  onSelectWeekKey,
  availableWeeks,
  weeklyStats,
  selectedMonthKey,
  onSelectMonthKey,
  availableMonths,
  monthlyStats,
  overallStats,
}) => {
  return (
    <section aria-label="Trading Performance Metrics" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ========================================================
            CARD 1: WEEKLY METRICS (User Request:
            Number of trades in a week, Weekly profits, Weekly losses, Win rate for a week)
           ======================================================== */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header + Week Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                    Weekly Performance
                  </h2>
                  <p className="text-xs text-slate-400">Weekly calculations & metrics</p>
                </div>
              </div>

              {/* Selector */}
              <div className="relative">
                <select
                  value={selectedWeekKey}
                  onChange={(e) => onSelectWeekKey(e.target.value)}
                  aria-label="Select week for calculation"
                  className="appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {availableWeeks.length > 0 ? (
                    availableWeeks.map((w) => (
                      <option key={w.periodKey} value={w.periodKey}>
                        {w.periodKey} ({w.tradeCount} trades)
                      </option>
                    ))
                  ) : (
                    <option value={selectedWeekKey}>
                      {selectedWeekKey} (0 trades)
                    </option>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Key Big Numbers: Weekly Trades & Weekly Win Rate */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                  <span>Weekly Trades</span>
                  <BarChart className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {weeklyStats.totalTrades}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-emerald-400 font-medium">{weeklyStats.wins}W</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-rose-400 font-medium">{weeklyStats.losses}L</span>
                  {weeklyStats.breakEvens > 0 && (
                    <span className="text-slate-400 ml-1">({weeklyStats.breakEvens} BE)</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                  <span>Weekly Win Rate</span>
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div
                  className={`text-2xl font-bold font-mono mt-1 ${
                    weeklyStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {formatPercent(weeklyStats.winRate)}
                </div>
                <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(weeklyStats.winRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Profits & Losses Breakout (Specifically Requested: Weekly profits, Weekly losses) */}
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-200">Weekly Profits</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  +{formatCurrencyNeutral(weeklyStats.grossProfits)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/30">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-medium text-rose-200">Weekly Losses</span>
                </div>
                <span className="text-sm font-bold font-mono text-rose-400">
                  -{formatCurrencyNeutral(weeklyStats.grossLosses)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Net PnL Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Weekly Net Result:</span>
            <span
              className={`font-mono font-bold text-sm ${
                weeklyStats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(weeklyStats.netPnL)}
            </span>
          </div>
        </div>

        {/* ========================================================
            CARD 2: MONTHLY METRICS (User Request:
            The number of trades taken a month, Win rate for monthly, Monthly losses, etc.)
           ======================================================== */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header + Month Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                    Monthly Performance
                  </h2>
                  <p className="text-xs text-slate-400">Monthly calculations & metrics</p>
                </div>
              </div>

              {/* Selector */}
              <div className="relative">
                <select
                  value={selectedMonthKey}
                  onChange={(e) => onSelectMonthKey(e.target.value)}
                  aria-label="Select month for calculation"
                  className="appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-slate-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {availableMonths.length > 0 ? (
                    availableMonths.map((m) => (
                      <option key={m.periodKey} value={m.periodKey}>
                        {m.label} ({m.tradeCount} trades)
                      </option>
                    ))
                  ) : (
                    <option value={selectedMonthKey}>
                      {selectedMonthKey} (0 trades)
                    </option>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Key Big Numbers: Monthly Trades & Monthly Win Rate */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                  <span>Monthly Trades</span>
                  <BarChart className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {monthlyStats.totalTrades}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-emerald-400 font-medium">{monthlyStats.wins}W</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-rose-400 font-medium">{monthlyStats.losses}L</span>
                  {monthlyStats.breakEvens > 0 && (
                    <span className="text-slate-400 ml-1">({monthlyStats.breakEvens} BE)</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                  <span>Monthly Win Rate</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div
                  className={`text-2xl font-bold font-mono mt-1 ${
                    monthlyStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {formatPercent(monthlyStats.winRate)}
                </div>
                <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(monthlyStats.winRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Profits & Losses Breakout for Month */}
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-200">Monthly Profits</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  +{formatCurrencyNeutral(monthlyStats.grossProfits)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/30">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-medium text-rose-200">Monthly Losses</span>
                </div>
                <span className="text-sm font-bold font-mono text-rose-400">
                  -{formatCurrencyNeutral(monthlyStats.grossLosses)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Net PnL Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Monthly Net Result:</span>
            <span
              className={`font-mono font-bold text-sm ${
                monthlyStats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(monthlyStats.netPnL)}
            </span>
          </div>
        </div>

        {/* ========================================================
            CARD 3: OVERALL / ACCUMULATIVE JOURNAL METRICS
           ======================================================== */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                    All-Time Overview
                  </h2>
                  <p className="text-xs text-slate-400">Accumulated trading performance</p>
                </div>
              </div>

              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Total: {overallStats.totalTrades}
              </span>
            </div>

            {/* Overall Win Rate & Net PnL */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="text-xs text-slate-400 font-medium">Net P&L</div>
                <div
                  className={`text-xl font-bold font-mono mt-1 ${
                    overallStats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(overallStats.netPnL)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  PF: <strong className="text-white font-mono">{overallStats.profitFactor}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="text-xs text-slate-400 font-medium">All-Time Win Rate</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {formatPercent(overallStats.winRate)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {overallStats.wins}W / {overallStats.losses}L
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Gross Profits</div>
                <div className="text-emerald-400 font-mono font-semibold mt-0.5">
                  +{formatCurrencyNeutral(overallStats.grossProfits)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Gross Losses</div>
                <div className="text-rose-400 font-mono font-semibold mt-0.5">
                  -{formatCurrencyNeutral(overallStats.grossLosses)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Best Win</div>
                <div className="text-emerald-300 font-mono font-semibold mt-0.5">
                  +{formatCurrencyNeutral(overallStats.largestWin)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Worst Loss</div>
                <div className="text-rose-300 font-mono font-semibold mt-0.5">
                  -{formatCurrencyNeutral(overallStats.largestLoss)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Avg Win: {formatCurrencyNeutral(overallStats.averageWin)}</span>
            <span>Avg Loss: {formatCurrencyNeutral(overallStats.averageLoss)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
