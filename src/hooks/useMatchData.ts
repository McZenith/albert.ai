import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useCartStore } from './useStore';
import { ClientMatch, TransformedMatch, Match, UpcomingMatch } from '@/types/match';
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
    const normalizedTime = normalizeTimeFormat(isClientMatch(match) ? match.playedTime : '');
    const homeTeam = getHomeTeam(match);
    const awayTeam = getAwayTeam(match);

    const defaultTeamData = {
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
        firstHalfGoalsPercent: null,
        secondHalfGoalsPercent: null,
        avgCorners: 0,
        bttsRate: 0,
        homeBttsRate: 0,
        awayBttsRate: 0,
        lateGoalRate: 0,
        goalDistribution: {
            '0-15': { total: 0, home: 0, away: 0 },
            '16-30': { total: 0, home: 0, away: 0 },
            '31-45': { total: 0, home: 0, away: 0 },
            '46-60': { total: 0, home: 0, away: 0 },
            '61-75': { total: 0, home: 0, away: 0 },
            '76-90': { total: 0, home: 0, away: 0 }
        },
        againstTopTeamsPoints: null,
        againstMidTeamsPoints: null,
        againstBottomTeamsPoints: null,
        isHomeTeam: false,
        formStrength: 0,
        formRating: 0,
        winPercentage: 0,
        drawPercentage: 0,
        homeWinPercentage: 0,
        awayWinPercentage: 0,
        cleanSheetPercentage: 0,
        averageGoalsScored: 0,
        averageGoalsConceded: 0,
        homeAverageGoalsScored: 0,
        homeAverageGoalsConceded: 0,
        awayAverageGoalsScored: 0,
        awayAverageGoalsConceded: 0,
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
    };

    if (!homeTeam || !awayTeam) {
        console.warn('Missing team data for match:', match.id);
        return {
            id: String(match.id),
            homeTeam: defaultTeamData,
            awayTeam: defaultTeamData,
            date: new Date().toISOString(),
            time: '',
            venue: 'TBD',
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
        ...defaultTeamData,
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
        avgTotalGoals: safeNumber(homeTeam.avgTotalGoals),
    };

    const awayTeamData = {
        ...defaultTeamData,
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
        avgTotalGoals: safeNumber(awayTeam.avgTotalGoals),
    };

    return {
        id: String(match.id),
        homeTeam: homeTeamData,
        awayTeam: awayTeamData,
        date: isUpcomingMatch(match) ? match.date : new Date().toISOString(),
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
                    setIsConnected(false);
                });

                connection.onreconnected(() => {
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
                        const transformedMatches = data.map(match => {
                            const existingMatch = latestMatchesRef.current.get(match.id);
                            const transformedMatch = transformMatch(match);

                            if (existingMatch) {
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

                        // Update refs and state
                        latestMatchesRef.current = new Map(transformedMatches.map(match => [match.id, match]));
                        setMatches(transformedMatches);
                    }
                });

                // Handle all live matches
                connection.on('ReceiveAllLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        const transformedMatches = data.map(match => {
                            const existingMatch = latestAllMatchesRef.current.get(match.id);
                            const transformedMatch = transformMatch(match);

                            if (existingMatch) {
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

                        // Update refs and state
                        latestAllMatchesRef.current = new Map(transformedMatches.map(match => [match.id, match]));
                        setAllLiveMatches(transformedMatches);
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