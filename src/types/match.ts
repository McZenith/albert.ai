export interface ClientTeam {
    id: string;
    name: string;
}

export interface ClientTeams {
    home: ClientTeam;
    away: ClientTeam;
}

export interface ClientOutcome {
    id: string;
    description: string;
    odds: number;
    stakePercentage: number;
    isChanged?: boolean;
}

export interface ClientMarket {
    id: string;
    description: string;
    specifier: string;
    profitPercentage: number;
    favourite: string;
    margin: number;
    outcomes: ClientOutcome[];
}

export interface ClientMatchSituation {
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
}

export interface ClientMatchDetails {
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
}

export interface ClientMatch {
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
    matchSituation?: ClientMatchSituation;
    matchDetails?: ClientMatchDetails;
}

export interface TransformedMatchSituation {
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
}

export interface TransformedMatchDetails {
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
}

export interface TransformedMatch {
    id: string;
    seasonId: string;
    teams: ClientTeams;
    tournamentName: string;
    status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
    playedSeconds: number;
    matchSituation?: TransformedMatchSituation;
    matchDetails?: TransformedMatchDetails;
    markets: Array<{
        id: string;
        description: string;
        specifier: string;
        favourite: string;
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