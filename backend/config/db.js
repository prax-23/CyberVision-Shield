import mongoose from 'mongoose';

let mongoServer = null;
let connection = null;

const openConnection = async () => {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    // Serverless functions cannot run a local database
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }
    console.log('No MONGODB_URI environment variable detected.');
    console.log('Spinning up an in-memory MongoDB server for CyberShield...');
    const memoryServerPkg = 'mongodb-memory-server';
    const { MongoMemoryServer } = await import(memoryServerPkg);
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    console.log(`In-memory MongoDB Server is running at: ${mongoUri}`);
  }

  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  return conn;
};

// Connects once and reuses the connection (also across serverless invocations)
export const connectDB = () => {
  if (!connection) {
    connection = openConnection().catch((error) => {
      connection = null;
      throw error;
    });
  }
  return connection;
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB Server stopped.');
    }
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
  }
};
