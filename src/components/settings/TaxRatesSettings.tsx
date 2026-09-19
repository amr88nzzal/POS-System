import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  RefreshCw,
} from 'lucide-react';
import { TaxRate } from '../../types';
import { ApiService } from '../../utils/apiService';

interface TaxRatesSettingsProps {
  taxRates: TaxRate[];
  onUpdateTaxRates: (rates: TaxRate[]) => void;
  lang: 'ar' | 'en';
}

export function TaxRatesSettings({
  taxRates,
  onUpdateTaxRates,
  lang,
}: TaxRatesSettingsProps) {
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState<Partial<TaxRate>>({
    code: '',
    name: '',
    rate: 15,
    description: '',
    isDefault: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingRate(null);
    setFormData({
      code: `VAT_${Math.floor(Math.random() * 90 + 10)}`,
      name: '',
      rate: 15,
      description: '',
      isDefault: false,
    });
  };

  const handleOpenEdit = (rate: TaxRate) => {
    setIsNew(false);
    setEditingRate(rate);
    setFormData({ ...rate });
  };

  const handleSetDefault = (id: number) => {
    const updated = taxRates.map((r) => ({
      ...r,
      isDefault: r.id === id,
    }));
    onUpdateTaxRates(updated);
    showToast(lang === 'ar' ? 'تم تعيين النسبة الضريبية كافتراضية للنظام' : 'Default tax rate updated');
  };

  const handleSave = async () => {
    if (!formData.name || formData.rate === undefined || formData.rate === null) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم النسبة وقيمتها المئوية' : 'Please provide tax name and rate');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const newRate: TaxRate = {
          id: Date.now(),
          code: formData.code || `VAT_${formData.rate}`,
          name: formData.name,
          rate: Number(formData.rate),
          description: formData.description || '',
          isDefault: !!formData.isDefault,
        };

        // If marked default, unset others
        let updatedList = [...taxRates];
        if (newRate.isDefault) {
          updatedList = updatedList.map((r) => ({ ...r, isDefault: false }));
        }
        updatedList.push(newRate);
        onUpdateTaxRates(updatedList);

        // Async sync to Cloud SQL
        await ApiService.createTaxRate(newRate);
        showToast(lang === 'ar' ? 'تمت إضافة النسبة الضريبية وحفظها في قاعدة البيانات' : 'Tax rate added & saved to Cloud SQL');
      } else if (editingRate) {
        let updatedList = taxRates.map((r) => {
          if (r.id === editingRate.id) {
            return {
              ...r,
              ...formData,
              rate: Number(formData.rate),
            } as TaxRate;
          }
          if (formData.isDefault && r.id !== editingRate.id) {
            return { ...r, isDefault: false };
          }
          return r;
        });
        onUpdateTaxRates(updatedList);
        showToast(lang === 'ar' ? 'تم تحديث النسبة الضريبية بنجاح' : 'Tax rate updated');
      }

      setIsNew(false);
      setEditingRate(null);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ النسبة الضريبية');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Percent className="w-6 h-6 text-blue-300" />
            <h3 className="text-xl font-bold">
              {lang === 'ar' ? 'جدول النسب الضريبية (Tax Rates)' : 'Tax Rates Schedule'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>PostgreSQL Schema</span>
            </span>
          </div>
          <p className="text-sm text-blue-100/80 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'إدارة جدول النسب الضريبية المعتمدة رسمياً، حيث ترتبط كل مجموعة بمعدل ضريبي افتراضي، ويتم توريثه تلقائياً لبطاقات المواد مع إمكانية التعديل والتخصيص.'
              : 'Manage compliant tax rates. Categories link to default tax rates, inherited by product cards.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-white text-blue-800 font-bold rounded-xl shadow hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-blue-700" />
          <span>{lang === 'ar' ? 'إضافة نسبة ضريبية' : 'Add Tax Rate'}</span>
        </button>
      </div>

      {/* Rates Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {lang === 'ar' ? 'النسب الضريبية المسجلة في النظام' : 'Configured Tax Rates'}
            </h4>
            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono font-semibold">
              {taxRates.length}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {lang === 'ar' ? 'متوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA)' : 'ZATCA compliant'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-100/75 dark:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4 text-start">#</th>
                <th className="py-3.5 px-4 text-start">{lang === 'ar' ? 'الرمز الضريبي' : 'Code'}</th>
                <th className="py-3.5 px-4 text-start">{lang === 'ar' ? 'اسم النسبة' : 'Name'}</th>
                <th className="py-3.5 px-4 text-start">{lang === 'ar' ? 'النسبة المئوية (%)' : 'Rate (%)'}</th>
                <th className="py-3.5 px-4 text-start">{lang === 'ar' ? 'الحالة والافتراضي' : 'Default'}</th>
                <th className="py-3.5 px-4 text-start">{lang === 'ar' ? 'الوصف والتطبيق' : 'Description'}</th>
                <th className="py-3.5 px-4 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {taxRates.map((rate, idx) => (
                <tr
                  key={rate.id || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded">
                      {rate.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {rate.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                        rate.rate > 0
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      %{rate.rate}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {rate.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === 'ar' ? 'الافتراضي للمجموعات' : 'Default for Categories'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(rate.id)}
                        className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
                      >
                        {lang === 'ar' ? 'تعيين كافتراضي' : 'Set as default'}
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {rate.description || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(rate)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title={lang === 'ar' ? 'تعديل النسبة' : 'Edit Rate'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isNew || editingRate) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {isNew
                    ? lang === 'ar'
                      ? 'إضافة نسبة ضريبية جديدة'
                      : 'Add New Tax Rate'
                    : lang === 'ar'
                    ? 'تعديل النسبة الضريبية'
                    : 'Edit Tax Rate'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNew(false);
                  setEditingRate(null);
                }}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ar' ? 'الرمز الضريبي الكودي' : 'Tax Code'}
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. VAT_15"
                    className="w-full font-mono text-sm px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ar' ? 'النسبة المئوية (%) *' : 'Rate Percentage (%) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.rate ?? 15}
                      onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                      className="w-full font-mono font-bold text-sm px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 pe-8"
                    />
                    <span className="absolute end-3 top-2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'اسم النسبة والوصف المعروض *' : 'Tax Rate Name *'}
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ضريبة القيمة المضافة القياسية (15%)"
                  className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'ملاحظات وتفاصيل التطبيق' : 'Description / Usage'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. النسبة القياسية لجميع المنتجات الغذائية والاستهلاكية..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    {lang === 'ar' ? 'تعيين كنسبة افتراضية للنظام' : 'Set as System Default'}
                  </h5>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    {lang === 'ar'
                      ? 'سيتم اختيار هذه النسبة تلقائياً عند تعريف أي مجموعة جديدة'
                      : 'Automatically selected when creating any new category'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNew(false);
                  setEditingRate(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{lang === 'ar' ? 'حفظ النسبة الضريبية' : 'Save Tax Rate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
