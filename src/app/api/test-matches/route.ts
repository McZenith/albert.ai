import { NextRequest, NextResponse } from 'next/server';

// Generate test matches for debugging the 1 PM issue
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Create test data with matches at 1 PM tomorrow
        const testData = generateTestMatches();

        return NextResponse.json({
            data: {
                upcomingMatches: testData,
                metadata: {
                    total: testData.length,
                    date: new Date().toISOString().split('T')[0],
                    leagueData: {}
                }
            }
        });
    } catch (error: any) {
        console.error('Error generating test matches:', error.message);

        return NextResponse.json(
            {
                error: 'Failed to generate test matches',
                message: error.message
            },
            { status: 500 }
        );
    }
}

// Generate test matches for 1 PM tomorrow
function generateTestMatches() {
    // Create tomorrow's date in the current year
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Generating test matches for: ${tomorrowStr}`);

    // Create 15 test matches
    return Array.from({ length: 15 }, (_, i) => {
        const id = i + 1;

        // Generate teams with adequate stats to pass filters
        const homeTeam = {
            name: `Home Team ${id}`,
            position: 3,
            logo: "🏠",
            avgHomeGoals: 2.2,
            avgAwayGoals: 1.5,
            avgTotalGoals: 2.0,
            form: "WWDWL",
            homeForm: "WWD",
            awayForm: "WL",
            cleanSheets: 3,
            homeCleanSheets: 2,
            awayCleanSheets: 1,
            bttsRate: 75
        };

        const awayTeam = {
            name: `Away Team ${id}`,
            position: 8,
            logo: "🚌",
            avgHomeGoals: 1.8,
            avgAwayGoals: 1.2,
            avgTotalGoals: 1.5,
            form: "WLDWD",
            homeForm: "WLD",
            awayForm: "WD",
            cleanSheets: 2,
            homeCleanSheets: 1,
            awayCleanSheets: 1,
            bttsRate: 65
        };

        // Create a match with high confidence and 1 PM time
        return {
            id,
            homeTeam,
            awayTeam,
            date: tomorrowStr,
            time: "13:00",
            venue: "Test Stadium",
            positionGap: 5,
            favorite: "home",
            confidenceScore: 85,
            averageGoals: 2.5,
            expectedGoals: 2.6,
            defensiveStrength: 0.95,
            headToHead: {
                matches: 5,
                wins: 3,
                draws: 1,
                losses: 1,
                goalsScored: 10,
                goalsConceded: 5
            },
            odds: {
                homeWin: 1.8,
                draw: 3.5,
                awayWin: 4.2,
                over15Goals: 1.35,
                under15Goals: 3.2,
                over25Goals: 2.1,
                under25Goals: 1.75,
                bttsYes: 1.9,
                bttsNo: 2.2
            },
            reasonsForPrediction: [
                "Strong home team scoring record",
                "Away team concedes regularly on the road",
                "Historical H2H shows high-scoring matches",
                "Both teams have good attacking form"
            ]
        };
    });
} 