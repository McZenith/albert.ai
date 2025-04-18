'use server'

import { MongoClient, ObjectId } from 'mongodb'
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

// Using environment variables for credentials
const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB as string;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION as string;

// Connect to MongoDB
let cachedClient: MongoClient | null = null;

const connectToDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Please set it in your environment variables.');
  }

  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
};

// Create an index to auto-delete expired documents
const createExpiryIndex = async () => {
  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(COLLECTION_NAME);

    // Create a TTL index on expires_at field to auto-delete after expiry
    await collection.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
    console.log("TTL index created successfully");
  } catch (error) {
    console.error("Error creating TTL index:", error);
  }
};

// Initialize index
createExpiryIndex().catch(console.error);

// Save matches to database
export async function saveMatchesToDatabase(matches: SavedMatch[]) {
  try {
    if (!Array.isArray(matches) || matches.length === 0) {
      return { error: 'No matches provided', status: 400 };
    }

    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(COLLECTION_NAME);

    // Add expiry date (3 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    // Prepare matches with expiry date
    const matchesWithExpiry = matches.map(match => ({
      ...match,
      saved_at: new Date(),
      expires_at: expiryDate
    }));

    // Insert matches
    const result = await collection.insertMany(matchesWithExpiry);

    // Serialize the result to handle any potential Buffer objects
    const serializedIds = serializeData(result.insertedIds);

    revalidatePath('/');

    return {
      success: true,
      message: `${result.insertedCount} matches saved successfully`,
      ids: serializedIds,
      status: 201
    };
  } catch (error) {
    console.error('Error saving matches:', error);
    return {
      error: 'Failed to save matches',
      details: (error as Error).message,
      status: 500
    };
  }
}

// Define type for serializable data
type SerializableData = string | number | boolean | null | undefined | Date | Buffer |
  SerializableData[] | { [key: string]: SerializableData };

// Utility function to deeply serialize MongoDB documents and buffer objects
const serializeData = (data: unknown): SerializableData => {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle ObjectId
  if (data && typeof data === 'object' && 'toString' in data && '_bsontype' in data) {
    return data.toString();
  }

  // Handle Buffer objects
  if (Buffer.isBuffer(data)) {
    return data.toString('hex');
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  // Handle plain objects (recursively)
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, SerializableData> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeData((data as Record<string, unknown>)[key]);
      }
    }
    return result;
  }

  // Return primitive values as is
  return data as SerializableData;
};

// Get saved matches from database
export async function getSavedMatches() {
  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(COLLECTION_NAME);

    // Get all unexpired saved matches
    const savedMatches = await collection
      .find({ expires_at: { $gt: new Date() } })
      .toArray();

    // Deep serialize all match data to ensure it's safe for client components
    const serializedMatches = serializeData(savedMatches) as Array<Record<string, SerializableData>>;

    return {
      savedMatches: serializedMatches,
      count: serializedMatches.length,
      status: 200
    };
  } catch (error) {
    console.error('Error retrieving saved matches:', error);
    return {
      error: 'Failed to retrieve saved matches',
      details: (error as Error).message,
      status: 500
    };
  }
}

// Delete a saved match
export async function deleteSavedMatch(id: string) {
  try {
    if (!id) {
      return { error: 'Match ID is required', status: 400 };
    }

    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    // Check if document was actually deleted
    if (result.deletedCount === 0) {
      return { error: 'Match not found', status: 404 };
    }

    revalidatePath('/');

    return {
      success: true,
      message: 'Match deleted successfully',
      status: 200
    };
  } catch (error) {
    console.error('Error deleting match:', error);
    return {
      error: 'Failed to delete match',
      details: (error as Error).message,
      status: 500
    };
  }
} 