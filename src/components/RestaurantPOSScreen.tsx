import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  Printer,
  Save,
  CreditCard,
  Banknote,
  Search,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Clock,
  User as UserIcon,
  ChefHat,
  ShoppingBag,
  Truck,
  Layers,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  Grid,
  Check,
  Tag,
  ArrowRightLeft,
  DollarSign,
  Coffee,
  PlusCircle,
  Beef,
  Flame,
  LayoutGrid,
  SlidersHorizontal,
  Settings,
  Store,
  Users,
  CheckSquare,
  Square,
  HelpCircle,
  Coins,
  FileText,
  Filter,
  FlameKindling,
  Pizza,
  Sandwich,
  Wine,
  IceCream,
  Share2,
} from 'lucide-react';
import {
  Product,
  Customer,
  Warehouse,
  User,
  Invoice,
  InvoiceItem,
  InvoiceTemplateConfig,
  PaymentMethodConfig,
  Language,
  ScreenLayoutConfig,
  CategoryStyleConfig,
  Currency,
  RestaurantHall,
  RestaurantTable,
  ItemModifierGroup,
  SelectedModifier,
  RestaurantOrderType,
} from '../types';
import { playBarcodeBeep, playSuccessChime } from '../utils/storage';
import { CurrencyService } from '../utils/currencies';

interface RestaurantPOSScreenProps {
  products: Product[];
  customers: Customer[];
  currentUser: User;
  users?: User[];
  warehouses?: Warehouse[];
  templateConfig?: InvoiceTemplateConfig;
  onSaveInvoice: (invoice: Invoice) => void;
  onUpdateProducts?: (products: Product[]) => void;
  onUpdateCustomers?: (customers: Customer[]) => void;
  isOnline?: boolean;
  lang: Language;
  activeCurrency?: Currency;
  onOpenCurrencyModal?: () => void;
  screenLayout: ScreenLayoutConfig;
  categoryStyles?: CategoryStyleConfig[];
  configuredPaymentMethods?: PaymentMethodConfig[];
  onSwitchToRetail?: () => void;
  onUpdateScreenLayout?: (layout: ScreenLayoutConfig) => void;
}

export function RestaurantPOSScreen({
  products,
  customers,
  currentUser,
  users = [],
  warehouses = [],
  templateConfig,
  onSaveInvoice,
  onUpdateProducts,
  onUpdateCustomers,
  isOnline = true,
  lang,
  activeCurrency = CurrencyService.getActiveCurrency(),
  onOpenCurrencyModal,
  screenLayout,
  categoryStyles = [],
  configuredPaymentMethods = [],
  onSwitchToRetail,
  onUpdateScreenLayout,
}: RestaurantPOSScreenProps) {
  // Order Line Items State
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Restaurant Order Meta
  const [orderType, setOrderType] = useState<RestaurantOrderType>(screenLayout.restaurantDefaultOrderType || 'dine_in');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => `ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-001');
  const [customerNameInput, setCustomerNameInput] = useState<string>('زبون نقدي');
  const [selectedWaiter, setSelectedWaiter] = useState<string>(currentUser.name || 'أحمد الكابتن');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [deliveryDriver, setDeliveryDriver] = useState<string>('توصيل المطعم السريع');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0);

  // Selected Category & Product Search
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Local Layout Customizations (from screenshots)
  const [localLayout, setLocalLayout] = useState<ScreenLayoutConfig>({
    ...screenLayout,
    productGridColumns: screenLayout.productGridColumns || 4,
    showProductImages: screenLayout.showProductImages ?? true,
    showProductPrice: screenLayout.showProductPrice ?? true,
    showProductStock: screenLayout.showProductStock ?? true,
    showProductUnit: screenLayout.showProductUnit ?? true,
    showProductCode: screenLayout.showProductCode ?? true,
    showNumericKeypad: screenLayout.showNumericKeypad ?? false,
    categoryPosition: screenLayout.categoryPosition || 'top',
    tableColumns: screenLayout.tableColumns || 4,
    showTableNameOnButton: screenLayout.showTableNameOnButton ?? true,
    showTableOpenTime: screenLayout.showTableOpenTime ?? true,
  });

  // Modals & Sheets
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [showModifierModal, setShowModifierModal] = useState<boolean>(false);
  const [modifierTargetItemIndex, setModifierTargetItemIndex] = useState<number | null>(null);
  const [tempModifiers, setTempModifiers] = useState<SelectedModifier[]>([]);
  const [tempKitchenNote, setTempKitchenNote] = useState<string>('');
  const [showMultiPayModal, setShowMultiPayModal] = useState<boolean>(false);
  const [showKitchenTicketModal, setShowKitchenTicketModal] = useState<boolean>(false);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState<boolean>(false);
  const [showShiftReportModal, setShowShiftReportModal] = useState<boolean>(false);
  const [showQuickSettingsModal, setShowQuickSettingsModal] = useState<boolean>(false);
  const [showTableTransferModal, setShowTableTransferModal] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);

  // Tables State
  const [halls, setHalls] = useState<RestaurantHall[]>([
    { id: 'hall-1', nameAr: 'الصالة الرئيسية', nameEn: 'Main Hall', sortOrder: 1 },
    { id: 'hall-2', nameAr: 'صالة العائلات VIP', nameEn: 'Family VIP Hall', sortOrder: 2 },
    { id: 'hall-3', nameAr: 'التراس والجلسات الخارجية', nameEn: 'Outdoor Terrace', sortOrder: 3 },
  ]);

  const [tables, setTables] = useState<RestaurantTable[]>([
    { id: 'tbl-1', hallId: 'hall-1', number: '1', name: 'طاولة T-01', capacity: 2, status: 'available' },
    { id: 'tbl-2', hallId: 'hall-1', number: '2', name: 'طاولة T-02', capacity: 4, status: 'occupied', activeOrderTotal: 84.5, guestCount: 3, openedAt: '13:40', waiterName: 'أحمد' },
    { id: 'tbl-3', hallId: 'hall-1', number: '3', name: 'طاولة T-03', capacity: 4, status: 'billing', activeOrderTotal: 142.0, guestCount: 4, openedAt: '13:15', waiterName: 'سارة' },
    { id: 'tbl-4', hallId: 'hall-1', number: '4', name: 'طاولة T-04', capacity: 6, status: 'available' },
    { id: 'tbl-5', hallId: 'hall-1', number: '5', name: 'طاولة T-05', capacity: 8, status: 'available' },
    { id: 'tbl-6', hallId: 'hall-1', number: '6', name: 'طاولة T-06', capacity: 4, status: 'available' },
    { id: 'tbl-11', hallId: 'hall-2', number: '11', name: 'جناح عائلي 1', capacity: 6, status: 'occupied', activeOrderTotal: 215.0, guestCount: 5, openedAt: '13:50', waiterName: 'أحمد' },
    { id: 'tbl-12', hallId: 'hall-2', number: '12', name: 'جناح عائلي 2', capacity: 8, status: 'available' },
    { id: 'tbl-13', hallId: 'hall-2', number: '13', name: 'كبينة VIP الملكية', capacity: 10, status: 'reserved', waiterName: 'خالد' },
    { id: 'tbl-21', hallId: 'hall-3', number: '21', name: 'تراس 1 (مطل)', capacity: 4, status: 'available' },
    { id: 'tbl-22', hallId: 'hall-3', number: '22', name: 'تراس 2 (مطل)', capacity: 4, status: 'occupied', activeOrderTotal: 65.0, guestCount: 2, openedAt: '14:10', waiterName: 'سارة' },
  ]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(tables[1]);
  const [activeHallId, setActiveHallId] = useState<string>('hall-1');

  // Held Orders State
  const [heldOrders, setHeldOrders] = useState<Invoice[]>([]);

  // Modifiers & Add-ons Library
  const modifierGroups: ItemModifierGroup[] = [
    {
      id: 'mod-size',
      nameAr: 'حجم الوجبة والسندويش',
      nameEn: 'Size Selection',
      selectionType: 'single',
      options: [
        { id: 'opt-reg', nameAr: 'عادي (Regular)', nameEn: 'Regular', price: 0, isDefault: true },
        { id: 'opt-med', nameAr: 'وسط (Medium)', nameEn: 'Medium', price: 2.0 },
        { id: 'opt-lrg', nameAr: 'كبير / دبل (Large)', nameEn: 'Large Double', price: 4.5 },
        { id: 'opt-combo', nameAr: 'وجبة كومبو كاملة (+ بطاطس ومشروب)', nameEn: 'Full Combo Meal', price: 7.0 },
      ],
    },
    {
      id: 'mod-bread',
      nameAr: 'نوع الخبز والإعداد',
      nameEn: 'Bread & Preparation',
      selectionType: 'single',
      options: [
        { id: 'opt-brioche', nameAr: 'خبز بريوش فاخر طازج', nameEn: 'Fresh Brioche', price: 0, isDefault: true },
        { id: 'opt-potato', nameAr: 'خبز البطاطا الذهبي', nameEn: 'Potato Bun', price: 1.0 },
        { id: 'opt-tortilla', nameAr: 'تورتيلا رول', nameEn: 'Tortilla Wrap', price: 0 },
        { id: 'opt-lettuce', nameAr: 'بدون خبز (خس راب دايت)', nameEn: 'Lettuce Wrap (Keto)', price: 0 },
      ],
    },
    {
      id: 'mod-sauces',
      nameAr: 'الصوصات والتتبيل الخاص',
      nameEn: 'Special Sauces & Dips',
      selectionType: 'multiple',
      maxSelect: 4,
      options: [
        { id: 'opt-garlic', nameAr: 'ثومية سبيشال كريمية', nameEn: 'Special Garlic', price: 0 },
        { id: 'opt-mustard', nameAr: 'هوني ماسترد عسلي', nameEn: 'Honey Mustard', price: 1.0 },
        { id: 'opt-bbq', nameAr: 'باربكيو مدخن فاخر', nameEn: 'Smoked BBQ', price: 1.0 },
        { id: 'opt-dynamite', nameAr: 'صوص ديناميت حار', nameEn: 'Dynamite Sauce', price: 1.5 },
        { id: 'opt-truffle', nameAr: 'مايونيز ترافل فاخر', nameEn: 'Truffle Mayo', price: 2.5 },
      ],
    },
    {
      id: 'mod-addons',
      nameAr: 'إضافات مميزة ومرفقات',
      nameEn: 'Premium Add-ons',
      selectionType: 'multiple',
      options: [
        { id: 'opt-cheddar', nameAr: 'شريحة جبن شيدر ذائبة', nameEn: 'Melted Cheddar', price: 2.0 },
        { id: 'opt-mozzarella', nameAr: 'أصابع موتزريلا مقرمشة', nameEn: 'Mozzarella Sticks', price: 4.0 },
        { id: 'opt-bacon', nameAr: 'بيكون بقري مقرمش', nameEn: 'Crispy Beef Bacon', price: 3.5 },
        { id: 'opt-jalapeno', nameAr: 'هلابينو مكسيكي متبل', nameEn: 'Pickled Jalapenos', price: 1.0 },
        { id: 'opt-onions', nameAr: 'حلقات بصل مقرمشة', nameEn: 'Crispy Onion Rings', price: 2.5 },
        { id: 'opt-mushrooms', nameAr: 'فطر مشوي بالزبدة', nameEn: 'Sauteed Mushrooms', price: 3.0 },
      ],
    },
  ];

  // Payment Calculation State
  const [cashTendered, setCashTendered] = useState<string>('');
  const [visaTendered, setVisaTendered] = useState<string>('');
  const [activeKeypadTarget, setActiveKeypadTarget] = useState<'cash' | 'qty' | 'discount'>('cash');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Restaurant Categories derived from products + defaults
  const categoriesList = useMemo(() => {
    const defaultCats = [
      { id: 'الكل', nameAr: 'جميع الأصناف', icon: Grid },
      { id: 'برجر وسندويشات', nameAr: 'البرجر والسندويشات', icon: Sandwich },
      { id: 'مشويات وأطباق', nameAr: 'المشويات والأطباق', icon: Flame },
      { id: 'بيتزا وفطائر', nameAr: 'البيتزا والمعجنات', icon: Pizza },
      { id: 'مقبلات وطلبات جانبية', nameAr: 'المقبلات والجانبية', icon: Utensils },
      { id: 'مشروبات وعصائر', nameAr: 'المشروبات والبار', icon: Wine },
      { id: 'حلويات وكافيه', nameAr: 'الحلويات والكافيه', icon: IceCream },
    ];

    // Check existing products categories
    const existingCatNames = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    const merged = [...defaultCats];
    existingCatNames.forEach((cat) => {
      if (!merged.some((m) => m.id === cat || m.nameAr === cat)) {
        merged.push({
          id: cat,
          nameAr: cat,
          icon: Tag,
        });
      }
    });
    return merged;
  }, [products]);

  // Filtered Products
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'الكل' ||
        p.category === selectedCategory ||
        (selectedCategory === 'برجر وسندويشات' && (p.category.includes('برجر') || p.category.includes('سندويش'))) ||
        (selectedCategory === 'مشويات وأطباق' && (p.category.includes('لحم') || p.category.includes('دجاج') || p.category.includes('مشوي'))) ||
        (selectedCategory === 'مشروبات وعصائر' && (p.category.includes('مشروب') || p.category.includes('عصير') || p.category.includes('ألبان'))) ||
        (selectedCategory === 'مقبلات وطلبات جانبية' && (p.category.includes('مقبلات') || p.category.includes('جانبية') || p.category.includes('صوص')));

      const matchesSearch =
        searchQuery.trim() === '' ||
        p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Order Financial Calculations
  const grossSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemsDiscount = cartItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const orderDiscountVal = (grossSubtotal * orderDiscountPercent) / 100;
  const totalDiscount = itemsDiscount + orderDiscountVal;
  const netSubtotal = Math.max(0, grossSubtotal - totalDiscount);

  // VAT (15% inclusive calculation standard)
  const vatTotal = cartItems.reduce((sum, item) => {
    const itemNet = item.price * item.qty - (item.discount || 0);
    return sum + (itemNet * (item.vatRate || 15)) / (100 + (item.vatRate || 15));
  }, 0);

  const deliveryFeeVal = orderType === 'delivery' ? Number(deliveryFee || 0) : 0;
  const finalGrandTotal = Math.max(0, netSubtotal + deliveryFeeVal);

  // Add Item to Cart (Tap to Add)
  const handleAddToCart = (product: Product, customModifiers?: SelectedModifier[], notes?: string) => {
    playBarcodeBeep();
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.productId === product.id &&
        (!customModifiers || customModifiers.length === 0) &&
        (!item.selectedModifiers || item.selectedModifiers.length === 0) &&
        (!notes || item.kitchenNotes === notes)
    );

    if (existingIndex > -1 && !customModifiers && !notes) {
      const updated = [...cartItems];
      updated[existingIndex].qty += 1;
      updated[existingIndex].total = updated[existingIndex].qty * updated[existingIndex].price - (updated[existingIndex].discount || 0);
      setCartItems(updated);
      setSelectedItemIndex(existingIndex);
    } else {
      const modifiersTotalExtra = (customModifiers || []).reduce((sum, m) => sum + m.price, 0);
      const unitPrice = product.price + modifiersTotalExtra;
      const newItem: InvoiceItem = {
        productId: product.id,
        code: product.code,
        name: product.nameAr,
        qty: 1,
        price: unitPrice,
        costPrice: product.costPrice || product.price * 0.6,
        vatRate: product.vatRate || 15,
        vatAmount: (unitPrice * (product.vatRate || 15)) / (100 + (product.vatRate || 15)),
        discount: 0,
        total: unitPrice,
        selectedModifiers: customModifiers || [],
        kitchenNotes: notes || '',
        kitchenStatus: 'pending',
      };
      setCartItems((prev) => [...prev, newItem]);
      setSelectedItemIndex(cartItems.length);
    }
  };

  // Handle Product Card Click (if item has modifier options and user wants customizer, open it)
  const handleProductCardClick = (product: Product) => {
    handleAddToCart(product);
  };

  // Quantity Stepper
  const handleUpdateQty = (delta: number) => {
    if (selectedItemIndex === null || !cartItems[selectedItemIndex]) return;
    const updated = [...cartItems];
    const newQty = updated[selectedItemIndex].qty + delta;
    if (newQty <= 0) {
      handleDeleteItem();
    } else {
      updated[selectedItemIndex].qty = newQty;
      updated[selectedItemIndex].total = newQty * updated[selectedItemIndex].price - (updated[selectedItemIndex].discount || 0);
      setCartItems(updated);
    }
  };

  // Delete Item
  const handleDeleteItem = () => {
    if (selectedItemIndex === null || !cartItems[selectedItemIndex]) return;
    const updated = cartItems.filter((_, idx) => idx !== selectedItemIndex);
    setCartItems(updated);
    setSelectedItemIndex(updated.length > 0 ? Math.max(0, selectedItemIndex - 1) : null);
  };

  // Clear Order
  const handleClearOrder = () => {
    if (cartItems.length === 0) return;
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء وتفريغ الطلب الحالي؟' : 'Clear current order?')) {
      setCartItems([]);
      setSelectedItemIndex(null);
      setInvoiceNumber(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
      setOrderNotes('');
      setDeliveryFee(0);
      setOrderDiscountPercent(0);
    }
  };

  // Open Modifier Customizer Modal
  const handleOpenModifierModal = (index?: number) => {
    const targetIdx = index !== undefined ? index : selectedItemIndex;
    if (targetIdx === null || !cartItems[targetIdx]) return;
    const item = cartItems[targetIdx];
    setModifierTargetItemIndex(targetIdx);
    setTempModifiers(item.selectedModifiers || []);
    setTempKitchenNote(item.kitchenNotes || '');
    setShowModifierModal(true);
  };

  // Save Modifiers to Item
  const handleSaveModifiers = () => {
    if (modifierTargetItemIndex === null || !cartItems[modifierTargetItemIndex]) return;
    const updated = [...cartItems];
    const item = updated[modifierTargetItemIndex];
    const originalProduct = products.find((p) => p.id === item.productId);
    const basePrice = originalProduct ? originalProduct.price : item.price;
    const modifiersTotalExtra = tempModifiers.reduce((sum, m) => sum + m.price, 0);
    const newUnitPrice = basePrice + modifiersTotalExtra;

    item.selectedModifiers = tempModifiers;
    item.kitchenNotes = tempKitchenNote;
    item.price = newUnitPrice;
    item.total = item.qty * newUnitPrice - (item.discount || 0);

    setCartItems(updated);
    setShowModifierModal(false);
  };

  // Toggle modifier option in modal
  const handleToggleModifierOption = (group: ItemModifierGroup, option: { id: string; nameAr: string; nameEn: string; price: number }) => {
    if (group.selectionType === 'single') {
      const filtered = tempModifiers.filter((m) => m.groupId !== group.id);
      filtered.push({
        groupId: group.id,
        groupName: group.nameAr,
        optionId: option.id,
        optionName: option.nameAr,
        price: option.price,
      });
      setTempModifiers(filtered);
    } else {
      const exists = tempModifiers.some((m) => m.groupId === group.id && m.optionId === option.id);
      if (exists) {
        setTempModifiers(tempModifiers.filter((m) => !(m.groupId === group.id && m.optionId === option.id)));
      } else {
        setTempModifiers([
          ...tempModifiers,
          {
            groupId: group.id,
            groupName: group.nameAr,
            optionId: option.id,
            optionName: option.nameAr,
            price: option.price,
          },
        ]);
      }
    }
  };

  // Hold / Store Order
  const handleHoldOrder = () => {
    if (cartItems.length === 0) return;
    const pendingInvoice: Invoice = {
      id: `hold-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomerId,
      customerName: customerNameInput,
      items: cartItems,
      subtotal: netSubtotal,
      vatTotal,
      discount: totalDiscount,
      total: finalGrandTotal,
      paymentMethod: 'cash',
      orderType,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      hallName: halls.find((h) => h.id === selectedTable?.hallId)?.nameAr,
      notes: orderNotes,
      salesRepName: selectedWaiter,
      status: 'completed',
      syncStatus: 'pending_sync',
    };

    setHeldOrders((prev) => [...prev, pendingInvoice]);

    // Update table status if dine_in
    if (orderType === 'dine_in' && selectedTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id
            ? {
                ...t,
                status: 'occupied',
                activeOrderTotal: finalGrandTotal,
                openedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                guestCount,
                waiterName: selectedWaiter,
              }
            : t
        )
      );
    }

    playSuccessChime();
    setCartItems([]);
    setSelectedItemIndex(null);
    setInvoiceNumber(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Restore Held Order
  const handleRestoreHeldOrder = (held: Invoice) => {
    setCartItems(held.items);
    setInvoiceNumber(held.invoiceNumber);
    setOrderType(held.orderType || 'dine_in');
    setCustomerNameInput(held.customerName || 'زبون نقدي');
    if (held.tableId) {
      const foundTable = tables.find((t) => t.id === held.tableId);
      if (foundTable) setSelectedTable(foundTable);
    }
    setHeldOrders((prev) => prev.filter((o) => o.id !== held.id));
    setShowHeldOrdersModal(false);
  };

  // Direct Quick Cash Pay
  const handleQuickCashPay = () => {
    if (cartItems.length === 0) return;
    setCashTendered(finalGrandTotal.toFixed(2));
    setVisaTendered('0');
    setShowMultiPayModal(true);
  };

  // Complete Payment Confirmation
  const handleConfirmPayment = () => {
    const cashVal = parseFloat(cashTendered) || 0;
    const visaVal = parseFloat(visaTendered) || 0;
    const totalPaid = cashVal + visaVal;

    if (totalPaid < finalGrandTotal && totalPaid > 0) {
      if (!window.confirm(`المبلغ المدفوع (${totalPaid}) أقل من الإجمالي (${finalGrandTotal}). هل تريد المتابعة كحساب آجل؟`)) {
        return;
      }
    }

    const completedInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomerId,
      customerName: customerNameInput,
      items: cartItems,
      subtotal: netSubtotal,
      vatTotal,
      discount: totalDiscount,
      total: finalGrandTotal,
      paymentMethod: visaVal > 0 && cashVal > 0 ? 'split' : visaVal > 0 ? 'card' : 'cash',
      currency: activeCurrency.code,
      deliveryMethod: orderType === 'delivery' ? 'delivery' : orderType === 'takeaway' ? 'pickup' : 'direct',
      deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      orderType,
      tableId: orderType === 'dine_in' ? selectedTable?.id : undefined,
      tableName: orderType === 'dine_in' ? selectedTable?.name : undefined,
      hallName: orderType === 'dine_in' ? halls.find((h) => h.id === selectedTable?.hallId)?.nameAr : undefined,
      notes: orderNotes,
      salesRepName: selectedWaiter,
      status: 'completed',
      syncStatus: 'synced',
    };

    onSaveInvoice(completedInvoice);
    playSuccessChime();

    // Clear table if dine_in
    if (orderType === 'dine_in' && selectedTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id ? { ...t, status: 'available', activeOrderTotal: undefined, openedAt: undefined, waiterName: undefined } : t
        )
      );
    }

    // Reset Form
    setShowMultiPayModal(false);
    setCartItems([]);
    setSelectedItemIndex(null);
    setInvoiceNumber(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
    setOrderNotes('');
    setDeliveryFee(0);
    setOrderDiscountPercent(0);
  };

  // Select Table from Floor Plan
  const handleSelectTable = (tbl: RestaurantTable) => {
    setSelectedTable(tbl);
    setShowTableModal(false);
    if (tbl.status === 'occupied' && tbl.activeOrderTotal) {
      // Find if there's a held order for this table
      const matched = heldOrders.find((h) => h.tableId === tbl.id);
      if (matched) {
        handleRestoreHeldOrder(matched);
      }
    }
  };

  // Table status colors & labels
  const getTableStatusBadge = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available':
        return { label: 'متاحة', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case 'occupied':
        return { label: 'مشغولة', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      case 'billing':
        return { label: 'طلب الحساب', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'reserved':
        return { label: 'محجوزة', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
      default:
        return { label: 'متاحة', bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    }
  };

  // Numeric Keypad Handler
  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      if (activeKeypadTarget === 'cash') setCashTendered('');
      return;
    }
    if (activeKeypadTarget === 'cash') {
      setCashTendered((prev) => prev + val);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.2rem)] bg-slate-100 dark:bg-slate-900 select-none overflow-hidden font-sans text-slate-800 dark:text-slate-100">
      {/* 1. Top Omnibar & Fast Action Header */}
      <header className="h-14 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-750 px-4 flex items-center justify-between gap-3 shrink-0 shadow-xs z-20">
        {/* Left Side: Order Type Switcher & Table Indicator */}
        <div className="flex items-center gap-2.5">
          {/* Order Type Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderType === 'dine_in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'محلي / صالة' : 'Dine In'}</span>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderType === 'takeaway'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'سفري' : 'Takeaway'}</span>
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderType === 'delivery'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'توصيل' : 'Delivery'}</span>
            </button>
          </div>

          {/* If Dine-In: Table Selector Button */}
          {orderType === 'dine_in' && (
            <button
              onClick={() => setShowTableModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
              title="اختيار أو تغيير الطاولة"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedTable ? `${selectedTable.name} (${selectedTable.capacity} مقاعد)` : 'اختر الطاولة'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          {/* Waiter / Captain Selector Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300">
            <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] text-slate-400 font-medium">الكابتن:</span>
            <select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="أحمد الكابتن">أحمد الكابتن</option>
              <option value="سارة الويتر">سارة الويتر</option>
              <option value="خالد المشرف">خالد المشرف</option>
              <option value={currentUser.name}>{currentUser.name}</option>
            </select>
          </div>
        </div>

        {/* Center: Quick Search Bar */}
        <div className="flex-1 max-w-md hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث سريع عن صنف، وجبة، أو كود...' : 'Quick search item, burger, drink...'}
            className="w-full pl-3 pr-9 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Quick Tools & Retail Switcher */}
        <div className="flex items-center gap-2">
          {/* Held Orders Count Button */}
          <button
            onClick={() => setShowHeldOrdersModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              heldOrders.length > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="الطلبات المعلقة"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>معلق</span>
            {heldOrders.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {heldOrders.length}
              </span>
            )}
          </button>

          {/* Quick Layout Settings (Screenshots direct inspiration) */}
          <button
            onClick={() => setShowQuickSettingsModal(true)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="تخصيص عرض شاشة المطعم والأزرار"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Switch to Commercial POS */}
          {onSwitchToRetail && (
            <button
              onClick={onSwitchToRetail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-xs"
              title="التبديل إلى شاشة المبيعات التجارية والتجزئة"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'شاشة التجزئة' : 'Retail POS'}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Workspace Layout: Grid + Cart Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Center Area: Categories + Products Grid */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900 p-3 space-y-3">
          {/* Category Navigation Bar (Top or Side) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 border border-slate-200 dark:border-slate-700/80 shadow-xs shrink-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {categoriesList.map((cat) => {
              const IconComp = cat.icon || Tag;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                  <span>{cat.nameAr}</span>
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto pr-0.5">
            <div
              className={`grid gap-2.5 ${
                localLayout.productGridColumns === 3
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : localLayout.productGridColumns === 5
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : localLayout.productGridColumns === 6
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {displayedProducts.map((product) => {
                const countInCart = cartItems.filter((i) => i.productId === product.id).reduce((sum, i) => sum + i.qty, 0);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductCardClick(product)}
                    className="group relative bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 active:scale-[0.98] cursor-pointer"
                  >
                    {/* Badge Count if added to cart */}
                    {countInCart > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-black flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800 animate-in zoom-in-75">
                        {countInCart}
                      </span>
                    )}

                    {/* Top Row: Code & Category */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      {localLayout.showProductCode && (
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                          {product.code}
                        </span>
                      )}
                      <span className="text-[10px] text-indigo-500/80 font-medium truncate max-w-[80px]">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <div className="my-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                        {product.nameAr}
                      </h4>
                    </div>

                    {/* Bottom Row: Price & Unit / Stock */}
                    <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-0.5">
                          <span>{product.price.toFixed(2)}</span>
                          <span className="text-[10px] font-normal text-slate-400">{activeCurrency.symbol}</span>
                        </div>
                      </div>

                      {/* Modifier Quick Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                          // Open customizer immediately
                          setTimeout(() => {
                            setModifierTargetItemIndex(cartItems.length);
                            setTempModifiers([]);
                            setTempKitchenNote('');
                            setShowModifierModal(true);
                          }, 50);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-500 hover:text-indigo-600 rounded-xl transition-colors"
                        title="إضافة مع تخصيص المكونات والإضافات"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedProducts.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Utensils className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p>لا توجد أصناف تطابق البحث أو التصنيف المحدد</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Order Ticket / Cart Panel */}
        <div
          className={`w-96 lg:w-[420px] bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-750 flex flex-col shrink-0 shadow-lg z-10 ${
            localLayout.cartPosition === 'left' ? 'order-last' : 'order-first'
          }`}
        >
          {/* Ticket Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                  {invoiceNumber}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {orderType === 'dine_in' ? selectedTable?.name || 'صالة' : orderType === 'takeaway' ? 'طلب سفري' : 'توصيل'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <span>الكابتن: {selectedWaiter}</span>
                {orderType === 'dine_in' && <span>• {guestCount} ضيوف</span>}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearOrder}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="إلغاء وتفريغ الطلب"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {cartItems.map((item, index) => {
              const isSelected = selectedItemIndex === index;
              return (
                <div
                  key={`${item.productId}-${index}`}
                  onClick={() => setSelectedItemIndex(index)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </h5>
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {item.total.toFixed(2)} {activeCurrency.symbol}
                        </span>
                      </div>

                      {/* Selected Modifiers Chips */}
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.selectedModifiers.map((mod, mIdx) => (
                            <span
                              key={mIdx}
                              className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded-md font-medium"
                            >
                              +{mod.optionName} {mod.price > 0 && `(+${mod.price})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Kitchen Note Pill */}
                      {item.kitchenNotes && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md mt-1 font-medium flex items-center gap-1">
                          <ChefHat className="w-3 h-3" />
                          <span>{item.kitchenNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions Bar */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemIndex(index);
                          handleUpdateQty(-1);
                        }}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-black text-xs text-slate-900 dark:text-white font-mono">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemIndex(index);
                          handleUpdateQty(1);
                        }}
                        className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModifierModal(index);
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-0.5"
                      >
                        تعديل المكونات
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemIndex(index);
                          handleDeleteItem();
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {cartItems.length === 0 && (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Receipt className="w-7 h-7 mb-2 opacity-40" />
                <p>قائمة الطلب فارغة، انقر على الأصناف لإضافتها</p>
              </div>
            )}
          </div>

          {/* Ticket Financial Summary */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>المجموع قبل الخصم</span>
              <span className="font-mono">{grossSubtotal.toFixed(2)} {activeCurrency.symbol}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex items-center justify-between text-rose-600 font-bold">
                <span>الخصم</span>
                <span className="font-mono">-{totalDiscount.toFixed(2)} {activeCurrency.symbol}</span>
              </div>
            )}

            {orderType === 'delivery' && (
              <div className="flex items-center justify-between text-amber-600 font-bold">
                <span>رسوم التوصيل</span>
                <span className="font-mono">+{deliveryFeeVal.toFixed(2)} {activeCurrency.symbol}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>الضريبة المضمنة (15%)</span>
              <span className="font-mono">{vatTotal.toFixed(2)} {activeCurrency.symbol}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-750 flex items-baseline justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">المبلغ الإجمالي المستحق</span>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {finalGrandTotal.toFixed(2)} <span className="text-xs font-normal">{activeCurrency.symbol}</span>
              </div>
            </div>
          </div>

          {/* Bottom High-Tactile Quick Action Buttons */}
          <div className="p-2.5 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-750 grid grid-cols-3 gap-1.5 shrink-0">
            {/* 1. Kitchen KOT Print */}
            <button
              onClick={() => setShowKitchenTicketModal(true)}
              disabled={cartItems.length === 0}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>إرسال للمطبخ</span>
            </button>

            {/* 2. Hold Order */}
            <button
              onClick={handleHoldOrder}
              disabled={cartItems.length === 0}
              className="p-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>تعليق / حفظ</span>
            </button>

            {/* 3. Quick Cash */}
            <button
              onClick={handleQuickCashPay}
              disabled={cartItems.length === 0}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Banknote className="w-4 h-4" />
              <span>دفع كاش</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Modal: Table Floor Plan & Hall Layout */}
      {showTableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-750">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  مخطط طاولات الصالة وإدارة الجلوس (Restaurant Floor Plan)
                </h3>
              </div>
              <button onClick={() => setShowTableModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Halls Tabs */}
            <div className="px-4 pt-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700">
              {halls.map((hall) => (
                <button
                  key={hall.id}
                  onClick={() => setActiveHallId(hall.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                    activeHallId === hall.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {hall.nameAr}
                </button>
              ))}
            </div>

            {/* Tables Grid */}
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {tables
                  .filter((t) => t.hallId === activeHallId)
                  .map((table) => {
                    const badge = getTableStatusBadge(table.status);
                    const isCurrent = selectedTable?.id === table.id;
                    return (
                      <div
                        key={table.id}
                        onClick={() => handleSelectTable(table)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                            : table.status === 'occupied'
                            ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                            : table.status === 'billing'
                            ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                            : table.status === 'reserved'
                            ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{table.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 space-y-1 my-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>السعة:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{table.capacity} أشخاص</span>
                          </div>
                          {table.openedAt && (
                            <div className="flex items-center justify-between text-[11px] text-amber-600 font-medium">
                              <span>وقت الفتح:</span>
                              <span>{table.openedAt}</span>
                            </div>
                          )}
                          {table.activeOrderTotal && (
                            <div className="flex items-center justify-between text-[11px] font-black text-slate-900 dark:text-white">
                              <span>المبلغ:</span>
                              <span className="font-mono">{table.activeOrderTotal} {activeCurrency.symbol}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isCurrent ? 'الطاولة الحالية' : 'اختيار الطاولة'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Modal: Meal Modifiers & Kitchen Customizer */}
      {showModifierModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-750">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  محددات وإضافات الوجبة (Meal Customizer)
                </h3>
              </div>
              <button onClick={() => setShowModifierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modifiers Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {modifierGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{group.nameAr}</h4>
                    <span className="text-[10px] text-slate-400">
                      {group.selectionType === 'single' ? 'اختيار فردي' : 'متعدد'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {group.options.map((opt) => {
                      const isSelected = tempModifiers.some((m) => m.groupId === group.id && m.optionId === opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleToggleModifierOption(group, opt)}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500/20'
                              : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold">{opt.nameAr}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {opt.price === 0 ? 'مجاناً' : `+${opt.price.toFixed(2)} ${activeCurrency.symbol}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Kitchen Special Notes */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                  <span>ملاحظات تحضير خاصة للمطبخ</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['🔥 سبايسي حار', '🧂 ملح خفيف', '🥫 صوص جانبي', '🧅 بدون بصل', '🍅 بدون طماطم', '📦 تغليف سفري'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTempKitchenNote((prev) => (prev ? `${prev} • ${tag}` : tag))}
                      className="text-[11px] bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tempKitchenNote}
                  onChange={(e) => setTempKitchenNote(e.target.value)}
                  placeholder="اكتب أي ملاحظة إضافية للتحضير..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModifierModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveModifiers}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                اعتماد وحفظ المكونات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Interactive Modal: Multi-Pay & Fast Settlement */}
      {showMultiPayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                <h3 className="text-sm font-bold">سداد الفاتورة وإغلاق الحساب</h3>
              </div>
              <button onClick={() => setShowMultiPayModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Grand Total Callout */}
              <div className="bg-slate-50 dark:bg-slate-750 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold">المبلغ المطلوب سداده</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {finalGrandTotal.toFixed(2)} {activeCurrency.symbol}
                  </div>
                </div>
                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md font-bold">
                  {invoiceNumber}
                </span>
              </div>

              {/* Cash & Card Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المدفوع نقداً (كاش)</span>
                  </label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>المدفوع شبكة (مدى/فيزا)</span>
                  </label>
                  <input
                    type="number"
                    value={visaTendered}
                    onChange={(e) => setVisaTendered(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-mono font-bold focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Cash Bills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">فئات نقدية سريعة:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(amt.toString())}
                      className="py-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded-xl text-xs font-bold font-mono transition-colors"
                    >
                      {amt} {activeCurrency.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change calculation */}
              {parseFloat(cashTendered) + parseFloat(visaTendered || '0') > finalGrandTotal && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">المبلغ المتبقي للزبون (الباقي):</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    {(parseFloat(cashTendered) + parseFloat(visaTendered || '0') - finalGrandTotal).toFixed(2)} {activeCurrency.symbol}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMultiPayModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                تأكيد الدفع وطباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Interactive Modal: Kitchen Order Ticket (KOT) */}
      {showKitchenTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-amber-500 text-white">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <h3 className="text-sm font-bold">أمر تحضير المطبخ (Kitchen Ticket - KOT)</h3>
              </div>
              <button onClick={() => setShowKitchenTicketModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 font-mono text-xs space-y-3 bg-amber-50/20">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <h4 className="font-black text-sm">أمر تحضير - المطبخ الرئيسي</h4>
                <p className="text-[11px] text-slate-500">{invoiceNumber} • {new Date().toLocaleTimeString('ar-SA')}</p>
                <p className="font-bold text-amber-700">
                  {orderType === 'dine_in' ? `طاولة: ${selectedTable?.name || 'صالة'}` : orderType === 'takeaway' ? 'طلب سفري' : 'توصيل'}
                </p>
              </div>

              <div className="space-y-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="border-b border-dashed border-slate-200 pb-1.5">
                    <div className="flex justify-between font-black text-sm">
                      <span>{item.name}</span>
                      <span>×{item.qty}</span>
                    </div>
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {item.selectedModifiers.map((m) => m.optionName).join(' + ')}
                      </p>
                    )}
                    {item.kitchenNotes && (
                      <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                        ★ ملاحظة: {item.kitchenNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKitchenTicketModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => {
                  playSuccessChime();
                  setShowKitchenTicketModal(false);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة أمر التحضير</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Quick Settings Modal (Inspired directly by user screenshots) */}
      {showQuickSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-750">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  تخصيص عرض شاشة نقطة البيع والأزرار
                </h3>
              </div>
              <button onClick={() => setShowQuickSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Product Grid Columns */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  عدد أعمدة عرض المواد والأصناف:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => setLocalLayout({ ...localLayout, productGridColumns: cols as 3 | 4 | 5 | 6 })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        localLayout.productGridColumns === cols
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cols} أعمدة
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles from screenshots */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-400 text-[11px] block">خيارات إظهار تفاصيل الأصناف على الأزرار:</span>
                
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-750 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">إظهار كود ورقم المادة على الأزرار</span>
                  <input
                    type="checkbox"
                    checked={localLayout.showProductCode ?? true}
                    onChange={(e) => setLocalLayout({ ...localLayout, showProductCode: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-750 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">إظهار سعر المادة على الأزرار</span>
                  <input
                    type="checkbox"
                    checked={localLayout.showProductPrice ?? true}
                    onChange={(e) => setLocalLayout({ ...localLayout, showProductPrice: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickSettingsModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                تطبيق الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Held Orders Modal */}
      {showHeldOrdersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-750">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  الطلبات والفواتير المعلقة ({heldOrders.length})
                </h3>
              </div>
              <button onClick={() => setShowHeldOrdersModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-96 overflow-y-auto space-y-2">
              {heldOrders.map((held) => (
                <div
                  key={held.id}
                  onClick={() => handleRestoreHeldOrder(held)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 hover:bg-amber-50/50 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">{held.invoiceNumber}</span>
                      <span className="text-[11px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-md font-bold">
                        {held.orderType === 'dine_in' ? held.tableName || 'صالة' : held.orderType === 'takeaway' ? 'سفري' : 'توصيل'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {held.items.length} أصناف • وقت التعليق: {held.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {held.total.toFixed(2)} {activeCurrency.symbol}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">استرجاع الطلب ←</span>
                  </div>
                </div>
              ))}

              {heldOrders.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
                  <p>لا توجد طلبات معلقة حالياً</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
