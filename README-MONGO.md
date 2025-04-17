# MongoDB Integration for Saved Matches

This document explains how the MongoDB integration works for saving and displaying matches.

## Overview

The application allows users to save matches from the Upcoming Tab to a MongoDB database and then displays indicators for these saved matches in the Live Tab when they are being played.

## How It Works

1. **Environment Variables**

   MongoDB connection details are stored in the `.env.local` file:
   
   ```
   MONGODB_URI="your-mongodb-connection-string"
   MONGODB_DB_NAME="SportsDb"
   MONGODB_COLLECTION="SavedMatches"
   ```

2. **Server Actions**

   The Server Actions API from Next.js is used to interact with MongoDB. These functions are defined in `src/app/actions.ts`:
   
   - `saveMatchesToDatabase(matches)`: Saves selected matches to the database
   - `getSavedMatches()`: Retrieves all saved matches
   - `isMatchSaved(matchId)`: Checks if a specific match is saved
   - `deleteSavedMatch(matchId)`: Deletes a saved match

3. **Auto-Deletion**

   Saved matches are automatically deleted after 3 days using MongoDB's TTL (Time-To-Live) index on the `expiresAt` field.

## Usage

1. **Saving Matches**
   
   In the Upcoming Tab, select matches by adding them to your cart and click the "Save to Database" button.

2. **Viewing Saved Matches in Live Tab**
   
   When a saved match appears in the Live Tab, it will be marked with a "Saved" indicator, making it easy to identify matches you had previously tagged as interesting.

## Development

To modify the MongoDB integration:

1. Update the environment variables in `.env.local` if needed
2. Modify the server actions in `src/app/actions.ts`
3. The MongoDB client automatically handles connections and disconnections

## Troubleshooting

If you encounter issues with the MongoDB integration:

1. Check the MongoDB connection string in `.env.local`
2. Ensure MongoDB Atlas (or your MongoDB server) is accessible
3. Check the browser console and server logs for detailed error messages 