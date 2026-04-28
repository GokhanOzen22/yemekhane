/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Settings, 
  Users, 
  Utensils, 
  History, 
  User as UserIcon,
  ShoppingBag,
  ChevronRight,
  CreditCard,
  Wallet,
  BarChart3,
  Shield,
  Server
} from 'lucide-react';
import { format } from 'date-fns';

import DailyMenuView from './components/DailyMenuView';
import AdminMenuEditor from './components/AdminMenuEditor';
import AttendanceList from './components/AttendanceList';
import CardScanTerminal from './components/CardScanTerminal';
import EmployeeDashboard from './components/EmployeeDashboard';
import CreditManagement from './components/CreditManagement';
import ReportsDashboard from './components/ReportsDashboard';
import UserManagement from './components/UserManagement';
import KitchenPOS from './components/KitchenPOS';
import EmailTemplateSettings from './components/EmailTemplateSettings';
import MailServiceSettings from './components/MailServiceSettings';
import { cn } from './lib/utils';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
import { MOCK_USERS } from './mockData/data';

export default function App() {
  const { 
    user, 
    isAdmin, 
    isHR, 
    isKitchen,
    canPairCard,
    canUploadImage,
    canManageCredits,
    canEditMenu,
    canManageUsers,
    loginAs 
  } = useAuth();

  const {
    users,
    menus,
    records,
    creditRequests,
    loading,
    handleSaveMenu,
    handleUpdateRoles,
    handleUpdatePermissions,
    handleProcessCreditRequest,
    handleCreateCreditRequest,
    handleScanRecord,
    handlePairCard,
    handleImportUsers,
    handleMealTransaction,
    handleAddCredits,
    handleUpdateEmail,
    handleUpdateUserInfo
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'menu' | 'admin_menu' | 'attendance' | 'terminal' | 'dashboard' | 'credit_mgmt' | 'reports' | 'user_mgmt' | 'kitchen_pos' | 'email_settings' | 'mail_service'>('menu');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hasEatenToday, setHasEatenToday] = useState(false);

  useEffect(() => {
    if (user?.roles.includes('kitchen')) setActiveTab('admin_menu');
    else if (user?.roles.includes('hr')) setActiveTab('credit_mgmt');
    else setActiveTab('menu');
  }, [user]);

  useEffect(() => {
    if (user && records) {
      const today = format(new Date(), 'yyyy-MM-dd');
      setHasEatenToday(records.some(r => r.userId === user.id && r.date === today));
    }
  }, [user, records]);

  const currentMenu = menus.find(m => m.date === format(selectedDate, 'yyyy-MM-dd')) || null;

  const handleScanAndRecord = async (scannedId: string) => {
    const foundUser = users.find(u => u.id === scannedId || u.cardId === scannedId);
    if (!foundUser) return { success: false, message: 'Geçersiz Kart / Kullanıcı Bulunamadı' };

    const today = format(new Date(), 'yyyy-MM-dd');
    const alreadyEaten = records.some(r => r.userId === foundUser.id && r.date === today);
    if (alreadyEaten) return { success: false, message: 'Bu personel bugün zaten yemek aldı' };

    await handleScanRecord(foundUser.id, foundUser.name);
    return { success: true, user: foundUser };
  };

  const handleConfirmAttendance = async () => {
    if (!user) return;
    const result = await handleScanAndRecord(user.id);
    if (result.success) setHasEatenToday(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Sistem Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Catering<span className="text-blue-600">Plus</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Yemekhane Canlı Takip</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-100">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.roles.includes('admin') ? 'Yönetici' : 'Sistem Kullanıcısı'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold">
                {user?.name.charAt(0)}
              </div>
            </div>
            <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors font-bold text-xs uppercase tracking-widest">
              Çıkış
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto px-6 py-8 w-full pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('menu')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  activeTab === 'menu' 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <ShoppingBag size={18} className={cn(activeTab === 'menu' ? "text-blue-600" : "text-slate-400")} />
                Günün Menüsü
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  activeTab === 'dashboard' 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Wallet size={18} className={cn(activeTab === 'dashboard' ? "text-blue-600" : "text-slate-400")} />
                Profil & Kredilerim
              </button>

              {canEditMenu && (
                <>
                  <button
                    onClick={() => setActiveTab('admin_menu')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                      activeTab === 'admin_menu' 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Settings size={18} className={cn(activeTab === 'admin_menu' ? "text-blue-600" : "text-slate-400")} />
                    Menü Düzenle
                  </button>
                  <button
                    onClick={() => setActiveTab('kitchen_pos')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                      activeTab === 'kitchen_pos' 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Utensils size={18} className={cn(activeTab === 'kitchen_pos' ? "text-blue-600" : "text-slate-400")} />
                    Mutfak Terminali
                  </button>
                </>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                      activeTab === 'terminal' 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <CreditCard size={18} className={cn(activeTab === 'terminal' ? "text-blue-600" : "text-slate-400")} />
                    Kart Okutma Modu
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                      activeTab === 'attendance' 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Users size={18} className={cn(activeTab === 'attendance' ? "text-blue-600" : "text-slate-400")} />
                    Yoklama Listesi
                  </button>
              {(isAdmin || canManageUsers) && (
                <button
                  onClick={() => setActiveTab('user_mgmt')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                    activeTab === 'user_mgmt' 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Shield size={18} className={cn(activeTab === 'user_mgmt' ? "text-blue-600" : "text-slate-400")} />
                  Personel Yönetimi
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('mail_service')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                    activeTab === 'mail_service' 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Server size={18} className={cn(activeTab === 'mail_service' ? "text-blue-600" : "text-slate-400")} />
                  Mail Servis Ayarları
                </button>
              )}
                </>
              )}

              {canManageCredits && (
                <>
                  <button
                    onClick={() => setActiveTab('credit_mgmt')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                      activeTab === 'credit_mgmt' 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Wallet size={18} className={cn(activeTab === 'credit_mgmt' ? "text-blue-600" : "text-slate-400")} />
                    Kredi Yönetimi
                  </button>
                  {isHR && (
                    <>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                          activeTab === 'reports' 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <BarChart3 size={18} className={cn(activeTab === 'reports' ? "text-blue-600" : "text-slate-400")} />
                        AI Raporlar
                      </button>
                      <button
                        onClick={() => setActiveTab('email_settings')}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                          activeTab === 'email_settings' 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <ShoppingBag size={18} className={cn(activeTab === 'email_settings' ? "text-blue-600" : "text-slate-400")} />
                        E-posta Ayarları
                      </button>
                      <button
                        onClick={() => setActiveTab('user_mgmt')}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                          activeTab === 'user_mgmt' 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <Users size={18} className={cn(activeTab === 'user_mgmt' ? "text-blue-600" : "text-slate-400")} />
                        Personel Yönetimi
                      </button>
                    </>
                  )}
                </>
              )}
            </nav>

            {!isAdmin && !hasEatenToday && activeTab === 'menu' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-slate-900 border-none text-white space-y-4 shadow-xl overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full -mr-8 -mt-8" />
                <h4 className="font-bold text-lg relative z-10">Yemeğini Aldın mı?</h4>
                <p className="text-slate-400 text-xs leading-relaxed relative z-10">
                  Lütfen yemeğini aldığında aşağıdaki butona basarak onay ver. Bu işlem geri alınamaz.
                </p>
                <button 
                  onClick={handleConfirmAttendance}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 relative z-10"
                >
                  <Utensils size={18} />
                  Onaylıyorum
                </button>
              </motion.div>
            )}

            {hasEatenToday && !isAdmin && (
              <div className="card border-green-100 bg-green-50/50 text-green-700 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <History className="text-green-600" size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Bugün Yemek Yendi</span>
              </div>
            )}
          </aside>

          {/* View Area */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'menu' && (
                  <DailyMenuView 
                    menu={currentMenu} 
                    date={selectedDate} 
                    onDateChange={setSelectedDate} 
                  />
                )}
                {activeTab === 'admin_menu' && isKitchen && (
                  <AdminMenuEditor 
                    onSave={handleSaveMenu} 
                    existingMenu={currentMenu} 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                )}
                {activeTab === 'attendance' && isAdmin && (
                  <AttendanceList records={records} />
                )}
                {activeTab === 'terminal' && isAdmin && (
                  <CardScanTerminal onScan={handleScanAndRecord} />
                )}
                {activeTab === 'dashboard' && user && (
                  <EmployeeDashboard user={user} records={records} onRequestCredits={(amount) => handleCreateCreditRequest(user.id, user.name, amount)} />
                )}
                {activeTab === 'credit_mgmt' && isHR && (
                  <CreditManagement 
                    users={users} 
                    onAddCredits={handleAddCredits} 
                    requests={creditRequests}
                    onHandleRequest={handleProcessCreditRequest}
                  />
                )}
                 {activeTab === 'kitchen_pos' && canEditMenu && (
                   <KitchenPOS 
                    users={users} 
                    currentMenu={currentMenu} 
                    onTransaction={handleMealTransaction} 
                   />
                 )}
                 {activeTab === 'reports' && isHR && (
                  <ReportsDashboard records={records} menus={menus} />
                )}
                {(activeTab === 'user_mgmt' && (isAdmin || canManageUsers)) && (
                   <UserManagement 
                    users={users} 
                    isAdmin={isAdmin}
                    canPairCards={canPairCard}
                    canUploadImages={canUploadImage}
                    canManageUsers={canManageUsers}
                    onUpdateRoles={handleUpdateRoles} 
                    onUpdatePermissions={handleUpdatePermissions}
                    onUpdateEmail={handleUpdateEmail}
                    onUpdateUser={handleUpdateUserInfo}
                    onImportUsers={handleImportUsers}
                    onPairCard={handlePairCard}
                   />
                )}
                {activeTab === 'email_settings' && canManageCredits && (
                  <EmailTemplateSettings users={users} />
                )}
                {activeTab === 'mail_service' && isAdmin && (
                  <MailServiceSettings />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* Persistent Demo Switcher Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 py-3 px-6 shrink-0 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Görünüm Değiştir</p>
            <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
              <button 
                onClick={() => {
                  loginAs(MOCK_USERS[0]);
                  setActiveTab('menu');
                }}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest", user?.roles.includes('admin') ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-white hover:shadow-sm")}
              >
                ADMİN
              </button>
              <button 
                onClick={() => {
                  loginAs(MOCK_USERS[2]);
                }}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest", user?.roles.includes('hr') ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-white hover:shadow-sm")}
              >
                HR (İK)
              </button>
              <button 
                onClick={() => {
                  loginAs(MOCK_USERS[3]);
                }}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest", user?.roles.includes('kitchen') ? "bg-orange-500 text-white shadow-lg" : "text-slate-500 hover:bg-white hover:shadow-sm")}
              >
                MUTFAK
              </button>
              <button 
                onClick={() => {
                  loginAs(MOCK_USERS[1]);
                  setActiveTab('menu');
                }}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest", user?.roles.includes('employee') ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-white hover:shadow-sm")}
              >
                PERSONEL
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-[10px] font-bold">© 2026 CateringPro Takip Sistemi • Profesyonel Çözüm</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
