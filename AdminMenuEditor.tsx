/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Menu, MenuItem } from '../types';
import { cn } from '../lib/utils';

interface AdminMenuEditorProps {
  onSave: (menu: Partial<Menu>) => void;
  existingMenu?: Menu | null;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CATEGORIES = ['Çorba', 'Ana Yemek', 'Yardımcı Yemek', 'Salata/Tatlı', 'Ekstra'];

export default function AdminMenuEditor({ onSave, existingMenu, selectedDate, onDateChange }: AdminMenuEditorProps) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (existingMenu) {
      setItems(existingMenu.items);
    } else {
      setItems([{ category: 'Çorba', name: '' }, { category: 'Ana Yemek', name: '' }]);
    }
  }, [existingMenu]);

  const addItem = () => {
    setItems([...items, { category: 'Ekstra', name: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MenuItem, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(index, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    updateItem(index, 'imageUrl', '');
  };

  const handleSave = () => {
    onSave({
      date: format(selectedDate, 'yyyy-MM-dd'),
      items: items.filter(i => i.name.trim() !== '')
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Menü Yönetimi</h2>
          <p className="text-slate-500 font-medium">Haftalık yemek planlarını oluşturun</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm">
          <button 
            onClick={() => onDateChange(subDays(selectedDate, 1))}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-blue-600"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 text-sm font-bold text-slate-700 min-w-[160px] text-center uppercase tracking-widest">
            {format(selectedDate, 'dd MMMM yyyy')}
          </div>
          <button 
            onClick={() => onDateChange(addDays(selectedDate, 1))}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-blue-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="card border-slate-200 shadow-sm overflow-hidden p-0 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menü Kalemleri</span>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">
            <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
            Fix Menü İşareti
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="pt-2">
                <input
                  type="checkbox"
                  checked={item.isFixMenu || false}
                  onChange={(e) => updateItem(index, 'isFixMenu', e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title="Fix Menüye Dahil Et"
                />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                    className="input bg-slate-50 md:col-span-1 text-sm font-bold text-slate-600 appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="md:col-span-4 flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Yemek Adı (Örn: Süzme Mercimek)"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="input font-medium flex-1"
                    />
                    <div className="relative group/img">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => handleImageUpload(index, e)}
                      />
                      <div className={cn(
                        "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                        item.imageUrl ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 group-hover/img:bg-slate-100"
                      )}>
                        {item.imageUrl ? (
                          <div className="relative w-full h-full">
                            <img src={item.imageUrl} className="w-full h-full object-cover rounded-xl" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors z-20"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <ImageIcon size={18} className="text-slate-400 group-hover/img:text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1 relative">
                    <input
                      type="number"
                      placeholder="Fiyat"
                      value={item.price || ''}
                      onChange={(e) => updateItem(index, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="input font-mono font-bold pl-8 w-full"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={addItem}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <Plus size={18} />
            Yeni Kalem Ekle
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
