export type ThemeType = 'classic-black' | 'dark-amoled' | 'modern-blue' | 'white-professional';

export type AngleModeType = 'DEG' | 'RAD' | 'GRAD';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface UnitCategory {
  name: string;
  units: { name: string; value: number }[]; // conversion factors relative to a base unit
}

export interface Formula {
  name: string;
  equation: string;
  description: string;
  variables: { symbol: string; meaning: string }[];
}

export interface FormulaCategory {
  category: string;
  formulas: Formula[];
}
