import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Edit2,
  Trash2,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Barcode,
  TrendingUp,
} from 'lucide-react';
import { Product, Warehouse, CostingMethod, Language } from '../types';
import { calculateInventoryValuation } from '../utils/costing';

interface InventoryScreenProps {
  products: Product[];
  warehouses: Warehouse[];
  lang: Language;
  onUpdateProducts: (products: Product[]) => void;
  costingMethod: CostingMethod;
  onCostingMethodChange: (method: CostingMethod) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products,
  warehouses,
  lang,
  onUpdateProducts,
  costingMethod,
  onCostingMethodChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[0]?.id || 'wh-1');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formCost, setFormCost] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formMinStock, setFormMinStock] = useState(10);
  const [formUnit, setFormUnit] = useState('حبة');

  // Inventory valuation calculation
  const valuation = calculateInventoryValuation(products, costingMethod);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = filterCategory === 'all' || p.category === filterCategory;

    let matchesStock = true;
    if (filterStockStatus === 'low') matchesStock = p.stock <= p.minStockAlert && p.stock > 0;
    if (filterStockStatus === 'out') matchesStock = p.stock <= 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormCode(`ITM-${Math.floor(100 + Math.random() * 900)}`);
    setFormBarcode(`628100${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory('ألبان ومشروبات');
    setFormPrice(15.0);
    setFormCost(10.0);
    setFormStock(25);
    setFormMinStock(10);
    setFormUnit('حبة');
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormNameAr(p.nameAr);
    setFormNameEn(p.nameEn);
    setFormCode(p.code);
    setFormBarcode(p.barcode);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormCost(p.costPrice);
    setFormStock(p.stock);
    setFormMinStock(p.minStockAlert);
    setFormUnit(p.unit);
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!formNameAr.trim() || !formBarcode.trim()) {
      alert(lang === 'ar' ? 'الرجاء إدخال اسم الصنف والباركود' : 'Please enter item name and barcode');
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              nameAr: formNameAr,
              nameEn: formNameEn || formNameAr,
              code: formCode,
              barcode: formBarcode,
              category: formCategory,
              price: Number(formPrice),
              costPrice: Number(formCost),
              stock: Number(formStock),
              minStockAlert: Number(formMinStock),
              unit: formUnit,
            }
          : p
      );
      onUpdateProducts(updated);
    } else {
      const newProd: Product = {
        id: `prd-${Date.now()}`,
        nameAr: formNameAr,
        nameEn: formNameEn || formNameAr,
        code: formCode,
        barcode: formBarcode,
        category: formCategory,
        price: Number(formPrice),
        costPrice: Number(formCost),
        stock: Number(formStock),
        minStockAlert: Number(formMinStock),
        unit: formUnit,
        vatRate: 15,
        costingMethod,
        batches: [
          {
            batchNumber: `B-${new Date().getFullYear()}-01`,
            qty: Number(formStock),
            cost: Number(formCost),
            receivedDate: new Date().toISOString().split('T')[0],
          },
        ],
      };
      onUpdateProducts([newProd, ...products]);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الصنف من المستودع؟' : 'Delete this item?')) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Code', 'Barcode', 'NameAr', 'NameEn', 'Category', 'Price', 'Cost', 'Stock', 'MinStock', 'Unit'];
    const rows = products.map((p) => [
      p.code,
      p.barcode,
      `"${p.nameAr.replace(/"/g, '""')}"`,
      `"${p.nameEn.replace(/"/g, '""')}"`,
      p.category,
      p.price,
      p.costPrice,
      p.stock,
      p.minStockAlert,
      p.unit,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV / JSON simulation
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (file.name.endsWith('.json')) {
          const imported = JSON.parse(text);
          if (Array.isArray(imported)) {
            onUpdateProducts([...imported, ...products]);
            alert(lang === 'ar' ? `تم استيراد ${imported.length} صنف بنجاح` : `Imported ${imported.length} items`);
          }
        } else {
          // Parse basic CSV
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const newItems: Product[] = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
              if (cols.length >= 6) {
                newItems.push({
                  id: `prd-${Date.now()}-${i}`,
                  code: cols[0] || `ITM-${100 + i}`,
                  barcode: cols[1] || `${6280000000 + i}`,
                  nameAr: cols[2] || 'صنف مستورد',
                  nameEn: cols[3] || 'Imported Item',
                  category: cols[4] || 'عام',
                  price: parseFloat(cols[5]) || 10,
                  costPrice: parseFloat(cols[6]) || 7,
                  stock: parseInt(cols[7]) || 15,
                  minStockAlert: parseInt(cols[8]) || 5,
                  unit: cols[9] || 'حبة',
                  vatRate: 15,
                  costingMethod,
                });
              }
            }
            if (newItems.length > 0) {
              onUpdateProducts([...newItems, ...products]);
              alert(lang === 'ar' ? `تم استيراد ${newItems.length} صنف بنجاح من ملف CSV` : `Imported ${newItems.length} items from CSV`);
            }
          }
        }
      } catch {
        alert(lang === 'ar' ? 'فشل قراءة الملف، تأكد من الصيغة' : 'Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'إدارة المخزون والمستودعات وتكليف البضاعة' : 'Inventory & Warehouse Stocking'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'متابعة أرصدة الأصناف، تقييم المخزون بمعايير IFRS المحاسبية، وتنبيهات النواقص الفورية'
              : 'Real-time stock valuation with IAS-2 standards, warehouse transfers, and low-stock alerts'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{lang === 'ar' ? 'استيراد أصناف (CSV/JSON)' : 'Import (CSV/JSON)'}</span>
            <input type="file" accept=".csv,.json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{lang === 'ar' ? 'تصدير المخزون (CSV)' : 'Export CSV'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة صنف جديد' : 'New Item'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value Card with Costing Standard */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{lang === 'ar' ? 'إجمالي قيمة المخزون' : 'Total Stock Valuation'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {costingMethod}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {valuation.totalValue.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">معيار التكلفة المعتمد:</span>
            <div className="flex gap-1">
              <button
                onClick={() => onCostingMethodChange('FIFO')}
                className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                  costingMethod === 'FIFO' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                FIFO (وارد أولاً)
              </button>
              <button
                onClick={() => onCostingMethodChange('AVCO')}
                className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                  costingMethod === 'AVCO' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                AVCO (متوسط)
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{lang === 'ar' ? 'تنبيهات انخفاض المخزون' : 'Low Stock Alerts'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2 font-mono">
            {lowStockCount} <span className="text-xs font-normal text-slate-500">أصناف قاربت النفاذ</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            يتطلب إصدار أمر شراء للموردين
          </div>
        </div>

        {/* Total Items Count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{lang === 'ar' ? 'إجمالي الأصناف المسجلة' : 'Total Registered Items'}</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {products.length} <span className="text-xs font-normal text-slate-500">صنف / باركود</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            موزعة على {categories.length - 1} أقسام رئيسية
          </div>
        </div>

        {/* Active Warehouse */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{lang === 'ar' ? 'المستودع النشط' : 'Active Warehouse'}</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nameAr}
              </option>
            ))}
          </select>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            الموقع: {warehouses.find((w) => w.id === selectedWarehouse)?.location}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالاسم، الباركود، الكود...' : 'Search items...'}
            className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'جميع الأقسام' : c}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value as 'all' | 'low' | 'out')}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">كل الحالات</option>
            <option value="low">منخفض المخزون فقط</option>
            <option value="out">نفد من المخزون</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3 text-start">الكود والباركود</th>
                <th className="p-3 text-start">اسم الصنف</th>
                <th className="p-3 text-start">القسم</th>
                <th className="p-3 text-center">الرصيد الحالي</th>
                <th className="p-3 text-center">حد التنبيه</th>
                <th className="p-3 text-center">سعر التكلفة</th>
                <th className="p-3 text-center">سعر البيع (شامل الضريبة)</th>
                <th className="p-3 text-center">قيمة المخزون ({costingMethod})</th>
                <th className="p-3 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                const isOut = p.stock <= 0;
                const itemVal = valuation.itemsValuation.find((v) => v.productId === p.id)?.totalCost || (p.stock * p.costPrice);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-slate-900">{p.code}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Barcode className="w-3 h-3 text-slate-400" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{p.nameAr}</div>
                      <div className="text-[11px] text-slate-400">{p.nameEn}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{p.category}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                          isOut
                            ? 'bg-rose-100 text-rose-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLow && !isOut && <AlertTriangle className="w-2.5 h-2.5" />}
                        <span>{p.stock} {p.unit}</span>
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-500">{p.minStockAlert}</td>
                    <td className="p-3 text-center font-mono font-semibold text-slate-700">
                      {p.costPrice.toFixed(2)} ر.س
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-blue-700">
                      {p.price.toFixed(2)} ر.س
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      {itemVal.toFixed(2)} ر.س
                    </td>
                    <td className="p-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>{editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد إلى المستودع'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">اسم الصنف (بالعربي) *</label>
                <input
                  type="text"
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="مثال: حليب المراعي 1 لتر"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">اسم الصنف (بالإنجليزي)</label>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Almarai Milk 1L"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">كود الصنف (SKU)</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">الباركود الدولي *</label>
                  <button
                    type="button"
                    onClick={() => setFormBarcode(`6281${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="text-[10px] text-blue-600 font-bold"
                  >
                    توليد باركود تلقائي
                  </button>
                </div>
                <input
                  type="text"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">القسم / التصنيف</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="ألبان، حبوب، قهوة..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">الوحدة</label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="حبة، كرتون، كجم، زجاجة..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">سعر التكلفة (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formCost}
                  onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">سعر البيع للمستهلك (شامل الضريبة)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">الرصيد الافتتاحي في المستودع</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">حد تنبيه نفاذ المخزون</label>
                <input
                  type="number"
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveProduct}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {editingProduct ? 'حفظ التعديلات' : 'إضافة الصنف'}
              </button>
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
