/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Wind, Cloud, Clock, CloudSnow, AlertCircle } from 'lucide-react';

interface CampusWeather {
  temp: number;
  code: number;
  statusText: string;
  iconName: 'sun' | 'cloud' | 'rain' | 'snow' | 'wind';
}

export default function WeatherWidget() {
  const [weatherTime, setWeatherTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [weatherData, setWeatherData] = useState<{
    davutpasa: CampusWeather;
    besiktas: CampusWeather;
  }>({
    davutpasa: { temp: 22, code: 0, statusText: 'Güneşli', iconName: 'sun' },
    besiktas: { temp: 20, code: 0, statusText: 'Açık', iconName: 'sun' }
  });

  const getWeatherDetails = (code: number): { text: string; icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'wind' } => {
    if (code === 0) return { text: 'Açık, Güneşli', icon: 'sun' };
    if ([1, 2, 3].includes(code)) return { text: 'Parçalı Bulutlu', icon: 'cloud' };
    if ([45, 48].includes(code)) return { text: 'Sisli', icon: 'cloud' };
    if ([51, 53, 55, 56, 57].includes(code)) return { text: 'Çiseleme', icon: 'rain' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: 'Yağmurlu', icon: 'rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: 'Karlı', icon: 'snow' };
    if ([95, 96, 99].includes(code)) return { text: 'Fırtınalı', icon: 'wind' };
    return { text: 'Açık', icon: 'sun' };
  };

  useEffect(() => {
    // Clock update
    const updateTime = () => {
      const now = new Date();
      setWeatherTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    // Fetch weather from open-meteo (Free, no keys needed)
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Davutpasa coordinates: 41.0267, 28.8917
        // Besiktas coordinates: 41.0422, 29.0075
        const dpRes = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.0267&longitude=28.8917&current=temperature_2m,weather_code'
        );
        const bsRes = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.0422&longitude=29.0075&current=temperature_2m,weather_code'
        );

        if (!dpRes.ok || !bsRes.ok) {
          throw new Error('Hava durumu verisi alınamadı');
        }

        const dpData = await dpRes.json();
        const bsData = await bsRes.json();

        const dpTemp = Math.round(dpData.current.temperature_2m);
        const dpCode = dpData.current.weather_code;
        const dpDetails = getWeatherDetails(dpCode);

        const bsTemp = Math.round(bsData.current.temperature_2m);
        const bsCode = bsData.current.weather_code;
        const bsDetails = getWeatherDetails(bsCode);

        setWeatherData({
          davutpasa: {
            temp: dpTemp,
            code: dpCode,
            statusText: dpDetails.text,
            iconName: dpDetails.icon
          },
          besiktas: {
            temp: bsTemp,
            code: bsCode,
            statusText: bsDetails.text,
            iconName: bsDetails.icon
          }
        });
        setLoading(false);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 900000);

    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
    };
  }, []);

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />;
      case 'cloud':
        return <Cloud className="w-6 h-6 text-slate-400 dark:text-slate-300" />;
      case 'rain':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-sky-200 animate-pulse" />;
      case 'wind':
        return <Wind className="w-6 h-6 text-sky-400" />;
      default:
        return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800/80 border-b-4 border-b-amber-400 transition hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Kampüs Havası (Canlı)</span>
        </h3>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {weatherTime || "14:00"}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 text-[11px] text-slate-400 gap-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Canlı veriler yükleniyor...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition">
            <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Davutpaşa</p>
            <div className="flex justify-center my-1.5">
              {renderWeatherIcon(weatherData.davutpasa.iconName)}
            </div>
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{weatherData.davutpasa.temp}°C</p>
            <span className="text-[9px] text-slate-400 block truncate">{weatherData.davutpasa.statusText}</span>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition">
            <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Beşiktaş</p>
            <div className="flex justify-center my-1.5">
              {renderWeatherIcon(weatherData.besiktas.iconName)}
            </div>
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{weatherData.besiktas.temp}°C</p>
            <span className="text-[9px] text-slate-400 block truncate">{weatherData.besiktas.statusText}</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mt-2 flex items-center gap-1 justify-center text-[9px] text-amber-500/80 bg-amber-50 dark:bg-amber-950/10 p-1 rounded">
          <AlertCircle className="w-3 h-3" />
          <span>API hatası, son veriler veya yedekler gösteriliyor.</span>
        </div>
      )}
    </div>
  );
}

