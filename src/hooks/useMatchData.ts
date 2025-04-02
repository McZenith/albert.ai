import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useCartStore } from './useStore';
import { ClientMatch, TransformedMatch, Match } from '@/types/match';
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
const safeNumber = (value: unknown): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

// Process match data
const processMatchData = (match: Match) => {
    const normalizedTime = normalizeTimeFormat(match.time);

    const homeTeamData = {
        ...match.homeTeam,
        name: enhancedCleanTeamName(match.homeTeam.name),
        avgHomeGoals: safeNumber(match.homeTeam.homeAverageGoalsScored) ||
            safeNumber(match.homeTeam.averageGoalsScored) ||
            safeNumber(match.homeTeam.avgHomeGoals),
        avgAwayGoals: safeNumber(match.homeTeam.awayAverageGoalsScored) ||
            safeNumber(match.homeTeam.averageGoalsScored) ||
            safeNumber(match.homeTeam.avgAwayGoals),
        avgTotalGoals: safeNumber(match.homeTeam.avgTotalGoals),
    };

    const awayTeamData = {
        ...match.awayTeam,
        name: enhancedCleanTeamName(match.awayTeam.name),
        avgHomeGoals: safeNumber(match.awayTeam.homeAverageGoalsScored) ||
            safeNumber(match.awayTeam.averageGoalsScored) ||
            safeNumber(match.awayTeam.avgHomeGoals),
        avgAwayGoals: safeNumber(match.awayTeam.awayAverageGoalsScored) ||
            safeNumber(match.awayTeam.averageGoalsScored) ||
            safeNumber(match.awayTeam.avgAwayGoals),
        avgTotalGoals: safeNumber(match.awayTeam.avgTotalGoals),
    };

    return {
        ...match,
        time: normalizedTime,
        homeTeam: homeTeamData,
        awayTeam: awayTeamData,
    };
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

    // Get store actions
    const setPredictionData = useCartStore((state) => state.setPredictionData);
    const setIsPredictionDataLoaded = useCartStore((state) => state.setIsPredictionDataLoaded);
    const isPredictionDataLoaded = useCartStore((state) => state.isPredictionDataLoaded);
    const predictionData = useCartStore((state) => state.predictionData);

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
                    console.log('Received prediction data:', data);
                    if (data?.data?.upcomingMatches) {
                        const processedMatches = data.data.upcomingMatches.map(processMatchData);
                        setPredictionData(processedMatches);
                        setIsPredictionDataLoaded(true);
                    }
                });

                // Handle arbitrage matches
                connection.on('ReceiveArbitrageLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        const newMatchesMap = new Map(data.map(match => [match.id, transformMatch(match)]));

                        // Check for any new matches that weren't in our previous state
                        if (isPredictionDataLoaded && predictionData.length > 0) {
                            const checkNewMatchesForPredictions = () => {
                                data.forEach(match => {
                                    const matchId = match.id;
                                    const isNewMatch = !latestMatchesRef.current.has(matchId);

                                    if (isNewMatch) {
                                        console.log(`New match detected: ${match.teams.home.name} vs ${match.teams.away.name} (ID: ${matchId})`);

                                        const prediction = findPredictionForMatch(
                                            match.teams.home.name,
                                            match.teams.away.name,
                                            matchId,
                                            predictionData
                                        );

                                        if (prediction) {
                                            console.log(`✅ Found prediction for new match: ${match.teams.home.name} vs ${match.teams.away.name}`);
                                        } else {
                                            console.log(`❌ No prediction found for new match: ${match.teams.home.name} vs ${match.teams.away.name}`);
                                            setAllMatchesChecked(false);
                                        }
                                    }
                                });
                            };

                            setTimeout(checkNewMatchesForPredictions, 10);
                        }

                        const updatedMatches = data.map(newMatch => {
                            const existingMatch = latestMatchesRef.current.get(newMatch.id);
                            const transformedMatch = transformMatch(newMatch);

                            if (existingMatch) {
                                // Preserve the isChanged state for outcomes
                                transformedMatch.markets = transformedMatch.markets.map((market, marketIndex) => ({
                                    ...market,
                                    outcomes: market.outcomes.map((outcome, outcomeIndex) => ({
                                        ...outcome,
                                        isChanged: existingMatch.markets[marketIndex]?.outcomes[outcomeIndex]?.odds !== outcome.odds
                                    }))
                                }));
                            }

                            return transformedMatch;
                        });

                        latestMatchesRef.current = newMatchesMap;
                        setMatches(updatedMatches);
                    }
                });

                // Handle all live matches
                connection.on('ReceiveAllLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        const newMatchesMap = new Map(data.map(match => [match.id, transformMatch(match)]));

                        const updatedMatches = data.map(newMatch => {
                            const existingMatch = latestAllMatchesRef.current.get(newMatch.id);
                            const transformedMatch = transformMatch(newMatch);

                            if (existingMatch) {
                                // Preserve the isChanged state for outcomes
                                transformedMatch.markets = transformedMatch.markets.map((market, marketIndex) => ({
                                    ...market,
                                    outcomes: market.outcomes.map((outcome, outcomeIndex) => ({
                                        ...outcome,
                                        isChanged: existingMatch.markets[marketIndex]?.outcomes[outcomeIndex]?.odds !== outcome.odds
                                    }))
                                }));
                            }

                            return transformedMatch;
                        });

                        latestAllMatchesRef.current = newMatchesMap;
                        setAllLiveMatches(updatedMatches);
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
        };
    }, [isPaused, setPredictionData, setIsPredictionDataLoaded, isPredictionDataLoaded, predictionData]);

    const togglePause = () => setIsPaused(prev => !prev);

    return {
        matches,
        allLiveMatches,
        isConnected,
        isPaused,
        togglePause
    };
};