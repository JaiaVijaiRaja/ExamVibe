
import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  Target, 
  Calendar, 
  HelpCircle,
  TrendingUp,
  Award,
  Star,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { AppProgress } from '../types';

interface ReportCardViewProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({ progress, onUpdateProgress, showToast }) => {
  const taskCount = Object.keys(progress.completedTasks || {}).length;
  const roadmapCount = Object.keys(progress.completedRoadmapWeeks || {}).length;
  const challengeCount = Object.keys(progress.completedChallengeDays || {}).length;
  const notesCount = Object.keys(progress.completedNotes || {}).length;
  const examPassedCount = Object.keys(progress.completedExams || {}).length;
  const questionsStudied = progress.questionsStudied || 0;
  const streaks = progress.streaks || 0;
  const cgpa = progress.cgpa || 0;
  const sgpa = progress.sgpa || 0;

  const getPerformanceData = () => {
    if (cgpa === 0) {
      return { name: "Just Started", badge: "—" };
    }

    const levels = [
      { name: "Needs Focus", badge: "D" },      // CGPA < 6.0
      { name: "Steady Climber", badge: "C" },   // CGPA >= 6.0
      { name: "Rising Star", badge: "B" },      // CGPA >= 7.0
      { name: "High Achiever", badge: "A" },    // CGPA >= 8.0
      { name: "Elite", badge: "A+" },           // CGPA >= 8.5
      { name: "Legend", badge: "S" },           // CGPA >= 9.0
    ];

    let levelIndex = 0;
    if (cgpa >= 9.0) levelIndex = 5;
    else if (cgpa >= 8.5) levelIndex = 4;
    else if (cgpa >= 8.0) levelIndex = 3;
    else if (cgpa >= 7.0) levelIndex = 2;
    else if (cgpa >= 6.0) levelIndex = 1;
    else levelIndex = 0;

    // Boost logic: If streak ≥ 7 days AND CGPA >= 8.0, boost one level up
    if (streaks >= 7 && cgpa >= 8.0 && levelIndex < levels.length - 1) {
      levelIndex += 1;
    }

    return levels[levelIndex];
  };

  const { name: performanceLevel, badge: performanceBadge } = getPerformanceData();

  const stats = [
    { label: 'Exams Passed', value: examPassedCount, icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Total exams successfully cleared' },
    { label: 'Current Streak', value: `${streaks}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Consecutive study days' },
    { label: 'Cumulative GPA', value: cgpa.toFixed(2), icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Overall academic standing' },
    { label: 'Semester GPA', value: sgpa.toFixed(2), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Current term performance' },
    { label: 'Tasks Completed', value: taskCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Daily study goals achieved' },
    { label: 'Smart Notes', value: notesCount, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-400/10', desc: 'Topics mastered with AI' },
    { label: 'Roadmap Progress', value: roadmapCount, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Skill milestones reached' },
    { label: '7-Day Challenge', value: `${challengeCount}/7`, icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-400/10', desc: 'Intensive challenge status' },
    { label: 'Questions Studied', value: questionsStudied, icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Total practice questions' },
  ];

  const [editingStat, setEditingStat] = React.useState<{ key: string, label: string, value: string } | null>(null);

  const handleSaveStat = () => {
    if (!editingStat) return;
    const val = parseFloat(editingStat.value);
    if (!isNaN(val)) {
      onUpdateProgress({ [editingStat.key]: val });
      showToast(`${editingStat.label} updated successfully!`, 'success');
    } else {
      showToast('Please enter a valid number.', 'error');
    }
    setEditingStat(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-12 pb-24">
      {editingStat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="glass-card p-8 sm:p-12 w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-8 text-slate-900 dark:text-white tracking-tight leading-tight">
                Update <span className="text-gradient">{editingStat.label}</span>
              </h3>
              <input 
                type="number" 
                step="any"
                value={editingStat.value}
                onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-8 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-2xl font-black shadow-inner"
                autoFocus
              />
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setEditingStat(null)}
                  className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveStat}
                  className="px-10 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-2xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 animate-slideUp">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-black tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-2 bg-blue-500/5 dark:bg-blue-500/10 px-4 py-2 rounded-full w-fit border border-blue-500/20">
            <Shield className="w-4 h-4" />
            Academic Transcript v3.0
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.85]">
            REPORT <br />
            <span className="text-gradient">CARD</span>
          </h1>
        </div>
        
        <div className="glass-card p-8 sm:p-10 flex items-center gap-8 sm:gap-10 shadow-2xl border border-white/10 dark:border-slate-800/50 relative overflow-hidden group">
          <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="text-right relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Performance Level</div>
            <div className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-tight text-slate-900 dark:text-white">{performanceLevel}</div>
          </div>
          <div className="h-16 w-[1px] bg-slate-200 dark:bg-slate-800 relative z-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-3xl sm:text-4xl font-black shadow-2xl transform group-hover:rotate-12 transition-transform duration-500">
              {performanceBadge}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="group relative overflow-hidden rounded-[3rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 sm:p-10 hover:border-blue-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl"
          >
            <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${stat.bg} opacity-10 blur-3xl group-hover:opacity-30 group-hover:scale-150 transition-all duration-1000`} />
            
            <div className="relative z-10">
              <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="h-7 w-7" />
              </div>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {stat.value}
                </span>
                <Activity className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-1" />
              </div>
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                {stat.label}
              </h3>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="rounded-[3.5rem] premium-gradient p-10 sm:p-16 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden group"
      >
        <Zap className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                <Star className="w-10 h-10 fill-white animate-pulse" />
                Update Records
              </h2>
              <p className="text-white/70 font-bold text-lg max-w-md">
                Keep your academic profile up to date to see your real-time performance level.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
              <button 
                onClick={() => setEditingStat({ key: 'cgpa', label: 'CGPA', value: cgpa.toString() })}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-8 rounded-3xl transition-all group text-left min-w-[200px] transform hover:-translate-y-1"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Modify</div>
                <div className="text-3xl font-black tracking-tighter">CGPA</div>
              </button>
              
              <button 
                onClick={() => setEditingStat({ key: 'sgpa', label: 'SGPA', value: sgpa.toString() })}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-8 rounded-3xl transition-all group text-left min-w-[200px] transform hover:-translate-y-1"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Modify</div>
                <div className="text-3xl font-black tracking-tighter">SGPA</div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
