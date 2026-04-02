
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChallengeDay, AppProgress } from '../types';
import { Loader2, Trophy, Star, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

interface ChallengeProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Challenge: React.FC<ChallengeProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<ChallengeDay[]>([]);

  // Load saved challenge on mount or progress change, handle isolation by clearing if undefined
  useEffect(() => {
    if (progress.savedChallenge) {
      setDays(progress.savedChallenge.items);
      setSkill(progress.savedChallenge.skill);
    } else {
      setDays([]);
      setSkill('');
    }
  }, [progress.savedChallenge]);

  const handleGenerate = async () => {
    if (!skill) return;
    setLoading(true);
    showToast(`Creating your 7-day ${skill} sprint...`, 'info');
    try {
      const result = await geminiService.generateChallenge(skill);
      setDays(result);
      // Save challenge to progress for persistence
      onUpdateProgress({
        savedChallenge: {
          skill,
          items: result
        }
      });
      showToast('Challenge sprint created! Good luck.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to create challenge. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (day: number) => {
    const key = `${skill}-${day}`;
    const newCompleted = { ...progress.completedChallengeDays };
    const isDone = !!newCompleted[key];
    let questionsIncrement = 0;
    if (isDone) {
      delete newCompleted[key];
      questionsIncrement = -3;
    } else {
      newCompleted[key] = true;
      questionsIncrement = 3;
    }
    onUpdateProgress({ 
      completedChallengeDays: newCompleted,
      questionsStudied: Math.max(0, (progress.questionsStudied || 0) + questionsIncrement)
    });
    showToast(isDone ? 'Day marked as incomplete.' : `Day ${day} complete! +3 Questions Studied`, isDone ? 'info' : 'success');
  };

  const clearChallenge = () => {
    onUpdateProgress({ savedChallenge: undefined, completedChallengeDays: {} });
    showToast('Challenge reset.', 'info');
  };

  const getCompletedCount = () => {
    return Object.keys(progress.completedChallengeDays).filter(k => k.startsWith(skill + '-')).length;
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-slideUp">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            7-Day <span className="text-gradient">Sprint</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
            Jumpstart a new skill with a micro-learning challenge
          </p>
        </div>
        {days.length > 0 && (
          <button 
            onClick={clearChallenge}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        )}
      </header>

      {days.length === 0 ? (
        <div className="max-w-2xl mx-auto glass-card p-10 sm:p-16 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-xl" />
            </div>
            <h3 className="text-3xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Start Your Sprint</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-bold leading-relaxed">
              What do you want to master this week? We'll create a 7-day targeted learning path for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. Docker Basics, Python Pandas"
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <button 
                onClick={handleGenerate}
                disabled={loading || !skill}
                className="premium-gradient text-white font-black uppercase tracking-widest py-4 px-10 rounded-2xl transition-all shadow-2xl shadow-yellow-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                Start Sprint
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shadow-inner">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{skill} Challenge</h4>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Progress: <span className="text-yellow-600 dark:text-yellow-400">{getCompletedCount()}/7 Days</span>
            </div>
          </div>

          <div className="space-y-4">
            {days.map((d) => {
              const isDone = !!progress.completedChallengeDays[`${skill}-${d.day}`];
              return (
                <div 
                  key={d.day}
                  className={`
                    group relative flex items-start gap-6 p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer
                    ${isDone 
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50 opacity-70' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 hover:shadow-2xl'}
                  `}
                  onClick={() => toggleComplete(d.day)}
                >
                  <div className={`
                    w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 shadow-inner
                    ${isDone 
                      ? 'bg-emerald-500 text-white rotate-[360deg]' 
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 group-hover:bg-yellow-100 group-hover:text-yellow-600 group-hover:scale-110'}
                  `}>
                    {isDone ? <CheckCircle2 className="w-6 h-6 sm:w-7 h-7" /> : d.day}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className={`text-xl font-black text-slate-900 dark:text-white truncate tracking-tight ${isDone ? 'line-through text-slate-400' : ''}`}>Goal: {d.goal}</h5>
                      {d.day === 1 && <Star className="w-5 h-5 text-yellow-500 fill-current shrink-0 animate-pulse" />}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-base mb-5 leading-relaxed font-bold">{d.action}</p>
                    <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Resource: <span className="normal-case font-black">{d.material}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-500 shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {getCompletedCount() === 7 && (
            <div className="premium-gradient p-10 sm:p-16 rounded-[3rem] text-center text-white shadow-2xl shadow-yellow-500/30 animate-bounce mt-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">Challenge Complete! 🎉</h3>
                <p className="text-xl font-black opacity-90">You've successfully finished the 7-day {skill} sprint. Knowledge is power!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
