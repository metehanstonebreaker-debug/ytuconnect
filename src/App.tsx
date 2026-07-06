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
import { UserPreferences, Post, Story } from './types';
import { MOCK_POSTS, DEPARTMENTS } from './mockData';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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

  // 3. Raw posts from Firestore cloud database
  const [rawPosts, setRawPosts] = useState<Post[]>([]);

  // 4. Raw stories from Firestore cloud database
  const [rawStories, setRawStories] = useState<Story[]>([]);

  // Local record of which posts have been liked by the user to calculate likedByMe on-the-fly
  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ytu_liked_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Derived state: Inject likedByMe status dynamically for a personalized user experience
  const posts = rawPosts.map(p => ({
    ...p,
    likedByMe: likedPostIds.includes(p.id)
  }));

  // Sync liked posts to localStorage
  useEffect(() => {
    localStorage.setItem('ytu_liked_posts', JSON.stringify(likedPostIds));
  }, [likedPostIds]);

  // Sync posts from Cloud Firestore database in real-time
  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Cloud database is empty. Seeding with official default posts...");
        for (let i = 0; i < MOCK_POSTS.length; i++) {
          const mockPost = MOCK_POSTS[i];
          const mockDocId = mockPost.id;
          const docRef = doc(db, 'posts', mockDocId);
          
          try {
            await setDoc(docRef, {
              author: mockPost.author,
              authorAvatar: mockPost.authorAvatar,
              time: mockPost.time,
              content: mockPost.content,
              likes: mockPost.likes || 0,
              field: mockPost.field,
              department: mockPost.department || null,
              club: mockPost.club || null,
              isPinned: mockPost.isPinned || false,
              image: mockPost.image || null,
              location: mockPost.location || null,
              createdAt: new Date(Date.now() - 3600000 * i).toISOString() // space them out
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `posts/${mockDocId}`);
          }
        }
      } else {
        const fetchedList: Post[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedList.push({
            id: doc.id,
            author: data.author,
            authorAvatar: data.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.author)}`,
            time: data.time || "Şimdi",
            content: data.content,
            likes: data.likes || 0,
            field: data.field,
            department: data.department || undefined,
            club: data.club || undefined,
            isPinned: data.isPinned || false,
            image: data.image || undefined,
            location: data.location || undefined,
            comments: data.comments || []
          });
        });
        setRawPosts(fetchedList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'posts');
    });

    return () => unsubscribe();
  }, []);

  // Sync stories from Cloud Firestore in real-time
  useEffect(() => {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Cloud stories database is empty. Seeding some initial stories...");
        const initialStories = [
          {
            author: "SKY LAB Kulübü",
            authorAvatar: "https://ui-avatars.com/api/?name=SKY+LAB&background=003057&color=EAAA00",
            content: "Yarın saat 14:00'te online Python workshopu var, kaçırmayın! 💻",
            gradientClass: "from-blue-600 via-indigo-600 to-purple-600",
            createdAt: new Date().toISOString()
          },
          {
            author: "Müzik Kulübü",
            authorAvatar: "https://ui-avatars.com/api/?name=Muzik&background=EAAA00&color=003057",
            content: "Beşiktaş Kampüsü orta bahçede akustik dinletimiz başladı! 🎸✨",
            gradientClass: "from-amber-500 via-rose-500 to-indigo-500",
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            author: "IEEE YTÜ",
            authorAvatar: "https://ui-avatars.com/api/?name=IEEE&background=003057&color=EAAA00",
            content: "Sektör Günleri etkinliği için kayıtlar açıldı! Link bio'da. ⚡🚀",
            gradientClass: "from-teal-500 to-emerald-500",
            createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
          }
        ];

        for (const story of initialStories) {
          try {
            await addDoc(storiesRef, story);
          } catch (err) {
            console.error("Error seeding story:", err);
          }
        }
      } else {
        const fetchedStories: Story[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out stories older than 24 hours
          const createdAtTime = new Date(data.createdAt).getTime();
          const isExpired = Date.now() - createdAtTime > 24 * 3600 * 1000;
          if (!isExpired) {
            fetchedStories.push({
              id: doc.id,
              author: data.author,
              authorAvatar: data.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.author)}`,
              content: data.content,
              createdAt: data.createdAt,
              gradientClass: data.gradientClass || "from-slate-700 to-slate-900",
              image: data.image || undefined,
              video: data.video || undefined,
              location: data.location || undefined,
              textX: data.textX !== undefined ? data.textX : 50,
              textY: data.textY !== undefined ? data.textY : 50
            });
          }
        });
        setRawStories(fetchedStories);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stories');
    });

    return () => unsubscribe();
  }, []);

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

  // Like / Unlike action on post (Cloud Firestore synchronized)
  const handleLikePost = async (postId: string) => {
    const isAlreadyLiked = likedPostIds.includes(postId);
    const targetPost = rawPosts.find(p => p.id === postId);
    if (!targetPost) return;

    const postRef = doc(db, 'posts', postId);
    const newLikesCount = isAlreadyLiked ? Math.max(0, targetPost.likes - 1) : targetPost.likes + 1;
    
    try {
      await updateDoc(postRef, {
        likes: newLikesCount
      });

      setLikedPostIds(prev => 
        isAlreadyLiked ? prev.filter(id => id !== postId) : [...prev, postId]
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
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

  // Create new post in feed in Cloud Firestore
  const handleAddPost = async (content: string, field: string, image?: string, location?: string) => {
    const newPostData = {
      author: preferences.username,
      authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`,
      time: "Şimdi",
      content,
      likes: 0,
      field,
      department: preferences.department || null,
      image: image || null,
      location: location || null,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'posts'), newPostData);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'posts');
    }
  };

  // Create new story in Cloud Firestore
  const handleAddStory = async (content: string, gradientClass: string, image?: string, video?: string, location?: string, textX?: number, textY?: number) => {
    const newStoryData = {
      author: preferences.username || "Yıldızlı",
      authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username || "Yildizli")}&background=EAAA00&color=003057`,
      content: content.trim(),
      gradientClass,
      image: image || null,
      video: video || null,
      location: location || null,
      textX: textX !== undefined ? textX : 50,
      textY: textY !== undefined ? textY : 50,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'stories'), newStoryData);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'stories');
    }
  };

  // Add comment to a post in Cloud Firestore
  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!commentContent.trim()) return;
    const targetPost = rawPosts.find(p => p.id === postId);
    if (!targetPost) return;

    const postRef = doc(db, 'posts', postId);
    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: preferences.username,
      authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`,
      content: commentContent.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(targetPost.comments || []), newComment];

    try {
      await updateDoc(postRef, {
        comments: updatedComments
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
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
                YILDIZ <span className="text-amber-600 dark:text-amber-400">CONNECT</span>
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
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
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
                      className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
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
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm cursor-pointer"
              title="Ayarlar"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Log Out button */}
            <button 
              onClick={handleResetApp}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white dark:hover:text-white text-rose-600 dark:text-rose-400 transition-all flex items-center justify-center shadow-sm cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
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
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 text-slate-800 dark:text-white rounded-2xl p-5 shadow-sm dark:shadow-lg border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-amber-400/5 rounded-full blur-xl" />
              
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-white/10">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`} 
                  className="w-12 h-12 rounded-2xl border-2 border-amber-500 dark:border-amber-400 shadow-md"
                  alt="Student Avatar"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">@{preferences.username}</h3>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-400/10 border border-amber-200/50 dark:border-amber-400/20 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {preferences.department.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Öğrenci Numarası:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{preferences.studentId || "21011043"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Aktif İlgi Alanı:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{preferences.interestedFields.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Aktif Filtre Sayısı:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{preferences.excludedCategories.length} adet</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={handleResetApp}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/20 dark:hover:bg-rose-600 dark:text-rose-400 dark:hover:text-white border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Çıkış Yap
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-200/60 dark:border-slate-800/80">
              <nav className="space-y-1">
                <button 
                  onClick={() => setShowOnlySaved(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left rounded-xl font-bold text-xs transition cursor-pointer ${
                    !showOnlySaved 
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-400/10'
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
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-400/10 font-bold'
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
            <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50/70 dark:from-indigo-950 dark:to-slate-900 text-slate-800 dark:text-white rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-950">
              <h4 className="text-xs font-black text-indigo-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
                Biliyor Muydunuz?
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Yıldız Connect ile kampüs akışınızı tamamen filtreleyebilirsiniz. İstemediğiniz kulüp, vize/bütünleme sınavları, veya yemekhane haberlerini <strong className="font-bold text-indigo-600 dark:text-amber-400">Ayarlar</strong> kısmından engelleyerek akışınızı sadeleştirebilirsiniz.
              </p>
            </div>
          </aside>

          {/* MIDDLE AREA: MAIN FEED CONTENT (6 Columns on Large Screen) */}
          <main className="col-span-1 lg:col-span-6 space-y-6">
            <Feed 
              posts={posts}
              preferences={preferences}
              stories={rawStories}
              onLikePost={handleLikePost}
              onAddPost={handleAddPost}
              onAddComment={handleAddComment}
              onRemoveExclude={handleRemoveExclude}
              savedPostIds={savedPostIds}
              onToggleSavePost={handleToggleSavePost}
              showOnlySaved={showOnlySaved}
              onClearSavedFilter={() => setShowOnlySaved(false)}
              onAddStory={handleAddStory}
            />
          </main>

          {/* RIGHT SIDEBAR: CAMPUS WEATHER & EXAM SCHEDULE (3 Columns on Large Screen) */}
          <aside className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* Campus Weather */}
            <WeatherWidget />

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
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Kampüste Bugün Popüler
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">#yildiz_hack_26</span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded">134 paylaşım</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">#davutpasa_ring_sirasi</span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded">98 paylaşım</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">#teknopark_staj</span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded">75 paylaşım</span>
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
