
import React, { useState, useEffect } from 'react';
import { Exam, ViewType, User, AppProgress } from '../types';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Zap, 
  Book, 
  Target, 
  LogOut, 
  BarChart3,
  CheckCircle,
  Brain,
  History,
  ShieldCheck
} from 'lucide-react';

interface DashboardProps {
  user: User;
  exams: Exam[];
  progress: AppProgress;
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onMarkExamPassed: (id: string) => void;
  onUpdateProgress: (newProgress: Partial<AppProgress> | ((prev: AppProgress) => Partial<AppProgress>)) => void;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  exams, 
  progress, 
  onAddExam, 
  onDeleteExam, 
  onMarkExamPassed,
  onUpdateProgress,
  onViewChange,
  onLogout,
  showToast
}) => {
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const isAdmin = user.email.toLowerCase() === 'vijaithegamer@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .order('login_at', { ascending: false })
        .limit(10);
      
      if (data && !error) {
        setLoginLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAdd = () => {
    if (newExamSubject && newExamDate) {
      onAddExam({
        id: Math.random().toString(36).substr(2, 9),
        subject: newExamSubject,
        date: newExamDate
      });
      showToast(`${newExamSubject} exam added to countdown!`, 'success');
      setNewExamSubject('');
      setNewExamDate('');
    }
  };

  const handleDelete = (id: string, subject: string) => {
    onDeleteExam(id);
    showToast(`${subject} exam removed.`, 'info');
  };

  const handlePassed = (id: string, subject: string) => {
    onMarkExamPassed(id);
    const isPassed = !progress.completedExams?.[id];
    showToast(isPassed ? `Congratulations on passing ${subject}!` : `${subject} status updated.`, isPassed ? 'success' : 'info');
  };

  const getDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const taskCount = Object.keys(progress.completedTasks || {}).length;
  const roadmapCount = Object.keys(progress.completedRoadmapWeeks || {}).length;
  const challengeCount = Object.keys(progress.completedChallengeDays || {}).length;
  const notesCount = Object.keys(progress.completedNotes || {}).length;
  const assignmentCount = Object.keys(progress.completedAssignments || {}).length;
  const predictorCount = Object.keys(progress.completedPredictions || {}).length;
  const flashcardSetCount = Object.keys(progress.completedFlashcardSets || {}).length;
  const examPassedCount = Object.keys(progress.completedExams || {}).length;

  const totalCompleted = taskCount + roadmapCount + challengeCount + notesCount + assignmentCount + predictorCount + flashcardSetCount + examPassedCount;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-slideUp">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Hello, <span className="text-gradient">{user.name.split(' ')[0]}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            {user.major} • {totalCompleted} Milestones
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 text-sm font-black text-slate-500 hover:text-red-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/10 group shrink-0"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Logout
        </button>
      </header>

      {/* Progress Overview */}
      <section className="premium-gradient p-8 sm:p-12 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Learning Analytics</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { label: 'Study Tasks', count: taskCount, color: 'bg-white', progress: Math.min(100, taskCount * 10) },
              { label: 'Roadmap Steps', count: roadmapCount, color: 'bg-blue-200', progress: Math.min(100, roadmapCount * 25) },
              { label: 'AI Insights', count: notesCount + assignmentCount + predictorCount, color: 'bg-indigo-200', progress: Math.min(100, (notesCount + assignmentCount + predictorCount) * 20) },
              { label: 'Revision', count: flashcardSetCount, color: 'bg-violet-200', progress: Math.min(100, flashcardSetCount * 33) }
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-black text-blue-100 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-3xl font-black tabular-nums">{stat.count}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full ${stat.color} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]`} 
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {[
          { id: 'planner', icon: Zap, label: 'Smart Planner', desc: 'AI Schedules', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'hover:border-blue-500' },
          { id: 'notes', icon: Book, label: 'Quick Notes', desc: 'Topic Synthesis', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'hover:border-indigo-500' },
          { id: 'roadmap', icon: Target, label: 'Skill Up', desc: 'Career Paths', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'hover:border-emerald-500' },
          { id: 'flashcards', icon: Brain, label: 'Revision', desc: 'Smart Cards', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'hover:border-orange-500' },
          { id: 'reportcard', icon: BarChart3, label: 'Report Card', desc: 'Performance', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'hover:border-violet-500' }
        ].map((action, i) => (
          <div 
            key={i}
            onClick={() => onViewChange(action.id as ViewType)}
            className={`bento-card group cursor-pointer ${action.border}`}
          >
            <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-inner`}>
              <action.icon className={`${action.color} w-7 h-7`} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">{action.label}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{action.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
        {/* Exam Countdown */}
        <div className="glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shadow-inner">
                <Clock className="text-orange-600 dark:text-orange-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Exam Countdown</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Don't miss a beat</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {exams.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No exams scheduled</p>
              </div>
            ) : (
              [...exams].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exam => {
                const days = getDaysLeft(exam.date);
                const isPassed = progress.completedExams?.[exam.id];
                return (
                  <div key={exam.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[1.5rem] transition-all duration-500 group/item gap-4 ${isPassed ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-900/50'}`}>
                    <div className="flex items-center gap-5">
                      {isPassed ? (
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${days <= 7 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {days}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className={`text-lg font-black tracking-tight truncate ${isPassed ? 'text-emerald-900 dark:text-emerald-100 line-through opacity-50' : 'text-slate-900 dark:text-white'}`}>{exam.subject}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handlePassed(exam.id, exam.subject)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isPassed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-500/20'}`}
                        >
                          {isPassed ? 'Passed' : 'Mark Passed'}
                        </button>
                        <button 
                          onClick={() => handleDelete(exam.id, exam.subject)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2.5 rounded-xl sm:opacity-0 group-hover/item:opacity-100"
                          aria-label="Delete exam"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add Exam Form */}
        <div className="glass-card relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-inner">
              <Plus className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Exam</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Plan your victory</p>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Subject Name</label>
              <input 
                type="text" 
                value={newExamSubject}
                onChange={(e) => setNewExamSubject(e.target.value)}
                placeholder="e.g. Advanced Calculus"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Exam Date</label>
              <input 
                type="date" 
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
              />
            </div>
            <button 
              onClick={handleAdd}
              disabled={!newExamSubject || !newExamDate}
              className="w-full premium-gradient text-white font-black uppercase tracking-widest py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
            >
              <Plus className="w-6 h-6" /> Add to Countdown
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Logs */}
      {isAdmin && (
        <section className="glass-card animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                <ShieldCheck className="text-emerald-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Console</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System Access Logs</p>
              </div>
            </div>
            <button 
              onClick={fetchLogs}
              className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group"
            >
              <History className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                  <th className="pb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Major</th>
                  <th className="pb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {loginLogs.map((log, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">
                          {log.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white tracking-tight">{log.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">{log.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {log.major}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {new Date(log.login_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                        {new Date(log.login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
                {loginLogs.length === 0 && !loadingLogs && (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No access logs recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
