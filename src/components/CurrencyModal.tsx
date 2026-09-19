import React, { useState } from 'react';
import {
  Coins,
  X,
  Check,
  TrendingUp,
  RefreshCw,
  ArrowRightLeft,
  DollarSign,
  Info,
} from 'lucide-react';
import { Currency, Language } from '../types';
import { CurrencyService } from '../utils/currencies';

interface CurrencyModalProps {
  currencies: Currency[];
  activeCurrency: Currency;
  lang: Language;
  onSelectCurrency: (currency: Currency) => void;
  onUpdateCurrencies: (currencies: Currency[]) => void;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  currencies,
  activeCurrency,
  lang,
  onSelectCurrency,
  onUpdateCurrencies,
  onClose,
}) => {
  const [currencyList, setCurrencyList] = useState<Currency[]>(currencies);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(1);
  const [calcAmount, setCalcAmount] = useState<number>(100);

  const handleRateChange = (code: string, newRate: number) => {
    const updated = currencyList.map((c) => (c.code === code ? { ...c, rateToBase: newRate } : c));
    setCurrencyList(updated);
    onUpdateCurrencies(updated);
    CurrencyService.saveCurrencies(updated);
    setEditingCode(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 dark:text-slate-100 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {lang === 'ar' ? 'تعدد العملات وأسعار الصرف' : 'Multi-Currency & Exchange Rates'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar'
                  ? 'اختر العملة النشطة لنقاط البيع والفواتير وحدد أسعار الصرف'
                  : 'Select active currency and adjust exchange rates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency List */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'العملات المدعومة في النظام:' : 'Supported Currencies:'}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
            {currencyList.map((cur) => {
              const isSelected = activeCurrency.code === cur.code;
              return (
                <div
                  key={cur.code}
                  className={`p-3 flex items-center justify-between gap-2 transition-colors ${
                    isSelected ? 'bg-blue-50/80 dark:bg-blue-900/30' : 'hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs font-mono text-blue-600 dark:text-blue-400">
                      {cur.symbol}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{lang === 'ar' ? cur.nameAr : cur.nameEn}</span>
                        <span className="font-mono text-[10px] text-slate-400">({cur.code})</span>
                        {cur.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded font-semibold">
                            {lang === 'ar' ? 'العملة الأساسية' : 'Base'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {cur.isPrimary ? (
                          <span>1.0000 (الأساس)</span>
                        ) : (
                          <span>
                            1 ر.س = {cur.rateToBase ?? cur.exchangeRate} {cur.symbol} | (1 {cur.symbol} ≈{' '}
                            {(1 / (cur.rateToBase ?? cur.exchangeRate ?? 1)).toFixed(2)} ر.س)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rate editor button */}
                    {!cur.isPrimary && (
                      <button
                        onClick={() => {
                          setEditingCode(cur.code);
                          setTempRate(cur.rateToBase ?? cur.exchangeRate ?? 1.0);
                        }}
                        className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer"
                      >
                        {lang === 'ar' ? 'تعديل الصرف' : 'Edit Rate'}
                      </button>
                    )}

                    {/* Select active currency button */}
                    <button
                      onClick={() => {
                        onSelectCurrency(cur);
                        CurrencyService.saveActiveCurrency(cur);
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{isSelected ? (lang === 'ar' ? 'العملة النشطة' : 'Active') : (lang === 'ar' ? 'تفعيل' : 'Activate')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rate Edit Modal Drawer */}
        {editingCode && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2">
              {lang === 'ar' ? `تعديل سعر صرف ${editingCode} مقابل الريال السعودي (Base SAR):` : `Edit exchange rate for ${editingCode}:`}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.0001"
                value={tempRate}
                onChange={(e) => setTempRate(Number(e.target.value))}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold flex-1"
              />
              <button
                onClick={() => handleRateChange(editingCode, tempRate)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                {lang === 'ar' ? 'حفظ الصرف' : 'Save'}
              </button>
              <button
                onClick={() => setEditingCode(null)}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Live Currency Preview Calculator */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'ar' ? 'حاسبة التحويل السريع:' : 'Quick Conversion Preview:'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                {lang === 'ar' ? 'المبلغ بالريال الأساسي (SAR):' : 'Amount in Base (SAR):'}
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                {lang === 'ar' ? `المعادل بالعملة النشطة (${activeCurrency.code}):` : `Equivalent in (${activeCurrency.code}):`}
              </label>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm font-mono font-extrabold text-blue-700 dark:text-blue-300">
                {CurrencyService.format(calcAmount, activeCurrency, lang)}
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            {lang === 'ar' ? 'تم واعتماد العملة' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
