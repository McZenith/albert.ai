import { create } from 'zustand';
import { normalizeTeamName, getTeamNameSimilarity } from '@/utils/teamUtils';
import { UpcomingMatch } from '@/types/match';

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

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (matchId: string, marketId: string) => void;
  clearCart: () => void;
  upcomingMatches: UpcomingMatch[];
  addUpcomingMatch: (match: UpcomingMatch) => void;
  removeUpcomingMatch: (matchId: string) => void;
  clearUpcomingMatches: () => void;
  isUpcomingMatchInCart: (matchId: string) => boolean;
  getUpcomingMatchesCount: () => number;
  predictionData: UpcomingMatch[];
  isPredictionDataLoaded: boolean;
  setPredictionData: (data: UpcomingMatch[]) => void;
  setIsPredictionDataLoaded: (loaded: boolean) => void;
  findPredictionForMatch: (
    homeTeamName: string,
    awayTeamName: string
  ) => UpcomingMatch | null;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  upcomingMatches: [],
  predictionData: [],
  isPredictionDataLoaded: false,

  setPredictionData: (data) => set({ predictionData: data }),
  setIsPredictionDataLoaded: (loaded) =>
    set({ isPredictionDataLoaded: loaded }),

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

  findPredictionForMatch: (homeTeamName: string, awayTeamName: string) => {
    const { predictionData } = get();

    if (!predictionData?.length) return null;

    // Strategy 1: Direct normalized match
    let prediction = predictionData.find((p) => {
      const homeMatch =
        normalizeTeamName(p.homeTeam.name) === normalizeTeamName(homeTeamName);
      const awayMatch =
        normalizeTeamName(p.awayTeam.name) === normalizeTeamName(awayTeamName);
      return homeMatch && awayMatch;
    });
    if (prediction) return prediction;

    // Strategy 2: Reversed team order
    prediction = predictionData.find((p) => {
      const homeMatch =
        normalizeTeamName(p.homeTeam.name) === normalizeTeamName(awayTeamName);
      const awayMatch =
        normalizeTeamName(p.awayTeam.name) === normalizeTeamName(homeTeamName);
      return homeMatch && awayMatch;
    });
    if (prediction) return prediction;

    // Strategy 3: Find best match using similarity score
    const matches = predictionData.map((p) => ({
      prediction: p,
      similarity:
        Math.min(
          getTeamNameSimilarity(p.homeTeam.name, homeTeamName) +
            getTeamNameSimilarity(p.awayTeam.name, awayTeamName),
          getTeamNameSimilarity(p.homeTeam.name, awayTeamName) +
            getTeamNameSimilarity(p.awayTeam.name, homeTeamName)
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
