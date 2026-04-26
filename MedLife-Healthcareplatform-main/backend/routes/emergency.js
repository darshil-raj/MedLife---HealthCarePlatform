const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Trigger Emergency SOS
router.post('/sos', authenticateToken, (req, res) => {
  try {
    const { lat, lng, address, emergency_type } = req.body;
    const user_id = req.user.id;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location coordinates are required' 
      });
    }

    // Find nearest hospital with emergency services
    const hospitals = db.hospitals.findAll().filter(h => 
      h.emergency_available === 1 || h.emergency_available === true
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No emergency hospitals found nearby'
      });
    }

    // Calculate distances and find nearest
    let nearestHospital = null;
    let minDistance = Infinity;

    hospitals.forEach(hospital => {
      const distance = calculateDistance(parseFloat(lat), parseFloat(lng), hospital.lat, hospital.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestHospital = { ...hospital, distance_km: Math.round(distance * 10) / 10 };
      }
    });

    // Generate ambulance details
    const ambulanceId = `AMB-${generateRandomString(6)}`;
    const etaMinutes = Math.ceil(minDistance * 2) + 5; // Approximate ETA

    // Create emergency request
    const emergency = db.emergency_requests.create({
      user_id,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address || null,
      status: 'dispatched',
      ambulance_id: ambulanceId,
      hospital_id: nearestHospital.id,
      eta_minutes: etaMinutes
    });

    // Simulate real-time updates
    setTimeout(() => {
      const existing = db.emergency_requests.findById(emergency.id);
      if (existing) {
        db.emergency_requests.update(emergency.id, { status: 'en_route' });
      }
    }, 30000);

    setTimeout(() => {
      const existing = db.emergency_requests.findById(emergency.id);
      if (existing) {
        db.emergency_requests.update(emergency.id, { status: 'arrived' });
      }
    }, etaMinutes * 60 * 1000);

    res.json({
      success: true,
      message: 'Emergency services dispatched',
      emergency: {
        id: emergency.id,
        status: 'dispatched',
        ambulance: {
          id: ambulanceId,
          eta_minutes: etaMinutes,
          current_location: 'Dispatching from nearest station'
        },
        hospital: {
          id: nearestHospital.id,
          name: nearestHospital.name,
          address: nearestHospital.location,
          phone: nearestHospital.phone,
          distance_km: nearestHospital.distance_km,
          beds_available: nearestHospital.available_beds,
          icu_available: nearestHospital.icu_available
        },
        instructions: [
          'Stay calm and do not move the patient unnecessarily',
          'Keep emergency contacts informed',
          'Ambulance will arrive in approximately ' + etaMinutes + ' minutes',
          'Hospital has been notified and is preparing for arrival'
        ]
      }
    });
  } catch (error) {
    console.error('Emergency SOS error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to dispatch emergency services' 
    });
  }
});

// Get emergency request status
router.get('/status/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const emergency = db.emergency_requests.findById(id);

    if (!emergency || emergency.user_id !== user_id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Emergency request not found' 
      });
    }

    const hospital = db.hospitals.findById(emergency.hospital_id);

    res.json({
      success: true,
      emergency: {
        id: emergency.id,
        status: emergency.status,
        ambulance_id: emergency.ambulance_id,
        eta_minutes: emergency.eta_minutes,
        hospital: hospital ? {
          name: hospital.name,
          phone: hospital.phone,
          address: hospital.location
        } : null,
        created_at: emergency.created_at
      }
    });
  } catch (error) {
    console.error('Get emergency status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get emergency status' 
    });
  }
});

// Get user's emergency history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;

    const emergencies = db.emergency_requests.findByUserId(user_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Enrich with hospital info
    const enrichedEmergencies = emergencies.map(emergency => {
      const hospital = db.hospitals.findById(emergency.hospital_id);
      return {
        ...emergency,
        hospital_name: hospital ? hospital.name : 'Unknown Hospital'
      };
    });

    res.json({
      success: true,
      emergencies: enrichedEmergencies
    });
  } catch (error) {
    console.error('Get emergency history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get emergency history' 
    });
  }
});

// Get emergency contacts template
router.get('/contacts', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;
    const user = db.users.findById(user_id);

    res.json({
      success: true,
      emergency_numbers: {
        ambulance: '108',
        police: '100',
        fire: '101',
        disaster_management: '108',
        women_helpline: '1091',
        child_helpline: '1098',
        senior_citizen: '14567'
      },
      user_info: {
        phone: user?.phone,
        location: user?.location
      }
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get emergency contacts' 
    });
  }
});

// Helper functions
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;
