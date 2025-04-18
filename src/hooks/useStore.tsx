import { create } from 'zustand';
import { normalizeTeamName, getTeamNameSimilarity } from '@/utils/teamUtils';
import { UpcomingMatch } from '@/types/match';
import {
  saveMatchesToDatabase,
  getSavedMatches,
  deleteSavedMatch,
} from '@/app/actions';

interface SavedMatch {
  id: string;
  [key: string]: unknown;
}

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
  savedMatchIds: string[];
  setSavedMatchIds: (ids: string[]) => void;
  addSavedMatchId: (id: string) => void;
  isSavedMatch: (id: string) => boolean;
  fetchSavedMatches: () => Promise<string[]>;
  saveMatchesToDb: (
    matches: UpcomingMatch[]
  ) => Promise<{ success: boolean; message: string }>;
  deleteMatchFromDb: (
    id: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  upcomingMatches: [],
  predictionData: [],
  isPredictionDataLoaded: false,
  savedMatchIds: [],

  setPredictionData: (data) => set({ predictionData: data }),
  setIsPredictionDataLoaded: (loaded) =>
    set({ isPredictionDataLoaded: loaded }),

  setSavedMatchIds: (ids) => set({ savedMatchIds: ids }),
  addSavedMatchId: (id) =>
    set((state) => ({
      savedMatchIds: [...state.savedMatchIds, id],
    })),
  isSavedMatch: (id) => get().savedMatchIds.includes(id),

  fetchSavedMatches: async () => {
    try {
      const result = await getSavedMatches();

      if ('error' in result) {
        console.error('Error fetching saved matches:', result.error);
        return [];
      }

      if (result.savedMatches) {
        // Extract match IDs from saved matches
        const ids = result.savedMatches
          .map((match: any) => match.id)
          .filter(Boolean);
        set({ savedMatchIds: ids });
        return ids;
      }
    } catch (error) {
      console.error('Error fetching saved matches:', error);
    }
    return [];
  },

  saveMatchesToDb: async (matches) => {
    try {
      const result = await saveMatchesToDatabase(matches);

      if ('error' in result) {
        return { success: false, message: result.error || 'Unknown error' };
      }

      // If successful, update the savedMatchIds
      const newIds = matches.map((match) => match.id as string);
      set((state) => ({
        savedMatchIds: [...state.savedMatchIds, ...newIds],
      }));
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Error saving matches to DB:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  deleteMatchFromDb: async (id) => {
    try {
      const result = await deleteSavedMatch(id);

      if ('error' in result) {
        return { success: false, message: result.error || 'Unknown error' };
      }

      // Remove the ID from savedMatchIds
      set((state) => ({
        savedMatchIds: state.savedMatchIds.filter((savedId) => savedId !== id),
      }));
      return {
        success: true,
        message: result.message || 'Match deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting match from DB:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  addItem: (item) =>
    set((state) => {
      // Check if this item already exists in the cart
      const exists = state.items.some(
        (existingItem) =>
          String(existingItem.matchId) === String(item.matchId) &&
          String(existingItem.marketId) === String(item.marketId)
      );

      // If it already exists, don't add it again
      if (exists) {
        return state;
      }

      // Otherwise, add the new item
      return {
        items: [...state.items, { ...item, addedAt: new Date().toISOString() }],
      };
    }),
  removeItem: (matchId, marketId) =>
    set((state) => ({
      items: state.items.filter(
        (item) =>
          !(
            String(item.matchId) === String(matchId) &&
            String(item.marketId) === String(marketId)
          )
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
        (match) => String(match.id) !== String(matchId)
      ),
    })),
  clearUpcomingMatches: () => set(() => ({ upcomingMatches: [] })),
  getUpcomingMatchesCount: () => get().upcomingMatches.length,

  isUpcomingMatchInCart: (matchId) => {
    return get().upcomingMatches.some(
      (match) => String(match.id) === String(matchId)
    );
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
