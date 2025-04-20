import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Plus,
  Loader2,
  ArrowUpCircle,
  Copy,
  Database,
} from 'lucide-react';
import { useCartStore } from '@/hooks/useStore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveMatchesToDatabase } from '@/app/actions';

interface Team {
  id: string;
  name: string;
  position: number;
  logo: string;
  avgHomeGoals: number;
  avgAwayGoals: number;
  avgTotalGoals: number;
  homeMatchesOver15: number;
  awayMatchesOver15: number;
  totalHomeMatches: number;
  totalAwayMatches: number;
  form: string;
  homeForm: string;
  awayForm: string;
  cleanSheets: number;
  homeCleanSheets: number;
  awayCleanSheets: number;
  scoringFirstWinRate: number;
  concedingFirstWinRate: number;
  firstHalfGoalsPercent: number | null;
  secondHalfGoalsPercent: number | null;
  avgCorners: number;
  bttsRate: number;
  homeBttsRate: number;
  awayBttsRate: number;
  lateGoalRate: number;
  goalDistribution: {
    '0-15': { total: number; home: number; away: number };
    '16-30': { total: number; home: number; away: number };
    '31-45': { total: number; home: number; away: number };
    '46-60': { total: number; home: number; away: number };
    '61-75': { total: number; home: number; away: number };
    '76-90': { total: number; home: number; away: number };
  };
  againstTopTeamsPoints: number | null;
  againstMidTeamsPoints: number | null;
  againstBottomTeamsPoints: number | null;
  isHomeTeam: boolean;
  formStrength: number;
  formRating: number;
  winPercentage: number;
  drawPercentage: number;
  homeWinPercentage: number;
  awayWinPercentage: number;
  cleanSheetPercentage: number;
  averageGoalsScored: number;
  averageGoalsConceded: number;
  homeAverageGoalsScored: number;
  homeAverageGoalsConceded: number;
  awayAverageGoalsScored: number;
  awayAverageGoalsConceded: number;
  goalsScoredAverage: number;
  goalsConcededAverage: number;
  averageCorners: number;
  avgOdds: number;
  leagueAvgGoals: number;
  possession: number;
  opponentName: string;
  totalHomeWins: number;
  totalAwayWins: number;
  totalHomeDraws: number;
  totalAwayDraws: number;
  totalHomeLosses: number;
  totalAwayLosses: number;
  over05: number;
  over15: number;
  over25: number;
  over35: number;
  over45: number;
  cleanSheetRate: number;
  cornerStats: {
    avgCorners: number;
    avgCornersFor: number;
    avgCornersAgainst: number;
  };
  scoringStats: {
    avgGoalsScored: number;
    avgGoalsConceded: number;
    avgTotalGoals: number;
  };
  patterns: {
    btts: number;
    over15: number;
    over25: number;
    over35: number;
  };
}

interface HeadToHead {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  recentMatches: {
    date: string;
    result: string;
  }[];
}

interface Odds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over15Goals: number;
  under15Goals: number;
  over25Goals: number;
  under25Goals: number;
  bttsYes: number;
  bttsNo: number;
}

interface CornerStats {
  homeAvg: number;
  awayAvg: number;
  totalAvg: number;
}

interface ScoringPatterns {
  homeFirstGoalRate: number;
  awayFirstGoalRate: number;
  homeLateGoalRate: number;
  awayLateGoalRate: number;
  homeBttsRate: number;
  awayBttsRate: number;
}

interface Match {
  id: string | number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  venue: string;
  positionGap: number;
  favorite: 'home' | 'away' | null;
  confidenceScore: number;
  averageGoals: number;
  expectedGoals: number;
  defensiveStrength: number;
  headToHead: HeadToHead;
  odds: Odds;
  cornerStats: CornerStats;
  scoringPatterns: ScoringPatterns;
  reasonsForPrediction: string[];
}

interface Filters {
  minConfidence: number;
  favorite: 'all' | 'home' | 'away';
  positionGap: number;
  minExpectedGoals: number;
  showOnlyUpcoming: boolean;
  showOnlyClearPreferred: boolean; // Add new filter
  enableGrouping: boolean; // Add grouping toggle
  groupSize: number; // Add group size configuration
  minBttsRate: number; // Minimum BTTS rate
  minHomeGoals: number; // Minimum average home goals
  minAwayGoals: number; // Minimum average away goals
  minH2hMatchCount: number; // Minimum number of H2H matches
  minH2hWinGap: number; // Minimum H2H win-loss difference
}

interface ThresholdValues {
  high: number;
  medium: number;
}

interface ApiResponse {
  upcomingMatches: Match[];
  metadata: {
    total: number;
    date: string;
    leagueData: Record<
      string,
      {
        matches: number;
        totalGoals: number;
        homeWinRate: number;
        drawRate: number;
        awayWinRate: number;
        bttsRate: number;
      }
    >;
  };
  cache?: {
    isCached: boolean;
    lastUpdated: string;
    cacheAge: number;
    nextRefresh: string;
    error?: string;
  };
}

interface PredictionData {
  id: string | number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  venue: string;
  positionGap: number;
  favorite: 'home' | 'away' | null;
  confidenceScore: number;
  averageGoals: number;
  expectedGoals: number;
  defensiveStrength: number;
  headToHead: HeadToHead;
  odds: Odds;
  cornerStats: CornerStats;
  scoringPatterns: ScoringPatterns;
  reasonsForPrediction: string[];
}

// Helper function to render team logo
const renderTeamLogo = (
  logo: string | number | undefined,
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  // If the logo is undefined, use a generic icon
  if (!logo) {
    return (
      <span
        className={
          size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-base'
        }
      >
        🏆
      </span>
    );
  }

  // If the logo is a short string (likely an emoji)
  if (typeof logo === 'string' && logo.length < 5) {
    return (
      <span
        className={
          size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-base'
        }
      >
        {logo}
      </span>
    );
  }

  // If the logo is a number or longer string (likely an ID), use a generic icon
  return (
    <span
      className={
        size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-base'
      }
    >
      🏆
    </span>
  );
};

// Client-only wrapper for Loader2 to ensure hydration consistency
const ClientOnlyLoader = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Server rendering - use a div with the same dimensions
    return (
      <>
        <div className='w-12 h-12 text-blue-500 mb-4' />
        <p className='text-gray-600'>Loading prediction data...</p>
      </>
    );
  }

  // Client rendering - use the actual Loader2 component
  return (
    <>
      <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
      <p className='text-gray-600'>Loading prediction data...</p>
    </>
  );
};

const MatchPredictor = () => {
  // Remove unused state variables
  const [expandedMatch, setExpandedMatch] = useState<string | number | null>(
    null
  );
  const [sortField, setSortField] = useState<string>('confidenceScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>({
    minConfidence: 0,
    favorite: 'all',
    positionGap: 0,
    minExpectedGoals: 0,
    showOnlyUpcoming: false,
    showOnlyClearPreferred: false, // Add new filter
    enableGrouping: false, // Add grouping toggle
    groupSize: 10, // Add group size configuration
    minBttsRate: 0, // Minimum BTTS rate
    minHomeGoals: 0, // Minimum average home goals
    minAwayGoals: 0, // Minimum average away goals
    minH2hMatchCount: 0, // Minimum number of H2H matches
    minH2hWinGap: 0, // Minimum H2H win-loss difference
  });
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<{
    [key: string]: { total: number; hourData: { [hour: string]: number } };
  }>({});
  const [showOnlyCart, setShowOnlyCart] = useState<boolean>(false);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [metadata, setMetadata] = useState<ApiResponse['metadata'] | null>(
    null
  );
  const [isPredictionDataLoading, setIsPredictionDataLoading] =
    useState<boolean>(true);
  const [predictionDataError, setPredictionDataError] = useState<string | null>(
    null
  );
  const [isSavingToDb, setIsSavingToDb] = useState<boolean>(false);
  const [savedMatchIds, setSavedMatchIds] = useState<Set<string | number>>(
    new Set()
  );

  // Get cart functions from the global store
  const {
    addUpcomingMatch,
    removeUpcomingMatch,
    isUpcomingMatchInCart,
    clearUpcomingMatches,
    predictionData,
    isPredictionDataLoaded,
  } = useCartStore();

  // Update state when prediction data changes
  useEffect(() => {
    if (isPredictionDataLoaded && predictionData) {
      // Transform UpcomingMatch data into Match type
      const transformedMatches: Match[] = (
        predictionData as unknown as PredictionData[]
      ).map((upcomingMatch) => ({
        id: upcomingMatch.id,
        homeTeam: {
          ...upcomingMatch.homeTeam,
          logo: upcomingMatch.homeTeam.logo || '🏆', // Use API logo or fallback to default
          avgHomeGoals: upcomingMatch.homeTeam.avgHomeGoals || 0,
          avgAwayGoals: upcomingMatch.homeTeam.avgAwayGoals || 0,
          avgTotalGoals: upcomingMatch.homeTeam.avgTotalGoals || 0,
          homeMatchesOver15: upcomingMatch.homeTeam.homeMatchesOver15 || 0,
          awayMatchesOver15: upcomingMatch.homeTeam.awayMatchesOver15 || 0,
          totalHomeMatches: upcomingMatch.homeTeam.totalHomeMatches || 0,
          totalAwayMatches: upcomingMatch.homeTeam.totalAwayMatches || 0,
          form: upcomingMatch.homeTeam.form,
          homeForm: upcomingMatch.homeTeam.homeForm,
          cleanSheets: upcomingMatch.homeTeam.cleanSheets || 0,
          homeCleanSheets: upcomingMatch.homeTeam.homeCleanSheets || 0,
          awayCleanSheets: upcomingMatch.homeTeam.awayCleanSheets || 0,
          scoringFirstWinRate: upcomingMatch.homeTeam.scoringFirstWinRate || 0,
          concedingFirstWinRate:
            upcomingMatch.homeTeam.concedingFirstWinRate || 0,
          firstHalfGoalsPercent:
            upcomingMatch.homeTeam.firstHalfGoalsPercent || 0,
          secondHalfGoalsPercent:
            upcomingMatch.homeTeam.secondHalfGoalsPercent || 0,
          avgCorners: upcomingMatch.homeTeam.avgCorners || 0,
          bttsRate: upcomingMatch.homeTeam.bttsRate || 0,
          homeBttsRate: upcomingMatch.homeTeam.homeBttsRate || 0,
          awayBttsRate: upcomingMatch.homeTeam.awayBttsRate || 0,
          lateGoalRate: upcomingMatch.homeTeam.lateGoalRate || 0,
          homeAverageGoalsScored:
            upcomingMatch.homeTeam.homeAverageGoalsScored || 0,
          awayAverageGoalsScored:
            upcomingMatch.homeTeam.awayAverageGoalsScored || 0,
          averageGoalsScored: upcomingMatch.homeTeam.averageGoalsScored || 0,
          homeAverageGoalsConceded:
            upcomingMatch.homeTeam.homeAverageGoalsConceded || 0,
          awayAverageGoalsConceded:
            upcomingMatch.homeTeam.awayAverageGoalsConceded || 0,
          averageGoalsConceded:
            upcomingMatch.homeTeam.averageGoalsConceded || 0,
          goalDistribution: upcomingMatch.homeTeam.goalDistribution || {
            '0-15': 0,
            '16-30': 0,
            '31-45': 0,
            '46-60': 0,
            '61-75': 0,
            '76-90': 0,
          },
          againstTopTeamsPoints:
            upcomingMatch.homeTeam.againstTopTeamsPoints || 0,
          againstMidTeamsPoints:
            upcomingMatch.homeTeam.againstMidTeamsPoints || 0,
          againstBottomTeamsPoints:
            upcomingMatch.homeTeam.againstBottomTeamsPoints || 0,
        },
        awayTeam: {
          ...upcomingMatch.awayTeam,
          logo: upcomingMatch.awayTeam.logo || '🏆', // Use API logo or fallback to default
          avgHomeGoals: upcomingMatch.awayTeam.avgHomeGoals || 0,
          avgAwayGoals: upcomingMatch.awayTeam.avgAwayGoals || 0,
          avgTotalGoals: upcomingMatch.awayTeam.avgTotalGoals || 0,
          homeMatchesOver15: upcomingMatch.awayTeam.homeMatchesOver15 || 0,
          awayMatchesOver15: upcomingMatch.awayTeam.awayMatchesOver15 || 0,
          totalHomeMatches: upcomingMatch.awayTeam.totalHomeMatches || 0,
          totalAwayMatches: upcomingMatch.awayTeam.totalAwayMatches || 0,
          form: upcomingMatch.awayTeam.form,
          awayForm: upcomingMatch.awayTeam.awayForm,
          cleanSheets: upcomingMatch.awayTeam.cleanSheets || 0,
          homeCleanSheets: upcomingMatch.awayTeam.homeCleanSheets || 0,
          awayCleanSheets: upcomingMatch.awayTeam.awayCleanSheets || 0,
          scoringFirstWinRate: upcomingMatch.awayTeam.scoringFirstWinRate || 0,
          concedingFirstWinRate:
            upcomingMatch.awayTeam.concedingFirstWinRate || 0,
          firstHalfGoalsPercent:
            upcomingMatch.awayTeam.firstHalfGoalsPercent || 0,
          secondHalfGoalsPercent:
            upcomingMatch.awayTeam.secondHalfGoalsPercent || 0,
          avgCorners: upcomingMatch.awayTeam.avgCorners || 0,
          bttsRate: upcomingMatch.awayTeam.bttsRate || 0,
          homeBttsRate: upcomingMatch.awayTeam.homeBttsRate || 0,
          awayBttsRate: upcomingMatch.awayTeam.awayBttsRate || 0,
          lateGoalRate: upcomingMatch.awayTeam.lateGoalRate || 0,
          homeAverageGoalsScored:
            upcomingMatch.awayTeam.homeAverageGoalsScored || 0,
          awayAverageGoalsScored:
            upcomingMatch.awayTeam.awayAverageGoalsScored || 0,
          averageGoalsScored: upcomingMatch.awayTeam.averageGoalsScored || 0,
          homeAverageGoalsConceded:
            upcomingMatch.awayTeam.homeAverageGoalsConceded || 0,
          awayAverageGoalsConceded:
            upcomingMatch.awayTeam.awayAverageGoalsConceded || 0,
          averageGoalsConceded:
            upcomingMatch.awayTeam.averageGoalsConceded || 0,
          goalDistribution: upcomingMatch.awayTeam.goalDistribution || {
            '0-15': 0,
            '16-30': 0,
            '31-45': 0,
            '46-60': 0,
            '61-75': 0,
            '76-90': 0,
          },
          againstTopTeamsPoints:
            upcomingMatch.awayTeam.againstTopTeamsPoints || 0,
          againstMidTeamsPoints:
            upcomingMatch.awayTeam.againstMidTeamsPoints || 0,
          againstBottomTeamsPoints:
            upcomingMatch.awayTeam.againstBottomTeamsPoints || 0,
        },
        date: upcomingMatch.date,
        time: upcomingMatch.time,
        venue: upcomingMatch.venue,
        positionGap: upcomingMatch.positionGap,
        favorite: upcomingMatch.favorite as 'home' | 'away' | null,
        confidenceScore: upcomingMatch.confidenceScore,
        averageGoals: upcomingMatch.averageGoals || 0,
        expectedGoals: upcomingMatch.expectedGoals,
        defensiveStrength: upcomingMatch.defensiveStrength || 0,
        headToHead: upcomingMatch.headToHead || {
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsScored: 0,
          goalsConceded: 0,
          recentMatches: [],
        },
        odds: {
          homeWin: upcomingMatch.odds?.homeWin || 0,
          draw: upcomingMatch.odds?.draw || 0,
          awayWin: upcomingMatch.odds?.awayWin || 0,
          over15Goals: upcomingMatch.odds?.over15Goals || 0,
          under15Goals: upcomingMatch.odds?.under15Goals || 0,
          over25Goals: upcomingMatch.odds?.over25Goals || 0,
          under25Goals: upcomingMatch.odds?.under25Goals || 0,
          bttsYes: upcomingMatch.odds?.bttsYes || 0,
          bttsNo: upcomingMatch.odds?.bttsNo || 0,
        },
        cornerStats: upcomingMatch.cornerStats || {
          homeAvg: 0,
          awayAvg: 0,
          totalAvg: 0,
        },
        scoringPatterns: upcomingMatch.scoringPatterns || {
          homeFirstGoalRate: 0,
          awayFirstGoalRate: 0,
          homeLateGoalRate: 0,
          awayLateGoalRate: 0,
          homeBttsRate: 0,
          awayBttsRate: 0,
        },
        reasonsForPrediction: upcomingMatch.reasonsForPrediction || [],
      }));

      setUpcomingMatches(transformedMatches);
      setMetadata({
        total: transformedMatches.length,
        date: new Date().toISOString().split('T')[0],
        leagueData: {}, // You can populate this with actual league data if needed
      });
      setIsPredictionDataLoading(false);
      setPredictionDataError(null);
    }
  }, [predictionData, isPredictionDataLoaded]);

  // Fix the toggleMatchInCart function
  const toggleMatchInCart = (id: string | number, index: number): void => {
    const matchToAdd = upcomingMatches.find((m) => m.id === id);
    if (!matchToAdd) {
      return;
    }

    // Generate a unique ID if the match ID is 0
    const uniqueId = id === 0 ? `match-${index}` : id;

    if (isUpcomingMatchInCart(String(uniqueId))) {
      // Remove from cart if already there

      removeUpcomingMatch(String(uniqueId));
    } else {
      // Add to cart if not there, ensure it has a unique ID

      // Create new team objects with required id properties
      const homeTeamWithId = {
        ...matchToAdd.homeTeam,
        id: String(matchToAdd.homeTeam.name.replace(/\s+/g, '_').toLowerCase()),
      };

      const awayTeamWithId = {
        ...matchToAdd.awayTeam,
        id: String(matchToAdd.awayTeam.name.replace(/\s+/g, '_').toLowerCase()),
      };

      // Add to cart with proper structure
      addUpcomingMatch({
        ...matchToAdd,
        id: String(uniqueId),
        homeTeam: homeTeamWithId,
        awayTeam: awayTeamWithId,
      });
    }

    // Log the current cart state after the change
  };

  const checkMatchInCart = (id: string | number, index: number): boolean => {
    const uniqueId = id === 0 ? `match-${index}` : id;
    const isInCart = isUpcomingMatchInCart(String(uniqueId));

    return isInCart;
  };

  const getMetricColor = (
    value: number,
    thresholds: ThresholdValues
  ): string => {
    if (value >= thresholds.high) return 'bg-green-100 text-green-800';
    if (value >= thresholds.medium) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getFormColor = (form: string): string => {
    const wins = (form.match(/W/g) || []).length;
    const ratio = wins / form.length;

    if (ratio >= 0.6) return 'bg-green-100 text-green-800';
    if (ratio >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calculateFormPoints = (form: string): number => {
    if (!form) return 0;

    const wins = (form.match(/W/g) || []).length;
    const draws = (form.match(/D/g) || []).length;

    const points = wins * 3 + draws * 1;
    const maxPoints = form.length * 3;

    return Math.round((points / maxPoints) * 100);
  };

  // Sort function for matches
  const sortMatches = (matches: Match[]): Match[] => {
    return [...matches].sort((a, b) => {
      let aValue: number | string | Date, bValue: number | string | Date;

      // Handle nested properties
      if (sortField === 'homeAvg') {
        aValue = a.homeTeam.avgHomeGoals || 0;
        bValue = b.homeTeam.avgHomeGoals || 0;
      } else if (sortField === 'awayAvg') {
        aValue = a.awayTeam.avgAwayGoals || 0;
        bValue = b.awayTeam.avgAwayGoals || 0;
      } else if (sortField === 'form') {
        // Count wins in form
        const getWins = (form?: string): number =>
          (form?.match(/W/g) || []).length;
        aValue =
          a.favorite === 'home'
            ? getWins(a.homeTeam.form)
            : a.favorite === 'away'
            ? getWins(a.awayTeam.form)
            : 0;
        bValue =
          b.favorite === 'home'
            ? getWins(b.homeTeam.form)
            : b.favorite === 'away'
            ? getWins(b.awayTeam.form)
            : 0;
      } else if (sortField === 'formPoints') {
        // Sort by form points percentage
        aValue =
          a.favorite === 'home'
            ? calculateFormPoints(a.homeTeam.form)
            : a.favorite === 'away'
            ? calculateFormPoints(a.awayTeam.form)
            : 0;
        bValue =
          b.favorite === 'home'
            ? calculateFormPoints(b.homeTeam.form)
            : b.favorite === 'away'
            ? calculateFormPoints(b.awayTeam.form)
            : 0;
      } else if (sortField === 'h2h') {
        aValue = a.headToHead.wins / Math.max(1, a.headToHead.matches);
        bValue = b.headToHead.wins / Math.max(1, b.headToHead.matches);
      } else if (sortField === 'bttsRate') {
        // Use BTTS rate from favorite team
        aValue =
          a.favorite === 'home'
            ? a.homeTeam.bttsRate || 0
            : a.favorite === 'away'
            ? a.awayTeam.bttsRate || 0
            : 0;
        bValue =
          b.favorite === 'home'
            ? b.homeTeam.bttsRate || 0
            : b.favorite === 'away'
            ? b.awayTeam.bttsRate || 0
            : 0;
      } else if (sortField === 'homeAwayForm') {
        // Sort by home or away form based on favorite
        aValue =
          a.favorite === 'home'
            ? calculateFormPoints(a.homeTeam.homeForm || '')
            : a.favorite === 'away'
            ? calculateFormPoints(a.awayTeam.awayForm || '')
            : 0;
        bValue =
          b.favorite === 'home'
            ? calculateFormPoints(b.homeTeam.homeForm || '')
            : b.favorite === 'away'
            ? calculateFormPoints(b.awayTeam.awayForm || '')
            : 0;
      } else if (sortField === 'homeAwayPosition') {
        // Sort by home or away position
        aValue =
          a.favorite === 'home'
            ? a.homeTeam.position || 0
            : a.favorite === 'away'
            ? a.awayTeam.position || 0
            : 0;
        bValue =
          b.favorite === 'home'
            ? b.homeTeam.position || 0
            : b.favorite === 'away'
            ? b.awayTeam.position || 0
            : 0;
      } else if (sortField === 'matchTime') {
        // For server rendering, use string comparison of ISO dates first
        if (typeof window === 'undefined') {
          // Simple string comparison for server-side rendering to avoid hydration mismatch
          const aDateStr = `${a.date} ${a.time || '00:00'}`;
          const bDateStr = `${b.date} ${b.time || '00:00'}`;

          if (sortDirection === 'asc') {
            return aDateStr.localeCompare(bDateStr);
          } else {
            return bDateStr.localeCompare(aDateStr);
          }
        }

        // Client-side only: Convert date & time strings to Date objects for comparison
        const aDate = new Date(`${a.date} ${a.time || '00:00'}`);
        const bDate = new Date(`${b.date} ${b.time || '00:00'}`);

        // Direct comparison of timestamps for dates
        if (sortDirection === 'asc') {
          return aDate.getTime() - bDate.getTime();
        } else {
          return bDate.getTime() - aDate.getTime();
        }
      } else if (sortField.includes('.')) {
        // Handle nested fields like odds.over15Goals
        const [field, subfield] = sortField.split('.');
        const aObj = a[field as keyof Match] as unknown as {
          [key: string]: number;
        };
        const bObj = b[field as keyof Match] as unknown as {
          [key: string]: number;
        };

        aValue = aObj && typeof aObj === 'object' ? aObj[subfield] || 0 : 0;
        bValue = bObj && typeof bObj === 'object' ? bObj[subfield] || 0 : 0;
      } else {
        // Convert to unknown first, then to Record<string, number>
        aValue = (a as unknown as Record<string, number>)[sortField] || 0;
        bValue = (b as unknown as Record<string, number>)[sortField] || 0;
      }

      // Compare based on direction
      if (sortDirection === 'asc') {
        return typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      } else {
        return typeof aValue === 'number' && typeof bValue === 'number'
          ? bValue - aValue
          : String(bValue).localeCompare(String(aValue));
      }
    });
  };

  // Filter function for matches
  const filterMatches = (matches: Match[]): Match[] => {
    // Apply all basic filters first (confidence, favorite, position gap, expected goals)
    let filteredMatches = matches.filter((match) => {
      // Filter by confidence score
      if (match.confidenceScore < filters.minConfidence) {
        return false;
      }

      // Filter by favorite
      if (filters.favorite !== 'all' && match.favorite !== filters.favorite) {
        return false;
      }

      // Filter by position gap
      if (match.positionGap < filters.positionGap) {
        return false;
      }

      // Filter by expected goals
      if (match.expectedGoals < filters.minExpectedGoals) {
        return false;
      }

      // Filter by clear preferred team
      if (filters.showOnlyClearPreferred && !hasClearPreferredTeam(match)) {
        return false;
      }

      // Filter by BTTS rate
      if (filters.minBttsRate > 0) {
        const bttsRate =
          match.favorite === 'home'
            ? match.homeTeam.bttsRate
            : match.favorite === 'away'
            ? match.awayTeam.bttsRate
            : 0;

        if (bttsRate < filters.minBttsRate) {
          return false;
        }
      }

      // Filter by home goals
      if (
        filters.minHomeGoals > 0 &&
        match.homeTeam.homeAverageGoalsScored < filters.minHomeGoals
      ) {
        return false;
      }

      // Filter by away goals
      if (
        filters.minAwayGoals > 0 &&
        match.awayTeam.awayAverageGoalsScored < filters.minAwayGoals
      ) {
        return false;
      }

      // Filter by H2H match count
      if (
        filters.minH2hMatchCount > 0 &&
        match.headToHead.matches < filters.minH2hMatchCount
      ) {
        return false;
      }

      // Filter by H2H win gap
      if (filters.minH2hWinGap > 0) {
        const winGap = Math.abs(
          match.headToHead.wins - match.headToHead.losses
        );
        if (winGap < filters.minH2hWinGap) {
          return false;
        }
      }

      return true;
    });

    // Next apply the time window filter if enabled
    if (filters.showOnlyUpcoming) {
      const windowFiltered = applyTimeWindowFilter(filteredMatches);
      filteredMatches = windowFiltered;
    }

    // Finally, apply cart filter if enabled (after all other filters)
    if (showOnlyCart) {
      filteredMatches = filteredMatches.filter((match, index) => {
        const uniqueId = match.id === 0 ? `match-${index}` : match.id;
        const isInCart = isUpcomingMatchInCart(String(uniqueId));
        return isInCart;
      });
    }

    return filteredMatches;
  };

  // Helper function to apply time window filtering with adaptive window sizes
  const applyTimeWindowFilter = (matches: Match[]): Match[] => {
    // Try 24 hour window first
    const matchesIn24Hours = filterByTimeWindow(matches, 24);

    // If we have a reasonable number of matches in the 24 hour window, return those
    if (matchesIn24Hours.length >= 5) {
      return matchesIn24Hours;
    }

    // If we have very few matches, try a 72 hour window
    const matchesIn72Hours = filterByTimeWindow(matches, 72);

    // If we have a reasonable number of matches in the 72 hour window, return those
    if (matchesIn72Hours.length >= 5) {
      return matchesIn72Hours;
    }

    // As a last resort, try a 7 day window
    const matchesIn7Days = filterByTimeWindow(matches, 24 * 7);
    return matchesIn7Days;
  };

  // Apply time filter - checks if match time is within the specified window
  const filterByTimeWindow = (matches: Match[], windowHours: number) => {
    // Create the time window boundaries once to avoid recalculating
    const now = new Date();
    const currentHour = new Date(now);
    currentHour.setMinutes(0, 0, 0);
    const laterTime = new Date(
      currentHour.getTime() + windowHours * 60 * 60 * 1000
    );

    const filtered = matches.filter((match) => {
      try {
        // Skip if missing date
        if (!match.date) {
          return false;
        }

        // If the date is from 2025, correct it to the current year for filtering purposes
        let dateToUse = match.date;
        if (match.date.startsWith('2025-')) {
          const [, month, day] = match.date.split('-');
          const currentYear = new Date().getFullYear();
          dateToUse = `${currentYear}-${month}-${day}`;
        }

        // Try to create a valid date object
        let matchDateTime;

        // Normalize the time if needed
        const timeToUse = match.time || '12:00';

        // Try parsing with standard ISO format
        try {
          // Make sure we have seconds
          const timeWithSeconds =
            timeToUse.includes(':') && timeToUse.split(':').length === 2
              ? `${timeToUse}:00`
              : timeToUse;

          matchDateTime = new Date(`${dateToUse}T${timeWithSeconds}`);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          // Fallback to manual parsing
        }

        // If that fails, parse manually
        if (!matchDateTime || isNaN(matchDateTime.getTime())) {
          try {
            const [year, month, day] = dateToUse.split('-').map(Number);
            let hours = 12,
              minutes = 0;

            if (timeToUse) {
              // Parse time - handle different formats
              if (timeToUse.includes(':')) {
                const timeParts = timeToUse.split(':');
                hours = parseInt(timeParts[0]);
                if (timeParts.length > 1) {
                  minutes = parseInt(timeParts[1]);
                }

                // Check for AM/PM
                if (timeToUse.toLowerCase().includes('pm') && hours < 12) {
                  hours += 12;
                } else if (
                  timeToUse.toLowerCase().includes('am') &&
                  hours === 12
                ) {
                  hours = 0;
                }
              }
            }

            // JavaScript months are 0-indexed
            matchDateTime = new Date(year, month - 1, day, hours, minutes);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            // If all else fails, use noon on the match date
            matchDateTime = new Date(`${dateToUse}T12:00:00`);
          }
        }

        // Check if the date is valid
        if (!matchDateTime || isNaN(matchDateTime.getTime())) {
          return false;
        }

        // Check if match time is in the desired range
        if (matchDateTime < currentHour || matchDateTime > laterTime) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    });

    return filtered;
  };

  // Handle sorting
  const handleSort = (field: string): void => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to desc by default
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    name: keyof Filters,
    value: string | number
  ): void => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Add a function to select all visible matches
  const selectAllVisibleMatches = () => {
    const visibleMatches = sortedMatches; // Use sorted matches instead of filtering again

    visibleMatches.forEach((match, index) => {
      // Only add matches that are not already in the cart
      const uniqueId = match.id === 0 ? `match-${index}` : match.id;
      if (!isUpcomingMatchInCart(String(uniqueId))) {
        // Create new team objects with required id properties
        const homeTeamWithId = {
          ...match.homeTeam,
          id: String(match.homeTeam.name.replace(/\s+/g, '_').toLowerCase()),
        };

        const awayTeamWithId = {
          ...match.awayTeam,
          id: String(match.awayTeam.name.replace(/\s+/g, '_').toLowerCase()),
        };

        // Add to cart with proper structure
        addUpcomingMatch({
          ...match,
          id: String(uniqueId),
          homeTeam: homeTeamWithId,
          awayTeam: awayTeamWithId,
        });
      }
    });
  };

  // Add a function to clear all selected matches
  const clearAllSelectedMatches = () => {
    clearUpcomingMatches();
  };

  // Update the reset filters function to include the new filter
  const resetFilters = () => {
    setFilters({
      minConfidence: 0,
      favorite: 'all',
      positionGap: 0,
      minExpectedGoals: 0,
      showOnlyUpcoming: false,
      showOnlyClearPreferred: false,
      enableGrouping: false,
      groupSize: 10,
      minBttsRate: 0, // Minimum BTTS rate
      minHomeGoals: 0, // Minimum average home goals
      minAwayGoals: 0, // Minimum average away goals
      minH2hMatchCount: 0, // Minimum number of H2H matches
      minH2hWinGap: 0, // Minimum H2H win-loss difference
    });
    // Also reset the cart filter
    setShowOnlyCart(false);
  };

  // Add a function to toggle the upcoming matches filter
  const toggleUpcomingFilter = () => {
    setFilters((prev) => ({
      ...prev,
      showOnlyUpcoming: !prev.showOnlyUpcoming,
    }));
  };

  // Add a function to toggle showing only cart items
  const toggleCartFilter = () => {
    const newValue = !showOnlyCart;

    // Log some cart items for debugging
    if (useCartStore.getState().upcomingMatches.length > 0) {
      useCartStore.getState().upcomingMatches.slice(0, 3);
    }

    setShowOnlyCart(newValue);
  };

  // Update tooltip to reflect adaptive time window
  const getTimeRangeTooltip = () => {
    const now = new Date();
    const currentHour = new Date(now);
    currentHour.setMinutes(0, 0, 0);
    const twentyFourHoursLater = new Date(
      currentHour.getTime() + 24 * 60 * 60 * 1000
    );

    // Format the times in 12-hour format
    const startTime = currentHour.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = twentyFourHoursLater.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const startDate = currentHour.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
    const endDate = twentyFourHoursLater.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });

    if (startDate === endDate) {
      return `Prioritizes matches from ${startTime} today to ${endTime} tomorrow. Will show matches up to 7 days ahead if few matches are available in the next 24 hours.`;
    } else {
      return `Prioritizes matches from ${startTime} (${startDate}) to ${endTime} (${endDate}). Will show matches up to 7 days ahead if few matches are available in the next 24 hours.`;
    }
  };

  // Add scroll to top effect
  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px
      setShowScrollTop(window.scrollY > 300);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Remove event listener on cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add helper function to format the date nicely for display
  const formatMatchDate = (date: string, time: string): string => {
    try {
      let matchDateTime;

      if (date && time) {
        // SignalR data is already in YYYY-MM-DD and HH:mm format
        matchDateTime = new Date(`${date}T${time}`);

        // If that fails, try with space separator as fallback
        if (isNaN(matchDateTime.getTime())) {
          matchDateTime = new Date(`${date} ${time}`);
        }
      } else if (date) {
        // If we only have a date but no time, use noon as default time
        matchDateTime = new Date(`${date}T12:00:00`);
      } else {
        // If we have no valid date, return the original values
        return `${date || 'N/A'} ${time || ''}`;
      }

      // Check if the date is valid
      if (isNaN(matchDateTime.getTime())) {
        return `${date || 'N/A'} ${time || ''}`;
      }

      // Format the date and time in a user-friendly way
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Check if the match is today or tomorrow
      if (matchDateTime.toDateString() === today.toDateString()) {
        return `Today, ${matchDateTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}`;
      } else if (matchDateTime.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${matchDateTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}`;
      } else {
        // If not today or tomorrow, show the full date
        return matchDateTime.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
    } catch {
      return `${date || 'N/A'} ${time || ''}`;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Now replace the showMatchesByHour function
  const showMatchesByHour = () => {
    // Get all matches
    const dateGroups: {
      [key: string]: Match[];
    } = {
      Today: [],
      Tomorrow: [],
      Future: [],
    };

    // First group matches by date
    upcomingMatches.forEach((match) => {
      if (!match.date || !match.time) return;

      // Get formatted date like "Today", "Tomorrow" or the actual date
      const formattedDate = formatMatchDate(match.date, match.time).split(
        ','
      )[0];

      // Assign to date group
      if (formattedDate === 'Today') {
        dateGroups['Today'].push(match);
      } else if (formattedDate === 'Tomorrow') {
        dateGroups['Tomorrow'].push(match);
      } else {
        dateGroups['Future'].push(match);
      }
    });

    // For each date group, count matches by hour
    const formattedData: {
      [key: string]: { total: number; hourData: { [hour: string]: number } };
    } = {};

    Object.keys(dateGroups).forEach((dateGroup) => {
      const matches = dateGroups[dateGroup];
      formattedData[dateGroup] = {
        total: matches.length,
        hourData: {},
      };

      if (matches.length === 0) {
        return;
      }

      // Group by hour within this date group
      matches.forEach((match) => {
        const hour = match.time.split(':')[0];
        formattedData[dateGroup].hourData[hour] =
          (formattedData[dateGroup].hourData[hour] || 0) + 1;
      });
    });

    // Set the analytics data and show the modal
    setAnalyticsData(formattedData);
    setShowAnalyticsModal(true);
  };

  // Add new function to check if a match has a clear preferred team
  const hasClearPreferredTeam = (match: Match): boolean => {
    // Check if all required data is available
    const requiredData = [
      match.homeTeam.position,
      match.awayTeam.position,
      match.homeTeam.form,
      match.awayTeam.form,
      match.homeTeam.scoringFirstWinRate,
      match.awayTeam.scoringFirstWinRate,
      match.expectedGoals,
      match.headToHead,
    ];

    if (!requiredData.every((data) => data !== undefined && data !== null)) {
      return false;
    }

    // Calculate form points for both teams
    const homeFormPoints = calculateFormPoints(match.homeTeam.form || '');
    const awayFormPoints = calculateFormPoints(match.awayTeam.form || '');

    // Check position gap
    const positionGap = Math.abs(
      (match.homeTeam.position || 0) - (match.awayTeam.position || 0)
    );
    if (positionGap < 3) return false;

    // Check form difference
    const formDiff = Math.abs(homeFormPoints - awayFormPoints);
    if (formDiff < 10) return false;

    // Check scoring first win rates
    const homeScoringFirst = match.homeTeam.scoringFirstWinRate || 0;
    const awayScoringFirst = match.awayTeam.scoringFirstWinRate || 0;
    if (Math.abs(homeScoringFirst - awayScoringFirst) < 10) return false;

    // Check expected goals
    if (match.expectedGoals < 2.0) return false;

    // Check head-to-head data
    const h2h = match.headToHead;
    const hasHeadToHeadAdvantage =
      h2h.matches > 0 && Math.abs(h2h.wins - h2h.losses) > 1;

    // Determine which team is preferred based on the metrics
    const homeAdvantage =
      Number(homeFormPoints > awayFormPoints) +
      Number(match.homeTeam.position < match.awayTeam.position) +
      Number(homeScoringFirst > awayScoringFirst) +
      Number(hasHeadToHeadAdvantage && h2h.wins > h2h.losses);

    const awayAdvantage =
      Number(awayFormPoints > homeFormPoints) +
      Number(match.awayTeam.position < match.homeTeam.position) +
      Number(awayScoringFirst > homeScoringFirst) +
      Number(hasHeadToHeadAdvantage && h2h.losses > h2h.wins);

    // Return true if either team has clear advantage (at least 3 out of 4 metrics)
    return homeAdvantage >= 3 || awayAdvantage >= 3;
  };

  // Add function to toggle clear preferred filter
  const toggleClearPreferredFilter = () => {
    setFilters((prev) => ({
      ...prev,
      showOnlyClearPreferred: !prev.showOnlyClearPreferred,
    }));
  };

  // Add function to toggle grouping filter
  const toggleGroupingFilter = () => {
    setFilters((prev) => ({
      ...prev,
      enableGrouping: !prev.enableGrouping,
    }));
  };

  // Add function to handle group size change
  const handleGroupSizeChange = (size: number) => {
    setFilters((prev) => ({
      ...prev,
      groupSize: size,
    }));
  };

  // Function to get the preferred team from a match
  const getPreferredTeam = (match: Match): Team | null => {
    if (!hasClearPreferredTeam(match)) return null;

    // Calculate form points for both teams
    const homeFormPoints = calculateFormPoints(match.homeTeam.form || '');
    const awayFormPoints = calculateFormPoints(match.awayTeam.form || '');

    // Check head-to-head data
    const h2h = match.headToHead;
    const hasHeadToHeadAdvantage =
      h2h.matches > 0 && Math.abs(h2h.wins - h2h.losses) > 1;

    // Determine which team is preferred based on the metrics
    const homeAdvantage =
      Number(homeFormPoints > awayFormPoints) +
      Number(match.homeTeam.position < match.awayTeam.position) +
      Number(
        (match.homeTeam.scoringFirstWinRate || 0) >
          (match.awayTeam.scoringFirstWinRate || 0)
      ) +
      Number(hasHeadToHeadAdvantage && h2h.wins > h2h.losses);

    const awayAdvantage =
      Number(awayFormPoints > homeFormPoints) +
      Number(match.awayTeam.position < match.homeTeam.position) +
      Number(
        (match.awayTeam.scoringFirstWinRate || 0) >
          (match.homeTeam.scoringFirstWinRate || 0)
      ) +
      Number(hasHeadToHeadAdvantage && h2h.losses > h2h.wins);

    return homeAdvantage >= 3
      ? match.homeTeam
      : awayAdvantage >= 3
      ? match.awayTeam
      : null;
  };

  // Function to create batches of matches with clear preferred teams
  const createMatchGroups = (
    matches: Match[],
    groupSize: number
  ): Match[][] => {
    // Get only matches with clear preferred teams
    const eligibleMatches = matches.filter(hasClearPreferredTeam);

    // Score each match based on factors that increase winning probability
    const scoredMatches = eligibleMatches.map((match) => {
      // Calculate a winning probability score (0-100)
      let score = 0;

      // Start with the confidence score (0-100)
      score += match.confidenceScore;

      // Add points for larger position gaps (max +15)
      const positionGapPoints = Math.min(match.positionGap, 15);
      score += positionGapPoints;

      // Add points for form advantage (max +10)
      const homeFormPoints = calculateFormPoints(match.homeTeam.form || '');
      const awayFormPoints = calculateFormPoints(match.awayTeam.form || '');
      let formAdvantage = 0;
      if (match.favorite === 'home') {
        formAdvantage = homeFormPoints - awayFormPoints;
      } else if (match.favorite === 'away') {
        formAdvantage = awayFormPoints - homeFormPoints;
      }
      score += Math.min(Math.max(formAdvantage, 0), 10);

      // Add points for strong head-to-head advantage (max +10)
      const h2h = match.headToHead;
      if (h2h && h2h.matches > 0) {
        const h2hWinRate = h2h.wins / h2h.matches;
        if (h2hWinRate > 0.6) {
          score += Math.round(h2hWinRate * 10);
        }
      }

      // Add points for higher expected goals (max +10)
      if (match.expectedGoals > 2.5) {
        score += 10;
      } else if (match.expectedGoals > 2.0) {
        score += 5;
      } else if (match.expectedGoals > 1.5) {
        score += 3;
      }

      return {
        match,
        score,
        startTime: `${match.date} ${match.time}`,
      };
    });

    // Group by start time first to maintain time grouping
    const timeGroups: Record<string, typeof scoredMatches> = {};
    scoredMatches.forEach((scoredMatch) => {
      const key = scoredMatch.startTime;
      if (!timeGroups[key]) {
        timeGroups[key] = [];
      }
      timeGroups[key].push(scoredMatch);
    });

    // For each time group, sort by score (descending)
    Object.values(timeGroups).forEach((group) => {
      group.sort((a, b) => b.score - a.score);
    });

    // Flatten the time groups while maintaining time order
    const sortedMatches: Match[] = [];

    // Sort time groups by start time
    const sortedTimeKeys = Object.keys(timeGroups).sort();

    // For each time slot, add the top-scoring matches first
    sortedTimeKeys.forEach((timeKey) => {
      const matchesInTimeSlot = timeGroups[timeKey].map((m) => m.match);
      sortedMatches.push(...matchesInTimeSlot);
    });

    // Create groups of the specified size
    const groups: Match[][] = [];
    for (let i = 0; i < sortedMatches.length; i += groupSize) {
      const group = sortedMatches.slice(i, i + groupSize);
      if (group.length > 0) {
        groups.push(group);
      }
    }

    return groups;
  };

  // Function to copy preferred team names from a group
  const copyPreferredTeamNames = (matches: Match[]) => {
    const teamNames = matches
      .map((match) => {
        const preferredTeam = getPreferredTeam(match);
        return preferredTeam ? preferredTeam.name : null;
      })
      .filter(Boolean)
      .join('\n');

    // Also add matches to cart
    matches.forEach((match) => {
      const preferredTeam = getPreferredTeam(match);
      if (preferredTeam) {
        // Check if this match is already in cart
        const isInCart = isUpcomingMatchInCart(String(match.id));

        if (!isInCart) {
          // Create new team objects with required id properties
          const homeTeamWithId = {
            ...match.homeTeam,
            id: String(match.homeTeam.name.replace(/\s+/g, '_').toLowerCase()),
          };

          const awayTeamWithId = {
            ...match.awayTeam,
            id: String(match.awayTeam.name.replace(/\s+/g, '_').toLowerCase()),
          };

          // Add to cart with proper structure
          addUpcomingMatch({
            ...match,
            id: String(match.id),
            homeTeam: homeTeamWithId,
            awayTeam: awayTeamWithId,
          });
        }
      }
    });

    if (teamNames) {
      navigator.clipboard.writeText(teamNames);
      toast.success('Copied team names to clipboard and added to cart!');
    } else {
      toast.error('No preferred teams found in this group');
    }
  };

  // Helper function to calculate betting score for display purposes
  const calculateBettingScore = (match: Match): number => {
    // Calculate a winning probability score (0-100)
    let score = 0;

    // Start with the confidence score (0-100)
    score += match.confidenceScore;

    // Add points for larger position gaps (max +15)
    const positionGapPoints = Math.min(match.positionGap, 15);
    score += positionGapPoints;

    // Add points for form advantage (max +10)
    const homeFormPoints = calculateFormPoints(match.homeTeam.form || '');
    const awayFormPoints = calculateFormPoints(match.awayTeam.form || '');
    let formAdvantage = 0;
    if (match.favorite === 'home') {
      formAdvantage = homeFormPoints - awayFormPoints;
    } else if (match.favorite === 'away') {
      formAdvantage = awayFormPoints - homeFormPoints;
    }
    score += Math.min(Math.max(formAdvantage, 0), 10);

    // Add points for strong head-to-head advantage (max +10)
    const h2h = match.headToHead;
    if (h2h && h2h.matches > 0) {
      const h2hWinRate = h2h.wins / h2h.matches;
      if (h2hWinRate > 0.6) {
        score += Math.round(h2hWinRate * 10);
      }
    }

    // Add points for higher expected goals (max +10)
    if (match.expectedGoals > 2.5) {
      score += 10;
    } else if (match.expectedGoals > 2.0) {
      score += 5;
    } else if (match.expectedGoals > 1.5) {
      score += 3;
    }

    return Math.min(score, 100);
  };

  // Get betting score class based on the score
  const getBettingScoreClass = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 65) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Add a function to save cart items to database
  const saveToDatabase = async () => {
    const cartItems = useCartStore.getState().upcomingMatches;

    if (cartItems.length === 0) {
      toast.warning('No matches in cart to save!');
      return;
    }

    setIsSavingToDb(true);

    try {
      const result = await saveMatchesToDatabase(cartItems);

      if (result.success) {
        // Update the saved matches state
        const newSavedMatches = new Set(savedMatchIds);
        cartItems.forEach((match) => newSavedMatches.add(match.id));
        setSavedMatchIds(newSavedMatches);

        toast.success(`${result.message}`);
      } else {
        toast.error(`Failed to save matches: ${result.error}`);
      }
    } catch {
      toast.error('An error occurred while saving matches');
    } finally {
      setIsSavingToDb(false);
    }
  };

  if (isPredictionDataLoading) {
    return (
      <div className='max-w-full mx-auto p-4 bg-white rounded-lg shadow-sm'>
        <div className='flex flex-col items-center justify-center p-12 h-64'>
          <ClientOnlyLoader />
        </div>
      </div>
    );
  }

  if (predictionDataError) {
    return (
      <div className='max-w-full mx-auto p-4 bg-white rounded-lg shadow-sm'>
        <div className='bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg'>
          <h3 className='text-lg font-medium mb-2'>Error Loading Data</h3>
          <p className='mb-4'>{predictionDataError}</p>
          <button
            className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!upcomingMatches || upcomingMatches.length === 0) {
    return (
      <div className='max-w-full mx-auto p-4 bg-white rounded-lg shadow-sm'>
        <div className='bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg'>
          <h3 className='text-lg font-medium mb-2'>No Matches Available</h3>
          <p>
            There are no upcoming matches available at this time. Please check
            back later.
          </p>
        </div>
      </div>
    );
  }

  // Apply filters and sorting
  const filteredMatches = filterMatches(upcomingMatches);
  const sortedMatches = sortMatches(filteredMatches);

  return (
    <div className='max-w-[2000px] mx-auto p-4 bg-white rounded-lg shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-bold text-gray-800'>
          Over 1.5 Goals Predictor Dashboard
        </h1>

        <div className='flex items-center space-x-4'>
          <div className='bg-gray-50 px-3 py-1 rounded-lg border border-gray-200'>
            <span className='text-gray-500 mr-2'>Date:</span>
            <span className='text-gray-800'>{metadata?.date || 'N/A'}</span>
          </div>
          <div className='bg-gray-50 px-3 py-1 rounded-lg border border-gray-200'>
            <span className='text-gray-500 mr-2'>Matches:</span>
            <span className='text-gray-800'>{upcomingMatches.length}</span>
          </div>
          <div className='bg-gray-50 px-3 py-1 rounded-lg border border-gray-200'>
            <span className='text-gray-500 mr-2'>Filtered:</span>
            <span className='text-gray-800'>{sortedMatches.length}</span>
          </div>
          <div className='bg-gray-50 px-3 py-1 rounded-lg border border-gray-200'>
            <span className='text-gray-500 mr-2'>Selected:</span>
            <span className='text-gray-800'>
              {
                upcomingMatches.filter((match) => checkMatchInCart(match.id, 0))
                  .length
              }
            </span>
          </div>
          <button
            onClick={saveToDatabase}
            disabled={isSavingToDb}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isSavingToDb
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
            title='Save selected matches to database'
          >
            {isSavingToDb ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Database className='w-4 h-4 mr-2' />
                Save to Database
              </>
            )}
          </button>
        </div>
      </div>

      <div className='mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col'>
        <div className='flex items-start mb-3'>
          <Info size={20} className='text-blue-500 mr-2 mt-1 flex-shrink-0' />
          <p className='text-sm text-gray-600'>
            This dashboard shows upcoming matches with metrics indicating
            likelihood to score over 1.5 goals. Green cells indicate strong
            metrics, yellow are moderate, and red are weak. Click any row for
            details. Click column headers to sort by that metric.
          </p>
        </div>

        {/* Filters */}
        <div className='mt-2 bg-white p-3 rounded-lg border border-gray-200'>
          <div className='flex flex-wrap items-center gap-4'>
            {/* Basic Filters Group */}
            <div className='flex flex-col gap-2 border-r border-gray-200 pr-4'>
              <h4 className='text-xs font-medium text-gray-500'>
                Basic Filters
              </h4>
              <div className='flex gap-2'>
                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min Confidence
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minConfidence}
                    onChange={(e) =>
                      handleFilterChange(
                        'minConfidence',
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='60'>60%+</option>
                    <option value='70'>70%+</option>
                    <option value='80'>80%+</option>
                    <option value='90'>90%+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Favorite
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.favorite}
                    onChange={(e) =>
                      handleFilterChange('favorite', e.target.value)
                    }
                  >
                    <option value='all'>All</option>
                    <option value='home'>Home Teams</option>
                    <option value='away'>Away Teams</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Filters Group */}
            <div className='flex flex-col gap-2 border-r border-gray-200 pr-4'>
              <h4 className='text-xs font-medium text-gray-500'>
                Advanced Filters
              </h4>
              <div className='flex flex-wrap gap-2'>
                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min Position Gap
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.positionGap}
                    onChange={(e) =>
                      handleFilterChange(
                        'positionGap',
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='5'>5+</option>
                    <option value='10'>10+</option>
                    <option value='15'>15+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min Expected Goals
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minExpectedGoals}
                    onChange={(e) =>
                      handleFilterChange(
                        'minExpectedGoals',
                        parseFloat(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='1.5'>1.5+</option>
                    <option value='2.0'>2.0+</option>
                    <option value='2.5'>2.5+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min BTTS Rate
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minBttsRate}
                    onChange={(e) =>
                      handleFilterChange(
                        'minBttsRate',
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='40'>40%+</option>
                    <option value='50'>50%+</option>
                    <option value='60'>60%+</option>
                    <option value='70'>70%+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min Home Goals
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minHomeGoals}
                    onChange={(e) =>
                      handleFilterChange(
                        'minHomeGoals',
                        parseFloat(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='1.0'>1.0+</option>
                    <option value='1.5'>1.5+</option>
                    <option value='2.0'>2.0+</option>
                    <option value='2.5'>2.5+</option>
                    <option value='3.0'>3.0+</option>
                    <option value='3.5'>3.5+</option>
                    <option value='4.0'>4.0+</option>
                    <option value='4.5'>4.5+</option>
                    <option value='5.0'>5.0+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min Away Goals
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minAwayGoals}
                    onChange={(e) =>
                      handleFilterChange(
                        'minAwayGoals',
                        parseFloat(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='1.0'>1.0+</option>
                    <option value='1.5'>1.5+</option>
                    <option value='2.0'>2.0+</option>
                    <option value='2.5'>2.5+</option>
                    <option value='3.0'>3.0+</option>
                    <option value='3.5'>3.5+</option>
                    <option value='4.0'>4.0+</option>
                    <option value='4.5'>4.5+</option>
                    <option value='5.0'>5.0+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min H2H Matches
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minH2hMatchCount}
                    onChange={(e) =>
                      handleFilterChange(
                        'minH2hMatchCount',
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='2'>2+</option>
                    <option value='5'>5+</option>
                    <option value='10'>10+</option>
                  </select>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Min H2H Win Gap
                  </label>
                  <select
                    className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                    value={filters.minH2hWinGap}
                    onChange={(e) =>
                      handleFilterChange(
                        'minH2hWinGap',
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value='0'>All</option>
                    <option value='1'>1+</option>
                    <option value='2'>2+</option>
                    <option value='3'>3+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* View Filters Group */}
            <div className='flex flex-col gap-2 border-r border-gray-200 pr-4'>
              <h4 className='text-xs font-medium text-gray-500'>
                View Filters
              </h4>
              <div className='flex gap-2'>
                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Time Filter
                  </label>
                  <button
                    className={`px-3 py-1 text-sm rounded border ${
                      filters.showOnlyUpcoming
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                    onClick={toggleUpcomingFilter}
                    title={
                      filters.showOnlyUpcoming
                        ? getTimeRangeTooltip()
                        : 'Prioritizes matches from current hour through next 24 hours'
                    }
                  >
                    {filters.showOnlyUpcoming
                      ? 'Upcoming Matches'
                      : 'All Times'}
                  </button>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Cart Filter
                  </label>
                  <button
                    className={`px-3 py-1 text-sm rounded border ${
                      showOnlyCart
                        ? 'bg-green-600 text-white border-green-700'
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                    onClick={toggleCartFilter}
                    title={
                      showOnlyCart
                        ? 'Currently showing only matches in your cart'
                        : 'Currently showing all matches (click to show only cart items)'
                    }
                  >
                    {showOnlyCart ? 'Cart Items Only' : 'All Matches'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Filters Group */}
            <div className='flex flex-col gap-2'>
              <h4 className='text-xs font-medium text-gray-500'>
                Quality Filters
              </h4>
              <div className='flex gap-2'>
                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Clear Preferred
                  </label>
                  <button
                    className={`px-3 py-1 text-sm rounded border ${
                      filters.showOnlyClearPreferred
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                    onClick={toggleClearPreferredFilter}
                    title='Show only matches with clear preferred teams and complete data'
                  >
                    {filters.showOnlyClearPreferred
                      ? 'Clear Preferred Only'
                      : 'All Matches'}
                  </button>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Analytics
                  </label>
                  <button
                    className='px-3 py-1 text-sm rounded border bg-blue-500 text-white border-blue-600'
                    onClick={showMatchesByHour}
                    title='Show analytics of matches by date and hour'
                  >
                    Show Match Analytics
                  </button>
                </div>

                <div>
                  <label className='text-gray-500 text-xs block mb-1'>
                    Group Matches
                  </label>
                  <button
                    className={`px-3 py-1 text-sm rounded border ${
                      filters.enableGrouping
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                    onClick={toggleGroupingFilter}
                    title='Group matches with clear preferred teams for easy betting'
                  >
                    {filters.enableGrouping
                      ? 'Grouping Enabled'
                      : 'Enable Grouping'}
                  </button>
                </div>

                {filters.enableGrouping && (
                  <div>
                    <label className='text-gray-500 text-xs block mb-1'>
                      Group Size
                    </label>
                    <select
                      className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                      value={filters.groupSize}
                      onChange={(e) =>
                        handleGroupSizeChange(parseInt(e.target.value))
                      }
                    >
                      <option value='2'>2 Matches</option>
                      <option value='3'>3 Matches</option>
                      <option value='4'>4 Matches</option>
                      <option value='5'>5 Matches</option>
                      <option value='6'>6 Matches</option>
                      <option value='8'>8 Matches</option>
                      <option value='10'>10 Matches</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='ml-auto flex gap-2'>
              <button
                className='bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-1 text-sm'
                onClick={selectAllVisibleMatches}
                title='Select all visible matches'
              >
                Select All
              </button>
              <button
                className='bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-1 text-sm'
                onClick={clearAllSelectedMatches}
                title='Clear all selected matches'
              >
                Clear All
              </button>
              <button
                className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-1 text-sm'
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {filters.enableGrouping && (
        <div className='mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden'>
          <div className='bg-amber-50 px-4 py-2 border-b border-amber-200'>
            <h3 className='text-lg font-medium text-amber-800'>
              Grouped Matches with Clear Preferred Teams
            </h3>
            <p className='text-sm text-amber-700'>
              Matches are grouped by start time in batches of{' '}
              {filters.groupSize}. Click the copy button to copy the preferred
              team names.
            </p>
          </div>
          <div className='p-4'>
            {createMatchGroups(sortedMatches, filters.groupSize).map(
              (group, groupIndex) => (
                <div key={groupIndex} className='mb-6 last:mb-0'>
                  <div className='flex justify-between items-center mb-2'>
                    <h4 className='text-md font-medium text-gray-700'>
                      Group {groupIndex + 1} ({group.length} matches)
                    </h4>
                    <button
                      className='flex items-center gap-1 px-3 py-1 text-sm rounded bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                      onClick={() => copyPreferredTeamNames(group)}
                    >
                      <Copy size={14} />
                      Copy Team Names
                    </button>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                    {group.map((match) => {
                      const preferredTeam = getPreferredTeam(match);
                      const bettingScore = calculateBettingScore(match);
                      const scoreClass = getBettingScoreClass(bettingScore);

                      return (
                        <div
                          key={match.id}
                          className='bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div className='text-xs text-gray-500'>
                              {formatMatchDate(match.date, match.time)}
                            </div>
                            <div className='flex items-center gap-1'>
                              <div
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  match.favorite === 'home'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {match.favorite === 'home' ? 'Home' : 'Away'}{' '}
                                Favorite
                              </div>
                              <div
                                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${scoreClass}`}
                              >
                                {bettingScore}%
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-2 mb-1'>
                            <div className='w-5 h-5 relative'>
                              {renderTeamLogo(match.homeTeam.logo, 'sm')}
                            </div>
                            <div
                              className={`text-sm ${
                                preferredTeam?.id === match.homeTeam.id
                                  ? 'font-bold text-blue-700'
                                  : ''
                              }`}
                            >
                              {match.homeTeam.name}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-5 h-5 relative'>
                              {renderTeamLogo(match.awayTeam.logo, 'sm')}
                            </div>
                            <div
                              className={`text-sm ${
                                preferredTeam?.id === match.awayTeam.id
                                  ? 'font-bold text-purple-700'
                                  : ''
                              }`}
                            >
                              {match.awayTeam.name}
                            </div>
                          </div>
                          <div className='mt-2 text-xs text-gray-500'>
                            <div className='flex justify-between'>
                              <span>
                                Pos Gap:{' '}
                                <span className='font-medium'>
                                  {match.positionGap}
                                </span>
                              </span>
                              <span>
                                xGoals:{' '}
                                <span className='font-medium'>
                                  {match.expectedGoals.toFixed(1)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
            {createMatchGroups(sortedMatches, filters.groupSize).length ===
              0 && (
              <div className='bg-gray-50 p-4 rounded-lg text-center text-gray-600'>
                No matches with clear preferred teams found. Try adjusting your
                filters.
              </div>
            )}
          </div>
        </div>
      )}

      <div className='overflow-x-auto min-w-0'>
        <table className='w-full bg-white rounded-lg overflow-hidden border border-gray-200 min-w-[1500px] table-fixed'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='p-2 text-left whitespace-nowrap w-[50px]'></th>
              <th className='p-2 text-left whitespace-nowrap text-sm font-medium text-gray-500 w-[180px]'>
                Match
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[120px]'
                onClick={() => handleSort('matchTime')}
              >
                Date
                {sortField === 'matchTime' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[100px]'
                onClick={() => handleSort('homeAvg')}
              >
                Home Avg
                {sortField === 'homeAvg' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[70px]'
                onClick={() => handleSort('awayAvg')}
              >
                Away Avg
                {sortField === 'awayAvg' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[60px]'
                onClick={() => handleSort('positionGap')}
              >
                Pos Gap
                {sortField === 'positionGap' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[70px]'
                onClick={() => handleSort('homeAwayPosition')}
              >
                H/A Pos
                {sortField === 'homeAwayPosition' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[70px]'
                onClick={() => handleSort('homeAwayForm')}
              >
                H/A Form
                {sortField === 'homeAwayForm' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[80px]'
                onClick={() => handleSort('formPoints')}
              >
                Form Pts %
                {sortField === 'formPoints' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[60px]'
                onClick={() => handleSort('form')}
              >
                Form
                {sortField === 'form' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[60px]'
                onClick={() => handleSort('h2h')}
              >
                H2H
                {sortField === 'h2h' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[60px]'
                onClick={() => handleSort('expectedGoals')}
              >
                xGoals
                {sortField === 'expectedGoals' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[70px]'
                onClick={() => handleSort('odds.over15Goals')}
              >
                Over 1.5
                {sortField === 'odds.over15Goals' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[80px]'
                onClick={() => handleSort('defensiveStrength')}
              >
                Def Rating
                {sortField === 'defensiveStrength' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className='p-2 text-center whitespace-nowrap text-sm font-medium text-gray-500 w-[120px]'>
                Favorite
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[80px]'
                onClick={() => handleSort('confidenceScore')}
              >
                Confidence
                {sortField === 'confidenceScore' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[70px]'
                onClick={() => handleSort('bttsRate')}
              >
                BTTS %
                {sortField === 'bttsRate' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.map((match, index) => {
              const selectedFavoriteColor =
                match.favorite === 'home'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : match.favorite === 'away'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : 'bg-gray-50 text-gray-800 border border-gray-200';

              // Generate a truly unique key by always including index
              const uniqueKey = `match-${match.id}-${index}`;

              return (
                <React.Fragment key={uniqueKey}>
                  <tr
                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      expandedMatch === match.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() =>
                      setExpandedMatch(
                        expandedMatch === match.id ? null : match.id
                      )
                    }
                  >
                    <td className='p-2 w-[50px]'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMatchInCart(match.id, index);
                        }}
                        className={`w-6 h-6 rounded-full border ${
                          checkMatchInCart(match.id, index)
                            ? 'bg-green-100 border-green-300 text-green-600'
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        } flex items-center justify-center hover:bg-opacity-80 transition-colors duration-200`}
                      >
                        {checkMatchInCart(match.id, index) ? (
                          <Check size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    </td>
                    <td className='p-2 w-[180px]'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xl'>🏆</span>
                          <span className='font-medium text-gray-800 truncate'>
                            {match.homeTeam.name}
                          </span>
                          <span className='text-xs text-gray-500'>
                            ({match.homeTeam.position || '-'})
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-xl'>🏆</span>
                          <span className='font-medium text-gray-800 truncate'>
                            {match.awayTeam.name}
                          </span>
                          <span className='text-xs text-gray-500'>
                            ({match.awayTeam.position || '-'})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='p-2 text-center w-[120px]'>
                      <div className='text-gray-800 font-medium whitespace-nowrap text-sm'>
                        {formatMatchDate(match.date, match.time)}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[100px]'>
                      <div
                        className={`px-1.5 py-0.5 rounded text-sm inline-block ${getMetricColor(
                          match.homeTeam.homeAverageGoalsScored || 0,
                          { high: 1.8, medium: 1.3 }
                        )}`}
                      >
                        {Math.round(match.homeTeam.homeAverageGoalsScored || 0)}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[70px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                          match.awayTeam.awayAverageGoalsScored || 0,
                          { high: 1.4, medium: 1.0 }
                        )}`}
                      >
                        {Math.round(match.awayTeam.awayAverageGoalsScored || 0)}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[60px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                          match.positionGap,
                          { high: 10, medium: 5 }
                        )}`}
                      >
                        {match.positionGap}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[70px]'>
                      <div className='flex items-center justify-center gap-2 text-sm'>
                        <span className='px-2 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium'>
                          {match.homeTeam.position || '-'}
                        </span>
                        <span className='text-gray-500'>/</span>
                        <span className='px-2 py-1 rounded-lg bg-purple-50 text-purple-800 font-medium'>
                          {match.awayTeam.position || '-'}
                        </span>
                      </div>
                    </td>
                    <td className='p-2 text-center w-[70px]'>
                      <div className='flex flex-col gap-2'>
                        <div className='px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-sm font-medium'>
                          H:{' '}
                          {match.homeTeam.homeForm ||
                            match.homeTeam.form ||
                            '-'}
                        </div>
                        <div className='px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-sm font-medium'>
                          A:{' '}
                          {match.awayTeam.awayForm ||
                            match.awayTeam.form ||
                            '-'}
                        </div>
                      </div>
                    </td>
                    <td className='p-2 text-center w-[80px]'>
                      <div className='flex flex-col gap-1'>
                        <span className='px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800'>
                          {calculateFormPoints(match.homeTeam.form || '')}%
                        </span>
                        <span className='px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-800'>
                          {calculateFormPoints(match.awayTeam.form || '')}%
                        </span>
                      </div>
                    </td>
                    <td className='p-2 text-center w-[60px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getFormColor(
                          match.favorite === 'home'
                            ? match.homeTeam.form
                            : match.favorite === 'away'
                            ? match.awayTeam.form
                            : 'LLLLL'
                        )}`}
                      >
                        {match.favorite === 'home'
                          ? match.homeTeam.form
                          : match.favorite === 'away'
                          ? match.awayTeam.form
                          : '-'}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[60px]'>
                      {match.headToHead.matches > 0 ? (
                        <div
                          className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                            match.headToHead.wins / match.headToHead.matches,
                            { high: 0.7, medium: 0.4 }
                          )}`}
                        >
                          {match.headToHead.wins}-{match.headToHead.draws}-
                          {match.headToHead.losses}
                        </div>
                      ) : (
                        <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm'>
                          N/A
                        </div>
                      )}
                    </td>
                    <td className='p-2 text-center w-[60px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                          match.expectedGoals,
                          { high: 2.2, medium: 1.5 }
                        )}`}
                      >
                        {Math.round(match.expectedGoals)}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[70px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                          match.odds?.over15Goals || 0,
                          { high: 1.5, medium: 1.2 }
                        )}`}
                      >
                        {match.odds?.over15Goals?.toFixed(2) || 'N/A'}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[80px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                          1 / (match.defensiveStrength || 1),
                          { high: 1.2, medium: 1.0 }
                        )}`}
                      >
                        {match.defensiveStrength?.toFixed(2) || '-'}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[120px]'>
                      {match.favorite ? (
                        <div
                          className={`px-2 py-1 rounded-lg inline-flex items-center text-sm ${selectedFavoriteColor}`}
                        >
                          <span className='text-xl mr-2'>
                            {renderTeamLogo(
                              match.favorite === 'home'
                                ? match.homeTeam.logo
                                : match.awayTeam.logo,
                              'lg'
                            )}
                          </span>
                          <span className='truncate max-w-[80px]'>
                            {match.favorite === 'home'
                              ? match.homeTeam.name
                              : match.awayTeam.name}
                          </span>
                        </div>
                      ) : (
                        <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 text-sm'>
                          None
                        </div>
                      )}
                    </td>
                    <td className='p-2 text-center w-[80px]'>
                      <div
                        className={`px-2 py-1 rounded-lg flex items-center justify-between text-sm ${getMetricColor(
                          match.confidenceScore,
                          { high: 80, medium: 60 }
                        )}`}
                      >
                        <span>{match.confidenceScore}%</span>
                        {expandedMatch === match.id ? (
                          <ChevronUp size={14} className='ml-1' />
                        ) : (
                          <ChevronDown size={14} className='ml-1' />
                        )}
                      </div>
                    </td>
                    <td className='p-2 text-center w-[70px]'>
                      <div
                        className={`px-2 py-1 rounded-lg text-sm ${getMetricColor(
                          match.favorite === 'home'
                            ? match.homeTeam.bttsRate || 0
                            : match.favorite === 'away'
                            ? match.awayTeam.bttsRate || 0
                            : 0,
                          { high: 70, medium: 50 }
                        )}`}
                      >
                        {Math.round(
                          match.favorite === 'home'
                            ? match.homeTeam.bttsRate || 0
                            : match.favorite === 'away'
                            ? match.awayTeam.bttsRate || 0
                            : 0
                        )}
                        %
                      </div>
                    </td>
                  </tr>
                  {expandedMatch === match.id && (
                    <tr className='bg-gray-50/50'>
                      <td colSpan={17} className='p-4'>
                        <div className='border border-gray-100 rounded-lg bg-white p-4 shadow-sm space-y-4'>
                          {/* Win Probability & Head to Head */}
                          <div className='grid grid-cols-3 gap-4'>
                            <div className='col-span-2 bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                WIN PROBABILITY
                              </h4>
                              <div className='flex items-center justify-between'>
                                <div className='text-center'>
                                  <div
                                    className={`text-2xl font-bold ${
                                      match.favorite === 'home'
                                        ? 'text-blue-600 bg-blue-100 px-2 py-1 rounded-lg border border-blue-200'
                                        : 'text-blue-600'
                                    }`}
                                  >
                                    {(
                                      match.homeTeam.winPercentage || 0
                                    ).toFixed(0)}
                                    %
                                    {match.favorite === 'home' && (
                                      <div className='text-xs text-blue-800 mt-1'>
                                        Preferred
                                      </div>
                                    )}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    {match.homeTeam.name}
                                  </div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-gray-600'>
                                    {(
                                      100 -
                                      (match.homeTeam.winPercentage || 0) -
                                      (match.awayTeam.winPercentage || 0)
                                    ).toFixed(0)}
                                    %
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    DRAW
                                  </div>
                                </div>
                                <div className='text-center'>
                                  <div
                                    className={`text-2xl font-bold ${
                                      match.favorite === 'away'
                                        ? 'text-purple-600 bg-purple-100 px-2 py-1 rounded-lg border border-purple-200'
                                        : 'text-purple-600'
                                    }`}
                                  >
                                    {(
                                      match.awayTeam.winPercentage || 0
                                    ).toFixed(0)}
                                    %
                                    {match.favorite === 'away' && (
                                      <div className='text-xs text-purple-800 mt-1'>
                                        Preferred
                                      </div>
                                    )}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    {match.awayTeam.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                HEAD TO HEAD
                                {match.favorite && (
                                  <span
                                    className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                                      match.favorite === 'home'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                  >
                                    {match.favorite === 'home'
                                      ? match.homeTeam.name
                                      : match.awayTeam.name}{' '}
                                    Preferred
                                  </span>
                                )}
                              </h4>
                              <div className='flex justify-between items-center'>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-blue-600'>
                                    {match.headToHead?.wins || 0}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    WINS
                                  </div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-gray-600'>
                                    {match.headToHead?.draws || 0}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    DRAWS
                                  </div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-purple-600'>
                                    {match.headToHead?.losses || 0}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    LOSSES
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Match Info Grid */}
                          <div className='grid grid-cols-4 gap-4'>
                            {/* Date & Time */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                MATCH INFO
                              </h4>
                              <div className='space-y-1'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-gray-500'>
                                    Date:
                                  </span>
                                  <span className='text-sm font-medium'>
                                    {match.date}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-gray-500'>
                                    Time:
                                  </span>
                                  <span className='text-sm font-medium'>
                                    {match.time}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-gray-500'>
                                    Venue:
                                  </span>
                                  <span className='text-sm font-medium'>
                                    {match.venue}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Form Stats */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                FORM & POINTS
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-blue-600'>
                                    HOME
                                  </span>
                                  <div>
                                    <span className='text-sm font-medium'>
                                      {match.homeTeam.form || '-'}
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (
                                      {calculateFormPoints(match.homeTeam.form)}
                                      %)
                                    </span>
                                  </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-purple-600'>
                                    AWAY
                                  </span>
                                  <div>
                                    <span className='text-sm font-medium'>
                                      {match.awayTeam.form || '-'}
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (
                                      {calculateFormPoints(match.awayTeam.form)}
                                      %)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Goals Stats */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                GOALS STATS
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-blue-600'>
                                    HOME
                                  </span>
                                  <div>
                                    <span className='text-sm font-medium'>
                                      {match.homeTeam.averageGoalsScored?.toFixed(
                                        1
                                      )}
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      Scored/Game
                                    </span>
                                  </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-purple-600'>
                                    AWAY
                                  </span>
                                  <div>
                                    <span className='text-sm font-medium'>
                                      {match.awayTeam.averageGoalsScored?.toFixed(
                                        1
                                      )}
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      Scored/Game
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Position Info */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                POSITION (GAP: {match.positionGap || 0})
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-blue-600'>
                                    HOME
                                  </span>
                                  <span
                                    className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                      match.favorite === 'home'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {match.homeTeam.position || '-'}
                                  </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-purple-600'>
                                    AWAY
                                  </span>
                                  <span
                                    className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                      match.favorite === 'away'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {match.awayTeam.position || '-'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className='grid grid-cols-4 gap-4'>
                            {/* Clean Sheets */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                CLEAN SHEETS
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-blue-600'>
                                    HOME
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(
                                        match.homeTeam.cleanSheetRate || 0
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      ({match.homeTeam.cleanSheets || 0})
                                    </span>
                                  </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-purple-600'>
                                    AWAY
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(
                                        match.awayTeam.cleanSheetRate || 0
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      ({match.awayTeam.cleanSheets || 0})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Win Rates */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                WIN RATES
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-blue-600'>
                                    HOME
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(
                                        match.homeTeam.homeWinPercentage || 0
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (home)
                                    </span>
                                  </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-purple-600'>
                                    AWAY
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(
                                        match.awayTeam.awayWinPercentage || 0
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (away)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Scoring Patterns */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                SCORING PATTERNS
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-blue-600'>
                                    HOME
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(
                                        match.scoringPatterns
                                          ?.homeFirstGoalRate || 0
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (1st)
                                    </span>
                                  </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-purple-600'>
                                    AWAY
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(
                                        match.scoringPatterns
                                          ?.awayFirstGoalRate || 0
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (1st)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* BTTS & Over Stats */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                BTTS & OVERS
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-gray-500'>
                                    BTTS
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(match.homeTeam.bttsRate || 0).toFixed(
                                        0
                                      )}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (H)
                                    </span>
                                    <span className='text-sm font-bold ml-2'>
                                      {(match.awayTeam.bttsRate || 0).toFixed(
                                        0
                                      )}
                                      %
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (A)
                                    </span>
                                  </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                  <span className='text-xs text-gray-500'>
                                    OVER 1.5
                                  </span>
                                  <div>
                                    <span className='text-sm font-bold'>
                                      {(match.homeTeam.over15 || 0).toFixed(0)}%
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (H)
                                    </span>
                                    <span className='text-sm font-bold ml-2'>
                                      {(match.awayTeam.over15 || 0).toFixed(0)}%
                                    </span>
                                    <span className='text-xs text-gray-500 ml-1'>
                                      (A)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Stats */}
                          <div className='grid grid-cols-3 gap-4'>
                            {/* Expected Goals & Confidence */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <div className='flex justify-between items-center'>
                                <div>
                                  <h4 className='text-xs font-medium text-gray-500 mb-1'>
                                    EXPECTED GOALS
                                  </h4>
                                  <div className='text-2xl font-bold text-gray-700'>
                                    {match.expectedGoals?.toFixed(1) || '-'}
                                  </div>
                                </div>
                                <div>
                                  <h4 className='text-xs font-medium text-gray-500 mb-1'>
                                    CONFIDENCE
                                  </h4>
                                  <div
                                    className={`text-2xl font-bold ${
                                      match.confidenceScore >= 80
                                        ? 'text-green-600'
                                        : match.confidenceScore >= 60
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {match.confidenceScore}%
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Odds */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                ODDS
                              </h4>
                              <div className='flex justify-between items-center'>
                                <div className='text-center'>
                                  <div className='text-sm font-bold'>
                                    {match.odds?.homeWin?.toFixed(2) || '-'}
                                  </div>
                                  <div className='text-xs text-gray-500'>1</div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-sm font-bold'>
                                    {match.odds?.draw?.toFixed(2) || '-'}
                                  </div>
                                  <div className='text-xs text-gray-500'>X</div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-sm font-bold'>
                                    {match.odds?.awayWin?.toFixed(2) || '-'}
                                  </div>
                                  <div className='text-xs text-gray-500'>2</div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-sm font-bold'>
                                    {match.odds?.over15Goals?.toFixed(2) || '-'}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    O1.5
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Recent H2H */}
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                RECENT H2H
                              </h4>
                              <div className='space-y-1 text-xs'>
                                {match.headToHead?.recentMatches
                                  ?.slice(0, 3)
                                  .map((h2h, idx) => (
                                    <div
                                      key={idx}
                                      className='flex justify-between items-center'
                                    >
                                      <span className='text-gray-600'>
                                        {h2h.date.substring(0, 10)}
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          h2h.result === 'W'
                                            ? 'text-green-600'
                                            : h2h.result === 'D'
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                        }`}
                                      >
                                        {h2h.result}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Key Insights */}
                          {match.reasonsForPrediction &&
                            match.reasonsForPrediction.length > 0 && (
                              <div className='bg-gray-50 rounded-lg p-3'>
                                <h4 className='text-xs font-medium text-gray-500 mb-2'>
                                  KEY INSIGHTS
                                </h4>
                                <ul className='text-xs text-gray-600 space-y-1'>
                                  {match.reasonsForPrediction.map(
                                    (reason, idx) => (
                                      <li
                                        key={idx}
                                        className='flex items-start'
                                      >
                                        <span className='text-blue-500 mr-2'>
                                          •
                                        </span>
                                        {reason}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-xl mx-4 w-full max-w-2xl max-h-[80vh] overflow-auto'>
            <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
              <h2 className='text-xl font-bold text-gray-800'>
                Match Analytics
              </h2>
              <button
                className='text-gray-400 hover:text-gray-600 focus:outline-none'
                onClick={() => setShowAnalyticsModal(false)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {Object.keys(analyticsData).map((dateGroup) => (
                <div key={dateGroup} className='mb-6'>
                  <div className='flex items-center mb-3'>
                    <h3 className='text-lg font-semibold text-gray-700'>
                      {dateGroup}
                    </h3>
                    <div className='ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
                      {analyticsData[dateGroup].total} matches
                    </div>
                  </div>

                  {analyticsData[dateGroup].total === 0 ? (
                    <p className='text-gray-500 italic'>No matches scheduled</p>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                      {Object.keys(analyticsData[dateGroup].hourData)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((hour) => {
                          const count = analyticsData[dateGroup].hourData[hour];
                          const formattedHour = `${hour}:00`;

                          // Calculate percentage for the progress bar
                          const maxCount = Math.max(
                            ...Object.values(analyticsData[dateGroup].hourData)
                          );
                          const percentage = Math.round(
                            (count / maxCount) * 100
                          );

                          return (
                            <div
                              key={hour}
                              className='bg-gray-50 rounded-lg p-3 border border-gray-200'
                            >
                              <div className='flex justify-between items-center mb-2'>
                                <span className='font-medium text-gray-700'>
                                  {formattedHour}
                                </span>
                                <span className='text-blue-600 font-semibold'>
                                  {count} matches
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2.5'>
                                <div
                                  className='bg-blue-600 h-2.5 rounded-full'
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className='border-t border-gray-200 p-4 flex justify-end'>
              <button
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                onClick={() => setShowAnalyticsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors'
        >
          <ArrowUpCircle size={24} />
        </button>
      )}

      <ToastContainer position='bottom-right' autoClose={3000} />
    </div>
  );
};

export default MatchPredictor;
