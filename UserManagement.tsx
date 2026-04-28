/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Users, Shield, ShieldAlert, Utensils, Briefcase, Plus, FileUp, CreditCard, ScanLine, X, Image as ImageIcon, Key, PiggyBank, Edit3, Search } from 'lucide-react';
import { UserProfile, UserRole, UserPermission } from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';

interface UserManagementProps {
  users: UserProfile[];
  isAdmin?: boolean;
  canPairCards?: boolean;
  canUploadImages?: boolean;
  canManageUsers?: boolean;
  onUpdateRoles: (userId: string, newRoles: UserRole[]) => void;
  onUpdatePermissions: (userId: string, newPermissions: UserPermission[]) => void;
  onUpdateEmail: (userId: string, newEmail: string) => void;
  onUpdateUser?: (userId: string, updates: Partial<UserProfile>) => void;
  onImportUsers: (users: UserProfile[]) => void;
  onPairCard: (userId: string, cardId: string) => void;
}

export default function UserManagement({ 
  users, 
  isAdmin: isGlobalAdmin, 
  canPairCards, 
  canUploadImages, 
  canManageUsers,
  onUpdateRoles, 
  onUpdatePermissions, 
  onUpdateEmail,
  onUpdateUser,
  onImportUsers, 
  onPairCard 
}: UserManagementProps) {
  const [pairingUser, setPairingUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempCardId, setTempCardId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [selectedUserForAvatar, setSelectedUserForAvatar] = useState<UserProfile | null>(null);

  const roleConfig: Record<UserRole, { label: string, icon: any, color: string }> = {
    admin: { label: 'Admin', icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-100' },
    hr: { label: 'İK', icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    kitchen: { label: 'Mutfak', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-100' },
    employee: { label: 'Personel', icon: Users, color: 'text-slate-600 bg-slate-50 border-slate-100' },
  };

  const permConfig: Record<UserPermission, { label: string, icon: any, color: string }> = {
    pair_card: { label: 'Kart Tanıtma', icon: Key, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    upload_image: { label: 'Resim Yükleme', icon: ImageIcon, color: 'text-pink-600 bg-pink-50 border-pink-100' },
    manage_credits: { label: 'Kredi Yönetimi', icon: PiggyBank, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    edit_menu: { label: 'Menü Yönetimi', icon: Edit3, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    manage_users: { label: 'Personel Yönetimi', icon: Shield, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  };

  const handleUpdateField = (userId: string, field: keyof UserProfile, value: any) => {
    onUpdateUser?.(userId, { [field]: value });
  };

  const handleSaveUser = () => {
    if (editingUser && onUpdateUser) {
      onUpdateUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  const toggleRoleForEditing = (role: UserRole) => {
    if (!editingUser) return;
    let newRoles: UserRole[];
    if (editingUser.roles.includes(role)) {
      newRoles = editingUser.roles.filter(r => r !== role);
    } else {
      newRoles = [...editingUser.roles, role];
    }
    if (newRoles.length === 0) newRoles = ['employee'];
    setEditingUser({ ...editingUser, roles: newRoles });
  };

  const togglePermissionForEditing = (perm: UserPermission) => {
    if (!editingUser) return;
    const currentPerms = editingUser.permissions || [];
    let newPerms: UserPermission[];
    if (currentPerms.includes(perm)) {
      newPerms = currentPerms.filter(p => p !== perm);
    } else {
      newPerms = [...currentPerms, perm];
    }
    setEditingUser({ ...editingUser, permissions: newPerms });
  };

  const toggleRole = (user: UserProfile, role: UserRole) => {
    if (!isGlobalAdmin && !canManageUsers) return;
    let newRoles: UserRole[];
    if (user.roles.includes(role)) {
      newRoles = user.roles.filter(r => r !== role);
    } else {
      newRoles = [...user.roles, role];
    }
    if (newRoles.length === 0) newRoles = ['employee'];
    onUpdateRoles(user.id, newRoles);
  };

  const togglePermission = (user: UserProfile, perm: UserPermission) => {
    if (!isGlobalAdmin && !canManageUsers) return;
    const currentPerms = user.permissions || [];
    let newPerms: UserPermission[];
    if (currentPerms.includes(perm)) {
      newPerms = currentPerms.filter(p => p !== perm);
    } else {
      newPerms = [...currentPerms, perm];
    }
    onUpdatePermissions(user.id, newPerms);
  };

  const handleAvatarClick = (user: UserProfile) => {
    if (!canUploadImages && !isGlobalAdmin) return;
    setSelectedUserForAvatar(user);
    avatarInputRef.current?.click();
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserForAvatar) return;

    // In a real app, upload to server. Here we use FileReader for local preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      // We'll abuse onImportUsers or similar to update the user in the list
      // But actually we should have an onUpdateUser prop.
      // For now, let's just use onImportUsers with the single updated user
      const updatedUser = { ...selectedUserForAvatar, avatarUrl: url };
      onImportUsers([updatedUser]);
      setSelectedUserForAvatar(null);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const imported = data.map((row: any) => ({
        id: String(row.id || row.ID || `ID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`),
        name: String(row.name || row.Name || row.AdSoyad || 'İsimsiz Kullanıcı'),
        email: String(row.email || row.Email || ''),
        roles: (String(row.roles || row.Roles || 'employee').split(',') as UserRole[]),
        credits: Number(row.credits || row.Credits || 0),
        avatarUrl: String(row.avatarUrl || row.Avatar || `https://ui-avatars.com/api/?name=${row.name || 'User'}&background=random`)
      }));

      onImportUsers(imported);
      alert(`${imported.length} kullanıcı başarıyla yüklendi.`);
    };
    reader.readAsBinaryString(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pairingUser && tempCardId) {
      onPairCard(pairingUser.id, tempCardId);
      setPairingUser(null);
      setTempCardId('');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.cardId && user.cardId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kullanıcı & Yetki Yönetimi</h2>
          <p className="text-slate-500 font-medium">Sistemdeki tüm kullanıcıların yetki seviyelerini belirleyin (Birden fazla seçilebilir)</p>
        </div>
        <div className="flex items-center gap-3 flex-1 md:flex-none">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Personel ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileUpload}
            accept="image/*"
            className="hidden"
          />
          {(isGlobalAdmin || canManageUsers) && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <FileUp size={18} />
                Excel/CSV Yükle
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-blue-700 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                <Plus size={18} />
                Yeni Kullanıcı
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kullanıcı</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-posta</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kart ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yetkiler</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Özel İzinler</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                    "{searchQuery}" aramasına uygun sonuç bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => handleAvatarClick(user)}
                        className={cn(
                          "w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 bg-slate-100 relative group/avatar",
                          (canUploadImages || isGlobalAdmin) && "cursor-pointer hover:border-blue-400"
                        )}
                      >
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        {(canUploadImages || isGlobalAdmin) && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => onUpdateUser?.(user.id, { name: e.target.value })}
                          disabled={!isGlobalAdmin && !canManageUsers}
                          className="font-bold text-slate-900 leading-none bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-all w-full"
                        />
                        <p className="text-[10px] font-mono text-slate-400 font-bold tracking-wider mt-1 uppercase">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <input
                      type="email"
                      value={user.email || ''}
                      onChange={(e) => onUpdateEmail(user.id, e.target.value)}
                      placeholder="E-posta giriniz"
                      className="text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-all w-full"
                    />
                  </td>
                  <td className="px-8 py-5">
                    {user.cardId ? (
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 w-fit">
                        <CreditCard size={12} />
                        {user.cardId}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">Tanımsız</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                        const config = roleConfig[role];
                        const Icon = config.icon;
                        const isSelected = user.roles.includes(role);
                        
                        return (
                          <button
                            key={role}
                            disabled={!isGlobalAdmin && !canManageUsers}
                            onClick={() => toggleRole(user, role)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all",
                              isSelected 
                                ? config.color 
                                : "text-slate-400 bg-white border-slate-100 hover:border-slate-300",
                              (!isGlobalAdmin && !canManageUsers) && "cursor-default border-transparent"
                            )}
                          >
                            <Icon size={10} />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(permConfig) as UserPermission[]).map((perm) => {
                        const config = permConfig[perm];
                        const Icon = config.icon;
                        const isSelected = user.permissions?.includes(perm);
                        
                        return (
                          <button
                            key={perm}
                            disabled={!isGlobalAdmin && !canManageUsers}
                            onClick={() => togglePermission(user, perm)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all",
                              isSelected 
                                ? config.color 
                                : "text-slate-400 bg-white border-slate-100 hover:border-slate-300",
                              (!isGlobalAdmin && !canManageUsers) && "cursor-default border-transparent"
                            )}
                          >
                            <Icon size={10} />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Düzenle"
                      >
                        <Edit3 size={16} />
                      </button>
                      {(canPairCards || isGlobalAdmin || canManageUsers) && (
                        <button 
                          onClick={() => setPairingUser(user)}
                          className="p-2 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Kartı Tanıt"
                        >
                          <ScanLine size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personel Bilgilerini Düzenle</h3>
                    <p className="text-sm font-medium text-slate-400">Sistem ayarlarını ve iletişim bilgilerini güncelleyin</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AD SOYAD</label>
                      <input 
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="İsim Soyisim"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-POSTA</label>
                      <input 
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="test@sirket.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TELEFON</label>
                      <input 
                        type="tel"
                        value={editingUser.phone || ''}
                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                  </div>

                  {/* Right Column: Roles & Card */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ROLLER</label>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                          const config = roleConfig[role];
                          const Icon = config.icon;
                          const isSelected = editingUser.roles.includes(role);
                          return (
                            <button
                              key={role}
                              onClick={() => toggleRoleForEditing(role)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                isSelected 
                                  ? config.color + " border-current" 
                                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                              )}
                            >
                              <Icon size={14} />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KART DURUMU</label>
                      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                        {editingUser.cardId ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className="text-blue-600" size={24} />
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase">Aktif Kart</p>
                                <p className="text-lg font-black text-blue-600 font-mono tracking-wider">{editingUser.cardId}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setPairingUser(editingUser);
                                setEditingUser(null);
                              }}
                              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                              Kartı Değiştir
                            </button>
                          </div>
                        ) : (
                          <div className="text-center space-y-3 py-2">
                            <p className="text-xs font-bold text-slate-400 italic">Henüz bir kart tanımlanmamış</p>
                            <button 
                              onClick={() => {
                                setPairingUser(editingUser);
                                setEditingUser(null);
                              }}
                              className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                              Kart Tanıt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ÖZEL YETKİLER</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(permConfig) as UserPermission[]).map((perm) => {
                      const config = permConfig[perm];
                      const Icon = config.icon;
                      const isSelected = editingUser.permissions?.includes(perm);
                      return (
                        <button
                          key={perm}
                          onClick={() => togglePermissionForEditing(perm)}
                          className={cn(
                            "flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all text-left",
                            isSelected 
                              ? config.color + " border-current" 
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          <div className={cn("p-2 rounded-xl", isSelected ? "bg-white/20" : "bg-slate-50")}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">{config.label}</p>
                          </div>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleSaveUser}
                  className="px-10 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Pairing Modal */}
      <AnimatePresence>
        {pairingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setPairingUser(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-200 animate-pulse">
                  <ScanLine size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Kart Tanımlama</h3>
                  <p className="text-sm text-slate-500 font-medium">Lütfen <span className="text-blue-600 font-bold">{pairingUser.name}</span> için kartı okutun veya ID girin.</p>
                </div>
              </div>

              <form onSubmit={handlePairSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">KART ID (RFID/BARKOD)</label>
                  <input
                    type="text"
                    autoFocus
                    value={tempCardId}
                    onChange={(e) => setTempCardId(e.target.value)}
                    placeholder="Kart ID okutun..."
                    className="input text-center text-xl font-bold py-5 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setPairingUser(null)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Kapat
                  </button>
                  <button 
                    type="submit"
                    disabled={!tempCardId}
                    className="flex-[2] btn-primary py-3 text-xs font-bold uppercase tracking-widest"
                  >
                    Tanımlamayı Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
