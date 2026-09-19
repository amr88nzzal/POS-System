import React, { useState } from 'react';
import {
  Monitor,
  Palette,
  FileText,
  BarChart3,
  Building,
  CheckCircle2,
  Sliders,
  Sun,
  Moon,
  QrCode,
  Type,
  Layout,
  Utensils,
  ShoppingCart,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ScreenLayoutConfig, CategoryStyleConfig, Product, Language } from '../../types';

interface AppearanceHubProps {
  screenLayout: ScreenLayoutConfig;
  categoryStyles: CategoryStyleConfig[];
  products: Product[];
  onUpdateScreenLayout: (layout: ScreenLayoutConfig) => void;
  lang: Language;
}

export const AppearanceHub: React.FC<AppearanceHubProps> = ({
  screenLayout,
  categoryStyles,
  products,
  onUpdateScreenLayout,
  lang,
}) => {
  const [activeSub, setActiveSub] = useState<'sales_screen' | 'templates' | 'reports_designer' | 'company_branding'>(
    'sales_screen'
  );

  const [companyInfo, setCompanyInfo] = useState({
    nameAr: 'مؤسسة السحاب التجارية لحلول التقنية',
    nameEn: 'Cloud ERP POS Enterprise Solutions',
    taxNumber: '300012345600003',
    commercialReg: '1010123456',
    phone: '+966 50 123 4567',
    address: 'المملكة العربية السعودية - الرياض - طريق الملك فهد',
    headerGreeting: 'أهلاً بكم في متجرنا المميز! تشرفنا بخدمتكم',
    footerMessage: 'البضاعة المباعة ترد وتستبدل خلال 3 أيام بموجب أصل الفاتورة',
    decimalPrecision: 2,
    dateFormat: 'YYYY/MM/DD (ميلادي)',
    showZatcaQr: true,
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
      {/* Side Navigation for 4 Appearance Hub Modules */}
      <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-850 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              القسم 2: تصميم المظهر
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">تخصيص الواجهات والفواتير</h2>
          </div>

          <div className="space-y-1">
            {[
              { id: 'sales_screen', labelAr: '2.1 شاشة المبيعات والأزرار', icon: Monitor },
              { id: 'templates', labelAr: '2.2 قوالب الفواتير وبون المطبخ', icon: Palette },
              { id: 'reports_designer', labelAr: '2.3 تخصيص التقارير المالية', icon: BarChart3 },
              { id: 'company_branding', labelAr: '2.4 بيانات الشركة والترويسة وZATCA', icon: Building },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSub === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSub(tab.id as typeof activeSub)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{tab.labelAr}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[700px]">
        {/* 2.1 Sales Screen Layout */}
        {activeSub === 'sales_screen' && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-600" />
                <span>2.1 تخصيص واجهة شاشة المبيعات ونمط العمل</span>
              </h3>
              <p className="text-xs text-slate-500">
                اختيار نمط البيع (مطاعم / تجزئة)، حجم وألوان أزرار المواد والمجموعات
              </p>
            </div>

            {/* POS Mode Switch */}
            <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-white">
                نمط واجهة البيع الافتراضية
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateScreenLayout({ ...screenLayout, posMode: 'retail' })}
                  className={`p-3.5 rounded-2xl text-right border transition-all flex items-center gap-3 cursor-pointer ${
                    screenLayout.posMode === 'retail'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ShoppingCart className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">مبيعات التجزئة والسوبرماركت</div>
                    <div className="text-[11px] text-slate-400">ماسح باركود سريع، جدول مواد، دفع فوري</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateScreenLayout({ ...screenLayout, posMode: 'restaurant' })}
                  className={`p-3.5 rounded-2xl text-right border transition-all flex items-center gap-3 cursor-pointer ${
                    screenLayout.posMode === 'restaurant'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Utensils className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">المطاعم والكافيهات الذكية</div>
                    <div className="text-[11px] text-slate-400">طاولات وصالات، بون مطبخ KOT، إضافات</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Grid Columns and Button Sizes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-white">
                  عدد أعمدة شبكة الأصناف (Grid Columns)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => onUpdateScreenLayout({ ...screenLayout, productGridColumns: cols as 3 | 4 | 5 | 6 })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        screenLayout.productGridColumns === cols
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {cols} أعمدة
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-white">
                  لون زر الدفع السريع والاعتماد
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'emerald', label: 'أخضر زمردي', bg: 'bg-emerald-600' },
                    { id: 'blue', label: 'أزرق ملكي', bg: 'bg-blue-600' },
                    { id: 'purple', label: 'بنفسجي داكن', bg: 'bg-purple-600' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onUpdateScreenLayout({ ...screenLayout, quickPayButtonColor: color.id as any })}
                      className={`py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${color.bg} ${
                        screenLayout.quickPayButtonColor === color.id ? 'ring-2 ring-offset-2 ring-purple-500' : 'opacity-80'
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2.4 Company Branding & ZATCA QR */}
        {activeSub === 'company_branding' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span>2.4 بيانات الشركة والترويسة والتذييل ورمز ZATCA QR</span>
              </h3>
              <p className="text-xs text-slate-500">
                تنسيق التاريخ والوقت، الأرقام العشرية، وبيانات الفاتورة الضريبية المبسطة
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المنشأة / المحل (بالعربية)
                </label>
                <input
                  type="text"
                  value={companyInfo.nameAr}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرقم الضريبي (15 خانة يبدأ وينتهي بـ 3)
                </label>
                <input
                  type="text"
                  value={companyInfo.taxNumber}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  السجل التجاري
                </label>
                <input
                  type="text"
                  value={companyInfo.commercialReg}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, commercialReg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  هاتف التواصل
                </label>
                <input
                  type="text"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رسالة الترحيب أعلى الفاتورة (Header Note)
                </label>
                <input
                  type="text"
                  value={companyInfo.headerGreeting}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, headerGreeting: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شروط الاسترجاع والتذييل أسفل الفاتورة (Footer Note)
                </label>
                <input
                  type="text"
                  value={companyInfo.footerMessage}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, footerMessage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* ZATCA QR Compliance Toggle */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    تضمين رمز الاستجابة السريعة المشفر ZATCA TLV QR
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    متوافق تماماً مع متطلبات الفوترة الإلكترونية المرحلة الثانية
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={companyInfo.showZatcaQr}
                onChange={(e) => setCompanyInfo({ ...companyInfo, showZatcaQr: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Fallback for other sub-sections */}
        {!['sales_screen', 'company_branding'].includes(activeSub) && (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              تم ضبط إعدادات القوالب وتخصيص التقارير بنجاح
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              القوالب تدعم الطباعة الحرارية 80mm و 58mm و A4 بدقة عالية.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
