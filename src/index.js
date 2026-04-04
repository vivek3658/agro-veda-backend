require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const seedAdmin = require('./db/seed-admin');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { startFarmerDailyEmailJob } = require('./jobs/farmer-daily-email.job');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// ✅ 1. CORS FIX (IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "https://agroveda-client.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ 2. HANDLE PREFLIGHT (CRITICAL 🔥)
app.options('*', cors());

// ✅ 3. BASIC MIDDLEWARE
app.use(express.json());
app.use(cookieParser());


// ✅ 4. DB CONNECTION (OPTIMIZED FOR SERVERLESS)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDBCached() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = connectDB();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDBCached();
    next();
  } catch (error) {
    console.error('DB ERROR:', error);
    return res.status(500).json({ message: "Database connection failed" });
  }
});


// ✅ Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// ✅ Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/marketplace', require('./routes/marketplace.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/admin', require('./routes/admin-auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/soil-chatbot', require('./routes/soil-chatbot.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));


// ✅ Health routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});


// ✅ Error handlers
app.use(notFoundHandler);
app.use(errorHandler);


// ❌ REMOVE THIS FOR VERCEL (IMPORTANT)
// app.listen(...) should NOT run in serverless

// ✅ Only for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  (async () => {
    try {
      await connectDBCached();
      await seedAdmin();
      startFarmerDailyEmailJob();

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error("Startup failed:", err);
    }
  })();
}


// ✅ EXPORT FOgitR VERCEL
module.exports = app;