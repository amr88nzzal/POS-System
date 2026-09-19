import { Product } from '../types';

/**
 * ZATCA E-Invoicing Phase 1 & 2 TLV (Tag-Length-Value) Base64 Generator
 * Encodes:
 * 1: Seller Name
 * 2: VAT Registration Number
 * 3: Time stamp (ISO 8601)
 * 4: Invoice Total (with VAT)
 * 5: VAT Total
 */
export function generateZatcaQrData(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  total: number,
  vatTotal: number
): string {
  try {
    const toUtf8Bytes = (str: string) => new TextEncoder().encode(str);
    const tags = [
      { tag: 1, val: toUtf8Bytes(sellerName) },
      { tag: 2, val: toUtf8Bytes(vatNumber) },
      { tag: 3, val: toUtf8Bytes(timestamp) },
      { tag: 4, val: toUtf8Bytes(total.toFixed(2)) },
      { tag: 5, val: toUtf8Bytes(vatTotal.toFixed(2)) },
    ];

    const totalLength = tags.reduce((sum, item) => sum + 2 + item.val.length, 0);
    const bytes = new Uint8Array(totalLength);
    let offset = 0;

    for (const item of tags) {
      bytes[offset++] = item.tag;
      bytes[offset++] = item.val.length;
      bytes.set(item.val, offset);
      offset += item.val.length;
    }

    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return btoa(`${sellerName}|${vatNumber}|${timestamp}|${total}|${vatTotal}`);
  }
}

/**
 * Calculate Inventory Value based on Costing Method (FIFO or AVCO)
 */
export function calculateInventoryValuation(
  products: Product[],
  method: 'FIFO' | 'AVCO'
): { totalValue: number; itemsValuation: { productId: string; name: string; stock: number; unitCost: number; totalCost: number }[] } {
  let totalValue = 0;
  const itemsValuation = products.map((p) => {
    let unitCost = p.costPrice;
    let totalCost = 0;

    if (method === 'FIFO' && p.batches && p.batches.length > 0) {
      // FIFO: Count remaining stock from the latest available batches
      let remainingToValue = p.stock;
      let calculatedVal = 0;

      // Sort batches descending by date for remaining stock valuation
      const sortedBatches = [...p.batches].sort((a, b) => b.receivedDate.localeCompare(a.receivedDate));
      for (const batch of sortedBatches) {
        if (remainingToValue <= 0) break;
        const take = Math.min(remainingToValue, batch.qty);
        calculatedVal += take * batch.cost;
        remainingToValue -= take;
      }
      if (remainingToValue > 0) {
        // Fallback to base cost for remainder
        calculatedVal += remainingToValue * p.costPrice;
      }
      totalCost = calculatedVal;
      unitCost = p.stock > 0 ? totalCost / p.stock : p.costPrice;
    } else {
      // AVCO: Weighted Average Cost
      if (p.batches && p.batches.length > 0) {
        const sumCost = p.batches.reduce((sum, b) => sum + b.qty * b.cost, 0);
        const sumQty = p.batches.reduce((sum, b) => sum + b.qty, 0);
        unitCost = sumQty > 0 ? sumCost / sumQty : p.costPrice;
      }
      totalCost = p.stock * unitCost;
    }

    totalValue += totalCost;
    return {
      productId: p.id,
      name: p.nameAr,
      stock: p.stock,
      unitCost: Number(unitCost.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
    };
  });

  return {
    totalValue: Number(totalValue.toFixed(2)),
    itemsValuation,
  };
}
