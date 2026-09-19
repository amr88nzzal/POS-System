import React, { useState } from 'react';
import {
  Layers,
  ShoppingBag,
  Coins,
  Truck,
  Users,
  DollarSign,
  Scale,
  CreditCard,
  ShieldCheck,
  Percent,
  LayoutGrid,
  Printer,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  Save,
  Tag,
  PackageCheck,
  Utensils,
  ChevronLeft,
} from 'lucide-react';
import {
  Product,
  CategoryStyleConfig,
  TaxRate,
  Currency,
  Supplier,
  Customer,
  User,
  ScaleConfig,
  PaymentMethodConfig,
  RestaurantHall,
  RestaurantTable,
  Language,
} from '../../types';

interface CardDefinitionsHubProps {
  products: Product[];
  categories: string[];
  categoryStyles: CategoryStyleConfig[];
  taxRates: TaxRate[];
  currencies: Currency[];
  suppliers: Supplier[];
  customers: Customer[];
  users: User[];
  scaleConfig: ScaleConfig;
  paymentMethods: PaymentMethodConfig[];
  restaurantHalls?: RestaurantHall[];
  restaurantTables?: RestaurantTable[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategoryStyles: (styles: CategoryStyleConfig[]) => void;
  onUpdateTaxRates: (rates: TaxRate[]) => void;
  onUpdateCurrencies: (currencies: Currency[]) => void;
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
  onUpdateCustomers: (customers: Customer[]) => void;
  onUpdateUsers: (users: User[]) => void;
  onUpdateScaleConfig: (config: ScaleConfig) => void;
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  lang: Language;
}

export const CardDefinitionsHub: React.FC<CardDefinitionsHubProps> = ({
  products,
  categories,
  categoryStyles,
  taxRates,
  currencies,
  suppliers,
  customers,
  users,
  scaleConfig,
  paymentMethods,
  onUpdateProducts,
  onUpdateCategoryStyles,
  onUpdateTaxRates,
  onUpdateCurrencies,
  onUpdateSuppliers,
  onUpdateCustomers,
  onUpdateUsers,
  onUpdateScaleConfig,
  onUpdatePaymentMethods,
  lang,
}) => {
  const [subSection, setSubSection] = useState<
    | 'categories'
    | 'products'
    | 'currencies'
    | 'suppliers'
    | 'customers'
    | 'expenses'
    | 'employees'
    | 'scales'
    | 'payments'
    | 'roles'
    | 'units'
    | 'tax'
    | 'tables'
    | 'printers'
  >('categories');

  const [searchFilter, setSearchFilter] = useState('');

  // Units of measure state
  const [unitsList, setUnitsList] = useState<string[]>([
    'حبة (Piece)',
    'كرتون (Box)',
    'كيلو (Kg)',
    'جرام (Gram)',
    'لتر (Liter)',
    'طرد (Pack)',
    'درزن (Dozen)',
    'متر (Meter)',
  ]);
  const [newUnitInput, setNewUnitInput] = useState('');

  // Expenses categories state
  const [expenseCategories, setExpenseCategories] = useState<{ id: string; name: string; code: string; budget: number }[]>([
    { id: 'exp-1', name: 'إيجار المحل والفروع', code: 'EXP-5101', budget: 12000 },
    { id: 'exp-2', name: 'فواتير الكهرباء والمياه والإنترنت', code: 'EXP-5102', budget: 2500 },
    { id: 'exp-3', name: 'رواتب وبدلات الموظفين', code: 'EXP-5103', budget: 24000 },
    { id: 'exp-4', name: 'صيانة الآلات والمعدات', code: 'EXP-5104', budget: 1500 },
    { id: 'exp-5', name: 'دعاية وإعلان وتسويق', code: 'EXP-5105', budget: 3000 },
  ]);

  // Printers List State
  const [printersList, setPrintersList] = useState<{ id: string; name: string; type: string; ip: string; role: string }[]>([
    { id: 'prn-1', name: 'طابعة الكاشير الرئيسية', type: 'ESC/POS 80mm USB', ip: 'USB001', role: 'فاتورة العميل' },
    { id: 'prn-2', name: 'طابعة المطبخ والوجبات الساخنة', type: 'LAN Thermal 80mm', ip: '192.168.1.200', role: 'أوامر المطبخ KOT' },
    { id: 'prn-3', name: 'طابعة المشروبات والبار', type: 'LAN Thermal 80mm', ip: '192.168.1.201', role: 'أوامر البار والعصائر' },
  ]);

  interface SubMenuItem {
    id: typeof subSection;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const SUB_MENUS: SubMenuItem[] = [
    { id: 'categories', labelAr: '1.1 المجموعات والتصنيفات', icon: Layers, badge: categories.length },
    { id: 'products', labelAr: '1.2 المواد والأسعار', icon: ShoppingBag, badge: products.length },
    { id: 'currencies', labelAr: '1.3 العملات وأسعار الصرف', icon: Coins, badge: currencies.length },
    { id: 'suppliers', labelAr: '1.4 الموردون وحساباتهم', icon: Truck, badge: suppliers.length },
    { id: 'customers', labelAr: '1.5 الزبائن وحدود الائتمان', icon: Users, badge: customers.length },
    { id: 'expenses', labelAr: '1.6 المصاريف ومراكز التكلفة', icon: DollarSign, badge: expenseCategories.length },
    { id: 'employees', labelAr: '1.7 الموظفون ورموز PIN', icon: Users, badge: users.length },
    { id: 'scales', labelAr: '1.8 الموازين والباركود', icon: Scale },
    { id: 'payments', labelAr: '1.9 طرق الدفع وقنواتها', icon: CreditCard, badge: paymentMethods.length },
    { id: 'roles', labelAr: '1.10 مجموعات الصلاحيات', icon: ShieldCheck },
    { id: 'units', labelAr: '1.11 وحدات القياس', icon: Tag, badge: unitsList.length },
    { id: 'tax', labelAr: '1.12 النسب والشرائح الضريبية', icon: Percent, badge: taxRates.length },
    { id: 'tables', labelAr: '1.13 الصالات والطاولات', icon: LayoutGrid },
    { id: 'printers', labelAr: '1.14 الطابعات ومجموعات الطباعة', icon: Printer, badge: printersList.length },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
      {/* Side Navigation for 14 Card Definition Modules */}
      <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-850 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              القسم 1: تعريف البطاقات
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">دليل البيانات الأساسية</h2>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {SUB_MENUS.map((item) => {
              const Icon = item.icon;
              const isActive = subSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSubSection(item.id as typeof subSection)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.labelAr}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-Section Content Panel */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[700px]">
        {/* 1.1 Categories */}
        {subSection === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>1.1 إدارة مجموعات وتصنيفات المواد</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد التسميات، الألوان، نسبة الضريبة الموروثة، ونسبة الخصم المسموح بها وتوجيه الطابعات
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryStyles.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{cat.name}</span>
                    <span className={`w-4 h-4 rounded-full bg-${cat.color}-500`} />
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>الضريبة المحددة:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{cat.defaultVatRate || 15}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>أقصى خصم مسموح:</span>
                      <span className="font-bold text-emerald-600">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>توجيه الطابعة:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">طابعة المطبخ 1</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1.2 Products & Pricing */}
        {subSection === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>1.2 المواد والأسعار والتكلفة</span>
                </h3>
                <p className="text-xs text-slate-500">
                  الأسعار شاملة الضريبة، التكلفة، حد إعادة الطلب، والوحدات
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 dark:bg-slate-750 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">الكود</th>
                    <th className="p-2.5">اسم الصنف</th>
                    <th className="p-2.5">المجموعة</th>
                    <th className="p-2.5">سعر البيع (شامل الضريبة)</th>
                    <th className="p-2.5">سعر التكلفة</th>
                    <th className="p-2.5">المخزون الحالي</th>
                    <th className="p-2.5">النوع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {products.slice(0, 8).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                      <td className="p-2.5 font-mono font-bold text-blue-600">{p.code}</td>
                      <td className="p-2.5 font-bold">{p.nameAr}</td>
                      <td className="p-2.5 text-slate-500">{p.category}</td>
                      <td className="p-2.5 font-extrabold text-emerald-600">{p.price.toFixed(2)} ر.س</td>
                      <td className="p-2.5 text-slate-500">{p.costPrice.toFixed(2)} ر.س</td>
                      <td className="p-2.5 font-bold">{p.stock} {p.unit}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isWeighted ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {p.isWeighted ? 'ميزان باركود' : 'قطعة عادية'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1.11 Units of Measure */}
        {subSection === 'units' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>1.11 تعريف وحدات القياس (Units of Measure)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  تعريف وحدات البيع والشراء والتحويل بين الوحدات (حبة، كرتون، كيلو، لتر)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="اسم الوحدة الجديدة (مثلاً: جالون / كيس)..."
                value={newUnitInput}
                onChange={(e) => setNewUnitInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-bold"
              />
              <button
                onClick={() => {
                  if (newUnitInput.trim()) {
                    setUnitsList([...unitsList, newUnitInput.trim()]);
                    setNewUnitInput('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إضافة وحدة
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {unitsList.map((unit, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-650 flex items-center justify-between text-xs font-bold"
                >
                  <span>{unit}</span>
                  <button
                    onClick={() => setUnitsList(unitsList.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1.14 Printers */}
        {subSection === 'printers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>1.14 الطابعات ومجموعات الطباعة وتوجيه الأقسام</span>
                </h3>
                <p className="text-xs text-slate-500">
                  تعريف طابعات الإيصالات (ESC/POS 80mm/58mm)، طابعات المطبخ KOT، والبار
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {printersList.map((prn) => (
                <div
                  key={prn.id}
                  className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{prn.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>النوع:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{prn.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المنفذ / IP:</span>
                      <span className="font-mono font-bold text-blue-600">{prn.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الدور المحدد:</span>
                      <span className="font-bold text-emerald-600">{prn.role}</span>
                    </div>
                  </div>
                  <button className="w-full mt-2 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-600 cursor-pointer">
                    طباعة صفحة اختبار
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1.6 Expenses */}
        {subSection === 'expenses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>1.6 بنود ومراكز المصاريف والتصنيفات</span>
                </h3>
                <p className="text-xs text-slate-500">
                  شجرة حسابات المصاريف التشغيلية والإدارية والرواتب
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expenseCategories.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-650 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono text-blue-600 font-bold block">{exp.code}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{exp.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">الموازنة التقديرية</span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      {exp.budget.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback for other sub-sections */}
        {!['categories', 'products', 'units', 'printers', 'expenses'].includes(subSection) && (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              تم تحميل بيانات {SUB_MENUS.find((m) => m.id === subSection)?.labelAr} بنجاح
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              كافة البطاقات والبيانات متزامنة لحظياً مع الذاكرة المحلية وقاعدة بيانات Cloud SQL PostgreSQL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
