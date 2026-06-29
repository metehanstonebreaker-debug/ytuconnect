import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Flame, 
  Coins, 
  Clock, 
  Calendar, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface MealMenu {
  dayName: string;
  soup: string;
  main: string;
  side: string;
  dessert: string;
  calories: number;
  vegetarianAlt: string;
}

const WEEKLY_MENU: Record<string, MealMenu> = {
  'Pazartesi': {
    dayName: 'Pazartesi',
    soup: 'Süzme Mercimek Çorbası',
    main: 'Piliç Topkapı veya İzmir Köfte',
    side: 'Tereyağlı Pirinç Pilavı',
    dessert: 'Supangle veya Elma',
    calories: 980,
    vegetarianAlt: 'Nohutlu Sebze Sote'
  },
  'Salı': {
    dayName: 'Salı',
    soup: 'Ezogelin Çorbası',
    main: 'Fırın Tas Kebabı',
    side: 'Sebzeli Bulgur Pilavı',
    dessert: 'Mevsim Salatası veya Yoğurt',
    calories: 1020,
    vegetarianAlt: 'Fırında Beşamel Soslu Karnabahar'
  },
  'Çarşamba': {
    dayName: 'Çarşamba',
    soup: 'Yayla Çorbası',
    main: 'Soslu Tavuk Baget',
    side: 'Fırın Makarna',
    dessert: 'Kemalpaşa Tatlısı veya Portakal',
    calories: 950,
    vegetarianAlt: 'Zeytinyağlı Taze Fasulye'
  },
  'Perşembe': {
    dayName: 'Perşembe',
    soup: 'Tarhana Çorbası',
    main: 'Etli Kuru Fasulye',
    side: 'Şehriyeli Pirinç Pilavı',
    dessert: 'Cacık veya Revani',
    calories: 1100,
    vegetarianAlt: 'Kuru Fasulye (Etsiz)'
  },
  'Cuma': {
    dayName: 'Cuma',
    soup: 'Domates Çorbası (Kaşarlı)',
    main: 'Yıldız Usulü Çökertme Kebabı',
    side: 'Baharatlı Elma Dilim Patates',
    dessert: 'Mozaik Pasta veya Ayran',
    calories: 1050,
    vegetarianAlt: 'Fırında Soslu Mücver'
  }
};

export default function YemekhaneWidget() {
  const days = Object.keys(WEEKLY_MENU);
  
  // Default to today's weekday if possible, otherwise Pazartesi
  const getTodayWeekday = () => {
    const dayIndex = new Date().getDay(); // 0 = Pazar, 1 = Pazartesi...
    const weekdayMap = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const currentDay = weekdayMap[dayIndex];
    return WEEKLY_MENU[currentDay] ? currentDay : 'Pazartesi';
  };

  const [selectedDay, setSelectedDay] = useState<string>(getTodayWeekday());
  const [showVegetarian, setShowVegetarian] = useState<boolean>(false);

  const activeMenu = WEEKLY_MENU[selectedDay];

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-4 space-y-4" 
      id="ytu_yemekhane_widget"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-lg">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Yemekhane Menüsü</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Davutpaşa & Beşiktaş Merkez Yemekhaneleri</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Coins className="w-3 h-3" />
            20.00 ₺
          </span>
          <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">Öğrenci Tarifesi</span>
        </div>
      </div>

      {/* Weekday Quick Select Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {days.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                setShowVegetarian(false); // Reset vegetarian toggle when switching days
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Main Menu Display with AnimatePresence */}
      <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-800/40 rounded-xl p-3.5 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay + (showVegetarian ? '_veg' : '_reg')}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {/* Soup Row */}
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Çorba</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{activeMenu.soup}</p>
              </div>
            </div>

            {/* Main Course Row */}
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Ana Yemek</p>
                  {showVegetarian && (
                    <span className="text-[8px] px-1 bg-emerald-500/15 text-emerald-500 rounded font-bold uppercase tracking-wide">
                      Vejetaryen
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                  {showVegetarian ? activeMenu.vegetarianAlt : activeMenu.main}
                </p>
              </div>
            </div>

            {/* Side dish Row */}
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-1.5 shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Yardımcı Yemek</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{activeMenu.side}</p>
              </div>
            </div>

            {/* Dessert / Alt Row */}
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-1.5 shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tatlı / Meyve / İçecek</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{activeMenu.dessert}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nutritional & Alt Option Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>{activeMenu.calories} kcal</span>
          </div>

          <button
            onClick={() => setShowVegetarian(!showVegetarian)}
            className={`px-2 py-0.5 rounded-md font-bold text-[9px] transition-all cursor-pointer flex items-center gap-1 ${
              showVegetarian 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {showVegetarian ? 'Normal Menü' : 'Vejetaryen Menü'}
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="flex items-center gap-2 text-[9px] text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-slate-950/15 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/30">
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="leading-tight">
          Öğle: 11:30 - 14:30 | Akşam: 16:30 - 19:00 saatleri arasında servis edilir.
        </span>
      </div>
    </div>
  );
}
