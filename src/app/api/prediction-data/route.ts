import { NextResponse } from 'next/server';

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
  goalDistribution?: Record<string, number>;
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
  recentMatches?: Array<{
    date: string;
    result: string;
  }>;
}

interface PredictionData {
  upcomingMatches: Array<{
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
    odds?: Record<string, number>;
    cornerStats?: Record<string, number>;
    scoringPatterns?: Record<string, number>;
    reasonsForPrediction: string[];
  }>;
  metadata: {
    total: number;
    date: string;
    leagueData: Record<string, Record<string, number>>;
  };
}

// Cache to store the data
let cachedData: PredictionData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const BASE_URL = 'https://fredapi-5da7cd50ded2.herokuapp.com/api/prediction-data';
const DEFAULT_PAGE_SIZE = 50; // Default number of items per page

const fetchAllPages = async (): Promise<PredictionData> => {
  // First try to access the API with pagination parameters
  const response = await fetch(`${BASE_URL}?page=1&pageSize=${DEFAULT_PAGE_SIZE}`, {
    next: { revalidate: CACHE_DURATION / 1000 },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Albert.ai Football Prediction App'
    }
  });

  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`);
  }

  const responseData = await response.json();

  // Check if the response has the new paginated structure
  if (responseData.data && responseData.pagination) {
    // New paginated structure detected
    let allUpcomingMatches = [...responseData.data.upcomingMatches];
    const metadata = responseData.data.metadata;
    const { totalPages, currentPage } = responseData.pagination;

    // Only fetch additional pages if there are more pages and we're on page 1
    if (totalPages > 1 && currentPage === 1) {
      const pagePromises = [];
      // Limit to 5 more pages to avoid excessive requests
      const maxPages = Math.min(totalPages, 5);

      for (let page = 2; page <= maxPages; page++) {
        pagePromises.push(
          fetch(`${BASE_URL}?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`, {
            next: { revalidate: CACHE_DURATION / 1000 },
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Albert.ai Football Prediction App'
            }
          }).then(res => {
            if (!res.ok) {
              console.error(`Error fetching page ${page}: ${res.status}`);
              return { data: { upcomingMatches: [] } };
            }
            return res.json();
          })
        );
      }

      try {
        const additionalPagesResponses = await Promise.all(pagePromises);

        // Combine all matches from all pages, ensuring proper data structure
        additionalPagesResponses.forEach(pageResponse => {
          // Extract upcomingMatches from the response
          const pageMatches = pageResponse.data?.upcomingMatches || [];

          if (Array.isArray(pageMatches)) {
            // Verify and normalize each match before adding
            const normalizedMatches = pageMatches.filter((match: any) => {
              // Verify match has required properties
              return match && match.homeTeam && match.awayTeam && match.id;
            }).map((match: any) => {
              // Ensure each match has all expected properties
              return {
                ...match,
                // Ensure all required team properties exist
                homeTeam: {
                  name: match.homeTeam.name || '',
                  position: match.homeTeam.position || 0,
                  logo: match.homeTeam.logo || '',
                  avgHomeGoals: match.homeTeam.avgHomeGoals || 0,
                  avgAwayGoals: match.homeTeam.avgAwayGoals || 0,
                  avgTotalGoals: match.homeTeam.avgTotalGoals || 0,
                  form: match.homeTeam.form || '',
                  cleanSheets: match.homeTeam.cleanSheets || 0,
                  // Add other optional properties as needed
                  ...match.homeTeam
                },
                awayTeam: {
                  name: match.awayTeam.name || '',
                  position: match.awayTeam.position || 0,
                  logo: match.awayTeam.logo || '',
                  avgHomeGoals: match.awayTeam.avgHomeGoals || 0,
                  avgAwayGoals: match.awayTeam.avgAwayGoals || 0,
                  avgTotalGoals: match.awayTeam.avgTotalGoals || 0,
                  form: match.awayTeam.form || '',
                  cleanSheets: match.awayTeam.cleanSheets || 0,
                  // Add other optional properties as needed
                  ...match.awayTeam
                },
                // Ensure other match properties
                date: match.date || '',
                time: match.time || '',
                venue: match.venue || '',
                positionGap: match.positionGap || 0,
                favorite: match.favorite || null,
                confidenceScore: match.confidenceScore || 0,
                averageGoals: match.averageGoals || 0,
                expectedGoals: match.expectedGoals || 0,
                defensiveStrength: match.defensiveStrength || 1,
                headToHead: match.headToHead || {
                  matches: 0,
                  wins: 0,
                  draws: 0,
                  losses: 0,
                  goalsScored: 0,
                  goalsConceded: 0
                },
                reasonsForPrediction: match.reasonsForPrediction || []
              };
            });

            allUpcomingMatches = [...allUpcomingMatches, ...normalizedMatches];
          }
        });

        // Update metadata with the actual number of matches we fetched
        metadata.total = allUpcomingMatches.length;
      } catch (err) {
        console.error('Error fetching additional pages:', err);
        // Continue with just the first page data
      }
    }

    // Normalize the first page data as well for consistency
    const normalizedMatches = allUpcomingMatches.map((match: any) => ({
      ...match,
      homeTeam: {
        ...match.homeTeam,
        avgHomeGoals: match.homeTeam.avgHomeGoals || 0,
        avgAwayGoals: match.homeTeam.avgAwayGoals || 0,
        avgTotalGoals: match.homeTeam.avgTotalGoals || 0,
      },
      awayTeam: {
        ...match.awayTeam,
        avgHomeGoals: match.awayTeam.avgHomeGoals || 0,
        avgAwayGoals: match.awayTeam.avgAwayGoals || 0,
        avgTotalGoals: match.awayTeam.avgTotalGoals || 0,
      }
    }));

    return {
      upcomingMatches: normalizedMatches,
      metadata: metadata
    };
  } else {
    // Old structure or direct data format
    // Make sure to normalize this data too
    const upcomingMatches = responseData.data?.upcomingMatches || responseData.upcomingMatches || [];
    const metadata = responseData.data?.metadata || responseData.metadata || {
      total: upcomingMatches.length,
      date: new Date().toISOString().split('T')[0],
      leagueData: {}
    };

    // Normalize all matches to ensure consistent structure
    const normalizedMatches = upcomingMatches.map((match: any) => ({
      ...match,
      homeTeam: {
        ...match.homeTeam,
        avgHomeGoals: match.homeTeam.avgHomeGoals || 0,
        avgAwayGoals: match.homeTeam.avgAwayGoals || 0,
        avgTotalGoals: match.homeTeam.avgTotalGoals || 0,
      },
      awayTeam: {
        ...match.awayTeam,
        avgHomeGoals: match.awayTeam.avgHomeGoals || 0,
        avgAwayGoals: match.awayTeam.avgAwayGoals || 0,
        avgTotalGoals: match.awayTeam.avgTotalGoals || 0,
      }
    }));

    return {
      upcomingMatches: normalizedMatches,
      metadata: metadata
    };
  }
};

export async function GET() {
  try {
    const currentTime = Date.now();

    // Return cached data if it exists and hasn't expired
    if (cachedData && currentTime - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData,
        cache: {
          isCached: true,
          lastUpdated: new Date(lastFetchTime).toISOString(),
          cacheAge: Math.round((currentTime - lastFetchTime) / 1000 / 60), // minutes
          nextRefresh: new Date(lastFetchTime + CACHE_DURATION).toISOString()
        }
      });
    }

    // Fetch fresh data if cache is empty or expired
    const data = await fetchAllPages();

    // Make sure the data has the expected structure
    if (!data.upcomingMatches || !Array.isArray(data.upcomingMatches)) {
      throw new Error('Invalid data structure received from API');
    }

    // Update cache and last fetch time
    cachedData = data;
    lastFetchTime = currentTime;

    return NextResponse.json({
      ...data,
      cache: {
        isCached: false,
        lastUpdated: new Date(lastFetchTime).toISOString(),
        cacheAge: 0,
        nextRefresh: new Date(lastFetchTime + CACHE_DURATION).toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching prediction data:', error);

    // If we have cached data, return it even if it's expired rather than failing
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cache: {
          isCached: true,
          lastUpdated: new Date(lastFetchTime).toISOString(),
          cacheAge: Math.round((Date.now() - lastFetchTime) / 1000 / 60), // minutes
          nextRefresh: new Date(lastFetchTime + CACHE_DURATION).toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error while refreshing cache'
        }
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch prediction data',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        time: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 