
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Loader2, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  topic: string;
  content: string;
  onComplete: () => void;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ topic, content, onComplete, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const result = await geminiService.generateQuiz(topic, content);
        if (result && result.length > 0) {
          setQuestions(result);
        } else {
          setError("Failed to generate quiz questions. Please try again.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while generating the quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [topic, content]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    const passingScore = Math.ceil(questions.length * 0.6); // 60% to pass
    if (score >= passingScore) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-2xl animate-fadeIn">
      <div className="glass-card w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 shrink-0 relative z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate pr-4">Topic Quiz</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{topic}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-ping absolute"></div>
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Generating your quiz...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-8">
              <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-lg font-bold">{error}</p>
              <button 
                onClick={onClose} 
                className="px-10 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          ) : showResult ? (
            <div className="py-8 text-center space-y-10">
              <div className="relative mx-auto w-32 h-32">
                <div className={`absolute inset-0 rounded-[2.5rem] blur-2xl opacity-40 ${score >= Math.ceil(questions.length * 0.6) ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <div className={`relative z-10 w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl ${score >= Math.ceil(questions.length * 0.6) ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  {score >= Math.ceil(questions.length * 0.6) ? (
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  ) : (
                    <AlertCircle className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Quiz Complete!</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-bold">
                  You scored <span className="text-blue-600 dark:text-blue-400 font-black text-2xl">{score}</span> <span className="opacity-50">/</span> {questions.length}
                </p>
              </div>
              
              {score >= Math.ceil(questions.length * 0.6) ? (
                <div className="p-8 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] shadow-inner">
                  <p className="text-emerald-700 dark:text-emerald-400 text-base font-bold leading-relaxed">
                    Great job! You've passed the quiz and this topic is now marked as completed.
                  </p>
                </div>
              ) : (
                <div className="p-8 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-[2rem] shadow-inner">
                  <p className="text-amber-700 dark:text-amber-400 text-base font-bold leading-relaxed">
                    You need at least 60% to pass. Review the material and try again later.
                  </p>
                </div>
              )}

              <button 
                onClick={handleFinish}
                className="w-full py-5 premium-gradient text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95"
              >
                {score >= Math.ceil(questions.length * 0.6) ? 'Finish & Mark Completed' : 'Close'}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</span>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{currentIndex + 1} <span className="text-slate-300 dark:text-slate-700 font-normal">/</span> {questions.length}</div>
                </div>
                <div className="h-3 w-32 sm:w-48 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full premium-gradient transition-all duration-700 ease-out" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {questions[currentIndex].question}
              </h4>

              <div className="space-y-4">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === questions[currentIndex].correctAnswer;
                  const showFeedback = selectedOption !== null;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showFeedback}
                      className={`w-full p-6 text-left rounded-[1.5rem] border-2 transition-all duration-500 flex items-center justify-between group relative overflow-hidden ${
                        showFeedback
                          ? isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xl shadow-emerald-500/10'
                            : isSelected
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 shadow-xl shadow-red-500/10'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 opacity-40'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:-translate-y-1'
                      }`}
                    >
                      <span className="font-black text-lg relative z-10">{option}</span>
                      {showFeedback && isCorrect && (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg relative z-10 animate-bounce">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {!showFeedback && (
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <button 
                  onClick={nextQuestion}
                  className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all animate-slideUp shadow-2xl transform hover:-translate-y-1 active:scale-95"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'} 
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
