import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

/**
 * Connect to the in-memory database before all tests
 */
beforeAll(async () => {
   // Set up test environment variables
   process.env.JWT_SECRET = "test-secret-key-for-testing";

   mongod = await MongoMemoryServer.create();
   const uri = mongod.getUri();
   await mongoose.connect(uri);
});

/**
 * Clear all test data after every test
 */
afterEach(async () => {
   const collections = mongoose.connection.collections;
   for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
   }
});

/**
 * Close database connection and stop mongod after all tests
 */
afterAll(async () => {
   await mongoose.connection.close();
   await mongod.stop();
});
