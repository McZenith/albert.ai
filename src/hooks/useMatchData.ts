import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

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
}

interface TransformedMatch {
    id: string;
    seasonId: string;
    teams: ClientTeams;
    tournamentName: string;
    status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
    playedSeconds: number;
    markets: Array<{
        id: string;
        description: string;
        specifier: string;
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
    score: string;
    createdAt: string;
    matchTime: string;
}

export const useMatchData = () => {
    const [matches, setMatches] = useState<ClientMatch[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const connectionRef = useRef<HubConnection | null>(null);
    const latestMatchesRef = useRef<Map<string, ClientMatch>>(new Map());

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

    useEffect(() => {
        let isMounted = true;
        if (typeof window === 'undefined') return;

        const startConnection = async () => {
            try {
                const connection = new HubConnectionBuilder()
                    .withUrl('https://fredapi-5da7cd50ded2.herokuapp.com/livematchhub')
                    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Progressive retry intervals
                    .build();

                connection.onreconnecting(() => {
                    console.log('Attempting to reconnect...');
                    setIsConnected(false);
                });

                connection.onreconnected(() => {
                    console.log('Reconnected successfully');
                    setIsConnected(true);
                });

                connection.on('ReceiveArbitrageLiveMatches', (data: ClientMatch[]) => {
                    if (!isPaused && isMounted) {
                        const newMatchesMap = new Map(data.map(match => [match.id, match]));

                        // Update our reference map for future comparisons
                        const updatedMatches = data.map(newMatch => {
                            const existingMatch = latestMatchesRef.current.get(newMatch.id);

                            // Process markets and track odds changes
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

                        // Update our reference and state
                        latestMatchesRef.current = newMatchesMap;
                        setMatches(updatedMatches);
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
    }, [isPaused]);

    // Transform matches to UI format
    const transformedMatches: TransformedMatch[] = matches.map(match => ({
        id: match.id,
        seasonId: match.seasonId,
        teams: match.teams,
        tournamentName: match.tournamentName,
        ...transformMatchStatus(match),
        markets: match.markets.map(market => ({
            id: market.id,
            description: market.description,
            specifier: market.specifier,
            profitPercentage: market.profitPercentage,
            margin: market.margin,
            outcomes: market.outcomes.map(outcome => ({
                id: outcome.id,
                description: outcome.description,
                odds: outcome.odds,
                stakePercentage: outcome.stakePercentage,
                isChanged: outcome.isChanged
            }))
        })),
        score: match.score,
        createdAt: match.lastUpdated,
        matchTime: match.lastUpdated
    }));

    const togglePause = () => setIsPaused(prev => !prev);

    return {
        matches: transformedMatches,
        isConnected,
        isPaused,
        togglePause
    };
};