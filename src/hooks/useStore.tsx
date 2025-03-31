import { create } from 'zustand';

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

    const cleanTeamName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
    };

    if (matchId) {
      const matchById = predictionData.find(
        (prediction) => prediction.id?.toString() === matchId
      );
      if (matchById) return matchById;
    }

    const searchParams = {
      homeTeam: cleanTeamName(homeTeam),
      awayTeam: cleanTeamName(awayTeam),
    };

    // Try exact match
    const exactMatch = predictionData.find((prediction) => {
      const predictionParams = {
        homeTeam: cleanTeamName(prediction.homeTeam?.name || ''),
        awayTeam: cleanTeamName(prediction.awayTeam?.name || ''),
      };

      return (
        (predictionParams.homeTeam === searchParams.homeTeam &&
          predictionParams.awayTeam === searchParams.awayTeam) ||
        (predictionParams.homeTeam === searchParams.awayTeam &&
          predictionParams.awayTeam === searchParams.homeTeam)
      );
    });

    if (exactMatch) return exactMatch;

    // Try partial match
    const partialMatch = predictionData.find((prediction) => {
      const predictionParams = {
        homeTeam: cleanTeamName(prediction.homeTeam?.name || ''),
        awayTeam: cleanTeamName(prediction.awayTeam?.name || ''),
      };

      const homeTeamMatch =
        predictionParams.homeTeam.includes(searchParams.homeTeam) ||
        searchParams.homeTeam.includes(predictionParams.homeTeam);
      const awayTeamMatch =
        predictionParams.awayTeam.includes(searchParams.awayTeam) ||
        searchParams.awayTeam.includes(predictionParams.awayTeam);

      const homeTeamMatchReversed =
        predictionParams.homeTeam.includes(searchParams.awayTeam) ||
        searchParams.awayTeam.includes(predictionParams.homeTeam);
      const awayTeamMatchReversed =
        predictionParams.awayTeam.includes(searchParams.homeTeam) ||
        searchParams.homeTeam.includes(predictionParams.awayTeam);

      return (
        (homeTeamMatch && awayTeamMatch) ||
        (homeTeamMatchReversed && awayTeamMatchReversed)
      );
    });

    if (partialMatch) return partialMatch;

    // Try fuzzy match
    const fuzzyMatch = predictionData.find((prediction) => {
      const predictionParams = {
        homeTeam: cleanTeamName(prediction.homeTeam?.name || ''),
        awayTeam: cleanTeamName(prediction.awayTeam?.name || ''),
      };

      const homeTeamSimilarity = Math.max(
        predictionParams.homeTeam.length / searchParams.homeTeam.length,
        searchParams.homeTeam.length / predictionParams.homeTeam.length
      );
      const awayTeamSimilarity = Math.max(
        predictionParams.awayTeam.length / searchParams.awayTeam.length,
        searchParams.awayTeam.length / predictionParams.awayTeam.length
      );

      return homeTeamSimilarity > 0.8 && awayTeamSimilarity > 0.8;
    });

    return fuzzyMatch || null;
  },
}));
