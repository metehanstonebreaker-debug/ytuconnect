/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Info,
  Camera,
  Upload,
  Image,
  Smile,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Palette
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
  
  // Custom Profile Avatar & Photo Editor States
  const [avatar, setAvatar] = useState<string>(preferences.avatar || '');
  const [activeEditorTab, setActiveEditorTab] = useState<'preset' | 'camera' | 'upload'>('preset');
  
  // Camera capture states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Photo Edit Editor states
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const [filter, setFilter] = useState<string>('none');
  const [frame, setFrame] = useState<string>('none');
  const [sticker, setSticker] = useState<string>('none');
  
  // Upload drag & drop
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Excluded content types / fields / keywords
  const [excludedCategories, setExcludedCategories] = useState<string[]>(preferences.excludedCategories || []);
  const [customFilterInput, setCustomFilterInput] = useState('');

  // Handle camera stream cleanup
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Methods for starting and stopping webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn("Camera capture unavailable:", err);
      alert("Kameraya erişilemedi. Tarayıcı izinlerinizi kontrol edin. Test etmek için simülasyon görseli yüklenecektir.");
      // Load visual placeholder as fallback so users can test full editor pipeline easily
      setEditorImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setEditorImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Helper to load fallback simulation picture directly
  const loadFallbackSimulationImage = () => {
    setEditorImage("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80");
    stopCamera();
  };

  // Preset Generation: Colored Initials
  const generateInitialsAvatar = (gradientStart: string, gradientEnd: string, textColor: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 200, 200);
      grad.addColorStop(0, gradientStart);
      grad.addColorStop(1, gradientEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 200, 200);

      const displayInitials = username.trim() 
        ? username.trim().slice(0, 2).toUpperCase() 
        : "YTÜ";

      ctx.fillStyle = textColor;
      ctx.font = 'bold 80px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayInitials, 100, 100);

      const dataUrl = canvas.toDataURL('image/png');
      setAvatar(dataUrl);
    }
  };

  // Preset Generation: Thematic Icons
  const generateThematicAvatar = (type: 'engineering' | 'code' | 'art' | 'science') => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (type === 'engineering') {
        ctx.fillStyle = '#003057';
        ctx.fillRect(0, 0, 200, 200);
        ctx.strokeStyle = '#EAAA00';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(100, 100, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#EAAA00';
        ctx.beginPath();
        ctx.arc(100, 100, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 12;
        for (let i = 0; i < 8; i++) {
          ctx.save();
          ctx.translate(100, 100);
          ctx.rotate((i * Math.PI) / 4);
          ctx.beginPath();
          ctx.moveTo(0, -40);
          ctx.lineTo(0, -60);
          ctx.stroke();
          ctx.restore();
        }
      } else if (type === 'code') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#10b981';
        ctx.font = '900 85px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("</>", 100, 100);
      } else if (type === 'art') {
        const grad = ctx.createLinearGradient(0, 0, 200, 200);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(1, '#f97316');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("🎨", 100, 100);
      } else if (type === 'science') {
        const grad = ctx.createLinearGradient(0, 0, 200, 200);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 85px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("🔬", 100, 100);
      }
      const dataUrl = canvas.toDataURL('image/png');
      setAvatar(dataUrl);
    }
  };

  // Upload handler files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadPhotoFile(file);
    }
  };

  const loadPhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditorImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadPhotoFile(file);
    }
  };

  // Apply photo modifications using Canvas API
  const applyEdits = () => {
    if (!editorImage) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 300, 300);

        // Circular clipping
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.clip();

        // Canvas default background fill
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 300, 300);

        // Save states & Apply rotation, zoom offsets
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, -150, -150, 300, 300);
        ctx.restore();

        // Canvas custom pixel filters
        const imgData = ctx.getImageData(0, 0, 300, 300);
        const data = imgData.data;
        if (filter === 'grayscale') {
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;     // R
            data[i + 1] = avg; // G
            data[i + 2] = avg; // B
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (filter === 'sepia') {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (filter === 'warm') {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15);
            data[i + 2] = data[i + 2] * 0.9;
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (filter === 'cool') {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * 0.9;
            data[i + 2] = Math.min(255, data[i + 2] * 1.15);
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // Draw overlay frame
        if (frame === 'border') {
          ctx.strokeStyle = '#EAAA00';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(150, 150, 143, 0, Math.PI * 2);
          ctx.stroke();
        } else if (frame === 'grad') {
          const gradient = ctx.createLinearGradient(0, 0, 300, 300);
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(0.5, '#eab308');
          gradient.addColorStop(1, '#3b82f6');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(150, 150, 143, 0, Math.PI * 2);
          ctx.stroke();
        } else if (frame === 'brand') {
          ctx.strokeStyle = '#003057';
          ctx.lineWidth = 22;
          ctx.beginPath();
          ctx.arc(150, 150, 139, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#EAAA00';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(150, 150, 148, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.save();
          ctx.translate(150, 150);
          ctx.fillText("YILDIZ TEKNİK ÜNİVERSİTESİ", 0, -139);
          ctx.fillText("★ 1911 ★", 0, 139);
          ctx.restore();
        }

        // Draw stickers
        if (sticker === 'gradcap') {
          ctx.fillStyle = '#000000';
          ctx.save();
          ctx.translate(220, 220);
          
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(25, 0);
          ctx.lineTo(0, 15);
          ctx.lineTo(-25, 0);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-12, 4);
          ctx.lineTo(-12, 16);
          ctx.bezierCurveTo(-12, 22, 12, 22, 12, 16);
          ctx.lineTo(12, 4);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#EAAA00';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-18, 12);
          ctx.lineTo(-18, 20);
          ctx.stroke();
          
          ctx.restore();
        } else if (sticker === 'sparkle') {
          ctx.fillStyle = '#EAAA00';
          const drawStar = (x: number, y: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.quadraticCurveTo(x, y, x, y + r);
            ctx.quadraticCurveTo(x, y, x - r, y);
            ctx.quadraticCurveTo(x, y, x, y - r);
            ctx.closePath();
            ctx.fill();
          };
          drawStar(60, 60, 12);
          drawStar(230, 70, 16);
          drawStar(70, 220, 10);
        }

        const finalUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(finalUrl);
        setEditorImage(null);
        setActiveEditorTab('preset');
      }
    };
    img.src = editorImage;
  };

  const handleSave = () => {
    if (!username.trim()) return;
    
    onSave({
      username: username.trim(),
      studentId: studentId.trim(),
      department,
      interestedFields: selectedFields,
      interestedClubs: selectedClubs,
      excludedCategories,
      avatar, // Save custom photo base64
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
              <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4" />
              1. Kişisel Profil Bilgileri
            </h3>
            
            {/* Profil Fotoğrafı Düzenleyici Modülü */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">PROFİL RESMİ VE AVATAR DÜZENLEYİCİ</span>
              
              {editorImage ? (
                /* ----------------- SUB-EDITOR AKTİFKEN GÖSTERİLECEK PANEL ----------------- */
                <div className="space-y-4 p-2 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Görseli Düzenle</p>
                    <p className="text-[10px] text-slate-400">Filtreleri, çerçeveleri ve stickerları uygulayın.</p>
                  </div>

                  {/* Dynamic Preview Container with CSS styling mimicking the Canvas export */}
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 shadow-lg mx-auto bg-slate-900 flex items-center justify-center">
                    {/* Frame overlay */}
                    {frame === 'border' && (
                      <div className="absolute inset-0 rounded-full border-[6px] border-[#EAAA00] z-20 pointer-events-none" />
                    )}
                    {frame === 'grad' && (
                      <div className="absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-tr from-rose-500 via-yellow-500 to-blue-500 z-20 pointer-events-none" style={{ WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                    )}
                    {frame === 'brand' && (
                      <div className="absolute inset-0 rounded-full border-[10px] border-[#003057] z-20 pointer-events-none flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-[#EAAA00]" />
                        <span className="absolute text-[5px] text-white font-black tracking-widest text-center uppercase top-1">YTÜ</span>
                        <span className="absolute text-[5px] text-white font-black tracking-widest text-center uppercase bottom-1">1911</span>
                      </div>
                    )}

                    {/* Sticker overlay */}
                    {sticker === 'gradcap' && (
                      <div className="absolute bottom-2 right-2 bg-slate-950 text-white rounded-lg p-1 text-xs font-bold border border-[#EAAA00] z-30 pointer-events-none shadow-md">
                        🎓
                      </div>
                    )}
                    {sticker === 'sparkle' && (
                      <div className="absolute top-2 left-2 text-yellow-400 text-lg z-30 pointer-events-none animate-pulse">
                        ⭐
                      </div>
                    )}

                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                      <img 
                        src={editorImage} 
                        alt="Editing preview" 
                        style={{
                          transform: `scale(${zoom}) rotate(${rotate}deg)`,
                          filter: filter === 'grayscale' ? 'grayscale(100%)' :
                                  filter === 'sepia' ? 'sepia(100%)' :
                                  filter === 'warm' ? 'saturate(130%) sepia(15%) hue-rotate(-10deg)' :
                                  filter === 'cool' ? 'saturate(110%) hue-rotate(15deg) brightness(95%)' : 'none',
                          transition: 'transform 0.15s ease-out, filter 0.15s'
                        }}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-3 pt-2">
                    {/* Zoom slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Yakınlaştır</span>
                        <span>{zoom.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Rotation controls */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Görseli Döndür
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRotate(prev => (prev - 90) % 360)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          ⟲ -90°
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotate(prev => (prev + 90) % 360)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          ⟳ +90°
                        </button>
                      </div>
                    </div>

                    {/* Filters selector */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Sanatsal Filtreler
                      </span>
                      <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-bold">
                        {[
                          { id: 'none', label: 'Normal' },
                          { id: 'grayscale', label: 'B&W' },
                          { id: 'sepia', label: 'Sepya' },
                          { id: 'warm', label: 'Sıcak' },
                          { id: 'cool', label: 'Soğuk' }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            className={`py-1 rounded-md transition ${filter === f.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Decorative Frames selector */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Kampüs Çerçeveleri
                      </span>
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                        {[
                          { id: 'none', label: 'Yok' },
                          { id: 'border', label: 'Altın Çember' },
                          { id: 'grad', label: 'Neon' },
                          { id: 'brand', label: 'YTÜ Logo' }
                        ].map(fr => (
                          <button
                            key={fr.id}
                            type="button"
                            onClick={() => setFrame(fr.id)}
                            className={`py-1 px-1 rounded-md transition truncate ${frame === fr.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                          >
                            {fr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stickers selector */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        👑 Rozet / Çıkartma
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-bold">
                        {[
                          { id: 'none', label: 'Yok' },
                          { id: 'gradcap', label: '🎓 Mezun' },
                          { id: 'sparkle', label: '⭐ Yıldız' }
                        ].map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSticker(st.id)}
                            className={`py-1 rounded-md transition ${sticker === st.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditorImage(null);
                          setZoom(1);
                          setRotate(0);
                          setFilter('none');
                          setFrame('none');
                          setSticker('none');
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="button"
                        onClick={applyEdits}
                        className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Değişiklikleri Uygula
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ----------------- STANDART PROFIL RESMI DUZENLEME PANEL ----------------- */
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  
                  {/* Sol Sütun: Mevcut Profil Görseli */}
                  <div className="space-y-2 text-center shrink-0">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <img 
                        src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "YTÜ")}&background=EAAA00&color=003057`} 
                        className="w-full h-full object-cover rounded-full"
                        alt="Profil Avatarı"
                      />
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-rose-400 cursor-pointer"
                          title="Sıfırla"
                        >
                          Sıfırla
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500">Mevcut Avatarınız</p>
                  </div>

                  {/* Sağ Sütun: Sekmeli Yükleme/Oluşturma Alanı */}
                  <div className="flex-1 w-full space-y-3">
                    
                    {/* Sekme düğmeleri */}
                    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 pb-1">
                      {[
                        { id: 'preset', label: 'Hazır/İnisyal', icon: Palette },
                        { id: 'camera', label: 'Kamera Çek', icon: Camera },
                        { id: 'upload', label: 'Fotoğraf Yükle', icon: Upload }
                      ].map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveEditorTab(tab.id as any);
                              stopCamera();
                            }}
                            className={`flex-1 py-1 px-1 rounded-md text-[10px] font-extrabold flex items-center justify-center gap-1 transition ${activeEditorTab === tab.id ? 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sekme İçerikleri */}
                    <div>
                      {activeEditorTab === 'preset' && (
                        <div className="space-y-3 text-xs animate-in fade-in-50 duration-150">
                          {/* İnisyal Renk Seçici */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400">İnisyal Rengi Seçin:</span>
                            <div className="flex gap-2">
                              {[
                                { name: 'Golden', start: '#EAAA00', end: '#FF5722', text: '#FFFFFF' },
                                { name: 'Ocean', start: '#003057', end: '#1E88E5', text: '#FFFFFF' },
                                { name: 'Forest', start: '#2E7D32', end: '#81C784', text: '#FFFFFF' },
                                { name: 'Crimson', start: '#D84315', end: '#FF8A65', text: '#FFFFFF' },
                                { name: 'Purple', start: '#6A1B9A', end: '#BA68C8', text: '#FFFFFF' }
                              ].map(color => (
                                <button
                                  key={color.name}
                                  type="button"
                                  onClick={() => generateInitialsAvatar(color.start, color.end, color.text)}
                                  className="w-6 h-6 rounded-full transition transform hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                                  style={{ background: `linear-gradient(135deg, ${color.start}, ${color.end})` }}
                                  title={`${color.name} Gradient`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Tematik İkon Sınıfları */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400">Akademik Temalı Hazır Avatarlar:</span>
                            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                              <button
                                type="button"
                                onClick={() => generateThematicAvatar('engineering')}
                                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-left cursor-pointer"
                              >
                                ⚙️ Mühendislik
                              </button>
                              <button
                                type="button"
                                onClick={() => generateThematicAvatar('code')}
                                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-left cursor-pointer"
                              >
                                💻 Yazılım / CS
                              </button>
                              <button
                                type="button"
                                onClick={() => generateThematicAvatar('art')}
                                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-left cursor-pointer"
                              >
                                🎨 Sanat & Tasarım
                              </button>
                              <button
                                type="button"
                                onClick={() => generateThematicAvatar('science')}
                                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-left cursor-pointer"
                              >
                                🔬 Temel Bilimler
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeEditorTab === 'camera' && (
                        <div className="space-y-2.5 animate-in fade-in-50 duration-150 text-center">
                          {cameraStream ? (
                            <div className="space-y-2">
                              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 mx-auto bg-black shadow-inner">
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  muted 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold rounded-lg transition cursor-pointer"
                                >
                                  Kapat
                                </button>
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  className="px-3 py-1 text-[10px] bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Camera className="w-3 h-3" /> Fotoğrafı Yakala
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/80 rounded-xl space-y-2">
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Kamera erişim izni vererek cihazınızın kamerası ile anlık profil fotoğrafı çekip düzenleyebilirsiniz.
                              </p>
                              <div className="flex justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={startCamera}
                                  className="py-1.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" /> Kamerayı Başlat
                                </button>
                                <button
                                  type="button"
                                  onClick={loadFallbackSimulationImage}
                                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                                  title="Kamera izni yoksa test görseli yükler"
                                >
                                  Simülasyon Çekimi
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeEditorTab === 'upload' && (
                        <div className="animate-in fade-in-50 duration-150">
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-4 border-2 border-dashed rounded-xl text-center transition cursor-pointer space-y-2 ${isDragging ? 'border-amber-400 bg-amber-400/5' : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-700/80 bg-slate-50 dark:bg-slate-950/20'}`}
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full w-9 h-9 mx-auto flex items-center justify-center text-slate-500">
                              <Upload className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5 text-xs">
                              <p className="font-bold text-slate-700 dark:text-slate-300">Görsel Seçin veya Sürükleyin</p>
                              <p className="text-[10px] text-slate-400">PNG, JPG, WEBP (Maks. 5MB)</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
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
