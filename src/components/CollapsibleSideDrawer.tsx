import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  RotateCcw,
  ShoppingBag,
  Truck,
  FileText,
  CreditCard,
  BarChart3,
  Clock,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Store,
  Layers,
  Sparkles,
  Smartphone,
  Navigation,
  Utensils,
  Moon,
  Sun,
  Database,
  Printer,
} from 'lucide-react';
import { Language, User, ThemeMode } from '../types';

export type ScreenTab =
  | 'pos'
  | 'inventory'
  | 'returns'
  | 'purchases'
  | 'accounting'
  | 'vouchers'
  | 'gps'
  | 'reports'
  | 'designer'
  | 'settings'
  | 'users'
  | 'mobile';

interface CollapsibleSideDrawerProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onLockScreen: () => void;
  lang: Language;
  onToggleLanguage?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  heldOrdersCount?: number;
  posMode?: 'retail' | 'restaurant';
}

export const CollapsibleSideDrawer: React.FC<CollapsibleSideDrawerProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLockScreen,
  lang,
  onToggleLanguage,
  theme,
  onToggleTheme,
  heldOrdersCount = 0,
  posMode = 'retail',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Keyboard shortcut (Ctrl+B or Alt+M to toggle sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuItems: {
    id: ScreenTab;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    shortcut?: string;
    adminOnly?: boolean;
  }[] = [
    {
      id: 'pos',
      labelAr: posMode === 'restaurant' ? 'فاتورة مبيعات المطاعم' : 'فاتورة مبيعات التجزئة',
      labelEn: posMode === 'restaurant' ? 'Restaurant Sales POS' : 'Retail Sales POS',
      icon: posMode === 'restaurant' ? Utensils : ShoppingCart,
      shortcut: 'F1',
      badge: posMode === 'restaurant' ? 'طاولات' : 'كاشير',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'returns',
      labelAr: 'فاتورة إرجاع (مردود مبيعات)',
      labelEn: 'Sales Return Invoice',
      icon: RotateCcw,
      shortcut: 'F2',
    },
    {
      id: 'purchases',
      labelAr: 'فاتورة مشتريات (الموردين)',
      labelEn: 'Purchase Invoice (Suppliers)',
      icon: ShoppingBag,
      shortcut: 'F3',
      badge: 'نمط التجزئة',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'vouchers',
      labelAr: 'سند دفع وقبض مالي',
      labelEn: 'Payment & Receipt Vouchers',
      icon: FileText,
      shortcut: 'F4',
    },
    {
      id: 'inventory',
      labelAr: 'المستودعات والمخزون',
      labelEn: 'Inventory & Warehouses',
      icon: Layers,
    },
    {
      id: 'reports',
      labelAr: 'التقارير والمؤشرات المالية',
      labelEn: 'Reports & Analytics',
      icon: BarChart3,
      shortcut: 'F8',
    },
    {
      id: 'settings',
      labelAr: 'إعدادات النظام الشاملة',
      labelEn: 'System Settings (Admin)',
      icon: Settings,
      shortcut: 'F10',
      badge: 'إدارة كاملة',
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'mobile',
      labelAr: 'تطبيق الإدارة والجوال',
      labelEn: 'Mobile Companion',
      icon: Smartphone,
    },
  ];

  return (
    <aside
      className={`fixed top-0 ${
        lang === 'ar' ? 'right-0' : 'left-0'
      } h-screen z-40 bg-slate-900 border-l border-slate-800 text-slate-200 transition-all duration-300 shadow-2xl flex flex-col justify-between select-none ${
        isExpanded ? 'w-72' : 'w-18'
      }`}
    >
      {/* Top Header with Brand & Collapse Toggle */}
      <div>
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
            title={isExpanded ? 'طي القائمة (Ctrl+B)' : 'توسيع القائمة (Ctrl+B)'}
          >
            {isExpanded ? (
              lang === 'ar' ? <ChevronRight className="w-5 h-5 text-blue-400" /> : <ChevronLeft className="w-5 h-5 text-blue-400" />
            ) : (
              <Menu className="w-5 h-5 text-blue-400" />
            )}
          </button>

          {isExpanded && (
            <div className="flex-1 mr-3 ml-3 text-right">
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5 truncate">
                <Store className="w-4 h-4 text-blue-400 shrink-0" />
                <span>نظام نقاط البيع</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">ERP Enterprise</div>
            </div>
          )}
        </div>

        {/* Current Logged in User Bar */}
        {currentUser && (
          <div
            className={`p-3 border-b border-slate-800/80 bg-slate-850/50 flex items-center gap-3 ${
              !isExpanded && 'justify-center'
            }`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500/80 shrink-0"
              title={`${currentUser.name} (${currentUser.role})`}
            />

            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentUser.role === 'admin' ? 'مدير النظام' : 'كاشير نشط'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 768) setIsExpanded(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                } ${!isExpanded && 'justify-center'}`}
                title={!isExpanded ? (lang === 'ar' ? item.labelAr : item.labelEn) : undefined}
              >
                <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {isExpanded && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded-sm bg-slate-800/80 text-slate-400 border border-slate-700">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tooltip on Hover when Collapsed */}
                {!isExpanded && (
                  <div className="absolute right-full mr-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs rounded-xl shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {lang === 'ar' ? item.labelAr : item.labelEn}
                    {item.shortcut && <span className="mr-1.5 text-slate-400 font-mono text-[10px]">[{item.shortcut}]</span>}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions (Theme, Language, Lock Screen) */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/90 space-y-1.5">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
            !isExpanded && 'justify-center'
          }`}
          title={theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          {isExpanded && <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>}
        </button>

        {/* Lock Screen / Switch Staff Button */}
        <button
          onClick={onLockScreen}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-all cursor-pointer ${
            !isExpanded && 'justify-center'
          }`}
          title="قفل الشاشة والعودة لتسجيل الدخول"
        >
          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
          {isExpanded && <span>قفل الشاشة / تبديل الكاشير</span>}
        </button>
      </div>
    </aside>
  );
};
