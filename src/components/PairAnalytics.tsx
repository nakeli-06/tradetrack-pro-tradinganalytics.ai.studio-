import React, { useState } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PairStat } from '../types/trade';
import { formatCurrency, formatCurrencyNeutral, formatPercent } from '../utils/formatters';

interface PairAnalyticsProps {
  pairStats: PairStat[];
  activePairFilter: string;
  onSelectPairFilter: (pair: string) => void;
}

export const PairAnalytics: React.FC<PairAnalyticsProps> = ({
  pairStats,
  activePairFilter,
  onSelectPairFilter,
}) => {
  const [viewScope, setViewScope] = useState<'overall' | 'month' | 'week'>('overall');

  // Identify Gold specifically as requested by the user, with zeroed initial state
  const rawGoldStat = pairStats.find(
    (p) =>
      p.pair.toLowerCase().includes('gold') ||
      p.pair.toUpperCase().includes('XAU')
  );

  const goldStat: PairStat = rawGoldStat || {
    pair: 'XAU/USD (Gold)',
    totalTrades: 0,
    wins: 0,
    losses: 0,
    breakEvens: 0,
    winRate: 0,
    grossProfits: 0,
    grossLosses: 0,
    netPnL: 0,
    profitFactor: 0,
    monthlyTrades: 0,
    monthlyWins: 0,
    monthlyLosses: 0,
    monthlyWinRate: 0,
    monthlyProfits: 0,
    monthlyLossesAmount: 0,
    weeklyTrades: 0,
    weeklyWins: 0,
    weeklyLosses: 0,
    weeklyWinRate: 0,
    weeklyProfits: 0,
    weeklyLossesAmount: 0,
  };

  return (
    <section aria-label="Currency Pair Performance" className="space-y-4">
      {/* Section Header with View Scope Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Currency Pair & Instrument Analytics
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Gold & FX Breakdown
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Trade counts, win rates, profits, and losses calculated per individual currency pair.
          </p>
        </div>

        {/* Scope Selector: Overall, This Month, This Week */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewScope('overall')}
            aria-pressed={viewScope === 'overall'}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewScope === 'overall'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => setViewScope('month')}
            aria-pressed={viewScope === 'month'}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewScope === 'month'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setViewScope('week')}
            aria-pressed={viewScope === 'week'}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewScope === 'week'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* FEATURED GOLD SPOTLIGHT CARD (Specifically highlighted in user prompt) */}
      {goldStat && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-slate-900 p-5 shadow-xl shadow-amber-950/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Gold Badge and Primary Numbers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/40">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Featured Asset: {goldStat.pair}
                </span>
                <span className="text-xs text-slate-400">
                  {viewScope === 'week'
                    ? 'Current Week'
                    : viewScope === 'month'
                    ? 'Current Month'
                    : 'All Time'}{' '}
                  Statistics
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <div>
                  <span className="text-xs text-slate-400">Trades Taken:</span>
                  <span className="ml-1.5 text-2xl font-black font-mono text-white">
                    {viewScope === 'week'
                      ? goldStat.weeklyTrades
                      : viewScope === 'month'
                      ? goldStat.monthlyTrades
                      : goldStat.totalTrades}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                <div>
                  <span className="text-xs text-slate-400">Win Rate:</span>
                  <span className="ml-1.5 text-2xl font-black font-mono text-emerald-400">
                    {formatPercent(
                      viewScope === 'week'
                        ? goldStat.weeklyWinRate
                        : viewScope === 'month'
                        ? goldStat.monthlyWinRate
                        : goldStat.winRate
                    )}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                <div>
                  <span className="text-xs text-slate-400">Gold Net P&L:</span>
                  <span
                    className={`ml-1.5 text-2xl font-black font-mono ${
                      (viewScope === 'week'
                        ? goldStat.weeklyProfits - goldStat.weeklyLossesAmount
                        : viewScope === 'month'
                        ? goldStat.monthlyProfits - goldStat.monthlyLossesAmount
                        : goldStat.netPnL) >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(
                      viewScope === 'week'
                        ? goldStat.weeklyProfits - goldStat.weeklyLossesAmount
                        : viewScope === 'month'
                        ? goldStat.monthlyProfits - goldStat.monthlyLossesAmount
                        : goldStat.netPnL
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Gold Profit & Loss Breakdown + Quick Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 min-w-[130px]">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Profits
                </div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  +
                  {formatCurrencyNeutral(
                    viewScope === 'week'
                      ? goldStat.weeklyProfits
                      : viewScope === 'month'
                      ? goldStat.monthlyProfits
                      : goldStat.grossProfits
                  )}
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 min-w-[130px]">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-400" /> Losses
                </div>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  -
                  {formatCurrencyNeutral(
                    viewScope === 'week'
                      ? goldStat.weeklyLossesAmount
                      : viewScope === 'month'
                      ? goldStat.monthlyLossesAmount
                      : goldStat.grossLosses
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPairFilter(goldStat.pair)}
                aria-label="Filter journal to show only Gold trades"
                className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activePairFilter === goldStat.pair
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {activePairFilter === goldStat.pair ? 'Filtering Gold' : 'Filter Gold Trades'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL CURRENCY PAIRS TABLE / CARDS */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            All Monitored Pairs ({pairStats.length} Instruments)
          </span>
          {activePairFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectPairFilter('ALL')}
              className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Clear Pair Filter ({activePairFilter})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Currency Pair</th>
                <th className="py-3 px-4">Trades Taken</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Profits</th>
                <th className="py-3 px-4">Losses</th>
                <th className="py-3 px-4">Net P&L</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
              {pairStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    <p className="text-sm text-slate-300">No currency pairs recorded yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your trades to calculate pair-by-pair win rates, profits, and losses.
                    </p>
                  </td>
                </tr>
              ) : (
                pairStats.map((p) => {
                const count =
                  viewScope === 'week'
                    ? p.weeklyTrades
                    : viewScope === 'month'
                    ? p.monthlyTrades
                    : p.totalTrades;

                const winRate =
                  viewScope === 'week'
                    ? p.weeklyWinRate
                    : viewScope === 'month'
                    ? p.monthlyWinRate
                    : p.winRate;

                const profits =
                  viewScope === 'week'
                    ? p.weeklyProfits
                    : viewScope === 'month'
                    ? p.monthlyProfits
                    : p.grossProfits;

                const losses =
                  viewScope === 'week'
                    ? p.weeklyLossesAmount
                    : viewScope === 'month'
                    ? p.monthlyLossesAmount
                    : p.grossLosses;

                const net = profits - losses;
                const isSelected = activePairFilter === p.pair;
                const isGold = p.pair.toLowerCase().includes('gold') || p.pair.includes('XAU');

                return (
                  <tr
                    key={p.pair}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-900/20' : ''
                    }`}
                  >
                    {/* Pair Name */}
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-100 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isGold ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                      <span>{p.pair}</span>
                      {isGold && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          Gold
                        </span>
                      )}
                    </td>

                    {/* Trades Taken */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white text-sm">{count}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5 font-sans">
                        (
                        {viewScope === 'week'
                          ? `${p.weeklyWins}W / ${p.weeklyLosses}L`
                          : viewScope === 'month'
                          ? `${p.monthlyWins}W / ${p.monthlyLosses}L`
                          : `${p.wins}W / ${p.losses}L`}
                        )
                      </span>
                    </td>

                    {/* Win Rate */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {formatPercent(winRate)}
                        </span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              winRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(winRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Profits */}
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      +{formatCurrencyNeutral(profits)}
                    </td>

                    {/* Losses */}
                    <td className="py-3.5 px-4 text-rose-400 font-semibold">
                      -{formatCurrencyNeutral(losses)}
                    </td>

                    {/* Net P&L */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(net)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectPairFilter(isSelected ? 'ALL' : p.pair)}
                        aria-label={`Filter trades by ${p.pair}`}
                        className={`px-2.5 py-1 text-[11px] font-sans font-medium rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isSelected ? 'Filtering' : 'View Trades'}
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
