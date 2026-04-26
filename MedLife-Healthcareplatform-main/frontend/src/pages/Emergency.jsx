import React, { useState } from 'react';
import { emergencyAPI } from '../api/medlife-api';
import './Emergency.css';

const Emergency = () => {
  const [loading, setLoading] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [location, setLocation] = useState(null);

  const triggerSOS = () => {
    if (!confirm('Are you sure you want to trigger an emergency SOS? This will dispatch an ambulance to your location.')) {
      return;
    }

    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          try {
            const response = await emergencyAPI.triggerSOS({
              lat: latitude,
              lng: longitude,
              emergency_type: 'medical'
            });
            setEmergencyData(response.data.emergency);
          } catch (error) {
            alert('Failed to dispatch emergency services. Please call 108 directly.');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          alert('Unable to get your location. Please enable location services or call 108.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported. Please call 108.');
      setLoading(false);
    }
  };

  const emergencyNumbers = [
    { number: '108', label: 'Ambulance', icon: '🚑', color: '#EF4444' },
    { number: '102', label: 'Mother & Child', icon: '👩‍👧', color: '#8B5CF6' },
    { number: '100', label: 'Police', icon: '👮', color: '#3B82F6' },
    { number: '101', label: 'Fire', icon: '🔥', color: '#F59E0B' },
  ];

  return (
    <div className="emergency">
      <div className="page-header emergency-page-header">
        <div className="emergency-header-glow"></div>
        <div className="container">
          <h1>🚨 Emergency SOS</h1>
          <p>One-tap emergency response — ambulance dispatch to your location</p>
        </div>
      </div>

      <div className="container">
        {!emergencyData ? (
          <div className="sos-section">
            {/* SOS Button */}
            <div className="sos-card">
              <div className="sos-button-wrapper">
                <div className="sos-ring ring-outer"></div>
                <div className="sos-ring ring-middle"></div>
                <div className="sos-ring ring-inner"></div>
                <button
                  className={`sos-button ${loading ? 'loading' : ''}`}
                  onClick={triggerSOS}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="sos-loading-text">Dispatching...</span>
                  ) : (
                    <>
                      <span className="sos-icon">🚨</span>
                      <span className="sos-label">SOS</span>
                      <span className="sos-sublabel">Tap for Emergency</span>
                    </>
                  )}
                </button>
              </div>
              <p className="sos-description">
                Press the button to instantly dispatch an ambulance to your GPS location.
                Your location will be shared with the nearest hospital.
              </p>
            </div>

            {/* Emergency Numbers */}
            <div className="emergency-numbers-section">
              <h2>Emergency Helplines</h2>
              <div className="emergency-numbers-grid">
                {emergencyNumbers.map((item, i) => (
                  <a
                    key={i}
                    href={`tel:${item.number}`}
                    className="emergency-number-card"
                    style={{ '--em-color': item.color }}
                  >
                    <div className="em-icon-wrap">{item.icon}</div>
                    <div className="em-info">
                      <span className="em-number">{item.number}</span>
                      <span className="em-label">{item.label}</span>
                    </div>
                    <span className="em-call-icon">📞</span>
                  </a>
                ))}
              </div>
            </div>

            {/* First Aid Tips */}
            <div className="emergency-tips">
              <h3>🩺 While Waiting for Help</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <span className="tip-icon">🫁</span>
                  <h4>Stay Calm</h4>
                  <p>Breathe slowly and deeply. Panic worsens most emergencies.</p>
                </div>
                <div className="tip-card">
                  <span className="tip-icon">📍</span>
                  <h4>Note Location</h4>
                  <p>Share landmarks, building name, and floor number.</p>
                </div>
                <div className="tip-card">
                  <span className="tip-icon">💊</span>
                  <h4>Prepare Info</h4>
                  <p>Note allergies, blood group, and current medications.</p>
                </div>
                <div className="tip-card">
                  <span className="tip-icon">🚪</span>
                  <h4>Clear Path</h4>
                  <p>Ensure ambulance can reach you — open doors, clear obstacles.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="emergency-status">
            <div className="status-card">
              <div className="status-header-area">
                <div className="status-badge dispatched">
                  ✅ {emergencyData.status?.toUpperCase() || 'DISPATCHED'}
                </div>
                <h2>Emergency Services Activated</h2>
              </div>

              <div className="status-grid">
                <div className="status-info-card ambulance-card">
                  <h3>🚑 Ambulance Details</h3>
                  <div className="info-row">
                    <span>Ambulance ID</span>
                    <strong>{emergencyData.ambulance?.id}</strong>
                  </div>
                  <div className="info-row">
                    <span>ETA</span>
                    <strong className="eta-highlight">{emergencyData.ambulance?.eta_minutes} min</strong>
                  </div>
                  <div className="info-row">
                    <span>Status</span>
                    <strong>{emergencyData.ambulance?.current_location}</strong>
                  </div>
                </div>

                <div className="status-info-card hospital-card">
                  <h3>🏥 Nearest Hospital</h3>
                  <div className="info-row">
                    <span>Name</span>
                    <strong>{emergencyData.hospital?.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Address</span>
                    <strong>{emergencyData.hospital?.address}</strong>
                  </div>
                  <div className="info-row">
                    <span>Phone</span>
                    <strong>
                      <a href={`tel:${emergencyData.hospital?.phone}`}>{emergencyData.hospital?.phone}</a>
                    </strong>
                  </div>
                  <div className="info-row">
                    <span>Distance</span>
                    <strong>{emergencyData.hospital?.distance_km} km</strong>
                  </div>
                  <div className="bed-badges">
                    <span className="bed-badge">🛏️ {emergencyData.hospital?.beds_available} beds</span>
                    <span className="bed-badge icu">🏥 {emergencyData.hospital?.icu_available} ICU</span>
                  </div>
                </div>
              </div>

              {emergencyData.instructions && (
                <div className="instructions-card">
                  <h3>📋 Instructions</h3>
                  <ul>
                    {emergencyData.instructions.map((instruction, i) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;
