/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { User, Clock, CheckCircle, Search, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Attendance } from '../types';
import { format, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AttendanceListProps {
  records: Attendance[];
}

export default function AttendanceList({ records }: AttendanceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(''); // empty means all dates or usually today in "live" view

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           record.userId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = selectedDate ? record.date === selectedDate : true;
      return matchesSearch && matchesDate;
    });
  }, [records, searchTerm, selectedDate]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Geçiş Kayıtları</h2>
          <p className="text-slate-500 font-medium">Tüm yemekhane girişleri ve geçmiş döküm</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[200px]">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input pl-10 text-xs font-bold uppercase tracking-wider"
            />
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="İsim veya ID ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50 items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kayıt Listesi</span>
            <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
              {filteredRecords.length} Sonuç
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Otomatik Güncelleniyor
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personel</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personel ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarih</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Geçiş Saati</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                          {record.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{record.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs text-slate-400 font-mono font-bold">{record.userId}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs text-slate-500 font-medium italic">
                        {format(new Date(record.date), 'dd MMMM yyyy', { locale: tr })}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-sm font-mono font-bold text-slate-700">
                        {format(record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp), 'HH:mm')}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className="badge bg-green-100 text-green-700">
                        Giriş Yapıldı
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic text-sm">
                    Arama kriterlerine uygun herhangi bir kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

