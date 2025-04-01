'use client';

import React, { useState, useEffect } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { useCartStore } from '@/hooks/useStore';
import { ChevronUp, ChevronDown, Filter, ShoppingCart } from 'lucide-react';
import MatchPredictor from '@/components/UpcomingTab';

// Enhanced Types
// interface Team {
//   id: string;
//   name: string;
//   position?: number;
//   form?: string;
//   avgHomeGoals?: number;
//   cleanSheets?: number;
//   homeCleanSheets?: number;
//   scoringFirstWinRate?: number;
//   concedingFirstWinRate?: number;
//   avgCorners?: number;
//   bttsRate?: number;
//   homeBttsRate?: number;
//   lateGoalRate?: number;
// }

// interface Market {
//   id: string;
//   description: string;
//   profitPercentage: number;
//   margin: number;
//   favourite?: string;
//   outcomes: Array<{
//     id: string;
//     description: string;
//     odds: number;
//     stakePercentage?: number;
//   }>;
// }

// Update the Match interface to match TransformedMatch
interface Match {
  id: string;
  seasonId: string;
  teams: {
    home: {
      id: string;
      name: string;
    };
    away: {
      id: string;
      name: string;
    };
  };
  tournamentName: string;
  status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
  playedSeconds: number;
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
    specifier: string;
    profitPercentage: number;
    favourite?: string;
    margin: number;
    outcomes: Array<{
      id: string;
      description: string;
      odds: number;
      stakePercentage: number;
      isChanged?: boolean;
    }>;
  }>;
  score: string;
  createdAt: string;
  matchTime: string;
}

// Update the CartItem interface
interface CartItem {
  matchId: string;
  marketId: string;
  teams: {
    home: {
      id: string;
      name: string;
    };
    away: {
      id: string;
      name: string;
    };
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
  addItem,
}: {
  match: Match;
  market: Match['markets'][0];
  addItem: (item: CartItem) => void;
}) => {
  return (
    <tr className='border-t border-gray-100'>
      <td className='px-4 py-3'>
        <div className='flex items-center space-x-2'>
          <span className='font-medium text-gray-900'>
            {market.description}
          </span>
          {market.favourite && (
            <span className='text-xs text-gray-500'>({market.favourite})</span>
          )}
        </div>
      </td>
      <td className='px-4 py-3 text-center'>
        <span className='text-sm font-medium text-gray-900'>
          {market.profitPercentage.toFixed(2)}%
        </span>
      </td>
      <td className='px-4 py-3 text-center'>
        <span className='text-sm font-medium text-gray-900'>
          {market.margin.toFixed(2)}%
        </span>
      </td>
      <td className='px-4 py-3'>
        <div className='space-y-1'>
          {market.outcomes.map((outcome) => (
            <div key={outcome.id} className='flex justify-between items-center'>
              <span className='text-sm text-gray-700'>
                {outcome.description}
              </span>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium text-gray-900'>
                  {outcome.odds.toFixed(2)}
                </span>
                {outcome.stakePercentage && (
                  <span className='text-sm text-gray-700 text-right'>
                    {outcome.stakePercentage.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </td>
      <td className='px-4 py-3 text-center'>
        <button
          onClick={() =>
            addItem({
              matchId: match.id,
              marketId: market.id,
              teams: {
                home: {
                  id: match.teams.home.id,
                  name: match.teams.home.name,
                },
                away: {
                  id: match.teams.away.id,
                  name: match.teams.away.name,
                },
              },
              market: {
                id: market.id,
                description: market.description,
                profitPercentage: market.profitPercentage,
                outcomes: market.outcomes.map((outcome) => ({
                  ...outcome,
                  stakePercentage: outcome.stakePercentage || 0,
                })),
              },
              addedAt: new Date().toISOString(),
            })
          }
          className='text-blue-600 hover:text-blue-800'
        >
          Add
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
    addItem,
    clearCart,
    upcomingMatches,
    clearUpcomingMatches,
    getUpcomingMatchesCount,
    loadPredictionData,
    predictionData,
    isPredictionDataLoaded,
  } = useCartStore();

  // Update the useEffect to add retry logic for prediction data loading
  useEffect(() => {
    // Track retry attempts
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = async () => {
      // Only load prediction data if it hasn't been loaded already
      if (!isPredictionDataLoaded) {
        console.log(
          `Attempting to load prediction data (attempt ${retryCount + 1}/${
            maxRetries + 1
          })`
        );

        await loadPredictionData();

        // Check if the load was successful
        const { isPredictionDataLoaded, predictionData } =
          useCartStore.getState();

        if (!isPredictionDataLoaded && retryCount < maxRetries) {
          // If not successful and we have retries left, try again after a delay
          retryCount++;
          console.log(
            `Prediction data load unsuccessful, retrying in 2 seconds... (${retryCount}/${maxRetries})`
          );
          setTimeout(loadWithRetry, 2000);
        } else if (isPredictionDataLoaded) {
          console.log(
            `Prediction data successfully loaded with ${predictionData.length} matches`
          );
        } else {
          console.warn(
            'Failed to load prediction data after all retry attempts'
          );
        }
      } else {
        console.log('Prediction data already loaded, skipping initial load');
      }
    };

    loadWithRetry();
  }, [loadPredictionData, isPredictionDataLoaded]);

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
    // Store filter in localStorage without using state
    const currentFilters = JSON.parse(
      localStorage.getItem('liveFilters') || '{}'
    );
    const newFilters = {
      ...currentFilters,
      [field]: value,
    };
    localStorage.setItem('liveFilters', JSON.stringify(newFilters));
  };

  // Update the getSortedAndFilteredMatches function
  const getSortedAndFilteredMatches = (matches: Match[]): Match[] => {
    return matches
      .filter((match) => {
        return (
          (match.status === '1H' || match.status === '2H') &&
          match.matchSituation?.dominantTeam &&
          match.matchSituation?.matchMomentum
        );
      })
      .sort((a, b) => {
        return (
          (b.matchSituation?.home.totalDangerousAttacks || 0) -
          (a.matchSituation?.home.totalDangerousAttacks || 0)
        );
      });
  };

  const filteredMatches = getSortedAndFilteredMatches(
    activeTab === 'live' ? liveMatches : allLiveMatches
  );

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
  const copyAllNames = () => {
    const names = [
      ...cartItems.map(
        (item) => `${item.teams.home.name} vs ${item.teams.away.name}`
      ),
      ...upcomingMatches.map(
        (match) => `${match.homeTeam.name} vs ${match.awayTeam.name}`
      ),
    ].join('\n');
    navigator.clipboard.writeText(names);
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
          <div className='container mx-auto px-4'>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              disabled={isInitialLoading}
            />

            {isInitialLoading ? (
              <LoadingTable />
            ) : (
              <div className='mt-4 bg-white rounded-lg shadow-sm'>
                <div className='w-full overflow-x-auto'>
                  <table className='w-full divide-y divide-gray-200'>
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
                          className='w-[200px]'
                        />
                        <HeaderCell
                          title='Score'
                          filterType='none'
                          align='center'
                          className='w-[100px]'
                        />
                        <HeaderCell
                          title='Tournament'
                          filterType='none'
                          className='w-[150px]'
                        />
                        <HeaderCell
                          title='Market'
                          filterType='none'
                          className='w-[150px]'
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
                          className='w-[100px]'
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
                          className='w-[100px]'
                        />
                        <HeaderCell
                          title='Outcomes'
                          filterType='none'
                          className='w-[150px]'
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
                          className='w-[100px]'
                        />
                        <HeaderCell
                          title='Stake %'
                          filterType='none'
                          align='right'
                          className='w-[100px]'
                        />
                        <HeaderCell
                          title='Investment ($)'
                          filterType='none'
                          align='right'
                          className='w-[120px]'
                        />
                        <HeaderCell
                          title='Favourite'
                          filterType='none'
                          align='center'
                          className='w-[100px]'
                        />
                        <HeaderCell
                          title='Actions'
                          filterType='none'
                          align='center'
                          className='w-[100px]'
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
                              addItem={addItem}
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
