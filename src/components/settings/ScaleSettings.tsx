import React, { useState } from 'react';
import {
  Scale,
  Barcode,
  Check,
  AlertCircle,
  Cpu,
  RefreshCw,
  Settings,
  HelpCircle,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ScaleConfig, Product } from '../../types';
import { parseScaleBarcode } from '../../utils/scaleBarcodeParser';

interface ScaleSettingsProps {
  scaleConfig: ScaleConfig;
  products: Product[];
  onUpdateScaleConfig: (config: ScaleConfig) => void;
  lang: 'ar' | 'en';
}

export function ScaleSettings({
  scaleConfig,
  products,
  onUpdateScaleConfig,
  lang,
}: ScaleSettingsProps) {
  const [config, setConfig] = useState<ScaleConfig>({ ...scaleConfig });
  const [testBarcode, setTestBarcode] = useState<string>('2000103017505');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Live parsing test
  const parseResult = parseScaleBarcode(testBarcode, products, config);

  const handleSave = () => {
    onUpdateScaleConfig(config);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: ScaleConfig = {
      enabled: true,
      model: 'CAS CL-5000 / Mettler Toledo',
      port: 'USB / Virtual COM3',
      baudRate: 9600,
      fallbackToScaleIfNotFound: true,
      totalDigits: 13,
      allowedPrefixes: ['20', '21', '22', '23', '24', '25', '02', '99'],
      itemCodeDigitsCount: 5,
      valueDigitsCount: 5,
      weightDecimalPlaces: 3,
      hasCheckDigit: true,
    };
    setConfig(defaults);
    onUpdateScaleConfig(defaults);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // Preset sample barcodes for the tester
  const PRESET_TEST_BARCODES = [
    { label: 'صنف 00103 وزن 1.750 كجم (قياسي 5+5)', code: '2000103017505' },
    { label: 'صنف 00111 وزن 0.850 كجم (قياسي 5+5)', code: '2000111008502' },
    { label: 'صنف ميزان بقيمة سعرية 25.50 ر.س (بادئة 21)', code: '2100103025508' },
    { label: 'كود 6 خانات + وزن 4 خانات (123456 + 1250)', code: '2012345612503' },
  ];

  // Visual breakdown calculation
  const getBarcodeBreakdown = () => {
    const clean = testBarcode.trim();
    if (!clean) return null;

    const matchedPrefix = config.allowedPrefixes.find((p) => clean.startsWith(p));
    const prefixLen = matchedPrefix ? matchedPrefix.length : 2;
    const prefix = clean.substring(0, prefixLen);

    const codeStart = prefixLen;
    const codeEnd = codeStart + config.itemCodeDigitsCount;
    const itemCode = clean.substring(codeStart, codeEnd);

    const valStart = codeEnd;
    const valEnd = valStart + config.valueDigitsCount;
    const valStr = clean.substring(valStart, valEnd);

    const checkDigit = clean.substring(valEnd, valEnd + 1) || '';
    const remainder = clean.substring(valEnd + (config.hasCheckDigit ? 1 : 0));

    return {
      prefix,
      itemCode,
      valStr,
      checkDigit,
      remainder,
    };
  };

  const breakdown = getBarcodeBreakdown();

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500" />
            <span>{lang === 'ar' ? 'تعريف وبرمجة الموازين الإلكترونية وقواعد الباركود' : 'Digital Scale Definition & Barcode Parsing'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تحديد قواعد تفكيك باركود الميزان (خانات رمز المادة، خانات الوزن أو القيمة)، وقاعدة الاعتماد التلقائي للميزان عند عدم توفر الباركود.'
              : 'Configure scale barcode structure, item code digits, weight decimals, and fallback logic.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ إعدادات الميزان' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'ar' ? 'تم حفظ وتفعيل إعدادات قراءة باركود الميزان بنجاح!' : 'Scale settings saved successfully!'}</span>
        </div>
      )}

      {/* Main Grid: Settings on Left, Interactive Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules & Hardware Settings */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. General Activation & Hardware */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'منفذ الاتصال وطراز الميزان' : 'Scale Model & Port'}
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'ar' ? 'تفعيل نظام الميزان' : 'Enable Scale'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'طراز الميزان المدعوم:' : 'Scale Model:'}
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="CAS CL-5000 / Mettler Toledo">CAS CL-5000 / CL-5200 (الأكثر شيوعاً)</option>
                  <option value="Mettler Toledo b-Plus / Tiger">Mettler Toledo Tiger / b-Plus</option>
                  <option value="Digi SM-100 / SM-5100">Digi SM-100 / SM-500</option>
                  <option value="Dibal 500 / Wind Series">Dibal 500 / Mistral Series</option>
                  <option value="Avery Berkel FX Series">Avery Berkel FX / XM Series</option>
                  <option value="Generic Serial/USB Scale">ميزان رقمي عام (Generic EAN-13)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'منفذ الربط (Port):' : 'Interface Port:'}
                </label>
                <input
                  type="text"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: e.target.value })}
                  placeholder="USB / Virtual COM3"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. Critical Rule: Fallback if barcode not in DB */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {lang === 'ar'
                      ? 'قاعدة المعالجة التلقائية: في حال عدم وجود الباركود اعتباره مادة ميزان'
                      : 'Fallback Rule: Treat unlisted barcodes as scale items'}
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.fallbackToScaleIfNotFound}
                      onChange={(e) => setConfig({ ...config, fallbackToScaleIfNotFound: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1.5 leading-relaxed">
                  {lang === 'ar'
                    ? 'عند تمرير باركود ميزان غير مضاف مسبقاً في قائمة الأصناف بالكامل، سيقوم النظام تلقائياً بتحليله واقتطاع رمز المادة والوزن، ثم البحث عن رمز الصنف الداخلي لإضافته للسلة فوراً.'
                    : 'If an scanned barcode is not found as a standard product, analyze and extract scale item code and weight payload automatically.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Detailed Barcode Segmentation Rules */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'ar' ? 'تخصيص تقسيم خانات الباركود (Digits Segmentation)' : 'Digit Segmentation Structure'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'عدد خانات الباركود الإجمالي:' : 'Total Barcode Digits:'}
                </label>
                <select
                  value={config.totalDigits}
                  onChange={(e) => setConfig({ ...config, totalDigits: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                >
                  <option value={13}>13 خانة (معيار EAN-13 العالمي للموازين)</option>
                  <option value={12}>12 خانة (معيار UPC-A)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'عدد خانات رمز المادة (Item Code Digits):' : 'Item Code Digits Count:'}
                </label>
                <select
                  value={config.itemCodeDigitsCount}
                  onChange={(e) => setConfig({ ...config, itemCodeDigitsCount: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                >
                  <option value={5}>5 خانات (مثلاً: 00103 أو 00111)</option>
                  <option value={6}>6 خانات (مثلاً: 123456 أو 000103)</option>
                  <option value={4}>4 خانات (مثلاً: 0103 أو 1110)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'عدد خانات الوزن / القيمة (Weight Digits):' : 'Weight / Value Digits Count:'}
                </label>
                <select
                  value={config.valueDigitsCount}
                  onChange={(e) => setConfig({ ...config, valueDigitsCount: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                >
                  <option value={5}>5 خانات (مثلاً: 01750 = 1.750 كجم أو 02550 هللة)</option>
                  <option value={4}>4 خانات (مثلاً: 1250 = 1.250 كجم)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الفاصلة العشرية للوزن (Decimal Places):' : 'Weight Decimals:'}
                </label>
                <select
                  value={config.weightDecimalPlaces}
                  onChange={(e) => setConfig({ ...config, weightDecimalPlaces: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                >
                  <option value={3}>3 خانات (تقسيم على 1000 - كجم بالغرام)</option>
                  <option value={2}>خانتان (تقسيم على 100)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1 text-xs">
                {lang === 'ar' ? 'البادئات المعتمدة لموازين المتجر (Prefixes):' : 'Allowed Prefixes:'}
              </label>
              <input
                type="text"
                value={config.allowedPrefixes.join(', ')}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    allowedPrefixes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="20, 21, 22, 23, 24, 25, 02, 99"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {lang === 'ar'
                  ? 'ملاحظة: البادئات 20 و 22 و 24 و 02 تشير للوزن (كجم)، والبادئات 21 و 23 تشير للقيمة الإجمالية بالريال.'
                  : 'Prefixes 20, 22, 24, 02 indicate weight; 21, 23 indicate price payload.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Tester & Visual Ribbon */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-xs sticky top-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'فاحص ومحلل الباركود التفاعلي' : 'Live Barcode Tester & Breakdown'}
                </h3>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                Live Engine
              </span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1 text-xs">
                {lang === 'ar' ? 'اكتب أو امسح الباركود للتجربة:' : 'Enter Barcode to Test:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testBarcode}
                  onChange={(e) => setTestBarcode(e.target.value)}
                  placeholder="2000103017505"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-750 border border-purple-300 dark:border-purple-700 rounded-xl text-slate-900 dark:text-white font-mono text-sm tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Barcode className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Quick Test Samples */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1.5">
                {lang === 'ar' ? 'أمثلة جاهزة للاختبار السريع:' : 'Quick Presets:'}
              </span>
              <div className="flex flex-col gap-1.5">
                {PRESET_TEST_BARCODES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTestBarcode(preset.code)}
                    className="text-right p-2 rounded-lg bg-slate-50 dark:bg-slate-750 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{preset.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Color Breakdown Ribbon */}
            {breakdown && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {lang === 'ar' ? 'التفكيك اللوني الذكي للباركود:' : 'Visual Color Breakdown:'}
                </span>

                <div className="flex items-center gap-1 font-mono text-xs font-bold p-2 bg-slate-900 text-white rounded-xl overflow-x-auto justify-center">
                  <div className="px-2 py-1 bg-purple-600 rounded text-center" title="البادئة">
                    <div className="text-[9px] text-purple-200">بادئة</div>
                    <div>{breakdown.prefix}</div>
                  </div>

                  <div className="px-2 py-1 bg-blue-600 rounded text-center" title="رمز المادة">
                    <div className="text-[9px] text-blue-200">رمز المادة</div>
                    <div>{breakdown.itemCode}</div>
                  </div>

                  <div className="px-2 py-1 bg-emerald-600 rounded text-center" title="الوزن أو القيمة">
                    <div className="text-[9px] text-emerald-200">الوزن/القيمة</div>
                    <div>{breakdown.valStr}</div>
                  </div>

                  {breakdown.checkDigit && (
                    <div className="px-2 py-1 bg-slate-600 rounded text-center" title="رقم التحقق">
                      <div className="text-[9px] text-slate-300">تحقق</div>
                      <div>{breakdown.checkDigit}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parsing Outcome Card */}
            <div className="pt-2">
              <div
                className={`p-3.5 rounded-xl border ${
                  parseResult.isScaleBarcode
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 font-bold text-xs">
                  {parseResult.isScaleBarcode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-900 dark:text-emerald-200">
                        {lang === 'ar' ? 'تم التعرف عليه كباركود ميزان بنجاح!' : 'Recognized as Scale Barcode!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-900 dark:text-rose-200">
                        {parseResult.error || (lang === 'ar' ? 'ليس باركود ميزان صالح' : 'Not a scale barcode')}
                      </span>
                    </>
                  )}
                </div>

                {parseResult.isScaleBarcode && (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'ar' ? 'رمز المادة المستخرج:' : 'Scale Item Code:'}</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {parseResult.scaleCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'ar' ? 'الوزن الصافي المحسوب:' : 'Parsed Weight:'}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {parseResult.weightKg} كجم (KG)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                      <span className="text-slate-500">{lang === 'ar' ? 'الصنف المطابق بالمخزون:' : 'Matched Item:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {parseResult.matchedProduct
                          ? parseResult.matchedProduct.nameAr
                          : lang === 'ar'
                          ? 'غير موجود (سيتم إنشاؤه تلقائياً)'
                          : 'Not in catalog'}
                      </span>
                    </div>

                    {parseResult.matchedProduct && (
                      <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white pt-1">
                        <span>{lang === 'ar' ? 'إجمالي السعر:' : 'Total Price:'}</span>
                        <span className="text-emerald-600">
                          {((parseResult.weightKg || 1) * parseResult.matchedProduct.price).toFixed(2)} ر.س
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
