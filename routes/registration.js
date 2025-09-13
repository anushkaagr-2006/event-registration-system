const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const QRCode = require('qrcode');

// Generate unique registration ID
const generateRegistrationId = () => {
  const prefix = 'EVT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Register a new participant
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email already exists
    const existingRegistration = await Registration.findOne({ email });
    if (existingRegistration) {
      return res.status(400).json({ 
        error: 'This email is already registered.',
        registrationId: existingRegistration.registrationId 
      });
    }

    // Generate unique registration ID
    const registrationId = generateRegistrationId();

    // Generate QR code
    const qrData = JSON.stringify({
      registrationId,
      email,
      name
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Create new registration
    const registration = new Registration({
      name,
      email,
      registrationId,
      qrCode
    });

    await registration.save();

    res.status(201).json({
      message: 'Registration successful!',
      registration: {
        name: registration.name,
        email: registration.email,
        registrationId: registration.registrationId,
        qrCode: registration.qrCode
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Mark attendance by scanning QR code
router.post('/attendance/scan', async (req, res) => {
  try {
    const { registrationId } = req.body;

    const registration = await Registration.findOne({ registrationId });

    if (!registration) {
      return res.status(404).json({ error: 'Invalid QR Code. Registration not found.' });
    }

    if (registration.isPresent) {
      return res.status(400).json({ 
        error: 'Already checked in!',
        checkInTime: registration.checkInTime,
        name: registration.name
      });
    }

    // Mark as present
    registration.isPresent = true;
    registration.checkInTime = new Date();
    await registration.save();

    res.json({
      message: 'Check-in successful!',
      participant: {
        name: registration.name,
        email: registration.email,
        registrationId: registration.registrationId,
        checkInTime: registration.checkInTime
      }
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ error: 'Server error during check-in' });
  }
});

// Get registration details by ID
router.get('/registration/:registrationId', async (req, res) => {
  try {
    const registration = await Registration.findOne({ 
      registrationId: req.params.registrationId 
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
