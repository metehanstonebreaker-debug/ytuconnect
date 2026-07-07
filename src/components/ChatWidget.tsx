/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, ChevronLeft, Check, CheckCheck } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs, updateDoc, arrayUnion, limit } from 'firebase/firestore';
import { UserPreferences, RegisteredUser, ChatMessage } from '../types';

interface ChatWidgetProps {
  preferences: UserPreferences;
  hasUnreadMessages?: boolean;
}

export default function ChatWidget({ preferences, hasUnreadMessages }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<RegisteredUser[]>([]);
  const [activeFriend, setActiveFriend] = useState<RegisteredUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, ChatMessage>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch friends list
  useEffect(() => {
    if (!isOpen || activeFriend) return;
    
    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const userDocRef = doc(db, 'registered_users', preferences.studentId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as RegisteredUser;
          const friendIds = userData.friends || [];
          
          if (friendIds.length > 0) {
            // Firestore 'in' query has max 10, but let's assume we fetch all or in batches.
            // For simplicity, let's fetch individually or limit to 10 for now.
            const chunks = [];
            for (let i = 0; i < friendIds.length; i += 10) {
              chunks.push(friendIds.slice(i, i + 10));
            }
            
            const friendsData: RegisteredUser[] = [];
            for (const chunk of chunks) {
              const q = query(collection(db, 'registered_users'), where('studentId', 'in', chunk));
              const snap = await getDocs(q);
              snap.forEach(d => {
                friendsData.push(d.data() as RegisteredUser);
              });
            }
            setFriends(friendsData);
          } else {
            setFriends([]);
          }
        }
      } catch (err) {
        console.error("Error fetching friends", err);
      } finally {
        setLoadingFriends(false);
      }
    };
    
    fetchFriends();
  }, [isOpen, activeFriend, preferences.studentId]);

  // Subscribe to last messages for each friend
  useEffect(() => {
    if (friends.length === 0) return;

    const unsubscribes = friends.map(friend => {
      const chatId = [preferences.studentId, friend.studentId].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();
          const seenBy = data.seenBy || [];
          const msg = {
            id: docSnap.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text,
            seenBy: seenBy,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
          } as ChatMessage;

          setLastMessages(prev => ({
            ...prev,
            [friend.studentId]: msg
          }));
        }
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [friends, preferences.studentId]);

  // Subscribe to messages when active friend is selected
  useEffect(() => {
    if (!activeFriend) return;
    
    const chatId = [preferences.studentId, activeFriend.studentId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    let isInitialLoad = true;
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      const unreadDocIds: string[] = [];
      let playSound = false;

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const seenBy = data.seenBy || [];
          if (!isInitialLoad && data.senderId !== preferences.studentId && !seenBy.includes(preferences.studentId)) {
            playSound = true;
          }
        }
      });

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const msgId = docSnap.id;
        const seenBy = data.seenBy || [];
        
        msgs.push({
          id: msgId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          seenBy: seenBy,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        } as ChatMessage);

        // If I am not the sender and I haven't seen it, mark it as seen
        if (data.senderId !== preferences.studentId && !seenBy.includes(preferences.studentId) && isOpen) {
          unreadDocIds.push(msgId);
        }
      });
      setMessages(msgs);
      
      if (playSound) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
          audio.volume = 0.2; audio.play().catch(() => {});
        } catch (err) {}
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Update unread messages
      if (unreadDocIds.length > 0) {
        unreadDocIds.forEach(msgId => {
          updateDoc(doc(db, 'chats', chatId, 'messages', msgId), { seenBy: arrayUnion(preferences.studentId) }).catch(console.error);
        });
      }
      isInitialLoad = false;
    });
    
    return () => unsubscribe();
  }, [activeFriend, preferences.studentId, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeFriend) return;
    
    const text = newMessage.trim();
    setNewMessage('');
    
    const chatId = [preferences.studentId, activeFriend.studentId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    try {
      await addDoc(messagesRef, {
        senderId: preferences.studentId,
        receiverId: activeFriend.studentId,
        text,
        seenBy: [preferences.studentId],
        createdAt: serverTimestamp()
      });

      // Update receiver's unread messages flag
      const receiverRef = doc(db, 'registered_users', activeFriend.studentId);
      updateDoc(receiverRef, { hasUnreadMessages: true }).catch(console.error);
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  useEffect(() => {
    if (isOpen && hasUnreadMessages) {
      // Clear unread messages flag when chat is opened
      const userRef = doc(db, 'registered_users', preferences.studentId);
      updateDoc(userRef, { hasUnreadMessages: false }).catch(console.error);
    }
  }, [isOpen, hasUnreadMessages, preferences.studentId]);

  // Play sound when a new message arrives
  const prevUnreadRef = useRef(hasUnreadMessages);
  useEffect(() => {
    prevUnreadRef.current = hasUnreadMessages;
  }, [hasUnreadMessages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 z-50 cursor-pointer"
        aria-label="Sohbeti Aç"
      >
        <MessageSquare className="w-6 h-6" />
        {hasUnreadMessages && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="bg-brand-500 p-4 text-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-bold">
          {activeFriend ? (
            <>
              <button onClick={() => setActiveFriend(null)} className="p-1 hover:bg-brand-600 rounded-full transition cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <img src={activeFriend.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-950/20" />
                <span className="truncate">{activeFriend.username}</span>
              </div>
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              <span>Sohbetler</span>
            </>
          )}
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-950 hover:bg-brand-600 p-1 rounded-full transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 relative">
        {!activeFriend ? (
          <div className="p-2 space-y-1">
            {loadingFriends ? (
              <div className="p-4 text-center text-slate-400 text-xs">Arkadaşlar yükleniyor...</div>
            ) : friends.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <User className="w-8 h-8 opacity-20" />
                <p className="text-xs">Henüz ekli arkadaşınız yok.</p>
                <p className="text-[10px] mt-1 opacity-70">Keşfet sekmesinden yeni insanlarla tanışın.</p>
              </div>
            ) : (
              friends.map(friend => {
                const lastMsg = lastMessages[friend.studentId];
                const hasUnread = lastMsg && lastMsg.senderId === friend.studentId && !(lastMsg.seenBy || []).includes(preferences.studentId);
                
                return (
                  <button
                    key={friend.studentId}
                    onClick={() => setActiveFriend(friend)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition cursor-pointer relative"
                  >
                    <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className={`text-sm truncate ${hasUnread ? 'font-black text-brand-600 dark:text-brand-400' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                        {friend.username}
                      </div>
                      {lastMsg ? (
                        <div className={`text-[11px] truncate mt-0.5 ${hasUnread ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                          {lastMsg.senderId === preferences.studentId ? 'Siz: ' : ''}{lastMsg.text}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 truncate">{friend.department}</div>
                      )}
                    </div>
                    {hasUnread && (
                      <div className="w-2.5 h-2.5 bg-brand-500 rounded-full shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">
                Mesajlaşmaya başlayın.
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === preferences.studentId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm relative ${
                      isMe 
                        ? 'bg-brand-500 text-slate-950 rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex flex-col">
                        <span>{msg.text}</span>
                        {isMe && (
                          <div className="flex justify-end mt-1 text-slate-700/60 dark:text-slate-900/60">
                            {msg.seenBy?.includes(activeFriend.studentId) ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {activeFriend && (
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesaj yaz..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:dark:bg-slate-800 text-slate-950 disabled:text-slate-400 rounded-xl transition cursor-pointer shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
