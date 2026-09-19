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
  ThemeMode,
  ScaleConfig,
  PaymentMethodConfig,
  CashRegister,
  ScreenLayoutConfig,
  CategoryStyleConfig,
  TaxRate,
  Currency,
  Supplier,
  PurchaseInvoice,
  RestaurantHall,
  RestaurantTable,
  ItemModifierGroup,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ACCOUNTS,
  INITIAL_WAREHOUSES,
  INITIAL_USERS,
  INITIAL_FIELD_REPS,
  INITIAL_INVOICES,
  INITIAL_TEMPLATE_CONFIG,
  INITIAL_VOUCHERS,
  INITIAL_SCALE_CONFIG,
  INITIAL_PAYMENT_METHODS,
  INITIAL_CASH_REGISTERS,
  INITIAL_SCREEN_LAYOUT,
  INITIAL_CATEGORY_STYLES,
  INITIAL_CURRENCIES,
  INITIAL_SUPPLIERS,
  INITIAL_RESTAURANT_HALLS,
  INITIAL_RESTAURANT_TABLES,
  INITIAL_RESTAURANT_MODIFIER_GROUPS,
} from '../data/initialData';

const KEYS = {
  PRODUCTS: 'pos_erp_products',
  CUSTOMERS: 'pos_erp_customers',
  ACCOUNTS: 'pos_erp_accounts',
  WAREHOUSES: 'pos_erp_warehouses',
  USERS: 'pos_erp_users',
  FIELD_REPS: 'pos_erp_reps',
  INVOICES: 'pos_erp_invoices',
  TEMPLATE: 'pos_erp_template',
  VOUCHERS: 'pos_erp_vouchers',
  CURRENT_USER: 'pos_erp_current_user',
  SYNC_CONFIG: 'pos_erp_sync_config',
  AUTO_BACKUP_ENABLED: 'pos_erp_auto_backup',
  THEME: 'pos_erp_theme',
  SCALE_CONFIG: 'pos_erp_scale_config',
  PAYMENT_METHODS: 'pos_erp_payment_methods',
  CASH_REGISTERS: 'pos_erp_cash_registers',
  SCREEN_LAYOUT: 'pos_erp_screen_layout',
  CATEGORY_STYLES: 'pos_erp_category_styles',
  TAX_RATES: 'pos_erp_tax_rates',
  CURRENCIES: 'pos_erp_currencies',
  SUPPLIERS: 'pos_erp_suppliers',
  PURCHASE_INVOICES: 'pos_erp_purchase_invoices',
  RESTAURANT_HALLS: 'pos_erp_restaurant_halls',
  RESTAURANT_TABLES: 'pos_erp_restaurant_tables',
  RESTAURANT_MODIFIERS: 'pos_erp_restaurant_modifiers',
};

export const INITIAL_TAX_RATES: TaxRate[] = [
  {
    id: 1,
    code: 'VAT_15',
    name: 'ضريبة القيمة المضافة القياسية (15%)',
    rate: 15,
    isDefault: true,
    description: 'النسبة الأساسية المفروضة على معظم السلع والخدمات',
  },
  {
    id: 2,
    code: 'VAT_0',
    name: 'ضريبة بنسبة الصفر (0%)',
    rate: 0,
    isDefault: false,
    description: 'السلع المصدرة والمؤهلة لنسبة الصفر',
  },
  {
    id: 3,
    code: 'VAT_EXEMPT',
    name: 'معفى من الضريبة (Exempt)',
    rate: 0,
    isDefault: false,
    description: 'الأنشطة والسلع المعفاة قانوناً من الضريبة',
  },
  {
    id: 4,
    code: 'VAT_5',
    name: 'ضريبة بنسبة مخفضة (5%)',
    rate: 5,
    isDefault: false,
    description: 'النسبة الضريبية المخفضة للقطاعات الخاصة',
  },
];

export function playBarcodeBeep() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function playSuccessChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // ignore
  }
}

export function playErrorBuzzer() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch {
    // ignore
  }
}

export function playDrawerOpenSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch {
    // ignore
  }
}

export const StorageService = {
  getProducts(): Product[] {
    const stored = localStorage.getItem(KEYS.PRODUCTS);
    if (!stored) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(stored);
      // Ensure new scale products from INITIAL_PRODUCTS are included if not present
      const hasScaleItem = parsed.some((p) => p.isWeighted || p.id === 'prd-011');
      if (!hasScaleItem) {
        const merged = [...parsed, ...INITIAL_PRODUCTS.filter((ip) => ip.isWeighted)];
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },
  saveProducts(data: Product[]) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data));
  },

  getCustomers(): Customer[] {
    const stored = localStorage.getItem(KEYS.CUSTOMERS);
    return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
  },
  saveCustomers(data: Customer[]) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data));
  },

  getAccounts(): Account[] {
    const stored = localStorage.getItem(KEYS.ACCOUNTS);
    return stored ? JSON.parse(stored) : INITIAL_ACCOUNTS;
  },
  saveAccounts(data: Account[]) {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(data));
  },

  getWarehouses(): Warehouse[] {
    const stored = localStorage.getItem(KEYS.WAREHOUSES);
    return stored ? JSON.parse(stored) : INITIAL_WAREHOUSES;
  },
  saveWarehouses(data: Warehouse[]) {
    localStorage.setItem(KEYS.WAREHOUSES, JSON.stringify(data));
  },

  getUsers(): User[] {
    const stored = localStorage.getItem(KEYS.USERS);
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  },
  saveUsers(data: User[]) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(data));
  },

  getFieldReps(): FieldRep[] {
    const stored = localStorage.getItem(KEYS.FIELD_REPS);
    return stored ? JSON.parse(stored) : INITIAL_FIELD_REPS;
  },
  saveFieldReps(data: FieldRep[]) {
    localStorage.setItem(KEYS.FIELD_REPS, JSON.stringify(data));
  },

  getInvoices(): Invoice[] {
    const stored = localStorage.getItem(KEYS.INVOICES);
    return stored ? JSON.parse(stored) : INITIAL_INVOICES;
  },
  saveInvoices(data: Invoice[]) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(data));
  },

  getVouchers(): Voucher[] {
    const stored = localStorage.getItem(KEYS.VOUCHERS);
    return stored ? JSON.parse(stored) : INITIAL_VOUCHERS;
  },
  saveVouchers(data: Voucher[]) {
    localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(data));
  },

  getTemplateConfig(): InvoiceTemplateConfig {
    const stored = localStorage.getItem(KEYS.TEMPLATE);
    return stored ? JSON.parse(stored) : INITIAL_TEMPLATE_CONFIG;
  },
  saveTemplateConfig(data: InvoiceTemplateConfig) {
    localStorage.setItem(KEYS.TEMPLATE, JSON.stringify(data));
  },

  getTheme(): ThemeMode {
    const stored = localStorage.getItem(KEYS.THEME) as ThemeMode | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  saveTheme(theme: ThemeMode) {
    localStorage.setItem(KEYS.THEME, theme);
  },

  getScaleConfig(): ScaleConfig {
    const stored = localStorage.getItem(KEYS.SCALE_CONFIG);
    return stored ? JSON.parse(stored) : INITIAL_SCALE_CONFIG;
  },
  saveScaleConfig(config: ScaleConfig) {
    localStorage.setItem(KEYS.SCALE_CONFIG, JSON.stringify(config));
  },

  getPaymentMethods(): PaymentMethodConfig[] {
    const stored = localStorage.getItem(KEYS.PAYMENT_METHODS);
    return stored ? JSON.parse(stored) : INITIAL_PAYMENT_METHODS;
  },
  savePaymentMethods(data: PaymentMethodConfig[]) {
    localStorage.setItem(KEYS.PAYMENT_METHODS, JSON.stringify(data));
  },

  getCashRegisters(): CashRegister[] {
    const stored = localStorage.getItem(KEYS.CASH_REGISTERS);
    return stored ? JSON.parse(stored) : INITIAL_CASH_REGISTERS;
  },
  saveCashRegisters(data: CashRegister[]) {
    localStorage.setItem(KEYS.CASH_REGISTERS, JSON.stringify(data));
  },

  getScreenLayout(): ScreenLayoutConfig {
    const stored = localStorage.getItem(KEYS.SCREEN_LAYOUT);
    return stored ? JSON.parse(stored) : INITIAL_SCREEN_LAYOUT;
  },
  saveScreenLayout(layout: ScreenLayoutConfig) {
    localStorage.setItem(KEYS.SCREEN_LAYOUT, JSON.stringify(layout));
  },

  getCategoryStyles(): CategoryStyleConfig[] {
    const stored = localStorage.getItem(KEYS.CATEGORY_STYLES);
    return stored ? JSON.parse(stored) : INITIAL_CATEGORY_STYLES;
  },
  saveCategoryStyles(styles: CategoryStyleConfig[]) {
    localStorage.setItem(KEYS.CATEGORY_STYLES, JSON.stringify(styles));
  },

  getTaxRates(): TaxRate[] {
    const stored = localStorage.getItem(KEYS.TAX_RATES);
    if (!stored) return INITIAL_TAX_RATES;
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_TAX_RATES;
    }
  },
  saveTaxRates(rates: TaxRate[]) {
    localStorage.setItem(KEYS.TAX_RATES, JSON.stringify(rates));
  },

  getCurrencies(): Currency[] {
    const stored = localStorage.getItem(KEYS.CURRENCIES);
    if (!stored) return INITIAL_CURRENCIES;
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CURRENCIES;
    }
  },
  saveCurrencies(currencies: Currency[]) {
    localStorage.setItem(KEYS.CURRENCIES, JSON.stringify(currencies));
  },

  getSuppliers(): Supplier[] {
    const stored = localStorage.getItem(KEYS.SUPPLIERS);
    if (!stored) return INITIAL_SUPPLIERS;
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SUPPLIERS;
    }
  },
  saveSuppliers(suppliers: Supplier[]) {
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },

  getPurchaseInvoices(): PurchaseInvoice[] {
    const stored = localStorage.getItem(KEYS.PURCHASE_INVOICES);
    if (!stored) {
      const samplePurchases: PurchaseInvoice[] = [
        {
          id: 'pur-1001',
          invoiceNumber: 'PINV-2026-001',
          supplierId: 'sup-1',
          supplierName: 'شركة المراعي للأغذية',
          warehouseId: 'wh-1',
          warehouseName: 'مستودع الرياض المركزي',
          date: '2026-09-15',
          time: '10:30',
          items: [
            {
              productId: 'prd-001',
              code: 'ITM-101',
              name: 'حليب كامل الدسم المراعي 1 لتر',
              qty: 100,
              costPrice: 4.8,
              vatRate: 15,
              vatAmount: 72,
              discount: 0,
              total: 552,
            },
          ],
          subtotal: 480,
          vatTotal: 72,
          discount: 0,
          grandTotal: 552,
          paidAmount: 552,
          paymentMethod: 'bank',
          status: 'completed',
          notes: 'شحنة الألبان الأسبوعية',
        },
      ];
      return samplePurchases;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },
  savePurchaseInvoices(purchases: PurchaseInvoice[]) {
    localStorage.setItem(KEYS.PURCHASE_INVOICES, JSON.stringify(purchases));
  },

  getCurrentUser(): User {
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Admin by default
  },
  saveCurrentUser(user: User) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getSyncStats(): SyncStats {
    const stored = localStorage.getItem(KEYS.SYNC_CONFIG);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      status: 'online',
      lastSyncedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      pendingSyncCount: 0,
      erpType: 'Odoo',
      apiKey: 'api_key_pos_994821a7c4e',
      apiEndpoint: 'https://erp.company.com/api/v2/pos_sync',
      autoSync: true,
    };
  },
  saveSyncStats(stats: SyncStats) {
    localStorage.setItem(KEYS.SYNC_CONFIG, JSON.stringify(stats));
  },

  getRestaurantHalls(): RestaurantHall[] {
    const stored = localStorage.getItem(KEYS.RESTAURANT_HALLS);
    if (!stored) return INITIAL_RESTAURANT_HALLS;
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_RESTAURANT_HALLS;
    }
  },
  saveRestaurantHalls(halls: RestaurantHall[]) {
    localStorage.setItem(KEYS.RESTAURANT_HALLS, JSON.stringify(halls));
  },

  getRestaurantTables(): RestaurantTable[] {
    const stored = localStorage.getItem(KEYS.RESTAURANT_TABLES);
    if (!stored) return INITIAL_RESTAURANT_TABLES;
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_RESTAURANT_TABLES;
    }
  },
  saveRestaurantTables(tables: RestaurantTable[]) {
    localStorage.setItem(KEYS.RESTAURANT_TABLES, JSON.stringify(tables));
  },

  getModifierGroups(): ItemModifierGroup[] {
    const stored = localStorage.getItem(KEYS.RESTAURANT_MODIFIERS);
    if (!stored) return INITIAL_RESTAURANT_MODIFIER_GROUPS;
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_RESTAURANT_MODIFIER_GROUPS;
    }
  },
  saveModifierGroups(groups: ItemModifierGroup[]) {
    localStorage.setItem(KEYS.RESTAURANT_MODIFIERS, JSON.stringify(groups));
  },

  // Export full JSON backup
  exportFullBackup(): string {
    const backup = {
      version: '2.5',
      exportDate: new Date().toISOString(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      accounts: this.getAccounts(),
      warehouses: this.getWarehouses(),
      users: this.getUsers(),
      fieldReps: this.getFieldReps(),
      invoices: this.getInvoices(),
      vouchers: this.getVouchers(),
      template: this.getTemplateConfig(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore full JSON backup
  restoreFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) this.saveProducts(data.products);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.accounts) this.saveAccounts(data.accounts);
      if (data.warehouses) this.saveWarehouses(data.warehouses);
      if (data.users) this.saveUsers(data.users);
      if (data.fieldReps) this.saveFieldReps(data.fieldReps);
      if (data.invoices) this.saveInvoices(data.invoices);
      if (data.vouchers) this.saveVouchers(data.vouchers);
      if (data.template) this.saveTemplateConfig(data.template);
      return true;
    } catch (e) {
      console.error('Backup restore failed', e);
      return false;
    }
  },
};
