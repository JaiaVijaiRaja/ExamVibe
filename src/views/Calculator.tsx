import React, { useState, useMemo } from 'react';
import { Calculator as CalcIcon, Plus, Trash2, GraduationCap, Percent, BookOpen } from 'lucide-react';

const GRADES = [
  { grade: 'O', point: 10, min: 91, max: 100, label: 'Outstanding' },
  { grade: 'A+', point: 9, min: 81, max: 90, label: 'Excellent' },
  { grade: 'A', point: 8, min: 71, max: 80, label: 'Very Good' },
  { grade: 'B+', point: 7, min: 61, max: 70, label: 'Good' },
  { grade: 'B', point: 6, min: 56, max: 60, label: 'Above Average' },
  { grade: 'C', point: 5, min: 50, max: 55, label: 'Average' },
  { grade: 'F', point: 0, min: 0, max: 49, label: 'Fail' },
];

const getGradeFromMarks = (marks: number) => {
  if (marks < 0 || marks > 100) return null;
  return GRADES.find(g => marks >= g.min && marks <= g.max) || GRADES[GRADES.length - 1];
};

export const Calculator: React.FC = () => {
  // Marks to Grade State
  const [marks, setMarks] = useState<string>('');
  
  // SGPA State
  const [subjects, setSubjects] = useState([{ id: 1, name: '', credits: 3, grade: 'O' }]);
  const [sgpaResult, setSgpaResult] = useState<number | null>(null);

  // CGPA State
  const [semesters, setSemesters] = useState([{ id: 1, sgpa: '', credits: '' }]);
  const [cgpaResult, setCgpaResult] = useState<number | null>(null);

  // CGPA to Percentage State
  const [cgpaInput, setCgpaInput] = useState<string>('');

  // Marks to Grade Logic
  const marksValue = parseInt(marks);
  const gradeResult = !isNaN(marksValue) ? getGradeFromMarks(marksValue) : null;

  // SGPA Logic
  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: '', credits: 3, grade: 'O' }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: number, field: string, value: string | number) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateSGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    
    subjects.forEach(sub => {
      const credit = Number(sub.credits);
      const gradeObj = GRADES.find(g => g.grade === sub.grade);
      if (credit > 0 && gradeObj) {
        totalCredits += credit;
        totalPoints += credit * gradeObj.point;
      }
    });

    if (totalCredits > 0) {
      setSgpaResult(Number((totalPoints / totalCredits).toFixed(2)));
    } else {
      setSgpaResult(0);
    }
  };

  // CGPA Logic
  const addSemester = () => {
    if (semesters.length < 8) {
      setSemesters([...semesters, { id: Date.now(), sgpa: '', credits: '' }]);
    }
  };

  const removeSemester = (id: number) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const updateSemester = (id: number, field: string, value: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    semesters.forEach(sem => {
      const sgpa = parseFloat(sem.sgpa);
      const credits = parseFloat(sem.credits);
      if (!isNaN(sgpa) && !isNaN(credits) && credits > 0) {
        totalCredits += credits;
        totalPoints += sgpa * credits;
      }
    });

    if (totalCredits > 0) {
      setCgpaResult(Number((totalPoints / totalCredits).toFixed(2)));
    } else {
      setCgpaResult(0);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="animate-slideUp">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Grade <span className="text-gradient">Calculator</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
          Calculate SGPA, CGPA, and convert marks based on 2021 Regulation
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marks to Grade Converter */}
        <div className="glass-card p-8 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center shadow-inner">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Marks to Grade</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Enter Marks (0-100)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="e.g. 85"
              />
            </div>

            {gradeResult && (
              <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-[2rem] flex items-center justify-between gap-6 animate-fadeIn">
                <div>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mb-1">{gradeResult.label}</p>
                  <p className="text-4xl font-black text-indigo-700 dark:text-indigo-300 tracking-tighter">Grade {gradeResult.grade}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mb-1">Grade Point</p>
                  <p className="text-4xl font-black text-indigo-700 dark:text-indigo-300 tracking-tighter">{gradeResult.point}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CGPA to Percentage Converter */}
        <div className="glass-card p-8 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center shadow-inner">
              <Percent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">CGPA to Percentage</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Enter CGPA</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="10"
                value={cgpaInput}
                onChange={(e) => setCgpaInput(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="e.g. 8.5"
              />
            </div>

            {cgpaInput && !isNaN(parseFloat(cgpaInput)) && (
              <div className="mt-8 p-6 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] flex items-center justify-between gap-6 animate-fadeIn">
                <div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">Equivalent Percentage</p>
                  <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 tracking-tighter">
                    {(parseFloat(cgpaInput) * 10).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SGPA Calculator */}
      <div className="glass-card p-8 sm:p-10 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.3s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center shadow-inner">
              <CalcIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">SGPA Calculator</h3>
          </div>
          <button 
            onClick={addSubject}
            className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-6 py-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/50 transition-all hover:shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="space-y-4 mb-10">
          <div className="grid grid-cols-12 gap-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:grid">
            <div className="col-span-5">Subject Name</div>
            <div className="col-span-3">Credits</div>
            <div className="col-span-3">Grade</div>
            <div className="col-span-1"></div>
          </div>
          
          {subjects.map((subject, index) => (
            <div key={subject.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center bg-white dark:bg-slate-900/50 p-6 sm:p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 group transition-all hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-xl">
              <div className="col-span-1 sm:col-span-5">
                <input 
                  type="text" 
                  value={subject.name}
                  onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                  placeholder={`Subject ${index + 1}`}
                  className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 outline-none px-2 text-lg font-black tracking-tight placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="col-span-1 sm:col-span-3 flex items-center gap-4 sm:block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden w-20">Credits:</span>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  value={subject.credits}
                  onChange={(e) => updateSubject(subject.id, 'credits', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="col-span-1 sm:col-span-3 flex items-center gap-4 sm:block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden w-20">Grade:</span>
                <select 
                  value={subject.grade}
                  onChange={(e) => updateSubject(subject.id, 'grade', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {GRADES.map(g => (
                    <option key={g.grade} value={g.grade}>{g.grade} ({g.point} pts)</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 flex justify-end sm:justify-center">
                <button 
                  onClick={() => removeSubject(subject.id)}
                  disabled={subjects.length === 1}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
          <button 
            onClick={calculateSGPA}
            className="w-full sm:w-auto premium-gradient text-white font-black uppercase tracking-widest py-5 px-12 rounded-2xl transition-all shadow-2xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95"
          >
            Calculate SGPA
          </button>
          
          {sgpaResult !== null && (
            <div className="flex items-center gap-6 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 px-10 py-6 rounded-[2rem] w-full sm:w-auto justify-center animate-fadeIn">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">Your SGPA</span>
              <span className="text-5xl font-black text-blue-700 dark:text-blue-300 tracking-tighter">{sgpaResult.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* CGPA Calculator */}
      <div className="glass-card p-8 sm:p-10 animate-slideUp relative overflow-hidden group" style={{ animationDelay: '0.4s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center shadow-inner">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">CGPA Calculator</h3>
          </div>
          <button 
            onClick={addSemester}
            disabled={semesters.length >= 8}
            className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/20 px-6 py-3.5 rounded-2xl border border-purple-100 dark:border-purple-800/50 transition-all hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Semester
          </button>
        </div>

        <div className="space-y-4 mb-10">
          <div className="grid grid-cols-12 gap-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:grid">
            <div className="col-span-3">Semester</div>
            <div className="col-span-4">SGPA</div>
            <div className="col-span-4">Total Credits</div>
            <div className="col-span-1"></div>
          </div>
          
          {semesters.map((sem, index) => (
            <div key={sem.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center bg-white dark:bg-slate-900/50 p-6 sm:p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 group transition-all hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-xl">
              <div className="col-span-1 sm:col-span-3 px-2 text-slate-900 dark:text-white font-black text-lg tracking-tight">
                Semester {index + 1}
              </div>
              <div className="col-span-1 sm:col-span-4 flex items-center gap-4 sm:block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden w-20">SGPA:</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="10"
                  value={sem.sgpa}
                  onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                  placeholder="e.g. 8.5"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div className="col-span-1 sm:col-span-4 flex items-center gap-4 sm:block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden w-20">Credits:</span>
                <input 
                  type="number" 
                  min="1"
                  value={sem.credits}
                  onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                  placeholder="e.g. 22"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div className="col-span-1 flex justify-end sm:justify-center">
                <button 
                  onClick={() => removeSemester(sem.id)}
                  disabled={semesters.length === 1}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
          <button 
            onClick={calculateCGPA}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest py-5 px-12 rounded-2xl transition-all shadow-2xl shadow-purple-500/30 transform hover:-translate-y-1 active:scale-95"
          >
            Calculate CGPA
          </button>
          
          {cgpaResult !== null && (
            <div className="flex items-center gap-6 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 px-10 py-6 rounded-[2rem] w-full sm:w-auto justify-center animate-fadeIn">
              <span className="text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest">Your CGPA</span>
              <span className="text-5xl font-black text-purple-700 dark:text-purple-300 tracking-tighter">{cgpaResult.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
