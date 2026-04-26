const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validate');

const router = express.Router();

// Book a consultation
router.post('/book', authenticateToken, validateBooking, (req, res) => {
  try {
    const { doctor_id, date, time_slot, type, symptoms, notes } = req.body;
    const user_id = req.user.id;

    // Check if doctor exists
    const doctor = db.doctors.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Check if slot is already booked
    const existingBookings = db.consultations.findByUserId(user_id);
    const slotTaken = existingBookings.some(booking => 
      booking.doctor_id === doctor_id && 
      booking.date === date && 
      booking.time_slot === time_slot && 
      booking.status !== 'cancelled'
    );

    if (slotTaken) {
      return res.status(409).json({ 
        success: false, 
        message: 'This slot is already booked. Please select another time.' 
      });
    }

    // Generate meeting link
    const meetingLink = `https://meet.medlife.in/room/${generateRandomString(8)}`;

    // Create booking
    const booking = db.consultations.create({
      user_id,
      doctor_id,
      date,
      time_slot,
      type,
      symptoms: symptoms || null,
      notes: notes || null,
      fee: doctor.consultation_fee,
      meeting_link: meetingLink,
      status: 'confirmed'
    });

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      booking: {
        ...booking,
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization,
          photo_url: doctor.photo_url
        }
      }
    });
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book consultation' 
    });
  }
});

// Get user's consultations
router.get('/my', authenticateToken, (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const user_id = req.user.id;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Get all consultations for user
    let consultations = db.consultations.findByUserId(user_id);

    // Filter by status if provided
    if (status) {
      consultations = consultations.filter(c => c.status === status);
    }

    const total = consultations.length;

    // Sort by date descending
    consultations.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination
    const paginatedConsultations = consultations.slice(offset, offset + limit);

    // Enrich with doctor info
    const formattedConsultations = paginatedConsultations.map(c => {
      const doctor = db.doctors.findById(c.doctor_id);
      return {
        ...c,
        doctor: doctor ? {
          name: doctor.name,
          specialization: doctor.specialization,
          photo_url: doctor.photo_url,
          hospital: doctor.hospital
        } : null
      };
    });

    res.json({
      success: true,
      consultations: formattedConsultations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get consultations' 
    });
  }
});

// Get consultation by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const consultation = db.consultations.findById(id);

    if (!consultation || consultation.user_id !== user_id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found' 
      });
    }

    const doctor = db.doctors.findById(consultation.doctor_id);

    res.json({
      success: true,
      consultation: {
        ...consultation,
        doctor: doctor ? {
          name: doctor.name,
          specialization: doctor.specialization,
          photo_url: doctor.photo_url,
          hospital: doctor.hospital,
          phone: doctor.phone
        } : null
      }
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get consultation' 
    });
  }
});

// Cancel consultation
router.put('/:id/cancel', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const consultation = db.consultations.findById(id);
    
    if (!consultation || consultation.user_id !== user_id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found' 
      });
    }

    if (consultation.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Consultation is already cancelled' 
      });
    }

    if (consultation.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel a completed consultation' 
      });
    }

    db.consultations.update(id, { status: 'cancelled' });

    res.json({
      success: true,
      message: 'Consultation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel consultation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel consultation' 
    });
  }
});

// Add prescription (doctor only - simulated)
router.put('/:id/prescription', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { prescription } = req.body;
    const user_id = req.user.id;

    const consultation = db.consultations.findById(id);
    
    if (!consultation || consultation.user_id !== user_id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found' 
      });
    }

    db.consultations.update(id, { 
      prescription, 
      status: 'completed' 
    });

    res.json({
      success: true,
      message: 'Prescription added successfully'
    });
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add prescription' 
    });
  }
});

// Get upcoming consultations
router.get('/my/upcoming', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const consultations = db.consultations.findByUserId(user_id)
      .filter(c => c.date >= today && ['confirmed', 'pending'].includes(c.status))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    const formattedConsultations = consultations.map(c => {
      const doctor = db.doctors.findById(c.doctor_id);
      return {
        ...c,
        doctor: doctor ? {
          name: doctor.name,
          specialization: doctor.specialization,
          photo_url: doctor.photo_url
        } : null
      };
    });

    res.json({
      success: true,
      consultations: formattedConsultations
    });
  } catch (error) {
    console.error('Get upcoming consultations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get upcoming consultations' 
    });
  }
});

// Helper function to generate random string
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;
