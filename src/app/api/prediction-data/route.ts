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

interface UpcomingMatch {
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
}

interface PredictionData {
  upcomingMatches: Array<UpcomingMatch>;
  metadata: {
    total: number;
    date: string;
    leagueData: Record<string, Record<string, number>>;
  };
}

const BASE_URL = 'https://fredapi-5da7cd50ded2.herokuapp.com/api/prediction-data';

// This version requests all data at once (uses the backend's batch endpoint)
const fetchAllMatches = async (): Promise<PredictionData> => {
  try {
    // Send a request to the backend with a flag to get all data at once
    console.log("Fetching all matches in a single request...");
    const response = await fetch(`${BASE_URL}?getAllMatches=true&pageSize=1000`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Albert.ai Football Prediction App'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`Received response with status ${response.status}`);

    let matches: Partial<UpcomingMatch>[] = [];
    let metadata = {
      total: 0,
      date: new Date().toISOString().split('T')[0],
      leagueData: {}
    };

    // Try different possible data structures from the API
    if (responseData.data?.upcomingMatches) {
      matches = responseData.data.upcomingMatches;
      metadata = responseData.data.metadata || metadata;
      console.log(`Found ${matches.length} matches in data.upcomingMatches`);
    } else if (responseData.upcomingMatches) {
      matches = responseData.upcomingMatches;
      metadata = responseData.metadata || metadata;
      console.log(`Found ${matches.length} matches in upcomingMatches`);
    } else if (Array.isArray(responseData)) {
      matches = responseData;
      console.log(`Found ${matches.length} matches in array response`);
    } else {
      console.log("Unexpected API response structure:", Object.keys(responseData));
      throw new Error("Unexpected API response structure");
    }

    // Process and normalize all matches
    const normalizedMatches = processMatches(matches);
    console.log(`Successfully processed ${normalizedMatches.length} matches`);

    return {
      upcomingMatches: normalizedMatches,
      metadata: {
        ...metadata,
        total: normalizedMatches.length
      }
    };
  } catch (error) {
    console.error("Error in fetchAllMatches:", error);
    throw error;
  }
};

// Fallback method to fetch page by page if getting all matches at once fails
const fetchAllPages = async (): Promise<PredictionData> => {
  try {
    console.log("Falling back to page-by-page fetch approach");

    // First, find out how many pages there are
    const initialResponse = await fetch(`${BASE_URL}?page=1&pageSize=50`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Albert.ai Football Prediction App'
      }
    });

    if (!initialResponse.ok) {
      throw new Error(`API responded with status: ${initialResponse.status}`);
    }

    const initialData = await initialResponse.json();
    let totalPages = 1;

    if (initialData.pagination && initialData.pagination.totalPages) {
      totalPages = initialData.pagination.totalPages;
    }

    console.log(`Found ${totalPages} total pages to fetch`);

    // Extract matches from first page
    let allMatches: Partial<UpcomingMatch>[] = [];
    let metadata = {
      total: 0,
      date: new Date().toISOString().split('T')[0],
      leagueData: {}
    };

    if (initialData.data?.upcomingMatches) {
      allMatches = [...initialData.data.upcomingMatches];
      metadata = initialData.data.metadata || metadata;
    } else if (initialData.upcomingMatches) {
      allMatches = [...initialData.upcomingMatches];
      metadata = initialData.metadata || metadata;
    }

    console.log(`Extracted ${allMatches.length} matches from page 1`);

    // Now fetch all other pages (if any)
    if (totalPages > 1) {
      const pagePromises = [];

      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(fetch(`${BASE_URL}?page=${page}&pageSize=50`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Albert.ai Football Prediction App'
          }
        }).then(res => {
          if (!res.ok) {
            console.error(`Error fetching page ${page}: ${res.status}`);
            return null;
          }
          return res.json();
        }).catch(err => {
          console.error(`Failed to fetch page ${page}:`, err);
          return null;
        }));
      }

      const pageResponses = await Promise.all(pagePromises);

      // Extract matches from each page
      pageResponses.forEach((response, index) => {
        if (!response) return;

        const pageNumber = index + 2;
        let pageMatches: Partial<UpcomingMatch>[] = [];

        if (response.data?.upcomingMatches) {
          pageMatches = response.data.upcomingMatches;
        } else if (response.upcomingMatches) {
          pageMatches = response.upcomingMatches;
        }

        console.log(`Extracted ${pageMatches.length} matches from page ${pageNumber}`);
        allMatches = [...allMatches, ...pageMatches];
      });
    }

    // Process and normalize all matches
    const normalizedMatches = processMatches(allMatches);
    console.log(`Successfully processed ${normalizedMatches.length} matches from ${totalPages} pages`);

    return {
      upcomingMatches: normalizedMatches,
      metadata: {
        ...metadata,
        total: normalizedMatches.length
      }
    };
  } catch (error) {
    console.error("Error in fetchAllPages:", error);
    throw error;
  }
};

// Helper function to format time to local time
const formatToLocalTime = (date: string, time: string): string => {
  if (!date || !time) return time || '';

  try {
    // Based on testing, we know the server returns time in HH:MM format
    // Still, let's normalize time format to handle edge cases
    let normalizedTime = time;

    // Check if time contains seconds (HH:MM:SS) and strip them if needed
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      normalizedTime = time.substring(0, 5);
    }

    // Check if time is in 24-hour format without colon (e.g., "1430")
    if (/^\d{4}$/.test(time)) {
      normalizedTime = `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }

    // Combine date and normalized time strings, ensuring proper format
    // Add seconds (":00") if they're not already there
    const dateTimeStr = normalizedTime.includes(':') && normalizedTime.length === 5
      ? `${date}T${normalizedTime}:00`
      : `${date}T${normalizedTime}`;

    // Verify the combined date+time string is valid
    const dateObj = new Date(dateTimeStr);
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date created from: ${dateTimeStr}, using original time`);
      return normalizedTime;
    }

    // Format with options for 12-hour format with AM/PM
    const formattedTime = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Use 12-hour format with AM/PM
    });

    return formattedTime;
  } catch (error) {
    console.error('Error formatting time to local time:', error, 'for date:', date, 'time:', time);
    return time;
  }
};

// Helper function to process and normalize match data
const processMatches = (matches: Partial<UpcomingMatch>[]): UpcomingMatch[] => {
  return matches
    .filter(match => Boolean(match && match.homeTeam && match.awayTeam && match.id))
    .map(match => {
      const localTime = formatToLocalTime(match.date || '', match.time || '');

      return {
        id: match.id as number,
        homeTeam: {
          name: match.homeTeam?.name || '',
          position: match.homeTeam?.position || 0,
          logo: match.homeTeam?.logo || '',
          avgHomeGoals: match.homeTeam?.avgHomeGoals || 0,
          avgAwayGoals: match.homeTeam?.avgAwayGoals || 0,
          avgTotalGoals: match.homeTeam?.avgTotalGoals || 0,
          form: match.homeTeam?.form || '',
          cleanSheets: match.homeTeam?.cleanSheets || 0,
          ...match.homeTeam
        },
        awayTeam: {
          name: match.awayTeam?.name || '',
          position: match.awayTeam?.position || 0,
          logo: match.awayTeam?.logo || '',
          avgHomeGoals: match.awayTeam?.avgHomeGoals || 0,
          avgAwayGoals: match.awayTeam?.avgAwayGoals || 0,
          avgTotalGoals: match.awayTeam?.avgTotalGoals || 0,
          form: match.awayTeam?.form || '',
          cleanSheets: match.awayTeam?.cleanSheets || 0,
          ...match.awayTeam
        },
        date: match.date || '',
        time: localTime,
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
        odds: match.odds || {},
        cornerStats: match.cornerStats || {},
        scoringPatterns: match.scoringPatterns || {},
        reasonsForPrediction: match.reasonsForPrediction || []
      } as UpcomingMatch;
    });
};

export async function GET() {
  try {
    console.log("Starting prediction data fetch...");
    let data: PredictionData;

    // Try to fetch all matches at once first
    try {
      data = await fetchAllMatches();
    } catch (error) {
      console.log("Error fetching all matches at once, falling back to pagination:", error);
      // If that fails, fall back to fetching page by page
      data = await fetchAllPages();
    }

    // Make sure the data has the expected structure
    if (!data.upcomingMatches || !Array.isArray(data.upcomingMatches)) {
      throw new Error('Invalid data structure received from API');
    }

    console.log(`Returning ${data.upcomingMatches.length} total matches to client`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prediction data:', error);

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