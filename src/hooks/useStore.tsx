import {create} from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  matchId: string;
  marketId: string;
  addedAt: string;
  teams: {
    home: { id: string; name: string; };
    away: { id: string; name: string; };
  };
  market: {
    description: string;
    profitPercentage: number;
    outcomes: Array<{
      description: string;
      odds: number;
      stakePercentage: number;
    }>;
  };
}

interface UpcomingMatch {
  id: string | number;
  homeTeam: {
    name: string;
    position: number;
    logo: string;
    avgHomeGoals?: number;
    avgTotalGoals: number;
    form: string;
    cleanSheets: number;
    homeForm?: string;
    awayForm?: string;
    homeCleanSheets?: number;
    awayCleanSheets?: number;
    scoringFirstWinRate?: number;
    concedingFirstWinRate?: number;
    firstHalfGoalsPercent?: number;
    secondHalfGoalsPercent?: number;
    avgCorners?: number;
    bttsRate?: number;
    homeBttsRate?: number;
    awayBttsRate?: number;
    lateGoalRate?: number;
    goalDistribution?: {
      '0-15': number;
      '16-30': number;
      '31-45': number;
      '46-60': number;
      '61-75': number;
      '76-90': number;
    };
    againstTopTeamsPoints?: number;
    againstMidTeamsPoints?: number;
    againstBottomTeamsPoints?: number;
    homeMatchesOver15?: number;
    awayMatchesOver15?: number;
    totalHomeMatches?: number;
    totalAwayMatches?: number;
  };
  awayTeam: {
    name: string;
    position: number;
    logo: string;
    avgAwayGoals?: number;
    avgTotalGoals: number;
    form: string;
    cleanSheets: number;
    homeForm?: string;
    awayForm?: string;
    homeCleanSheets?: number;
    awayCleanSheets?: number;
    scoringFirstWinRate?: number;
    concedingFirstWinRate?: number;
    firstHalfGoalsPercent?: number;
    secondHalfGoalsPercent?: number;
    avgCorners?: number;
    bttsRate?: number;
    homeBttsRate?: number;
    awayBttsRate?: number;
    lateGoalRate?: number;
    goalDistribution?: {
      '0-15': number;
      '16-30': number;
      '31-45': number;
      '46-60': number;
      '61-75': number;
      '76-90': number;
    };
    againstTopTeamsPoints?: number;
    againstMidTeamsPoints?: number;
    againstBottomTeamsPoints?: number;
    homeMatchesOver15?: number;
    awayMatchesOver15?: number;
    totalHomeMatches?: number;
    totalAwayMatches?: number;
  };
  date: string;
  time: string;
  venue: string;
  positionGap: number;
  favorite: 'home' | 'away' | null;
  confidenceScore: number;
  averageGoals: number;
  expectedGoals: number;
  defensiveStrength: number;
  headToHead: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
  };
  reasonsForPrediction: string[];
  addedAt: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (matchId: string, marketId: string) => void;
  clearCart: () => void;

  upcomingMatches: UpcomingMatch[];
  addUpcomingMatch: (match: Omit<UpcomingMatch, 'addedAt'>) => void;
  removeUpcomingMatch: (matchId: string | number) => void;
  clearUpcomingMatches: () => void;
  isUpcomingMatchInCart: (matchId: string | number) => boolean;
  getUpcomingMatchesCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, addedAt: new Date().toISOString() },
          ],
        })),
      removeItem: (matchId, marketId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.matchId === matchId && item.marketId === marketId)
          ),
        })),
      clearCart: () => set(() => ({ items: [] })),

      upcomingMatches: [],
      addUpcomingMatch: (match) =>
        set((state) => ({
          upcomingMatches: [
            ...state.upcomingMatches,
            {
              ...match,
              addedAt: new Date().toISOString(),
            },
          ],
        })),
      removeUpcomingMatch: (matchId) =>
        set((state) => ({
          upcomingMatches: state.upcomingMatches.filter(
            (match) => match.id !== matchId
          ),
        })),
      clearUpcomingMatches: () => set(() => ({ upcomingMatches: [] })),
      isUpcomingMatchInCart: (matchId) => {
        return get().upcomingMatches.some((match) => match.id === matchId);
      },
      getUpcomingMatchesCount: () => get().upcomingMatches.length,
    }),
    {
      name: 'arbitrage-cart',
    }
  )
);