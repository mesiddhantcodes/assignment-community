import { MongoClient, Db } from 'mongodb';
const mongoURI = 'mongodb+srv://user-community:sidd123@cluster0.phbuxbe.mongodb.net/community-backend?retryWrites=true&w=majority';
const client = new MongoClient(mongoURI);

let db: Db | null = null;

export async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

export function getDatabase(): Db | null {
  return db;
}
