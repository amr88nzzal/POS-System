import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Voucher, Account, Language } from '../types';

interface VouchersScreenProps {
  vouchers: Voucher[];
  accounts: Account[];
  lang: Language;
  onSaveVoucher: (voucher: Voucher) => void;
  onUpdateAccounts: (accounts: Account[]) => void;
}

export const VouchersScreen: React.FC<VouchersScreenProps> = ({
  vouchers,
  accounts,
  lang,
  onSaveVoucher,
  onUpdateAccounts,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'receipt' | 'payment'>('all');
  const [showModal, setShowModal] = useState(false);
  const [printVoucher, setPrintVoucher] = useState<Voucher | null>(null);

  // Form
  const [formType, setFormType] = useState<'receipt' | 'payment'>('receipt');
  const [formAmount, setFormAmount] = useState<number>(500);
  const [formAccountId, setFormAccountId] = useState<string>(accounts[0]?.id || 'acc-101');
  const [formBeneficiary, setFormBeneficiary] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMethod, setFormMethod] = useState('نقدي (Cash)');
  const [formRef, setFormRef] = useState('');

  const filteredVouchers = vouchers.filter((v) => {
    if (filterType === 'all') return true;
    return v.type === filterType;
  });

  const totalReceipts = vouchers
    .filter((v) => v.type === 'receipt')
    .reduce((sum, v) => sum + v.amount, 0);

  const totalPayments = vouchers
    .filter((v) => v.type === 'payment')
    .reduce((sum, v) => sum + v.amount, 0);

  const handleCreateVoucher = () => {
    if (!formBeneficiary.trim() || formAmount <= 0) {
      alert(lang === 'ar' ? 'الرجاء كتابة المستفيد وإدخال مبلغ صحيح' : 'Please provide beneficiary and valid amount');
      return;
    }

    const selectedAcc = accounts.find((a) => a.id === formAccountId);
    const newV: Voucher = {
      id: `vch-${Date.now()}`,
      voucherNumber: `${formType === 'receipt' ? 'RV' : 'PV'}-${new Date().getFullYear()}-${String(
        Math.floor(1000 + Math.random() * 9000)
      )}`,
      type: formType,
      date: new Date().toISOString().split('T')[0],
      amount: Number(formAmount),
      accountId: formAccountId,
      accountName: selectedAcc ? selectedAcc.nameAr : 'الصندوق الرئيسي',
      beneficiary: formBeneficiary,
      description: formDesc || (formType === 'receipt' ? 'قبض دفعة نقدية' : 'صرف مصروفات'),
      paymentMethod: formMethod,
      referenceNumber: formRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onSaveVoucher(newV);

    // Update account balance
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === formAccountId) {
        return {
          ...acc,
          balance: formType === 'receipt' ? acc.balance + Number(formAmount) : acc.balance - Number(formAmount),
        };
      }
      return acc;
    });
    onUpdateAccounts(updatedAccounts);

    setShowModal(false);
    setPrintVoucher(newV);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'سندات القبض وسندات الصرف' : 'Receipt & Payment Vouchers'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إصدار وطباعة سندات القبض النقدية وسندات الصرف والتسويات المحاسبية مع ربط الحسابات المنسدلة'
              : 'Issue and print cash receipts and payment vouchers linked to financial accounts'}
          </p>
        </div>

        <button
          onClick={() => {
            setFormBeneficiary('');
            setFormDesc('');
            setFormAmount(250);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إنشاء سند جديد' : 'New Voucher'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === 'ar' ? 'إجمالي المقبوضات (سندات القبض)' : 'Total Receipts'}
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              +{totalReceipts.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === 'ar' ? 'إجمالي المدفوعات (سندات الصرف)' : 'Total Payments'}
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">
              -{totalPayments.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === 'ar' ? 'صافي الحركة النقدية للسندات' : 'Net Cash Movement'}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
              {(totalReceipts - totalPayments).toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: lang === 'ar' ? 'كافة السندات' : 'All Vouchers' },
          { id: 'receipt', label: lang === 'ar' ? 'سندات القبض فقط' : 'Receipts Only' },
          { id: 'payment', label: lang === 'ar' ? 'سندات الصرف فقط' : 'Payments Only' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === f.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Vouchers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                <th className="p-3 text-start">{lang === 'ar' ? 'رقم السند' : 'Voucher #'}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'المستفيد / العميل' : 'Beneficiary'}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'الحساب المالي' : 'Account'}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'البيان / الوصف' : 'Description'}</th>
                <th className="p-3 text-center">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                <th className="p-3 text-end">{lang === 'ar' ? 'طباعة' : 'Print'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
              {filteredVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{v.voucherNumber}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        v.type === 'receipt'
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {v.type === 'receipt' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{v.type === 'receipt' ? (lang === 'ar' ? 'سند قبض' : 'Receipt') : (lang === 'ar' ? 'سند صرف' : 'Payment')}</span>
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{v.date}</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{v.beneficiary}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{v.accountName}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{v.description}</td>
                  <td className="p-3 text-center font-mono font-black text-sm">
                    <span className={v.type === 'receipt' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {v.amount.toFixed(2)} ر.س
                    </span>
                  </td>
                  <td className="p-3 text-end">
                    <button
                      onClick={() => setPrintVoucher(v)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                      title={lang === 'ar' ? 'طباعة السند' : 'Print Voucher'}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{lang === 'ar' ? 'تحرير سند مالي جديد' : 'Create New Financial Voucher'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('receipt')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    formType === 'receipt'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'سند قبض (Receipt)' : 'Receipt Voucher'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('payment')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    formType === 'payment'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'سند صرف (Payment)' : 'Payment Voucher'}</span>
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === 'ar' ? 'المبلغ (ر.س) *' : 'Amount (SAR) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg font-mono font-bold text-base text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {formType === 'receipt'
                    ? lang === 'ar'
                      ? 'استلمنا من السيد / السادة *'
                      : 'Received From *'
                    : lang === 'ar'
                    ? 'يصرف للسيد / السادة *'
                    : 'Pay To *'}
                </label>
                <input
                  type="text"
                  value={formBeneficiary}
                  onChange={(e) => setFormBeneficiary(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم الشخص أو المؤسسة' : 'Name of person or company'}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === 'ar' ? 'الحساب المالي المرتبط (من القائمة المنسدلة):' : 'Financial Account (Dropdown):'}
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-900 dark:text-white cursor-pointer"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameAr} ({a.balance.toLocaleString()} ر.س)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'}
                </label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="نقدي (Cash)">نقدي (Cash)</option>
                  <option value="شيك بنكي (Cheque)">شيك بنكي (Cheque)</option>
                  <option value="تحويل بنكي (Bank Transfer)">تحويل بنكي (Bank Transfer)</option>
                  <option value="شبكة / بطاقة (Card)">شبكة / بطاقة (Card)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === 'ar' ? 'وذلك عن (البيان / الوصف):' : 'Description:'}
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder={lang === 'ar' ? 'وصف لسبب القبض أو الصرف...' : 'Voucher purpose and description...'}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateVoucher}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-500/20"
              >
                {lang === 'ar' ? 'اعتماد السند وحفظه' : 'Save & Post Voucher'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VOUCHER MODAL */}
      {printVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 no-print">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {lang === 'ar' ? 'معاينة السند للطباعة' : 'Voucher Print Preview'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => setPrintVoucher(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div id="printable-receipt" className="p-4 mt-3 border-2 border-slate-800 dark:border-slate-600 rounded-xl space-y-4 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="text-base font-extrabold">
                  {printVoucher.type === 'receipt' ? 'ســنـد قــبـض (RECEIPT VOUCHER)' : 'ســنـد صـــرف (PAYMENT VOUCHER)'}
                </h3>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  <span>رقم السند: {printVoucher.voucherNumber}</span>
                  <span>التاريخ: {printVoucher.date}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-300 dark:border-slate-700">
                <span className="font-bold">المبلغ المدفوع:</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {printVoucher.amount.toFixed(2)} ر.س
                </span>
              </div>

              <div className="space-y-1.5 text-slate-800 dark:text-slate-200">
                <div>{printVoucher.type === 'receipt' ? 'استلمنا من السيد:' : 'يصرف للسيد:'} <strong>{printVoucher.beneficiary}</strong></div>
                <div>الحساب المسحوب منه / إليه: <strong>{printVoucher.accountName}</strong></div>
                <div>طريقة الدفع: <strong>{printVoucher.paymentMethod}</strong></div>
                <div>وذلك عن: <strong>{printVoucher.description}</strong></div>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-[11px] font-bold border-t border-slate-300 dark:border-slate-700">
                <div>توقيع المستلم / المحاسب: ....................</div>
                <div>توقيع المدير المالي: ....................</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
