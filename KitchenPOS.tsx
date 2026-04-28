/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Search, CreditCard, ScanLine, X, Check, ShoppingBag, Trash2, ArrowRight, Users } from 'lucide-react';
import { UserProfile, Menu, MenuItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface KitchenPOSProps {
  users: UserProfile[];
  currentMenu: Menu | null;
  onTransaction: (userId: string, items: MenuItem[], totalPrice: number) => Promise<{ success: boolean; message: string }>;
}

export default function KitchenPOS({ users, currentMenu, onTransaction }: KitchenPOSProps) {
  const [scannedUser, setScannedUser] = useState<UserProfile | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(userSearchTerm.toLowerCase())
  ).slice(0, 5);

  const handleUserSelect = (user: UserProfile) => {
    setScannedUser(user);
    setStatus('idle');
    setMessage('');
    setUserSearchTerm('');
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    const user = users.find(u => u.id === scanInput || u.cardId === scanInput);
    if (user) {
      setScannedUser(user);
      setStatus('idle');
      setMessage('');
    } else {
      setStatus('error');
      setMessage('Kullanıcı bulunamadı');
      setScannedUser(null);
    }
    setScanInput('');
  };

  const toggleItem = (item: MenuItem) => {
    if (selectedItems.some(i => i.name === item.name)) {
      setSelectedItems(selectedItems.filter(i => i.name !== item.name));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const selectFixMenu = () => {
    if (currentMenu) {
      const fixMenuItems = currentMenu.items.filter(item => item.isFixMenu);
      // Fallback: If no items are marked, treat the whole menu as fix menu for backward compatibility
      if (fixMenuItems.length > 0) {
        setSelectedItems(fixMenuItems);
      } else {
        setSelectedItems(currentMenu.items);
      }
    }
  };

  const handleConfirm = async () => {
    if (!scannedUser || selectedItems.length === 0) return;

    setIsProcessing(true);
    const result = await onTransaction(scannedUser.id, selectedItems, totalPrice);
    setIsProcessing(false);

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      setTimeout(() => {
        setScannedUser(null);
        setSelectedItems([]);
        setStatus('idle');
      }, 3000);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-220px)] min-h-[650px]">
      
      {/* Top Section: Search & Scan (Sticky) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <div className="bg-slate-950 rounded-2xl p-4 shadow-xl text-white relative flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 border-r border-slate-800">
            <ScanLine size={20} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Terminal</span>
          </div>
          <form onSubmit={handleScan} className="flex-1">
            <input
              type="text"
              autoFocus
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Kart ID okutun..."
              className="w-full bg-transparent border-none text-xl font-black font-mono tracking-widest focus:outline-none placeholder:text-slate-700 text-white uppercase"
            />
          </form>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4 relative">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            placeholder="Personel İsmi veya Sicil No Ara..."
            className="flex-1 bg-transparent border-none text-sm font-bold focus:outline-none placeholder:text-slate-400"
          />
          <AnimatePresence>
            {userSearchTerm && filteredUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200 divide-y divide-slate-50"
              >
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">{user.name.charAt(0)}</div>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.id}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Middle Section: Active Transaction (The Core) */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-6 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Person Info */}
          <div className="w-full lg:w-1/3 flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
            
            <AnimatePresence mode="wait">
              {scannedUser ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={scannedUser.id}
                  className="space-y-4"
                >
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-2xl mx-auto ring-4 ring-blue-500/10">
                    {scannedUser.avatarUrl ? (
                      <img src={scannedUser.avatarUrl} alt={scannedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-slate-400 bg-white text-3xl">
                        {scannedUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 leading-tight">{scannedUser.name}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{scannedUser.id}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-black text-lg">
                    <CreditCard size={18} />
                    {scannedUser.credits}₺
                  </div>
                </motion.div>
              ) : (
                <div className="py-10 space-y-3 opacity-30">
                  <ScanLine size={48} className="mx-auto text-slate-400" />
                  <p className="text-sm font-bold uppercase tracking-widest">KART BEKLENİYOR</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Vertical Separator */}
          <div className="hidden lg:block w-px self-stretch bg-slate-100"></div>

          {/* Order Summary */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShoppingBag size={14} />
                SİPARİŞ DETAYI
              </h3>
              <div className="flex items-center gap-4">
                {selectedItems.length > 0 && (
                  <button onClick={() => setSelectedItems([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">TÜMÜNÜ SİL</button>
                )}
                <div className="text-right">
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">{totalPrice}</span>
                  <span className="text-lg font-bold text-slate-400 ml-1">₺</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide py-2">
              {selectedItems.length > 0 ? (
                selectedItems.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-sm font-bold text-slate-800">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-sm whitespace-nowrap">{item.price}₺</span>
                      <button 
                        onClick={() => setSelectedItems(selectedItems.filter((_, idx) => idx !== i))}
                        className="text-slate-200 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-10 flex flex-col items-center justify-center opacity-20 italic text-slate-500">
                  <Utensils size={32} className="mb-2" />
                  <p className="text-sm">Henüz ürün seçilmedi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-2 space-y-4">
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg",
                  status === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}
              >
                {status === 'success' ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
                <p className="text-sm font-black uppercase tracking-widest">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleConfirm}
            disabled={!scannedUser || selectedItems.length === 0 || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[24px] text-lg font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] group"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                ÖDEMEYİ TAMAMLA
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Section: Menu Food Boxes */}
      <div className="flex-[1.5] flex flex-col gap-4 overflow-hidden min-h-[350px]">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">MENÜ SEÇENEKLERİ</h3>
          {currentMenu && (
            <button 
              onClick={selectFixMenu}
              className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-widest"
            >
              FİX MENÜYÜ EKLE
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide pb-32">
          {currentMenu ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentMenu.items.map((item, idx) => {
                const isSelected = selectedItems.some(i => i.name === item.name);
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleItem(item)}
                    className={cn(
                      "p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between min-h-[140px]",
                      isSelected 
                        ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-100 text-white translate-y-[-4px]" 
                        : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md text-slate-900"
                    )}
                  >
                    <div className="space-y-1">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}>{item.category}</span>
                      <h4 className="font-bold text-lg leading-tight mt-1">{item.name}</h4>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-[10px] font-bold opacity-60 uppercase">{item.calories} kCal</p>
                      <p className="font-black text-2xl tracking-tighter">{item.price}₺</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 gap-3">
              <Utensils size={48} className="opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Bugün için menü tanımlanmamış</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

