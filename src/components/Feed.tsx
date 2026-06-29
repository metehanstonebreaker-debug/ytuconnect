/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, UserPreferences } from '../types';
import { CLUBS, INTEREST_FIELDS } from '../mockData';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  AlertCircle,
  Pin,
  Image,
  MapPin,
  Sparkles,
  Search,
  FilterX,
  Plus,
  Bookmark
} from 'lucide-react';

interface FeedProps {
  posts: Post[];
  preferences: UserPreferences;
  onLikePost: (postId: string) => void;
  onAddPost: (content: string, field: string) => void;
  onRemoveExclude: (category: string) => void;
  savedPostIds: string[];
  onToggleSavePost: (postId: string) => void;
  showOnlySaved: boolean;
  onClearSavedFilter: () => void;
}

export default function Feed({ 
  posts, 
  preferences, 
  onLikePost, 
  onAddPost, 
  onRemoveExclude,
  savedPostIds = [],
  onToggleSavePost,
  showOnlySaved = false,
  onClearSavedFilter
}: FeedProps) {
  const [newPostText, setNewPostText] = useState('');
  const [selectedField, setSelectedField] = useState(INTEREST_FIELDS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'dept' | 'clubs'>('all');

  // Filter posts based on:
  // 1. Saved status (if showOnlySaved is active)
  // 2. Department (if the tab is 'dept', or if it's general, prioritize or filter)
  // 3. Excluded Categories / negative filters
  // 4. Search query
  // 5. Interested fields / clubs (if we are in personalized mode, we can highlight them)
  
  const filteredPosts = posts.filter(post => {
    // A. Saved filter (if active)
    if (showOnlySaved && !savedPostIds.includes(post.id)) {
      return false;
    }

    // B. Negative filters / Excluded categories
    // 1. Predefined categories (e.g. 'Spor', 'Kariyer & Staj', 'Kültür & Sanat', 'Sosyal & Eğlence', 'Akademik')
    const matchesExcludedCategory = preferences.excludedCategories.some(exc => {
      // If exam matches
      if (exc === "Sınav" && (post.content.toLowerCase().includes("sınav") || post.content.toLowerCase().includes("vize") || post.content.toLowerCase().includes("bütünleme"))) {
        return true;
      }
      return post.field === exc || (post.club && post.club === exc);
    });
    if (matchesExcludedCategory) return false;

    // 2. Custom keywords filter (check if post content includes any custom excluded word)
    const matchesCustomKeyword = preferences.excludedCategories.some(exc => {
      const isPredefined = ["Spor", "Sınav", "Kültür & Sanat", "Kariyer & Staj", "Sosyal & Eğlence"].includes(exc);
      if (!isPredefined) {
        return post.content.toLowerCase().includes(exc.toLowerCase()) || 
               post.author.toLowerCase().includes(exc.toLowerCase());
      }
      return false;
    });
    if (matchesCustomKeyword) return false;

    // B. Search Query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match = post.content.toLowerCase().includes(query) || 
                    post.author.toLowerCase().includes(query) ||
                    post.field.toLowerCase().includes(query);
      if (!match) return false;
    }

    // C. Tabs: 'dept' -> Only show user's department posts. 'clubs' -> Only show user's followed clubs posts.
    if (activeTab === 'dept') {
      return post.department === preferences.department;
    }
    if (activeTab === 'clubs') {
      return post.club && preferences.interestedClubs.includes(post.club);
    }

    return true;
  });

  const handleSharePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    onAddPost(newPostText.trim(), selectedField);
    setNewPostText('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. STORIES (Active Clubs) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-700/40">
        <div className="flex justify-between items-center mb-3 px-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif Kulüpler & Hikayeler</p>
          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Canlı Kampüs
          </span>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto no-scrollbar py-1">
          {/* Add story item */}
          <div className="flex-shrink-0 flex flex-col items-center space-y-1.5 cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-400 transition-colors">
              <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hikaye Ekle</span>
          </div>

          {/* Filtered active clubs stories */}
          {CLUBS.filter(club => {
            // Hide story if club is filtered out
            const isFiltered = preferences.excludedCategories.includes(club.id) || 
                               preferences.excludedCategories.some(exc => club.name.toLowerCase().includes(exc.toLowerCase()));
            return !isFiltered;
          }).map(club => {
            const isFollowed = preferences.interestedClubs.includes(club.id);
            return (
              <div key={club.id} className="flex-shrink-0 flex flex-col items-center space-y-1.5 cursor-pointer group">
                <div className={`w-14 h-14 rounded-full p-0.5 transition transform group-hover:scale-105 duration-200 ${
                  isFollowed 
                    ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500' 
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                    {club.logo}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-amber-500 transition-colors max-w-[70px] truncate">
                  {club.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SEARCH & FEED NAVIGATION */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/40">
        
        {/* Tab Buttons */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Genel Akış
          </button>
          <button
            onClick={() => setActiveTab('dept')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'dept'
                ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bölümüm ({preferences.department.split(' ')[0]})
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'clubs'
                ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Takip Ettiğim Kulüpler
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Akışta kelime, kulüp ara..."
            className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
        </div>
      </div>

      {/* 3. SHARING BOX */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-700/40">
        <form onSubmit={handleSharePostSubmit} className="space-y-3.5">
          <div className="flex gap-3 items-start">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=EAAA00&color=003057`} 
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
              alt="Avatar"
            />
            <div className="flex-1">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Davutpaşa veya Beşiktaş'ta ne oluyor? Kampüsle paylaş..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-700/60 gap-2">
            
            {/* Category Select for Post */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori:</span>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {INTEREST_FIELDS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => alert("Görsel yükleme simüle edilmiştir.")}
                className="text-slate-400 hover:text-emerald-500 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750"
              >
                <Image className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => alert("Konum seçimi simüle edilmiştir.")}
                className="text-slate-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750"
              >
                <MapPin className="w-4 h-4" />
              </button>
              
              <button
                type="submit"
                disabled={!newPostText.trim()}
                className={`px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  newPostText.trim()
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-md active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Paylaş
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. POSTS LIST WITH DYNAMIC ENTRANCE EFFECTS */}
      <div className="space-y-4">
        
        {/* If only saved posts filter is active, show a lovely banner */}
        {showOnlySaved && (
          <div className="bg-amber-400/10 border border-amber-400/35 rounded-2xl p-4 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400 text-slate-900 rounded-xl font-bold shadow-inner">
                <Bookmark className="w-4 h-4 fill-slate-900" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">Kaydedilen Gönderiler Aktif</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sadece kaydettiğiniz kampüs gönderileri listeleniyor ({filteredPosts.length} adet).</p>
              </div>
            </div>
            <button
              onClick={onClearSavedFilter}
              className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-400 dark:hover:bg-slate-700 font-bold rounded-xl transition shadow-sm cursor-pointer"
            >
              Tüm Akışı Göster
            </button>
          </div>
        )}

        {/* If some content was excluded, show a tiny helpful reminder bar */}
        {preferences.excludedCategories.length > 0 && (
          <div className="bg-slate-100 dark:bg-slate-900/80 rounded-xl p-3 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 items-center justify-between border border-dashed border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Ayarlardan bazı konuları engellediniz. ({preferences.excludedCategories.length} filtre aktif)</span>
            </span>
            <div className="flex gap-1.5">
              {preferences.excludedCategories.slice(0, 3).map(exc => (
                <button
                  key={exc}
                  onClick={() => onRemoveExclude(exc)}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/10 text-[9px] hover:text-rose-400 font-bold px-2 py-0.5 rounded transition"
                >
                  "{exc}" Engeli Kaldır
                </button>
              ))}
              {preferences.excludedCategories.length > 3 && <span>...</span>}
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/40"
            >
              <div className="text-slate-300 dark:text-slate-600 mb-2 flex justify-center">
                <FilterX className="w-12 h-12 stroke-[1.2]" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Görüntülenecek İçerik Bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Filtreleriniz veya arama kriterlerinizle eşleşen kampüs paylaşımı mevcut değil. Engellenen kelimeleri veya bölümleri ayarlardan değiştirebilirsiniz.
              </p>
            </motion.div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = post.likedByMe;
              const isPersonalDept = post.department === preferences.department;
              const isSaved = savedPostIds.includes(post.id);
              
              return (
                <motion.div
                  key={post.id}
                  layoutId={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-700/40 relative overflow-hidden transition-all hover:shadow-md"
                >
                  
                  {/* Pinned & Personalized Badges */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-amber-400/10 text-amber-500 border border-amber-400/20 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        <Pin className="w-2.5 h-2.5" /> Sabitlendi
                      </span>
                    )}
                    <span className="inline-flex items-center text-[9px] bg-slate-100 dark:bg-slate-750 text-slate-500 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                      {post.field}
                    </span>
                    {isPersonalDept && (
                      <span className="inline-flex items-center text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold px-2 py-0.5 rounded-full">
                        Bölümünüze Özel 🎓
                      </span>
                    )}
                  </div>
 
                  {/* Post Author / Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.authorAvatar} 
                        className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700/80"
                        alt={post.author}
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-amber-400 flex items-center gap-1.5">
                          {post.author}
                          {post.club && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">Kulüp</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{post.time}</p>
                      </div>
                    </div>
                  </div>
 
                  {/* Post Content */}
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
 
                  {/* Actions Bar */}
                  <div className="flex items-center space-x-6 border-t border-slate-100 dark:border-slate-700/50 pt-3 mt-4">
                    <button 
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold transition group ${
                        isLiked 
                          ? 'text-rose-500' 
                          : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 transition duration-200 group-active:scale-150 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
 
                    <button 
                      onClick={() => alert("Yorum özelliği simüle edilmiştir.")}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-blue-500 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Yorum Yap</span>
                    </button>
 
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`Yıldız Connect: "${post.content.slice(0, 50)}..."`);
                        alert("Paylaşım bağlantısı panoya kopyalandı!");
                      }}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-500 transition"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Paylaş</span>
                    </button>

                    <button 
                      onClick={() => onToggleSavePost(post.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold transition ml-auto group ${
                        isSaved 
                          ? 'text-amber-500' 
                          : 'text-slate-400 hover:text-amber-500'
                      }`}
                      title={isSaved ? "Kaydetmeyi Kaldır" : "Kaydet"}
                    >
                      <Bookmark className={`w-4 h-4 transition duration-200 group-active:scale-[1.3] ${isSaved ? 'fill-amber-500 stroke-amber-500' : ''}`} />
                      <span>{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
