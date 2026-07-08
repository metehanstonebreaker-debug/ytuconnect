/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, UserPreferences, Story } from '../types';
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
  Bookmark,
  X,
  Smile,
  Video,
  Globe,
  ExternalLink,
  Github,
  Youtube,
  GraduationCap,
  Play
} from 'lucide-react';

export function parseAndRenderContent(content: string, onHashtagClick?: (hashtag: string) => void, onMentionClick?: (username: string) => void) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  if (parts.length === 1 && !content.match(/#[a-zA-Z0-9_ğüşöçİĞÜŞÖÇıI]+/g) && !content.match(/@[a-zA-Z0-9_ğüşöçİĞÜŞÖÇıI]+/g)) {
    return <span>{content}</span>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a 
              key={`url-${index}`} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-700 dark:text-brand-500 font-bold hover:underline inline-flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {part} <ExternalLink className="w-3 h-3 inline" />
            </a>
          );
        }
        
        // Parse hashtags and mentions in the remaining text
        const tokenRegex = /(#[a-zA-Z0-9_ğüşöçİĞÜŞÖÇıI]+|@[a-zA-Z0-9_ğüşöçİĞÜŞÖÇıI]+)/g;
        const textParts = part.split(tokenRegex);
        
        return textParts.map((tPart, tIndex) => {
          if (tPart.startsWith('#')) {
            return (
              <span
                key={`token-${index}-${tIndex}`}
                className="text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onHashtagClick) {
                    onHashtagClick(tPart);
                  }
                }}
              >
                {tPart}
              </span>
            );
          } else if (tPart.startsWith('@')) {
            return (
              <span
                key={`token-${index}-${tIndex}`}
                className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMentionClick) {
                    onMentionClick(tPart.substring(1));
                  }
                }}
              >
                {tPart}
              </span>
            );
          }
          return <span key={`text-${index}-${tIndex}`}>{tPart}</span>;
        });
      })}
    </>
  );
}

export function extractFirstUrl(content: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = content.match(urlRegex);
  return match ? match[0] : null;
}

export function isImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)$/i.test(pathname) || 
           parsedUrl.searchParams.get("format") === "jpg" || 
           parsedUrl.searchParams.get("format") === "png" || 
           parsedUrl.searchParams.get("format") === "webp" ||
           url.includes("images.unsplash.com") ||
           url.includes("picsum.photos") ||
           url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)(\?|$)/) !== null;
  } catch (e) {
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)/i.test(url);
  }
}

export function LinkPreview({ url }: { url: string }) {
  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    hostname = url;
  }

  let title = "Web Sitesi Bağlantısı";
  let icon = <Globe className="w-4 h-4 text-slate-400" />;
  let badgeColor = "bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shadow-sm";
  let badgeText = "Bağlantı";
  let initialImageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80"; // general tech
  
  let youtubeVideoId: string | null = null;
  let isImage = false;
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)$/i.test(pathname) || 
              parsedUrl.searchParams.get("format") === "jpg" || 
              parsedUrl.searchParams.get("format") === "png" || 
              parsedUrl.searchParams.get("format") === "webp" ||
              url.includes("images.unsplash.com") ||
              url.includes("picsum.photos") ||
              url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)(\?|$)/) !== null;
  } catch (e) {
    isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)/i.test(url);
  }

  if (isImage) {
    title = "Görsel Bağlantısı";
    icon = <Image className="w-4 h-4 text-brand-600" />;
    badgeColor = "bg-brand-600/95 text-white border border-brand-700 shadow-sm";
    badgeText = "Görsel";
    initialImageUrl = url;
  } else if (hostname.includes("yildiz.edu.tr")) {
    title = "Yıldız Teknik Üniversitesi";
    icon = <GraduationCap className="w-4 h-4 text-brand-600" />;
    badgeColor = "bg-brand-600/90 text-white border border-brand-700";
    badgeText = "YTÜ Resmi";
    initialImageUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80"; // elegant college/campus photo
  } else if (hostname.includes("github.com")) {
    title = "GitHub Deposu";
    icon = <Github className="w-4 h-4 text-slate-800 dark:text-white" />;
    badgeColor = "bg-slate-900/90 text-white border border-slate-800/80";
    badgeText = "GitHub";
    initialImageUrl = "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80"; // Developer workspace/git
  } else if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    title = "YouTube Videosu";
    icon = <Youtube className="w-4 h-4 text-rose-600" />;
    badgeColor = "bg-rose-600/90 text-white border border-rose-700";
    badgeText = "YouTube";
    
    // Extract YouTube video ID to fetch actual cover image
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) {
        if (parsedUrl.pathname.includes("/shorts/")) {
          youtubeVideoId = parsedUrl.pathname.split("/shorts/")[1]?.split(/[?#]/)[0] || null;
        } else {
          youtubeVideoId = parsedUrl.searchParams.get("v");
        }
      } else if (parsedUrl.hostname.includes("youtu.be")) {
        youtubeVideoId = parsedUrl.pathname.substring(1).split(/[?#]/)[0];
      }
    } catch (e) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        youtubeVideoId = match[2];
      }
    }

    if (youtubeVideoId) {
      // Use maxresdefault for ultra high resolution
      initialImageUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
    } else {
      initialImageUrl = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80";
    }
  } else if (hostname.includes("wikipedia.org")) {
    title = "Vikipedi Ansiklopedi";
    badgeColor = "bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50";
    badgeText = "Vikipedi";
    initialImageUrl = "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80"; // Library / Books
  }

  const [imgSrc, setImgSrc] = useState(initialImageUrl);

  React.useEffect(() => {
    setImgSrc(initialImageUrl);
  }, [initialImageUrl]);

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-3 block aspect-video w-full max-w-[550px] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-200/40 dark:border-slate-800/70 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative group text-left bg-slate-150 dark:bg-slate-950/80"
      onClick={(e) => e.stopPropagation()}
    >
      <img 
        src={imgSrc} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        alt={title}
        referrerPolicy="no-referrer"
        onError={() => {
          if (youtubeVideoId && imgSrc !== `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`) {
            setImgSrc(`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`);
          }
        }}
      />
      
      {/* Absolute dark overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-85 z-2" />

      {/* Floating badge inside image (top left) */}
      <div className="absolute top-3 left-3 flex gap-1.5 items-center z-10">
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 ${badgeColor}`}>
          {icon}
          <span>{badgeText}</span>
        </span>
      </div>

      {/* Floating hostname inside image right-aligned (bottom right) */}
      <div className="absolute bottom-3 right-3 bg-black/60 text-white border border-white/10 px-2.5 py-0.5 rounded-md text-[9px] font-mono tracking-wide backdrop-blur-md shadow-sm z-10">
        {hostname}
      </div>

      {/* YouTube specific play icon overlay */}
      {(hostname.includes("youtube.com") || hostname.includes("youtu.be")) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/20 transition-colors duration-300 z-5">
          <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Non-YouTube external link icon overlay on hover */}
      {!(hostname.includes("youtube.com") || hostname.includes("youtu.be")) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-5">
          <div className="opacity-0 group-hover:opacity-100 w-11 h-11 rounded-full bg-brand-600 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      )}
    </a>
  );
}

export function formatRelativeTime(createdAtString: string | undefined, fallbackTime?: string): string {
  if (!createdAtString) return fallbackTime || "Şimdi";
  const createdDate = new Date(createdAtString);
  if (isNaN(createdDate.getTime())) return fallbackTime || "Şimdi";

  const diffMs = Date.now() - createdDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return "Şimdi";
  }
  if (diffMins < 1) {
    return "Şimdi";
  }
  if (diffHours < 1) {
    return `${diffMins} dk. önce`;
  }
  if (diffDays < 1) {
    return `${diffHours} sa. önce`;
  }
  return `${diffDays} gün önce`;
}

interface FeedProps {
  posts: Post[];
  preferences: UserPreferences;
  stories?: Story[];
  onLikePost: (postId: string) => void;
  onAddPost: (content: string, field: string, image?: string, location?: string) => void;
  onAddComment?: (postId: string, commentContent: string) => void;
  onRemoveExclude: (category: string) => void;
  savedPostIds: string[];
  onToggleSavePost: (postId: string) => void;
  showOnlySaved: boolean;
  onClearSavedFilter: () => void;
  onAddStory?: (content: string, gradientClass: string, image?: string, video?: string, location?: string, textX?: number, textY?: number) => void;
  onViewProfile?: (studentIdOrUsername: string, isStudentId: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Feed({ 
  posts, 
  preferences, 
  stories = [],
  onLikePost, 
  onAddPost, 
  onAddComment,
  onRemoveExclude,
  savedPostIds = [],
  onToggleSavePost,
  showOnlySaved = false,
  onClearSavedFilter,
  onAddStory,
  onViewProfile,
  searchQuery,
  setSearchQuery
}: FeedProps) {
  const [newPostText, setNewPostText] = useState('');
  const [selectedField, setSelectedField] = useState(INTEREST_FIELDS[0].id);
  const [activeTab, setActiveTab] = useState<'all' | 'dept' | 'clubs'>('all');

  // Track expanded comments section per post, and active draft per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Story modals & viewer state
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-blue-600 via-indigo-600 to-purple-600');
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Story attachment states and refs
  const storyImageInputRef = React.useRef<HTMLInputElement>(null);
  const storyVideoInputRef = React.useRef<HTMLInputElement>(null);
  const [newStoryImage, setNewStoryImage] = useState<string | null>(null);
  const [newStoryVideo, setNewStoryVideo] = useState<string | null>(null);
  const [newStoryLocation, setNewStoryLocation] = useState<string | null>(null);
  const [isStoryLocationMenuOpen, setIsStoryLocationMenuOpen] = useState(false);
  const [isStoryLocating, setIsStoryLocating] = useState(false);
  const [storyGpsError, setStoryGpsError] = useState<string | null>(null);
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const previewConstraintsRef = React.useRef<HTMLDivElement>(null);
  const viewerConstraintsRef = React.useRef<HTMLDivElement>(null);

  // Story Autoplay & Progress effect
  React.useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);

    const STORY_DURATION = 5000; // 5 seconds per story
    const INTERVAL_TIME = 50; // 50ms intervals
    const step = (INTERVAL_TIME / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null);
          }
          return 0;
        }
        return prev + step;
      });
    }, INTERVAL_TIME);

    return () => clearInterval(timer);
  }, [activeStoryIndex, stories.length]);

  // Photo & Location attachment states
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedLocation, setAttachedLocation] = useState<string | null>(null);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const CAMPUS_LOCATIONS = [
    "📍 Davutpaşa - Yemekhane",
    "📍 Davutpaşa - Kütüphane",
    "📍 Davutpaşa - Otağ-ı Hümayun",
    "📍 Davutpaşa - Teknopark",
    "📍 Davutpaşa - Mediko-Sosyal",
    "📍 Beşiktaş - Tarihi Bina (A Blok)",
    "📍 Beşiktaş - Çukur Saray",
    "📍 Beşiktaş - Yemekhane"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 800; // max size limit for width or height
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress image to JPEG at 60% quality (greatly reduces size to ~40KB - 80KB)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            setAttachedImage(compressedBase64);
          } else {
            setAttachedImage(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 600; // optimized size for story base64
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
            setNewStoryImage(compressedBase64);
            setNewStoryVideo(null); // clear video
          } else {
            setNewStoryImage(event.target?.result as string);
            setNewStoryVideo(null);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) {
        alert("Video boyutu çok büyük! Lütfen 1.5 MB'tan küçük kısa bir video seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewStoryVideo(event.target?.result as string);
        setNewStoryImage(null); // clear image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryGPSLocation = () => {
    if (!navigator.geolocation) {
      setStoryGpsError("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    setIsStoryLocating(true);
    setStoryGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distBeşiktaş = Math.sqrt(Math.pow(latitude - 41.0421, 2) + Math.pow(longitude - 29.0091, 2));
        const distDavutpaşa = Math.sqrt(Math.pow(latitude - 41.0262, 2) + Math.pow(longitude - 28.8914, 2));
        
        if (distBeşiktaş < 0.015) {
          setNewStoryLocation("📍 Beşiktaş Kampüsü");
          setIsStoryLocating(false);
          setIsStoryLocationMenuOpen(false);
        } else if (distDavutpaşa < 0.015) {
          setNewStoryLocation("📍 Davutpaşa Kampüsü");
          setIsStoryLocating(false);
          setIsStoryLocationMenuOpen(false);
        } else {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`)
            .then((res) => res.json())
            .then((data) => {
              const addr = data?.address;
              if (addr) {
                const mahalleName = addr.neighbourhood || addr.suburb || addr.village || addr.quarter || "";
                const ilceName = addr.town || addr.city_district || addr.district || "";
                const parts = [];
                if (mahalleName) parts.push(mahalleName.includes("Mah") ? mahalleName : `${mahalleName} Mah.`);
                if (ilceName) parts.push(ilceName);
                
                setNewStoryLocation(`📍 ${parts.join(", ") || "YTÜ Dışı"}`);
              } else {
                setNewStoryLocation(`📍 YTÜ Dışı (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
              }
              setIsStoryLocating(false);
              setIsStoryLocationMenuOpen(false);
            })
            .catch(() => {
              setNewStoryLocation(`📍 YTÜ Dışı (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
              setIsStoryLocating(false);
              setIsStoryLocationMenuOpen(false);
            });
        }
      },
      (error) => {
        console.error(error);
        setIsStoryLocating(false);
        setStoryGpsError("Konum alınamadı. Lütfen izinleri kontrol edin.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Tarayıcınız konum özelliğini desteklemiyor. Lütfen başka bir tarayıcı deneyin veya listeden manuel konum seçin.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Detect campus
        const distBeşiktaş = Math.sqrt(Math.pow(latitude - 41.0421, 2) + Math.pow(longitude - 29.0091, 2));
        const distDavutpaşa = Math.sqrt(Math.pow(latitude - 41.0262, 2) + Math.pow(longitude - 28.8914, 2));
        
        let label = "";
        if (distBeşiktaş < 0.015) {
          label = "📍 Beşiktaş Kampüsü (GPS)";
          setAttachedLocation(label);
          setIsLocating(false);
          setIsLocationMenuOpen(false);
        } else if (distDavutpaşa < 0.015) {
          label = "📍 Davutpaşa Kampüsü (GPS)";
          setAttachedLocation(label);
          setIsLocating(false);
          setIsLocationMenuOpen(false);
        } else {
          // Reverse-geocode to human-readable place name for locations outside YTÜ
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`)
            .then((res) => {
              if (!res.ok) throw new Error("Nominatim API error");
              return res.json();
            })
            .then((data) => {
              const addr = data?.address;
              if (addr) {
                const mahalleName = addr.neighbourhood || addr.suburb || addr.village || addr.quarter || "";
                const ilceName = addr.town || addr.city_district || addr.district || "";
                const ilName = addr.province || addr.city || "";

                const parts = [];
                if (mahalleName) {
                  let m = mahalleName;
                  if (!m.toLowerCase().includes("mah")) {
                    m = `${m} Mah.`;
                  }
                  parts.push(m);
                }
                if (ilceName && ilceName !== mahalleName) {
                  parts.push(ilceName);
                }
                if (ilName && ilName !== ilceName && ilName !== mahalleName) {
                  parts.push(ilName);
                }

                let placeName = parts.filter(Boolean).join(", ");
                if (!placeName) {
                  placeName = data.display_name?.split(",").slice(0, 3).join(",") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }
                setAttachedLocation(`📍 ${placeName}`);
              } else {
                setAttachedLocation(`📍 YTÜ Dışı Konum (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
              }
              setIsLocating(false);
              setIsLocationMenuOpen(false);
            })
            .catch((err) => {
              console.error("Geocoding error:", err);
              setAttachedLocation(`📍 YTÜ Dışı Konum (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
              setIsLocating(false);
              setIsLocationMenuOpen(false);
            });
        }
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        let errorMsg = "GPS konumunuza erişilemedi. Lütfen tarayıcı ve sistem konum izinlerini kontrol edin ya da listeden manuel olarak bir nokta seçin.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Konum erişim izni reddedildi. Tarayıcı adres çubuğundaki kilit simgesine tıklayarak konum iznini etkinleştirebilirsiniz.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Konum bilgisi şu anda alınamıyor. GPS sinyalinin güçlü olduğundan emin olun veya listeden seçim yapın.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Konum alma isteği zaman aşımına uğradı. Lütfen tekrar deneyin ya da listeden seçim yapın.";
        }
        setGpsError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

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
    onAddPost(newPostText.trim(), selectedField, attachedImage || undefined, attachedLocation || undefined);
    setNewPostText('');
    setAttachedImage(null);
    setAttachedLocation(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Geolocation Error Pop-up Modal */}
      <AnimatePresence>
        {gpsError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-rose-500/15 text-rose-500 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">GPS Konumuna Erişilemedi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {gpsError}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGpsError(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                >
                  Anladım, Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. STORIES (Active Stories) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80">
        <div className="flex justify-between items-center mb-3 px-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif Kampüs Hikayeleri</p>
          <span className="text-[10px] text-brand-700 dark:text-brand-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Canlı Kampüs
          </span>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto no-scrollbar py-1">
          {/* Add story item */}
          <div 
            onClick={() => setIsAddStoryOpen(true)}
            className="flex-shrink-0 flex flex-col items-center space-y-1.5 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
              <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-500" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hikaye Ekle</span>
          </div>

          {/* Real stories synced from Firestore */}
          {stories.map((story, index) => {
            return (
              <div 
                key={story.id || index} 
                onClick={() => setActiveStoryIndex(index)}
                className="flex-shrink-0 flex flex-col items-center space-y-1.5 cursor-pointer group animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-brand-600 via-rose-500 to-indigo-500 transition transform group-hover:scale-105 duration-200">
                  <img 
                    src={story.authorAvatar} 
                    className="w-full h-full rounded-full border-2 border-white dark:border-slate-800 object-cover bg-slate-100 dark:bg-slate-800 shadow-inner"
                    alt={story.author}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-500 transition-colors max-w-[70px] truncate">
                  {story.author.split(' ')[0]}
                </span>
              </div>
            );
          })}

          {stories.length === 0 && (
            <div className="flex items-center pl-2 text-slate-400 dark:text-slate-500 text-xs">
              Henüz hikaye yok, ilkini sen ekle!
            </div>
          )}
        </div>
      </div>

      {/* 2. SEARCH & FEED NAVIGATION */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80">
        
        {/* Tab Buttons */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-brand-500 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Genel Akış
          </button>
          <button
            onClick={() => setActiveTab('dept')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'dept'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-brand-500 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bölümüm ({preferences.department.split(' ')[0]})
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'clubs'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-brand-500 shadow-sm'
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
            className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>
      </div>

      {/* Active Filter Indicator */}
      {searchQuery.trim() && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Arama Sonuçları:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800/50">
            {searchQuery}
            <button 
              onClick={() => setSearchQuery('')}
              className="hover:bg-brand-200 dark:hover:bg-brand-800 p-0.5 rounded-full transition-colors focus:outline-none"
              title="Aramayı Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* 3. SHARING BOX */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80">
        <form onSubmit={handleSharePostSubmit} className="space-y-3.5">
          <div className="flex gap-3 items-start">
            <img 
              src={preferences.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=f59e0b&color=003057`} 
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              alt="Avatar"
            />
            <div className="flex-1 space-y-2">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Davutpaşa veya Beşiktaş'ta ne oluyor? Kampüsle paylaş..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none transition"
              />

              {/* Preview of Attached Image & Location */}
              {(attachedImage || attachedLocation) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedImage && (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm max-w-[160px] animate-in fade-in-50 duration-150">
                      <img src={attachedImage} className="max-h-24 object-cover rounded-xl" alt="Attached preview" />
                      <button 
                        type="button"
                        onClick={() => setAttachedImage(null)}
                        className="absolute top-1 right-1 bg-slate-950/70 hover:bg-rose-600 text-white p-1 rounded-full transition-colors cursor-pointer w-5 h-5 flex items-center justify-center text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {attachedLocation && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm animate-in fade-in-50 duration-150">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">{attachedLocation}</span>
                      <button 
                        type="button"
                        onClick={() => setAttachedLocation(null)}
                        className="hover:text-rose-700 dark:hover:text-rose-300 font-extrabold ml-1 cursor-pointer text-[10px]"
                        title="Konumu Kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageChange} 
          />

          {/* Location Selector Menu */}
          {isLocationMenuOpen && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl space-y-2.5 animate-in fade-in-50 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kampüs Konumu Seç</span>
                <button 
                  type="button"
                  onClick={() => setIsLocationMenuOpen(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  Kapat
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleGetGPSLocation}
                  disabled={isLocating}
                  className="col-span-2 py-2 px-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-slate-950 disabled:text-slate-400 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {isLocating ? 'GPS Konumu Alınıyor...' : 'Mevcut GPS Konumumu Kullan'}
                </button>

                {CAMPUS_LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setAttachedLocation(loc);
                      setIsLocationMenuOpen(false);
                    }}
                    className="p-2 text-left bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-brand-500 dark:hover:border-brand-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 rounded-lg transition truncate cursor-pointer"
                  >
                    {loc.replace("📍 ", "")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-700/60 gap-2">
            
            {/* Category Select for Post */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori:</span>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 cursor-pointer"
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
                onClick={handleTriggerFileInput}
                className={`transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                  attachedImage ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-500'
                }`}
                title="Fotoğraf Ekle"
              >
                <Image className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className={`transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                  attachedLocation ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-rose-500'
                }`}
                title="Konum Ekle"
              >
                <MapPin className="w-4 h-4" />
              </button>
              
              <button
                type="submit"
                disabled={!newPostText.trim()}
                className={`px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  newPostText.trim()
                    ? 'bg-brand-500 text-slate-950 hover:bg-brand-600 shadow-md active:scale-[0.98]'
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
          <div className="bg-brand-500/10 border border-brand-500/35 rounded-2xl p-4 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-500 text-slate-900 rounded-xl font-bold shadow-inner">
                <Bookmark className="w-4 h-4 fill-slate-900" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">Kaydedilen Gönderiler Aktif</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sadece kaydettiğiniz kampüs gönderileri listeleniyor ({filteredPosts.length} adet).</p>
              </div>
            </div>
            <button
              onClick={onClearSavedFilter}
              className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-brand-500 dark:hover:bg-slate-700 font-bold rounded-xl transition shadow-sm cursor-pointer"
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
              className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80"
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
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80 relative overflow-hidden transition-all hover:shadow-md"
                >
                  
                  {/* Pinned & Personalized Badges */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-brand-500/10 text-brand-800 dark:text-brand-500 border border-brand-500/20 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        <Pin className="w-2.5 h-2.5" /> Sabitlendi
                      </span>
                    )}
                    <span className="inline-flex items-center text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
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
                        className={`w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700/80 object-cover ${onViewProfile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        alt={post.author}
                        onClick={() => onViewProfile && onViewProfile(post.authorStudentId || post.author, !!post.authorStudentId)}
                      />
                      <div>
                        <div className="flex flex-col">
                          <p 
                            className={`text-sm font-bold text-slate-800 dark:text-brand-500 flex items-center gap-1.5 ${onViewProfile ? 'cursor-pointer hover:underline' : ''}`}
                            onClick={() => onViewProfile && onViewProfile(post.authorStudentId || post.author, !!post.authorStudentId)}
                          >
                            {post.author}
                            {post.club && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">Kulüp</span>}
                          </p>
                          {post.authorStudentId && (
                            <p 
                              className={`text-[10px] font-semibold text-brand-700 dark:text-brand-500 leading-none mt-0.5 ${onViewProfile ? 'cursor-pointer hover:underline' : ''}`}
                              onClick={() => onViewProfile && onViewProfile(post.authorStudentId, true)}
                            >
                              @{post.authorStudentId}
                            </p>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{formatRelativeTime(post.createdAt, post.time)}</span>
                          {post.location && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {post.location}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
 
                  {/* Post Content */}
                  <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {parseAndRenderContent(post.content, setSearchQuery, (username) => onViewProfile && onViewProfile(username, false))}
                  </div>

                  {/* Shared Link Preview */}
                  {(() => {
                    const firstUrl = extractFirstUrl(post.content);
                    if (!firstUrl) return null;
                    if (isImageUrl(firstUrl)) {
                      return (
                        <div 
                          onClick={() => setPreviewImage(firstUrl)}
                          className="mt-3 aspect-video w-full max-w-[550px] rounded-2xl overflow-hidden shadow-md hover:shadow-lg border border-slate-200/40 dark:border-slate-800/70 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer bg-slate-100 dark:bg-slate-950/80"
                        >
                          <img 
                            src={firstUrl} 
                            className="w-full h-full object-cover" 
                            alt="Paylaşılan Görsel" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      );
                    }
                    return <LinkPreview url={firstUrl} />;
                  })()}

                  {/* Attached Image if any */}
                  {post.image && (
                    <div 
                      onClick={() => setPreviewImage(post.image || null)}
                      className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all bg-slate-50 dark:bg-slate-900/40"
                    >
                      <img 
                        src={post.image} 
                        className="w-full h-auto max-h-[500px] object-contain mx-auto" 
                        alt="Post attachment" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
 
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
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                        expandedComments[post.id] ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Yorumlar ({(post.comments || []).length})</span>
                    </button>
 
                    <button 
                      onClick={() => {
                        let projectUrl = window.location.origin;
                        if (projectUrl.includes("localhost") || projectUrl.includes("ais-dev") || projectUrl.includes("ais-pre") || projectUrl.includes("127.0.0.1")) {
                          projectUrl = "https://yildizconnect-950166797073.europe-west2.run.app";
                        }
                        const shareText = `Yıldız Connect Paylaşımı:\n"${post.content}"\n- @${post.author} (${post.field})\n\nBuradan Keşfet: ${projectUrl}\n\nYTÜ Kampüs Sosyal Ağı 🌟`;
                        navigator.clipboard.writeText(shareText);
                        setCopiedPostId(post.id);
                        setTimeout(() => {
                          setCopiedPostId(null);
                        }, 2000);
                      }}
                      className={`flex items-center space-x-1.5 text-xs font-semibold transition ${
                        copiedPostId === post.id ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-emerald-500'
                      }`}
                    >
                      <Share2 className={`w-4 h-4 ${copiedPostId === post.id ? 'stroke-emerald-500' : ''}`} />
                      <span>{copiedPostId === post.id ? 'Kopyalandı! 🌟' : 'Paylaş'}</span>
                    </button>

                    <button 
                      onClick={() => onToggleSavePost(post.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold transition ml-auto group ${
                        isSaved 
                          ? 'text-brand-700 dark:text-brand-500' 
                          : 'text-slate-400 hover:text-brand-700 dark:hover:text-brand-500'
                      }`}
                      title={isSaved ? "Kaydetmeyi Kaldır" : "Kaydet"}
                    >
                      <Bookmark className={`w-4 h-4 transition duration-200 group-active:scale-[1.3] ${isSaved ? 'fill-brand-700 stroke-brand-700 dark:fill-brand-500 dark:stroke-brand-500' : ''}`} />
                      <span>{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments[post.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-4 space-y-4 overflow-hidden"
                      >
                        {/* Existing Comments */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {(post.comments || []).length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2">
                              Henüz yorum yapılmamış. İlk yorumu sen yap! 💬
                            </p>
                          ) : (
                            (post.comments || []).map((cmt) => (
                              <div key={cmt.id} className="flex gap-2.5 items-start text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                                <img 
                                  src={cmt.authorAvatar} 
                                  className={`w-7 h-7 rounded-full border border-slate-100 dark:border-slate-700/80 object-cover ${onViewProfile ? 'cursor-pointer hover:opacity-85' : ''}`}
                                  alt={cmt.author}
                                  onClick={() => onViewProfile && onViewProfile(cmt.authorStudentId || cmt.author, !!cmt.authorStudentId)}
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                      <span 
                                        className={`font-bold text-slate-800 dark:text-brand-500 ${onViewProfile ? 'cursor-pointer hover:underline' : ''}`}
                                        onClick={() => onViewProfile && onViewProfile(cmt.authorStudentId || cmt.author, !!cmt.authorStudentId)}
                                      >
                                        @{cmt.author}
                                      </span>
                                      {cmt.authorStudentId && (
                                        <span 
                                          className={`text-[9px] font-medium text-brand-700 dark:text-brand-500 leading-none mt-0.5 ${onViewProfile ? 'cursor-pointer hover:underline' : ''}`}
                                          onClick={() => onViewProfile && onViewProfile(cmt.authorStudentId, true)}
                                        >
                                          @{cmt.authorStudentId}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-400 shrink-0">
                                      {cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Şimdi'}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                                    {parseAndRenderContent(cmt.content, setSearchQuery, (username) => onViewProfile && onViewProfile(username, false))}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Comment Input form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const draft = commentDrafts[post.id] || '';
                            if (draft.trim() && onAddComment) {
                              onAddComment(post.id, draft);
                              setCommentDrafts(prev => ({ ...prev, [post.id]: '' }));
                            }
                          }}
                          className="flex items-center gap-2 mt-2"
                        >
                          <input
                            type="text"
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Yorumunuzu yazın..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                          <button
                            type="submit"
                            disabled={!(commentDrafts[post.id] || '').trim()}
                            className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 text-slate-900 font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gönder</span>
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Full-Screen Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/80 border border-slate-700/50 text-white hover:bg-slate-800 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Kapat"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Container with Animation */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-[85vh] flex items-center justify-center rounded-lg"
            >
              <img
                src={previewImage}
                alt="Büyük boy görsel"
                className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-800 shadow-2xl select-none cursor-default"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Add Story Modal */}
      <AnimatePresence>
        {isAddStoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => {
                  setIsAddStoryOpen(false);
                  setNewStoryText('');
                  setIsEmojiPickerOpen(false);
                  setNewStoryImage(null);
                  setNewStoryVideo(null);
                  setNewStoryLocation(null);
                  setIsStoryLocationMenuOpen(false);
                  setStoryGpsError(null);
                  setTextX(50);
                  setTextY(50);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Yeni Hikaye Ekle</h3>

              {/* Preview Box */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hikaye Önizleme (Yazıyı sürükleyebilirsiniz)</p>
                <div 
                  ref={previewConstraintsRef}
                  className={`w-full aspect-[9/16] rounded-2xl bg-gradient-to-tr ${selectedGradient} flex flex-col justify-between p-6 text-white shadow-inner select-none relative overflow-hidden`}
                >
                  {/* Background photo preview if any */}
                  {newStoryImage && (
                    <img 
                      src={newStoryImage} 
                      className="absolute inset-0 w-full h-full object-cover z-0" 
                      alt="Preview image" 
                      referrerPolicy="no-referrer" 
                    />
                  )}
                  {/* Background video preview if any */}
                  {newStoryVideo && (
                    <video 
                      src={newStoryVideo} 
                      className="absolute inset-0 w-full h-full object-cover z-0" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                    />
                  )}
                  {/* Overlay for readable text when media is present */}
                  {(newStoryImage || newStoryVideo) && (
                    <div className="absolute inset-0 bg-black/40 z-5" />
                  )}

                  <div className="flex items-center gap-2 z-10">
                    <img
                      src={preferences.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(preferences.username)}&background=f59e0b&color=003057`}
                      className="w-8 h-8 rounded-full border border-white/20 object-cover"
                      alt={preferences.username}
                    />
                    <div>
                      <p className="text-xs font-bold leading-none">@{preferences.username || "Yıldızlı"}</p>
                      {newStoryLocation ? (
                        <p className="text-[9px] text-brand-300 font-semibold mt-1 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span>{newStoryLocation.replace("📍 ", "")}</span>
                        </p>
                      ) : (
                        <p className="text-[9px] text-white/70 mt-0.5">Şimdi</p>
                      )}
                    </div>
                  </div>

                  {/* Empty flex spacer to maintain layout */}
                  <div className="flex-1" />

                  {/* Draggable Text Element positioned absolute relative to outer container */}
                  <motion.p
                    key={`${textX}-${textY}`}
                    drag
                    dragConstraints={previewConstraintsRef}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onDragEnd={(event, info) => {
                      if (previewConstraintsRef.current) {
                        const rect = previewConstraintsRef.current.getBoundingClientRect();
                        const relativeX = info.point.x - rect.left;
                        const relativeY = info.point.y - rect.top;
                        const xPct = Math.round(Math.min(Math.max((relativeX / rect.width) * 100, 10), 90));
                        const yPct = Math.round(Math.min(Math.max((relativeY / rect.height) * 100, 10), 90));
                        setTextX(xPct);
                        setTextY(yPct);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: `${textX}%`,
                      top: `${textY}%`,
                      x: "-50%",
                      y: "-50%",
                    }}
                    className="absolute z-20 text-base md:text-lg font-extrabold text-center leading-relaxed tracking-wide drop-shadow-md break-words max-w-[85%] cursor-grab active:cursor-grabbing select-none"
                  >
                    {newStoryText || "Hikayeniz buraya yazılacak... (Sürükleyebilirsiniz)"}
                  </motion.p>

                  <div className="text-[10px] text-center text-white/50 z-10">
                    24 saat boyunca görünür kalacaktır.
                  </div>
                </div>
              </div>

              {/* Story Content Input */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Hikaye Metni</label>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border ${
                        isEmojiPickerOpen 
                          ? 'bg-brand-100 border-brand-300 text-brand-900 dark:bg-brand-950/50 dark:border-brand-900/80 dark:text-brand-300 font-bold' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Emoji {isEmojiPickerOpen ? 'Kapat' : 'Ekle'}</span>
                    </button>
                  </div>

                  <textarea
                    value={newStoryText}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) {
                        setNewStoryText(e.target.value);
                      }
                    }}
                    placeholder="Bir şeyler yazın... (Örn: Bugün kütüphanede yer yok!)"
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-brand-600 resize-none transition"
                  />
                  <div className="flex justify-end mt-0.5">
                    <span className="text-[10px] text-slate-400">{newStoryText.length}/150</span>
                  </div>

                  {/* Emoji selection picker panel */}
                  <AnimatePresence>
                    {isEmojiPickerOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-150 dark:border-slate-800 mt-2"
                      >
                        <div className="grid grid-cols-8 gap-2 text-center">
                          {['😀', '😂', '😍', '😎', '🎓', '🌟', '🏫', '📚', '💻', '☕', '🔥', '🎉', '🙌', '🤝', '🍕', '🎵', '🎸', '🛹', '🎨', '💡', '💯', '✨', '🚀', '❤️'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                if (newStoryText.length + emoji.length <= 150) {
                                  setNewStoryText(prev => prev + emoji);
                                }
                              }}
                              className="text-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition duration-150 transform hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Media & Location Attachments for Story */}
                <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Medya & Konum Ekle</span>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => storyImageInputRef.current?.click()}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        newStoryImage 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      <Image className="w-4 h-4 text-emerald-500" />
                      <span>{newStoryImage ? 'Fotoğraf Değiştir' : 'Fotoğraf'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => storyVideoInputRef.current?.click()}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        newStoryVideo 
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      <Video className="w-4 h-4 text-blue-500" />
                      <span>{newStoryVideo ? 'Video Değiştir' : 'Video'}</span>
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsStoryLocationMenuOpen(!isStoryLocationMenuOpen)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          newStoryLocation 
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                            : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>{newStoryLocation ? 'Konum Değiştir' : 'Konum'}</span>
                      </button>

                      {/* Location selector dropdown for stories */}
                      <AnimatePresence>
                        {isStoryLocationMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-11 left-0 z-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-2 w-64 max-h-48 overflow-y-auto"
                          >
                            <button
                              type="button"
                              disabled={isStoryLocating}
                              onClick={handleStoryGPSLocation}
                              className="w-full text-left px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-extrabold text-brand-700 dark:text-brand-500 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 animate-bounce" />
                              <span>{isStoryLocating ? "Konum Alınıyor..." : "📍 GPS ile Konumumu Bul"}</span>
                            </button>
                            
                            {storyGpsError && (
                              <p className="text-[10px] text-brand-500 px-3 py-1 font-medium">{storyGpsError}</p>
                            )}
                            
                            <div className="border-t border-slate-100 dark:border-slate-700 my-1.5" />
                            
                            {CAMPUS_LOCATIONS.map((loc, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setNewStoryLocation(loc);
                                  setIsStoryLocationMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg transition"
                              >
                                {loc}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Hidden inputs */}
                  <input 
                    type="file" 
                    ref={storyImageInputRef} 
                    accept="image/*" 
                    onChange={handleStoryImageChange} 
                    className="hidden" 
                  />
                  <input 
                    type="file" 
                    ref={storyVideoInputRef} 
                    accept="video/*" 
                    onChange={handleStoryVideoChange} 
                    className="hidden" 
                  />

                  {/* Status checklist of active attachments */}
                  {(newStoryImage || newStoryVideo || newStoryLocation) && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-150 dark:border-slate-800">
                      {newStoryImage && (
                        <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg p-1.5 pl-2.5 border border-slate-200 dark:border-slate-700 text-[10px]">
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate flex items-center gap-1.5">
                            <Image className="w-3.5 h-3.5 text-emerald-500" />
                            Fotoğraf eklendi
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewStoryImage(null)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {newStoryVideo && (
                        <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg p-1.5 pl-2.5 border border-slate-200 dark:border-slate-700 text-[10px]">
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                            Video eklendi
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewStoryVideo(null)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {newStoryLocation && (
                        <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg p-1.5 pl-2.5 border border-slate-200 dark:border-slate-700 text-[10px]">
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {newStoryLocation}
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewStoryLocation(null)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Gradient Chooser */}
                {!newStoryImage && !newStoryVideo && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Arka Plan Gradiyenti</label>
                    <div className="grid grid-cols-6 gap-2 mt-1.5">
                      {[
                        "from-blue-600 via-indigo-600 to-purple-600",
                        "from-brand-600 via-rose-500 to-indigo-500",
                        "from-teal-500 to-emerald-500",
                        "from-pink-500 via-brand-500 to-yellow-500",
                        "from-slate-800 via-slate-900 to-indigo-950",
                        "from-brand-500 to-brand-800"
                      ].map((grad, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedGradient(grad)}
                          className={`aspect-square rounded-xl bg-gradient-to-tr ${grad} transition-all transform hover:scale-105 ${selectedGradient === grad ? 'ring-2 ring-brand-500 dark:ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'opacity-80'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddStoryOpen(false);
                      setNewStoryText('');
                      setIsEmojiPickerOpen(false);
                      setNewStoryImage(null);
                      setNewStoryVideo(null);
                      setNewStoryLocation(null);
                      setIsStoryLocationMenuOpen(false);
                      setStoryGpsError(null);
                      setTextX(50);
                      setTextY(50);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition text-xs cursor-pointer text-center"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="button"
                    disabled={!newStoryText.trim() && !newStoryImage && !newStoryVideo}
                    onClick={() => {
                      if (onAddStory) {
                        onAddStory(
                          newStoryText,
                          selectedGradient,
                          newStoryImage || undefined,
                          newStoryVideo || undefined,
                          newStoryLocation || undefined,
                          textX,
                          textY
                        );
                      }
                      setIsAddStoryOpen(false);
                      setNewStoryText('');
                      setIsEmojiPickerOpen(false);
                      setNewStoryImage(null);
                      setNewStoryVideo(null);
                      setNewStoryLocation(null);
                      setIsStoryLocationMenuOpen(false);
                      setStoryGpsError(null);
                      setTextX(50);
                      setTextY(50);
                    }}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 text-slate-900 font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    Paylaş
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Story Viewer Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <div 
              ref={viewerConstraintsRef}
              className="relative max-w-md w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 text-white bg-slate-900"
            >
              {/* Tap zones for going back/forward */}
              <div 
                onClick={() => {
                  if (activeStoryIndex > 0) {
                    setActiveStoryIndex(activeStoryIndex - 1);
                  } else {
                    setActiveStoryIndex(null);
                  }
                }}
                className="absolute top-0 left-0 w-1/4 h-full z-10 cursor-pointer" 
              />
              <div 
                onClick={() => {
                  if (activeStoryIndex < stories.length - 1) {
                    setActiveStoryIndex(activeStoryIndex + 1);
                  } else {
                    setActiveStoryIndex(null);
                  }
                }}
                className="absolute top-0 right-0 w-1/4 h-full z-10 cursor-pointer" 
              />

              {/* Inside layout with correct styles based on story (using positive z-indices) */}
              {stories[activeStoryIndex]?.gradientClass && (
                <div className={`absolute inset-0 bg-gradient-to-tr z-0 ${stories[activeStoryIndex].gradientClass}`} />
              )}

              {stories[activeStoryIndex]?.image && (
                <img 
                  src={stories[activeStoryIndex].image} 
                  className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none" 
                  alt="Story content" 
                  referrerPolicy="no-referrer"
                />
              )}

              {stories[activeStoryIndex]?.video && (
                <video 
                  src={stories[activeStoryIndex].video} 
                  className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                />
              )}

              {/* Backdrop gradient overlay for readability when media is present */}
              {(stories[activeStoryIndex]?.image || stories[activeStoryIndex]?.video) && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/70 z-5 pointer-events-none" />
              )}

              {/* Top controls & indicators */}
              <div className="space-y-3 z-20">
                {/* Progress bars */}
                <div className="flex gap-1.5 w-full">
                  {stories.map((_, idx) => (
                    <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-[50ms] ease-linear"
                        style={{
                          width: idx < activeStoryIndex 
                            ? '100%' 
                            : idx === activeStoryIndex 
                            ? `${storyProgress}%` 
                            : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* User Info & Close */}
                <div className="flex justify-between items-center">
                  <div 
                    className={`flex items-center gap-2.5 z-35 ${onViewProfile ? 'cursor-pointer hover:opacity-85' : ''}`}
                    onClick={() => {
                      if (onViewProfile && stories[activeStoryIndex]) {
                        const story = stories[activeStoryIndex];
                        setActiveStoryIndex(null);
                        onViewProfile(story.authorStudentId || story.author, !!story.authorStudentId);
                      }
                    }}
                  >
                    <img
                      src={stories[activeStoryIndex]?.authorAvatar}
                      className="w-9 h-9 rounded-full border border-white/20 object-cover"
                      alt={stories[activeStoryIndex]?.author}
                    />
                    <div>
                      <p className="text-sm font-black leading-none">@{stories[activeStoryIndex]?.author}</p>
                      {stories[activeStoryIndex]?.authorStudentId && (
                        <p className="text-[10px] font-medium text-brand-300 mt-1 leading-none">
                          @{stories[activeStoryIndex]?.authorStudentId}
                        </p>
                      )}
                      <div className="flex flex-col gap-0.5 mt-1.5">
                        {stories[activeStoryIndex]?.location && (
                          <span className="text-[10px] text-brand-300 font-bold flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {stories[activeStoryIndex].location.replace("📍 ", "")}
                          </span>
                        )}
                        <span className="text-[9px] text-white/60">
                          {formatRelativeTime(stories[activeStoryIndex]?.createdAt, "Şimdi")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition cursor-pointer z-35"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Empty flex spacer to maintain layout */}
              <div className="flex-1" />

              {/* Story Content absolute positioned based on coordinates, and user can also drag it! */}
              <motion.p
                drag
                dragConstraints={viewerConstraintsRef}
                dragElastic={0.05}
                dragMomentum={false}
                style={{
                  position: 'absolute',
                  left: `${stories[activeStoryIndex]?.textX ?? 50}%`,
                  top: `${stories[activeStoryIndex]?.textY ?? 50}%`,
                  x: "-50%",
                  y: "-50%"
                }}
                className="absolute z-25 text-xl md:text-2xl font-black text-center leading-relaxed tracking-wide drop-shadow-lg break-words max-w-[85%] whitespace-pre-wrap cursor-grab active:cursor-grabbing select-none"
              >
                {stories[activeStoryIndex]?.content}
              </motion.p>

              {/* Bottom Nav buttons */}
              <div className="flex justify-between items-center z-35 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeStoryIndex > 0) {
                      setActiveStoryIndex(activeStoryIndex - 1);
                    }
                  }}
                  disabled={activeStoryIndex === 0}
                  className="py-2 px-4 bg-black/20 hover:bg-black/35 rounded-xl border border-white/10 text-white/80 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Önceki
                </button>
                
                <span className="text-[10px] text-white/50 font-mono">
                  {activeStoryIndex + 1} / {stories.length}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeStoryIndex < stories.length - 1) {
                      setActiveStoryIndex(activeStoryIndex + 1);
                    } else {
                      setActiveStoryIndex(null);
                    }
                  }}
                  className="py-2 px-4 bg-black/20 hover:bg-black/35 rounded-xl border border-white/10 text-white/80 transition cursor-pointer"
                >
                  {activeStoryIndex === stories.length - 1 ? "Kapat" : "Sonraki"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
