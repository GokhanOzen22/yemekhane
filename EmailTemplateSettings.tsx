/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface EmailTemplateSettingsProps {
  users: UserProfile[];
}

export default function EmailTemplateSettings({ users }: EmailTemplateSettingsProps) {
  const [template, setTemplate] = useState({
    subject: 'Düşük Bakiye Hatırlatması',
    body: 'Merhaba {name},\n\nKafeterya hesabınızdaki kredi miktarınız {credits}₺ altına düşmüştür. Kalan bakiyeniz: {balance}₺.\n\nLütfen en kısa sürede yükleme yapınız.\n\nİyi günler dileriz.',
    lowLimit: 50
  });

  const [lastSent, setLastSent] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSave = () => {
    // In a real app, save to firestore/backend
    alert('Şablon başarıyla kaydedildi.');
  };

  const sendReminders = () => {
    setIsSending(true);
    const lowCreditUsers = users.filter(u => u.credits < template.lowLimit && u.email);
    
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      setLastSent(new Date().toLocaleString('tr-TR'));
      alert(`${lowCreditUsers.length} kullanıcıya hatırlatma e-postası başarıyla gönderildi.`);
    }, 1500);
  };

  const lowCreditCount = users.filter(u => u.credits < template.lowLimit).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">E-posta Bildirim Ayarları</h2>
          <p className="text-slate-500 font-medium">Bakiye hatırlatmaları için otomatik şablon ve gönderim paneli</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Mail size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hatırlatma Şablonu</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konu Satırı</label>
                <input 
                  type="text"
                  value={template.subject}
                  onChange={(e) => setTemplate({...template, subject: e.target.value})}
                  className="input font-bold"
                  placeholder="E-posta konusu..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mesaj İçeriği</label>
                <textarea 
                  rows={8}
                  value={template.body}
                  onChange={(e) => setTemplate({...template, body: e.target.value})}
                  className="input font-medium leading-relaxed resize-none"
                  placeholder="Mesaj içeriğini buraya yazın..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-400">Değişkenler:</span>
                  <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-bold">{"{name}"}</code>
                  <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-bold">{"{credits}"}</code>
                  <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-bold">{"{balance}"}</code>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <Save size={18} />
                  Şablonu Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Send Panel */}
        <div className="space-y-6">
          <div className="card border-slate-200 shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Send size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hızlı Gönderim</h3>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alt Limit Belirle</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    value={template.lowLimit}
                    onChange={(e) => setTemplate({...template, lowLimit: Number(e.target.value)})}
                    className="w-24 bg-transparent border-b-2 border-slate-200 focus:border-blue-600 focus:outline-none text-2xl font-black text-slate-900 px-1 py-1"
                  />
                  <span className="text-xl font-black text-slate-400">₺</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Buda bakiyesi bu tutarın altında olanlara mail gider.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Kritik Kullanıcı:</span>
                  <span className="font-bold text-red-600">{lowCreditCount} Kişi</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">E-posta Tanımlı:</span>
                  <span className="font-bold text-slate-900">{users.filter(u => u.email).length} Kişi</span>
                </div>
              </div>

              <button 
                onClick={sendReminders}
                disabled={isSending || lowCreditCount === 0}
                className={cn("w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]", 
                  isSending ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Şimdi Hatırlat
                  </>
                )}
              </button>

              {lastSent && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-emerald-800 leading-tight">Son Gönderim Başarılı</p>
                    <p className="text-[10px] text-emerald-600 font-medium">{lastSent}</p>
                  </div>
                </div>
              )}

              {lowCreditCount > 0 && users.filter(u => u.credits < template.lowLimit && !u.email).length > 0 && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                  <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-orange-800 font-bold leading-tight uppercase tracking-wider">
                    {users.filter(u => u.credits < template.lowLimit && !u.email).length} kritik kullanıcının e-posta adresi eksik!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
