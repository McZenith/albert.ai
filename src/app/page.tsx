/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { useCartStore } from '@/hooks/useStore';
import {
  ChevronUp,
  ChevronDown,
  Filter,
  ShoppingCart,
  Copy,
  Database,
  ArrowUp,
  FileDown,
} from 'lucide-react';
import MatchPredictor from '@/components/UpcomingTab';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSavedMatches } from './actions';
import { exportMatchesToCSV } from '@/utils/exportUtils';

// Enhanced Types
interface Match {
  id: string;
  score: string;
  teams: {
    home: {
      id: string;
      name: string;
      position: number;
    };
    away: {
      id: string;
      name: string;
      position: number;
    };
  };
  tournamentName: string;
  status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
  playedSeconds: number;
  playedTime?: string;
  positionGap?: number;
  matchSituation?: {
    totalTime: number;
    dominantTeam: string;
    matchMomentum: string;
    home: {
      totalAttacks: number;
      totalDangerousAttacks: number;
      totalSafeAttacks: number;
      totalAttackCount: number;
      totalDangerousCount: number;
      totalSafeCount: number;
      attackPercentage: number;
      dangerousAttackPercentage: number;
      safeAttackPercentage: number;
    };
    away: {
      totalAttacks: number;
      totalDangerousAttacks: number;
      totalSafeAttacks: number;
      totalAttackCount: number;
      totalDangerousCount: number;
      totalSafeCount: number;
      attackPercentage: number;
      dangerousAttackPercentage: number;
      safeAttackPercentage: number;
    };
  };
  matchDetails?: {
    home: {
      yellowCards: number;
      redCards: number;
      freeKicks: number;
      goalKicks: number;
      throwIns: number;
      offsides: number;
      cornerKicks: number;
      shotsOnTarget: number;
      shotsOffTarget: number;
      saves: number;
      fouls: number;
      injuries: number;
      dangerousAttacks: number;
      ballSafe: number;
      totalAttacks: number;
      goalAttempts: number;
      ballSafePercentage: number;
      attackPercentage: number;
      dangerousAttackPercentage: number;
    };
    away: {
      yellowCards: number;
      redCards: number;
      freeKicks: number;
      goalKicks: number;
      throwIns: number;
      offsides: number;
      cornerKicks: number;
      shotsOnTarget: number;
      shotsOffTarget: number;
      saves: number;
      fouls: number;
      injuries: number;
      dangerousAttacks: number;
      ballSafe: number;
      totalAttacks: number;
      goalAttempts: number;
      ballSafePercentage: number;
      attackPercentage: number;
      dangerousAttackPercentage: number;
    };
    types: Record<string, string>;
  };
  markets: Array<{
    id: string;
    description: string;
    profitPercentage: number;
    favourite: string;
    margin: number;
    outcomes: Array<{
      id: string;
      description: string;
      odds: number;
      stakePercentage: number;
      isChanged?: boolean;
    }>;
  }>;
  createdAt: string;
  matchTime: string;
}

// Sort and Filter types
type SortDirection = 'asc' | 'desc';
type FilterType =
  | 'status'
  | 'profit'
  | 'margin'
  | 'odds'
  | 'playedSeconds'
  | 'none';

// Loading Skeleton Components
const SkeletonCell = () => (
  <div className='animate-pulse'>
    <div className='h-4 bg-gray-200 rounded-sm w-3/4'></div>
  </div>
);

const SkeletonRow = () => (
  <tr className='border-t'>
    {/* Teams Column */}
    <td className='px-4 py-3'>
      <div className='space-y-2'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-32'></div>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-24'></div>
      </div>
    </td>
    {/* Score Column */}
    <td className='px-4 py-3'>
      <div className='flex justify-center'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-12'></div>
      </div>
    </td>
    {/* Tournament Column */}
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    {/* Market Column */}
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    {/* Profit Column */}
    <td className='px-4 py-3'>
      <div className='flex justify-end'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-16'></div>
      </div>
    </td>
    {/* Margin Column */}
    <td className='px-4 py-3'>
      <div className='flex justify-end'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-16'></div>
      </div>
    </td>
    {/* Outcomes Column */}
    <td className='px-4 py-3'>
      <div className='space-y-2'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-24'></div>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-24'></div>
      </div>
    </td>
    {/* Odds Column */}
    <td className='px-4 py-3'>
      <div className='space-y-2'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-16'></div>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-16'></div>
      </div>
    </td>
    {/* Stake Column */}
    <td className='px-4 py-3'>
      <div className='flex justify-end'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-16'></div>
      </div>
    </td>
    {/* Investment Column */}
    <td className='px-4 py-3'>
      <div className='flex justify-end'>
        <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-20'></div>
      </div>
    </td>
    {/* Actions Column */}
    <td className='px-4 py-3'>
      <div className='animate-pulse h-8 bg-gray-200 rounded-sm w-20 mx-auto'></div>
    </td>
  </tr>
);

const LoadingTable = () => (
  <div className='mt-4 bg-white rounded-lg shadow-sm overflow-hidden'>
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead>
          <tr className='bg-gray-50'>
            {Array(11)
              .fill(0)
              .map((_, index) => (
                <th key={index} className='px-4 py-3'>
                  <div className='animate-pulse h-4 bg-gray-200 rounded-sm w-20'></div>
                </th>
              ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <SkeletonRow key={index} />
            ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Format played time utility
const formatPlayedTime = (seconds: number): string => {
  if (seconds <= 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate form points utility
const calculateFormPoints = (form: string): number => {
  if (!form) return 0;
  const wins = (form.match(/W/g) || []).length;
  const draws = (form.match(/D/g) || []).length;
  const points = wins * 3 + draws * 1;
  const maxPoints = form.length * 3;
  return Math.round((points / maxPoints) * 100);
};

// Header Cell Component with Filter
const HeaderCell = ({
  title,
  sortDirection,
  onSort,
  onFilter,
  filterType,
  align = 'left',
  isActive = false,
  className,
}: {
  title: string;
  sortDirection?: SortDirection;
  onSort?: () => void;
  onFilter?: (value: string) => void;
  filterType?: FilterType;
  align?: 'left' | 'right' | 'center';
  isActive?: boolean;
  className?: string;
}) => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <th className={`px-4 py-3 ${className}`}>
      <div className='flex flex-col gap-2'>
        <div
          className={`flex items-center justify-${align} gap-2 cursor-pointer ${
            isActive ? 'text-blue-600' : ''
          }`}
          onClick={onSort}
        >
          <span className='text-sm font-medium text-gray-500'>{title}</span>
          {sortDirection && (
            <div className='flex flex-col'>
              <ChevronUp
                className={`w-3 h-3 ${
                  sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-300'
                }`}
              />
              <ChevronDown
                className={`w-3 h-3 ${
                  sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-300'
                }`}
              />
            </div>
          )}
          {filterType !== 'none' && (
            <Filter
              className={`w-4 h-4 cursor-pointer hover:text-blue-600 ${
                isActive ? 'text-blue-600' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setShowFilter(!showFilter);
              }}
            />
          )}
        </div>
        {showFilter && filterType && onFilter && (
          <div className='relative'>
            {filterType === 'status' ? (
              <select
                className='w-full text-sm border rounded-sm px-2 py-1'
                onChange={(e) => onFilter(e.target.value)}
              >
                <option value=''>All</option>
                <option value='1H'>1H</option>
                <option value='HT'>HT</option>
                <option value='2H'>2H</option>
                <option value='FT'>FT</option>
              </select>
            ) : filterType === 'playedSeconds' ? (
              <input
                type='number'
                className='w-full text-sm border rounded-sm px-2 py-1'
                placeholder='Min minutes'
                onChange={(e) =>
                  onFilter((parseInt(e.target.value) * 60).toString())
                }
              />
            ) : (
              <input
                type='number'
                className='w-full text-sm border rounded-sm px-2 py-1'
                placeholder={`Min ${filterType}`}
                onChange={(e) => onFilter(e.target.value)}
              />
            )}
          </div>
        )}
      </div>
    </th>
  );
};

// Search Bar Component
const SearchBar = ({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div className='container mx-auto'>
    <div className='p-4 bg-white shadow-xs mt-4 rounded-lg'>
      <div className='relative'>
        <span className='absolute inset-y-0 left-3 flex items-center text-gray-400'>
          🔍
        </span>
        <input
          type='text'
          placeholder='Search teams...'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  </div>
);

// Stats Component with Cart Badge
const Stats = ({
  matchCount,
  isPaused,
  togglePause,
  onCopyNames,
  onCopyNamesOnly,
  activeTab,
  setActiveTab,
  cartItemsCount,
  upcomingMatchesCount,
  showCartItems,
  setShowCartItems,
  onClearCart,
  onExportCSV,
  disabled = false,
}: {
  matchCount: number;
  isPaused: boolean;
  togglePause: () => void;
  onCopyNames: () => void;
  onCopyNamesOnly: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemsCount: number;
  upcomingMatchesCount: number;
  showCartItems: boolean;
  setShowCartItems: (show: boolean) => void;
  onClearCart: () => void;
  onExportCSV: () => void;
  disabled?: boolean;
}) => {
  // Always set a consistent initial UI for both server and client
  // We'll use client-side useEffect to update the UI after hydration
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Use these default styles for server rendering to ensure consistency
  const defaultButtonStyle = 'px-4 py-2 rounded-lg relative bg-gray-100';

  return (
    <div className='container mx-auto'>
      <div className='flex flex-wrap justify-between items-center p-4 bg-white shadow-xs rounded-lg'>
        <div className='flex items-center space-x-4 mb-2 sm:mb-0'>
          <button
            className={
              isClient
                ? `px-4 py-2 rounded-lg relative ${
                    activeTab === 'live'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                : defaultButtonStyle
            }
            onClick={() => {
              setActiveTab('live');
            }}
            disabled={disabled}
          >
            Live Matches
            {isClient && activeTab === 'live' && (
              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                {matchCount}
              </span>
            )}
          </button>
          <button
            className={
              isClient
                ? `px-4 py-2 rounded-lg relative ${
                    activeTab === 'all-live'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                : defaultButtonStyle
            }
            onClick={() => {
              setActiveTab('all-live');
            }}
            disabled={disabled}
          >
            All Live
            {isClient && activeTab === 'all-live' && (
              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                {matchCount}
              </span>
            )}
          </button>
          <button
            className={
              isClient
                ? `px-4 py-2 rounded-lg relative ${
                    activeTab === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                : defaultButtonStyle
            }
            onClick={() => {
              setActiveTab('upcoming');
            }}
            disabled={disabled}
          >
            Upcoming Matches
            {isClient &&
              activeTab === 'upcoming' &&
              upcomingMatchesCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                  {upcomingMatchesCount}
                </span>
              )}
          </button>
        </div>

        <div className='flex space-x-2 flex-wrap gap-2'>
          <button
            onClick={() => {
              setShowCartItems(!showCartItems);
            }}
            disabled={disabled}
            className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative'
          >
            <ShoppingCart className='w-5 h-5 mr-2' />
            {isClient && cartItemsCount + upcomingMatchesCount > 0 && (
              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                {cartItemsCount + upcomingMatchesCount}
              </span>
            )}
            {showCartItems ? 'Show All Matches' : 'Show Cart Items'}
          </button>
          <button
            onClick={onClearCart}
            disabled={
              disabled ||
              (isClient && cartItemsCount + upcomingMatchesCount === 0)
            }
            className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
              disabled ||
              (isClient && cartItemsCount + upcomingMatchesCount === 0)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <span className='mr-2'>🗑️</span>
            Clear Cart
          </button>
          <button
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
            onClick={onCopyNamesOnly}
            disabled={disabled}
            title='Copy team names only'
          >
            <Copy size={16} />
            <span className='hidden md:inline'>Copy Only</span>
          </button>
          <button
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={onCopyNames}
            disabled={disabled}
            title='Copy team names and add to cart'
          >
            <Copy size={16} />
            <span className='hidden md:inline'>Copy & Add</span>
          </button>
          <button
            onClick={togglePause}
            disabled={disabled}
            className='flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:opacity-90 transition-colors'
          >
            <span className='mr-2'>⏸</span>
            {isClient
              ? isPaused
                ? 'Resume Updates'
                : 'Pause Updates'
              : 'Pause Updates'}
          </button>
          <button
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            onClick={onCopyNames}
            disabled={disabled}
            title='Copy team names to clipboard'
          >
            <Copy size={16} />
            <span className='hidden md:inline'>Copy Names</span>
          </button>
          <button
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            onClick={onExportCSV}
            disabled={disabled}
            title='Export cart items to CSV'
          >
            <FileDown size={16} />
            <span className='hidden md:inline'>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Market Row Component
const MarketRow = ({
  match,
  market,
  cartItems,
  addItem,
  removeItem,
  disabled = false,
  isExpanded,
  onToggleExpand,
  isMatchSaved,
}: {
  match: Match;
  market: Match['markets'][0];
  cartItems: any[];
  addItem: (item: any) => void;
  removeItem: (matchId: string, marketId: string) => void;
  disabled?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isMatchSaved?: (matchId: string) => boolean;
}) => {
  // Use a more robust check that won't be affected by frequent data updates
  const isInCart = useMemo(() => {
    return cartItems.some(
      (item) =>
        String(item.matchId) === String(match.id) &&
        String(item.marketId) === String(market.id)
    );
  }, [cartItems, match.id, market.id]);

  const findPredictionForMatch = useCartStore(
    (state) => state.findPredictionForMatch
  );
  const predictionData = useCartStore((state) => state.predictionData);
  const isPredictionDataLoaded = useCartStore(
    (state) => state.isPredictionDataLoaded
  );

  const [predictionMatch, setPredictionMatch] = useState<any>(null);
  const [hasPrediction, setHasPrediction] = useState(false);
  const [performanceValidation, setPerformanceValidation] = useState<{
    isValid: boolean;
    metrics: {
      attacks: boolean;
      possession: boolean;
      dangerousAttacks: boolean;
      shots: boolean;
      score?: boolean;
    };
    score: number;
  } | null>(null);

  useEffect(() => {
    if (!isPredictionDataLoaded || !predictionData.length) {
      setPredictionMatch(null);
      setHasPrediction(false);
      return;
    }

    const foundMatch = findPredictionForMatch(
      match.teams.home.name,
      match.teams.away.name
    );

    setPredictionMatch(foundMatch);
    setHasPrediction(Boolean(foundMatch));

    // If we have both prediction and live data, validate performance
    if (foundMatch && match.matchDetails && match.matchSituation) {
      const preferredTeam = foundMatch.favorite === 'home' ? 'home' : 'away';
      const opposingTeam = foundMatch.favorite === 'home' ? 'away' : 'home';

      // Calculate validation metrics
      const metrics: {
        attacks: boolean;
        possession: boolean;
        dangerousAttacks: boolean;
        shots: boolean;
        score?: boolean;
      } = {
        // Preferred team has more attacks
        attacks:
          (match.matchSituation[preferredTeam].totalAttacks || 0) >
          (match.matchSituation[opposingTeam].totalAttacks || 0),

        // Preferred team has more possession
        possession:
          (match.matchDetails[preferredTeam].ballSafePercentage || 0) >
          (match.matchDetails[opposingTeam].ballSafePercentage || 0),

        // Preferred team has more dangerous attacks
        dangerousAttacks:
          (match.matchSituation[preferredTeam].totalDangerousAttacks || 0) >
          (match.matchSituation[opposingTeam].totalDangerousAttacks || 0),

        // Preferred team has more shots on target
        shots:
          (match.matchDetails[preferredTeam].shotsOnTarget || 0) >
          (match.matchDetails[opposingTeam].shotsOnTarget || 0),
      };

      // Check score if match has started and has a valid score
      if (match.score && match.status !== 'NS') {
        try {
          // Get the actual score and parse it
          const [homeGoals, awayGoals] = match.score
            .replace(':', '-') // normalize separator to '-'
            .split('-')
            .map((g) => parseInt(g.trim(), 10));

          // Validate score parsing
          if (!isNaN(homeGoals) && !isNaN(awayGoals)) {
            // Set score metric based on who is preferred and who is winning
            if (preferredTeam === 'home') {
              metrics.score = homeGoals > awayGoals;
            } else {
              metrics.score = awayGoals > homeGoals;
            }
          } else {
            metrics.score = false;
          }
        } catch {
          metrics.score = false;
        }
      } else {
        metrics.score = false;
      }

      // Calculate overall validation score (0-5)
      const validationScore = Object.values(metrics).filter(Boolean).length;

      setPerformanceValidation({
        isValid: validationScore >= 3, // Consider valid if 3 or more metrics are positive
        metrics,
        score: validationScore,
      });
    }
  }, [
    match.teams.home.name,
    match.teams.away.name,
    findPredictionForMatch,
    predictionData,
    isPredictionDataLoaded,
    match.matchDetails,
    match.matchSituation,
    match.score,
    match.status,
  ]);

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (hasPrediction) {
        e.preventDefault();
        e.stopPropagation();
        onToggleExpand();
      }
    },
    [hasPrediction, onToggleExpand]
  );

  const TOTAL_INVESTMENT = 100000;

  const createOutcomeKey = useCallback(
    (outcomeId: string, index: number) => {
      return `${match.id}-${market.id}-${outcomeId}-${index}`;
    },
    [match.id, market.id]
  );

  const getOddsClassName = useCallback((outcome: { isChanged?: boolean }) => {
    if (!outcome.isChanged) return 'text-sm font-medium text-right';
    return 'text-sm font-medium text-right bg-yellow-100 transition-colors duration-500';
  }, []);

  // Check if match is saved
  const isSaved = useMemo(
    () => (isMatchSaved ? isMatchSaved(match.id) : false),
    [isMatchSaved, match.id]
  );

  const rowClassName = useMemo(() => {
    return `border-t transition-all duration-300 ease-in-out match-row fixed-height-row ${
      hasPrediction
        ? performanceValidation
          ? performanceValidation.isValid
            ? 'border-l-4 border-l-green-600 bg-green-50 hover:bg-green-100'
            : 'border-l-4 border-l-red-600 bg-red-50 hover:bg-red-100'
          : 'border-l-4 border-l-blue-600 bg-blue-50 hover:bg-blue-100'
        : 'hover:bg-gray-50'
    }`;
  }, [hasPrediction, performanceValidation]);

  const expandedRowClassName = useMemo(() => {
    return `transition-all duration-300 ease-in-out expanded-row ${
      performanceValidation?.isValid
        ? 'bg-green-50/50'
        : performanceValidation
        ? 'bg-red-50/50'
        : 'bg-blue-50/50'
    }`;
  }, [performanceValidation]);

  const handleAddRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isInCart) {
        removeItem(match.id, market.id);
      } else {
        const newItem = {
          matchId: match.id,
          marketId: market.id,
          teams: match.teams,
          market: {
            ...market,
            outcomes: market.outcomes,
          },
          match: {
            ...match, // Include the full match object for export
            matchDetails: match.matchDetails || {},
            matchSituation: match.matchSituation || {},
          },
          addedAt: new Date().toISOString(),
        };
        addItem(newItem);
      }
    },
    [addItem, isInCart, match, market, removeItem]
  );

  return (
    <>
      <tr
        className={rowClassName}
        onClick={handleRowClick}
        style={{ cursor: hasPrediction ? 'pointer' : 'default' }}
      >
        {/* Teams & Status Column */}
        <td className='px-4 py-3 min-w-[250px]'>
          <div className='flex flex-col space-y-1'>
            <div className='flex items-center space-x-2'>
              <span className='font-medium text-gray-900'>
                {match.teams.home.name}
              </span>
              <div className='flex flex-col space-y-1'>
                {hasPrediction && (
                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    Prediction
                  </span>
                )}
                {isSaved && (
                  <span
                    className='text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 font-semibold flex items-center'
                    title='This match was saved from Upcoming Tab'
                  >
                    <Database className='w-3 h-3 mr-0.5' />
                    Saved
                  </span>
                )}
              </div>
            </div>
            <span className='text-sm text-gray-600'>
              {match.teams.away.name}
            </span>
            <div className='flex items-center space-x-2 mt-1'>
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                {match.status}
              </span>
              {match.status !== 'FT' && (
                <span className='text-xs text-gray-500'>
                  {formatPlayedTime(match.playedSeconds)}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Score Column */}
        <td className='px-4 py-3 text-center'>
          <span className='text-sm font-medium text-gray-900'>
            {match.score || '-'}
          </span>
        </td>

        {/* Tournament Column */}
        <td className='px-4 py-3'>
          <span className='text-sm text-gray-700'>{match.tournamentName}</span>
        </td>

        {/* Market Column */}
        <td className='px-4 py-3'>
          <span className='text-sm text-gray-700'>{market.description}</span>
        </td>

        {/* Profit % Column */}
        <td className='px-4 py-3 text-right'>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              market.profitPercentage > 5
                ? 'bg-green-100 text-green-800'
                : market.profitPercentage > 2
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {market.profitPercentage.toFixed(2)}%
          </span>
        </td>

        {/* Margin Column */}
        <td className='px-4 py-3 text-right'>
          <span className='text-sm text-gray-700'>
            {market.margin.toFixed(2)}%
          </span>
        </td>

        {/* Outcomes Column */}
        <td className='px-4 py-3'>
          <div className='space-y-1'>
            {market.outcomes.map((outcome, index) => (
              <div
                key={createOutcomeKey(outcome.id, index)}
                className='text-sm text-gray-700'
              >
                {outcome.description}
              </div>
            ))}
          </div>
        </td>

        {/* Odds Column */}
        <td className='px-4 py-3'>
          <div className='space-y-1'>
            {market.outcomes.map((outcome, index) => (
              <div
                key={createOutcomeKey(outcome.id, index)}
                className={getOddsClassName(outcome)}
              >
                {outcome.odds.toFixed(2)}
              </div>
            ))}
          </div>
        </td>

        {/* Stake % Column */}
        <td className='px-4 py-3'>
          <div className='space-y-1'>
            {market.outcomes.map((outcome, index) => (
              <div
                key={createOutcomeKey(outcome.id, index)}
                className='text-sm text-gray-700 text-right'
              >
                {outcome.stakePercentage.toFixed(2)}%
              </div>
            ))}
          </div>
        </td>

        {/* Investment Column */}
        <td className='px-4 py-3'>
          <div className='space-y-1'>
            {market.outcomes.map((outcome, index) => (
              <div
                key={createOutcomeKey(outcome.id, index)}
                className='text-sm text-gray-700 text-right'
              >
                $
                {((outcome.stakePercentage / 100) * TOTAL_INVESTMENT).toFixed(
                  2
                )}
              </div>
            ))}
          </div>
        </td>

        {/* Favourite Column */}
        <td className='px-4 py-3 text-center'>
          <span className='text-sm font-medium text-gray-900'>
            {market.favourite}
          </span>
        </td>

        {/* Add new validation indicator cell */}
        <td className='px-4 py-3 text-center'>
          {performanceValidation && (
            <div className='flex flex-col items-center gap-1'>
              <span
                className={`text-sm font-medium ${
                  performanceValidation.isValid
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {performanceValidation.score}/5
              </span>
              <div className='flex gap-1'>
                {Object.entries(performanceValidation.metrics).map(
                  ([key, value]) => (
                    <span
                      key={key}
                      className={`w-2 h-2 rounded-full ${
                        value ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      title={`${key}: ${value ? 'Pass' : 'Fail'}`}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </td>

        {/* Actions Column */}
        <td className='px-4 py-3 text-center'>
          <button
            onClick={handleAddRemoveClick}
            disabled={disabled}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isInCart
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isInCart ? 'Remove' : 'Add'}
          </button>
        </td>
      </tr>

      {/* Expanded prediction details */}
      {isExpanded && hasPrediction && predictionMatch && (
        <tr className={expandedRowClassName}>
          <td colSpan={13} className='p-4'>
            <div className='border border-gray-100 rounded-lg bg-white p-4 shadow-sm space-y-4 expanded-content'>
              {/* Win Probability & Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='col-span-2 bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    WIN PROBABILITY
                  </h4>
                  <div className='flex items-center justify-between'>
                    <div className='text-center'>
                      <div
                        className={`text-2xl font-bold ${
                          predictionMatch.favorite === 'home'
                            ? 'text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border-2 border-blue-200'
                            : 'text-gray-600'
                        }`}
                      >
                        {match.teams.home.name}
                        {predictionMatch.favorite === 'home' && (
                          <div className='text-xs font-medium text-blue-600 mt-1'>
                            Preferred Team
                          </div>
                        )}
                      </div>
                      <div className='text-2xl font-bold text-blue-600'>
                        {predictionMatch?.homeTeam?.winPercentage?.toFixed(0) ||
                          '67'}
                        %
                      </div>
                      <div className='text-xs text-gray-600'>
                        Position #{predictionMatch?.homeTeam?.position || '-'}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-600'>
                        {match.score || '0-0'}
                      </div>
                      <div className='text-xs text-gray-600'>
                        {match.status}
                      </div>
                      <div className='text-xs font-medium mt-1 px-2 py-0.5 rounded-full bg-gray-100'>
                        DRAW:{' '}
                        {predictionMatch?.drawPercentage?.toFixed(0) || '0'}%
                      </div>
                    </div>
                    <div className='text-center'>
                      <div
                        className={`text-2xl font-bold ${
                          predictionMatch.favorite === 'away'
                            ? 'text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border-2 border-purple-200'
                            : 'text-gray-600'
                        }`}
                      >
                        {match.teams.away.name}
                        {predictionMatch.favorite === 'away' && (
                          <div className='text-xs font-medium text-purple-600 mt-1'>
                            Preferred Team
                          </div>
                        )}
                      </div>
                      <div className='text-2xl font-bold text-purple-600'>
                        {predictionMatch?.awayTeam?.winPercentage?.toFixed(0) ||
                          '70'}
                        %
                      </div>
                      <div className='text-xs text-gray-600'>
                        Position #{predictionMatch?.awayTeam?.position || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expected Goals Box */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    PREDICTION SUMMARY
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>
                        Expected Goals:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          predictionMatch?.expectedGoals >= 2.2
                            ? 'text-green-600'
                            : predictionMatch?.expectedGoals >= 1.5
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {predictionMatch?.expectedGoals?.toFixed(1) || '3.9'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Confidence:</span>
                      <span className='text-sm font-bold text-blue-600'>
                        {predictionMatch?.confidenceScore || '0'}%
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>
                        Preferred Team:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          predictionMatch.favorite === 'home'
                            ? 'text-blue-600'
                            : 'text-purple-600'
                        }`}
                      >
                        {predictionMatch.favorite === 'home'
                          ? match.teams.home.name
                          : match.teams.away.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Validation Section - Move it up for better visibility */}
              {performanceValidation && (
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    PREDICTION VALIDATION FOR{' '}
                    {predictionMatch.favorite === 'home'
                      ? match.teams.home.name
                      : match.teams.away.name}
                  </h4>
                  <div className='grid grid-cols-5 gap-4'>
                    {Object.entries(performanceValidation.metrics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className={`p-2 rounded-lg ${
                            value ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          <div className='text-xs font-medium text-gray-500'>
                            {key.toUpperCase()}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              value ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {value ? 'PASS' : 'FAIL'}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className='grid grid-cols-4 gap-4'>
                {/* Match Info */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    MATCH INFO
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Tournament:</span>
                      <span className='text-sm font-medium'>
                        {match.tournamentName}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Time:</span>
                      <span className='text-sm font-medium'>
                        {formatPlayedTime(match.playedSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form & Points */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    FORM & POINTS
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>HOME</span>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm font-medium'>
                          {predictionMatch?.homeTeam?.form || 'DLLLL'}
                        </span>
                        <span className='text-xs text-gray-500'>
                          (
                          {calculateFormPoints(
                            predictionMatch?.homeTeam?.form || 'DLLLL'
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm font-medium'>
                          {predictionMatch?.awayTeam?.form || 'WWWWW'}
                        </span>
                        <span className='text-xs text-gray-500'>
                          (
                          {calculateFormPoints(
                            predictionMatch?.awayTeam?.form || 'WWWWW'
                          )}
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
                      <span className='text-xs text-blue-600'>HOME</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.homeTeam?.averageGoalsScored?.toFixed(
                          1
                        ) || '2.3'}{' '}
                        Scored/Game
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.awayTeam?.averageGoalsScored?.toFixed(
                          1
                        ) || '3.0'}{' '}
                        Scored/Game
                      </span>
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
                      <span className='text-xs text-blue-600'>HOME</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.homeTeam?.homeWinPercentage?.toFixed(
                          0
                        ) || '0'}
                        % (home)
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.awayTeam?.awayWinPercentage?.toFixed(
                          0
                        ) || '0'}
                        % (away)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Momentum & Stats */}
              <div className='grid grid-cols-3 gap-4'>
                {/* Momentum */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    MOMENTUM
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Dominant:</span>
                      <span
                        className={`text-sm font-medium ${
                          match.matchSituation?.dominantTeam === 'Away'
                            ? 'text-purple-600'
                            : match.matchSituation?.dominantTeam === 'Home'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {match.matchSituation?.dominantTeam || 'None'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Trend:</span>
                      <span
                        className={`text-sm font-medium ${
                          match.matchSituation?.matchMomentum === 'Away'
                            ? 'text-purple-600'
                            : match.matchSituation?.matchMomentum === 'Home'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {match.matchSituation?.matchMomentum || 'Neutral'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Total Time:</span>
                      <span className='text-sm font-medium'>
                        {match.matchSituation?.totalTime || 0} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shots */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    SHOTS
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>HOME</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-green-600'>
                          {match.matchDetails?.home.shotsOnTarget || 0} on
                        </span>
                        <span className='text-sm font-medium text-red-600'>
                          {match.matchDetails?.home.shotsOffTarget || 0} off
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-green-600'>
                          {match.matchDetails?.away.shotsOnTarget || 0} on
                        </span>
                        <span className='text-sm font-medium text-red-600'>
                          {match.matchDetails?.away.shotsOffTarget || 0} off
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Total:</span>
                      <span className='text-sm font-medium'>
                        {(match.matchDetails?.home.goalAttempts || 0) +
                          (match.matchDetails?.away.goalAttempts || 0)}{' '}
                        shots
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attacks */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    ATTACKS
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>HOME</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-amber-600'>
                          {match.matchSituation?.home.totalDangerousCount || 0}{' '}
                          dng (
                          {match.matchSituation?.home.totalDangerousAttacks ||
                            0}{' '}
                          total)
                        </span>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.home.totalAttackCount || 0} cur
                          ({match.matchSituation?.home.totalAttacks || 0} total)
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-amber-600'>
                          {match.matchSituation?.away.totalDangerousCount || 0}{' '}
                          dng (
                          {match.matchSituation?.away.totalDangerousAttacks ||
                            0}{' '}
                          total)
                        </span>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.away.totalAttackCount || 0} cur
                          ({match.matchSituation?.away.totalAttacks || 0} total)
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Safe:</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.home.totalSafeCount || 0}H (
                          {match.matchSituation?.home.totalSafeAttacks || 0}{' '}
                          total)
                        </span>
                        <span className='text-sm font-medium text-purple-600'>
                          {match.matchSituation?.away.totalSafeCount || 0}A (
                          {match.matchSituation?.away.totalSafeAttacks || 0}{' '}
                          total)
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Attack %:</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.home.attackPercentage || 0}%H
                        </span>
                        <span className='text-sm font-medium text-purple-600'>
                          {match.matchSituation?.away.attackPercentage || 0}%A
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Match Stats */}
              <div className='grid grid-cols-4 gap-4'>
                {/* Attack Percentages */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    ATTACK BREAKDOWN
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>HOME</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-amber-600'>
                          {match.matchSituation?.home
                            .dangerousAttackPercentage || 0}
                          % dng
                        </span>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.home.safeAttackPercentage || 0}
                          % safe
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-amber-600'>
                          {match.matchSituation?.away
                            .dangerousAttackPercentage || 0}
                          % dng
                        </span>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.away.safeAttackPercentage || 0}
                          % safe
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>
                        Total Count:
                      </span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-blue-600'>
                          {match.matchSituation?.home.totalAttackCount || 0}H
                        </span>
                        <span className='text-sm font-medium text-purple-600'>
                          {match.matchSituation?.away.totalAttackCount || 0}A
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corners & Cards */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    CORNERS & CARDS
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>HOME</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>
                          {match.matchDetails?.home.cornerKicks || 0} cor
                        </span>
                        <span className='text-sm font-medium text-yellow-600'>
                          {match.matchDetails?.home.yellowCards || 0}Y
                        </span>
                        <span className='text-sm font-medium text-red-600'>
                          {match.matchDetails?.home.redCards || 0}R
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>
                          {match.matchDetails?.away.cornerKicks || 0} cor
                        </span>
                        <span className='text-sm font-medium text-yellow-600'>
                          {match.matchDetails?.away.yellowCards || 0}Y
                        </span>
                        <span className='text-sm font-medium text-red-600'>
                          {match.matchDetails?.away.redCards || 0}R
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fouls & Free Kicks */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    FOULS & FREE KICKS
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>HOME</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-red-600'>
                          {match.matchDetails?.home.fouls || 0} fouls
                        </span>
                        <span className='text-sm font-medium'>
                          {match.matchDetails?.home.freeKicks || 0} FK
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>AWAY</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-red-600'>
                          {match.matchDetails?.away.fouls || 0} fouls
                        </span>
                        <span className='text-sm font-medium'>
                          {match.matchDetails?.away.freeKicks || 0} FK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    KEY INSIGHTS
                  </h4>
                  <div className='space-y-1 max-h-[80px] overflow-y-auto text-xs'>
                    {predictionMatch?.reasonsForPrediction ? (
                      predictionMatch.reasonsForPrediction.map(
                        (reason: string, idx: number) => (
                          <div
                            key={idx}
                            className='text-gray-600 flex items-start'
                          >
                            <span className='text-blue-600 mr-1'>•</span>
                            {reason}
                          </div>
                        )
                      )
                    ) : (
                      <>
                        <div className='text-gray-600 flex items-start'>
                          <span className='text-blue-600 mr-1'>•</span>
                          High-scoring potential based on team analysis
                        </div>
                        <div className='text-gray-600 flex items-start'>
                          <span className='text-blue-600 mr-1'>•</span>
                          Historical head-to-head performance analysis
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* BTTS & Overs */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    BTTS & OVERS
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>BTTS:</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.homeTeam?.bttsRate?.toFixed(0) ||
                          '70'}
                        % (H) /{' '}
                        {predictionMatch?.awayTeam?.bttsRate?.toFixed(0) ||
                          '60'}
                        % (A)
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Over 1.5:</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.homeTeam?.over15?.toFixed(0) || '0'}%
                        (H) /{' '}
                        {predictionMatch?.awayTeam?.over15?.toFixed(0) || '0'}%
                        (A)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent H2H */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <h4 className='text-xs font-medium text-gray-500 mb-2'>
                    HEAD TO HEAD
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-blue-600'>Home:</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.headToHead?.wins || '0'}W
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-purple-600'>Away:</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.headToHead?.losses || '0'}W
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>Draw:</span>
                      <span className='text-sm font-medium'>
                        {predictionMatch?.headToHead?.draws || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Odds */}
              <div className='bg-gray-50 rounded-lg p-3'>
                <h4 className='text-xs font-medium text-gray-500 mb-2'>
                  LIVE ODDS
                </h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <h4 className='text-xs font-medium text-gray-500 mb-2'>
                      1X2
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs text-blue-600'>Home:</span>
                        <span className='text-sm font-medium'>
                          {match.markets
                            .find((m) =>
                              m.outcomes.some((o) => o.description === '1')
                            )
                            ?.outcomes.find((o) => o.description === '1')
                            ?.odds.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs text-gray-500'>Draw:</span>
                        <span className='text-sm font-medium'>
                          {match.markets
                            .find((m) =>
                              m.outcomes.some((o) => o.description === 'X')
                            )
                            ?.outcomes.find((o) => o.description === 'X')
                            ?.odds.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs text-purple-600'>Away:</span>
                        <span className='text-sm font-medium'>
                          {match.markets
                            .find((m) =>
                              m.outcomes.some((o) => o.description === '2')
                            )
                            ?.outcomes.find((o) => o.description === '2')
                            ?.odds.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='border-l border-gray-200 pl-4'>
                    <h4 className='text-xs font-medium text-gray-500 mb-2'>
                      GOALS
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs text-gray-500'>Over 1.5:</span>
                        <span className='text-sm font-medium'>
                          {match.markets
                            .find((m) =>
                              m.outcomes.some((o) =>
                                o.description.includes('Over 1.5')
                              )
                            )
                            ?.outcomes.find((o) =>
                              o.description.includes('Over 1.5')
                            )
                            ?.odds.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs text-gray-500'>BTTS:</span>
                        <span className='text-sm font-medium'>
                          {match.markets
                            .find((m) =>
                              m.outcomes.some((o) =>
                                o.description.includes('Yes')
                              )
                            )
                            ?.outcomes.find((o) =>
                              o.description.includes('Yes')
                            )
                            ?.odds.toFixed(2) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// Find the MemoizedMarketRow component and update its memo comparison function
const MemoizedMarketRow = React.memo(MarketRow, (prevProps, nextProps) => {
  // Generate stable keys for market and team objects to enhance React reconciliation
  const getStableId = (match: Match, market: Match['markets'][0]) => {
    return `${match.id}-${market.id}`;
  };

  const prevStableId = getStableId(prevProps.match, prevProps.market);
  const nextStableId = getStableId(nextProps.match, nextProps.market);

  // If the ids changed completely, it's a different match/market
  if (prevStableId !== nextStableId) {
    return false;
  }

  // Check if this item is in the cart - this is crucial for the Add/Remove button
  const prevIsInCart = prevProps.cartItems.some(
    (item) =>
      String(item.matchId) === String(prevProps.match.id) &&
      String(item.marketId) === String(prevProps.market.id)
  );

  const nextIsInCart = nextProps.cartItems.some(
    (item) =>
      String(item.matchId) === String(nextProps.match.id) &&
      String(item.marketId) === String(nextProps.market.id)
  );

  // Track critical visual changes that should trigger re-renders
  const scoreChanged = prevProps.match.score !== nextProps.match.score;
  const statusChanged = prevProps.match.status !== nextProps.match.status;
  const playedTimeChanged =
    prevProps.match.playedSeconds !== nextProps.match.playedSeconds;

  // If expanded state, cart state, score, status or played time changes, re-render
  if (
    prevProps.isExpanded !== nextProps.isExpanded ||
    prevIsInCart !== nextIsInCart ||
    scoreChanged ||
    statusChanged ||
    playedTimeChanged
  ) {
    return false; // Don't skip render
  }

  // Only re-render market outcomes if they've actually changed
  const prevOutcomes = JSON.stringify(prevProps.market.outcomes);
  const nextOutcomes = JSON.stringify(nextProps.market.outcomes);

  // If saved status changed, re-render
  const savedStatusChanged =
    prevProps.isMatchSaved?.(prevProps.match.id) !==
    nextProps.isMatchSaved?.(nextProps.match.id);

  if (prevOutcomes !== nextOutcomes || savedStatusChanged) {
    return false; // Don't skip render
  }

  // Skip render for less important data changes to reduce flickering
  return true;
});

// Main Component
const MatchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Initialize activeTab from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTab');
      return savedTab || 'all-live';
    }
    return 'all-live';
  });
  const [copiedText, setCopiedText] = useState<string>('');
  const [showCartItems, setShowCartItems] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [enableGrouping, setEnableGrouping] = useState<boolean>(false);
  const [groupSize, setGroupSize] = useState<number>(4);
  const [showOnlySavedMatches, setShowOnlySavedMatches] =
    useState<boolean>(false);
  const [sortConfigs, setSortConfigs] = useState<
    Array<{ field: string; direction: SortDirection }>
  >(() => {
    // Initialize sortConfigs from localStorage if available
    if (typeof window !== 'undefined') {
      const savedSortConfigs = localStorage.getItem('sortConfigs');
      if (savedSortConfigs) {
        try {
          return JSON.parse(savedSortConfigs) as Array<{
            field: string;
            direction: SortDirection;
          }>;
        } catch (e) {
          console.error('Failed to parse saved sort configs', e);
        }
      }
    }
    return [{ field: 'playedSeconds', direction: 'asc' }];
  });
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    // Initialize filters from localStorage if available
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('liveFilters');
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters) as Record<string, string>;
        } catch (e) {
          console.error('Failed to parse saved filters', e);
        }
      }
    }
    return {};
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [savedMatchIds, setSavedMatchIds] = useState<Set<string>>(new Set());
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Add a ref to store the previous filtered matches for stable rendering
  const previousMatchesRef = useRef<Match[]>([]);
  const dataUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [dataUpdating, setDataUpdating] = useState(false);

  // Update localStorage whenever activeTab changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const {
    matches: liveMatches,
    allLiveMatches,
    isPaused,
    togglePause,
    isConnected,
  } = useMatchData();

  const {
    items: cartItems,
    upcomingMatches,
    predictionData,
    isPredictionDataLoaded,
    addItem,
    removeItem,
    clearCart,
    clearUpcomingMatches,
    getUpcomingMatchesCount,
    addUpcomingMatch,
  } = useCartStore();

  // Update isInitialLoading based on allLiveMatches
  useEffect(() => {
    setIsInitialLoading(allLiveMatches.length === 0 && isConnected);
  }, [allLiveMatches, isConnected]);

  // Fetch saved matches when component mounts
  useEffect(() => {
    fetchSavedMatches();

    // Refresh saved matches every 5 minutes
    const intervalId = setInterval(fetchSavedMatches, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Check if a match is saved - moved up before it's used
  const isMatchSaved = useCallback(
    (matchId: string) => {
      // Convert both to string to ensure type consistency
      const matchIdStr = String(matchId);
      const isSaved = Array.from(savedMatchIds).some(
        (id) => String(id) === matchIdStr
      );
      return isSaved;
    },
    [savedMatchIds]
  );

  const getSortedAndFilteredMatches = (matches: Match[]): Match[] => {
    // Create a fresh copy of the matches to ensure we're working with the latest data
    const transformedMatches = matches.map((match) => ({
      ...match,
      matchDetails: match.matchDetails
        ? {
            ...match.matchDetails,
            types: match.matchDetails.types || {},
          }
        : undefined,
    }));

    const filtered = transformedMatches.filter((match) => {
      // Split search query into home and away team parts
      const searchLower = searchQuery.toLowerCase().trim();
      const [homeSearch, awaySearch] = searchLower
        .split(' vs ')
        .map((s) => s.trim());

      // Apply text search - match home team with home search and away team with away search
      const matchesSearch =
        searchLower === '' ||
        ((homeSearch === '' ||
          match.teams.home.name.toLowerCase().trim() === homeSearch) &&
          (awaySearch === '' ||
            match.teams.away.name.toLowerCase().trim() === awaySearch));

      // Apply filters
      const matchesStatus = !filters.status || match.status === filters.status;
      const matchesPlayedTime =
        !filters.playedSeconds ||
        match.playedSeconds >= Number(filters.playedSeconds);
      const matchesProfit =
        !filters.profit ||
        match.markets.some((m) => m.profitPercentage >= Number(filters.profit));
      const matchesMargin =
        !filters.margin ||
        match.markets.some((m) => m.margin >= Number(filters.margin));
      const matchesOdds =
        !filters.odds ||
        match.markets.some((m) =>
          m.outcomes.some((o) => o.odds >= Number(filters.odds))
        );

      // Filter by cart items if showCartItems is true
      const matchesCart =
        !showCartItems ||
        match.markets.some((market) =>
          cartItems.some(
            (item) =>
              String(item.matchId) === String(match.id) &&
              String(item.marketId) === String(market.id)
          )
        );

      // Filter by saved matches using local function instead of isMatchSaved
      const matchesSaved = (() => {
        // Skip this filter if showOnlySavedMatches is false
        if (!showOnlySavedMatches) {
          return true;
        }

        // When filtering for saved matches, ensure we actually check if it's saved
        const matchIdStr = String(match.id);

        return Array.from(savedMatchIds).some(
          (id) => String(id) === matchIdStr
        );
      })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlayedTime &&
        matchesProfit &&
        matchesMargin &&
        matchesOdds &&
        matchesCart &&
        matchesSaved
      );
    });

    // Apply multiple sorts with stable sorting to prevent jumping
    if (sortConfigs.length > 0) {
      filtered.sort((a, b) => {
        // First check if IDs match to maintain stable order for the same item
        if (a.id === b.id) return 0;

        for (const sortConfig of sortConfigs) {
          let comparison = 0;
          let aValue: number | undefined;
          let bValue: number | undefined;

          switch (sortConfig.field) {
            case 'status':
              aValue = getStatusSortValue(a.status);
              bValue = getStatusSortValue(b.status);
              if (aValue < bValue) comparison = -1;
              if (aValue > bValue) comparison = 1;
              break;

            case 'playedSeconds':
              // For matches that haven't started yet
              if (a.status === 'NS' && b.status === 'NS') {
                comparison = 0;
              }
              // If only one match hasn't started, it should come first
              else if (a.status === 'NS') {
                comparison = -1;
              } else if (b.status === 'NS') {
                comparison = 1;
              }
              // For matches that have finished
              else if (a.status === 'FT' && b.status === 'FT') {
                comparison = 0;
              }
              // If only one match is finished, it should come last
              else if (a.status === 'FT') {
                comparison = 1;
              } else if (b.status === 'FT') {
                comparison = -1;
              }
              // For ongoing matches, compare played seconds
              else {
                aValue = a.playedSeconds;
                bValue = b.playedSeconds;
                if (aValue < bValue) comparison = -1;
                if (aValue > bValue) comparison = 1;
              }
              break;

            case 'profit':
              aValue = Math.max(...a.markets.map((m) => m.profitPercentage));
              bValue = Math.max(...b.markets.map((m) => m.profitPercentage));
              if (aValue < bValue) comparison = -1;
              if (aValue > bValue) comparison = 1;
              break;

            case 'margin':
              aValue = Math.max(...a.markets.map((m) => m.margin));
              bValue = Math.max(...b.markets.map((m) => m.margin));
              if (aValue < bValue) comparison = -1;
              if (aValue > bValue) comparison = 1;
              break;

            case 'odds':
              aValue = Math.max(
                ...a.markets.flatMap((m) => m.outcomes.map((o) => o.odds))
              );
              bValue = Math.max(
                ...b.markets.flatMap((m) => m.outcomes.map((o) => o.odds))
              );
              if (aValue < bValue) comparison = -1;
              if (aValue > bValue) comparison = 1;
              break;

            default:
              continue;
          }

          if (comparison !== 0) {
            return sortConfig.direction === 'asc' ? comparison : -comparison;
          }
        }

        // If all other sorting criteria are identical, sort by ID for stability
        // Convert IDs to strings to ensure localeCompare works properly
        return String(a.id).localeCompare(String(b.id));
      });
    }

    // Only filter out '1st Half - Correct Score' for live tab
    if (activeTab === 'live') {
      return filtered.filter((match) =>
        match.markets.some(
          (market) => market.description !== '1st Half - Correct Score'
        )
      );
    }

    return filtered;
  };

  // Function to stabilize data updates and prevent flickering
  const getStabilizedMatches = useCallback(
    (currentMatches: Match[]): Match[] => {
      // When filtering by saved matches or cart items, don't use stabilization
      // This ensures the filter is applied immediately
      if (showOnlySavedMatches || showCartItems) {
        console.log('Bypassing stabilization due to filters being active');
        return currentMatches;
      }

      // If we have no matches at all but had them before, this is likely a temporary flicker
      // Use previous data until we get at least 3 matches to prevent the "one row" issue
      if (currentMatches.length < 3 && previousMatchesRef.current.length > 5) {
        return previousMatchesRef.current;
      }

      // Always use previous data for a brief moment to prevent flickering
      if (dataUpdating) {
        return previousMatchesRef.current;
      }

      // If we have no previous data, use current matches
      if (previousMatchesRef.current.length === 0) {
        // Only initialize if we have a reasonable number of matches
        if (currentMatches.length >= 3) {
          previousMatchesRef.current = currentMatches;
        }
        return currentMatches;
      }

      // Create a map of previous matches by ID for quick lookup
      const prevMatchMap = new Map(
        previousMatchesRef.current.map((match) => [String(match.id), match])
      );

      // Create a map of current matches by ID
      const curMatchMap = new Map(
        currentMatches.map((match) => [String(match.id), match])
      );

      // Start with the previous order of matches to maintain stability
      const stableMatches = [...previousMatchesRef.current];

      // Add new matches that weren't in the previous dataset
      const newMatchIds = currentMatches
        .map((match) => String(match.id))
        .filter((id) => !prevMatchMap.has(id));

      // Add new matches at the end to maintain order stability
      newMatchIds.forEach((id) => {
        const newMatch = curMatchMap.get(id);
        if (newMatch) {
          stableMatches.push(newMatch);
        }
      });

      // Remove matches that are no longer in the current dataset, but be careful
      // If too many matches would be removed, suspect a temporary data issue
      const stableMatchesCandidates = stableMatches.filter((match) =>
        curMatchMap.has(String(match.id))
      );

      // Only remove matches if we're not losing too many at once
      // This helps prevent flickering when data temporarily glitches
      const finalStableMatches =
        stableMatchesCandidates.length <
          previousMatchesRef.current.length / 2 &&
        previousMatchesRef.current.length > 5
          ? previousMatchesRef.current // Use previous if too many would be removed
          : stableMatchesCandidates;

      // Update match data while preserving order
      const result = finalStableMatches.map((match) => {
        const id = String(match.id);
        return curMatchMap.has(id) ? curMatchMap.get(id)! : match;
      });

      // Trigger a small delay before updating the UI to debounce rapid updates
      if (!dataUpdating) {
        setDataUpdating(true);
        if (dataUpdateTimeoutRef.current) {
          clearTimeout(dataUpdateTimeoutRef.current);
        }
        dataUpdateTimeoutRef.current = setTimeout(() => {
          setDataUpdating(false);
          // Only update reference if we have multiple matches and the new data looks good
          if (currentMatches.length >= 3) {
            previousMatchesRef.current = [...result];
          }
        }, 600); // Increased to 600ms for more stability
      }

      return result;
    },
    [dataUpdating, showOnlySavedMatches, showCartItems]
  );

  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      if (dataUpdateTimeoutRef.current) {
        clearTimeout(dataUpdateTimeoutRef.current);
      }
    };
  }, []);

  // In the existing useMemo for memoizedFilteredMatches, apply the stabilization
  const memoizedFilteredMatches = useMemo(() => {
    const rawFilteredMatches = getSortedAndFilteredMatches(
      activeTab === 'live' ? liveMatches : allLiveMatches
    );

    // Apply our stabilization function to prevent flickering
    return getStabilizedMatches(rawFilteredMatches);
  }, [
    // Critical filter states that should always trigger recalculation
    showOnlySavedMatches,
    savedMatchIds,
    activeTab,
    // Data sources
    liveMatches,
    allLiveMatches,
    // Other filters and sorting
    sortConfigs,
    filters,
    searchQuery,
    showCartItems,
    cartItems, // Ensure we're tracking the actual cart items array
    // Stabilization function
    getStabilizedMatches,
  ]);

  // Handle initial loading state
  useEffect(() => {
    if (isConnected && isInitialLoading && liveMatches.length !== 0) {
      setIsInitialLoading(false);
    }
  }, [isConnected, isInitialLoading, liveMatches.length]);

  // Restore the timer effect for copiedText
  useEffect(() => {
    if (copiedText) {
      const timer = setTimeout(() => {
        setCopiedText('');
      }, 3000);

      // Cleanup timer on unmount or when copyText changes
      return () => clearTimeout(timer);
    }
  }, [copiedText]);

  const handleSort = (field: string): void => {
    setSortConfigs((current) => {
      const existingIndex = current.findIndex(
        (config) => config.field === field
      );

      const asc: SortDirection = 'asc';
      const desc: SortDirection = 'desc';

      if (existingIndex === -1) {
        // Add new sort
        const newConfigs = [...current, { field, direction: asc }];
        localStorage.setItem('sortConfigs', JSON.stringify(newConfigs));
        return newConfigs;
      } else {
        // Toggle direction or remove if it was desc
        const newConfigs = [...current];
        if (newConfigs[existingIndex].direction === 'asc') {
          newConfigs[existingIndex].direction = desc;
        } else {
          newConfigs.splice(existingIndex, 1);
        }
        localStorage.setItem('sortConfigs', JSON.stringify(newConfigs));
        return newConfigs;
      }
    });
  };

  const handleFilter = (field: string, value: string): void => {
    setFilters((current) => {
      const newFilters = {
        ...current,
        [field]: value,
      };
      localStorage.setItem('liveFilters', JSON.stringify(newFilters));
      return newFilters;
    });
  };

  // Helper function to get sort value for status
  const getStatusSortValue = (status: string): number => {
    const statusOrder = {
      NS: 0, // Not Started
      '1H': 1, // First Half
      HT: 2, // Half Time
      '2H': 3, // Second Half
      FT: 4, // Full Time
    } as const;
    return statusOrder[status as keyof typeof statusOrder] || 0;
  };

  // Remove debug logging
  useEffect(() => {
    if (isPredictionDataLoaded && predictionData.length > 0) {
      const timeoutId = setTimeout(() => {
        // Only log essential information
        if (predictionData.length > 0) {
          // Remove this console.log as well
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isPredictionDataLoaded, predictionData.length]);

  // Function to clear all carts
  const clearAllCarts = (): void => {
    clearCart();
    clearUpcomingMatches();
  };

  // Update the copy function to handle both carts but make adding to cart optional
  const copyAllNames = (addToCart = false): void => {
    const cartTeamNames = cartItems.map((item) => item.teams.home.name);
    const upcomingTeamNames = upcomingMatches
      .filter((match) => match.favorite === 'home' || match.favorite === 'away')
      .map((match) => {
        const favoriteTeam =
          match.favorite === 'home' ? match.homeTeam.name : match.awayTeam.name;
        return favoriteTeam;
      });

    const allTeams = [...cartTeamNames, ...upcomingTeamNames].join('\n');

    // Only add to cart if explicitly requested
    if (addToCart) {
      // For live tab: add matched from the filtered matches to cart
      memoizedFilteredMatches.forEach((match) => {
        const preferredTeam = getPreferredTeam(match);
        if (preferredTeam && match.markets && match.markets.length > 0) {
          const market = match.markets[0];
          // Check if this match/market is already in cart
          const isInCart = cartItems.some(
            (item) =>
              String(item.matchId) === String(match.id) &&
              String(item.marketId) === String(market.id)
          );

          if (!isInCart) {
            addItem({
              matchId: match.id,
              marketId: market.id,
              teams: match.teams,
              market: {
                ...market,
                outcomes: market.outcomes,
              },
              match: {
                ...match, // Store the complete match object for export
                matchDetails: match.matchDetails || {},
                matchSituation: match.matchSituation || {},
              },
              addedAt: new Date().toISOString(),
            });
          }
        }
      });

      // For upcoming tab: make sure all matches with preferred teams are in cart
      if (activeTab === 'upcoming') {
        const { predictionData } = useCartStore.getState();
        predictionData.forEach((match) => {
          if (match.favorite === 'home' || match.favorite === 'away') {
            const isInCart = useCartStore
              .getState()
              .isUpcomingMatchInCart(match.id);
            if (!isInCart) {
              // Create new team objects with required id properties
              const homeTeamWithId = {
                ...match.homeTeam,
                id: String(
                  match.homeTeam.name.replace(/\s+/g, '_').toLowerCase()
                ),
              };

              const awayTeamWithId = {
                ...match.awayTeam,
                id: String(
                  match.awayTeam.name.replace(/\s+/g, '_').toLowerCase()
                ),
              };

              addUpcomingMatch({
                ...match,
                id: String(match.id),
                homeTeam: homeTeamWithId,
                awayTeam: awayTeamWithId,
              });
            }
          }
        });
      }
    }

    navigator.clipboard
      .writeText(allTeams)
      .then(() =>
        setCopiedText(
          addToCart
            ? `${
                cartTeamNames.length + upcomingTeamNames.length
              } team names copied and added to cart!`
            : `${
                cartTeamNames.length + upcomingTeamNames.length
              } team names copied!`
        )
      )
      .catch((err) => console.error('Failed to copy:', err));
  };

  // Add a function to toggle expanded state
  const toggleExpandedRow = (matchId: string, marketId: string) => {
    setExpandedRows((prev) => {
      const key = `${matchId}-${marketId}`;
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Function to check if a match has a clear preferred team
  const hasClearPreferredTeam = (match: Match): boolean => {
    // Get prediction data for this match
    const { findPredictionForMatch } = useCartStore.getState();
    const predictionMatch = findPredictionForMatch(
      match.teams.home.name,
      match.teams.away.name
    );

    // First determine if we have a preferred team based on prediction data
    let hasPreferredTeam = false;
    let preferredTeamIsHome = false;

    // If we have prediction data, use it to determine if there's a clear preferred team
    if (predictionMatch) {
      // If prediction data has a favorite, consider this a clear preferred team
      if (
        predictionMatch.favorite === 'home' ||
        predictionMatch.favorite === 'away'
      ) {
        hasPreferredTeam = true;
        preferredTeamIsHome = predictionMatch.favorite === 'home';
      } else if (
        predictionMatch.homeTeam?.position !== undefined &&
        predictionMatch.awayTeam?.position !== undefined
      ) {
        // Check position gap from prediction data
        const positionGap = Math.abs(
          predictionMatch.homeTeam.position - predictionMatch.awayTeam.position
        );
        if (positionGap >= 3) {
          hasPreferredTeam = true;
          preferredTeamIsHome =
            predictionMatch.homeTeam.position <
            predictionMatch.awayTeam.position;
        }
      }
    }

    // If we don't have prediction data or couldn't determine a preferred team, check live data
    if (!hasPreferredTeam) {
      if (!match.teams?.home?.position || !match.teams?.away?.position) {
        return false;
      }

      const positionGap = Math.abs(
        match.teams.home.position - match.teams.away.position
      );

      if (positionGap >= 5) {
        hasPreferredTeam = true;
        preferredTeamIsHome =
          match.teams.home.position < match.teams.away.position;
      } else {
        return false; // No clear preferred team based on positions
      }
    }

    // Only proceed if we have a clear preferred team
    if (!hasPreferredTeam) return false;

    // Now check if preferred team is actually performing well in the match
    if (match.matchSituation && match.matchDetails) {
      const preferredTeamKey = preferredTeamIsHome ? 'home' : 'away';
      const opposingTeamKey = preferredTeamIsHome ? 'away' : 'home';

      // Calculate performance metrics
      const metrics: {
        attacks: boolean;
        possession: boolean;
        dangerousAttacks: boolean;
        shots: boolean;
        score?: boolean;
      } = {
        // Preferred team has more attacks
        attacks:
          (match.matchSituation[preferredTeamKey].totalAttacks || 0) >
          (match.matchSituation[opposingTeamKey].totalAttacks || 0),

        // Preferred team has more possession
        possession:
          (match.matchDetails[preferredTeamKey].ballSafePercentage || 0) >
          (match.matchDetails[opposingTeamKey].ballSafePercentage || 0),

        // Preferred team has more dangerous attacks
        dangerousAttacks:
          (match.matchSituation[preferredTeamKey].totalDangerousAttacks || 0) >
          (match.matchSituation[opposingTeamKey].totalDangerousAttacks || 0),

        // Preferred team has more shots on target
        shots:
          (match.matchDetails[preferredTeamKey].shotsOnTarget || 0) >
          (match.matchDetails[opposingTeamKey].shotsOnTarget || 0),
      };

      // Check score if match has started and has a valid score
      if (match.score && match.status !== 'NS') {
        try {
          // Parse the score
          const [homeGoals, awayGoals] = match.score
            .replace(':', '-') // normalize separator to '-'
            .split('-')
            .map((g) => parseInt(g.trim(), 10));

          if (!isNaN(homeGoals) && !isNaN(awayGoals)) {
            // Add score metric - preferred team is winning
            metrics.score = preferredTeamIsHome
              ? homeGoals > awayGoals
              : awayGoals > homeGoals;
          }
        } catch {
          // If parsing fails, don't add score metric
        }
      }

      // Calculate total performance score (0-5)
      const performanceScore = Object.values(metrics).filter(Boolean).length;

      // Only include matches where preferred team is performing well (at least 2/4 metrics)
      return performanceScore >= 2;
    }

    // If we don't have match details, just use the preferred team determination
    return true;
  };

  // Function to get the preferred team from a match
  const getPreferredTeam = (
    match: Match
  ): { id: string; name: string } | null => {
    if (!hasClearPreferredTeam(match)) return null;

    // Get prediction data for this match
    const { findPredictionForMatch } = useCartStore.getState();
    const predictionMatch = findPredictionForMatch(
      match.teams.home.name,
      match.teams.away.name
    );

    // If we have prediction data with a favorite specified, use that
    if (predictionMatch && predictionMatch.favorite) {
      return predictionMatch.favorite === 'home'
        ? match.teams.home
        : match.teams.away;
    }

    // Fall back to position comparison for matches without prediction data
    return match.teams.home.position < match.teams.away.position
      ? match.teams.home
      : match.teams.away;
  };

  // Function to group matches by start time - currently unused but kept for reference
  /* 
  const groupMatchesByStartTime = (
    matches: Match[]
  ): Record<string, Match[]> => {
    const groups: Record<string, Match[]> = {};

    matches.forEach((match) => {
      if (!hasClearPreferredTeam(match)) return;

      // Create a key based on the match date and time
      const startTimeKey = match.matchTime || match.createdAt;

      if (!groups[startTimeKey]) {
        groups[startTimeKey] = [];
      }

      groups[startTimeKey].push(match);
    });

    return groups;
  };
  */

  // Function to create batches of matches with clear preferred teams
  const createMatchGroups = (
    matches: Match[],
    groupSize: number
  ): { prime: Match[][]; regular: Match[][] } => {
    // Get only matches with clear preferred teams
    const eligibleMatches = matches.filter(hasClearPreferredTeam);

    // Score and sort matches based on favorable metrics
    const scoredMatches = eligibleMatches.map((match) => ({
      match,
      score: scoreMatch(match),
      startTime: match.matchTime || match.createdAt,
    }));

    // Group matches by start time first
    const timeGroups: Record<string, typeof scoredMatches> = {};

    scoredMatches.forEach((scoredMatch) => {
      const key = scoredMatch.startTime;
      if (!timeGroups[key]) {
        timeGroups[key] = [];
      }
      timeGroups[key].push(scoredMatch);
    });

    // Sort scored matches by score (descending) while maintaining time grouping
    const sortedScoredMatches: typeof scoredMatches = [];

    Object.values(timeGroups).forEach((group) => {
      // Sort this time group by score
      const sortedGroup = [...group].sort((a, b) => b.score - a.score);
      sortedScoredMatches.push(...sortedGroup);
    });

    // Separate prime matches (score >= 6) from regular matches
    const primeMatches = sortedScoredMatches
      .filter((m) => m.score >= 6)
      .map((m) => m.match);
    const regularMatches = sortedScoredMatches
      .filter((m) => m.score < 6)
      .map((m) => m.match);

    // Create groups of the specified size
    const primeGroups: Match[][] = [];
    for (let i = 0; i < primeMatches.length; i += groupSize) {
      const group = primeMatches.slice(i, i + groupSize);
      if (group.length > 0) {
        primeGroups.push(group);
      }
    }

    const regularGroups: Match[][] = [];
    for (let i = 0; i < regularMatches.length; i += groupSize) {
      const group = regularMatches.slice(i, i + groupSize);
      if (group.length > 0) {
        regularGroups.push(group);
      }
    }

    return { prime: primeGroups, regular: regularGroups };
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
        // Find the first market to add (if available)
        if (match.markets && match.markets.length > 0) {
          const market = match.markets[0];
          // Check if this match/market is already in cart
          const isInCart = cartItems.some(
            (item) =>
              String(item.matchId) === String(match.id) &&
              String(item.marketId) === String(market.id)
          );

          if (!isInCart) {
            addItem({
              matchId: match.id,
              marketId: market.id,
              teams: match.teams,
              market: {
                ...market,
                outcomes: market.outcomes,
              },
              match: {
                ...match, // Include the full match object for export
                matchDetails: match.matchDetails || {},
                matchSituation: match.matchSituation || {},
              },
              addedAt: new Date().toISOString(),
            });
          }
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

  // Score a match based on how many favorable metrics it has
  const scoreMatch = (match: Match): number => {
    // Get prediction data for this match
    const { findPredictionForMatch } = useCartStore.getState();
    const predictionMatch = findPredictionForMatch(
      match.teams.home.name,
      match.teams.away.name
    );

    let score = 0;
    let preferredTeamIsHome = false;

    // Determine preferred team
    if (predictionMatch?.favorite) {
      preferredTeamIsHome = predictionMatch.favorite === 'home';
      score += 1; // Has a favorite from prediction data
    } else if (
      match.teams?.home?.position !== undefined &&
      match.teams?.away?.position !== undefined
    ) {
      preferredTeamIsHome =
        match.teams.home.position < match.teams.away.position;
    }

    const preferredTeamKey = preferredTeamIsHome ? 'home' : 'away';
    const opposingTeamKey = preferredTeamIsHome ? 'away' : 'home';

    // Check prediction data metrics
    if (predictionMatch) {
      // Position gap
      if (
        predictionMatch.homeTeam?.position !== undefined &&
        predictionMatch.awayTeam?.position !== undefined
      ) {
        const positionGap = Math.abs(
          predictionMatch.homeTeam.position - predictionMatch.awayTeam.position
        );
        if (positionGap >= 5) score += 2;
        else if (positionGap >= 3) score += 1;
      }

      // Form
      if (predictionMatch.homeTeam?.form && predictionMatch.awayTeam?.form) {
        const homeFormPoints = calculateFormPoints(
          predictionMatch.homeTeam.form
        );
        const awayFormPoints = calculateFormPoints(
          predictionMatch.awayTeam.form
        );
        const formDiff = Math.abs(homeFormPoints - awayFormPoints);

        if (
          formDiff >= 10 &&
          ((preferredTeamIsHome && homeFormPoints > awayFormPoints) ||
            (!preferredTeamIsHome && awayFormPoints > homeFormPoints))
        ) {
          score += 2;
        }
      }

      // H2H advantage
      if (predictionMatch.headToHead) {
        const h2h = predictionMatch.headToHead;
        if (h2h.matches > 0 && Math.abs(h2h.wins - h2h.losses) > 1) {
          const h2hFavorsPreferred = preferredTeamIsHome
            ? h2h.wins > h2h.losses
            : h2h.losses > h2h.wins;

          if (h2hFavorsPreferred) score += 2;
        }
      }
    }

    // Check live match metrics
    if (match.matchSituation && match.matchDetails) {
      // Attacks
      if (
        (match.matchSituation[preferredTeamKey].totalAttacks || 0) >
        (match.matchSituation[opposingTeamKey].totalAttacks || 0)
      ) {
        score += 1;
      }

      // Possession
      if (
        (match.matchDetails[preferredTeamKey].ballSafePercentage || 0) >
        (match.matchDetails[opposingTeamKey].ballSafePercentage || 0)
      ) {
        score += 1;
      }

      // Dangerous attacks
      if (
        (match.matchSituation[preferredTeamKey].totalDangerousAttacks || 0) >
        (match.matchSituation[opposingTeamKey].totalDangerousAttacks || 0)
      ) {
        score += 1;
      }

      // Shots on target
      if (
        (match.matchDetails[preferredTeamKey].shotsOnTarget || 0) >
        (match.matchDetails[opposingTeamKey].shotsOnTarget || 0)
      ) {
        score += 1;
      }

      // Score
      if (match.score && match.status !== 'NS') {
        try {
          const [homeGoals, awayGoals] = match.score
            .replace(':', '-')
            .split('-')
            .map((g) => parseInt(g.trim(), 10));

          if (!isNaN(homeGoals) && !isNaN(awayGoals)) {
            const isLeading = preferredTeamIsHome
              ? homeGoals > awayGoals
              : awayGoals > homeGoals;

            if (isLeading) score += 2;
          }
        } catch {
          // If parsing fails, don't add score points
        }
      }
    }

    return score;
  };

  // Fetch saved matches from database
  const fetchSavedMatches = async () => {
    try {
      const result = await getSavedMatches();

      if (!('error' in result) && result.savedMatches) {
        const savedIds = new Set<string>();
        result.savedMatches.forEach((match) => {
          // Ensure ID is stored as a string
          savedIds.add(String(match.id));
        });
        setSavedMatchIds(savedIds);
      }
    } catch (error) {
      console.error('Error fetching saved matches:', error);
    }
  };

  // Add a toggle for saved matches filter function
  const toggleSavedMatchesFilter = useCallback(() => {
    // Clear the previous matches reference to force a fresh calculation
    previousMatchesRef.current = [];

    // Toggle the filter
    setShowOnlySavedMatches((prev) => !prev);
  }, [savedMatchIds, showOnlySavedMatches]);

  // Add scroll button visibility handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Add refs to track table dimensions and prevent layout shifts
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeightRef = useRef<number>(0);
  const rowCountRef = useRef<number>(0);

  // Add mechanism to preserve table height during updates
  useEffect(() => {
    // Update height reference whenever filtered matches change
    if (tableContainerRef.current && memoizedFilteredMatches.length > 0) {
      const currentHeight = tableContainerRef.current.offsetHeight;
      // Only update height if the new height is larger or initial
      if (
        currentHeight > tableHeightRef.current ||
        tableHeightRef.current === 0
      ) {
        tableHeightRef.current = currentHeight;
      }

      // Track row count
      rowCountRef.current = Math.max(
        rowCountRef.current,
        memoizedFilteredMatches.length
      );
    }
  }, [memoizedFilteredMatches]);

  // Add the export function near the copyAllNames function
  const exportToCSV = (): void => {
    const cartItems = useCartStore.getState().items;
    const findPredictionForMatch =
      useCartStore.getState().findPredictionForMatch;

    if (cartItems.length === 0) {
      toast.warning('No matches in cart to export!');
      return;
    }

    // Format the data for export - create proper structured objects from cart items
    // Include all detailed match data plus prediction data
    const matchesToExport = cartItems
      .map((item) => {
        // Get associated prediction data if available
        const homeTeamName = item.teams?.home?.name || '';
        const awayTeamName = item.teams?.away?.name || '';
        const prediction =
          homeTeamName && awayTeamName
            ? findPredictionForMatch(homeTeamName, awayTeamName)
            : null;

        // For live matches, construct a proper match object including prediction data
        return {
          id: item.matchId,
          teams: item.teams,
          score: item.match?.score || '',
          status: item.match?.status || '',
          playedSeconds: item.match?.playedSeconds || 0,
          matchTime: item.match?.matchTime || '',
          playedTime: item.match?.playedTime || '',
          tournamentName: item.match?.tournamentName || '',
          venue: item.match?.venue || '',
          // Include all available match details
          matchDetails: item.match?.matchDetails || {},
          matchSituation: item.match?.matchSituation || {},
          // Include market data
          markets: item.market
            ? [
                {
                  ...item.market,
                  outcomes: item.market.outcomes || [],
                },
              ]
            : [],
          // Basic date info
          date: new Date().toISOString().split('T')[0],
          time: item.match?.matchTime || new Date().toTimeString().substr(0, 5),

          // Include prediction data from upcoming matches
          positionGap: prediction?.positionGap || 0,
          favorite: prediction?.favorite || null,
          confidenceScore: prediction?.confidenceScore || 0,
          averageGoals: prediction?.averageGoals || 0,
          expectedGoals: prediction?.expectedGoals || 0,
          defensiveStrength: prediction?.defensiveStrength || 0,
          headToHead: prediction?.headToHead || {
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsScored: 0,
            goalsConceded: 0,
            recentMatches: [],
          },
          odds: prediction?.odds || {
            homeWin: 0,
            draw: 0,
            awayWin: 0,
            over15Goals: 0,
            under15Goals: 0,
            over25Goals: 0,
            under25Goals: 0,
            bttsYes: 0,
            bttsNo: 0,
          },
          cornerStats: prediction?.cornerStats || {
            homeAvg: 0,
            awayAvg: 0,
            totalAvg: 0,
          },
          scoringPatterns: prediction?.scoringPatterns || {
            homeFirstGoalRate: 0,
            awayFirstGoalRate: 0,
            homeLateGoalRate: 0,
            awayLateGoalRate: 0,
            homeBttsRate: 0,
            awayBttsRate: 0,
          },
          reasonsForPrediction: prediction?.reasonsForPrediction || [],

          // Also include home and away team prediction data
          homeTeam: {
            ...(item.teams?.home || {}),
            ...(prediction?.homeTeam || {}),
          },
          awayTeam: {
            ...(item.teams?.away || {}),
            ...(prediction?.awayTeam || {}),
          },
        };
      })
      .filter(Boolean);

    try {
      exportMatchesToCSV(matchesToExport, false, 'live_matches.csv');
      toast.success(
        `${matchesToExport.length} matches exported to CSV successfully!`
      );
    } catch (error) {
      toast.error('Error exporting to CSV');
      console.error('Export error:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 overflow-x-hidden'>
      <style jsx global>{`
        .match-table-row-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .match-table-row-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }
        .match-table-row-exit {
          opacity: 1;
        }
        .match-table-row-exit-active {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }

        /* Prevent UI jacking when rows are added/removed */
        .match-table {
          will-change: contents;
          contain: content;
          position: relative;
        }

        /* Lock table layout to prevent resizing */
        .match-table table {
          table-layout: fixed;
          width: 100%;
        }

        /* Ensure cells maintain their size during updates */
        .match-table td,
        .match-table th {
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* Create consistent heights for expanded content */
        .expanded-content {
          height: auto;
          transition: height 300ms ease-in-out, opacity 300ms ease-in-out;
          contain: content;
          overflow: hidden;
        }

        /* Improve transitions for expanded rows */
        .expanded-row {
          position: relative;
          transition: all 300ms ease-in-out;
          opacity: 1;
        }

        /* Use hardware acceleration for smoother transitions */
        .match-row {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
          will-change: transform;
        }

        /* Prevent layout shifts */
        .fixed-height-row {
          min-height: 80px;
        }

        /* Smooth transitions for expanded content */
        .expanded-content-enter {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
        }
        .expanded-content-enter-active {
          max-height: 1000px;
          opacity: 1;
          transition: max-height 300ms ease-in-out, opacity 300ms ease-in-out;
        }
        .expanded-content-exit {
          max-height: 1000px;
          opacity: 1;
          overflow: hidden;
        }
        .expanded-content-exit-active {
          max-height: 0;
          opacity: 0;
          transition: max-height 300ms ease-in-out, opacity 300ms ease-in-out;
        }

        /* Improve stability during live updates */
        .match-table tbody {
          position: relative;
          transition: all 0.3s ease-in-out;
        }

        /* Prevent flashing and sudden disappearance */
        .match-row {
          opacity: 1;
          transition: opacity 0.3s ease-in-out,
            background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
          transform: translateZ(0);
          will-change: transform;
        }

        /* Smooth expansion/collapse transitions */
        .expanded-row {
          transition: all 0.3s ease-in-out;
          overflow: hidden;
        }

        /* Enhance stability of table cells */
        .match-table td {
          transition: background-color 0.3s ease-in-out;
          position: relative;
        }

        /* Data update transition */
        .data-update {
          animation: highlightUpdate 1s ease-in-out;
        }

        @keyframes highlightUpdate {
          0% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(59, 130, 246, 0.1);
          }
          100% {
            background-color: transparent;
          }
        }

        /* Additional anti-flicker measures */
        .match-table {
          contain: layout style;
          content-visibility: auto;
        }

        .match-table table {
          table-layout: fixed;
          width: 100%;
          contain: layout style;
        }

        /* Enhanced row stability */
        .match-row {
          opacity: 1;
          transition: opacity 0.5s ease-in-out,
            background-color 0.5s ease-in-out, transform 0.3s ease-in-out;
          transform: translateZ(0);
          will-change: transform;
          contain: layout style;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        /* Force hardware acceleration */
        .match-table tbody {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
          contain: layout style;
        }

        /* Create a fixed position for rows */
        .fixed-height-row {
          min-height: 80px;
          transition: min-height 0.5s ease;
          contain: layout style;
        }

        /* Slower transitions for content changes */
        .expanded-row {
          transition: all 0.5s ease-in-out;
          transform: translateZ(0);
          will-change: transform;
          contain: layout style;
        }

        /* Add additional transition properties for super-smooth updates */
        .match-row {
          opacity: 1;
          transition: opacity 0.8s ease-in-out,
            background-color 0.8s ease-in-out, transform 0.5s ease-in-out;
          transform: translateZ(0);
          will-change: transform, opacity;
          contain: layout style;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Content stability */
        .match-table table {
          contain: strict;
          content-visibility: auto;
        }

        /* Prevent content from jumping during updates */
        .match-table td {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          contain: content;
        }

        /* Make sure height doesn't change during data updates */
        .fixed-height-row > td {
          height: 90px;
        }

        /* Smooth expansion transitions */
        .expanded-content {
          transition: max-height 0.8s cubic-bezier(0, 1, 0, 1),
            opacity 0.8s ease-in-out;
          contain: content;
        }

        /* Prevent layout shifting on load */
        .match-table {
          min-height: 400px; /* Ensure table doesn't collapse while loading */
        }
      `}</style>
      <div className='p-4'>
        <div className='relative'>
          {copiedText && (
            <p className='text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-md'>
              {copiedText}
            </p>
          )}
        </div>
        <Stats
          matchCount={memoizedFilteredMatches.length}
          isPaused={isPaused}
          togglePause={togglePause}
          onCopyNames={() => copyAllNames(true)}
          onCopyNamesOnly={() => copyAllNames(false)}
          onExportCSV={exportToCSV}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemsCount={cartItems.length}
          upcomingMatchesCount={getUpcomingMatchesCount()}
          showCartItems={showCartItems}
          setShowCartItems={setShowCartItems}
          onClearCart={clearAllCarts}
          disabled={isInitialLoading}
        />

        {/* Scroll to top button */}
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className='fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50'
            aria-label='Scroll to top'
          >
            <ArrowUp size={24} />
          </button>
        )}

        {activeTab === 'live' || activeTab === 'all-live' ? (
          <div className='max-w-[2000px] mx-auto px-4'>
            <div className='flex items-center justify-between mb-4'>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                disabled={isInitialLoading}
              />

              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <label className='text-sm text-gray-600'>
                    Group Matches:
                  </label>
                  <div className='flex items-center'>
                    <button
                      className={`px-3 py-1 text-sm rounded border ${
                        enableGrouping
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                      onClick={() => setEnableGrouping(!enableGrouping)}
                      disabled={isInitialLoading}
                    >
                      {enableGrouping ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
                {enableGrouping && (
                  <div className='flex items-center gap-2'>
                    <label className='text-sm text-gray-600'>Group Size:</label>
                    <select
                      className='bg-white text-gray-800 rounded px-2 py-1 text-sm border border-gray-300'
                      value={groupSize}
                      onChange={(e) => setGroupSize(parseInt(e.target.value))}
                      disabled={isInitialLoading}
                    >
                      <option value='2'>2</option>
                      <option value='3'>3</option>
                      <option value='4'>4</option>
                      <option value='5'>5</option>
                      <option value='6'>6</option>
                      <option value='8'>8</option>
                      <option value='10'>10</option>
                    </select>
                  </div>
                )}

                <div className='flex items-center gap-2'>
                  <label className='text-sm text-gray-600'>
                    Saved Matches:
                  </label>
                  <button
                    className={`px-3 py-1 text-sm rounded border ${
                      showOnlySavedMatches
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                    onClick={toggleSavedMatchesFilter}
                    disabled={isInitialLoading}
                  >
                    {showOnlySavedMatches ? 'Only Saved' : 'All Matches'}
                  </button>
                </div>
              </div>
            </div>

            {/* Add group display */}
            {enableGrouping && (
              <div className='mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden'>
                <div className='bg-amber-50 px-4 py-2 border-b border-amber-200'>
                  <h3 className='text-lg font-medium text-amber-800'>
                    Grouped Matches with Clear Preferred Teams
                  </h3>
                  <p className='text-sm text-amber-700'>
                    Matches are grouped by start time in batches of {groupSize}.
                    Click the copy button to copy the preferred team names.
                  </p>
                </div>
                <div className='p-4'>
                  {/* Prime Matches Section */}
                  {createMatchGroups(memoizedFilteredMatches, groupSize).prime
                    .length > 0 && (
                    <div className='mb-6'>
                      <div className='flex items-center mb-4'>
                        <div className='bg-green-500 h-3 w-3 rounded-full mr-2'></div>
                        <h3 className='text-lg font-medium text-gray-800'>
                          Prime Matches
                        </h3>
                        <span className='ml-2 text-sm text-gray-500'>
                          (Multiple favorable factors aligned)
                        </span>
                      </div>

                      {createMatchGroups(
                        memoizedFilteredMatches,
                        groupSize
                      ).prime.map((group, groupIndex) => (
                        <div
                          key={groupIndex}
                          className='mb-6 last:mb-0 border-l-4 border-green-500 pl-3'
                        >
                          <div className='flex justify-between items-center mb-2'>
                            <h4 className='text-md font-medium text-gray-700'>
                              Prime Group {groupIndex + 1} ({group.length}{' '}
                              matches)
                            </h4>
                            <button
                              className='flex items-center gap-1 px-3 py-1 text-sm rounded bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                              onClick={() => copyPreferredTeamNames(group)}
                            >
                              <Copy size={14} />
                              Copy Team Names
                            </button>
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                            {group.map((match) => {
                              const preferredTeam = getPreferredTeam(match);
                              const matchScore = scoreMatch(match);
                              return (
                                <div
                                  key={match.id}
                                  className='bg-gray-50 rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow'
                                >
                                  <div className='flex justify-between items-start mb-2'>
                                    <div className='text-xs text-gray-500'>
                                      {match.status} -{' '}
                                      {formatPlayedTime(match.playedSeconds)}
                                    </div>
                                    <div className='flex items-center'>
                                      <div className='text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 mr-1'>
                                        Score: {matchScore}
                                      </div>
                                      <div className='text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800'>
                                        Gap:{' '}
                                        {(() => {
                                          // Get prediction data for this match
                                          const { findPredictionForMatch } =
                                            useCartStore.getState();
                                          const predictionMatch =
                                            findPredictionForMatch(
                                              match.teams.home.name,
                                              match.teams.away.name
                                            );

                                          // First try to use position from prediction data
                                          if (
                                            predictionMatch?.homeTeam
                                              ?.position !== undefined &&
                                            predictionMatch?.awayTeam
                                              ?.position !== undefined
                                          ) {
                                            return Math.abs(
                                              predictionMatch.homeTeam
                                                .position -
                                                predictionMatch.awayTeam
                                                  .position
                                            );
                                          }

                                          // Fall back to live match data
                                          if (
                                            match.teams?.home?.position !==
                                              undefined &&
                                            match.teams?.away?.position !==
                                              undefined
                                          ) {
                                            return Math.abs(
                                              match.teams.home.position -
                                                match.teams.away.position
                                            );
                                          }

                                          // If no position data available
                                          return 'Unknown';
                                        })()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Add Live Score Display */}
                                  {match.score && match.score !== '-' && (
                                    <div className='mb-2 flex justify-center'>
                                      <div className='font-bold text-base px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200'>
                                        {match.score}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rest of match card content */}
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div
                                      className={`text-sm ${
                                        preferredTeam?.id ===
                                        match.teams.home.id
                                          ? 'font-bold text-blue-700'
                                          : ''
                                      }`}
                                    >
                                      {match.teams.home.name}
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <div
                                      className={`text-sm ${
                                        preferredTeam?.id ===
                                        match.teams.away.id
                                          ? 'font-bold text-purple-700'
                                          : ''
                                      }`}
                                    >
                                      {match.teams.away.name}
                                    </div>
                                  </div>

                                  {/* Performance metrics */}
                                  {match.matchSituation &&
                                    match.matchDetails && (
                                      <div className='mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600'>
                                        {(() => {
                                          // Determine the preferred team and opposing team
                                          const isHomePreferred =
                                            preferredTeam?.id ===
                                            match.teams.home.id;
                                          const preferredTeamKey =
                                            isHomePreferred ? 'home' : 'away';
                                          const opposingTeamKey =
                                            isHomePreferred ? 'away' : 'home';

                                          // Calculate performance metrics
                                          const metrics = {
                                            ATK:
                                              (match.matchSituation[
                                                preferredTeamKey
                                              ].totalAttacks || 0) >
                                              (match.matchSituation[
                                                opposingTeamKey
                                              ].totalAttacks || 0),
                                            POS:
                                              (match.matchDetails[
                                                preferredTeamKey
                                              ].ballSafePercentage || 0) >
                                              (match.matchDetails[
                                                opposingTeamKey
                                              ].ballSafePercentage || 0),
                                            DNG:
                                              (match.matchSituation[
                                                preferredTeamKey
                                              ].totalDangerousAttacks || 0) >
                                              (match.matchSituation[
                                                opposingTeamKey
                                              ].totalDangerousAttacks || 0),
                                            SHT:
                                              (match.matchDetails[
                                                preferredTeamKey
                                              ].shotsOnTarget || 0) >
                                              (match.matchDetails[
                                                opposingTeamKey
                                              ].shotsOnTarget || 0),
                                          };

                                          // Check score
                                          let scoreMetric = null;
                                          if (
                                            match.score &&
                                            match.status !== 'NS'
                                          ) {
                                            try {
                                              const [homeGoals, awayGoals] =
                                                match.score
                                                  .replace(':', '-')
                                                  .split('-')
                                                  .map((g) =>
                                                    parseInt(g.trim(), 10)
                                                  );

                                              if (
                                                !isNaN(homeGoals) &&
                                                !isNaN(awayGoals)
                                              ) {
                                                scoreMetric = {
                                                  SCR: isHomePreferred
                                                    ? homeGoals > awayGoals
                                                    : awayGoals > homeGoals,
                                                };
                                              }
                                            } catch {
                                              // If parsing fails, don't add score metric
                                            }
                                          }

                                          const allMetrics = scoreMetric
                                            ? { ...metrics, ...scoreMetric }
                                            : metrics;

                                          return (
                                            <>
                                              {Object.entries(allMetrics).map(
                                                ([key, value]) => (
                                                  <div
                                                    key={key}
                                                    className='flex items-center gap-1'
                                                  >
                                                    <span
                                                      className={`w-2 h-2 rounded-full ${
                                                        value
                                                          ? 'bg-green-500'
                                                          : 'bg-red-500'
                                                      }`}
                                                    ></span>
                                                    <span>{key}</span>
                                                  </div>
                                                )
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}

                                  <div className='mt-2 text-xs text-gray-500'>
                                    Tournament:{' '}
                                    <span className='font-medium'>
                                      {match.tournamentName}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regular Matches Section */}
                  {createMatchGroups(memoizedFilteredMatches, groupSize).regular
                    .length > 0 && (
                    <div className='mt-8'>
                      <div className='flex items-center mb-4'>
                        <div className='bg-blue-500 h-3 w-3 rounded-full mr-2'></div>
                        <h3 className='text-lg font-medium text-gray-800'>
                          Regular Matches
                        </h3>
                        <span className='ml-2 text-sm text-gray-500'>
                          (Some favorable factors)
                        </span>
                      </div>

                      {createMatchGroups(
                        memoizedFilteredMatches,
                        groupSize
                      ).regular.map((group, groupIndex) => (
                        <div
                          key={groupIndex}
                          className='mb-6 last:mb-0 border-l-4 border-blue-300 pl-3'
                        >
                          <div className='flex justify-between items-center mb-2'>
                            <h4 className='text-md font-medium text-gray-700'>
                              Regular Group {groupIndex + 1} ({group.length}{' '}
                              matches)
                            </h4>
                            <button
                              className='flex items-center gap-1 px-3 py-1 text-sm rounded bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                              onClick={() => copyPreferredTeamNames(group)}
                            >
                              <Copy size={14} />
                              Copy Team Names
                            </button>
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                            {group.map((match) => {
                              const preferredTeam = getPreferredTeam(match);
                              const matchScore = scoreMatch(match);
                              return (
                                <div
                                  key={match.id}
                                  className='bg-gray-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-shadow'
                                >
                                  <div className='flex justify-between items-start mb-2'>
                                    <div className='text-xs text-gray-500'>
                                      {match.status} -{' '}
                                      {formatPlayedTime(match.playedSeconds)}
                                    </div>
                                    <div className='flex items-center'>
                                      <div className='text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 mr-1'>
                                        Score: {matchScore}
                                      </div>
                                      <div className='text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800'>
                                        Gap:{' '}
                                        {(() => {
                                          // Get prediction data for this match
                                          const { findPredictionForMatch } =
                                            useCartStore.getState();
                                          const predictionMatch =
                                            findPredictionForMatch(
                                              match.teams.home.name,
                                              match.teams.away.name
                                            );

                                          // First try to use position from prediction data
                                          if (
                                            predictionMatch?.homeTeam
                                              ?.position !== undefined &&
                                            predictionMatch?.awayTeam
                                              ?.position !== undefined
                                          ) {
                                            return Math.abs(
                                              predictionMatch.homeTeam
                                                .position -
                                                predictionMatch.awayTeam
                                                  .position
                                            );
                                          }

                                          // Fall back to live match data
                                          if (
                                            match.teams?.home?.position !==
                                              undefined &&
                                            match.teams?.away?.position !==
                                              undefined
                                          ) {
                                            return Math.abs(
                                              match.teams.home.position -
                                                match.teams.away.position
                                            );
                                          }

                                          // If no position data available
                                          return 'Unknown';
                                        })()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Add Live Score Display */}
                                  {match.score && match.score !== '-' && (
                                    <div className='mb-2 flex justify-center'>
                                      <div className='font-bold text-base px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200'>
                                        {match.score}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rest of match card content */}
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div
                                      className={`text-sm ${
                                        preferredTeam?.id ===
                                        match.teams.home.id
                                          ? 'font-bold text-blue-700'
                                          : ''
                                      }`}
                                    >
                                      {match.teams.home.name}
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <div
                                      className={`text-sm ${
                                        preferredTeam?.id ===
                                        match.teams.away.id
                                          ? 'font-bold text-purple-700'
                                          : ''
                                      }`}
                                    >
                                      {match.teams.away.name}
                                    </div>
                                  </div>

                                  {/* Performance metrics */}
                                  {match.matchSituation &&
                                    match.matchDetails && (
                                      <div className='mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600'>
                                        {(() => {
                                          // Determine the preferred team and opposing team
                                          const isHomePreferred =
                                            preferredTeam?.id ===
                                            match.teams.home.id;
                                          const preferredTeamKey =
                                            isHomePreferred ? 'home' : 'away';
                                          const opposingTeamKey =
                                            isHomePreferred ? 'away' : 'home';

                                          // Calculate performance metrics
                                          const metrics = {
                                            ATK:
                                              (match.matchSituation[
                                                preferredTeamKey
                                              ].totalAttacks || 0) >
                                              (match.matchSituation[
                                                opposingTeamKey
                                              ].totalAttacks || 0),
                                            POS:
                                              (match.matchDetails[
                                                preferredTeamKey
                                              ].ballSafePercentage || 0) >
                                              (match.matchDetails[
                                                opposingTeamKey
                                              ].ballSafePercentage || 0),
                                            DNG:
                                              (match.matchSituation[
                                                preferredTeamKey
                                              ].totalDangerousAttacks || 0) >
                                              (match.matchSituation[
                                                opposingTeamKey
                                              ].totalDangerousAttacks || 0),
                                            SHT:
                                              (match.matchDetails[
                                                preferredTeamKey
                                              ].shotsOnTarget || 0) >
                                              (match.matchDetails[
                                                opposingTeamKey
                                              ].shotsOnTarget || 0),
                                          };

                                          // Check score
                                          let scoreMetric = null;
                                          if (
                                            match.score &&
                                            match.status !== 'NS'
                                          ) {
                                            try {
                                              const [homeGoals, awayGoals] =
                                                match.score
                                                  .replace(':', '-')
                                                  .split('-')
                                                  .map((g) =>
                                                    parseInt(g.trim(), 10)
                                                  );

                                              if (
                                                !isNaN(homeGoals) &&
                                                !isNaN(awayGoals)
                                              ) {
                                                scoreMetric = {
                                                  SCR: isHomePreferred
                                                    ? homeGoals > awayGoals
                                                    : awayGoals > homeGoals,
                                                };
                                              }
                                            } catch {
                                              // If parsing fails, don't add score metric
                                            }
                                          }

                                          const allMetrics = scoreMetric
                                            ? { ...metrics, ...scoreMetric }
                                            : metrics;

                                          return (
                                            <>
                                              {Object.entries(allMetrics).map(
                                                ([key, value]) => (
                                                  <div
                                                    key={key}
                                                    className='flex items-center gap-1'
                                                  >
                                                    <span
                                                      className={`w-2 h-2 rounded-full ${
                                                        value
                                                          ? 'bg-green-500'
                                                          : 'bg-red-500'
                                                      }`}
                                                    ></span>
                                                    <span>{key}</span>
                                                  </div>
                                                )
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}

                                  <div className='mt-2 text-xs text-gray-500'>
                                    Tournament:{' '}
                                    <span className='font-medium'>
                                      {match.tournamentName}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {createMatchGroups(memoizedFilteredMatches, groupSize).prime
                    .length === 0 &&
                    createMatchGroups(memoizedFilteredMatches, groupSize)
                      .regular.length === 0 && (
                      <div className='bg-gray-50 p-4 rounded-lg text-center text-gray-600'>
                        No matches with clear preferred teams found. Try
                        adjusting your filters.
                      </div>
                    )}
                </div>
              </div>
            )}

            {isInitialLoading ? (
              <LoadingTable />
            ) : (
              <div
                className='mt-4 bg-white rounded-lg shadow-sm'
                ref={tableContainerRef}
                style={{
                  minHeight: `${Math.max(500, tableHeightRef.current)}px`,
                  transition: 'min-height 0.5s ease-in-out',
                  overflow: 'hidden',
                }}
              >
                <div className='w-full overflow-x-auto min-w-0 match-table'>
                  <table className='w-full divide-y divide-gray-200 table-fixed min-w-[1400px]'>
                    <thead>
                      <tr className='bg-gray-50 sticky top-0 z-10'>
                        <HeaderCell
                          title='Teams'
                          filterType='status'
                          onFilter={(value) => handleFilter('status', value)}
                          sortDirection={
                            sortConfigs.find((c) => c.field === 'playedSeconds')
                              ?.direction
                          }
                          onSort={() => handleSort('playedSeconds')}
                          isActive={sortConfigs.some(
                            (c) => c.field === 'playedSeconds'
                          )}
                          className='w-[250px] min-w-[250px]'
                        />
                        <HeaderCell
                          title='Score'
                          filterType='none'
                          align='center'
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Tournament'
                          filterType='none'
                          className='w-[150px] min-w-[150px]'
                        />
                        <HeaderCell
                          title='Market'
                          filterType='none'
                          className='w-[150px] min-w-[150px]'
                        />
                        <HeaderCell
                          title='Profit %'
                          sortDirection={
                            sortConfigs.find((c) => c.field === 'profit')
                              ?.direction
                          }
                          onSort={() => handleSort('profit')}
                          onFilter={(value) => handleFilter('profit', value)}
                          filterType='profit'
                          align='right'
                          isActive={sortConfigs.some(
                            (c) => c.field === 'profit'
                          )}
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Margin'
                          sortDirection={
                            sortConfigs.find((c) => c.field === 'margin')
                              ?.direction
                          }
                          onSort={() => handleSort('margin')}
                          onFilter={(value) => handleFilter('margin', value)}
                          filterType='margin'
                          align='right'
                          isActive={sortConfigs.some(
                            (c) => c.field === 'margin'
                          )}
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Outcomes'
                          filterType='none'
                          className='w-[150px] min-w-[150px]'
                        />
                        <HeaderCell
                          title='Odds'
                          sortDirection={
                            sortConfigs.find((c) => c.field === 'odds')
                              ?.direction
                          }
                          onSort={() => handleSort('odds')}
                          onFilter={(value) => handleFilter('odds', value)}
                          filterType='odds'
                          align='right'
                          isActive={sortConfigs.some((c) => c.field === 'odds')}
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Stake %'
                          filterType='none'
                          align='right'
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Investment ($)'
                          filterType='none'
                          align='right'
                          className='w-[120px] min-w-[120px]'
                        />
                        <HeaderCell
                          title='Favourite'
                          filterType='none'
                          align='center'
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Validation'
                          filterType='none'
                          align='center'
                          className='w-[100px] min-w-[100px]'
                        />
                        <HeaderCell
                          title='Actions'
                          filterType='none'
                          align='center'
                          className='w-[100px] min-w-[100px]'
                        />
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {memoizedFilteredMatches.length > 0 ? (
                        memoizedFilteredMatches.flatMap((match) => {
                          return match.markets
                            .filter((market) =>
                              activeTab === 'live'
                                ? market.description !==
                                  '1st Half - Correct Score'
                                : true
                            )
                            .map(
                              (
                                market: Match['markets'][0],
                                marketIndex: number
                              ) => {
                                // Create a stable key for the market that won't change with data updates
                                const marketKey = `${match.id}-${market.id}`;
                                const isRowExpanded =
                                  expandedRows.has(marketKey);

                                // Create an even more stable key for React's reconciliation
                                const stableMarketKey =
                                  `${marketKey}-${marketIndex}-${match.teams.home.name}-${match.teams.away.name}`.replace(
                                    /\s+/g,
                                    ''
                                  );

                                return (
                                  <React.Fragment key={stableMarketKey}>
                                    <MemoizedMarketRow
                                      match={match}
                                      market={market}
                                      cartItems={cartItems}
                                      addItem={addItem}
                                      removeItem={removeItem}
                                      disabled={isInitialLoading}
                                      isExpanded={isRowExpanded}
                                      onToggleExpand={() =>
                                        toggleExpandedRow(match.id, market.id)
                                      }
                                      isMatchSaved={isMatchSaved}
                                    />
                                  </React.Fragment>
                                );
                              }
                            );
                        })
                      ) : (
                        // Add empty state with consistent height to prevent layout shifts
                        <tr>
                          <td
                            colSpan={13}
                            className='py-16 text-center text-gray-500'
                          >
                            <div
                              style={{
                                minHeight: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                              }}
                            >
                              <div className='animate-pulse flex space-x-4 mb-4'>
                                <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                              </div>
                              <p>
                                Loading matches or no matches found with current
                                filters
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <MatchPredictor />
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default MatchesPage;

