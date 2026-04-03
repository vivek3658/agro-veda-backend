require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins with credentials for dev, or specify your frontend URL
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
let cachedDb = null;
app.use(async (req, res, next) => {
  try {
    if (!cachedDb) {
      cachedDb = await connectDB();
    }
    // We can now use mongoose because it's required
    if (!cachedDb && mongoose.connection.readyState === 0) {
       return res.status(503).json({ message: 'Database connection failed.' });
    }
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({ message: 'Internal server error during DB connection' });
  }
});


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/crops', require('./routes/crop.routes'));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
