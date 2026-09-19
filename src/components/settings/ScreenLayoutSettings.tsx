import React, { useState } from 'react';
import {
  Monitor,
  LayoutGrid,
  Check,
  RotateCcw,
  Palette,
  Maximize2,
  Minimize2,
  Columns,
  Eye,
  ShoppingBag,
  CreditCard,
  Sparkles,
  Utensils,
  Store,
  ChefHat,
  Printer,
  Layers,
} from 'lucide-react';
import { ScreenLayoutConfig, CategoryStyleConfig, Product, PosScreenMode } from '../../types';

interface ScreenLayoutSettingsProps {
  screenLayout: ScreenLayoutConfig;
  categoryStyles: CategoryStyleConfig[];
  products: Product[];
  onUpdateScreenLayout: (layout: ScreenLayoutConfig) => void;
  lang: 'ar' | 'en';
}

export function ScreenLayoutSettings({
  screenLayout,
  categoryStyles,
  products,
  onUpdateScreenLayout,
  lang,
}: ScreenLayoutSettingsProps) {
  const [layout, setLayout] = useState<ScreenLayoutConfig>({
    ...screenLayout,
    posMode: screenLayout.posMode || 'retail',
  });
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    onUpdateScreenLayout(layout);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReset = () => {
    const defaults: ScreenLayoutConfig = {
      posMode: 'retail',
      categoryPosition: 'top',
      categoryStyle: 'pills',
      categoryButtonSize: 'md',
      productGridColumns: 4,
      productCardSize: 'normal',
      showProductImages: true,
      showProductPrice: true,
      showProductStock: true,
      showProductBarcode: false,
      productCardColorTheme: 'colored_by_category',
      fontSize: 'md',
      cartPosition: 'left',
      quickActionButtonsSize: 'md',
      quickPayButtonColor: 'emerald',
      restaurantDefaultOrderType: 'dine_in',
      enableKitchenPrinting: true,
      printPrepTicketOnHold: true,
      requireTableForDineIn: true,
    };
    setLayout(defaults);
    onUpdateScreenLayout(defaults);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const PAY_COLORS = [
    { id: 'emerald', label: 'أخضر زمردي', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
    { id: 'blue', label: 'أزرق كلاسيكي', bg: 'bg-blue-600', ring: 'ring-blue-500' },
    { id: 'indigo', label: 'نيلي ملكي', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
    { id: 'amber', label: 'عنبري دافئ', bg: 'bg-amber-600', ring: 'ring-amber-500' },
    { id: 'purple', label: 'أرجواني', bg: 'bg-purple-600', ring: 'ring-purple-500' },
    { id: 'rose', label: 'وردي ياقوتي', bg: 'bg-rose-600', ring: 'ring-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'ar' ? 'تخصيص شاشة البيع: أحجام، مواقع وألوان الأزرار' : 'Screen Layout & Button Appearance'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'التحكم بموقع شريط المجموعات، حجم أزرار الأصناف والمجموعات، عدد أعمدة العرض، وموقع السلة وألوان أزرار الدفع.'
              : 'Customize category bar placement, product card size, grid columns, cart dock, and payment button colors.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تطبيق وحفظ التخصيص' : 'Apply Layout'}</span>
          </button>
        </div>
      </div>

      {showToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'ar' ? 'تم تطبيق وحفظ إعدادات عرض الشاشة والأزرار بنجاح!' : 'Screen layout saved successfully!'}</span>
        </div>
      )}

      {/* Settings Grid + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Mode Selection Card: Retail vs Restaurant */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'ar' ? 'نوع شاشة نقطة البيع المعتمدة (POS Mode)' : 'Active POS Screen Mode'}</span>
              </h3>
              <span className="text-[11px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                {layout.posMode === 'restaurant' ? 'نمط المطاعم والكافيهات' : 'نمط المبيعات التجارية'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ar'
                ? 'اختر واجهة نقطة البيع الافتراضية للنظام بين شاشة المبيعات التجارية ونقاط التجزئة العامة أو شاشة المطاعم والكافيهات باللمس السريع ومحددات الوجبات وإدارة الطاولات.'
                : 'Choose the active POS interface: standard Commercial Retail POS or Smart Touch Restaurant POS.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLayout({ ...layout, posMode: 'retail' })}
                className={`p-4 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  layout.posMode === 'retail'
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${layout.posMode === 'retail' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                    <Store className="w-4 h-4" />
                  </div>
                  {layout.posMode === 'retail' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <h4 className="text-xs font-bold">{lang === 'ar' ? 'شاشة المبيعات التجارية والتجزئة' : 'Commercial & Retail POS'}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ar' ? 'مناسبة للسوبرماركت، نقاط التجزئة، موازين الباركود، والفواتير السريعة' : 'Ideal for supermarkets, grocery stores, scale barcodes, and retail sales'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLayout({ ...layout, posMode: 'restaurant' })}
                className={`p-4 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  layout.posMode === 'restaurant'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${layout.posMode === 'restaurant' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                    <Utensils className="w-4 h-4" />
                  </div>
                  {layout.posMode === 'restaurant' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <h4 className="text-xs font-bold">{lang === 'ar' ? 'شاشة المطاعم والكافيهات (Smart Touch)' : 'Restaurant & Smart Touch POS'}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ar' ? 'أزرار لمس كبيرة، محددات الوجبات، طاولات الصالة، وأوامر تحضير المطبخ (KOT)' : 'Big touch tiles, meal modifiers, table floor plans, and KOT kitchen printing'}
                </p>
              </button>
            </div>

            {/* Restaurant specific options if restaurant mode enabled */}
            {layout.posMode === 'restaurant' && (
              <div className="mt-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                  <span>خيارات المطابخ والطباعة السريعة:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layout.enableKitchenPrinting ?? true}
                      onChange={(e) => setLayout({ ...layout, enableKitchenPrinting: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      طباعة نسخة التحضير للمطبخ عند التخزين
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layout.printPrepTicketOnHold ?? true}
                      onChange={(e) => setLayout({ ...layout, printPrepTicketOnHold: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      طباعة كامل فاتورة التحضير على المجموعة العامة
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Categories Bar Layout */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              <span>{lang === 'ar' ? 'موقع وحجم أزرار المجموعات (Categories)' : 'Categories Placement & Size'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'موقع شريط المجموعات في الشاشة:' : 'Category Bar Position:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top', label: 'في الأعلى (Top)' },
                    { id: 'right', label: 'في اليمين (Right)' },
                    { id: 'left', label: 'في اليسار (Left)' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setLayout({ ...layout, categoryPosition: pos.id as ScreenLayoutConfig['categoryPosition'] })}
                      className={`p-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                        layout.categoryPosition === pos.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'حجم أزرار المجموعات:' : 'Category Button Size:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sm', label: 'صغير (S)' },
                    { id: 'md', label: 'متوسط (M)' },
                    { id: 'lg', label: 'كبير (L)' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setLayout({ ...layout, categoryButtonSize: sz.id as 'sm' | 'md' | 'lg' })}
                      className={`p-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                        layout.categoryButtonSize === sz.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Product Cards & Grid Columns */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Columns className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ar' ? 'شبكة الأصناف وبطاقات المنتجات' : 'Products Grid & Card Size'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'عدد أعمدة شبكة المنتجات في الشاشة:' : 'Grid Columns:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([3, 4, 5, 6] as const).map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => setLayout({ ...layout, productGridColumns: cols })}
                      className={`p-2 rounded-xl text-center font-mono font-bold border transition-all cursor-pointer ${
                        layout.productGridColumns === cols
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cols} {lang === 'ar' ? 'أعمدة' : 'Cols'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'حجم وتفاصيل بطاقة المنتج:' : 'Product Card Size:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'مدمج (سريع)' },
                    { id: 'normal', label: 'قياسي' },
                    { id: 'large', label: 'كبير وموسع' },
                  ].map((cs) => (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => setLayout({ ...layout, productCardSize: cs.id as 'compact' | 'normal' | 'large' })}
                      className={`p-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                        layout.productCardSize === cs.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility checkboxes */}
            <div className="pt-2">
              <span className="block text-slate-600 dark:text-slate-300 font-semibold mb-2 text-xs">
                {lang === 'ar' ? 'العناصر الظاهرة داخل بطاقة الصنف:' : 'Product Card Visible Elements:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layout.showProductImages}
                    onChange={(e) => setLayout({ ...layout, showProductImages: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>{lang === 'ar' ? 'صورة الصنف' : 'Item Image'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layout.showProductPrice}
                    onChange={(e) => setLayout({ ...layout, showProductPrice: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>{lang === 'ar' ? 'سعر البيع' : 'Price'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layout.showProductStock}
                    onChange={(e) => setLayout({ ...layout, showProductStock: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>{lang === 'ar' ? 'رصيد المخزون' : 'Stock'}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layout.showProductBarcode}
                    onChange={(e) => setLayout({ ...layout, showProductBarcode: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>{lang === 'ar' ? 'رقم الباركود' : 'Barcode'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Cart Dock & Payment Button Colors */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>{lang === 'ar' ? 'موقع السلة وألوان أزرار الدفع' : 'Cart Dock & Pay Button Color'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'موقع سلة الفاتورة في الشاشة:' : 'Cart Dock Position:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayout({ ...layout, cartPosition: 'left' })}
                    className={`p-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      layout.cartPosition === 'left'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-600 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'ar' ? 'في اليسار (الافتراضي للغة العربية)' : 'Left Side'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout({ ...layout, cartPosition: 'right' })}
                    className={`p-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      layout.cartPosition === 'right'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-600 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'ar' ? 'في اليمين' : 'Right Side'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'لون زر الدفع الرئيسي السريع:' : 'Quick Pay Button Color:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAY_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setLayout({ ...layout, quickPayButtonColor: col.id as ScreenLayoutConfig['quickPayButtonColor'] })}
                      className={`p-1.5 rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer ${
                        layout.quickPayButtonColor === col.id
                          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${col.bg}`} />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive POS Layout Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs sticky top-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'المعاينة الحية لتخطيط شاشة البيع' : 'Real-Time Layout Simulation'}
                </h3>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                Simulation
              </span>
            </div>

            {/* Simulated POS Screen */}
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              {/* Category bar at top if chosen */}
              {layout.categoryPosition === 'top' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['الكل', 'ألبان', 'زيوت', 'حبوب', 'منظفات'].map((cat, i) => (
                    <div
                      key={cat}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold shrink-0 text-white ${
                        i === 0 ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}

              {/* Main Area: Split between Products & Cart */}
              <div
                className={`grid grid-cols-12 gap-2 ${
                  layout.cartPosition === 'right' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Cart Preview (Takes 4 cols) */}
                <div
                  className={`bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between ${
                    layout.cartPosition === 'left' ? 'col-span-5 order-1' : 'col-span-5 order-2'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-100 dark:border-slate-700 flex justify-between">
                      <span>{lang === 'ar' ? 'سلة المشتريات' : 'Cart'}</span>
                      <span className="font-mono text-emerald-600">3 {lang === 'ar' ? 'بنود' : 'items'}</span>
                    </div>

                    <div className="space-y-1 my-2">
                      <div className="text-[9px] bg-slate-50 dark:bg-slate-750 p-1 rounded flex justify-between">
                        <span>حليب نادك 2 لتر</span>
                        <span className="font-mono font-bold">11.00</span>
                      </div>
                      <div className="text-[9px] bg-slate-50 dark:bg-slate-750 p-1 rounded flex justify-between">
                        <span>تفاح سكري (1.75 كجم)</span>
                        <span className="font-mono font-bold text-amber-600">14.88</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Pay Button in Simulated Cart */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    {(() => {
                      const payCol = PAY_COLORS.find((c) => c.id === layout.quickPayButtonColor) || PAY_COLORS[0];
                      return (
                        <div
                          className={`w-full py-2 rounded-lg text-white font-bold text-center text-[10px] shadow-xs flex items-center justify-center gap-1 ${payCol.bg}`}
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>دفع فوري (25.88 ر.س)</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Products Grid Preview (Takes 7 cols) */}
                <div
                  className={`space-y-2 ${
                    layout.cartPosition === 'left' ? 'col-span-7 order-2' : 'col-span-7 order-1'
                  }`}
                >
                  <div
                    className={`grid gap-1.5 ${
                      layout.productGridColumns >= 5
                        ? 'grid-cols-3'
                        : layout.productGridColumns === 4
                        ? 'grid-cols-2'
                        : 'grid-cols-2'
                    }`}
                  >
                    {[1, 2, 3, 4].map((itemNum) => (
                      <div
                        key={itemNum}
                        className={`bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center ${
                          layout.productCardSize === 'compact'
                            ? 'py-1'
                            : layout.productCardSize === 'large'
                            ? 'py-3'
                            : 'py-2'
                        }`}
                      >
                        {layout.showProductImages && (
                          <div className="w-6 h-6 mx-auto mb-1 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <ShoppingBag className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        <div className="text-[9px] font-bold truncate text-slate-800 dark:text-slate-200">
                          صنف تجريبي {itemNum}
                        </div>
                        {layout.showProductPrice && (
                          <div className="text-[9px] font-mono font-bold text-emerald-600">
                            {(itemNum * 8.5).toFixed(2)} ر.س
                          </div>
                        )}
                        {layout.showProductStock && (
                          <div className="text-[8px] text-slate-400">مخزون: 45</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'انقر على "تطبيق وحفظ التخصيص" بالأعلى لاعتماد المظهر على شاشة الكاشير فوراً.'
                  : 'Click "Apply Layout" to apply changes to the live cashier screen.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
