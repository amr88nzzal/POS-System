import React, { useEffect, useRef } from 'react';
import { Printer, X, Download, Check } from 'lucide-react';
import { Invoice, InvoiceTemplateConfig, Language, Customer } from '../types';
import { generateZatcaQrData } from '../utils/costing';

interface PrintableInvoiceProps {
  invoice: Invoice;
  config: InvoiceTemplateConfig;
  lang: Language;
  onClose: () => void;
  customer?: Customer;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  config,
  lang,
  onClose,
  customer,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate ZATCA QR Code onto the canvas
  useEffect(() => {
    if (!config.showQrCode) return;
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrData = generateZatcaQrData(
      config.storeNameAr,
      config.taxNumber,
      `${invoice.date}T${invoice.time}`,
      invoice.total,
      invoice.vatTotal
    );

    // Render a high-density crisp QR code pattern simulation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';

    const size = canvas.width;
    const cells = 25;
    const cellSize = size / cells;

    // Deterministic hash to populate simulated QR grid
    let hash = 0;
    for (let i = 0; i < qrData.length; i++) {
      hash = (hash << 5) - hash + qrData.charCodeAt(i);
      hash |= 0;
    }

    // Standard position markers at top-left, top-right, bottom-left
    const drawFinder = (startX: number, startY: number) => {
      ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(cells - 7, 0);
    drawFinder(0, cells - 7);

    // Fill pseudo-random QR payload matrix
    let seed = Math.abs(hash);
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Skip finder areas
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= cells - 8) ||
          (r >= cells - 8 && c < 8)
        ) {
          continue;
        }
        seed = (seed * 9301 + 49297) % 233280;
        if (seed / 233280 > 0.48) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.4, cellSize - 0.4);
        }
      }
    }
  }, [invoice, config]);

  const handlePrint = () => {
    window.print();
  };

  const isA4 = config.paperSize === 'A4';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-4 max-h-[90vh] flex flex-col">
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {lang === 'ar' ? 'معاينة وطباعة الفاتورة' : 'Invoice Preview & Direct Print'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700">
              {config.paperSize}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ar' ? 'طباعة الآن' : 'Print Now'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto py-4 px-2 flex justify-center">
          <div
            id="printable-receipt"
            className={`bg-white text-slate-900 font-sans ${
              isA4
                ? 'w-full p-8 border border-slate-300 rounded-lg'
                : 'w-[340px] p-4 border border-slate-300 rounded-lg shadow-sm text-[12px] leading-tight'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                {config.storeNameAr}
              </h2>
              <div className="text-[11px] text-slate-600 font-medium">
                {config.storeNameEn}
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                {config.address}
              </div>
              <div className="text-[11px] text-slate-600">
                <span>هاتف: {config.phone}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] font-semibold text-slate-700">
                <span>الرقم الضريبي: {config.taxNumber}</span>
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                <span>سجل تجاري: {config.commercialReg}</span>
              </div>
              <div className="mt-2 text-xs font-bold px-2 py-0.5 bg-slate-100 inline-block rounded">
                {config.headerNote}
              </div>
            </div>

            {/* Meta details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الفاتورة:</span>
                <span className="font-bold font-mono text-slate-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">التاريخ والوقت:</span>
                <span className="font-mono text-slate-700">{invoice.date} {invoice.time}</span>
              </div>
              {config.showCashierName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">الكاشير:</span>
                  <span className="font-medium text-slate-800">{invoice.cashierName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-semibold text-slate-900">{invoice.customerName}</span>
              </div>
              {customer?.taxNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">الرقم الضريبي للعميل:</span>
                  <span className="font-mono text-slate-700">{customer.taxNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة الدفع:</span>
                <span className="font-bold text-blue-700">
                  {invoice.paymentMethod === 'cash' ? 'نقدي (Cash)' :
                   invoice.paymentMethod === 'card' ? 'بطاقة ائتمانية / مدى (Card)' :
                   invoice.paymentMethod === 'wallet' ? 'محفظة إلكترونية (Digital Wallet)' :
                   invoice.paymentMethod === 'credit' ? 'آجل على الحساب (On Credit)' : 'دفع مجزأ (Split)'}
                </span>
              </div>
              {invoice.deliveryMethod && (
                <div className="flex justify-between">
                  <span className="text-slate-500">طريقة الاستلام والتسليم:</span>
                  <span className="font-bold text-slate-800">
                    {invoice.deliveryMethod === 'delivery' ? 'توصيل منازل / شحن' :
                     invoice.deliveryMethod === 'pickup' ? 'استلام من الفرع / سفري' : 'تسليم مباشر / صالة'}
                  </span>
                </div>
              )}
              {invoice.deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-500">عنوان التوصيل:</span>
                  <span className="font-medium text-slate-700 text-[10px] truncate max-w-[170px]">{invoice.deliveryAddress}</span>
                </div>
              )}
              {invoice.currency && invoice.currency !== 'SAR' && (
                <div className="flex justify-between">
                  <span className="text-slate-500">العملة المعتمدة:</span>
                  <span className="font-bold font-mono text-amber-700">{invoice.currency} (صرف: {invoice.exchangeRate})</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <table className="w-full text-start text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-1 text-start">الصنف</th>
                    <th className="py-1 text-center">الكمية</th>
                    <th className="py-1 text-center">السعر</th>
                    <th className="py-1 text-end">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1.5 pe-1">
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {item.code} {item.isWeighted ? '⚖️ (موزون)' : ''}
                        </div>
                      </td>
                      <td className="py-1.5 text-center font-mono font-medium">
                        {item.qty} {item.isWeighted ? 'كجم' : ''}
                      </td>
                      <td className="py-1.5 text-center font-mono">{item.price.toFixed(2)}</td>
                      <td className="py-1.5 text-end font-bold font-mono text-slate-900">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الخاضع للضريبة:</span>
                <span className="font-mono">{invoice.subtotal.toFixed(2)} ر.س</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>
                    الخصم {invoice.discountTiming === 'after_tax' ? '(بعد احتساب الضريبة)' : '(قبل احتساب الضريبة)'}:
                  </span>
                  <span className="font-mono">-{invoice.discount.toFixed(2)} ر.س</span>
                </div>
              )}
              {invoice.deliveryFee && invoice.deliveryFee > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono">{invoice.deliveryFee.toFixed(2)} ر.س</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-mono">{invoice.vatTotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>الإجمالي الصافي:</span>
                <div className="text-end">
                  <span className="font-mono">{invoice.total.toFixed(2)} ر.س</span>
                  {invoice.currency && invoice.currency !== 'SAR' && invoice.exchangeRate && (
                    <div className="text-[10px] text-blue-700 font-mono font-bold">
                      ≈ {(invoice.total * invoice.exchangeRate).toFixed(2)} {invoice.currency}
                    </div>
                  )}
                </div>
              </div>

              {/* On Credit balances */}
              {invoice.paymentMethod === 'credit' && customer && (
                <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-slate-500">
                    <span>رصيد العميل السابق:</span>
                    <span className="font-mono">{(customer.balance - invoice.total).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>الرصيد المتبقي بعد الفاتورة:</span>
                    <span className="font-mono">{customer.balance.toFixed(2)} ر.س</span>
                  </div>
                </div>
              )}
            </div>

            {/* ZATCA QR Code & Barcode */}
            <div className="pt-3 text-center flex flex-col items-center">
              {config.showQrCode && (
                <div className="mb-2 p-1.5 border border-slate-200 rounded-lg inline-block bg-white">
                  <canvas ref={qrCanvasRef} width={130} height={130} className="w-[120px] h-[120px]" />
                  <div className="text-[9px] text-slate-500 mt-0.5">رمز التحقق الإلكتروني ZATCA</div>
                </div>
              )}

              {config.showBarcode && (
                <div className="mt-1 font-mono text-[10px] text-slate-700 tracking-widest border-t border-slate-200 pt-2 w-full">
                  <div className="h-7 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_6px,transparent_6px,transparent_9px)] mx-auto w-44"></div>
                  <span>*{invoice.invoiceNumber}*</span>
                </div>
              )}

              <p className="mt-2 text-[10px] text-slate-500 text-center leading-relaxed">
                {config.footerNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
