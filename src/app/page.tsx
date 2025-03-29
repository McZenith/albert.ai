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
    home: { id: string; name: string };
    away: { id: string; name: string };
  };
  tournamentName: string;
  status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
  playedSeconds: number;
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
}: {
  title: string;
  sortDirection?: SortDirection;
  onSort?: () => void;
  onFilter?: (value: string) => void;
  filterType?: FilterType;
  align?: 'left' | 'right' | 'center';
  isActive?: boolean;
}) => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <th className='px-4 py-3'>
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
  const isInCart = cartItems.some(
    (item) => item.matchId === match.id && item.marketId === market.id
  );

  const TOTAL_INVESTMENT = 100000;

  const createOutcomeKey = (outcomeId: string, index: number) => {
    return `${match.id}-${market.id}-${outcomeId}-${index}`;
  };

  const getOddsClassName = (outcome: { isChanged?: boolean }) => {
    if (!outcome.isChanged) return 'text-sm font-medium text-right';
    return 'text-sm font-medium text-right bg-yellow-100 transition-colors duration-500';
  };

  return (
    <tr className='border-t hover:bg-gray-50 transition-colors'>
      {/* Teams & Status Column */}
      <td className='px-4 py-3'>
        <div className='flex flex-col'>
          <span className='font-medium'>{match.teams.home.name}</span>
          <span className='text-sm text-gray-600'>{match.teams.away.name}</span>
          <div className='mt-1 flex items-center gap-2'>
            <span className='inline-block px-2 py-1 text-xs font-medium rounded-sm bg-blue-100 text-blue-800'>
              {match.status}
            </span>
            {match.status !== 'FT' && (
              <span className='text-xs text-gray-600'>
                {formatPlayedTime(match.playedSeconds)}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Score Column */}
      <td className='px-4 py-3 text-center'>
        <span className='text-sm font-medium'>{match.score || '-'}</span>
      </td>

      {/* Tournament Column */}
      <td className='px-4 py-3 text-sm'>{match.tournamentName}</td>

      {/* Market Column */}
      <td className='px-4 py-3 text-sm'>{market.description}</td>

      {/* Profit % Column */}
      <td className='px-4 py-3 text-right'>
        <span
          className={`px-2 py-1 rounded text-sm ${
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
      <td className='px-4 py-3 text-right text-sm'>
        {market.margin.toFixed(2)}%
      </td>

      {/* Outcomes Column */}
      <td className='px-4 py-3'>
        <div className='space-y-1'>
          {market.outcomes.map((outcome, index) => (
            <div key={createOutcomeKey(outcome.id, index)} className='text-sm'>
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
              className='text-sm text-right'
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
              className='text-sm text-right'
            >
              ${((outcome.stakePercentage / 100) * TOTAL_INVESTMENT).toFixed(2)}
            </div>
          ))}
        </div>
      </td>

      <td className='px-4 py-3 text-center'>
        <span className='text-sm font-medium'>{market.favourite}</span>
      </td>
      {/* Actions Column */}
      <td className='px-4 py-3 text-center'>
        <button
          onClick={() => {
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
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            isInCart
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isInCart ? 'Remove' : 'Add'}
        </button>
      </td>
    </tr>
  );
};

// Main Component
const MatchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Initialize activeTab from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTab');
      return savedTab || 'live';
    }
    return 'live';
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
    isPaused,
    togglePause,
    isConnected,
  } = useMatchData();
  const {
    items: cartItems,
    addItem,
    removeItem,
    clearCart,
    upcomingMatches,
    clearUpcomingMatches,
    getUpcomingMatchesCount,
  } = useCartStore();

  // Handle initial loading state
  useEffect(() => {
    if (isConnected && isInitialLoading && liveMatches.length !== 0) {
      setIsInitialLoading(false);
    }
  }, [isConnected, isInitialLoading, liveMatches.length]);

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

  const handleSort = (field: string) => {
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

  const handleFilter = (field: string, value: string) => {
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
  const getStatusSortValue = (status: string) => {
    const statusOrder = {
      NS: 0, // Not Started
      '1H': 1, // First Half
      HT: 2, // Half Time
      '2H': 3, // Second Half
      FT: 4, // Full Time
    } as const;
    return statusOrder[status as keyof typeof statusOrder] || 0;
  };

  const getSortedAndFilteredMatches = (matches: Match[]) => {
    const filtered = matches.filter((match) => {
      // Apply text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        match.teams.home.name.toLowerCase().includes(searchLower) ||
        match.teams.away.name.toLowerCase().includes(searchLower);

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
          let aValue, bValue;

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

    const filteredMatches = filtered.filter((x) =>
      x.markets.filter((x) => x.description != '1st Half - Correct Score')
    );

    return filteredMatches;
  };

  const filteredMatches = getSortedAndFilteredMatches(liveMatches);

  // Function to clear all carts
  const clearAllCarts = () => {
    clearCart();
    clearUpcomingMatches();
  };

  // Update the copy function to handle both carts
  const copyAllNames = () => {
    // Get names from regular cart
    const cartTeamNames = cartItems.map(
      (item) => `${item.teams.home.name} vs ${item.teams.away.name}`
    );

    // Get only favorite team names from upcoming matches cart
    const upcomingTeamNames = upcomingMatches
      .filter((match) => match.favorite === 'home' || match.favorite === 'away')
      .map((match) => {
        // Get only the name of the favorite team
        const favoriteTeam =
          match.favorite === 'home' ? match.homeTeam.name : match.awayTeam.name;

        return favoriteTeam; // Just return the team name without additional text
      });

    // Combine both lists and ensure each name is on a separate line
    const allTeams = [...cartTeamNames, ...upcomingTeamNames].join('\n');

    // Debug the content
    console.log('Copied content:', allTeams);
    console.log(
      'Number of items:',
      cartTeamNames.length + upcomingTeamNames.length
    );

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
        {activeTab === 'live' ? (
          <div className='container mx-auto px-4'>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              disabled={isInitialLoading}
            />

            {isInitialLoading ? (
              <LoadingTable />
            ) : (
              <div className='mt-4 bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead>
                      <tr className='bg-gray-50'>
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
                        />
                        <HeaderCell
                          title='Score'
                          filterType='none'
                          align='center'
                        />
                        <HeaderCell title='Tournament' filterType='none' />
                        <HeaderCell title='Market' filterType='none' />
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
                        />
                        <HeaderCell title='Outcomes' filterType='none' />
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
                        />
                        <HeaderCell
                          title='Stake %'
                          filterType='none'
                          align='right'
                        />
                        <HeaderCell
                          title='Investment ($)'
                          filterType='none'
                          align='right'
                        />
                        <HeaderCell
                          title='Favourite'
                          filterType='none'
                          align='center'
                        />
                        <HeaderCell
                          title='Actions'
                          filterType='none'
                          align='center'
                        />
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {filteredMatches.flatMap((match, matchIndex) =>
                        match.markets.map((market, marketIndex) => (
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
