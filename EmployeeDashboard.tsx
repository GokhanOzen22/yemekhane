/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, History, Calendar as CalendarIcon, TrendingDown, Clock } from 'lucide-react';
import { UserProfile, Attendance } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface EmployeeDashboardProps {
  user: UserProfile;
  records: Attendance[];
  onRequestCredits: (amount: number) => void;
}

export default function EmployeeDashboard({ user, records, onRequestCredits }: EmployeeDashboardProps) {
  const [requestAmount, setRequestAmount] = React.useState(0);
  const [showRequestModal, setShowRequestModal] = React.useState(false);

  const userRecords = records
    .filter(r => r.userId === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleRequestSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestAmount > 0) {
      onRequestCredits(requestAmount);
      setRequestAmount(0);
      setShowRequestModal(false);
      alert('Yükleme talebiniz başarıyla İK birimine iletildi.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Hoş Geldiniz, {user.name.split(' ')[0]}</h2>
        <p className="text-slate-500 font-medium">Kişisel yemekhane özetiniz ve kredi durumunuz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credit Card */}
        <div className="card bg-slate-900 text-white border-none relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Wallet size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mevcut Kredi</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{user.credits}</span>
              <span className="text-blue-400 font-bold text-sm">TL</span>
            </div>
          </div>
          <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kayıtlı ID: {user.id}</span>
            <button 
              onClick={() => setShowRequestModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Kredi Yükle
            </button>
          </div>
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 -z-10" />
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto">
                  <Wallet size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Kredi Yükleme Talebi</h3>
                  <p className="text-sm text-slate-500">İK onayı sonrası bakiyeniz güncellenecektir.</p>
                </div>
              </div>

              <form onSubmit={handleRequestSubmission} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">İstediğiniz Tutar (TL)</label>
                  <input
                    type="number"
                    autoFocus
                    value={requestAmount || ''}
                    onChange={(e) => setRequestAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="input text-center text-2xl font-bold py-6"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    disabled={requestAmount <= 0}
                    className="flex-[2] btn-primary py-3 text-sm font-bold uppercase tracking-widest"
                  >
                    Talep Gönder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Stats 1 */}
        <div className="card border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <History size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Bu Ay Toplam</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{userRecords.length}</span>
            <span className="text-slate-500 font-bold text-sm">Öğün</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aktif Kullanım</span>
          </div>
        </div>

        {/* Stats 2 - Next Meal hint? */}
        <div className="card border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Son Yemek Saati</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {userRecords[0] ? format(new Date(userRecords[0].timestamp), 'HH:mm') : '--:--'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {userRecords[0] ? format(new Date(userRecords[0].date), 'dd MMMM', { locale: tr }) : 'Kayıt Yok'}
            </span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History size={20} className="text-slate-400" />
          Yemek Geçmişiniz
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarih</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saat</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">İşlem</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userRecords.length > 0 ? (
                  userRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <CalendarIcon size={14} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {format(new Date(record.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-mono font-medium text-slate-500">
                          {format(new Date(record.timestamp), 'HH:mm')}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-green-100 text-green-700">Yemek Onayı</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900">-15.00 TL</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic text-sm">
                      Henüz herhangi bir yemek kaydınız bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
