import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Delete,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  Sparkles,
  Eye,
  EyeOff,
  Store,
  HelpCircle,
} from 'lucide-react';
import { User, Language } from '../types';
import { playBarcodeBeep, playSuccessChime, playErrorBuzzer } from '../utils/storage';

interface PinLoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  lang: Language;
  onToggleLang?: () => void;
}

export const PinLoginScreen: React.FC<PinLoginScreenProps> = ({
  users,
  onLoginSuccess,
  lang,
  onToggleLang,
}) => {
  const [selectedUser, setSelectedUser] = useState<User>(users[0] || null);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showPinChars, setShowPinChars] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto focus input on mount and when user changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedUser]);

  const handleKeyPress = (num: string) => {
    playBarcodeBeep();
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);
      // Auto verify if matches length of typical PIN
      if (selectedUser && nextPin === selectedUser.pin) {
        triggerLoginSuccess(selectedUser);
      }
    }
  };

  const handleBackspace = () => {
    playBarcodeBeep();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  const triggerLoginSuccess = (userToLogin: User) => {
    playSuccessChime();
    onLoginSuccess(userToLogin);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      setErrorMsg(lang === 'ar' ? 'الرجاء اختيار الموظف أولاً' : 'Please select an employee first');
      return;
    }

    if (!pin) {
      setErrorMsg(lang === 'ar' ? 'الرجاء إدخال رمز المرور PIN' : 'Please enter your PIN');
      inputRef.current?.focus();
      return;
    }

    if (pin === selectedUser.pin) {
      triggerLoginSuccess(selectedUser);
    } else {
      playErrorBuzzer();
      setIsShaking(true);
      setErrorMsg(lang === 'ar' ? 'رمز الدخول غير صحيح، يرجى المحاولة ثانية' : 'Incorrect PIN, please try again');
      setTimeout(() => setIsShaking(false), 600);
      setPin('');
      inputRef.current?.focus();
    }
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { labelAr: 'المدير العام', labelEn: 'Admin', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300' };
      case 'branch_manager':
        return { labelAr: 'مدير فرع', labelEn: 'Branch Manager', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300' };
      case 'accountant':
        return { labelAr: 'محاسب مالي', labelEn: 'Accountant', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300' };
      case 'cashier':
        return { labelAr: 'كاشير مبيعات', labelEn: 'Cashier', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' };
      default:
        return { labelAr: 'موظف مبيعات', labelEn: 'Sales Rep', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300' };
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with System Name, Live Clock & Status */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>نظام نقاط البيع السحابي</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Cloud ERP POS
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'بوابة تسجيل دخول الموظفين والكاشير' : 'Staff & Cashier PIN Terminal Access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="font-mono font-bold text-sm text-white">
              {currentTime.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-slate-400 text-[11px] border-r border-slate-700 pr-2 mr-1">
              {currentTime.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* System Online Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[11px]">جاهز ومتصل</span>
          </div>

          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 font-bold transition-colors cursor-pointer text-xs"
            >
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
          )}
        </div>
      </header>

      {/* Main Login Workspace: Split into Staff Selector & Numeric PIN Keypad */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* Left Side: Authorized Staff / Employees Grid (5 Cols) */}
        <div className="lg:col-span-6 bg-slate-850/90 border border-slate-750 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-750">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'اختر الموظف أو الكاشير المصرح له' : 'Select Authorized Staff Member'}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {users.length} {lang === 'ar' ? 'موظفين متاحين' : 'available'}
              </span>
            </div>

            {/* Employee Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {users.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const roleInfo = getRoleBadge(u.role);

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setPin('');
                      setErrorMsg(null);
                      inputRef.current?.focus();
                    }}
                    className={`p-3 rounded-2xl text-right transition-all flex items-center gap-3 border cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/40'
                        : 'bg-slate-800/70 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className={`w-12 h-12 rounded-xl object-cover border-2 transition-transform group-hover:scale-105 ${
                          isSelected ? 'border-blue-400' : 'border-slate-600'
                        }`}
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {u.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${roleInfo.color}`}>
                          {lang === 'ar' ? roleInfo.labelAr : roleInfo.labelEn}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        @{u.username}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Hint for Testing */}
          <div className="mt-4 pt-3 border-t border-slate-750 text-xs text-slate-400 flex items-center justify-between bg-slate-900/60 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] leading-tight">
                {lang === 'ar'
                  ? 'رموز الدخول التجريبية: المدير (1234) - كاشير سارة (1111) - محاسب عمر (2222)'
                  : 'Demo PINs: Admin (1234) - Cashier (1111) - Accountant (2222)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Numeric Keypad & PIN Input (7 Cols) */}
        <div className="lg:col-span-6 bg-slate-850/90 border border-slate-750 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            {/* Header with Selected Employee Info */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-750">
              {selectedUser ? (
                <>
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                  />
                  <div>
                    <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block">
                      {lang === 'ar' ? 'الموظف المختار للتسجيل' : 'Selected User'}
                    </span>
                    <h2 className="text-base font-extrabold text-white">{selectedUser.name}</h2>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {selectedUser.username} • {selectedUser.role}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-xs">
                  {lang === 'ar' ? 'الرجاء النقر على موظف من القائمة' : 'Please select an employee'}
                </div>
              )}
            </div>

            {/* PIN Input Field with Auto-Focus and Masking */}
            <form onSubmit={handleSubmit} className="mb-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {lang === 'ar' ? 'أدخل كلمة المرور أو كود PIN أو امسح الباركود' : 'Enter PIN / Password / Scan Badge'}
              </label>
              
              <div
                className={`relative flex items-center rounded-2xl bg-slate-900 border transition-all ${
                  isShaking ? 'animate-shake border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30'
                }`}
              >
                <div className="pl-4 pr-3 text-slate-400">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                </div>

                <input
                  ref={inputRef}
                  type={showPinChars ? 'text' : 'password'}
                  inputMode="numeric"
                  autoFocus
                  placeholder={lang === 'ar' ? '•••• أدخل الرمز هنا' : '•••• Enter PIN code'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg(null);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full py-3.5 bg-transparent text-center font-mono text-xl sm:text-2xl tracking-widest font-extrabold text-white placeholder:text-slate-600 focus:outline-hidden"
                />

                <div className="flex items-center gap-1 pr-3 pl-2">
                  <button
                    type="button"
                    onClick={() => setShowPinChars(!showPinChars)}
                    className="p-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPinChars ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showPinChars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {pin.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="مسح الكل"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message alert */}
              {errorMsg && (
                <div className="mt-2.5 px-3 py-2 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>

            {/* Numeric Keypad Grid (3x4 Layout) */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-700/80 rounded-2xl text-xl font-mono font-extrabold text-white transition-all shadow-sm flex items-center justify-center cursor-pointer hover:border-slate-500 hover:scale-[1.02] active:scale-95"
                >
                  {digit}
                </button>
              ))}

              {/* Clear Button */}
              <button
                type="button"
                onClick={handleClear}
                className="h-14 bg-slate-800/80 hover:bg-rose-950/40 hover:border-rose-700 hover:text-rose-300 border border-slate-700/80 rounded-2xl text-xs font-bold text-slate-400 transition-all flex items-center justify-center cursor-pointer"
              >
                {lang === 'ar' ? 'مسح C' : 'Clear'}
              </button>

              {/* 0 Button */}
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-700/80 rounded-2xl text-xl font-mono font-extrabold text-white transition-all shadow-sm flex items-center justify-center cursor-pointer hover:border-slate-500 hover:scale-[1.02] active:scale-95"
              >
                0
              </button>

              {/* Backspace Button */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-2xl text-slate-300 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                title="حذف آخر رقم"
              >
                <Delete className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Large Enter / Login Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-98"
            >
              <LogIn className="w-5 h-5" />
              <span>{lang === 'ar' ? 'تسجيل الدخول وفتح نقطة البيع' : 'Authorize & Open POS Screen'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer System Credits */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/60 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          نظام الكاشير الموحد v4.2 • متوافق مع هيئة الزكاة والضريبة والجمارك ZATCA المرحلة الثانية
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>تشفير محلي وسحابي آمن 100%</span>
        </div>
      </footer>
    </div>
  );
};
