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

  console.log('Registering user:', email);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: role || 'user'
  });

  const savedUser = await user.save();

  if (!savedUser) {
    throw new Error('Database save failed');
  }

  const token = generateToken(savedUser);
  return { 
    user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role }, 
    token 
  };
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
  return { 
    user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
    token 
  };
};

const googleLogin = async (idToken, requestedRole) => {
  console.log('Google login attempt...');
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: config.googleClientId, 
  });
  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    console.log('New Google user:', email);
    user = new User({
      name,
      email,
      googleId,
      role: requestedRole || 'user', 
    });
    await user.save();
  } else {
    console.log('Existing user Google link:', email);
    user.googleId = googleId;
    await user.save();
  }

  const token = generateToken(user);
  return { 
    user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
    token 
  };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin
};
