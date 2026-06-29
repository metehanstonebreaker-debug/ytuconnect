/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DEPARTMENTS, INTEREST_FIELDS, CLUBS } from '../mockData';
import { UserPreferences } from '../types';
import { 
  X, 
  Save, 
  User, 
  Sliders, 
  GraduationCap, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  EyeOff,
  Plus,
  Trash2,
  Info
} from 'lucide-react';

interface SettingsPanelProps {
  preferences: UserPreferences;
  onSave: (updatedPrefs: UserPreferences) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function SettingsPanel({ preferences, onSave, onClose, onReset }: SettingsPanelProps) {
  const [username, setUsername] = useState(preferences.username);
  const [studentId, setStudentId] = useState(preferences.studentId);
  const [department, setDepartment] = useState(preferences.department);
  const [selectedFields, setSelectedFields] = useState<string[]>(preferences.interestedFields);
  const [selectedClubs, setSelectedClubs] = useState<string[]>(preferences.interestedClubs);
  
  // Excluded content types / fields / keywords
  const [excludedCategories, setExcludedCategories] = useState<string[]>(preferences.excludedCategories || []);
  const [customFilterInput, setCustomFilterInput] = useState('');

  const handleSave = () => {
    if (!username.trim()) return;
    
    onSave({
      username: username.trim(),
      studentId: studentId.trim(),
      department,
      interestedFields: selectedFields,
      interestedClubs: selectedClubs,
      excludedCategories,
      isOnboarded: true
    });
    onClose();
  };

  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const toggleClub = (clubId: string) => {
    if (selectedClubs.includes(clubId)) {
      setSelectedClubs(selectedClubs.filter(c => c !== clubId));
    } else {
      setSelectedClubs([...selectedClubs, clubId]);
    }
  };

  // Toggle filter keywords or categories (e.g., hiding 'Spor', 'Sınav', 'Kariyer', etc.)
  const toggleExcludedCategory = (category: string) => {
    if (excludedCategories.includes(category)) {
      setExcludedCategories(excludedCategories.filter(item => item !== category));
    } else {
      setExcludedCategories([...excludedCategories, category]);
    }
  };

  const addCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customFilterInput.trim().toLowerCase();
    if (clean && !excludedCategories.includes(clean)) {
      setExcludedCategories([...excludedCategories, clean]);
      setCustomFilterInput('');
    }
  };

  const removeExcludedCategory = (item: string) => {
    setExcludedCategories(excludedCategories.filter(x => x !== item));
  };

  // Predefined filter options to easily toggle
  const PREDEFINED_EXCLUDES = [
    { id: "Spor", label: "Spor Paylaşımları", desc: "Turnuva, maç ve spor kulübü duyuruları" },
    { id: "Sınav", label: "Sınav Takvimi & Akademik Sınavlar", desc: "Haftalık sınav takvimi ve ders projeleri" },
    { id: "Kültür & Sanat", label: "Kültür, Sanat & Tiyatro", desc: "Atölyeler, konserler ve sanatsal aktiviteler" },
    { id: "Kariyer & Staj", label: "Kariyer & Staj İlanları", desc: "Teknopark ilanları ve iş arama paylaşımları" },
    { id: "Sosyal & Eğlence", label: "Eğlence & Mizah", desc: "Geyik paylaşımları, ring sırası esprileri" }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex justify-end">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400/10 p-2 rounded-xl border border-amber-400/20">
              <Sliders className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Hesap ve İçerik Ayarları</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tercihlerinizi ve gizlenen içerik filtrelerini yönetin</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Kişisel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4" />
              1. Kişisel Profil Bilgileri
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Öğrenci Adı / Kullanıcı Adı</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Öğrenci Numarası</label>
                <input 
                  type="text"
                  maxLength={8}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Eğitim Bölümü</label>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: İlgi Alanları ve Kulüpler */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              2. İlgi Alanları ve Takip Edilen Kulüpler
            </h3>

            {/* Interest Area Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">İlgi Alanları</label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_FIELDS.map((field) => {
                  const isSelected = selectedFields.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      onClick={() => toggleField(field.id)}
                      className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2 cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-400/10 border-amber-400 text-slate-900 dark:text-white font-medium' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : <span className="w-3.5 h-3.5 block bg-transparent" />}
                      </div>
                      <span className="text-xs">{field.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Club Toggle Badges */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Takip Edilen Kulüpler</label>
              <div className="flex flex-wrap gap-1.5">
                {CLUBS.map((club) => {
                  const isSelected = selectedClubs.includes(club.id);
                  return (
                    <button
                      key={club.id}
                      onClick={() => toggleClub(club.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <span>{club.logo}</span>
                      <span>{club.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Akıllı İçerik Filtreleme */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-800/80 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                3. Akıllı İçerik Filtreleme (Negatif Filtre)
              </h3>
              <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                {excludedCategories.length} Aktif Filtre
              </span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Kampüs akışınızda **görmek istemediğiniz** konu veya kategorileri buradan seçerek anında filtreleyebilirsiniz. Filtrelenen içerikler ana sayfanızdan tamamen gizlenecektir.
            </p>

            {/* Filter checkboxes */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
              {PREDEFINED_EXCLUDES.map((item) => {
                const isExcluded = excludedCategories.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleExcludedCategory(item.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                      isExcluded 
                        ? 'bg-rose-500/5 border-rose-500/40 text-slate-900 dark:text-white' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded ${isExcluded ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {isExcluded ? <X className="w-3 h-3 stroke-[3px]" /> : <span className="w-3 h-3 block bg-transparent" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    {isExcluded && (
                      <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider bg-rose-500/10 px-1.5 py-0.5 rounded">
                        Gizlendi
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Keyword Blocklist */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Kelime veya Kulüp Bazlı Özel Engel Filtresi</label>
              <form onSubmit={addCustomFilter} className="flex gap-2">
                <input 
                  type="text"
                  value={customFilterInput}
                  onChange={(e) => setCustomFilterInput(e.target.value)}
                  placeholder="Engellemek istediğiniz kelime (örn: staj, yemekhane, ieee)"
                  className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-400 placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ekle
                </button>
              </form>

              {/* Custom Badges */}
              {excludedCategories.some(cat => !PREDEFINED_EXCLUDES.some(p => p.id === cat)) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {excludedCategories
                    .filter(cat => !PREDEFINED_EXCLUDES.some(p => p.id === cat))
                    .map((cat) => (
                      <span 
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-900/45 rounded-full text-[10px] font-bold"
                      >
                        "{cat}"
                        <button 
                          type="button" 
                          onClick={() => removeExcludedCategory(cat)}
                          className="hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm("Bütün profilinizi ve tercihlerinizi sıfırlayıp giriş ekranına geri dönmek istiyor musunuz?")) {
                onReset();
              }
            }}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:border-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Hesabı Sıfırla / Log Out
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-4.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-400/5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
