const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get health dashboard data
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;

    // Get user info
    const user = db.users.findById(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get upcoming consultations
    const today = new Date().toISOString().split('T')[0];
    const upcomingConsultations = db.consultations.findByUserId(user_id)
      .filter(c => c.date >= today && ['confirmed', 'pending'].includes(c.status))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
      .map(c => {
        const doctor = db.doctors.findById(c.doctor_id);
        return {
          id: c.id,
          date: c.date,
          time_slot: c.time_slot,
          type: c.type,
          status: c.status,
          doctor_name: doctor ? doctor.name : 'Unknown Doctor',
          specialization: doctor ? doctor.specialization : '',
          photo_url: doctor ? doctor.photo_url : null
        };
      });

    // Get recent health records
    const recentRecords = db.health_records.findByUserId(user_id)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, 5);

    // Get consultation stats
    const userConsultations = db.consultations.findByUserId(user_id);
    const totalConsultations = userConsultations.length;
    const completedConsultations = userConsultations.filter(c => c.status === 'completed').length;

    // Parse health records data
    const parsedRecords = recentRecords.map(record => ({
      ...record,
      data: typeof record.data === 'string' ? JSON.parse(record.data || '{}') : (record.data || {})
    }));

    res.json({
      success: true,
      dashboard: {
        user: {
          ...user,
          medical_history: user.medical_history ? 
            (typeof user.medical_history === 'string' ? JSON.parse(user.medical_history) : user.medical_history) : 
            null
        },
        upcoming_consultations: upcomingConsultations,
        recent_health_records: parsedRecords,
        stats: {
          total_consultations: totalConsultations,
          completed_consultations: completedConsultations,
          upcoming_count: upcomingConsultations.length
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get dashboard data' 
    });
  }
});

// Add health record
router.post('/records', authenticateToken, (req, res) => {
  try {
    const { type, data } = req.body;
    const user_id = req.user.id;

    if (!type || !data) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type and data are required' 
      });
    }

    const record = db.health_records.create({
      user_id,
      type,
      data: typeof data === 'string' ? data : JSON.stringify(data)
    });

    res.status(201).json({
      success: true,
      message: 'Health record added successfully',
      record: {
        ...record,
        data: typeof data === 'string' ? JSON.parse(data) : data
      }
    });
  } catch (error) {
    console.error('Add health record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add health record' 
    });
  }
});

// Get all health records
router.get('/records', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;
    const { type, limit = 50 } = req.query;

    let records = db.health_records.findByUserId(user_id);

    if (type) {
      records = records.filter(r => r.type === type);
    }

    records = records
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, parseInt(limit));

    const parsedRecords = records.map(record => ({
      ...record,
      data: typeof record.data === 'string' ? JSON.parse(record.data || '{}') : (record.data || {})
    }));

    res.json({
      success: true,
      records: parsedRecords
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get health records' 
    });
  }
});

// Get health record by ID
router.get('/records/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const record = db.health_records.findById(id);

    if (!record || record.user_id !== user_id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Health record not found' 
      });
    }

    res.json({
      success: true,
      record: {
        ...record,
        data: typeof record.data === 'string' ? JSON.parse(record.data || '{}') : (record.data || {})
      }
    });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get health record' 
    });
  }
});

// Delete health record
router.delete('/records/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const record = db.health_records.findById(id);
    
    if (!record || record.user_id !== user_id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Health record not found' 
      });
    }

    db.health_records.delete(id);

    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete health record' 
    });
  }
});

// Update medical history
router.put('/medical-history', authenticateToken, (req, res) => {
  try {
    const { medical_history, allergies } = req.body;
    const user_id = req.user.id;

    db.users.update(user_id, {
      medical_history: medical_history ? JSON.stringify(medical_history) : null,
      allergies: allergies || null
    });

    res.json({
      success: true,
      message: 'Medical history updated successfully'
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update medical history' 
    });
  }
});

// Get health summary
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;

    // Get latest vitals
    const latestVitals = db.health_records.findByUserId(user_id)
      .filter(r => r.type === 'vitals')
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0];

    // Get consultation history by specialty
    const userConsultations = db.consultations.findByUserId(user_id)
      .filter(c => c.status === 'completed');
    
    const specialtyStats = {};
    userConsultations.forEach(c => {
      const doctor = db.doctors.findById(c.doctor_id);
      const specialty = doctor ? doctor.specialization : 'Unknown';
      specialtyStats[specialty] = (specialtyStats[specialty] || 0) + 1;
    });

    const specialty_distribution = Object.entries(specialtyStats).map(([specialization, count]) => ({
      specialization,
      count
    }));

    // Get monthly consultation count
    const monthlyStats = {};
    userConsultations.forEach(c => {
      const month = c.created_at.substring(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    const monthly_consultations = Object.entries(monthlyStats)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([month, count]) => ({ month, count }));

    res.json({
      success: true,
      summary: {
        latest_vitals: latestVitals ? 
          (typeof latestVitals.data === 'string' ? JSON.parse(latestVitals.data) : latestVitals.data) : 
          null,
        specialty_distribution,
        monthly_consultations
      }
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get health summary' 
    });
  }
});

module.exports = router;
