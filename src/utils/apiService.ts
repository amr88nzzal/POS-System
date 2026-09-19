import { TaxRate, Product, CategoryStyleConfig } from '../types';

export const ApiService = {
  // Check Cloud SQL Backend Status
  async checkHealth(): Promise<{ status: string; engine: string; connected: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return { status: data.status, engine: data.engine, connected: true };
      }
      return { status: 'error', engine: 'PostgreSQL Cloud SQL', connected: false };
    } catch {
      return { status: 'offline', engine: 'PostgreSQL Cloud SQL', connected: false };
    }
  },

  // 1. Tax Rates
  async fetchTaxRates(): Promise<TaxRate[]> {
    try {
      const res = await fetch('/api/tax-rates');
      if (res.ok) {
        const data = await res.json();
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          rate: parseFloat(d.rate),
          code: d.code,
          description: d.description || '',
          isDefault: !!d.isDefault,
        }));
      }
    } catch (e) {
      console.warn('Could not fetch tax rates from backend, using local fallback', e);
    }
    return [];
  },

  async createTaxRate(rate: Omit<TaxRate, 'id'>): Promise<TaxRate | null> {
    try {
      const res = await fetch('/api/tax-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rate,
          rate: rate.rate.toString(),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return {
          id: d.id,
          name: d.name,
          rate: parseFloat(d.rate),
          code: d.code,
          description: d.description || '',
          isDefault: !!d.isDefault,
        };
      }
    } catch (e) {
      console.error('Failed to create tax rate on Cloud SQL', e);
    }
    return null;
  },

  // 2. Categories
  async fetchCategories(): Promise<any[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch categories from backend', e);
    }
    return [];
  },

  // 3. Products
  async fetchProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        return data.map((p: any) => ({
          id: String(p.id),
          code: p.code,
          barcode: p.barcode || '',
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          category: p.categoryNameAr || 'عام',
          categoryId: p.categoryId,
          price: parseFloat(p.salePrice || '0'),
          costPrice: parseFloat(p.costPrice || '0'),
          stock: parseFloat(p.stock || '0'),
          minStockAlert: parseFloat(p.minStock || '0'),
          unit: p.unit || 'pcs',
          taxRateId: p.taxRateId,
          vatRate: parseFloat(p.taxRate || '15'),
          isWeighted: !!p.isWeighted,
          scaleCode: p.scaleCode || '',
          image: p.image || '',
          costingMethod: p.costingMethod || 'AVCO',
        }));
      }
    } catch (e) {
      console.warn('Could not fetch products from Cloud SQL', e);
    }
    return [];
  },

  async saveProduct(prod: Partial<Product>): Promise<any> {
    try {
      const payload = {
        code: prod.code,
        barcode: prod.barcode,
        nameAr: prod.nameAr,
        nameEn: prod.nameEn,
        categoryId: prod.categoryId,
        costPrice: String(prod.costPrice || 0),
        salePrice: String(prod.price || 0),
        unit: prod.unit || 'pcs',
        taxRateId: prod.taxRateId,
        taxRate: String(prod.vatRate || 15),
        isWeighted: !!prod.isWeighted,
        scaleCode: prod.scaleCode || null,
        image: prod.image || null,
        stock: String(prod.stock || 0),
        minStock: String(prod.minStockAlert || 0),
        costingMethod: prod.costingMethod || 'AVCO',
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to save product to Cloud SQL', e);
    }
    return null;
  },

  async syncInvoice(invoice: any, items: any[]): Promise<any> {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          type: invoice.type || 'simplified',
          date: invoice.date,
          customerName: invoice.customerName || 'عميل نقدي',
          paymentType: invoice.paymentMethod || 'cash',
          subtotal: String(invoice.subtotal),
          taxTotal: String(invoice.vatTotal || invoice.taxTotal),
          discountTotal: String(invoice.discountTotal || 0),
          grandTotal: String(invoice.total || invoice.grandTotal),
          paidAmount: String(invoice.paidAmount || invoice.total),
          zatcaStatus: invoice.zatcaStatus || 'reported',
          items: items.map((it) => ({
            productId: it.productId ? parseInt(it.productId, 10) || null : null,
            productName: it.name,
            quantity: String(it.qty),
            unit: it.unit || 'pcs',
            unitPrice: String(it.price),
            taxRateId: it.taxRateId || null,
            taxRate: String(it.vatRate || 15),
            taxAmount: String(it.vatAmount || 0),
            discount: String(it.discount || 0),
            total: String(it.total),
          })),
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Invoice sync to Cloud SQL deferred', e);
    }
    return null;
  },
};
