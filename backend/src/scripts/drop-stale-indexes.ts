import mongoose from "mongoose";
import { env } from "../config/env";

const dropIndexes = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI!);
    console.log("Connected to DB...");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Could not access Mongo DB instance");
    }

    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Access raw members collection
    const membersCollection = db.collection("members");
    const indexes = await membersCollection.indexes();
    console.log("Active Indexes on members:", indexes);

    const hasUserIdIndex = indexes.some(idx => idx.name === "userId_1");
    if (hasUserIdIndex) {
      console.log("Found stale unique index: 'userId_1'. Dropping it...");
      await membersCollection.dropIndex("userId_1");
      console.log("Stale unique index 'userId_1' dropped successfully!");
    } else {
      console.log("No stale 'userId_1' index found on members collection.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error dropping indexes:", error);
    process.exit(1);
  }
};

dropIndexes();
