const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    errors.push('Valid 10-digit phone number is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateBooking = (req, res, next) => {
  const { doctor_id, date, time_slot, type } = req.body;
  const errors = [];

  if (!doctor_id) {
    errors.push('Doctor ID is required');
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('Valid date (YYYY-MM-DD) is required');
  }

  if (!time_slot) {
    errors.push('Time slot is required');
  }

  if (!type || !['video', 'audio', 'chat'].includes(type)) {
    errors.push('Valid consultation type (video/audio/chat) is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateBooking
};
