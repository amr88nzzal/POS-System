import { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  User as UserIcon,
  ShieldCheck,
  Smartphone,
  Maximize2,
  Minimize2,
  Lock,
  Database,
  Truck,
  CheckCircle2,
  Sun,
  Moon,
  Coins,
  Scale,
} from 'lucide-react';
import { Language, User, SyncStats, ThemeMode, Currency } from '../types';
import { translations } from '../utils/translations';
import { INITIAL_USERS } from '../data/initialData';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  syncStats: SyncStats;
  onTriggerSync: () => void;
  isOnline: boolean;
  onToggleOnlineMode: () => void;
  onOpenMobileCompanion: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  activeCurrency?: Currency;
  onOpenCurrencyModal?: () => void;
  onOpenScaleModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  currentUser,
  onSwitchUser,
  syncStats,
  onTriggerSync,
  isOnline,
  onToggleOnlineMode,
  onOpenMobileCompanion,
  theme = 'light',
  onToggleTheme,
  activeCurrency,
  onOpenCurrencyModal,
  onOpenScaleModal,
}) => {
  const t = translations[lang];
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handlePinSubmit = () => {
    if (targetUser && targetUser.pin === selectedPin) {
      onSwitchUser(targetUser);
      setShowUserModal(false);
      setSelectedPin('');
      setTargetUser(null);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: lang === 'ar' ? 'مدير النظام' : 'Admin', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'branch_manager':
        return { label: lang === 'ar' ? 'مدير فرع' : 'Branch Mgr', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'accountant':
        return { label: lang === 'ar' ? 'محاسب' : 'Accountant', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'field_rep':
        return { label: lang === 'ar' ? 'مندوب مبيعات' : 'Field Rep', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: lang === 'ar' ? 'كاشير' : 'Cashier', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      {/* Brand & Store Name */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight tracking-tight">
              {t.appName}
            </h1>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              v2.5 Pro
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>الفرع الرئيسي (الرياض)</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span>نقطة بيع رقم #01</span>
          </p>
        </div>
      </div>

      {/* Connectivity, Currencies, Scale, Theme & ERP Status */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Currency Switcher */}
        {activeCurrency && onOpenCurrencyModal && (
          <button
            onClick={onOpenCurrencyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'تغيير العملة النشطة وأسعار الصرف' : 'Change active currency and rates'}
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-mono">{activeCurrency.code}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">({activeCurrency.symbolAr})</span>
          </button>
        )}

        {/* Digital Scale Quick Workstation */}
        {onOpenScaleModal && (
          <button
            onClick={onOpenScaleModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'فتح محطة الميزان الرقمي وقراءة الوزن' : 'Open Digital Scale Station'}
          >
            <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">{lang === 'ar' ? 'الميزان الرقمي' : 'Digital Scale'}</span>
          </button>
        )}

        {/* Offline / Online Status */}
        <button
          onClick={onToggleOnlineMode}
          title={lang === 'ar' ? 'انقر للتبديل بين وضع العمل المتصل والأوفلاين للاختبار' : 'Click to toggle simulated offline/online'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 animate-pulse'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-700" />}
          <span className="hidden xl:inline">{isOnline ? t.online : t.offline}</span>
        </button>

        {/* Sync Trigger Button with pending badge */}
        <button
          onClick={onTriggerSync}
          disabled={syncStats.status === 'syncing' || !isOnline}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            syncStats.status === 'syncing'
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
          title={lang === 'ar' ? 'مزامنة فورية مع برنامج المحاسبة والمستودعات' : 'Sync now with ERP'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStats.status === 'syncing' ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden lg:inline">{syncStats.status === 'syncing' ? t.syncing : (lang === 'ar' ? 'مزامنة الـ ERP' : 'Sync ERP')}</span>
          {syncStats.pendingSyncCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
              {syncStats.pendingSyncCount}
            </span>
          )}
        </button>

        {/* Dark / Light Mode Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={theme === 'dark' ? (lang === 'ar' ? 'تفعيل الوضع النهاري' : 'Switch to Light Mode') : (lang === 'ar' ? 'تفعيل الوضع الليلي' : 'Switch to Dark Mode')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}

        {/* Mobile Companion / Remote Tracking */}
        <button
          onClick={onOpenMobileCompanion}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
          title={lang === 'ar' ? 'عرض تطبيق الجوال للمالك ومتابعة التقارير عن بعد' : 'Open Remote Mobile App'}
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden xl:inline">{t.mobileApp}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => onLanguageChange(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          title="تغيير اللغة / Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span className="font-bold">{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hidden sm:block"
          title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Active User Switcher */}
        <div className="border-r border-slate-200 dark:border-slate-700 h-6 mx-1 hidden sm:block" />

        <button
          onClick={() => {
            setShowUserModal(true);
            setTargetUser(null);
            setSelectedPin('');
            setPinError(false);
          }}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          title={lang === 'ar' ? 'تبديل المستخدم أو تسجيل الخروج' : 'Switch user'}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-600"
          />
          <div className="text-start hidden xl:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{currentUser.name}</div>
            <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded-sm border font-semibold ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <Lock className="w-3.5 h-3.5 text-slate-400 ms-1" />
        </button>
      </div>

      {/* User Switch Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  {lang === 'ar' ? 'تبديل المستخدم والصلاحيات' : 'Switch User & Permissions'}
                </h3>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 mb-2 block">
                {lang === 'ar' ? 'اختر الحساب المستهدف:' : 'Select Target User:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INITIAL_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setTargetUser(u);
                      setSelectedPin('');
                      setPinError(false);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-start transition-all ${
                      targetUser?.id === u.id
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {targetUser && (
              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    {lang === 'ar' ? `أدخل رمز PIN للمستخدم (${targetUser.name}):` : `Enter PIN for (${targetUser.name}):`}
                  </span>
                  <span className="text-[11px] text-blue-600 font-mono">
                    (PIN التجريبي: {targetUser.pin})
                  </span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={selectedPin}
                  onChange={(e) => {
                    setSelectedPin(e.target.value);
                    setPinError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                  placeholder="••••"
                  className="w-full text-center tracking-widest text-2xl font-mono py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 text-center">
                    {lang === 'ar' ? 'رمز PIN غير صحيح، حاول ثانية' : 'Incorrect PIN, please try again'}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handlePinSubmit}
                    disabled={selectedPin.length < 4}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm disabled:opacity-50 transition-colors"
                  >
                    {lang === 'ar' ? 'تأكيد الدخول' : 'Confirm Login'}
                  </button>
                  <button
                    onClick={() => setTargetUser(null)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
