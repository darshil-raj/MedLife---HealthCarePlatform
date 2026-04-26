const { db } = require('./db-json');

function initDatabase() {
  console.log('✅ JSON Database initialized successfully');
}

module.exports = { db, initDatabase };
