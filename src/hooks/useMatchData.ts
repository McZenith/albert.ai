import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useCartStore } from './useStore';

// Updated interfaces to match server models
interface ClientTeam {
    id: string;
    name: string;
}

interface ClientTeams {
    home: ClientTeam;
    away: ClientTeam;
}

interface ClientOutcome {
    id: string;
    description: string;
    odds: number;
    stakePercentage: number;
    isChanged?: boolean;
}

interface ClientMarket {
    id: string;
    description: string;
    specifier: string;
    margin: number;
    favourite: string;
    profitPercentage: number;
    outcomes: ClientOutcome[];
}

interface ClientMatch {
    id: string;
    seasonId: string;
    teams: ClientTeams;
    tournamentName: string;
    score: string;
    period: string;
    matchStatus: string;
    playedTime: string;
    markets: ClientMarket[];
    lastUpdated: string;
    matchSituation?: {
        totalTime: string;
        dominantTeam: string;
        matchMomentum: string;
        home: {
            totalAttacks: string;
            totalDangerousAttacks: string;
            totalSafeAttacks: string;
            totalAttackCount: string;
            totalDangerousCount: string;
            totalSafeCount: string;
            attackPercentage: string;
            dangerousAttackPercentage: string;
            safeAttackPercentage: string;
        };
        away: {
            totalAttacks: string;
            totalDangerousAttacks: string;
            totalSafeAttacks: string;
            totalAttackCount: string;
            totalDangerousCount: string;
            totalSafeCount: string;
            attackPercentage: string;
            dangerousAttackPercentage: string;
            safeAttackPercentage: string;
        };
    };
    matchDetails?: {
        home: {
            yellowCards: string;
            redCards: string;
            freeKicks: string;
            goalKicks: string;
            throwIns: string;
            offsides: string;
            cornerKicks: string;
            shotsOnTarget: string;
            shotsOffTarget: string;
            saves: string;
            fouls: string;
            injuries: string;
            dangerousAttacks: string;
            ballSafe: string;
            totalAttacks: string;
            goalAttempts: string;
            ballSafePercentage: string;
            attackPercentage: string;
            dangerousAttackPercentage: string;
        };
        away: {
            yellowCards: string;
            redCards: string;
            freeKicks: string;
            goalKicks: string;
            throwIns: string;
            offsides: string;
            cornerKicks: string;
            shotsOnTarget: string;
            shotsOffTarget: string;
            saves: string;
            fouls: string;
            injuries: string;
            dangerousAttacks: string;
            ballSafe: string;
            totalAttacks: string;
            goalAttempts: string;
            ballSafePercentage: string;
            attackPercentage: string;
            dangerousAttackPercentage: string;
        };
        types: string[];
    };
}

interface TransformedMatch {
    id: string;
    seasonId: string;
    teams: ClientTeams;
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
    score: string;
    createdAt: string;
    matchTime: string;
}

export const useMatchData = () => {
    const [matches, setMatches] = useState<ClientMatch[]>([]);
    const [allLiveMatches, setAllLiveMatches] = useState<ClientMatch[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const connectionRef = useRef<HubConnection | null>(null);
    const latestMatchesRef = useRef<Map<string, ClientMatch>>(new Map());
    const latestAllMatchesRef = useRef<Map<string, ClientMatch>>(new Map());
    const [allMatchesChecked, setAllMatchesChecked] = useState(false);
    const lastPredictionDataLengthRef = useRef<number>(0);

    // Get findPredictionForMatch function from the store
    const findPredictionForMatch = useCartStore((state) => state.findPredictionForMatch);
    const isPredictionDataLoaded = useCartStore((state) => state.isPredictionDataLoaded);
    const predictionData = useCartStore((state) => state.predictionData);

    // Transform server match status and time to UI format
    const transformMatchStatus = (match: ClientMatch): { status: 'FT' | '1H' | '2H' | 'HT' | 'NS'; playedSeconds: number } => {
        const timeComponents = match.playedTime?.split(':').map(Number) || [0, 0];
        const playedSeconds = timeComponents.length === 2 ? timeComponents[0] * 60 + timeComponents[1] : 0;

        let status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
        const matchStatus = match.matchStatus?.toLowerCase() || '';

        switch (matchStatus) {
            case 'h1':
            case '1h':
            case 'first_half':
            case '1st half':
                status = '1H';
                break;
            case 'h2':
            case '2h':
            case 'second_half':
            case '2nd half':
                status = '2H';
                break;
            case 'ht':
            case 'half_time':
            case 'half time':
                status = 'HT';
                break;
            case 'ft':
            case 'finished':
            case 'full_time':
                status = 'FT';
                break;
            default:
                status = 'NS';
        }

        return { status, playedSeconds };
    };

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
                        match.id
                    );

                    if (prediction) {
                        matchesWithPredictions++;
                    } else {
                        const trimmedHomeTeam = match.teams.home.name.trim();
                        const trimmedAwayTeam = match.teams.away.name.trim();

                        if (trimmedHomeTeam !== match.teams.home.name || trimmedAwayTeam !== match.teams.away.name) {
                            const predictionWithTrimmed = findPredictionForMatch(
                                trimmedHomeTeam,
                                trimmedAwayTeam,
                                match.id
                            );

                            if (predictionWithTrimmed) {
                                matchesWithPredictions++;
                            }
                        }
                    }
                });

                lastPredictionDataLengthRef.current = predictionData.length;

                if (matchesWithPredictions === matches.length || allMatchesChecked) {
                    setAllMatchesChecked(true);
                }
            };

            setTimeout(checkAllExistingMatches, 100);
        }
    }, [isPredictionDataLoaded, predictionData, matches, allMatchesChecked, findPredictionForMatch]);

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

                // Handle arbitrage matches
                connection.on('ReceiveArbitrageLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        const newMatchesMap = new Map(data.map(match => [match.id, match]));

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
                                            matchId
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

                            const processedMarkets = newMatch.markets.map(newMarket => {
                                const existingMarket = existingMatch?.markets.find(m => m.id === newMarket.id);

                                return {
                                    ...newMarket,
                                    outcomes: newMarket.outcomes.map(newOutcome => {
                                        const existingOutcome = existingMarket?.outcomes.find(o => o.id === newOutcome.id);
                                        return {
                                            ...newOutcome,
                                            isChanged: existingOutcome
                                                ? newOutcome.odds !== existingOutcome.odds
                                                : false
                                        };
                                    })
                                };
                            });

                            return {
                                ...newMatch,
                                markets: processedMarkets
                            };
                        });

                        latestMatchesRef.current = newMatchesMap;
                        setMatches(updatedMatches);
                    }
                });

                // Handle all live matches
                connection.on('ReceiveAllLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        const newMatchesMap = new Map(data.map(match => [match.id, match]));

                        const updatedMatches = data.map(newMatch => {
                            const existingMatch = latestAllMatchesRef.current.get(newMatch.id);

                            const processedMarkets = newMatch.markets.map(newMarket => {
                                const existingMarket = existingMatch?.markets.find(m => m.id === newMarket.id);

                                return {
                                    ...newMarket,
                                    outcomes: newMarket.outcomes.map(newOutcome => {
                                        const existingOutcome = existingMarket?.outcomes.find(o => o.id === newOutcome.id);
                                        return {
                                            ...newOutcome,
                                            isChanged: existingOutcome
                                                ? newOutcome.odds !== existingOutcome.odds
                                                : false
                                        };
                                    })
                                };
                            });

                            return {
                                ...newMatch,
                                markets: processedMarkets
                            };
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
    }, [isPaused, findPredictionForMatch, isPredictionDataLoaded, predictionData.length]);

    // Transform matches to UI format
    const transformedMatches: TransformedMatch[] = matches.map(match => {
        console.log('Raw match data:', match); // Debug log

        const transformedMatch = {
            id: match.id,
            seasonId: match.seasonId,
            teams: match.teams,
            tournamentName: match.tournamentName,
            ...transformMatchStatus(match),
            matchSituation: match.matchSituation ? {
                totalTime: Number(match.matchSituation.totalTime) || 0,
                dominantTeam: match.matchSituation.dominantTeam,
                matchMomentum: match.matchSituation.matchMomentum,
                home: {
                    totalAttacks: Number(match.matchSituation.home.totalAttacks) || 0,
                    totalDangerousAttacks: Number(match.matchSituation.home.totalDangerousAttacks) || 0,
                    totalSafeAttacks: Number(match.matchSituation.home.totalSafeAttacks) || 0,
                    totalAttackCount: Number(match.matchSituation.home.totalAttackCount) || 0,
                    totalDangerousCount: Number(match.matchSituation.home.totalDangerousCount) || 0,
                    totalSafeCount: Number(match.matchSituation.home.totalSafeCount) || 0,
                    attackPercentage: Number(match.matchSituation.home.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchSituation.home.dangerousAttackPercentage) || 0,
                    safeAttackPercentage: Number(match.matchSituation.home.safeAttackPercentage) || 0
                },
                away: {
                    totalAttacks: Number(match.matchSituation.away.totalAttacks) || 0,
                    totalDangerousAttacks: Number(match.matchSituation.away.totalDangerousAttacks) || 0,
                    totalSafeAttacks: Number(match.matchSituation.away.totalSafeAttacks) || 0,
                    totalAttackCount: Number(match.matchSituation.away.totalAttackCount) || 0,
                    totalDangerousCount: Number(match.matchSituation.away.totalDangerousCount) || 0,
                    totalSafeCount: Number(match.matchSituation.away.totalSafeCount) || 0,
                    attackPercentage: Number(match.matchSituation.away.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchSituation.away.dangerousAttackPercentage) || 0,
                    safeAttackPercentage: Number(match.matchSituation.away.safeAttackPercentage) || 0
                }
            } : undefined,
            matchDetails: match.matchDetails ? {
                home: {
                    yellowCards: Number(match.matchDetails.home.yellowCards) || 0,
                    redCards: Number(match.matchDetails.home.redCards) || 0,
                    freeKicks: Number(match.matchDetails.home.freeKicks) || 0,
                    goalKicks: Number(match.matchDetails.home.goalKicks) || 0,
                    throwIns: Number(match.matchDetails.home.throwIns) || 0,
                    offsides: Number(match.matchDetails.home.offsides) || 0,
                    cornerKicks: Number(match.matchDetails.home.cornerKicks) || 0,
                    shotsOnTarget: Number(match.matchDetails.home.shotsOnTarget) || 0,
                    shotsOffTarget: Number(match.matchDetails.home.shotsOffTarget) || 0,
                    saves: Number(match.matchDetails.home.saves) || 0,
                    fouls: Number(match.matchDetails.home.fouls) || 0,
                    injuries: Number(match.matchDetails.home.injuries) || 0,
                    dangerousAttacks: Number(match.matchDetails.home.dangerousAttacks) || 0,
                    ballSafe: Number(match.matchDetails.home.ballSafe) || 0,
                    totalAttacks: Number(match.matchDetails.home.totalAttacks) || 0,
                    goalAttempts: Number(match.matchDetails.home.goalAttempts) || 0,
                    ballSafePercentage: Number(match.matchDetails.home.ballSafePercentage) || 0,
                    attackPercentage: Number(match.matchDetails.home.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchDetails.home.dangerousAttackPercentage) || 0
                },
                away: {
                    yellowCards: Number(match.matchDetails.away.yellowCards) || 0,
                    redCards: Number(match.matchDetails.away.redCards) || 0,
                    freeKicks: Number(match.matchDetails.away.freeKicks) || 0,
                    goalKicks: Number(match.matchDetails.away.goalKicks) || 0,
                    throwIns: Number(match.matchDetails.away.throwIns) || 0,
                    offsides: Number(match.matchDetails.away.offsides) || 0,
                    cornerKicks: Number(match.matchDetails.away.cornerKicks) || 0,
                    shotsOnTarget: Number(match.matchDetails.away.shotsOnTarget) || 0,
                    shotsOffTarget: Number(match.matchDetails.away.shotsOffTarget) || 0,
                    saves: Number(match.matchDetails.away.saves) || 0,
                    fouls: Number(match.matchDetails.away.fouls) || 0,
                    injuries: Number(match.matchDetails.away.injuries) || 0,
                    dangerousAttacks: Number(match.matchDetails.away.dangerousAttacks) || 0,
                    ballSafe: Number(match.matchDetails.away.ballSafe) || 0,
                    totalAttacks: Number(match.matchDetails.away.totalAttacks) || 0,
                    goalAttempts: Number(match.matchDetails.away.goalAttempts) || 0,
                    ballSafePercentage: Number(match.matchDetails.away.ballSafePercentage) || 0,
                    attackPercentage: Number(match.matchDetails.away.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchDetails.away.dangerousAttackPercentage) || 0
                },
                types: match.matchDetails.types
            } : undefined,
            markets: match.markets.map(market => ({
                id: market.id,
                description: market.description,
                specifier: market.specifier,
                favourite: market.favourite,
                profitPercentage: Number(market.profitPercentage) || 0,
                margin: Number(market.margin) || 0,
                outcomes: market.outcomes.map(outcome => ({
                    id: outcome.id,
                    description: outcome.description,
                    odds: Number(outcome.odds) || 0,
                    stakePercentage: Number(outcome.stakePercentage) || 0,
                    isChanged: outcome.isChanged
                }))
            })),
            score: match.score,
            createdAt: match.lastUpdated,
            matchTime: match.lastUpdated
        };

        console.log('Transformed match data:', transformedMatch); // Debug log
        return transformedMatch;
    });

    // Transform all live matches to UI format with the same careful number handling
    const transformedAllLiveMatches: TransformedMatch[] = allLiveMatches.map(match => {
        console.log('Raw all live match data:', match); // Debug log

        const transformedMatch = {
            id: match.id,
            seasonId: match.seasonId,
            teams: match.teams,
            tournamentName: match.tournamentName,
            ...transformMatchStatus(match),
            matchSituation: match.matchSituation ? {
                totalTime: Number(match.matchSituation.totalTime) || 0,
                dominantTeam: match.matchSituation.dominantTeam,
                matchMomentum: match.matchSituation.matchMomentum,
                home: {
                    totalAttacks: Number(match.matchSituation.home.totalAttacks) || 0,
                    totalDangerousAttacks: Number(match.matchSituation.home.totalDangerousAttacks) || 0,
                    totalSafeAttacks: Number(match.matchSituation.home.totalSafeAttacks) || 0,
                    totalAttackCount: Number(match.matchSituation.home.totalAttackCount) || 0,
                    totalDangerousCount: Number(match.matchSituation.home.totalDangerousCount) || 0,
                    totalSafeCount: Number(match.matchSituation.home.totalSafeCount) || 0,
                    attackPercentage: Number(match.matchSituation.home.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchSituation.home.dangerousAttackPercentage) || 0,
                    safeAttackPercentage: Number(match.matchSituation.home.safeAttackPercentage) || 0
                },
                away: {
                    totalAttacks: Number(match.matchSituation.away.totalAttacks) || 0,
                    totalDangerousAttacks: Number(match.matchSituation.away.totalDangerousAttacks) || 0,
                    totalSafeAttacks: Number(match.matchSituation.away.totalSafeAttacks) || 0,
                    totalAttackCount: Number(match.matchSituation.away.totalAttackCount) || 0,
                    totalDangerousCount: Number(match.matchSituation.away.totalDangerousCount) || 0,
                    totalSafeCount: Number(match.matchSituation.away.totalSafeCount) || 0,
                    attackPercentage: Number(match.matchSituation.away.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchSituation.away.dangerousAttackPercentage) || 0,
                    safeAttackPercentage: Number(match.matchSituation.away.safeAttackPercentage) || 0
                }
            } : undefined,
            matchDetails: match.matchDetails ? {
                home: {
                    yellowCards: Number(match.matchDetails.home.yellowCards) || 0,
                    redCards: Number(match.matchDetails.home.redCards) || 0,
                    freeKicks: Number(match.matchDetails.home.freeKicks) || 0,
                    goalKicks: Number(match.matchDetails.home.goalKicks) || 0,
                    throwIns: Number(match.matchDetails.home.throwIns) || 0,
                    offsides: Number(match.matchDetails.home.offsides) || 0,
                    cornerKicks: Number(match.matchDetails.home.cornerKicks) || 0,
                    shotsOnTarget: Number(match.matchDetails.home.shotsOnTarget) || 0,
                    shotsOffTarget: Number(match.matchDetails.home.shotsOffTarget) || 0,
                    saves: Number(match.matchDetails.home.saves) || 0,
                    fouls: Number(match.matchDetails.home.fouls) || 0,
                    injuries: Number(match.matchDetails.home.injuries) || 0,
                    dangerousAttacks: Number(match.matchDetails.home.dangerousAttacks) || 0,
                    ballSafe: Number(match.matchDetails.home.ballSafe) || 0,
                    totalAttacks: Number(match.matchDetails.home.totalAttacks) || 0,
                    goalAttempts: Number(match.matchDetails.home.goalAttempts) || 0,
                    ballSafePercentage: Number(match.matchDetails.home.ballSafePercentage) || 0,
                    attackPercentage: Number(match.matchDetails.home.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchDetails.home.dangerousAttackPercentage) || 0
                },
                away: {
                    yellowCards: Number(match.matchDetails.away.yellowCards) || 0,
                    redCards: Number(match.matchDetails.away.redCards) || 0,
                    freeKicks: Number(match.matchDetails.away.freeKicks) || 0,
                    goalKicks: Number(match.matchDetails.away.goalKicks) || 0,
                    throwIns: Number(match.matchDetails.away.throwIns) || 0,
                    offsides: Number(match.matchDetails.away.offsides) || 0,
                    cornerKicks: Number(match.matchDetails.away.cornerKicks) || 0,
                    shotsOnTarget: Number(match.matchDetails.away.shotsOnTarget) || 0,
                    shotsOffTarget: Number(match.matchDetails.away.shotsOffTarget) || 0,
                    saves: Number(match.matchDetails.away.saves) || 0,
                    fouls: Number(match.matchDetails.away.fouls) || 0,
                    injuries: Number(match.matchDetails.away.injuries) || 0,
                    dangerousAttacks: Number(match.matchDetails.away.dangerousAttacks) || 0,
                    ballSafe: Number(match.matchDetails.away.ballSafe) || 0,
                    totalAttacks: Number(match.matchDetails.away.totalAttacks) || 0,
                    goalAttempts: Number(match.matchDetails.away.goalAttempts) || 0,
                    ballSafePercentage: Number(match.matchDetails.away.ballSafePercentage) || 0,
                    attackPercentage: Number(match.matchDetails.away.attackPercentage) || 0,
                    dangerousAttackPercentage: Number(match.matchDetails.away.dangerousAttackPercentage) || 0
                },
                types: match.matchDetails.types
            } : undefined,
            markets: match.markets.map(market => ({
                id: market.id,
                description: market.description,
                specifier: market.specifier,
                favourite: market.favourite,
                profitPercentage: Number(market.profitPercentage) || 0,
                margin: Number(market.margin) || 0,
                outcomes: market.outcomes.map(outcome => ({
                    id: outcome.id,
                    description: outcome.description,
                    odds: Number(outcome.odds) || 0,
                    stakePercentage: Number(outcome.stakePercentage) || 0,
                    isChanged: outcome.isChanged
                }))
            })),
            score: match.score,
            createdAt: match.lastUpdated,
            matchTime: match.lastUpdated
        };

        console.log('Transformed all live match data:', transformedMatch); // Debug log
        return transformedMatch;
    });

    const togglePause = () => setIsPaused(prev => !prev);

    return {
        matches: transformedMatches,
        allLiveMatches: transformedAllLiveMatches,
        isConnected,
        isPaused,
        togglePause
    };
};