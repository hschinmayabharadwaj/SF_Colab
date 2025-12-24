
import React from 'react';

export const PRD_CONTENT = `
# SF Ecosystem – Product Requirements Document (PRD)

## 1. Vision
XP = trust, Earnings = real payouts, Coins = utility. 

## 2. Merit Model
Visibility = XP × Recency × Reputation × Context.

## 3. Economy
- SF Coins (Earned)
- SF Crystals (Premium)
- Work Points (WP) for payout ratios.

## 4. Subscriptions
- Contributor Plus: $9.99/mo
- Founder Plus: $19.99/mo
- Equity Track: $39.99 + commitment.
`;

export const LEAGUE_CONFIG = [
  { 
    name: 'Bronze', 
    minXp: 0, 
    color: '#cd7f32', 
    perks: ['Standard Payouts', 'Basic Visibility'],
    catalogRewards: [
      { id: 'b1', title: 'Community Citizen Badge', icon: '🔰', description: 'Verified status in the global directory.' }
    ]
  },
  { 
    name: 'Silver', 
    minXp: 2500, 
    color: '#c0c0c0', 
    perks: ['+5% Coin Bonus', 'Community Voting'],
    catalogRewards: [
      { id: 's1', title: 'Silver Frame', icon: '🖼️', description: 'A sleek silver border for your profile avatar.' },
      { id: 's2', title: 'Voting Power (1.0x)', icon: '🗳️', description: 'Participate in minor ecosystem polls.' }
    ]
  },
  { 
    name: 'Gold', 
    minXp: 7500, 
    color: '#ffd700', 
    perks: ['+10% Coin Bonus', 'Exclusive Avatar Frame', 'Priority Chat'],
    catalogRewards: [
      { id: 'g1', title: 'Aura of Merit', icon: '✨', description: 'Subtle golden glow effect on profile hover.' },
      { id: 'g2', title: 'Early Pool Access', icon: '🔑', description: 'Claim earnings 12h before lower tiers.' }
    ]
  },
  { 
    name: 'Platinum', 
    minXp: 15000, 
    color: '#e5e4e2', 
    perks: ['+15% Coin Bonus', '1.5x Visibility Multiplier', 'Beta Testing Access'],
    catalogRewards: [
      { id: 'p1', title: 'Protocol Lab Pass', icon: '🧪', description: 'Access to experimental V2 feature staging.' },
      { id: 'p2', title: 'Visibility Surge', icon: '📡', description: '1.5x multiplier on search grounding results.' }
    ]
  },
  { 
    name: 'Diamond', 
    minXp: 30000, 
    color: '#b9f2ff', 
    perks: ['+25% Coin Bonus', 'Governance Participation', 'Direct Support Line'],
    catalogRewards: [
      { id: 'd1', title: 'Diamond Sigil', icon: '💠', description: 'Unique cryptographic identity badge.' },
      { id: 'd2', title: 'Ecosystem Council Seat', icon: '🏛️', description: 'Priority voting on seasonal budget splits.' }
    ]
  },
  { 
    name: 'Challenger', 
    minXp: 50000, 
    color: '#ff4d4d', 
    perks: ['+40% Coin Bonus', 'Protocol Governance Weighting', 'Quarterly Revenue Share'],
    catalogRewards: [
      { id: 'c1', title: 'Crown of Authority', icon: '👑', description: 'The ultimate visual marker of contribution.' },
      { id: 'c2', title: 'Revenue Share Tier', icon: '📈', description: 'Direct participation in platform surplus pools.' }
    ]
  }
];

export const INITIAL_PROFILE = {
  name: "Alex Rivera",
  level: 42,
  xp: 8450,
  xpToNextLevel: 10000,
  league: "Gold",
  reputation: 0.95,
  visibilityScore: 780
};

export const INITIAL_ACHIEVEMENTS = [
  { id: '1', title: 'First Collaboration', category: 'Collaboration', description: 'Complete your first joint task.', xpReward: 500, unlocked: true, progress: 100 },
  { id: '2', title: 'Top Creator', category: 'Creator', description: 'Upload 10 high-quality resources.', xpReward: 2000, unlocked: false, progress: 60 },
  { id: '3', title: 'Social Butterfly', category: 'Social', description: 'Connect with 50 unique collaborators.', xpReward: 1500, unlocked: false, progress: 30 },
  { id: '4', title: 'Growth Engine', category: 'Growth', description: 'Maintain a 30-day active streak.', xpReward: 3000, unlocked: false, progress: 85 }
];
