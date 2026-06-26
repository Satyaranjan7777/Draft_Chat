import mongoose from "mongoose";


export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        });
        console.log(`MongoDB Connected Successfully`);
    } catch (error) {
        console.error("MongoDB Connection error:", error.message);
        throw error;
    }
};
