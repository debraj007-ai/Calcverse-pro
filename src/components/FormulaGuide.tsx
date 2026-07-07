import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Copy, Check, Calculator, BookOpen, Layers } from 'lucide-react';
import { FormulaCategory } from '../types';

const formulasDb: FormulaCategory[] = [
  {
    category: 'Algebra & Combinatorics',
    formulas: [
      {
        name: 'Quadratic Formula',
        equation: 'x = (-b ± √(b² - 4ac)) / 2a',
        description: 'Finds the roots of a quadratic equation ax² + bx + c = 0.',
        variables: [
          { symbol: 'a, b, c', meaning: 'Coefficients of the equation' },
          { symbol: 'x', meaning: 'Roots/solutions' }
        ]
      },
      {
        name: 'Permutations (nPr)',
        equation: 'nPr = n! / (n - r)!',
        description: 'Calculates the number of ways to arrange r items from a set of n items where order matters.',
        variables: [
          { symbol: 'n', meaning: 'Total number of items' },
          { symbol: 'r', meaning: 'Items to arrange' }
        ]
      },
      {
        name: 'Combinations (nCr)',
        equation: 'nCr = n! / (r! * (n - r)!)',
        description: 'Calculates the number of ways to choose r items from a set of n items where order does not matter.',
        variables: [
          { symbol: 'n', meaning: 'Total number of items' },
          { symbol: 'r', meaning: 'Items to choose' }
        ]
      },
      {
        name: 'Logarithm Product Rule',
        equation: 'log_b(xy) = log_b(x) + log_b(y)',
        description: 'The logarithm of a product is the sum of the logarithms of the factors.',
        variables: [
          { symbol: 'b', meaning: 'Base of the logarithm' },
          { symbol: 'x, y', meaning: 'Multiplied terms' }
        ]
      }
    ]
  },
  {
    category: 'Calculus',
    formulas: [
      {
        name: 'Derivative of x^n (Power Rule)',
        equation: 'd/dx(x^n) = n * x^(n - 1)',
        description: 'Finds the rate of change of any power of x.',
        variables: [
          { symbol: 'n', meaning: 'Any real number exponent' },
          { symbol: 'x', meaning: 'Independent variable' }
        ]
      },
      {
        name: 'Fundamental Theorem of Calculus',
        equation: '∫[a to b] f(x) dx = F(b) - F(a)',
        description: 'Relates differentiation and integration, letting you find area under curves.',
        variables: [
          { symbol: 'f(x)', meaning: 'Continuous function' },
          { symbol: 'F(x)', meaning: 'Antiderivative of f(x)' },
          { symbol: 'a, b', meaning: 'Integration limits' }
        ]
      },
      {
        name: 'Euler\'s Formula',
        equation: 'e^(iθ) = cos(θ) + i * sin(θ)',
        description: 'Establishes the fundamental relationship between trigonometric functions and complex exponential functions.',
        variables: [
          { symbol: 'e', meaning: 'Euler\'s constant (~2.718)' },
          { symbol: 'i', meaning: 'Imaginary unit (√-1)' },
          { symbol: 'θ', meaning: 'Angle in radians' }
        ]
      }
    ]
  },
  {
    category: 'Geometry & Trigonometry',
    formulas: [
      {
        name: 'Pythagorean Theorem',
        equation: 'a² + b² = c²',
        description: 'The square of the hypotenuse is equal to the sum of the squares of the other two sides in a right triangle.',
        variables: [
          { symbol: 'a, b', meaning: 'Sides of the right triangle' },
          { symbol: 'c', meaning: 'Hypotenuse' }
        ]
      },
      {
        name: 'Trigonometric Pythagorean Identity',
        equation: 'sin²(θ) + cos²(θ) = 1',
        description: 'Fundamental trigonometric identity that holds for any angle θ.',
        variables: [
          { symbol: 'θ', meaning: 'Angle in degrees/radians' }
        ]
      },
      {
        name: 'Law of Cosines',
        equation: 'c² = a² + b² - 2ab * cos(C)',
        description: 'Relates the lengths of the sides of a triangle to the cosine of one of its angles.',
        variables: [
          { symbol: 'a, b, c', meaning: 'Lengths of sides' },
          { symbol: 'C', meaning: 'Angle opposite to side c' }
        ]
      }
    ]
  },
  {
    category: 'Physics & Chemistry',
    formulas: [
      {
        name: 'Mass-Energy Equivalence',
        equation: 'E = m * c²',
        description: 'Albert Einstein\'s famous equation stating that mass and energy are equivalent and transmutable.',
        variables: [
          { symbol: 'E', meaning: 'Kinetic energy / rest energy' },
          { symbol: 'm', meaning: 'Relativistic mass' },
          { symbol: 'c', meaning: 'Speed of light (~3 * 10⁸ m/s)' }
        ]
      },
      {
        name: 'Planck\'s Relation',
        equation: 'E = h * f',
        description: 'Relates the energy of a photon to its electromagnetic frequency.',
        variables: [
          { symbol: 'E', meaning: 'Energy of photon' },
          { symbol: 'h', meaning: 'Planck\'s constant (~6.626 * 10⁻³⁴ J·s)' },
          { symbol: 'f', meaning: 'Frequency' }
        ]
      },
      {
        name: 'Ideal Gas Law',
        equation: 'P * V = n * R * T',
        description: 'The equation of state of a hypothetical ideal gas.',
        variables: [
          { symbol: 'P', meaning: 'Pressure of the gas' },
          { symbol: 'V', meaning: 'Volume of the gas' },
          { symbol: 'n', meaning: 'Amount of substance (moles)' },
          { symbol: 'R', meaning: 'Ideal gas constant (~8.314 J/(mol·K))' },
          { symbol: 'T', meaning: 'Absolute temperature in Kelvin' }
        ]
      }
    ]
  }
];

interface FormulaGuideProps {
  onInsertExpression: (expr: string) => void;
}

export default function FormulaGuide({ onInsertExpression }: FormulaGuideProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...formulasDb.map((cat) => cat.category)];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDb = formulasDb
    .map((cat) => {
      if (selectedCategory !== 'All' && cat.category !== selectedCategory) {
        return { category: cat.category, formulas: [] };
      }

      const matchingFormulas = cat.formulas.filter(
        (form) =>
          form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.equation.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return {
        category: cat.category,
        formulas: matchingFormulas
      };
    })
    .filter((cat) => cat.formulas.length > 0);

  return (
    <div className="w-full flex flex-col gap-6" id="formula-guide-tab">
      {/* Search and Category Filtering */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search formulas, symbols, concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-800 dark:text-zinc-100"
            id="formula-search"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Formulas */}
      {filteredDb.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No formulas found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filteredDb.map((cat) => (
            <div key={cat.category} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  {cat.category}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.formulas.map((form) => {
                  const uniqueId = `${cat.category}-${form.name}`;
                  return (
                    <motion.div
                      layout
                      key={form.name}
                      className="group relative flex flex-col justify-between p-5 rounded-2xl transition-all shadow-sm hover:shadow-md liquid-glass-panel border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-zinc-900/60"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-base">
                            {form.name}
                          </h4>
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(form.equation, uniqueId)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
                              title="Copy formula text"
                            >
                              {copiedId === uniqueId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => onInsertExpression(form.equation)}
                              className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-all cursor-pointer"
                              title="Insert into Calculator"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                          {form.description}
                        </p>

                        <div className="my-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-emerald-600 dark:text-emerald-400 text-sm font-semibold select-all text-center border border-zinc-100 dark:border-zinc-900">
                          {form.equation}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                          Variable Meanings
                        </span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {form.variables.map((v) => (
                            <span key={v.symbol} className="text-xs text-zinc-600 dark:text-zinc-400">
                              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 mr-1.5 font-semibold font-mono">
                                {v.symbol}
                              </code>
                              {v.meaning}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
