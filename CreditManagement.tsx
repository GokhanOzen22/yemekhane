/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Search, UserPlus, CreditCard, ArrowUpCircle, Clock, Check, X as XIcon } from 'lucide-react';
import { UserProfile, CreditRequest } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CreditManagementProps {
  users: UserProfile[];
  onAddCredits: (userId: string, amount: number) => void;
  requests: CreditRequest[];
  onHandleRequest: (requestId: string, status: 'approved' | 'rejected') => void;
}

export default function CreditManagement({ users, onAddCredits, requests, onHandleRequest }: CreditManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [activeView, setActiveView] = useState<'users' | 'requests'>('users');

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && amount > 0) {
      onAddCredits(selectedUser.id, amount);
      setAmount(0);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kredi Yönetimi</h2>
        <p className="text-slate-500 font-medium">Personel hesaplarına bakiye yükleme ve yönetimi</p>
      </div>

      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveView('users')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
            activeView === 'users' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Manuel Yükleme
        </button>
        <button 
          onClick={() => setActiveView('requests')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            activeView === 'requests' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Talep Listesi
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeView === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: User List */}
          <div className="card space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Personel Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    selectedUser?.id === u.id 
                      ? "bg-blue-50 border-blue-200 shadow-sm" 
                      : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      selectedUser?.id === u.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider">{u.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{u.credits} TL</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Mevcut Kredi</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Load Form */}
          <div className="space-y-6">
            <div className={cn(
              "card border-2 transition-all h-full flex flex-col items-center justify-center min-h-[350px]",
              selectedUser ? "border-blue-100 bg-white" : "border-dashed border-slate-200 bg-slate-50/50"
            )}>
              {selectedUser ? (
                <form onSubmit={handleAddCredits} className="w-full max-w-xs space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
                      <ArrowUpCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Bakiye Yükle</h3>
                    <p className="text-slate-500 text-sm">{selectedUser.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Yükleme Tutarı (TL)</label>
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="input text-center text-2xl font-bold py-4"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[20, 50, 100].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={amount <= 0}
                    className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold"
                  >
                    Yüklemeyi Tamamla
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="w-full text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest"
                  >
                    Vazgeç
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mx-auto">
                    <CreditCard size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Personel Seçin</h3>
                    <p className="text-slate-400 text-xs italic max-w-[200px] mx-auto leading-relaxed">
                      Kredi yüklemek istediğiniz personeli yan taraftaki listeden belirleyin.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="card border-slate-200 shadow-sm space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors" />
                  
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {req.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{req.userName}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Clock size={10} />
                        {format(new Date(req.timestamp), 'dd MMM, HH:mm', { locale: tr })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900">{req.amount} <span className="text-sm text-blue-600">TL</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Yükleme Talebi</p>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <button
                      onClick={() => onHandleRequest(req.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      <XIcon size={14} /> Reddet
                    </button>
                    <button
                      onClick={() => onHandleRequest(req.id, 'approved')}
                      className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-100"
                    >
                      <Check size={14} /> Onayla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card h-64 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <Check size={24} />
              </div>
              <p className="text-slate-400 text-sm font-medium">Bütün talepler sonuçlandırıldı.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
