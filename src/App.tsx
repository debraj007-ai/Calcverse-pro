import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Layers, BookOpen, GraduationCap, Github, Linkedin, 
  Settings, Sun, Moon, Volume2, Info, ChevronRight 
} from 'lucide-react';
import ScientificCalculator from './components/ScientificCalculator';
import AdvancedTools from './components/AdvancedTools';
import FormulaGuide from './components/FormulaGuide';
import AboutDeveloper from './components/AboutDeveloper';
import { ThemeType } from './types';

export default function App() {
  const [theme, setTheme] = useState<ThemeType>('classic-black');
  const [activeTab, setActiveTab] = useState<'advanced' | 'formulas' | 'developer'>('advanced');
  const [insertBuffer, setInsertBuffer] = useState('');

  // Handle system dark mode detection or loading local theme choice on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('calc_emulator_theme');
    if (savedTheme) {
      setTheme(savedTheme as ThemeType);
      applyThemeClass(savedTheme as ThemeType);
    } else {
      // Default auto-detect
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme: ThemeType = prefersDark ? 'classic-black' : 'white-professional';
      setTheme(initialTheme);
      applyThemeClass(initialTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('calc_emulator_theme', newTheme);
    applyThemeClass(newTheme);
  };

  const applyThemeClass = (targetTheme: ThemeType) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'classic-black-theme', 'amoled-theme', 'modern-blue-theme', 'white-prof-theme');
    
    if (targetTheme === 'classic-black') {
      root.classList.add('dark', 'classic-black-theme');
    } else if (targetTheme === 'dark-amoled') {
      root.classList.add('dark', 'amoled-theme');
    } else if (targetTheme === 'modern-blue') {
      root.classList.add('dark', 'modern-blue-theme');
    } else if (targetTheme === 'white-professional') {
      root.classList.add('white-prof-theme');
    }
  };

  const handleInsertExpression = (expr: string) => {
    // Standardize insert string (e.g. converting x = (-b ± √(b² - 4ac)) / 2a into a friendly start template)
    let clean = expr;
    if (expr.includes('x = ')) {
      clean = expr.replace('x = ', '');
    }
    setInsertBuffer(clean);
    // Smoothly scroll back to the calculator on mobile layout
    const calcChassis = document.getElementById('scientific-calculator-chassis');
    if (calcChassis) {
      calcChassis.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Background gradient classes matching selected theme
  const getWorkspaceBg = () => {
    switch (theme) {
      case 'dark-amoled':
        return 'bg-zinc-950 text-cyan-400 selection:bg-cyan-500/20';
      case 'modern-blue':
        return 'bg-[#050b18] bg-gradient-to-tr from-[#050b18] via-[#0d172e] to-[#09152a] text-sky-200 selection:bg-sky-500/20';
      case 'white-professional':
        return 'bg-[#f4f7f6] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#eefaf5] via-[#f4f7f6] to-[#faf3f5] text-slate-800 selection:bg-emerald-500/20';
      case 'classic-black':
      default:
        return 'bg-[#08080c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f241a] via-[#08080b] to-[#160a22] text-zinc-100 selection:bg-emerald-500/20';
    }
  };

  // Get dynamic vibrant blob classes based on theme for the liquid glass look
  const getBlobStyles = () => {
    switch (theme) {
      case 'dark-amoled':
        return {
          blob1: 'bg-cyan-500/12',
          blob2: 'bg-indigo-500/12',
          blob3: 'bg-zinc-800/10'
        };
      case 'modern-blue':
        return {
          blob1: 'bg-blue-500/20',
          blob2: 'bg-cyan-500/20',
          blob3: 'bg-indigo-600/15'
        };
      case 'white-professional':
        return {
          blob1: 'bg-emerald-500/15',
          blob2: 'bg-sky-400/15',
          blob3: 'bg-amber-400/12'
        };
      case 'classic-black':
      default:
        return {
          blob1: 'bg-emerald-500/30',
          blob2: 'bg-fuchsia-500/28',
          blob3: 'bg-violet-600/30'
        };
    }
  };

  const blobs = getBlobStyles();

  return (
    <div className={`min-h-screen w-full flex flex-col transition-all duration-500 relative overflow-hidden z-10 ${getWorkspaceBg()}`} id="app-workspace">
      {/* Liquid Ambient Background Blobs (macOS / iOS liquid glass effect) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        <div className={`absolute top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full blur-[100px] sm:blur-[140px] animate-fluid-1 transition-all duration-1000 ${blobs.blob1}`} />
        <div className={`absolute top-[35%] right-[5%] w-[50vw] h-[50vw] rounded-full blur-[120px] sm:blur-[160px] animate-fluid-2 transition-all duration-1000 ${blobs.blob2}`} />
        <div className={`absolute bottom-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full blur-[100px] sm:blur-[140px] animate-fluid-3 transition-all duration-1000 ${blobs.blob3}`} />
      </div>

      {/* Premium Dashboard Header (Liquid Glass) */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/20 relative z-20">
        <div className="flex items-center gap-3.5 select-none">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 border border-white/20 dark:border-white/10 shrink-0 transform hover:scale-105 transition-transform duration-300">
            <Calculator className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              CalcVerse
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-400/25 rounded-lg shadow-sm">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold tracking-wider mt-0.5 uppercase">
              Numerical Sandbox by Debraj Pathak
            </p>
          </div>
        </div>

        {/* Quick Top Controls */}
        <div className="flex items-center gap-3">
          {/* iOS/macOS Style Light / Dark Mode Toggle button */}
          <button
            onClick={() => {
              if (theme === 'white-professional') {
                handleThemeChange('classic-black');
              } else {
                handleThemeChange('white-professional');
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-sm relative overflow-hidden group select-none active:scale-95 duration-200"
            title="Toggle Light / Dark Mode"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {theme === 'white-professional' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-zinc-700">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-zinc-300">Light Mode</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Quick theme selector tags */}
          <div className="flex items-center gap-1 bg-zinc-100/60 dark:bg-zinc-950/60 p-1 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 select-none">
            {[
              { id: 'classic-black', label: 'Classic' },
              { id: 'dark-amoled', label: 'AMOLED' },
              { id: 'modern-blue', label: 'Blue' },
              { id: 'white-professional', label: 'White' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as ThemeType)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                  theme === t.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm font-black'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Primary Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start relative z-20">
        {/* Left Side: Physical Handheld Scientific Calculator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full lg:w-auto shrink-0 lg:sticky lg:top-8 flex justify-center"
        >
          <ScientificCalculator 
            theme={theme} 
            onChangeTheme={handleThemeChange} 
            insertBuffer={insertBuffer}
            setInsertBuffer={setInsertBuffer}
          />
        </motion.div>

        {/* Right Side: Interactive Workspace tabs */}
        <div className="flex-1 w-full flex flex-col gap-6" id="workspace-tabs-container">
          {/* Tab switches (Liquid Glass Bubble) */}
          <div className="flex items-center gap-2 p-1.5 border border-zinc-200/40 dark:border-zinc-800/30 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md rounded-2xl self-start w-full sm:w-auto overflow-x-auto no-scrollbar shadow-sm">
            {[
              { id: 'advanced', label: 'Advanced Tools', icon: Layers },
              { id: 'formulas', label: 'Scientific Formulas', icon: BookOpen },
              { id: 'developer', label: 'CSE Portfolio', icon: GraduationCap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-md font-extrabold border border-zinc-200/30 dark:border-zinc-700/30'
                      : 'text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-white/20 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Screen */}
          <div className="w-full min-h-[480px]">
            <AnimatePresence mode="wait">
              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AdvancedTools />
                </motion.div>
              )}

              {activeTab === 'formulas' && (
                <motion.div
                  key="formulas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormulaGuide onInsertExpression={handleInsertExpression} />
                </motion.div>
              )}

              {activeTab === 'developer' && (
                <motion.div
                  key="developer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AboutDeveloper />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Elegant Footer: Single Liquid Glass Box */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-12 relative z-20">
        <div className="w-full rounded-2xl p-6 sm:p-8 liquid-glass-panel border-zinc-300/60 dark:border-zinc-800/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl select-none">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Designed & Developed by{' '}
                <a 
                  href="https://www.linkedin.com/in/debraj-pathak-07038628a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-black"
                >
                  Debraj Pathak
                </a>
              </p>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-1 justify-center md:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Chandigarh University • Computer Science & Engineering
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-zinc-300/60 dark:border-zinc-800/60 pt-4 md:pt-0 md:pl-6">
            <a 
              href="https://www.linkedin.com/in/debraj-pathak-07038628a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-zinc-950/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-950/10 dark:hover:bg-white/10 border border-zinc-300/60 dark:border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Linkedin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://github.com/debraj-pathak"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-zinc-950/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-950/10 dark:hover:bg-white/10 border border-zinc-300/60 dark:border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Github className="w-4 h-4 text-zinc-800 dark:text-zinc-300" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="w-full text-center mt-6 text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 select-none">
          &copy; {new Date().getFullYear()} CalcVerse PRO • All rights reserved.
        </div>
      </footer>
    </div>
  );
}
