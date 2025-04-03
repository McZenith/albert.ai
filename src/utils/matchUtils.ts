import { ClientMatch, TransformedMatch } from '@/types/match';
import { UpcomingMatch } from '@/types/match';

// Transform server match status and time to UI format
export const transformMatchStatus = (match: ClientMatch): { status: 'FT' | '1H' | '2H' | 'HT' | 'NS'; playedSeconds: number } => {
    // Extract minutes and seconds from the playedTime string
    const timeComponents = match.playedTime?.split(':').map(Number) || [0, 0];
    const minutes = timeComponents[0] || 0;
    const seconds = timeComponents[1] || 0;

    // Calculate total played seconds
    const playedSeconds = minutes * 60 + seconds;

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

// Transform match situation data
export const transformMatchSituation = (matchSituation: ClientMatch['matchSituation']) => {
    if (!matchSituation) {
        return undefined;
    }

    // Log incoming data
    console.log('Transforming match situation:', {
        totalTime: matchSituation.totalTime,
        dominantTeam: matchSituation.dominantTeam,
        matchMomentum: matchSituation.matchMomentum,
        home: matchSituation.home,
        away: matchSituation.away
    });

    const transformed = {
        totalTime: Number(matchSituation.totalTime) || 0,
        dominantTeam: matchSituation.dominantTeam || '',
        matchMomentum: matchSituation.matchMomentum || '',
        home: {
            totalAttacks: Number(matchSituation.home?.totalAttacks) || 0,
            totalDangerousAttacks: Number(matchSituation.home?.totalDangerousAttacks) || 0,
            totalSafeAttacks: Number(matchSituation.home?.totalSafeAttacks) || 0,
            totalAttackCount: Number(matchSituation.home?.totalAttackCount) || 0,
            totalDangerousCount: Number(matchSituation.home?.totalDangerousCount) || 0,
            totalSafeCount: Number(matchSituation.home?.totalSafeCount) || 0,
            attackPercentage: Number(matchSituation.home?.attackPercentage) || 0,
            dangerousAttackPercentage: Number(matchSituation.home?.dangerousAttackPercentage) || 0,
            safeAttackPercentage: Number(matchSituation.home?.safeAttackPercentage) || 0
        },
        away: {
            totalAttacks: Number(matchSituation.away?.totalAttacks) || 0,
            totalDangerousAttacks: Number(matchSituation.away?.totalDangerousAttacks) || 0,
            totalSafeAttacks: Number(matchSituation.away?.totalSafeAttacks) || 0,
            totalAttackCount: Number(matchSituation.away?.totalAttackCount) || 0,
            totalDangerousCount: Number(matchSituation.away?.totalDangerousCount) || 0,
            totalSafeCount: Number(matchSituation.away?.totalSafeCount) || 0,
            attackPercentage: Number(matchSituation.away?.attackPercentage) || 0,
            dangerousAttackPercentage: Number(matchSituation.away?.dangerousAttackPercentage) || 0,
            safeAttackPercentage: Number(matchSituation.away?.safeAttackPercentage) || 0
        }
    };

    // Log transformed data
    console.log('Transformed match situation:', transformed);

    return transformed;
};

// Transform match details data
export const transformMatchDetails = (matchDetails: ClientMatch['matchDetails']) => {
    if (!matchDetails) {
        return undefined;
    }

    // Log incoming data
    console.log('Transforming match details:', {
        home: matchDetails.home,
        away: matchDetails.away,
        types: matchDetails.types
    });

    const transformed = {
        home: {
            yellowCards: Number(matchDetails.home?.yellowCards) || 0,
            redCards: Number(matchDetails.home?.redCards) || 0,
            freeKicks: Number(matchDetails.home?.freeKicks) || 0,
            goalKicks: Number(matchDetails.home?.goalKicks) || 0,
            throwIns: Number(matchDetails.home?.throwIns) || 0,
            offsides: Number(matchDetails.home?.offsides) || 0,
            cornerKicks: Number(matchDetails.home?.cornerKicks) || 0,
            shotsOnTarget: Number(matchDetails.home?.shotsOnTarget) || 0,
            shotsOffTarget: Number(matchDetails.home?.shotsOffTarget) || 0,
            saves: Number(matchDetails.home?.saves) || 0,
            fouls: Number(matchDetails.home?.fouls) || 0,
            injuries: Number(matchDetails.home?.injuries) || 0,
            dangerousAttacks: Number(matchDetails.home?.dangerousAttacks) || 0,
            ballSafe: Number(matchDetails.home?.ballSafe) || 0,
            totalAttacks: Number(matchDetails.home?.totalAttacks) || 0,
            goalAttempts: Number(matchDetails.home?.goalAttempts) || 0,
            ballSafePercentage: Number(matchDetails.home?.ballSafePercentage) || 0,
            attackPercentage: Number(matchDetails.home?.attackPercentage) || 0,
            dangerousAttackPercentage: Number(matchDetails.home?.dangerousAttackPercentage) || 0
        },
        away: {
            yellowCards: Number(matchDetails.away?.yellowCards) || 0,
            redCards: Number(matchDetails.away?.redCards) || 0,
            freeKicks: Number(matchDetails.away?.freeKicks) || 0,
            goalKicks: Number(matchDetails.away?.goalKicks) || 0,
            throwIns: Number(matchDetails.away?.throwIns) || 0,
            offsides: Number(matchDetails.away?.offsides) || 0,
            cornerKicks: Number(matchDetails.away?.cornerKicks) || 0,
            shotsOnTarget: Number(matchDetails.away?.shotsOnTarget) || 0,
            shotsOffTarget: Number(matchDetails.away?.shotsOffTarget) || 0,
            saves: Number(matchDetails.away?.saves) || 0,
            fouls: Number(matchDetails.away?.fouls) || 0,
            injuries: Number(matchDetails.away?.injuries) || 0,
            dangerousAttacks: Number(matchDetails.away?.dangerousAttacks) || 0,
            ballSafe: Number(matchDetails.away?.ballSafe) || 0,
            totalAttacks: Number(matchDetails.away?.totalAttacks) || 0,
            goalAttempts: Number(matchDetails.away?.goalAttempts) || 0,
            ballSafePercentage: Number(matchDetails.away?.ballSafePercentage) || 0,
            attackPercentage: Number(matchDetails.away?.attackPercentage) || 0,
            dangerousAttackPercentage: Number(matchDetails.away?.dangerousAttackPercentage) || 0
        },
        types: matchDetails.types || {}
    };

    // Log transformed data
    console.log('Transformed match details:', transformed);

    return transformed;
};

// Transform markets data
export const transformMarkets = (markets: ClientMatch['markets']) => {
    if (!markets) return [];

    return markets.map(market => ({
        id: market.id || '',
        description: market.description || '',
        specifier: market.specifier || '',
        favourite: market.favourite || '',
        profitPercentage: Number(market.profitPercentage) || 0,
        margin: Number(market.margin) || 0,
        outcomes: (market.outcomes || []).map(outcome => ({
            id: outcome.id || '',
            description: outcome.description || '',
            odds: Number(outcome.odds) || 0,
            stakePercentage: Number(outcome.stakePercentage) || 0,
            isChanged: outcome.isChanged || false
        }))
    }));
};

const getPlayedSeconds = (playedTime: string): number => {
    if (!playedTime) return 0;
    const [minutes, seconds = '0'] = playedTime.split(':');
    return (parseInt(minutes, 10) * 60) + parseInt(seconds, 10);
};

// Transform a single match
export const transformMatch = (match: ClientMatch): TransformedMatch => {
    if (!match) {
        throw new Error('Invalid match data');
    }

    // Transform match situation and details if they exist
    const transformedMatchSituation = match.matchSituation ? transformMatchSituation(match.matchSituation) : undefined;
    const transformedMatchDetails = match.matchDetails ? transformMatchDetails(match.matchDetails) : undefined;

    // Get status and played seconds
    const { status, playedSeconds } = transformMatchStatus(match);

    // Create transformed match
    const transformed = {
        ...match,
        seasonId: Number(match.seasonId) || 0,
        matchSituation: transformedMatchSituation,
        matchDetails: transformedMatchDetails,
        playedSeconds,
        matchTime: match.playedTime || '',
        status,
        createdAt: match.lastUpdated || new Date().toISOString()
    };

    return transformed;
};

// Helper function to normalize team names for comparison
const normalizeTeamName = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')                    // normalize spaces
        .replace(/[^\w\s]/g, '')                 // remove special characters
        .replace(/(fc|sc|sv|tsv|vfb|fsv)\s*/g, '')  // remove common prefixes/suffixes
        .replace(/\s*(i{1,3}|ii|2nd)\s*$/g, '')  // remove team numbers (I, II, III, 2nd etc)
        .replace(/\s+/g, ' ')                    // clean up any double spaces
        .trim();
};

// Find prediction for a match with improved matching logic
export const findPredictionForMatch = (
    homeTeamName: string,
    awayTeamName: string,
    matchId: string,
    predictionData: UpcomingMatch[]
): UpcomingMatch | null => {
    if (!predictionData?.length) return null;

    const normalizedHomeTeam = normalizeTeamName(homeTeamName);
    const normalizedAwayTeam = normalizeTeamName(awayTeamName);

    // Strategy 1: Direct normalized match
    let prediction = predictionData.find(p =>
        normalizeTeamName(p.homeTeam.name) === normalizedHomeTeam &&
        normalizeTeamName(p.awayTeam.name) === normalizedAwayTeam
    );
    if (prediction) return prediction;

    // Strategy 2: Partial match (for cases where one name is contained within another)
    prediction = predictionData.find(p => {
        const predHomeNorm = normalizeTeamName(p.homeTeam.name);
        const predAwayNorm = normalizeTeamName(p.awayTeam.name);

        return (predHomeNorm.includes(normalizedHomeTeam) || normalizedHomeTeam.includes(predHomeNorm)) &&
            (predAwayNorm.includes(normalizedAwayTeam) || normalizedAwayTeam.includes(predAwayNorm));
    });
    if (prediction) return prediction;

    // Strategy 3: Reversed team order with normalized names
    prediction = predictionData.find(p =>
        normalizeTeamName(p.homeTeam.name) === normalizedAwayTeam &&
        normalizeTeamName(p.awayTeam.name) === normalizedHomeTeam
    );
    if (prediction) return prediction;

    // Strategy 4: Fuzzy match for cases with slight differences
    prediction = predictionData.find(p => {
        const predHomeNorm = normalizeTeamName(p.homeTeam.name);
        const predAwayNorm = normalizeTeamName(p.awayTeam.name);

        const homeDistance = levenshteinDistance(predHomeNorm, normalizedHomeTeam);
        const awayDistance = levenshteinDistance(predAwayNorm, normalizedAwayTeam);

        // Allow for small differences (threshold of 2 characters)
        return homeDistance <= 2 && awayDistance <= 2;
    });

    return prediction || null;
};

// Helper function to calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }

    return track[str2.length][str1.length];
}; 