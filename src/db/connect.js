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
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`); // Logs the actual DB name
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Re-throw so the middleware can catch it
    throw error;
  }
};

module.exports = connectDB;
