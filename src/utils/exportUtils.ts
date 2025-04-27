/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecentMatch } from '@/types/match';

// Helper to sanitize text for CSV
export const sanitizeForCSV = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return '';
    const stringValue = String(text);
    // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

// Safely access nested properties
export const safeGet = (obj: any, path: string, defaultValue: any = ''): any => {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : defaultValue), obj);
};

// Helper to format recent matches for CSV
const formatRecentMatches = (matches: RecentMatch[] | undefined): string => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
        return '';
    }

    // Format up to 3 most recent matches in a compact format
    return matches.slice(0, 3)
        .map(match => `${match.date}:${match.homeTeam} vs ${match.awayTeam}:${match.score}:${match.result}`)
        .join('|');
};

// Convert match data to CSV rows with recent matches
export const matchToCSV = (match: any, isUpcoming: boolean = true): string => {
    try {
        if (!match) return '';

        // Handle different match structures
        const homeTeam = match.homeTeam || (match.teams && match.teams.home) || {};
        const awayTeam = match.awayTeam || (match.teams && match.teams.away) || {};

        if (!homeTeam || !awayTeam) {
            console.error('Invalid match data structure:', match);
            return '';
        }

        // Common fields for both upcoming and live matches
        const common = [
            sanitizeForCSV(match.id),
            sanitizeForCSV(safeGet(homeTeam, 'name')),
            sanitizeForCSV(safeGet(awayTeam, 'name')),
            sanitizeForCSV(match.date || ''),
            sanitizeForCSV(match.time || match.matchTime || match.playedTime || ''),
            sanitizeForCSV(match.venue || '')
        ];

        if (isUpcoming) {
            // Fields specific to upcoming matches
            return [
                ...common,
                sanitizeForCSV(safeGet(match, 'positionGap', 0)),
                sanitizeForCSV(safeGet(match, 'favorite')),
                sanitizeForCSV(safeGet(match, 'confidenceScore', 0)),
                sanitizeForCSV(safeGet(match, 'averageGoals', 0)),
                sanitizeForCSV(safeGet(match, 'expectedGoals', 0)),
                sanitizeForCSV(safeGet(match, 'defensiveStrength', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'form', '')),
                sanitizeForCSV(safeGet(awayTeam, 'form', '')),
                sanitizeForCSV(safeGet(homeTeam, 'averageGoalsScored', safeGet(homeTeam, 'avgHomeGoals', 0))),
                sanitizeForCSV(safeGet(awayTeam, 'averageGoalsScored', safeGet(awayTeam, 'avgAwayGoals', 0))),
                sanitizeForCSV(safeGet(match, 'odds.homeWin', 0)),
                sanitizeForCSV(safeGet(match, 'odds.draw', 0)),
                sanitizeForCSV(safeGet(match, 'odds.awayWin', 0)),
                sanitizeForCSV(safeGet(match, 'odds.over15Goals', 0)),
                sanitizeForCSV(safeGet(match, 'odds.over25Goals', 0)),
                sanitizeForCSV(safeGet(match, 'odds.bttsYes', 0)),
                // Head to head info
                sanitizeForCSV(safeGet(match, 'headToHead.matches', 0)),
                sanitizeForCSV(safeGet(match, 'headToHead.wins', 0)),
                sanitizeForCSV(safeGet(match, 'headToHead.draws', 0)),
                sanitizeForCSV(safeGet(match, 'headToHead.losses', 0)),
                // Team additional stats
                sanitizeForCSV(safeGet(homeTeam, 'winPercentage', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'homeWinPercentage', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'winPercentage', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'awayWinPercentage', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'cleanSheetPercentage', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'cleanSheetPercentage', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'over15', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'over25', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'over15', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'over25', 0)),
                // Recent matches data
                sanitizeForCSV(formatRecentMatches(safeGet(homeTeam, 'recentMatches', []))),
                sanitizeForCSV(formatRecentMatches(safeGet(awayTeam, 'recentMatches', []))),
                sanitizeForCSV(formatRecentMatches(safeGet(match, 'headToHead.recentMatches', [])))
            ].join(',');
        } else {
            // Fields specific to live matches with expanded data and prediction data
            const marketInfo = match.markets && match.markets.length > 0
                ? match.markets[0] : {};

            // Get best available odds from market outcomes
            const getOdds = () => {
                if (!marketInfo.outcomes || !marketInfo.outcomes.length) return '0';
                const sortedOdds = [...marketInfo.outcomes]
                    .sort((a, b) => (b.odds || 0) - (a.odds || 0));
                return sortedOdds[0].odds || '0';
            };

            // Get all market outcomes as a string
            const getAllOutcomes = () => {
                if (!marketInfo.outcomes || !marketInfo.outcomes.length) return '';
                return marketInfo.outcomes.map((o: { description: string; odds: number | string }) =>
                    `${o.description}: ${o.odds}`
                ).join('; ');
            };

            // Extract match details for both teams
            const homeDetails = safeGet(match, 'matchDetails.home', {});
            const awayDetails = safeGet(match, 'matchDetails.away', {});
            const matchSituation = safeGet(match, 'matchSituation', {});

            // First, add the live match fields
            const liveFields = [
                ...common,
                sanitizeForCSV(safeGet(match, 'status', '')),
                sanitizeForCSV(safeGet(match, 'score', '')),
                sanitizeForCSV(safeGet(match, 'playedSeconds', 0)),
                sanitizeForCSV(safeGet(match, 'tournamentName', '')),
                sanitizeForCSV(safeGet(homeTeam, 'position', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'position', 0)),

                // Market info
                sanitizeForCSV(marketInfo.description || ''),
                sanitizeForCSV(getOdds()),
                sanitizeForCSV(marketInfo.profitPercentage || 0),
                sanitizeForCSV(marketInfo.margin || 0),
                sanitizeForCSV(marketInfo.favourite || ''),
                sanitizeForCSV(getAllOutcomes()),

                // Match details - home team
                sanitizeForCSV(safeGet(homeDetails, 'shotsOnTarget', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'shotsOffTarget', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'cornerKicks', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'yellowCards', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'redCards', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'goalAttempts', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'totalAttacks', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'dangerousAttacks', 0)),
                sanitizeForCSV(safeGet(homeDetails, 'ballSafePercentage', 0)),

                // Match details - away team
                sanitizeForCSV(safeGet(awayDetails, 'shotsOnTarget', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'shotsOffTarget', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'cornerKicks', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'yellowCards', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'redCards', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'goalAttempts', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'totalAttacks', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'dangerousAttacks', 0)),
                sanitizeForCSV(safeGet(awayDetails, 'ballSafePercentage', 0)),

                // Match situation
                sanitizeForCSV(safeGet(matchSituation, 'dominantTeam', '')),
                sanitizeForCSV(safeGet(matchSituation, 'matchMomentum', '')),
                sanitizeForCSV(safeGet(matchSituation, 'home.attackPercentage', 0)),
                sanitizeForCSV(safeGet(matchSituation, 'home.dangerousAttackPercentage', 0)),
                sanitizeForCSV(safeGet(matchSituation, 'away.attackPercentage', 0)),
                sanitizeForCSV(safeGet(matchSituation, 'away.dangerousAttackPercentage', 0))
            ];

            // Now add prediction data fields if available
            const predictionFields = [
                // Basic prediction data
                sanitizeForCSV(safeGet(match, 'positionGap', 0)),
                sanitizeForCSV(safeGet(match, 'favorite')),
                sanitizeForCSV(safeGet(match, 'confidenceScore', 0)),
                sanitizeForCSV(safeGet(match, 'averageGoals', 0)),
                sanitizeForCSV(safeGet(match, 'expectedGoals', 0)),
                sanitizeForCSV(safeGet(match, 'defensiveStrength', 0)),

                // Team forms
                sanitizeForCSV(safeGet(homeTeam, 'form', '')),
                sanitizeForCSV(safeGet(awayTeam, 'form', '')),

                // Prediction odds
                sanitizeForCSV(safeGet(match, 'odds.homeWin', 0)),
                sanitizeForCSV(safeGet(match, 'odds.draw', 0)),
                sanitizeForCSV(safeGet(match, 'odds.awayWin', 0)),
                sanitizeForCSV(safeGet(match, 'odds.over15Goals', 0)),
                sanitizeForCSV(safeGet(match, 'odds.over25Goals', 0)),
                sanitizeForCSV(safeGet(match, 'odds.bttsYes', 0)),

                // Head to head info
                sanitizeForCSV(safeGet(match, 'headToHead.matches', 0)),
                sanitizeForCSV(safeGet(match, 'headToHead.wins', 0)),
                sanitizeForCSV(safeGet(match, 'headToHead.draws', 0)),
                sanitizeForCSV(safeGet(match, 'headToHead.losses', 0)),

                // Additional team stats
                sanitizeForCSV(safeGet(homeTeam, 'winPercentage', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'homeWinPercentage', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'winPercentage', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'awayWinPercentage', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'cleanSheetPercentage', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'cleanSheetPercentage', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'over15', 0)),
                sanitizeForCSV(safeGet(homeTeam, 'over25', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'over15', 0)),
                sanitizeForCSV(safeGet(awayTeam, 'over25', 0)),

                // Recent matches data
                sanitizeForCSV(formatRecentMatches(safeGet(homeTeam, 'recentMatches', []))),
                sanitizeForCSV(formatRecentMatches(safeGet(awayTeam, 'recentMatches', []))),
                sanitizeForCSV(formatRecentMatches(safeGet(match, 'headToHead.recentMatches', []))),

                // Prediction reasons
                sanitizeForCSV(safeGet(match, 'reasonsForPrediction', []).join('; '))
            ];

            // Combine live and prediction fields
            return [...liveFields, ...predictionFields].join(',');
        }
    } catch (err) {
        console.error('Error converting match to CSV:', err);
        return '';
    }
};

// Generate CSV header
export const getCSVHeader = (isUpcoming: boolean = true): string => {
    const common = [
        'ID',
        'Home Team',
        'Away Team',
        'Date',
        'Time',
        'Venue'
    ];

    if (isUpcoming) {
        return [
            ...common,
            'Position Gap',
            'Favorite',
            'Confidence Score',
            'Average Goals',
            'Expected Goals',
            'Defensive Strength',
            'Home Team Form',
            'Away Team Form',
            'Home Avg Goals',
            'Away Avg Goals',
            'Home Win Odds',
            'Draw Odds',
            'Away Win Odds',
            'Over 1.5 Goals Odds',
            'Over 2.5 Goals Odds',
            'BTTS Yes Odds',
            'H2H Matches',
            'H2H Wins',
            'H2H Draws',
            'H2H Losses',
            'Home Win %',
            'Home Home Win %',
            'Away Win %',
            'Away Away Win %',
            'Home Clean Sheet %',
            'Away Clean Sheet %',
            'Home Over 1.5',
            'Home Over 2.5',
            'Away Over 1.5',
            'Away Over 2.5',
            'Home Recent Matches',
            'Away Recent Matches',
            'H2H Recent Matches'
        ].join(',');
    } else {
        // Create combined headers for live matches + prediction data
        const liveHeaders = [
            ...common,
            'Status',
            'Score',
            'Played Seconds',
            'Tournament',
            'Home Position',
            'Away Position',
            'Market Description',
            'Best Odds',
            'Profit Percentage',
            'Margin',
            'Favourite',
            'All Outcomes',
            'Home Shots On Target',
            'Home Shots Off Target',
            'Home Corners',
            'Home Yellow Cards',
            'Home Red Cards',
            'Home Goal Attempts',
            'Home Total Attacks',
            'Home Dangerous Attacks',
            'Home Ball Safe %',
            'Away Shots On Target',
            'Away Shots Off Target',
            'Away Corners',
            'Away Yellow Cards',
            'Away Red Cards',
            'Away Goal Attempts',
            'Away Total Attacks',
            'Away Dangerous Attacks',
            'Away Ball Safe %',
            'Dominant Team',
            'Match Momentum',
            'Home Attack %',
            'Home Dangerous Attack %',
            'Away Attack %',
            'Away Dangerous Attack %'
        ];

        // Prediction data headers
        const predictionHeaders = [
            // Prediction section header
            'Prediction: Position Gap',
            'Prediction: Favorite',
            'Prediction: Confidence Score',
            'Prediction: Average Goals',
            'Prediction: Expected Goals',
            'Prediction: Defensive Strength',
            'Prediction: Home Team Form',
            'Prediction: Away Team Form',
            'Prediction: Home Win Odds',
            'Prediction: Draw Odds',
            'Prediction: Away Win Odds',
            'Prediction: Over 1.5 Goals Odds',
            'Prediction: Over 2.5 Goals Odds',
            'Prediction: BTTS Yes Odds',
            'Prediction: H2H Matches',
            'Prediction: H2H Wins',
            'Prediction: H2H Draws',
            'Prediction: H2H Losses',
            'Prediction: Home Win %',
            'Prediction: Home Home Win %',
            'Prediction: Away Win %',
            'Prediction: Away Away Win %',
            'Prediction: Home Clean Sheet %',
            'Prediction: Away Clean Sheet %',
            'Prediction: Home Over 1.5',
            'Prediction: Home Over 2.5',
            'Prediction: Away Over 1.5',
            'Prediction: Away Over 2.5',
            'Home Recent Matches',
            'Away Recent Matches',
            'H2H Recent Matches',
            'Prediction: Reasons'
        ];

        // Combine both header sets
        return [...liveHeaders, ...predictionHeaders].join(',');
    }
};

// Export matches to CSV
export const exportMatchesToCSV = (matches: any[], isUpcoming: boolean = true, filename: string = 'matches.csv'): void => {
    try {
        if (!matches || matches.length === 0) {
            console.warn('No matches to export');
            return;
        }

        // Create CSV content
        const header = getCSVHeader(isUpcoming);
        const rows = matches.map(match => matchToCSV(match, isUpcoming)).filter(Boolean);
        const csvContent = `${header}\n${rows.join('\n')}`;

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    } catch (err) {
        console.error('Error exporting matches to CSV:', err);
        throw err;
    }
};