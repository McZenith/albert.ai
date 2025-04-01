import { create } from 'zustand';
import { normalizeTeamName, getTeamNameSimilarity } from '@/utils/teamUtils';

interface CartItem {
  matchId: string;
  marketId: string;
  teams: {
    home: { id: string; name: string };
    away: { id: string; name: string };
  };
  market: {
    id: string;
    description: string;
    profitPercentage: number;
    outcomes: Array<{
      id: string;
      description: string;
      odds: number;
      stakePercentage: number;
    }>;
  };
  addedAt: string;
}

export type UpcomingMatch = {
  id: string | number;
  date: string;
  time: string;
  venue: string;
  homeTeam: {
    id: string;
    name: string;
    position: number;
    form: string;
    homeForm?: string;
    avgHomeGoals?: number;
    cleanSheets?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    position: number;
    form: string;
    awayForm?: string;
    avgAwayGoals?: number;
    cleanSheets?: number;
  };
  positionGap: number;
  expectedGoals: number;
  averageGoals?: number;
  defensiveStrength?: number;
  favorite: string | null;
  confidenceScore: number;
  leaguePosition?: number;
  reasonsForPrediction?: string[];
  headToHead?: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
  };
};

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (matchId: string, marketId: string) => void;
  clearCart: () => void;
  upcomingMatches: UpcomingMatch[];
  addUpcomingMatch: (match: UpcomingMatch) => void;
  removeUpcomingMatch: (matchId: string | number) => void;
  clearUpcomingMatches: () => void;
  isUpcomingMatchInCart: (matchId: string | number) => boolean;
  getUpcomingMatchesCount: () => number;
  predictionData: UpcomingMatch[];
  isPredictionDataLoading: boolean;
  isPredictionDataLoaded: boolean;
  predictionDataError: Error | null;
  loadPredictionData: () => Promise<void>;
  findPredictionForMatch: (
    homeTeam: string,
    awayTeam: string,
    matchId?: string
  ) => UpcomingMatch | null;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  upcomingMatches: [],
  predictionData: [],
  isPredictionDataLoading: false,
  isPredictionDataLoaded: false,
  predictionDataError: null,

  loadPredictionData: async () => {
    if (get().isPredictionDataLoaded && get().predictionData.length > 0) {
      return;
    }

    set({ isPredictionDataLoading: true });
    try {
      const response = await fetch('/api/prediction-data');
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();

      const upcomingMatches =
        data?.data?.upcomingMatches || data?.upcomingMatches || [];

      if (upcomingMatches.length === 0) {
        set({
          predictionData: [],
          isPredictionDataLoaded: false,
          isPredictionDataLoading: false,
        });
        return;
      }

      const firstMatch = upcomingMatches[0];
      const hasRequiredFields =
        firstMatch?.homeTeam?.name &&
        firstMatch?.awayTeam?.name &&
        firstMatch?.id;

      if (!hasRequiredFields) {
        set({
          predictionData: [],
          isPredictionDataLoaded: false,
          isPredictionDataLoading: false,
        });
        return;
      }

      set({
        predictionData: upcomingMatches,
        isPredictionDataLoaded: true,
        isPredictionDataLoading: false,
      });
    } catch (error) {
      set({
        predictionDataError: error as Error,
        isPredictionDataLoading: false,
        isPredictionDataLoaded: false,
      });
    }
  },

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, { ...item, addedAt: new Date().toISOString() }],
    })),
  removeItem: (matchId, marketId) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.matchId === matchId && item.marketId === marketId)
      ),
    })),
  clearCart: () => set(() => ({ items: [] })),

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
  getUpcomingMatchesCount: () => get().upcomingMatches.length,

  isUpcomingMatchInCart: (matchId) => {
    return get().upcomingMatches.some((match) => match.id === matchId);
  },

  findPredictionForMatch: (
    homeTeam: string,
    awayTeam: string,
    matchId?: string
  ) => {
    const { predictionData } = get();

    if (!predictionData?.length) return null;

    // Strategy 1: Direct normalized match
    let prediction = predictionData.find((p) => {
      const homeMatch =
        normalizeTeamName(p.homeTeam.name) === normalizeTeamName(homeTeam);
      const awayMatch =
        normalizeTeamName(p.awayTeam.name) === normalizeTeamName(awayTeam);
      return homeMatch && awayMatch;
    });
    if (prediction) return prediction;

    // Strategy 2: Reversed team order
    prediction = predictionData.find((p) => {
      const homeMatch =
        normalizeTeamName(p.homeTeam.name) === normalizeTeamName(awayTeam);
      const awayMatch =
        normalizeTeamName(p.awayTeam.name) === normalizeTeamName(homeTeam);
      return homeMatch && awayMatch;
    });
    if (prediction) return prediction;

    // Strategy 3: Find best match using similarity score
    const matches = predictionData.map((p) => ({
      prediction: p,
      similarity:
        Math.min(
          getTeamNameSimilarity(p.homeTeam.name, homeTeam) +
            getTeamNameSimilarity(p.awayTeam.name, awayTeam),
          getTeamNameSimilarity(p.homeTeam.name, awayTeam) +
            getTeamNameSimilarity(p.awayTeam.name, homeTeam)
        ) / 2,
    }));

    // Sort by similarity and get the best match if it's above threshold
    const bestMatch = matches.sort((a, b) => b.similarity - a.similarity)[0];
    if (bestMatch && bestMatch.similarity > 0.8) {
      return bestMatch.prediction;
    }

    return null;
  },
}));
