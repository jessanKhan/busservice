// user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type: String,
    required: true,
    default: 'student',
  },
  bookedBuses: [
    {
      bus: {
        type: Object,
      },
      seatNumber: Number,
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
