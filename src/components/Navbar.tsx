import React from 'react';
import { Plus, Download, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  totalTrades: number;
  onOpenNewTrade: () => void;
  onOpenBackup: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalTrades,
  onOpenNewTrade,
  onOpenBackup,
  onResetData,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">TradeTrack Pro</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden min-[440px]:inline-block">
                Live Analytics
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Weekly & Monthly Performance Engine
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Recorded: <strong className="text-white font-mono">{totalTrades}</strong> trades
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenBackup}
            aria-label="Export or import trade data"
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            aria-label="Start fresh and clear all recorded trades"
            title="Start fresh (clear all recorded trades)"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onOpenNewTrade}
            aria-label="Record a new trade"
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-950 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
