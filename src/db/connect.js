const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('Using existing MongoDB connection');
      return mongoose.connection;
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast (5s)
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Re-throw so the middleware can catch it
    throw error;
  }
};

module.exports = connectDB;
