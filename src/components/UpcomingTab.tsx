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
  // Remove localStorage access from initial state
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

  // New effect to load stored values after component mounts (client-side only)
  useEffect(() => {
    // Load saved values from localStorage after mount
    try {
      // For expandedMatch
      const savedExpandedMatch = localStorage.getItem('expandedMatch');
      if (savedExpandedMatch) {
        if (!isNaN(Number(savedExpandedMatch))) {
          setExpandedMatch(Number(savedExpandedMatch));
        } else {
          setExpandedMatch(savedExpandedMatch);
        }
      }

      // For sortField
      const savedSortField = localStorage.getItem('upcomingSortField');
      if (savedSortField) {
        setSortField(savedSortField);
      }

      // For sortDirection
      const savedSortDirection = localStorage.getItem(
        'upcomingSortDirection'
      ) as 'asc' | 'desc';
      if (
        savedSortDirection &&
        (savedSortDirection === 'asc' || savedSortDirection === 'desc')
      ) {
        setSortDirection(savedSortDirection);
      }

      // For filters
      const savedFilters = localStorage.getItem('upcomingFilters');
      if (savedFilters) {
        try {
          setFilters(JSON.parse(savedFilters) as Filters);
        } catch (e) {
          console.error('Failed to parse saved filters', e);
        }
      }
    } catch (error) {
      // Silently handle any localStorage errors
      console.error('Error accessing localStorage:', error);
    }
  }, []); // Empty dependency array means this runs once after mount

  // Save expandedMatch to localStorage whenever it changes
  useEffect(() => {
    try {
      if (expandedMatch !== null) {
        localStorage.setItem('expandedMatch', String(expandedMatch));
      } else {
        localStorage.removeItem('expandedMatch');
      }
    } catch (error) {
      console.error('Error saving expandedMatch to localStorage:', error);
    }
  }, [expandedMatch]);

  // Save sort field to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upcomingSortField', sortField);
    } catch (error) {
      console.error('Error saving sortField to localStorage:', error);
    }
  }, [sortField]);

  // Save sort direction to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upcomingSortDirection', sortDirection);
    } catch (error) {
      console.error('Error saving sortDirection to localStorage:', error);
    }
  }, [sortDirection]);

  // Save filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upcomingFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters]);

  // New states for API data
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [metadata, setMetadata] = useState<ApiResponse['metadata'] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get cart functions from the global store
  const {
    addUpcomingMatch,
    removeUpcomingMatch,
    isUpcomingMatchInCart,
    clearUpcomingMatches,
  } = useCartStore();

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

      // Filter by upcoming time (between 90 mins ago and next 24 hours)
      if (filters.showOnlyUpcoming) {
        try {
          // Create a date object from the match date and time
          // Handle different date/time formats more robustly
          let matchDateTime;

          if (match.date && match.time) {
            // Try parsing with T separator first
            matchDateTime = new Date(`${match.date}T${match.time}`);

            // If that fails, try with space separator
            if (isNaN(matchDateTime.getTime())) {
              matchDateTime = new Date(`${match.date} ${match.time}`);
            }
          } else if (match.date) {
            // If we only have a date but no time, use noon as default time
            matchDateTime = new Date(`${match.date}T12:00:00`);
          } else {
            // If we have no valid date, skip this match
            return false;
          }

          // Check if the date is valid
          if (isNaN(matchDateTime.getTime())) {
            console.error('Invalid date/time format:', match.date, match.time);
            return false;
          }

          // Get current date and time
          const now = new Date();

          // Create a date for the current hour (minutes/seconds/ms set to 0)
          const currentHour = new Date(now);
          currentHour.setMinutes(0, 0, 0);

          // Calculate 24 hours later from the current hour
          const twentyFourHoursLater = new Date(
            currentHour.getTime() + 24 * 60 * 60 * 1000
          );

          // Check if match time is in the desired range (current hour to 24 hours later)
          if (
            matchDateTime < currentHour ||
            matchDateTime > twentyFourHoursLater
          ) {
            return false;
          }
        } catch (error) {
          console.error(
            'Error parsing match date/time:',
            error,
            match.date,
            match.time
          );
          // If there's an error parsing the date, exclude the match
          return false;
        }
      }

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

  // Add a function to select all visible matches
  const selectAllVisibleMatches = () => {
    const visibleMatches = filterMatches(sortMatches(upcomingMatches));
    visibleMatches.forEach((match, index) => {
      // Only add matches that are not already in the cart
      if (!checkMatchInCart(match.id, index)) {
        // Use the same logic as in toggleMatchInCart to handle adding matches
        const uniqueId = match.id === 0 ? `match-${index}` : match.id;
        if (match.id === 0) {
          const matchWithUniqueId = { ...match, id: uniqueId };
          addUpcomingMatch(matchWithUniqueId);
        } else {
          addUpcomingMatch(match);
        }
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
    });
  };

  // Add a function to toggle the upcoming matches filter
  const toggleUpcomingFilter = () => {
    setFilters((prev) => ({
      ...prev,
      showOnlyUpcoming: !prev.showOnlyUpcoming,
    }));
  };

  // Generate a tooltip showing the actual time range for the filter
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
      return `Shows matches from ${startTime} today to ${endTime} tomorrow`;
    } else {
      return `Shows matches from ${startTime} (${startDate}) to ${endTime} (${endDate})`;
    }
  };

  // Add this helper function to format the date nicely for display
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <div className='max-w-full mx-auto p-4 bg-white rounded-lg shadow-sm'>
        <div className='flex flex-col items-center justify-center p-12 h-64'>
          <ClientOnlyLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-full mx-auto p-4 bg-white rounded-lg shadow-sm'>
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
                    : 'Show matches from current hour through next 24 hours'
                }
              >
                {filters.showOnlyUpcoming
                  ? 'Current Hour to Next 24h'
                  : 'All Times'}
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

      <div className='overflow-x-auto'>
        <table className='w-full bg-white rounded-lg overflow-hidden border border-gray-200'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='p-3 text-left whitespace-nowrap'></th>
              <th className='p-3 text-left whitespace-nowrap text-sm font-medium text-gray-500 min-w-[200px]'>
                Match
              </th>
              <th
                className='p-3 text-center whitespace-nowrap cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-500 min-w-[80px]'
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
                        {formatMatchDate(match.date, match.time)}
                      </div>
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
                  {expandedMatch === match.id && (
                    <tr className='bg-gray-50'>
                      <td colSpan={17} className='p-4'>
                        <div className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm'>
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            {/* Match Details */}
                            <div className='border-r border-gray-100 pr-4'>
                              <h3 className='font-semibold text-gray-700 mb-2'>
                                Match Details
                              </h3>
                              <div className='space-y-2'>
                                <div className='flex justify-between'>
                                  <span className='text-gray-500'>Date:</span>
                                  <span className='font-medium'>
                                    {match.date}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-gray-500'>Time:</span>
                                  <span className='font-medium'>
                                    {match.time}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-gray-500'>Venue:</span>
                                  <span className='font-medium'>
                                    {match.venue}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-gray-500'>
                                    Expected Goals:
                                  </span>
                                  <span className='font-medium'>
                                    {match.expectedGoals.toFixed(2)}
                                  </span>
                                </div>
                                {match.odds && (
                                  <>
                                    <div className='flex justify-between'>
                                      <span className='text-gray-500'>
                                        Over 1.5 Goals:
                                      </span>
                                      <span className='font-medium'>
                                        {match.odds.over15Goals.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className='flex justify-between'>
                                      <span className='text-gray-500'>
                                        Home/Draw/Away:
                                      </span>
                                      <span className='font-medium'>
                                        {match.odds.homeWin.toFixed(2)} /{' '}
                                        {match.odds.draw.toFixed(2)} /{' '}
                                        {match.odds.awayWin.toFixed(2)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Teams Comparison */}
                            <div className='border-r border-gray-100 px-4'>
                              <h3 className='font-semibold text-gray-700 mb-2'>
                                Teams Comparison
                              </h3>
                              <table className='w-full text-sm'>
                                <thead>
                                  <tr>
                                    <th className='text-left font-medium text-gray-500'>
                                      Metric
                                    </th>
                                    <th className='text-center font-medium text-gray-500'>
                                      {match.homeTeam.name}
                                    </th>
                                    <th className='text-center font-medium text-gray-500'>
                                      {match.awayTeam.name}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                  <tr>
                                    <td className='py-1 text-gray-500'>
                                      Position
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.homeTeam.position}
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.awayTeam.position}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-1 text-gray-500'>Form</td>
                                    <td className='py-1 text-center'>
                                      {match.homeTeam.form}
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.awayTeam.form}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-1 text-gray-500'>
                                      Form Points
                                    </td>
                                    <td className='py-1 text-center'>
                                      {calculateFormPoints(match.homeTeam.form)}
                                      %
                                    </td>
                                    <td className='py-1 text-center'>
                                      {calculateFormPoints(match.awayTeam.form)}
                                      %
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-1 text-gray-500'>
                                      Avg Goals
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.homeTeam.avgHomeGoals?.toFixed(
                                        2
                                      ) || 'N/A'}
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.awayTeam.avgAwayGoals?.toFixed(
                                        2
                                      ) || 'N/A'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-1 text-gray-500'>
                                      Clean Sheets
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.homeTeam.cleanSheets}
                                    </td>
                                    <td className='py-1 text-center'>
                                      {match.awayTeam.cleanSheets}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Prediction Reasons */}
                            <div className='pl-4'>
                              <h3 className='font-semibold text-gray-700 mb-2'>
                                Prediction Reasons
                              </h3>
                              <ul className='list-disc pl-4 space-y-1'>
                                {match.reasonsForPrediction.map(
                                  (reason, idx) => (
                                    <li
                                      key={idx}
                                      className='text-gray-700 text-sm'
                                    >
                                      {reason}
                                    </li>
                                  )
                                )}
                              </ul>

                              {/* H2H Records */}
                              {match.headToHead.matches > 0 && (
                                <div className='mt-4'>
                                  <h4 className='font-medium text-gray-700 mb-1'>
                                    Head-to-Head
                                  </h4>
                                  <div className='text-sm text-gray-600 mb-2'>
                                    Record: {match.headToHead.wins}W{' '}
                                    {match.headToHead.draws}D{' '}
                                    {match.headToHead.losses}L (
                                    {match.headToHead.goalsScored}-
                                    {match.headToHead.goalsConceded})
                                  </div>
                                  {match.headToHead.recentMatches && (
                                    <div>
                                      <h5 className='text-xs font-medium text-gray-500 mb-1'>
                                        Recent Matches:
                                      </h5>
                                      <ul className='text-xs space-y-1'>
                                        {match.headToHead.recentMatches.map(
                                          (h2hMatch, idx) => (
                                            <li
                                              key={idx}
                                              className='text-gray-600'
                                            >
                                              {h2hMatch.date.substring(0, 10)}:{' '}
                                              {h2hMatch.result}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
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
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-opacity duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default MatchPredictor;
