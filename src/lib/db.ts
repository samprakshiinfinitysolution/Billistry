
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI not defined in .env.local');
}

// ✅ Define the cache type
interface MongooseGlobal {
  mongooseConn?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// ✅ Type globalThis with the interface
const globalWithMongoose = globalThis as typeof globalThis & MongooseGlobal;

if (!globalWithMongoose.mongooseConn) {
  globalWithMongoose.mongooseConn = {
    conn: null,
    promise: null,
  };
}

export async function connectDB(): Promise<typeof mongoose> {
  const cached = globalWithMongoose.mongooseConn!;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'billistyrDB',
    }).then((mongoose) => {
      console.log('✅ MongoDB connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('❌ Failed to connect to MongoDB:', err);
    throw err;
  }
}
