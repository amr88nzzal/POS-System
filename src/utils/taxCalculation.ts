import { DiscountTiming } from '../types';

export interface TaxCalculationItemInput {
  price: number; // unit price (inclusive of VAT standard in retail)
  qty: number;
  vatRate: number; // e.g. 15 for 15%
  discount: number; // item level discount in value
  discountTiming: DiscountTiming; // 'before_tax' | 'after_tax'
}

export interface TaxCalculationItemResult {
  taxableSubtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  originalGross: number;
}

/**
 * Calculates item totals and VAT according to discount timing:
 * - Before Tax: Discount reduces taxable base, and VAT is calculated on the discounted net base.
 * - After Tax: VAT is calculated on full price, and discount is subtracted from total after tax.
 */
export function calculateItemTaxAndTotal(item: TaxCalculationItemInput): TaxCalculationItemResult {
  const { price, qty, vatRate, discount, discountTiming } = item;
  const originalGross = price * qty;
  const rateFactor = 1 + vatRate / 100;

  if (discountTiming === 'before_tax') {
    // 1. Calculate base price before VAT
    const netBaseOriginal = originalGross / rateFactor;
    // Discount is applied on the base price before tax
    // (If discount is entered as a gross discount, convert it to pre-tax equivalent or direct pre-tax deduction)
    const effectiveDiscount = Math.min(netBaseOriginal, Math.max(0, discount));
    const taxableSubtotal = Math.max(0, netBaseOriginal - effectiveDiscount);
    const vatAmount = taxableSubtotal * (vatRate / 100);
    const total = taxableSubtotal + vatAmount;

    return {
      taxableSubtotal: Number(taxableSubtotal.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      discountAmount: Number(effectiveDiscount.toFixed(2)),
      total: Number(total.toFixed(2)),
      originalGross: Number(originalGross.toFixed(2)),
    };
  } else {
    // After Tax: VAT is calculated based on original item price,
    // and discount is deducted directly from final price after tax
    const originalVat = originalGross - originalGross / rateFactor;
    const effectiveDiscount = Math.min(originalGross, Math.max(0, discount));
    const total = Math.max(0, originalGross - effectiveDiscount);
    const taxableSubtotal = Math.max(0, total - originalVat);

    return {
      taxableSubtotal: Number(taxableSubtotal.toFixed(2)),
      vatAmount: Number(originalVat.toFixed(2)),
      discountAmount: Number(effectiveDiscount.toFixed(2)),
      total: Number(total.toFixed(2)),
      originalGross: Number(originalGross.toFixed(2)),
    };
  }
}

/**
 * Calculates overall Cart totals including global discount
 */
export function calculateCartTotals(
  items: {
    price: number;
    qty: number;
    vatRate: number;
    discount: number;
    discountTiming?: DiscountTiming;
  }[],
  globalDiscountPercent: number = 0,
  globalDiscountTiming: DiscountTiming = 'before_tax',
  deliveryFee: number = 0
) {
  let cartNetSubtotal = 0;
  let cartVatTotal = 0;
  let cartGross = 0;
  let itemDiscountsTotal = 0;

  items.forEach((itm) => {
    const timing = itm.discountTiming || globalDiscountTiming;
    const calc = calculateItemTaxAndTotal({
      price: itm.price,
      qty: itm.qty,
      vatRate: itm.vatRate,
      discount: itm.discount,
      discountTiming: timing,
    });
    cartNetSubtotal += calc.taxableSubtotal;
    cartVatTotal += calc.vatAmount;
    cartGross += calc.originalGross;
    itemDiscountsTotal += calc.discountAmount;
  });

  // Calculate global cart discount
  const subtotalBeforeGlobal = cartNetSubtotal + cartVatTotal;
  const globalDiscountAmount = (subtotalBeforeGlobal * globalDiscountPercent) / 100;

  let grandTotal = 0;
  let finalVat = cartVatTotal;
  let finalSubtotal = cartNetSubtotal;

  if (globalDiscountTiming === 'before_tax' && globalDiscountAmount > 0) {
    // Proportional reduction in tax and subtotal
    const discountRatio = Math.max(0, 1 - globalDiscountPercent / 100);
    finalSubtotal = cartNetSubtotal * discountRatio;
    finalVat = cartVatTotal * discountRatio;
    grandTotal = finalSubtotal + finalVat + deliveryFee;
  } else {
    // After tax discount
    grandTotal = Math.max(0, subtotalBeforeGlobal - globalDiscountAmount) + deliveryFee;
    finalSubtotal = Math.max(0, grandTotal - deliveryFee - finalVat);
  }

  return {
    cartGross: Number(cartGross.toFixed(2)),
    itemDiscountsTotal: Number(itemDiscountsTotal.toFixed(2)),
    globalDiscountAmount: Number(globalDiscountAmount.toFixed(2)),
    totalDiscount: Number((itemDiscountsTotal + globalDiscountAmount).toFixed(2)),
    subtotal: Number(finalSubtotal.toFixed(2)),
    vatTotal: Number(finalVat.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}
