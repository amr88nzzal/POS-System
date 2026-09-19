import { Currency, Language } from '../types';
import { INITIAL_CURRENCIES } from '../data/initialData';

export const DEFAULT_CURRENCIES: Currency[] = INITIAL_CURRENCIES || [
  {
    id: 'curr-sar',
    code: 'SAR',
    nameAr: 'ريال سعودي (الأساس)',
    nameEn: 'Saudi Riyal (Base)',
    symbol: 'SAR',
    symbolAr: 'ر.س',
    subunitNameAr: 'هللة',
    subunitNameEn: 'Halala',
    decimalPlaces: 2,
    isPrimary: true,
    exchangeRate: 1.0,
    rateToBase: 1.0,
  },
  {
    id: 'curr-usd',
    code: 'USD',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
    symbol: '$',
    symbolAr: '$',
    subunitNameAr: 'سنت',
    subunitNameEn: 'Cent',
    decimalPlaces: 2,
    isPrimary: false,
    exchangeRate: 0.2667,
    rateToBase: 0.2667,
  },
];

const STORAGE_KEYS = {
  ACTIVE_CURRENCY: 'pos_erp_active_currency',
  CURRENCIES_LIST: 'pos_erp_currencies_list',
};

export const CurrencyService = {
  getCurrencies(): Currency[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENCIES_LIST);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => ({
            ...c,
            rateToBase: c.rateToBase ?? c.exchangeRate ?? 1.0,
            exchangeRate: c.exchangeRate ?? c.rateToBase ?? 1.0,
          }));
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CURRENCIES;
  },

  saveCurrencies(list: Currency[]) {
    localStorage.setItem(STORAGE_KEYS.CURRENCIES_LIST, JSON.stringify(list));
  },

  getActiveCurrency(): Currency {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_CURRENCY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.code) {
          return {
            ...parsed,
            rateToBase: parsed.rateToBase ?? parsed.exchangeRate ?? 1.0,
            exchangeRate: parsed.exchangeRate ?? parsed.rateToBase ?? 1.0,
          };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CURRENCIES[0]; // SAR by default
  },

  saveActiveCurrency(currency: Currency) {
    const sanitized = {
      ...currency,
      rateToBase: currency.rateToBase ?? currency.exchangeRate ?? 1.0,
      exchangeRate: currency.exchangeRate ?? currency.rateToBase ?? 1.0,
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CURRENCY, JSON.stringify(sanitized));
  },

  setActiveCurrency(currency: Currency) {
    this.saveActiveCurrency(currency);
  },

  // Convert amount from base currency (SAR) to target currency
  convertFromBase(amountInBase: number, targetCurrency: Currency): number {
    if (targetCurrency.isPrimary || targetCurrency.code === 'SAR') {
      return amountInBase;
    }
    const rate = targetCurrency.rateToBase ?? targetCurrency.exchangeRate ?? 1.0;
    const places = targetCurrency.decimalPlaces ?? 2;
    return Number((amountInBase * rate).toFixed(places));
  },

  // Convert amount from foreign currency back to base (SAR)
  convertToBase(amountInForeign: number, foreignCurrency: Currency): number {
    const rate = foreignCurrency.rateToBase ?? foreignCurrency.exchangeRate ?? 1.0;
    if (foreignCurrency.isPrimary || foreignCurrency.code === 'SAR' || rate === 0) {
      return amountInForeign;
    }
    return Number((amountInForeign / rate).toFixed(2));
  },

  // Format currency with symbol and decimal places
  format(amountInBase: number, activeCurrency: Currency, lang: Language = 'ar'): string {
    const converted = this.convertFromBase(amountInBase, activeCurrency);
    const symbol = lang === 'ar' ? activeCurrency.symbolAr : activeCurrency.symbol;
    const places = activeCurrency.decimalPlaces ?? 2;
    return `${converted.toFixed(places)} ${symbol}`;
  },
};
