import React, { useState } from 'react';
import {
  Settings,
  Users,
  Layers,
  Scale,
  CreditCard,
  Monitor,
  ChevronRight,
  Sliders,
  Percent,
  Database,
  Coins,
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
} from '../types';
import { EmployeesSettings } from './settings/EmployeesSettings';
import { ItemsCategoriesSettings } from './settings/ItemsCategoriesSettings';
import { ScaleSettings } from './settings/ScaleSettings';
import { CashRegistersAndPaymentsSettings } from './settings/CashRegistersAndPaymentsSettings';
import { ScreenLayoutSettings } from './settings/ScreenLayoutSettings';
import { TaxRatesSettings } from './settings/TaxRatesSettings';
import { DatabaseSettings } from './settings/DatabaseSettings';
import { CurrenciesSettings } from './settings/CurrenciesSettings';

export type SettingsTabId =
  | 'employees'
  | 'items_categories'
  | 'tax_rates'
  | 'currencies'
  | 'scales'
  | 'cash_registers'
  | 'screen_layout'
  | 'database';

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
  onUpdateUsers: (users: User[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategoryStyles: (styles: CategoryStyleConfig[]) => void;
  onUpdateScaleConfig: (config: ScaleConfig) => void;
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  onUpdateCashRegisters: (registers: CashRegister[]) => void;
  onUpdateScreenLayout: (layout: ScreenLayoutConfig) => void;
  onUpdateTaxRates: (rates: TaxRate[]) => void;
  onUpdateCurrencies?: (currencies: Currency[]) => void;
  lang: 'ar' | 'en';
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
  onUpdateUsers,
  onUpdateProducts,
  onUpdateCategoryStyles,
  onUpdateScaleConfig,
  onUpdatePaymentMethods,
  onUpdateCashRegisters,
  onUpdateScreenLayout,
  onUpdateTaxRates,
  onUpdateCurrencies = () => {},
  lang,
}: ProjectSettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('employees');

  const SETTINGS_PAGES: {
    id: SettingsTabId;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'employees',
      titleAr: 'الموظفين وصلاحياتهم',
      titleEn: 'Employees & Permissions',
      descAr: 'إضافة وتعديل بيانات الكادر، رمز PIN، والأدوار والصلاحيات الدقيقة',
      descEn: 'CRUD operations, roles, PINs, and granular POS permissions',
      icon: Users,
    },
    {
      id: 'items_categories',
      titleAr: 'الأصناف والمجموعات',
      titleEn: 'Items & Categories',
      descAr: 'تعريف الأصناف والمجموعات ونسب الضرائب الموروثة والصور والعرض',
      descEn: 'Categories & products with tax inheritance, images, colors & fonts',
      icon: Layers,
    },
    {
      id: 'tax_rates',
      titleAr: 'جدول النسب الضريبية',
      titleEn: 'Tax Rates Table',
      descAr: 'إدارة شرائح ونسب الضريبة (15%، معفى، صفري) ومزامنتها مع قاعدة البيانات',
      descEn: 'Manage VAT brackets (15%, zero, exempt) relational database sync',
      icon: Percent,
    },
    {
      id: 'currencies',
      titleAr: 'جدول العملات وأسعار الصرف',
      titleEn: 'Currencies & Rates',
      descAr: 'تعريف العملة الأساسية وأجزائها والمنازل العشرية وسعر التحويل',
      descEn: 'Base currency, subunits, decimal precision, and exchange rates',
      icon: Coins,
    },
    {
      id: 'scales',
      titleAr: 'تعريف الموازين والباركود',
      titleEn: 'Digital Scales & Barcode Rules',
      descAr: 'قواعد قراءة وتفكيك باركود الميزان (خانات الرمز والوزن) والاعتماد التلقائي',
      descEn: 'Scale barcode segmentation, item code & weight digits, and fallback',
      icon: Scale,
    },
    {
      id: 'cash_registers',
      titleAr: 'صناديق النقدية وطرق الدفع',
      titleEn: 'Cash Registers & Payment Methods',
      descAr: 'تعريف الصناديق وقنوات الدفع: فيزا، ماستر، محفظة، كليك، كاش، آجل',
      descEn: 'POS registers and payment channels (Visa, MasterCard, CliQ, Wallets)',
      icon: CreditCard,
    },
    {
      id: 'screen_layout',
      titleAr: 'إعدادات عرض الشاشة',
      titleEn: 'Screen Display & Layout',
      descAr: 'حجم الأزرار وموقعها للأصناف والمجموعات وموقع السلة وألوان أزرار الدفع',
      descEn: 'Button sizes, positions, category bar docking, and action button colors',
      icon: Monitor,
    },
    {
      id: 'database',
      titleAr: 'قاعدة بيانات Cloud SQL',
      titleEn: 'Cloud SQL Postgres',
      descAr: 'حالة اتصال خادم PostgreSQL والعلاقات والمزامنة السحابية',
      descEn: 'PostgreSQL database status, relationships and live synchronization',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'إعدادات المشروع والنظام المتقدمة' : 'System & Project Settings'}</span>
              <span className="text-[11px] bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                5 أقسام مخصصة
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar'
                ? 'لوحة الإعدادات الشاملة لإدارة الموظفين، الأصناف والمجموعات، الموازين الرقمية، صناديق الكاشير والدفع، وعرض الشاشة.'
                : 'Centralized settings hub for employees, items, scale barcode parsing, cash drawers, and display styling.'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Navigation Navigation Bar (Horizontal Tab Pills with descriptions) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {SETTINGS_PAGES.map((page) => {
          const IconC = page.icon;
          const isActive = activeTab === page.id;

          return (
            <button
              key={page.id}
              onClick={() => setActiveTab(page.id)}
              className={`p-3.5 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <IconC className="w-4 h-4" />
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
              </div>

              <div>
                <h3 className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {lang === 'ar' ? page.titleAr : page.titleEn}
                </h3>
                <p
                  className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${
                    isActive ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? page.descAr : page.descEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Page View Component */}
      <div className="transition-all">
        {activeTab === 'employees' && (
          <EmployeesSettings
            users={users}
            warehouses={warehouses}
            currentUser={currentUser}
            onUpdateUsers={onUpdateUsers}
            lang={lang}
          />
        )}

        {activeTab === 'items_categories' && (
          <ItemsCategoriesSettings
            products={products}
            categories={categories}
            categoryStyles={categoryStyles}
            taxRates={taxRates}
            onUpdateProducts={onUpdateProducts}
            onUpdateCategoryStyles={onUpdateCategoryStyles}
            lang={lang}
          />
        )}

        {activeTab === 'tax_rates' && (
          <TaxRatesSettings
            taxRates={taxRates}
            onUpdateTaxRates={onUpdateTaxRates}
            lang={lang}
          />
        )}

        {activeTab === 'currencies' && (
          <CurrenciesSettings
            currencies={currencies}
            onUpdateCurrencies={onUpdateCurrencies}
            lang={lang}
          />
        )}

        {activeTab === 'scales' && (
          <ScaleSettings
            scaleConfig={scaleConfig}
            products={products}
            onUpdateScaleConfig={onUpdateScaleConfig}
            lang={lang}
          />
        )}

        {activeTab === 'cash_registers' && (
          <CashRegistersAndPaymentsSettings
            registers={cashRegisters}
            paymentMethods={paymentMethods}
            warehouses={warehouses}
            users={users}
            accounts={accounts}
            onUpdateRegisters={onUpdateCashRegisters}
            onUpdatePaymentMethods={onUpdatePaymentMethods}
            lang={lang}
          />
        )}

        {activeTab === 'screen_layout' && (
          <ScreenLayoutSettings
            screenLayout={screenLayout}
            categoryStyles={categoryStyles}
            products={products}
            onUpdateScreenLayout={onUpdateScreenLayout}
            lang={lang}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseSettings lang={lang} />
        )}
      </div>
    </div>
  );
}
