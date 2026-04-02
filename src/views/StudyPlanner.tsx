
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { StudyTask, AppProgress } from '../types';
import { Loader2, Calendar, Sparkles, CheckSquare, Square, RefreshCw, Download } from 'lucide-react';
import { exportToMarkdown, exportToPDF, generateStudyPlanMarkdown } from '../lib/exportUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface StudyPlannerProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyTask[]>([]);

  // Load saved planner on mount or progress change, handle isolation by clearing if undefined
  useEffect(() => {
    if (progress.savedPlanner) {
      setPlan(progress.savedPlanner.items);
      setSubjects(progress.savedPlanner.subjects);
      setExamDate(progress.savedPlanner.examDate);
    } else {
      setPlan([]);
      setSubjects('');
      setExamDate('');
    }
  }, [progress.savedPlanner]);

  const handleGenerate = async () => {
    if (!subjects || !examDate) return;
    setLoading(true);
    showToast('Generating your optimized study plan...', 'info');
    try {
      const subjectArray = subjects.split(',').map(s => s.trim());
      const result = await geminiService.generateStudyPlan(subjectArray, examDate);
      setPlan(result);
      // Save full plan context to progress
      onUpdateProgress({
        savedPlanner: {
          subjects,
          examDate,
          items: result
        }
      });
      showToast('Study plan generated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate study plan. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (day: string, taskIdx: number) => {
    const key = `${day}-${taskIdx}`;
    const newCompleted = { ...progress.completedTasks };
    const isDone = !!newCompleted[key];
    if (isDone) {
      delete newCompleted[key];
    } else {
      newCompleted[key] = true;
    }
    onUpdateProgress({ completedTasks: newCompleted });
    showToast(isDone ? 'Task marked as incomplete.' : 'Task completed! Keep it up.', isDone ? 'info' : 'success');
  };

  const clearPlan = () => {
    onUpdateProgress({ savedPlanner: undefined, completedTasks: {} });
    showToast('Planner cleared. You can now generate a new one.', 'info');
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-slideUp">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            AI <span className="text-gradient">Study Planner</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
            Engineering-grade optimization for your schedule
          </p>
        </div>
        {plan.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group/export">
              <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-xl">
                <Download className="w-4 h-4" /> Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-30">
                <button 
                  onClick={() => exportToMarkdown(`study-plan-${subjects.replace(/\s+/g, '-').toLowerCase()}`, generateStudyPlanMarkdown(subjects, examDate, plan))}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Markdown (.md)
                </button>
                <button 
                  onClick={() => exportToPDF('planner-pdf', `study-plan-${subjects.replace(/\s+/g, '-').toLowerCase()}`)}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  PDF Document (.pdf)
                </button>
              </div>
            </div>
            <button 
              onClick={clearPlan}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-xl"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        )}
      </header>

      {plan.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Engineering Subjects</label>
                <textarea 
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Fluid Mechanics, Strength of Materials, Digital Electronics"
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                />
                <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Separate multiple subjects with commas</p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Target Exam Date</label>
                <input 
                  type="date" 
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
                />
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading || !subjects || !examDate}
                className="premium-gradient text-white font-black uppercase tracking-widest py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                Generate Optimized Plan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div id="planner-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {plan.map((day, idx) => (
            <div key={idx} className="bento-card group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{day.day}</h3>
              </div>
              <ul className="space-y-3">
                {day.tasks.map((task, tidx) => {
                  const isDone = !!progress.completedTasks[`${day.day}-${tidx}`];
                  return (
                    <li 
                      key={tidx} 
                      onClick={() => toggleTask(day.day, tidx)}
                      className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group/item border ${
                        isDone 
                          ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-slate-50/50 dark:bg-slate-800/50 border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="mt-1 shrink-0">
                        {isDone 
                          ? <CheckSquare className="w-5 h-5 text-emerald-600" /> 
                          : <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover/item:text-blue-500 transition-colors" />
                        }
                      </div>
                      <div className={`flex-1 prose prose-sm prose-slate dark:prose-invert max-w-none
                        prose-p:m-0 prose-p:leading-relaxed prose-p:font-bold prose-p:text-xs prose-p:uppercase prose-p:tracking-wide
                        prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                        ${isDone ? 'line-through opacity-50' : ''}
                      `}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {task}
                        </ReactMarkdown>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          </div>

          {/* Hidden list for PDF export */}
          <div id="planner-pdf" className="sr-only-export p-8 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-4">AI Study Plan</h2>
            <p className="text-slate-600 mb-8">Subjects: {subjects} | Exam Date: {examDate}</p>
            <div className="space-y-8">
              {plan.map((day, idx) => (
                <div key={idx} className="pb-6 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">{day.day}</h3>
                  <ul className="space-y-2">
                    {day.tasks.map((task, tidx) => (
                      <li key={tidx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 border border-slate-300 rounded flex-shrink-0 mt-0.5"></span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
