/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { useCartStore } from '@/hooks/useStore';
import { ChevronUp, ChevronDown, Filter, ShoppingCart } from 'lucide-react';

// Enhanced Types
interface Match {
  id: string;
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
    <div className='h-4 bg-gray-200 rounded w-3/4'></div>
  </div>
);

const SkeletonRow = () => (
  <tr className='border-t'>
    <td className='px-4 py-3'>
      <div className='space-y-2'>
        <div className='animate-pulse h-4 bg-gray-200 rounded w-32'></div>
        <div className='animate-pulse h-4 bg-gray-200 rounded w-24'></div>
      </div>
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <div className='space-y-2'>
        <div className='animate-pulse h-4 bg-gray-200 rounded w-24'></div>
        <div className='animate-pulse h-4 bg-gray-200 rounded w-24'></div>
      </div>
    </td>
    <td className='px-4 py-3'>
      <div className='space-y-2'>
        <div className='animate-pulse h-4 bg-gray-200 rounded w-16'></div>
        <div className='animate-pulse h-4 bg-gray-200 rounded w-16'></div>
      </div>
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <SkeletonCell />
    </td>
    <td className='px-4 py-3'>
      <div className='animate-pulse h-8 bg-gray-200 rounded w-20 mx-auto'></div>
    </td>
  </tr>
);

const LoadingTable = () => (
  <div className='mt-4 bg-white rounded-lg shadow overflow-hidden'>
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead>
          <tr className='bg-gray-50'>
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <th key={index} className='px-4 py-3'>
                  <div className='animate-pulse h-4 bg-gray-200 rounded w-20'></div>
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
}: {
  title: string;
  sortDirection?: SortDirection;
  onSort?: () => void;
  onFilter?: (value: string) => void;
  filterType?: FilterType;
  align?: 'left' | 'right' | 'center';
}) => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <th className='px-4 py-3'>
      <div className='flex flex-col gap-2'>
        <div
          className={`flex items-center justify-${align} gap-2 cursor-pointer`}
          onClick={onSort}
        >
          <span className='text-sm font-medium text-gray-500'>{title}</span>
          {sortDirection &&
            (sortDirection === 'asc' ? (
              <ChevronUp className='w-4 h-4' />
            ) : (
              <ChevronDown className='w-4 h-4' />
            ))}
          {filterType !== 'none' && (
            <Filter
              className='w-4 h-4 cursor-pointer hover:text-blue-600'
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
                className='w-full text-sm border rounded px-2 py-1'
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
                className='w-full text-sm border rounded px-2 py-1'
                placeholder='Min minutes'
                onChange={(e) =>
                  onFilter((parseInt(e.target.value) * 60).toString())
                }
              />
            ) : (
              <input
                type='number'
                className='w-full text-sm border rounded px-2 py-1'
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
    <div className='p-4 bg-white shadow-sm mt-4 rounded-lg'>
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
  showCartItems,
  setShowCartItems,
  disabled = false,
}: {
  matchCount: number;
  isPaused: boolean;
  togglePause: () => void;
  onCopyNames: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemsCount: number;
  showCartItems: boolean;
  setShowCartItems: (show: boolean) => void;
  disabled?: boolean;
}) => (
  <div className='container mx-auto'>
    <div className='flex flex-wrap justify-between items-center p-4 bg-white shadow-sm rounded-lg'>
      <div className='flex items-center space-x-4 mb-2 sm:mb-0'>
        <button
          className={`px-4 py-2 rounded-lg relative ${
            activeTab === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setActiveTab('live')}
          disabled={disabled}
        >
          Live Matches
          {activeTab === 'live' && (
            <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {matchCount}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setActiveTab('upcoming')}
          disabled={disabled}
        >
          Upcoming Matches
        </button>
      </div>

      <div className='flex space-x-2 flex-wrap gap-2'>
        <button
          onClick={() => setShowCartItems(!showCartItems)}
          disabled={disabled}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ShoppingCart className='w-5 h-5 mr-2' />
          {cartItemsCount > 0 && (
            <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {cartItemsCount}
            </span>
          )}
          {showCartItems ? 'Show All' : 'Show Cart'}
        </button>
        <button
          onClick={onCopyNames}
          disabled={disabled || cartItemsCount === 0}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            disabled || cartItemsCount === 0
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
          className={`flex items-center px-4 py-2 ${
            isPaused ? 'bg-green-600' : 'bg-amber-600'
          } text-white rounded-lg hover:opacity-90 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className='mr-2'>{isPaused ? '▶️' : '⏸'}</span>
          {isPaused ? 'Resume Updates' : 'Pause Updates'}
        </button>
      </div>
    </div>
  </div>
);

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

  // Create unique key for outcomes
  const createOutcomeKey = (outcomeId: string, index: number) => {
    return `${match.id}-${market.id}-${outcomeId}-${index}`;
  };

  // Add visual feedback for odds changes
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
          <div className='mt-1'>
            <span className='inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800'>
              {match.status}
            </span>
          </div>
        </div>
      </td>

      {/* Time Column */}
      <td className='px-4 py-3 text-right'>
        <span className='text-sm'>
          {match.status !== 'FT' && formatPlayedTime(match.playedSeconds)}
        </span>
      </td>

      {/* Tournament Column */}
      <td className='px-4 py-3 text-sm'>{match.tournamentName}</td>

      {/* Market Column */}
      <td className='px-4 py-3 text-sm'>{market.description}</td>

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

      {/* Return Column */}
      <td className='px-4 py-3'>
        <div className='space-y-1'>
          {market.outcomes.map((outcome, index) => (
            <div
              key={createOutcomeKey(outcome.id, index)}
              className='text-sm text-right'
            >
              $
              {(
                (outcome.stakePercentage / 100) *
                TOTAL_INVESTMENT *
                outcome.odds
              ).toFixed(2)}
            </div>
          ))}
        </div>
      </td>

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
          {isInCart ? 'Remove' : 'Add to Cart'}
        </button>
      </td>
    </tr>
  );
};

// Main Component
const MatchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [showCartItems, setShowCartItems] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: SortDirection;
  }>({
    field: '',
    direction: 'asc',
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    matches: liveMatches,
    isPaused,
    togglePause,
    isConnected,
  } = useMatchData();
  const { items: cartItems, addItem, removeItem } = useCartStore();

  // Handle initial loading state
  useEffect(() => {
    if (isConnected && isInitialLoading && liveMatches.length !== 0) {
      setIsInitialLoading(false);
    }
  }, [isConnected, isInitialLoading, liveMatches.length]);

  const handleSort = (field: string) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilter = (field: string, value: string) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
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

    // Apply sorting
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.field) {
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'playedSeconds':
            aValue = a.playedSeconds;
            bValue = b.playedSeconds;
            break;
          case 'profit':
            aValue = Math.max(...a.markets.map((m) => m.profitPercentage));
            bValue = Math.max(...b.markets.map((m) => m.profitPercentage));
            break;
          case 'margin':
            aValue = Math.max(...a.markets.map((m) => m.margin));
            bValue = Math.max(...b.markets.map((m) => m.margin));
            break;
          case 'odds':
            aValue = Math.max(
              ...a.markets.flatMap((m) => m.outcomes.map((o) => o.odds))
            );
            bValue = Math.max(
              ...b.markets.flatMap((m) => m.outcomes.map((o) => o.odds))
            );
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredMatches = getSortedAndFilteredMatches(liveMatches);

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='py-4'>
        <Stats
          matchCount={liveMatches.length}
          isPaused={isPaused}
          togglePause={togglePause}
          onCopyNames={() => {
            const teamNames = cartItems
              .map(
                (item) => `${item.teams.home.name} vs ${item.teams.away.name}`
              )
              .join('\n');
            navigator.clipboard
              .writeText(teamNames)
              .then(() => alert('Team names copied!'))
              .catch((err) => console.error('Failed to copy:', err));
          }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemsCount={cartItems.length}
          showCartItems={showCartItems}
          setShowCartItems={setShowCartItems}
          disabled={isInitialLoading}
        />

        <div className='container mx-auto px-4'>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            disabled={isInitialLoading}
          />

          {isInitialLoading ? (
            <LoadingTable />
          ) : (
            <div className='mt-4 bg-white rounded-lg shadow overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <HeaderCell
                        title='Teams'
                        filterType='status'
                        onFilter={(value) => handleFilter('status', value)}
                      />
                      <HeaderCell
                        title='Time'
                        sortDirection={
                          sortConfig.field === 'playedSeconds'
                            ? sortConfig.direction
                            : undefined
                        }
                        onSort={() => handleSort('playedSeconds')}
                        onFilter={(value) =>
                          handleFilter('playedSeconds', value)
                        }
                        filterType='playedSeconds'
                        align='right'
                      />
                      <HeaderCell title='Tournament' filterType='none' />
                      <HeaderCell title='Market' filterType='none' />
                      <HeaderCell title='Outcomes' filterType='none' />
                      <HeaderCell
                        title='Odds'
                        sortDirection={
                          sortConfig.field === 'odds'
                            ? sortConfig.direction
                            : undefined
                        }
                        onSort={() => handleSort('odds')}
                        onFilter={(value) => handleFilter('odds', value)}
                        filterType='odds'
                        align='right'
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
                        title='Return ($)'
                        filterType='none'
                        align='right'
                      />
                      <HeaderCell
                        title='Profit %'
                        sortDirection={
                          sortConfig.field === 'profit'
                            ? sortConfig.direction
                            : undefined
                        }
                        onSort={() => handleSort('profit')}
                        onFilter={(value) => handleFilter('profit', value)}
                        filterType='profit'
                        align='right'
                      />
                      <HeaderCell
                        title='Margin'
                        sortDirection={
                          sortConfig.field === 'margin'
                            ? sortConfig.direction
                            : undefined
                        }
                        onSort={() => handleSort('margin')}
                        onFilter={(value) => handleFilter('margin', value)}
                        filterType='margin'
                        align='right'
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
      </div>
    </div>
  );
};

export default MatchesPage;
