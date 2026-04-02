
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { AppProgress } from '../types';
import { QuizModal } from '../components/QuizModal';
import { Loader2, Send, Lightbulb, FileSearch, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Helper component for collapsible sections
const CollapsibleSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-8 glass-card overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all border-l-4 border-l-blue-600"
      >
        <h2 className="text-xl font-black text-slate-900 dark:text-white m-0 tracking-tight">{title}</h2>
        <div className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-8 border-t border-slate-100 dark:border-slate-700/50">
          {children}
        </div>
      </div>
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
    return [{ title: 'Solution', content: markdown }];
  }

  return sections;
};

interface AssignmentHelperProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AssignmentHelper: React.FC<AssignmentHelperProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const questionKey = question.substring(0, 50);
  const isCompleted = !!(progress.completedAssignments || {})[questionKey];

  const handleSolve = async () => {
    if (!question) return;
    setLoading(true);
    showToast('Analyzing and solving your problem...', 'info');
    try {
      const result = await geminiService.solveAssignment(question);
      setSolution(result);
      showToast('Solution generated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to solve the assignment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const newCompleted = { ...(progress.completedAssignments || {}) };
    newCompleted[questionKey] = true;
    onUpdateProgress({ 
      completedAssignments: newCompleted,
      questionsStudied: (progress.questionsStudied || 0) + 5
    });
    setShowQuiz(false);
    showToast('Assignment marked as completed! +5 Questions Studied', 'success');
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="animate-slideUp">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Assignment <span className="text-gradient">Helper</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
          Get structured, conceptual answers for your engineering problems
        </p>
      </header>

      <div className="glass-card p-8 sm:p-10 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="space-y-6 relative z-10">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Paste your question below</label>
          <textarea 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Derive the Euler's equation of motion..."
            rows={5}
            className="w-full px-6 py-5 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none text-lg"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleSolve}
              disabled={loading || !question}
              className="w-full sm:w-auto premium-gradient text-white font-black uppercase tracking-widest py-5 px-12 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              Analyze & Solve
            </button>
          </div>
        </div>
      </div>

      {solution && (
        <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-indigo-50/50 dark:bg-indigo-900/20 px-8 py-6 border-b border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center shadow-inner">
                  <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-200 tracking-tight">Structured Solution</h3>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">AI-Powered Analysis</p>
                </div>
              </div>
              <button 
                onClick={() => !isCompleted && setShowQuiz(true)}
                disabled={isCompleted}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  isCompleted 
                    ? 'bg-emerald-100 text-emerald-700 cursor-default shadow-inner' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-xl'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : ''}`} />
                {isCompleted ? 'Completed' : 'Mark as Done'}
              </button>
            </div>
            <div className="p-8 sm:p-10 bg-slate-50/30 dark:bg-slate-900/50">
              <div className="space-y-6">
                {parseMarkdownSections(solution).map((section, index) => (
                  <CollapsibleSection key={index} title={section.title}>
                    <div className="prose prose-slate dark:prose-invert max-w-none
                      prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg
                      prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                      prose-ul:list-none prose-ul:pl-0
                      prose-li:relative prose-li:pl-8 prose-li:mb-4 dark:prose-li:text-slate-300
                      prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-2 prose-li:before:top-3 prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-blue-600 prose-li:before:rounded-full
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
          </div>
        </div>
      )}

      {showQuiz && (
        <QuizModal 
          topic="Assignment Solution" 
          content={solution} 
          onComplete={handleComplete} 
          onClose={() => setShowQuiz(false)} 
        />
      )}

      {!solution && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 backdrop-blur-md bg-indigo-50/60 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-lg font-bold mb-3 flex items-center gap-3 text-indigo-800 dark:text-indigo-300">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
                <FileSearch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Multi-Step Solutions
            </h4>
            <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80 font-medium leading-relaxed">
              The AI provides logically ordered explanations instead of just answers.
            </p>
          </div>
          <div className="p-6 backdrop-blur-md bg-emerald-50/60 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-lg font-bold mb-3 flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Concept Clarification
            </h4>
            <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80 font-medium leading-relaxed">
              Includes definitions for jargon and complex terminology used in the answer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
