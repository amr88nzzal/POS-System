import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  RotateCcw,
  ShoppingBag,
  Layers,
  BarChart3,
  Settings,
  FileText,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Menu,
  Lock,
  Sun,
  Moon,
  Coins,
  Scale,
  Wifi,
  WifiOff,
  Database,
  Globe,
  HardDriveDownload,
  Store,
  Utensils,
} from 'lucide-react';
import { Language, User, ThemeMode, Currency } from '../types';

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
  activeCurrency?: Currency;
  onOpenCurrencyModal?: () => void;
  onOpenScaleModal?: () => void;
  isOnline?: boolean;
  onToggleOnlineMode?: () => void;
  onOpenBackupModal?: () => void;
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
  activeCurrency,
  onOpenCurrencyModal,
  onOpenScaleModal,
  isOnline = true,
  onToggleOnlineMode,
  onOpenBackupModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Keyboard shortcut (Ctrl+B to toggle sidebar)
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
  }[] = [
    {
      id: 'pos',
      labelAr: posMode === 'restaurant' ? 'فاتورة مبيعات المطاعم' : 'فاتورة مبيعات التجزئة',
      labelEn: posMode === 'restaurant' ? 'Restaurant Sales POS' : 'Retail Sales POS',
      icon: posMode === 'restaurant' ? Utensils : ShoppingCart,
      shortcut: 'F1',
      badge: posMode === 'restaurant' ? 'طاولات' : 'كاشير',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
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
      badgeColor: 'bg-blue-500/20 text-blue-400',
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
      badgeColor: 'bg-indigo-500/20 text-indigo-400',
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
      className={`h-screen shrink-0 bg-slate-900 border-x border-slate-800 text-slate-200 transition-all duration-300 shadow-2xl flex flex-col justify-between select-none z-30 sticky top-0 ${
        isExpanded ? 'w-72' : 'w-[72px]'
      }`}
    >
      {/* Top Header & Navigation Links */}
      <div className="flex flex-col min-h-0">
        {/* Brand & Collapse Button */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700 shrink-0"
            title={isExpanded ? 'طي القائمة (Ctrl+B)' : 'توسيع القائمة (Ctrl+B)'}
          >
            {isExpanded ? (
              lang === 'ar' ? <ChevronRight className="w-5 h-5 text-blue-400" /> : <ChevronLeft className="w-5 h-5 text-blue-400" />
            ) : (
              <Menu className="w-5 h-5 text-blue-400" />
            )}
          </button>

          {isExpanded && (
            <div className="flex-1 text-right overflow-hidden">
              <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                <Store className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">نظام نقاط البيع</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  v2.5 Pro
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate mt-0.5">
                <span>الفرع الرئيسي</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>نقطة بيع #01</span>
              </div>
            </div>
          )}
        </div>

        {/* Current Logged in User Bar */}
        {currentUser && (
          <div
            className={`p-2.5 border-b border-slate-800/80 bg-slate-850/60 flex items-center gap-2.5 ${
              !isExpanded && 'justify-center'
            }`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-xl object-cover border-2 border-emerald-500/80 shrink-0 shadow-sm"
              title={`${currentUser.name} (${currentUser.role})`}
            />

            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">{currentUser.role === 'admin' ? 'مدير النظام' : 'كاشير نشط'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1 overflow-y-auto flex-1 max-h-[calc(100vh-380px)] scrollbar-none">
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
                  <div className="flex-1 flex items-center justify-between min-w-0 text-right">
                    <span className="truncate">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                    <div className="flex items-center gap-1.5 shrink-0 mr-1.5">
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
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

      {/* Lower Section (القسم السفلي - عرض المعلومات المهمة) */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/80 space-y-2">
        {/* Quick Indicators Group (Currency, Scale, Online, Backup) */}
        <div className={`grid ${isExpanded ? 'grid-cols-2 gap-1.5' : 'grid-cols-1 gap-1.5'}`}>
          {/* Active Currency Button */}
          {onOpenCurrencyModal && (
            <button
              onClick={onOpenCurrencyModal}
              className={`flex items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/20 text-xs font-bold cursor-pointer transition-colors ${
                !isExpanded ? 'justify-center' : ''
              }`}
              title={lang === 'ar' ? 'العملة النشطة وأسعار الصرف' : 'Active Currency'}
            >
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              {isExpanded && (
                <div className="text-right truncate">
                  <div className="text-[10px] text-slate-400 leading-none">العملة</div>
                  <div className="text-xs font-extrabold text-amber-300 truncate">
                    {activeCurrency ? `${activeCurrency.code} (${activeCurrency.symbol})` : 'SAR (ر.س)'}
                  </div>
                </div>
              )}
            </button>
          )}

          {/* Digital Scale Button */}
          {onOpenScaleModal && (
            <button
              onClick={onOpenScaleModal}
              className={`flex items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-emerald-500/20 text-xs font-bold cursor-pointer transition-colors ${
                !isExpanded ? 'justify-center' : ''
              }`}
              title={lang === 'ar' ? 'الميزان الإلكتروني' : 'Digital Scale'}
            >
              <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
              {isExpanded && (
                <div className="text-right truncate">
                  <div className="text-[10px] text-slate-400 leading-none">الميزان</div>
                  <div className="text-xs font-extrabold text-emerald-300 truncate">إلكتروني جاهز</div>
                </div>
              )}
            </button>
          )}

          {/* Online/Offline Status Indicator */}
          {onToggleOnlineMode && (
            <button
              onClick={onToggleOnlineMode}
              className={`flex items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border text-xs font-bold cursor-pointer transition-colors ${
                isOnline
                  ? 'text-cyan-300 border-cyan-500/20'
                  : 'text-amber-400 border-amber-500/30 bg-amber-950/30'
              } ${!isExpanded ? 'justify-center' : ''}`}
              title={isOnline ? 'النظام متصل بالإنترنت' : 'يعمل بنمط بدون اتصال (Offline)'}
            >
              {isOnline ? (
                <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              {isExpanded && (
                <div className="text-right truncate">
                  <div className="text-[10px] text-slate-400 leading-none">الاتصال</div>
                  <div className="text-xs font-extrabold truncate">
                    {isOnline ? 'متصل سحابياً' : 'أوفلاين محلي'}
                  </div>
                </div>
              )}
            </button>
          )}

          {/* Cloud Database / Backup Status */}
          <button
            onClick={() => {
              if (onOpenBackupModal) {
                onOpenBackupModal();
              } else {
                onSelectTab('settings');
              }
            }}
            className={`flex items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-purple-300 border border-purple-500/20 text-xs font-bold cursor-pointer transition-colors ${
              !isExpanded ? 'justify-center' : ''
            }`}
            title="قاعدة بيانات PostgreSQL والنسخ الاحتياطي"
          >
            <Database className="w-4 h-4 text-purple-400 shrink-0" />
            {isExpanded && (
              <div className="text-right truncate">
                <div className="text-[10px] text-slate-400 leading-none">البيانات</div>
                <div className="text-xs font-extrabold text-purple-300 flex items-center gap-1 truncate">
                  <span>PostgreSQL</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* System Controls (Theme, Language, Lock Screen) */}
        <div className={`flex items-center gap-1.5 ${isExpanded ? 'justify-between' : 'flex-col'}`}>
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 flex items-center justify-center flex-1"
            title={theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
            {isExpanded && <span className="mr-1.5 text-xs font-semibold">{theme === 'dark' ? 'النهاري' : 'الليلي'}</span>}
          </button>

          {/* Language Toggle */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 flex items-center justify-center flex-1"
              title="تبديل لغة النظام (AR / EN)"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              {isExpanded && <span className="mr-1.5 text-xs font-semibold">{lang === 'ar' ? 'English' : 'عربي'}</span>}
            </button>
          )}

          {/* Lock Screen / Switch Staff Button */}
          <button
            onClick={onLockScreen}
            className={`p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-all cursor-pointer flex items-center justify-center ${
              isExpanded ? 'flex-1' : 'w-full'
            }`}
            title="قفل الشاشة والعودة لشاشة PIN"
          >
            <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            {isExpanded && <span className="mr-1.5 text-xs font-bold truncate">قفل</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
