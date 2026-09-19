import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getTaxRates,
  createTaxRate,
  updateTaxRate,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getWarehouses,
  getCashRegisters,
  updateCashRegister,
  getPaymentMethods,
  getInvoices,
  createInvoiceWithItems,
  getUsers,
  updateUser,
} from './src/db/queries.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing (support base64 images for products)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // API Routes (FIRST)
  // ==========================================

  // Health check & DB status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: 'PostgreSQL Cloud SQL',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Tax Rates Endpoints (جدول النسب الضريبية)
  app.get('/api/tax-rates', async (req, res) => {
    try {
      const rates = await getTaxRates();
      res.json(rates);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب النسب الضريبية' });
    }
  });

  app.post('/api/tax-rates', async (req, res) => {
    try {
      const created = await createTaxRate(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل إضافة النسبة الضريبية' });
    }
  });

  app.put('/api/tax-rates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateTaxRate(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل تعديل النسبة الضريبية' });
    }
  });

  // 2. Categories Endpoints (المجموعات والتصنيفات)
  app.get('/api/categories', async (req, res) => {
    try {
      const cats = await getCategories();
      res.json(cats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب المجموعات' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const created = await createCategory(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل إضافة المجموعة' });
    }
  });

  app.put('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateCategory(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل تعديل المجموعة' });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await deleteCategory(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل حذف المجموعة' });
    }
  });

  // 3. Products Endpoints (المواد والأصناف)
  app.get('/api/products', async (req, res) => {
    try {
      const prods = await getProducts();
      res.json(prods);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب الأصناف' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const created = await createProduct(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل إضافة الصنف' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateProduct(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل تعديل الصنف' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await deleteProduct(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل حذف الصنف' });
    }
  });

  // 4. Warehouses Endpoints
  app.get('/api/warehouses', async (req, res) => {
    try {
      const wh = await getWarehouses();
      res.json(wh);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب المستودعات' });
    }
  });

  // 5. Cash Registers Endpoints
  app.get('/api/cash-registers', async (req, res) => {
    try {
      const regs = await getCashRegisters();
      res.json(regs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب صناديق النقدية' });
    }
  });

  app.put('/api/cash-registers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateCashRegister(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل تعديل صندوق الكاشير' });
    }
  });

  // 6. Payment Methods Endpoints
  app.get('/api/payment-methods', async (req, res) => {
    try {
      const methods = await getPaymentMethods();
      res.json(methods);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب طرق الدفع' });
    }
  });

  // 7. Invoices Endpoints
  app.get('/api/invoices', async (req, res) => {
    try {
      const invs = await getInvoices();
      res.json(invs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب الفواتير' });
    }
  });

  app.post('/api/invoices', async (req, res) => {
    try {
      const { items, ...invoiceData } = req.body;
      const created = await createInvoiceWithItems(invoiceData, items || []);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل حفظ الفاتورة' });
    }
  });

  // 8. Users Endpoints
  app.get('/api/users', async (req, res) => {
    try {
      const u = await getUsers();
      res.json(u);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل جلب المستخدمين' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateUser(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'فشل تعديل المستخدم' });
    }
  });

  // ==========================================
  // Vite Middleware / Static Files Serving
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`POS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
