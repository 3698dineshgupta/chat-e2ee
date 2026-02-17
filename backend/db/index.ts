import dotenv from "dotenv";
dotenv.config();

import { MongoClient, Db } from "mongodb";

/* ================================
   Environment Variables
================================ */

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

let client: MongoClient | null = null;
let db: Db | null = null;

if (uri) {
  client = new MongoClient(uri);
}

/* ================================
   Connect MongoDB
================================ */

export const connectDb = async (): Promise<void> => {
  if (!client || !dbName) {
    console.warn("Mongo URI missing");
    return;
  }

  try {
    await client.connect();
    db = client.db(dbName);
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
};

/* ================================
   Insert
================================ */

export const insertInDb = async <T>(
  data: T,
  collection: string
): Promise<T> => {
  if (!db) throw new Error("DB not connected");

  await db.collection(collection).insertOne(data as any);
  return data;
};

/* ================================
   Find One
================================ */

export const findOneFromDB = async <T>(
  condition: any,
  collection: string
): Promise<T | null> => {
  if (!db) throw new Error("DB not connected");

  return (await db.collection(collection).findOne(condition)) as T | null;
};

/* ================================
   Update One
================================ */

export const updateOneFromDb = async <T>(
  condition: any,
  data: Partial<T>,
  collection: string
): Promise<T> => {
  if (!db) throw new Error("DB not connected");

  await db.collection(collection).updateOne(condition, {
    $set: data,
  });

  return data as T;
};
