import React from 'react';
import { motion } from 'motion/react';
import { 
  Info, 
  Shield, 
  Zap, 
  Globe, 
  Github, 
  Linkedin, 
  Mail, 
  GraduationCap, 
  User as UserIcon,
  Code2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
      {/* Hero Section */}
      <header className="text-center space-y-6 animate-slideUp">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/5 dark:bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-inner"
        >
          <Sparkles className="w-4 h-4" />
          The Ultimate Study Companion
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.85]"
        >
          EXAM <br />
          <span className="text-gradient">VIBE</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 font-bold tracking-tight text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
        >
          Master your academic journey with AI-driven precision and effortless organization.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
        {/* About Website - Glassy Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="group relative overflow-hidden rounded-[3rem] sm:rounded-[4rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-10 sm:p-14 backdrop-blur-3xl hover:border-blue-500/30 transition-all duration-700 shadow-sm hover:shadow-2xl"
        >
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-5 mb-4">
              <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-500">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">The Platform</h2>
            </div>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
              ExamVibe is an all-in-one study platform designed to help students plan, organize, and improve their learning efficiently. It includes features like exam scheduling, smart study planning, roadmap generation, quick revision tools, and AI-powered note creation. 
            </p>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
              The platform allows students to manage their exams, generate study plans, and revise effectively without using multiple apps, creating a unified ecosystem for academic excellence.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                <Zap className="w-6 h-6 text-blue-500 mb-3" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Efficiency</div>
                <div className="text-base font-black text-slate-900 dark:text-white">AI Optimization</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                <Shield className="w-6 h-6 text-emerald-500 mb-3" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Reliability</div>
                <div className="text-base font-black text-slate-900 dark:text-white">Cloud Sync</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About Creator - Glassy Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="group relative overflow-hidden rounded-[3rem] sm:rounded-[4rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-10 sm:p-14 backdrop-blur-3xl hover:border-purple-500/30 transition-all duration-700 shadow-sm hover:shadow-2xl"
        >
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-5 mb-4">
              <div className="p-4 bg-purple-600 rounded-[1.5rem] shadow-2xl shadow-purple-500/30 group-hover:-rotate-12 transition-transform duration-500">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">The Creator</h2>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">JAIA VIJAI RAJA PE</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                A passionate Computer Science student and aspiring developer who enjoys building impactful projects that solve real-world problems. I focus on creating smart and efficient digital solutions that improve productivity and learning.
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl shadow-inner">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Details</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">B.Tech in CSE Core (2025 – 2029)</div>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl shadow-inner">
                  <Code2 className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Focus Area</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">Smart Digital Solutions</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <a 
                href="https://github.com/JaiaVijaiRaja" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs hover:scale-[1.05] active:scale-95 transition-all shadow-xl"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/jaia-vijai-raja-pe-17543637a" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="rounded-[4rem] premium-gradient p-12 sm:p-20 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden text-center group"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-3xl pointer-events-none"></div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-tight">Let's Build <br /> the Future</h2>
          <p className="text-lg sm:text-xl text-blue-100 font-bold max-w-2xl mx-auto leading-relaxed">
            Have questions, feedback, or collaboration ideas? I'm always open to discussing new projects and opportunities.
          </p>
          <a 
            href="mailto:vijaithegamer@gmail.com"
            className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest text-sm hover:scale-110 active:scale-95 transition-all shadow-2xl"
          >
            <Mail className="w-6 h-6" />
            Get In Touch
          </a>
        </div>
      </motion.div>
    </div>
  );
};

