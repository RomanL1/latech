export interface LatexSymbol {
  symbol: string;
  latexSymbol: string;
  altText: string;
}

export const operators: LatexSymbol[] = [
  { symbol: '±', latexSymbol: '\\pm', altText: 'Plus or minus' },
  { symbol: '∓', latexSymbol: '\\mp', altText: 'Minus or plus' },
  { symbol: '×', latexSymbol: '\\times', altText: 'Multiplication' },
  { symbol: '÷', latexSymbol: '\\div', altText: 'Division' },
  { symbol: '⋅', latexSymbol: '\\cdot', altText: 'Dot multiplication' },
  { symbol: '∗', latexSymbol: '\\ast', altText: 'Asterisk' },
  { symbol: '∘', latexSymbol: '\\circ', altText: 'Function composition' },
  { symbol: '√', latexSymbol: '\\sqrt{}', altText: 'Square root' },
  { symbol: '∑', latexSymbol: '\\sum^{}_{}', altText: 'Sum' },
  { symbol: '∏', latexSymbol: '\\prod^{}_{}', altText: 'Product' },
];

export const relations: LatexSymbol[] = [
  { symbol: '≠', latexSymbol: '\\ne', altText: 'Not equal' },
  { symbol: '≈', latexSymbol: '\\approx', altText: 'Approximately equal' },
  { symbol: '∼', latexSymbol: '\\sim', altText: 'Similar' },
  { symbol: '≃', latexSymbol: '\\simeq', altText: 'Similar or approximately equal' },
  { symbol: '≥', latexSymbol: '\\geq', altText: 'Greater than or equal' },
  { symbol: '≤', latexSymbol: '\\leq', altText: 'Less than or equal' },
  { symbol: '≡', latexSymbol: '\\equiv', altText: 'Equivalent' },
];

export const arrows: LatexSymbol[] = [
  { symbol: '→', latexSymbol: '\\rightarrow', altText: 'Right arrow' },
  { symbol: '←', latexSymbol: '\\leftarrow', altText: 'Left arrow' },
  { symbol: '↓', latexSymbol: '\\downarrow', altText: 'Down arrow' },
  { symbol: '↑', latexSymbol: '\\uparrow', altText: 'Up arrow' },
  { symbol: '↔', latexSymbol: '\\leftrightarrow', altText: 'Two-way arrow' },
  { symbol: '⇒', latexSymbol: '\\Rightarrow', altText: 'Implies' },
  { symbol: '⇐', latexSymbol: '\\Leftarrow', altText: 'Implied by' },
  { symbol: '⇔', latexSymbol: '\\Leftrightarrow', altText: 'If and only if' },
  { symbol: '↦', latexSymbol: '\\mapsto', altText: 'Maps to' },
];

export const setTheory: LatexSymbol[] = [
  { symbol: '∈', latexSymbol: '\\in', altText: 'Element of' },
  { symbol: '∉', latexSymbol: '\\notin', altText: 'Not element of' },
  { symbol: '⊂', latexSymbol: '\\subset', altText: 'Subset' },
  { symbol: '⊆', latexSymbol: '\\subseteq', altText: 'Subset or equal' },
  { symbol: '⊄', latexSymbol: '\\not\\subset', altText: 'Not a subset' },
  { symbol: '⊃', latexSymbol: '\\supset', altText: 'Superset' },
  { symbol: '⊇', latexSymbol: '\\supseteq', altText: 'Superset or equal' },
  { symbol: '∪', latexSymbol: '\\cup', altText: 'Union' },
  { symbol: '∩', latexSymbol: '\\cap', altText: 'Intersection' },
  { symbol: '∅', latexSymbol: '\\emptyset', altText: 'Empty set' },
];

export const logic: LatexSymbol[] = [
  { symbol: '¬', latexSymbol: '\\neq', altText: 'Not' },
  { symbol: '∧', latexSymbol: '\\land', altText: 'And' },
  { symbol: '∨', latexSymbol: '\\lor', altText: 'Or' },
  { symbol: '∀', latexSymbol: '\\forall', altText: 'For all' },
  { symbol: '∃', latexSymbol: '\\exists', altText: 'Exists' },
  { symbol: '∄', latexSymbol: '\\nexists', altText: 'Not exists' },
  { symbol: '⊨', latexSymbol: '\\models', altText: 'Models / semantically entails' },
];

export const calculusAnalysis: LatexSymbol[] = [
  { symbol: '∞', latexSymbol: '\\infty', altText: 'Infinity' },
  { symbol: '∂', latexSymbol: '\\partial', altText: 'Partial derivative' },
  { symbol: '∇', latexSymbol: '\\nabla', altText: 'Gradient' },
  { symbol: '∫', latexSymbol: '\\int_{a}^{b}', altText: 'Integral' },
  { symbol: '∬', latexSymbol: '\\iint', altText: 'Double integral' },
  { symbol: '∭', latexSymbol: '\\iiint', altText: 'Triple integral' },
  { symbol: '∮', latexSymbol: '\\oint', altText: 'Contour integral' },
  { symbol: 'lim', latexSymbol: '\\lim_{x\\to\\infty}', altText: 'Limit' },
];
