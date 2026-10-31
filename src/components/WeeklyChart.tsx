import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { PeriodStat } from '../types/trade';
import { formatCurrencyNeutral, formatPercent } from '../utils/formatters';

interface WeeklyChartProps {
  weeklyData: PeriodStat[];
  selectedWeekKey: string;
  onSelectWeekKey: (weekKey: string) => void;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  weeklyData,
  selectedWeekKey,
  onSelectWeekKey,
}) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <section aria-label="Weekly Performance Chart" className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Weekly Profit vs. Loss Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Week-by-week gross profits, losses, and win rate trajectory
            </p>
          </div>
        </div>
        <div className="py-8 text-center text-xs text-slate-400">
          <p className="text-slate-300 font-medium">No weekly trades recorded yet.</p>
          <p className="mt-1 text-slate-500">As you enter your trades, weekly profit and loss bars will calculate and display here automatically.</p>
        </div>
      </section>
    );
  }

  // Find max value for bar height scaling
  const maxAmount = Math.max(
    ...weeklyData.map((w) => Math.max(w.grossProfits, w.grossLosses)),
    100
  );

  return (
    <section aria-label="Weekly Performance Chart" className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Weekly Profit vs. Loss Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Week-by-week gross profits, losses, and win rate trajectory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span className="text-slate-300">Weekly Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span className="text-slate-300">Weekly Loss</span>
          </div>
        </div>
      </div>

      {/* Bars Container */}
      <div className="pt-6 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {weeklyData.slice(-5).map((w) => {
            const isSelected = w.periodKey === selectedWeekKey;
            const profitHeight = Math.max(Math.round((w.grossProfits / maxAmount) * 120), 4);
            const lossHeight = Math.max(Math.round((w.grossLosses / maxAmount) * 120), 4);

            return (
              <button
                type="button"
                key={w.periodKey}
                onClick={() => onSelectWeekKey(w.periodKey)}
                aria-label={`View stats for week ${w.periodKey}`}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/40 shadow-md shadow-blue-950/40'
                    : 'bg-slate-800/40 border-slate-750 hover:bg-slate-800/70'
                }`}
              >
                {/* Week Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-white">{w.periodKey}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono">
                    {w.tradeCount} trades
                  </span>
                </div>

                {/* Vertical Visual Bars */}
                <div className="h-32 flex items-end justify-center gap-3 my-3 pt-2 border-b border-slate-700/50">
                  {/* Profit Bar */}
                  <div className="flex flex-col items-center gap-1 flex-1 max-w-[28px]">
                    <span className="text-[9px] font-mono text-emerald-400 font-semibold truncate w-full text-center">
                      ${Math.round(w.grossProfits)}
                    </span>
                    <div
                      className="w-full bg-emerald-500 rounded-t-md transition-all duration-300 hover:bg-emerald-400"
                      style={{ height: `${profitHeight}px` }}
                      title={`Gross Profit: +$${w.grossProfits}`}
                    />
                  </div>

                  {/* Loss Bar */}
                  <div className="flex flex-col items-center gap-1 flex-1 max-w-[28px]">
                    <span className="text-[9px] font-mono text-rose-400 font-semibold truncate w-full text-center">
                      ${Math.round(w.grossLosses)}
                    </span>
                    <div
                      className="w-full bg-rose-500 rounded-t-md transition-all duration-300 hover:bg-rose-400"
                      style={{ height: `${lossHeight}px` }}
                      title={`Gross Loss: -$${w.grossLosses}`}
                    />
                  </div>
                </div>

                {/* Footer: Win Rate & Net */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Win Rate:</span>
                    <span
                      className={`font-mono font-bold ${
                        w.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {formatPercent(w.winRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Net:</span>
                    <span
                      className={`font-mono font-bold ${
                        w.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {w.netPnL >= 0 ? '+' : ''}${Math.round(w.netPnL)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
