/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Calendar as CalendarIcon, Sparkles, TrendingUp, Users, Download, 
  Loader2, ChevronRight, FileText, Table as TableIcon, X, Eye
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Attendance, Menu, MenuItem } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportsDashboardProps {
  records: Attendance[];
  menus: Menu[];
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function ReportsDashboard({ records, menus }: ReportsDashboardProps) {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const date = r.date;
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [records, dateRange]);

  // Map records to include menu items for export
  const exportData = useMemo(() => {
    return filteredRecords.map(r => {
      const menu = menus.find(m => m.date === r.date);
      return {
        id: r.userId,
        name: r.userName,
        date: format(new Date(r.date), 'dd.MM.yyyy'),
        time: format(new Date(r.timestamp), 'HH:mm'),
        menu: menu ? menu.items.map(i => i.name).join(', ') : 'Menü Girilmemiş'
      };
    });
  }, [filteredRecords, menus]);

  // Data for Daily Consumption Chart
  const dailyData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach(r => {
      counts[r.date] = (counts[r.date] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date, count]) => ({
        date: format(new Date(date), 'dd MMM', { locale: tr }),
        count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  // Data for Popular Items (best effort estimation based on menu and attendance)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const menu = menus.find(m => m.date === r.date);
      if (menu) {
        menu.items.forEach(item => {
          counts[item.category] = (counts[item.category] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords, menus]);

  const generateAiInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const summary = {
        totalRecords: filteredRecords.length,
        dailyAvg: (filteredRecords.length / (dailyData.length || 1)).toFixed(1),
        topDay: dailyData.reduce((max, curr) => curr.count > max.count ? curr : max, { date: 'N/A', count: 0 }),
        consumptionByDate: dailyData,
        categories: categoryData
      };

      const prompt = `
        Sen bir kurumsal yemekhane verisi analistisin. 
        Aşağıdaki yemekhane geçiş verilerini analiz et ve Türkçe olarak kısa, öz ve aksiyon odaklı içgörüler sun.
        Veriler: ${JSON.stringify(summary)}
        
        İstenenler:
        1. En yoğun günlerin analizi.
        2. Tüketim trendleri (artış/azalış).
        3. Personel katılımı hakkında bir yorum.
        4. Gelecek haftalar için bir öneri.
        
        Yanıtı markdown formatında, başlık kullanmadan 4-5 madde halinde ver.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiInsight(response.text || "İçgörü oluşturulamadı.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setAiInsight("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Yemekhane Raporu");
    XLSX.writeFile(wb, `Yemekhane_Raporu_${dateRange.start}_${dateRange.end}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Yemekhane Geçiş Raporu", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tarih Aralığı: ${dateRange.start} - ${dateRange.end}`, 14, 22);
    
    const tableColumn = ["ID", "Personel", "Tarih", "Saat", "Menü"];
    const tableRows = exportData.map(item => [
      item.id,
      item.name,
      item.date,
      item.time,
      item.menu
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillStyle: 'DF', fillColor: [37, 99, 235], textColor: 255 }
    });

    doc.save(`Yemekhane_Raporu_${dateRange.start}_${dateRange.end}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Yönetici Raporları</h2>
          <p className="text-slate-500 font-medium">Yemekhane kullanım verileri ve AI destekli analizler</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="text-xs font-bold uppercase tracking-wider px-3 py-2 outline-none border-none"
            />
            <ChevronRight size={14} className="text-slate-300" />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="text-xs font-bold uppercase tracking-wider px-3 py-2 outline-none border-none"
            />
          </div>
          <button 
            onClick={() => setShowExportPreview(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            Dışa Aktar / Önizle
          </button>
        </div>
      </div>

      {/* Export Preview Modal */}
      {showExportPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Rapor Önizleme</h3>
                  <p className="text-xs text-slate-500 font-medium">{exportData.length} Kayıt Listeleniyor</p>
                </div>
              </div>
              <button 
                onClick={() => setShowExportPreview(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Personel</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Tarih</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Saat</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yediği Yemekler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exportData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-bold text-slate-400">{item.id}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 text-center font-mono">{item.time}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 italic leading-relaxed">{item.menu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 italic">
                * Bu liste yukarıda seçtiğiniz tarih aralığına göre filtrelenmiştir.
              </p>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={exportToPDF}
                  className="flex-1 md:flex-none btn-secondary bg-white flex items-center justify-center gap-2 text-red-600 border-red-100 hover:bg-red-50"
                >
                  <FileText size={16} />
                  PDF Olarak İndir
                </button>
                <button 
                  onClick={exportToExcel}
                  className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 border-none px-8"
                >
                  <TableIcon size={16} />
                  Excel (XLSX) İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Consumption Chart */}
        <div className="lg:col-span-2 card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Günlük Tüketim Trendi</h3>
            <div className="badge bg-blue-50 text-blue-600 border border-blue-100">
              {filteredRecords.length} Toplam İşlem
            </div>
          </div>
          <div className="h-[300px] w-full">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                Seçili tarih aralığında veri bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="card bg-slate-900 text-white border-none relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-bold">AI Akıllı Analiz</h3>
          </div>

          <div className="relative z-10 flex-1 space-y-4">
            {isAiLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-slate-400">Veriler analiz ediliyor...</p>
              </div>
            ) : aiInsight ? (
              <div className="space-y-4 prose prose-invert prose-sm max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {aiInsight}
                </div>
                <button 
                  onClick={generateAiInsight}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-4"
                >
                  Yenile <TrendingUp size={12} />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                <p className="text-slate-400 text-sm">
                  Seçili tarihler arasındaki verileri analiz ederek gizli trendleri keşfedin.
                </p>
                <button 
                  onClick={generateAiInsight}
                  className="btn-primary w-full bg-blue-600 border-none hover:bg-blue-700"
                >
                  Analizi Başlat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="card space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Kategori Bazlı Tüketim</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="card border-slate-200 bg-blue-50/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Benzersiz Personel</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(filteredRecords.map(r => r.userId)).size}
              </p>
            </div>
          </div>
          
          <div className="card border-slate-200 bg-slate-50/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Günlük Ortalama</p>
              <p className="text-2xl font-bold text-slate-900 font-mono">
                {(filteredRecords.length / (dailyData.length || 1)).toFixed(1)}
              </p>
            </div>
          </div>

          <div className="card border-slate-200 bg-slate-50/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <CalendarIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Yoğun Gün</p>
              <p className="text-2xl font-bold text-slate-900">
                {dailyData.reduce((max, curr) => curr.count > max.count ? curr : max, { date: '-', count: 0 }).date}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
