/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Utensils, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Menu } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DailyMenuViewProps {
  menu: Menu | null;
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DailyMenuView({ menu, date, onDateChange }: DailyMenuViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Günün Menüsü</h2>
          <div className="flex items-center gap-3 mt-1">
            <button 
              onClick={() => onDateChange(subDays(date, 1))}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="relative group">
              <input 
                type="date" 
                value={format(date, 'yyyy-MM-dd')}
                onChange={(e) => onDateChange(new Date(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <p className="text-slate-500 font-medium cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                <span>{format(date, 'dd MMMM yyyy, EEEE', { locale: tr })}</span>
                <CalendarIcon size={14} className="text-slate-300" />
              </p>
            </div>
            <button 
              onClick={() => onDateChange(addDays(date, 1))}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Canlı Yayın</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {menu ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {menu.items.map((item, index) => (
              <div key={index} className="card group hover:border-blue-200 transition-all cursor-default relative overflow-hidden flex gap-4">
                {item.imageUrl ? (
                  <div className="w-24 h-24 flex-shrink-0 relative rounded-xl overflow-hidden shadow-sm">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:bg-blue-50 transition-colors" />
                )}
                <div className="relative z-10 flex flex-col justify-center gap-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    {item.category}
                    {item.isFixMenu && (
                      <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[8px]">FIX</span>
                    )}
                  </span>
                  <span className="text-xl font-bold text-slate-800 leading-tight">
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-20 flex flex-col items-center gap-6 border-dashed border-slate-200 bg-slate-50/50"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <Utensils size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Menü Henüz Eklenmedi</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Mutfak hazırlıkları devam ediyor. Lütfen daha sonra tekrar kontrol edin.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
