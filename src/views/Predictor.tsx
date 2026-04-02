
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { AppProgress } from '../types';
import { QuizModal } from '../components/QuizModal';
import { Loader2, AlertTriangle, ListChecks, HelpCircle, CheckCircle2, ChevronDown, ChevronRight, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Helper component for collapsible sections
const CollapsibleSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
      >
        <h2 className="text-xl font-black text-slate-900 dark:text-white m-0 tracking-tight group-hover:text-amber-600 transition-colors">{title}</h2>
        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </div>
      </button>
      {isOpen && (
        <div className="p-8 sm:p-10 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

// Helper function to parse markdown into sections based on ## headings
const parseMarkdownSections = (markdown: string) => {
  // Unescape common markdown symbols that might be escaped by AI
  const cleanMarkdown = markdown.replace(/\\\*/g, '*').replace(/\\\$/g, '$');
  const lines = cleanMarkdown.split('\n');
  const sections: { title: string; content: string }[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];

  // Find the first ## to start the first section
  let i = 0;
  while (i < lines.length && !lines[i].startsWith('## ')) {
    currentContent.push(lines[i]);
    i++;
  }

  // Only add Overview if it has non-empty content
  if (currentContent.some(line => line.trim() !== '')) {
    sections.push({ title: 'Overview', content: currentContent.join('\n') });
  }

  currentContent = [];

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join('\n') });
      }
      currentTitle = line.replace('## ', '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join('\n') });
  }

  // If no sections were found (e.g., AI didn't follow format), return a single section
  if (sections.length === 0) {
    return [{ title: 'Predictions', content: markdown }];
  }

  return sections;
};

interface PredictorProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Predictor: React.FC<PredictorProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [subject, setSubject] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const isCompleted = !!(progress.completedPredictions || {})[subject];

  const handlePredict = async () => {
    if (!subject || !syllabus) return;
    setLoading(true);
    showToast(`Analyzing syllabus for ${subject}...`, 'info');
    try {
      const result = await geminiService.predictQuestions(subject, syllabus);
      setPredictions(result);
      showToast('Exam predictions generated!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate predictions. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const newCompleted = { ...(progress.completedPredictions || {}) };
    newCompleted[subject] = true;
    onUpdateProgress({ 
      completedPredictions: newCompleted,
      questionsStudied: (progress.questionsStudied || 0) + 5
    });
    setShowQuiz(false);
    showToast('Topic marked as completed! +5 Questions Studied', 'success');
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-3 animate-slideUp">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Exam <span className="text-gradient">Predictor</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
          AI analysis to pinpoint high-probability exam topics
        </p>
      </header>

      <div className="glass-card p-8 sm:p-12 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Signal Processing"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Analysis Mode</label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Pattern Recognition</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active AI Analysis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Syllabus Snippet</label>
            <textarea 
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Paste the key modules or chapters from your syllabus..."
              rows={6}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none resize-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>

          <button 
            onClick={handlePredict}
            disabled={loading || !subject || !syllabus}
            className="w-full premium-gradient text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-amber-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Star className="w-6 h-6" />}
            Analyze Patterns & Predict
          </button>
        </div>
      </div>

      {predictions && (
        <div className="space-y-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shadow-inner">
                <HelpCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Likely Questions</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{subject}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => !isCompleted && setShowQuiz(true)}
                disabled={isCompleted}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-xl'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </button>
              <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                AI Forecast
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {parseMarkdownSections(predictions).map((section, index) => (
              <CollapsibleSection key={index} title={section.title}>
                <div className="prose prose-slate dark:prose-invert max-w-none dark:text-slate-200
                  prose-headings:text-slate-900 dark:prose-headings:text-amber-400 prose-headings:font-black prose-headings:tracking-tight
                  prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-bold
                  prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                  prose-ul:list-none prose-ul:pl-0
                  prose-li:relative prose-li:pl-8 prose-li:mb-4 prose-li:font-bold
                  prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-2.5 prose-li:before:w-2.5 prose-li:before:h-2.5 prose-li:before:bg-amber-500 prose-li:before:rounded-full prose-li:before:shadow-lg prose-li:before:shadow-amber-500/50
                  prose-hr:border-slate-100 dark:prose-hr:border-slate-800
                  prose-table:w-full prose-table:border-collapse prose-table:rounded-2xl prose-table:overflow-hidden
                  prose-th:bg-slate-50 dark:prose-th:bg-slate-900 prose-th:p-4 prose-th:text-left prose-th:border prose-th:border-slate-100 dark:prose-th:border-slate-800 prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-[10px]
                  prose-td:p-4 prose-td:border prose-td:border-slate-100 dark:prose-td:border-slate-800 prose-td:font-bold
                ">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-5 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <ListChecks className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed italic">
          Note: Predictions are based on syllabus structure and common engineering education patterns. Use this as a supplemental study guide alongside thorough preparation.
        </p>
      </div>

      {showQuiz && (
        <QuizModal 
          topic={`Exam Prediction: ${subject}`} 
          content={predictions} 
          onComplete={handleComplete} 
          onClose={() => setShowQuiz(false)} 
        />
      )}

      <div className="flex items-start gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 text-sm italic">
        <ListChecks className="w-5 h-5 shrink-0 mt-1" />
        Note: Predictions are based on syllabus structure and common engineering education patterns. Use this as a supplemental study guide alongside thorough preparation.
      </div>
    </div>
  );
};
