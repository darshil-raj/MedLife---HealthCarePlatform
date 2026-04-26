const express = require('express');
const { db } = require('../db');
const axios = require('axios');

const router = express.Router();

// Search doctors with filters
router.get('/search', (req, res) => {
  try {
    const {
      q,
      specialization,
      location,
      available,
      lang,
      maxFee,
      minRating,
      online,
      page = 1,
      sort = 'rating'
    } = req.query;

    const limit = 10;
    const offset = (page - 1) * limit;

    // Get all doctors and apply filters
    let doctors = db.doctors.findAll();

    // Full text search
    if (q) {
      const searchTerm = q.toLowerCase();
      doctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.specialization.toLowerCase().includes(searchTerm) ||
        doc.hospital.toLowerCase().includes(searchTerm) ||
        doc.location.toLowerCase().includes(searchTerm)
      );
    }

    // Specialization filter
    if (specialization) {
      doctors = doctors.filter(doc => doc.specialization === specialization);
    }

    // Location filter
    if (location) {
      const locTerm = location.toLowerCase();
      doctors = doctors.filter(doc => 
        doc.location.toLowerCase().includes(locTerm) || 
        (doc.state && doc.state.toLowerCase().includes(locTerm))
      );
    }

    // Available today filter
    if (available === 'true') {
      doctors = doctors.filter(doc => doc.available_today === 1 || doc.available_today === true);
    }

    // Language filter
    if (lang) {
      doctors = doctors.filter(doc => {
        const languages = typeof doc.languages === 'string' ? JSON.parse(doc.languages) : doc.languages;
        return languages.some(l => l.toLowerCase().includes(lang.toLowerCase()));
      });
    }

    // Max fee filter
    if (maxFee) {
      doctors = doctors.filter(doc => doc.consultation_fee <= parseInt(maxFee));
    }

    // Min rating filter
    if (minRating) {
      doctors = doctors.filter(doc => doc.rating >= parseFloat(minRating));
    }

    // Online filter
    if (online === 'true') {
      doctors = doctors.filter(doc => doc.is_online === 1 || doc.is_online === true);
    }

    // Sort options
    switch (sort) {
      case 'fee':
        doctors.sort((a, b) => a.consultation_fee - b.consultation_fee);
        break;
      case 'experience':
        doctors.sort((a, b) => b.experience_years - a.experience_years);
        break;
      case 'reviews':
        doctors.sort((a, b) => b.total_reviews - a.total_reviews);
        break;
      default:
        doctors.sort((a, b) => b.rating - a.rating);
    }

    const total = doctors.length;

    // Apply pagination
    const paginatedDoctors = doctors.slice(offset, offset + limit);

    // Parse languages JSON
    const parsedDoctors = paginatedDoctors.map(doc => ({
      ...doc,
      languages: typeof doc.languages === 'string' ? JSON.parse(doc.languages || '[]') : (doc.languages || [])
    }));

    res.json({
      success: true,
      doctors: parsedDoctors,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search doctors' 
    });
  }
});

// Get doctor by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const doctor = db.doctors.findById(id);

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Parse languages
    doctor.languages = typeof doctor.languages === 'string' ? 
      JSON.parse(doctor.languages || '[]') : 
      (doctor.languages || []);

    // Generate sample reviews
    const reviews = [
      { rating: 5, comment: "Excellent doctor, very patient and thorough.", author: "Patient A", date: "2024-01-15" },
      { rating: 5, comment: "Highly knowledgeable and caring.", author: "Patient B", date: "2024-01-10" },
      { rating: 4, comment: "Good experience overall, would recommend.", author: "Patient C", date: "2024-01-05" },
      { rating: 5, comment: "Best doctor I've consulted online.", author: "Patient D", date: "2023-12-28" },
      { rating: 4, comment: "Professional and helpful.", author: "Patient E", date: "2023-12-20" }
    ];

    // Generate available slots for next 7 days
    const slots = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      slots.push({
        date: dateStr,
        slots: generateTimeSlots(dateStr)
      });
    }

    res.json({
      success: true,
      doctor: {
        ...doctor,
        reviews,
        available_slots: slots
      }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get doctor details' 
    });
  }
});

// Get available slots for a specific date
router.get('/:id/slots', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid date (YYYY-MM-DD) is required' 
      });
    }

    const doctor = db.doctors.findById(id);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    const slots = generateTimeSlots(date);

    res.json({
      success: true,
      date,
      slots
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get available slots' 
    });
  }
});

// Helper function to generate time slots
function generateTimeSlots(date) {
  const slots = [];
  const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  const eveningSlots = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'];
  
  const allSlots = [...morningSlots, ...eveningSlots];
  
  // Randomly mark 30% as booked
  allSlots.forEach(time => {
    const isBooked = Math.random() < 0.3;
    slots.push({
      time,
      available: !isBooked
    });
  });

  return slots;
}

// Get all specializations
// Get REAL doctors from OpenStreetMap (no fake data)
router.get('/real/search', async (req, res) => {
  try {
    const {
      location = 'India',
      specialization = '',
      q = '',
      maxFee = '',
      available = '',
      online = '',
      lat,
      lon
    } = req.query;

    console.log('Searching for real doctors near:', location);

    // Step 1: Geocode location to coordinates if not provided
    let coordinates = { lat, lon };
    if (!lat || !lon) {
      console.log('Geocoding location:', location);
      coordinates = await geocodeLocation(location);
      if (!coordinates) {
        return res.status(400).json({
          success: false,
          message: 'Could not find coordinates for the specified location'
        });
      }
    }

    console.log('Using coordinates:', coordinates);

    // Step 2: Search for healthcare facilities using Overpass API
    const doctors = await searchNearbyDoctors(coordinates.lat, coordinates.lon);

    // Step 3: Filter and sort results
    let filteredDoctors = doctors;

    // Filter by specialization if specified
    if (specialization) {
      filteredDoctors = filteredDoctors.filter(doc =>
        doc.specialization && doc.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // Filter by search query
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredDoctors = filteredDoctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm)) ||
        (doc.address && doc.address.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by distance
    filteredDoctors.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${filteredDoctors.length} real doctors near ${location}`);

    res.json({
      success: true,
      doctors: filteredDoctors,
      location: coordinates.display_name || location,
      searchOrigin: location,
      coordinates
    });

  } catch (error) {
    console.error('Real doctor search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for doctors. Please try again.',
      error: error.message
    });
  }
});

// Geocode location using Nominatim
async function geocodeLocation(location) {
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;

  try {
    const response = await axios.get(nominatimUrl, {
      headers: {
        'User-Agent': 'MedLife Healthcare App'
      },
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }

  return null;
}

// Search for doctors using Overpass API with retry logic
async function searchNearbyDoctors(lat, lon) {
  const radius = 5000; // 5km radius

  // Overpass query for healthcare facilities
  const overpassQuery = `
[out:json][timeout:25];
(
  node["amenity"~"^(doctors|clinic|hospital|dentist|pharmacy)$"](around:${radius},${lat},${lon});
  way["amenity"~"^(doctors|clinic|hospital|dentist|pharmacy)$"](around:${radius},${lat},${lon});
  node["healthcare"~"^(doctor|clinic|hospital|centre|dentist|pharmacy)$"](around:${radius},${lat},${lon});
  way["healthcare"~"^(doctor|clinic|hospital|centre|dentist|pharmacy)$"](around:${radius},${lat},${lon});
);
out center tags 80;
`;

  // Multiple Overpass servers to try (for reliability)
  const servers = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/cgi/interpreter'
  ];

  for (const server of servers) {
    try {
      console.log(`Trying Overpass server: ${server}`);

      const response = await axios.post(server, overpassQuery, {
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'MedLife Healthcare App'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data && response.data.elements) {
        console.log(`Got ${response.data.elements.length} results from ${server}`);

        const doctors = response.data.elements
          .filter(element => element.tags && (element.tags.name || element.tags['name:en']))
          .map(element => {
            const tags = element.tags;
            const name = tags.name || tags['name:en'] || 'Unnamed Healthcare Facility';

            // Calculate distance
            const elementLat = element.lat || (element.center && element.center.lat);
            const elementLon = element.lon || (element.center && element.center.lon);
            const distance = calculateDistance(lat, lon, elementLat, elementLon);

            // Map OSM tags to our doctor format
            const doctor = {
              id: element.id.toString(),
              name: name,
              specialization: getSpecializationFromTags(tags),
              hospital: tags.operator || tags.brand || '',
              location: formatAddress(tags),
              state: tags['addr:state'] || '',
              languages: '["English"]',
              consultation_fee: null,
              rating: null,
              total_reviews: null,
              available_today: null,
              next_slot: null,
              photo_url: null,
              bio: getBioFromTags(tags),
              is_online: false,
              distance: Math.round(distance * 10) / 10,
              phone: tags.phone || tags['contact:phone'] || null,
              website: tags.website || tags['contact:website'] || null,
              opening_hours: tags.opening_hours || null,
              source: 'osm'
            };

            return doctor;
          })
          .filter(doctor => doctor.distance <= radius / 1000) // Filter by actual distance
          .slice(0, 50); // Limit results

        return doctors;
      }

    } catch (error) {
      console.log(`Failed with ${server}:`, error.message);
      continue; // Try next server
    }
  }

  console.log('All Overpass servers failed');
  return [];
}

// Helper functions
function getSpecializationFromTags(tags) {
  const healthcare = tags.healthcare;
  const amenity = tags.amenity;

  if (healthcare === 'doctor') return 'General Physician';
  if (healthcare === 'clinic') return 'Clinic';
  if (healthcare === 'hospital') return 'Hospital';
  if (healthcare === 'dentist') return 'Dentist';
  if (healthcare === 'pharmacy') return 'Pharmacy';

  if (amenity === 'doctors') return 'General Physician';
  if (amenity === 'clinic') return 'Clinic';
  if (amenity === 'hospital') return 'Hospital';
  if (amenity === 'dentist') return 'Dentist';
  if (amenity === 'pharmacy') return 'Pharmacy';

  // Check for speciality tags
  if (tags['healthcare:speciality']) {
    const spec = tags['healthcare:speciality'];
    if (spec.includes('cardiology')) return 'Cardiologist';
    if (spec.includes('dermatology')) return 'Dermatologist';
    if (spec.includes('orthopedics')) return 'Orthopedic Surgeon';
    if (spec.includes('pediatrics')) return 'Pediatrician';
    if (spec.includes('gynecology')) return 'Gynecologist';
    if (spec.includes('neurology')) return 'Neurologist';
    if (spec.includes('oncology')) return 'Oncologist';
  }

  return 'Healthcare Facility';
}

function formatAddress(tags) {
  const parts = [];
  if (tags['addr:full']) return tags['addr:full'];
  if (tags['addr:housename']) parts.push(tags['addr:housename']);
  if (tags['addr:housenumber'] && tags['addr:street']) parts.push(tags['addr:housenumber'] + ' ' + tags['addr:street']);
  else if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:district']) parts.push(tags['addr:district']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

  return parts.length > 0 ? parts.join(', ') : (tags.name ? tags.name : 'Address not listed');
}

function getEstimatedFee(tags) {
  // Estimate fees based on facility type
  if (tags.healthcare === 'hospital' || tags.amenity === 'hospital') {
    return Math.floor(Math.random() * 500) + 500; // 500-1000
  }
  if (tags.healthcare === 'clinic' || tags.amenity === 'clinic') {
    return Math.floor(Math.random() * 300) + 200; // 200-500
  }
  if (tags.healthcare === 'dentist' || tags.amenity === 'dentist') {
    return Math.floor(Math.random() * 200) + 300; // 300-500
  }
  return Math.floor(Math.random() * 400) + 200; // 200-600
}

function getNextSlot() {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 17) { // Before 5 PM
    return 'Today ' + (hours + 1) + ':00 PM';
  } else {
    return 'Tomorrow 10:00 AM';
  }
}

function getBioFromTags(tags) {
  const descriptions = [];

  if (tags.healthcare === 'hospital') descriptions.push('Hospital providing comprehensive healthcare services');
  if (tags.healthcare === 'clinic') descriptions.push('Medical clinic offering specialized care');
  if (tags.healthcare === 'doctor') descriptions.push('Medical practice providing healthcare services');
  if (tags.healthcare === 'dentist') descriptions.push('Dental care facility');
  if (tags.healthcare === 'pharmacy') descriptions.push('Pharmacy providing medications and health products');

  if (tags.opening_hours) descriptions.push(`Operating hours: ${tags.opening_hours}`);
  if (tags.phone) descriptions.push(`Contact: ${tags.phone}`);

  return descriptions.length > 0 ? descriptions.join('. ') : 'Healthcare facility providing medical services.';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get all specializations
router.get('/meta/specializations', (req, res) => {
  const specializations = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedic Surgeon',
    'Neurologist',
    'Gynecologist',
    'Oncologist',
    'Dentist',
    'Psychiatrist',
    'Endocrinologist',
    'Gastroenterologist',
    'Ophthalmologist'
  ];

  res.json({
    success: true,
    specializations
  });
});

module.exports = router;
