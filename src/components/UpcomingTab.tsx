import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Plus,
  Loader2,
  ArrowUp
} from 'lucide-react';
import { useCartStore } from '@/hooks/useStore';

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

  // Get cart functions from the global store
  const { predictionData, isPredictionDataLoaded } = useCartStore();

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
          logo: '🏆', // Add default logo
          avgHomeGoals: upcomingMatch.homeTeam.avgHomeGoals || 0,
          avgAwayGoals: upcomingMatch.homeTeam.avgAwayGoals || 0,
          avgTotalGoals: upcomingMatch.homeTeam.avgTotalGoals || 0,
          homeMatchesOver15: 0,
          awayMatchesOver15: 0,
          totalHomeMatches: 0,
          totalAwayMatches: 0,
          form: upcomingMatch.homeTeam.form,
          homeForm: upcomingMatch.homeTeam.homeForm,
          cleanSheets: upcomingMatch.homeTeam.cleanSheets || 0,
          homeCleanSheets: 0,
          awayCleanSheets: 0,
          scoringFirstWinRate: 0,
          concedingFirstWinRate: 0,
          firstHalfGoalsPercent: 0,
          secondHalfGoalsPercent: 0,
          avgCorners: 0,
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
          logo: '🏆', // Add default logo
          avgHomeGoals: upcomingMatch.awayTeam.avgHomeGoals || 0,
          avgAwayGoals: upcomingMatch.awayTeam.avgAwayGoals || 0,
          avgTotalGoals: upcomingMatch.awayTeam.avgTotalGoals || 0,
          homeMatchesOver15: 0,
          awayMatchesOver15: 0,
          totalHomeMatches: 0,
          totalAwayMatches: 0,
          form: upcomingMatch.awayTeam.form,
          awayForm: upcomingMatch.awayTeam.awayForm,
          cleanSheets: upcomingMatch.awayTeam.cleanSheets || 0,
          homeCleanSheets: 0,
          awayCleanSheets: 0,
          scoringFirstWinRate: 0,
          concedingFirstWinRate: 0,
          firstHalfGoalsPercent: 0,
          secondHalfGoalsPercent: 0,
          avgCorners: 0,
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
  const toggleMatchInCart = (id: string | number): void => {
    const newSelectedMatches = [...upcomingMatches];
    const matchIndex = newSelectedMatches.findIndex((match) => match.id === id);

    if (matchIndex === -1) {
      newSelectedMatches.push(upcomingMatches[matchIndex]);
    } else {
      newSelectedMatches.splice(matchIndex, 1);
    }

    setUpcomingMatches(newSelectedMatches);
  };

  const checkMatchInCart = (id: string | number): boolean => {
    return upcomingMatches.some((match) => match.id === id);
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
    let filteredMatches = [...matches];

    // Apply basic filters
    filteredMatches = filteredMatches.filter((match) => {
      const meetsConfidence = match.confidenceScore >= filters.minConfidence;
      const meetsPositionGap = match.positionGap >= filters.positionGap;
      const meetsExpectedGoals =
        match.expectedGoals >= filters.minExpectedGoals;
      const meetsFavorite =
        filters.favorite === 'all' || match.favorite === filters.favorite;

      return (
        meetsConfidence &&
        meetsPositionGap &&
        meetsExpectedGoals &&
        meetsFavorite
      );
    });

    // Apply time window filter
    filteredMatches = applyTimeWindowFilter(filteredMatches);

    // Apply cart filter if enabled
    if (showOnlyCart) {
      filteredMatches = filteredMatches.filter((match) =>
        checkMatchInCart(match.id)
      );
    }

    return filteredMatches;
  };

  const applyTimeWindowFilter = (matches: Match[]): Match[] => {
    return filterByTimeWindow(matches, 24);
  };

  const filterByTimeWindow = (matches: Match[], windowHours: number) => {
    const now = new Date();
    const endTime = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

    return matches.filter((match) => {
      const matchDateTime = new Date(`${match.date}T${match.time}`);
      return matchDateTime >= now && matchDateTime <= endTime;
    });
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
    const visibleMatches = upcomingMatches.filter((match) => {
      const matchDateTime = new Date(`${match.date}T${match.time}`);
      const now = new Date();
      return matchDateTime >= now;
    });

    setUpcomingMatches(visibleMatches);
  };

  // Add a function to clear all selected matches
  const clearAllSelectedMatches = () => {
    setUpcomingMatches([]);
  };

  // Update the reset filters function to include the new filter
  const resetFilters = () => {
    setFilters({
      minConfidence: 0,
      favorite: 'all',
      positionGap: 0,
      minExpectedGoals: 0,
      showOnlyUpcoming: false,
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
    setShowOnlyCart(newValue);
  };

  // Update tooltip to reflect adaptive time window
  const getTimeRangeTooltip = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return `Showing matches from ${now.toLocaleString()} to ${endTime.toLocaleString()}`;
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
        // Try parsing with T separator first
        matchDateTime = new Date(`${date}T${time}`);

        // If that fails, try with space separator
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
        })}`;
      } else if (matchDateTime.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${matchDateTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      } else {
        // If not today or tomorrow, show the full date
        return matchDateTime.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch (error) {
      console.error('Error formatting match date:', error);
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
            <span className='text-gray-500 mr-2'>Selected:</span>
            <span className='text-gray-800'>
              {
                upcomingMatches.filter((match) => checkMatchInCart(match.id))
                  .length
              }
            </span>
          </div>
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
            <div>
              <label className='text-gray-500 text-xs block mb-1'>
                Min Confidence
              </label>
              <select
                className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                value={filters.minConfidence}
                onChange={(e) =>
                  handleFilterChange('minConfidence', parseInt(e.target.value))
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
                onChange={(e) => handleFilterChange('favorite', e.target.value)}
              >
                <option value='all'>All</option>
                <option value='home'>Home Teams</option>
                <option value='away'>Away Teams</option>
              </select>
            </div>

            <div>
              <label className='text-gray-500 text-xs block mb-1'>
                Min Position Gap
              </label>
              <select
                className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                value={filters.positionGap}
                onChange={(e) =>
                  handleFilterChange('positionGap', parseInt(e.target.value))
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
                {filters.showOnlyUpcoming ? 'Upcoming Matches' : 'All Times'}
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
              <th className='p-2 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 w-[70px]'>
                H/A Pos
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
            {filterMatches(sortMatches(upcomingMatches)).map((match, index) => {
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
                          toggleMatchInCart(match.id);
                        }}
                        className={`w-6 h-6 rounded-full border ${
                          checkMatchInCart(match.id)
                            ? 'bg-green-100 border-green-300 text-green-600'
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        } flex items-center justify-center hover:bg-opacity-80 transition-colors duration-200`}
                      >
                        {checkMatchInCart(match.id) ? (
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
                                  <div className='text-2xl font-bold text-blue-600'>
                                    {(
                                      match.homeTeam.winPercentage || 0
                                    ).toFixed(0)}
                                    %
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
                                  <div className='text-2xl font-bold text-purple-600'>
                                    {(
                                      match.awayTeam.winPercentage || 0
                                    ).toFixed(0)}
                                    %
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
          className='fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-opacity duration-300'
          aria-label='Scroll to top'
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default MatchPredictor;
