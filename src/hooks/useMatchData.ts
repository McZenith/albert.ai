import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useCartStore } from './useStore';
import { ClientMatch, TransformedMatch, Match, UpcomingMatch, Team } from '@/types/match';
import { transformMatch, findPredictionForMatch } from '@/utils/matchUtils';

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

// Process match data
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

    const homeTeamData = {
        ...homeTeam,
        name: enhancedCleanTeamName(homeTeam.name),
        isHomeTeam: true,
        opponentName: awayTeam.name,
        avgHomeGoals: safeNumber(homeTeam.homeAverageGoalsScored) ||
            safeNumber(homeTeam.averageGoalsScored) ||
            safeNumber(homeTeam.avgHomeGoals),
        avgAwayGoals: safeNumber(homeTeam.awayAverageGoalsScored) ||
            safeNumber(homeTeam.averageGoalsScored) ||
            safeNumber(homeTeam.avgAwayGoals),
        avgTotalGoals: safeNumber(homeTeam.avgTotalGoals)
    };

    const awayTeamData = {
        ...awayTeam,
        name: enhancedCleanTeamName(awayTeam.name),
        isHomeTeam: false,
        opponentName: homeTeam.name,
        avgHomeGoals: safeNumber(awayTeam.homeAverageGoalsScored) ||
            safeNumber(awayTeam.averageGoalsScored) ||
            safeNumber(awayTeam.avgHomeGoals),
        avgAwayGoals: safeNumber(awayTeam.awayAverageGoalsScored) ||
            safeNumber(awayTeam.averageGoalsScored) ||
            safeNumber(awayTeam.avgAwayGoals),
        avgTotalGoals: safeNumber(awayTeam.avgTotalGoals)
    };

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
        headToHead: isUpcomingMatch(match) ? match.headToHead || {
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
        },
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
    const [allMatchesChecked, setAllMatchesChecked] = useState(false);
    const lastPredictionDataLengthRef = useRef<number>(0);
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

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

    // Stability-optimized state updater
    const stableUpdateMatches = useCallback((newMatches: Map<string, TransformedMatch>, setter: React.Dispatch<React.SetStateAction<TransformedMatch[]>>, previousRef: React.MutableRefObject<TransformedMatch[]>) => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
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
                        // Preserve component state using a stable reference
                        stableMatches.push({
                            ...updatedMatch,
                            // Inherit these properties (internal UI properties) from previous match
                            // to keep UI stable when updating
                            playedSeconds: updatedMatch.playedSeconds, // Use new time value
                            score: updatedMatch.score, // Use new score
                            // Let React see this as the "same" object for UI stability
                            teams: {
                                ...updatedMatch.teams,
                                home: {
                                    ...updatedMatch.teams.home,
                                    // name stabilization (only relevant for React keys)
                                    name: prevMatch.teams.home.name === updatedMatch.teams.home.name
                                        ? prevMatch.teams.home.name
                                        : updatedMatch.teams.home.name,
                                },
                                away: {
                                    ...updatedMatch.teams.away,
                                    // name stabilization (only relevant for React keys)
                                    name: prevMatch.teams.away.name === updatedMatch.teams.away.name
                                        ? prevMatch.teams.away.name
                                        : updatedMatch.teams.away.name,
                                }
                            }
                        });
                        // Remove from map to track which ones are new
                        newMatches.delete(prevMatch.id);
                    }
                });

                // Add any new matches that weren't in the previous state
                currentValues.forEach(match => {
                    if (!previousMap.has(match.id)) {
                        stableMatches.push(match);
                    }
                });

                // Update with the stable array that preserves object references
                previousRef.current = stableMatches;
                setter(stableMatches);
            } else {
                // First load, just use the current values
                previousRef.current = currentValues;
                setter(currentValues);
            }
        }, 50);  // Small debounce to batch multiple rapid updates
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
        }, 500); // Update every 500ms

        return () => {
            clearInterval(interval);
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [stableUpdateMatches]);

    // Add a new useEffect to check all existing matches when prediction data first loads or updates
    useEffect(() => {
        const hasPredictionDataChanged = predictionData.length !== lastPredictionDataLengthRef.current;

        if (isPredictionDataLoaded && predictionData.length > 0 &&
            (!allMatchesChecked || hasPredictionDataChanged) &&
            matches.length > 0) {

            const checkAllExistingMatches = () => {
                let matchesWithPredictions = 0;

                matches.forEach(match => {
                    const prediction = findPredictionForMatch(
                        match.teams.home.name,
                        match.teams.away.name,
                        match.id,
                        predictionData
                    );

                    if (prediction) {
                        matchesWithPredictions++;
                    }
                });

                lastPredictionDataLengthRef.current = predictionData.length;

                if (matchesWithPredictions === matches.length || allMatchesChecked) {
                    setAllMatchesChecked(true);
                }
            };

            setTimeout(checkAllExistingMatches, 100);
        }
    }, [isPredictionDataLoaded, predictionData, matches, allMatchesChecked]);

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

                // Handle arbitrage matches
                connection.on('ReceiveArbitrageLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        // Create a new map to store the latest matches
                        const newMatchesMap = new Map<string, TransformedMatch>();

                        // Process each match from the SignalR data
                        data.forEach(match => {
                            // Transform the match data
                            const transformedMatch = transformMatch(match);

                            // Ensure we're using the latest match time
                            transformedMatch.matchTime = match.playedTime || '';
                            transformedMatch.playedSeconds = getPlayedSeconds(match.playedTime || '0:00');

                            // Add to the new map
                            newMatchesMap.set(match.id, transformedMatch);
                        });

                        // Update the ref with the new data
                        latestMatchesRef.current = newMatchesMap;

                        // Let the interval handle the update for smoother UI
                        // This prevents mid-render updates that can cause UI jacking

                        // Update the last update timestamp
                        setLastUpdate(Date.now());
                    }
                });

                // Handle all live matches
                connection.on('ReceiveAllLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        // Create a new map to store the latest matches
                        const newMatchesMap = new Map<string, TransformedMatch>();

                        // Process each match from the SignalR data
                        data.forEach(match => {
                            // Transform the match data
                            const transformedMatch = transformMatch(match);

                            // Ensure we're using the latest match time
                            transformedMatch.matchTime = match.playedTime || '';
                            transformedMatch.playedSeconds = getPlayedSeconds(match.playedTime || '0:00');

                            // Add to the new map
                            newMatchesMap.set(match.id, transformedMatch);
                        });

                        // Update the ref with the new data
                        latestAllMatchesRef.current = newMatchesMap;

                        // Let the interval handle the update for smoother UI
                        // This prevents mid-render updates that can cause UI jacking

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
        };
    }, [isPaused, setPredictionData, setIsPredictionDataLoaded, isPredictionDataLoaded, predictionData]);

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