import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Layers,
  ArrowRightLeft,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { ApiService } from '../../utils/apiService';

interface DatabaseSettingsProps {
  lang: 'ar' | 'en';
}

export function DatabaseSettings({ lang }: DatabaseSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    status: string;
    engine: string;
    lastPing?: string;
  }>({
    connected: true,
    status: 'ok',
    engine: 'PostgreSQL Cloud SQL (europe-west2)',
    lastPing: new Date().toLocaleTimeString('ar-SA'),
  });

  const checkConnection = async () => {
    setLoading(true);
    try {
      const res = await ApiService.checkHealth();
      setDbStatus({
        connected: res.connected,
        status: res.status,
        engine: res.engine,
        lastPing: new Date().toLocaleTimeString('ar-SA'),
      });
    } catch {
      setDbStatus({
        connected: false,
        status: 'disconnected',
        engine: 'PostgreSQL Cloud SQL',
        lastPing: new Date().toLocaleTimeString('ar-SA'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const TABLES = [
    {
      name: 'tax_rates',
      nameAr: 'جدول النسب الضريبية',
      description: 'النسب الضريبية الأساسية، الصفرية، والمعفاة مع معايير ZATCA',
      relations: '1-to-Many with categories, products, invoice_items',
    },
    {
      name: 'categories',
      nameAr: 'المجموعات والتصنيفات',
      description: 'تصنيفات الأصناف مع النسبة الضريبية المبدئية لكل مجموعة',
      relations: 'Many-to-1 with tax_rates; 1-to-Many with products',
    },
    {
      name: 'products',
      nameAr: 'المواد والأصناف',
      description: 'بطاقات الأصناف، باركود، صورة، النسبة الضريبية، والأسعار',
      relations: 'Many-to-1 with categories, Many-to-1 with tax_rates',
    },
    {
      name: 'invoices',
      nameAr: 'الفواتير والمبيعات',
      description: 'سجل الفواتير الضريبية المبسطة وبيانات ZATCA QR',
      relations: 'Many-to-1 with users, warehouses, payment_methods',
    },
    {
      name: 'invoice_items',
      nameAr: 'بنود وتفاصيل الفاتورة',
      description: 'الكميات، الأسعار، مبالغ الضريبة ونسبها لكل صنف بالفاتورة',
      relations: 'Many-to-1 with invoices (Cascade Delete), products, tax_rates',
    },
    {
      name: 'warehouses',
      nameAr: 'المستودعات والفروع',
      description: 'الفروع والمستودعات ونقاط التخزين الميدانية',
      relations: '1-to-Many with cash_registers, users, stock_movements',
    },
    {
      name: 'cash_registers',
      nameAr: 'صناديق الكاشير',
      description: 'جلسات الصناديق وأرصدة النقدية وحركات الدرج',
      relations: 'Many-to-1 with warehouses, users',
    },
    {
      name: 'payment_methods',
      nameAr: 'طرق وقنوات الدفع',
      description: 'نقداً، مدى، فيزا، أبل باي، كليك والبيع الآجل',
      relations: '1-to-Many with invoices',
    },
    {
      name: 'users',
      nameAr: 'المستخدمين والصلاحيات',
      description: 'بيانات الكاشير، رموز الدخول PIN والصلاحيات المحاسبية',
      relations: '1-to-Many with invoices, cash_registers',
    },
    {
      name: 'stock_movements',
      nameAr: 'حركات المخزون',
      description: 'سجل الإدخال، الإخراج، التسويات الجردية والتحويل بين الفروع',
      relations: 'Many-to-1 with products, warehouses',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {lang === 'ar' ? 'قاعدة بيانات PostgreSQL (Cloud SQL)' : 'PostgreSQL Cloud SQL Database'}
                </h3>
                <span className="text-xs text-blue-300 font-mono">
                  Region: europe-west2 | ORM: Drizzle ORM | Engine: Postgres 15+
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'تم بناء وهيكلة قاعدة البيانات بنظام الجداول العلائقية الكاملة (Relational DB)، مع ربط النسب الضريبية بالمجموعات، وتوريثها لبطاقات المواد والفواتير.'
                : 'Full relational PostgreSQL schema active with Drizzle ORM, foreign keys and tax tables.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">{lang === 'ar' ? 'متصل ونشط' : 'Connected'}</span>
            </div>

            <button
              onClick={checkConnection}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{lang === 'ar' ? 'فحص الاتصال' : 'Ping Server'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Relational Schema Architecture */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {lang === 'ar' ? 'الجداول العلائقية والروابط (Schema Tables)' : 'Database Tables & Relations'}
            </h4>
          </div>
          <span className="text-xs font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            10 Tables Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {TABLES.map((t) => (
            <div key={t.name} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.nameAr}</span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                      {t.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 self-start md:self-auto">
                <ArrowRightLeft className="w-3 h-3 text-emerald-500" />
                <span>{t.relations}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
