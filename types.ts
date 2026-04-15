export interface Color {
  hex: string;
  name: string;
  usage: string;
}

export interface TypographySuggestion {
  family: string;
  type: 'Serif' | 'Sans-serif' | 'Display' | 'Monospace' | 'Handwriting';
  usage: 'Heading' | 'Body' | 'Accent';
  description: string;
}

export interface LayoutTip {
  title: string;
  description: string;
}

export interface VisualConcept {
  title: string;
  description: string;
  prompt: string;
}

export interface DesignSystem {
  themeName: string;
  vibeDescription: string;
  colors: Color[];
  typography: TypographySuggestion[];
  layoutTips: LayoutTip[];
  visualConcepts: VisualConcept[]; // Replaces single visualPrompt
}

export interface DesignState {
  isLoading: boolean;
  error: string | null;
  data: DesignSystem | null;
  generatedImageUrls: string[]; // Replaces single generatedImageUrl
}