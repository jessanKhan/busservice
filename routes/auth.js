// auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
// Set the SendGrid API key
sgMail.setApiKey("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");
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  try {
    const { name, id, email, password ,role} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).send('User with this ID already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      id,
      email,
      password: hashedPassword,
      role: role===undefined?'student':role
    });
    await newUser.save();

    // res.send('Registration successful!');
   
    res.redirect('/auth/login')
  } catch (error) {
    res.status(500).send('Error registering user. Please try again later.');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
    try {
      const { id, password } = req.body;
        console.log("first login")
      // Check if user exists
      const user = await User.findOne({ id });
      console.log("2nd login",user)

      if (!user) {
        return res.status(404).send('User not found.');
      }
  
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send('Invalid password.');
      }
      
      // Set the userId in the session upon successful login
      req.session.userId = user._id;
      if ( user.role==='admin' ) {
      res.redirect('/admin-profile');
       
      } else {
      res.redirect('/profile');
        
      }
      // Redirect to the profile page
    } catch (error) {
        res.status(500).send({ error: error });
    }
  });



  router.get('/reset-password', (req, res) => {
    res.render('reset-password', { step: 'email' });
  });
  
  router.post('/reset-password', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Generate a random OTP
      const otp = crypto.randomBytes(3).toString('hex');
  
      // Hash the OTP before storing in the database
      const hashedOtp = await bcrypt.hash(otp, 10);
  
      // Save the hashed OTP in the user document
      await User.updateOne({ email }, { otp: hashedOtp });
  
      // Send the OTP to the user's email
      const msg = {
        to: email,
        from: 'noreply@example.com', // Replace with your email address
        subject: 'Password Reset OTP',
        text: `Your OTP is: ${otp}`,
      };
      await sgMail.send(msg);
  
      res.send('OTP sent successfully! Please check your email.');
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Error sending OTP. Please try again later.');
    }
  });

router.get('/logout', (req, res) => {
    // Destroy the session and redirect to the login page
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error logging out. Please try again later.');
      }
      res.redirect('/auth/login');
    });
  });




  
  
module.exports = router;
