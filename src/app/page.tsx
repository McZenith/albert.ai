/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { useCartStore } from '@/hooks/useStore';
import { ChevronUp, ChevronDown, Filter, ShoppingCart } from 'lucide-react';
import MatchPredictor from '@/components/UpcomingTab';

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
    types: string[];
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
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
}: {
  match: Match;
  market: Match['markets'][0];
  cartItems: any[];
  addItem: (item: any) => void;
  removeItem: (matchId: string, marketId: string) => void;
  disabled?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Reset expanded state when match changes
  useEffect(() => {
    setIsExpanded(false);
    return () => {
      setIsExpanded(false);
    };
  }, [match.id]);

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
  }, [
    match.teams.home.name,
    match.teams.away.name,
    findPredictionForMatch,
    predictionData,
    isPredictionDataLoaded,
  ]);

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (hasPrediction) {
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded((prev) => !prev);
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

  const calculateFormPoints = (form: string): number => {
    if (!form) return 0;
    const wins = (form.match(/W/g) || []).length;
    const draws = (form.match(/D/g) || []).length;
    const points = wins * 3 + draws * 1;
    const maxPoints = form.length * 3;
    return Math.round((points / maxPoints) * 100);
  };

  return (
    <>
      <tr
        className={`border-t transition-all duration-200 ease-in-out ${
          hasPrediction
            ? 'border-l-4 border-l-blue-600 bg-blue-50 hover:bg-blue-100'
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
        <tr className='bg-blue-50/50'>
          <td colSpan={12} className='p-4'>
            <div className='border border-blue-100 rounded-lg bg-white p-4 shadow-sm'>
              {/* Complete match row from Upcoming tab */}
              <div className='mb-6 pb-4 border-b border-gray-100'>
                <div className='w-full overflow-x-auto min-w-0'>
                  <table className='w-full border-collapse table-fixed min-w-[1400px]'>
                    <thead>
                      <tr className='bg-gray-50/80 text-left sticky top-0 z-10'>
                        <th className='p-3 text-sm font-medium text-gray-500 w-[200px]'>
                          Teams
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Date
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Home Avg
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Away Avg
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Pos Gap
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[120px]'>
                          Position
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[120px]'>
                          Home/Away
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Form %
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Fav Form
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          H2H
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Exp Goals
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Def Rating
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[150px]'>
                          Favorite
                        </th>
                        <th className='p-3 text-sm font-medium text-gray-500 text-center w-[100px]'>
                          Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className='border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150'>
                        {/* Teams Column */}
                        <td className='p-3 w-[200px]'>
                          <div className='flex flex-col'>
                            <div className='flex items-center'>
                              <span className='text-xl mr-2'>🏆</span>
                              <span className='font-medium text-gray-800'>
                                {predictionMatch.homeTeam.name}
                              </span>
                              <span className='text-xs text-gray-500 ml-2'>
                                ({predictionMatch.homeTeam.position || '-'})
                              </span>
                            </div>
                            <div className='flex items-center mt-1'>
                              <span className='text-xl mr-2'>🏆</span>
                              <span className='font-medium text-gray-800'>
                                {predictionMatch.awayTeam.name}
                              </span>
                              <span className='text-xs text-gray-500 ml-2'>
                                ({predictionMatch.awayTeam.position || '-'})
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date Column */}
                        <td className='p-3 text-center whitespace-nowrap w-[100px]'>
                          <div className='text-gray-800 font-medium'>
                            {predictionMatch.date} {predictionMatch.time}
                          </div>
                        </td>

                        {/* Home Avg Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-medium'>
                            {Math.round(
                              (predictionMatch.homeTeam.avgHomeGoals ?? 0) > 0
                                ? predictionMatch.homeTeam.avgHomeGoals ?? 0
                                : (predictionMatch.expectedGoals ?? 0) / 2
                            )}
                          </div>
                        </td>

                        {/* Away Avg Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div className='px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 font-medium'>
                            {Math.round(
                              (predictionMatch.awayTeam.avgAwayGoals ?? 0) > 0
                                ? predictionMatch.awayTeam.avgAwayGoals ?? 0
                                : (predictionMatch.expectedGoals ?? 0) / 2
                            )}
                          </div>
                        </td>

                        {/* Position Gap Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div
                            className={`px-3 py-1.5 rounded-lg font-medium ${
                              predictionMatch.positionGap >= 10
                                ? 'bg-green-50 text-green-800'
                                : predictionMatch.positionGap >= 5
                                ? 'bg-yellow-50 text-yellow-800'
                                : 'bg-gray-50 text-gray-800'
                            }`}
                          >
                            {predictionMatch.positionGap || '-'}
                          </div>
                        </td>

                        {/* Position Column */}
                        <td className='p-3 text-center w-[120px]'>
                          <div className='flex items-center justify-center gap-2 text-sm'>
                            <span className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-medium'>
                              {predictionMatch.homeTeam.position || '-'}
                            </span>
                            <span className='text-gray-500'>/</span>
                            <span className='px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 font-medium'>
                              {predictionMatch.awayTeam.position || '-'}
                            </span>
                          </div>
                        </td>

                        {/* Home/Away Form Column */}
                        <td className='p-3 text-center w-[120px]'>
                          <div className='flex flex-col gap-2'>
                            <div className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-sm font-medium'>
                              H:{' '}
                              {predictionMatch.homeTeam.homeForm ||
                                predictionMatch.homeTeam.form ||
                                '-'}
                            </div>
                            <div className='px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 text-sm font-medium'>
                              A:{' '}
                              {predictionMatch.awayTeam.awayForm ||
                                predictionMatch.awayTeam.form ||
                                '-'}
                            </div>
                          </div>
                        </td>

                        {/* Form Points Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div className='flex flex-col gap-1'>
                            <span className='px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800'>
                              {calculateFormPoints(
                                predictionMatch.homeTeam.form || ''
                              )}
                              %
                            </span>
                            <span className='px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-800'>
                              {calculateFormPoints(
                                predictionMatch.awayTeam.form || ''
                              )}
                              %
                            </span>
                          </div>
                        </td>

                        {/* Favorite Form Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div
                            className={`px-2 py-1 rounded-lg font-medium ${
                              predictionMatch.favorite === 'home'
                                ? 'bg-blue-50 text-blue-800'
                                : predictionMatch.favorite === 'away'
                                ? 'bg-purple-50 text-purple-800'
                                : 'bg-gray-50 text-gray-800'
                            }`}
                          >
                            {predictionMatch.favorite === 'home'
                              ? predictionMatch.homeTeam.form
                              : predictionMatch.favorite === 'away'
                              ? predictionMatch.awayTeam.form
                              : '-'}
                          </div>
                        </td>

                        {/* H2H Column */}
                        <td className='p-3 text-center w-[100px]'>
                          {predictionMatch.headToHead &&
                          predictionMatch.headToHead.matches > 0 ? (
                            <div
                              className={`px-3 py-1.5 rounded-lg font-medium ${
                                predictionMatch.headToHead.wins /
                                  predictionMatch.headToHead.matches >
                                0.7
                                  ? 'bg-green-50 text-green-800'
                                  : predictionMatch.headToHead.wins /
                                      predictionMatch.headToHead.matches >
                                    0.4
                                  ? 'bg-yellow-50 text-yellow-800'
                                  : 'bg-red-50 text-red-800'
                              }`}
                            >
                              {predictionMatch.headToHead.wins}-
                              {predictionMatch.headToHead.draws}-
                              {predictionMatch.headToHead.losses}
                            </div>
                          ) : (
                            <div className='px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium'>
                              N/A
                            </div>
                          )}
                        </td>

                        {/* Expected Goals Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div
                            className={`px-3 py-1.5 rounded-lg font-medium ${
                              predictionMatch.expectedGoals >= 2.2
                                ? 'bg-green-50 text-green-800'
                                : predictionMatch.expectedGoals >= 1.5
                                ? 'bg-yellow-50 text-yellow-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {Math.round(predictionMatch.expectedGoals) || '-'}
                          </div>
                        </td>

                        {/* Defensive Strength Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div
                            className={`px-3 py-1.5 rounded-lg font-medium ${
                              1 / (predictionMatch.defensiveStrength || 1) >=
                              1.2
                                ? 'bg-green-50 text-green-800'
                                : 1 /
                                    (predictionMatch.defensiveStrength || 1) >=
                                  1.0
                                ? 'bg-yellow-50 text-yellow-800'
                                : 'bg-gray-50 text-gray-800'
                            }`}
                          >
                            {predictionMatch.defensiveStrength?.toFixed(2) ||
                              '-'}
                          </div>
                        </td>

                        {/* Favorite Column */}
                        <td className='p-3 text-center w-[150px]'>
                          {predictionMatch.favorite ? (
                            <div
                              className={`px-2 py-1 rounded-lg inline-flex items-center justify-center text-xs font-medium ${
                                predictionMatch.favorite === 'home'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-purple-50 text-purple-800 border border-purple-200'
                              }`}
                            >
                              <span className='text-lg mr-1'>🏆</span>
                              <span className='truncate max-w-[100px]'>
                                {predictionMatch.favorite === 'home'
                                  ? predictionMatch.homeTeam.name
                                  : predictionMatch.awayTeam.name}
                              </span>
                            </div>
                          ) : (
                            <div className='px-2 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium'>
                              None
                            </div>
                          )}
                        </td>

                        {/* Confidence Column */}
                        <td className='p-3 text-center w-[100px]'>
                          <div
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              predictionMatch.confidenceScore >= 80
                                ? 'bg-green-50 text-green-800'
                                : predictionMatch.confidenceScore >= 60
                                ? 'bg-yellow-50 text-yellow-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {predictionMatch.confidenceScore}%
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Match Details Section */}
              <div className='mb-6 pb-4 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  Live Match Details
                </h3>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 w-full'>
                  {/* Team Positions */}
                  <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-2'>
                    <h4 className='text-sm font-medium text-gray-700 mb-3'>
                      Team Positions
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Position Gap:
                        </span>
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            (match.positionGap || 0) >= 10
                              ? 'bg-green-50 text-green-800'
                              : (match.positionGap || 0) >= 5
                              ? 'bg-yellow-50 text-yellow-800'
                              : 'bg-gray-50 text-gray-800'
                          }`}
                        >
                          {match.positionGap || '-'}
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Home Position:
                        </span>
                        <div className='px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800'>
                          {match.teams.home.position || '-'}
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Away Position:
                        </span>
                        <div className='px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-800'>
                          {match.teams.away.position || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Situation */}
                  <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-2'>
                    <h4 className='text-sm font-medium text-gray-700 mb-3'>
                      Match Situation
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Total Time:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {formatPlayedTime(match.playedSeconds)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>Status:</span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.status}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Tournament:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.tournamentName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attack Statistics */}
              <div className='mb-6 pb-4 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  Attack Statistics
                </h3>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 text-xs'>
                      Total Attacks:
                    </span>
                    <div className='flex gap-3'>
                      <span className='font-medium text-blue-600 text-xs min-w-[30px] text-right'>
                        {match.matchSituation?.home.totalAttacks || '0'}
                      </span>
                      <span className='font-medium text-purple-600 text-xs min-w-[30px] text-right'>
                        {match.matchSituation?.away.totalAttacks || '0'}
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 text-xs'>
                      Dangerous Attacks:
                    </span>
                    <div className='flex gap-3'>
                      <span className='font-medium text-blue-600 text-xs min-w-[30px] text-right'>
                        {match.matchSituation?.home.totalDangerousAttacks ||
                          '0'}
                      </span>
                      <span className='font-medium text-purple-600 text-xs min-w-[30px] text-right'>
                        {match.matchSituation?.away.totalDangerousAttacks ||
                          '0'}
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 text-xs'>Safe Attacks:</span>
                    <div className='flex gap-3'>
                      <span className='font-medium text-blue-600 text-xs min-w-[30px] text-right'>
                        {match.matchSituation?.home.totalSafeAttacks || '0'}
                      </span>
                      <span className='font-medium text-purple-600 text-xs min-w-[30px] text-right'>
                        {match.matchSituation?.away.totalSafeAttacks || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className='mb-6 pb-4 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  Match Details
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <h5 className='text-xs font-medium text-blue-600 mb-2'>
                      Home Team
                    </h5>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Shots on Target:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.home.shotsOnTarget || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Shots off Target:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.home.shotsOffTarget || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Corner Kicks:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.home.cornerKicks || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>Fouls:</span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.home.fouls || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <h5 className='text-xs font-medium text-purple-600 mb-2'>
                      Away Team
                    </h5>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Shots on Target:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.away.shotsOnTarget || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Shots off Target:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.away.shotsOffTarget || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Corner Kicks:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.away.cornerKicks || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>Fouls:</span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.away.fouls || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards and Possession */}
              <div className='mb-6 pb-4 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  Cards & Possession
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <h5 className='text-xs font-medium text-blue-600 mb-2'>
                      Home Team
                    </h5>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Yellow Cards:
                        </span>
                        <span className='font-medium text-yellow-600 text-xs'>
                          {match.matchDetails?.home.yellowCards || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Red Cards:
                        </span>
                        <span className='font-medium text-red-600 text-xs'>
                          {match.matchDetails?.home.redCards || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Ball Safe:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.home.ballSafe || '0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <h5 className='text-xs font-medium text-purple-600 mb-2'>
                      Away Team
                    </h5>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Yellow Cards:
                        </span>
                        <span className='font-medium text-yellow-600 text-xs'>
                          {match.matchDetails?.away.yellowCards || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Red Cards:
                        </span>
                        <span className='font-medium text-red-600 text-xs'>
                          {match.matchDetails?.away.redCards || '0'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-xs'>
                          Ball Safe:
                        </span>
                        <span className='font-medium text-gray-900 text-xs'>
                          {match.matchDetails?.away.ballSafe || '0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prediction details section - match details, teams comparison, and reasons */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
                {/* Match Details */}
                <div className='md:border-r border-gray-100 md:pr-4'>
                  <h3 className='font-semibold text-gray-700 mb-4 text-lg'>
                    Match Details
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500'>Date:</span>
                      <span className='font-medium text-gray-800'>
                        {predictionMatch.date}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500'>Time:</span>
                      <span className='font-medium text-gray-800'>
                        {predictionMatch.time}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500'>Venue:</span>
                      <span className='font-medium text-gray-800'>
                        {predictionMatch.venue}
                      </span>
                    </div>
                    {/* Fix the odds property TypeScript errors */}
                    {(predictionMatch as any).odds && (
                      <>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-500'>Over 1.5 Goals:</span>
                          <span className='font-medium text-gray-800'>
                            {(
                              predictionMatch as any
                            ).odds?.over15Goals?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-500'>Home/Draw/Away:</span>
                          <span className='font-medium text-gray-800'>
                            {(predictionMatch as any).odds?.homeWin?.toFixed(
                              2
                            ) || 'N/A'}{' '}
                            /{' '}
                            {(predictionMatch as any).odds?.draw?.toFixed(2) ||
                              'N/A'}{' '}
                            /{' '}
                            {(predictionMatch as any).odds?.awayWin?.toFixed(
                              2
                            ) || 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Teams Comparison */}
                <div className='md:border-r border-gray-100 md:px-4'>
                  <h3 className='font-semibold text-gray-700 mb-4 text-lg'>
                    Teams Comparison
                  </h3>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr>
                        <th className='text-left font-medium text-gray-500 pb-2'>
                          Metric
                        </th>
                        <th className='text-center font-medium text-gray-500 pb-2'>
                          {predictionMatch.homeTeam.name}
                        </th>
                        <th className='text-center font-medium text-gray-500 pb-2'>
                          {predictionMatch.awayTeam.name}
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                      <tr>
                        <td className='py-3 text-gray-500'>Position</td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.homeTeam.position || '-'}
                        </td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.awayTeam.position || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className='py-3 text-gray-500'>Form</td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.homeTeam.form || '-'}
                        </td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.awayTeam.form || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className='py-3 text-gray-500'>Form Points</td>
                        <td className='py-3 text-center font-medium'>
                          {calculateFormPoints(
                            predictionMatch.homeTeam.form || ''
                          )}
                          %
                        </td>
                        <td className='py-3 text-center font-medium'>
                          {calculateFormPoints(
                            predictionMatch.awayTeam.form || ''
                          )}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td className='py-3 text-gray-500'>Avg Goals</td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.homeTeam.avgHomeGoals
                            ? Math.round(predictionMatch.homeTeam.avgHomeGoals)
                            : 'N/A'}
                        </td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.awayTeam.avgAwayGoals
                            ? Math.round(predictionMatch.awayTeam.avgAwayGoals)
                            : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className='py-3 text-gray-500'>Clean Sheets</td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.homeTeam.cleanSheets || '-'}
                        </td>
                        <td className='py-3 text-center font-medium'>
                          {predictionMatch.awayTeam.cleanSheets || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Prediction Reasons */}
                <div className='md:pl-4'>
                  <h3 className='font-semibold text-gray-700 mb-4 text-lg'>
                    Prediction Reasons
                  </h3>
                  <ul className='list-disc pl-4 space-y-2'>
                    {predictionMatch.reasonsForPrediction?.map(
                      (reason: string, idx: number) => (
                        <li key={idx} className='text-gray-700 text-sm'>
                          {reason}
                        </li>
                      )
                    )}
                  </ul>

                  {/* H2H Records */}
                  {predictionMatch.headToHead &&
                    predictionMatch.headToHead.matches > 0 && (
                      <div className='mt-6'>
                        <h4 className='font-medium text-gray-700 mb-3 text-base'>
                          Head-to-Head
                        </h4>
                        <div className='text-sm text-gray-600 mb-3'>
                          Record: {predictionMatch.headToHead.wins}W{' '}
                          {predictionMatch.headToHead.draws}D{' '}
                          {predictionMatch.headToHead.losses}L (
                          {predictionMatch.headToHead.goalsScored}-
                          {predictionMatch.headToHead.goalsConceded})
                        </div>
                        {(predictionMatch.headToHead as any).recentMatches && (
                          <div>
                            <h5 className='text-xs font-medium text-gray-500 mb-2'>
                              Recent Matches:
                            </h5>
                            <ul className='text-xs space-y-1.5'>
                              {(
                                predictionMatch.headToHead as any
                              ).recentMatches.map(
                                (h2hMatch: any, idx: number) => (
                                  <li key={idx} className='text-gray-600'>
                                    {h2hMatch.date?.substring(0, 10)}:{' '}
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

              {/* Confidence score progress bar */}
              <div className='mt-6'>
                <p className='text-sm font-medium text-gray-700 mb-2'>
                  Confidence Score:
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        predictionMatch.confidenceScore >= 80
                          ? 'bg-green-600'
                          : predictionMatch.confidenceScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${predictionMatch.confidenceScore}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-sm font-medium min-w-[60px] text-right'>
                    {predictionMatch.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Team Statistics Section */}
              <div className='mb-6 pb-4 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  Team Statistics
                </h3>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {/* Clean Sheets & Scoring Stats */}
                  <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-3'>
                    <h4 className='text-sm font-medium text-gray-700 mb-3'>
                      Clean Sheets & Scoring
                    </h4>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <h5 className='text-xs font-medium text-blue-600 mb-2'>
                          Home Team
                        </h5>
                        <div className='space-y-1.5'>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Home Avg Goals:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {predictionMatch.homeTeam.avgHomeGoals?.toFixed(
                                2
                              ) || '0'}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Total Clean Sheets:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {predictionMatch.homeTeam.cleanSheets || '0'}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Home Clean Sheets:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {predictionMatch.homeTeam.homeCleanSheets || '0'}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Scoring First Win %:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.homeTeam.scoringFirstWinRate ||
                                0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Conceding First Win %:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.homeTeam
                                  .concedingFirstWinRate || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <h5 className='text-xs font-medium text-purple-600 mb-2'>
                          Away Team
                        </h5>
                        <div className='space-y-1.5'>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Total Clean Sheets:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {predictionMatch.awayTeam.cleanSheets || '0'}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Away Clean Sheets:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {predictionMatch.awayTeam.awayCleanSheets || '0'}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Scoring First Win %:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.awayTeam.scoringFirstWinRate ||
                                0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Conceding First Win %:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.awayTeam
                                  .concedingFirstWinRate || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Pattern Stats */}
                  <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-3'>
                    <h4 className='text-sm font-medium text-gray-700 mb-3'>
                      Match Patterns
                    </h4>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <h5 className='text-xs font-medium text-blue-600 mb-2'>
                          Home Team
                        </h5>
                        <div className='space-y-1.5'>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Avg Corners:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.homeTeam.avgCorners || 0
                              ).toFixed(1)}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              BTTS Rate:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(predictionMatch.homeTeam.bttsRate || 0).toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Home BTTS Rate:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.homeTeam.homeBttsRate || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Late Goal Rate:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.homeTeam.lateGoalRate || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <h5 className='text-xs font-medium text-purple-600 mb-2'>
                          Away Team
                        </h5>
                        <div className='space-y-1.5'>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Avg Corners:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.awayTeam.avgCorners || 0
                              ).toFixed(1)}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              BTTS Rate:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(predictionMatch.awayTeam.bttsRate || 0).toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Away BTTS Rate:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.awayTeam.awayBttsRate || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-600 text-xs'>
                              Late Goal Rate:
                            </span>
                            <span className='font-medium text-gray-900 text-xs'>
                              {(
                                predictionMatch.awayTeam.lateGoalRate || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
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
  } = useCartStore();

  // Update isInitialLoading based on allLiveMatches
  useEffect(() => {
    setIsInitialLoading(allLiveMatches.length === 0 && isConnected);
  }, [allLiveMatches, isConnected]);

  const getSortedAndFilteredMatches = (matches: Match[]): Match[] => {
    const filtered = matches.filter((match) => {
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
    // Reset the timer whenever new text comes in
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

  // Add debug logging
  useEffect(() => {
    console.log('Active Tab:', activeTab);
    console.log('Live Matches:', liveMatches.length);
    console.log('All Live Matches:', allLiveMatches.length);
    console.log('Filtered Matches:', filteredMatches.length);
    console.log('Is Connected:', isConnected);
    console.log('Is Paused:', isPaused);
  }, [
    activeTab,
    liveMatches,
    allLiveMatches,
    filteredMatches,
    isConnected,
    isPaused,
  ]);

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

    navigator.clipboard
      .writeText(allTeams)
      .then(() =>
        setCopiedText(
          `${
            cartTeamNames.length + upcomingTeamNames.length
          } team names copied!`
        )
      )
      .catch((err) => console.error('Failed to copy:', err));
  };

  // Update the useEffect to remove unnecessary logging
  useEffect(() => {
    if (isPredictionDataLoaded && predictionData.length > 0) {
      const timeoutId = setTimeout(() => {
        // Only log essential information
        if (predictionData.length > 0) {
          console.log(
            `Prediction data loaded: ${predictionData.length} matches`
          );
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isPredictionDataLoaded, predictionData.length]);

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
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              disabled={isInitialLoading}
            />

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
    </div>
  );
};

export default MatchesPage;
