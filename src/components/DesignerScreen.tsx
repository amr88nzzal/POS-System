import React, { useState } from 'react';
import {
  Palette,
  Printer,
  Check,
  RotateCcw,
  Sparkles,
  QrCode,
  Barcode,
  Smartphone,
} from 'lucide-react';
import { InvoiceTemplateConfig, Language } from '../types';
import { INITIAL_TEMPLATE_CONFIG } from '../data/initialData';

interface DesignerScreenProps {
  config: InvoiceTemplateConfig;
  lang: Language;
  onSaveConfig: (config: InvoiceTemplateConfig) => void;
}

export const DesignerScreen: React.FC<DesignerScreenProps> = ({
  config,
  lang,
  onSaveConfig,
}) => {
  const [formConfig, setFormConfig] = useState<InvoiceTemplateConfig>({ ...config });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveConfig(formConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setFormConfig(INITIAL_TEMPLATE_CONFIG);
    onSaveConfig(INITIAL_TEMPLATE_CONFIG);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'تصميم وتخصيص الفواتير وسندات القبض والصرف' : 'Invoice & Voucher Designer'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'تخصيص ترويسة المتجر، الرقم الضريبي، مقاس الورق الحراري (80 مم / 58 مم / A4)، وسياسة الاسترجاع'
              : 'Customize store logo, ZATCA tax ID, thermal paper size, and return policy footer'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaved ? 'تم الحفظ بنجاح!' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designer Controls Form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2">بيانات المنشأة والترويسة</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">اسم المتجر / الشركة (عربي) *</label>
              <input
                type="text"
                value={formConfig.storeNameAr}
                onChange={(e) => setFormConfig({ ...formConfig, storeNameAr: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">اسم المتجر (إنجليزي)</label>
              <input
                type="text"
                value={formConfig.storeNameEn}
                onChange={(e) => setFormConfig({ ...formConfig, storeNameEn: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">الرقم الضريبي (ZATCA VAT ID) *</label>
              <input
                type="text"
                value={formConfig.taxNumber}
                onChange={(e) => setFormConfig({ ...formConfig, taxNumber: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">رقم السجل التجاري (CR)</label>
              <input
                type="text"
                value={formConfig.commercialReg}
                onChange={(e) => setFormConfig({ ...formConfig, commercialReg: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">رقم الهاتف / خدمة العملاء</label>
              <input
                type="text"
                value={formConfig.phone}
                onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">العنوان والفرع</label>
              <input
                type="text"
                value={formConfig.address}
                onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm border-b pt-2 pb-2">خيارات الطباعة والمقاس</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">مقاس ورق الفاتورة:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '80mm', label: 'حراري 80 مم (قياسي)' },
                  { id: '58mm', label: 'حراري 58 مم (مدمج)' },
                  { id: 'A4', label: 'قياس A4 (ضريبي كامل)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormConfig({ ...formConfig, paperSize: p.id as any })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      formConfig.paperSize === p.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.showQrCode}
                  onChange={(e) => setFormConfig({ ...formConfig, showQrCode: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-semibold text-slate-700">رمز QR ZATCA</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.showBarcode}
                  onChange={(e) => setFormConfig({ ...formConfig, showBarcode: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-semibold text-slate-700">باركود الفاتورة</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.showCashierName}
                  onChange={(e) => setFormConfig({ ...formConfig, showCashierName: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-semibold text-slate-700">اسم الكاشير</span>
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">الترويسة العلوية (ملاحظة الفاتورة)</label>
              <input
                type="text"
                value={formConfig.headerNote}
                onChange={(e) => setFormConfig({ ...formConfig, headerNote: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">رسالة التذييل وسياسة الاسترجاع (أسفل الفاتورة)</label>
              <textarea
                rows={2}
                value={formConfig.footerNote}
                onChange={(e) => setFormConfig({ ...formConfig, footerNote: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Live Visual Preview Card */}
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-start">
          <div className="w-full flex items-center justify-between pb-3 text-xs font-bold text-slate-600">
            <span>معاينة حية لشكل الفاتورة المطبوعة ({formConfig.paperSize})</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>تجربة طباعة عينة</span>
            </button>
          </div>

          {/* Paper Mockup */}
          <div
            className={`bg-white shadow-xl border border-slate-300 rounded-lg p-4 font-sans text-[11px] leading-tight text-slate-800 transition-all ${
              formConfig.paperSize === 'A4' ? 'w-full max-w-md' : 'w-[320px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <h4 className="font-extrabold text-sm text-slate-900">{formConfig.storeNameAr}</h4>
              <div className="text-[10px] text-slate-500">{formConfig.storeNameEn}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{formConfig.address}</div>
              <div className="text-[10px] text-slate-500 font-mono">هاتف: {formConfig.phone}</div>
              <div className="font-mono text-[10px] font-bold text-slate-700 mt-1">الرقم الضريبي: {formConfig.taxNumber}</div>
              <div className="font-mono text-[9px] text-slate-400">سجل تجاري: {formConfig.commercialReg}</div>
              <div className="mt-1 bg-slate-100 px-2 py-0.5 rounded font-bold text-[10px] inline-block">
                {formConfig.headerNote}
              </div>
            </div>

            {/* Meta */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">رقم الفاتورة:</span>
                <span className="font-mono font-bold">INV-2024-SAMPLE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التاريخ:</span>
                <span className="font-mono">2024-02-28 14:30:00</span>
              </div>
              {formConfig.showCashierName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">الكاشير:</span>
                  <span>أحمد القحطاني</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">طريقة الدفع:</span>
                <span className="font-bold text-blue-700">مدى / بطاقة (Card)</span>
              </div>
            </div>

            {/* Items sample */}
            <div className="py-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-slate-500 text-[10px] mb-1">
                <span>الصنف</span>
                <span>الكمية × السعر</span>
                <span>الإجمالي</span>
              </div>
              <div className="flex justify-between text-[10px] py-0.5">
                <span>حليب المراعي 1 لتر</span>
                <span className="font-mono">2 × 6.50</span>
                <span className="font-mono font-bold">13.00 ر.س</span>
              </div>
              <div className="flex justify-between text-[10px] py-0.5">
                <span>قهوة أرابيكا 250جم</span>
                <span className="font-mono">1 × 35.00</span>
                <span className="font-mono font-bold">35.00 ر.س</span>
              </div>
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>المجموع الخاضع للضريبة:</span>
                <span className="font-mono">41.74 ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة 15%:</span>
                <span className="font-mono">6.26 ر.س</span>
              </div>
              <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-200 text-slate-900">
                <span>الإجمالي الصافي:</span>
                <span className="font-mono">48.00 ر.س</span>
              </div>
            </div>

            {/* Bottom elements */}
            <div className="pt-2 text-center flex flex-col items-center">
              {formConfig.showQrCode && (
                <div className="w-16 h-16 border border-slate-300 rounded p-1 bg-slate-50 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
              )}

              {formConfig.showBarcode && (
                <div className="mt-2 w-full pt-1 border-t border-slate-200">
                  <div className="h-5 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_6px)] w-36 mx-auto"></div>
                  <span className="text-[9px] font-mono text-slate-500">*INV-2024-SAMPLE*</span>
                </div>
              )}

              <p className="mt-2 text-[9px] text-slate-400 text-center leading-relaxed">
                {formConfig.footerNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
