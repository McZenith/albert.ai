'use server'

import { MongoClient } from 'mongodb'
import { revalidatePath } from 'next/cache'

// Define types for saved matches
interface SavedMatch {
  id: string | number;
  homeTeam: {
    id: string;
    name: string;
    position?: number;
    [key: string]: unknown;
  };
  awayTeam: {
    id: string;
    name: string;
    position?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// MongoDB connection from environment variables
const uri = process.env.MONGODB_URI ?? ""
const dbName = process.env.MONGODB_DB_NAME ?? "SportsDb"
const collectionName = process.env.MONGODB_COLLECTION ?? "SavedMatches"

// Connect to MongoDB
async function connectToDatabase() {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    // Create TTL index if it doesn't exist (auto-delete after 3 days)
    const indexes = await collection.indexes()
    const hasTTLIndex = indexes.some(index => index.name === 'expiresAt_1')

    if (!hasTTLIndex) {
      await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 259200 }) // 3 days in seconds
    }

    return { db, collection, client }
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    await client.close()
    throw new Error('Failed to connect to database')
  }
}

// Save matches to database
export async function saveMatchesToDatabase(matches: SavedMatch[]) {
  let client
  try {
    const { collection, client: mongoClient } = await connectToDatabase()
    client = mongoClient

    // Prepare matches for saving with expiration date
    const matchesToSave = matches.map(match => ({
      ...match,
      savedAt: new Date(),
      expiresAt: new Date(Date.now() + 259200000), // Current time + 3 days
    }))

    // Insert matches
    const result = await collection.insertMany(matchesToSave)

    // Revalidate the paths to update UI
    revalidatePath('/')

    return { success: true, count: result.insertedCount }
  } catch (error) {
    console.error('Error saving matches:', error)
    return { success: false, error: 'Failed to save matches' }
  } finally {
    // Close connection
    if (client) await client.close()
  }
}

// Get saved matches from database
export async function getSavedMatches() {
  let client
  try {
    const { collection, client: mongoClient } = await connectToDatabase()
    client = mongoClient

    // Get all saved matches
    const savedMatches = await collection.find({}).toArray()

    // Convert MongoDB documents to plain objects and remove _id field
    const serializedMatches = savedMatches.map(match => {
      const plainMatch = JSON.parse(JSON.stringify(match))
      // Remove the MongoDB _id field
      delete plainMatch._id
      return plainMatch
    })

    return { success: true, matches: serializedMatches }
  } catch (error) {
    console.error('Error fetching saved matches:', error)
    return { success: false, error: 'Failed to fetch saved matches', matches: [] }
  } finally {
    // Close connection
    if (client) await client.close()
  }
}

// Check if a match is saved
export async function isMatchSaved(matchId: string) {
  let client
  try {
    const { collection, client: mongoClient } = await connectToDatabase()
    client = mongoClient

    // Check if match exists
    const match = await collection.findOne({ 'id': matchId })

    return { success: true, isSaved: !!match }
  } catch (error) {
    console.error('Error checking if match is saved:', error)
    return { success: false, isSaved: false }
  } finally {
    // Close connection
    if (client) await client.close()
  }
}

// Delete a saved match
export async function deleteSavedMatch(matchId: string) {
  let client
  try {
    const { collection, client: mongoClient } = await connectToDatabase()
    client = mongoClient

    // Delete the match
    const result = await collection.deleteOne({ 'id': matchId })

    // Revalidate the paths to update UI
    revalidatePath('/')

    return { success: true, deleted: result.deletedCount > 0 }
  } catch (error) {
    console.error('Error deleting saved match:', error)
    return { success: false, error: 'Failed to delete saved match' }
  } finally {
    // Close connection
    if (client) await client.close()
  }
} 