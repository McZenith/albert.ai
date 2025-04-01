// Team name normalization utilities

/**
 * Normalizes a team name by:
 * 1. Converting to lowercase
 * 2. Removing special characters
 * 3. Removing common prefixes/suffixes (FC, SC, etc)
 * 4. Removing team numbers (I, II, 2nd, etc)
 * 5. Normalizing spaces
 * 6. Handling special cases
 */
export const normalizeTeamName = (name: string): string => {
    if (!name) return '';

    const specialCases: Record<string, string> = {
        'fc magdeburg ii': 'magdeburg 2',
        'magdeburg ii': 'magdeburg 2',
        // Add more special cases here as needed
    };

    let normalized = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')                    // normalize spaces
        .replace(/[^\w\s-]/g, '')               // remove special chars except hyphen
        .replace(/^(fc|sc|sv|tsv|vfb|fsv)\s*/i, '')  // remove common prefixes
        .replace(/\s*(fc|sc|sv|tsv|vfb|fsv)$/i, '')  // remove common suffixes
        .replace(/\s*(i{1,3}|ii|2nd|2)\s*$/i, ' 2')  // standardize team numbers to '2'
        .replace(/\s+/g, ' ')                    // clean up any double spaces
        .trim();

    // Check for special cases
    return specialCases[normalized] || normalized;
};

/**
 * Compares two team names and returns true if they match after normalization
 */
export const compareTeamNames = (name1: string, name2: string): boolean => {
    const norm1 = normalizeTeamName(name1);
    const norm2 = normalizeTeamName(name2);
    return norm1 === norm2;
};

/**
 * Calculates the similarity between two team names
 * Returns a value between 0 and 1, where 1 is an exact match
 */
export const getTeamNameSimilarity = (name1: string, name2: string): number => {
    const norm1 = normalizeTeamName(name1);
    const norm2 = normalizeTeamName(name2);

    if (norm1 === norm2) return 1;

    // Check if one name contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
        return 0.9;
    }

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(norm1, norm2);
    const maxLength = Math.max(norm1.length, norm2.length);

    return 1 - (distance / maxLength);
};

/**
 * Helper function to calculate Levenshtein distance between two strings
 */
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