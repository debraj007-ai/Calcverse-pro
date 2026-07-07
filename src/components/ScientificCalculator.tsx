import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, VolumeX, Maximize2, Minimize2, History, Trash2, 
  Sparkles, CheckCircle, Info, ChevronRight, CornerDownLeft
} from 'lucide-react';
import { evaluateExpression, formatResult } from '../utils/mathEngine';
import { playTactileClick, getSoundEnabled, setSoundEnabled, getSoundVolume, setSoundVolume } from '../utils/audio';
import { ThemeType, AngleModeType, HistoryItem } from '../types';

interface ScientificCalculatorProps {
  theme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
  insertBuffer: string;
  setInsertBuffer: (val: string) => void;
}

export default function ScientificCalculator({ 
  theme, 
  onChangeTheme,
  insertBuffer,
  setInsertBuffer 
}: ScientificCalculatorProps) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isShift, setIsShift] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleModeType>('DEG');
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLCDGlow, setIsLCDGlow] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [cursorPos, setCursorPos] = useState(0); // index in expression

  const calculatorRef = useRef<HTMLDivElement | null>(null);

  // Optimized state refs to prevent event-listener thrashing and guarantee instant input response
  const expressionRef = useRef(expression);
  const angleModeRef = useRef(angleMode);
  const ansRef = useRef(ans);
  const memoryRef = useRef(memory);
  const isShiftRef = useRef(isShift);

  useEffect(() => { expressionRef.current = expression; }, [expression]);
  useEffect(() => { angleModeRef.current = angleMode; }, [angleMode]);
  useEffect(() => { ansRef.current = ans; }, [ans]);
  useEffect(() => { memoryRef.current = memory; }, [memory]);
  useEffect(() => { isShiftRef.current = isShift; }, [isShift]);

  // Sync external expression injections (e.g. from formula guide)
  useEffect(() => {
    if (insertBuffer) {
      setExpression((prev) => prev + insertBuffer);
      setInsertBuffer('');
    }
  }, [insertBuffer]);

  // Load history & state from local storage on mount
  useEffect(() => {
    const savedHist = localStorage.getItem('calc_history');
    if (savedHist) {
      setHistory(JSON.parse(savedHist));
    }
    const savedMem = localStorage.getItem('calc_memory');
    if (savedMem) {
      setMemory(Number(savedMem));
    }
    const savedAns = localStorage.getItem('calc_ans');
    if (savedAns) {
      setAns(Number(savedAns));
    }
    setIsMuted(!getSoundEnabled());
    setVolume(Math.round(getSoundVolume() * 100));
  }, []);

  // Save history helper
  const addHistoryItem = (expr: string, res: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      expression: expr,
      result: res,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // limit 50 items
      localStorage.setItem('calc_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('calc_history');
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('calc_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Keyboard binding handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent capturing typing on inputs inside advanced tools
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      playTactileClick();

      const key = e.key;
      if (key >= '0' && key <= '9') {
        appendToken(key);
      } else if (key === '.') {
        appendToken('.');
      } else if (key === '+') {
        appendToken('+');
      } else if (key === '-') {
        appendToken('-');
      } else if (key === '*') {
        appendToken('×');
      } else if (key === '/') {
        appendToken('÷');
      } else if (key === '(' || key === ')') {
        appendToken(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        performCalculation();
      } else if (key === 'Backspace') {
        e.preventDefault();
        deleteLastToken();
      } else if (key === 'Delete' || key === 'Escape') {
        e.preventDefault();
        clearAll();
      } else if (key.toLowerCase() === 's') {
        appendToken('sin(');
      } else if (key.toLowerCase() === 'c') {
        appendToken('cos(');
      } else if (key.toLowerCase() === 't') {
        appendToken('tan(');
      } else if (key.toLowerCase() === 'l') {
        appendToken('ln(');
      } else if (key.toLowerCase() === 'p') {
        appendToken('π');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Static dependency array prevents re-adding event listeners on every state change

  // Audio mute/unmute
  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    setSoundEnabled(!newState);
    playTactileClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setSoundVolume(val / 100);
    if (val > 0 && isMuted) {
      setIsMuted(false);
      setSoundEnabled(true);
    } else if (val === 0 && !isMuted) {
      setIsMuted(true);
      setSoundEnabled(false);
    }
  };

  // Expression append helper
  const appendToken = (token: string) => {
    playTactileClick();
    setExpression((prev) => prev + token);
    setIsShift(false); // Auto-clear shift after a press
  };

  const deleteLastToken = () => {
    playTactileClick();
    setExpression((prev) => {
      if (prev.length === 0) return prev;
      
      // If deleting a function term like 'sin(', 'cos(', 'log(', etc.
      const endings = ['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'abs(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sinh(', 'cosh(', 'tanh(', '√(', '∛(', ' ^(', ' P ', ' C ', ' mod '];
      for (const end of endings) {
        if (prev.endsWith(end)) {
          return prev.slice(0, -end.length);
        }
      }
      return prev.slice(0, -1);
    });
    setIsShift(false);
  };

  const clearAll = () => {
    playTactileClick();
    setExpression('');
    setResult('0');
    setIsShift(false);
  };

  // Perform core math engine evaluation
  const performCalculation = () => {
    playTactileClick();
    const currentExpr = expressionRef.current;
    if (!currentExpr.trim()) return;

    const evalResult = evaluateExpression(
      currentExpr,
      angleModeRef.current,
      ansRef.current,
      memoryRef.current
    );
    
    if (evalResult.success) {
      setResult(evalResult.result);
      setAns(evalResult.numericValue);
      localStorage.setItem('calc_ans', evalResult.numericValue.toString());
      addHistoryItem(currentExpr, evalResult.result);
    } else {
      setResult(evalResult.result); // Shows error name: Syntax Error, Math Error etc.
    }
    setIsShift(false);
  };

  // Theme configuration structures
  const themeClasses: Record<ThemeType, {
    body: string;
    screenBg: string;
    screenText: string;
    numKey: string;
    funcKey: string;
    actionKey: string;
    accentKey: string;
    accentText: string;
    brandingText: string;
  }> = {
    'classic-black': {
      body: 'backdrop-blur-xl bg-zinc-900/85 border-zinc-800/70 shadow-black/50 shadow-2xl',
      screenBg: 'bg-[#9fb595] border-zinc-800/80 shadow-inner',
      screenText: 'text-zinc-900 font-mono select-all font-bold',
      numKey: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 shadow-[0_4px_0_#18181b] active:translate-y-[2px] active:shadow-none font-bold',
      funcKey: 'bg-zinc-700 hover:bg-zinc-650 text-zinc-200 shadow-[0_4px_0_#27272a] active:translate-y-[2px] active:shadow-none text-[11px] font-bold',
      actionKey: 'bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-[0_4px_0_#78350f] active:translate-y-[2px] active:shadow-none font-black',
      accentKey: 'bg-gradient-to-b from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white shadow-[0_4px_0_#0d5257] active:translate-y-[2px] active:shadow-none font-black',
      accentText: 'text-amber-500 font-bold',
      brandingText: 'text-zinc-400 font-bold',
    },
    'dark-amoled': {
      body: 'backdrop-blur-xl bg-black/90 border-zinc-900 shadow-zinc-950/95 shadow-3xl border-2',
      screenBg: 'bg-[#05070c] border-zinc-900 border shadow-inner',
      screenText: 'text-[#06b6d4] font-mono select-all text-glow-cyan font-bold',
      numKey: 'bg-zinc-950 hover:bg-zinc-900 text-zinc-100 border border-zinc-900 shadow-[0_3px_0_#18181b] active:translate-y-[2px] active:shadow-none font-bold',
      funcKey: 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 shadow-[0_3px_0_#09090b] active:translate-y-[2px] active:shadow-none text-[11px] font-bold',
      actionKey: 'bg-[#c2410c] hover:bg-orange-850 text-white shadow-[0_3px_0_#7c2d12] active:translate-y-[2px] active:shadow-none font-black',
      accentKey: 'bg-[#0891b2] hover:bg-[#0e7490] text-white shadow-[0_3px_0_#155e75] active:translate-y-[2px] active:shadow-none font-black',
      accentText: 'text-cyan-400 font-bold',
      brandingText: 'text-zinc-500 font-bold',
    },
    'modern-blue': {
      body: 'backdrop-blur-xl bg-slate-900/85 border-slate-800/70 shadow-indigo-950/40 shadow-2xl',
      screenBg: 'bg-[#151f32] border-slate-800 shadow-inner',
      screenText: 'text-[#38bdf8] font-mono select-all font-bold',
      numKey: 'bg-slate-700 hover:bg-slate-650 text-slate-100 shadow-[0_4px_0_#1e293b] active:translate-y-[2px] active:shadow-none font-bold',
      funcKey: 'bg-slate-600 hover:bg-slate-550 text-indigo-100 shadow-[0_4px_0_#0f172a] active:translate-y-[2px] active:shadow-none text-[11px] font-bold',
      actionKey: 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-[0_4px_0_#9a3412] active:translate-y-[2px] active:shadow-none font-black',
      accentKey: 'bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-[0_4px_0_#3730a3] active:translate-y-[2px] active:shadow-none font-black',
      accentText: 'text-sky-400 font-bold',
      brandingText: 'text-slate-400 font-bold',
    },
    'white-professional': {
      body: 'backdrop-blur-xl bg-white/75 border-white/50 shadow-zinc-300/40 shadow-xl',
      screenBg: 'bg-[#1e1e24] border-zinc-200 shadow-inner',
      screenText: 'text-emerald-400 font-mono select-all font-bold text-glow-emerald',
      numKey: 'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/60 shadow-[0_4px_0_#cbd5e1] active:translate-y-[2px] active:shadow-none font-black',
      funcKey: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/40 shadow-[0_4px_0_#cbd5e1] active:translate-y-[2px] active:shadow-none text-[11px] font-bold',
      actionKey: 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-[0_4px_0_#9a3412] active:translate-y-[2px] active:shadow-none font-black',
      accentKey: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_#047857] active:translate-y-[2px] active:shadow-none font-black',
      accentText: 'text-emerald-600 dark:text-emerald-400 font-bold',
      brandingText: 'text-zinc-600 font-bold',
    }
  };

  const classes = themeClasses[theme];

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    playTactileClick();
    if (!isFullscreen) {
      calculatorRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((e) => console.warn(e));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((e) => console.warn(e));
    }
  };

  // Memory Helper Operations
  const handleMemoryStore = () => {
    playTactileClick();
    const val = parseFloat(result);
    if (!isNaN(val)) {
      setMemory(val);
      localStorage.setItem('calc_memory', val.toString());
    }
    setIsShift(false);
  };

  const handleMemoryRecall = () => {
    playTactileClick();
    setExpression((prev) => prev + 'M');
    setIsShift(false);
  };

  const handleMemoryAdd = () => {
    playTactileClick();
    const val = parseFloat(result);
    if (!isNaN(val)) {
      const updated = memory + val;
      setMemory(updated);
      localStorage.setItem('calc_memory', updated.toString());
    }
    setIsShift(false);
  };

  const handleMemorySubtract = () => {
    playTactileClick();
    const val = parseFloat(result);
    if (!isNaN(val)) {
      const updated = memory - val;
      setMemory(updated);
      localStorage.setItem('calc_memory', updated.toString());
    }
    setIsShift(false);
  };

  const handleMemoryClear = () => {
    playTactileClick();
    setMemory(0);
    localStorage.removeItem('calc_memory');
    setIsShift(false);
  };

  return (
    <div 
      ref={calculatorRef}
      className={`w-full max-w-sm mx-auto rounded-[36px] border-8 p-6 flex flex-col gap-5 relative transition-all ${classes.body}`}
      id="scientific-calculator-chassis"
    >
      {/* Handheld Branding Area */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-[11px] font-extrabold tracking-widest uppercase ${classes.brandingText}`}>
            CUP-991EX
          </span>
          <span className="text-[8px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5">
            ClassWiz Emulator
          </span>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="flex items-center gap-2">
          {/* Muted toggle */}
          <button 
            onClick={toggleMute} 
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
            title="Toggle Key Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {/* Sound volume slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 accent-emerald-500 rounded-lg cursor-pointer hidden sm:block"
            title="Volume slider"
          />

          {/* History modal activator */}
          <button
            onClick={() => { playTactileClick(); setShowHistoryModal(true); }}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
            title="Calculations History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Fullscreen control */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Retro LCD Screen */}
      <div 
        className={`w-full rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 border-2 select-all ${
          classes.screenBg
        } ${isLCDGlow ? 'shadow-inner' : ''}`}
        id="lcd-display-screen"
      >
        {/* LCD grid reflection element */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

        {/* Top Status Bar */}
        <div className={`flex items-center justify-between text-[10px] font-bold ${classes.screenText} opacity-70`}>
          <div className="flex items-center gap-2">
            {isShift && <span className="bg-amber-500 text-zinc-950 px-1 rounded text-[9px]">S</span>}
            {memory !== 0 && <span className="bg-emerald-600 text-white px-1 rounded text-[9px]">M</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={angleMode === 'DEG' ? 'font-extrabold underline' : ''}>D</span>
            <span className={angleMode === 'RAD' ? 'font-extrabold underline' : ''}>R</span>
            <span className={angleMode === 'GRAD' ? 'font-extrabold underline' : ''}>G</span>
          </div>
        </div>

        {/* Input Formula Line */}
        <div className="w-full flex items-center justify-between gap-2 overflow-x-auto min-h-[28px] no-scrollbar">
          <div className={`text-sm tracking-wide break-all w-full leading-tight font-medium ${classes.screenText}`}>
            {expression || ' '}
            <span className="animate-pulse bg-emerald-500 dark:bg-emerald-400 w-1.5 h-4 inline-block ml-0.5 align-middle" />
          </div>
        </div>

        {/* Main Output Number Line */}
        <div className="w-full text-right overflow-x-auto min-h-[36px] no-scrollbar flex items-end justify-end">
          <span className={`text-2xl font-black tracking-wider leading-none ${classes.screenText}`}>
            {result}
          </span>
        </div>
      </div>

      {/* Grid of Hands-on Emulated Keys */}
      <div className="grid grid-cols-5 gap-x-2.5 gap-y-3.5" id="tactile-keys-grid">
        
        {/* Row 1: System / Control Modifier Buttons */}
        <button
          onClick={() => { playTactileClick(); setIsShift(!isShift); }}
          className={`h-9 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer transition-all ${
            isShift ? 'bg-amber-500 text-zinc-950 shadow-none translate-y-1' : classes.funcKey
          }`}
          title="Shift LEGEND selector"
        >
          SHIFT
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setAngleMode((prev) => prev === 'DEG' ? 'RAD' : prev === 'RAD' ? 'GRAD' : 'DEG');
          }}
          className={`h-9 rounded-lg flex items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
          title="Switch Angle Modes"
        >
          MODE
        </button>

        <button
          onClick={handleMemoryRecall}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
          title="Memory Recall"
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">MC</span>
          <span className="text-[10px]">MR</span>
        </button>

        <button
          onClick={handleMemoryStore}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
          title="Memory Store"
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">M-</span>
          <span className="text-[10px]">MS</span>
        </button>

        <button
          onClick={handleMemoryAdd}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
          title="Add to Memory"
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">M-CLR</span>
          <span className="text-[10px]">M+</span>
        </button>

        {/* Row 2: Basic Functions / Scientific Trigonometry */}
        <button
          onClick={() => appendToken(isShift ? 'sin⁻¹(' : 'sin(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">sin⁻¹</span>
          <span className="text-[10px]">sin</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? 'cos⁻¹(' : 'cos(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">cos⁻¹</span>
          <span className="text-[10px]">cos</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? 'tan⁻¹(' : 'tan(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">tan⁻¹</span>
          <span className="text-[10px]">tan</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? 'sinh(' : 'abs(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">sinh</span>
          <span className="text-[10px]">abs</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? 'cosh(' : '!')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">cosh</span>
          <span className="text-[10px]">x!</span>
        </button>

        {/* Row 3: Polynomial Powers & Logarithms */}
        <button
          onClick={() => appendToken(isShift ? '³' : '²')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">x³</span>
          <span className="text-[10px]">x²</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? ' ^(' : ' ^(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5"><sup>x</sup>√y</span>
          <span className="text-[10px]">x<sup>y</sup></span>
        </button>

        <button
          onClick={() => appendToken(isShift ? '∛(' : '√(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">∛</span>
          <span className="text-[10px]">√</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? '10^(' : 'log(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">10<sup>x</sup></span>
          <span className="text-[10px]">log</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? 'e^(' : 'ln(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">e<sup>x</sup></span>
          <span className="text-[10px]">ln</span>
        </button>

        {/* Row 4: Math Symbols / Constants & Parentheses */}
        <button
          onClick={() => appendToken('π')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">e</span>
          <span className="text-[10px]">π</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? '⁻¹' : '⁻¹')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">1/x Legend</span>
          <span className="text-[10px]">x⁻¹</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? ' P ' : '(')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">nPr</span>
          <span className="text-[10px]">(</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? ' C ' : ')')}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">nCr</span>
          <span className="text-[10px]">)</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            // Toggle fraction/decimal format
            const num = parseFloat(result);
            if (!isNaN(num)) {
              if (result.includes('/')) {
                setResult(formatResult(num, 'decimal'));
              } else {
                setResult(formatResult(num, 'fraction'));
              }
            }
          }}
          className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.funcKey}`}
          title="Toggle decimal to fraction format"
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">S⇔D</span>
          <span className="text-[10px]">a/b</span>
        </button>

        {/* Row 5: Numerical Inputs 7, 8, 9, DEL, AC */}
        <button
          onClick={() => appendToken('7')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          7
        </button>

        <button
          onClick={() => appendToken('8')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          8
        </button>

        <button
          onClick={() => appendToken('9')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          9
        </button>

        <button
          onClick={deleteLastToken}
          className={`h-11 rounded-xl text-xs font-black cursor-pointer transition-all ${classes.actionKey}`}
          title="Backspace DELETE"
        >
          DEL
        </button>

        <button
          onClick={clearAll}
          className={`h-11 rounded-xl text-xs font-black cursor-pointer transition-all ${classes.actionKey}`}
          title="Clear Buffer"
        >
          AC
        </button>

        {/* Row 6: Numerical Inputs 4, 5, 6, Multipliers */}
        <button
          onClick={() => appendToken('4')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          4
        </button>

        <button
          onClick={() => appendToken('5')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          5
        </button>

        <button
          onClick={() => appendToken('6')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          6
        </button>

        <button
          onClick={() => appendToken('×')}
          className={`h-11 rounded-xl text-base font-extrabold cursor-pointer transition-all ${classes.numKey}`}
        >
          ×
        </button>

        <button
          onClick={() => appendToken('÷')}
          className={`h-11 rounded-xl text-base font-extrabold cursor-pointer transition-all ${classes.numKey}`}
        >
          ÷
        </button>

        {/* Row 7: Numerical Inputs 1, 2, 3, Adding/Subtracting */}
        <button
          onClick={() => appendToken('1')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          1
        </button>

        <button
          onClick={() => appendToken('2')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          2
        </button>

        <button
          onClick={() => appendToken('3')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          3
        </button>

        <button
          onClick={() => appendToken('+')}
          className={`h-11 rounded-xl text-base font-extrabold cursor-pointer transition-all ${classes.numKey}`}
        >
          +
        </button>

        <button
          onClick={() => appendToken('-')}
          className={`h-11 rounded-xl text-base font-extrabold cursor-pointer transition-all ${classes.numKey}`}
        >
          -
        </button>

        {/* Row 8: Bottom Row 0, Decimals, EXP, Ans, EQUALS */}
        <button
          onClick={() => appendToken('0')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          0
        </button>

        <button
          onClick={() => appendToken('.')}
          className={`h-11 rounded-xl text-base font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          .
        </button>

        <button
          onClick={() => appendToken(isShift ? ' mod ' : ' * 10 ^(')}
          className={`h-11 rounded-xl flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">mod</span>
          <span className="text-[10px]">EXP</span>
        </button>

        <button
          onClick={() => appendToken(isShift ? 'random(' : 'Ans')}
          className={`h-11 rounded-xl flex flex-col items-center justify-center font-bold cursor-pointer transition-all ${classes.numKey}`}
        >
          <span className="text-[7px] text-amber-500 font-bold -mb-0.5">Ran#</span>
          <span className="text-[10px]">Ans</span>
        </button>

        <button
          onClick={performCalculation}
          className={`h-11 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all ${classes.accentKey}`}
          id="btn-equal"
        >
          =
        </button>
      </div>

      {/* Slide-over calculations History modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-[36px] z-50 flex flex-col justify-end overflow-hidden"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-zinc-950 text-white rounded-t-[28px] max-h-[80%] flex flex-col p-5 border-t border-zinc-800"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-500" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">Calculation History</span>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearAllHistory}
                      className="p-1.5 rounded-lg hover:bg-zinc-900 text-rose-500 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>CLEAR ALL</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              {/* History scroll pane */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1.5 no-scrollbar max-h-[250px]">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs">
                    No history recorded yet. Solve formulas to log calculations.
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setExpression(item.expression);
                        setResult(item.result);
                        setShowHistoryModal(false);
                        playTactileClick();
                      }}
                      className="p-3 bg-zinc-900/60 hover:bg-zinc-900 rounded-xl border border-zinc-800/40 hover:border-zinc-700/80 cursor-pointer transition-all flex flex-col gap-1 relative group text-left"
                    >
                      <span className="text-[8px] font-bold text-zinc-500 absolute top-2 right-2">
                        {item.timestamp}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 font-medium break-all pr-8">
                        {item.expression}
                      </span>
                      <span className="text-sm font-mono text-emerald-400 font-extrabold break-all pt-1 mt-0.5 border-t border-zinc-800/50">
                        = {item.result}
                      </span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="absolute bottom-2.5 right-2.5 p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
