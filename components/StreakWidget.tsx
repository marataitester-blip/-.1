
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface StreakWidgetProps {
  currentStreak: number;
  freezeAvailable: number;
  progressPercent: number;
  nextMilestone: number;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ 
  currentStreak, 
  freezeAvailable, 
  progressPercent,
  nextMilestone 
}) => {
  const { t } = useTranslations();

  const milestones = [7, 14, 30, 100];

  return (
    <div className="w-full max-w-md mx-auto mb-8 animate-fade-in">
      {/* Upper Widget Card */}
      <div className="bg-gradient-to-r from-[#1a1a24] to-[#252530] border border-[var(--accent)]/30 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            <span className="text-2xl filter drop-shadow-md">🔥</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-bold text-[var(--accent)] font-serif leading-none">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
            <span className="text-xs text-[var(--muted)] uppercase tracking-wider">Current Streak</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-500/30">
          <span className="text-sm">❄️</span>
          <span className="text-sm font-bold text-blue-200">x{freezeAvailable}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-4 px-1">
        <div className="relative h-3 bg-gray-800/60 rounded-full overflow-hidden border border-white/5">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 via-[var(--accent)] to-yellow-200 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(199,168,123,0.5)]"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs font-medium text-[var(--muted)] font-serif">
          {milestones.map((m) => (
            <span 
              key={m} 
              className={`${currentStreak >= m ? 'text-[var(--accent)]' : ''} ${nextMilestone === m ? 'text-white animate-pulse' : ''}`}
            >
              {m}d
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakWidget;
