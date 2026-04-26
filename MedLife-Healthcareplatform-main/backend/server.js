const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase } = require('./db');

// Initialize database
initDatabase();

// Auto-seed if database is empty
if (!db.data.doctors || db.data.doctors.length === 0) {
  console.log('📦 Database is empty, auto-seeding...');
  try {
    require('./seed');
    console.log('✅ Auto-seed complete!');
  } catch (e) {
    console.error('⚠️ Auto-seed failed:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve doctor photo images as static files
app.use('/images', express.static(path.join(__dirname, '../frontend/src/assets/images')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/ai', require('./routes/ai-assistant'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/health', require('./routes/health-profile'));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MedLife API is running',
    timestamp: new Date().toISOString(),
    doctors_count: db.data.doctors?.length || 0,
    hospitals_count: db.data.hospitals?.length || 0
  });
});

// Simulate real-time hospital bed updates
setInterval(() => {
  try {
    const hospitals = db.hospitals.findAll();
    hospitals.forEach(hospital => {
      const bedChange = Math.floor(Math.random() * 7) - 3;
      const icuChange = Math.floor(Math.random() * 3) - 1;
      const ventChange = Math.floor(Math.random() * 3) - 1;

      db.hospitals.update(hospital.id, {
        available_beds: Math.max(0, Math.min(hospital.total_beds, hospital.available_beds + bedChange)),
        icu_available: Math.max(0, Math.min(hospital.icu_total, hospital.icu_available + icuChange)),
        ventilators_available: Math.max(0, Math.min(hospital.ventilators_total, hospital.ventilators_available + ventChange)),
        last_updated: new Date().toISOString()
      });
    });
  } catch (error) {
    // silent
  }
}, 30000);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║  🏥 MedLife Healthcare API — Port ${PORT}          ║
║  📊 Doctors: ${String(db.data.doctors?.length || 0).padEnd(4)} | Hospitals: ${String(db.data.hospitals?.length || 0).padEnd(4)}     ║
║  🌍 Real data: OpenStreetMap Overpass API        ║
╚══════════════════════════════════════════════════╝
  `);
});
