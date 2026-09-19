import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Phone,
  Building,
  Key,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { User, UserRole, Warehouse } from '../../types';

interface EmployeesSettingsProps {
  users: User[];
  warehouses: Warehouse[];
  currentUser: User;
  onUpdateUsers: (users: User[]) => void;
  lang: 'ar' | 'en';
}

export function EmployeesSettings({
  users,
  warehouses,
  currentUser,
  onUpdateUsers,
  lang,
}: EmployeesSettingsProps) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State for create/edit
  const [formData, setFormData] = useState<Partial<User>>({});

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    return matchesRole && matchesSearch;
  });

  const handleOpenAdd = () => {
    setIsNewUser(true);
    setFormData({
      id: `usr-${Date.now()}`,
      name: '',
      username: '',
      pin: '0000',
      role: 'cashier',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      branchOrWarehouseId: warehouses[0]?.id || 'wh-1',
      permissions: {
        canDiscount: false,
        canRefund: true,
        canViewProfits: false,
        canEditProducts: false,
        canManageUsers: false,
        canSyncERP: false,
        canCloseRegister: true,
        canVoidItem: false,
        canChangePrice: false,
        canViewReports: false,
      },
    });
    setEditingUser(null);
  };

  const handleOpenEdit = (user: User) => {
    setIsNewUser(false);
    setEditingUser(user);
    setFormData({
      ...user,
      permissions: {
        ...user.permissions,
        canVoidItem: user.permissions.canVoidItem ?? false,
        canChangePrice: user.permissions.canChangePrice ?? false,
        canViewReports: user.permissions.canViewReports ?? (user.role === 'admin' || user.role === 'branch_manager'),
      },
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.username) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم الموظف واسم المستخدم' : 'Please provide name and username');
      return;
    }

    if (isNewUser) {
      const newUser = formData as User;
      const updated = [...users, newUser];
      onUpdateUsers(updated);
    } else if (editingUser) {
      const updated = users.map((u) => (u.id === editingUser.id ? ({ ...u, ...formData } as User) : u));
      onUpdateUsers(updated);
    }

    setIsNewUser(false);
    setEditingUser(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser.id) {
      alert(lang === 'ar' ? 'لا يمكنك حذف حسابك الحالي الذي قمت بتسجيل الدخول به!' : 'Cannot delete current logged-in user');
      return;
    }
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الموظف؟' : 'Are you sure you want to delete this user?')) {
      const updated = users.filter((u) => u.id !== userId);
      onUpdateUsers(updated);
    }
  };

  const roleLabels: Record<UserRole, { ar: string; en: string; badge: string }> = {
    admin: { ar: 'مدير النظام (كامل الصلاحيات)', en: 'Administrator', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
    branch_manager: { ar: 'مدير فرع', en: 'Branch Manager', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    accountant: { ar: 'محاسب مالي', en: 'Accountant', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    cashier: { ar: 'كاشير مبيعات', en: 'Cashier', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    field_rep: { ar: 'مندوب مبيعات خارجي', en: 'Field Sales Rep', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  };

  return (
    <div className="space-y-6">
      {/* Header and Action controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'إدارة الموظفين، المستخدمين والصلاحيات الدقيقة' : 'Employees & Granular Permissions'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إضافة وتعديل بيانات الكادر الوظيفي، وتحديد أدوار الدخول، ورمز PIN، وحزمة الصلاحيات لكل مستخدم.'
              : 'Add and edit employees, configure role badges, quick PIN codes, and granular POS permissions.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee'}</span>
        </button>
      </div>

      {showSuccessToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'ar' ? 'تم حفظ بيانات الموظف بنجاح وتحديث الصلاحيات!' : 'Employee saved successfully!'}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالاسم، اسم المستخدم، أو رقم الهاتف...' : 'Search employees...'}
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'admin', 'branch_manager', 'cashier', 'accountant', 'field_rep'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedRoleFilter === role
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {role === 'all'
                ? lang === 'ar'
                  ? 'جميع الموظفين'
                  : 'All Staff'
                : roleLabels[role as UserRole]?.[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const roleInfo = roleLabels[user.role];
          const isCurrent = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                            {lang === 'ar' ? 'أنت' : 'You'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{user.username}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${roleInfo.badge}`}>
                    {roleInfo[lang]}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-750 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>PIN:</span>
                    <span className="font-mono font-bold tracking-widest">{user.pin}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Permissions summary pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {user.permissions.canDiscount && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'حسم' : 'Discount'}
                    </span>
                  )}
                  {user.permissions.canRefund && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'مرتجع' : 'Refund'}
                    </span>
                  )}
                  {user.permissions.canEditProducts && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'تعديل أصناف' : 'Products'}
                    </span>
                  )}
                  {user.permissions.canCloseRegister && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'إغلاق درج' : 'Z-Report'}
                    </span>
                  )}
                  {user.permissions.canViewReports && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'تقارير' : 'Reports'}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                </button>
                {!isCurrent && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Employee */}
      {(isNewUser || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>
                  {isNewUser
                    ? lang === 'ar'
                      ? 'إضافة موظف جديد'
                      : 'Add New Employee'
                    : lang === 'ar'
                    ? 'تعديل بيانات الموظف والصلاحيات'
                    : 'Edit Employee & Permissions'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsNewUser(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="محمد العلي"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'اسم المستخدم للدخول:' : 'Username:'}
                </label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="cashier2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'رمز الدخول السريع (PIN 4 أرقام):' : 'PIN Code (4 digits):'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pin || ''}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  placeholder="1234"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الدور الوظيفي:' : 'Role:'}
                </label>
                <select
                  value={formData.role || 'cashier'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="admin">مدير النظام (Administrator)</option>
                  <option value="branch_manager">مدير فرع (Branch Manager)</option>
                  <option value="accountant">محاسب (Accountant)</option>
                  <option value="cashier">كاشير مبيعات (Cashier)</option>
                  <option value="field_rep">مندوب مبيعات ميداني (Field Rep)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'رقم الهاتف / الجوال:' : 'Phone Number:'}
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الفرع / المستودع التابع له:' : 'Assigned Branch:'}
                </label>
                <select
                  value={formData.branchOrWarehouseId || warehouses[0]?.id}
                  onChange={(e) => setFormData({ ...formData, branchOrWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Granular Permissions Toggle List */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'ar' ? 'الصلاحيات الدقيقة لهذا الموظف:' : 'Granular Permissions:'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                {[
                  { key: 'canDiscount', label: 'صلاحية منح حسم على الفاتورة' },
                  { key: 'canRefund', label: 'صلاحية عمل مرتجعات المبيعات' },
                  { key: 'canViewProfits', label: 'رؤية أسعار التكلفة وهامش الربح' },
                  { key: 'canEditProducts', label: 'إضافة وتعديل الأصناف والأسعار' },
                  { key: 'canManageUsers', label: 'إدارة الموظفين وتعديل الصلاحيات' },
                  { key: 'canSyncERP', label: 'إجراء المزامنة مع برنامج الـ ERP' },
                  { key: 'canCloseRegister', label: 'إغلاق الصندوق وطباعة تقرير Z' },
                  { key: 'canVoidItem', label: 'إلغاء وحذف بنود من الفاتورة' },
                  { key: 'canChangePrice', label: 'تغيير سعر بيع الصنف المباشر' },
                  { key: 'canViewReports', label: 'الاطلاع على التقارير المالية والضريبية' },
                ].map(({ key, label }) => {
                  const permKey = key as keyof User['permissions'];
                  const isChecked = !!formData.permissions?.[permKey];

                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            permissions: {
                              ...(formData.permissions || {
                                canDiscount: false,
                                canRefund: false,
                                canViewProfits: false,
                                canEditProducts: false,
                                canManageUsers: false,
                                canSyncERP: false,
                                canCloseRegister: false,
                              }),
                              [permKey]: e.target.checked,
                            },
                          });
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => {
                  setIsNewUser(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ الموظف والصلاحيات' : 'Save Employee'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
