
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { AppProgress } from '../types';
import { QuizModal } from '../components/QuizModal';
import { Loader2, Book, Copy, Check, FileText, CheckCircle2, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { exportToMarkdown, exportToPDF, generateNotesMarkdown } from '../lib/exportUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface SmartNotesProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Helper component for collapsible sections
const CollapsibleSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 bento-card overflow-hidden !p-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
      >
        <h2 className="text-xl font-black text-slate-900 dark:text-white m-0 tracking-tight">{title}</h2>
        <div className={`p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-blue-600" />
        </div>
      </button>
      {isOpen && (
        <div className="p-8 border-t border-slate-100 dark:border-slate-800/50 animate-fadeIn">
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
    return [{ title: 'Notes', content: markdown }];
  }

  return sections;
};

export const SmartNotes: React.FC<SmartNotesProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'short' | 'detailed' | 'exam-ready'>('detailed');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const isCompleted = !!(progress.completedNotes || {})[topic];

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    showToast(`Generating ${type} notes for ${topic}...`, 'info');
    try {
      const result = await geminiService.generateNotes(topic, type);
      setNotes(result);
      showToast('Notes generated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate notes. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const newCompleted = { ...(progress.completedNotes || {}) };
    newCompleted[topic] = true;
    onUpdateProgress({ 
      completedNotes: newCompleted,
      questionsStudied: (progress.questionsStudied || 0) + 5
    });
    setShowQuiz(false);
    showToast('Topic marked as completed! +5 Questions Studied', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    showToast('Notes copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="animate-slideUp">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Smart <span className="text-gradient">Notes Generator</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
          Transform complex engineering concepts into clear, structured notes
        </p>
      </header>

      <div className="glass-card p-8 sm:p-12 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="space-y-8 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Engineering Topic</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Systems Architecture"
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {(['short', 'detailed', 'exam-ready'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setType(opt)}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  type === opt 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.replace('-', ' ')}
              </button>
            ))}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full md:w-auto px-10 py-5 premium-gradient text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Book className="w-6 h-6" />}
            Generate Notes
          </button>
        </div>
      </div>

      {notes && (
        <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Study Notes</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{topic}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => !isCompleted && setShowQuiz(true)}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Completed' : 'Mark Done'}
              </button>
              
              <div className="flex items-center gap-2">
                <div className="relative group/export">
                  <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-all hover:shadow-xl">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-30">
                    <button 
                      onClick={() => exportToMarkdown(`notes-${topic.replace(/\s+/g, '-').toLowerCase()}`, generateNotesMarkdown(topic, notes))}
                      className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Markdown (.md)
                    </button>
                    <button 
                      onClick={() => exportToPDF('notes-container', `notes-${topic.replace(/\s+/g, '-').toLowerCase()}`)}
                      className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      PDF Document (.pdf)
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={handleCopy}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-all hover:shadow-xl"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div id="notes-container" className="space-y-6">
            {parseMarkdownSections(notes).map((section, index) => (
              <CollapsibleSection key={index} title={section.title}>
                <div className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:text-slate-900 dark:prose-headings:text-blue-400 prose-headings:font-black prose-headings:tracking-tight
                  prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg
                  prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                  prose-ul:list-none prose-ul:pl-0
                  prose-li:relative prose-li:pl-8 prose-li:mb-4 prose-li:text-lg
                  prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-3 prose-li:before:w-3 prose-li:before:h-3 prose-li:before:bg-blue-600 prose-li:before:rounded-full prose-li:before:shadow-[0_0_10px_rgba(37,99,235,0.5)]
                  prose-hr:border-slate-100 dark:prose-hr:border-slate-800
                  prose-table:w-full prose-table:border-collapse prose-table:rounded-2xl prose-table:overflow-hidden
                  prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:p-4 prose-th:text-left prose-th:font-black prose-th:uppercase prose-th:text-xs prose-th:tracking-widest
                  prose-td:p-4 prose-td:border-t prose-td:border-slate-100 dark:prose-td:border-slate-800
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

      {showQuiz && (
        <QuizModal 
          topic={topic} 
          content={notes} 
          onComplete={handleComplete} 
          onClose={() => setShowQuiz(false)} 
        />
      )}
    </div>
  );
};
