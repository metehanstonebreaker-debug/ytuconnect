/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RegisteredUser } from '../types';
import { 
  Search, 
  User, 
  GraduationCap, 
  Sparkles, 
  Users, 
  Hash,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { INTEREST_FIELDS, CLUBS } from '../mockData';

interface DiscoverUsersProps {
  users: RegisteredUser[];
  currentUserStudentId?: string;
  onViewProfile?: (studentIdOrUsername: string, isStudentId: boolean) => void;
}

export default function DiscoverUsers({ users, currentUserStudentId, onViewProfile }: DiscoverUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // Get unique departments for a dropdown filter
  const departments = Array.from(new Set(users.map(u => u.department))).filter(Boolean);

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      user.username.toLowerCase().includes(query) ||
      user.studentId.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query) ||
      (user.bio && user.bio.toLowerCase().includes(query));

    const matchDept = filterDepartment ? user.department === filterDepartment : true;

    return matchSearch && matchDept;
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-600" />
            Yıldızlı Kampüs Topluluğu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kampüsteki diğer Yıldızlıları keşfedin, ilgi alanlarına göre arkadaş bulun veya bölümlerdeki insanları inceleyin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nickname, okul no, bölüm veya biyografi ara..."
              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-700 dark:text-slate-300 font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 cursor-pointer min-w-[180px]"
          >
            <option value="">Tüm Bölümler</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Users */}
      {(searchQuery.trim() !== '' || filterDepartment !== '') ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800/80 text-center space-y-2">
              <User className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aradığınız kriterlere uygun öğrenci bulunamadı.</p>
              <p className="text-xs text-slate-400">Farklı anahtar kelimeler kullanarak aramayı tekrar deneyebilirsiniz.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isMe = currentUserStudentId === user.studentId;
              return (
                <motion.div
                  key={user.studentId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => onViewProfile && onViewProfile(user.studentId, true)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500/40 cursor-pointer ${
                    isMe 
                      ? 'border-brand-500/50 dark:border-brand-500/30 ring-1 ring-brand-500/10' 
                      : 'border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  {/* Me tag */}
                  {isMe && (
                    <span className="absolute top-3 right-3 bg-brand-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      SİZ
                    </span>
                  )}

                  {/* Profile Header */}
                  <div className="space-y-3.5">
                    <div className="flex gap-3.5 items-center">
                      <img 
                        src={user.avatar} 
                        className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-700 object-cover shrink-0 shadow-sm bg-slate-50"
                        alt={user.username}
                      />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm truncate flex items-center gap-1">
                          {user.username}
                        </h3>
                        <p className="text-[11px] text-brand-700 dark:text-brand-500 font-bold flex items-center gap-1 mt-0.5">
                          <Hash className="w-3.5 h-3.5" />
                          {user.studentId}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate flex items-center gap-1 mt-1">
                          <GraduationCap className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          {user.department}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/30 leading-relaxed italic">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Footer Tag Badges */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5">
                    {/* Interests */}
                    {user.interestedFields && user.interestedFields.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">İlgiler:</span>
                        {user.interestedFields.map(f => (
                          <span key={f} className="text-[9px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/15 font-bold px-1.5 py-0.5 rounded">
                            {getFieldLabel(f)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Clubs */}
                    {user.interestedClubs && user.interestedClubs.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <Users className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Kulüpler:</span>
                        {user.interestedClubs.map(c => (
                          <span key={c} className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 font-bold px-1.5 py-0.5 rounded">
                            {getClubName(c)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-100 dark:border-slate-800/80 text-center space-y-3">
          <Search className="w-10 h-10 text-brand-600/80 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Kampüstekileri Aramaya Başlayın</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Yıldızlı öğrencileri bulmak için arama kutusuna nickname, okul numarası, bölüm veya biyografi anahtar kelimelerini yazabilirsiniz.
          </p>
        </div>
      )}

    </div>
  );
}
