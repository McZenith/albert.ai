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
    awayTeam: string,
    matchId?: string
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

          // Validate that the data is complete before setting as loaded
          if (upcomingMatches.length === 0) {
            console.warn(
              'Prediction data loaded but contains 0 matches. Setting isPredictionDataLoaded=false'
            );
            set({
              predictionData: [],
              isPredictionDataLoaded: false,
              isPredictionDataLoading: false,
            });
            return;
          }

          // Check that the first item has required fields
          const firstMatch = upcomingMatches[0];
          const hasRequiredFields =
            firstMatch?.homeTeam?.name &&
            firstMatch?.awayTeam?.name &&
            firstMatch?.id;

          if (!hasRequiredFields) {
            console.warn(
              'Prediction data loaded but is missing required fields. Setting isPredictionDataLoaded=false'
            );
            console.log('Sample data:', firstMatch);
            set({
              predictionData: [],
              isPredictionDataLoaded: false,
              isPredictionDataLoading: false,
            });
            return;
          }

          console.log(`Loaded ${upcomingMatches.length} prediction matches`);

          // All validation passed - set the data as loaded
          set({
            predictionData: upcomingMatches,
            isPredictionDataLoaded: true,
            isPredictionDataLoading: false,
          });
        } catch (error) {
          console.error('Error loading prediction data:', error);
          set({
            predictionDataError: error as Error,
            isPredictionDataLoading: false,
            isPredictionDataLoaded: false,
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

      findPredictionForMatch: (homeTeam, awayTeam, matchId?: string) => {
        const { predictionData } = get();

        // 1. Try matching by ID first if provided
        if (matchId) {
          const matchById = predictionData.find(
            (prediction) => prediction.id?.toString() === matchId
          );

          if (matchById) {
            console.log(`✅ Found match by ID: ${matchId}`);
            return matchById;
          }
        }

        // 2. Fall back to team name matching with more flexible matching
        const cleanTeamName = (name: string): string => {
          if (!name) return '';
          return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '') // Remove special characters
            .replace(/\s+/g, ''); // Remove spaces
        };

        const cleanHomeTeam = cleanTeamName(homeTeam);
        const cleanAwayTeam = cleanTeamName(awayTeam);

        console.log(
          `Looking for match by team names: "${homeTeam}" vs "${awayTeam}"`
        );
        console.log(
          `Cleaned team names: "${cleanHomeTeam}" vs "${cleanAwayTeam}"`
        );

        // Try direct match with cleaned names
        const match = predictionData.find((prediction) => {
          const predictionHomeClean = cleanTeamName(
            prediction.homeTeam?.name || ''
          );
          const predictionAwayClean = cleanTeamName(
            prediction.awayTeam?.name || ''
          );

          console.log(
            `Comparing with prediction: "${prediction.homeTeam?.name}" vs "${prediction.awayTeam?.name}"`
          );
          console.log(
            `Cleaned prediction names: "${predictionHomeClean}" vs "${predictionAwayClean}"`
          );

          // Try both orders of team names (home/away and away/home)
          const isMatch =
            (predictionHomeClean === cleanHomeTeam &&
              predictionAwayClean === cleanAwayTeam) ||
            (predictionHomeClean === cleanAwayTeam &&
              predictionAwayClean === cleanHomeTeam);

          if (isMatch) {
            console.log('✅ Found match by team names');
          } else {
            console.log('❌ No match found');
          }

          return isMatch;
        });

        if (match) {
          console.log('✅ Found prediction match');
          return match;
        }

        // 3. Try partial matching if no exact match found
        console.log('Trying partial matching...');
        const partialMatch = predictionData.find((prediction) => {
          const predictionHomeClean = cleanTeamName(
            prediction.homeTeam?.name || ''
          );
          const predictionAwayClean = cleanTeamName(
            prediction.awayTeam?.name || ''
          );

          // Check if either team name contains the other
          const homeTeamMatch =
            predictionHomeClean.includes(cleanHomeTeam) ||
            cleanHomeTeam.includes(predictionHomeClean);
          const awayTeamMatch =
            predictionAwayClean.includes(cleanAwayTeam) ||
            cleanAwayTeam.includes(predictionAwayClean);

          if (homeTeamMatch && awayTeamMatch) {
            console.log('✅ Found partial match');
            return true;
          }

          return false;
        });

        if (partialMatch) {
          console.log('✅ Found prediction match through partial matching');
          return partialMatch;
        }

        console.log('❌ No prediction match found after all attempts');
        return null;
      },
    }),
    {
      name: 'arbitrage-cart',
    }
  )
);