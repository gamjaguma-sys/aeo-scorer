export interface Suggestion {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CategoryScore {
  id: string;
  label: string;
  score: number;      // 0–1 (raw sub-score)
  weight: number;     // max points for this category
  earned: number;     // weight * score
  suggestions: Suggestion[];
}

export interface ScoreResult {
  total: number;           // 0–100 final score
  base: number;            // weighted sum before bonus/penalty
  bonus: number;
  penalty: number;
  grade: 'excellent' | 'good' | 'average' | 'poor';
  categories: CategoryScore[];
}

export interface AnalysisInput {
  content: string;
  keyword?: string;
}
