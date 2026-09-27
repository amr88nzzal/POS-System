import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  RotateCcw,
  BarChart3,
  Link2,
  Navigation,
  FileText,
  Palette,
  ShieldCheck,
  Smartphone,
  HardDriveDownload,
  Upload,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Database,
  RefreshCw,
  Settings,
  Truck,
  Receipt,
  Utensils,
} from 'lucide-react';

import {
  Product,
  Customer,
  Account,
  Warehouse,
  User,
  FieldRep,
  Invoice,
  InvoiceTemplateConfig,
  Voucher,
  SyncStats,
  Language,
  CostingMethod,
  ThemeMode,
  Currency,
  ScaleConfig,
  PaymentMethodConfig,
  CashRegister,
  ScreenLayoutConfig,
  CategoryStyleConfig,
  TaxRate,
  Supplier,
  PurchaseInvoice,
} from './types';

import { StorageService } from './utils/storage';
import { CurrencyService } from './utils/currencies';
import { ApiService } from './utils/apiService';
import { Header } from './components/Header';
import { POSScreen } from './components/POSScreen';
import { RestaurantPOSScreen } from './components/RestaurantPOSScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ReturnsManagement } from './components/ReturnsManagement';
import { PurchasesScreen } from './components/PurchasesScreen';
import { AccountingSyncScreen } from './components/AccountingSyncScreen';
import { VouchersScreen } from './components/VouchersScreen';
import { GpsTrackingScreen } from './components/GpsTrackingScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { DesignerScreen } from './components/DesignerScreen';
import { UserManagementScreen } from './components/UserManagementScreen';
import { MobileAppScreen } from './components/MobileAppScreen';
import { CurrencyModal } from './components/CurrencyModal';
import { DigitalScaleModal } from './components/DigitalScaleModal';
import { ProjectSettingsScreen } from './components/ProjectSettingsScreen';
import { PinLoginScreen } from './components/PinLoginScreen';
import { CollapsibleSideDrawer } from './components/CollapsibleSideDrawer';
import { RetailPurchasesPOS } from './components/RetailPurchasesPOS';

type ScreenTab =
  | 'pos'
  | 'inventory'
  | 'returns'
  | 'purchases'
  | 'accounting'
  | 'vouchers'
  | 'gps'
  | 'reports'
  | 'designer'
  | 'settings'
  | 'users'
  | 'mobile';

export default function App() {
  // App state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<ScreenTab>('pos');
  const [lang, setLang] = useState<Language>('ar');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [costingMethod, setCostingMethod] = useState<CostingMethod>('FIFO');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Core Data loaded from localStorage via StorageService
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => StorageService.getSuppliers());
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => StorageService.getPurchaseInvoices());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.getAccounts());
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => StorageService.getWarehouses());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [fieldReps, setFieldReps] = useState<FieldRep[]>(() => StorageService.getFieldReps());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [vouchers, setVouchers] = useState<Voucher[]>(() => StorageService.getVouchers());
  const [templateConfig, setTemplateConfig] = useState<InvoiceTemplateConfig>(() => StorageService.getTemplateConfig());
  const [syncStats, setSyncStats] = useState<SyncStats>(() => StorageService.getSyncStats());

  // Multi-currency & Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => StorageService.getTheme());
  const [currencies, setCurrencies] = useState<Currency[]>(() => CurrencyService.getCurrencies());
  const [activeCurrency, setActiveCurrency] = useState<Currency>(() => CurrencyService.getActiveCurrency());
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Modular Project Settings State
  const [scaleConfig, setScaleConfig] = useState<ScaleConfig>(() => StorageService.getScaleConfig());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(() => StorageService.getPaymentMethods());
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(() => StorageService.getCashRegisters());
  const [screenLayout, setScreenLayout] = useState<ScreenLayoutConfig>(() => StorageService.getScreenLayout());
  const [categoryStyles, setCategoryStyles] = useState<CategoryStyleConfig[]>(() => StorageService.getCategoryStyles());
  const [taxRates, setTaxRates] = useState<TaxRate[]>(() => StorageService.getTaxRates());
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [selectedModule, setSelectedModule] = useState<'all' | 'sales' | 'inventory' | 'finance' | 'reports' | 'field' | 'settings'>('all');

  // Hydrate data from Cloud SQL PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    async function loadCloudSqlData() {
      try {
        const health = await ApiService.checkHealth().catch(() => ({ connected: false }));
        if (isMounted) setDbConnected(health.connected);

        const [cloudTaxRates, cloudProducts] = await Promise.all([
          ApiService.fetchTaxRates().catch(() => null),
          ApiService.fetchProducts().catch(() => null),
        ]);

        if (isMounted) {
          if (cloudTaxRates && cloudTaxRates.length > 0) {
            setTaxRates(cloudTaxRates);
            StorageService.saveTaxRates(cloudTaxRates);
          }
          if (cloudProducts && cloudProducts.length > 0) {
            setProducts(cloudProducts);
            StorageService.saveProducts(cloudProducts);
          }
        }
      } catch (e) {
        console.warn('Falling back to local storage:', e);
      }
    }
    loadCloudSqlData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize Dark / Light Mode with HTML document class
  useEffect(() => {
    StorageService.saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen to network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync if pending
      if (syncStats.pendingSyncCount > 0) {
        handleTriggerSync();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStats]);

  // Synchronize document dir and title with language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Save changes to localStorage handlers
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    StorageService.saveProducts(newProducts);
  };

  const handleUpdateCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    StorageService.saveCustomers(newCustomers);
  };

  const handleUpdateAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    StorageService.saveAccounts(newAccounts);
  };

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    StorageService.saveUsers(newUsers);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    StorageService.saveCurrentUser(user);
  };

  const handleUpdateFieldReps = (newReps: FieldRep[]) => {
    setFieldReps(newReps);
    StorageService.saveFieldReps(newReps);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    const updated = [invoice, ...invoices];
    setInvoices(updated);
    StorageService.saveInvoices(updated);

    // If offline, increment pending sync
    if (!isOnline) {
      const updatedStats: SyncStats = {
        ...syncStats,
        status: 'pending_sync',
        pendingSyncCount: syncStats.pendingSyncCount + 1,
      };
      setSyncStats(updatedStats);
      StorageService.saveSyncStats(updatedStats);
    }
  };

  const handleUpdateInvoice = (updatedInv: Invoice) => {
    const updated = invoices.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv));
    setInvoices(updated);
    StorageService.saveInvoices(updated);
  };

  const handleSaveVoucher = (voucher: Voucher) => {
    const updated = [voucher, ...vouchers];
    setVouchers(updated);
    StorageService.saveVouchers(updated);
  };

  const handleSavePurchase = (purchase: PurchaseInvoice) => {
    const updated = [purchase, ...purchases];
    setPurchases(updated);
    StorageService.savePurchaseInvoices(updated);
  };

  const handleUpdateSuppliers = (newSuppliers: Supplier[]) => {
    setSuppliers(newSuppliers);
    StorageService.saveSuppliers(newSuppliers);
  };

  const handleSaveTemplateConfig = (cfg: InvoiceTemplateConfig) => {
    setTemplateConfig(cfg);
    StorageService.saveTemplateConfig(cfg);
  };

  const handleSaveSyncStats = (stats: SyncStats) => {
    setSyncStats(stats);
    StorageService.saveSyncStats(stats);
  };

  // Handlers for Project Settings
  const handleUpdateScaleConfig = (cfg: ScaleConfig) => {
    setScaleConfig(cfg);
    StorageService.saveScaleConfig(cfg);
  };

  const handleUpdatePaymentMethods = (methods: PaymentMethodConfig[]) => {
    setPaymentMethods(methods);
    StorageService.savePaymentMethods(methods);
  };

  const handleUpdateCashRegisters = (regs: CashRegister[]) => {
    setCashRegisters(regs);
    StorageService.saveCashRegisters(regs);
  };

  const handleUpdateScreenLayout = (lyt: ScreenLayoutConfig) => {
    setScreenLayout(lyt);
    StorageService.saveScreenLayout(lyt);
  };

  const handleUpdateCategoryStyles = (styles: CategoryStyleConfig[]) => {
    setCategoryStyles(styles);
    StorageService.saveCategoryStyles(styles);
  };

  const handleUpdateTaxRates = (rates: TaxRate[]) => {
    setTaxRates(rates);
    StorageService.saveTaxRates(rates);
  };

  const handleTriggerSync = () => {
    if (!isOnline) {
      alert(lang === 'ar' ? 'الجهاز في وضع غير متصل، سيتم التزامن فور توفر الإنترنت' : 'Offline: Will sync once connected');
      return;
    }

    setSyncStats((prev) => ({ ...prev, status: 'syncing' }));

    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const completedStats: SyncStats = {
        ...syncStats,
        status: 'online',
        lastSyncedAt: nowStr,
        pendingSyncCount: 0,
      };
      setSyncStats(completedStats);
      StorageService.saveSyncStats(completedStats);
    }, 1500);
  };

  // Backup & Restore handlers
  const handleExportBackup = () => {
    const backupJson = StorageService.exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloud_pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage({
      type: 'success',
      text: lang === 'ar' ? 'تم تنزيل ملف النسخة الاحتياطية بنجاح' : 'Backup downloaded successfully',
    });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.restoreFullBackup(content);
      if (success) {
        setProducts(StorageService.getProducts());
        setCustomers(StorageService.getCustomers());
        setAccounts(StorageService.getAccounts());
        setWarehouses(StorageService.getWarehouses());
        setUsers(StorageService.getUsers());
        setFieldReps(StorageService.getFieldReps());
        setInvoices(StorageService.getInvoices());
        setVouchers(StorageService.getVouchers());
        setTemplateConfig(StorageService.getTemplateConfig());
        setBackupMessage({
          type: 'success',
          text: lang === 'ar' ? 'تمت استعادة كافة البيانات والنسخة الاحتياطية بنجاح!' : 'Data restored successfully!',
        });
      } else {
        setBackupMessage({
          type: 'error',
          text: lang === 'ar' ? 'فشل استيراد الملف، تأكد من صحة ملف JSON' : 'Failed to parse backup JSON file',
        });
      }
    };
    reader.readAsText(file);
  };

  // Reorganized and categorized navigation tabs configuration matching workflow groups
  const MODULE_CATEGORIES = [
    { id: 'all', labelAr: 'كافة الشاشات', labelEn: 'All Screens' },
    { id: 'sales', labelAr: 'المبيعات والمشتريات والمردود', labelEn: 'Sales & Purchases' },
    { id: 'finance', labelAr: 'سندات الصرف والقبض والمالية', labelEn: 'Vouchers & Accounts' },
    { id: 'inventory', labelAr: 'المستودعات والمخزون', labelEn: 'Inventory & Stock' },
    { id: 'reports', labelAr: 'التقارير وأداء المناديب', labelEn: 'Reports & Targets' },
    { id: 'field', labelAr: 'الميدان وتطبيقات الجوال', labelEn: 'Mobility' },
    { id: 'settings', labelAr: 'الإعدادات وقاعدة البيانات', labelEn: 'System Settings' },
  ] as const;

  const navTabs = [
    {
      id: 'pos' as ScreenTab,
      module: 'sales',
      labelAr: screenLayout.posMode === 'restaurant' ? 'نقطة بيع المطاعم والكافيهات' : 'نقطة البيع (الكاشير)',
      labelEn: screenLayout.posMode === 'restaurant' ? 'Restaurant POS (Touch)' : 'Point of Sale (Retail)',
      icon: screenLayout.posMode === 'restaurant' ? Utensils : ShoppingCart,
      badge: screenLayout.posMode === 'restaurant' ? 'المطاعم' : 'الرئيسية',
    },
    {
      id: 'returns' as ScreenTab,
      module: 'sales',
      labelAr: 'مردود المبيعات',
      labelEn: 'Sales Returns',
      icon: RotateCcw,
    },
    {
      id: 'purchases' as ScreenTab,
      module: 'sales',
      labelAr: 'فواتير المشتريات والموردين',
      labelEn: 'Purchases & Suppliers',
      icon: Truck,
      badge: 'المشتريات والمردود',
    },
    {
      id: 'vouchers' as ScreenTab,
      module: 'finance',
      labelAr: 'سندات الصرف والقبض (مع تحديد الحساب)',
      labelEn: 'Vouchers (Pay & Receive)',
      icon: FileText,
      badge: 'قائمة منسدلة',
    },
    {
      id: 'accounting' as ScreenTab,
      module: 'finance',
      labelAr: 'دليل الحسابات ومزامنة ERP',
      labelEn: 'Accounts & ERP Sync',
      icon: Link2,
    },
    {
      id: 'inventory' as ScreenTab,
      module: 'inventory',
      labelAr: 'المستودعات والأصناف والتكلفة',
      labelEn: 'Warehouses & Stock',
      icon: Package,
    },
    {
      id: 'reports' as ScreenTab,
      module: 'reports',
      labelAr: 'التقارير والضريبة وتارغت المناديب',
      labelEn: 'Reports, VAT & Targets',
      icon: BarChart3,
      badge: 'تارغت المناديب',
    },
    {
      id: 'gps' as ScreenTab,
      module: 'field',
      labelAr: 'تتبع مناديب المبيعات GPS',
      labelEn: 'Field Reps GPS',
      icon: Navigation,
    },
    {
      id: 'mobile' as ScreenTab,
      module: 'field',
      labelAr: 'تطبيق جوال الإدارة',
      labelEn: 'Mobile Companion',
      icon: Smartphone,
    },
    {
      id: 'settings' as ScreenTab,
      module: 'settings',
      labelAr: 'إعدادات النظام والعملات والضرائب',
      labelEn: 'System Settings',
      icon: Settings,
      badge: 'العملات والضرائب',
    },
    {
      id: 'designer' as ScreenTab,
      module: 'settings',
      labelAr: 'تصميم قوالب الفواتير والسندات',
      labelEn: 'Template Designer',
      icon: Palette,
    },
    {
      id: 'users' as ScreenTab,
      module: 'settings',
      labelAr: 'المستخدمين والصلاحيات والتارغت',
      labelEn: 'Users & Roles',
      icon: ShieldCheck,
    },
  ];

  const visibleNavTabs =
    selectedModule === 'all'
      ? navTabs
      : navTabs.filter((tab) => tab.module === selectedModule);

  // If user is not authenticated, render PIN Login Screen first
  if (!isAuthenticated) {
    return (
      <PinLoginScreen
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      />
    );
  }

  return (
    <div
      className="h-screen bg-slate-100 dark:bg-slate-900 flex flex-row font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white transition-colors overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Collapsible Quick-Access Side Navigation (Beside the main workspace) */}
      <CollapsibleSideDrawer
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as ScreenTab)}
        lang={lang}
        onToggleLanguage={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onLockScreen={() => setIsAuthenticated(false)}
        currentUser={currentUser}
        posMode={screenLayout.posMode}
        activeCurrency={activeCurrency}
        onOpenCurrencyModal={() => setShowCurrencyModal(true)}
        onOpenScaleModal={() => setShowScaleModal(true)}
        isOnline={isOnline}
        onToggleOnlineMode={() => setIsOnline(!isOnline)}
        onOpenBackupModal={() => {
          setBackupMessage(null);
          setShowBackupModal(true);
        }}
      />

      {/* Main Screen Content Area (Directly beside the sidebar, occupying full height & remaining width) */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col bg-slate-100 dark:bg-slate-900">
        <main className="flex-1 pb-10">
        {currentTab === 'pos' && (
          screenLayout.posMode === 'restaurant' ? (
            <RestaurantPOSScreen
              products={products}
              customers={customers}
              currentUser={currentUser}
              users={users}
              templateConfig={templateConfig}
              lang={lang}
              onSaveInvoice={handleSaveInvoice}
              onUpdateProducts={handleUpdateProducts}
              onUpdateCustomers={handleUpdateCustomers}
              isOnline={isOnline}
              activeCurrency={activeCurrency}
              onOpenCurrencyModal={() => setShowCurrencyModal(true)}
              screenLayout={screenLayout}
              configuredPaymentMethods={paymentMethods}
              onSwitchToRetail={() => handleUpdateScreenLayout({ ...screenLayout, posMode: 'retail' })}
            />
          ) : (
            <POSScreen
              products={products}
              customers={customers}
              currentUser={currentUser}
              users={users}
              templateConfig={templateConfig}
              lang={lang}
              onSaveInvoice={handleSaveInvoice}
              onUpdateProducts={handleUpdateProducts}
              onUpdateCustomers={handleUpdateCustomers}
              isOnline={isOnline}
              activeCurrency={activeCurrency}
              onOpenCurrencyModal={() => setShowCurrencyModal(true)}
              onOpenScaleModal={() => setShowScaleModal(true)}
              scaleConfig={scaleConfig}
              screenLayout={screenLayout}
              categoryStyles={categoryStyles}
              configuredPaymentMethods={paymentMethods}
              onSwitchToRestaurant={() => handleUpdateScreenLayout({ ...screenLayout, posMode: 'restaurant' })}
            />
          )
        )}

        {currentTab === 'inventory' && (
          <InventoryScreen
            products={products}
            warehouses={warehouses}
            lang={lang}
            onUpdateProducts={handleUpdateProducts}
            costingMethod={costingMethod}
            onCostingMethodChange={setCostingMethod}
          />
        )}

        {currentTab === 'returns' && (
          <ReturnsManagement
            invoices={invoices}
            products={products}
            customers={customers}
            lang={lang}
            onUpdateInvoice={handleUpdateInvoice}
            onUpdateProducts={handleUpdateProducts}
            onUpdateCustomers={handleUpdateCustomers}
          />
        )}

        {currentTab === 'purchases' && (
          <RetailPurchasesPOS
            products={products}
            warehouses={warehouses}
            suppliers={suppliers}
            purchaseInvoices={purchases}
            onUpdateProducts={handleUpdateProducts}
            onUpdateSuppliers={handleUpdateSuppliers}
            onUpdatePurchaseInvoices={(updatedList) => {
              setPurchases(updatedList);
              StorageService.savePurchaseInvoices(updatedList);
            }}
            lang={lang}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsScreen
            invoices={invoices}
            products={products}
            users={users}
            lang={lang}
            costingMethod={costingMethod}
          />
        )}

        {currentTab === 'accounting' && (
          <AccountingSyncScreen
            accounts={accounts}
            customers={customers}
            syncStats={syncStats}
            lang={lang}
            onUpdateAccounts={handleUpdateAccounts}
            onUpdateCustomers={handleUpdateCustomers}
            onSaveSyncStats={handleSaveSyncStats}
            onTriggerSync={handleTriggerSync}
          />
        )}

        {currentTab === 'vouchers' && (
          <VouchersScreen
            vouchers={vouchers}
            accounts={accounts}
            lang={lang}
            onSaveVoucher={handleSaveVoucher}
            onUpdateAccounts={handleUpdateAccounts}
          />
        )}

        {currentTab === 'gps' && (
          <GpsTrackingScreen
            reps={fieldReps}
            customers={customers}
            lang={lang}
            onUpdateReps={handleUpdateFieldReps}
          />
        )}

        {currentTab === 'designer' && (
          <DesignerScreen
            config={templateConfig}
            lang={lang}
            onSaveConfig={handleSaveTemplateConfig}
          />
        )}

        {currentTab === 'settings' && (
          <ProjectSettingsScreen
            users={users}
            warehouses={warehouses}
            currentUser={currentUser}
            products={products}
            categories={Array.from(new Set(products.map((p) => p.category)))}
            categoryStyles={categoryStyles}
            scaleConfig={scaleConfig}
            paymentMethods={paymentMethods}
            cashRegisters={cashRegisters}
            accounts={accounts}
            screenLayout={screenLayout}
            taxRates={taxRates}
            currencies={currencies}
            suppliers={suppliers}
            customers={customers}
            costingMethod={costingMethod}
            onCostingMethodChange={setCostingMethod}
            onUpdateUsers={handleUpdateUsers}
            onUpdateProducts={handleUpdateProducts}
            onUpdateCategoryStyles={handleUpdateCategoryStyles}
            onUpdateScaleConfig={handleUpdateScaleConfig}
            onUpdatePaymentMethods={handleUpdatePaymentMethods}
            onUpdateCashRegisters={handleUpdateCashRegisters}
            onUpdateScreenLayout={handleUpdateScreenLayout}
            onUpdateTaxRates={handleUpdateTaxRates}
            onUpdateCurrencies={(newCurrencies) => {
              setCurrencies(newCurrencies);
              CurrencyService.saveCurrencies(newCurrencies);
            }}
            onUpdateSuppliers={handleUpdateSuppliers}
            onUpdateCustomers={handleUpdateCustomers}
            onCloseSettings={() => setCurrentTab('pos')}
            lang={lang}
          />
        )}

        {currentTab === 'users' && (
          <UserManagementScreen
            users={users}
            lang={lang}
            onUpdateUsers={handleUpdateUsers}
          />
        )}

        {currentTab === 'mobile' && (
          <MobileAppScreen
            invoices={invoices}
            products={products}
            reps={fieldReps}
            warehouses={warehouses}
            lang={lang}
          />
        )}
      </main>
      </div>

      {/* Auto Backup & Restore Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>{lang === 'ar' ? 'نظام النسخ الاحتياطي التلقائي وأمان البيانات' : 'Automated Backup & Data Safety'}</span>
              </h3>
              <button
                onClick={() => setShowBackupModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">نظام الأمان اللحظي مفعل تلقائياً</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    يتم حفظ كافة فواتير المبيعات، حركات المخزون، والسندات محلياً في الذاكرة المشفرة للمتصفح فور حدوث أي عملية.
                  </div>
                </div>
              </div>

              {backupMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold ${
                    backupMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {backupMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Export Backup */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <HardDriveDownload className="w-4 h-4 text-blue-600" />
                      <span>تصدير نسخة كاملة</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      تنزيل ملف بصيغة JSON يضم كافة المنتجات، الفواتير، دليل الحسابات وسندات القبض.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                  >
                    تنزيل النسخة الآن
                  </button>
                </div>

                {/* Import Backup */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>استعادة نسخة سابقة</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      رفع ملف نسخة احتياطية سابقة لاستعادة كافة البيانات والأرصدة بضغطة زر.
                    </p>
                  </div>
                  <label className="mt-3 w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs text-center cursor-pointer block">
                    <span>اختيار ملف JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowBackupModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL CURRENCY MANAGEMENT MODAL */}
      {showCurrencyModal && (
        <CurrencyModal
          currencies={currencies}
          activeCurrency={activeCurrency}
          lang={lang}
          onSelectCurrency={(cur) => {
            setActiveCurrency(cur);
            CurrencyService.setActiveCurrency(cur);
          }}
          onUpdateCurrencies={(newCurrencies) => {
            setCurrencies(newCurrencies);
            CurrencyService.saveCurrencies(newCurrencies);
          }}
          onClose={() => setShowCurrencyModal(false)}
        />
      )}

      {/* GLOBAL DIGITAL SCALE MODAL */}
      {showScaleModal && (
        <DigitalScaleModal
          products={products}
          activeCurrency={activeCurrency}
          lang={lang}
          onClose={() => setShowScaleModal(false)}
          onAddWeightedProduct={(product, weightKg) => {
            setShowScaleModal(false);
            setCurrentTab('pos');
          }}
        />
      )}
    </div>
  );
}
