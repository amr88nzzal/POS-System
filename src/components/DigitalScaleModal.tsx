import React, { useState, useEffect } from 'react';
import {
  Scale,
  X,
  Plus,
  Minus,
  RefreshCw,
  Usb,
  Barcode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowDownToLine,
  Zap,
} from 'lucide-react';
import { Product, Currency, Language } from '../types';
import { CurrencyService } from '../utils/currencies';
import { generateTestScaleBarcode, parseScaleBarcode, connectSerialScale } from '../utils/scaleBarcodeParser';
import { playBarcodeBeep } from '../utils/storage';

interface DigitalScaleModalProps {
  products: Product[];
  activeCurrency: Currency;
  lang: Language;
  onClose: () => void;
  onAddWeightedProduct: (product: Product, weightKg: number) => void;
}

export const DigitalScaleModal: React.FC<DigitalScaleModalProps> = ({
  products,
  activeCurrency,
  lang,
  onClose,
  onAddWeightedProduct,
}) => {
  // Filter products that are sold by weight or have scaleCode
  const weightedProducts = products.filter(
    (p) => p.isWeighted || p.unit === 'كجم' || p.unit === 'kg' || p.scaleCode || p.category.includes('ميزان')
  );

  const [selectedProduct, setSelectedProduct] = useState<Product>(
    weightedProducts[0] || products[0]
  );
  const [currentWeight, setCurrentWeight] = useState<number>(1.25);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [isTareActive, setIsTareActive] = useState<boolean>(false);
  const [scaleBarcodeTestCode, setScaleBarcodeTestCode] = useState<string>('');
  const [barcodeParseResult, setBarcodeParseResult] = useState<string | null>(null);
  const [serialStatus, setSerialStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [serialError, setSerialError] = useState<string | null>(null);

  // Net weight on scale
  const netWeight = Math.max(0, currentWeight - (isTareActive ? tareWeight : 0));
  const calculatedTotal = Number((netWeight * (selectedProduct?.price || 0)).toFixed(2));

  // Initialize test barcode for selected product
  useEffect(() => {
    if (selectedProduct) {
      const code = selectedProduct.scaleCode || selectedProduct.code.replace(/\D/g, '').padStart(5, '0').slice(-5);
      const testBarcode = generateTestScaleBarcode(code, netWeight, 'weight');
      setScaleBarcodeTestCode(testBarcode);
    }
  }, [selectedProduct, netWeight]);

  // Adjust weight
  const addWeight = (delta: number) => {
    setCurrentWeight((prev) => Number(Math.max(0.01, prev + delta).toFixed(3)));
  };

  // Toggle Tare
  const handleTare = () => {
    if (!isTareActive) {
      setTareWeight(0.05); // standard container tare 50g
      setIsTareActive(true);
    } else {
      setIsTareActive(false);
      setTareWeight(0);
    }
  };

  const handleZero = () => {
    setCurrentWeight(0.0);
    setIsTareActive(false);
    setTareWeight(0);
  };

  // Direct USB / Serial connect
  const handleConnectSerial = async () => {
    setSerialStatus('connecting');
    setSerialError(null);
    try {
      const disconnect = await connectSerialScale(
        (weightKg) => {
          setSerialStatus('connected');
          setCurrentWeight(weightKg);
        },
        (err) => {
          setSerialStatus('disconnected');
          setSerialError(err);
        }
      );
      return disconnect;
    } catch {
      setSerialStatus('disconnected');
    }
  };

  // Add weighted item to cart
  const handleConfirmAddToCart = () => {
    if (netWeight <= 0) {
      alert(lang === 'ar' ? 'الرجاء وضع وزن صالح على الميزان!' : 'Please enter a valid weight!');
      return;
    }
    playBarcodeBeep();
    onAddWeightedProduct(selectedProduct, netWeight);
    onClose();
  };

  // Simulate scanning generated scale barcode
  const handleTestScanBarcode = () => {
    const parsed = parseScaleBarcode(scaleBarcodeTestCode, products);
    if (parsed.isScaleBarcode && parsed.matchedProduct && parsed.weightKg) {
      playBarcodeBeep();
      setBarcodeParseResult(
        lang === 'ar'
          ? `تم قراءة الباركود بنجاح: صنف [${parsed.matchedProduct.nameAr}] بوزن [${parsed.weightKg} كجم] بقيمة [${(
              parsed.weightKg * parsed.matchedProduct.price
            ).toFixed(2)} ر.س]`
          : `Scale Barcode parsed: [${parsed.matchedProduct.nameEn}] Weight: [${parsed.weightKg} kg]`
      );
      onAddWeightedProduct(parsed.matchedProduct, parsed.weightKg);
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setBarcodeParseResult(lang === 'ar' ? 'تعذر مطابقة باركود الميزان' : 'Could not match scale barcode');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 dark:text-slate-100 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                <span>{lang === 'ar' ? 'محطة الميزان الرقمي الإلكتروني' : 'Digital Weighing Station'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold">
                  {lang === 'ar' ? 'مباشر وتلقائي' : 'Live Scale'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar'
                  ? 'دعم موازين التجزئة الرقمية، قراءة الوزن الحية، وتحليل باركود الموازين'
                  : 'Retail scale parser, direct weighing & price calculation'}
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

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Product Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{lang === 'ar' ? 'اختر الصنف المراد وزنه:' : 'Select Weighted Item:'}</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                {weightedProducts.length} {lang === 'ar' ? 'صنف موزون متاح' : 'weighted items'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {weightedProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-2 rounded-xl border text-start transition-all cursor-pointer ${
                    selectedProduct?.id === p.id
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {lang === 'ar' ? p.nameAr : p.nameEn}
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500 dark:text-slate-400 font-mono">
                    <span>{CurrencyService.format(p.price, activeCurrency, lang)}/كجم</span>
                    {p.scaleCode && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-600 dark:text-blue-400">
                        #{p.scaleCode}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DIGITAL SCALE DISPLAY (LED SCREEN) */}
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 text-white border-2 border-slate-800 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>STATUS: {serialStatus === 'connected' ? 'USB SCALE ACTIVE' : 'SIMULATED SCALE'}</span>
                {isTareActive && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold">
                    TARE: -{tareWeight.toFixed(3)}kg
                  </span>
                )}
              </div>
              <span>MAX: 30.000 kg | e=0.005 kg</span>
            </div>

            {/* Live Weight Number Display */}
            <div className="py-4 text-center">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                {lang === 'ar' ? 'الوزن الصافي المباشر (NET WEIGHT)' : 'CURRENT NET WEIGHT'}
              </div>
              <div className="flex items-baseline justify-center gap-2 font-mono">
                <span className="text-5xl sm:text-6xl font-black text-emerald-400 tracking-wider drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                  {netWeight.toFixed(3)}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-500/80">
                  {lang === 'ar' ? 'كجم' : 'kg'}
                </span>
              </div>

              {/* Price calculation inside scale */}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-mono text-slate-300">
                <span>
                  {lang === 'ar' ? 'سعر الكيلو:' : 'Unit Price:'}{' '}
                  <strong className="text-white">{CurrencyService.format(selectedProduct?.price || 0, activeCurrency, lang)}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  {lang === 'ar' ? 'المبلغ الإجمالي:' : 'Total Due:'}{' '}
                  <strong className="text-amber-400 text-base font-bold">
                    {CurrencyService.format(calculatedTotal, activeCurrency, lang)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Quick Tare & Scale Control Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleTare}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                    isTareActive ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  TARE (خصم الوعاء)
                </button>
                <button
                  onClick={handleZero}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono transition-colors"
                >
                  ZERO (تصفير)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleConnectSerial}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-900/60 hover:bg-blue-800/80 text-blue-300 border border-blue-700/50 rounded-lg text-xs font-medium"
                  title="توصيل ميزان خارجي عبر كابل USB / COM (Web Serial)"
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'ربط ميزان USB' : 'Connect USB'}</span>
                </button>
              </div>
            </div>
            {serialError && (
              <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{serialError}</span>
              </div>
            )}
          </div>

          {/* Weight Adjust Stepper & Presets */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {lang === 'ar' ? 'تعديل أو محاكاة الوزن على الحساس:' : 'Adjust Weight / Quick Presets:'}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[0.1, 0.25, 0.5, 1.0, 1.5, 2.0].map((w) => (
                <button
                  key={w}
                  onClick={() => setCurrentWeight(w)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-750 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-200"
                >
                  {w.toFixed(3)} كجم
                </button>
              ))}

              <div className="flex items-center gap-1 ms-auto">
                <button
                  onClick={() => addWeight(-0.1)}
                  className="w-7 h-7 bg-white dark:bg-slate-750 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="0.05"
                  min="0.01"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Math.max(0, Number(e.target.value)))}
                  className="w-20 text-center py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold"
                />
                <button
                  onClick={() => addWeight(0.1)}
                  className="w-7 h-7 bg-white dark:bg-slate-750 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* DIGITAL SCALE BARCODE DEMONSTRATION & TESTING */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-amber-600" />
                <span>{lang === 'ar' ? 'باركود الميزان التلقائي (EAN-13 وزني):' : 'Generated Scale Barcode (EAN-13):'}</span>
              </span>
              <span className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200 font-bold">
                {scaleBarcodeTestCode}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-snug">
              {lang === 'ar'
                ? 'عند طباعة ملصق الوزن من ميزان الخضار/اللحوم، يقوم قارئ الباركود بقراءة كود الصنف (الـ 5 أرقام الأولى) والوزن الصافي (الـ 5 أرقام التالية) وإدراجه مباشرة في الفاتورة.'
                : 'Scanners read the prefix, item scale code, and net weight in grams automatically.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestScanBarcode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'محاكاة مسح ملصق هذا الميزان' : 'Test Scan This Barcode'}</span>
              </button>
              {barcodeParseResult && (
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                  {barcodeParseResult}
                </span>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleConfirmAddToCart}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `إدراج الصنف بالسلة (${netWeight.toFixed(3)} كجم - ${CurrencyService.format(
                      calculatedTotal,
                      activeCurrency,
                      lang
                    )})`
                  : `Add to Cart (${netWeight.toFixed(3)} kg)`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-colors"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
