/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Server, Shield, Unlock, Lock, Mail, Save, RefreshCw } from 'lucide-react';
import { MailServiceConfig } from '../types';
import { cn } from '../lib/utils';

export default function MailServiceSettings() {
  const [config, setConfig] = useState<MailServiceConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromName: 'Kafeterya Sistemi'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Mail servis ayarları başarıyla güncellendi.');
    }, 1000);
  };

  const testConnection = () => {
    alert('Bağlantı testi başlatıldı...');
    setTimeout(() => {
      alert('SMTP sunucusuna başarıyla bağlanıldı.');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mail Servis Yönetimi</h2>
        <p className="text-slate-500 font-medium">Bakiye hatırlatma ve bildirim e-postaları için SMTP sunucusu yapılandırması</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-slate-200 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Server size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">SMTP Sunucu Ayarları</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={config.host}
                    onChange={(e) => setConfig({...config, host: e.target.value})}
                    className="input pl-10 font-bold"
                    placeholder="örn: smtp.yandex.com"
                  />
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Port</label>
                <input 
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({...config, port: Number(e.target.value)})}
                  className="input font-bold"
                  placeholder="587, 465"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gönderen Adı</label>
                <input 
                  type="text"
                  value={config.fromName}
                  onChange={(e) => setConfig({...config, fromName: e.target.value})}
                  className="input font-bold"
                  placeholder="Kafeterya Bildirim"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={config.secure}
                      onChange={(e) => setConfig({...config, secure: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={cn("w-12 h-6 rounded-full transition-all duration-300", config.secure ? "bg-emerald-500" : "bg-slate-200")}></div>
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300", config.secure ? "left-7" : "left-1")}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">SSL/TLS Güvenli Bağlantı</span>
                </label>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Shield size={16} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Kimlik Doğrulama</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kullanıcı Adı (Mail)</label>
                  <div className="relative">
                    <input 
                      type="email"
                      value={config.user}
                      onChange={(e) => setConfig({...config, user: e.target.value})}
                      className="input pl-10 font-bold"
                      placeholder="info@sirket.com"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şifre / App Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={config.pass}
                      onChange={(e) => setConfig({...config, pass: e.target.value})}
                      className="input pl-10 pr-10 font-mono"
                      placeholder="••••••••••••"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <button 
                onClick={testConnection}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <RefreshCw size={18} />
                Bağlantıyı Test Et
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2 px-8 min-w-[160px] justify-center"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Ayarları Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-slate-900 text-white border-none p-8 space-y-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold">Yardımcı Bilgiler</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-slate-400 font-medium">Gmail kullanıyorsanız "Uygulama Şifreleri" (App Passwords) özelliğini kullanmanız önerilir.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-slate-400 font-medium">Outlook/Office 365 için host adresi <code className="text-blue-400">smtp.office365.com</code>'dur.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-slate-400 font-medium">Bağlantı testini yapmadan e-posta bildirimlerini aktifleştirmeyin.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
