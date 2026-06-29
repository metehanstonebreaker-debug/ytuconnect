/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Wind, Cloud, Clock } from 'lucide-react';

export default function WeatherWidget() {
  const [weatherTime, setWeatherTime] = useState('');
  const [temps, setTemps] = useState({ davutpasa: 22, besiktas: 20 });

  useEffect(() => {
    // Clock update
    const updateTime = () => {
      const now = new Date();
      setWeatherTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    // Random slight temp changes
    const randomizeWeather = () => {
      setTemps({
        davutpasa: Math.floor(Math.random() * (26 - 18) + 18),
        besiktas: Math.floor(Math.random() * (24 - 17) + 17)
      });
    };
    randomizeWeather();
    const weatherInterval = setInterval(randomizeWeather, 120000);

    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80 border-b-4 border-b-amber-400 transition hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <span>Kampüs Havası</span>
        </h3>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {weatherTime || "14:00"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
          <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Davutpaşa</p>
          <div className="flex justify-center my-1.5">
            <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />
          </div>
          <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{temps.davutpasa}°C</p>
          <span className="text-[9px] text-slate-400">Güneşli</span>
        </div>

        <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
          <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Beşiktaş</p>
          <div className="flex justify-center my-1.5">
            <Wind className="w-6 h-6 text-sky-400" />
          </div>
          <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{temps.besiktas}°C</p>
          <span className="text-[9px] text-slate-400">Rüzgarlı</span>
        </div>
      </div>
    </div>
  );
}
