import React, { useState, useEffect } from 'react';
import { X, Check, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Trade, TradeType, TradeOutcome, TradeSession } from '../types/trade';
import { POPULAR_PAIRS } from '../data/sampleTrades';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  tradeToEdit?: Trade | null;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tradeToEdit,
}) => {
  const [pair, setPair] = useState('XAU/USD (Gold)');
  const [type, setType] = useState<TradeType>('BUY');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [pnl, setPnl] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('1.0');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [session, setSession] = useState<TradeSession>('London');
  const [strategy, setStrategy] = useState('');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<TradeOutcome>('WIN');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state when editing existing trade
  useEffect(() => {
    if (tradeToEdit) {
      setPair(tradeToEdit.pair);
      setType(tradeToEdit.type);
      setDate(tradeToEdit.date.slice(0, 16));
      setPnl(String(tradeToEdit.pnl));
      setLotSize(String(tradeToEdit.lotSize));
      setEntryPrice(tradeToEdit.entryPrice !== undefined ? String(tradeToEdit.entryPrice) : '');
      setExitPrice(tradeToEdit.exitPrice !== undefined ? String(tradeToEdit.exitPrice) : '');
      setStopLoss(tradeToEdit.stopLoss !== undefined ? String(tradeToEdit.stopLoss) : '');
      setTakeProfit(tradeToEdit.takeProfit !== undefined ? String(tradeToEdit.takeProfit) : '');
      setSession(tradeToEdit.session || 'London');
      setStrategy(tradeToEdit.strategy || '');
      setNotes(tradeToEdit.notes || '');
      setOutcome(tradeToEdit.status);
    } else {
      // Defaults for new trade - start completely fresh
      setPair('XAU/USD (Gold)');
      setType('BUY');
      setDate(new Date().toISOString().slice(0, 16));
      setPnl('');
      setLotSize('1.0');
      setEntryPrice('');
      setExitPrice('');
      setStopLoss('');
      setTakeProfit('');
      setSession('London');
      setStrategy('');
      setNotes('');
      setOutcome('WIN');
    }
    setFormError(null);
  }, [tradeToEdit, isOpen]);

  // Automatically adjust outcome status when PnL changes
  const handlePnlChange = (val: string) => {
    setPnl(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num > 0) setOutcome('WIN');
      else if (num < 0) setOutcome('LOSS');
      else setOutcome('BE');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair.trim()) {
      setFormError('Please specify a currency pair or instrument.');
      return;
    }

    const pnlNum = parseFloat(pnl);
    if (isNaN(pnlNum)) {
      setFormError('Please enter a valid numeric P&L amount (e.g. 250 or -150).');
      return;
    }

    const lotNum = parseFloat(lotSize);
    if (isNaN(lotNum) || lotNum <= 0) {
      setFormError('Please enter a positive lot size.');
      return;
    }

    const newTrade: Trade = {
      id: tradeToEdit ? tradeToEdit.id : `tr-${Date.now()}`,
      pair: pair.trim(),
      type,
      date: new Date(date).toISOString(),
      pnl: pnlNum,
      lotSize: lotNum,
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      status: outcome,
      session,
      strategy: strategy.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(newTrade);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trade-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 id="trade-modal-title" className="text-lg font-bold text-white">
              {tradeToEdit ? 'Edit Recorded Trade' : 'Record New Trade'}
            </h2>
            <p className="text-xs text-slate-400">
              Input trade parameters to update weekly, monthly, and pair calculations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trade dialog"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Quick Preset Buttons for Currency Pairs */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Instrument / Currency Pair
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_PAIRS.slice(0, 6).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setPair(preset)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    pair === preset
                      ? preset.includes('Gold')
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              placeholder="e.g. XAU/USD (Gold) or EUR/USD"
              className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Direction & Result */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Trade Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('BUY')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    type === 'BUY'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>BUY (Long)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('SELL')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    type === 'SELL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>SELL (Short)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Outcome Result</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['WIN', 'LOSS', 'BE'] as TradeOutcome[]).map((res) => (
                  <button
                    type="button"
                    key={res}
                    onClick={() => {
                      setOutcome(res);
                      if (res === 'WIN' && parseFloat(pnl) <= 0) setPnl('250');
                      if (res === 'LOSS' && parseFloat(pnl) >= 0) setPnl('-150');
                      if (res === 'BE') setPnl('0');
                    }}
                    className={`py-2 rounded-lg font-semibold text-center transition-colors cursor-pointer ${
                      outcome === res
                        ? res === 'WIN'
                          ? 'bg-emerald-600 text-white'
                          : res === 'LOSS'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & P&L */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>Net Profit / Loss ($)</span>
                <span className="text-[10px] text-slate-400">Use minus (-) for loss</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="any"
                  required
                  value={pnl}
                  onChange={(e) => handlePnlChange(e.target.value)}
                  placeholder="e.g. 450 or -200"
                  className={`w-full bg-slate-800 border rounded-lg pl-8 pr-3 py-2 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    parseFloat(pnl) > 0
                      ? 'text-emerald-400 border-emerald-500/40'
                      : parseFloat(pnl) < 0
                      ? 'text-rose-400 border-rose-500/40'
                      : 'text-slate-100 border-slate-750'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Lot Size & Entry/Exit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Lot Size</label>
              <input
                type="number"
                step="0.01"
                required
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="1.0"
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Take Profit</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Session & Strategy */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradeSession)}
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="Asian">Asian Session</option>
                <option value="Overlap">London / NY Overlap</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Strategy / Setup</label>
              <input
                type="text"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="e.g. Trend Follow, Supply Zone"
                className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Trade Notes & Psychology
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why was the trade entered? Execution discipline, takeaways..."
              className="w-full bg-slate-800 border border-slate-750 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{tradeToEdit ? 'Save Changes' : 'Save Trade'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
