import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Copy,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Trade, PeriodStat } from '../types/trade';
import { calculateStats, getTradeWeekKey, getTradeMonthKey } from '../utils/tradingCalculations';
import { formatCurrency, formatCurrencyNeutral, formatPercent, formatTradeDate, formatTradeTime } from '../utils/formatters';

interface TradeLogProps {
  trades: Trade[];
  availableWeeks: PeriodStat[];
  availableMonths: PeriodStat[];
  activePairFilter: string;
  onSelectPairFilter: (pair: string) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onDuplicateTrade: (trade: Trade) => void;
  onOpenNewTrade: () => void;
}

export const TradeLog: React.FC<TradeLogProps> = ({
  trades,
  availableWeeks,
  availableMonths,
  activePairFilter,
  onSelectPairFilter,
  onEditTrade,
  onDeleteTrade,
  onDuplicateTrade,
  onOpenNewTrade,
}) => {
  const [timeFilterMode, setTimeFilterMode] = useState<
    'all' | 'this-month' | 'this-week' | 'custom-month' | 'custom-week'
  >('all');
  const [customMonth, setCustomMonth] = useState<string>(
    availableMonths[availableMonths.length - 1]?.periodKey || ''
  );
  const [customWeek, setCustomWeek] = useState<string>(
    availableWeeks[availableWeeks.length - 1]?.periodKey || ''
  );
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine current active week/month keys
  const now = new Date();
  const currentWeekKey = getTradeWeekKey(now);
  const currentMonthKey = getTradeMonthKey(now);

  // Extract unique pairs list for pair filter dropdown
  const uniquePairs = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => set.add(t.pair));
    return Array.from(set).sort();
  }, [trades]);

  // Filter the trades based on selected criteria
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // 1. Timeframe filter
      if (timeFilterMode === 'this-month') {
        if (getTradeMonthKey(trade.date) !== currentMonthKey) return false;
      } else if (timeFilterMode === 'this-week') {
        if (getTradeWeekKey(trade.date) !== currentWeekKey) return false;
      } else if (timeFilterMode === 'custom-month') {
        if (getTradeMonthKey(trade.date) !== customMonth) return false;
      } else if (timeFilterMode === 'custom-week') {
        if (getTradeWeekKey(trade.date) !== customWeek) return false;
      }

      // 2. Pair filter
      if (activePairFilter !== 'ALL' && trade.pair !== activePairFilter) {
        return false;
      }

      // 3. Outcome filter
      if (outcomeFilter !== 'ALL' && trade.status !== outcomeFilter) {
        return false;
      }

      // 4. Direction filter
      if (directionFilter !== 'ALL' && trade.type !== directionFilter) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPair = trade.pair.toLowerCase().includes(q);
        const matchesStrategy = trade.strategy?.toLowerCase().includes(q);
        const matchesNotes = trade.notes?.toLowerCase().includes(q);
        const matchesSession = trade.session?.toLowerCase().includes(q);
        if (!matchesPair && !matchesStrategy && !matchesNotes && !matchesSession) {
          return false;
        }
      }

      return true;
    });
  }, [
    trades,
    timeFilterMode,
    currentMonthKey,
    currentWeekKey,
    customMonth,
    customWeek,
    activePairFilter,
    outcomeFilter,
    directionFilter,
    searchQuery,
  ]);

  // Dynamically calculate stats for the filtered set of trades
  const filteredStats = useMemo(() => {
    return calculateStats(filteredTrades);
  }, [filteredTrades]);

  return (
    <section aria-label="Trade Journal Ledger" className="space-y-4">
      {/* Title & Filter Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Trade Journal Ledger
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {filteredTrades.length} of {trades.length} Trades
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual log of each and every trade taken with live win/loss calculations.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewTrade}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg self-start md:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Record Trade</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          {/* Timeframe Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Timeframe Filter
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <select
                  value={timeFilterMode}
                  onChange={(e) =>
                    setTimeFilterMode(
                      e.target.value as
                        | 'all'
                        | 'this-month'
                        | 'this-week'
                        | 'custom-month'
                        | 'custom-week'
                    )
                  }
                  className="w-full bg-slate-800 text-slate-200 text-xs pl-3 pr-8 py-2 rounded-lg border border-slate-750 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="this-month">Current Month (Oct 2026)</option>
                  <option value="this-week">Current Week (Week 44)</option>
                  <option value="custom-month">Select Specific Month</option>
                  <option value="custom-week">Select Specific Week</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Sub-selectors for custom week/month */}
              {timeFilterMode === 'custom-month' && (
                <div className="relative">
                  <select
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 text-xs pl-3 pr-8 py-1.5 rounded-lg border border-slate-700"
                  >
                    {availableMonths.map((m) => (
                      <option key={m.periodKey} value={m.periodKey}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              )}

              {timeFilterMode === 'custom-week' && (
                <div className="relative">
                  <select
                    value={customWeek}
                    onChange={(e) => setCustomWeek(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 text-xs pl-3 pr-8 py-1.5 rounded-lg border border-slate-700"
                  >
                    {availableWeeks.map((w) => (
                      <option key={w.periodKey} value={w.periodKey}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Currency Pair Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Currency Pair Filter
            </label>
            <div className="relative">
              <select
                value={activePairFilter}
                onChange={(e) => onSelectPairFilter(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs pl-3 pr-8 py-2 rounded-lg border border-slate-750 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Pairs ({trades.length} trades)</option>
                {uniquePairs.map((pair) => (
                  <option key={pair} value={pair}>
                    {pair}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Result / Outcome Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Outcome</label>
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-750">
              <button
                type="button"
                onClick={() => setOutcomeFilter('ALL')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  outcomeFilter === 'ALL'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setOutcomeFilter('WIN')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  outcomeFilter === 'WIN'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Wins
              </button>
              <button
                type="button"
                onClick={() => setOutcomeFilter('LOSS')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  outcomeFilter === 'LOSS'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Losses
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Search Strategy / Notes
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-750 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Calculation Strip for Current Filtered Trades */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Filtered Selection:</span>
            <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800">
              {filteredStats.totalTrades} Trades
            </span>
            <span className="text-slate-400">
              ({filteredStats.wins} Wins / {filteredStats.losses} Losses)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400 text-[11px] font-sans mr-1">Win Rate:</span>
              <strong
                className={filteredStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}
              >
                {formatPercent(filteredStats.winRate)}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] font-sans mr-1">Profits:</span>
              <strong className="text-emerald-400">
                +{formatCurrencyNeutral(filteredStats.grossProfits)}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] font-sans mr-1">Losses:</span>
              <strong className="text-rose-400">
                -{formatCurrencyNeutral(filteredStats.grossLosses)}
              </strong>
            </div>

            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400 text-[11px] font-sans mr-1">Net P&L:</span>
              <strong
                className={`text-sm ${
                  filteredStats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(filteredStats.netPnL)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Pair</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">P&L ($)</th>
                <th className="py-3 px-4">Lots</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th className="py-3 px-4">Strategy & Session</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    {trades.length === 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-200">
                          Your trading journal is fresh and ready.
                        </p>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Record your first trade (such as Gold or EUR/USD). Live weekly, monthly, and currency pair calculations will compute immediately.
                        </p>
                        <button
                          type="button"
                          onClick={onOpenNewTrade}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Record First Trade</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm">No trades found matching current filter criteria.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTimeFilterMode('all');
                            onSelectPairFilter('ALL');
                            setOutcomeFilter('ALL');
                            setSearchQuery('');
                          }}
                          className="mt-2 text-xs text-emerald-400 hover:underline cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => {
                  const isGold = t.pair.toLowerCase().includes('gold') || t.pair.includes('XAU');
                  const isWin = t.status === 'WIN';
                  const isLoss = t.status === 'LOSS';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-slate-200 font-medium">
                          {formatTradeDate(t.date)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatTradeTime(t.date)}
                        </div>
                      </td>

                      {/* Pair */}
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span>{t.pair}</span>
                          {isGold && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                              Gold
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Side: Buy / Sell */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            t.type === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {t.type === 'BUY' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {t.type}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isWin
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isLoss
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* P&L */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-sm font-bold ${
                            t.pnl > 0
                              ? 'text-emerald-400'
                              : t.pnl < 0
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {formatCurrency(t.pnl)}
                        </span>
                      </td>

                      {/* Lots */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {t.lotSize.toFixed(2)}
                      </td>

                      {/* Entry / Exit */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {t.entryPrice !== undefined && t.exitPrice !== undefined ? (
                          <div>
                            <div>{t.entryPrice}</div>
                            <div className="text-[11px] text-slate-400">&rarr; {t.exitPrice}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Strategy & Session */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-slate-200 font-medium">
                          {t.strategy || 'Discretionary'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {t.session ? `${t.session} Session` : ''}
                        </div>
                        {t.notes && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-xs mt-0.5" title={t.notes}>
                            {t.notes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => onDuplicateTrade(t)}
                            title="Duplicate trade entry"
                            aria-label={`Duplicate trade ${t.pair}`}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTrade(t)}
                            title="Edit trade"
                            aria-label={`Edit trade ${t.pair}`}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTrade(t.id)}
                            title="Delete trade"
                            aria-label={`Delete trade ${t.pair}`}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
