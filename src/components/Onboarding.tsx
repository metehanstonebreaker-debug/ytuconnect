/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEPARTMENTS, FACULTIES, INTEREST_FIELDS, CLUBS } from '../mockData';
import { UserPreferences } from '../types';
import { 
  User, 
  Hash, 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Terminal, 
  Trophy, 
  Palette, 
  Briefcase, 
  BookOpen,
  Compass,
  ArrowRight
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
  initialPreferences?: UserPreferences;
}

export default function Onboarding({ onComplete, initialPreferences }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(initialPreferences?.username || '');
  const [studentId, setStudentId] = useState(initialPreferences?.studentId || '');
  const initialFacultyObj = FACULTIES.find(f => f.departments.includes(initialPreferences?.department || ''));
  const [selectedFaculty, setSelectedFaculty] = useState<string>(initialFacultyObj?.name || '');
  const [department, setDepartment] = useState(initialPreferences?.department || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(initialPreferences?.interestedFields || []);
  const [selectedClubs, setSelectedClubs] = useState<string[]>(initialPreferences?.interestedClubs || []);
  
  // Excluded categories can also be selected or adjusted later in settings
  const [excludedCategories, setExcludedCategories] = useState<string[]>(initialPreferences?.excludedCategories || []);

  const handleNext = () => {
    if (step === 1 && !username.trim()) {
      return; // Name is required
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    onComplete({
      username: username.trim(),
      studentId: studentId.trim() || '26000000',
      department,
      interestedFields: selectedFields.length > 0 ? selectedFields : [INTEREST_FIELDS[0].id, INTEREST_FIELDS[1].id],
      interestedClubs: selectedClubs,
      excludedCategories,
      isOnboarded: true,
    });
  };

  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter((f) => f !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const toggleClub = (clubId: string) => {
    if (selectedClubs.includes(clubId)) {
      setSelectedClubs(selectedClubs.filter((c) => c !== clubId));
    } else {
      setSelectedClubs([...selectedClubs, clubId]);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Terminal className="w-5 h-5 text-indigo-500" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'Palette': return <Palette className="w-5 h-5 text-pink-500" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-red-500" />;
      default: return <Compass className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      
      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-tr from-amber-500 to-yellow-400 p-2.5 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-slate-900 font-bold" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            YILDIZ <span className="text-amber-400">CONNECT</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">YTÜ Dijital Kampüsüne Giriş Yapın</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2.5 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-8 bg-amber-400' 
                  : s < step 
                    ? 'w-2 bg-indigo-500' 
                    : 'w-2 bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  Kişisel Bilgileriniz
                </h2>
                <p className="text-slate-400 text-xs mb-4">
                  Kampüste sizi tanımamız için isminizi ve isteğe bağlı öğrenci numaranızı girin.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Adınız Soyadınız / Kullanıcı Adı <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        @
                      </span>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Örn: yildiz_ogrenci"
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Öğrenci Numarası <span className="text-slate-500 text-[10px]">(İsteğe Bağlı)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <Hash className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        maxLength={8}
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                        placeholder="Örn: 21011043"
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={!username.trim()}
                onClick={handleNext}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition duration-200 shadow-lg ${
                  username.trim() 
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 active:scale-[0.98]' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Devam Et
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Akademik Bilgileriniz
                </h2>
                <p className="text-slate-400 text-xs mb-3.5">
                  Kampüs akışınızı ve sınav takviminizi size özel hazırlamak için fakültelerdeki bütün bölümler arasından bölümünüzü seçin.
                </p>

                {/* All Faculties & Departments scrollable list */}
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1.5 custom-scrollbar bg-slate-950/40 border border-slate-700/40 p-3.5 rounded-2xl">
                  {FACULTIES.map((fac) => (
                    <div key={fac.name} className="space-y-2">
                      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 mt-1">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{fac.name}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {fac.departments.map((dept) => {
                          const isSelected = department === dept;
                          return (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => {
                                setDepartment(dept);
                                setSelectedFaculty(fac.name);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left font-semibold transition flex items-center justify-between border cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                              }`}
                            >
                              <span className="text-xs truncate">{dept}</span>
                              {isSelected && (
                                <div className="bg-amber-400 p-0.5 rounded-full shrink-0">
                                  <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBack}
                  className="w-1/3 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Geri
                </button>
                <button
                  disabled={!selectedFaculty || !department}
                  onClick={handleNext}
                  className={`w-2/3 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition duration-200 shadow-lg cursor-pointer ${
                    selectedFaculty && department
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 active:scale-[0.98]'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Devam Et
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  İlgi Alanları & Kulüpler
                </h2>
                <p className="text-slate-400 text-xs mb-3">
                  İlgi duyduğunuz alanları ve takip etmek istediğiniz kulüpleri seçin. Ana sayfanız buna göre şekillenecek!
                </p>

                {/* Fields Section */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">İlgi Alanları</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {INTEREST_FIELDS.map((field) => {
                      const isSelected = selectedFields.includes(field.id);
                      return (
                        <button
                          key={field.id}
                          onClick={() => toggleField(field.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                              : 'bg-slate-900/40 border-slate-700/60 text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                          }`}
                        >
                          {getIcon(field.icon)}
                          <span className="text-xs font-semibold truncate">{field.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clubs Section with overhauled interface */}
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5 flex justify-between items-center">
                    <span>Takip Etmek İstediğiniz Kulüpler</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{selectedClubs.length} seçildi</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1.5 custom-scrollbar bg-slate-950/40 border border-slate-700/40 p-2.5 rounded-2xl">
                    {CLUBS.map((club) => {
                      const isSelected = selectedClubs.includes(club.id);
                      return (
                        <button
                          key={club.id}
                          type="button"
                          onClick={() => toggleClub(club.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-400/10 border-amber-400 text-white shadow-md' 
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                          }`}
                        >
                          <span className="text-xl bg-slate-800/80 p-1 rounded-lg shrink-0">{club.logo}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate text-white">{club.name}</p>
                            <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed leading-snug">{club.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-amber-400 border-amber-400 text-slate-950' 
                              : 'border-slate-600 text-transparent'
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBack}
                  className="w-1/4 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition active:scale-[0.98] cursor-pointer"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  className="w-3/4 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition transform active:scale-[0.98] shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Sisteme Giriş Yap
                  <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
