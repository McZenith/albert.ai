import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Plus,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/hooks/useStore';

interface Team {
  name: string;
  position: number;
  logo: string;
  avgHomeGoals?: number;
  avgAwayGoals?: number;
  avgTotalGoals: number;
  homeMatchesOver15?: number;
  awayMatchesOver15?: number;
  totalHomeMatches?: number;
  totalAwayMatches?: number;
  form: string;
  homeForm?: string;
  awayForm?: string;
  cleanSheets: number;
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
  homeAverageGoalsScored?: number;
  awayAverageGoalsScored?: number;
  averageGoalsScored?: number;
  homeAverageGoalsConceded?: number;
  awayAverageGoalsConceded?: number;
  averageGoalsConceded?: number;
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
}

interface HeadToHead {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  recentMatches?: {
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
  odds?: Odds;
  cornerStats?: CornerStats;
  scoringPatterns?: ScoringPatterns;
  reasonsForPrediction: string[];
}

interface Filters {
  minConfidence: number;
  favorite: 'all' | 'home' | 'away';
  positionGap: number;
  minExpectedGoals: number;
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

// New interface for the response structure with nested data
interface ApiResponseWrapper {
  data?: ApiResponse;
  cache?: {
    isCached: boolean;
    lastUpdated: string;
    cacheAge: number;
    nextRefresh: string;
    error?: string;
  };
}

// Helper function to render team logo
const renderTeamLogo = (
  logo: string | number,
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
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

// Let's enhance cleanTeamName to handle more formats and be more robust
const enhancedCleanTeamName = (name: string): string => {
  // More thorough cleaning to remove IDs and clean up names
  if (!name) return '';

  // Remove numeric IDs at beginning followed by space
  // Also handle cases where the entire name might be a numeric ID
  const cleanedName = name.replace(/^\d+\s+/, '').trim();

  // If all that's left is empty or just numbers, return something meaningful
  if (!cleanedName || /^\d+$/.test(cleanedName)) {
    return 'Team ' + name.trim(); // Return "Team" followed by the original ID
  }

  return cleanedName;
};

const MatchPredictor = () => {
  const [expandedMatch, setExpandedMatch] = useState<string | number | null>(
    () => {
      // Initialize expandedMatch from localStorage if available
      if (typeof window !== 'undefined') {
        const savedExpandedMatch = localStorage.getItem('expandedMatch');
        // Convert to number if it's a numeric string, otherwise return the string or null
        if (savedExpandedMatch) {
          if (!isNaN(Number(savedExpandedMatch))) {
            return Number(savedExpandedMatch);
          }
          return savedExpandedMatch;
        }
      }
      return null;
    }
  );
  const [sortField, setSortField] = useState<string>(() => {
    // Initialize sortField from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('upcomingSortField') || 'confidenceScore';
    }
    return 'confidenceScore';
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    // Initialize sortDirection from localStorage if available
    if (typeof window !== 'undefined') {
      return (
        (localStorage.getItem('upcomingSortDirection') as 'asc' | 'desc') ||
        'desc'
      );
    }
    return 'desc';
  });
  const [filters, setFilters] = useState<Filters>(() => {
    // Initialize filters from localStorage if available
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('upcomingFilters');
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters) as Filters;
        } catch (e) {
          console.error('Failed to parse saved filters', e);
        }
      }
    }
    return {
      minConfidence: 0,
      favorite: 'all',
      positionGap: 0,
      minExpectedGoals: 0,
    };
  });

  // Save expandedMatch to localStorage whenever it changes
  useEffect(() => {
    if (expandedMatch !== null) {
      localStorage.setItem('expandedMatch', String(expandedMatch));
    } else {
      localStorage.removeItem('expandedMatch');
    }
  }, [expandedMatch]);

  // Save sort and filter state to localStorage
  useEffect(() => {
    localStorage.setItem('upcomingSortField', sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem('upcomingSortDirection', sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    localStorage.setItem('upcomingFilters', JSON.stringify(filters));
  }, [filters]);

  // New states for API data
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [metadata, setMetadata] = useState<ApiResponse['metadata'] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get cart functions from the global store
  const { addUpcomingMatch, removeUpcomingMatch, isUpcomingMatchInCart } =
    useCartStore();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/prediction-data');

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const responseJson = (await response.json()) as ApiResponseWrapper;

        // Handle both the new and old response structure
        const data = responseJson.data || (responseJson as ApiResponse);

        // Clean team names in the data before setting state
        const cleanedMatches = data.upcomingMatches.map((match) => {
          // Helper function to safely convert to number
          const safeNumber = (value: unknown) => {
            const num = Number(value);
            return !isNaN(num) ? num : 0;
          };

          // Use alternative goal statistic fields if available
          const homeTeamData = {
            ...match.homeTeam,
            name: enhancedCleanTeamName(match.homeTeam.name),
            // Prioritize homeAverageGoalsScored over avgHomeGoals when available
            avgHomeGoals:
              safeNumber(match.homeTeam.homeAverageGoalsScored) ||
              safeNumber(match.homeTeam.averageGoalsScored) ||
              safeNumber(match.homeTeam.avgHomeGoals),
            // Prioritize homeAverageGoalsConceded for away goals when available
            avgAwayGoals:
              safeNumber(match.homeTeam.awayAverageGoalsScored) ||
              safeNumber(match.homeTeam.averageGoalsScored) ||
              safeNumber(match.homeTeam.avgAwayGoals),
            avgTotalGoals: safeNumber(match.homeTeam.avgTotalGoals),
          };

          const awayTeamData = {
            ...match.awayTeam,
            name: enhancedCleanTeamName(match.awayTeam.name),
            // Prioritize awayAverageGoalsScored over avgHomeGoals when available
            avgHomeGoals:
              safeNumber(match.awayTeam.homeAverageGoalsScored) ||
              safeNumber(match.awayTeam.averageGoalsScored) ||
              safeNumber(match.awayTeam.avgHomeGoals),
            // Prioritize awayAverageGoalsConceded for away goals when available
            avgAwayGoals:
              safeNumber(match.awayTeam.awayAverageGoalsScored) ||
              safeNumber(match.awayTeam.averageGoalsScored) ||
              safeNumber(match.awayTeam.avgAwayGoals),
            avgTotalGoals: safeNumber(match.awayTeam.avgTotalGoals),
          };

          return {
            ...match,
            homeTeam: homeTeamData,
            awayTeam: awayTeamData,
          };
        });

        // Log the first match to verify data
        if (cleanedMatches.length > 0) {
          console.log('First match home team:', cleanedMatches[0].homeTeam);
          console.log('First match away team:', cleanedMatches[0].awayTeam);
        }

        setUpcomingMatches(cleanedMatches);
        setMetadata(data.metadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching prediction data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh data every 3 hours
    const refreshInterval = setInterval(fetchData, 3 * 60 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const toggleMatchInCart = (id: string | number, index: number): void => {
    const matchToAdd = upcomingMatches.find((m) => m.id === id);
    if (!matchToAdd) return;

    // Generate a unique ID if the match ID is 0
    const uniqueId = id === 0 ? `match-${index}` : id;

    if (isUpcomingMatchInCart(uniqueId)) {
      // Remove from cart if already there
      removeUpcomingMatch(uniqueId);
    } else {
      // Add to cart if not there, ensure it has a unique ID
      if (id === 0) {
        // Clone the match and assign a unique ID
        const matchWithUniqueId = { ...matchToAdd, id: uniqueId };
        addUpcomingMatch(matchWithUniqueId);
      } else {
        addUpcomingMatch(matchToAdd);
      }
    }
  };

  const checkMatchInCart = (id: string | number, index: number): boolean => {
    const uniqueId = id === 0 ? `match-${index}` : id;
    return isUpcomingMatchInCart(uniqueId);
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
      let aValue: number, bValue: number;

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
      } else {
        // Convert to unknown first, then to Record<string, number>
        aValue = (a as unknown as Record<string, number>)[sortField] || 0;
        bValue = (b as unknown as Record<string, number>)[sortField] || 0;
      }

      // Compare based on direction
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  // Filter function for matches
  const filterMatches = (matches: Match[]): Match[] => {
    return matches.filter((match) => {
      // Filter by confidence score
      if (match.confidenceScore < filters.minConfidence) return false;

      // Filter by favorite
      if (filters.favorite !== 'all' && match.favorite !== filters.favorite)
        return false;

      // Filter by position gap
      if (match.positionGap < filters.positionGap) return false;

      // Filter by expected goals
      if (match.expectedGoals < filters.minExpectedGoals) return false;

      return true;
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

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center p-12 h-64'>
        <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
        <p className='text-gray-600'>Loading prediction data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg'>
        <h3 className='text-lg font-medium mb-2'>Error Loading Data</h3>
        <p className='mb-4'>{error}</p>
        <button
          className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!upcomingMatches || upcomingMatches.length === 0) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg'>
        <h3 className='text-lg font-medium mb-2'>No Matches Available</h3>
        <p>
          There are no upcoming matches available at this time. Please check
          back later.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-full mx-auto p-4 bg-white rounded-lg shadow-sm'>
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
                upcomingMatches.filter((match) => checkMatchInCart(match.id, 0))
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

            <div className='ml-auto'>
              <button
                className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-1 text-sm'
                onClick={() =>
                  setFilters({
                    minConfidence: 0,
                    favorite: 'all',
                    positionGap: 0,
                    minExpectedGoals: 0,
                  })
                }
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full bg-white rounded-lg overflow-hidden border border-gray-200'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='p-3 text-left whitespace-nowrap'></th>
              <th className='p-3 text-left whitespace-nowrap text-sm font-medium text-gray-500 min-w-[200px]'>
                Match
              </th>
              <th className='p-3 text-center whitespace-nowrap text-sm font-medium text-gray-500 min-w-[80px]'>
                Date
              </th>
              <th
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[70px]'
                onClick={() => handleSort('positionGap')}
              >
                Pos Gap
                {sortField === 'positionGap' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'>
                H/A Pos
              </th>
              <th
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[100px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[100px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[110px]'
                onClick={() => handleSort('defensiveStrength')}
              >
                Def Rating
                {sortField === 'defensiveStrength' && (
                  <span className='ml-1'>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className='p-3 text-center whitespace-nowrap text-sm font-medium text-gray-500 min-w-[150px]'>
                Favorite
              </th>
              <th
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[100px]'
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
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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

              // Generate a unique key for the match
              const uniqueKey = match.id === 0 ? `match-${index}` : match.id;

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
                    <td className='p-3'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMatchInCart(match.id, index);
                        }}
                        className={`w-6 h-6 rounded-full border ${
                          checkMatchInCart(match.id, index)
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        } flex items-center justify-center`}
                      >
                        {checkMatchInCart(match.id, index) ? (
                          <Check size={14} />
                        ) : (
                          <Plus size={14} className='text-gray-500' />
                        )}
                      </button>
                    </td>
                    <td className='p-3'>
                      <div className='flex flex-col'>
                        <div className='flex items-center'>
                          <span className='text-xl mr-2'>
                            {renderTeamLogo(match.homeTeam.logo)}
                          </span>
                          <span className='font-medium text-gray-800'>
                            {match.homeTeam.name}
                          </span>
                          <span className='text-xs text-gray-500 ml-2'>
                            ({match.homeTeam.position})
                          </span>
                        </div>
                        <div className='flex items-center mt-1'>
                          <span className='text-xl mr-2'>
                            {renderTeamLogo(match.awayTeam.logo)}
                          </span>
                          <span className='font-medium text-gray-800'>
                            {match.awayTeam.name}
                          </span>
                          <span className='text-xs text-gray-500 ml-2'>
                            ({match.awayTeam.position})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='p-3 text-center whitespace-nowrap'>
                      <div className='text-gray-800'>
                        {new Date(match.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className='text-gray-500 text-sm'>{match.time}</div>
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          (match.homeTeam.avgHomeGoals ?? 0) > 0
                            ? match.homeTeam.avgHomeGoals ?? 0
                            : (match.expectedGoals ?? 0) / 2, // Distribute expected goals between home/away
                          { high: 1.8, medium: 1.3 }
                        )}`}
                      >
                        {((match.homeTeam.avgHomeGoals ?? 0) > 0
                          ? match.homeTeam.avgHomeGoals ?? 0
                          : (match.expectedGoals ?? 0) / 2
                        ).toFixed(2)}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          (match.awayTeam.avgAwayGoals ?? 0) > 0
                            ? match.awayTeam.avgAwayGoals ?? 0
                            : (match.expectedGoals ?? 0) / 2, // Distribute expected goals between home/away
                          { high: 1.4, medium: 1.0 }
                        )}`}
                      >
                        {((match.awayTeam.avgAwayGoals ?? 0) > 0
                          ? match.awayTeam.avgAwayGoals ?? 0
                          : (match.expectedGoals ?? 0) / 2
                        ).toFixed(2)}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          match.positionGap,
                          { high: 10, medium: 5 }
                        )}`}
                      >
                        {match.positionGap}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div className='flex items-center justify-center gap-1 text-sm'>
                        <span className='px-2 py-1 rounded-lg bg-blue-50 text-blue-800'>
                          {match.homeTeam.position}
                        </span>
                        <span className='text-gray-500'>/</span>
                        <span className='px-2 py-1 rounded-lg bg-purple-50 text-purple-800'>
                          {match.awayTeam.position}
                        </span>
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div className='flex flex-col gap-1'>
                        <div
                          className={`px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs`}
                        >
                          H: {match.homeTeam.homeForm || '-'}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs`}
                        >
                          A: {match.awayTeam.awayForm || '-'}
                        </div>
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div className='flex items-center justify-center gap-1 text-sm'>
                        <span
                          className={`px-2 py-1 rounded-lg ${
                            calculateFormPoints(match.homeTeam.form) >= 60
                              ? 'bg-green-50 text-green-800'
                              : calculateFormPoints(match.homeTeam.form) >= 40
                              ? 'bg-yellow-50 text-yellow-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {calculateFormPoints(match.homeTeam.form)}%
                        </span>
                        <span className='text-gray-500'>/</span>
                        <span
                          className={`px-2 py-1 rounded-lg ${
                            calculateFormPoints(match.awayTeam.form) >= 60
                              ? 'bg-green-50 text-green-800'
                              : calculateFormPoints(match.awayTeam.form) >= 40
                              ? 'bg-yellow-50 text-yellow-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {calculateFormPoints(match.awayTeam.form)}%
                        </span>
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getFormColor(
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
                    <td className='p-3 text-center'>
                      {match.headToHead.matches > 0 ? (
                        <div
                          className={`px-2 py-1 rounded-lg ${getMetricColor(
                            match.headToHead.wins / match.headToHead.matches,
                            { high: 0.7, medium: 0.4 }
                          )}`}
                        >
                          {match.headToHead.wins}-{match.headToHead.draws}-
                          {match.headToHead.losses}
                        </div>
                      ) : (
                        <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600'>
                          N/A
                        </div>
                      )}
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          match.expectedGoals,
                          { high: 2.2, medium: 1.5 }
                        )}`}
                      >
                        {match.expectedGoals?.toFixed(1)}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      {match.odds ? (
                        <div
                          className={`px-2 py-1 rounded-lg ${
                            match.odds.over15Goals < 1.8
                              ? 'bg-green-100 text-green-800'
                              : match.odds.over15Goals < 2.2
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {match.odds.over15Goals?.toFixed(2)}
                        </div>
                      ) : (
                        <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600'>
                          N/A
                        </div>
                      )}
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          1 / match.defensiveStrength,
                          { high: 1.2, medium: 1.0 }
                        )}`}
                      >
                        {match.defensiveStrength?.toFixed(2)}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      {match.favorite ? (
                        <div
                          className={`px-3 py-1 rounded-lg inline-flex items-center ${selectedFavoriteColor}`}
                        >
                          <span className='text-2xl mr-3'>
                            {renderTeamLogo(
                              match.favorite === 'home'
                                ? match.homeTeam.logo
                                : match.awayTeam.logo,
                              'lg'
                            )}
                          </span>
                          <span className='truncate max-w-[100px]'>
                            {match.favorite === 'home'
                              ? match.homeTeam.name
                              : match.awayTeam.name}
                          </span>
                        </div>
                      ) : (
                        <div className='px-3 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200'>
                          None
                        </div>
                      )}
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg flex items-center justify-between ${getMetricColor(
                          match.confidenceScore,
                          { high: 80, medium: 60 }
                        )}`}
                      >
                        <span>{match.confidenceScore}%</span>
                        {expandedMatch === match.id ? (
                          <ChevronUp size={16} className='ml-1' />
                        ) : (
                          <ChevronDown size={16} className='ml-1' />
                        )}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          match.favorite === 'home'
                            ? match.homeTeam.bttsRate || 0
                            : match.favorite === 'away'
                            ? match.awayTeam.bttsRate || 0
                            : 0,
                          { high: 70, medium: 50 }
                        )}`}
                      >
                        {match.favorite === 'home'
                          ? match.homeTeam.bttsRate
                          : match.favorite === 'away'
                          ? match.awayTeam.bttsRate
                          : '-'}
                        %
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchPredictor;
