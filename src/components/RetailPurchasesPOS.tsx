import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
  Barcode,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  Save,
  Printer,
  RotateCcw,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowDownLeft,
  X,
} from 'lucide-react';
import {
  Product,
  Warehouse,
  Supplier,
  PurchaseInvoice,
  PurchaseItem,
  Language,
} from '../types';
import { playBarcodeBeep, playSuccessChime, playDrawerOpenSound } from '../utils/storage';

interface RetailPurchasesPOSProps {
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  purchaseInvoices: PurchaseInvoice[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
  onUpdatePurchaseInvoices: (invoices: PurchaseInvoice[]) => void;
  lang: Language;
}

export const RetailPurchasesPOS: React.FC<RetailPurchasesPOSProps> = ({
  products,
  warehouses,
  suppliers,
  purchaseInvoices,
  onUpdateProducts,
  onUpdateSuppliers,
  onUpdatePurchaseInvoices,
  lang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [cartItems, setCartItems] = useState<PurchaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<PurchaseInvoice | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [activeSubTab]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Add Item to Purchase Cart
  const handleAddToCart = (product: Product, customCost?: number, customQty = 1) => {
    playBarcodeBeep();
    const cost = customCost !== undefined ? customCost : product.costPrice || 5;
    const vatRate = product.vatRate || 15;

    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].qty + customQty;
      const lineSubtotal = newQty * cost;
      const lineVat = (lineSubtotal * vatRate) / 100;
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: newQty,
        costPrice: cost,
        vatAmount: Number(lineVat.toFixed(2)),
        total: Number((lineSubtotal + lineVat).toFixed(2)),
      };
      setCartItems(updated);
    } else {
      const lineSubtotal = customQty * cost;
      const lineVat = (lineSubtotal * vatRate) / 100;
      const newItem: PurchaseItem = {
        productId: product.id,
        code: product.code,
        name: product.nameAr,
        qty: customQty,
        costPrice: cost,
        vatRate: vatRate,
        vatAmount: Number(lineVat.toFixed(2)),
        discount: 0,
        total: Number((lineSubtotal + lineVat).toFixed(2)),
      };
      setCartItems([newItem, ...cartItems]);
    }
  };

  // Barcode Submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.code === barcodeInput.trim()
    );

    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      alert(lang === 'ar' ? 'لم يتم العثور على صنف بهذا الباركود' : 'Barcode not found');
    }
  };

  const updateItemQty = (index: number, delta: number) => {
    const updated = [...cartItems];
    const newQty = updated[index].qty + delta;
    if (newQty <= 0) {
      setCartItems(updated.filter((_, i) => i !== index));
      return;
    }
    const cost = updated[index].costPrice;
    const vatRate = updated[index].vatRate;
    const lineSubtotal = newQty * cost;
    const lineVat = (lineSubtotal * vatRate) / 100;
    updated[index] = {
      ...updated[index],
      qty: newQty,
      vatAmount: Number(lineVat.toFixed(2)),
      total: Number((lineSubtotal + lineVat).toFixed(2)),
    };
    setCartItems(updated);
  };

  const updateItemCost = (index: number, newCost: number) => {
    const updated = [...cartItems];
    const cost = Math.max(0, newCost);
    const qty = updated[index].qty;
    const vatRate = updated[index].vatRate;
    const lineSubtotal = qty * cost;
    const lineVat = (lineSubtotal * vatRate) / 100;
    updated[index] = {
      ...updated[index],
      costPrice: cost,
      vatAmount: Number(lineVat.toFixed(2)),
      total: Number((lineSubtotal + lineVat).toFixed(2)),
    };
    setCartItems(updated);
  };

  const removeItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Cart Totals
  const subtotal = cartItems.reduce((acc, i) => acc + i.qty * i.costPrice, 0);
  const vatTotal = cartItems.reduce((acc, i) => acc + i.vatAmount, 0);
  const grandTotal = subtotal + vatTotal;

  // Save and Post Purchase Invoice
  const handleSaveInvoice = () => {
    if (cartItems.length === 0) {
      alert(lang === 'ar' ? 'سلة المشتريات فارغة! الرجاء إضافة مواد.' : 'Cart is empty');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const warehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

    const invoiceNum = `PUR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const newInvoice: PurchaseInvoice = {
      id: `pur-${Date.now()}`,
      invoiceNumber: invoiceNum,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.id,
      warehouseName: warehouse.nameAr,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      items: cartItems,
      subtotal: Number(subtotal.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      discount: 0,
      grandTotal: Number(grandTotal.toFixed(2)),
      paidAmount: paymentMethod === 'credit' ? 0 : Number(grandTotal.toFixed(2)),
      paymentMethod: paymentMethod,
      status: 'completed',
      notes: invoiceNotes,
    };

    // Update product stock and cost prices
    const updatedProducts = products.map((prod) => {
      const match = cartItems.find((ci) => ci.productId === prod.id);
      if (match) {
        return {
          ...prod,
          stock: prod.stock + match.qty,
          costPrice: match.costPrice > 0 ? match.costPrice : prod.costPrice,
        };
      }
      return prod;
    });

    // Update supplier balance if credit
    if (paymentMethod === 'credit') {
      const updatedSuppliers = suppliers.map((sup) => {
        if (sup.id === supplier.id) {
          return {
            ...sup,
            balance: sup.balance - Number(grandTotal.toFixed(2)),
          };
        }
        return sup;
      });
      onUpdateSuppliers(updatedSuppliers);
    }

    onUpdateProducts(updatedProducts);
    onUpdatePurchaseInvoices([newInvoice, ...purchaseInvoices]);

    playSuccessChime();
    setSuccessToast(
      lang === 'ar'
        ? `تم حفظ فاتورة المشتريات ${invoiceNum} وتحديث المخزون بنجاح!`
        : `Purchase Invoice ${invoiceNum} saved & stock updated!`
    );
    setCartItems([]);
    setInvoiceNotes('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Bar: Mode Selector & Supplier Header */}
      <header className="bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-750 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'فاتورة مشتريات بضاعة (نمط التجزئة السريع)' : 'Retail Purchases POS'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                تحديث فوري للمخزون
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'إدخال فواتير الموردين بالباركود وتحديث تكلفة المواد والمستودع' : 'Fast supplier purchasing & stock replenishment'}
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {lang === 'ar' ? 'فاتورة شراء جديدة' : 'New Purchase'}
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {lang === 'ar' ? `سجل الفواتير (${purchaseInvoices.length})` : `History (${purchaseInvoices.length})`}
          </button>
        </div>
      </header>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {activeSubTab === 'create' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left / Main Side: Product Catalog & Fast Search (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900/60 p-3 overflow-hidden">
            {/* Search & Barcode Scan Bar */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs mb-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Barcode Fast Scan Input */}
                <form onSubmit={handleBarcodeSubmit} className="sm:col-span-6 relative">
                  <Barcode className="w-4 h-4 text-blue-500 absolute top-3 right-3" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder={lang === 'ar' ? 'امسح باركود الصنف واضغط Enter...' : 'Scan barcode & press Enter...'}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </form>

                {/* Name & Code Search */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'بحث بالاسم أو الكود...' : 'Search item name/code...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? (lang === 'ar' ? 'كافة المجموعات' : 'All Categories') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 scrollbar-thin">
              {filteredProducts.map((p) => {
                const inCart = cartItems.find((ci) => ci.productId === p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className={`p-2.5 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer relative group ${
                      inCart
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Badge of in-cart qty */}
                    {inCart && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-bold shadow-xs">
                        ×{inCart.qty}
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mb-1">
                        <span>{p.code}</span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-500">
                          {p.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">
                        {p.nameAr}
                      </h3>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">سعر التكلفة</div>
                        <div className="font-extrabold text-blue-600 dark:text-blue-400">
                          {p.costPrice.toFixed(2)} ر.س
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">المخزون</div>
                        <div className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                          {p.stock} {p.unit}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Active Purchase Invoice Details & Cart (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-850 border-l border-slate-200 dark:border-slate-750 p-3.5 overflow-hidden">
            {/* Invoice Header Settings (Supplier, Warehouse, Payment) */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Supplier Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-500" />
                    <span>{lang === 'ar' ? 'المورد' : 'Supplier'}</span>
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.balance.toFixed(2)} ر.س)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-500" />
                    <span>{lang === 'ar' ? 'المستودع المستلم' : 'Warehouse'}</span>
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', labelAr: 'نقداً (كاش)', labelEn: 'Cash' },
                    { id: 'credit', labelAr: 'آجل (حساب المورد)', labelEn: 'Credit' },
                    { id: 'bank', labelAr: 'تحويل بنكي', labelEn: 'Bank' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as 'cash' | 'credit' | 'bank')}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-650'
                      }`}
                    >
                      {lang === 'ar' ? method.labelAr : method.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-8">
                  <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                  <p>{lang === 'ar' ? 'الفاتورة فارغة، انقر على المواد أو امسح الباركود' : 'No items added yet'}</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={item.productId}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>كود: {item.code}</span>
                        <span>ضريبة: {item.vatRate}%</span>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl p-0.5">
                      <button
                        onClick={() => updateItemQty(index, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          updateItemQty(index, val - item.qty);
                        }}
                        className="w-10 text-center font-bold text-xs bg-transparent focus:outline-hidden"
                      />
                      <button
                        onClick={() => updateItemQty(index, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Unit Cost Input */}
                    <div className="w-20">
                      <input
                        type="number"
                        step="0.1"
                        value={item.costPrice}
                        onChange={(e) => updateItemCost(index, parseFloat(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-lg text-xs font-bold text-center"
                        title="سعر التكلفة الفردي"
                      />
                    </div>

                    {/* Line Total */}
                    <div className="text-right w-18">
                      <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {item.total.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-slate-400">ر.س</div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Financial Summary & Action Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{lang === 'ar' ? 'المجموع قبل الضريبة' : 'Subtotal'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{vatTotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>{lang === 'ar' ? 'الصافي الإجمالي للفاتورة' : 'Grand Total'}</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400">{grandTotal.toFixed(2)} ر.س</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setCartItems([])}
                  disabled={cartItems.length === 0}
                  className="py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {lang === 'ar' ? 'مسح الفاتورة' : 'Clear'}
                </button>
                <button
                  onClick={handleSaveInvoice}
                  disabled={cartItems.length === 0}
                  className="py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حفظ واعتماد وتحديث المخزون' : 'Post & Update Stock'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History & Previous Invoices View */
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">المورد</th>
                  <th className="p-3">المستودع</th>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">عدد الأصناف</th>
                  <th className="p-3">طريقة السداد</th>
                  <th className="p-3">الإجمالي (ر.س)</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {purchaseInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{inv.invoiceNumber}</td>
                    <td className="p-3 font-bold">{inv.supplierName}</td>
                    <td className="p-3 text-slate-500">{inv.warehouseName}</td>
                    <td className="p-3 text-slate-500">{inv.date} {inv.time}</td>
                    <td className="p-3 font-semibold">{inv.items.length} أصناف</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-[10px]">
                        {inv.paymentMethod === 'cash' ? 'نقداً' : inv.paymentMethod === 'credit' ? 'آجل' : 'تحويل'}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">{inv.grandTotal.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setViewInvoice(inv)}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>تفاصيل فاتورة مشتريات: {viewInvoice.invoiceNumber}</span>
              </h3>
              <button onClick={() => setViewInvoice(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-750 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 text-[10px]">المورد</div>
                  <div className="font-bold">{viewInvoice.supplierName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">المستودع</div>
                  <div className="font-bold">{viewInvoice.warehouseName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">التاريخ</div>
                  <div className="font-bold">{viewInvoice.date} {viewInvoice.time}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">الإجمالي</div>
                  <div className="font-extrabold text-emerald-600">{viewInvoice.grandTotal.toFixed(2)} ر.س</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-slate-700 font-bold text-slate-500">
                    <tr>
                      <th className="p-2">الصنف</th>
                      <th className="p-2">الكمية</th>
                      <th className="p-2">سعر التكلفة</th>
                      <th className="p-2">الضريبة</th>
                      <th className="p-2">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {viewInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 font-bold">{item.name}</td>
                        <td className="p-2">{item.qty}</td>
                        <td className="p-2">{item.costPrice.toFixed(2)}</td>
                        <td className="p-2">{item.vatAmount.toFixed(2)}</td>
                        <td className="p-2 font-bold">{item.total.toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة</span>
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
