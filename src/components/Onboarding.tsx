/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEPARTMENTS, FACULTIES, INTEREST_FIELDS, CLUBS } from '../mockData';
import { UserPreferences } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Camera,
  Trash2
} from 'lucide-react';

const GRADIENT_AVATARS = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23F59E0B'/><stop offset='100%' stop-color='%23EF4444'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g1)'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%233B82F6'/><stop offset='100%' stop-color='%238B5CF6'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g2)'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310B981'/><stop offset='100%' stop-color='%2306B6D4'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g3)'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23EC4899'/><stop offset='100%' stop-color='%23F43F5E'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g4)'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g5' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%236366F1'/><stop offset='100%' stop-color='%234F46E5'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g5)'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g6' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23111827'/><stop offset='100%' stop-color='%231F2937'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g6)'/></svg>"
];

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
  initialPreferences?: UserPreferences;
}

export default function Onboarding({ onComplete, initialPreferences }: OnboardingProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(initialPreferences?.username || '');
  const [studentId, setStudentId] = useState(initialPreferences?.studentId || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarType, setAvatarType] = useState<'default' | 'preset' | 'upload' | 'url'>('default');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialFacultyObj = FACULTIES.find(f => f.departments.includes(initialPreferences?.department || ''));
  const [selectedFaculty, setSelectedFaculty] = useState<string>(initialFacultyObj?.name || '');
  const [department, setDepartment] = useState(initialPreferences?.department || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(initialPreferences?.interestedFields || []);
  const [selectedClubs, setSelectedClubs] = useState<string[]>(initialPreferences?.interestedClubs || []);
  
  const [excludedCategories] = useState<string[]>(initialPreferences?.excludedCategories || []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası yükleyin.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Görsel boyutu 8MB\'dan küçük olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            setSelectedAvatar(compressedBase64);
            setAvatarType('upload');
          } catch (err) {
            console.error(err);
            setError('Görsel işlenirken bir hata oluştu.');
          }
        }
      };
      img.onerror = () => {
        setError('Görsel dosyası yüklenirken bir hata oluştu.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setError('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep1 = async () => {
    setError('');
    
    if (!username.trim()) {
      setError('Lütfen bir kullanıcı adı / nickname girin.');
      return;
    }

    if (studentId.length !== 8) {
      setError('Öğrenci numarası tam olarak 8 haneli olmalıdır.');
      return;
    }

    if (!password) {
      setError('Lütfen şifrenizi belirleyin.');
      return;
    }

    if (password.length < 4) {
      setError('Şifre en az 4 karakterden oluşmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler birbiriyle uyuşmuyor.');
      return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'registered_users', studentId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setError('Bu okul numarası ile zaten kayıtlı bir hesap var! Lütfen giriş yapın.');
        setIsLoading(false);
        return;
      }
      
      // Proceed to Step 2
      setStep(2);
    } catch (e) {
      console.error(e);
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (studentId.length !== 8) {
      setError('Lütfen 8 haneli öğrenci numaranızı girin.');
      return;
    }
    
    if (!password) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'registered_users', studentId);
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        setError('Bu öğrenci numarasıyla kayıtlı bir hesap bulunamadı.');
        setIsLoading(false);
        return;
      }

      const userData = userSnapshot.data();
      if (userData.password !== password) {
        setError('Şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.');
        setIsLoading(false);
        return;
      }

      // Successful login
      onComplete({
        username: userData.username,
        studentId: userData.studentId,
        department: userData.department || 'Genel',
        interestedFields: userData.interestedFields || [],
        interestedClubs: userData.interestedClubs || [],
        excludedCategories: [],
        isOnboarded: true,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=f59e0b&color=003057`
      });
    } catch (e) {
      console.error(e);
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleRegistrationComplete = async () => {
    setError('');
    setIsLoading(true);
    
    const finalAvatar = selectedAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim() || 'Y')}&background=f59e0b&color=003057`;
    
    const newUserPreferences: UserPreferences = {
      username: username.trim(),
      studentId: studentId.trim(),
      department,
      interestedFields: selectedFields.length > 0 ? selectedFields : [INTEREST_FIELDS[0].id, INTEREST_FIELDS[1].id],
      interestedClubs: selectedClubs,
      excludedCategories,
      isOnboarded: true,
      avatar: finalAvatar
    };

    try {
      // Save new user profile to Firestore
      const userDocRef = doc(db, 'registered_users', studentId);
      await setDoc(userDocRef, {
        studentId: studentId.trim(),
        username: username.trim(),
        password,
        department,
        interestedFields: selectedFields.length > 0 ? selectedFields : [INTEREST_FIELDS[0].id, INTEREST_FIELDS[1].id],
        interestedClubs: selectedClubs,
        avatar: finalAvatar,
        createdAt: new Date().toISOString()
      });

      // Complete onboarding
      onComplete(newUserPreferences);
    } catch (e) {
      console.error(e);
      setError('Hesap kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
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
      case 'Code': return <Terminal className="w-5 h-5 text-brand-500" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-brand-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-brand-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-brand-500" />;
      case 'Palette': return <Palette className="w-5 h-5 text-brand-500" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-brand-500" />;
      default: return <Compass className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-600/5 blur-[100px] pointer-events-none" />
      
      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-gradient-to-tr from-brand-600 to-brand-500 p-2.5 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-slate-900 font-bold" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            YILDIZ <span className="text-brand-500">CONNECT</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">YTÜ Dijital Kampüsüne Giriş veya Kayıt Paneli</p>
        </div>

        {/* Mode Selector Toggle (Only show on Step 1) */}
        {step === 1 && (
          <div className="flex bg-slate-950/60 p-1 rounded-xl mb-6 border border-slate-800/60">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
          </div>
        )}

        {/* Progress Dots (Only in registration mode) */}
        {mode === 'register' && (
          <div className="flex justify-center space-x-2.5 mb-6">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step 
                    ? 'w-8 bg-brand-500'
                    : s < step 
                      ? 'w-2 bg-brand-600' 
                      : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        )}

        {/* Global Error Display */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            /* LOGIN CARD */
            <motion.form
              key="loginForm"
              onSubmit={handleLoginSubmit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Öğrenci Numarası (8 Haneli)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    maxLength={8}
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                    placeholder="Örn: 21011043"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifreniz"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold rounded-xl flex items-center justify-center gap-2 transition transform active:scale-[0.98] shadow-lg shadow-brand-600/10 cursor-pointer text-sm"
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </motion.form>
          ) : (
            /* REGISTER CARD FLOW */
            <div>
              {step === 1 && (
                <motion.div
                  key="regStep1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Preset Avatar Picker */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      Profil Fotoğrafı
                    </label>
                                     {/* Live Preview and Current selection description */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl border-2 border-brand-500 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center shadow-lg">
                          {avatarType === 'default' ? (
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim() || 'Y')}&background=f59e0b&color=003057&size=128&bold=true`} 
                              className="w-full h-full object-cover" 
                              alt="Default Initial Avatar" 
                            />
                          ) : selectedAvatar ? (
                            <img 
                              src={selectedAvatar} 
                              className="w-full h-full object-cover" 
                              alt="Selected Avatar" 
                            />
                          ) : (
                            <Camera className="w-6 h-6 text-slate-500" />
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-brand-500 font-extrabold py-0.5 leading-none uppercase">
                            Önizleme
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">
                            {avatarType === 'default' && "Varsayılan (Baş Harfler)"}
                            {avatarType === 'preset' && "Seçilen Renkli Degrade"}
                            {avatarType === 'upload' && "Yüklenen Görsel"}
                            {avatarType === 'url' && "Web Linki Görseli"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            {avatarType === 'default' && "YTÜ renklerinde (Sarı-Lacivert) baş harflerinizle otomatik oluşturulur."}
                            {avatarType === 'preset' && "Modern, soyut ve insan yüzü içermeyen renk geçişi."}
                            {avatarType === 'upload' && "Cihazınızdan seçtiğiniz özel profil fotoğrafı."}
                            {avatarType === 'url' && "İnternet üzerindeki bir resim linki."}
                          </p>
                        </div>
                      </div>

                      {/* Mode selection buttons */}
                      <div className="grid grid-cols-4 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => { setAvatarType('default'); setSelectedAvatar(''); }}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                            avatarType === 'default' 
                              ? 'bg-slate-800 text-brand-500 shadow-sm' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Varsayılan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAvatarType('preset'); setSelectedAvatar(GRADIENT_AVATARS[0]); }}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                            avatarType === 'preset' 
                              ? 'bg-slate-800 text-brand-500 shadow-sm' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Palette className="w-3.5 h-3.5" />
                          <span>Degradeler</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarType('upload')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                            avatarType === 'upload' 
                              ? 'bg-slate-800 text-brand-500 shadow-sm' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Yükle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarType('url')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                            avatarType === 'url' 
                              ? 'bg-slate-800 text-brand-500 shadow-sm' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Link</span>
                        </button>
                      </div>

                      {/* Sub-panel */}
                      <div className="pt-1">
                        {avatarType === 'default' && (
                          <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50 text-center font-medium">
                            Profil fotoğrafı seçmediniz. Sistem, <span className="text-brand-500 font-bold">@{username || 'kullanıcı_adı'}</span> için dinamik bir harf görseli kullanacak.
                          </div>
                        )}

                        {avatarType === 'preset' && (
                          <div className="flex gap-2 justify-center items-center py-1">
                            {GRADIENT_AVATARS.map((av, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedAvatar(av)}
                                className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden shrink-0 ${
                                  selectedAvatar === av 
                                    ? 'border-brand-500 scale-110 shadow-lg' 
                                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:scale-105'
                                }`}
                              >
                                <img src={av} className="w-full h-full object-cover" alt={`Gradient ${index}`} />
                              </button>
                            ))}
                          </div>
                        )}

                        {avatarType === 'upload' && (
                          <div className="space-y-2">
                            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/50 rounded-xl cursor-pointer transition">
                              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                <Upload className="w-5 h-5 text-slate-500 mb-1" />
                                <p className="text-[10px] text-slate-400 font-bold">Kendi Görselini Seç</p>
                                <p className="text-[8px] text-slate-500 mt-0.5">PNG, JPG (En fazla 8MB)</p>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="hidden" 
                              />
                            </label>
                            {selectedAvatar && avatarType === 'upload' && (
                              <div className="flex justify-between items-center text-[10px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                                <span className="text-emerald-400 font-bold truncate pr-2">Görsel başarıyla yüklendi!</span>
                                <button 
                                  type="button" 
                                  onClick={() => { setSelectedAvatar(''); setAvatarType('default'); }}
                                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Sil
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {avatarType === 'url' && (
                          <div className="space-y-2">
                            <input 
                              type="url"
                              value={customUrl}
                              onChange={(e) => {
                                setCustomUrl(e.target.value);
                                setSelectedAvatar(e.target.value);
                              }}
                              placeholder="https://example.com/profil.jpg"
                              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 px-3 text-white text-[11px] placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                            />
                            <p className="text-[8px] text-slate-500 leading-normal">
                              Resmin doğrudan bir görsel linki (.jpg, .png vb.) olduğundan emin olun.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Nickname / Kullanıcı Adı <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        @
                      </span>
                      <input 
                        type="text" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                        placeholder="Örn: metehan_kaya"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Okul Numarası (8 Haneli) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <Hash className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        maxLength={8}
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                        placeholder="Örn: 22011082"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                      />
                    </div>
                  </div>

                  {/* Password 1 */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Şifre Belirleyin <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifre"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password 2 (Matched confirmation) */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Şifreyi Tekrar Yazın <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifreyi onaylayın"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || !username.trim() || studentId.length !== 8 || !password || password !== confirmPassword}
                    onClick={handleNextStep1}
                    className={`w-full mt-2 py-3 bg-brand-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-lg cursor-pointer text-xs`}
                  >
                    {isLoading ? 'Kontrol Ediliyor...' : 'Akademik Adıma Geç'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="regStep2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-brand-500" />
                      Akademik Bilgileriniz
                    </h2>
                    <p className="text-slate-400 text-[11px] mb-3">
                      Sınav takviminizi ve akışınızı size özel hazırlamak için bölümünüzü seçin.
                    </p>

                    <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1.5 custom-scrollbar bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">
                      {FACULTIES.map((fac) => (
                        <div key={fac.name} className="space-y-1.5">
                          <div className="border-b border-slate-800 pb-0.5 mt-1">
                            <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">{fac.name}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
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
                                  className={`w-full p-2 rounded-xl text-left font-bold transition flex items-center justify-between border cursor-pointer ${
                                    isSelected
                                      ? 'bg-brand-500/10 border-brand-500 text-white'
                                      : 'bg-slate-950/60 border-slate-900 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[11px] truncate">{dept}</span>
                                  {isSelected && (
                                    <div className="bg-brand-500 p-0.5 rounded-full shrink-0">
                                      <Check className="w-3 h-3 text-slate-950 stroke-[3px]" />
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

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Geri
                    </button>
                    <button
                      type="button"
                      disabled={!selectedFaculty || !department}
                      onClick={() => setStep(3)}
                      className={`w-2/3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition duration-200 shadow-lg cursor-pointer ${
                        selectedFaculty && department
                          ? 'bg-brand-500 hover:bg-brand-600 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Devam Et
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="regStep3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-500" />
                      İlgi Alanları & Kulüpler
                    </h2>
                    <p className="text-slate-400 text-[11px] mb-3">
                      İlgi alanlarınızı ve takip edeceğiniz kulüpleri seçin. Akışınız bunlara göre şekillenecek!
                    </p>

                    {/* Fields */}
                    <div className="mb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">İlgi Alanları</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {INTEREST_FIELDS.map((field) => {
                          const isSelected = selectedFields.includes(field.id);
                          return (
                            <button
                              key={field.id}
                              type="button"
                              onClick={() => toggleField(field.id)}
                              className={`p-2 rounded-xl border text-left transition flex items-center gap-1.5 cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                              }`}
                            >
                              {getIcon(field.icon)}
                              <span className="text-[11px] font-semibold truncate">{field.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Clubs */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Takip Edilecek Kulüpler</span>
                        <span className="text-[10px] text-brand-500 font-bold">{selectedClubs.length} seçildi</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1.5 custom-scrollbar bg-slate-950/40 border border-slate-800 p-2 rounded-2xl">
                        {CLUBS.map((club) => {
                          const isSelected = selectedClubs.includes(club.id);
                          return (
                            <button
                              key={club.id}
                              type="button"
                              onClick={() => toggleClub(club.id)}
                              className={`p-2 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected 
                                  ? 'bg-brand-500/10 border-brand-500 text-white shadow-sm' 
                                  : 'bg-slate-950/60 border-slate-900 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg shrink-0">{club.logo}</span>
                                <span className="text-[11px] font-bold truncate text-white">{club.name}</span>
                              </div>
                              <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-brand-500 border-brand-500 text-slate-950' 
                                  : 'border-slate-800 text-transparent'
                              }`}>
                                <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-1/4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleRegistrationComplete}
                      className="w-3/4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition transform active:scale-[0.98] shadow-lg text-xs cursor-pointer"
                    >
                      {isLoading ? 'Kaydediliyor...' : 'Hesabı Oluştur & Giriş Yap'}
                      <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
