// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel'); // Adjust the path according to your structure

// POST /signup route for registering a new user
router.post('/signup', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    // Save the user in the database
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating the user', error: error });
  }
});

router.post('/login', async (req, res) => {
    console.log(req.body);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log("User Found: ", user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(user.password);
    console.log(password);
    if (isMatch) {
        console.log(!isMatch);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If login is successful, send a positive response
    res.status(200).json({ message: 'Login successful', user: user._id });
    // Optionally, you could create and send a JWT token here
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST endpoint to save user's BMI
router.post('/save-bmi', async (req, res) => {
    const { username, bmi } = req.body;
    console.log(username + " " + bmi)

    // Optional: Add authentication check here

    try {
        const user = await User.findOneAndUpdate(
            { username },
            { $set: { bmi: bmi } },
            { new: true }
        );

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).json({ message: 'BMI updated successfully', updatedBMI: user.bmi });
    } catch (error) {
        res.status(500).json({ message: 'Error updating BMI', error: error });
    }
});


// POST route to handle survey data
router.post('/fitness-survey', async (req, res) => {
    const { username, gender, height, weight, fitnessGoals, currentActivityLevel, dietaryPreferences } = req.body;

    // Optional: Add authentication check here

    try {
        // Update the user with survey data
        const updatedUser = await User.findOneAndUpdate(
            { username },
            { 
                $set: { 
                    gender, 
                    height, 
                    weight, 
                    fitnessGoals, 
                    currentActivityLevel, 
                    dietaryPreferences 
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            
            return res.status(404).send('User not found');
        }

        res.status(200).json({ message: 'Survey data updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating survey data', error: error });
    }
});
module.exports = router;