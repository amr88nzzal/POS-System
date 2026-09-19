import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  RefreshCw,
  DollarSign,
  Globe,
  Info,
} from 'lucide-react';
import { Currency, Language } from '../../types';

interface CurrenciesSettingsProps {
  currencies: Currency[];
  onUpdateCurrencies: (currencies: Currency[]) => void;
  lang: Language;
}

export const CurrenciesSettings: React.FC<CurrenciesSettingsProps> = ({
  currencies,
  onUpdateCurrencies,
  lang,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [symbol, setSymbol] = useState('');
  const [symbolAr, setSymbolAr] = useState('');
  const [subunitNameAr, setSubunitNameAr] = useState('هللة');
  const [subunitNameEn, setSubunitNameEn] = useState('Halala');
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);
  const [exchangeRate, setExchangeRate] = useState<number>(1.0);
  const [isPrimary, setIsPrimary] = useState(false);

  const primaryCurrency = currencies.find((c) => c.isPrimary) || currencies[0];

  const handleOpenAdd = () => {
    setEditingCurrency(null);
    setCode('');
    setNameAr('');
    setNameEn('');
    setSymbol('');
    setSymbolAr('');
    setSubunitNameAr('هللة');
    setSubunitNameEn('Halala');
    setDecimalPlaces(2);
    setExchangeRate(1.0);
    setIsPrimary(false);
    setShowModal(true);
  };

  const handleOpenEdit = (curr: Currency) => {
    setEditingCurrency(curr);
    setCode(curr.code);
    setNameAr(curr.nameAr);
    setNameEn(curr.nameEn);
    setSymbol(curr.symbol);
    setSymbolAr(curr.symbolAr || curr.symbol);
    setSubunitNameAr(curr.subunitNameAr || 'هللة');
    setSubunitNameEn(curr.subunitNameEn || 'Halala');
    setDecimalPlaces(curr.decimalPlaces ?? 2);
    setExchangeRate(curr.exchangeRate ?? (curr.rateToBase || 1.0));
    setIsPrimary(!!curr.isPrimary);
    setShowModal(true);
  };

  const handleSetPrimary = (currId: string) => {
    const updated = currencies.map((c) => ({
      ...c,
      isPrimary: c.id === currId || c.code === currId,
      exchangeRate: c.id === currId || c.code === currId ? 1.0 : c.exchangeRate,
      rateToBase: c.id === currId || c.code === currId ? 1.0 : c.rateToBase,
    }));
    onUpdateCurrencies(updated);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !code.trim() || !symbol.trim()) {
      alert(lang === 'ar' ? 'يرجى إكمال الحقول الإلزامية للعملة' : 'Please fill required fields');
      return;
    }

    let updatedList = [...currencies];

    if (editingCurrency) {
      updatedList = updatedList.map((c) => {
        if (c.id === editingCurrency.id || c.code === editingCurrency.code) {
          return {
            ...c,
            code: code.trim().toUpperCase(),
            nameAr: nameAr.trim(),
            nameEn: nameEn.trim() || code.trim(),
            symbol: symbol.trim(),
            symbolAr: symbolAr.trim() || symbol.trim(),
            subunitNameAr: subunitNameAr.trim() || 'هللة',
            subunitNameEn: subunitNameEn.trim() || 'Halala',
            decimalPlaces: Number(decimalPlaces) || 2,
            isPrimary: isPrimary,
            exchangeRate: isPrimary ? 1.0 : Number(exchangeRate) || 1.0,
            rateToBase: isPrimary ? 1.0 : Number(exchangeRate) || 1.0,
          };
        }
        // If this one is set as primary, unmark others
        if (isPrimary) {
          return { ...c, isPrimary: false };
        }
        return c;
      });
    } else {
      const newCurr: Currency = {
        id: `cur-${Date.now()}`,
        code: code.trim().toUpperCase(),
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || code.trim(),
        symbol: symbol.trim(),
        symbolAr: symbolAr.trim() || symbol.trim(),
        subunitNameAr: subunitNameAr.trim() || 'هللة',
        subunitNameEn: subunitNameEn.trim() || 'Halala',
        decimalPlaces: Number(decimalPlaces) || 2,
        isPrimary: isPrimary || updatedList.length === 0,
        exchangeRate: isPrimary ? 1.0 : Number(exchangeRate) || 1.0,
        rateToBase: isPrimary ? 1.0 : Number(exchangeRate) || 1.0,
      };

      if (isPrimary) {
        updatedList = updatedList.map((c) => ({ ...c, isPrimary: false }));
      }
      updatedList.push(newCurr);
    }

    onUpdateCurrencies(updatedList);
    setShowModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleDelete = (curr: Currency) => {
    if (curr.isPrimary) {
      alert(lang === 'ar' ? 'لا يمكن حذف العملة الرئيسية للنظام!' : 'Cannot delete primary currency');
      return;
    }
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف عملة (${curr.nameAr})؟` : `Delete currency ${curr.nameEn}?`)) {
      const filtered = currencies.filter((c) => c.id !== curr.id && c.code !== curr.code);
      onUpdateCurrencies(filtered);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>{lang === 'ar' ? 'دليل وجدول تعريف العملات' : 'Currencies Directory & Exchange Rates'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إدارة العملة الرئيسية وأسماء الأجزاء (هللة / سنت) وتحديد أسعار التحويل ومنازل الفاصلة العشرية'
              : 'Define primary base currency, subunit names, decimal precision, and exchange conversion rates'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة عملة جديدة' : 'Add Currency'}</span>
        </button>
      </div>

      {/* Info Card on Primary Currency */}
      {primaryCurrency && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {primaryCurrency.symbolAr || primaryCurrency.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {lang === 'ar' ? 'العملة الأساسية المعتمدة للنظام والفواتير:' : 'Base System Currency:'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold">
                  {primaryCurrency.nameAr} ({primaryCurrency.code})
                </span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                {lang === 'ar'
                  ? `اسم الجزء: ${primaryCurrency.subunitNameAr || 'هللة'} • عدد المنازل العشرية: ${primaryCurrency.decimalPlaces ?? 2} خانات • سعر الأساس: 1.000`
                  : `Subunit: ${primaryCurrency.subunitNameEn || 'Halala'} • Decimals: ${primaryCurrency.decimalPlaces ?? 2} • Base: 1.000`}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300">
            1.00 {primaryCurrency.code} = 1.00 BASE
          </div>
        </div>
      )}

      {/* Currencies Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'العملة والرمز' : 'Currency & Code'}</th>
                <th className="px-4 py-3">{lang === 'ar' ? 'اسم العملة بالعربية / الإنجليزية' : 'Currency Name'}</th>
                <th className="px-4 py-3">{lang === 'ar' ? 'اسم الجزء (الكسر)' : 'Subunit Name'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'المنازل العشرية' : 'Decimals'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'نسبة التحويل للأساس' : 'Exchange Rate'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {currencies.map((curr) => {
                const isCurrPrimary = !!curr.isPrimary;
                return (
                  <tr
                    key={curr.id || curr.code}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors ${
                      isCurrPrimary ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold flex items-center justify-center text-xs">
                          {curr.symbolAr || curr.symbol}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white font-mono block">
                            {curr.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{curr.symbol}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{curr.nameAr}</div>
                      <div className="text-[10px] text-slate-400">{curr.nameEn}</div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      <span>{curr.subunitNameAr || 'هللة'}</span>
                      <span className="text-[10px] text-slate-400 ms-1">({curr.subunitNameEn || 'Halala'})</span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {curr.decimalPlaces ?? 2}
                    </td>

                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {isCurrPrimary ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">1.000 (الأساس)</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">
                          {curr.exchangeRate || curr.rateToBase || 1.0}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isCurrPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{lang === 'ar' ? 'العملة الرئيسية' : 'Primary Base'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimary(curr.id || curr.code)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                          {lang === 'ar' ? 'تعيين كرئيسية' : 'Set as Base'}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(curr)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                          title={lang === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isCurrPrimary && (
                          <button
                            onClick={() => handleDelete(curr)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>
                  {editingCurrency
                    ? lang === 'ar'
                      ? 'تعديل بيانات العملة'
                      : 'Edit Currency'
                    : lang === 'ar'
                    ? 'تعريف عملة جديدة'
                    : 'Add New Currency'}
                </span>
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'كود العملة (ISO Code):' : 'Currency Code:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SAR, USD, EUR..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'رمز العملة (Symbol):' : 'Symbol:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ر.س أو $ أو €"
                    value={symbol}
                    onChange={(e) => {
                      setSymbol(e.target.value);
                      if (!symbolAr) setSymbolAr(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'اسم العملة بالعربية:' : 'Arabic Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ريال سعودي"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'اسم العملة بالإنجليزية:' : 'English Name:'}
                  </label>
                  <input
                    type="text"
                    placeholder="Saudi Riyal"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'اسم الجزء (الكسر بالعربية):' : 'Subunit (Arabic):'}
                  </label>
                  <input
                    type="text"
                    placeholder="هللة / سنت / فلس / قرش"
                    value={subunitNameAr}
                    onChange={(e) => setSubunitNameAr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'اسم الجزء بالإنجليزية:' : 'Subunit (English):'}
                  </label>
                  <input
                    type="text"
                    placeholder="Halala / Cent / Fils"
                    value={subunitNameEn}
                    onChange={(e) => setSubunitNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'عدد المنازل بعد الفاصلة (Decimals):' : 'Decimal Precision:'}
                  </label>
                  <select
                    value={decimalPlaces}
                    onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value={0}>0 (بدون كسور)</option>
                    <option value={2}>2 (مثال: 12.50)</option>
                    <option value={3}>3 (مثال: 12.500 كالدينار)</option>
                    <option value={4}>4 (دقة محاسبية 4 خانات)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {lang === 'ar' ? 'سعر التحويل مقابل الأساس:' : 'Exchange Rate:'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    disabled={isPrimary}
                    value={isPrimary ? 1.0 : exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1.0)}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white ${
                      isPrimary ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Primary Toggle */}
              <div className="flex items-center gap-2 p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isPrimary" className="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
                  {lang === 'ar' ? 'تعيين هذه العملة كعملة أساسية رئيسية للنظام' : 'Set as Primary Base Currency'}
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حفظ العملة' : 'Save Currency'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 start-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تم تحديث جدول العملات بنجاح' : 'Currencies updated successfully'}</span>
        </div>
      )}
    </div>
  );
};
