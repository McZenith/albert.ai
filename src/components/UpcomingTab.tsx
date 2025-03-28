import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Clipboard,
  Check,
  Plus,
  Trash,
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
    null
  );
  const [sortField, setSortField] = useState<string>('confidenceScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>({
    minConfidence: 0,
    favorite: 'all',
    positionGap: 0,
    minExpectedGoals: 0,
  });

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

  // State for copy feedback
  const [isCopied, setIsCopied] = useState(false);

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

        const data = (await response.json()) as ApiResponse;

        // Clean team names in the data before setting state
        const cleanedMatches = data.upcomingMatches.map((match) => ({
          ...match,
          homeTeam: {
            ...match.homeTeam,
            name: enhancedCleanTeamName(match.homeTeam.name),
          },
          awayTeam: {
            ...match.awayTeam,
            name: enhancedCleanTeamName(match.awayTeam.name),
          },
        }));

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

  const copyAllToClipboard = (): void => {
    const selectedMatches = upcomingMatches.filter((match, index) =>
      checkMatchInCart(match.id, index)
    );

    const favoriteTeams = selectedMatches
      .map((match) => {
        const favoriteTeam =
          match.favorite === 'home'
            ? enhancedCleanTeamName(match.homeTeam.name)
            : match.favorite === 'away'
            ? enhancedCleanTeamName(match.awayTeam.name)
            : 'No clear favorite';
        const opponent =
          match.favorite === 'home'
            ? enhancedCleanTeamName(match.awayTeam.name)
            : match.favorite === 'away'
            ? enhancedCleanTeamName(match.homeTeam.name)
            : '-';
        return `${favoriteTeam} to score over 1.5 goals vs ${opponent}`;
      })
      .join('\n');

    navigator.clipboard.writeText(favoriteTeams);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
                          match.homeTeam.avgHomeGoals || 0,
                          { high: 2.0, medium: 1.5 }
                        )}`}
                      >
                        {match.homeTeam.avgHomeGoals?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className='p-3 text-center'>
                      <div
                        className={`px-2 py-1 rounded-lg ${getMetricColor(
                          match.awayTeam.avgAwayGoals || 0,
                          { high: 1.2, medium: 0.8 }
                        )}`}
                      >
                        {match.awayTeam.avgAwayGoals?.toFixed(2) || '0.00'}
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
                          H:{' '}
                          {match.favorite === 'home'
                            ? match.homeTeam.homeForm
                            : match.favorite === 'away'
                            ? match.awayTeam.homeForm
                            : '-'}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs`}
                        >
                          A:{' '}
                          {match.favorite === 'home'
                            ? match.homeTeam.awayForm
                            : match.favorite === 'away'
                            ? match.awayTeam.awayForm
                            : '-'}
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

                  {/* Expanded details row */}
                  {expandedMatch === match.id && (
                    <tr className='bg-gray-50'>
                      <td colSpan={16} className='p-0 w-full'>
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mx-2 my-3'>
                          <div className='p-4 w-full'>
                            <div className='flex justify-between items-center mb-4 w-full'>
                              <h3 className='text-lg font-semibold text-gray-800'>
                                Match Details
                              </h3>
                              <div className='text-sm text-gray-500'>
                                {match.venue} • {match.time}
                              </div>
                            </div>

                            {/* Match header with team comparison */}
                            <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-5 w-full'>
                              <div className='flex flex-col items-center space-y-2'>
                                <span className='text-4xl'>
                                  {renderTeamLogo(match.homeTeam.logo, 'lg')}
                                </span>
                                <span className='font-bold text-gray-800'>
                                  {match.homeTeam.name}
                                </span>
                                <span className='text-sm text-gray-500'>
                                  Position: {match.homeTeam.position}
                                </span>
                              </div>
                              <div className='flex flex-col items-center px-6'>
                                <div className='text-xl font-bold text-gray-500 mb-1'>
                                  VS
                                </div>
                                <div className='bg-white px-3 py-1 rounded-full text-sm font-medium border border-gray-200'>
                                  {new Date(match.date).toLocaleDateString(
                                    'en-US',
                                    {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    }
                                  )}
                                </div>
                              </div>
                              <div className='flex flex-col items-center space-y-2'>
                                <span className='text-4xl'>
                                  {renderTeamLogo(match.awayTeam.logo, 'lg')}
                                </span>
                                <span className='font-bold text-gray-800'>
                                  {match.awayTeam.name}
                                </span>
                                <span className='text-sm text-gray-500'>
                                  Position: {match.awayTeam.position}
                                </span>
                              </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                              {/* Left column */}
                              <div>
                                <div className='mb-6'>
                                  <h4 className='text-gray-700 font-semibold mb-3 flex items-center'>
                                    <span className='bg-blue-100 text-blue-800 p-1 rounded mr-2'>
                                      <ChevronDown size={16} />
                                    </span>
                                    Team Comparison
                                  </h4>
                                  <div className='rounded-lg overflow-hidden border border-gray-200'>
                                    <table className='w-full'>
                                      <thead className='bg-gray-50'>
                                        <tr>
                                          <th className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3'>
                                            Metric
                                          </th>
                                          <th className='p-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider w-1/3'>
                                            <div className='flex items-center justify-center'>
                                              <span className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-1'>
                                                {renderTeamLogo(
                                                  match.homeTeam.logo,
                                                  'sm'
                                                )}
                                              </span>
                                              Home
                                            </div>
                                          </th>
                                          <th className='p-3 text-center text-xs font-medium text-purple-600 uppercase tracking-wider w-1/3'>
                                            <div className='flex items-center justify-center'>
                                              <span className='w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-1'>
                                                {renderTeamLogo(
                                                  match.awayTeam.logo,
                                                  'sm'
                                                )}
                                              </span>
                                              Away
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className='bg-white divide-y divide-gray-200'>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            Recent Form
                                          </td>
                                          <td className='p-3 text-center'>
                                            <div
                                              className={`inline-block px-3 py-1 rounded-full ${getFormColor(
                                                match.homeTeam.form
                                              )}`}
                                            >
                                              {match.homeTeam.form}
                                            </div>
                                          </td>
                                          <td className='p-3 text-center'>
                                            <div
                                              className={`inline-block px-3 py-1 rounded-full ${getFormColor(
                                                match.awayTeam.form
                                              )}`}
                                            >
                                              {match.awayTeam.form}
                                            </div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            Form Points
                                          </td>
                                          <td className='p-3 text-center'>
                                            <div
                                              className={`inline-block px-3 py-1 rounded-full ${
                                                calculateFormPoints(
                                                  match.homeTeam.form
                                                ) >= 60
                                                  ? 'bg-green-100 text-green-800'
                                                  : calculateFormPoints(
                                                      match.homeTeam.form
                                                    ) >= 40
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}
                                            >
                                              {calculateFormPoints(
                                                match.homeTeam.form
                                              )}
                                              % (
                                              {match.homeTeam.form.length * 3}{' '}
                                              max)
                                            </div>
                                          </td>
                                          <td className='p-3 text-center'>
                                            <div
                                              className={`inline-block px-3 py-1 rounded-full ${
                                                calculateFormPoints(
                                                  match.awayTeam.form
                                                ) >= 60
                                                  ? 'bg-green-100 text-green-800'
                                                  : calculateFormPoints(
                                                      match.awayTeam.form
                                                    ) >= 40
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}
                                            >
                                              {calculateFormPoints(
                                                match.awayTeam.form
                                              )}
                                              % (
                                              {match.awayTeam.form.length * 3}{' '}
                                              max)
                                            </div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            Avg Goals
                                          </td>
                                          <td className='p-3 text-center font-medium text-blue-800'>
                                            {match.homeTeam.avgHomeGoals?.toFixed(
                                              2
                                            )}
                                          </td>
                                          <td className='p-3 text-center font-medium text-purple-800'>
                                            {match.awayTeam.avgAwayGoals?.toFixed(
                                              2
                                            )}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            Clean Sheets
                                          </td>
                                          <td className='p-3 text-center'>
                                            {match.homeTeam.homeCleanSheets} /{' '}
                                            {match.homeTeam.totalHomeMatches}
                                          </td>
                                          <td className='p-3 text-center'>
                                            {match.awayTeam.awayCleanSheets} /{' '}
                                            {match.awayTeam.totalAwayMatches}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            Over 1.5 Goals
                                          </td>
                                          <td className='p-3 text-center'>
                                            <div className='w-full bg-gray-200 rounded-full h-2.5'>
                                              <div
                                                className='bg-blue-600 h-2.5 rounded-full'
                                                style={{
                                                  width: `${
                                                    ((match.homeTeam
                                                      .homeMatchesOver15 || 0) /
                                                      (match.homeTeam
                                                        .totalHomeMatches ||
                                                        1)) *
                                                    100
                                                  }%`,
                                                }}
                                              ></div>
                                            </div>
                                            <span className='text-xs text-gray-500 mt-1'>
                                              {match.homeTeam.homeMatchesOver15}
                                              /{match.homeTeam.totalHomeMatches}
                                            </span>
                                          </td>
                                          <td className='p-3 text-center'>
                                            <div className='w-full bg-gray-200 rounded-full h-2.5'>
                                              <div
                                                className='bg-purple-600 h-2.5 rounded-full'
                                                style={{
                                                  width: `${
                                                    ((match.awayTeam
                                                      .awayMatchesOver15 || 0) /
                                                      (match.awayTeam
                                                        .totalAwayMatches ||
                                                        1)) *
                                                    100
                                                  }%`,
                                                }}
                                              ></div>
                                            </div>
                                            <span className='text-xs text-gray-500 mt-1'>
                                              {match.awayTeam.awayMatchesOver15}
                                              /{match.awayTeam.totalAwayMatches}
                                            </span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            Scoring First Win Rate
                                          </td>
                                          <td className='p-3 text-center'>
                                            {match.homeTeam.scoringFirstWinRate}
                                            %
                                          </td>
                                          <td className='p-3 text-center'>
                                            {match.awayTeam.scoringFirstWinRate}
                                            %
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className='p-3 text-sm text-gray-600'>
                                            BTTS Rate
                                          </td>
                                          <td className='p-3 text-center'>
                                            {match.homeTeam.homeBttsRate}%
                                          </td>
                                          <td className='p-3 text-center'>
                                            {match.awayTeam.awayBttsRate}%
                                          </td>
                                        </tr>
                                        {match.cornerStats && (
                                          <tr>
                                            <td className='p-3 text-sm text-gray-600'>
                                              Avg Corners
                                            </td>
                                            <td className='p-3 text-center'>
                                              {match.cornerStats.homeAvg.toFixed(
                                                1
                                              )}
                                            </td>
                                            <td className='p-3 text-center'>
                                              {match.cornerStats.awayAvg.toFixed(
                                                1
                                              )}
                                            </td>
                                          </tr>
                                        )}
                                        {match.scoringPatterns && (
                                          <tr>
                                            <td className='p-3 text-sm text-gray-600'>
                                              First Goal Rate
                                            </td>
                                            <td className='p-3 text-center'>
                                              {
                                                match.scoringPatterns
                                                  .homeFirstGoalRate
                                              }
                                              %
                                            </td>
                                            <td className='p-3 text-center'>
                                              {
                                                match.scoringPatterns
                                                  .awayFirstGoalRate
                                              }
                                              %
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div>
                                  <h4 className='text-gray-700 font-semibold mb-3 flex items-center'>
                                    <span className='bg-blue-100 text-blue-800 p-1 rounded mr-2'>
                                      <ChevronDown size={16} />
                                    </span>
                                    Goal Timing
                                  </h4>
                                  <div className='grid grid-cols-2 gap-4'>
                                    <div className='bg-white rounded-lg border border-gray-200 p-3'>
                                      <div className='mb-2 flex justify-between'>
                                        <span className='text-sm font-medium text-gray-700'>
                                          {match.homeTeam.name}
                                        </span>
                                        <span className='text-xs text-gray-500'>
                                          Goal Distribution
                                        </span>
                                      </div>
                                      {match.homeTeam.goalDistribution && (
                                        <div className='space-y-2'>
                                          {Object.entries(
                                            match.homeTeam.goalDistribution
                                          ).map(([timeRange, value]) => (
                                            <div
                                              key={timeRange}
                                              className='flex items-center text-sm'
                                            >
                                              <span className='w-12 text-gray-500'>
                                                {timeRange}
                                              </span>
                                              <div className='flex-1 ml-2'>
                                                <div className='w-full bg-gray-200 rounded-full h-1.5'>
                                                  <div
                                                    className='bg-blue-600 h-1.5 rounded-full'
                                                    style={{
                                                      width: `${value * 100}%`,
                                                    }}
                                                  ></div>
                                                </div>
                                              </div>
                                              <span className='ml-2 text-gray-700 w-8 text-right'>
                                                {(value * 100).toFixed(0)}%
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className='bg-white rounded-lg border border-gray-200 p-3'>
                                      <div className='mb-2 flex justify-between'>
                                        <span className='text-sm font-medium text-gray-700'>
                                          {match.awayTeam.name}
                                        </span>
                                        <span className='text-xs text-gray-500'>
                                          Goal Distribution
                                        </span>
                                      </div>
                                      {match.awayTeam.goalDistribution && (
                                        <div className='space-y-2'>
                                          {Object.entries(
                                            match.awayTeam.goalDistribution
                                          ).map(([timeRange, value]) => (
                                            <div
                                              key={timeRange}
                                              className='flex items-center text-sm'
                                            >
                                              <span className='w-12 text-gray-500'>
                                                {timeRange}
                                              </span>
                                              <div className='flex-1 ml-2'>
                                                <div className='w-full bg-gray-200 rounded-full h-1.5'>
                                                  <div
                                                    className='bg-purple-600 h-1.5 rounded-full'
                                                    style={{
                                                      width: `${value * 100}%`,
                                                    }}
                                                  ></div>
                                                </div>
                                              </div>
                                              <span className='ml-2 text-gray-700 w-8 text-right'>
                                                {(value * 100).toFixed(0)}%
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {match.odds && (
                                  <div className='mt-6'>
                                    <h4 className='text-gray-700 font-semibold mb-3 flex items-center'>
                                      <span className='bg-green-100 text-green-800 p-1 rounded mr-2'>
                                        <ChevronDown size={16} />
                                      </span>
                                      Match Odds
                                    </h4>
                                    <div className='bg-white rounded-lg border border-gray-200 p-4'>
                                      <div className='grid grid-cols-3 gap-2 mb-4'>
                                        <div className='bg-blue-50 p-3 rounded-lg border border-blue-200 text-center'>
                                          <span className='text-sm text-blue-700'>
                                            {match.homeTeam.name}
                                          </span>
                                          <div className='text-xl font-bold mt-1 text-blue-800'>
                                            {match.odds.homeWin?.toFixed(2)}
                                          </div>
                                        </div>
                                        <div className='bg-gray-50 p-3 rounded-lg border border-gray-200 text-center'>
                                          <span className='text-sm text-gray-700'>
                                            Draw
                                          </span>
                                          <div className='text-xl font-bold mt-1 text-gray-800'>
                                            {match.odds.draw?.toFixed(2)}
                                          </div>
                                        </div>
                                        <div className='bg-purple-50 p-3 rounded-lg border border-purple-200 text-center'>
                                          <span className='text-sm text-purple-700'>
                                            {match.awayTeam.name}
                                          </span>
                                          <div className='text-xl font-bold mt-1 text-purple-800'>
                                            {match.odds.awayWin?.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>

                                      <div className='mb-4'>
                                        <div className='text-sm font-medium text-gray-700 mb-2'>
                                          Goals Over/Under
                                        </div>
                                        <div className='grid grid-cols-2 gap-2'>
                                          <div className='bg-green-50 p-2 rounded-lg border border-green-200'>
                                            <div className='flex justify-between items-center'>
                                              <span className='text-sm text-green-700'>
                                                Over 1.5
                                              </span>
                                              <span className='font-bold text-green-800'>
                                                {match.odds.over15Goals.toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className='bg-red-50 p-2 rounded-lg border border-red-200'>
                                            <div className='flex justify-between items-center'>
                                              <span className='text-sm text-red-700'>
                                                Under 1.5
                                              </span>
                                              <span className='font-bold text-red-800'>
                                                {match.odds.under15Goals.toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className='bg-green-50 p-2 rounded-lg border border-green-200'>
                                            <div className='flex justify-between items-center'>
                                              <span className='text-sm text-green-700'>
                                                Over 2.5
                                              </span>
                                              <span className='font-bold text-green-800'>
                                                {match.odds.over25Goals.toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className='bg-red-50 p-2 rounded-lg border border-red-200'>
                                            <div className='flex justify-between items-center'>
                                              <span className='text-sm text-red-700'>
                                                Under 2.5
                                              </span>
                                              <span className='font-bold text-red-800'>
                                                {match.odds.under25Goals.toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <div className='text-sm font-medium text-gray-700 mb-2'>
                                          Both Teams To Score
                                        </div>
                                        <div className='grid grid-cols-2 gap-2'>
                                          <div className='bg-green-50 p-2 rounded-lg border border-green-200'>
                                            <div className='flex justify-between items-center'>
                                              <span className='text-sm text-green-700'>
                                                Yes
                                              </span>
                                              <span className='font-bold text-green-800'>
                                                {match.odds.bttsYes?.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          <div className='bg-red-50 p-2 rounded-lg border border-red-200'>
                                            <div className='flex justify-between items-center'>
                                              <span className='text-sm text-red-700'>
                                                No
                                              </span>
                                              <span className='font-bold text-red-800'>
                                                {match.odds.bttsNo?.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right column */}
                              <div>
                                <div className='mb-6'>
                                  <h4 className='text-gray-700 font-semibold mb-3 flex items-center'>
                                    <span className='bg-green-100 text-green-800 p-1 rounded mr-2'>
                                      <ChevronDown size={16} />
                                    </span>
                                    Prediction Summary
                                  </h4>
                                  <div className='bg-white rounded-lg border border-gray-200 p-4'>
                                    <div className='grid grid-cols-3 gap-3 mb-4'>
                                      <div className='bg-blue-50 rounded-lg p-3 text-center'>
                                        <div className='text-sm text-gray-600 mb-1'>
                                          Confidence
                                        </div>
                                        <div
                                          className={`text-xl font-bold ${
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
                                      <div className='bg-blue-50 rounded-lg p-3 text-center'>
                                        <div className='text-sm text-gray-600 mb-1'>
                                          Expected Goals
                                        </div>
                                        <div className='text-xl font-bold text-blue-600'>
                                          {match.expectedGoals.toFixed(1)}
                                        </div>
                                      </div>
                                      <div className='bg-blue-50 rounded-lg p-3 text-center'>
                                        <div className='text-sm text-gray-600 mb-1'>
                                          Def. Strength
                                        </div>
                                        <div className='text-xl font-bold text-blue-600'>
                                          {match.defensiveStrength?.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>

                                    <div className='mb-4'>
                                      <div className='text-sm font-medium text-gray-700 mb-2'>
                                        Favorite
                                      </div>
                                      {match.favorite ? (
                                        <div
                                          className={`flex items-center p-3 rounded-lg ${
                                            match.favorite === 'home'
                                              ? 'bg-blue-50 border border-blue-200'
                                              : 'bg-purple-50 border border-purple-200'
                                          }`}
                                        >
                                          <span className='text-2xl mr-3'>
                                            {renderTeamLogo(
                                              match.favorite === 'home'
                                                ? match.homeTeam.logo
                                                : match.awayTeam.logo,
                                              'lg'
                                            )}
                                          </span>
                                          <div>
                                            <div className='font-medium text-gray-800'>
                                              {match.favorite === 'home'
                                                ? match.homeTeam.name
                                                : match.awayTeam.name}
                                            </div>
                                            <div className='text-sm text-gray-600'>
                                              {match.favorite === 'home'
                                                ? 'Home team'
                                                : 'Away team'}{' '}
                                              is favored
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className='p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600'>
                                          No clear favorite in this match
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <div className='text-sm font-medium text-gray-700 mb-2'>
                                        Key Factors
                                      </div>
                                      <ul className='bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2'>
                                        {match.reasonsForPrediction.map(
                                          (reason, index) => (
                                            <li
                                              key={index}
                                              className='flex items-start'
                                            >
                                              <span className='text-green-500 mr-2 mt-0.5'>
                                                •
                                              </span>
                                              <span className='text-sm text-gray-700'>
                                                {reason}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className='text-gray-700 font-semibold mb-3 flex items-center'>
                                    <span className='bg-yellow-100 text-yellow-800 p-1 rounded mr-2'>
                                      <ChevronDown size={16} />
                                    </span>
                                    Head-to-Head History
                                  </h4>
                                  <div className='bg-white rounded-lg border border-gray-200 p-4'>
                                    <div className='grid grid-cols-5 gap-2 mb-4'>
                                      <div className='col-span-5 bg-gray-50 p-3 rounded-lg border border-gray-200 text-center'>
                                        <span className='text-sm text-gray-500'>
                                          Total Matches
                                        </span>
                                        <div className='text-2xl font-bold mt-1 text-gray-800'>
                                          {match.headToHead.matches}
                                        </div>
                                      </div>

                                      <div className='bg-green-50 p-3 rounded-lg border border-green-200 text-center'>
                                        <span className='text-sm text-green-700'>
                                          Wins
                                        </span>
                                        <div className='text-xl font-bold mt-1 text-green-800'>
                                          {match.headToHead.wins}
                                        </div>
                                      </div>

                                      <div className='bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center'>
                                        <span className='text-sm text-yellow-700'>
                                          Draws
                                        </span>
                                        <div className='text-xl font-bold mt-1 text-yellow-800'>
                                          {match.headToHead.draws}
                                        </div>
                                      </div>

                                      <div className='bg-red-50 p-3 rounded-lg border border-red-200 text-center'>
                                        <span className='text-sm text-red-700'>
                                          Losses
                                        </span>
                                        <div className='text-xl font-bold mt-1 text-red-800'>
                                          {match.headToHead.losses}
                                        </div>
                                      </div>

                                      <div className='col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-200 text-center'>
                                        <span className='text-sm text-blue-700'>
                                          Goals For
                                        </span>
                                        <div className='text-xl font-bold mt-1 text-blue-800'>
                                          {match.headToHead.goalsScored}
                                        </div>
                                      </div>

                                      <div className='col-span-3 bg-purple-50 p-3 rounded-lg border border-purple-200 text-center'>
                                        <span className='text-sm text-purple-700'>
                                          Goals Against
                                        </span>
                                        <div className='text-xl font-bold mt-1 text-purple-800'>
                                          {match.headToHead.goalsConceded}
                                        </div>
                                      </div>
                                    </div>

                                    <div className='mb-2 text-sm font-medium text-gray-700'>
                                      Win Rate
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-3 mb-1'>
                                      <div
                                        className='bg-green-600 h-3 rounded-full'
                                        style={{
                                          width: `${
                                            match.headToHead.matches > 0
                                              ? (match.headToHead.wins /
                                                  match.headToHead.matches) *
                                                100
                                              : 0
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className='text-right text-sm text-gray-600'>
                                      {match.headToHead.matches > 0
                                        ? (
                                            (match.headToHead.wins /
                                              match.headToHead.matches) *
                                            100
                                          ).toFixed(0)
                                        : 0}
                                      % win rate
                                    </div>

                                    {/* Recent head-to-head matches */}
                                    {match.headToHead.recentMatches &&
                                      match.headToHead.recentMatches.length >
                                        0 && (
                                        <div className='mt-4'>
                                          <div className='text-sm font-medium text-gray-700 mb-2'>
                                            Recent Matches
                                          </div>
                                          <div className='bg-gray-50 rounded-lg border border-gray-200 p-3'>
                                            {match.headToHead.recentMatches.map(
                                              (recentMatch, index) => (
                                                <div
                                                  key={index}
                                                  className='flex justify-between items-center mb-2 last:mb-0'
                                                >
                                                  <span className='text-sm text-gray-600'>
                                                    {recentMatch.date}
                                                  </span>
                                                  <span className='font-medium text-gray-800'>
                                                    {recentMatch.result}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {match.cornerStats && (
                                  <div className='mt-6'>
                                    <h4 className='text-gray-700 font-semibold mb-3 flex items-center'>
                                      <span className='bg-indigo-100 text-indigo-800 p-1 rounded mr-2'>
                                        <ChevronDown size={16} />
                                      </span>
                                      Corner Statistics
                                    </h4>
                                    <div className='bg-white rounded-lg border border-gray-200 p-4'>
                                      <div className='grid grid-cols-3 gap-2 mb-4'>
                                        <div className='bg-blue-50 p-3 rounded-lg border border-blue-200 text-center'>
                                          <span className='text-sm text-blue-700'>
                                            Home Avg
                                          </span>
                                          <div className='text-xl font-bold mt-1 text-blue-800'>
                                            {match.cornerStats.homeAvg.toFixed(
                                              1
                                            )}
                                          </div>
                                        </div>
                                        <div className='bg-purple-50 p-3 rounded-lg border border-purple-200 text-center'>
                                          <span className='text-sm text-purple-700'>
                                            Away Avg
                                          </span>
                                          <div className='text-xl font-bold mt-1 text-purple-800'>
                                            {match.cornerStats.awayAvg.toFixed(
                                              1
                                            )}
                                          </div>
                                        </div>
                                        <div className='bg-gray-50 p-3 rounded-lg border border-gray-200 text-center'>
                                          <span className='text-sm text-gray-700'>
                                            Match Avg
                                          </span>
                                          <div className='text-xl font-bold mt-1 text-gray-800'>
                                            {match.cornerStats.totalAvg.toFixed(
                                              1
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className='mb-2 text-sm font-medium text-gray-700'>
                                        Corner Distribution
                                      </div>
                                      <div className='h-8 bg-gray-200 rounded-lg overflow-hidden flex'>
                                        <div
                                          className='bg-blue-500 h-full flex items-center justify-center text-white text-xs font-bold'
                                          style={{
                                            width: `${
                                              (match.cornerStats.homeAvg /
                                                match.cornerStats.totalAvg) *
                                              100
                                            }%`,
                                          }}
                                        >
                                          {Math.round(
                                            (match.cornerStats.homeAvg /
                                              match.cornerStats.totalAvg) *
                                              100
                                          )}
                                          %
                                        </div>
                                        <div
                                          className='bg-purple-500 h-full flex items-center justify-center text-white text-xs font-bold'
                                          style={{
                                            width: `${
                                              (match.cornerStats.awayAvg /
                                                match.cornerStats.totalAvg) *
                                              100
                                            }%`,
                                          }}
                                        >
                                          {Math.round(
                                            (match.cornerStats.awayAvg /
                                              match.cornerStats.totalAvg) *
                                              100
                                          )}
                                          %
                                        </div>
                                      </div>
                                      <div className='flex text-xs text-gray-500 mt-1 justify-between'>
                                        <span>{match.homeTeam.name}</span>
                                        <span>{match.awayTeam.name}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
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

      {/* Bottom panel for selections */}
      {upcomingMatches.filter((match) => checkMatchInCart(match.id, 0)).length >
        0 && (
        <div className='fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md p-3'>
          <div className='max-w-full mx-auto flex justify-between items-center'>
            <div className='flex items-center'>
              <div className='font-medium text-gray-700 mr-3'>
                Selected Favorites (
                {
                  upcomingMatches.filter((match) =>
                    checkMatchInCart(match.id, 0)
                  ).length
                }
                ):
              </div>
              <div className='flex flex-wrap gap-2'>
                {upcomingMatches
                  .filter((match) => checkMatchInCart(match.id, 0))
                  .map((match, index) => {
                    return (
                      <div
                        key={`cart-${match.id}-${index}`}
                        className={`flex items-center rounded-lg px-3 py-1 ${
                          match.favorite === 'home'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : match.favorite === 'away'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-gray-50 text-gray-800 border border-gray-200'
                        }`}
                      >
                        <span className='text-lg mr-1.5'>
                          {renderTeamLogo(
                            match.favorite === 'home'
                              ? match.homeTeam.logo
                              : match.awayTeam.logo
                          )}
                        </span>
                        <span>
                          {match.favorite === 'home'
                            ? match.homeTeam.name
                            : match.awayTeam.name}
                        </span>
                        <span className='ml-2 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 border border-gray-200'>
                          {match.confidenceScore}%
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMatchInCart(match.id, index);
                          }}
                          className='ml-2 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600'
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='text-gray-500 text-sm'>
                {filterMatches(upcomingMatches).length} matches match filters
              </div>
              <button
                onClick={copyAllToClipboard}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check size={18} className='mr-2' />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard size={18} className='mr-2' />
                    Copy All Favorites
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='mt-4 text-xs text-gray-500'>
        <p>
          Data source: Match predictions updated as of{' '}
          {metadata?.date || 'today'}
        </p>
      </div>
    </div>
  );
};

export default MatchPredictor;
