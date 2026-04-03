const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
