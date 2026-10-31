import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Trade } from '../types/trade';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  onImportTrades: (trades: Trade[]) => void;
  onResetSampleData: () => void;
  onClearAllTrades: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  trades,
  onImportTrades,
  onResetSampleData,
  onClearAllTrades,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trades, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tradetrack_journal_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedbackMessage('Exported trade journal as JSON file.');
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ['id', 'date', 'pair', 'type', 'pnl', 'status', 'lotSize', 'entryPrice', 'exitPrice', 'session', 'strategy', 'notes'];
    const rows = trades.map((t) => [
      t.id,
      t.date,
      `"${t.pair}"`,
      t.type,
      t.pnl,
      t.status,
      t.lotSize,
      t.entryPrice ?? '',
      t.exitPrice ?? '',
      t.session ?? '',
      `"${t.strategy ?? ''}"`,
      `"${(t.notes ?? '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `tradetrack_journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedbackMessage('Exported trade journal as CSV spreadsheet.');
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportTrades(parsed);
          setFeedbackMessage(`Successfully imported ${parsed.length} trades!`);
        } else {
          setFeedbackMessage('Invalid file format: Expected an array of trade objects.');
        }
      } catch (err) {
        setFeedbackMessage('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 id="backup-modal-title" className="text-base font-bold text-white">
              Data Management & Backup
            </h2>
            <p className="text-xs text-slate-400">
              Save your trading history or restore from previous records.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedbackMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          {/* Export Options */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
            <div className="font-semibold text-slate-200">Export Journal Data</div>
            <p className="text-slate-400 text-[11px]">
              Export all {trades.length} recorded trades with complete calculations and timestamps.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-650 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-650 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
            <div className="font-semibold text-slate-200">Import Trades</div>
            <p className="text-slate-400 text-[11px]">
              Upload a previously exported JSON trade journal.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select JSON File</span>
            </button>
          </div>

          {/* Reset or Clear Data */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
            <div className="font-semibold text-slate-200">Presets & Reset</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  setFeedbackMessage('Reset to curated sample trades (Gold & Forex).');
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-750 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Sample Data</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all trades?')) {
                    onClearAllTrades();
                    setFeedbackMessage('Cleared all trades.');
                  }
                }}
                className="py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
