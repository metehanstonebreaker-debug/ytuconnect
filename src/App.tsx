/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import SettingsPanel from './components/SettingsPanel';
import Feed from './components/Feed';
import WeatherWidget from './components/WeatherWidget';
import ExamWidget from './components/ExamWidget';
import Chatbot from './components/Chatbot';
import GpaCalculator from './components/GpaCalculator';
import YemekhaneWidget from './components/YemekhaneWidget';
import { UserPreferences, Post } from './types';
import { MOCK_POSTS, DEPARTMENTS } from './mockData';
import { 
  Bell, 
  Settings, 
  Sun, 
  Moon, 
  Home, 
  BookOpen, 
  Users, 
  Bookmark, 
  Search,
  Menu,
  X,
  Plus,
  Compass,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  LogOut,
  Calendar,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // 1. Theme state (default to dark for YTÜ Cosmic layout, but toggleable)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ytu_dark_mode');
    return saved ? saved === 'true' : true;
  });

  // 2. User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('ytu_user_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      username: '',
      studentId: '',
      department: '',
      interestedFields: [],
      interestedClubs: [],
      excludedCategories: [],
      isOnboarded: false
    };
  });

  // 3. Posts feed list state (persisting new posts in state)
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('ytu_custom_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...MOCK_POSTS];
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_POSTS;
  });

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Yemekhane kart dolum sistemindeki arıza giderilmiştir.",
    "SKY LAB Güz Kampı başvuruları açıldı!",
    "Bölümler Arası Halı Saha Turnuvası kayıtları devam ediyor."
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Apply dark mode theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ytu_dark_mode', String(darkMode));
  }, [darkMode]);

  // Sync preferences to localStorage
  const handleOnboardingComplete = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('ytu_user_preferences', JSON.stringify(newPrefs));
  };

  const handleSaveSettings = (updatedPrefs: UserPreferences) => {
    setPreferences(updatedPrefs);
    localStorage.setItem('ytu_user_preferences', JSON.stringify(updatedPrefs));
  };

  const handleResetApp = () => {
    localStorage.removeItem('ytu_user_preferences');
    localStorage.removeItem('ytu_custom_posts');
    setPreferences({
      username: '',
      studentId: '',
      department: '',
      interestedFields: [],
      interestedClubs: [],
      excludedCategories: [],
      isOnboarded: false
    });
    setIsSettingsOpen(false);
  };

  // Like / Unlike action on post
  const handleLikePost = (postId: string) => {
    setPosts(prevPosts => {
      const updated = prevPosts.map(post => {
        if (post.id === postId) {
          const likedByMe = !post.likedByMe;
          return {
            ...post,
            likes: likedByMe ? post.likes + 1 : post.likes - 1,
            likedByMe
          };
        }
        return post;
      });
      return updated;
    });
  };

  // Saved posts state & toggle handler
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ytu_saved_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);

  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds(prev => {
      const updated = prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId];
      localStorage.setItem('ytu_saved_posts', JSON.stringify(updated));
      return updated;
    });
  };

  // Create new post in feed
  const handleAddPost = (content: string, field: string) => {
    const newPost: Post = {
      id: `custom_${Date.now()}`,
      author: preferences.username,
      authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`,
      time: "Şimdi",
      content,
      likes: 0,
      field
    };
    
    // Save in custom posts list
    const savedCustom = localStorage.getItem('ytu_custom_posts');
    let customList = [];
    if (savedCustom) {
      try {
        customList = JSON.parse(savedCustom);
      } catch (e) {}
    }
    customList.unshift(newPost);
    localStorage.setItem('ytu_custom_posts', JSON.stringify(customList));

    setPosts(prev => [newPost, ...prev]);
  };

  // Quick remove of a negative filter / excluded category
  const handleRemoveExclude = (category: string) => {
    const updatedExcludes = preferences.excludedCategories.filter(exc => exc !== category);
    const updatedPrefs = {
      ...preferences,
      excludedCategories: updatedExcludes
    };
    setPreferences(updatedPrefs);
    localStorage.setItem('ytu_user_preferences', JSON.stringify(updatedPrefs));
  };

  // Quick restore of exam category filter
  const handleRestoreExams = () => {
    handleRemoveExclude("Sınav");
  };

  // If user has not completed onboarding (or selected their info), render the login/preference screen
  if (!preferences.isOnboarded) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete} 
        initialPreferences={preferences}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans pb-16 lg:pb-0">
      
      {/* 1. TOP NAVBAR */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 dark:bg-amber-400 p-2 rounded-xl text-amber-400 dark:text-slate-900 font-black shadow-inner flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                YILDIZ <span className="text-amber-500 dark:text-amber-400">CONNECT</span>
              </h1>
              <p className="hidden md:block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                YTÜ DİJİTAL KAMPÜSÜ
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3.5 py-1.5 w-64 border border-slate-200 dark:border-slate-700/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Kampüste bir şey ara..." 
              className="bg-transparent border-none outline-none px-2 text-xs w-full text-slate-800 dark:text-white placeholder-slate-400"
              onClick={() => alert("Hızlı arama için lütfen aşağıdaki filtre çubuğunu kullanın.")}
            />
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Dark Mode */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors"
              title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 bg-rose-500 text-[9px] text-white font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Bildirimler</p>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-[10px] text-slate-400 hover:text-amber-500"
                    >
                      Tümünü temizle
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Yeni bildirim bulunmuyor.</p>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                          {notif}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:bg-amber-400 hover:text-slate-950 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center gap-1.5 text-xs shadow-sm"
              title="Tercihler ve Filtreler"
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span className="hidden sm:inline font-bold">Ayarlar</span>
            </button>

            {/* Profile badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`} 
                className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700"
                alt={preferences.username}
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-white">@{preferences.username}</p>
                <p className="text-[9px] text-slate-400">{preferences.studentId}</p>
              </div>
            </div>

            {/* Mobile Hamburger Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* 2. MAIN CONTAINER GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: NAVIGATION LINKS (3 Columns on Large Screen) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            
            {/* Quick Profile Info */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800/60 relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-amber-400/5 rounded-full blur-xl" />
              
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`} 
                  className="w-12 h-12 rounded-2xl border-2 border-amber-400 shadow-md"
                  alt="Student Avatar"
                />
                <div>
                  <h3 className="font-extrabold text-white text-sm">@{preferences.username}</h3>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {preferences.department.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Öğrenci Numarası:</span>
                  <span className="font-semibold text-white">{preferences.studentId || "21011043"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aktif İlgi Alanı:</span>
                  <span className="font-semibold text-white">{preferences.interestedFields.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aktif Filtre Sayısı:</span>
                  <span className="font-semibold text-rose-400">{preferences.excludedCategories.length} adet</span>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-200/60 dark:border-slate-800/80">
              <nav className="space-y-1">
                <button 
                  onClick={() => setShowOnlySaved(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left rounded-xl font-bold text-xs transition cursor-pointer ${
                    !showOnlySaved 
                      ? 'text-amber-500 bg-amber-500/5 border border-amber-400/10'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Home className="w-4 h-4" />
                    Kampüs Ana Sayfası
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => alert("Fakülte haberleri panosu yakında aktif edilecektir.")}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-left rounded-xl font-semibold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition border border-transparent"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" />
                    Akademik Panolar
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>

                <button 
                  onClick={() => alert("Kulüp portalı yakında aktif edilecektir.")}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-left rounded-xl font-semibold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition border border-transparent"
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    Kulüp Yönetimi
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>

                <button 
                  onClick={() => setShowOnlySaved(true)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left rounded-xl font-semibold text-xs transition cursor-pointer ${
                    showOnlySaved 
                      ? 'text-amber-500 bg-amber-500/5 border border-amber-400/10 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4" />
                    Kaydedilen Gönderiler
                  </span>
                  <div className="flex items-center gap-1.5">
                    {savedPostIds.length > 0 && (
                      <span className="bg-amber-400 text-slate-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full">
                        {savedPostIds.length}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </nav>
            </div>

            {/* Quick Info Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-indigo-950">
              <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 mb-2">
                <Compass className="w-4 h-4" />
                Biliyor Muydunuz?
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Yıldız Connect ile kampüs akışınızı tamamen filtreleyebilirsiniz. İstemediğiniz kulüp, vize/bütünleme sınavları, veya yemekhane haberlerini **Ayarlar** kısmından engelleyerek akışınızı sadeleştirebilirsiniz.
              </p>
            </div>
          </aside>

          {/* MIDDLE AREA: MAIN FEED CONTENT (6 Columns on Large Screen) */}
          <main className="col-span-1 lg:col-span-6 space-y-6">
            <Feed 
              posts={posts}
              preferences={preferences}
              onLikePost={handleLikePost}
              onAddPost={handleAddPost}
              onRemoveExclude={handleRemoveExclude}
              savedPostIds={savedPostIds}
              onToggleSavePost={handleToggleSavePost}
              showOnlySaved={showOnlySaved}
              onClearSavedFilter={() => setShowOnlySaved(false)}
            />
          </main>

          {/* RIGHT SIDEBAR: CAMPUS WEATHER & EXAM SCHEDULE (3 Columns on Large Screen) */}
          <aside className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* Campus Weather */}
            <WeatherWidget />

            {/* Yemekhane Menüsü */}
            <YemekhaneWidget />

            {/* Exam Schedule (Filtered) */}
            <ExamWidget 
              department={preferences.department}
              isFilteredOut={preferences.excludedCategories.includes("Sınav")}
              onRestore={handleRestoreExams}
            />

            {/* GPA / AGNO Calculator */}
            <GpaCalculator />

            {/* Fast Stats / Trending Topics */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80">
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Kampüste Bugün Popüler
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">#yildiz_hack_26</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded">134 paylaşım</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">#davutpasa_ring_sirasi</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded">98 paylaşım</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">#teknopark_staj</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded">75 paylaşım</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* 3. MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col justify-center items-center p-6 text-white space-y-6">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-black text-amber-400">YILDIZ CONNECT</h2>
            <p className="text-xs text-slate-400 mt-1">@{preferences.username} | {preferences.department}</p>
          </div>

          <div className="w-full max-w-xs space-y-3 text-center">
            <button 
              onClick={() => { setIsMobileMenuOpen(false); }} 
              className="w-full py-3 bg-slate-800/80 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Ana Sayfa
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); setIsSettingsOpen(true); }} 
              className="w-full py-3 bg-amber-400 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" /> Ayarlar & Filtreler
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); handleResetApp(); }} 
              className="w-full py-3 bg-rose-950/60 border border-rose-800 text-rose-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Çıkış Yap / Reset
            </button>
          </div>
        </div>
      )}

      {/* 4. SETTINGS DRAWER PANEL */}
      {isSettingsOpen && (
        <SettingsPanel 
          preferences={preferences}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          onReset={handleResetApp}
        />
      )}

      {/* 5. BOTTOM NAVIGATION BAR FOR MOBILE DEVICES */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 flex justify-between items-center z-40">
        <button 
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            !showOnlySaved 
              ? 'text-amber-500 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500'
          }`}
          onClick={() => { setShowOnlySaved(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px]">Akış</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 transition cursor-pointer relative ${
            showOnlySaved 
              ? 'text-amber-500 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500'
          }`}
          onClick={() => { setShowOnlySaved(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Bookmark className="w-5 h-5" />
          {savedPostIds.length > 0 && (
            <span className="absolute top-0 right-1.5 bg-amber-500 text-slate-950 font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-slate-900 scale-95">
              {savedPostIds.length}
            </span>
          )}
          <span className="text-[9px]">Kayıtlılar</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          onClick={() => { setIsSettingsOpen(true); }}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold">Ayarlar</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          onClick={handleResetApp}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-bold">Sıfırla</span>
        </button>
      </div>

      {/* AI Powered Chatbot */}
      <Chatbot preferences={preferences} />

    </div>
  );
}
