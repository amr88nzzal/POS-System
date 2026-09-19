import React, { useState } from 'react';
import {
  Layers,
  Palette,
  HardDrive,
  Link2,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Store,
  Sparkles,
} from 'lucide-react';
import {
  User,
  Warehouse,
  Product,
  CategoryStyleConfig,
  ScaleConfig,
  PaymentMethodConfig,
  CashRegister,
  Account,
  ScreenLayoutConfig,
  TaxRate,
  Currency,
  Supplier,
  Customer,
  CostingMethod,
  Language,
} from '../types';
import { CardDefinitionsHub } from './settings/CardDefinitionsHub';
import { AppearanceHub } from './settings/AppearanceHub';
import { GeneralHardwareHub } from './settings/GeneralHardwareHub';
import { AccountingOperationsHub } from './settings/AccountingOperationsHub';

export type MainHubId = 'card_definitions' | 'appearance' | 'hardware' | 'accounting_sync';

interface ProjectSettingsScreenProps {
  users: User[];
  warehouses: Warehouse[];
  currentUser: User;
  products: Product[];
  categories: string[];
  categoryStyles: CategoryStyleConfig[];
  scaleConfig: ScaleConfig;
  paymentMethods: PaymentMethodConfig[];
  cashRegisters: CashRegister[];
  accounts: Account[];
  screenLayout: ScreenLayoutConfig;
  taxRates: TaxRate[];
  currencies?: Currency[];
  suppliers?: Supplier[];
  customers?: Customer[];
  costingMethod?: CostingMethod;
  onCostingMethodChange?: (method: CostingMethod) => void;
  onUpdateUsers: (users: User[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategoryStyles: (styles: CategoryStyleConfig[]) => void;
  onUpdateScaleConfig: (config: ScaleConfig) => void;
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  onUpdateCashRegisters: (registers: CashRegister[]) => void;
  onUpdateScreenLayout: (layout: ScreenLayoutConfig) => void;
  onUpdateTaxRates: (rates: TaxRate[]) => void;
  onUpdateCurrencies?: (currencies: Currency[]) => void;
  onUpdateSuppliers?: (suppliers: Supplier[]) => void;
  onUpdateCustomers?: (customers: Customer[]) => void;
  onCloseSettings?: () => void;
  lang: Language;
}

export function ProjectSettingsScreen({
  users,
  warehouses,
  currentUser,
  products,
  categories,
  categoryStyles,
  scaleConfig,
  paymentMethods,
  cashRegisters,
  accounts,
  screenLayout,
  taxRates,
  currencies = [],
  suppliers = [],
  customers = [],
  costingMethod = 'FIFO',
  onCostingMethodChange = () => {},
  onUpdateUsers,
  onUpdateProducts,
  onUpdateCategoryStyles,
  onUpdateScaleConfig,
  onUpdatePaymentMethods,
  onUpdateCashRegisters,
  onUpdateScreenLayout,
  onUpdateTaxRates,
  onUpdateCurrencies = () => {},
  onUpdateSuppliers = () => {},
  onUpdateCustomers = () => {},
  onCloseSettings,
  lang,
}: ProjectSettingsScreenProps) {
  const [activeHub, setActiveHub] = useState<MainHubId>('card_definitions');

  // 4 Main Hubs Definitions matching the User's exact prompt
  const HUBS: {
    id: MainHubId;
    hubNumber: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    badge: string;
  }[] = [
    {
      id: 'card_definitions',
      hubNumber: '1',
      titleAr: '1- تعريف البطاقات',
      titleEn: '1- Card Definitions',
      descAr: 'المجموعات، المواد والأسعار، العملات، الموردون، الزبائن، المصاريف، الموظفون، الموازين، وطرق الدفع، الصالات، والطابعات (14 قسماً)',
      descEn: 'Categories, Items, Currencies, Suppliers, Customers, Scales, Roles & Printers',
      icon: Layers,
      colorClass: 'from-blue-600 to-indigo-600 text-blue-600',
      badge: '14 دليلاً أساسياً',
    },
    {
      id: 'appearance',
      hubNumber: '2',
      titleAr: '2- تصميم المظهر وتخصيص الواجهات',
      titleEn: '2- Appearance & Screen Layout',
      descAr: 'تخصيص شاشة المبيعات (أزرار الأوامر والمواد وألوانها)، قوالب الفواتير الحرارية، تقارير المبيعات، وبيانات الترويسة وZATCA QR',
      descEn: 'Sales screen customizer, POS mode, Receipt & Invoice templates, Branding',
      icon: Palette,
      colorClass: 'from-purple-600 to-pink-600 text-purple-600',
      badge: 'واجهات وفواتير',
    },
    {
      id: 'hardware',
      hubNumber: '3',
      titleAr: '3- الإعدادات العامة والأجهزة',
      titleEn: '3- General & Hardware Settings',
      descAr: 'أكواد فتح درج الكاش، أجهزة بطاقات مدى/فيزا (ERSO)، الترقيم والتسلسل، وتنبيهات الفواتير غير المغلقة والأصوات الذكية',
      descEn: 'Cash drawer codes, POS card terminals, Sequences & sound alerts',
      icon: HardDrive,
      colorClass: 'from-amber-600 to-orange-600 text-amber-600',
      badge: 'أجهزة وتنبيهات',
    },
    {
      id: 'accounting_sync',
      hubNumber: '4',
      titleAr: '4- التزامن المحاسبي والعمليات',
      titleEn: '4- Accounting Sync & Operations',
      descAr: 'الربط مع البرامج المحاسبية (Odoo/API)، تصدير واستيراد Excel، إغلاق اليوم عند ساعة محددة، أتمتة الطباعة، وتكلفة المبيعات FIFO',
      descEn: 'ERP sync, Excel import/export, Auto day close, Print automation & Costing',
      icon: Link2,
      colorClass: 'from-emerald-600 to-teal-600 text-emerald-600',
      badge: 'مزامنة وتكلفة',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Admin Top Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
            <Sliders className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>صلاحية الإدارة العليا (Admin)</span>
              </span>
              <span className="text-xs text-slate-400">
                المستخدم الحالي: <strong>{currentUser.name}</strong>
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {lang === 'ar' ? 'لوحة الإعدادات الشاملة وضبط النظام' : 'Full Enterprise Settings Hub'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar'
                ? 'إدارة متكاملة مقسمة إلى 4 أبواب رئيسية: تعريف البطاقات، المظهر والفواتير، الأجهزة والطرفيات، والتزامن المحاسبي.'
                : 'Centralized 4-hub administration for definitions, layout, hardware, and ERP synchronization.'}
            </p>
          </div>
        </div>

        {onCloseSettings && (
          <button
            onClick={onCloseSettings}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <span>{lang === 'ar' ? 'العودة لشاشة المبيعات' : 'Back to POS Screen'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4 Main Category Cards Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {HUBS.map((hub) => {
          const Icon = hub.icon;
          const isActive = activeHub === hub.id;

          return (
            <button
              key={hub.id}
              onClick={() => setActiveHub(hub.id)}
              className={`p-4 rounded-3xl text-right transition-all flex flex-col justify-between border cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 ring-2 ring-blue-500/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}
                >
                  {hub.badge}
                </span>
              </div>

              <div>
                <h3 className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {lang === 'ar' ? hub.titleAr : hub.titleEn}
                </h3>
                <p
                  className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                    isActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? hub.descAr : hub.descEn}
                </p>
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Render Selected Hub Module */}
      <div className="transition-all">
        {activeHub === 'card_definitions' && (
          <CardDefinitionsHub
            products={products}
            categories={categories}
            categoryStyles={categoryStyles}
            taxRates={taxRates}
            currencies={currencies}
            suppliers={suppliers}
            customers={customers}
            users={users}
            scaleConfig={scaleConfig}
            paymentMethods={paymentMethods}
            onUpdateProducts={onUpdateProducts}
            onUpdateCategoryStyles={onUpdateCategoryStyles}
            onUpdateTaxRates={onUpdateTaxRates}
            onUpdateCurrencies={onUpdateCurrencies}
            onUpdateSuppliers={onUpdateSuppliers}
            onUpdateCustomers={onUpdateCustomers}
            onUpdateUsers={onUpdateUsers}
            onUpdateScaleConfig={onUpdateScaleConfig}
            onUpdatePaymentMethods={onUpdatePaymentMethods}
            lang={lang}
          />
        )}

        {activeHub === 'appearance' && (
          <AppearanceHub
            screenLayout={screenLayout}
            categoryStyles={categoryStyles}
            products={products}
            onUpdateScreenLayout={onUpdateScreenLayout}
            lang={lang}
          />
        )}

        {activeHub === 'hardware' && <GeneralHardwareHub lang={lang} />}

        {activeHub === 'accounting_sync' && (
          <AccountingOperationsHub
            costingMethod={costingMethod}
            onCostingMethodChange={onCostingMethodChange}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
