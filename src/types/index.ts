export interface Card {
  id: number;
  name: string;
  nameCn: string;
  meaning: string;
  reversedMeaning: string;
  element: string;
  zodiac: string;
  keywords: string[];
}

export interface SelectedCard {
  card: Card;
  isReversed: boolean;
  position: number;
  positionMeaning?: string; // 该位置的含义
}

export interface SpreadPosition {
  position: number;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  category: string;
  positions: SpreadPosition[];
}

export interface ReadingInput {
  selectedCards: SelectedCard[];
  userContext: string;
  spread?: Spread;
  orderId?: string;
}

export interface ReadingRecord {
  id: string;
  spread?: Spread;
  selectedCards: SelectedCard[];
  interpretation: string;
  userContext: string;
  uploadedImage?: string;
  createdAt: string;
  orderId?: string;
}

export type Phase = 'input' | 'reading';
export type ViewType = 'home' | 'login' | 'register' | 'history' | 'history-detail';
