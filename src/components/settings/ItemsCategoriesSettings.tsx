import React, { useState } from 'react';
import {
  Layers,
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Palette,
  Type,
  Scale,
  Barcode,
  Search,
  Image as ImageIcon,
  Milk,
  Wheat,
  Sparkles,
  Coffee,
  Flame,
  Utensils,
  Apple,
  Fish,
  ShoppingBag,
  Shirt,
  HeartPulse,
  Upload,
  Percent,
} from 'lucide-react';
import { Product, CategoryStyleConfig, TaxRate } from '../../types';

interface ItemsCategoriesSettingsProps {
  products: Product[];
  categories: string[];
  categoryStyles: CategoryStyleConfig[];
  taxRates: TaxRate[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategoryStyles: (styles: CategoryStyleConfig[]) => void;
  lang: 'ar' | 'en';
}

const PRESET_ICONS = [
  { id: 'Milk', label: 'حليب وألبان', Icon: Milk },
  { id: 'Wheat', label: 'حبوب وزيوت', Icon: Wheat },
  { id: 'Package', label: 'طرد وصندوق', Icon: Package },
  { id: 'Sparkles', label: 'منظفات', Icon: Sparkles },
  { id: 'Coffee', label: 'مشروبات وبن', Icon: Coffee },
  { id: 'Flame', label: 'بهارات وتوابل', Icon: Flame },
  { id: 'Utensils', label: 'مأكولات ومطاعم', Icon: Utensils },
  { id: 'Apple', label: 'فواكه وخضار', Icon: Apple },
  { id: 'Fish', label: 'أسماك ولحوم', Icon: Fish },
  { id: 'ShoppingBag', label: 'أكياس وحقائب', Icon: ShoppingBag },
  { id: 'Shirt', label: 'ملابس وأقمشة', Icon: Shirt },
  { id: 'HeartPulse', label: 'صيدلية وصحة', Icon: HeartPulse },
];

const COLOR_PALETTES = [
  { id: 'blue', label: 'أزرق كلاسيكي', bg: 'bg-blue-600', text: 'text-white', ring: 'ring-blue-500' },
  { id: 'emerald', label: 'أخضر زمردي', bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-emerald-500' },
  { id: 'amber', label: 'عنبري دافئ', bg: 'bg-amber-600', text: 'text-white', ring: 'ring-amber-500' },
  { id: 'purple', label: 'أرجواني ملكي', bg: 'bg-purple-600', text: 'text-white', ring: 'ring-purple-500' },
  { id: 'rose', label: 'وردي ياقوتي', bg: 'bg-rose-600', text: 'text-white', ring: 'ring-rose-500' },
  { id: 'cyan', label: 'سماوي بحري', bg: 'bg-cyan-600', text: 'text-white', ring: 'ring-cyan-500' },
  { id: 'indigo', label: 'نيلي داكن', bg: 'bg-indigo-600', text: 'text-white', ring: 'ring-indigo-500' },
  { id: 'orange', label: 'برتقالي مشرق', bg: 'bg-orange-600', text: 'text-white', ring: 'ring-orange-500' },
  { id: 'teal', label: 'تركواز أنيق', bg: 'bg-teal-600', text: 'text-white', ring: 'ring-teal-500' },
  { id: 'slate', label: 'رمادي فحمي', bg: 'bg-slate-700', text: 'text-white', ring: 'ring-slate-500' },
];

export function ItemsCategoriesSettings({
  products,
  categories,
  categoryStyles,
  taxRates = [],
  onUpdateProducts,
  onUpdateCategoryStyles,
  lang,
}: ItemsCategoriesSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'products'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [scaleOnlyFilter, setScaleOnlyFilter] = useState(false);

  // Category Edit State
  const [editingCategory, setEditingCategory] = useState<CategoryStyleConfig | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ensure all current categories exist in styles
  const allCategoryStyles: CategoryStyleConfig[] = React.useMemo(() => {
    const list = [...categoryStyles];
    const defaultTax = taxRates.find((t) => t.isDefault) || taxRates[0];
    categories.forEach((catName) => {
      if (!list.some((c) => c.name === catName)) {
        list.push({
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: catName,
          color: 'blue',
          icon: 'Package',
          fontSize: 'base',
          fontWeight: 'semibold',
          taxRateId: defaultTax?.id,
          defaultVatRate: defaultTax?.rate ?? 15,
        });
      }
    });
    return list;
  }, [categories, categoryStyles, taxRates]);

  // Open Add Category
  const handleOpenAddCategory = () => {
    setIsNewCategory(true);
    const defaultTax = taxRates.find((t) => t.isDefault) || taxRates[0];
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      nameEn: '',
      color: 'emerald',
      icon: 'Package',
      fontSize: 'base',
      fontWeight: 'semibold',
      taxRateId: defaultTax?.id,
      defaultVatRate: defaultTax?.rate ?? 15,
    });
  };

  // Save Category
  const handleSaveCategory = () => {
    if (!editingCategory?.name.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم المجموعة' : 'Category name required');
      return;
    }

    let updatedStyles: CategoryStyleConfig[];
    if (isNewCategory) {
      updatedStyles = [...categoryStyles, editingCategory];
    } else {
      updatedStyles = categoryStyles.map((c) => (c.id === editingCategory.id ? editingCategory : c));
      // In case this was a newly synthesized category not yet in categoryStyles
      if (!categoryStyles.some((c) => c.id === editingCategory.id)) {
        updatedStyles.push(editingCategory);
      }
    }

    onUpdateCategoryStyles(updatedStyles);
    setIsNewCategory(false);
    setEditingCategory(null);
    showToast(lang === 'ar' ? 'تم حفظ إعدادات المجموعة وتخصيص العرض والضريبة بنجاح!' : 'Category updated successfully!');
  };

  // Helper: When changing category in product form, inherit that category's tax rate
  const handleCategoryChangeForProduct = (categoryName: string) => {
    const matchedStyle = allCategoryStyles.find((c) => c.name === categoryName);
    const targetTax =
      (matchedStyle?.taxRateId ? taxRates.find((tr) => tr.id === matchedStyle.taxRateId) : null) ||
      taxRates.find((tr) => tr.rate === (matchedStyle?.defaultVatRate ?? 15)) ||
      taxRates.find((tr) => tr.isDefault) ||
      taxRates[0];

    setProductForm((prev) => ({
      ...prev,
      category: categoryName,
      taxRateId: targetTax?.id,
      vatRate: targetTax ? targetTax.rate : 15,
    }));
  };

  // Open Add Product
  const handleOpenAddProduct = () => {
    setIsNewProduct(true);
    const initialCategory = categories[0] || 'ألبان ومشروبات';
    const matchedStyle = allCategoryStyles.find((c) => c.name === initialCategory);
    const targetTax =
      (matchedStyle?.taxRateId ? taxRates.find((tr) => tr.id === matchedStyle.taxRateId) : null) ||
      taxRates.find((tr) => tr.rate === (matchedStyle?.defaultVatRate ?? 15)) ||
      taxRates.find((tr) => tr.isDefault) ||
      taxRates[0];

    setProductForm({
      id: `prd-${Date.now()}`,
      code: `ITM-${100 + products.length + 1}`,
      barcode: `628100${Math.floor(100000 + Math.random() * 900000)}`,
      nameAr: '',
      nameEn: '',
      category: initialCategory,
      price: 10.0,
      costPrice: 7.5,
      stock: 50,
      minStockAlert: 10,
      unit: 'حبة',
      taxRateId: targetTax?.id,
      vatRate: targetTax ? targetTax.rate : 15,
      isWeighted: false,
      scaleCode: '',
      costingMethod: 'AVCO',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&auto=format&fit=crop&q=80',
    });
    setEditingProduct(null);
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setIsNewProduct(false);
    setEditingProduct(prod);
    const matchedTax =
      (prod.taxRateId ? taxRates.find((tr) => tr.id === prod.taxRateId) : null) ||
      taxRates.find((tr) => tr.rate === (prod.vatRate ?? 15)) ||
      taxRates.find((tr) => tr.isDefault) ||
      taxRates[0];
    setProductForm({
      ...prod,
      taxRateId: prod.taxRateId || matchedTax?.id,
      vatRate: prod.vatRate ?? matchedTax?.rate ?? 15,
    });
  };

  // Save Product
  const handleSaveProduct = () => {
    if (!productForm.nameAr || !productForm.price) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم الصنف وسعر البيع' : 'Please provide item name and price');
      return;
    }

    if (isNewProduct) {
      const newProd = productForm as Product;
      onUpdateProducts([...products, newProd]);
    } else if (editingProduct) {
      const updated = products.map((p) => (p.id === editingProduct.id ? ({ ...p, ...productForm } as Product) : p));
      onUpdateProducts(updated);
    }

    setIsNewProduct(false);
    setEditingProduct(null);
    showToast(lang === 'ar' ? 'تم حفظ وتحديث بيانات الصنف بنجاح!' : 'Product saved successfully!');
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الصنف من النظام؟' : 'Are you sure to delete this product?')) {
      const updated = products.filter((p) => p.id !== prodId);
      onUpdateProducts(updated);
      showToast(lang === 'ar' ? 'تم حذف الصنف' : 'Product deleted');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchesScale = !scaleOnlyFilter || p.isWeighted;
    const matchesQuery =
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.scaleCode && p.scaleCode.includes(searchQuery));
    return matchesCat && matchesScale && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation between Categories and Products */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'الأصناف، المجموعات وتخصيص العرض' : 'Items, Categories & Display Customization'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تعريف وتعديل المجموعات وتخصيص ألوانها وخطوطها وأيقوناتها، وإدارة بيانات الأصناف والربط مع الموازين.'
              : 'Define categories, customize button colors and typography, and configure scale-ready items.'}
          </p>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'المجموعات وتخصيص العرض' : 'Categories & Styles'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'products'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الأصناف والموازين' : 'Items & Scales'}</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-full font-bold">
              {products.length}
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
      {/* SUB-TAB 1: CATEGORIES & DISPLAY CUSTOMIZATION            */}
      {/* ======================================================== */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {lang === 'ar' ? 'قائمة المجموعات وتخصيص مظهر الأزرار في شاشة الـ POS:' : 'Categories & Display Design:'}
            </h3>
            <button
              onClick={handleOpenAddCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إضافة مجموعة جديدة' : 'Add Category'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategoryStyles.map((cat) => {
              const matchedPalette = COLOR_PALETTES.find((p) => p.id === cat.color) || COLOR_PALETTES[0];
              const matchedIconObj = PRESET_ICONS.find((i) => i.id === cat.icon) || PRESET_ICONS[2];
              const IconComp = matchedIconObj.Icon;

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all"
                >
                  <div>
                    {/* Live Preview Button */}
                    <div className="mb-3">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">
                        {lang === 'ar' ? 'معاينة شكل زر المجموعة في الـ POS:' : 'POS Button Preview:'}
                      </span>
                      <div
                        className={`w-full p-3 rounded-xl flex items-center gap-2.5 shadow-sm text-white ${matchedPalette.bg} ${
                          cat.fontWeight === 'bold'
                            ? 'font-bold'
                            : cat.fontWeight === 'semibold'
                            ? 'font-semibold'
                            : 'font-normal'
                        } ${
                          cat.fontSize === 'lg'
                            ? 'text-base'
                            : cat.fontSize === 'sm'
                            ? 'text-xs'
                            : 'text-sm'
                        }`}
                      >
                        <IconComp className="w-5 h-5 opacity-90" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'اللون المحدد:' : 'Color:'}</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className={`w-3 h-3 rounded-full ${matchedPalette.bg}`} />
                          <span>{matchedPalette.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'الأيقونة:' : 'Icon:'}</span>
                        <span className="font-semibold">{matchedIconObj.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'الضريبة المبدئية:' : 'Default VAT:'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md text-[11px]">
                          <Percent className="w-3 h-3" />
                          %{cat.defaultVatRate ?? 15}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{lang === 'ar' ? 'حجم ووزن الخط:' : 'Font:'}</span>
                        <span className="font-mono text-[11px]">
                          {cat.fontSize || 'base'} / {cat.fontWeight || 'semibold'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setIsNewCategory(false);
                        setEditingCategory({ ...cat });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'تخصيص المظهر' : 'Customize'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: PRODUCTS & DIGITAL SCALE DEFINITION           */}
      {/* ======================================================== */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث بالاسم، الباركود، الكود، أو رمز الميزان...' : 'Search items...'}
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="all">{lang === 'ar' ? 'جميع المجموعات' : 'All Categories'}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setScaleOnlyFilter(!scaleOnlyFilter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  scaleOnlyFilter
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'ar' ? 'أصناف الميزان فقط' : 'Scale Items Only'}</span>
              </button>

              <button
                onClick={handleOpenAddProduct}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'صنف جديد' : 'New Item'}</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">{lang === 'ar' ? 'الصنف' : 'Item'}</th>
                    <th className="p-3">{lang === 'ar' ? 'المجموعة' : 'Category'}</th>
                    <th className="p-3">{lang === 'ar' ? 'الباركود والكود' : 'Barcode & Code'}</th>
                    <th className="p-3">{lang === 'ar' ? 'نوع الصنف / الميزان' : 'Scale / Unit'}</th>
                    <th className="p-3">{lang === 'ar' ? 'السعر والتكلفة' : 'Price & Cost'}</th>
                    <th className="p-3">{lang === 'ar' ? 'الضريبة' : 'Tax'}</th>
                    <th className="p-3">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.nameAr}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{prod.nameAr}</div>
                            <div className="text-[11px] text-slate-400 font-sans">{prod.nameEn}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{prod.barcode}</div>
                        <div className="text-slate-400">{prod.code}</div>
                      </td>

                      <td className="p-3">
                        {prod.isWeighted ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                              <Scale className="w-3 h-3" />
                              <span>ميزان إلكتروني</span>
                            </span>
                            {prod.scaleCode && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-semibold">
                                رمز: {prod.scaleCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium">{prod.unit || 'حبة'}</span>
                        )}
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {prod.price.toFixed(2)} ر.س
                        </div>
                        <div className="text-[10px] text-slate-400">
                          تكلفة: {prod.costPrice.toFixed(2)} ر.س
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                          <Percent className="w-3 h-3" />
                          <span>%{prod.vatRate ?? 15}</span>
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        <span
                          className={`font-bold ${
                            prod.stock <= prod.minStockAlert
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {prod.stock}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer"
                            title="تعديل الصنف"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CUSTOMIZE CATEGORY STYLE                        */}
      {/* ======================================================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <span>
                  {isNewCategory
                    ? lang === 'ar'
                      ? 'إضافة مجموعة أصناف جديدة'
                      : 'Add New Category'
                    : lang === 'ar'
                    ? 'تخصيص مظهر ولون وخط زر المجموعة'
                    : 'Customize Category Appearance'}
                </span>
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview Inside Modal */}
            <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 font-bold block mb-2">
                {lang === 'ar' ? 'المعاينة الحية لزر المجموعة كما سيظهر في شاشة البيع:' : 'Live Button Appearance:'}
              </span>
              {(() => {
                const p = COLOR_PALETTES.find((pal) => pal.id === editingCategory.color) || COLOR_PALETTES[0];
                const iObj = PRESET_ICONS.find((ic) => ic.id === editingCategory.icon) || PRESET_ICONS[0];
                const IconComponent = iObj.Icon;

                return (
                  <button
                    type="button"
                    className={`mx-auto px-5 py-3 rounded-xl flex items-center justify-center gap-2.5 text-white shadow-md transition-transform ${
                      p.bg
                    } ${
                      editingCategory.fontWeight === 'bold'
                        ? 'font-bold'
                        : editingCategory.fontWeight === 'semibold'
                        ? 'font-semibold'
                        : 'font-normal'
                    } ${
                      editingCategory.fontSize === 'lg'
                        ? 'text-base'
                        : editingCategory.fontSize === 'sm'
                        ? 'text-xs'
                        : 'text-sm'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 opacity-90" />
                    <span>{editingCategory.name || 'اسم المجموعة'}</span>
                  </button>
                );
              })()}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'اسم المجموعة بالعربية:' : 'Category Name (Arabic):'}
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="ألبان وأجبان"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* Default Tax Rate for this Category */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                <label className="block text-blue-900 dark:text-blue-200 font-bold mb-1 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{lang === 'ar' ? 'نسبة الضريبة المبدئية للمجموعة (من جدول النسب):' : 'Default Tax Rate:'}</span>
                </label>
                <select
                  value={
                    editingCategory.taxRateId ||
                    (taxRates.find((t) => t.rate === editingCategory.defaultVatRate)?.id ??
                      (taxRates.find((t) => t.isDefault)?.id || taxRates[0]?.id || 1))
                  }
                  onChange={(e) => {
                    const selId = Number(e.target.value);
                    const selRate = taxRates.find((t) => t.id === selId);
                    if (selRate) {
                      setEditingCategory({
                        ...editingCategory,
                        taxRateId: selRate.id,
                        defaultVatRate: selRate.rate,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg text-slate-900 dark:text-white font-semibold text-xs"
                >
                  {taxRates.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name} — %{tr.rate} {tr.isDefault ? '(الافتراضي للنظام)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">
                  {lang === 'ar'
                    ? 'عند إضافة مادة جديدة واختيار هذه المجموعة، سيتم تطبيق هذه النسبة الضريبية مبدئياً وتلقائياً مع إمكانية تعديلها.'
                    : 'Items added under this category will automatically inherit this tax rate.'}
                </p>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'اختيار لون الزر والخلفية:' : 'Color Theme:'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color: pal.id })}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        editingCategory.color === pal.id
                          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${pal.bg} shadow-2xs`} />
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate w-full text-center">
                        {pal.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الأيقونة التعبيرية:' : 'Category Icon:'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PRESET_ICONS.map((ico) => {
                    const IconC = ico.Icon;
                    return (
                      <button
                        key={ico.id}
                        type="button"
                        onClick={() => setEditingCategory({ ...editingCategory, icon: ico.id })}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          editingCategory.icon === ico.id
                            ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <IconC className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
                          {ico.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'حجم الخط:' : 'Font Size:'}
                  </label>
                  <select
                    value={editingCategory.fontSize || 'base'}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        fontSize: e.target.value as 'sm' | 'base' | 'lg',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="sm">صغير (Small)</option>
                    <option value="base">قياسي (Normal)</option>
                    <option value="lg">كبير (Large)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {lang === 'ar' ? 'سماكة الخط:' : 'Font Weight:'}
                  </label>
                  <select
                    value={editingCategory.fontWeight || 'semibold'}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        fontWeight: e.target.value as 'normal' | 'semibold' | 'bold',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="normal">عادي (Normal)</option>
                    <option value="semibold">شبه عريض (Semibold)</option>
                    <option value="bold">عريض وبارز (Bold)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ المظهر' : 'Save Style'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT PRODUCT                              */}
      {/* ======================================================== */}
      {(isNewProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>
                  {isNewProduct
                    ? lang === 'ar'
                      ? 'تعريف صنف جديد'
                      : 'Define New Product'
                    : lang === 'ar'
                    ? 'تعديل بيانات الصنف ورمز الميزان'
                    : 'Edit Item & Scale'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsNewProduct(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'اسم الصنف بالعربية:' : 'Item Name (Arabic):'}
                </label>
                <input
                  type="text"
                  value={productForm.nameAr || ''}
                  onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                  placeholder="تفاح أحمر سكري"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'المجموعة (تحدد نسبة الضريبة مبدئياً):' : 'Category:'}
                </label>
                <select
                  value={productForm.category || categories[0]}
                  onChange={(e) => handleCategoryChangeForProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tax Rate Field (Strictly chosen from predefined tax rates table) */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{lang === 'ar' ? 'النسبة الضريبية المعتمدة للصنف (من جدول الضرائب):' : 'Assigned Tax Rate (From Tax Table):'}</span>
                  </label>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                    %{productForm.vatRate ?? 15}
                  </span>
                </div>
                <div>
                  <select
                    value={
                      productForm.taxRateId ||
                      (taxRates.find((t) => t.rate === productForm.vatRate)?.id ??
                        (taxRates.find((t) => t.isDefault)?.id || taxRates[0]?.id || 1))
                    }
                    onChange={(e) => {
                      const selId = Number(e.target.value);
                      const selRate = taxRates.find((t) => t.id === selId);
                      if (selRate) {
                        setProductForm((prev) => ({
                          ...prev,
                          taxRateId: selRate.id,
                          vatRate: selRate.rate,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {taxRates.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name} — [{tr.code}] بنسبة %{tr.rate} {tr.isDefault ? '(الافتراضي)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ar'
                    ? '* يرث الصنف نسبة المجموعة تلقائياً، ويمكن تخصيصه حصراً من ضمن النسب المعرفة في جدول الضرائب.'
                    : '* Item inherits category tax rate by default, and can be customized strictly from the predefined tax rates.'}
                </p>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الباركود العام (EAN-13):' : 'Barcode:'}
                </label>
                <input
                  type="text"
                  value={productForm.barcode || ''}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  placeholder="628100123456"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'سعر البيع (شامل الضريبة):' : 'Selling Price:'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price || 0}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'سعر التكلفة:' : 'Cost Price:'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.costPrice || 0}
                  onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الرصيد المتاح:' : 'Stock Quantity:'}
                </label>
                <input
                  type="number"
                  value={productForm.stock || 0}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'وحدة القياس:' : 'Unit:'}
                </label>
                <select
                  value={productForm.unit || 'حبة'}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="حبة">حبة (Piece)</option>
                  <option value="كجم">كجم (Kilogram)</option>
                  <option value="جرام">جرام (Gram)</option>
                  <option value="كرتون">كرتون (Carton)</option>
                  <option value="علبة">علبة (Pack)</option>
                  <option value="طرد">طرد (Bundle)</option>
                </select>
              </div>

              {/* Product Image Section */}
              <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-750/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{lang === 'ar' ? 'صورة المادة / الصنف:' : 'Product Image:'}</span>
                  </span>
                  {productForm.image && (
                    <button
                      type="button"
                      onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold"
                    >
                      {lang === 'ar' ? 'حذف الصورة' : 'Remove Image'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="item preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'اختيار صورة من الجهاز' : 'Upload from device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProductForm((prev) => ({
                                  ...prev,
                                  image: reader.result as string,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'أو أدخل رابط الصورة مباشرة:' : 'or URL:'}
                      </span>
                    </div>

                    <input
                      type="url"
                      value={productForm.image || ''}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, image: e.target.value }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Scale Configuration Box */}
              <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      {lang === 'ar' ? 'إعدادات الميزان الإلكتروني للصنف' : 'Digital Scale Settings'}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!productForm.isWeighted}
                      onChange={(e) => setProductForm({ ...productForm, isWeighted: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {lang === 'ar' ? 'صنف يباع بالوزن (ميزان)' : 'Weighted Item'}
                    </span>
                  </label>
                </div>

                {productForm.isWeighted && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <label className="block text-amber-800 dark:text-amber-300 font-semibold mb-1">
                        {lang === 'ar' ? 'رمز الصنف في الميزان الرقمي (5 أرقام):' : 'Scale Code (5 digits):'}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={productForm.scaleCode || ''}
                        onChange={(e) => setProductForm({ ...productForm, scaleCode: e.target.value })}
                        placeholder="00103"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center"
                      />
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block">
                        {lang === 'ar'
                          ? 'يُطبع هذا الرمز داخل باركود ملصق الميزان (مثلاً 2000103017505)'
                          : 'Embedded into weight barcode stickers'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-amber-800 dark:text-amber-300 font-semibold mb-1">
                        {lang === 'ar' ? 'سعر الكيلوغرام الواحد:' : 'Price per 1.000 KG:'}
                      </label>
                      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg font-mono font-bold text-emerald-600">
                        {productForm.price?.toFixed(2)} ر.س / كجم
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'رابط صورة الصنف (URL):' : 'Image URL:'}
                </label>
                <input
                  type="text"
                  value={productForm.image || ''}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIsNewProduct(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ الصنف' : 'Save Item'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
