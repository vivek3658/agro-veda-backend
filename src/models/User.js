const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String,
    // Optional because Google users won't have a password
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'farmer', 'consumer'], // roles updated
    default: 'user' 
  },
  googleId: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
