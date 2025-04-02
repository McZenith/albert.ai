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
        logo: string;
        avgHomeGoals: number;
        avgAwayGoals: number;
        avgTotalGoals: number;
        homeMatchesOver15: number;
        awayMatchesOver15: number;
        totalHomeMatches: number;
        totalAwayMatches: number;
        form: string;
        homeForm: string;
        awayForm: string;
        cleanSheets: number;
        homeCleanSheets: number;
        awayCleanSheets: number;
        scoringFirstWinRate: number;
        concedingFirstWinRate: number;
        firstHalfGoalsPercent: number | null;
        secondHalfGoalsPercent: number | null;
        avgCorners: number;
        bttsRate: number;
        homeBttsRate: number;
        awayBttsRate: number;
        lateGoalRate: number;
        goalDistribution: {
            '0-15': { total: number; home: number; away: number };
            '16-30': { total: number; home: number; away: number };
            '31-45': { total: number; home: number; away: number };
            '46-60': { total: number; home: number; away: number };
            '61-75': { total: number; home: number; away: number };
            '76-90': { total: number; home: number; away: number };
        };
        againstTopTeamsPoints: number | null;
        againstMidTeamsPoints: number | null;
        againstBottomTeamsPoints: number | null;
        isHomeTeam: boolean;
        formStrength: number;
        formRating: number;
        winPercentage: number;
        homeWinPercentage: number;
        awayWinPercentage: number;
        cleanSheetPercentage: number;
        averageGoalsScored: number;
        averageGoalsConceded: number;
        homeAverageGoalsScored: number;
        homeAverageGoalsConceded: number;
        awayAverageGoalsScored: number;
        awayAverageGoalsConceded: number;
        goalsScoredAverage: number;
        goalsConcededAverage: number;
        averageCorners: number;
        avgOdds: number;
        leagueAvgGoals: number;
        possession: number;
        opponentName: string;
        totalHomeWins: number;
        totalAwayWins: number;
        totalHomeDraws: number;
        totalAwayDraws: number;
        totalHomeLosses: number;
        totalAwayLosses: number;
    };
    awayTeam: {
        id: string;
        name: string;
        position: number;
        logo: string;
        avgHomeGoals: number;
        avgAwayGoals: number;
        avgTotalGoals: number;
        homeMatchesOver15: number;
        awayMatchesOver15: number;
        totalHomeMatches: number;
        totalAwayMatches: number;
        form: string;
        homeForm: string;
        awayForm: string;
        cleanSheets: number;
        homeCleanSheets: number;
        awayCleanSheets: number;
        scoringFirstWinRate: number;
        concedingFirstWinRate: number;
        firstHalfGoalsPercent: number | null;
        secondHalfGoalsPercent: number | null;
        avgCorners: number;
        bttsRate: number;
        homeBttsRate: number;
        awayBttsRate: number;
        lateGoalRate: number;
        goalDistribution: {
            '0-15': { total: number; home: number; away: number };
            '16-30': { total: number; home: number; away: number };
            '31-45': { total: number; home: number; away: number };
            '46-60': { total: number; home: number; away: number };
            '61-75': { total: number; home: number; away: number };
            '76-90': { total: number; home: number; away: number };
        };
        againstTopTeamsPoints: number | null;
        againstMidTeamsPoints: number | null;
        againstBottomTeamsPoints: number | null;
        isHomeTeam: boolean;
        formStrength: number;
        formRating: number;
        winPercentage: number;
        homeWinPercentage: number;
        awayWinPercentage: number;
        cleanSheetPercentage: number;
        averageGoalsScored: number;
        averageGoalsConceded: number;
        homeAverageGoalsScored: number;
        homeAverageGoalsConceded: number;
        awayAverageGoalsScored: number;
        awayAverageGoalsConceded: number;
        goalsScoredAverage: number;
        goalsConcededAverage: number;
        averageCorners: number;
        avgOdds: number;
        leagueAvgGoals: number;
        possession: number;
        opponentName: string;
        totalHomeWins: number;
        totalAwayWins: number;
        totalHomeDraws: number;
        totalAwayDraws: number;
        totalHomeLosses: number;
        totalAwayLosses: number;
    };
    positionGap: number;
    favorite: 'home' | 'away' | null;
    confidenceScore: number;
    averageGoals: number;
    expectedGoals: number;
    defensiveStrength: number;
    odds: {
        homeWin: number;
        draw: number;
        awayWin: number;
        over15Goals: number;
        under15Goals: number;
        over25Goals: number;
        under25Goals: number;
        bttsYes: number;
        bttsNo: number;
    };
    headToHead: {
        matches: number;
        wins: number;
        draws: number;
        losses: number;
        goalsScored: number;
        goalsConceded: number;
        recentMatches: Array<{
            date: string;
            result: string;
        }>;
    };
    cornerStats: {
        homeAvg: number;
        awayAvg: number;
        totalAvg: number;
    };
    scoringPatterns: {
        homeFirstGoalRate: number;
        awayFirstGoalRate: number;
        homeLateGoalRate: number;
        awayLateGoalRate: number;
    };
    reasonsForPrediction: string[];
}

export interface Team {
    id: string;
    name: string;
    position: number;
    logo: string;
    avgHomeGoals: number;
    avgAwayGoals: number;
    avgTotalGoals: number;
    homeMatchesOver15: number;
    awayMatchesOver15: number;
    totalHomeMatches: number;
    totalAwayMatches: number;
    form: string;
    homeForm: string;
    awayForm: string;
    cleanSheets: number;
    homeCleanSheets: number;
    awayCleanSheets: number;
    scoringFirstWinRate: number;
    concedingFirstWinRate: number;
    firstHalfGoalsPercent: number | null;
    secondHalfGoalsPercent: number | null;
    avgCorners: number;
    bttsRate: number;
    homeBttsRate: number;
    awayBttsRate: number;
    lateGoalRate: number;
    goalDistribution: {
        '0-15': { total: number; home: number; away: number };
        '16-30': { total: number; home: number; away: number };
        '31-45': { total: number; home: number; away: number };
        '46-60': { total: number; home: number; away: number };
        '61-75': { total: number; home: number; away: number };
        '76-90': { total: number; home: number; away: number };
    };
    againstTopTeamsPoints: number | null;
    againstMidTeamsPoints: number | null;
    againstBottomTeamsPoints: number | null;
    isHomeTeam: boolean;
    formStrength: number;
    formRating: number;
    winPercentage: number;
    drawPercentage: number;
    homeWinPercentage: number;
    awayWinPercentage: number;
    cleanSheetPercentage: number;
    averageGoalsScored: number;
    averageGoalsConceded: number;
    homeAverageGoalsScored: number;
    homeAverageGoalsConceded: number;
    awayAverageGoalsScored: number;
    awayAverageGoalsConceded: number;
    goalsScoredAverage: number;
    goalsConcededAverage: number;
    averageCorners: number;
    avgOdds: number;
    leagueAvgGoals: number;
    possession: number;
    opponentName: string;
    totalHomeWins: number;
    totalAwayWins: number;
    totalHomeDraws: number;
    totalAwayDraws: number;
    totalHomeLosses: number;
    totalAwayLosses: number;
    over05: number;
    over15: number;
    over25: number;
    over35: number;
    over45: number;
    cleanSheetRate: number;
    cornerStats: {
        avgCorners: number;
        avgCornersFor: number;
        avgCornersAgainst: number;
    };
    scoringStats: {
        avgGoalsScored: number;
        avgGoalsConceded: number;
        avgTotalGoals: number;
    };
    patterns: {
        btts: number;
        over15: number;
        over25: number;
        over35: number;
    };
}

export type Match = UpcomingMatch | ClientMatch; 