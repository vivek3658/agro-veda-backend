require('dotenv').config();

console.log('Config: Loading environment variables...');
if (!process.env.MONGODB_URI) {
  console.warn('Config: MONGODB_URI is not set, using local fallback');
} else {
  console.log('Config: MONGODB_URI is set');
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backend-db',
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here'
};
