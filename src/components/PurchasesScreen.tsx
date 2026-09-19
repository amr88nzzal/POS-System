import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  RotateCcw,
  Search,
  Package,
  Calendar,
  Building2,
  DollarSign,
  FileText,
  Printer,
  CheckCircle2,
  X,
  Trash2,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  Product,
  Warehouse,
  Supplier,
  PurchaseInvoice,
  PurchaseItem,
  Language,
} from '../types';

interface PurchasesScreenProps {
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  purchaseInvoices: PurchaseInvoice[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
  onUpdatePurchaseInvoices: (invoices: PurchaseInvoice[]) => void;
  lang: Language;
}

export const PurchasesScreen: React.FC<PurchasesScreenProps> = ({
  products,
  warehouses,
  suppliers,
  purchaseInvoices,
  onUpdateProducts,
  onUpdateSuppliers,
  onUpdatePurchaseInvoices,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'returns' | 'suppliers'>('purchases');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedInvoiceForReturn, setSelectedInvoiceForReturn] = useState<PurchaseInvoice | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [viewInvoiceModal, setViewInvoiceModal] = useState<PurchaseInvoice | null>(null);

  // New Purchase Invoice Form
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<PurchaseItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState(products[0]?.id || '');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemCost, setItemCost] = useState<number>(products[0]?.costPrice || 5);

  const handleAddItemToInvoice = () => {
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod || itemQty <= 0) return;

    const existingIdx = invoiceItems.findIndex((i) => i.productId === prod.id);
    const vatRate = prod.vatRate || 15;
    const lineSubtotal = itemQty * itemCost;
    const vatAmt = (lineSubtotal * vatRate) / 100;
    const lineTotal = lineSubtotal + vatAmt;

    if (existingIdx > -1) {
      const updated = [...invoiceItems];
      const newQty = updated[existingIdx].qty + itemQty;
      const newSubtotal = newQty * itemCost;
      const newVat = (newSubtotal * vatRate) / 100;
      updated[existingIdx] = {
        ...updated[existingIdx],
        qty: newQty,
        costPrice: itemCost,
        vatAmount: Number(newVat.toFixed(2)),
        total: Number((newSubtotal + newVat).toFixed(2)),
      };
      setInvoiceItems(updated);
    } else {
      const newItem: PurchaseItem = {
        productId: prod.id,
        code: prod.code,
        name: prod.nameAr,
        qty: itemQty,
        costPrice: itemCost,
        vatRate: vatRate,
        vatAmount: Number(vatAmt.toFixed(2)),
        discount: 0,
        total: Number(lineTotal.toFixed(2)),
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
    setItemQty(10);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + item.qty * item.costPrice, 0);
  const invoiceVatTotal = invoiceItems.reduce((sum, item) => sum + item.vatAmount, 0);
  const invoiceGrandTotal = invoiceSubtotal + invoiceVatTotal;

  const handleSavePurchaseInvoice = () => {
    if (invoiceItems.length === 0) {
      alert(lang === 'ar' ? 'الرجاء إضافة أصناف للفاتورة' : 'Please add items to invoice');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const warehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

    const newInvoice: PurchaseInvoice = {
      id: `pur-${Date.now()}`,
      invoiceNumber: `PINV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.id,
      warehouseName: warehouse.nameAr,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      items: invoiceItems,
      subtotal: Number(invoiceSubtotal.toFixed(2)),
      vatTotal: Number(invoiceVatTotal.toFixed(2)),
      discount: 0,
      grandTotal: Number(invoiceGrandTotal.toFixed(2)),
      paidAmount: paymentMethod === 'credit' ? 0 : Number(invoiceGrandTotal.toFixed(2)),
      paymentMethod: paymentMethod,
      status: 'completed',
      notes: invoiceNotes,
    };

    // 1. Update product stocks and cost prices
    const updatedProducts = products.map((p) => {
      const match = invoiceItems.find((item) => item.productId === p.id);
      if (match) {
        return {
          ...p,
          stock: p.stock + match.qty,
          costPrice: match.costPrice, // Update latest purchase cost
        };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);

    // 2. Update Supplier balance if credit
    if (paymentMethod === 'credit') {
      const updatedSuppliers = suppliers.map((s) => {
        if (s.id === supplier.id) {
          return {
            ...s,
            balance: s.balance - invoiceGrandTotal, // We owe supplier more
          };
        }
        return s;
      });
      onUpdateSuppliers(updatedSuppliers);
    }

    // 3. Save purchase invoice
    onUpdatePurchaseInvoices([newInvoice, ...purchaseInvoices]);
    setInvoiceItems([]);
    setInvoiceNotes('');
    setShowAddModal(false);
  };

  const handleOpenReturn = (inv: PurchaseInvoice) => {
    setSelectedInvoiceForReturn(inv);
    const initialQtys: Record<string, number> = {};
    inv.items.forEach((item) => {
      initialQtys[item.productId] = 0;
    });
    setReturnQuantities(initialQtys);
    setShowReturnModal(true);
  };

  const handleExecuteReturn = () => {
    if (!selectedInvoiceForReturn) return;

    let totalReturnedAmount = 0;
    const updatedItems = selectedInvoiceForReturn.items.map((item) => {
      const toReturn = returnQuantities[item.productId] || 0;
      const alreadyReturned = item.returnedQty || 0;
      const lineCost = toReturn * item.costPrice * (1 + item.vatRate / 100);
      totalReturnedAmount += lineCost;
      return {
        ...item,
        returnedQty: alreadyReturned + toReturn,
      };
    });

    if (totalReturnedAmount <= 0) {
      alert(lang === 'ar' ? 'حدد كمية المردود لصنف واحد على الأقل' : 'Specify return quantity');
      return;
    }

    // 1. Deduct returned qty from stock
    const updatedProducts = products.map((p) => {
      const returnQty = returnQuantities[p.id] || 0;
      if (returnQty > 0) {
        return {
          ...p,
          stock: Math.max(0, p.stock - returnQty),
        };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);

    // 2. Update invoice status
    const updatedInvoices = purchaseInvoices.map((inv) => {
      if (inv.id === selectedInvoiceForReturn.id) {
        return {
          ...inv,
          items: updatedItems,
          status: 'partial_returned' as const,
        };
      }
      return inv;
    });
    onUpdatePurchaseInvoices(updatedInvoices);

    setShowReturnModal(false);
    setSelectedInvoiceForReturn(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'ar' ? 'إدارة المشتريات ومردود المشتريات' : 'Purchases & Purchase Returns'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تسجيل فواتير الشراء، وإدخال بضاعة للمستودعات، وإدارة مرتجع المشتريات ومطابقة الموردين'
              : 'Record purchase orders, receive inventory, manage purchase returns, and track supplier balances'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'فاتورة مشتريات جديدة' : 'New Purchase Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{lang === 'ar' ? 'فواتير المشتريات' : 'Purchase Invoices'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
            {purchaseInvoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'returns'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{lang === 'ar' ? 'مردود المشتريات (المرتجع)' : 'Purchase Returns'}</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'suppliers'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{lang === 'ar' ? 'سجل الموردين' : 'Suppliers Directory'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
            {suppliers.length}
          </span>
        </button>
      </div>

      {/* Main Content Based on Tab */}
      {activeTab === 'purchases' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث برقم الفاتورة أو اسم المورد...' : 'Search invoices or supplier...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? `إجمالي الفواتير: ${purchaseInvoices.length}` : `Total: ${purchaseInvoices.length}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="px-4 py-3">{lang === 'ar' ? 'المورد' : 'Supplier'}</th>
                  <th className="px-4 py-3">{lang === 'ar' ? 'المستودع' : 'Warehouse'}</th>
                  <th className="px-4 py-3">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-center">{lang === 'ar' ? 'عدد البنود' : 'Items'}</th>
                  <th className="px-4 py-3 text-center">{lang === 'ar' ? 'طريقة الدفع' : 'Payment'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الإجمالي الشامل' : 'Grand Total'}</th>
                  <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {purchaseInvoices
                  .filter(
                    (inv) =>
                      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                        {inv.supplierName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {inv.warehouseName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                        {inv.date} <span className="text-[10px]">{inv.time}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {inv.items.length}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentMethod === 'cash'
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                              : inv.paymentMethod === 'bank'
                              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {inv.paymentMethod === 'cash' ? 'نقدي' : inv.paymentMethod === 'bank' ? 'تحويل بنكي' : 'آجل'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end font-mono font-extrabold text-slate-900 dark:text-white">
                        {inv.grandTotal.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ر.س</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewInvoiceModal(inv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer"
                            title={lang === 'ar' ? 'معاينة' : 'View'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenReturn(inv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 cursor-pointer"
                            title={lang === 'ar' ? 'إجراء مردود' : 'Return Items'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
              {lang === 'ar' ? 'قائمة الموردين المعتمدين وأرصدتهم' : 'Approved Suppliers & Accounts'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'اسم المورد' : 'Supplier Name'}</th>
                  <th className="px-4 py-3">{lang === 'ar' ? 'رقم الجوال' : 'Phone'}</th>
                  <th className="px-4 py-3">{lang === 'ar' ? 'الرقم الضريبي' : 'Tax Number'}</th>
                  <th className="px-4 py-3">{lang === 'ar' ? 'العنوان' : 'Address'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الرصيد المستحق' : 'Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{sup.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{sup.phone}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{sup.taxNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sup.address || '—'}</td>
                    <td className="px-4 py-3 text-end font-mono font-extrabold">
                      <span className={sup.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                        {sup.balance.toLocaleString()} ر.س
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {lang === 'ar' ? 'إجراء مردود مشتريات' : 'Initiate Purchase Return'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {lang === 'ar'
              ? 'لإرجاع بضاعة إلى المورد، انتقل إلى تبويب "فواتير المشتريات" واضغط على زر المردود بجانب الفاتورة المراد إرجاع أصناف منها، وسيتم خصم الكميات من المخزون تلقائياً.'
              : 'To return items to supplier, navigate to Purchase Invoices tab and click the Return icon beside the invoice.'}
          </p>
        </div>
      )}

      {/* Modal: New Purchase Invoice */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'فاتورة مشتريات جديدة (إدخال بضاعة)' : 'New Purchase Invoice'}</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ar' ? 'المورد:' : 'Supplier:'}
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ar' ? 'المستودع المستلم:' : 'Receiving Warehouse:'}
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ar' ? 'طريقة السداد:' : 'Payment Method:'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="cash">{lang === 'ar' ? 'نقدي (صندوق الكاشير)' : 'Cash'}</option>
                    <option value="bank">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                    <option value="credit">{lang === 'ar' ? 'آجل (حساب المورد)' : 'On Credit'}</option>
                  </select>
                </div>
              </div>

              {/* Add item bar */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs block">
                  {lang === 'ar' ? 'إضافة صنف للفاتورة:' : 'Add Product Line:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => {
                        setSelectedProductToAdd(e.target.value);
                        const p = products.find((prod) => prod.id === e.target.value);
                        if (p) setItemCost(p.costPrice || 5);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAr} ({p.code}) - تكلفة: {p.costPrice} ر.س
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="الكمية"
                      value={itemQty}
                      onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddItemToInvoice}
                      className="w-full h-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إدراج الصنف' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2">{lang === 'ar' ? 'الصنف' : 'Item'}</th>
                      <th className="px-3 py-2 text-center">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                      <th className="px-3 py-2 text-center">{lang === 'ar' ? 'سعر التكلفة' : 'Cost'}</th>
                      <th className="px-3 py-2 text-center">{lang === 'ar' ? 'الضريبة' : 'VAT'}</th>
                      <th className="px-3 py-2 text-end">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                      <th className="px-3 py-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {invoiceItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-slate-400">
                          {lang === 'ar' ? 'لم تتم إضافة أصناف بعد' : 'No items added'}
                        </td>
                      </tr>
                    ) : (
                      invoiceItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                          <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-3 py-2 text-center font-mono font-bold">{item.qty}</td>
                          <td className="px-3 py-2 text-center font-mono">{item.costPrice} ر.س</td>
                          <td className="px-3 py-2 text-center font-mono">%{item.vatRate}</td>
                          <td className="px-3 py-2 text-end font-mono font-bold">{item.total} ر.س</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total calculations */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">المجموع قبل الضريبة: </span>
                  <span className="font-mono font-bold">{invoiceSubtotal.toFixed(2)} ر.س</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-500 dark:text-slate-400">ضريبة القيمة المضافة: </span>
                  <span className="font-mono font-bold">{invoiceVatTotal.toFixed(2)} ر.س</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">الصافي النهائي: </span>
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {invoiceGrandTotal.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSavePurchaseInvoice}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ وترحيل الفاتورة' : 'Save & Post Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedInvoiceForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ar' ? `مردود مشتريات للفاتورة (${selectedInvoiceForReturn.invoiceNumber})` : 'Purchase Return'}</span>
            </h4>
            <div className="space-y-3">
              {selectedInvoiceForReturn.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-750 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      الكمية المشحونة: {item.qty} | التكلفة: {item.costPrice} ر.س
                    </div>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      max={item.qty - (item.returnedQty || 0)}
                      value={returnQuantities[item.productId] || 0}
                      onChange={(e) =>
                        setReturnQuantities({
                          ...returnQuantities,
                          [item.productId]: Math.min(item.qty, Math.max(0, parseInt(e.target.value) || 0)),
                        })
                      }
                      className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleExecuteReturn}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'تنفيذ المردود' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
