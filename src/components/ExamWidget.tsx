/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MOCK_EXAMS } from '../mockData';
import { Calendar, AlertCircle, Info, Eye } from 'lucide-react';

interface ExamWidgetProps {
  department: string;
  isFilteredOut: boolean;
  onRestore: () => void;
}

export default function ExamWidget({ department, isFilteredOut, onRestore }: ExamWidgetProps) {
  // Filter exams that belong to the user's selected department OR general courses
  const filteredExams = MOCK_EXAMS.filter(exam => {
    return exam.department === "Genel Mühendislik" || exam.department === department;
  });

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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          Filtreyi Kaldır
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80 border-t-4 border-t-red-500 transition hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-red-500" />
          Kişisel Sınav Takvimi
        </h3>
        <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 rounded">
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
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2 rounded-lg text-center min-w-[45px] border border-red-100/50 dark:border-red-900/20">
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
      
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          {department} müfredatına göredir
        </span>
      </div>
    </div>
  );
}
