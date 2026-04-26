const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'medlife-db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial database structure
const initialData = {
  users: [],
  doctors: [],
  hospitals: [],
  consultations: [],
  health_records: [],
  emergency_requests: [],
  ai_chat_history: []
};

// Load database
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading DB:', error);
  }
  return { ...initialData };
}

// Save database
function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving DB:', error);
  }
}

// Database operations
const db = {
  data: loadDB(),

  // Users
  users: {
    findAll: () => db.data.users,
    findById: (id) => db.data.users.find(u => u.id === id),
    findByEmail: (email) => db.data.users.find(u => u.email === email),
    create: (userData) => {
      const user = { id: uuidv4(), ...userData, created_at: new Date().toISOString() };
      db.data.users.push(user);
      saveDB(db.data);
      return user;
    },
    update: (id, updates) => {
      const index = db.data.users.findIndex(u => u.id === id);
      if (index !== -1) {
        db.data.users[index] = { ...db.data.users[index], ...updates };
        saveDB(db.data);
        return db.data.users[index];
      }
      return null;
    }
  },

  // Doctors
  doctors: {
    findAll: () => db.data.doctors,
    findById: (id) => db.data.doctors.find(d => d.id === id),
    create: (doctorData) => {
      const doctor = { id: uuidv4(), ...doctorData };
      db.data.doctors.push(doctor);
      saveDB(db.data);
      return doctor;
    },
    update: (id, updates) => {
      const index = db.data.doctors.findIndex(d => d.id === id);
      if (index !== -1) {
        db.data.doctors[index] = { ...db.data.doctors[index], ...updates };
        saveDB(db.data);
        return db.data.doctors[index];
      }
      return null;
    }
  },

  // Hospitals
  hospitals: {
    findAll: () => db.data.hospitals,
    findById: (id) => db.data.hospitals.find(h => h.id === id),
    create: (hospitalData) => {
      const hospital = { id: uuidv4(), ...hospitalData, last_updated: new Date().toISOString() };
      db.data.hospitals.push(hospital);
      saveDB(db.data);
      return hospital;
    },
    update: (id, updates) => {
      const index = db.data.hospitals.findIndex(h => h.id === id);
      if (index !== -1) {
        db.data.hospitals[index] = { ...db.data.hospitals[index], ...updates, last_updated: new Date().toISOString() };
        saveDB(db.data);
        return db.data.hospitals[index];
      }
      return null;
    }
  },

  // Consultations
  consultations: {
    findAll: () => db.data.consultations,
    findById: (id) => db.data.consultations.find(c => c.id === id),
    findByUserId: (userId) => db.data.consultations.filter(c => c.user_id === userId),
    create: (consultationData) => {
      const consultation = { 
        id: uuidv4(), 
        ...consultationData, 
        created_at: new Date().toISOString(),
        status: consultationData.status || 'pending'
      };
      db.data.consultations.push(consultation);
      saveDB(db.data);
      return consultation;
    },
    update: (id, updates) => {
      const index = db.data.consultations.findIndex(c => c.id === id);
      if (index !== -1) {
        db.data.consultations[index] = { ...db.data.consultations[index], ...updates };
        saveDB(db.data);
        return db.data.consultations[index];
      }
      return null;
    }
  },

  // Health Records
  health_records: {
    findAll: () => db.data.health_records,
    findById: (id) => db.data.health_records.find(r => r.id === id),
    findByUserId: (userId) => db.data.health_records.filter(r => r.user_id === userId),
    create: (recordData) => {
      const record = { 
        id: uuidv4(), 
        ...recordData, 
        recorded_at: new Date().toISOString() 
      };
      db.data.health_records.push(record);
      saveDB(db.data);
      return record;
    },
    delete: (id) => {
      const index = db.data.health_records.findIndex(r => r.id === id);
      if (index !== -1) {
        db.data.health_records.splice(index, 1);
        saveDB(db.data);
        return true;
      }
      return false;
    }
  },

  // Emergency Requests
  emergency_requests: {
    findAll: () => db.data.emergency_requests,
    findByUserId: (userId) => db.data.emergency_requests.filter(e => e.user_id === userId),
    findById: (id) => db.data.emergency_requests.find(e => e.id === id),
    create: (requestData) => {
      const request = { 
        id: uuidv4(), 
        ...requestData, 
        created_at: new Date().toISOString(),
        status: requestData.status || 'dispatched'
      };
      db.data.emergency_requests.push(request);
      saveDB(db.data);
      return request;
    },
    update: (id, updates) => {
      const index = db.data.emergency_requests.findIndex(e => e.id === id);
      if (index !== -1) {
        db.data.emergency_requests[index] = { ...db.data.emergency_requests[index], ...updates };
        saveDB(db.data);
        return db.data.emergency_requests[index];
      }
      return null;
    }
  },

  // AI Chat History
  ai_chat_history: {
    findAll: () => db.data.ai_chat_history,
    findByUserId: (userId, limit = 20) => {
      return db.data.ai_chat_history
        .filter(h => h.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    },
    create: (chatData) => {
      const chat = { 
        id: uuidv4(), 
        ...chatData, 
        created_at: new Date().toISOString() 
      };
      db.data.ai_chat_history.push(chat);
      saveDB(db.data);
      return chat;
    }
  },

  // Reset database
  reset: () => {
    db.data = { ...initialData };
    saveDB(db.data);
  }
};

module.exports = { db, loadDB, saveDB };
