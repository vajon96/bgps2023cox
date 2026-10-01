import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate?: string;
  eventName?: string;
}

export const HeroCountdown: React.FC<CountdownProps> = ({
  targetDate = '2026-12-25T09:00:00',
  eventName = 'Grand Reunion 2026',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return null;
  }

  return (
    <div className="inline-flex flex-col items-center bg-white/90 backdrop-blur-md border border-[#C5A059]/40 shadow-xl rounded-2xl p-4 sm:p-5 max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#002147] mb-3">
        <Clock className="w-4 h-4 text-[#C5A059] animate-pulse" />
        <span>Countdown to {eventName}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        <div className="bg-[#002147] text-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[80px] shadow-inner">
          <span className="block text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F8FA]">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs text-[#C5A059] uppercase font-semibold">Days</span>
        </div>

        <div className="bg-[#002147] text-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[80px] shadow-inner">
          <span className="block text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F8FA]">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs text-[#C5A059] uppercase font-semibold">Hours</span>
        </div>

        <div className="bg-[#002147] text-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[80px] shadow-inner">
          <span className="block text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F8FA]">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs text-[#C5A059] uppercase font-semibold">Mins</span>
        </div>

        <div className="bg-[#002147] text-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[80px] shadow-inner border border-[#C5A059]/40">
          <span className="block text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#C5A059]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs text-white uppercase font-semibold">Secs</span>
        </div>
      </div>
    </div>
  );
};
