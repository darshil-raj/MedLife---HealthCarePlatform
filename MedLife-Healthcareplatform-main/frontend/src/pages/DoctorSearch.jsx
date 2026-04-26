import React, { useState, useEffect } from 'react';
import { doctorsAPI, consultationsAPI } from '../api/medlife-api';
import './DoctorSearch.css';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState('local');
  const [searchOrigin, setSearchOrigin] = useState('');
  const [filters, setFilters] = useState({
    q: '', specialization: '', location: '', maxFee: '', available: false, online: false
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', time_slot: '', type: 'video', symptoms: '' });
  const [slots, setSlots] = useState([]);

  useEffect(() => { fetchDoctors(); }, [searchMode]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filters).forEach(key => { if (filters[key]) params[key] = filters[key]; });

      if (searchMode === 'real') {
        if (!filters.location) { setDoctors([]); setLoading(false); return; }
        try {
          const response = await doctorsAPI.searchReal({ location: filters.location, ...params });
          setDoctors(response.data.doctors || []);
          setSearchOrigin(response.data.searchOrigin || filters.location);
        } catch (err) {
          console.error('Real data fetch error:', err);
          setDoctors([]);
        }
      } else {
        const response = await doctorsAPI.search(params);
        setDoctors(response.data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchDoctors();
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openBookingModal = async (doctor) => {
    setSelectedDoctor(doctor);
    setBookingModal(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await doctorsAPI.getSlots(doctor.id, today);
      setSlots(response.data.slots.filter(s => s.available));
    } catch (error) {
      setSlots([]);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await consultationsAPI.book({
        doctor_id: selectedDoctor.id,
        date: bookingData.date,
        time_slot: bookingData.time_slot,
        type: bookingData.type,
        symptoms: bookingData.symptoms
      });
      alert('Consultation booked successfully!');
      setBookingModal(false);
      setBookingData({ date: '', time_slot: '', type: 'video', symptoms: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book consultation');
    }
  };

  const doctorCount = doctors.length;
  const isOSM = searchMode === 'real';

  const getPhotoSrc = (doctor) => {
    if (!doctor.photo_url || doctor.photo_url === '') return null;
    if (doctor.photo_url.includes('randomuser.me')) return null;
    if (doctor.photo_url.includes('dicebear')) return null;
    // For local seed data served by backend
    if (doctor.photo_url.startsWith('/images/')) {
      return `http://localhost:5000${doctor.photo_url}`;
    }
    return doctor.photo_url;
  };

  return (
    <div className="doctor-search">
      <div className="page-header">
        <div className="container">
          <h1>Find Doctors</h1>
          <p>Search and book appointments with healthcare professionals across India</p>
        </div>
      </div>

      <div className="container">
        {/* Search Mode Tabs */}
        <div className="search-tabs">
          <button 
            className={`tab ${searchMode === 'local' ? 'active' : ''}`}
            onClick={() => setSearchMode('local')}
          >
            Our Doctors ({searchMode === 'local' ? doctorCount : '50+'})
          </button>
          <button 
            className={`tab ${searchMode === 'real' ? 'active' : ''}`}
            onClick={() => setSearchMode('real')}
          >
            Real-Time Search (OpenStreetMap)
          </button>
        </div>

        <div className="search-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filter-card">
              <h3>Search Filters</h3>
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label>Search</label>
                  <input type="text" name="q" className="form-control" placeholder="Doctor name, specialty..." value={filters.q} onChange={handleFilterChange} />
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <select name="specialization" className="form-control" value={filters.specialization} onChange={handleFilterChange}>
                    <option value="">All Specializations</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location {isOSM && <span className="required">*</span>}</label>
                  <input type="text" name="location" className="form-control" placeholder={isOSM ? 'Enter city (required)' : 'City or state'} value={filters.location} onChange={handleFilterChange} />
                </div>

                {!isOSM && (
                  <div className="form-group">
                    <label>Max Fee (₹)</label>
                    <input type="number" name="maxFee" className="form-control" placeholder="e.g., 500" value={filters.maxFee} onChange={handleFilterChange} />
                  </div>
                )}

                {!isOSM && (
                  <>
                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input type="checkbox" name="available" checked={filters.available} onChange={handleFilterChange} />
                        <span>Available Today</span>
                      </label>
                    </div>
                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input type="checkbox" name="online" checked={filters.online} onChange={handleFilterChange} />
                        <span>Online Consultation</span>
                      </label>
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary search-btn-full">Search Doctors</button>
              </form>
            </div>
          </aside>

          {/* Doctors List */}
          <div className="doctors-list">
            {loading ? (
              <div className="loading-container"><div className="spinner"></div><p>Searching for doctors...</p></div>
            ) : doctorCount > 0 ? (
              <>
                <div className="results-info">
                  <span className="results-count">Found <strong>{doctorCount}</strong> {isOSM ? 'facilities' : 'doctors'}</span>
                  {isOSM && searchOrigin && <span className="badge badge-info">Near {searchOrigin}</span>}
                </div>
                {doctors.map(doctor => (
                  <div key={doctor.id} className="doctor-card">
                    <div className="doctor-main">
                      {getPhotoSrc(doctor) ? (
                        <img 
                          src={getPhotoSrc(doctor)}
                          alt={doctor.name}
                          className="doctor-photo"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="doctor-photo-placeholder">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                      )}
                      <div className="doctor-details">
                        <h3>{doctor.name}</h3>
                        <p className="spec">{doctor.specialization}</p>
                        {doctor.hospital && <p className="hospital">{doctor.hospital}</p>}
                        {doctor.location && doctor.location !== 'Address not listed' && (
                          <p className="location">{doctor.location}</p>
                        )}
                        <div className="doctor-meta">
                          {doctor.rating != null && <span className="rating">★ {typeof doctor.rating === 'number' ? doctor.rating.toFixed(1) : doctor.rating}</span>}
                          {doctor.total_reviews != null && <span className="reviews">({doctor.total_reviews} reviews)</span>}
                          {doctor.experience_years && <span className="exp">{doctor.experience_years}+ yrs</span>}
                          {doctor.distance != null && (
                            <span className="dist">
                              {doctor.distance} km {isOSM && searchOrigin ? `from ${searchOrigin}` : ''}
                            </span>
                          )}
                        </div>
                        {!isOSM && (
                          <div className="tags">
                            {(Array.isArray(doctor.languages) ? doctor.languages : JSON.parse(doctor.languages || '[]')).map((lang, i) => (
                              <span key={i} className="lang-tag">{lang}</span>
                            ))}
                          </div>
                        )}
                        {isOSM && doctor.opening_hours && (
                          <p className="opening-hours">Hours: {doctor.opening_hours}</p>
                        )}
                      </div>
                    </div>
                    <div className="doctor-actions">
                      {doctor.consultation_fee != null && <div className="fee-display">₹{doctor.consultation_fee}</div>}
                      <div className="action-badges">
                        {doctor.available_today && <span className="badge badge-success">Available Today</span>}
                        {doctor.is_online && <span className="badge badge-primary">Online</span>}
                      </div>
                      {!isOSM && (
                        <button className="btn btn-primary" onClick={() => openBookingModal(doctor)}>
                          Book Appointment
                        </button>
                      )}
                      {doctor.phone && <a href={`tel:${doctor.phone}`} className="btn btn-secondary btn-sm">Call</a>}
                      {doctor.website && <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Website</a>}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-state card">
                <div className="empty-state-icon" style={{fontSize: '3rem'}}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h3>No doctors found</h3>
                <p className="text-muted">
                  {isOSM && !filters.location
                    ? 'Please enter a city name to search for doctors'
                    : 'Try adjusting your filters or search in a different location'}
                </p>
                {isOSM && (
                  <div className="search-tips">
                    <p><strong>Tips:</strong></p>
                    <ul>
                      <li>Try cities like "Mumbai", "Delhi", "Bangalore"</li>
                      <li>Reduce the number of filters</li>
                      <li>Check spelling</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book with {selectedDoctor.name}</h3>
              <button className="close-btn" onClick={() => setBookingModal(false)}>×</button>
            </div>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={bookingData.type} onChange={e => setBookingData({...bookingData, type: e.target.value})}>
                  <option value="video">Video Consultation</option>
                  <option value="audio">Audio Consultation</option>
                  <option value="chat">Chat Consultation</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label>Available Slots</label>
                <div className="slots-grid">
                  {slots.length > 0 ? slots.map((slot, i) => (
                    <button key={i} type="button" className={`slot-btn ${bookingData.time_slot === slot.time ? 'selected' : ''}`} onClick={() => setBookingData({...bookingData, time_slot: slot.time})}>
                      {slot.time}
                    </button>
                  )) : <p className="text-muted">No slots available for selected date</p>}
                </div>
              </div>
              <div className="form-group">
                <label>Symptoms (Optional)</label>
                <textarea className="form-control" placeholder="Describe your symptoms..." value={bookingData.symptoms} onChange={e => setBookingData({...bookingData, symptoms: e.target.value})} />
              </div>
              {selectedDoctor.consultation_fee && (
                <div className="booking-fee">
                  <strong>Fee:</strong> ₹{selectedDoctor.consultation_fee}
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={!bookingData.date || !bookingData.time_slot}>
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
