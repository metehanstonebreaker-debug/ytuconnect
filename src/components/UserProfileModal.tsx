/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, RegisteredUser, UserPreferences } from '../types';
import { 
  X, 
  MapPin, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Calendar, 
  GraduationCap, 
  Hash, 
  Sparkles, 
  Users,
  ExternalLink,
  BookOpen,
  Trash2
} from 'lucide-react';
import { formatRelativeTime, parseAndRenderContent, extractFirstUrl, LinkPreview } from './Feed';
import { INTEREST_FIELDS, CLUBS } from '../mockData';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegisteredUser;
  posts: Post[];
  currentUserStudentId: string;
  onLikePost: (postId: string) => void;
  onToggleSavePost: (postId: string) => void;
  savedPostIds: string[];
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  posts,
  currentUserStudentId,
  onLikePost,
  onToggleSavePost,
  savedPostIds,
  onDeletePost,
  onDeleteComment
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts');
  const [isFriend, setIsFriend] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [isFriendLoading, setIsFriendLoading] = useState(false);

  React.useEffect(() => {
    const checkFriendStatus = async () => {
      if (!isOpen || currentUserStudentId === user.studentId) return;
      setIsFriendLoading(true);
      try {
        const curUserRef = doc(db, 'registered_users', currentUserStudentId);
        const targetUserRef = doc(db, 'registered_users', user.studentId);
        
        const [curSnap, targetSnap] = await Promise.all([
          getDoc(curUserRef),
          getDoc(targetUserRef)
        ]);

        if (curSnap.exists()) {
          const data = curSnap.data();
          if (data.friends && data.friends.includes(user.studentId)) {
            setIsFriend(true);
          } else {
            setIsFriend(false);
          }
        }
        
        if (targetSnap.exists()) {
          const targetData = targetSnap.data();
          if (targetData.friendRequests && targetData.friendRequests.includes(currentUserStudentId)) {
            setHasSentRequest(true);
          } else {
            setHasSentRequest(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFriendLoading(false);
      }
    };
    checkFriendStatus();
  }, [isOpen, user.studentId, currentUserStudentId]);

  const toggleFriend = async () => {
    setIsFriendLoading(true);
    try {
      const curUserRef = doc(db, 'registered_users', currentUserStudentId);
      const targetUserRef = doc(db, 'registered_users', user.studentId);

      if (isFriend) {
        // Remove friend
        await updateDoc(curUserRef, { friends: arrayRemove(user.studentId) });
        await updateDoc(targetUserRef, { friends: arrayRemove(currentUserStudentId) });
        setIsFriend(false);
      } else if (hasSentRequest) {
        // Cancel request
        await updateDoc(targetUserRef, { friendRequests: arrayRemove(currentUserStudentId) });
        setHasSentRequest(false);
      } else {
        // Send request
        await updateDoc(targetUserRef, { friendRequests: arrayUnion(currentUserStudentId) });
        setHasSentRequest(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFriendLoading(false);
    }
  };

  if (!isOpen) return null;

  const isMe = currentUserStudentId === user.studentId;
  const userPosts = posts.filter(p => p.authorStudentId === user.studentId || p.author === user.username);

  // Compile user's comments across all posts
  const userComments: { post: Post; comment: any }[] = [];
  posts.forEach(p => {
    if (p.comments) {
      p.comments.forEach(c => {
        if (c.authorStudentId === user.studentId || c.author === user.username) {
          userComments.push({ post: p, comment: c });
        }
      });
    }
  });

  const getFieldLabel = (fieldId: string) => {
    const f = INTEREST_FIELDS.find(item => item.id === fieldId);
    return f ? f.label : fieldId;
  };

  const getClubName = (clubId: string) => {
    const c = CLUBS.find(item => item.id === clubId);
    return c ? c.name : clubId;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header Image Accent */}
          <div className="h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 relative shrink-0">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/60 text-white transition cursor-pointer z-10"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
            {isMe && (
              <span className="absolute top-4 left-4 bg-brand-500 text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                SİZİN PROFİLİNİZ
              </span>
            )}
          </div>

          {/* Profile Basic Info */}
          <div className="px-6 pb-2 relative shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-4 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-1 min-w-0">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f59e0b&color=003057`}
                  className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-md bg-slate-100 shrink-0"
                  alt={user.username}
                />
                <div className="flex-1 min-w-0 mb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      @{user.username}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <span className="flex items-center gap-1 text-brand-700 dark:text-brand-500">
                      <Hash className="w-3.5 h-3.5" />
                      {user.studentId}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {user.department}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isMe && (
                <button
                  onClick={toggleFriend}
                  disabled={isFriendLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isFriend
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900/50'
                      : hasSentRequest
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      : 'bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-md shadow-brand-500/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isFriendLoading ? 'Bekleniyor...' : isFriend ? 'Arkadaşlardan Çıkar' : hasSentRequest ? 'İstek Gönderildi' : 'Arkadaş Ekle'}
                </button>
              )}
            </div>

            {/* Profile Bio */}
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-100/60 dark:border-slate-800/40 leading-relaxed italic mb-4">
              {user.bio || "Henüz bir biyografi eklenmemiş."}
            </p>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-2.5 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'posts' 
                    ? 'border-brand-500 text-brand-700 dark:text-brand-500' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Gönderiler ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-2.5 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'comments' 
                    ? 'border-brand-500 text-brand-700 dark:text-brand-500' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Yorumlar ({userComments.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-2.5 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'about' 
                    ? 'border-brand-500 text-brand-700 dark:text-brand-500' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Hakkında
              </button>
            </div>
          </div>

          {/* Profile Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
            {activeTab === 'posts' ? (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Henüz Gönderi Paylaşılmadı</p>
                    <p className="text-[10px] text-slate-400">Bu kullanıcının paylaştığı herhangi bir gönderi bulunmuyor.</p>
                  </div>
                ) : (
                  userPosts.map((post) => {
                    const isLiked = post.likedByMe;
                    const isSaved = savedPostIds.includes(post.id);
                    const firstUrl = extractFirstUrl(post.content);

                    return (
                      <div 
                        key={post.id}
                        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3"
                      >
                        {/* Post info header */}
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                            {post.field}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeTime(post.createdAt, post.time)}
                            </span>
                            {isMe && onDeletePost && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) {
                                    onDeletePost(post.id);
                                  }
                                }}
                                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition-colors cursor-pointer"
                                title="Gönderiyi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Post location if any */}
                        {post.location && (
                          <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {post.location}
                          </div>
                        )}

                        {/* Post content */}
                        <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                          {parseAndRenderContent(post.content)}
                        </p>

                        {/* Extracted link preview if any */}
                        {firstUrl && (
                          <LinkPreview url={firstUrl} />
                        )}

                        {/* Attached Image if any */}
                        {post.image && (
                          <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm max-h-[300px] bg-slate-50 dark:bg-slate-900/40">
                            <img 
                              src={post.image} 
                              className="w-full h-auto max-h-[300px] object-contain mx-auto" 
                              alt="Attached" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Actions bar */}
                        <div className="flex items-center gap-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/50">
                          <button 
                            onClick={() => onLikePost(post.id)}
                            className={`flex items-center space-x-1 text-[11px] font-bold transition ${
                              isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          
                          <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Yorumlar ({(post.comments || []).length})</span>
                          </div>

                          <button 
                            onClick={() => onToggleSavePost(post.id)}
                            className={`flex items-center space-x-1 text-[11px] font-semibold transition ml-auto ${
                              isSaved ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-600 stroke-brand-600' : ''}`} />
                            <span>{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : activeTab === 'comments' ? (
              <div className="space-y-4">
                {userComments.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Henüz Yorum Yapılmadı</p>
                    <p className="text-[10px] text-slate-400">Bu kullanıcının yaptığı herhangi bir yorum bulunmuyor.</p>
                  </div>
                ) : (
                  userComments.map(({ post, comment }) => (
                    <div 
                      key={comment.id}
                      className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] text-slate-400 font-medium">
                          <span className="font-bold text-slate-700 dark:text-slate-300">@{post.author}</span> adlı kullanıcının gönderisine yorum yaptı:
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          {isMe && onDeleteComment && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
                                  onDeleteComment(post.id, comment.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition-colors cursor-pointer"
                              title="Yorumu Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Context post content preview */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                        "{post.content}"
                      </div>

                      {/* Comment text */}
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold leading-relaxed pl-1.5 border-l-2 border-brand-500">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                    Kullanıcı Bilgileri
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Bölüm</p>
                      <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{user.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Kayıt Tarihi</p>
                      <p className="font-semibold text-slate-800 dark:text-white mt-0.5">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {user.interestedFields && user.interestedFields.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                      İlgi Alanları
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {user.interestedFields.map(f => (
                        <span key={f} className="text-[10px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/15 font-bold px-2.5 py-1 rounded-xl">
                          {getFieldLabel(f)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clubs */}
                {user.interestedClubs && user.interestedClubs.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                      Takip Ettiği Kulüpler
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {user.interestedClubs.map(c => (
                        <span key={c} className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 font-bold px-2.5 py-1 rounded-xl">
                          {getClubName(c)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
