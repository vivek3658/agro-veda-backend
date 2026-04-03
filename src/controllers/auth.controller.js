const authService = require('../services/auth.service');

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'none', // Required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, reEnterPassword, role, captcha } = req.body;
    
    if (!captcha) {
      return res.status(400).json({ message: 'Captcha is required' });
    }
    
    if (password !== reEnterPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const result = await authService.registerUser({ name, email, password, role });
    setTokenCookie(res, result.token);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!captcha) {
      return res.status(400).json({ message: 'Captcha is required' });
    }

    const result = await authService.loginUser(email, password);
    setTokenCookie(res, result.token);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body; 
    
    if (!idToken) {
        return res.status(400).json({ message: 'Google ID token is required' });
    }

    const result = await authService.googleLogin(idToken, role);
    setTokenCookie(res, result.token);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// Returns current authenticated user via middleware
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { register, login, googleLogin, getMe, logout };

