import {create} from 'zustand';
import { persist } from 'zustand/middleware';

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
    awayTeam: string
  ) => UpcomingMatch | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      upcomingMatches: [],
      predictionData: [],
      isPredictionDataLoading: false,
      isPredictionDataLoaded: false,
      predictionDataError: null,

      loadPredictionData: async () => {
        if (get().isPredictionDataLoaded && get().predictionData.length > 0) {
          console.log('Prediction data already loaded, skipping fetch');
          return;
        }

        set({ isPredictionDataLoading: true });
        try {
          console.log('Loading prediction data from API...');
          const response = await fetch('/api/prediction-data');
          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`
            );
          }
          const data = await response.json();

          // Check if data has the expected structure
          const upcomingMatches =
            data?.data?.upcomingMatches || data?.upcomingMatches || [];

          set({
            predictionData: upcomingMatches,
            isPredictionDataLoaded: true,
            isPredictionDataLoading: false,
          });
          console.log(`Loaded ${upcomingMatches.length} prediction matches`);
        } catch (error) {
          console.error('Error loading prediction data:', error);
          set({
            predictionDataError: error as Error,
            isPredictionDataLoading: false,
          });
        }
      },

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

      findPredictionForMatch: (homeTeam, awayTeam) => {
        const { predictionData } = get();

        const match = predictionData.find(
          (prediction) =>
            prediction.homeTeam?.name?.toLowerCase() ===
              homeTeam.toLowerCase() &&
            prediction.awayTeam?.name?.toLowerCase() === awayTeam.toLowerCase()
        );

        if (match) return match;

        const reverseMatch = predictionData.find(
          (prediction) =>
            prediction.homeTeam?.name?.toLowerCase() ===
              awayTeam.toLowerCase() &&
            prediction.awayTeam?.name?.toLowerCase() === homeTeam.toLowerCase()
        );

        return reverseMatch || null;
      },
    }),
    {
      name: 'arbitrage-cart',
    }
  )
);