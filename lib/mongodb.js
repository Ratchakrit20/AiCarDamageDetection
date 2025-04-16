import mongoose from "mongoose";

export const connectMongoDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("Connected to MongoDB successfully");
        return mongoose.connection.db;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};