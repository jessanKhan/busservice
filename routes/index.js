const express = require('express');
const router = express.Router();
const User = require('../models/user');
const BusRoute = require('../models/busRoute');
const { render } = require('ejs');
router.get('/', (req, res) => {
  res.render('index'); 
});

router.get('/profile', async (req, res) => {
    try {
      // Retrieve the user data from the database based on the logged-in user's ID
      const userId = req.session.userId;
      const user = await User.findById(userId);
      const routes = await BusRoute.find();
      req.session.user = user;

        console.log("userId: " , userId)
      if (!user) {
        return res.status(404).send('User not found.');
      }
  
      res.render('profile', { user , routes});
    } catch (error) {
      res.status(500).send('Error retrieving user data.');
    }
  });

  router.get('/admin-profile', async (req, res) => {
    try {
      // Retrieve the user data from the database based on the logged-in user's ID
      const userId = req.session.userId;
      const user = await User.findById(userId);
      const routes = await BusRoute.find();
      req.session.user = user;

        console.log("userId: " , userId)
      if (!user) {
        return res.status(404).send('User not found.');
      }
  
      res.render('admin-profile', { user: user , routes: routes});

    } catch (error) {
      res.status(500).send('Error retrieving user data.');
    }
  });
  router.get('/user/booked-buses',async(req,res) => {
    try {
      const user= req.session.user ;

      console.log("user booked: " + user)
      res.render('booked-buses',{user: user});
      
    } catch (error) {
      res.status(500).send('Error retrieving user data.');
    }
  })
  router.get('/profile/book-seat', async(req, res) => {
    // Render the "book-seat.ejs" view
    try {
      // const userId = req.session.userId; // Assuming you use sessions for user authentication.
      const {userId,busNo} = req.query;
      console.log(busNo)
      const user = await User.findById(userId);
      const busRoute = await BusRoute.findOne({ busNo: busNo });
      console.log("bus:",busRoute, "user:", user);
      res.render('book-seat', {bus: busRoute,user:user});

    } catch (error) {
      alert('Error');
    }
  });

  // Assuming you have already imported your required modules and models

// Handle seat booking
router.post('/book-seat/', async (req, res) => {
  const { busNo, userId } = req.query;
  const { selectedSeat } = req.body;

  try {
    // Ensure the user is properly retrieved from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Check if the user has already booked a seat on this bus.
    const hasBooked = user.bookedBuses.some((bus) => bus.busNo === busNo);

    if (hasBooked) {
      return res.status(400).send('You have already booked a seat on this bus.');
    }

    // Check if the selected seat is available.
    const bus = await BusRoute.findOne({ busNo: busNo });

    if (!bus) {
      return res.status(404).send('Bus not found.');
    }

    if (bus.bookedSeats.includes(selectedSeat)) {
      return res.status(400).send('The selected seat is already booked.');
    }

    // Update the user's booked buses and the bus route's booked seats.
    user.bookedBuses.push({ bus, seatNumber: selectedSeat });
    bus.bookedSeats.push(selectedSeat);

    await user.save();
    await bus.save();
    req.session.user = user;

    res.redirect('/user/booked-buses'); // Redirect to the booked buses page
  } catch (error) {
    console.error(error);
    res.status(500).send('Seat booking failed. Please try again later.');
  }
});


router.post('/reset-booked-seats/:busNo', async (req, res) => {
  try {
    const { busNo } = req.params;

    // Find the bus route by bus number
    const bus = await BusRoute.findById(busNo);
    console.log("bus",bus)
    if (!bus) {
      return res.status(404).send('Bus not found.');
    }

    // Reset the booked seats for the bus
    bus.bookedSeats = [];

    // Save the updated bus route
    await bus.save();
    console.log("bus route updated",bus)
    // Optionally, you can also remove the booked buses from all users.
    // This depends on your application's requirements.

    // Remove the booked buses from all users
    await User.updateMany(
      { 'bookedBuses.bus._id': busNo },
      { $pull: { bookedBuses: { bus: { _id:busNo } } } },
      { multi: true }
    );

    // Send a success message
    res.status(200).send('Booked seats for the bus have been reset.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Resetting booked seats failed. Please try again later.');
  }
});



  router.get('/admin/routes/add', (req, res) => {
    res.render('addBusRoute');
  });
 
  
  router.post('/admin/routes/add', async (req, res) => {
    try {
      const { busNo, name, startLocation, endLocation, departureTime } = req.body;
  
      // Create a new bus route document
      const newRoute = new BusRoute({
        busNo,
        name,
        startLocation,
        endLocation,
        departureTime
      });
  
      // Save the new bus route to the database
      await newRoute.save();
  
      res.redirect('/admin-profile');
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Error adding bus route. Please try again later.');
    }
  });
  
  // Edit Bus Route
  router.get('/admin/routes/edit/:id', async (req, res) => {
    try {
      const routeId = req.params.id;
  
      // Find the bus route by ID
      const route = await BusRoute.findById(routeId);
  
      if (!route) {
        return res.status(404).send('Bus route not found.');
      }
  
      res.render('editBusRoute', { route });
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Error retrieving bus route. Please try again later.');
    }
  });
  
  router.post('/admin/routes/edit/:id', async (req, res) => {
    try {
      const routeId = req.params.id;
      const { busNo, name, startLocation, endLocation, departureTime  } = req.body;
  
      // Find the bus route by ID
      const route = await BusRoute.findById(routeId);
  
      if (!route) {
        return res.status(404).send('Bus route not found.');
      }
  
      // Update the bus route details
      route.busNo = busNo;
      route.name = name;
      route.startLocation = startLocation;
      route.endLocation = endLocation;
      route.departureTime = departureTime;
  
      // Save the updated bus route
      await route.save();
  
      res.redirect('/admin-profile');
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Error updating bus route. Please try again later.');
    }
  });
  router.post('/book-seat/:busId', async (req, res) => {
    const { busId } = req.params;
    const { seatNumber } = req.body;
    const userId = req.session.userId; // Assuming you use sessions for user authentication.
  
    try {
      // Check if the user has already booked a seat on this bus.
      const user = await User.findById(userId);
      const hasBooked = user.bookedBuses.some((bus) => bus.busId.equals(busId));
  
      if (hasBooked) {
        return res.status(400).send('You have already booked a seat on this bus.');
      }
  
      // Check if the selected seat is available.
      const bus = await BusRoute.findById(busId);
      if (bus.bookedSeats.includes(seatNumber)) {
        return res.status(400).send('The selected seat is already booked.');
      }
  
      // Update the user's booked buses and the bus route's booked seats.
      user.bookedBuses.push({ busId, seatNumber });
      bus.bookedSeats.push(seatNumber);
  
      await user.save();
      await bus.save();
      res.redirect('/user/booked-buses');
    } catch (error) {
      console.error(error);
      res.status(500).send('Seat booking failed. Please try again later.');
    }
  });
  
 
  // Delete Bus Route
  router.get('/admin/routes/delete/:id', async (req, res) => {
    try {
      const routeId = req.params.id;
  
      // Find the bus route by ID
      const route = await BusRoute.findById(routeId);
  
      if (!route) {
        return res.status(404).send('Bus route not found.');
      }
  
      res.render('deleteBusRoute', { route });
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Error retrieving bus route. Please try again later.');
    }
  });
  router.post('/admin/routes/delete/:id', async (req, res) => {
    try {
      const routeId = req.params.id;  
      // Find the bus route by ID and delete it
      await BusRoute.findByIdAndDelete(routeId);
        
      res.redirect('/admin-profile');
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Error deleting bus route. Please try again later.');
    }
  });

  
  
module.exports = router;
