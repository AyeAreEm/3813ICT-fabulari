import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB ?? 'fabulari';

const client = new MongoClient(uri);
let db = null;

export async function connectDB() {
    if (db) return db;

    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB at ${uri} (db: "${dbName}")`);
    return db;
}

export function getDB() {
    if (!db) {
        throw new Error('MongoDB has not been connected yet. Call connectDB() before using the database.');
    }
    return db;
}

export async function replaceCollection(name, docs) {
    const collection = getDB().collection(name);
    await collection.deleteMany({});
    if (docs.length > 0) {
        await collection.insertMany(docs);
    }
}

export async function closeDB() {
    await client.close();
    db = null;
}
