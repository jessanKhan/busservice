// Create a new file called busRoute.js

const mongoose = require('mongoose');

// Define the BusRoute schema
const busRouteSchema = new mongoose.Schema({
  busNo: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  startLocation: {
    type: String,
    required: true
  },
  endLocation: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  totalSeats: {type: Number, default: 32},
  bookedSeats: [{type:Number}]
});

// Create the BusRoute model using the schema
const BusRoute = mongoose.model('BusRoute', busRouteSchema);

// Export the BusRoute model
module.exports = BusRoute;
