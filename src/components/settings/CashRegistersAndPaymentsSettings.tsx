import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Zap,
  Building2,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Unlock,
  Building,
  UserCheck,
  Clock,
  ArrowUpDown,
  Sliders,
  Percent,
} from 'lucide-react';
import { CashRegister, PaymentMethodConfig, Warehouse, User, Account } from '../../types';

interface CashRegistersAndPaymentsSettingsProps {
  registers: CashRegister[];
  paymentMethods: PaymentMethodConfig[];
  warehouses: Warehouse[];
  users: User[];
  accounts: Account[];
  onUpdateRegisters: (registers: CashRegister[]) => void;
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  lang: 'ar' | 'en';
}

export function CashRegistersAndPaymentsSettings({
  registers,
  paymentMethods,
  warehouses,
  users,
  accounts,
  onUpdateRegisters,
  onUpdatePaymentMethods,
  lang,
}: CashRegistersAndPaymentsSettingsProps) {
  const [activeTab, setActiveTab] = useState<'registers' | 'payments'>('payments');

  // Register Modal state
  const [editingRegister, setEditingRegister] = useState<CashRegister | null>(null);
  const [isNewRegister, setIsNewRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState<Partial<CashRegister>>({});

  // Payment Method Modal state
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [isNewMethod, setIsNewMethod] = useState(false);
  const [methodForm, setMethodForm] = useState<Partial<PaymentMethodConfig>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Add Register
  const handleOpenAddRegister = () => {
    setIsNewRegister(true);
    setRegisterForm({
      id: `reg-${Date.now()}`,
      code: `REG-${registers.length + 1 < 10 ? '0' : ''}${registers.length + 1}`,
      nameAr: '',
      nameEn: '',
      warehouseId: warehouses[0]?.id || 'wh-1',
      warehouseName: warehouses[0]?.nameAr || 'المستودع الرئيسي',
      assignedUserId: users[0]?.id,
      assignedUserName: users[0]?.name,
      openingBalance: 500.0,
      currentCashBalance: 500.0,
      status: 'open',
      openedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    setEditingRegister(null);
  };

  // Save Register
  const handleSaveRegister = () => {
    if (!registerForm.nameAr || !registerForm.code) {
      alert(lang === 'ar' ? 'يرجى كتابة رمز واسم الصندوق' : 'Please provide code and register name');
      return;
    }

    const matchedWh = warehouses.find((w) => w.id === registerForm.warehouseId);
    const matchedUser = users.find((u) => u.id === registerForm.assignedUserId);

    const payload: CashRegister = {
      id: registerForm.id || `reg-${Date.now()}`,
      code: registerForm.code || 'REG-01',
      nameAr: registerForm.nameAr || '',
      nameEn: registerForm.nameEn || '',
      warehouseId: registerForm.warehouseId || warehouses[0]?.id || 'wh-1',
      warehouseName: matchedWh?.nameAr || 'المستودع الرئيسي',
      assignedUserId: registerForm.assignedUserId,
      assignedUserName: matchedUser?.name,
      openingBalance: registerForm.openingBalance ?? 0,
      currentCashBalance: registerForm.currentCashBalance ?? 0,
      status: registerForm.status || 'open',
      openedAt: registerForm.openedAt,
      closedAt: registerForm.closedAt,
    };

    if (isNewRegister) {
      onUpdateRegisters([...registers, payload]);
    } else {
      onUpdateRegisters(registers.map((r) => (r.id === payload.id ? payload : r)));
    }

    setIsNewRegister(false);
    setEditingRegister(null);
    showToast(lang === 'ar' ? 'تم حفظ بيانات صندوق النقدية بنجاح!' : 'Cash register saved successfully!');
  };

  // Toggle Register Open/Closed status
  const handleToggleRegisterStatus = (reg: CashRegister) => {
    const isOpening = reg.status === 'closed';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = registers.map((r) => {
      if (r.id === reg.id) {
        return {
          ...r,
          status: isOpening ? ('open' as const) : ('closed' as const),
          openedAt: isOpening ? now : r.openedAt,
          closedAt: !isOpening ? now : undefined,
        };
      }
      return r;
    });
    onUpdateRegisters(updated);
    showToast(
      isOpening
        ? lang === 'ar'
          ? 'تم فتح الصندوق وبدء الجلسة النقدية'
          : 'Register opened'
        : lang === 'ar'
        ? 'تم إغلاق الصندوق وإنهاء الجلسة'
        : 'Register closed'
    );
  };

  // Open Add Payment Method
  const handleOpenAddMethod = () => {
    setIsNewMethod(true);
    setMethodForm({
      id: `pay-${Date.now()}`,
      code: `method-${paymentMethods.length + 1}`,
      nameAr: '',
      nameEn: '',
      type: 'card',
      icon: 'CreditCard',
      enabled: true,
      requiresReference: true,
      commissionFeePercent: 1.0,
      associatedAccountId: accounts[0]?.id || 'acc-102',
      color: 'blue',
      sortOrder: paymentMethods.length + 1,
    });
    setEditingMethod(null);
  };

  // Save Payment Method
  const handleSaveMethod = () => {
    if (!methodForm.nameAr) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم طريقة الدفع' : 'Payment method name required');
      return;
    }

    const payload: PaymentMethodConfig = {
      id: methodForm.id || `pay-${Date.now()}`,
      code: methodForm.code || 'custom',
      nameAr: methodForm.nameAr || '',
      nameEn: methodForm.nameEn || '',
      type: methodForm.type || 'card',
      icon: methodForm.icon || 'CreditCard',
      enabled: methodForm.enabled ?? true,
      requiresReference: !!methodForm.requiresReference,
      commissionFeePercent: methodForm.commissionFeePercent || 0,
      associatedAccountId: methodForm.associatedAccountId || 'acc-102',
      color: methodForm.color || 'blue',
      sortOrder: methodForm.sortOrder || 1,
    };

    if (isNewMethod) {
      onUpdatePaymentMethods([...paymentMethods, payload]);
    } else {
      onUpdatePaymentMethods(paymentMethods.map((m) => (m.id === payload.id ? payload : m)));
    }

    setIsNewMethod(false);
    setEditingMethod(null);
    showToast(lang === 'ar' ? 'تم حفظ إعدادات طريقة الدفع بنجاح!' : 'Payment method updated successfully!');
  };

  // Toggle Payment Method Enabled
  const handleToggleMethodEnabled = (methodId: string) => {
    const updated = paymentMethods.map((m) => (m.id === methodId ? { ...m, enabled: !m.enabled } : m));
    onUpdatePaymentMethods(updated);
  };

  // Render Method Icon Helper
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Banknote':
        return <Banknote className={className} />;
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'CreditCard':
      default:
        return <CreditCard className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'ar' ? 'صناديق النقدية وطرق وقنوات الدفع' : 'Cash Registers & Payment Methods'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إدارة دفاتر وصناديق الكاشير، وبرمجة قنوات الدفع: فيزا، ماستر، محافظ رقمية، كليك، والدفع الآجل.'
              : 'Configure POS cash drawers and customize payment channels (Visa, MasterCard, Digital Wallets, CliQ).'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'طرق وقنوات الدفع' : 'Payment Methods'}</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-full font-bold">
              {paymentMethods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'registers'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'صناديق الكاشير' : 'Cash Drawers'}</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
              {registers.length}
            </span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: PAYMENT METHODS CONFIGURATION                     */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {lang === 'ar' ? 'قنوات الدفع المعرفة في النظام (فيزا، ماستر، كليك، محافظ، كاش):' : 'Active Payment Methods:'}
            </h3>
            <button
              onClick={handleOpenAddMethod}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إضافة وسيلة دفع' : 'Add Payment Method'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const matchedAcc = accounts.find((a) => a.id === method.associatedAccountId);

              return (
                <div
                  key={method.id}
                  className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                    method.enabled
                      ? 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      : 'border-slate-200 dark:border-slate-700 opacity-60 bg-slate-50 dark:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs ${
                            method.color === 'emerald'
                              ? 'bg-emerald-600'
                              : method.color === 'teal'
                              ? 'bg-teal-600'
                              : method.color === 'blue'
                              ? 'bg-blue-600'
                              : method.color === 'amber'
                              ? 'bg-amber-600'
                              : method.color === 'purple'
                              ? 'bg-purple-600'
                              : method.color === 'cyan'
                              ? 'bg-cyan-600'
                              : 'bg-indigo-600'
                          }`}
                        >
                          {renderIcon(method.icon)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{method.nameAr}</h4>
                          <span className="text-[11px] text-slate-400 font-sans">{method.nameEn}</span>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={() => handleToggleMethodEnabled(method.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'العمولة البنكية:' : 'Bank Fee:'}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {method.commissionFeePercent ? `${method.commissionFeePercent}%` : '0% (بدون عمولة)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'رقم المرجع (الفيزا/كليك):' : 'Ref Required:'}</span>
                        <span
                          className={`font-semibold ${
                            method.requiresReference ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {method.requiresReference
                            ? lang === 'ar'
                              ? 'إلزامي (رقم الإيصال)'
                              : 'Required'
                            : lang === 'ar'
                            ? 'اختياري'
                            : 'Optional'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'الحساب المحاسبي:' : 'GL Account:'}</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {matchedAcc ? matchedAcc.nameAr : 'الصندوق / البنك'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setIsNewMethod(false);
                        setEditingMethod(method);
                        setMethodForm({ ...method });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'تعديل الإعدادات' : 'Configure'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CASH REGISTERS (صناديق النقدية)                    */}
      {/* ======================================================== */}
      {activeTab === 'registers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {lang === 'ar' ? 'صناديق وأدراج الكاشير في الفروع:' : 'Cash Drawers & Terminals:'}
            </h3>
            <button
              onClick={handleOpenAddRegister}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تعريف صندوق جديد' : 'New Register'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registers.map((reg) => {
              const isOpen = reg.status === 'open';

              return (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {reg.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isOpen
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isOpen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isOpen ? (lang === 'ar' ? 'جلسة مفتوحة' : 'Open') : lang === 'ar' ? 'مغلق' : 'Closed'}</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{reg.nameAr}</h4>
                        <span className="text-[11px] text-slate-400">{reg.warehouseName}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'الكاشير المسؤول:' : 'Cashier:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {reg.assignedUserName || 'غير محدد'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'الرصيد الافتتاحي (العُهدة):' : 'Opening Float:'}</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {reg.openingBalance.toFixed(2)} ر.س
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-750">
                        <span className="text-slate-500 font-semibold">{lang === 'ar' ? 'الرصيد النقدي الحالي:' : 'Current Cash:'}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {reg.currentCashBalance.toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleRegisterStatus(reg)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        isOpen
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {isOpen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{isOpen ? (lang === 'ar' ? 'إغلاق الجلسة' : 'Close Session') : lang === 'ar' ? 'فتح الجلسة' : 'Open'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNewRegister(false);
                        setEditingRegister(reg);
                        setRegisterForm({ ...reg });
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg cursor-pointer"
                      title="تعديل الصندوق"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / ADD PAYMENT METHOD                         */}
      {/* ======================================================== */}
      {(isNewMethod || editingMethod) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>
                  {isNewMethod
                    ? lang === 'ar'
                      ? 'إضافة وسيلة دفع جديدة'
                      : 'Add Payment Method'
                    : lang === 'ar'
                    ? 'تعديل إعدادات وسيلة الدفع'
                    : 'Edit Payment Method'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsNewMethod(false);
                  setEditingMethod(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'اسم وسيلة الدفع بالعربية:' : 'Method Name (Arabic):'}
                </label>
                <input
                  type="text"
                  value={methodForm.nameAr || ''}
                  onChange={(e) => setMethodForm({ ...methodForm, nameAr: e.target.value })}
                  placeholder="فيزا (Visa)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الاسم بالإنجليزية:' : 'Method Name (English):'}
                </label>
                <input
                  type="text"
                  value={methodForm.nameEn || ''}
                  onChange={(e) => setMethodForm({ ...methodForm, nameEn: e.target.value })}
                  placeholder="Visa Card"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'النوع المالي:' : 'Type:'}
                  </label>
                  <select
                    value={methodForm.type || 'card'}
                    onChange={(e) =>
                      setMethodForm({
                        ...methodForm,
                        type: e.target.value as PaymentMethodConfig['type'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="cash">نقداً (Cash)</option>
                    <option value="card">بطاقة بنكية (Card)</option>
                    <option value="wallet">محفظة رقمية (Wallet)</option>
                    <option value="bank">تحويل بنكي / كليك (CliQ/Bank)</option>
                    <option value="credit">آجل / حساب العميل (Credit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'نسبة العمولة البنكية (%):' : 'Bank Fee (%):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={methodForm.commissionFeePercent || 0}
                    onChange={(e) =>
                      setMethodForm({
                        ...methodForm,
                        commissionFeePercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الحساب المحاسبي المرتبط:' : 'GL Account:'}
                </label>
                <select
                  value={methodForm.associatedAccountId || accounts[0]?.id}
                  onChange={(e) => setMethodForm({ ...methodForm, associatedAccountId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!methodForm.requiresReference}
                    onChange={(e) => setMethodForm({ ...methodForm, requiresReference: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {lang === 'ar' ? 'طلب رقم مرجع العملية (Ref Number)' : 'Require Reference Number'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {lang === 'ar'
                        ? 'إلزام الكاشير بإدخال رقم إيصال الشبكة أو كود الحوالة عند الدفع'
                        : 'Prompt cashier for network terminal slip number'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIsNewMethod(false);
                  setEditingMethod(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveMethod}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ وسيلة الدفع' : 'Save Method'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / ADD CASH REGISTER                          */}
      {/* ======================================================== */}
      {(isNewRegister || editingRegister) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>
                  {isNewRegister
                    ? lang === 'ar'
                      ? 'تعريف صندوق كاشير جديد'
                      : 'Define New Cash Register'
                    : lang === 'ar'
                    ? 'تعديل بيانات صندوق الكاشير'
                    : 'Edit Register'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsNewRegister(false);
                  setEditingRegister(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'رمز الصندوق (الكود):' : 'Register Code:'}
                  </label>
                  <input
                    type="text"
                    value={registerForm.code || ''}
                    onChange={(e) => setRegisterForm({ ...registerForm, code: e.target.value })}
                    placeholder="REG-01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'الفرع / المستودع:' : 'Branch:'}
                  </label>
                  <select
                    value={registerForm.warehouseId || warehouses[0]?.id}
                    onChange={(e) => setRegisterForm({ ...registerForm, warehouseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'اسم الصندوق بالعربية:' : 'Register Name (Arabic):'}
                </label>
                <input
                  type="text"
                  value={registerForm.nameAr || ''}
                  onChange={(e) => setRegisterForm({ ...registerForm, nameAr: e.target.value })}
                  placeholder="صندوق نقطة البيع 1 (الكاشير الرئيسي)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الكاشير المسؤول المحدد:' : 'Assigned Cashier:'}
                </label>
                <select
                  value={registerForm.assignedUserId || users[0]?.id}
                  onChange={(e) => setRegisterForm({ ...registerForm, assignedUserId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'الرصيد الافتتاحي (العُهدة):' : 'Opening Float:'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={registerForm.openingBalance ?? 500}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, openingBalance: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'الرصيد النقدي الفعلي:' : 'Current Balance:'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={registerForm.currentCashBalance ?? 500}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, currentCashBalance: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIsNewRegister(false);
                  setEditingRegister(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveRegister}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ الصندوق' : 'Save Register'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
