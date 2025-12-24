
export enum League {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
  CHALLENGER = 'Challenger'
}

export enum CurrencyType {
  SF_COIN = 'SF Coin',
  SF_CRYSTAL = 'SF Crystal',
  EVENT_TOKEN = 'Event Token'
}

export interface Achievement {
  id: string;
  title: string;
  category: 'Creator' | 'Social' | 'Collaboration' | 'Resource' | 'Communication' | 'Growth';
  description: string;
  xpReward: number;
  unlocked: boolean;
  progress: number;
}

export interface WalletBalance {
  coins: number;
  crystals: number;
  tokens: number;
}

export interface EarningsState {
  pending: number;
  available: number;
  totalPaid: number;
  workPoints: number;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  league: League;
  reputation: number;
  visibilityScore: number;
}
