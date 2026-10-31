/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Trade } from './types/trade';
import { INITIAL_SAMPLE_TRADES } from './data/sampleTrades';
import {
  calculateStats,
  calculatePairStats,
  filterTradesByMonth,
  filterTradesByWeek,
  getTradeWeekKey,
  getTradeMonthKey,
  getWeeklyBreakdown,
  getMonthlyBreakdown,
} from './utils/tradingCalculations';
import { Navbar } from './components/Navbar';
import { KPISummary } from './components/KPISummary';
import { PairAnalytics } from './components/PairAnalytics';
import { WeeklyChart } from './components/WeeklyChart';
import { TradeLog } from './components/TradeLog';
import { TradeModal } from './components/TradeModal';
import { DataBackupModal } from './components/DataBackupModal';
import { LayoutDashboard, Coins, BookOpen, PlusCircle } from 'lucide-react';

const STORAGE_KEY = 'tradetrack_pro_trades_live_v2';

export default function App() {
  // Load trades from localStorage, starting completely fresh with [] by default
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      // Clear legacy sample data key to start completely fresh
      localStorage.removeItem('tradetrack_pro_journal_data_v1');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed reading trades from localStorage', err);
    }
    return [];
  });

  // Save to localStorage whenever trades change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (err) {
      console.error('Failed saving trades to localStorage', err);
    }
  }, [trades]);

  // Available periods
  const availableWeeks = useMemo(() => getWeeklyBreakdown(trades), [trades]);
  const availableMonths = useMemo(() => getMonthlyBreakdown(trades), [trades]);

  // Selected periods for calculations (defaults to current live week/month)
  const currentLiveWeek = getTradeWeekKey(new Date());
  const currentLiveMonth = getTradeMonthKey(new Date());

  const defaultWeek = availableWeeks[availableWeeks.length - 1]?.periodKey || currentLiveWeek;
  const defaultMonth = availableMonths[availableMonths.length - 1]?.periodKey || currentLiveMonth;

  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(defaultWeek);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(defaultMonth);
  const [activePairFilter, setActivePairFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'pairs' | 'journal'>('all');

  // Sync selected periods if current selection doesn't exist
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.some((w) => w.periodKey === selectedWeekKey)) {
      setSelectedWeekKey(availableWeeks[availableWeeks.length - 1].periodKey);
    }
  }, [availableWeeks, selectedWeekKey]);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.some((m) => m.periodKey === selectedMonthKey)) {
      setSelectedMonthKey(availableMonths[availableMonths.length - 1].periodKey);
    }
  }, [availableMonths, selectedMonthKey]);

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Computations
  const overallStats = useMemo(() => calculateStats(trades), [trades]);

  // Weekly metrics for selected week
  const weeklyTrades = useMemo(
    () => filterTradesByWeek(trades, selectedWeekKey),
    [trades, selectedWeekKey]
  );
  const weeklyStats = useMemo(() => calculateStats(weeklyTrades), [weeklyTrades]);

  // Monthly metrics for selected month
  const monthlyTrades = useMemo(
    () => filterTradesByMonth(trades, selectedMonthKey),
    [trades, selectedMonthKey]
  );
  const monthlyStats = useMemo(() => calculateStats(monthlyTrades), [monthlyTrades]);

  // Pair stats
  const pairStats = useMemo(() => calculatePairStats(trades, new Date()), [trades]);

  // Handlers for Trade operations
  const handleSaveTrade = (savedTrade: Trade) => {
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === savedTrade.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTrade.id ? savedTrade : t));
      }
      return [savedTrade, ...prev];
    });
  };

  const handleDeleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicateTrade = (original: Trade) => {
    const copy: Trade = {
      ...original,
      id: `tr-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTrades((prev) => [copy, ...prev]);
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsTradeModalOpen(true);
  };

  const handleOpenNewTrade = () => {
    setTradeToEdit(null);
    setIsTradeModalOpen(true);
  };

  const handleResetSampleData = () => {
    setTrades(INITIAL_SAMPLE_TRADES);
    setActivePairFilter('ALL');
  };

  const handleClearAllTrades = () => {
    setTrades([]);
    setActivePairFilter('ALL');
  };

  const handleImportTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        totalTrades={trades.length}
        onOpenNewTrade={handleOpenNewTrade}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onResetData={handleClearAllTrades}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Full Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pairs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'pairs'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span>Currency Pairs & Gold</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>All Trades ({trades.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewTrade}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Quick Add Trade</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Comprehensive Dashboard */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Core User Requirements: Monthly/Weekly trades, Win Rates, Profits, Losses */}
            <KPISummary
              selectedWeekKey={selectedWeekKey}
              onSelectWeekKey={setSelectedWeekKey}
              availableWeeks={availableWeeks}
              weeklyStats={weeklyStats}
              selectedMonthKey={selectedMonthKey}
              onSelectMonthKey={setSelectedMonthKey}
              availableMonths={availableMonths}
              monthlyStats={monthlyStats}
              overallStats={overallStats}
            />

            {/* Weekly Profits vs Losses Visual Chart */}
            <WeeklyChart
              weeklyData={availableWeeks}
              selectedWeekKey={selectedWeekKey}
              onSelectWeekKey={setSelectedWeekKey}
            />

            {/* Currency Pair Analytics (Gold + others) */}
            <PairAnalytics
              pairStats={pairStats}
              activePairFilter={activePairFilter}
              onSelectPairFilter={setActivePairFilter}
            />

            {/* Full Trade Journal Ledger */}
            <TradeLog
              trades={trades}
              availableWeeks={availableWeeks}
              availableMonths={availableMonths}
              activePairFilter={activePairFilter}
              onSelectPairFilter={setActivePairFilter}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onDuplicateTrade={handleDuplicateTrade}
              onOpenNewTrade={handleOpenNewTrade}
            />
          </div>
        )}

        {/* Tab 2: Pairs Deep-Dive */}
        {activeTab === 'pairs' && (
          <div className="space-y-6">
            <PairAnalytics
              pairStats={pairStats}
              activePairFilter={activePairFilter}
              onSelectPairFilter={setActivePairFilter}
            />
            <TradeLog
              trades={trades}
              availableWeeks={availableWeeks}
              availableMonths={availableMonths}
              activePairFilter={activePairFilter}
              onSelectPairFilter={setActivePairFilter}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onDuplicateTrade={handleDuplicateTrade}
              onOpenNewTrade={handleOpenNewTrade}
            />
          </div>
        )}

        {/* Tab 3: Detailed Trade Log Only */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <TradeLog
              trades={trades}
              availableWeeks={availableWeeks}
              availableMonths={availableMonths}
              activePairFilter={activePairFilter}
              onSelectPairFilter={setActivePairFilter}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onDuplicateTrade={handleDuplicateTrade}
              onOpenNewTrade={handleOpenNewTrade}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradeToEdit(null);
        }}
        onSave={handleSaveTrade}
        tradeToEdit={tradeToEdit}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        trades={trades}
        onImportTrades={handleImportTrades}
        onResetSampleData={handleResetSampleData}
        onClearAllTrades={handleClearAllTrades}
      />
    </div>
  );
}
