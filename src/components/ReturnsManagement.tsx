import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  Calendar,
  User,
  ArrowRight,
  Receipt,
  RotateCw,
} from 'lucide-react';
import { Invoice, Product, Customer, Language } from '../types';

interface ReturnsManagementProps {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  lang: Language;
  onUpdateInvoice: (invoice: Invoice) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCustomers: (customers: Customer[]) => void;
}

export const ReturnsManagement: React.FC<ReturnsManagementProps> = ({
  invoices,
  products,
  customers,
  lang,
  onUpdateInvoice,
  onUpdateProducts,
  onUpdateCustomers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState('رغبة العميل (Customer Request)');
  const [restockToInventory, setRestockToInventory] = useState(true);
  const [refundMethod, setRefundMethod] = useState<'cash' | 'credit'>('cash');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  // Search invoice
  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    const found = invoices.find(
      (inv) => inv.invoiceNumber.toLowerCase().includes(term) || inv.id.toLowerCase().includes(term)
    );
    if (found) {
      setSelectedInvoice(found);
      const initialQtys: Record<string, number> = {};
      found.items.forEach((item) => {
        initialQtys[item.productId] = 0;
      });
      setReturnQuantities(initialQtys);
      setReturnSuccessMsg(null);
    } else {
      alert(lang === 'ar' ? 'لم يتم العثور على فاتورة بهذا الرقم' : 'Invoice not found');
    }
  };

  // Calculate return total
  const calculateRefund = () => {
    if (!selectedInvoice) return { subtotal: 0, vat: 0, total: 0 };
    let subtotal = 0;
    let total = 0;

    selectedInvoice.items.forEach((item) => {
      const qty = returnQuantities[item.productId] || 0;
      if (qty > 0) {
        const lineTotal = qty * item.price;
        total += lineTotal;
        subtotal += lineTotal / (1 + item.vatRate / 100);
      }
    });

    const vat = total - subtotal;
    return {
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  };

  const refund = calculateRefund();

  // Process Return
  const handleExecuteReturn = () => {
    if (!selectedInvoice || refund.total <= 0) {
      alert(lang === 'ar' ? 'الرجاء تحديد كمية مرتجع لصنف واحد على الأقل' : 'Select at least one item to return');
      return;
    }

    // 1. Update invoice items returnedQty and status
    let allReturned = true;
    const updatedItems = selectedInvoice.items.map((item) => {
      const toReturn = returnQuantities[item.productId] || 0;
      const alreadyReturned = item.returnedQty || 0;
      const newReturnedQty = alreadyReturned + toReturn;

      if (newReturnedQty < item.qty) {
        allReturned = false;
      }

      return {
        ...item,
        returnedQty: newReturnedQty,
      };
    });

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      items: updatedItems,
      status: allReturned ? 'returned' : 'partial_returned',
    };

    onUpdateInvoice(updatedInvoice);

    // 2. Restock products in inventory if checked
    if (restockToInventory) {
      const updatedProducts = products.map((prod) => {
        const returnedQty = returnQuantities[prod.id] || 0;
        if (returnedQty > 0) {
          return {
            ...prod,
            stock: prod.stock + returnedQty,
          };
        }
        return prod;
      });
      onUpdateProducts(updatedProducts);
    }

    // 3. Adjust customer balance if refundMethod === credit
    if (refundMethod === 'credit' && selectedInvoice.customerId) {
      const updatedCustomers = customers.map((c) => {
        if (c.id === selectedInvoice.customerId) {
          return {
            ...c,
            balance: Math.max(0, c.balance - refund.total),
          };
        }
        return c;
      });
      onUpdateCustomers(updatedCustomers);
    }

    setReturnSuccessMsg(
      lang === 'ar'
        ? `تم اعتماد المرتجع بقيمة ${refund.total} ر.س وتحديث المخزون وحساب العميل بنجاح!`
        : `Return of ${refund.total} SAR processed successfully!`
    );
    setSelectedInvoice(updatedInvoice);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'إدارة المرتجعات والإشعارات الدائنة' : 'Returns & Credit Notes Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'البحث عن الفواتير بالرقم أو الباركود، واسترجاع الأصناف مع الضريبة وإعادة تغذية المستودع'
              : 'Search invoices, process item returns with VAT refund and automatic restock'}
          </p>
        </div>
      </div>

      {/* Search Invoice Box */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
        <div className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'ar' ? 'أدخل رقم الفاتورة (مثال: INV-2024-001)...' : 'Enter invoice number...'}
              className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            {lang === 'ar' ? 'بحث عن الفاتورة' : 'Search'}
          </button>
        </div>

        {/* Quick recent invoices pills */}
        <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-slate-500">
          <span>{lang === 'ar' ? 'أحدث الفواتير:' : 'Recent Invoices:'}</span>
          {invoices.slice(0, 4).map((inv) => (
            <button
              key={inv.id}
              onClick={() => {
                setSearchTerm(inv.invoiceNumber);
                setSelectedInvoice(inv);
                const initialQtys: Record<string, number> = {};
                inv.items.forEach((item) => {
                  initialQtys[item.productId] = 0;
                });
                setReturnQuantities(initialQtys);
                setReturnSuccessMsg(null);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] transition-colors"
            >
              {inv.invoiceNumber} ({inv.total} ر.س)
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Details & Return Workstation */}
      {selectedInvoice ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Invoice Summary Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm font-mono">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedInvoice.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoice.status === 'partial_returned'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedInvoice.status === 'completed' ? 'مكتملة' : selectedInvoice.status === 'partial_returned' ? 'مرتجع جزئي' : 'مرتجع كلي'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex gap-3">
                  <span>التاريخ: {selectedInvoice.date} {selectedInvoice.time}</span>
                  <span>العميل: {selectedInvoice.customerName}</span>
                  <span>الكاشير: {selectedInvoice.cashierName}</span>
                </div>
              </div>
            </div>

            <div className="text-end">
              <span className="text-xs text-slate-500 block">إجمالي الفاتورة الأصلي</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {selectedInvoice.total.toFixed(2)} ر.س
              </span>
            </div>
          </div>

          {/* Success Message Banner */}
          {returnSuccessMsg && (
            <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{returnSuccessMsg}</span>
            </div>
          )}

          {/* Items Table */}
          <div className="p-4">
            <h4 className="text-xs font-bold text-slate-700 mb-3">
              {lang === 'ar' ? 'حدد الأصناف والكميات المراد إرجاعها:' : 'Select items and quantities to return:'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="p-2.5 text-start">الصنف</th>
                    <th className="p-2.5 text-center">الكمية المباعة</th>
                    <th className="p-2.5 text-center">المرتجع سابقاً</th>
                    <th className="p-2.5 text-center">المتاح للإرجاع</th>
                    <th className="p-2.5 text-center">سعر الوحدة</th>
                    <th className="p-2.5 text-center">كمية المرتجع الحالية</th>
                    <th className="p-2.5 text-end">مبلغ الاسترداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item) => {
                    const alreadyReturned = item.returnedQty || 0;
                    const maxReturnable = item.qty - alreadyReturned;
                    const currentReturnQty = returnQuantities[item.productId] || 0;
                    const refundLineTotal = currentReturnQty * item.price;

                    return (
                      <tr key={item.productId} className="hover:bg-slate-50/70">
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                        </td>
                        <td className="p-2.5 text-center font-mono font-semibold">{item.qty}</td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{alreadyReturned}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-600">
                          {maxReturnable}
                        </td>
                        <td className="p-2.5 text-center font-mono">{item.price.toFixed(2)} ر.س</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={maxReturnable}
                            disabled={maxReturnable <= 0}
                            value={currentReturnQty}
                            onChange={(e) => {
                              const val = Math.min(maxReturnable, Math.max(0, parseInt(e.target.value) || 0));
                              setReturnQuantities({
                                ...returnQuantities,
                                [item.productId]: val,
                              });
                            }}
                            className="w-16 p-1 border border-slate-300 rounded text-center font-mono font-bold text-slate-800 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-2.5 text-end font-mono font-bold text-slate-900">
                          {refundLineTotal.toFixed(2)} ر.س
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Return Settings & Refund Breakdown */}
            <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">سبب الإرجاع:</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="رغبة العميل (Customer Request)">رغبة العميل (Customer Request)</option>
                    <option value="صنف معيب أو متضرر (Defective Item)">صنف معيب أو متضرر (Defective Item)</option>
                    <option value="خطأ في مواصفات الطلب (Incorrect Item)">خطأ في مواصفات الطلب (Incorrect Item)</option>
                    <option value="انتهاء صلاحية الصنف (Expired)">انتهاء صلاحية الصنف (Expired)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="restockCheck"
                    checked={restockToInventory}
                    onChange={(e) => setRestockToInventory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="restockCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    إعادة الأصناف المرتجعة تلقائياً لمخزون المستودع
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">طريقة رد المبلغ:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRefundMethod('cash')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        refundMethod === 'cash'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      رد نقدي للكاشير (Cash Refund)
                    </button>
                    <button
                      onClick={() => setRefundMethod('credit')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        refundMethod === 'credit'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      إيداع برصيد العميل (Credit Balance)
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Refund Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>مجموع الأصناف المرتجعة قبل الضريبة:</span>
                    <span className="font-mono">{refund.subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>الضريبة المستردة (15%):</span>
                    <span className="font-mono">{refund.vat.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>صافي المبلغ المسترد للعميل:</span>
                    <span className="font-mono text-rose-600 text-lg">
                      {refund.total.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteReturn}
                  disabled={refund.total <= 0}
                  className="w-full mt-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  اعتماد المرتجع وإصدار إشعار دائن (Credit Note)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          <RotateCcw className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            {lang === 'ar' ? 'ابحث عن الفاتورة بالأعلى لعرض الأصناف وإجراء عملية المرتجع' : 'Search for an invoice above to process returns'}
          </p>
        </div>
      )}
    </div>
  );
};
