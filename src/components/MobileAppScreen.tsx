import React, { useState } from 'react';
import {
  Smartphone,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Bell,
  Clock,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Invoice, Product, FieldRep, Warehouse, Language } from '../types';

interface MobileAppScreenProps {
  invoices: Invoice[];
  products: Product[];
  reps: FieldRep[];
  warehouses: Warehouse[];
  lang: Language;
}

export const MobileAppScreen: React.FC<MobileAppScreenProps> = ({
  invoices,
  products,
  reps,
  warehouses,
  lang,
}) => {
  const [frameMode, setFrameMode] = useState<boolean>(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((i) => i.date === todayStr);
  const totalTodaySales = todayInvoices.reduce((sum, i) => sum + i.total, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.minStockAlert);
  const activeReps = reps.filter((r) => r.status === 'active');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'تطبيق الهاتف الذكي للمالك والمدير (Executive Mobile App)' : 'Executive Mobile App'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'متابعة حية للمبيعات، إشعارات المخزون الحرج، ورقابة الفروع ومسارات المندوبين من أي مكان'
              : 'Remote real-time KPI dashboard, branch monitoring, and instant low-stock alerts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFrameMode(!frameMode)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {frameMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            <span>{frameMode ? 'عرض شاشة واسعة' : 'محاكاة إطار هاتف آيفون'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex justify-center items-center py-4">
        {/* Phone Case Frame */}
        <div
          className={`transition-all duration-300 ${
            frameMode
              ? 'w-[380px] max-w-full bg-slate-900 rounded-[48px] p-4 shadow-2xl border-4 border-slate-800 ring-8 ring-slate-900/40 relative'
              : 'w-full bg-slate-100 rounded-3xl p-6 border border-slate-200'
          }`}
        >
          {/* Speaker / Dynamic Island on Phone */}
          {frameMode && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
            </div>
          )}

          {/* Screen Glass */}
          <div className="bg-slate-50 rounded-[36px] overflow-hidden flex flex-col h-[740px] shadow-inner text-slate-900 font-sans">
            {/* Mobile Top Status Bar */}
            <div className="pt-8 px-6 pb-3 flex items-center justify-between bg-white text-[11px] font-bold text-slate-800 border-b border-slate-100">
              <span className="font-mono">9:41</span>
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-semibold">مباشر ومحدث</span>
              </div>
            </div>

            {/* Mobile Header App Bar */}
            <div className="bg-white px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">نظام سحابي موحد</span>
                <h3 className="text-sm font-extrabold text-slate-900">لوحة تحكم الإدارة العليا</h3>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {lowStockItems.length}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Mobile Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Branch Selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedBranch('all')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    selectedBranch === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  كافة الفروع
                </button>
                {warehouses.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedBranch(w.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      selectedBranch === w.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {lang === 'ar' ? w.nameAr : w.nameEn}
                  </button>
                ))}
              </div>

              {/* Primary Sales KPI Card */}
              <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[11px] text-blue-200 block font-medium">مبيعات اليوم اللحظية</span>
                  <div className="text-2xl font-black font-mono mt-1">
                    {totalTodaySales.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-500/30 flex justify-between text-[11px]">
                    <div>
                      <span className="text-blue-200 block text-[10px]">الفواتير الصادرة</span>
                      <span className="font-bold font-mono">{todayInvoices.length} فاتورة</span>
                    </div>
                    <div>
                      <span className="text-blue-200 block text-[10px]">المندوبين الميدانيين</span>
                      <span className="font-bold font-mono">{activeReps.length} نشط</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Alert if Low Stock */}
              {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-amber-900 block">تنبيه نقص المخزون الحرج</span>
                    <span className="text-amber-700 text-[10px]">
                      يوجد {lowStockItems.length} صنف وصل إلى حد الطلب الأدنى، يرجى إصدار أمر شراء.
                    </span>
                  </div>
                </div>
              )}

              {/* Real-time Order Stream */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>آخر فواتير تمت الآن</span>
                  </span>
                  <span className="text-[10px] text-blue-600 cursor-pointer">عرض الكل</span>
                </div>

                <div className="space-y-2">
                  {invoices.slice(0, 4).map((inv) => (
                    <div key={inv.id} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                          POS
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{inv.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-400">{inv.cashierName} • {inv.time}</div>
                        </div>
                      </div>
                      <span className="font-mono font-black text-slate-900">
                        {inv.total.toFixed(2)} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Field Reps summary */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>تتبع المندوبين عن بعد</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{activeReps.length} في الميدان</span>
                </div>

                {reps.slice(0, 2).map((r) => (
                  <div key={r.id} className="p-2 border border-slate-100 rounded-xl flex justify-between items-center text-[11px]">
                    <div>
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-400">{r.currentLocation.address}</div>
                    </div>
                    <div className="text-end">
                      <span className="font-mono font-bold text-emerald-600 block">{r.todaySales.toFixed(0)} ر.س</span>
                      <span className="text-[9px] text-slate-400">{r.todayOrdersCount} طلب</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="bg-white border-t border-slate-200 py-2 px-6 flex justify-around text-slate-400 text-[10px]">
              <div className="flex flex-col items-center gap-1 text-blue-600 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>الرئيسية</span>
              </div>
              <div className="flex flex-col items-center gap-1 hover:text-slate-700 cursor-pointer">
                <ShoppingBag className="w-4 h-4" />
                <span>المبيعات</span>
              </div>
              <div className="flex flex-col items-center gap-1 hover:text-slate-700 cursor-pointer">
                <AlertTriangle className="w-4 h-4" />
                <span>المخزون</span>
              </div>
              <div className="flex flex-col items-center gap-1 hover:text-slate-700 cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
                <span>الإدارة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
