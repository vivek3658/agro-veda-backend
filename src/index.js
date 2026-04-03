require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
let cachedDb = null;
app.use(async (req, res, next) => {
  if (!cachedDb) {
    cachedDb = await connectDB();
  }
  next();
});

// Middleware
app.use(cors({
  origin: true, // Dynamically allow the requesting origin
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());


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
