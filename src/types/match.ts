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

export interface UpcomingMatch {
    id: string | number;
    date: string;
    time: string;
    venue: string;
    homeTeam: {
        id: string;
        name: string;
        position: number;
        form: string;
        homeForm?: string;
        avgHomeGoals?: number;
        cleanSheets?: number;
        homeAverageGoalsScored?: number;
        averageGoalsScored?: number;
        awayAverageGoalsScored?: number;
        avgAwayGoals?: number;
        avgTotalGoals?: number;
        bttsRate?: number;
        homeBttsRate?: number;
        awayBttsRate?: number;
        lateGoalRate?: number;
        homeAverageGoalsConceded?: number;
        awayAverageGoalsConceded?: number;
        averageGoalsConceded?: number;
        goalDistribution?: {
            '0-15': number;
            '16-30': number;
            '31-45': number;
            '46-60': number;
            '61-75': number;
            '76-90': number;
        };
        againstTopTeamsPoints?: number;
        againstMidTeamsPoints?: number;
        againstBottomTeamsPoints?: number;
    };
    awayTeam: {
        id: string;
        name: string;
        position: number;
        form: string;
        awayForm?: string;
        avgAwayGoals?: number;
        cleanSheets?: number;
        homeAverageGoalsScored?: number;
        averageGoalsScored?: number;
        awayAverageGoalsScored?: number;
        avgHomeGoals?: number;
        avgTotalGoals?: number;
        bttsRate?: number;
        homeBttsRate?: number;
        awayBttsRate?: number;
        lateGoalRate?: number;
        homeAverageGoalsConceded?: number;
        awayAverageGoalsConceded?: number;
        averageGoalsConceded?: number;
        goalDistribution?: {
            '0-15': number;
            '16-30': number;
            '31-45': number;
            '46-60': number;
            '61-75': number;
            '76-90': number;
        };
        againstTopTeamsPoints?: number;
        againstMidTeamsPoints?: number;
        againstBottomTeamsPoints?: number;
    };
    positionGap: number;
    expectedGoals: number;
    averageGoals?: number;
    defensiveStrength?: number;
    favorite: string | null;
    confidenceScore: number;
    leaguePosition?: number;
    reasonsForPrediction?: string[];
    headToHead?: {
        matches: number;
        wins: number;
        draws: number;
        losses: number;
        goalsScored: number;
        goalsConceded: number;
    };
    odds?: {
        homeWin: number;
        draw: number;
        awayWin: number;
        over15Goals: number;
        under15Goals: number;
    };
    cornerStats?: {
        home: {
            average: number;
            total: number;
        };
        away: {
            average: number;
            total: number;
        };
    };
    scoringPatterns?: {
        home: {
            firstGoalRate: number;
            lateGoalRate: number;
            bttsRate: number;
        };
        away: {
            firstGoalRate: number;
            lateGoalRate: number;
            bttsRate: number;
        };
    };
}

export interface Team {
    id: string;
    name: string;
    position: number;
    form: string;
    homeForm?: string;
    awayForm?: string;
    avgHomeGoals?: number;
    avgAwayGoals?: number;
    avgTotalGoals?: number;
    cleanSheets?: number;
    homeCleanSheets?: number;
    awayCleanSheets?: number;
    homeAverageGoalsScored?: number;
    awayAverageGoalsScored?: number;
    averageGoalsScored?: number;
    homeAverageGoalsConceded?: number;
    awayAverageGoalsConceded?: number;
    averageGoalsConceded?: number;
    scoringFirstWinRate?: number;
    concedingFirstWinRate?: number;
    firstHalfGoalsPercent?: number;
    secondHalfGoalsPercent?: number;
    avgCorners?: number;
    bttsRate?: number;
    homeBttsRate?: number;
    awayBttsRate?: number;
    lateGoalRate?: number;
    goalDistribution?: {
        '0-15': number;
        '16-30': number;
        '31-45': number;
        '46-60': number;
        '61-75': number;
        '76-90': number;
    };
    againstTopTeamsPoints?: number;
    againstMidTeamsPoints?: number;
    againstBottomTeamsPoints?: number;
    logo?: string;
    over05: number;
    over15: number;
    over25: number;
    over35: number;
    over45: number;
    cleanSheetRate?: number;
    cornerStats?: {
        avgCorners: number;
        avgCornersFor: number;
        avgCornersAgainst: number;
    };
    scoringStats?: {
        avgGoalsScored: number;
        avgGoalsConceded: number;
        avgTotalGoals: number;
    };
    patterns?: {
        btts: number;
        over15: number;
        over25: number;
        over35: number;
    };
}

export interface Match {
    id: string | number;
    homeTeam: {
        id: string;
        name: string;
        position: number;
        logo: string;
        avgHomeGoals?: number;
        avgAwayGoals?: number;
        avgTotalGoals: number;
        homeMatchesOver15?: number;
        awayMatchesOver15?: number;
        totalHomeMatches?: number;
        totalAwayMatches?: number;
        form: string;
        homeForm?: string;
        awayForm?: string;
        cleanSheets?: number;
        homeCleanSheets?: number;
        awayCleanSheets?: number;
        scoringFirstWinRate?: number;
        concedingFirstWinRate?: number;
        firstHalfGoalsPercent?: number;
        secondHalfGoalsPercent?: number;
        avgCorners?: number;
        bttsRate?: number;
        homeBttsRate?: number;
        awayBttsRate?: number;
        lateGoalRate?: number;
        homeAverageGoalsScored?: number;
        awayAverageGoalsScored?: number;
        averageGoalsScored?: number;
        homeAverageGoalsConceded?: number;
        awayAverageGoalsConceded?: number;
        averageGoalsConceded?: number;
        goalDistribution?: {
            '0-15': number;
            '16-30': number;
            '31-45': number;
            '46-60': number;
            '61-75': number;
            '76-90': number;
        };
        againstTopTeamsPoints?: number;
        againstMidTeamsPoints?: number;
        againstBottomTeamsPoints?: number;
    };
    awayTeam: {
        id: string;
        name: string;
        position: number;
        logo: string;
        avgHomeGoals?: number;
        avgAwayGoals?: number;
        avgTotalGoals: number;
        homeMatchesOver15?: number;
        awayMatchesOver15?: number;
        totalHomeMatches?: number;
        totalAwayMatches?: number;
        form: string;
        homeForm?: string;
        awayForm?: string;
        cleanSheets?: number;
        homeCleanSheets?: number;
        awayCleanSheets?: number;
        scoringFirstWinRate?: number;
        concedingFirstWinRate?: number;
        firstHalfGoalsPercent?: number;
        secondHalfGoalsPercent?: number;
        avgCorners?: number;
        bttsRate?: number;
        homeBttsRate?: number;
        awayBttsRate?: number;
        lateGoalRate?: number;
        homeAverageGoalsScored?: number;
        awayAverageGoalsScored?: number;
        averageGoalsScored?: number;
        homeAverageGoalsConceded?: number;
        awayAverageGoalsConceded?: number;
        averageGoalsConceded?: number;
        goalDistribution?: {
            '0-15': number;
            '16-30': number;
            '31-45': number;
            '46-60': number;
            '61-75': number;
            '76-90': number;
        };
        againstTopTeamsPoints?: number;
        againstMidTeamsPoints?: number;
        againstBottomTeamsPoints?: number;
    };
    date: string;
    time: string;
    venue: string;
    positionGap: number;
    favorite: 'home' | 'away' | null;
    confidenceScore: number;
    averageGoals: number;
    expectedGoals: number;
    defensiveStrength: number;
    headToHead: {
        matches: number;
        wins: number;
        draws: number;
        losses: number;
        goalsScored: number;
        goalsConceded: number;
        recentMatches: any[];
    };
    odds: {
        homeWin: number;
        draw: number;
        awayWin: number;
        over15Goals: number;
        under15Goals: number;
    };
    cornerStats: {
        home: {
            average: number;
            total: number;
        };
        away: {
            average: number;
            total: number;
        };
    };
    scoringPatterns: {
        home: {
            firstGoalRate: number;
            lateGoalRate: number;
            bttsRate: number;
        };
        away: {
            firstGoalRate: number;
            lateGoalRate: number;
            bttsRate: number;
        };
    };
    reasonsForPrediction: string[];
} 