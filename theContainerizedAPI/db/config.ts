import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://mongo:27019/mydatabase");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
