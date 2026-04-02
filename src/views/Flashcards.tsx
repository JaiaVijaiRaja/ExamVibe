
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { AppProgress, Flashcard } from '../types';
import { QuizModal } from '../components/QuizModal';
import { Loader2, Sparkles, Brain, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Download } from 'lucide-react';
import { exportToMarkdown, exportToPDF, generateFlashcardsMarkdown } from '../lib/exportUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FlashcardsProps {
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ progress, onUpdateProgress, showToast }) => {
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const topicsKey = selectedTopics.sort().join('|');
  const isCompleted = !!(progress.completedFlashcardSets || {})[topicsKey];

  useEffect(() => {
    const topics: string[] = [];
    
    // Extract from Study Planner
    if (progress.savedPlanner) {
      progress.savedPlanner.items.forEach(day => {
        day.tasks.forEach((task, idx) => {
          if (progress.completedTasks[`${day.day}-${idx}`]) {
            topics.push(task);
          }
        });
      });
    }

    // Extract from Roadmap
    if (progress.savedRoadmap) {
      progress.savedRoadmap.items.forEach(item => {
        if (progress.completedRoadmapWeeks[`${progress.savedRoadmap?.skill}-${item.week}`]) {
          topics.push(item.topic);
        }
      });
    }

    // Extract from Challenges
    if (progress.savedChallenge) {
      progress.savedChallenge.items.forEach(item => {
        if (progress.completedChallengeDays[`${progress.savedChallenge?.skill}-${item.day}`]) {
          topics.push(item.goal);
        }
      });
    }

    setCompletedTopics(Array.from(new Set(topics)));
  }, [progress]);

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) return;
    setLoading(true);
    showToast('Generating revision flashcards...', 'info');
    try {
      const result = await geminiService.generateFlashcards(selectedTopics);
      setFlashcards(result);
      setCurrentIndex(0);
      setIsFlipped(false);
      showToast('Flashcards generated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate flashcards. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const newCompleted = { ...(progress.completedFlashcardSets || {}) };
    newCompleted[topicsKey] = true;
    onUpdateProgress({ 
      completedFlashcardSets: newCompleted,
      questionsStudied: (progress.questionsStudied || 0) + flashcards.length
    });
    setShowQuiz(false);
    showToast(`Flashcard set completed! +${flashcards.length} Questions Studied`, 'success');
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const reset = () => {
    setFlashcards([]);
    setSelectedTopics([]);
  };

  if (flashcards.length > 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <button 
            onClick={reset}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all group"
          >
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Selection
          </button>
          
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="relative group/export">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all">
                <Download className="w-4 h-4" /> Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-30">
                <button 
                  onClick={() => exportToMarkdown(`flashcards-${selectedTopics.join('-').toLowerCase()}`, generateFlashcardsMarkdown(selectedTopics, flashcards))}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Markdown (.md)
                </button>
                <button 
                  onClick={() => exportToPDF('flashcards-list', `flashcards-${selectedTopics.join('-').toLowerCase()}`)}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  PDF Document (.pdf)
                </button>
              </div>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
              Card {currentIndex + 1} / {flashcards.length}
            </div>
          </div>
        </div>

        <div 
          className="relative h-80 sm:h-96 w-full perspective-1000 cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col items-center justify-center p-8 sm:p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Question</span>
              <div className="text-xl sm:text-3xl font-black text-white leading-tight prose prose-invert max-w-none
                prose-p:m-0 prose-p:leading-tight prose-p:tracking-tight
              ">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {flashcards[currentIndex].question}
                </ReactMarkdown>
              </div>
              <div className="mt-10 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <RotateCcw className="w-3 h-3 animate-spin-slow" /> Tap to flip
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-8 sm:p-12 text-center overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              
              <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.3em] mb-6">Answer</span>
              <div className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed prose prose-slate dark:prose-invert max-w-none
                prose-p:m-0 prose-p:leading-relaxed prose-p:font-bold
                prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                prose-ul:list-none prose-ul:pl-0
                prose-li:relative prose-li:pl-8 prose-li:mb-4 prose-li:text-left
                prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-2.5 prose-li:before:w-2.5 prose-li:before:h-2.5 prose-li:before:bg-emerald-500 prose-li:before:rounded-full
              ">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {flashcards[currentIndex].answer}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <button 
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-20 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center transform hover:-translate-x-1"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button 
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-20 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center transform hover:translate-x-1"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="pt-10 flex justify-center">
          <button 
            onClick={() => !isCompleted && setShowQuiz(true)}
            disabled={isCompleted}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
              isCompleted 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 shadow-xl'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            {isCompleted ? 'Set Completed' : 'Mark Set Done'}
          </button>
        </div>

        {/* Hidden list for PDF export */}
        <div id="flashcards-list" className="sr-only-export p-8 bg-white dark:bg-slate-800">
          <h2 className="text-2xl font-bold mb-6">Flashcards: {selectedTopics.join(', ')}</h2>
          <div className="space-y-6">
            {flashcards.map((card, i) => (
              <div key={i} className="pb-6 border-b border-slate-100 dark:border-slate-700">
                <p className="font-bold text-blue-600 mb-2">Q: {card.question}</p>
                <p className="text-slate-700 dark:text-slate-300">A: {card.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {showQuiz && (
          <QuizModal 
            topic={`Flashcard Revision: ${selectedTopics.join(', ')}`} 
            content={flashcards.map(f => `${f.question}: ${f.answer}`).join('\n')} 
            onComplete={handleComplete} 
            onClose={() => setShowQuiz(false)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="animate-slideUp">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Revision <span className="text-gradient">Flashcards</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
          Master your subjects with AI-powered active recall
        </p>
      </header>

      {completedTopics.length === 0 ? (
        <div className="glass-card p-16 animate-slideUp text-center relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">No Completed Topics Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-bold leading-relaxed">
            Complete tasks in your Study Planner or Skill Roadmaps to unlock revision flashcards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Completed Topics ({completedTopics.length})</h3>
              <button 
                onClick={() => setSelectedTopics(selectedTopics.length === completedTopics.length ? [] : [...completedTopics])}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
              >
                {selectedTopics.length === completedTopics.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTopics.map((topic, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleTopic(topic)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedTopics.includes(topic) 
                      ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <span className={`text-sm font-black tracking-tight ${selectedTopics.includes(topic) ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {topic}
                  </span>
                  <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                    selectedTopics.includes(topic) ? 'bg-blue-600 border-blue-600 scale-110' : 'border-slate-200 dark:border-slate-700 group-hover:border-blue-400'
                  }`}>
                    {selectedTopics.includes(topic) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-8 sticky top-8 overflow-hidden group">
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Ready to Revise?</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                We'll generate 10 targeted questions and answers based on your selected topics to help you lock in your knowledge.
              </p>
              
              <button 
                onClick={handleGenerate}
                disabled={loading || selectedTopics.length === 0}
                className="w-full premium-gradient text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Cards
              </button>
              
              {selectedTopics.length === 0 && (
                <p className="text-[10px] font-black text-center text-slate-400 mt-4 uppercase tracking-widest">Select topics to begin</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
