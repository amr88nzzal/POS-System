import React, { useState } from 'react';
import {
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Code2,
  Copy,
  Key,
  Layers,
  ArrowDownToLine,
  Upload,
  Clock,
  BookOpen,
  Send,
  Terminal,
  FileSpreadsheet,
} from 'lucide-react';
import { Account, Customer, SyncStats, Language } from '../types';

interface AccountingSyncScreenProps {
  accounts: Account[];
  customers: Customer[];
  syncStats: SyncStats;
  lang: Language;
  onUpdateAccounts: (accounts: Account[]) => void;
  onUpdateCustomers: (customers: Customer[]) => void;
  onSaveSyncStats: (stats: SyncStats) => void;
  onTriggerSync: () => void;
}

export const AccountingSyncScreen: React.FC<AccountingSyncScreenProps> = ({
  accounts,
  customers,
  syncStats,
  lang,
  onUpdateAccounts,
  onUpdateCustomers,
  onSaveSyncStats,
  onTriggerSync,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'accounts' | 'customers' | 'apiDocs'>('sync');
  const [selectedErp, setSelectedErp] = useState(syncStats.erpType);
  const [endpointUrl, setEndpointUrl] = useState(syncStats.apiEndpoint);
  const [apiKey, setApiKey] = useState(syncStats.apiKey);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Sync test logs
  const [syncLogs, setSyncLogs] = useState<{ id: string; time: string; text: string; status: 'ok' | 'info' | 'warn' }[]>([
    { id: '1', time: '11:45:10', text: 'تمت مزامنة 14 فاتورة مبيعات مع دفتر اليومية في Odoo بنجاح', status: 'ok' },
    { id: '2', time: '10:30:00', text: 'تم تحديث أسعار وأرصدة 10 أصناف من مستودع ERP المركزي', status: 'ok' },
    { id: '3', time: '09:15:22', text: 'مزامنة قيود ضريبة القيمة المضافة ZATCA مع حساب الأمانات (2102)', status: 'info' },
  ]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const handleSaveConfig = () => {
    const updated: SyncStats = {
      ...syncStats,
      erpType: selectedErp,
      apiEndpoint: endpointUrl,
      apiKey: apiKey,
    };
    onSaveSyncStats(updated);
    alert(lang === 'ar' ? 'تم حفظ إعدادات الربط بنجاح' : 'Sync settings saved');
  };

  const handleManualSyncAction = () => {
    onTriggerSync();
    const nowTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSyncLogs((prev) => [
      {
        id: Date.now().toString(),
        time: nowTime,
        text: `تم فحص وتحديث المعاملات المعلقة ومزامنة قيود الحسابات مع ${selectedErp}`,
        status: 'ok',
      },
      ...prev,
    ]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'الربط والتزامن مع برامج المحاسبة والمستودعات' : 'Accounting & Warehouse ERP Sync'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'تزامن ثنائي الاتجاه مع Odoo, QuickBooks, ERPNext, واستيراد دليل الحسابات وأرصدة العملاء والموردين'
              : 'Two-way integration with Odoo, QuickBooks, ERPNext, chart of accounts & customer balances'}
          </p>
        </div>

        <button
          onClick={handleManualSyncAction}
          disabled={syncStats.status === 'syncing'}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncStats.status === 'syncing' ? 'animate-spin' : ''}`} />
          <span>{lang === 'ar' ? 'مزامنة فورية مع نظام المحاسبة' : 'Sync Now with ERP'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'sync', label: lang === 'ar' ? 'حالة الربط والإعدادات' : 'Sync & Settings', icon: Link2 },
          { id: 'accounts', label: lang === 'ar' ? 'دليل الحسابات (شجرة الحسابات)' : 'Chart of Accounts', icon: Database },
          { id: 'customers', label: lang === 'ar' ? 'أرصدة العملاء والمدينين' : 'Customer Balances', icon: Layers },
          { id: 'apiDocs', label: lang === 'ar' ? 'واجهة البرمجة (REST API Hub)' : 'REST API Hub', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYNC & SETTINGS */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Box */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>إعدادات الاتصال ببرنامج المحاسبة الخارجي</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">نظام المحاسبة الخارجي:</label>
                <select
                  value={selectedErp}
                  onChange={(e) => setSelectedErp(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Odoo">Odoo Community / Enterprise ERP</option>
                  <option value="ERPNext">ERPNext & Frappe Framework</option>
                  <option value="QuickBooks">QuickBooks Online Accounting</option>
                  <option value="CustomAPI">سيرفر أو برنامج مخصص (Custom Webhook / REST)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">مفتاح المصادقة API Key / Token:</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">رابط واجهة المزامنة Endpoint URL:</label>
                <input
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSyncToggle"
                  checked={syncStats.autoSync}
                  onChange={(e) => onSaveSyncStats({ ...syncStats, autoSync: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="autoSyncToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  تفعيل المزامنة التلقائية فور توفر اتصال بالإنترنت
                </label>
              </div>

              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>

          {/* Sync Stats & Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>سجل عمليات المزامنة والتحديث</span>
              </h3>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">آخر مزامنة ناجحة:</span>
                  <span className="font-mono font-bold text-slate-800">{syncStats.lastSyncedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المعاملات المعلقة في الطابور:</span>
                  <span className={`font-mono font-bold ${syncStats.pendingSyncCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {syncStats.pendingSyncCount} معاملة
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {syncLogs.map((log) => (
                  <div key={log.id} className="p-2 bg-slate-50 rounded-lg text-[11px] border border-slate-100">
                    <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] mb-0.5">
                      <span>{log.time}</span>
                      <span className="text-emerald-600 font-bold">مكتمل</span>
                    </div>
                    <div className="text-slate-700 font-medium">{log.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSyncLogs([]);
                alert('تم تفريغ السجل');
              }}
              className="mt-4 text-[11px] text-slate-400 hover:text-slate-600 text-center"
            >
              مسح السجلات السابقة
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CHART OF ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">دليل الحسابات المستورد (Chart of Accounts)</h3>
              <p className="text-xs text-slate-500">الأرصدة الحالية للحسابات وفق النظام المحاسبي الدولي</p>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" />
              <span>استيراد شجرة حسابات (Excel/CSV)</span>
              <input type="file" accept=".csv,.json" className="hidden" />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3 text-start">رمز الحساب</th>
                  <th className="p-3 text-start">اسم الحساب (عربي)</th>
                  <th className="p-3 text-start">Account Name (EN)</th>
                  <th className="p-3 text-center">نوع الحساب</th>
                  <th className="p-3 text-end">الرصيد المالي الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{acc.code}</td>
                    <td className="p-3 font-bold text-slate-900">{acc.nameAr}</td>
                    <td className="p-3 text-slate-500">{acc.nameEn}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {acc.type === 'asset' ? 'أصول' :
                         acc.type === 'liability' ? 'خصوم' :
                         acc.type === 'revenue' ? 'إيرادات' : 'مصروفات'}
                      </span>
                    </td>
                    <td className="p-3 text-end font-mono font-bold text-slate-900">
                      {acc.balance.toLocaleString()} {acc.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER BALANCES */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">أرصدة العملاء والمدينين التجاريين</h3>
              <p className="text-xs text-slate-500">سجل حسابات العملاء، الحدود الائتمانية، والديون المستحقة</p>
            </div>
            <button
              onClick={() => alert('تم تصدير كشف حسابات العملاء')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>تصدير كشف حسابات العملاء</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3 text-start">اسم العميل / المنشأة</th>
                  <th className="p-3 text-start">رقم الجوال</th>
                  <th className="p-3 text-start">الرقم الضريبي</th>
                  <th className="p-3 text-center">الحد الائتماني</th>
                  <th className="p-3 text-end">الرصيد القائم (مدين / دائن)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 font-mono text-slate-600">{c.phone}</td>
                    <td className="p-3 font-mono text-slate-500">{c.taxNumber || 'غير مسجل'}</td>
                    <td className="p-3 text-center font-mono text-slate-700">{c.creditLimit.toLocaleString()} ر.س</td>
                    <td className="p-3 text-end font-mono font-black">
                      <span className={c.balance > 0 ? 'text-rose-600' : c.balance < 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {c.balance.toFixed(2)} ر.س
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REST API HUB FOR EXTERNAL PROGRAMS */}
      {activeTab === 'apiDocs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              <span>واجهة برمجة التطبيقات للمطورين وأنظمة الـ ERP الخارجية (REST API)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              استخدم نقاط النهاية التالية لربط نظام المحاسبة الخاص بك، استيراد المبيعات، تحديث المنتجات، وضبط الأرصدة تلقائياً.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* API Endpoint 1: Get Products */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold rounded">GET</span>
                  <code className="font-mono text-slate-800 font-bold">/api/v1/erp/products</code>
                </div>
                <button
                  onClick={() => copyToClipboard('GET https://your-pos-domain.com/api/v1/erp/products', 'ep1')}
                  className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedEndpoint === 'ep1' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
              <p className="text-slate-600 mb-2">استرجاع قائمة كافة الأصناف والباركودات وأرصدة المستودعات الحالية وتكلفة كل صنف.</p>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
{`curl -X GET "https://your-pos-domain.com/api/v1/erp/products" \\
  -H "Authorization: Bearer ${apiKey}"`}
              </pre>
            </div>

            {/* API Endpoint 2: Push Invoices */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold rounded">POST</span>
                  <code className="font-mono text-slate-800 font-bold">/api/v1/erp/invoices/sync</code>
                </div>
                <button
                  onClick={() => copyToClipboard('POST https://your-pos-domain.com/api/v1/erp/invoices/sync', 'ep2')}
                  className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedEndpoint === 'ep2' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
              <p className="text-slate-600 mb-2">إرسال فواتير نقاط البيع المغلقة لتوليد قيود اليومية المحاسبية الآلية في نظام المحاسبة.</p>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
{`curl -X POST "https://your-pos-domain.com/api/v1/erp/invoices/sync" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{"batchSize": 50, "includeVatDetails": true}'`}
              </pre>
            </div>

            {/* API Endpoint 3: Update Accounts */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-mono font-bold rounded">PUT</span>
                  <code className="font-mono text-slate-800 font-bold">/api/v1/erp/accounts/balances</code>
                </div>
                <button
                  onClick={() => copyToClipboard('PUT https://your-pos-domain.com/api/v1/erp/accounts/balances', 'ep3')}
                  className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedEndpoint === 'ep3' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
              <p className="text-slate-600">تحديث أرصدة العملاء وشجرة الحسابات من نظام المحاسبة الخارجي تلقائياً عبر الـ Webhook.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
