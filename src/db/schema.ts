import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. جدول النسب الضريبية (Tax Rates)
// ==========================================
export const taxRates = pgTable('tax_rates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g. "ضريبة أساسية 15%", "ضريبة صفرية 0%", "معفى"
  rate: numeric('rate', { precision: 5, scale: 2 }).notNull(), // e.g. 15.00, 0.00, 5.00
  code: text('code').notNull().unique(), // e.g. "VAT_15", "VAT_0", "EXEMPT"
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 2. جدول المجموعات والتصنيفات (Categories)
// ==========================================
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  // تحديد نسبة الضريبة بشكل مبدئي على مستوى المجموعة
  taxRateId: integer('tax_rate_id').references(() => taxRates.id),
  color: text('color').default('blue').notNull(),
  textColor: text('text_color').default('#ffffff').notNull(),
  icon: text('icon').default('Package').notNull(),
  fontSize: text('font_size').default('text-sm').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 3. جدول المستودعات والفروع (Warehouses)
// ==========================================
export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  location: text('location'),
  manager: text('manager'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 4. جدول الموظفين والمستخدمين (Users)
// ==========================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email'),
  role: text('role').default('cashier').notNull(),
  pinCode: text('pin_code').default('1234').notNull(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  branch: text('branch').default('الفرع الرئيسي').notNull(),
  phone: text('phone'),
  canDiscount: boolean('can_discount').default(false).notNull(),
  canVoid: boolean('can_void').default(false).notNull(),
  canPriceOverride: boolean('can_price_override').default(false).notNull(),
  canOpenDrawer: boolean('can_open_drawer').default(true).notNull(),
  canReturn: boolean('can_return').default(false).notNull(),
  canViewReports: boolean('can_view_reports').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 5. جدول الأصناف والمواد (Products / Items)
// ==========================================
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  barcode: text('barcode'),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  // ربط علائقي مع المجموعة
  categoryId: integer('category_id').references(() => categories.id),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0.00').notNull(),
  salePrice: numeric('sale_price', { precision: 12, scale: 2 }).default('0.00').notNull(),
  unit: text('unit').default('pcs').notNull(),
  // بطاقة الصنف تحوي نسبة الضريبة المرتبطة من جدول النسب الضريبية
  taxRateId: integer('tax_rate_id').references(() => taxRates.id),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('15.00').notNull(),
  // دعم الموازين الإلكترونية
  isWeighted: boolean('is_weighted').default(false).notNull(),
  scaleCode: text('scale_code'),
  // إمكانية إضافة صورة للمادة
  image: text('image'),
  stock: numeric('stock', { precision: 12, scale: 3 }).default('0.000').notNull(),
  minStock: numeric('min_stock', { precision: 12, scale: 3 }).default('0.000').notNull(),
  costingMethod: text('costing_method').default('AVCO').notNull(),
  shelfLocation: text('shelf_location'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 6. صناديق وأدراج الكاشير (Cash Registers)
// ==========================================
export const cashRegisters = pgTable('cash_registers', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  branch: text('branch').default('الفرع الرئيسي').notNull(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  assignedUserId: integer('assigned_user_id').references(() => users.id),
  currentCash: numeric('current_cash', { precision: 12, scale: 2 }).default('0.00').notNull(),
  openingBalance: numeric('opening_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  status: text('status').default('open').notNull(),
  isOpen: boolean('is_open').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 7. طرق وقنوات الدفع (Payment Methods)
// ==========================================
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  feePercentage: numeric('fee_percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
  requiresRefNumber: boolean('requires_ref_number').default(false).notNull(),
  accountId: text('account_id'),
  isActive: boolean('is_active').default(true).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  icon: text('icon').default('CreditCard').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 8. الفواتير (Invoices)
// ==========================================
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  type: text('type').default('simplified').notNull(), // 'simplified' or 'standard'
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time'),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').default('عميل نقدي').notNull(),
  customerTaxNumber: text('customer_tax_number'),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  cashRegisterId: integer('cash_register_id').references(() => cashRegisters.id),
  paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id),
  paymentType: text('payment_type').default('cash').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).default('0.00').notNull(),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).notNull(),
  changeAmount: numeric('change_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  zatcaStatus: text('zatca_status').default('reported').notNull(),
  notes: text('notes'),
  qrCode: text('qr_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 9. بنود الفاتورة العلائقية (Invoice Items)
// ==========================================
export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id')
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
  unit: text('unit').default('pcs').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  taxRateId: integer('tax_rate_id').references(() => taxRates.id),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
});

// ==========================================
// 10. حركات المخزون العلائقية (Stock Movements)
// ==========================================
export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  warehouseId: integer('warehouse_id')
    .references(() => warehouses.id)
    .notNull(),
  type: text('type').notNull(), // 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0.00').notNull(),
  referenceNumber: text('reference_number'),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// العلاقات العلائقية الكاملة (Drizzle Relations)
// ==========================================
export const taxRatesRelations = relations(taxRates, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  invoiceItems: many(invoiceItems),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  taxRate: one(taxRates, {
    fields: [categories.taxRateId],
    references: [taxRates.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  taxRateRef: one(taxRates, {
    fields: [products.taxRateId],
    references: [taxRates.id],
  }),
  invoiceItems: many(invoiceItems),
  stockMovements: many(stockMovements),
}));

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  users: many(users),
  cashRegisters: many(cashRegisters),
  invoices: many(invoices),
  stockMovements: many(stockMovements),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [users.warehouseId],
    references: [warehouses.id],
  }),
  cashRegisters: many(cashRegisters),
  invoices: many(invoices),
}));

export const cashRegistersRelations = relations(cashRegisters, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [cashRegisters.warehouseId],
    references: [warehouses.id],
  }),
  assignedUser: one(users, {
    fields: [cashRegisters.assignedUserId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  warehouse: one(warehouses, {
    fields: [invoices.warehouseId],
    references: [warehouses.id],
  }),
  cashRegister: one(cashRegisters, {
    fields: [invoices.cashRegisterId],
    references: [cashRegisters.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [invoices.paymentMethodId],
    references: [paymentMethods.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
  taxRateRef: one(taxRates, {
    fields: [invoiceItems.taxRateId],
    references: [taxRates.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [stockMovements.warehouseId],
    references: [warehouses.id],
  }),
}));
