import { Product, ScaleBarcodeResult, ScaleConfig } from '../types';

/**
 * Parses scale barcodes (GS1 / EAN-13 in-store variable measure barcodes)
 * Supports dynamic configuration:
 * - Custom prefixes
 * - Custom item code length (e.g. 5 or 6 digits)
 * - Custom weight / value length (e.g. 4 or 5 digits)
 * - Automatic fallback if barcode is not found in product database
 */
export function parseScaleBarcode(
  rawBarcode: string,
  products: Product[],
  config?: ScaleConfig
): ScaleBarcodeResult {
  const clean = rawBarcode.trim().replace(/\s+/g, '');

  if (config && !config.enabled) {
    return { isScaleBarcode: false, rawBarcode: clean };
  }

  const expectedLength = config?.totalDigits || 13;
  // Check length tolerance (usually 12 or 13 digits)
  if (!clean || clean.length < Math.min(12, expectedLength) || clean.length > Math.max(13, expectedLength)) {
    return { isScaleBarcode: false, rawBarcode: clean };
  }

  // Weight prefixes: default 20, 22, 24, 02
  // Price prefixes: default 21, 23, 25
  const allowedPrefixes = config?.allowedPrefixes || ['20', '21', '22', '23', '24', '25', '02', '99'];
  const matchedPrefix = allowedPrefixes.find((p) => clean.startsWith(p));

  const isScalePrefix = !!matchedPrefix;
  const shouldFallback = config?.fallbackToScaleIfNotFound ?? true;

  if (!isScalePrefix && !shouldFallback) {
    return { isScaleBarcode: false, rawBarcode: clean };
  }

  // Determine prefix length
  const prefixLen = matchedPrefix ? matchedPrefix.length : 0;
  const isWeightBased = matchedPrefix ? ['20', '22', '24', '02'].includes(matchedPrefix) : true;

  // Segment boundaries
  const itemCodeLength = config?.itemCodeDigitsCount || 5;
  const valueLength = config?.valueDigitsCount || 5;

  const codeStart = prefixLen;
  const codeEnd = codeStart + itemCodeLength;
  const valStart = codeEnd;
  const valEnd = valStart + valueLength;

  if (clean.length < valEnd) {
    return { isScaleBarcode: false, rawBarcode: clean, error: 'Barcode length is shorter than rule configuration' };
  }

  const scaleCode = clean.substring(codeStart, codeEnd);
  const payloadStr = clean.substring(valStart, valEnd);
  const payloadNum = parseInt(payloadStr, 10);

  if (isNaN(payloadNum)) {
    return { isScaleBarcode: false, rawBarcode: clean, error: 'Invalid numeric payload' };
  }

  // Find product by scaleCode OR by code OR barcode containing the code
  const matchedProduct = products.find((p) => {
    // 1. Direct scaleCode match
    if (p.scaleCode && (p.scaleCode === scaleCode || p.scaleCode.replace(/^0+/, '') === scaleCode.replace(/^0+/, ''))) {
      return true;
    }
    // 2. Match with product code (e.g. ITM-103 matches 00103 or 103)
    const normalizedProdCode = p.code.replace(/\D/g, '');
    const normalizedScaleCode = scaleCode.replace(/^0+/, '');
    if (normalizedProdCode && normalizedScaleCode && normalizedProdCode === normalizedScaleCode) {
      return true;
    }
    // 3. Match end of barcode
    if (p.barcode.endsWith(scaleCode) || p.barcode.includes(scaleCode)) {
      return true;
    }
    return false;
  });

  const decimalPlaces = config?.weightDecimalPlaces ?? 3;
  const divisor = Math.pow(10, decimalPlaces);

  if (isWeightBased) {
    // Weight in grams/units -> divide by divisor to get kg
    const weightKg = Number((payloadNum / divisor).toFixed(decimalPlaces));
    return {
      isScaleBarcode: true,
      type: 'weight',
      scaleCode,
      weightKg,
      matchedProduct,
      rawBarcode: clean,
    };
  } else {
    // Price in currency cents/halalas -> divide by 100
    const priceValue = Number((payloadNum / 100).toFixed(2));
    let calculatedWeightKg: number | undefined = undefined;
    if (matchedProduct && matchedProduct.price > 0) {
      calculatedWeightKg = Number((priceValue / matchedProduct.price).toFixed(3));
    }

    return {
      isScaleBarcode: true,
      type: 'price',
      scaleCode,
      priceValue,
      weightKg: calculatedWeightKg,
      matchedProduct,
      rawBarcode: clean,
    };
  }
}

/**
 * Calculates EAN-13 Check Digit
 */
export function calculateEanCheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i], 10) || 0;
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Generates a valid 13-digit scale barcode for testing
 */
export function generateTestScaleBarcode(
  scaleCode: string,
  value: number,
  type: 'weight' | 'price'
): string {
  const prefix = type === 'weight' ? '20' : '21';
  const paddedCode = scaleCode.padStart(5, '0').slice(-5);
  const intVal = type === 'weight' ? Math.round(value * 1000) : Math.round(value * 100);
  const paddedVal = String(intVal).padStart(5, '0').slice(-5);
  const base12 = `${prefix}${paddedCode}${paddedVal}`;
  const checkDigit = calculateEanCheckDigit(base12);
  return `${base12}${checkDigit}`;
}

/**
 * Web Serial API Scale Reader helper
 * Allows reading live data from USB/RS-232 digital scale (e.g. CAS, Mettler Toledo, Ohaus)
 */
export async function connectSerialScale(
  onWeightReceived: (weightKg: number) => void,
  onError: (err: string) => void
): Promise<() => void> {
  const nav = navigator as unknown as { serial?: { requestPort: () => Promise<unknown> } };
  if (!nav.serial) {
    onError('متصفحك لا يدعم Web Serial API للاتصال المباشر بالميزان عبر USB. تم تشغيل وضع المحاكاة التفاعلية.');
    return () => {};
  }

  try {
    const port = (await nav.serial.requestPort()) as {
      open: (opt: { baudRate: number }) => Promise<void>;
      readable: ReadableStream<Uint8Array>;
      close: () => Promise<void>;
    };
    await port.open({ baudRate: 9600 });

    const reader = port.readable.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isReading = true;

    (async () => {
      while (isReading) {
        try {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            // Match typical scale stream: e.g. "ST,GS,   1.250kg" or "WN01.250"
            const match = line.match(/([0-9]+\.[0-9]+)/);
            if (match) {
              const parsedWeight = parseFloat(match[1]);
              if (!isNaN(parsedWeight) && parsedWeight > 0) {
                onWeightReceived(parsedWeight);
              }
            }
          }
        } catch {
          break;
        }
      }
    })();

    return async () => {
      isReading = false;
      try {
        await reader.cancel();
        await port.close();
      } catch {
        // ignore
      }
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'User cancelled port selection';
    onError(message);
    return () => {};
  }
}
