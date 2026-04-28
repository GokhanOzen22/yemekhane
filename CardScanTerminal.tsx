/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Scan, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface CardScanTerminalProps {
  onScan: (id: string) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
}

export default function CardScanTerminal({ onScan }: CardScanTerminalProps) {
  const [inputId, setInputId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [lastUser, setLastUser] = useState<UserProfile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused at all times to intercept card scanner (HID Keyboard) input
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId.trim() || status === 'loading') return;

    setStatus('loading');
    
    try {
      const result = await onScan(inputId.trim());
      if (result.success) {
        setStatus('success');
        setLastUser(result.user || null);
        setMessage('Hoşgeldiniz, Afiyet Olsun!');
      } else {
        setStatus('error');
        setMessage(result.message || 'Hata Oluştu');
      }
      
      setInputId('');
      
      // Reset status after a few seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Beklenmedik bir hata oluştu');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900">Kart Okuyucu Terminali</h2>
        <p className="text-slate-500 font-medium">Lütfen personelin ID kartını okutun veya ID numarasını girin.</p>
      </div>

      <div className="relative w-full max-w-md">
        <form onSubmit={handleSubmit} className="relative z-10">
          <input
            ref={inputRef}
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="sr-only" // Hidden but focused for scanner
            autoFocus
          />
          
          <div className={cn(
            "card border-2 p-12 flex flex-col items-center gap-6 transition-all duration-300",
            status === 'idle' && "border-slate-200 bg-white",
            status === 'loading' && "border-blue-200 bg-blue-50",
            status === 'success' && "border-green-400 bg-green-50 shadow-lg shadow-green-100",
            status === 'error' && "border-red-400 bg-red-50 shadow-lg shadow-red-100"
          )}>
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
                >
                  <Scan size={48} />
                </motion.div>
              )}
              {status === 'loading' && (
                <motion.div 
                  key="loading"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader2 size={48} className="text-blue-600" />
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  className="text-green-600"
                >
                  <CheckCircle2 size={64} />
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div 
                  key="error"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  className="text-red-600"
                >
                  <AlertCircle size={64} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center space-y-2">
              <span className={cn(
                "text-sm font-bold uppercase tracking-widest",
                status === 'success' ? "text-green-600" : status === 'error' ? "text-red-600" : "text-slate-400"
              )}>
                {status === 'idle' ? 'KART BEKLENİYOR...' : status.toUpperCase()}
              </span>
              
              {status === 'success' && lastUser && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                    {lastUser.avatarUrl ? (
                      <img src={lastUser.avatarUrl} alt={lastUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-100 text-3xl">
                        {lastUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-800">{lastUser.name}</p>
                    <p className="text-sm text-green-700 font-bold uppercase tracking-wider">{message}</p>
                  </div>
                </motion.div>
              )}
              
              {status === 'error' && (
                <p className="text-lg font-bold text-red-900 leading-tight">{message}</p>
              )}
              
              {status === 'idle' && (
                <p className="text-slate-400 text-xs italic">Cihaz hazır. Lütfen okutma yapın.</p>
              )}
            </div>
          </div>
        </form>

        {/* Card Scanner Animation Overlay */}
        <div className="absolute -inset-4 border-2 border-dashed border-slate-200 rounded-3xl -z-10 animate-[pulse_2s_infinite]" />
      </div>

      <div className="card max-w-md w-full bg-slate-50 border-none p-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Simülasyon İçin ID Girişi</h4>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Örn: ID-101"
            className="input text-sm h-10"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
          />
          <button 
            type="button"
            onClick={handleSubmit}
            className="btn-primary py-0 h-10 whitespace-nowrap text-xs"
          >
            SİMÜLE ET
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">Test ID'leri: ID-101, ID-102, ID-103</p>
      </div>
    </div>
  );
}
