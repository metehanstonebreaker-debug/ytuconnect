import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  RotateCcw,
  ArrowDown,
  Info
} from 'lucide-react';
import { UserPreferences } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface ChatbotProps {
  preferences: UserPreferences;
}

export default function Chatbot({ preferences }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ytu_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: `Merhaba **@${preferences.username || 'Yıldızlı'}**! Ben **Yıldız Asistan**. 🌟\n\nYTÜ Kampüs hayatı, derslerin, **${preferences.department || 'bölümün'}** veya ilgilendiğin kulüpler hakkında sana yardımcı olmak için buradayım. \n\nSana bugün nasıl yardımcı olabilirim?`,
        timestamp: new Date()
      }
    ];
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Save chat history
  useEffect(() => {
    localStorage.setItem('ytu_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  // Track scrolling to show/hide scroll to bottom button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Show button if user scrolled up significantly
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  // Quick suggestions
  const suggestions = [
    { label: "🍔 Yemekhanede bugün ne var?", text: "Yemekhanede bugün ne var ve yemek saatleri nedir?" },
    { label: "🚌 Davutpaşa ring saatleri", text: "Davutpaşa kampüsü içi ring saatleri ve güzergahı hakkında bilgi verir misin?" },
    { label: "🎓 Bölümüm için tavsiyeler", text: `${preferences.department} bölümü öğrencisiyim. Bu bölümü başarıyla tamamlamak ve kendimi geliştirmek için neler önerirsin?` },
    { label: "🎭 Kulüp önerileri", text: `İlgi alanlarım: ${preferences.interestedFields?.join(', ') || 'teknoloji, spor'}. Bana katılabileceğim YTÜ kulüplerini önerir misin?` }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history payload for API (last 6 messages to keep it lightweight)
      const chatHistory = messages
        .slice(-6)
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          preferences: {
            username: preferences.username,
            studentId: preferences.studentId,
            department: preferences.department,
            interestedFields: preferences.interestedFields,
            interestedClubs: preferences.interestedClubs
          }
        })
      });

      if (!response.ok) {
        throw new Error('API yanıt vermedi.');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        text: data.text || 'Üzgünüm, yanıt alamadım.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        text: 'Bağlantı kurulurken bir sorun oluştu. Lütfen sağ üstteki **Ayarlar > Secrets** panelinde **GEMINI_API_KEY** değerinin tanımlı olduğundan emin olun.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Sohbet geçmişini sıfırlamak istiyor musunuz?")) {
      const reset: Message[] = [
        {
          id: 'welcome_reset',
          role: 'assistant',
          text: `Sohbet sıfırlandı. Merhaba **@${preferences.username || 'Yıldızlı'}**! Sana nasıl yardımcı olabilirim?`,
          timestamp: new Date()
        }
      ];
      setMessages(reset);
    }
  };

  // Helper to parse basic markdown to JSX (**bold**, *italic*, bullet lists, etc.)
  const parseMarkdown = (text: string) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Handle list items
      const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      let content = isListItem ? line.trim().substring(2) : line;

      // Handle bold styling (**text**)
      const parts = [];
      let currentIdx = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const matchIdx = match.index;
        
        // Add preceding text
        if (matchIdx > currentIdx) {
          parts.push(content.substring(currentIdx, matchIdx));
        }

        // Add bolded text
        parts.push(
          <strong key={`b_${lineIdx}_${matchIdx}`} className="font-extrabold text-slate-900 dark:text-white">
            {match[1]}
          </strong>
        );

        currentIdx = regex.lastIndex;
      }

      if (currentIdx < content.length) {
        parts.push(content.substring(currentIdx));
      }

      const renderedLine = parts.length > 0 ? parts : content;

      if (isListItem) {
        return (
          <li key={`line_${lineIdx}`} className="ml-4 list-disc text-xs leading-relaxed my-1 text-slate-700 dark:text-slate-300">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={`line_${lineIdx}`} className="text-xs leading-relaxed min-h-[1rem] my-1 text-slate-700 dark:text-slate-300">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 font-sans" id="ytu_campus_chatbot">
      <AnimatePresence>
        {/* CHAT WINDOW */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[calc(100vw-32px)] sm:w-[400px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 px-4 py-3.5 flex justify-between items-center text-white border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold relative shadow-inner">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">Yıldız Asistan</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-300 font-medium">Yapay Zeka Destekli • Aktif</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-amber-400 transition"
                  title="Sohbet Geçmişini Temizle"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-rose-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950/40"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Left Avatar for AI */}
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 self-start mt-1">
                      YT
                    </div>
                  )}

                  {/* Bubble content */}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-amber-400 text-slate-900 rounded-tr-none font-medium' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700/40'
                  }`}>
                    <div className="prose prose-sm dark:prose-invert">
                      {parseMarkdown(msg.text)}
                    </div>
                    <span className={`text-[9px] mt-1.5 block text-right ${
                      msg.role === 'user' ? 'text-slate-800/60' : 'text-slate-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Right Avatar for User */}
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-[10px] shrink-0 self-start mt-1 border border-slate-700/35">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 self-start">
                    YT
                  </div>
                  <div className="bg-white dark:bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100 dark:border-slate-700/40 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Float Scroll-to-Bottom Button */}
            {showScrollBtn && (
              <button 
                onClick={scrollToBottom}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm hover:bg-slate-800 transition"
              >
                <ArrowDown className="w-3.5 h-3.5" /> En Yeni Mesajlar
              </button>
            )}

            {/* Helper Suggestion Chips */}
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto no-scrollbar whitespace-nowrap flex gap-1.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug.text)}
                  disabled={isLoading}
                  className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-900 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 transition duration-150 shrink-0 border border-slate-200/40 dark:border-slate-700/45 cursor-pointer disabled:opacity-50"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Yıldız Asistan'a sor..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-400 dark:focus:border-amber-400/80 transition-all placeholder-slate-400 disabled:opacity-60"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-amber-400 text-amber-400 dark:text-slate-900 hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:scale-100 shadow-sm flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION TRIGGER BUTTON */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 dark:from-amber-400 dark:to-amber-500 rounded-2xl flex items-center justify-center text-amber-400 dark:text-slate-900 shadow-2xl relative border border-slate-800/80 dark:border-amber-300 cursor-pointer"
        title="Yıldız Asistan"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 dark:bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-slate-900"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
