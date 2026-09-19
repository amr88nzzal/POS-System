import React, { useState } from 'react';
import {
  UserCheck,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  Calendar,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { User, Invoice, Language } from '../../types';

interface SalesRepsReportProps {
  users: User[];
  invoices: Invoice[];
  lang: Language;
}

export const SalesRepsReport: React.FC<SalesRepsReportProps> = ({
  users,
  invoices,
  lang,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedRepId, setSelectedRepId] = useState<string>('all');

  // Filter sales reps
  const salesReps = users.filter((u) => u.isSalesRep || u.role === 'field_rep');

  // Filter invoices for month
  const monthlyInvoices = invoices.filter((inv) => {
    if (!inv.date) return false;
    return inv.date.startsWith(selectedMonth);
  });

  // Calculate statistics for each representative
  const repStats = salesReps.map((rep) => {
    const repInvoices = monthlyInvoices.filter(
      (inv) => inv.salesRepId === rep.id || inv.repId === rep.id || inv.cashierId === rep.id
    );

    const totalSales = repInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const invoiceCount = repInvoices.length;
    const target = rep.monthlyTarget || 40000;
    const commissionRate = rep.commissionRate || 3.0;
    const commissionEarned = (totalSales * commissionRate) / 100;
    const percentage = target > 0 ? (totalSales / target) * 100 : 0;
    const isAchieved = percentage >= 100;
    const remaining = Math.max(0, target - totalSales);

    return {
      rep,
      repInvoices,
      totalSales,
      invoiceCount,
      target,
      commissionRate,
      commissionEarned,
      percentage: Number(percentage.toFixed(1)),
      isAchieved,
      remaining,
    };
  });

  const totalTeamSales = repStats.reduce((s, r) => s + r.totalSales, 0);
  const totalTeamTarget = repStats.reduce((s, r) => s + r.target, 0);
  const totalTeamCommission = repStats.reduce((s, r) => s + r.commissionEarned, 0);
  const teamAchievement = totalTeamTarget > 0 ? (totalTeamSales / totalTeamTarget) * 100 : 0;

  const filteredRepStats =
    selectedRepId === 'all'
      ? repStats
      : repStats.filter((r) => r.rep.id === selectedRepId);

  return (
    <div className="space-y-6">
      {/* Header with Month Filter */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'ar' ? 'تقرير أداء مناديب المبيعات والتارغت الشهري' : 'Sales Reps Performance & Monthly Targets'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'متابعة من حقق الهدف البيعي ومن تأخر، واحتساب العمولات المستحقة بناءً على الفواتير المعتمدة'
              : 'Track monthly sales target achievement, pending goals, and earned commissions per representative'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'الشهر:' : 'Month:'}</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>{lang === 'ar' ? 'إجمالي مبيعات المناديب' : 'Total Rep Sales'}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {totalTeamSales.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ar' ? `خلال شهر ${selectedMonth}` : `For month ${selectedMonth}`}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>{lang === 'ar' ? 'المستهدف الإجمالي (التارغت)' : 'Total Team Target'}</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {totalTeamTarget.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ar' ? `مجموع مستهدفات المناديب` : `Sum of monthly targets`}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>{lang === 'ar' ? 'نسبة تحقيق الفريق' : 'Team Achievement'}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
            %{teamAchievement.toFixed(1)}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                teamAchievement >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, teamAchievement)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>{lang === 'ar' ? 'إجمالي العمولات المستحقة' : 'Earned Commissions'}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            {totalTeamCommission.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ar' ? 'مجموع عمولات المبيعات' : 'Calculated commission'}
          </div>
        </div>
      </div>

      {/* Reps Achievement Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRepStats.map((item) => (
          <div
            key={item.rep.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4"
          >
            {/* Rep Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.rep.avatar}
                  alt={item.rep.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{item.rep.name}</span>
                    {item.isAchieved && (
                      <span className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400" title="محقق للتارغت">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    @{item.rep.username} • عمولة %{item.commissionRate}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {item.isAchieved ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'حقق التارغت 🎯' : 'Target Achieved'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'قيد الإنجاز' : 'In Progress'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'ar' ? 'نسبة التحقيق من التارغت:' : 'Target Progress:'}
                </span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                  %{item.percentage}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.isAchieved ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-750 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {lang === 'ar' ? 'المبيعات المحققة' : 'Achieved Sales'}
                </span>
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                  {item.totalSales.toLocaleString()} ر.س
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {lang === 'ar' ? 'التارغت الشهري' : 'Target'}
                </span>
                <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                  {item.target.toLocaleString()} ر.س
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  {lang === 'ar' ? 'العمولة المستحقة' : 'Commission'}
                </span>
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                  {item.commissionEarned.toLocaleString()} ر.س
                </span>
              </div>
            </div>

            {/* Status Note */}
            <div className="text-xs">
              {item.isAchieved ? (
                <p className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-lg">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>
                    {lang === 'ar'
                      ? `تم تجاوز التارغت بمقدار ${(item.totalSales - item.target).toLocaleString()} ر.س وبإجمالي ${item.invoiceCount} فاتورة!`
                      : `Target exceeded by ${(item.totalSales - item.target).toLocaleString()} SAR across ${item.invoiceCount} invoices!`}
                  </span>
                </p>
              ) : (
                <p className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5 bg-amber-50/50 dark:bg-amber-950/30 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    {lang === 'ar'
                      ? `متبقي لتحقيق التارغت: ${item.remaining.toLocaleString()} ر.س (${item.invoiceCount} فاتورة محررة)`
                      : `Remaining to reach target: ${item.remaining.toLocaleString()} SAR (${item.invoiceCount} invoices)`}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
