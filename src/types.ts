export type Language = 'ar' | 'en';

export type ThemeMode = 'light' | 'dark';

export type UserRole = 'admin' | 'branch_manager' | 'accountant' | 'cashier' | 'field_rep';

export type CostingMethod = 'FIFO' | 'AVCO';

export type DeliveryMethod = 'direct' | 'pickup' | 'delivery'; // تسليم مباشر | استلام | توصيل

export type DiscountTiming = 'before_tax' | 'after_tax'; // خصم قبل الضريبة | خصم بعد الضريبة

export interface Currency {
  id: string;
  code: string; // e.g. 'SAR', 'USD', 'EUR', 'AED', 'KWD', 'EGP', 'JOD'
  nameAr: string;
  nameEn: string;
  symbol: string;
  symbolAr: string;
  subunitNameAr: string; // اسم الجزء مثلاً: هللة / سنت / فلس / قرش
  subunitNameEn: string; // Halala / Cent / Fils
  decimalPlaces: number; // عدد المنازل بعد الفاصلة e.g. 2
  isPrimary: boolean; // العملة الرئيسية (true/false)
  exchangeRate: number; // نسبة وسعر التحويل مقابل العملة الرئيسية
  rateToBase?: number;
}

export interface TaxRate {
  id: number;
  name: string;
  rate: number; // e.g. 15, 0, 5
  code: string; // e.g. "VAT_15", "VAT_0", "VAT_EXEMPT", "VAT_5"
  description?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: UserRole;
  avatar: string;
  isSalesRep?: boolean; // هل الموظف مندوب مبيعات؟
  monthlyTarget?: number; // التارغت الشهري بالريال
  commissionRate?: number; // نسبة العمولة على المبيعات %
  permissions: {
    canDiscount: boolean;
    canRefund: boolean;
    canViewProfits: boolean;
    canEditProducts: boolean;
    canManageUsers: boolean;
    canSyncERP: boolean;
    canCloseRegister: boolean;
    canVoidItem?: boolean;
    canChangePrice?: boolean;
    canViewReports?: boolean;
  };
  phone?: string;
  branchOrWarehouseId?: string;
  assignedRegisterId?: string;
}

export interface CategoryStyleConfig {
  id: string;
  name: string;
  nameEn?: string;
  color: string; // 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan' | 'indigo' | 'slate'
  bgColor?: string;
  textColor?: string;
  icon?: string;
  image?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  fontWeight?: 'normal' | 'semibold' | 'bold';
  taxRateId?: number; // نسبة الضريبة المبدئية المحددة للمجموعة
  defaultVatRate?: number; // e.g. 15, 0, 5
}

export interface ScaleConfig {
  enabled: boolean;
  model: string;
  port: string;
  baudRate: number;
  // Barcode rules
  fallbackToScaleIfNotFound: boolean; // إذا لم يُعثر على الباركود في قاعدة البيانات، هل يتم اعتباره مادة ميزان وتحليله تلقائياً؟
  totalDigits: number; // مثلاً 13 أو 12
  allowedPrefixes: string[]; // e.g. ['20', '21', '22', '23', '24', '25', '02', '99']
  itemCodeDigitsCount: number; // e.g. 5 أو 6 أرقام لرمز المادة
  valueDigitsCount: number; // e.g. 4 أو 5 أرقام للوزن أو السعر
  weightDecimalPlaces: number; // e.g. 3 (تقسيم على 1000)
  hasCheckDigit: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'cash' | 'card' | 'wallet' | 'bank' | 'credit';
  icon: string;
  enabled: boolean;
  requiresReference: boolean;
  commissionFeePercent?: number;
  associatedAccountId?: string;
  color: string;
  sortOrder: number;
}

export interface CashRegister {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  warehouseId: string;
  warehouseName: string;
  assignedUserId?: string;
  assignedUserName?: string;
  openingBalance: number;
  currentCashBalance: number;
  status: 'open' | 'closed';
  openedAt?: string;
  closedAt?: string;
}

export type PosScreenMode = 'retail' | 'restaurant';

export type RestaurantOrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface RestaurantHall {
  id: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
}

export interface RestaurantTable {
  id: string;
  hallId: string;
  number: string; // e.g. '1', '2', 'T-10'
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'billing' | 'reserved';
  currentInvoiceId?: string;
  activeOrderTotal?: number;
  guestCount?: number;
  openedAt?: string;
  waiterName?: string;
}

export interface ItemModifierOption {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number; // 0 for free
  isDefault?: boolean;
}

export interface ItemModifierGroup {
  id: string;
  nameAr: string;
  nameEn: string;
  selectionType: 'single' | 'multiple';
  minSelect?: number;
  maxSelect?: number;
  options: ItemModifierOption[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface ScreenLayoutConfig {
  posMode: PosScreenMode; // 'retail' (المبيعات التجارية) | 'restaurant' (المطاعم والكافيهات)
  categoryPosition: 'top' | 'right' | 'left';
  categoryStyle: 'pills' | 'cards' | 'grid';
  categoryButtonSize: 'sm' | 'md' | 'lg';
  productGridColumns: 3 | 4 | 5 | 6;
  productCardSize: 'compact' | 'normal' | 'large';
  showProductImages: boolean;
  showProductPrice: boolean;
  showProductStock: boolean;
  showProductBarcode: boolean;
  showProductUnit?: boolean;
  showProductCode?: boolean;
  showNumericKeypad?: boolean;
  productCardColorTheme: 'clean' | 'colored_by_category' | 'vibrant' | 'minimal';
  fontSize: 'sm' | 'md' | 'lg';
  cartPosition: 'left' | 'right';
  quickActionButtonsSize: 'sm' | 'md' | 'lg';
  quickPayButtonColor: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'purple';
  // Restaurant specific preferences
  restaurantDefaultOrderType?: RestaurantOrderType;
  enableKitchenPrinting?: boolean;
  printPrepTicketOnHold?: boolean;
  requireTableForDineIn?: boolean;
  quickCashAmountSuggestions?: number[];
  tableColumns?: number;
  showTableNameOnButton?: boolean;
  showTableOpenTime?: boolean;
  autoNewAfterSave?: boolean;
  requireWaiterName?: boolean;
  visibleActionButtons?: string[];
  visibleTableColumns?: string[];
}

export interface Product {
  id: string;
  code: string;
  barcode: string;
  nameAr: string;
  nameEn: string;
  category: string;
  categoryId?: number;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  taxRateId?: number; // معرف النسبة الضريبية في جدول النسب
  vatRate: number; // e.g. 15 for 15%
  isWeighted?: boolean; // هل الصنف يباع بالوزن عبر الميزان الإلكتروني؟
  scaleCode?: string; // رمز الصنف في الميزان الرقمي (5 أرقام مثل 00103 أو 00111)
  image?: string;
  costingMethod: CostingMethod;
  modifierGroups?: ItemModifierGroup[];
  kitchenSection?: 'grill' | 'fryer' | 'cold' | 'beverage' | 'general';
  batches?: {
    batchNumber: string;
    qty: number;
    cost: number;
    expiryDate?: string;
    receivedDate: string;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  balance: number; // positive = customer owes us, negative = credit
  creditLimit: number;
  address: string;
  lat?: number;
  lng?: number;
}

export interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
}

export interface Warehouse {
  id: string;
  nameAr: string;
  nameEn: string;
  location: string;
  isDefault?: boolean;
}

export interface InvoiceItem {
  productId: string;
  code: string;
  name: string;
  qty: number;
  price: number; // unit price (inclusive of VAT standard)
  costPrice: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  discountTiming?: DiscountTiming; // 'before_tax' | 'after_tax'
  discountType?: 'percent' | 'fixed';
  isWeighted?: boolean;
  total: number;
  returnedQty?: number;
  selectedModifiers?: SelectedModifier[];
  kitchenNotes?: string;
  kitchenStatus?: 'pending' | 'sent' | 'ready' | 'served';
}

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'credit' | 'split';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  cashierId: string;
  cashierName: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  vatTotal: number;
  discount: number;
  discountTiming?: DiscountTiming; // 'before_tax' | 'after_tax'
  total: number;
  paymentMethod: PaymentMethod;
  currency?: string; // e.g. 'SAR', 'USD', 'EUR', 'AED'
  exchangeRate?: number;
  deliveryMethod?: DeliveryMethod; // 'direct' | 'pickup' | 'delivery'
  deliveryFee?: number;
  deliveryAddress?: string;
  deliveryDriverId?: string;
  deliveryDriverName?: string;
  orderType?: RestaurantOrderType; // 'dine_in' | 'takeaway' | 'delivery'
  tableId?: string;
  tableName?: string;
  hallName?: string;
  guestCount?: number;
  kitchenTicketPrinted?: boolean;
  splitDetails?: {
    cash?: number;
    card?: number;
    wallet?: number;
  };
  status: 'completed' | 'returned' | 'partial_returned';
  syncStatus: 'synced' | 'pending_sync';
  notes?: string;
  repId?: string;
  salesRepId?: string;
  salesRepName?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  taxNumber?: string;
  commercialReg?: string;
  balance: number; // الرصيد الحالي للمورد
  address?: string;
}

export interface PurchaseItem {
  productId: string;
  code: string;
  name: string;
  qty: number;
  costPrice: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  total: number;
  returnedQty?: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  time: string;
  items: PurchaseItem[];
  subtotal: number;
  vatTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'credit' | 'bank';
  status: 'completed' | 'returned' | 'partial_returned';
  notes?: string;
}

export interface ScaleBarcodeResult {
  isScaleBarcode: boolean;
  type?: 'weight' | 'price';
  scaleCode?: string;
  weightKg?: number;
  priceValue?: number;
  matchedProduct?: Product;
  rawBarcode?: string;
  error?: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  type: 'receipt' | 'payment'; // قبض أو صرف
  date: string;
  amount: number;
  accountId: string;
  accountName: string;
  beneficiary: string;
  description: string;
  paymentMethod: string;
  referenceNumber?: string;
}

export interface FieldRep {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  activeRoute: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    speed: number;
    lastUpdate: string;
  };
  assignedCustomers: string[];
  todaySales: number;
  todayOrdersCount: number;
  batteryLevel: number;
  status: 'active' | 'break' | 'offline';
  waypoints: { lat: number; lng: number; time: string }[];
}

export interface InvoiceTemplateConfig {
  storeNameAr: string;
  storeNameEn: string;
  commercialReg: string;
  taxNumber: string;
  phone: string;
  address: string;
  headerNote: string;
  footerNote: string;
  paperSize: '80mm' | '58mm' | 'A4';
  showQrCode: boolean;
  showBarcode: boolean;
  showCashierName: boolean;
  accentColor: string;
}

export interface SyncStats {
  status: 'online' | 'offline' | 'syncing' | 'pending_sync';
  lastSyncedAt: string;
  pendingSyncCount: number;
  erpType: 'Odoo' | 'QuickBooks' | 'ERPNext' | 'CustomAPI';
  apiKey: string;
  apiEndpoint: string;
  autoSync: boolean;
}
