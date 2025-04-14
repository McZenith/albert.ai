/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { useCartStore } from '@/hooks/useStore';
import {
  ChevronUp,
  ChevronDown,
  Filter,
  ShoppingCart,
  Copy,
} from 'lucide-react';
import MatchPredictor from '@/components/UpcomingTab';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  activeTab,
  setActiveTab,
  cartItemsCount,
  upcomingMatchesCount,
  showCartItems,
  setShowCartItems,
  onClearCart,
  disabled = false,
}: {
  matchCount: number;
  isPaused: boolean;
  togglePause: () => void;
  onCopyNames: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemsCount: number;
  upcomingMatchesCount: number;
  showCartItems: boolean;
  setShowCartItems: (show: boolean) => void;
  onClearCart: () => void;
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
            onClick={() => setShowCartItems(!showCartItems)}
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
            onClick={onCopyNames}
            disabled={
              disabled ||
              (isClient && cartItemsCount + upcomingMatchesCount === 0)
            }
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              disabled ||
              (isClient && cartItemsCount + upcomingMatchesCount === 0)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <span className='mr-2'>📋</span>
            Copy Selected Teams
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
}: {
  match: Match;
  market: Match['markets'][0];
  cartItems: any[];
  addItem: (item: any) => void;
  removeItem: (matchId: string, marketId: string) => void;
  disabled?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const isInCart = cartItems.some(
    (item) => item.matchId === match.id && item.marketId === market.id
  );

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
    match.status, // Added match.status to dependency array
  ]);

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (hasPrediction) {
      e.preventDefault();
      e.stopPropagation();
      onToggleExpand();
    }
  };

  const TOTAL_INVESTMENT = 100000;

  const createOutcomeKey = (outcomeId: string, index: number) => {
    return `${match.id}-${market.id}-${outcomeId}-${index}`;
  };

  const getOddsClassName = (outcome: { isChanged?: boolean }) => {
    if (!outcome.isChanged) return 'text-sm font-medium text-right';
    return 'text-sm font-medium text-right bg-yellow-100 transition-colors duration-500';
  };

  return (
    <>
      <tr
        className={`border-t transition-all duration-200 ease-in-out ${
          hasPrediction
            ? performanceValidation
              ? performanceValidation.isValid
                ? 'border-l-4 border-l-green-600 bg-green-50 hover:bg-green-100'
                : 'border-l-4 border-l-red-600 bg-red-50 hover:bg-red-100'
              : 'border-l-4 border-l-blue-600 bg-blue-50 hover:bg-blue-100'
            : 'hover:bg-gray-50'
        }`}
        onClick={handleRowClick}
        style={{ cursor: hasPrediction ? 'pointer' : 'default' }}
      >
        {/* Teams & Status Column */}
        <td className='px-4 py-3'>
          <div className='flex flex-col space-y-1'>
            <div className='flex items-center space-x-2'>
              <span className='font-medium text-gray-900'>
                {match.teams.home.name}
              </span>
              {hasPrediction && (
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  Prediction
                </span>
              )}
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
            onClick={(e) => {
              e.stopPropagation();
              if (isInCart) {
                removeItem(match.id, market.id);
              } else {
                addItem({
                  matchId: match.id,
                  marketId: market.id,
                  teams: match.teams,
                  market: {
                    ...market,
                    outcomes: market.outcomes,
                  },
                  addedAt: new Date().toISOString(),
                });
              }
            }}
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
        <tr
          className={`${
            performanceValidation?.isValid
              ? 'bg-green-50/50'
              : performanceValidation
              ? 'bg-red-50/50'
              : 'bg-blue-50/50'
          }`}
        >
          <td colSpan={13} className='p-4'>
            <div className='border border-gray-100 rounded-lg bg-white p-4 shadow-sm space-y-4'>
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
            (item) => item.matchId === match.id && item.marketId === market.id
          )
        );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlayedTime &&
        matchesProfit &&
        matchesMargin &&
        matchesOdds &&
        matchesCart
      );
    });

    // Apply multiple sorts
    if (sortConfigs.length > 0) {
      filtered.sort((a, b) => {
        for (const sortConfig of sortConfigs) {
          let comparison = 0;
          let aValue: number | undefined;
          let bValue: number | undefined;

          switch (sortConfig.field) {
            case 'status':
              aValue = getStatusSortValue(a.status);
              bValue = getStatusSortValue(b.status);
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
        return 0;
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

  const filteredMatches = getSortedAndFilteredMatches(
    activeTab === 'live' ? liveMatches : allLiveMatches
  );

  // Handle initial loading state
  useEffect(() => {
    if (isConnected && isInitialLoading && liveMatches.length !== 0) {
      setIsInitialLoading(false);
    }
  }, [isConnected, isInitialLoading, liveMatches.length]);

  // Show feedback about prediction data loading
  useEffect(() => {
    if (predictionData.length > 0) {
      console.log(
        `Prediction data loaded: ${predictionData.length} matches available for cross-reference`
      );
    }
  }, [predictionData.length]);

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

  // Update the copy function to handle both carts
  const copyAllNames = (): void => {
    const cartTeamNames = cartItems.map((item) => item.teams.home.name);
    const upcomingTeamNames = upcomingMatches
      .filter((match) => match.favorite === 'home' || match.favorite === 'away')
      .map((match) => {
        const favoriteTeam =
          match.favorite === 'home' ? match.homeTeam.name : match.awayTeam.name;
        return favoriteTeam;
      });

    const allTeams = [...cartTeamNames, ...upcomingTeamNames].join('\n');

    // For live tab: add matched from the filtered matches to cart
    filteredMatches.forEach((match) => {
      const preferredTeam = getPreferredTeam(match);
      if (preferredTeam && match.markets && match.markets.length > 0) {
        const market = match.markets[0];
        // Check if this match/market is already in cart
        const isInCart = cartItems.some(
          (item) => item.matchId === match.id && item.marketId === market.id
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

    navigator.clipboard
      .writeText(allTeams)
      .then(() =>
        setCopiedText(
          `${
            cartTeamNames.length + upcomingTeamNames.length
          } team names copied and added to cart!`
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
            (item) => item.matchId === match.id && item.marketId === market.id
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

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='py-4'>
        <div className='relative'>
          {copiedText && (
            <p className='text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-md'>
              {copiedText}
            </p>
          )}
        </div>
        <Stats
          matchCount={filteredMatches.length}
          isPaused={isPaused}
          togglePause={togglePause}
          onCopyNames={copyAllNames}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemsCount={cartItems.length}
          upcomingMatchesCount={getUpcomingMatchesCount()}
          showCartItems={showCartItems}
          setShowCartItems={setShowCartItems}
          onClearCart={clearAllCarts}
          disabled={isInitialLoading}
        />
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
                  {createMatchGroups(filteredMatches, groupSize).prime.length >
                    0 && (
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

                      {createMatchGroups(filteredMatches, groupSize).prime.map(
                        (group, groupIndex) => (
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
                        )
                      )}
                    </div>
                  )}

                  {/* Regular Matches Section */}
                  {createMatchGroups(filteredMatches, groupSize).regular
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
                        filteredMatches,
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

                  {createMatchGroups(filteredMatches, groupSize).prime
                    .length === 0 &&
                    createMatchGroups(filteredMatches, groupSize).regular
                      .length === 0 && (
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
              <div className='mt-4 bg-white rounded-lg shadow-sm'>
                <div className='w-full overflow-x-auto min-w-0'>
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
                          className='w-[200px] min-w-[200px]'
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
                      {filteredMatches.flatMap((match, matchIndex) =>
                        match.markets
                          .filter((market) =>
                            activeTab === 'live'
                              ? market.description !==
                                '1st Half - Correct Score'
                              : true
                          )
                          .map((market, marketIndex) => (
                            <MarketRow
                              key={`${match.id}-${market.id}-${matchIndex}-${marketIndex}`}
                              match={match}
                              market={market}
                              cartItems={cartItems}
                              addItem={addItem}
                              removeItem={removeItem}
                              disabled={isInitialLoading}
                              isExpanded={expandedRows.has(
                                `${match.id}-${market.id}`
                              )}
                              onToggleExpand={() =>
                                toggleExpandedRow(match.id, market.id)
                              }
                            />
                          ))
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

