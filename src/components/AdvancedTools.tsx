import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, RefreshCw, Calendar, Clock, Smile, User, Percent, 
  HelpCircle, BarChart2, Hash, Shuffle, Check, Play, Settings
} from 'lucide-react';
import { evaluateExpression } from '../utils/mathEngine';

type ActiveToolType = 
  | 'unit' | 'currency' | 'date' | 'time' | 'bmi' 
  | 'age' | 'percent' | 'random_prime' | 'stats' | 'solver' | 'graph';

export default function AdvancedTools() {
  const [activeTool, setActiveTool] = useState<ActiveToolType>('unit');

  // Menu items for the side drawer or top tab list
  const toolsMenu = [
    { id: 'unit', label: 'Unit Converter', icon: Compass },
    { id: 'currency', label: 'Currency', icon: RefreshCw },
    { id: 'date', label: 'Date Calculator', icon: Calendar },
    { id: 'time', label: 'Time Calculator', icon: Clock },
    { id: 'bmi', label: 'BMI Calculator', icon: Smile },
    { id: 'age', label: 'Age Calculator', icon: User },
    { id: 'percent', label: 'Percentages', icon: Percent },
    { id: 'random_prime', label: 'Random & Primes', icon: Shuffle },
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
    { id: 'solver', label: 'Equation Solver', icon: Settings },
    { id: 'graph', label: 'Function Grapher', icon: Play },
  ] as const;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]" id="advanced-tools-workspace">
      {/* Tools Sidebar Navigation (Liquid Glass) */}
      <div className="w-full lg:w-64 flex flex-col gap-2 p-3 rounded-2xl shrink-0 liquid-glass-panel border-white/30 dark:border-white/10 select-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 py-1.5 block">
          Select Advanced Utility
        </span>
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1.5 no-scrollbar">
          {toolsMenu.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTool === tool.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 font-black'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/35 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Tool Sandbox (Liquid Glass) */}
      <div className="flex-1 rounded-3xl p-6 shadow-md min-h-[450px] relative liquid-glass-panel border-white/30 dark:border-white/10">
        <div className="w-full h-full">
          {activeTool === 'unit' && <UnitConverterTool />}
          {activeTool === 'currency' && <CurrencyConverterTool />}
          {activeTool === 'date' && <DateCalculatorTool />}
          {activeTool === 'time' && <TimeCalculatorTool />}
          {activeTool === 'bmi' && <BmiCalculatorTool />}
          {activeTool === 'age' && <AgeCalculatorTool />}
          {activeTool === 'percent' && <PercentageCalculatorTool />}
          {activeTool === 'random_prime' && <RandomPrimeTool />}
          {activeTool === 'stats' && <StatisticsTool />}
          {activeTool === 'solver' && <EquationSolverTool />}
          {activeTool === 'graph' && <FunctionGrapherTool />}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   1. UNIT CONVERTER
   ========================================================================== */
const unitCategories = [
  {
    name: 'Length',
    base: 'Meter',
    units: [
      { name: 'Millimeters (mm)', factor: 0.001 },
      { name: 'Centimeters (cm)', factor: 0.01 },
      { name: 'Meters (m)', factor: 1.0 },
      { name: 'Kilometers (km)', factor: 1000 },
      { name: 'Inches (in)', factor: 0.0254 },
      { name: 'Feet (ft)', factor: 0.3048 },
      { name: 'Yards (yd)', factor: 0.9144 },
      { name: 'Miles (mi)', factor: 1609.344 }
    ]
  },
  {
    name: 'Weight / Mass',
    base: 'Gram',
    units: [
      { name: 'Milligrams (mg)', factor: 0.001 },
      { name: 'Grams (g)', factor: 1.0 },
      { name: 'Kilograms (kg)', factor: 1000 },
      { name: 'Ounces (oz)', factor: 28.349523125 },
      { name: 'Pounds (lb)', factor: 453.59237 },
      { name: 'Tons', factor: 907184.74 }
    ]
  },
  {
    name: 'Speed',
    base: 'm/s',
    units: [
      { name: 'Meters/second (m/s)', factor: 1.0 },
      { name: 'Kilometers/hour (km/h)', factor: 0.277778 },
      { name: 'Miles/hour (mph)', factor: 0.44704 },
      { name: 'Knots', factor: 0.514444 }
    ]
  },
  {
    name: 'Area',
    base: 'sqm',
    units: [
      { name: 'Square Centimeters (cm²)', factor: 0.0001 },
      { name: 'Square Meters (m²)', factor: 1.0 },
      { name: 'Square Kilometers (km²)', factor: 1000000 },
      { name: 'Square Inches (in²)', factor: 0.00064516 },
      { name: 'Square Feet (ft²)', factor: 0.09290304 },
      { name: 'Acres', factor: 4046.85642 },
      { name: 'Hectares', factor: 10000 }
    ]
  },
  {
    name: 'Volume',
    base: 'Liter',
    units: [
      { name: 'Milliliters (ml)', factor: 0.001 },
      { name: 'Liters (L)', factor: 1.0 },
      { name: 'Cubic Meters (m³)', factor: 1000 },
      { name: 'Teaspoons (tsp)', factor: 0.00492892 },
      { name: 'Tablespoons (tbsp)', factor: 0.0147868 },
      { name: 'Fluid Ounces (fl oz)', factor: 0.0295735 },
      { name: 'Cups', factor: 0.24 },
      { name: 'Gallons (US)', factor: 3.78541 }
    ]
  }
];

function UnitConverterTool() {
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [inputValue, setInputValue] = useState('1');
  const [fromUnitIdx, setFromUnitIdx] = useState(0);
  const [toUnitIdx, setToUnitIdx] = useState(1);
  const [convertedValue, setConvertedValue] = useState<number | null>(null);

  const category = unitCategories[categoryIdx];

  useEffect(() => {
    setFromUnitIdx(0);
    setToUnitIdx(Math.min(1, category.units.length - 1));
  }, [categoryIdx]);

  useEffect(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setConvertedValue(null);
      return;
    }
    const fromUnit = category.units[fromUnitIdx];
    const toUnit = category.units[toUnitIdx];
    
    // Convert to base, then to target
    const baseVal = num * fromUnit.factor;
    const finalVal = baseVal / toUnit.factor;
    setConvertedValue(finalVal);
  }, [inputValue, fromUnitIdx, toUnitIdx, categoryIdx]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Unit Converter</h3>
        <p className="text-xs text-zinc-500 mt-1">Convert various metrics flawlessly offline.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        {unitCategories.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setCategoryIdx(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              categoryIdx === idx
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Group */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">From</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <select
            value={fromUnitIdx}
            onChange={(e) => setFromUnitIdx(Number(e.target.value))}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            {category.units.map((unit, idx) => (
              <option key={unit.name} value={idx}>{unit.name}</option>
            ))}
          </select>
        </div>

        {/* To Group */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">To</label>
          <div className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-100 dark:border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold min-h-[44px] flex items-center">
            {convertedValue !== null ? convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '---'}
          </div>
          <select
            value={toUnitIdx}
            onChange={(e) => setToUnitIdx(Number(e.target.value))}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            {category.units.map((unit, idx) => (
              <option key={unit.name} value={idx}>{unit.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. CURRENCY CONVERTER
   ========================================================================== */
const mockExchangeRates: Record<string, number> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 160.50,
  INR: 83.50,
  CAD: 1.36,
  AUD: 1.49,
};

function CurrencyConverterTool() {
  const [amount, setAmount] = useState('100');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');
  const [converted, setConverted] = useState<number | null>(null);

  useEffect(() => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      setConverted(null);
      return;
    }
    const fromRate = mockExchangeRates[fromCurr];
    const toRate = mockExchangeRates[toCurr];
    // Convert to USD base, then to target currency
    const inUSD = num / fromRate;
    setConverted(inUSD * toRate);
  }, [amount, fromCurr, toCurr]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Offline Currency Converter</h3>
        <p className="text-xs text-zinc-500 mt-1">Includes stable benchmark currency ratios for immediate offline estimation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <select
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            {Object.keys(mockExchangeRates).map((curr) => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Converted</label>
          <div className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-100 dark:border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold min-h-[44px] flex items-center">
            {converted !== null ? `${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurr}` : '---'}
          </div>
          <select
            value={toCurr}
            onChange={(e) => setToCurr(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            {Object.keys(mockExchangeRates).map((curr) => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
      </div>
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 block italic">
        Rates are mock index benchmarks: USD base (USD=1.00, EUR=0.92, GBP=0.78, INR=83.50).
      </span>
    </div>
  );
}

/* ==========================================================================
   3. DATE CALCULATOR
   ========================================================================== */
function DateCalculatorTool() {
  const [calcMode, setCalcMode] = useState<'diff' | 'add_sub'>('diff');
  
  // Difference Mode
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateDiffResult, setDateDiffResult] = useState<string | null>(null);

  // Add/Sub Mode
  const [baseDate, setBaseDate] = useState('');
  const [offsetValue, setOffsetValue] = useState('10');
  const [offsetUnit, setOffsetUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [offsetDirection, setOffsetDirection] = useState<'add' | 'subtract'>('add');
  const [offsetResult, setOffsetResult] = useState<string | null>(null);

  // Calc Diff
  useEffect(() => {
    if (calcMode !== 'diff' || !startDate || !endDate) {
      setDateDiffResult(null);
      return;
    }
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (isNaN(d1.getTime()) || !isFinite(d2.getTime())) {
      setDateDiffResult('Invalid Dates');
      return;
    }
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Detailed breakdown
    const years = Math.floor(diffDays / 365.25);
    const months = Math.floor((diffDays % 365.25) / 30.4375);
    const days = Math.floor((diffDays % 365.25) % 30.4375);

    setDateDiffResult(
      `${diffDays} Total Days (${years} years, ${months} months, ${days} days)`
    );
  }, [startDate, endDate, calcMode]);

  // Calc Offset
  useEffect(() => {
    if (calcMode !== 'add_sub' || !baseDate || !offsetValue) {
      setOffsetResult(null);
      return;
    }
    const date = new Date(baseDate);
    const offset = parseInt(offsetValue);
    if (isNaN(date.getTime()) || isNaN(offset)) {
      setOffsetResult('Invalid Input');
      return;
    }

    const multiplier = offsetDirection === 'add' ? 1 : -1;

    switch (offsetUnit) {
      case 'days':
        date.setDate(date.getDate() + offset * multiplier);
        break;
      case 'weeks':
        date.setDate(date.getDate() + offset * 7 * multiplier);
        break;
      case 'months':
        date.setMonth(date.getMonth() + offset * multiplier);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + offset * multiplier);
        break;
    }

    setOffsetResult(date.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, [baseDate, offsetValue, offsetUnit, offsetDirection, calcMode]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Date Calculator</h3>
        <p className="text-xs text-zinc-500 mt-1">Determine date intervals or offset dates easily.</p>
      </div>

      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start text-xs font-semibold">
        <button
          onClick={() => setCalcMode('diff')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            calcMode === 'diff' ? 'bg-white dark:bg-zinc-800 shadow text-zinc-800 dark:text-zinc-100' : 'text-zinc-500'
          }`}
        >
          Difference
        </button>
        <button
          onClick={() => setCalcMode('add_sub')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            calcMode === 'add_sub' ? 'bg-white dark:bg-zinc-800 shadow text-zinc-800 dark:text-zinc-100' : 'text-zinc-500'
          }`}
        >
          Add/Subtract
        </button>
      </div>

      {calcMode === 'diff' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {dateDiffResult && (
            <div className="md:col-span-2 mt-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              Difference: {dateDiffResult}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Base Date</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Operation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOffsetDirection('add')}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer ${
                    offsetDirection === 'add' ? 'bg-emerald-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Add (+)
                </button>
                <button
                  onClick={() => setOffsetDirection('subtract')}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer ${
                    offsetDirection === 'subtract' ? 'bg-emerald-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Subtract (-)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Offset Value</label>
              <input
                type="number"
                value={offsetValue}
                onChange={(e) => setOffsetValue(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Unit</label>
              <select
                value={offsetUnit}
                onChange={(e) => setOffsetUnit(e.target.value as any)}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {offsetResult && (
            <div className="mt-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              Target Date: {offsetResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   4. TIME CALCULATOR
   ========================================================================== */
function TimeCalculatorTool() {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [timeResult, setTimeResult] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime || !endTime) {
      setTimeResult(null);
      return;
    }
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Assume crosses midnight
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    setTimeResult(`${hours} Hours, ${minutes} Minutes (${diffMinutes} total minutes)`);
  }, [startTime, endTime]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Time Calculator</h3>
        <p className="text-xs text-zinc-500 mt-1">Determine hours and minutes difference between timestamps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        {timeResult && (
          <div className="md:col-span-2 mt-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            Duration: {timeResult}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. BMI CALCULATOR
   ========================================================================== */
function BmiCalculatorTool() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [bmiScore, setBmiScore] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [idealRange, setIdealRange] = useState('');

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (isNaN(w) || isNaN(h) || h === 0) {
      setBmiScore(null);
      return;
    }
    const score = w / (h * h);
    setBmiScore(score);

    if (score < 18.5) {
      setCategory('Underweight');
    } else if (score < 25) {
      setCategory('Normal Weight');
    } else if (score < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }

    // Healthy weight range for this height
    const minW = 18.5 * (h * h);
    const maxW = 24.9 * (h * h);
    setIdealRange(`${minW.toFixed(1)} kg - ${maxW.toFixed(1)} kg`);
  }, [weight, height]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">BMI Calculator</h3>
        <p className="text-xs text-zinc-500 mt-1">Calculate your Body Mass Index and healthy benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        {bmiScore !== null && (
          <div className="md:col-span-2 mt-2 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">BMI Score</span>
              <span className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {bmiScore.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Classification</span>
              <span className={`text-sm font-extrabold mt-1.5 ${
                category === 'Normal Weight' ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {category}
              </span>
            </div>
            <div className="flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Healthy Target Range</span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1.5">
                {idealRange}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   6. AGE CALCULATOR
   ========================================================================== */
function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState('');
  const [ageResult, setAgeResult] = useState<{
    years: number; months: number; days: number;
    totalMonths: number; totalWeeks: number; totalDays: number;
    totalHours: number; totalMinutes: number; totalSeconds: number;
    nextBirthday: { months: number; days: number };
  } | null>(null);

  useEffect(() => {
    if (!birthDate) {
      setAgeResult(null);
      return;
    }
    const dob = new Date(birthDate);
    const now = new Date();
    if (isNaN(dob.getTime()) || dob > now) {
      setAgeResult(null);
      return;
    }

    // Calculate exact difference
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      // Get remaining days of previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Totals
    const msDiff = now.getTime() - dob.getTime();
    const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Next Birthday countdown
    const nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < now) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const bdayMsDiff = nextBday.getTime() - now.getTime();
    const bdayDaysDiff = Math.ceil(bdayMsDiff / (1000 * 60 * 60 * 24));
    const countdownMonths = Math.floor(bdayDaysDiff / 30.4375);
    const countdownDays = Math.floor(bdayDaysDiff % 30.4375);

    setAgeResult({
      years, months, days,
      totalMonths, totalWeeks, totalDays,
      totalHours, totalMinutes, totalSeconds,
      nextBirthday: { months: countdownMonths, days: countdownDays }
    });
  }, [birthDate]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Age Calculator</h3>
        <p className="text-xs text-zinc-500 mt-1">Get precise time structures of your age down to seconds.</p>
      </div>

      <div className="flex flex-col gap-1.5 mt-2 max-w-sm">
        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Date of Birth</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
        />
      </div>

      {ageResult && (
        <div className="flex flex-col gap-4 mt-2">
          {/* Main Age Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-center">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Current Age</span>
            <span className="text-2xl mt-1 block">
              {ageResult.years} Years, {ageResult.months} Months, {ageResult.days} Days
            </span>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Months', value: ageResult.totalMonths.toLocaleString() },
              { label: 'Total Weeks', value: ageResult.totalWeeks.toLocaleString() },
              { label: 'Total Days', value: ageResult.totalDays.toLocaleString() },
              { label: 'Total Hours', value: ageResult.totalHours.toLocaleString() },
              { label: 'Total Minutes', value: ageResult.totalMinutes.toLocaleString() },
              { label: 'Total Seconds', value: ageResult.totalSeconds.toLocaleString() }
            ].map((stat) => (
              <div key={stat.label} className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">{stat.label}</span>
                <span className="text-sm font-extrabold mt-1 block text-zinc-800 dark:text-zinc-100">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Next Birthday */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span>Next Birthday In:</span>
            <span className="font-bold text-zinc-950 dark:text-zinc-50">
              {ageResult.nextBirthday.months} months, {ageResult.nextBirthday.days} days
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   7. PERCENTAGE CALCULATOR
   ========================================================================== */
function PercentageCalculatorTool() {
  // Scenario 1: X% of Y
  const [x1, setX1] = useState('15');
  const [y1, setY1] = useState('200');
  const [res1, setRes1] = useState<number | null>(null);

  // Scenario 2: X is what % of Y
  const [x2, setX2] = useState('30');
  const [y2, setY2] = useState('120');
  const [res2, setRes2] = useState<number | null>(null);

  // Scenario 3: Change from X to Y
  const [x3, setX3] = useState('50');
  const [y3, setY3] = useState('75');
  const [res3, setRes3] = useState<number | null>(null);

  useEffect(() => {
    const xv = parseFloat(x1);
    const yv = parseFloat(y1);
    if (isNaN(xv) || isNaN(yv)) setRes1(null);
    else setRes1((xv / 100) * yv);
  }, [x1, y1]);

  useEffect(() => {
    const xv = parseFloat(x2);
    const yv = parseFloat(y2);
    if (isNaN(xv) || isNaN(yv) || yv === 0) setRes2(null);
    else setRes2((xv / yv) * 100);
  }, [x2, y2]);

  useEffect(() => {
    const xv = parseFloat(x3);
    const yv = parseFloat(y3);
    if (isNaN(xv) || isNaN(yv) || xv === 0) setRes3(null);
    else setRes3(((yv - xv) / xv) * 100);
  }, [x3, y3]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Percentage Calculator</h3>
        <p className="text-xs text-zinc-500 mt-1">Quick percentage presets for relative and incremental calculations.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Scenario 1 */}
        <div className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">What is</span>
          <input
            type="number"
            value={x1}
            onChange={(e) => setX1(e.target.value)}
            className="w-20 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">% of</span>
          <input
            type="number"
            value={y1}
            onChange={(e) => setY1(e.target.value)}
            className="w-24 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">?</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Result:</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {res1 !== null ? res1.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '---'}
            </span>
          </div>
        </div>

        {/* Scenario 2 */}
        <div className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10">
          <input
            type="number"
            value={x2}
            onChange={(e) => setX2(e.target.value)}
            className="w-20 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">is what % of</span>
          <input
            type="number"
            value={y2}
            onChange={(e) => setY2(e.target.value)}
            className="w-24 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">?</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Result:</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {res2 !== null ? `${res2.toLocaleString(undefined, { maximumFractionDigits: 4 })}%` : '---'}
            </span>
          </div>
        </div>

        {/* Scenario 3 */}
        <div className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">Change from</span>
          <input
            type="number"
            value={x3}
            onChange={(e) => setX3(e.target.value)}
            className="w-20 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">to</span>
          <input
            type="number"
            value={y3}
            onChange={(e) => setY3(e.target.value)}
            className="w-24 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">is:</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Result:</span>
            <span className={`text-sm font-bold ${res3 !== null && res3 >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {res3 !== null ? `${res3 >= 0 ? '+' : ''}${res3.toLocaleString(undefined, { maximumFractionDigits: 4 })}%` : '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   8. RANDOMIZER & PRIME CHECKER
   ========================================================================== */
function RandomPrimeTool() {
  const [toolMode, setToolMode] = useState<'random' | 'prime'>('random');

  // Random state
  const [minVal, setMinVal] = useState('1');
  const [maxVal, setMaxVal] = useState('100');
  const [randomVal, setRandomVal] = useState<number | null>(null);

  // Prime state
  const [primeInput, setPrimeInput] = useState('29');
  const [primeResult, setPrimeResult] = useState<{
    isPrime: boolean;
    factors: number[];
  } | null>(null);

  const generateRandom = () => {
    const min = Math.ceil(Number(minVal));
    const max = Math.floor(Number(maxVal));
    if (isNaN(min) || isNaN(max) || min >= max) return;
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomVal(r);
  };

  const checkPrime = () => {
    const n = parseInt(primeInput);
    if (isNaN(n) || n < 1) {
      setPrimeResult(null);
      return;
    }
    
    if (n === 1) {
      setPrimeResult({ isPrime: false, factors: [1] });
      return;
    }

    // Direct prime trial division
    const factors: number[] = [];
    let d = 2;
    let temp = n;
    while (temp > 1) {
      while (temp % d === 0) {
        factors.push(d);
        temp /= d;
      }
      d++;
      if (d * d > temp) {
        if (temp > 1) {
          factors.push(temp);
          break;
        }
      }
    }

    const isPrime = factors.length === 1 && factors[0] === n;
    setPrimeResult({ isPrime, factors });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Primes & Random Values</h3>
        <p className="text-xs text-zinc-500 mt-1">High speed checking of number primality and factor matrices, or security integers.</p>
      </div>

      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start text-xs font-semibold">
        <button
          onClick={() => setToolMode('random')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            toolMode === 'random' ? 'bg-white dark:bg-zinc-800 shadow text-zinc-800 dark:text-zinc-100' : 'text-zinc-500'
          }`}
        >
          Random Generator
        </button>
        <button
          onClick={() => setToolMode('prime')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            toolMode === 'prime' ? 'bg-white dark:bg-zinc-800 shadow text-zinc-800 dark:text-zinc-100' : 'text-zinc-500'
          }`}
        >
          Prime Checker
        </button>
      </div>

      {toolMode === 'random' ? (
        <div className="flex flex-col gap-4 mt-2 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Min</label>
              <input
                type="number"
                value={minVal}
                onChange={(e) => setMinVal(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none text-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Max</label>
              <input
                type="number"
                value={maxVal}
                onChange={(e) => setMaxVal(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none text-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            onClick={generateRandom}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer hover:bg-emerald-600 shadow-md shadow-emerald-500/10"
          >
            Generate Random Integer
          </button>

          {randomVal !== null && (
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-center font-mono font-extrabold text-2xl text-emerald-600 dark:text-emerald-400">
              {randomVal}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2 max-w-md">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-zinc-400">Integer Value</label>
            <input
              type="number"
              value={primeInput}
              onChange={(e) => setPrimeInput(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none text-zinc-800 dark:text-zinc-100"
            />
          </div>

          <button
            onClick={checkPrime}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer hover:bg-emerald-600 shadow-md shadow-emerald-500/10"
          >
            Analyze Primality
          </button>

          {primeResult && (
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Result:</span>
                <span className={`font-bold ${primeResult.isPrime ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {primeResult.isPrime ? 'Prime Number!' : 'Composite Number'}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Prime Factorization</span>
                <span className="font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {primeResult.factors.join(' × ')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   9. STATISTICS MODE
   ========================================================================== */
function StatisticsTool() {
  const [listInput, setListInput] = useState('10, 15, 23, 11, 45, 30, 23, 19, 32');
  const [stats, setStats] = useState<{
    count: number;
    sum: number;
    mean: number;
    median: number;
    min: number;
    max: number;
    range: number;
    variance: number;
    stdDev: number;
  } | null>(null);

  const calculateStats = () => {
    const items = listInput
      .split(',')
      .map((x) => parseFloat(x.trim()))
      .filter((x) => !isNaN(x));

    if (items.length === 0) {
      setStats(null);
      return;
    }

    const count = items.length;
    const sum = items.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    // Median
    const sorted = [...items].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;

    // Variance & StdDev
    const sqDiffs = items.map((x) => Math.pow(x - mean, 2));
    const sqDiffSum = sqDiffs.reduce((a, b) => a + b, 0);
    // Population variance
    const variance = sqDiffSum / count;
    const stdDev = Math.sqrt(variance);

    setStats({
      count, sum, mean, median, min, max, range, variance, stdDev
    });
  };

  useEffect(() => {
    calculateStats();
  }, [listInput]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Statistics Calculator</h3>
        <p className="text-xs text-zinc-500 mt-1">Submit comma-separated numbers to run complete static summaries.</p>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <label className="text-[10px] uppercase font-bold text-zinc-400">Dataset (comma-separated)</label>
        <textarea
          rows={2}
          value={listInput}
          onChange={(e) => setListInput(e.target.value)}
          className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none text-zinc-800 dark:text-zinc-100"
          placeholder="e.g. 12, 15, 18, 22, 10"
        />
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-2">
          {[
            { label: 'Sample Count (n)', value: stats.count },
            { label: 'Sum (Σx)', value: stats.sum.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
            { label: 'Mean (μ)', value: stats.mean.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
            { label: 'Median (M)', value: stats.median.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
            { label: 'Min / Max', value: `${stats.min} / ${stats.max}` },
            { label: 'Range', value: stats.range },
            { label: 'Variance (σ²)', value: stats.variance.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
            { label: 'Standard Dev (σ)', value: stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 4 }) }
          ].map((item) => (
            <div key={item.label} className="p-3.5 border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{item.label}</span>
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100 mt-1.5 block">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   10. EQUATION SOLVER
   ========================================================================== */
function EquationSolverTool() {
  const [solverType, setSolverType] = useState<'linear' | 'quadratic' | 'system'>('quadratic');

  // Linear: ax + b = 0
  const [linA, setLinA] = useState('2');
  const [linB, setLinB] = useState('-8');
  const [linResult, setLinResult] = useState<string | null>(null);

  // Quadratic: ax² + bx + c = 0
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('-5');
  const [quadC, setQuadC] = useState('6');
  const [quadResult, setQuadResult] = useState<{
    roots: string;
    discriminant: number;
    vertex: string;
  } | null>(null);

  // 2x2 System: a1 x + b1 y = c1, a2 x + b2 y = c2
  const [sysA1, setSysA1] = useState('2');
  const [sysB1, setSysB1] = useState('1');
  const [sysC1, setSysC1] = useState('8');
  const [sysA2, setSysA2] = useState('1');
  const [sysB2, setSysB2] = useState('-3');
  const [sysC2, setSysC2] = useState('-3');
  const [sysResult, setSysResult] = useState<string | null>(null);

  // Solve Linear
  const solveLinear = () => {
    const a = parseFloat(linA);
    const b = parseFloat(linB);
    if (isNaN(a) || isNaN(b) || a === 0) {
      setLinResult('Invalid coefficient a. "a" cannot be 0.');
      return;
    }
    const x = -b / a;
    setLinResult(`x = ${x}`);
  };

  // Solve Quadratic
  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
      setQuadResult(null);
      return;
    }

    const disc = b * b - 4 * a * c;
    let rootsStr = '';
    const h = -b / (2 * a);
    const k = a * h * h + b * h + c;

    if (disc > 0) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a);
      const r2 = (-b - Math.sqrt(disc)) / (2 * a);
      rootsStr = `x₁ = ${r1.toFixed(5)}, x₂ = ${r2.toFixed(5)}`;
    } else if (disc === 0) {
      const r = -b / (2 * a);
      rootsStr = `x = ${r.toFixed(5)} (Double root)`;
    } else {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-disc) / (2 * a);
      rootsStr = `x₁ = ${real.toFixed(5)} + ${imag.toFixed(5)}i, x₂ = ${real.toFixed(5)} - ${imag.toFixed(5)}i`;
    }

    setQuadResult({
      roots: rootsStr,
      discriminant: disc,
      vertex: `V(${h.toFixed(4)}, ${k.toFixed(4)})`
    });
  };

  // Solve System
  const solveSystem = () => {
    const a1 = parseFloat(sysA1);
    const b1 = parseFloat(sysB1);
    const c1 = parseFloat(sysC1);
    const a2 = parseFloat(sysA2);
    const b2 = parseFloat(sysB2);
    const c2 = parseFloat(sysC2);

    if (isNaN(a1) || isNaN(b1) || isNaN(c1) || isNaN(a2) || isNaN(b2) || isNaN(c2)) {
      setSysResult(null);
      return;
    }

    // Cramer's rule
    const D = a1 * b2 - b1 * a2;
    if (D === 0) {
      setSysResult('System has infinite or no solutions (Determinant is 0)');
      return;
    }

    const Dx = c1 * b2 - b1 * c2;
    const Dy = a1 * c2 - c1 * a2;

    const x = Dx / D;
    const y = Dy / D;

    setSysResult(`x = ${x.toFixed(5)}, y = ${y.toFixed(5)}`);
  };

  useEffect(() => {
    if (solverType === 'linear') solveLinear();
    else if (solverType === 'quadratic') solveQuadratic();
    else if (solverType === 'system') solveSystem();
  }, [linA, linB, quadA, quadB, quadC, sysA1, sysB1, sysC1, sysA2, sysB2, sysC2, solverType]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Equation Solver</h3>
        <p className="text-xs text-zinc-500 mt-1">Interactive step solutions for algebraic equations.</p>
      </div>

      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start text-xs font-semibold">
        {['linear', 'quadratic', 'system'].map((type) => (
          <button
            key={type}
            onClick={() => setSolverType(type as any)}
            className={`px-3 py-1.5 rounded-lg cursor-pointer capitalize ${
              solverType === type ? 'bg-white dark:bg-zinc-800 shadow text-zinc-800 dark:text-zinc-100' : 'text-zinc-500'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {solverType === 'linear' && (
        <div className="flex flex-col gap-4 mt-2 max-w-sm">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Solve: ax + b = 0
          </span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={linA}
              onChange={(e) => setLinA(e.target.value)}
              placeholder="a"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={linB}
              onChange={(e) => setLinB(e.target.value)}
              placeholder="b"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          {linResult && (
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
              Solution: {linResult}
            </div>
          )}
        </div>
      )}

      {solverType === 'quadratic' && (
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Solve: ax² + bx + c = 0
          </span>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={quadA}
              onChange={(e) => setQuadA(e.target.value)}
              placeholder="a"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={quadB}
              onChange={(e) => setQuadB(e.target.value)}
              placeholder="b"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={quadC}
              onChange={(e) => setQuadC(e.target.value)}
              placeholder="c"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          {quadResult && (
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col gap-2 font-semibold">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Discriminant (Δ):</span>
                <span className="font-bold">{quadResult.discriminant}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Parabola Vertex (V):</span>
                <span className="font-bold">{quadResult.vertex}</span>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                Roots: {quadResult.roots}
              </div>
            </div>
          )}
        </div>
      )}

      {solverType === 'system' && (
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Solve: a₁x + b₁y = c₁ & a₂x + b₂y = c₂
          </span>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={sysA1}
              onChange={(e) => setSysA1(e.target.value)}
              placeholder="a1"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={sysB1}
              onChange={(e) => setSysB1(e.target.value)}
              placeholder="b1"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={sysC1}
              onChange={(e) => setSysC1(e.target.value)}
              placeholder="c1"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={sysA2}
              onChange={(e) => setSysA2(e.target.value)}
              placeholder="a2"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={sysB2}
              onChange={(e) => setSysB2(e.target.value)}
              placeholder="b2"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
            <input
              type="number"
              value={sysC2}
              onChange={(e) => setSysC2(e.target.value)}
              placeholder="c2"
              className="px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          {sysResult && (
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
              Solutions: {sysResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   11. DYNAMIC GRAPH PLOTTER
   ========================================================================== */
function FunctionGrapherTool() {
  const [expr, setExpr] = useState('x^2 - 3');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset dimensions based on client bounds
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Background
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#09090b' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Plot parameters
    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    // Conversion helper: Math coordinate -> Canvas coordinate
    const toCanvasX = (mx: number) => ((mx - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (my: number) => height - ((my - yMin) / (yMax - yMin)) * height;

    // Draw Grid lines
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#27272a' : '#e4e4e7';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#a1a1aa';

    // Vertical grid
    for (let x = xMin; x <= xMax; x++) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      if (x !== 0) ctx.fillText(x.toString(), cx + 2, toCanvasY(0) - 2);
    }

    // Horizontal grid
    for (let y = yMin; y <= yMax; y++) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      if (y !== 0) ctx.fillText(y.toString(), toCanvasX(0) + 4, cy - 2);
    }

    // Draw main axes
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#71717a' : '#71717a';
    ctx.lineWidth = 2;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // Draw curve
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const pointsCount = width * 1.5;
    let started = false;

    for (let i = 0; i <= pointsCount; i++) {
      const mx = xMin + (i / pointsCount) * (xMax - xMin);
      
      // Try evaluating expression at X
      const res = evaluateExpression(expr, 'RAD', 0, 0);
      // Wait, let's substitute 'x' manually or pass 'x' in scope!
      let my = 0;
      try {
        const cleanExpr = expr.replace(/x/g, `(${mx})`);
        const evaluated = evaluateExpression(cleanExpr, 'RAD', 0, 0);
        if (evaluated.success) {
          my = evaluated.numericValue;
        } else {
          continue;
        }
      } catch {
        continue;
      }

      if (isNaN(my) || !isFinite(my)) {
        started = false;
        continue;
      }

      const cx = toCanvasX(mx);
      const cy = toCanvasY(my);

      if (cy >= 0 && cy <= height) {
        if (!started) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
  };

  useEffect(() => {
    drawGraph();
    window.addEventListener('resize', drawGraph);
    return () => window.removeEventListener('resize', drawGraph);
  }, [expr]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Live Function Grapher</h3>
        <p className="text-xs text-zinc-500 mt-1">Interactively plot math curves using variables. Enter variable as "x".</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 font-bold font-mono text-xs flex items-center text-zinc-600 dark:text-zinc-400">
            y = 
          </span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="w-full px-4 py-2 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none text-zinc-800 dark:text-zinc-100 font-mono"
            placeholder="e.g. x^2 - 3"
          />
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 min-h-[220px] bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
