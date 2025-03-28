declare namespace API {
    interface Team {
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
        cleanSheets: number;
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
    }

    interface HeadToHead {
        matches: number;
        wins: number;
        draws: number;
        losses: number;
        goalsScored: number;
        goalsConceded: number;
        recentMatches?: {
            date: string;
            result: string;
        }[];
    }

    interface Odds {
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

    interface CornerStats {
        homeAvg: number;
        awayAvg: number;
        totalAvg: number;
    }

    interface ScoringPatterns {
        homeFirstGoalRate: number;
        awayFirstGoalRate: number;
        homeLateGoalRate: number;
        awayLateGoalRate: number;
    }

    interface Match {
        id: number;
        homeTeam: Team;
        awayTeam: Team;
        date: string;
        time: string;
        venue: string;
        positionGap: number;
        favorite: 'home' | 'away' | null;
        confidenceScore: number;
        averageGoals: number;
        expectedGoals: number;
        defensiveStrength: number;
        headToHead: HeadToHead;
        odds?: Odds;
        cornerStats?: CornerStats;
        scoringPatterns?: ScoringPatterns;
        reasonsForPrediction: string[];
    }

    interface LeagueData {
        matches: number;
        totalGoals: number;
        homeWinRate: number;
        drawRate: number;
        awayWinRate: number;
        bttsRate: number;
    }

    interface PredictionResponse {
        upcomingMatches: Match[];
        metadata: {
            total: number;
            date: string;
            leagueData: Record<string, LeagueData>;
        };
    }
} 