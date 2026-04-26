import React, { useState, useEffect } from 'react';
import { hospitalsAPI } from '../api/medlife-api';
import './HospitalFinder.css';

const HospitalFinder = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('real');
  const [location, setLocation] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const fetchRealHospitals = async (loc) => {
    if (!loc) return;
    try {
      setLoading(true);
      const response = await hospitalsAPI.searchReal({ location: loc, emergency: emergencyOnly ? 'true' : '' });
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error('Error:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalHospitals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (location) params.city = location;
      if (emergencyOnly) params.emergency = true;
      const response = await hospitalsAPI.getAll(params);
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error('Error:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const findNearMe = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await hospitalsAPI.searchReal({ lat: latitude, lon: longitude, emergency: emergencyOnly ? 'true' : '' });
            setHospitals(response.data.hospitals || []);
          } catch (error) {
            console.error('Error:', error);
            // Fallback to local
            try {
              const resp = await hospitalsAPI.findNearby(latitude, longitude, 50);
              setHospitals(resp.data.hospitals || []);
            } catch (e) { setHospitals([]); }
          } finally { setLoading(false); }
        },
        () => { alert('Unable to get location. Please enter a city name.'); setLoading(false); }
      );
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchMode === 'real') { fetchRealHospitals(location); }
    else { fetchLocalHospitals(); }
  };

  useEffect(() => {
    fetchLocalHospitals();
  }, []);

  const getBedPercentage = (available, total) => total > 0 ? Math.round((available / total) * 100) : 0;
  const getBedColor = (percentage) => percentage > 30 ? 'var(--success)' : percentage > 10 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="hospital-finder">
      <div className="page-header">
        <div className="container">
          <h1>🏥 Find Hospitals</h1>
          <p>Real-time hospital search with bed availability tracking</p>
        </div>
      </div>

      <div className="container">
        {/* Search Tabs */}
        <div className="search-tabs">
          <button className={`tab ${searchMode === 'local' ? 'active' : ''}`} onClick={() => setSearchMode('local')}>
            <span>📋</span> Our Network
          </button>
          <button className={`tab ${searchMode === 'real' ? 'active' : ''}`} onClick={() => setSearchMode('real')}>
            <span>🌍</span> Real-Time (OpenStreetMap)
          </button>
        </div>

        {/* Search Bar */}
        <form className="hospital-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by city name (e.g., Mumbai, Delhi, Bangalore)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <label className="emergency-toggle">
            <input type="checkbox" checked={emergencyOnly} onChange={(e) => setEmergencyOnly(e.target.checked)} />
            <span>🚨 Emergency Only</span>
          </label>
          <button type="submit" className="btn btn-primary">🔍 Search</button>
          <button type="button" className="btn btn-secondary" onClick={findNearMe}>📍 Near Me</button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="loading-container"><div className="spinner"></div><p>Searching for hospitals...</p></div>
        ) : hospitals.length > 0 ? (
          <>
            <div className="results-info">
              <span className="results-count">Found <strong>{hospitals.length}</strong> hospitals</span>
              {searchMode === 'real' && <span className="badge badge-success">🌍 Real Data</span>}
            </div>
            <div className="hospitals-grid">
              {hospitals.map(hospital => (
                <div key={hospital.id} className="hospital-card">
                  <div className="hospital-top">
                    <div className="hospital-name-area">
                      <h3>{hospital.name}</h3>
                      <p className="hospital-address">📍 {hospital.location || `${hospital.city || ''}`}{hospital.city && hospital.state ? ', ' : ''}{hospital.state || ''}</p>
                      {hospital.phone && hospital.phone !== 'N/A' && <p className="hospital-phone">📞 {hospital.phone}</p>}
                      {hospital.distance_km != null && <p className="hospital-dist">📏 {hospital.distance_km} km away</p>}
                    </div>
                    <div className="hospital-badges">
                      {hospital.emergency_available && <span className="badge badge-danger">🚨 24/7 Emergency</span>}
                      <span className="hospital-rating">⭐ {hospital.rating}</span>
                    </div>
                  </div>

                  {/* Bed Availability */}
                  <div className="beds-section">
                    <h4>Bed Availability</h4>
                    <div className="bed-bars">
                      {[
                        { label: 'General', available: hospital.available_beds, total: hospital.total_beds },
                        { label: 'ICU', available: hospital.icu_available, total: hospital.icu_total },
                        { label: 'Ventilators', available: hospital.ventilators_available, total: hospital.ventilators_total }
                      ].map((bed, i) => {
                        const pct = getBedPercentage(bed.available, bed.total);
                        return (
                          <div key={i} className="bed-bar-item">
                            <div className="bed-bar-header">
                              <span className="bed-bar-label">{bed.label}</span>
                              <span className="bed-bar-count" style={{color: getBedColor(pct)}}>{bed.available}/{bed.total}</span>
                            </div>
                            <div className="bed-bar-track">
                              <div className="bed-bar-fill" style={{width: `${pct}%`, background: getBedColor(pct)}}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="specialties-area">
                    {(Array.isArray(hospital.specialties) ? hospital.specialties : JSON.parse(hospital.specialties || '[]')).slice(0, 4).map((spec, i) => (
                      <span key={i} className="specialty-tag">{spec}</span>
                    ))}
                  </div>

                  {hospital.last_updated && (
                    <div className="updated-time">Updated: {new Date(hospital.last_updated).toLocaleTimeString()}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">🏥</div>
            <h3>No hospitals found</h3>
            <p className="text-muted">Try searching for a city name or use "Near Me" to find hospitals around you</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalFinder;
