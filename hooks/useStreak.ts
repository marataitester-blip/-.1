
import { useState, useEffect } from 'react';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezeAvailable: number;
}

const MILESTONES = [7, 14, 30, 100];

export const useStreak = () => {
  const [streak, setStreak] = useState<StreakState>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    freezeAvailable: 2 // Default starting freezes
  });

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem('tarot_streak');
    if (stored) {
      setStreak(JSON.parse(stored));
    } else {
      // Initialize for new user
      const initialState = {
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: new Date().toISOString().split('T')[0],
          freezeAvailable: 2
      };
      setStreak(initialState);
      localStorage.setItem('tarot_streak', JSON.stringify(initialState));
    }
  }, []);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = streak.lastActivityDate;

    if (lastDate === today) return; // Already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newState = { ...streak };

    if (lastDate === yesterdayStr) {
      // Consecutive day
      newState.currentStreak += 1;
    } else {
      // Missed a day
      // Simple logic: if missed, check freeze. 
      // Real implementation would check specific dates, here we assume > 1 day gap reset unless frozen
      if (newState.freezeAvailable > 0) {
          newState.freezeAvailable -= 1;
          // Keep streak, just update date
      } else {
          newState.currentStreak = 1; // Reset
      }
    }

    if (newState.currentStreak > newState.longestStreak) {
      newState.longestStreak = newState.currentStreak;
    }
    
    newState.lastActivityDate = today;
    setStreak(newState);
    localStorage.setItem('tarot_streak', JSON.stringify(newState));
  };

  // Calculate progress to next milestone
  const nextMilestone = MILESTONES.find(m => m > streak.currentStreak) || 100;
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= streak.currentStreak) || 0;
  
  // Progress calculation for the bar (percentage between previous milestone and next)
  const range = nextMilestone - prevMilestone;
  const currentInProgress = streak.currentStreak - prevMilestone;
  // Ensure at least 5% visibility if streak > 0
  const progressPercent = Math.max(5, Math.min(100, (currentInProgress / range) * 100));

  return { 
    streak, 
    updateStreak, 
    nextMilestone,
    progressPercent 
  };
};
