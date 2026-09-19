import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Key,
  Lock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { User, UserRole, Language } from '../types';

interface UserManagementScreenProps {
  users: User[];
  lang: Language;
  onUpdateUsers: (users: User[]) => void;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({
  users,
  lang,
  onUpdateUsers,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('cashier');
  const [formPermissions, setFormPermissions] = useState({
    canDiscount: false,
    canRefund: true,
    canViewProfits: false,
    canEditProducts: false,
    canManageUsers: false,
    canSyncERP: false,
    canCloseRegister: true,
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPin('1234');
    setFormRole('cashier');
    setFormPermissions({
      canDiscount: false,
      canRefund: true,
      canViewProfits: false,
      canEditProducts: false,
      canManageUsers: false,
      canSyncERP: false,
      canCloseRegister: true,
    });
    setShowModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormPin(u.pin);
    setFormRole(u.role);
    setFormPermissions({ ...u.permissions });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formPin.trim()) {
      alert(lang === 'ar' ? 'الرجاء إدخال الاسم والرمز السري PIN' : 'Please provide name and PIN');
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formName,
              username: formUsername || u.username,
              pin: formPin,
              role: formRole,
              permissions: formPermissions,
            }
          : u
      );
      onUpdateUsers(updated);
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: formName,
        username: formUsername || `user_${Date.now().toString().slice(-4)}`,
        pin: formPin,
        role: formRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        permissions: formPermissions,
      };
      onUpdateUsers([...users, newUser]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (users.length <= 1) {
      alert(lang === 'ar' ? 'لا يمكن حذف المستخدم الوحيد المتبقي' : 'Cannot delete the last user');
      return;
    }
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Delete user?')) {
      onUpdateUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>{lang === 'ar' ? 'إدارة المستخدمين وصلاحيات الكاشير والموظفين' : 'Users & Permissions Control'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'تخصيص صلاحيات الخصم، المرتجعات، تقارير الأرباح، وتعيين رموز PIN السريعة للكاشير'
              : 'Granular permissions for discounts, refunds, financial profit visibility, and cashier PINs'}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة مستخدم جديد' : 'New User'}</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          return (
            <div key={u.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {u.role === 'admin' ? 'مدير النظام' :
                           u.role === 'branch_manager' ? 'مدير فرع' :
                           u.role === 'accountant' ? 'محاسب' :
                           u.role === 'field_rep' ? 'مندوب مبيعات' : 'كاشير'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PIN info */}
                <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>رمز الدخول السريع (PIN):</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider">
                    {u.pin}
                  </span>
                </div>

                {/* Permissions checklist */}
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-800 text-xs mb-1">الصلاحيات الممنوحة:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <span className={u.permissions.canDiscount ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                      {u.permissions.canDiscount ? '✓' : '✗'} منح خصومات
                    </span>
                    <span className={u.permissions.canRefund ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                      {u.permissions.canRefund ? '✓' : '✗'} إرجاع فواتير
                    </span>
                    <span className={u.permissions.canViewProfits ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                      {u.permissions.canViewProfits ? '✓' : '✗'} عرض الأرباح
                    </span>
                    <span className={u.permissions.canEditProducts ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                      {u.permissions.canEditProducts ? '✓' : '✗'} تعديل الأسعار
                    </span>
                    <span className={u.permissions.canCloseRegister ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                      {u.permissions.canCloseRegister ? '✓' : '✗'} إقفال الصندوق
                    </span>
                    <span className={u.permissions.canSyncERP ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                      {u.permissions.canSyncERP ? '✓' : '✗'} مزامنة الـ ERP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>{editingUser ? 'تعديل المستخدم والصلاحيات' : 'إضافة مستخدم جديد'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="مثال: عبد الله السعيد"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">رمز PIN السريع (4 أرقام) *</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">الدور الوظيفي:</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="cashier">كاشير نقطة بيع (Cashier)</option>
                  <option value="branch_manager">مدير فرع (Branch Manager)</option>
                  <option value="accountant">محاسب مالي (Accountant)</option>
                  <option value="field_rep">مندوب مبيعات ميداني (Field Rep)</option>
                  <option value="admin">مدير النظام بصلاحيات كاملة (System Admin)</option>
                </select>
              </div>

              {/* Granular Checkboxes */}
              <div className="pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-800 block mb-2">تخصيص الصلاحيات الدقيقة:</label>
                <div className="space-y-1.5">
                  {[
                    { key: 'canDiscount', label: 'السماح بمنح خصم إضافي للعميل في شاشة البيع' },
                    { key: 'canRefund', label: 'إرجاع الفواتير وإصدار إشعار دائن' },
                    { key: 'canViewProfits', label: 'الاطلاع على أرباح المبيعات وتكلفة البضاعة' },
                    { key: 'canEditProducts', label: 'تعديل أسعار الأصناف والمخزون' },
                    { key: 'canCloseRegister', label: 'صلاحية إقفال الصندوق اليومي (Z-Report)' },
                    { key: 'canSyncERP', label: 'تنفيذ المزامنة مع برنامج المحاسبة الخارجي' },
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formPermissions as any)[perm.key]}
                        onChange={(e) =>
                          setFormPermissions({
                            ...formPermissions,
                            [perm.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
