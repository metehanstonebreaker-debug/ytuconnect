/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MOCK_EXAMS } from '../mockData';
import { Calendar, AlertCircle, Info, Eye, Bell, BellOff, Send, X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExamWidgetProps {
  department: string;
  isFilteredOut: boolean;
  onRestore: () => void;
}

interface CustomToast {
  id: string;
  title: string;
  body: string;
  isSimulated: boolean;
}

export default function ExamWidget({ department, isFilteredOut, onRestore }: ExamWidgetProps) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [toast, setToast] = useState<CustomToast | null>(null);
  const [localMuted, setLocalMuted] = useState<boolean>(() => {
    return localStorage.getItem('ytu_exam_notifications_muted') === 'true';
  });

  // Filter exams that belong to the user's selected department OR general courses
  const filteredExams = MOCK_EXAMS.filter(exam => {
    return exam.department === "Genel Mühendislik" || exam.department === department;
  });

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);

      // Auto-notify once per session if permission is granted and not muted
      if (Notification.permission === 'granted' && !localMuted) {
        const alreadyNotified = sessionStorage.getItem('ytu_exam_notified_this_session');
        if (!alreadyNotified) {
          const timer = setTimeout(() => {
            pushUpcomingExamNotifications(true); // pass true for auto-run quiet mode
            sessionStorage.setItem('ytu_exam_notified_this_session', 'true');
          }, 2500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [department, localMuted]);

  // Toast automatic dismiss timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Unified function to trigger notifications (system + beautiful custom floating UI toast)
  const triggerNotification = (title: string, body: string) => {
    let isSimulated = true;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted' && !localMuted) {
        try {
          // Native notification
          new Notification(title, {
            body,
            icon: "https://ui-avatars.com/api/?name=YTU&background=003057&color=ffffff"
          });
          isSimulated = false;
        } catch (err) {
          console.warn("Native notification failed (likely sandbox/iframe restrictions):", err);
        }
      }
    }

    // Always trigger the gorgeous on-screen floating toast so they can see it
    setToast({
      id: Math.random().toString(),
      title,
      body,
      isSimulated
    });
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Tarayıcınız veya ortamınız sistem bildirimlerini desteklemiyor.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        setLocalMuted(false);
        localStorage.setItem('ytu_exam_notifications_muted', 'false');
        
        triggerNotification(
          "YıldızConnect Bildirim Sistemi",
          `🎉 Sınav bildirimleri başarıyla etkinleştirildi! ${department} bölümü sınavları otomatik iletilecektir.`
        );
      } else if (permission === 'denied') {
        // Warn about settings block
        triggerNotification(
          "Bildirim İzni Reddedildi",
          "Tarayıcınızda bildirim izinleri engellenmiş durumda. Bildirim almak için adres çubuğundan kilit simgesine tıklayıp izin vermelisiniz."
        );
      }
    } catch (err) {
      // In some environments, requestPermission throws or behaves differently
      console.error("Error requesting notification permission:", err);
      // Fallback
      setPermissionStatus('granted'); // simulate granted locally
      triggerNotification(
        "YıldızConnect Bildirim Sistemi",
        `🎉 Sınav bildirimleri simüle modda etkinleştirildi! ${department} bölümü sınavları otomatik iletilecektir.`
      );
    }
  };

  const pushUpcomingExamNotifications = (isAuto = false) => {
    if (filteredExams.length === 0) {
      if (!isAuto) {
        triggerNotification(
          "YıldızConnect Sınav Bilgisi",
          `Seçili bölüm (${department}) için yakın zamanda planlanmış sınav bulunmuyor.`
        );
      }
      return;
    }

    // Prepare content
    const nextExam = filteredExams[0];
    const examDetails = `📚 Sıradaki Sınav: ${nextExam.course}\nTarih: ${nextExam.date} ${nextExam.month} • Saat: ${nextExam.time}\nYer: ${nextExam.room}`;
    
    const title = isAuto ? "YıldızConnect: Sınav Hatırlatıcısı" : "YıldızConnect: Sınav Takvimi (Manuel Test)";
    triggerNotification(title, examDetails);
  };

  const toggleMute = () => {
    const nextMute = !localMuted;
    setLocalMuted(nextMute);
    localStorage.setItem('ytu_exam_notifications_muted', nextMute ? 'true' : 'false');
    
    if (nextMute) {
      setToast(null);
    } else {
      triggerNotification(
        "Bildirimler Sesi Açıldı",
        `Sınav bildirimleri tekrar aktif hale getirildi.`
      );
    }
  };

  if (isFilteredOut) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-center transition">
        <div className="flex justify-center mb-2">
          <AlertCircle className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Sınav Takvimi Filtrelendi
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal mb-3">
          Ayarlardan 'Sınav Takvimi' filtresini kapattığınız için bu alan gizlendi.
        </p>
        <button
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-brand-500 hover:text-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          Filtreyi Kaldır
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80 border-t-4 border-t-brand-500 transition hover:shadow-md relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-500" />
            Kişisel Sınav Takvimi
          </h3>
          <span className="text-[10px] bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold px-1.5 py-0.5 rounded">
            {filteredExams.length} Sınav
          </span>
        </div>

        {filteredExams.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-400">Bölümünüze ait yakın zamanda sınav bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExams.slice(0, 3).map((exam) => (
              <div key={exam.id} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div className="bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 p-2 rounded-lg text-center min-w-[45px] border border-brand-100/50 dark:border-brand-900/20">
                  <p className="text-[9px] font-bold uppercase">{exam.month}</p>
                  <p className="text-base font-black leading-none mt-0.5">{exam.date}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{exam.course}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{exam.room} • {exam.time}</p>
                </div>
              </div>
            ))}
            {filteredExams.length > 3 && (
              <p className="text-[10px] text-center text-slate-400">Ve diğer {filteredExams.length - 3} sınav...</p>
            )}
          </div>
        )}

        {/* Browser Notifications Integration Panel */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/60 transition">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-brand-500/10 text-brand-600">
                <Bell className={`w-3.5 h-3.5 ${permissionStatus === 'granted' && !localMuted ? 'animate-bounce' : ''}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Anlık Sınav Bildirimi</span>
            </div>
            
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
              permissionStatus === 'granted'
                ? localMuted
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-brand-600/10 text-brand-700 dark:text-brand-500 border border-brand-600/20'
            }`}>
              {permissionStatus === 'granted' ? (localMuted ? 'Sessiz' : 'Aktif') : 'Devre Dışı'}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            {permissionStatus === 'granted'
              ? localMuted
                ? 'Sınav bildirimleriniz geçici olarak sessize alındı.'
                : 'Masaüstü bildirimleri aktif. Bölüm sınavlarınız size anında push edilir.'
              : `${department} bölümü sınavları için anlık tarayıcı bildirimlerini etkinleştirin.`}
          </p>

          <div className="flex gap-2">
            {permissionStatus !== 'granted' ? (
              <button
                onClick={requestNotificationPermission}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-xl text-[10px] font-extrabold transition cursor-pointer shadow-sm shadow-brand-500/10 animate-pulse"
              >
                <Bell className="w-3.5 h-3.5" />
                Bildirim İzni İste
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                    localMuted
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  {localMuted ? (
                    <>
                      <Bell className="w-3 h-3" />
                      Aktif Et
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3 h-3" />
                      Sessize Al
                    </>
                  )}
                </button>

                <button
                  onClick={() => pushUpcomingExamNotifications(false)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-extrabold transition cursor-pointer shadow-sm shadow-brand-500/10"
                >
                  <Send className="w-3 h-3" />
                  Test Bildirimi Gönder
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            {department || "Bölüm Seçilmedi"} müfredatına göredir
          </span>
        </div>
      </div>

      {/* Floating System-like Notification Toast (AnimatePresence) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 250, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 250, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 text-white p-4 overflow-hidden"
          >
            {/* Ambient accent background glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              {/* App Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-brand-600/20">
                  YTÜ
                </div>
                <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 border border-slate-900">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-xs font-black text-brand-500 truncate tracking-wide">{toast.title}</p>
                  <button
                    onClick={() => setToast(null)}
                    className="text-slate-500 hover:text-white transition p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Body formatted */}
                <p className="text-xs text-slate-200 mt-1 whitespace-pre-line leading-relaxed font-medium">
                  {toast.body}
                </p>

                {/* Subtext info badges */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                  <span className="inline-flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {toast.isSimulated ? "Simüle Sınav Bildirimi" : "Sistem Anlık Bildirimi"}
                  </span>
                  
                  {toast.isSimulated && (
                    <span className="inline-flex items-center gap-0.5 text-brand-500 font-bold hover:underline cursor-pointer">
                      Sekmede Aç
                      <ExternalLink className="w-2 h-2" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Simulated progress timer bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
