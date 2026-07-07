import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Info
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  grade: string; // e.g. "AA", "BA", etc.
  credits: number; // Credit / AKTS value
}

// YTÜ Grade Letters and Coefficients
const GRADE_COEFFICIENTS: Record<string, number> = {
  'AA': 4.0,
  'BA': 3.5,
  'BB': 3.0,
  'CB': 2.5,
  'CC': 2.0,
  'DC': 1.5,
  'DD': 1.0,
  'FD': 0.5,
  'FF': 0.0,
  'F0': 0.0
};

export default function GpaCalculator() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ytu_gpa_courses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default courses for clean state
    return [
      { id: '1', name: 'Matematik I', grade: 'AA', credits: 5 },
      { id: '2', name: 'Fizik I', grade: 'BA', credits: 4 },
      { id: '3', name: 'Programlamaya Giriş', grade: 'BB', credits: 6 }
    ];
  });

  // Cumulative GPA calculator inputs
  const [prevGpa, setPrevGpa] = useState<number>(() => {
    const saved = localStorage.getItem('ytu_prev_gpa');
    return saved ? parseFloat(saved) : 0;
  });
  const [prevCredits, setPrevCredits] = useState<number>(() => {
    const saved = localStorage.getItem('ytu_prev_credits');
    return saved ? parseInt(saved) : 0;
  });

  const [showPrevGpaInput, setShowPrevGpaInput] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ytu_gpa_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('ytu_prev_gpa', prevGpa.toString());
  }, [prevGpa]);

  useEffect(() => {
    localStorage.setItem('ytu_prev_credits', prevCredits.toString());
  }, [prevCredits]);

  // Handle adding course
  const handleAddCourse = () => {
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      name: `Ders ${courses.length + 1}`,
      grade: 'AA',
      credits: 4
    };
    setCourses([...courses, newCourse]);
  };

  // Handle removing course
  const handleRemoveCourse = (id: string) => {
    if (courses.length === 1) {
      alert("En az bir ders bulunmalıdır.");
      return;
    }
    setCourses(courses.filter(c => c.id !== id));
  };

  // Handle changing course attributes
  const handleCourseChange = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        return {
          ...course,
          [field]: field === 'credits' ? (parseInt(value) || 0) : value
        };
      }
      return course;
    }));
  };

  // Reset calculator
  const handleReset = () => {
    if (window.confirm("Hesaplayıcıyı sıfırlamak istiyor musunuz?")) {
      setCourses([
        { id: '1', name: 'Ders 1', grade: 'AA', credits: 4 }
      ]);
      setPrevGpa(0);
      setPrevCredits(0);
      setShowPrevGpaInput(false);
    }
  };

  // Calculation logic
  const calculateSemesterGpa = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const coef = GRADE_COEFFICIENTS[course.grade] ?? 0;
      totalPoints += coef * course.credits;
      totalCredits += course.credits;
    });

    if (totalCredits === 0) return { gpa: 0, credits: 0 };
    return {
      gpa: Math.round((totalPoints / totalCredits) * 100) / 100,
      credits: totalCredits
    };
  };

  const semesterResults = calculateSemesterGpa();

  // Cumulative GPA (AGNO) combining previous and current semesters
  const calculateCumulativeGpa = () => {
    const currentPoints = semesterResults.gpa * semesterResults.credits;
    const previousPoints = prevGpa * prevCredits;
    const totalCreditsCombined = prevCredits + semesterResults.credits;

    if (totalCreditsCombined === 0) return 0;
    
    // Total weight calculations
    let totalWeightedPoints = 0;
    courses.forEach(course => {
      const coef = GRADE_COEFFICIENTS[course.grade] ?? 0;
      totalWeightedPoints += coef * course.credits;
    });
    totalWeightedPoints += previousPoints;

    return Math.round((totalWeightedPoints / totalCreditsCombined) * 100) / 100;
  };

  const cumulativeGpa = calculateCumulativeGpa();

  // GPA Evaluation text/feedback
  const getGpaFeedback = (gpaVal: number) => {
    if (gpaVal >= 3.5) return { text: "Yüksek Şeref Öğrencisi! 🏆", color: "text-emerald-500" };
    if (gpaVal >= 3.0) return { text: "Şeref Öğrencisi! 🌟", color: "text-teal-500" };
    if (gpaVal >= 2.0) return { text: "Başarılı Durumdasın 👍", color: "text-brand-700 dark:text-brand-500" };
    return { text: "Barajın Altında (Yükseltmen Gerek) ⚠️", color: "text-rose-500" };
  };

  const gpaFeedback = getGpaFeedback(semesterResults.gpa);
  const cumFeedback = getGpaFeedback(cumulativeGpa);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 border-b-4 border-b-brand-600 transition duration-350 hover:shadow-md overflow-hidden" id="ytu_gpa_calculator">
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex justify-between items-center text-left bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/45 transition outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-500 text-slate-950 rounded-lg shadow-inner">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">AGNO Hesaplama</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Dönem Not Ortalaması ve Genel AGNO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-brand-700 dark:text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md">
            {semesterResults.gpa.toFixed(2)}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Main Panel Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-slate-100 dark:border-slate-800/80 p-4 space-y-4"
          >
            {/* Courses Inputs */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <div className="col-span-6">Ders Adı</div>
                <div className="col-span-3 text-center">Harf</div>
                <div className="col-span-3 text-center">Kredi</div>
              </div>

              {courses.map((course) => (
                <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
                  {/* Name */}
                  <div className="col-span-6">
                    <input 
                      type="text"
                      value={course.name}
                      onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-500 transition"
                      placeholder="Ders Adı"
                    />
                  </div>

                  {/* Letter Grade */}
                  <div className="col-span-3">
                    <select 
                      value={course.grade}
                      onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
                      className="w-full text-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-1.5 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-500 transition cursor-pointer font-bold"
                    >
                      {Object.keys(GRADE_COEFFICIENTS).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Credit / AKTS */}
                  <div className="col-span-3 flex items-center gap-1.5">
                    <input 
                      type="number"
                      min="1"
                      max="30"
                      value={course.credits}
                      onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                      className="w-full text-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-1 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-500 transition font-bold"
                    />
                    <button 
                      onClick={() => handleRemoveCourse(course.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition shrink-0 cursor-pointer"
                      title="Dersi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form actions: Add Course / Reset */}
            <div className="flex gap-2.5">
              <button 
                onClick={handleAddCourse}
                className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-transparent dark:border-slate-700/30"
              >
                <Plus className="w-4 h-4 text-brand-600" />
                Ders Ekle
              </button>
              <button 
                onClick={handleReset}
                className="p-2 bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-400 dark:hover:text-rose-400 rounded-xl transition flex items-center justify-center cursor-pointer border border-transparent dark:border-slate-700/30"
                title="Sıfırla"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GPA Summary results */}
            <div className="bg-slate-50 dark:bg-slate-950/65 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Toplam Dönem Kredisi:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{semesterResults.credits} AKTS</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200/50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-semibold font-sans">Dönem Ortalama:</span>
                <span className="font-black text-brand-700 dark:text-brand-500 text-sm bg-brand-500/5 px-2 py-0.5 rounded-md">
                  {semesterResults.gpa.toFixed(2)}
                </span>
              </div>
              <div className={`text-[10px] font-bold text-center ${gpaFeedback.color}`}>
                {gpaFeedback.text}
              </div>
            </div>

            {/* Cumulative GPA Expand Toggler */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <button 
                type="button"
                onClick={() => setShowPrevGpaInput(!showPrevGpaInput)}
                className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-brand-700 dark:hover:text-brand-500 font-bold transition outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-700 dark:text-brand-500" />
                  Önceki Dönemleri Dahil Et (Genel AGNO)
                </span>
                {showPrevGpaInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showPrevGpaInput && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5 mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mevcut AGNO</label>
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={prevGpa || ''}
                          onChange={(e) => setPrevGpa(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-500 transition font-bold"
                          placeholder="Örn: 2.85"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Önceki Tam. Kredi</label>
                        <input 
                          type="number"
                          min="0"
                          value={prevCredits || ''}
                          onChange={(e) => setPrevCredits(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-500 transition font-bold"
                          placeholder="Örn: 60"
                        />
                      </div>
                    </div>

                    {/* Combined Result */}
                    <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Tahmini Genel AGNO</p>
                        <p className={`text-[10px] font-bold mt-1 ${cumFeedback.color}`}>{cumFeedback.text}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-brand-800 dark:text-brand-500 bg-brand-500/15 border border-brand-500/25 px-2.5 py-1 rounded-lg">
                          {cumulativeGpa.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
