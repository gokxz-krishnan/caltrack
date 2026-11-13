import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryServer = null;

// Ensure download directory for mongodb-memory-server is inside the project
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../.mongo-bin');

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/caltrack';
  
  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB instance (${primaryUri}). Reason: ${err.message}`);
    console.log('[Database] Starting in-memory fallback MongoDB server for seamless zero-config local operation...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        binary: {
          downloadDir: path.resolve(__dirname, '../.mongo-bin'),
        },
      });
      const memUri = memoryServer.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB connected successfully at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory MongoDB server:', memErr.message);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error('[Database] Error closing DB connection:', err);
  }
};
