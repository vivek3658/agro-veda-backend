const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const config = require('../config');

const client = new OAuth2Client(config.googleClientId);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Use await User.create to ensure it is saved before proceeding
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'user'
  });

  if (!user) {
    throw new Error('Failed to create user in database');
  }

  const token = generateToken(user);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

const googleLogin = async (idToken, requestedRole) => {
  console.log('Attempting Google login...');
  // Verify the Google token
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: config.googleClientId, 
  });
  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  console.log('Google payload verified:', { email, name });

  let user = await User.findOne({ email });

  if (!user) {
    console.log('Creating new Google user:', email);
    user = new User({
      name,
      email,
      googleId,
      role: requestedRole || 'user', 
    });
    await user.save();
  } else {
    console.log('User found, linking/updating Google ID:', email);
    user.googleId = googleId;
    await user.save();
  }

  if (!user) {
    throw new Error('Failed to create or link Google user');
  }

  const token = generateToken(user);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin
};

  googleLogin
};
