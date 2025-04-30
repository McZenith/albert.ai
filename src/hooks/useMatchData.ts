/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useCartStore } from './useStore';
import { ClientMatch, TransformedMatch, Match, UpcomingMatch, Team, RecentMatch } from '@/types/match';
import { transformMatch } from '@/utils/matchUtils';

interface PredictionDataResponse {
    data: {
        upcomingMatches: Match[];
    };
}

// Helper function to clean team names
const enhancedCleanTeamName = (name: string): string => {
    return name
        .replace(/\([^)]*\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

// Helper function to normalize time format
const normalizeTimeFormat = (timeStr: string): string => {
    if (!timeStr) return '';
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function to safely convert values to numbers
export const safeNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

// Helper function to check if match is ClientMatch
const isClientMatch = (match: Match): match is ClientMatch => {
    return 'playedTime' in match;
};

// Helper function to check if match is UpcomingMatch
const isUpcomingMatch = (match: Match): match is UpcomingMatch => {
    return 'date' in match && 'venue' in match;
};

// Helper function to get home team data
const getHomeTeam = (match: Match) => {
    return isClientMatch(match) ? match.teams.home : match.homeTeam;
};

// Helper function to get away team data
const getAwayTeam = (match: Match) => {
    return isClientMatch(match) ? match.teams.away : match.awayTeam;
};

// Process recent matches data
const processRecentMatches = (matches: any[] | undefined): RecentMatch[] => {
    if (!matches || !Array.isArray(matches)) return [];

    return matches.map(match => {
        // Extract score from result if it contains a score pattern (e.g., "2-1", "0-0")
        const scoreMatch = match.result?.match(/\d+-\d+/);
        const score = scoreMatch ? scoreMatch[0] : match.score || match.result || '0-0';

        return {
            date: match.date || '',
            homeTeam: match.homeTeam || '',
            awayTeam: match.awayTeam || '',
            score: score,
            result: match.result || 'D'
        };
    });
};

// Process match data with enhanced support for recent matches
const processMatchData = (match: Match): UpcomingMatch => {
    if (!match) {
        throw new Error('Invalid match data');
    }

    // Normalize the time format for SignalR data
    const normalizedTime = isUpcomingMatch(match)
        ? (match.time || '00:00').padStart(5, '0') // Ensure time is in HH:mm format
        : normalizeTimeFormat(isClientMatch(match) ? match.playedTime : '');

    // Normalize the date format for SignalR data
    const normalizedDate = isUpcomingMatch(match)
        ? match.date // SignalR already provides date in YYYY-MM-DD format
        : new Date().toISOString().split('T')[0];

    const homeTeam = getHomeTeam(match);
    const awayTeam = getAwayTeam(match);

    if (!homeTeam || !awayTeam) {
        return {
            id: String(match.id),
            homeTeam: {
                id: '',
                name: '',
                position: 0,
                logo: '🏆',
                // Other required team fields...
                avgHomeGoals: 0,
                avgAwayGoals: 0,
                avgTotalGoals: 0,
                homeMatchesOver15: 0,
                awayMatchesOver15: 0,
                totalHomeMatches: 0,
                totalAwayMatches: 0,
                form: '',
                homeForm: '',
                awayForm: '',
                cleanSheets: 0,
                homeCleanSheets: 0,
                awayCleanSheets: 0,
                scoringFirstWinRate: 0,
                concedingFirstWinRate: 0,
                firstHalfGoalsPercent: 0,
                secondHalfGoalsPercent: 0,
                avgCorners: 0,
                bttsRate: 0,
                homeBttsRate: 0,
                awayBttsRate: 0,
                lateGoalRate: 0,
                recentMatches: [],
                homeAverageGoalsScored: 0,
                awayAverageGoalsScored: 0,
                averageGoalsScored: 0,
                homeAverageGoalsConceded: 0,
                awayAverageGoalsConceded: 0,
                averageGoalsConceded: 0,
                goalDistribution: {
                    '0-15': { total: 0, home: 0, away: 0 },
                    '16-30': { total: 0, home: 0, away: 0 },
                    '31-45': { total: 0, home: 0, away: 0 },
                    '46-60': { total: 0, home: 0, away: 0 },
                    '61-75': { total: 0, home: 0, away: 0 },
                    '76-90': { total: 0, home: 0, away: 0 }
                },
                againstTopTeamsPoints: 0,
                againstMidTeamsPoints: 0,
                againstBottomTeamsPoints: 0,
                isHomeTeam: true,
                formStrength: 0,
                formRating: 0,
                winPercentage: 0,
                drawPercentage: 0,
                homeWinPercentage: 0,
                awayWinPercentage: 0,
                cleanSheetPercentage: 0,
                goalsScoredAverage: 0,
                goalsConcededAverage: 0,
                averageCorners: 0,
                avgOdds: 0,
                leagueAvgGoals: 0,
                possession: 50,
                opponentName: '',
                totalHomeWins: 0,
                totalAwayWins: 0,
                totalHomeDraws: 0,
                totalAwayDraws: 0,
                totalHomeLosses: 0,
                totalAwayLosses: 0,
                over05: 0,
                over15: 0,
                over25: 0,
                over35: 0,
                over45: 0,
                cleanSheetRate: 0,
                cornerStats: {
                    avgCorners: 0,
                    avgCornersFor: 0,
                    avgCornersAgainst: 0
                },
                scoringStats: {
                    avgGoalsScored: 0,
                    avgGoalsConceded: 0,
                    avgTotalGoals: 0
                },
                patterns: {
                    btts: 0,
                    over15: 0,
                    over25: 0,
                    over35: 0
                }
            },
            awayTeam: {
                id: '',
                name: '',
                position: 0,
                logo: '🏆',
                // Other required team fields...
                avgHomeGoals: 0,
                avgAwayGoals: 0,
                avgTotalGoals: 0,
                homeMatchesOver15: 0,
                awayMatchesOver15: 0,
                totalHomeMatches: 0,
                totalAwayMatches: 0,
                form: '',
                homeForm: '',
                awayForm: '',
                cleanSheets: 0,
                homeCleanSheets: 0,
                awayCleanSheets: 0,
                scoringFirstWinRate: 0,
                concedingFirstWinRate: 0,
                firstHalfGoalsPercent: 0,
                secondHalfGoalsPercent: 0,
                avgCorners: 0,
                bttsRate: 0,
                homeBttsRate: 0,
                awayBttsRate: 0,
                lateGoalRate: 0,
                recentMatches: [],
                homeAverageGoalsScored: 0,
                awayAverageGoalsScored: 0,
                averageGoalsScored: 0,
                homeAverageGoalsConceded: 0,
                awayAverageGoalsConceded: 0,
                averageGoalsConceded: 0,
                goalDistribution: {
                    '0-15': { total: 0, home: 0, away: 0 },
                    '16-30': { total: 0, home: 0, away: 0 },
                    '31-45': { total: 0, home: 0, away: 0 },
                    '46-60': { total: 0, home: 0, away: 0 },
                    '61-75': { total: 0, home: 0, away: 0 },
                    '76-90': { total: 0, home: 0, away: 0 }
                },
                againstTopTeamsPoints: 0,
                againstMidTeamsPoints: 0,
                againstBottomTeamsPoints: 0,
                isHomeTeam: false,
                formStrength: 0,
                formRating: 0,
                winPercentage: 0,
                drawPercentage: 0,
                homeWinPercentage: 0,
                awayWinPercentage: 0,
                cleanSheetPercentage: 0,
                goalsScoredAverage: 0,
                goalsConcededAverage: 0,
                averageCorners: 0,
                avgOdds: 0,
                leagueAvgGoals: 0,
                possession: 50,
                opponentName: '',
                totalHomeWins: 0,
                totalAwayWins: 0,
                totalHomeDraws: 0,
                totalAwayDraws: 0,
                totalHomeLosses: 0,
                totalAwayLosses: 0,
                over05: 0,
                over15: 0,
                over25: 0,
                over35: 0,
                over45: 0,
                cleanSheetRate: 0,
                cornerStats: {
                    avgCorners: 0,
                    avgCornersFor: 0,
                    avgCornersAgainst: 0
                },
                scoringStats: {
                    avgGoalsScored: 0,
                    avgGoalsConceded: 0,
                    avgTotalGoals: 0
                },
                patterns: {
                    btts: 0,
                    over15: 0,
                    over25: 0,
                    over35: 0
                }
            },
            date: normalizedDate,
            time: normalizedTime,
            venue: isUpcomingMatch(match) ? match.venue : 'TBD',
            positionGap: 0,
            favorite: null,
            confidenceScore: 0,
            averageGoals: 0,
            expectedGoals: 0,
            defensiveStrength: 0,
            headToHead: {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsScored: 0,
                goalsConceded: 0,
                recentMatches: []
            },
            odds: {
                homeWin: 0,
                draw: 0,
                awayWin: 0,
                over15Goals: 0,
                under15Goals: 0,
                over25Goals: 0,
                under25Goals: 0,
                bttsYes: 0,
                bttsNo: 0
            },
            cornerStats: {
                homeAvg: 0,
                awayAvg: 0,
                totalAvg: 0
            },
            scoringPatterns: {
                homeFirstGoalRate: 0,
                awayFirstGoalRate: 0,
                homeLateGoalRate: 0,
                awayLateGoalRate: 0,
                homeBttsRate: 0,
                awayBttsRate: 0
            },
            reasonsForPrediction: []
        };
    }

    // Process recent matches for each team
    const homeRecentMatches = processRecentMatches(homeTeam.recentMatches);
    const awayRecentMatches = processRecentMatches(awayTeam.recentMatches);

    const homeTeamData = {
        ...homeTeam,
        name: enhancedCleanTeamName(homeTeam.name),
        isHomeTeam: true,
        opponentName: awayTeam.name,
        avgHomeGoals: safeNumber(homeTeam.averageGoalsScored),
        avgAwayGoals: safeNumber(homeTeam.averageGoalsScored),
        avgTotalGoals: safeNumber(homeTeam.avgTotalGoals),
        recentMatches: homeRecentMatches
    };

    const awayTeamData = {
        ...awayTeam,
        name: enhancedCleanTeamName(awayTeam.name),
        isHomeTeam: false,
        opponentName: homeTeam.name,
        avgHomeGoals: safeNumber(awayTeam.averageGoalsScored),
        avgAwayGoals: safeNumber(awayTeam.averageGoalsScored),
        avgTotalGoals: safeNumber(awayTeam.avgTotalGoals),
        recentMatches: awayRecentMatches
    };

    // Process head-to-head recent matches
    const headToHead = isUpcomingMatch(match) ? match.headToHead || {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        recentMatches: []
    } : {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        recentMatches: []
    };

    // Ensure proper typing of recentMatches in headToHead
    if (headToHead && headToHead.recentMatches) {
        headToHead.recentMatches = processRecentMatches(headToHead.recentMatches);
    }

    return {
        id: String(match.id),
        homeTeam: homeTeamData as Team,
        awayTeam: awayTeamData as Team,
        date: normalizedDate,
        time: normalizedTime,
        venue: isUpcomingMatch(match) ? match.venue : 'TBD',
        positionGap: isUpcomingMatch(match) ? safeNumber(match.positionGap) : 0,
        favorite: isUpcomingMatch(match) ? match.favorite : null,
        confidenceScore: isUpcomingMatch(match) ? safeNumber(match.confidenceScore) : 0,
        averageGoals: isUpcomingMatch(match) ? safeNumber(match.averageGoals) : 0,
        expectedGoals: isUpcomingMatch(match) ? safeNumber(match.expectedGoals) : 0,
        defensiveStrength: isUpcomingMatch(match) ? safeNumber(match.defensiveStrength) : 0,
        headToHead,
        odds: isUpcomingMatch(match) ? match.odds || {
            homeWin: 0,
            draw: 0,
            awayWin: 0,
            over15Goals: 0,
            under15Goals: 0,
            over25Goals: 0,
            under25Goals: 0,
            bttsYes: 0,
            bttsNo: 0
        } : {
            homeWin: 0,
            draw: 0,
            awayWin: 0,
            over15Goals: 0,
            under15Goals: 0,
            over25Goals: 0,
            under25Goals: 0,
            bttsYes: 0,
            bttsNo: 0
        },
        cornerStats: isUpcomingMatch(match) ? match.cornerStats || {
            homeAvg: 0,
            awayAvg: 0,
            totalAvg: 0
        } : {
            homeAvg: 0,
            awayAvg: 0,
            totalAvg: 0
        },
        scoringPatterns: isUpcomingMatch(match) ? match.scoringPatterns || {
            homeFirstGoalRate: 0,
            awayFirstGoalRate: 0,
            homeLateGoalRate: 0,
            awayLateGoalRate: 0,
            homeBttsRate: 0,
            awayBttsRate: 0
        } : {
            homeFirstGoalRate: 0,
            awayFirstGoalRate: 0,
            homeLateGoalRate: 0,
            awayLateGoalRate: 0,
            homeBttsRate: 0,
            awayBttsRate: 0
        },
        reasonsForPrediction: isUpcomingMatch(match) ? match.reasonsForPrediction || [] : []
    };
};

// Helper function to convert played time string to seconds
const getPlayedSeconds = (playedTime: string): number => {
    if (!playedTime) return 0;
    const [minutes, seconds] = playedTime.split(':').map(Number);
    return (minutes * 60) + (seconds || 0);
};

export const useMatchData = () => {
    const [matches, setMatches] = useState<TransformedMatch[]>([]);
    const [allLiveMatches, setAllLiveMatches] = useState<TransformedMatch[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const connectionRef = useRef<HubConnection | null>(null);
    const latestMatchesRef = useRef<Map<string, TransformedMatch>>(new Map());
    const latestAllMatchesRef = useRef<Map<string, TransformedMatch>>(new Map());
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

    // Add a buffer for pending updates to ensure complete batches
    const pendingUpdatesRef = useRef<{
        arbitrage: Map<string, TransformedMatch>;
        all: Map<string, TransformedMatch>;
        lastArbitrageSize: number;
        lastAllSize: number;
        processingTimeout: NodeJS.Timeout | null;
    }>({
        arbitrage: new Map(),
        all: new Map(),
        lastArbitrageSize: 0,
        lastAllSize: 0,
        processingTimeout: null
    });

    // Track latest match lists
    const previousMatchesRef = useRef<TransformedMatch[]>([]);
    const previousAllLiveMatchesRef = useRef<TransformedMatch[]>([]);

    // Add debounce for UI updates
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get store actions
    const setPredictionData = useCartStore((state) => state.setPredictionData);
    const setIsPredictionDataLoaded = useCartStore((state) => state.setIsPredictionDataLoaded);
    const isPredictionDataLoaded = useCartStore((state) => state.isPredictionDataLoaded);
    const predictionData = useCartStore((state) => state.predictionData);

    // Process buffered updates to ensure we get complete match sets
    const processBufferedUpdates = useCallback(() => {
        const buffer = pendingUpdatesRef.current;

        // Only process if buffers have stabilized (no new data for at least 200ms)
        // This helps prevent partial updates that cause flickering
        if (buffer.arbitrage.size > 0 && buffer.arbitrage.size === buffer.lastArbitrageSize) {
            latestMatchesRef.current = new Map(buffer.arbitrage);
            buffer.arbitrage.clear();
        }

        if (buffer.all.size > 0 && buffer.all.size === buffer.lastAllSize) {
            latestAllMatchesRef.current = new Map(buffer.all);
            buffer.all.clear();
        }

        buffer.processingTimeout = null;
    }, []);

    // Schedule buffer processing
    const scheduleBufferProcessing = useCallback(() => {
        const buffer = pendingUpdatesRef.current;

        // Update size tracking for stability detection
        buffer.lastArbitrageSize = buffer.arbitrage.size;
        buffer.lastAllSize = buffer.all.size;

        // Clear any existing timeout
        if (buffer.processingTimeout) {
            clearTimeout(buffer.processingTimeout);
        }

        // Schedule processing after a delay to collect more data
        buffer.processingTimeout = setTimeout(processBufferedUpdates, 200);
    }, [processBufferedUpdates]);

    // Stability-optimized state updater with improved reference preservation
    const stableUpdateMatches = useCallback((newMatches: Map<string, TransformedMatch>, setter: React.Dispatch<React.SetStateAction<TransformedMatch[]>>, previousRef: React.MutableRefObject<TransformedMatch[]>) => {
        // Bail out if we have no data or are in the middle of a previous update
        if (newMatches.size === 0) return;

        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
            // First, check if we have too few matches - this could indicate a partial update
            // If we previously had more than 5 matches and now have drastically fewer, delay the update
            if (previousRef.current.length > 5 && newMatches.size < previousRef.current.length / 2) {
                console.log(`Delaying update due to match count drop: ${previousRef.current.length} -> ${newMatches.size}`);
                // Try again in 300ms to see if we get more matches
                updateTimeoutRef.current = setTimeout(() => {
                    stableUpdateMatches(newMatches, setter, previousRef);
                }, 300);
                return;
            }

            const currentValues = Array.from(newMatches.values());

            // Preserve existing structure as much as possible
            if (previousRef.current.length > 0) {
                // Create a map of the previous state for quick lookups
                const previousMap = new Map(
                    previousRef.current.map(match => [match.id, match])
                );

                // Create new array maintaining order of previous matches where possible
                const stableMatches: TransformedMatch[] = [];

                // First add all matches that existed before (preserving their order)
                previousRef.current.forEach(prevMatch => {
                    const updatedMatch = newMatches.get(prevMatch.id);
                    if (updatedMatch) {
                        // Create a merged match that preserves references for React reconciliation
                        const mergedMatch = {
                            ...prevMatch,  // Start with previous match to maintain reference stability
                            // Update critical data that should change
                            status: updatedMatch.status,
                            playedSeconds: updatedMatch.playedSeconds,
                            score: updatedMatch.score,
                            matchDetails: updatedMatch.matchDetails,
                            matchSituation: updatedMatch.matchSituation,
                            // Add headToHead data if available
                            headToHead: updatedMatch.headToHead,
                            // Deep merge teams to maintain reference stability for team objects
                            teams: {
                                home: {
                                    ...prevMatch.teams.home,
                                    // Only update position if it has changed
                                    position: updatedMatch.teams.home.position !== prevMatch.teams.home.position
                                        ? updatedMatch.teams.home.position
                                        : prevMatch.teams.home.position,
                                    // Add recent matches if available
                                    recentMatches: updatedMatch.teams.home.recentMatches || prevMatch.teams.home.recentMatches
                                },
                                away: {
                                    ...prevMatch.teams.away,
                                    // Only update position if it has changed
                                    position: updatedMatch.teams.away.position !== prevMatch.teams.away.position
                                        ? updatedMatch.teams.away.position
                                        : prevMatch.teams.away.position,
                                    // Add recent matches if available
                                    recentMatches: updatedMatch.teams.away.recentMatches || prevMatch.teams.away.recentMatches
                                }
                            },
                            // Deep merge markets to maintain stability while updating odds
                            markets: updatedMatch.markets.map(newMarket => {
                                const prevMarket = prevMatch.markets.find(m => m.id === newMarket.id);
                                if (prevMarket) {
                                    return {
                                        ...prevMarket,
                                        profitPercentage: newMarket.profitPercentage,
                                        margin: newMarket.margin,
                                        favourite: newMarket.favourite,
                                        outcomes: newMarket.outcomes.map(newOutcome => {
                                            const prevOutcome = prevMarket.outcomes.find(o => o.id === newOutcome.id);
                                            if (prevOutcome) {
                                                // Mark as changed if odds are different
                                                const isChanged = prevOutcome.odds !== newOutcome.odds;
                                                return {
                                                    ...prevOutcome,
                                                    odds: newOutcome.odds,
                                                    stakePercentage: newOutcome.stakePercentage,
                                                    isChanged,
                                                };
                                            }
                                            return newOutcome;
                                        })
                                    };
                                }
                                return newMarket;
                            })
                        };

                        stableMatches.push(mergedMatch as TransformedMatch);
                        // Remove from map to track which ones are new
                        newMatches.delete(prevMatch.id);
                    } else if (previousRef.current.length > newMatches.size && previousMap.has(prevMatch.id)) {
                        // If we're getting fewer matches than before, preserve missing matches
                        // to prevent the "disappearing matches" problem
                        stableMatches.push(prevMatch);
                    }
                });

                // Add any new matches that weren't in the previous state
                Array.from(newMatches.values()).forEach(match => {
                    stableMatches.push(match);
                });

                // Only update if we have a reasonable number of matches
                // This prevents flickering from temporary partial data
                if (stableMatches.length > 0) {
                    const originalCount = previousRef.current.length;
                    const newCount = stableMatches.length;

                    // Don't update if matches suddenly dropped dramatically (likely a temporary glitch)
                    if (originalCount < 3 || newCount >= originalCount / 2) {
                        // Update with the stable array that preserves object references
                        previousRef.current = stableMatches;
                        setter(stableMatches);
                    } else {
                        console.log(`Skipping update due to match count drop: ${originalCount} -> ${newCount}`);
                    }
                }
            } else {
                // First load, just use the current values
                // But only if we have a reasonable number of matches
                if (currentValues.length > 0) {
                    previousRef.current = currentValues;
                    setter(currentValues);
                }
            }
        }, 150);  // Increase debounce time to batch multiple rapid updates better
    }, []);

    // Add effect to smoothly update the UI when data changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (latestMatchesRef.current.size > 0) {
                stableUpdateMatches(
                    latestMatchesRef.current,
                    setMatches,
                    previousMatchesRef
                );
            }

            if (latestAllMatchesRef.current.size > 0) {
                stableUpdateMatches(
                    latestAllMatchesRef.current,
                    setAllLiveMatches,
                    previousAllLiveMatchesRef
                );
            }
        }, 1000); // Increase update interval to 1000ms for more stability

        return () => {
            clearInterval(interval);
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [stableUpdateMatches]);

    // Update the SignalR connection handlers to use the buffer
    useEffect(() => {
        let isMounted = true;
        if (typeof window === 'undefined') return;

        const startConnection = async () => {
            try {
                const connection = new HubConnectionBuilder()
                    .withUrl('https://fredapi-5da7cd50ded2.herokuapp.com/livematchhub')
                    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
                    .build();

                connection.onreconnecting(() => {
                    console.log('Attempting to reconnect...');
                    setIsConnected(false);
                });

                connection.onreconnected(() => {
                    console.log('Reconnected successfully');
                    setIsConnected(true);
                });

                // Handle prediction data
                connection.on('ReceivePredictionData', (data: PredictionDataResponse) => {
                    if (data?.data?.upcomingMatches) {
                        const processedMatches = data.data.upcomingMatches.map(processMatchData);
                        setPredictionData(processedMatches);
                        setIsPredictionDataLoaded(true);
                    }
                });

                // Handle arbitrage matches with buffering
                connection.on('ReceiveArbitrageLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        // Add to the pending updates buffer instead of immediately processing
                        const buffer = pendingUpdatesRef.current;

                        // Process each match from the SignalR data
                        data.forEach(match => {
                            // Transform the match data
                            const transformedMatch = transformMatch(match);

            // Ensure we're using the latest match time
            transformedMatch.matchTime = match.playedTime || '';
            transformedMatch.playedSeconds = getPlayedSeconds(match.playedTime || '0:00');

            // Add recent matches if available
            if (match.teams?.home?.recentMatches) {
                transformedMatch.teams.home.recentMatches = processRecentMatches(match.teams.home.recentMatches);
            }
            if (match.teams?.away?.recentMatches) {
                transformedMatch.teams.away.recentMatches = processRecentMatches(match.teams.away.recentMatches);
            }

            // Add headToHead data if available
            if (match.headToHead) {
                transformedMatch.headToHead = {
                    ...match.headToHead,
                    recentMatches: processRecentMatches(match.headToHead.recentMatches)
                };
            }

            // Add to the buffer
            buffer.arbitrage.set(match.id, transformedMatch);
        });

                        // Schedule processing after collecting more data
                        scheduleBufferProcessing();

                        // Update the last update timestamp
                        setLastUpdate(Date.now());
                    }
                });

                // Handle all live matches with buffering
                connection.on('ReceiveAllLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        // Add to the pending updates buffer instead of immediately processing
                        const buffer = pendingUpdatesRef.current;

                        // Process each match from the SignalR data
                        data.forEach(match => {
                            // Transform the match data
                            const transformedMatch = transformMatch(match);

            // Ensure we're using the latest match time
            transformedMatch.matchTime = match.playedTime || '';
            transformedMatch.playedSeconds = getPlayedSeconds(match.playedTime || '0:00');

            // Add recent matches if available
            if (match.teams?.home?.recentMatches) {
                transformedMatch.teams.home.recentMatches = processRecentMatches(match.teams.home.recentMatches);
            }
            if (match.teams?.away?.recentMatches) {
                transformedMatch.teams.away.recentMatches = processRecentMatches(match.teams.away.recentMatches);
            }

            // Add headToHead data if available
            if (match.headToHead) {
                transformedMatch.headToHead = {
                    ...match.headToHead,
                    recentMatches: processRecentMatches(match.headToHead.recentMatches)
                };
            }

            // Add to the buffer
            buffer.all.set(match.id, transformedMatch);
        });

                        // Schedule processing after collecting more data
                        scheduleBufferProcessing();

                        // Update the last update timestamp
                        setLastUpdate(Date.now());
                    }
                });

                await connection.start();
                connectionRef.current = connection;
                if (isMounted) {
                    setIsConnected(true);
                }
            } catch (error) {
                console.error('Failed to connect:', error);
                if (isMounted) {
                    setTimeout(startConnection, 5000);
                }
            }
        };

        startConnection();

        return () => {
            isMounted = false;
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            if (pendingUpdatesRef.current.processingTimeout) {
                clearTimeout(pendingUpdatesRef.current.processingTimeout);
            }
        };
    }, [isPaused, setPredictionData, setIsPredictionDataLoaded, isPredictionDataLoaded, predictionData, scheduleBufferProcessing]);

    const togglePause = () => setIsPaused(prev => !prev);

    return {
        matches,
        allLiveMatches,
        isConnected,
        isPaused,
        togglePause,
        lastUpdate
    };
};