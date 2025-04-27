export interface ClientTeam {
    id: string;
    name: string;
    position: number;
    homeAverageGoalsScored?: number;
    awayAverageGoalsScored?: number;
    averageGoalsScored?: number;
    avgHomeGoals?: number;
    avgAwayGoals?: number;
    avgTotalGoals?: number;
    recentMatches?: RecentMatch[]; // Added this field
    homeForm?: string;
    awayForm?: string;
    form?: string;
    winPercentage?: number;
    drawPercentage?: number;
    homeWinPercentage?: number;
    awayWinPercentage?: number;
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
    types: Record<string, string>;
}

export interface RecentMatch {
    date: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
    result: 'W' | 'D' | 'L';
}

export interface MatchStats {
    positionGap?: number;
    favorite?: 'home' | 'away' | null;
    confidenceScore?: number;
    averageGoals?: number;
    expectedGoals?: number;
    defensiveStrength?: number;
    date?: string;
    venue?: string;
    odds?: {
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
    headToHead?: HeadToHead;
    cornerStats?: {
        homeAvg: number;
        awayAvg: number;
        totalAvg: number;
    };
    scoringPatterns?: {
        homeFirstGoalRate: number;
        awayFirstGoalRate: number;
        homeLateGoalRate: number;
        awayLateGoalRate: number;
    };
    reasonsForPrediction?: string[];
}

export interface ClientMatch extends MatchStats {
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

export interface TeamBase {
    id: string;
    name: string;
    position: number;
    logo?: string;
    recentMatches?: RecentMatch[]; // Added this field
}

export interface Team extends ClientTeam {
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
    recentMatches?: RecentMatch[]; // Added this field
    [key: string]: unknown;
}

export interface TransformedMatch {
    id: string;
    seasonId?: number;
    teams: {
        home: TeamBase;
        away: TeamBase;
    };
    tournamentName: string;
    status: 'FT' | '1H' | '2H' | 'HT' | 'NS';
    playedSeconds: number;
    matchSituation?: TransformedMatchSituation;
    matchDetails?: TransformedMatchDetails;
    markets: Array<{
        id: string;
        description: string;
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
    homeTeam?: Team;
    awayTeam?: Team;
    headToHead?: HeadToHead; // Added to handle direct access to headToHead in TransformedMatch
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
    types: Record<string, string>;
}


export interface UpcomingMatch {
    id: string | number;
    homeTeam: Team;
    awayTeam: Team;
    date: string;
    time: string;
    venue: string;
    positionGap: number;
    favorite: 'home' | 'away' | null;
    confidenceScore: number;
    averageGoals?: number;
    expectedGoals?: number;
    defensiveStrength?: number;
    headToHead?: HeadToHead;
    odds?: MatchOdds;
    cornerStats?: CornerStats;
    scoringPatterns?: ScoringPatterns;
    reasonsForPrediction?: string[];
    [key: string]: unknown;
}

export interface MatchDetails {
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
        goalAttempts: number;
        totalAttacks: number;
        dangerousAttacks: number;
        ballSafe: number;
        attackPercentage: number;
        ballSafePercentage: number;
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
        goalAttempts: number;
        totalAttacks: number;
        dangerousAttacks: number;
        ballSafe: number;
        attackPercentage: number;
        ballSafePercentage: number;
        dangerousAttackPercentage: number;
    };
    types: Record<string, string>;
}

export interface HeadToHead {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    recentMatches: Array<{ date: string; result: string; }>;
}

export interface MatchOdds {
    homeWin: number;
    draw: number;
    awayWin: number;
    over15Goals: number;
    under15Goals: number;
    over25Goals: number;
    under25Goals: number;
    bttsYes: number;
    bttsNo: number;
}

export interface CornerStats {
    homeAvg: number;
    awayAvg: number;
    totalAvg: number;
}

export interface ScoringPatterns {
    homeFirstGoalRate: number;
    awayFirstGoalRate: number;
    homeLateGoalRate: number;
    awayLateGoalRate: number;
    homeBttsRate: number;
    awayBttsRate: number;
}

export type Match = TransformedMatch | UpcomingMatch | ClientMatch;

// Type guard to check if a match is a ClientMatch
export const isClientMatch = (match: Match): match is TransformedMatch => {
    return 'teams' in match && !('homeTeam' in match);
};

// Type guard to check if a match is an UpcomingMatch
export const isUpcomingMatch = (match: Match): match is UpcomingMatch => {
    return 'homeTeam' in match && !('teams' in match);
};; 