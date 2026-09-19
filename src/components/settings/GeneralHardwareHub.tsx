import React, { useState } from 'react';
import {
  Sliders,
  CreditCard,
  Hash,
  Bell,
  Volume2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Play,
  Radio,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import { playBarcodeBeep, playSuccessChime, playErrorBuzzer, playDrawerOpenSound } from '../../utils/storage';

interface GeneralHardwareHubProps {
  lang: Language;
}

export const GeneralHardwareHub: React.FC<GeneralHardwareHubProps> = ({ lang }) => {
  const [activeSub, setActiveSub] = useState<'drawer' | 'terminals' | 'sequences' | 'alerts_sounds'>('drawer');

  // Cash Drawer Settings
  const [drawerConfig, setDrawerConfig] = useState({
    autoOpenOnCashPayment: true,
    autoOpenOnReceiptPrint: true,
    manualOpenAllowed: true,
    commandCode: '27,112,0,25,250 (ESC/POS Standard)',
    connectedPrinterPort: 'USB001',
  });

  // POS Card Terminals Settings (مدى / فيزا)
  const [terminalConfig, setTerminalConfig] = useState({
    enabled: true,
    protocol: 'ERSO / Saudi Payments Protocol v3',
    connectionType: 'LAN_IP',
    ipAddress: '192.168.1.150',
    port: '8080',
    terminalId: 'TID-8840192',
    merchantId: 'MID-99201934',
    autoSendAmount: true,
  });

  // Numbering and Sequences
  const [sequences, setSequences] = useState({
    salesPrefix: 'INV-',
    salesCurrentNum: 1045,
    returnsPrefix: 'RET-',
    returnsCurrentNum: 112,
    purchasesPrefix: 'PUR-',
    purchasesCurrentNum: 88,
    voucherPrefix: 'VCH-',
    voucherCurrentNum: 340,
    resetPeriod: 'annually', // 'daily' | 'monthly' | 'annually'
  });

  // Alerts & Sounds
  const [alerts, setAlerts] = useState({
    checkUnclosedOrdersOnShiftClose: true,
    alertOnCreditLimitExceeded: true,
    alertOnNegativeStock: true,
    playBeepOnBarcodeScan: true,
    playChimeOnSaleComplete: true,
    playBuzzerOnError: true,
    playDrawerSound: true,
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
      {/* Side Navigation for Hardware & General Modules */}
      <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-850 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              القسم 3: الإعدادات العامة والأجهزة
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">الأجهزة الطرفية والتسلسل</h2>
          </div>

          <div className="space-y-1">
            {[
              { id: 'drawer', labelAr: '3.1 فتح درج الكاش (Drawer)', icon: HardDrive },
              { id: 'terminals', labelAr: '3.2 ربط أجهزة الدفع (مدى / فيزا)', icon: CreditCard },
              { id: 'sequences', labelAr: '3.3 الترقيم والتسلسل للفواتير', icon: Hash },
              { id: 'alerts_sounds', labelAr: '3.4 التنبيهات والأصوات والتحذيرات', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSub === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSub(tab.id as typeof activeSub)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
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
        {/* 3.1 Cash Drawer */}
        {activeSub === 'drawer' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-600" />
                <span>3.1 إعدادات وأكواد فتح درج النقدية (Cash Drawer)</span>
              </h3>
              <p className="text-xs text-slate-500">
                التحكم بالفتح التلقائي عند الدفع النقدي أو طباعة الفاتورة وأوامر ESC/POS
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                    فتح الدرج تلقائياً عند إتمام الدفع النقدي فقط
                  </div>
                  <div className="text-[11px] text-slate-400">لا يتم فتح الدرج في حال الدفع بالبطاقة أو الآجل</div>
                </div>
                <input
                  type="checkbox"
                  checked={drawerConfig.autoOpenOnCashPayment}
                  onChange={(e) => setDrawerConfig({ ...drawerConfig, autoOpenOnCashPayment: e.target.checked })}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                    السماح بفتح الدرج يدوياً عبر زر الكاشير
                  </div>
                  <div className="text-[11px] text-slate-400">يتطلب صلاحية خاصة للمستخدم عند التفعيل</div>
                </div>
                <input
                  type="checkbox"
                  checked={drawerConfig.manualOpenAllowed}
                  onChange={(e) => setDrawerConfig({ ...drawerConfig, manualOpenAllowed: e.target.checked })}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كود إشارة الفتح القياسية (Drawer Kick Code)
                </label>
                <input
                  type="text"
                  value={drawerConfig.commandCode}
                  onChange={(e) => setDrawerConfig({ ...drawerConfig, commandCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playDrawerOpenSound();
                    alert('تم إرسال إشارة فتح درج الكاش التجريبية بنجاح!');
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-amber-600/20"
                >
                  <Play className="w-4 h-4" />
                  <span>اختبار فتح درج الكاش الآن</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3.2 POS Terminals (مدى / فيزا) */}
        {activeSub === 'terminals' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>3.2 ربط أجهزة بطاقات الدفع الإلكتروني (مدى / Visa / MasterCard)</span>
              </h3>
              <p className="text-xs text-slate-500">
                بروتوكول ERSO المتوافق مع المدفوعات السعودية وإرسال المبلغ تلقائياً
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البروتوكول المستخدم
                </label>
                <select
                  value={terminalConfig.protocol}
                  onChange={(e) => setTerminalConfig({ ...terminalConfig, protocol: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold"
                >
                  <option value="ERSO / Saudi Payments Protocol v3">Saudi Payments ERSO Protocol v3 (مدى)</option>
                  <option value="OPI / Oracle Payment Interface">OPI Standard</option>
                  <option value="Serial_RS232">Serial RS232 / USB Com</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان جهاز الدفع IP في الشبكة
                </label>
                <input
                  type="text"
                  value={terminalConfig.ipAddress}
                  onChange={(e) => setTerminalConfig({ ...terminalConfig, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  معرف المحطة (Terminal ID)
                </label>
                <input
                  type="text"
                  value={terminalConfig.terminalId}
                  onChange={(e) => setTerminalConfig({ ...terminalConfig, terminalId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  معرف التاجر (Merchant ID)
                </label>
                <input
                  type="text"
                  value={terminalConfig.merchantId}
                  onChange={(e) => setTerminalConfig({ ...terminalConfig, merchantId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  إرسال المبلغ تلقائياً للشاشة دون الحاجة لإدخاله يدوياً في جهاز الشبكة
                </span>
              </div>
              <input
                type="checkbox"
                checked={terminalConfig.autoSendAmount}
                onChange={(e) => setTerminalConfig({ ...terminalConfig, autoSendAmount: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 3.3 Numbering and Sequences */}
        {activeSub === 'sequences' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-600" />
                <span>3.3 إعدادات الترقيم والتسلسل التلقائي</span>
              </h3>
              <p className="text-xs text-slate-500">
                بادئات الفواتير والسندات ونمط التصفير الدوري
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-650">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">بادئة فواتير المبيعات</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sequences.salesPrefix}
                    onChange={(e) => setSequences({ ...sequences, salesPrefix: e.target.value })}
                    className="w-24 px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                  <div className="text-xs font-mono flex items-center text-slate-400">
                    مثال: {sequences.salesPrefix}2026-0001
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-650">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">بادئة فواتير المشتريات</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sequences.purchasesPrefix}
                    onChange={(e) => setSequences({ ...sequences, purchasesPrefix: e.target.value })}
                    className="w-24 px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                  <div className="text-xs font-mono flex items-center text-slate-400">
                    مثال: {sequences.purchasesPrefix}2026-0001
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3.4 Alerts & Sounds */}
        {activeSub === 'alerts_sounds' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>3.4 التنبيهات والأصوات والتحذيرات الذكية</span>
              </h3>
              <p className="text-xs text-slate-500">
                فحص الفواتير المفتوحة، أصوات الباركود، التحذير عند نفاد المخزون
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'checkUnclosedOrdersOnShiftClose',
                  title: 'فحص وتنبيه وجود فواتير أو طلبات معلقة غير مغلقة عند تصفير الشفت',
                  desc: 'يمنع إغلاق اليومية قبل تسوية كافة الطاولات والفواتير المعلقة',
                },
                {
                  key: 'playBeepOnBarcodeScan',
                  title: 'تشغيل صوت Beep عند مسح الباركود بنجاح',
                  desc: 'تأكيد صوتي فوري للكاشير بإضافة الصنف للسلة',
                  soundTest: playBarcodeBeep,
                },
                {
                  key: 'playChimeOnSaleComplete',
                  title: 'تشغيل نغمة النجاح Chime عند اعتماد وحفظ الفاتورة',
                  desc: 'إشعار صوتي بنجاح العملية وطباعة الإيصال',
                  soundTest: playSuccessChime,
                },
                {
                  key: 'playBuzzerOnError',
                  title: 'تشغيل صوت التحذير Buzzer عند الخطأ أو رفض العملية',
                  desc: 'تنبيه الكاشير عند إدخال خاطئ أو نفاد رصيد',
                  soundTest: playErrorBuzzer,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.soundTest && (
                      <button
                        type="button"
                        onClick={item.soundTest}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="تجربة الصوت"
                      >
                        <Volume2 className="w-3 h-3 text-amber-500" />
                        <span>تجربة</span>
                      </button>
                    )}
                    <input
                      type="checkbox"
                      checked={(alerts as any)[item.key]}
                      onChange={(e) => setAlerts({ ...alerts, [item.key]: e.target.checked })}
                      className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
