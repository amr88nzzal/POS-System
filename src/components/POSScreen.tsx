import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  Users,
  Percent,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Printer,
  Layers,
  ChevronRight,
  Camera,
  Scale,
  Truck,
  ShoppingBag,
  Store,
  ArrowRightLeft,
  Info,
  HelpCircle,
  Edit3,
  X,
  Tag,
  Filter,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Product,
  Customer,
  Invoice,
  InvoiceItem,
  PaymentMethod,
  User,
  Language,
  InvoiceTemplateConfig,
  DeliveryMethod,
  DiscountTiming,
  Currency,
  ScaleConfig,
  ScreenLayoutConfig,
  CategoryStyleConfig,
  PaymentMethodConfig,
} from '../types';
import { translations } from '../utils/translations';
import { playBarcodeBeep, playSuccessChime } from '../utils/storage';
import { CurrencyService } from '../utils/currencies';
import { parseScaleBarcode } from '../utils/scaleBarcodeParser';
import { calculateCartTotals, calculateItemTaxAndTotal } from '../utils/taxCalculation';
import { PrintableInvoice } from './PrintableInvoice';
import { DigitalScaleModal } from './DigitalScaleModal';

interface POSScreenProps {
  products: Product[];
  customers: Customer[];
  currentUser: User;
  users?: User[];
  templateConfig: InvoiceTemplateConfig;
  lang: Language;
  onSaveInvoice: (invoice: Invoice) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCustomers: (customers: Customer[]) => void;
  isOnline: boolean;
  activeCurrency?: Currency;
  onOpenCurrencyModal?: () => void;
  onOpenScaleModal?: () => void;
  scaleConfig?: ScaleConfig;
  screenLayout?: ScreenLayoutConfig;
  categoryStyles?: CategoryStyleConfig[];
  configuredPaymentMethods?: PaymentMethodConfig[];
  onSwitchToRestaurant?: () => void;
}

interface CartItem extends InvoiceItem {
  maxStock: number;
}

interface HeldTicket {
  id: string;
  timestamp: string;
  items: CartItem[];
  customer: Customer;
  discount: number;
  discountTiming?: DiscountTiming;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  deliveryFee?: number;
  notes?: string;
}

export const POSScreen: React.FC<POSScreenProps> = ({
  products,
  customers,
  currentUser,
  users = [],
  templateConfig,
  lang,
  onSaveInvoice,
  onUpdateProducts,
  onUpdateCustomers,
  isOnline,
  activeCurrency = CurrencyService.getActiveCurrency(),
  onOpenCurrencyModal,
  onOpenScaleModal,
  scaleConfig,
  screenLayout,
  categoryStyles,
  configuredPaymentMethods,
  onSwitchToRestaurant,
}) => {
  const t = translations[lang];

  // Sales reps
  const salesRepsList = users.filter((u) => u.isSalesRep || u.role === 'field_rep');
  const [selectedSalesRepId, setSelectedSalesRepId] = useState<string>(
    currentUser.isSalesRep ? currentUser.id : salesRepsList[0]?.id || currentUser.id
  );

  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(customers[0]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [heldTickets, setHeldTickets] = useState<HeldTicket[]>([]);

  // Delivery Method state ('direct' | 'pickup' | 'delivery')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('direct');
  const [deliveryAddress, setDeliveryAddress] = useState(customers[0]?.address || 'شارع التخصصي، الرياض');
  const [deliveryFee, setDeliveryFee] = useState<number>(15);
  const [deliveryDriverName, setDeliveryDriverName] = useState('سائق التوصيل (مندوب 1)');
  const [heldFilter, setHeldFilter] = useState<'all' | DeliveryMethod>('all');

  // VAT & Discount Timing state: 'before_tax' (default compliant) | 'after_tax'
  const [globalDiscountTiming, setGlobalDiscountTiming] = useState<DiscountTiming>('before_tax');

  // Digital Scale Modal
  const [showInternalScaleModal, setShowInternalScaleModal] = useState(false);
  const [scaleFeedback, setScaleFeedback] = useState<string | null>(null);

  // Item-level Discount Modal
  const [editingItemDiscount, setEditingItemDiscount] = useState<{
    productId: string;
    productName: string;
    price: number;
    qty: number;
    discount: number;
    discountTiming: DiscountTiming;
  } | null>(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);

  // Held Tickets Manager Modal
  const [showHeldTicketsModal, setShowHeldTicketsModal] = useState(false);

  // New Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustTax, setNewCustTax] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Print Modal
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);

  // Barcode Camera simulation
  const [isCameraActive, setIsCameraActive] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Synchronize delivery address with customer change
  useEffect(() => {
    if (selectedCustomer && selectedCustomer.address) {
      setDeliveryAddress(selectedCustomer.address);
    }
  }, [selectedCustomer]);

  // Categories list
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.scaleCode && p.scaleCode.includes(q));
    return matchesCat && matchesSearch;
  });

  // Calculate totals using accurate Tax and Discount Engine
  const cartCalculations = calculateCartTotals(
    cart.map((item) => ({
      price: item.price,
      qty: item.qty,
      vatRate: item.vatRate,
      discount: item.discount || 0,
      discountTiming: item.discountTiming || globalDiscountTiming,
    })),
    discountPercent,
    globalDiscountTiming,
    deliveryMethod === 'delivery' ? deliveryFee : 0
  );

  const subtotalBeforeVat = cartCalculations.subtotal;
  const vatTotal = cartCalculations.vatTotal;
  const discountAmount = cartCalculations.totalDiscount;
  const grandTotal = cartCalculations.grandTotal;
  const effectiveDeliveryFee = cartCalculations.deliveryFee;

  // Add standard product to cart
  const addToCart = (product: Product) => {
    playBarcodeBeep();

    if (product.isWeighted) {
      // If weighted product clicked directly, prompt or use default 1.000 kg
      addWeightedToCart(product, 1.0);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(lang === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون المتاح!' : 'Exceeds available stock!');
          return prev;
        }
        const newQty = existing.qty + 1;
        const itemCalc = calculateItemTaxAndTotal({
          price: product.price,
          qty: newQty,
          vatRate: product.vatRate,
          discount: existing.discount || 0,
          discountTiming: existing.discountTiming || globalDiscountTiming,
        });

        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                qty: newQty,
                vatAmount: itemCalc.vatAmount,
                total: itemCalc.total,
              }
            : item
        );
      } else {
        if (product.stock <= 0) {
          alert(lang === 'ar' ? 'هذا الصنف نفد من المخزون!' : 'Item is out of stock!');
          return prev;
        }
        const itemCalc = calculateItemTaxAndTotal({
          price: product.price,
          qty: 1,
          vatRate: product.vatRate,
          discount: 0,
          discountTiming: globalDiscountTiming,
        });
        return [
          ...prev,
          {
            productId: product.id,
            code: product.code,
            name: lang === 'ar' ? product.nameAr : product.nameEn,
            qty: 1,
            price: product.price,
            costPrice: product.costPrice,
            vatRate: product.vatRate,
            vatAmount: itemCalc.vatAmount,
            discount: 0,
            discountTiming: globalDiscountTiming,
            total: itemCalc.total,
            maxStock: product.stock,
            isWeighted: false,
          },
        ];
      }
    });
  };

  // Add weighted product (from Scale or barcode parser)
  const addWeightedToCart = (product: Product, weightKg: number) => {
    playBarcodeBeep();
    const cleanWeight = Math.max(0.01, Number(weightKg.toFixed(3)));

    const itemCalc = calculateItemTaxAndTotal({
      price: product.price,
      qty: cleanWeight,
      vatRate: product.vatRate,
      discount: 0,
      discountTiming: globalDiscountTiming,
    });

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id && item.isWeighted);
      if (existingIdx >= 0) {
        const newQty = Number((prev[existingIdx].qty + cleanWeight).toFixed(3));
        const updatedItemCalc = calculateItemTaxAndTotal({
          price: product.price,
          qty: newQty,
          vatRate: product.vatRate,
          discount: prev[existingIdx].discount || 0,
          discountTiming: prev[existingIdx].discountTiming || globalDiscountTiming,
        });
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: newQty,
          vatAmount: updatedItemCalc.vatAmount,
          total: updatedItemCalc.total,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            code: product.code,
            name: lang === 'ar' ? product.nameAr : product.nameEn,
            qty: cleanWeight,
            price: product.price,
            costPrice: product.costPrice,
            vatRate: product.vatRate,
            vatAmount: itemCalc.vatAmount,
            discount: 0,
            discountTiming: globalDiscountTiming,
            total: itemCalc.total,
            maxStock: product.stock,
            isWeighted: true,
          },
        ];
      }
    });

    setScaleFeedback(
      lang === 'ar'
        ? `⚖️ تم إدراج ${product.nameAr} بوزن ${cleanWeight} كجم (السعر: ${(cleanWeight * product.price).toFixed(2)} ر.س)`
        : `⚖️ Added ${product.nameEn} weight ${cleanWeight} kg`
    );
    setTimeout(() => setScaleFeedback(null), 4000);
  };

  // Change quantity
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const step = item.isWeighted ? 0.25 : 1;
            const newQty = Number((item.qty + delta * step).toFixed(3));
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) {
              alert(lang === 'ar' ? 'الكمية تتجاوز المخزون!' : 'Exceeds stock!');
              return item;
            }
            const itemCalc = calculateItemTaxAndTotal({
              price: item.price,
              qty: newQty,
              vatRate: item.vatRate,
              discount: item.discount || 0,
              discountTiming: item.discountTiming || globalDiscountTiming,
            });
            return {
              ...item,
              qty: newQty,
              vatAmount: itemCalc.vatAmount,
              total: itemCalc.total,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Save Item-level discount
  const handleApplyItemDiscount = () => {
    if (!editingItemDiscount) return;
    const { productId, discount, discountTiming } = editingItemDiscount;

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const itemCalc = calculateItemTaxAndTotal({
            price: item.price,
            qty: item.qty,
            vatRate: item.vatRate,
            discount,
            discountTiming,
          });
          return {
            ...item,
            discount,
            discountTiming,
            vatAmount: itemCalc.vatAmount,
            total: itemCalc.total,
          };
        }
        return item;
      })
    );
    setEditingItemDiscount(null);
  };

  // Smart Barcode Enter (Supports Standard EAN & Electronic Scale Barcodes)
  const handleBarcodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const clean = searchQuery.trim();

      // 1. Electronic Scale Barcode Parser Check (dynamic scale config)
      const scaleResult = parseScaleBarcode(clean, products, scaleConfig);
      if (scaleResult.isScaleBarcode) {
        if (scaleResult.matchedProduct) {
          const weight =
            scaleResult.weightKg ||
            (scaleResult.priceValue && scaleResult.matchedProduct.price > 0
              ? Number((scaleResult.priceValue / scaleResult.matchedProduct.price).toFixed(3))
              : 1.0);
          addWeightedToCart(scaleResult.matchedProduct, weight);
          setSearchQuery('');
          return;
        } else {
          alert(
            lang === 'ar'
              ? `تم التعرف على باركود ميزان برموز (${scaleResult.scaleCode}) ولكن لم يتم العثور على صنف مطابق في قاعدة البيانات.`
              : `Scale barcode detected (code: ${scaleResult.scaleCode}) but no matching item found in database.`
          );
          setSearchQuery('');
          return;
        }
      }

      // 2. Standard Barcode / Product Code Lookup
      const match = products.find(
        (p) =>
          p.barcode === clean ||
          p.code.toLowerCase() === clean.toLowerCase() ||
          (p.scaleCode && p.scaleCode === clean)
      );

      if (match) {
        if (match.isWeighted) {
          addWeightedToCart(match, 1.0);
        } else {
          addToCart(match);
        }
        setSearchQuery('');
      } else {
        alert(lang === 'ar' ? `الصنف غير موجود بالباركود: ${clean}` : `Item not found: ${clean}`);
      }
    }
  };

  // Hold ticket
  const handleHoldTicket = () => {
    if (cart.length === 0) return;
    const newHold: HeldTicket = {
      id: `HLD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      customer: selectedCustomer,
      discount: discountPercent,
      discountTiming: globalDiscountTiming,
      deliveryMethod,
      deliveryAddress,
      deliveryFee,
    };
    setHeldTickets((prev) => [newHold, ...prev]);
    setCart([]);
    setDiscountPercent(0);
    alert(lang === 'ar' ? 'تم تعليق الفاتورة بنجاح' : 'Ticket parked successfully');
  };

  // Resume ticket
  const handleResumeTicket = (ticket: HeldTicket) => {
    setCart(ticket.items);
    setSelectedCustomer(ticket.customer);
    setDiscountPercent(ticket.discount);
    if (ticket.discountTiming) setGlobalDiscountTiming(ticket.discountTiming);
    if (ticket.deliveryMethod) setDeliveryMethod(ticket.deliveryMethod);
    if (ticket.deliveryAddress) setDeliveryAddress(ticket.deliveryAddress);
    if (ticket.deliveryFee !== undefined) setDeliveryFee(ticket.deliveryFee);
    setHeldTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setShowHeldTicketsModal(false);
  };

  // Add new customer
  const handleCreateCustomer = () => {
    if (!newCustName.trim()) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName,
      phone: newCustPhone,
      taxNumber: newCustTax,
      balance: 0,
      creditLimit: 5000,
      address: newCustAddress || 'الرياض',
    };
    const updated = [newCust, ...customers];
    onUpdateCustomers(updated);
    setSelectedCustomer(newCust);
    if (newCustAddress) setDeliveryAddress(newCustAddress);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustTax('');
    setNewCustAddress('');
  };

  // Open Payment modal
  const openPayment = () => {
    if (cart.length === 0) return;
    setPaymentMethod('cash');
    setCashTendered(Math.ceil(grandTotal));
    setSplitCash(Math.floor(grandTotal / 2));
    setSplitCard(Number((grandTotal - Math.floor(grandTotal / 2)).toFixed(2)));
    setShowPaymentModal(true);
  };

  // Finalize Sale
  const completeSale = () => {
    // Verify credit limit if method is credit
    if (paymentMethod === 'credit') {
      if (selectedCustomer.id === 'cust-001') {
        alert(
          lang === 'ar'
            ? 'لا يمكن البيع بالآجل للزبون النقدي العام!'
            : 'Cannot sell on credit to Walk-in customer!'
        );
        return;
      }
      if (selectedCustomer.balance + grandTotal > selectedCustomer.creditLimit) {
        alert(
          lang === 'ar'
            ? `تجاوز الحد الائتماني للعميل (${selectedCustomer.creditLimit} ر.س)!`
            : 'Credit limit exceeded!'
        );
        return;
      }
    }

    const now = new Date();
    const invoiceNum = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    const chosenRep = users.find((u) => u.id === selectedSalesRepId) || currentUser;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      salesRepId: chosenRep.id,
      salesRepName: chosenRep.name,
      repId: chosenRep.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart.map((c) => ({
        productId: c.productId,
        code: c.code,
        name: c.name,
        qty: c.qty,
        price: c.price,
        costPrice: c.costPrice,
        vatRate: c.vatRate,
        vatAmount: c.vatAmount,
        discount: c.discount || 0,
        discountTiming: c.discountTiming || globalDiscountTiming,
        total: c.total,
        isWeighted: c.isWeighted,
      })),
      subtotal: Number(subtotalBeforeVat.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      discountTiming: globalDiscountTiming,
      deliveryMethod,
      deliveryFee: deliveryMethod === 'delivery' ? effectiveDeliveryFee : 0,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      deliveryDriverName: deliveryMethod === 'delivery' ? deliveryDriverName : undefined,
      currency: activeCurrency.code,
      exchangeRate: activeCurrency.rateToBase,
      total: Number(grandTotal.toFixed(2)),
      paymentMethod,
      splitDetails:
        paymentMethod === 'split' ? { cash: splitCash, card: splitCard } : undefined,
      status: 'completed',
      syncStatus: isOnline ? 'synced' : 'pending_sync',
    };

    // Deduct stock from products
    const updatedProducts = products.map((p) => {
      const inCart = cart.find((c) => c.productId === p.id);
      if (inCart) {
        return {
          ...p,
          stock: Math.max(0, Number((p.stock - inCart.qty).toFixed(3))),
        };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);

    // Update customer balance if credit sale
    if (paymentMethod === 'credit') {
      const updatedCustomers = customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, balance: c.balance + grandTotal } : c
      );
      onUpdateCustomers(updatedCustomers);
      setSelectedCustomer((prev) => ({ ...prev, balance: prev.balance + grandTotal }));
    }

    onSaveInvoice(newInvoice);

    // Celebration & Audio
    playSuccessChime();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });

    setShowPaymentModal(false);
    setActivePrintInvoice(newInvoice);
    setCart([]);
    setDiscountPercent(0);
  };

  // Filtered Held tickets
  const filteredHeldTickets = heldTickets.filter(
    (t) => heldFilter === 'all' || t.deliveryMethod === heldFilter
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-62px)] overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* LEFT / CENTER: Products Grid & Search */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
        {/* Feedback Banner for Scales or Scans */}
        {scaleFeedback && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl mb-2 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{scaleFeedback}</span>
            </span>
            <button
              onClick={() => setScaleFeedback(null)}
              className="text-emerald-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Barcode Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 shadow-xs border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeSubmit}
              placeholder={
                lang === 'ar'
                  ? 'امسح الباركود، أو باركود الميزان (20xxxx)، أو الاسم...'
                  : 'Scan barcode, scale barcode (20xxxx), or name...'
              }
              className="w-full ps-9 pe-4 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Restaurant POS Switcher */}
          {onSwitchToRestaurant && (
            <button
              onClick={onSwitchToRestaurant}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-700 transition-colors shadow-xs cursor-pointer"
              title="التبديل إلى شاشة المطاعم والكافيهات باللمس السريع"
            >
              <Store className="w-4 h-4" />
              <span>{lang === 'ar' ? 'شاشة المطاعم' : 'Restaurant POS'}</span>
            </button>
          )}

          {/* Electronic Scale Launcher Button */}
          <button
            onClick={() => {
              if (onOpenScaleModal) {
                onOpenScaleModal();
              } else {
                setShowInternalScaleModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-700 transition-colors"
            title="فتح واجهة الميزان الإلكتروني وربط المنفذ التسلسلي"
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">الميزان الإلكتروني</span>
          </button>

          {/* Quick Simulated Scale Barcode Scan (Apples 1.500 kg) */}
          <button
            onClick={() => {
              // Simulate scanning scale barcode 2000111015004 (Apple 1.500 kg)
              const scaleResult = parseScaleBarcode('2000111015004', products, scaleConfig);
              if (scaleResult.matchedProduct) {
                addWeightedToCart(scaleResult.matchedProduct, scaleResult.weightKg || 1.5);
              } else {
                const weightedFallback = products.find((p) => p.isWeighted) || products[0];
                addWeightedToCart(weightedFallback, 1.5);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-700 transition-colors"
            title="محاكاة مسح باركود قادم من ميزان رقمي (وزن 1.5 كجم)"
          >
            <Barcode className="w-4 h-4" />
            <span className="hidden md:inline">محاكاة باركود ميزان</span>
          </button>

          {/* Camera Scanner */}
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              isCameraActive
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isCameraActive ? 'إغلاق الكاميرا' : 'مسح بالكاميرا'}
            </span>
          </button>

          {/* Held Tickets Button */}
          {heldTickets.length > 0 && (
            <button
              onClick={() => setShowHeldTicketsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-700"
            >
              <PlayCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>
                {t.heldTickets} ({heldTickets.length})
              </span>
            </button>
          )}
        </div>

        {/* Camera Barcode Simulation Banner */}
        {isCameraActive && (
          <div className="bg-slate-900 text-white rounded-xl p-3 mb-3 flex items-center justify-between border border-slate-700 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 border-2 border-emerald-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-0.5 bg-rose-500 animate-bounce"></div>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400">كاميرا المسح المباشر نشطة</div>
                <div className="text-[11px] text-slate-400">
                  وجه الكاميرا نحو باركود الصنف أو لصاقة الميزان الرقمي
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const target = products.find((p) => p.stock > 0) || products[0];
                  if (target.isWeighted) {
                    addWeightedToCart(target, 1.25);
                  } else {
                    addToCart(target);
                  }
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white"
              >
                التقاط باركود تلقائي
              </button>
              <button
                onClick={() => setIsCameraActive(false)}
                className="px-2.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat === 'all' ? t.allCategories : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStockAlert;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isOutOfStock
                      ? 'opacity-60 border-slate-200 dark:border-slate-700 cursor-not-allowed bg-slate-50 dark:bg-slate-850'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md active:scale-98'
                  }`}
                >
                  {/* Product Thumbnail Image & Tax Badge */}
                  <div className="relative mb-2 w-full h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-750 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}
                    {/* Tax Rate Badge */}
                    <span
                      className="absolute top-1.5 start-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600/90 text-white backdrop-blur-xs flex items-center gap-0.5 shadow-xs"
                      title={lang === 'ar' ? `نسبة الضريبة: %${product.vatRate ?? 15}` : `VAT: ${product.vatRate ?? 15}%`}
                    >
                      <Percent className="w-2.5 h-2.5" />
                      <span>{product.vatRate ?? 15}%</span>
                    </span>
                  </div>

                  {/* Stock Alert Badge & Scale Indicator */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1">
                      {product.code}
                      {product.isWeighted && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold" title="صنف خاضع للوزن">
                          ⚖️
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {isLowStock && !isOutOfStock && (
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>
                        {product.stock} {product.unit}
                      </span>
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {lang === 'ar' ? product.nameAr : product.nameEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                      {product.category}
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-blue-700 dark:text-blue-400 font-mono">
                        {CurrencyService.format(product.price, activeCurrency, lang)}
                      </span>
                      {activeCurrency.code !== 'SAR' && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          {product.price.toFixed(2)} ر.س
                        </div>
                      )}
                    </div>
                    <button
                      disabled={isOutOfStock}
                      className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Active Cart / Invoice Workstation */}
      <div className="w-full lg:w-[440px] bg-white dark:bg-slate-800 border-s border-slate-200 dark:border-slate-700 flex flex-col shadow-lg z-10">
        {/* Customer Selector & Ticket Meta */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t.customer}:</span>
            </span>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-0.5"
            >
              <UserPlus className="w-3 h-3" />
              <span>{t.addCustomer}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                if (found) {
                  setSelectedCustomer(found);
                  if (found.address) setDeliveryAddress(found.address);
                }
              }}
              className="flex-1 bg-white dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold py-1.5 px-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.balance !== 0 ? `(رصيد: ${c.balance.toFixed(2)} ر.س)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Method Selector (دعم طريقة التسليم: تسليم مباشر - استلام - توصيل) */}
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                طريقة التسليم والاستلام:
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                {deliveryMethod === 'direct'
                  ? 'تسليم مباشر / صالة'
                  : deliveryMethod === 'pickup'
                  ? 'استلام من الفرع / سفري'
                  : 'توصيل منازل / شحن'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 dark:bg-slate-750 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setDeliveryMethod('direct')}
                className={`py-1.5 px-2 rounded-md font-bold flex items-center justify-center gap-1 transition-all ${
                  deliveryMethod === 'direct'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="text-[11px]">صالة / مباشر</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`py-1.5 px-2 rounded-md font-bold flex items-center justify-center gap-1 transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[11px]">استلام سفري</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`py-1.5 px-2 rounded-md font-bold flex items-center justify-center gap-1 transition-all ${
                  deliveryMethod === 'delivery'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="text-[11px]">توصيل منازل</span>
              </button>
            </div>

            {/* Delivery Extra Details Panel */}
            {deliveryMethod === 'delivery' && (
              <div className="mt-2 p-2 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    عنوان التوصيل:
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">رسوم التوصيل:</span>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value)))}
                      className="w-14 px-1.5 py-0.5 text-center text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded"
                    />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">ر.س</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="أدخل عنوان العميل والشارع ورقم المبنى..."
                  className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-700/60">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-750 flex items-center justify-center mb-3">
                <Barcode className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-[220px] leading-relaxed">
                {t.cartEmpty}
              </p>
              <span className="text-[11px] text-slate-400 mt-1">
                امسح الصنف أو استخدم الميزان الإلكتروني
              </span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </h5>
                    {item.isWeighted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded">
                        ⚖️ موزون
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {CurrencyService.format(item.price, activeCurrency, lang)}
                      {item.isWeighted ? ' / كجم' : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      × {item.qty} {item.isWeighted ? 'كجم' : ''}
                    </span>

                    {/* Item Discount button & tag */}
                    <button
                      onClick={() =>
                        setEditingItemDiscount({
                          productId: item.productId,
                          productName: item.name,
                          price: item.price,
                          qty: item.qty,
                          discount: item.discount || 0,
                          discountTiming: item.discountTiming || globalDiscountTiming,
                        })
                      }
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold transition-colors flex items-center gap-0.5 ${
                        item.discount && item.discount > 0
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-blue-600'
                      }`}
                      title="تعديل حسم المادة وتوقيت الضريبة (قبل أو بعد)"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {item.discount && item.discount > 0 ? (
                        <span>
                          حسم -{item.discount.toFixed(2)} (
                          {item.discountTiming === 'after_tax' ? 'بعد الضريبة' : 'قبل الضريبة'})
                        </span>
                      ) : (
                        <span>+ حسم مادة</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600">
                  <button
                    onClick={() => updateQty(item.productId, -1)}
                    className="w-6 h-6 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, 1)}
                    className="w-6 h-6 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Total & Delete */}
                <div className="text-end min-w-[70px]">
                  <div className="text-xs font-extrabold font-mono text-slate-900 dark:text-slate-100">
                    {CurrencyService.format(item.total, activeCurrency, lang)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Summary Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-2">
          {/* Quick Actions (Discount & Timing & Hold) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleHoldTicket}
              disabled={cart.length === 0}
              className="py-1.5 px-2.5 bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 disabled:opacity-40"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t.holdTicket}</span>
            </button>

            {/* Global Discount and Timing Selector (قبل الضريبة / بعد الضريبة) */}
            {currentUser.permissions.canDiscount && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1">
                <Percent className="w-3 h-3 text-slate-500" />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">{t.discount}:</span>
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                  <option value={20}>20%</option>
                </select>

                {/* Timing Toggle: before_tax vs after_tax */}
                <div className="flex items-center border-s border-slate-200 dark:border-slate-600 ps-1.5 ms-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setGlobalDiscountTiming((prev) =>
                        prev === 'before_tax' ? 'after_tax' : 'before_tax'
                      )
                    }
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 ${
                      globalDiscountTiming === 'before_tax'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
                    }`}
                    title={
                      globalDiscountTiming === 'before_tax'
                        ? 'حسم قبل الضريبة: يقلل الوعاء الخاضع للضريبة (تقل الضريبة)'
                        : 'حسم بعد الضريبة: تُحسب الضريبة 15% على القيمة كاملة ويُخصم المبلغ من الإجمالي'
                    }
                  >
                    <span>{globalDiscountTiming === 'before_tax' ? 'قبل الضريبة' : 'بعد الضريبة'}</span>
                    <ArrowRightLeft className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="p-1.5 bg-white dark:bg-slate-750 hover:bg-rose-50 dark:hover:bg-rose-900/30 border border-slate-200 dark:border-slate-600 hover:border-rose-200 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-40 ms-auto"
              title={t.clearCart}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Breakdown numbers & VAT details */}
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>المبلغ الخاضع للضريبة (غير شامل الضريبة):</span>
              <span className="font-mono">
                {CurrencyService.format(subtotalBeforeVat, activeCurrency, lang)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                <span>
                  مجموع الخصومات (
                  {globalDiscountTiming === 'after_tax' ? 'بعد الضريبة' : 'قبل الضريبة'}):
                </span>
                <span className="font-mono">
                  -{CurrencyService.format(discountAmount, activeCurrency, lang)}
                </span>
              </div>
            )}

            {deliveryMethod === 'delivery' && effectiveDeliveryFee > 0 && (
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                <span>رسوم التوصيل:</span>
                <span className="font-mono">
                  +{CurrencyService.format(effectiveDeliveryFee, activeCurrency, lang)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>ضريبة القيمة المضافة (15% VAT):</span>
              <span className="font-mono">
                {CurrencyService.format(vatTotal, activeCurrency, lang)}
              </span>
            </div>

            <div className="flex justify-between items-baseline text-base font-extrabold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <span>{t.total}:</span>
                <span className="text-[10px] font-normal text-slate-400">شامل الضريبة</span>
              </div>
              <div className="text-end">
                <span className="font-mono text-blue-700 dark:text-blue-400 text-lg">
                  {CurrencyService.format(grandTotal, activeCurrency, lang)}
                </span>
                {activeCurrency.code !== 'SAR' && (
                  <div className="text-[11px] font-normal font-mono text-slate-500">
                    ≈ {grandTotal.toFixed(2)} ر.س
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Big Pay Button (Respects screenLayout customization) */}
          {(() => {
            const colorClass =
              screenLayout?.quickPayButtonColor === 'emerald'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                : screenLayout?.quickPayButtonColor === 'indigo'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                : screenLayout?.quickPayButtonColor === 'amber'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                : screenLayout?.quickPayButtonColor === 'purple'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                : screenLayout?.quickPayButtonColor === 'rose'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25';

            return (
              <button
                onClick={openPayment}
                disabled={cart.length === 0}
                className={`w-full py-3 ${colorClass} text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer`}
              >
                <Banknote className="w-5 h-5" />
                <span>{t.payNow}</span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* ITEM-LEVEL DISCOUNT MODAL (حسم المادة قبل الضريبة أو بعد الضريبة) */}
      {editingItemDiscount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>حسم الصنف: {editingItemDiscount.productName}</span>
              </h3>
              <button
                onClick={() => setEditingItemDiscount(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                  قيمة الخصم للصنف (بالريال السعودي):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editingItemDiscount.discount}
                  onChange={(e) =>
                    setEditingItemDiscount({
                      ...editingItemDiscount,
                      discount: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono font-bold"
                />
              </div>

              {/* Timing selector for this item */}
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                  توقيت احتساب الضريبة لحسم المادة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItemDiscount({
                        ...editingItemDiscount,
                        discountTiming: 'before_tax',
                      })
                    }
                    className={`p-2 rounded-lg border text-center font-bold text-xs transition-all ${
                      editingItemDiscount.discountTiming === 'before_tax'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    قبل الضريبة
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      يقلل الوعاء الضريبي
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingItemDiscount({
                        ...editingItemDiscount,
                        discountTiming: 'after_tax',
                      })
                    }
                    className={`p-2 rounded-lg border text-center font-bold text-xs transition-all ${
                      editingItemDiscount.discountTiming === 'after_tax'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    بعد الضريبة
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      يُخصم من الإجمالي النهائي
                    </span>
                  </button>
                </div>
              </div>

              {/* Live line total preview */}
              <div className="p-2.5 bg-slate-100 dark:bg-slate-750 rounded-lg text-slate-700 dark:text-slate-300 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>سعر الإجمالي للأصناف:</span>
                  <span className="font-mono font-bold">
                    {(editingItemDiscount.price * editingItemDiscount.qty).toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-bold">
                  <span>الصافي بعد الحسم:</span>
                  <span className="font-mono">
                    {calculateItemTaxAndTotal({
                      price: editingItemDiscount.price,
                      qty: editingItemDiscount.qty,
                      vatRate: 15,
                      discount: editingItemDiscount.discount,
                      discountTiming: editingItemDiscount.discountTiming,
                    }).total.toFixed(2)}{' '}
                    ر.س
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleApplyItemDiscount}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                تطبيق الحسم
              </button>
              <button
                onClick={() => setEditingItemDiscount(null)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELD TICKETS MODAL (with filter by delivery method) */}
      {showHeldTicketsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-amber-600" />
                <span>الفواتير المعلقة ({heldTickets.length})</span>
              </h3>
              <button
                onClick={() => setShowHeldTicketsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Delivery filter tabs */}
            <div className="flex items-center gap-1.5 my-3 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs">
              <button
                onClick={() => setHeldFilter('all')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  heldFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                الكل ({heldTickets.length})
              </button>
              <button
                onClick={() => setHeldFilter('direct')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  heldFilter === 'direct'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                تسليم صالة
              </button>
              <button
                onClick={() => setHeldFilter('pickup')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  heldFilter === 'pickup'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                استلام سفري
              </button>
              <button
                onClick={() => setHeldFilter('delivery')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  heldFilter === 'delivery'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                توصيل
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredHeldTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد فواتير معلقة تطابق الفلتر المحدد
                </div>
              ) : (
                filteredHeldTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {ticket.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded">
                          {ticket.deliveryMethod === 'delivery'
                            ? 'توصيل'
                            : ticket.deliveryMethod === 'pickup'
                            ? 'استلام'
                            : 'تسليم مباشر'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {ticket.timestamp}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        العميل: <strong>{ticket.customer.name}</strong> • عدد الأصناف: {ticket.items.length}
                      </div>
                      {ticket.deliveryAddress && ticket.deliveryMethod === 'delivery' && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          العنوان: {ticket.deliveryAddress}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleResumeTicket(ticket)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        استرجاع للسلة
                      </button>
                      <button
                        onClick={() =>
                          setHeldTickets((prev) => prev.filter((t) => t.id !== ticket.id))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'ar' ? 'سداد الفاتورة وطرق الدفع' : 'Payment & Checkout'}</span>
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Total due card */}
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 my-4 text-center border border-blue-100 dark:border-blue-900">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold block">
                {t.total} المطلوب (شامل الضريبة 15%)
              </span>
              <span className="text-3xl font-black text-blue-900 dark:text-blue-200 font-mono">
                {CurrencyService.format(grandTotal, activeCurrency, lang)}
              </span>
              {activeCurrency.code !== 'SAR' && (
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ≈ {grandTotal.toFixed(2)} ر.س (سعر الصرف: {activeCurrency.rateToBase})
                </div>
              )}
              {deliveryMethod === 'delivery' && (
                <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white/70 dark:bg-slate-800/80 py-1 px-3 rounded-full inline-block">
                  توصيل منازل • العنوان: {deliveryAddress}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
              {[
                { id: 'cash', label: t.cash, icon: Banknote },
                { id: 'card', label: t.card, icon: CreditCard },
                { id: 'wallet', label: t.wallet, icon: Smartphone },
                { id: 'credit', label: t.credit, icon: Users },
                { id: 'split', label: t.split, icon: Layers },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] text-center leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Specific Fields */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.amountTendered}:
                  </label>
                  <span className="text-xs text-slate-500 font-mono">
                    {t.changeDue}:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {Math.max(0, cashTendered - grandTotal).toFixed(2)} {t.sar}
                    </strong>
                  </span>
                </div>
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full text-center text-xl font-mono font-bold py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Fast Cash Quick Buttons */}
                <div className="flex gap-2">
                  {[grandTotal, 50, 100, 200, 500].map((amt, i) => (
                    <button
                      key={i}
                      onClick={() => setCashTendered(amt)}
                      className="flex-1 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                    >
                      {i === 0 ? t.exactAmount : `${amt} ${t.sar}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>توزيع المبالغ المجزأة:</span>
                  <span>
                    المجموع: {(splitCash + splitCard).toFixed(2)} / {grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                      المبلغ نقداً:
                    </label>
                    <input
                      type="number"
                      value={splitCash}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSplitCash(val);
                        setSplitCard(Number((grandTotal - val).toFixed(2)));
                      }}
                      className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                      المبلغ شبكة / بطاقة:
                    </label>
                    <input
                      type="number"
                      value={splitCard}
                      onChange={(e) => setSplitCard(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'credit' && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold">تسجيل آجل على ذمة العميل:</div>
                <div>
                  العميل: <strong>{selectedCustomer.name}</strong>
                </div>
                <div>
                  الرصيد الحالي: <strong>{selectedCustomer.balance.toFixed(2)} ر.س</strong>
                </div>
                <div>
                  الرصيد بعد الفاتورة:{' '}
                  <strong>{(selectedCustomer.balance + grandTotal).toFixed(2)} ر.س</strong>
                </div>
                <div>
                  الحد الائتماني: <strong>{selectedCustomer.creditLimit} ر.س</strong>
                </div>
              </div>
            )}

            {/* Sales Representative Selection */}
            <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === 'ar' ? 'مندوب المبيعات المرتبط بالفاتورة:' : 'Sales Representative:'}</span>
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  {lang === 'ar' ? 'احتساب التارغت والعمولة' : 'Target & Commission'}
                </span>
              </div>
              <select
                value={selectedSalesRepId}
                onChange={(e) => setSelectedSalesRepId(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.isSalesRep ? `(مندوب • عمولة ${u.commissionRate || 3}%)` : `(${u.role})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Confirm & Cancel */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={completeSale}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>{lang === 'ar' ? 'تأكيد السداد والطباعة' : 'Confirm & Print'}</span>
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm"
              >
                {lang === 'ar' ? 'رجوع' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>{lang === 'ar' ? 'إضافة عميل جديد سريع' : 'Add New Customer'}</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم العميل / المنشأة *
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="مثال: شركة الرواد التجارية"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  رقم الجوال
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  الرقم الضريبي (إن وجد)
                </label>
                <input
                  type="text"
                  value={newCustTax}
                  onChange={(e) => setNewCustTax(e.target.value)}
                  placeholder="300XXXXXXXXXXXX"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان التوصيل الافتراضي
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="المدينة، الحي، الشارع"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustName.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                حفظ واختيار العميل
              </button>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL DIGITAL SCALE MODAL */}
      {showInternalScaleModal && (
        <DigitalScaleModal
          products={products}
          activeCurrency={activeCurrency}
          lang={lang}
          onClose={() => setShowInternalScaleModal(false)}
          onAddWeightedProduct={(product, weightKg) => {
            addWeightedToCart(product, weightKg);
            setShowInternalScaleModal(false);
          }}
        />
      )}

      {/* PRINT DIALOG */}
      {activePrintInvoice && (
        <PrintableInvoice
          invoice={activePrintInvoice}
          config={templateConfig}
          lang={lang}
          customer={customers.find((c) => c.id === activePrintInvoice.customerId)}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}
    </div>
  );
};
