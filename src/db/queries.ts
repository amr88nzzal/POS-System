import { eq, desc } from 'drizzle-orm';
import { db } from './index.ts';
import {
  taxRates,
  categories,
  products,
  warehouses,
  users,
  cashRegisters,
  paymentMethods,
  invoices,
  invoiceItems,
  stockMovements,
} from './schema.ts';

// ==========================================
// 1. النسب الضريبية (Tax Rates)
// ==========================================
export async function getTaxRates() {
  try {
    return await db.select().from(taxRates).orderBy(taxRates.rate);
  } catch (error) {
    console.error('Database query failed (getTaxRates):', error);
    throw new Error('فشل جلب النسب الضريبية من قاعدة البيانات', { cause: error });
  }
}

export async function createTaxRate(data: {
  name: string;
  rate: string;
  code: string;
  description?: string;
  isDefault?: boolean;
}) {
  try {
    const inserted = await db.insert(taxRates).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed (createTaxRate):', error);
    throw new Error('فشل إضافة النسبة الضريبية', { cause: error });
  }
}

export async function updateTaxRate(id: number, data: Partial<{
  name: string;
  rate: string;
  description: string;
  isDefault: boolean;
}>) {
  try {
    const updated = await db
      .update(taxRates)
      .set(data)
      .where(eq(taxRates.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (updateTaxRate):', error);
    throw new Error('فشل تعديل النسبة الضريبية', { cause: error });
  }
}

// ==========================================
// 2. المجموعات والتصنيفات (Categories)
// ==========================================
export async function getCategories() {
  try {
    return await db
      .select({
        id: categories.id,
        code: categories.code,
        nameAr: categories.nameAr,
        nameEn: categories.nameEn,
        taxRateId: categories.taxRateId,
        color: categories.color,
        textColor: categories.textColor,
        icon: categories.icon,
        fontSize: categories.fontSize,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        taxRateName: taxRates.name,
        taxRatePercent: taxRates.rate,
      })
      .from(categories)
      .leftJoin(taxRates, eq(categories.taxRateId, taxRates.id))
      .orderBy(categories.sortOrder, categories.id);
  } catch (error) {
    console.error('Database query failed (getCategories):', error);
    throw new Error('فشل جلب المجموعات من قاعدة البيانات', { cause: error });
  }
}

export async function createCategory(data: {
  code: string;
  nameAr: string;
  nameEn: string;
  taxRateId?: number;
  color?: string;
  textColor?: string;
  icon?: string;
  fontSize?: string;
  sortOrder?: number;
}) {
  try {
    const inserted = await db.insert(categories).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed (createCategory):', error);
    throw new Error('فشل إضافة المجموعة', { cause: error });
  }
}

export async function updateCategory(id: number, data: Partial<{
  nameAr: string;
  nameEn: string;
  taxRateId: number;
  color: string;
  textColor: string;
  icon: string;
  fontSize: string;
  sortOrder: number;
}>) {
  try {
    const updated = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (updateCategory):', error);
    throw new Error('فشل تعديل المجموعة', { cause: error });
  }
}

export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database query failed (deleteCategory):', error);
    throw new Error('فشل حذف المجموعة (قد تكون مرتبطة بأصناف)', { cause: error });
  }
}

// ==========================================
// 3. المواد والأصناف (Products)
// ==========================================
export async function getProducts() {
  try {
    return await db
      .select({
        id: products.id,
        code: products.code,
        barcode: products.barcode,
        nameAr: products.nameAr,
        nameEn: products.nameEn,
        categoryId: products.categoryId,
        categoryNameAr: categories.nameAr,
        categoryNameEn: categories.nameEn,
        costPrice: products.costPrice,
        salePrice: products.salePrice,
        unit: products.unit,
        taxRateId: products.taxRateId,
        taxRateName: taxRates.name,
        taxRate: products.taxRate,
        isWeighted: products.isWeighted,
        scaleCode: products.scaleCode,
        image: products.image,
        stock: products.stock,
        minStock: products.minStock,
        costingMethod: products.costingMethod,
        shelfLocation: products.shelfLocation,
        description: products.description,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(taxRates, eq(products.taxRateId, taxRates.id))
      .orderBy(products.id);
  } catch (error) {
    console.error('Database query failed (getProducts):', error);
    throw new Error('فشل جلب الأصناف من قاعدة البيانات', { cause: error });
  }
}

export async function createProduct(data: {
  code: string;
  barcode?: string;
  nameAr: string;
  nameEn: string;
  categoryId?: number;
  costPrice?: string;
  salePrice: string;
  unit?: string;
  taxRateId?: number;
  taxRate?: string;
  isWeighted?: boolean;
  scaleCode?: string;
  image?: string;
  stock?: string;
  minStock?: string;
  costingMethod?: string;
  shelfLocation?: string;
  description?: string;
}) {
  try {
    const inserted = await db.insert(products).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed (createProduct):', error);
    throw new Error('فشل إضافة الصنف إلى قاعدة البيانات', { cause: error });
  }
}

export async function updateProduct(id: number, data: Partial<{
  barcode: string;
  nameAr: string;
  nameEn: string;
  categoryId: number;
  costPrice: string;
  salePrice: string;
  unit: string;
  taxRateId: number;
  taxRate: string;
  isWeighted: boolean;
  scaleCode: string;
  image: string;
  stock: string;
  minStock: string;
  costingMethod: string;
  shelfLocation: string;
  description: string;
}>) {
  try {
    const updated = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (updateProduct):', error);
    throw new Error('فشل تحديث بيانات الصنف', { cause: error });
  }
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database query failed (deleteProduct):', error);
    throw new Error('فشل حذف الصنف', { cause: error });
  }
}

// ==========================================
// 4. الفروع والمستودعات (Warehouses)
// ==========================================
export async function getWarehouses() {
  try {
    return await db.select().from(warehouses).orderBy(warehouses.id);
  } catch (error) {
    console.error('Database query failed (getWarehouses):', error);
    throw new Error('فشل جلب المستودعات', { cause: error });
  }
}

// ==========================================
// 5. صناديق الكاشير (Cash Registers)
// ==========================================
export async function getCashRegisters() {
  try {
    return await db.select().from(cashRegisters).orderBy(cashRegisters.id);
  } catch (error) {
    console.error('Database query failed (getCashRegisters):', error);
    throw new Error('فشل جلب صناديق النقدية', { cause: error });
  }
}

export async function updateCashRegister(id: number, data: Partial<{
  currentCash: string;
  openingBalance: string;
  status: string;
  isOpen: boolean;
  assignedUserId: number;
}>) {
  try {
    const updated = await db
      .update(cashRegisters)
      .set(data)
      .where(eq(cashRegisters.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (updateCashRegister):', error);
    throw new Error('فشل تحديث صندوق الكاشير', { cause: error });
  }
}

// ==========================================
// 6. طرق وقنوات الدفع (Payment Methods)
// ==========================================
export async function getPaymentMethods() {
  try {
    return await db.select().from(paymentMethods).orderBy(paymentMethods.id);
  } catch (error) {
    console.error('Database query failed (getPaymentMethods):', error);
    throw new Error('فشل جلب طرق الدفع', { cause: error });
  }
}

// ==========================================
// 7. الفواتير والبنود العلائقية (Invoices)
// ==========================================
export async function getInvoices() {
  try {
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.id)).limit(100);
    const items = await db.select().from(invoiceItems);

    return allInvoices.map((inv) => ({
      ...inv,
      items: items.filter((item) => item.invoiceId === inv.id),
    }));
  } catch (error) {
    console.error('Database query failed (getInvoices):', error);
    throw new Error('فشل جلب الفواتير', { cause: error });
  }
}

export async function createInvoiceWithItems(
  invoiceData: {
    invoiceNumber: string;
    type?: string;
    date: string;
    time?: string;
    userId?: number;
    customerName: string;
    customerTaxNumber?: string;
    warehouseId?: number;
    cashRegisterId?: number;
    paymentMethodId?: number;
    paymentType: string;
    subtotal: string;
    taxTotal: string;
    discountTotal?: string;
    grandTotal: string;
    paidAmount: string;
    changeAmount?: string;
    zatcaStatus?: string;
    notes?: string;
    qrCode?: string;
  },
  itemsData: Array<{
    productId?: number;
    productName: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    taxRateId?: number;
    taxRate: string;
    taxAmount: string;
    discount?: string;
    total: string;
  }>
) {
  try {
    const [inv] = await db.insert(invoices).values(invoiceData).returning();

    if (itemsData.length > 0) {
      const itemsToInsert = itemsData.map((it) => ({
        ...it,
        invoiceId: inv.id,
      }));
      await db.insert(invoiceItems).values(itemsToInsert);
    }

    return inv;
  } catch (error) {
    console.error('Database query failed (createInvoiceWithItems):', error);
    throw new Error('فشل حفظ الفاتورة وبنودها', { cause: error });
  }
}

// ==========================================
// 8. الموظفين (Users)
// ==========================================
export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(users.id);
  } catch (error) {
    console.error('Database query failed (getUsers):', error);
    throw new Error('فشل جلب المستخدمين', { cause: error });
  }
}

export async function updateUser(id: number, data: Partial<{
  name: string;
  username: string;
  email: string;
  role: string;
  pinCode: string;
  warehouseId: number;
  branch: string;
  phone: string;
  canDiscount: boolean;
  canVoid: boolean;
  canPriceOverride: boolean;
  canOpenDrawer: boolean;
  canReturn: boolean;
  canViewReports: boolean;
  isActive: boolean;
}>) {
  try {
    const updated = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (updateUser):', error);
    throw new Error('فشل تعديل المستخدم', { cause: error });
  }
}
