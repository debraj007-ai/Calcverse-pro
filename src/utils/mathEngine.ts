import { create, all } from 'mathjs';
import { AngleModeType } from '../types';

const math = create(all);

/**
 * Normalizes user-friendly expression symbols into standard mathjs formula syntax.
 */
export function preprocessExpression(expr: string): string {
  let cleaned = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/e/g, 'e')
    .replace(/sin⁻¹\(/g, 'asin(')
    .replace(/cos⁻¹\(/g, 'acos(')
    .replace(/tan⁻¹\(/g, 'atan(')
    .replace(/√\(/g, 'sqrt(')
    .replace(/∛\(/g, 'cbrt(')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁻¹/g, '^-1')
    // Handle permutations & combinations: e.g., 5 P 3 -> nPr(5, 3) and 5 C 3 -> nCr(5, 3)
    // Regex matches digit/constant, space, P or C, space, digit/constant
    // We can support decimals or simpler terms
    .replace(/([0-9.pi]+)\s*P\s*([0-9.pi]+)/g, 'nPr($1, $2)')
    .replace(/([0-9.pi]+)\s*C\s*([0-9.pi]+)/g, 'nCr($1, $2)');

  // Auto-close open parentheses
  let openCount = 0;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '(') openCount++;
    if (cleaned[i] === ')') openCount--;
  }
  while (openCount > 0) {
    cleaned += ')';
    openCount--;
  }

  return cleaned;
}

/**
 * Evaluates a preprocessed math string with custom contextual scope.
 */
export function evaluateExpression(
  expr: string,
  angleMode: AngleModeType,
  ans: number = 0,
  memory: number = 0
): { success: boolean; result: string; numericValue: number; errorType?: string } {
  try {
    const cleaned = preprocessExpression(expr);
    if (!cleaned.trim()) {
      return { success: true, result: '0', numericValue: 0 };
    }

    // Helper functions for our scope that adapt based on the selected angle mode.
    const toRadians = (val: number) => {
      if (angleMode === 'DEG') return val * (Math.PI / 180);
      if (angleMode === 'GRAD') return val * (Math.PI / 200);
      return val; // RAD
    };

    const fromRadians = (val: any): number => {
      if (typeof val === 'object' && val !== null && 'im' in val) {
        if (Math.abs(val.im) > 1e-12) {
          throw new Error('Math Error');
        }
        val = val.re;
      }
      const numVal = Number(val);
      if (isNaN(numVal)) throw new Error('Math Error');
      if (angleMode === 'DEG') return numVal * (180 / Math.PI);
      if (angleMode === 'GRAD') return numVal * (200 / Math.PI);
      return numVal; // RAD
    };

    // Scoped definitions to override standard trig behavior or add permutation/combination
    const scope = {
      sin: (x: any) => math.sin(toRadians(Number(x))),
      cos: (x: any) => math.cos(toRadians(Number(x))),
      tan: (x: any) => {
        const rad = toRadians(Number(x));
        // Avoid division by zero on asymptotes
        if (Math.abs(Math.cos(rad)) < 1e-15) {
          throw new Error('Divide by Zero');
        }
        return math.tan(rad);
      },
      asin: (x: any) => fromRadians(math.asin(Number(x))),
      acos: (x: any) => fromRadians(math.acos(Number(x))),
      atan: (x: any) => fromRadians(math.atan(Number(x))),
      sinh: (x: any) => math.sinh(Number(x)),
      cosh: (x: any) => math.cosh(Number(x)),
      tanh: (x: any) => math.tanh(Number(x)),
      nPr: (n: any, r: any) => {
        const num = Number(n);
        const rep = Number(r);
        if (num < 0 || rep < 0 || num < rep || !Number.isInteger(num) || !Number.isInteger(rep)) {
          throw new Error('Math Error');
        }
        return math.permutations(num, rep);
      },
      nCr: (n: any, r: any) => {
        const num = Number(n);
        const rep = Number(r);
        if (num < 0 || rep < 0 || num < rep || !Number.isInteger(num) || !Number.isInteger(rep)) {
          throw new Error('Math Error');
        }
        return math.combinations(num, rep);
      },
      Ans: ans,
      M: memory,
      // Overriding division to raise Division by Zero
      divide: (a: any, b: any) => {
        if (Number(b) === 0) throw new Error('Divide by Zero');
        return math.divide(a, b);
      },
    };

    // Evaluate
    let evaluated = math.evaluate(cleaned, scope);

    // If result is complex or object, format it appropriately
    if (typeof evaluated === 'object' && evaluated !== null) {
      if ('re' in evaluated && 'im' in evaluated) {
        // Complex number handling
        if (Math.abs(evaluated.im) < 1e-12) {
          evaluated = evaluated.re;
        } else {
          return { success: false, result: 'Math Error', numericValue: 0, errorType: 'Math Error' };
        }
      } else {
        evaluated = Number(evaluated);
      }
    }

    const numericVal = Number(evaluated);

    if (isNaN(numericVal)) {
      return { success: false, result: 'Math Error', numericValue: 0, errorType: 'Math Error' };
    }

    if (!isFinite(numericVal)) {
      if (numericVal === Infinity || numericVal === -Infinity) {
        return { success: false, result: 'Overflow', numericValue: Infinity, errorType: 'Overflow' };
      }
      return { success: false, result: 'Math Error', numericValue: 0, errorType: 'Math Error' };
    }

    // Format output as standard decimal (limited to 12 digits to match physical LCD constraint)
    const resultStr = formatResult(numericVal, 'decimal');

    return {
      success: true,
      result: resultStr,
      numericValue: numericVal,
    };
  } catch (err: any) {
    console.error('Calculation Error:', err);
    let errorMsg = 'Syntax Error';
    if (err.message && err.message.includes('Divide by Zero')) {
      errorMsg = 'Divide by Zero';
    } else if (err.message && (err.message.includes('undefined') || err.message.includes('Unexpected') || err.message.includes('Value expected'))) {
      errorMsg = 'Syntax Error';
    } else if (err.message && (err.message.includes('negative') || err.message.includes('out of range') || err.message.includes('Math Error'))) {
      errorMsg = 'Math Error';
    } else if (err.message && err.message.includes('Overflow')) {
      errorMsg = 'Overflow';
    }
    return {
      success: false,
      result: errorMsg,
      numericValue: 0,
      errorType: errorMsg,
    };
  }
}

/**
 * Formats a raw numeric value according to physical calculator constraints or special representation modes.
 */
export function formatResult(val: number, mode: 'decimal' | 'scientific' | 'engineering' | 'fraction'): string {
  if (val === 0) return '0';

  // Absolute check for overflows
  if (Math.abs(val) > 1e100) return 'Overflow';
  if (Math.abs(val) < 1e-99 && Math.abs(val) > 0) return '0';

  try {
    switch (mode) {
      case 'scientific':
        return math.format(val, { notation: 'exponential', precision: 8 });

      case 'engineering':
        return math.format(val, { notation: 'engineering', precision: 8 });

      case 'fraction': {
        const frac = math.fraction(val);
        // If the denominator is huge, standard fraction representation doesn't make sense (irrational)
        if (frac.d > 10000) {
          return formatResult(val, 'decimal');
        }
        return `${frac.s < 0 ? '-' : ''}${frac.n}/${frac.d}`;
      }

      case 'decimal':
      default: {
        // Under 1e12 and over 1e-6, use standard representation with clean rounding
        if (Math.abs(val) < 1e12 && Math.abs(val) >= 1e-6) {
          // Round to prevent floating point inaccuracies like 0.1 + 0.2 = 0.30000000000000004
          const rounded = parseFloat(val.toFixed(10));
          return rounded.toString();
        } else {
          // Use scientific display for very large or small numbers
          return math.format(val, { notation: 'exponential', precision: 6 });
        }
      }
    }
  } catch {
    return val.toString();
  }
}
