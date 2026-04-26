const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validate');

const router = express.Router();

// Register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, phone, password, age, gender, location, pincode } = req.body;

    // Check if user exists
    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const user = db.users.create({
      name,
      email,
      phone,
      password: hashedPassword,
      age: age || null,
      gender: gender || null,
      location: location || null,
      pincode: pincode || null
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location
      }
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    const user = db.users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get consultation count
    const consultationCount = db.consultations.findByUserId(req.user.id).length;

    // Get health records count
    const healthRecordsCount = db.health_records.findByUserId(req.user.id).length;

    res.json({
      success: true,
      user: {
        ...user,
        consultation_count: consultationCount,
        health_records_count: healthRecordsCount
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user profile' 
    });
  }
});

// Update user profile
router.put('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    const { age, gender, blood_group, location, pincode, medical_history, allergies } = req.body;

    db.users.update(req.user.id, {
      age,
      gender,
      blood_group,
      location,
      pincode,
      medical_history,
      allergies
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

module.exports = router;
