
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { RoadmapItem, AppProgress } from '../types';
import { QuizModal } from '../components/QuizModal';
import { Loader2, Target, Link, ExternalLink, Box, CheckCircle2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface SkillRoadmapProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SkillRoadmap: React.FC<SkillRoadmapProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<{ week: number, topic: string, content: string } | null>(null);

  // Load saved roadmap on mount or progress change, handle isolation by clearing if undefined
  useEffect(() => {
    if (progress.savedRoadmap) {
      setRoadmap(progress.savedRoadmap.items);
      setSkill(progress.savedRoadmap.skill);
      setLevel(progress.savedRoadmap.level);
      setGoal(progress.savedRoadmap.goal);
    } else {
      setRoadmap([]);
      setSkill('');
      setLevel('Beginner');
      setGoal('');
    }
  }, [progress.savedRoadmap]);

  const handleGenerate = async () => {
    if (!skill || !goal) return;
    setLoading(true);
    showToast(`Generating weekly roadmap for ${skill}...`, 'info');
    try {
      const result = await geminiService.generateRoadmap(skill, level, goal);
      setRoadmap(result);
      // Save the generated roadmap with full context to progress
      onUpdateProgress({
        savedRoadmap: {
          skill,
          level,
          goal,
          items: result
        }
      });
      showToast('Roadmap generated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate roadmap. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (item: RoadmapItem) => {
    const key = `${skill}-${item.week}`;
    const isDone = !!(progress.completedRoadmapWeeks || {})[key];
    
    if (isDone) {
      // Allow unchecking without quiz
      const newCompleted = { ...(progress.completedRoadmapWeeks || {}) };
      delete newCompleted[key];
      onUpdateProgress({ 
        completedRoadmapWeeks: newCompleted,
        questionsStudied: Math.max(0, (progress.questionsStudied || 0) - 10)
      });
      showToast('Week marked as incomplete.', 'info');
    } else {
      // Trigger quiz for completion
      setActiveQuiz({
        week: item.week,
        topic: item.topic,
        content: `${item.description}\nProject: ${item.project}`
      });
    }
  };

  const handleQuizComplete = () => {
    if (!activeQuiz) return;
    const key = `${skill}-${activeQuiz.week}`;
    const newCompleted = { ...(progress.completedRoadmapWeeks || {}) };
    newCompleted[key] = true;
    onUpdateProgress({ 
      completedRoadmapWeeks: newCompleted,
      questionsStudied: (progress.questionsStudied || 0) + 10
    });
    setActiveQuiz(null);
    showToast('Week completed! +10 Questions Studied', 'success');
  };

  const clearRoadmap = () => {
    onUpdateProgress({ savedRoadmap: undefined });
    showToast('Roadmap reset. You can now start a new one.', 'info');
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-slideUp">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Skill <span className="text-gradient">Roadmap</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
            Map out your path to mastering high-demand engineering skills
          </p>
        </div>
        {roadmap.length > 0 && (
          <button 
            onClick={clearRoadmap}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        )}
      </header>

      {roadmap.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Target Skill</label>
              <input 
                type="text" 
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. AWS Cloud, React, FPGA"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Current Level</label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Ultimate Goal</label>
              <input 
                type="text" 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Land a job, Build a drone"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !skill || !goal}
            className="mt-10 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Target className="w-6 h-6" />}
            Generate Weekly Roadmap
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-6 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shadow-inner">
              <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mastering {skill}</h3>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Track your weekly milestones below</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {roadmap.map((item) => {
              const isDone = !!(progress.completedRoadmapWeeks || {})[`${skill}-${item.week}`];
              return (
                <div 
                  key={item.week} 
                  className={`group relative bg-white dark:bg-slate-800 rounded-[2rem] border overflow-hidden shadow-sm flex flex-col md:flex-row transition-all duration-500 ${isDone ? 'border-emerald-500/30 opacity-70' : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-2xl'}`}
                >
                  <div 
                    onClick={() => handleToggleClick(item)}
                    className={`md:w-40 p-8 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r transition-all cursor-pointer ${isDone ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10'}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">Week</span>
                      <span className={`text-5xl font-black transition-colors ${isDone ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-700 group-hover:text-blue-600'}`}>{item.week}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mt-4" />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl border-2 border-slate-200 dark:border-slate-700 md:mt-4 group-hover:border-blue-400 transition-all flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-8 sm:p-10 space-y-8">
                    <div>
                      <h3 className={`text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight ${isDone ? 'line-through text-slate-400' : ''}`}>{item.topic}</h3>
                      <div className="prose prose-slate dark:prose-invert max-w-none
                        prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-p:m-0
                        prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                      ">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {item.description}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-slate-400 mb-5">
                          <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Link className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          Learning Resources
                        </h4>
                        <ul className="space-y-3">
                          {item.resources.map((res, i) => (
                            <li key={i} className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-3 hover:underline cursor-pointer bg-blue-50/30 dark:bg-blue-900/10 p-3 rounded-xl transition-all hover:translate-x-1">
                              <ExternalLink className="w-4 h-4 shrink-0" /> 
                              <span className="truncate font-bold">{res}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-slate-400 mb-5">
                          <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                            <Box className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          Micro Project
                        </h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 prose prose-slate dark:prose-invert max-w-none
                          prose-p:m-0 prose-p:leading-relaxed prose-p:font-bold prose-p:text-sm
                          prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                        ">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {item.project}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeQuiz && (
        <QuizModal 
          topic={`Week ${activeQuiz.week}: ${activeQuiz.topic}`} 
          content={activeQuiz.content} 
          onComplete={handleQuizComplete} 
          onClose={() => setActiveQuiz(null)} 
        />
      )}
    </div>
  );
};
