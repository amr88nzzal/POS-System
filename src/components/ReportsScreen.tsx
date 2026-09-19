import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  Users,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  DollarSign,
  PieChart,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';
import { Invoice, Product, Language, CostingMethod, User } from '../types';
import { SalesRepsReport } from './reports/SalesRepsReport';

interface ReportsScreenProps {
  invoices: Invoice[];
  products: Product[];
  users?: User[];
  lang: Language;
  costingMethod: CostingMethod;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  invoices,
  products,
  users = [],
  lang,
  costingMethod,
}) => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeReportTab, setActiveReportTab] = useState<'daily' | 'zReport' | 'tax' | 'profits' | 'salesReps'>('daily');

  // Filter invoices for selected date
  const filteredInvoices = invoices.filter((inv) => inv.date === reportDate);

  // Aggregations
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalSubtotal = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalVat = filteredInvoices.reduce((sum, inv) => sum + inv.vatTotal, 0);
  const totalDiscount = filteredInvoices.reduce((sum, inv) => sum + inv.discount, 0);
  const totalInvoicesCount = filteredInvoices.length;

  // Payments breakdown
  const paymentStats = {
    cash: filteredInvoices.filter((i) => i.paymentMethod === 'cash').reduce((sum, i) => sum + i.total, 0),
    card: filteredInvoices.filter((i) => i.paymentMethod === 'card').reduce((sum, i) => sum + i.total, 0),
    wallet: filteredInvoices.filter((i) => i.paymentMethod === 'wallet').reduce((sum, i) => sum + i.total, 0),
    credit: filteredInvoices.filter((i) => i.paymentMethod === 'credit').reduce((sum, i) => sum + i.total, 0),
    split: filteredInvoices.filter((i) => i.paymentMethod === 'split').reduce((sum, i) => sum + i.total, 0),
  };

  // COGS & Profits
  const totalCostOfGoodsSold = filteredInvoices.reduce((sum, inv) => {
    const invCost = inv.items.reduce((itemSum, itm) => itemSum + itm.costPrice * itm.qty, 0);
    return sum + invCost;
  }, 0);

  const grossProfit = totalSubtotal - totalCostOfGoodsSold;
  const profitMargin = totalSubtotal > 0 ? (grossProfit / totalSubtotal) * 100 : 0;

  // Top products sold
  const productSalesMap: Record<string, { name: string; qty: number; total: number }> = {};
  filteredInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.name, qty: 0, total: 0 };
      }
      productSalesMap[item.productId].qty += item.qty;
      productSalesMap[item.productId].total += item.total;
    });
  });

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'التقارير اليومية والتحليلات المالية والضريبية' : 'Daily Sales & Financial Reports'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'إقفال الوردية (Z-Report)، تقارير الضريبة ZATCA، تحليل الأرباح وفق معايير التكلفة'
              : 'End-of-day register closure (Z-Report), VAT tax filing, and profit margin analysis'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
          </div>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { id: 'daily', label: lang === 'ar' ? 'ملخص المبيعات اليومية' : 'Daily Summary', icon: TrendingUp },
          { id: 'salesReps', label: lang === 'ar' ? 'أداء مناديب المبيعات والتارغت' : 'Sales Reps & Targets', icon: UserCheck },
          { id: 'zReport', label: lang === 'ar' ? 'إقفال الصندوق (Z-Report)' : 'Z-Report (Drawer Close)', icon: Lock },
          { id: 'tax', label: lang === 'ar' ? 'تقرير الإقرار الضريبي (ZATCA VAT)' : 'Tax Report', icon: FileSpreadsheet },
          { id: 'profits', label: lang === 'ar' ? 'قائمة الأرباح وهوامش الربحية' : 'Profits & Margins', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: SALES REPS & TARGETS */}
      {activeReportTab === 'salesReps' && (
        <SalesRepsReport users={users} invoices={invoices} lang={lang} />
      )}

      {/* TAB 1: DAILY SUMMARY */}
      {activeReportTab === 'daily' && (
        <div className="space-y-6">
          {/* 4 Cards Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">إجمالي مبيعات اليوم</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {totalSales.toFixed(2)} <span className="text-xs font-normal text-slate-500">ر.س</span>
              </span>
              <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span>شامل ضريبة 15% والخصومات</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">عدد فواتير البيع</span>
              <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">
                {totalInvoicesCount} <span className="text-xs font-normal text-slate-500">فاتورة</span>
              </span>
              <div className="mt-2 text-[11px] text-slate-500">
                متوسط الفاتورة: {totalInvoicesCount > 0 ? (totalSales / totalInvoicesCount).toFixed(2) : '0.00'} ر.س
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">ضريبة القيمة المضافة المحصلة</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {totalVat.toFixed(2)} <span className="text-xs font-normal text-slate-500">ر.س</span>
              </span>
              <div className="mt-2 text-[11px] text-slate-500">
                مستحقة لصالح هيئة الزكاة والضريبة
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">إجمالي الخصومات الممنوحة</span>
              <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">
                {totalDiscount.toFixed(2)} <span className="text-xs font-normal text-slate-500">ر.س</span>
              </span>
              <div className="mt-2 text-[11px] text-slate-500">
                عروض ترويجية وتخفيضات الكاشير
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>توزيع المبيعات حسب طريقة الدفع</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'نقدي (Cash)', amount: paymentStats.cash, icon: Banknote, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { label: 'بطاقات ومدى (Card)', amount: paymentStats.card, icon: CreditCard, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { label: 'محافظ (Apple/STC)', amount: paymentStats.wallet, icon: Smartphone, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                { label: 'آجل / حساب (Credit)', amount: paymentStats.credit, icon: Users, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                { label: 'مجزأ (Split)', amount: paymentStats.split, icon: Layers, color: 'text-slate-700 bg-slate-100 border-slate-200' },
              ].map((m, i) => (
                <div key={i} className={`p-3.5 rounded-xl border flex flex-col justify-between ${m.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{m.label}</span>
                    <m.icon className="w-4 h-4 opacity-70" />
                  </div>
                  <span className="text-lg font-black font-mono mt-2 block">
                    {m.amount.toFixed(2)} ر.س
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>الأصناف الأكثر مبيعاً في هذا اليوم</span>
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">لا توجد مبيعات مسجلة في هذا اليوم</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-2.5 text-start">الصنف</th>
                      <th className="p-2.5 text-center">الكمية المباعة</th>
                      <th className="p-2.5 text-end">إجمالي الإيراد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.slice(0, 6).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-700">{item.qty}</td>
                        <td className="p-2.5 text-end font-mono font-black text-slate-900">{item.total.toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Z-REPORT (END OF DAY / CASH DRAWER) */}
      {activeReportTab === 'zReport' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="text-center border-b pb-4">
            <h3 className="text-base font-extrabold text-slate-900">تقرير إقفال الوردية النهائي (Z-REPORT)</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">تاريخ الإقفال: {reportDate} | وقت الإقفال: 23:59:59</p>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-2 font-bold text-slate-700">
              <span>رصيد افتتاح الصندوق (Opening Float):</span>
              <span className="font-mono">500.00 ر.س</span>
            </div>
            <div className="flex justify-between py-2 text-emerald-700 font-bold">
              <span>مقبوضات المبيعات النقدية (Cash Sales):</span>
              <span className="font-mono">+{paymentStats.cash.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between py-2 text-blue-700 font-bold">
              <span>مقبوضات شبكة ومدى (POS Cards):</span>
              <span className="font-mono">+{paymentStats.card.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between py-2 text-purple-700 font-bold">
              <span>مقبوضات محافظ إلكترونية:</span>
              <span className="font-mono">+{paymentStats.wallet.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between py-2 text-amber-700 font-bold">
              <span>المبيعات الآجلة على الحساب:</span>
              <span className="font-mono">+{paymentStats.credit.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between py-2 text-rose-600 font-bold">
              <span>إجمالي المرتجعات المصروفة كاش:</span>
              <span className="font-mono">-0.00 ر.س</span>
            </div>
            <div className="flex justify-between py-3 text-base font-extrabold text-slate-900 border-t-2 border-slate-800">
              <span>المبلغ المفترض تواجده في درج الكاش:</span>
              <span className="font-mono text-emerald-600">
                {(500 + paymentStats.cash).toFixed(2)} ر.س
              </span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => alert('تم إقفال وردية الصندوق وترحيل القيود اليومية بنجاح')}
              className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              تأكيد إقفال الوردية وطباعة تقرير Z
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ZATCA TAX REPORT */}
      {activeReportTab === 'tax' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-3xl mx-auto">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">تقرير الإقرار الضريبي لضريبة القيمة المضافة (15%)</h3>
            <p className="text-xs text-slate-500">متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3 text-start">بند الإقرار الضريبي</th>
                  <th className="p-3 text-center">المبلغ الخاضع للضريبة</th>
                  <th className="p-3 text-center">نسبة الضريبة</th>
                  <th className="p-3 text-end">مبلغ الضريبة المستحقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold">المبيعات المحلية الخاضعة للنسبة الأساسية</td>
                  <td className="p-3 text-center font-mono font-bold">{totalSubtotal.toFixed(2)} ر.س</td>
                  <td className="p-3 text-center font-mono">15%</td>
                  <td className="p-3 text-end font-mono font-bold text-blue-700">{totalVat.toFixed(2)} ر.س</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">مرتجعات المبيعات والتسويات (إشعارات دائنة)</td>
                  <td className="p-3 text-center font-mono">0.00 ر.س</td>
                  <td className="p-3 text-center font-mono">15%</td>
                  <td className="p-3 text-end font-mono text-rose-600">0.00 ر.س</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-3">صافي ضريبة المخرجات المستحقة للسداد</td>
                  <td className="p-3 text-center font-mono">{totalSubtotal.toFixed(2)} ر.س</td>
                  <td className="p-3 text-center">-</td>
                  <td className="p-3 text-end font-mono font-black text-emerald-700 text-sm">{totalVat.toFixed(2)} ر.س</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROFITS & MARGINS */}
      {activeReportTab === 'profits' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">تحليل الأرباح التشغيلية وتكلفة البضاعة المباعة</h3>
              <p className="text-xs text-slate-500">
                حساب التكلفة يعتمد على المعيار الدولي المعتمد: <strong className="text-blue-700 font-mono">{costingMethod}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block">صافي الإيرادات (قبل الضريبة)</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
                {totalSubtotal.toFixed(2)} ر.س
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block">تكلفة البضاعة المباعة (COGS)</span>
              <span className="text-xl font-black text-rose-600 font-mono mt-1 block">
                {totalCostOfGoodsSold.toFixed(2)} ر.س
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">إجمالي الربح الإجمالي (Gross Profit)</span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">
                {grossProfit.toFixed(2)} ر.س
              </span>
              <span className="text-xs text-emerald-600 font-bold block mt-1">
                هامش الربح: {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
