import { NextRequest, NextResponse } from 'next/server';

// Set this to false to use real API data instead of test data
const USE_TEST_DATA = false;

// Define types for API data
interface Team {
  name: string;
  position: number;
  logo: string;
  [key: string]: unknown; // Allow for additional properties
}

interface Match {
  id: string | number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  venue: string;
  [key: string]: unknown; // Allow for additional properties
}

interface ApiResponse {
  data?: {
    upcomingMatches: Match[];
    metadata: {
      total: number;
      date: string;
      leagueData: Record<string, unknown>;
    };
  };
  [key: string]: unknown; // Allow for additional properties
}

// Function to correct match dates (handle 2025 dates)
const correctMatchDate = (match: Match): Match => {
  if (!match.date) return match;

  // Check if the date is in the future (likely incorrectly set to 2025)
  if (match.date.startsWith('2025-')) {
    // Create a corrected date with the current year
    const [, month, day] = match.date.split('-'); // Use empty first element to skip year
    const currentYear = new Date().getFullYear();
    const correctedDate = `${currentYear}-${month}-${day}`;

    return { ...match, date: correctedDate };
  }

  return match;
};

// Function to fetch all matches from all pages
const fetchAllPages = async (apiUrl: string, requestLimit = 20): Promise<Match[]> => {
  let allMatches: Match[] = [];
  let page = 1;
  let hasMoreData = true;
  const pageSize = 50; // Maximum page size to minimize number of requests

  while (hasMoreData && page <= requestLimit) {
    try {
      const response = await fetch(`${apiUrl}?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (!response.ok) {
        console.error(`API request failed with status ${response.status} on page ${page}`);
        break;
      }

      const data = await response.json() as ApiResponse;
      const matches = data?.data?.upcomingMatches || [];

      if (matches.length > 0) {
        allMatches = [...allMatches, ...matches];
        page++;
      } else {
        hasMoreData = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      break;
    }
  }

  return allMatches;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');

    if (USE_TEST_DATA) {
      // Use our test-matches endpoint for consistent test data with 1 PM matches
      const testResponse = await fetch(`${request.nextUrl.origin}/api/test-matches`);

      if (!testResponse.ok) {
        throw new Error(`Test API request failed with status ${testResponse.status}`);
      }

      const testData = await testResponse.json();
      return NextResponse.json(testData);
    }

    // Base URL for the API
    const apiUrl = 'https://fredapi-5da7cd50ded2.herokuapp.com/api/prediction-data';

    // Check if client is requesting a specific page
    const isSpecificPage = searchParams.has('page');

    if (isSpecificPage) {
      // Client wants a specific page - fetch just that page
      const response = await fetch(`${apiUrl}?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json() as ApiResponse;

      // Correct any future dates in the data
      if (data.data && data.data.upcomingMatches) {
        data.data.upcomingMatches = data.data.upcomingMatches.map(correctMatchDate);
      }

      // Add diagnostic information
      const diagnostics = {
        timestamp: new Date().toISOString(),
        page,
        pageSize,
        totalMatches: data?.data?.upcomingMatches?.length || 0,
        apiSource: apiUrl,
        fetchType: 'single-page'
      };

      // Add the diagnostics to the response
      const enrichedData = {
        ...data,
        diagnostics
      };

      return NextResponse.json(enrichedData);
    } else {
      // Client wants all matches - fetch all pages
      // Fetch all pages of data
      const allMatches = await fetchAllPages(apiUrl);

      // Correct any future dates in the data
      const correctedMatches = allMatches.map(correctMatchDate);

      // Calculate total
      const total = correctedMatches.length;

      // Create a response in the expected format
      const responseData = {
        data: {
          upcomingMatches: correctedMatches,
          metadata: {
            total,
            date: new Date().toISOString().split('T')[0],
            leagueData: {}
          }
        },
        diagnostics: {
          timestamp: new Date().toISOString(),
          totalMatches: total,
          apiSource: apiUrl,
          fetchType: 'all-pages'
        }
      };

      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error('Error fetching prediction data:', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json(
      {
        error: 'Failed to fetch prediction data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 