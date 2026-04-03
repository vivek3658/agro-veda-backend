require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = process.env.MONGODB_URI;

if (isProduction && !mongoUri) {
  console.error('CRITICAL: MONGODB_URI is not set in production environment!');
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: mongoUri || 'mongodb://127.0.0.1:27017/backend-db',
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here'
};
