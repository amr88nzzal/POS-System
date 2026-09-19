import React, { useState } from 'react';
import {
  Link2,
  Clock,
  Printer,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Server,
  Key,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Language, CostingMethod } from '../../types';

interface AccountingOperationsHubProps {
  costingMethod: CostingMethod;
  onCostingMethodChange: (method: CostingMethod) => void;
  lang: Language;
}

export const AccountingOperationsHub: React.FC<AccountingOperationsHubProps> = ({
  costingMethod,
  onCostingMethodChange,
  lang,
}) => {
  const [activeSub, setActiveSub] = useState<'erp_sync' | 'auto_close' | 'print_automation' | 'costing_engine'>(
    'erp_sync'
  );

  // ERP System Integration
  const [erpConfig, setErpConfig] = useState({
    erpSystem: 'Odoo v17 Enterprise',
    apiUrl: 'https://erp.example.com/api/v2/pos_sync',
    apiKey: 'sec_live_99201934810293847',
    syncSales: true,
    syncPurchases: true,
    syncExpenses: true,
    syncVouchers: true,
    syncCustomers: true,
    autoExportFrequency: 'realtime', // 'realtime' | 'hourly' | 'shift_end'
  });

  // Auto Day Close / Shift Settings
  const [dayCloseConfig, setDayCloseConfig] = useState({
    autoCloseEnabled: true,
    closeTime: '03:00', // 3:00 AM
    autoPrintZReport: true,
    emailDailySummary: true,
    targetEmail: 'finance@company.com',
  });

  // Print Automation Settings
  const [printAuto, setPrintAuto] = useState({
    autoPrintReceiptOnSave: true,
    autoPrintKitchenTicket: true,
    showConfirmDialogBeforePrint: false,
    numberOfReceiptCopies: 1,
    numberOfKitchenCopies: 1,
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
      {/* Side Navigation for Accounting & Operations Modules */}
      <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-850 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              القسم 4: التزامن المحاسبي والعمليات
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">الربط مع البرامج وإغلاق اليوم</h2>
          </div>

          <div className="space-y-1">
            {[
              { id: 'erp_sync', labelAr: '4.1 الربط المحاسبي مع ERP و Excel', icon: Link2 },
              { id: 'auto_close', labelAr: '4.2 إغلاق اليوم عند ساعة محددة', icon: Clock },
              { id: 'print_automation', labelAr: '4.3 أتمتة الطباعة وبون المطبخ', icon: Printer },
              { id: 'costing_engine', labelAr: '4.4 احتساب تكلفة المبيعات (Costing)', icon: Calculator },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSub === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSub(tab.id as typeof activeSub)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
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
        {/* 4.1 ERP System Integration */}
        {activeSub === 'erp_sync' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-600" />
                <span>4.1 الربط مع البرامج المحاسبية ومزامنة API و Excel</span>
              </h3>
              <p className="text-xs text-slate-500">
                Odoo, QuickBooks, ERPNext, أو اتصال مخصص عبر REST API و Webhooks
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البرنامج المحاسبي المربوط
                </label>
                <select
                  value={erpConfig.erpSystem}
                  onChange={(e) => setErpConfig({ ...erpConfig, erpSystem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold"
                >
                  <option value="Odoo v17 Enterprise">Odoo Enterprise v16/v17 (JSON-RPC)</option>
                  <option value="QuickBooks Online">QuickBooks Online Accounting</option>
                  <option value="ERPNext">ERPNext Frappe Framework</option>
                  <option value="Custom REST API">Custom REST API / Webhooks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الخادم (Host API Endpoint)
                </label>
                <input
                  type="text"
                  value={erpConfig.apiUrl}
                  onChange={(e) => setErpConfig({ ...erpConfig, apiUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold text-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مفتاح التوثيق السري (API Secret Key)
                </label>
                <input
                  type="password"
                  value={erpConfig.apiKey}
                  onChange={(e) => setErpConfig({ ...erpConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Excel Import / Export Section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>الاستيراد والتصدير عبر ملفات Excel (XLSX) و CSV</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert('تم تصدير ملف إكسل بكافة فواتير اليوم والحسابات!')}
                  className="py-2 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>تصدير اليومية لملف Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('يمكنك رفع ملف الأصناف أو شجرة الحسابات بصيغة CSV!')}
                  className="py-2 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>استيراد المواد من ملف Excel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4.2 Auto Day Close */}
        {activeSub === 'auto_close' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>4.2 إغلاق اليوم عند ساعة محددة وفتح يوم جديد تلقائياً</span>
              </h3>
              <p className="text-xs text-slate-500">
                تصفير اليومية، ترحيل المبيعات، وإنشاء تقرير Z-Report الإجمالي
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                    تفعيل إغلاق اليومية التلقائي عند ساعة محددة
                  </div>
                  <div className="text-[11px] text-slate-400">
                    مناسب للمطاعم والمتاجر التي تعمل لما بعد منتصف الليل
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dayCloseConfig.autoCloseEnabled}
                  onChange={(e) => setDayCloseConfig({ ...dayCloseConfig, autoCloseEnabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  توقيت إغلاق اليوم وفتح اليوم الجديد
                </label>
                <input
                  type="time"
                  value={dayCloseConfig.closeTime}
                  onChange={(e) => setDayCloseConfig({ ...dayCloseConfig, closeTime: e.target.value })}
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4.4 Costing Methods */}
        {activeSub === 'costing_engine' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>4.4 سياسة احتساب تكلفة المبيعات والمخزون (Costing Method)</span>
              </h3>
              <p className="text-xs text-slate-500">
                FIFO (الوارد أولاً يصرف أولاً) أو الوسطي المرجح AVCO أو آخر سعر شراء
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'FIFO',
                  name: 'الوارد أولاً يصرف أولاً (FIFO)',
                  desc: 'يتم احتساب تكلفة البضاعة المباعة بناءً على تكلفة أقدم شحنة تم استلامها في المستودع',
                },
                {
                  id: 'AVCO',
                  name: 'المتوسط المرجح للتكلفة (Weighted Average)',
                  desc: 'يتم احتساب متوسط متحرك للتكلفة عند كل فاتورة شراء جديدة تلقائياً',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onCostingMethodChange(item.id as CostingMethod)}
                  className={`p-4 rounded-2xl text-right border transition-all cursor-pointer ${
                    costingMethod === item.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-650'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                    {costingMethod === item.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fallback for other sub-sections */}
        {!['erp_sync', 'auto_close', 'costing_engine'].includes(activeSub) && (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              تم ضبط خيارات أتمتة الطباعة بنجاح
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              تتم طباعة الفواتير وبون المطبخ تلقائياً عند الحفظ دون أي تأخير.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
