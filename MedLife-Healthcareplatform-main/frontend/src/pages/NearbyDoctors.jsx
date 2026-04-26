import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../api/medlife-api';
import './NearbyDoctors.css';

const NearbyDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('detecting');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setGpsStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setGpsStatus('found');
          setSearchOrigin('your location');
          searchWithCoordinates(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setGpsStatus('denied');
          setError('Location access denied. Please enter a city name to search.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setGpsStatus('unavailable');
      setError('Geolocation is not supported by this browser.');
    }
  };

  const searchWithCoordinates = async (lat, lon) => {
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = { lat, lon };
      if (specialization) params.specialization = specialization;

      const response = await doctorsAPI.searchReal(params);
      if (response.data.success) {
        setDoctors(response.data.doctors || []);
      } else {
        setError(response.data.message || 'No results found');
        setDoctors([]);
      }
    } catch (err) {
      console.error('Real search failed, trying local fallback:', err);
      try {
        const fallback = await doctorsAPI.search({ lat, lon });
        if (fallback.data.success) {
          setDoctors(fallback.data.doctors || []);
        } else {
          setDoctors([]);
        }
      } catch (fallbackErr) {
        setError('Failed to search for doctors. Please try again.');
        setDoctors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchByCity = async () => {
    if (!location.trim()) {
      setError('Please enter a city name');
      return;
    }
    setLoading(true);
    setError('');
    setHasSearched(true);
    setSearchOrigin(location.trim());

    try {
      const params = { location: location.trim() };
      if (specialization) params.specialization = specialization;

      const response = await doctorsAPI.searchReal(params);
      if (response.data.success) {
        setDoctors(response.data.doctors || []);
      } else {
        setError(response.data.message || 'No results found');
        setDoctors([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please check the city name and try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (location.trim()) {
      searchByCity();
    } else if (userLocation) {
      searchWithCoordinates(userLocation.lat, userLocation.lon);
    } else {
      setError('Please enter a city name or enable location access.');
    }
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      setLocation('');
      setSearchOrigin('your location');
      searchWithCoordinates(userLocation.lat, userLocation.lon);
    } else {
      getCurrentLocation();
    }
  };

  const getDistanceColor = (distance) => {
    if (distance <= 1) return '#10B981';
    if (distance <= 3) return '#3B82F6';
    if (distance <= 5) return '#F59E0B';
    return '#EF4444';
  };

  const getDistanceLabel = (distance) => {
    if (distance <= 1) return 'Very Close';
    if (distance <= 3) return 'Nearby';
    if (distance <= 5) return 'Moderate';
    return 'Far';
  };

  return (
    <div className="nearby-doctors">
      <div className="page-header nearby-header">
        <div className="container">
          <h1>Nearby Doctors & Clinics</h1>
          <p>Real healthcare facilities near you, powered by OpenStreetMap</p>
          <div className={`gps-indicator ${gpsStatus}`}>
            <span className="gps-dot"></span>
            {gpsStatus === 'detecting' && 'Detecting your location...'}
            {gpsStatus === 'found' && 'GPS Location Detected'}
            {gpsStatus === 'denied' && 'Location Access Denied'}
            {gpsStatus === 'unavailable' && 'GPS Unavailable'}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search Section */}
        <div className="nearby-search-card">
          <form onSubmit={handleSearch} className="nearby-search-form">
            <div className="search-input-group">
              <div className="search-field">
                <label>Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter city (e.g., Mumbai, Delhi, Bangalore)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="search-field">
                <label>Specialization</label>
                <select
                  className="form-control"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                </select>
              </div>
            </div>
            <div className="search-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={useCurrentLocation}
                disabled={loading || gpsStatus === 'unavailable'}
              >
                Use My Location
              </button>
            </div>
          </form>
        </div>

        {/* Source Badge */}
        <div className="data-source-badge">
          <span className="osm-badge">Real-Time Data from OpenStreetMap</span>
          <span className="result-count">
            {hasSearched && !loading && `${doctors.length} facilities found`}
          </span>
        </div>

        {/* Distance Context */}
        {hasSearched && searchOrigin && !loading && doctors.length > 0 && (
          <div className="distance-context">
            Distances shown are from <strong>{searchOrigin}</strong> center
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="nearby-error">
            <span>!</span> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="nearby-loading">
            <div className="location-pulse-ring">
              <div className="pulse-dot"></div>
              <div className="pulse-ring ring-1"></div>
              <div className="pulse-ring ring-2"></div>
              <div className="pulse-ring ring-3"></div>
            </div>
            <p>Searching nearby healthcare facilities...</p>
          </div>
        )}

        {/* Results */}
        {!loading && doctors.length > 0 && (
          <div className="nearby-results">
            <div className="nearby-grid">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="nearby-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Distance Ring */}
                  {doctor.distance != null && (
                    <div className="distance-ring" style={{ '--dist-color': getDistanceColor(doctor.distance) }}>
                      <span className="distance-value">{doctor.distance} km</span>
                      <span className="distance-label">{getDistanceLabel(doctor.distance)}</span>
                    </div>
                  )}

                  <div className="nearby-card-body">
                    <div className="nearby-card-header">
                      <div className="nearby-avatar-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14"/>
                          <path d="M9 9h1M9 13h1M9 17h1"/>
                        </svg>
                      </div>
                      <div className="nearby-card-info">
                        <h3>{doctor.name}</h3>
                        <span className="nearby-spec">{doctor.specialization}</span>
                        {doctor.hospital && <span className="nearby-hospital">{doctor.hospital}</span>}
                      </div>
                    </div>

                    <div className="nearby-details">
                      {doctor.location && doctor.location !== 'Address not listed' && (
                        <div className="detail-chip">
                          <span className="chip-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          </span>
                          {doctor.location}
                        </div>
                      )}
                      {doctor.phone && (
                        <div className="detail-chip">
                          <span className="chip-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                          </span>
                          {doctor.phone}
                        </div>
                      )}
                      {doctor.opening_hours && (
                        <div className="detail-chip">
                          <span className="chip-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                          </span>
                          {doctor.opening_hours}
                        </div>
                      )}
                    </div>

                    <div className="nearby-card-actions">
                      {doctor.phone && (
                        <a href={`tel:${doctor.phone}`} className="btn btn-primary btn-sm">Call Now</a>
                      )}
                      {doctor.website && (
                        <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Website</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && doctors.length === 0 && !error && (
          <div className="nearby-empty">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14"/>
              </svg>
            </div>
            <h3>No healthcare facilities found</h3>
            <p>Try searching for a different city or expanding your search area.</p>
            <div className="search-suggestions">
              <p><strong>Try these cities:</strong></p>
              <div className="suggestion-chips">
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'].map(city => (
                  <button
                    key={city}
                    className="suggestion-chip"
                    onClick={() => { setLocation(city); }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyDoctors;