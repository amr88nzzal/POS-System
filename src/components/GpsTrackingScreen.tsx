import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  Battery,
  Phone,
  Clock,
  TrendingUp,
  CheckCircle2,
  Compass,
  Radio,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { FieldRep, Customer, Language } from '../types';

interface GpsTrackingScreenProps {
  reps: FieldRep[];
  customers: Customer[];
  lang: Language;
  onUpdateReps: (reps: FieldRep[]) => void;
}

export const GpsTrackingScreen: React.FC<GpsTrackingScreenProps> = ({
  reps,
  customers,
  lang,
  onUpdateReps,
}) => {
  const [selectedRep, setSelectedRep] = useState<FieldRep>(reps[0]);
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [userGpsLocation, setUserGpsLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live movement simulation
  useEffect(() => {
    if (!isLiveTracking) return;
    const interval = setInterval(() => {
      onUpdateReps(
        reps.map((rep) => {
          if (rep.status !== 'active') return rep;
          // Jiggle coordinate slightly along route
          const deltaLat = (Math.random() - 0.48) * 0.001;
          const deltaLng = (Math.random() - 0.48) * 0.001;
          return {
            ...rep,
            currentLocation: {
              ...rep.currentLocation,
              lat: rep.currentLocation.lat + deltaLat,
              lng: rep.currentLocation.lng + deltaLng,
              speed: Math.max(15, Math.min(75, Math.floor(rep.currentLocation.speed + (Math.random() * 6 - 3)))),
              lastUpdate: 'الآن (مباشر)',
            },
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveTracking, reps, onUpdateReps]);

  // Request actual device GPS via browser
  const handleCaptureDeviceGps = () => {
    if (!navigator.geolocation) {
      setGpsError(lang === 'ar' ? 'ميزة GPS غير مدعومة في متصفحك' : 'Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsError(null);

        // Update active rep with current device coordinates
        if (selectedRep) {
          const updated = reps.map((r) =>
            r.id === selectedRep.id
              ? {
                  ...r,
                  currentLocation: {
                    ...r.currentLocation,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    address: `إحداثيات جهازك الحالية (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
                    lastUpdate: 'الآن من حساس الجهاز',
                  },
                }
              : r
          );
          onUpdateReps(updated);
        }
      },
      (err) => {
        setGpsError(lang === 'ar' ? 'تعذر جلب موقع GPS، يرجى السماح بالصلاحية' : err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'تتبع مسارات المندوبين بالـ GPS في الوقت الفعلي' : 'Real-Time Sales Reps GPS Tracking'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'مراقبة حركة سيارات التوزيع، خطوط السير اليومية، ونقاط زيارة العملاء ومبيعات الميدان'
              : 'Live tracking of field vans, route waypoints, customer visit geo-fencing and field orders'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCaptureDeviceGps}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
            title="استخدام موقع هذا الجهاز الفعلي لتحديث إحداثيات المندوب"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'ar' ? 'تحديد موقع جهازي (GPS الحقيقي)' : 'Use Device GPS'}</span>
          </button>

          <button
            onClick={() => setIsLiveTracking(!isLiveTracking)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isLiveTracking
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLiveTracking ? 'animate-pulse text-emerald-600' : ''}`} />
            <span>{isLiveTracking ? 'البث المباشر نشط' : 'البث متوقف مؤقتاً'}</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
          تنبيه GPS: {gpsError}
        </div>
      )}

      {/* Main Grid: Reps list + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Right Reps Directory */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>قائمة مندوبي المبيعات والتوزيع:</span>
            <span className="text-blue-600">{reps.length} مندوب</span>
          </div>

          {reps.map((rep) => {
            const isSelected = selectedRep.id === rep.id;
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedRep(rep)}
                className={`p-3.5 bg-white rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img src={rep.avatar} alt={rep.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rep.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{rep.phone}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      rep.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'break'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rep.status === 'active' ? 'في المسار' : rep.status === 'break' ? 'استراحة' : 'أوفلاين'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mb-2">
                  <div className="font-semibold text-slate-800 truncate">{rep.activeRoute}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{rep.currentLocation.address}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <div className="flex items-center gap-1 font-mono">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{rep.currentLocation.speed} كم/س</span>
                  </div>
                  <div className="font-mono font-bold text-slate-800">
                    مبيعات اليوم: {rep.todaySales.toFixed(0)} ر.س
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <Battery className="w-3 h-3 text-emerald-600" />
                    <span>{rep.batteryLevel}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center / Right: Interactive Map Canvas Simulation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>خريطة المسار المباشر: {selectedRep.name}</span>
              </h3>
              <div className="text-[11px] text-slate-500 mt-0.5">
                إحداثيات حية: Lat: {selectedRep.currentLocation.lat.toFixed(5)} , Lng: {selectedRep.currentLocation.lng.toFixed(5)} | التحديث: {selectedRep.currentLocation.lastUpdate}
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold font-mono">
              {selectedRep.todayOrdersCount} فواتير ميدانية اليوم
            </span>
          </div>

          {/* Map Surface (Sleek Stylized City Grid SVG representation) */}
          <div className="relative w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            {/* Grid streets simulation */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="street-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#475569" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#street-grid)" />
              {/* Arterial Highways */}
              <line x1="0" y1="120" x2="100%" y2="120" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 4" opacity="0.6" />
              <line x1="0" y1="280" x2="100%" y2="280" stroke="#3b82f6" strokeWidth="3" opacity="0.6" />
              <line x1="200" y1="0" x2="200" y2="100%" stroke="#e2e8f0" strokeWidth="3" opacity="0.4" />
              <line x1="500" y1="0" x2="500" y2="100%" stroke="#e2e8f0" strokeWidth="3" opacity="0.4" />

              {/* Waypoints line for the selected rep */}
              <path
                d="M 120 180 Q 240 140 340 220 T 520 270"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Simulated Customer Stop Markers */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-500/20 text-xs font-bold">
                1
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-slate-700 shadow-md">
                مؤسسة أفق التقنية (تمت الزيارة)
              </div>
            </div>

            <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10">
              <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 text-xs font-bold">
                2
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-slate-700 shadow-md">
                سوبرماركت البركة (المحطة القادمة)
              </div>
            </div>

            {/* Active Rep Van Pin (Moving / Pulsing) */}
            <div className="absolute top-1/2 left-3/5 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-blue-500/40 animate-ping"></span>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-2 bg-white text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{selectedRep.name} ({selectedRep.currentLocation.speed} كم/س)</span>
              </div>
            </div>

            {/* Map Controls Overlay */}
            <div className="absolute bottom-3 end-3 bg-slate-800/90 backdrop-blur-xs text-white p-2.5 rounded-xl border border-slate-700 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>محطة عميل تمت زيارتها</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>محطة قيد التنفيذ</span>
              </div>
            </div>
          </div>

          {/* Quick Route Summary Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px]">المسافة المقطوعة اليوم</span>
              <span className="font-bold text-slate-900 font-mono">48.2 كم</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px]">عدد الزيارات المجدولة</span>
              <span className="font-bold text-slate-900 font-mono">8 عملاء</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px]">الزيارات المنجزة</span>
              <span className="font-bold text-emerald-600 font-mono">6 زيارات (75%)</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px]">إجمالي فواتير المندوب</span>
              <span className="font-bold text-blue-600 font-mono">{selectedRep.todaySales.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
