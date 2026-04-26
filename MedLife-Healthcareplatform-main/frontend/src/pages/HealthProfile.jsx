import React, { useState, useEffect } from 'react';
import { healthAPI } from '../api/medlife-api';
import './HealthProfile.css';

const HealthProfile = () => {
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: 'vitals',
    data: {}
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [dashboardRes, recordsRes] = await Promise.all([
        healthAPI.getDashboard(),
        healthAPI.getRecords()
      ]);
      
      setProfile(dashboardRes.data.dashboard.user);
      setRecords(recordsRes.data.records);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await healthAPI.addRecord(newRecord);
      setShowAddRecord(false);
      setNewRecord({ type: 'vitals', data: {} });
      fetchProfile();
    } catch (error) {
      alert('Failed to add record');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="health-profile">
      <div className="page-header">
        <div className="container">
          <h1>Health Profile</h1>
          <p>Manage your health information and records</p>
        </div>
      </div>

      <div className="container">
        <div className="profile-grid">
          {/* Personal Information */}
          <div className="profile-section card">
            <h3>Personal Information</h3>
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Name</span>
                <span className="value">{profile?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone</span>
                <span className="value">{profile?.phone || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Age</span>
                <span className="value">{profile?.age || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Gender</span>
                <span className="value">{profile?.gender || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Blood Group</span>
                <span className="value">{profile?.blood_group || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Location</span>
                <span className="value">{profile?.location || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Health Records */}
          <div className="profile-section card">
            <div className="section-header-row">
              <h3>Health Records</h3>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowAddRecord(true)}
              >
                + Add Record
              </button>
            </div>

            {records.length > 0 ? (
              <div className="records-list">
                {records.slice(0, 5).map(record => (
                  <div key={record.id} className="record-item">
                    <div className="record-type">{record.type}</div>
                    <div className="record-date">
                      {new Date(record.recorded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No health records yet</p>
            )}
          </div>

          {/* Medical History */}
          <div className="profile-section card">
            <h3>Medical History</h3>
            <div className="medical-history">
              <p><strong>Allergies:</strong> {profile?.allergies || 'None recorded'}</p>
              <p><strong>Medical Conditions:</strong> {profile?.medical_history || 'None recorded'}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="profile-section card">
            <h3>Health Stats</h3>
            <div className="health-stats">
              <div className="stat-item">
                <span className="stat-value">{records.length}</span>
                <span className="stat-label">Total Records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="modal-overlay" onClick={() => setShowAddRecord(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Health Record</h3>
              <button className="close-btn" onClick={() => setShowAddRecord(false)}>×</button>
            </div>
            <form onSubmit={handleAddRecord} className="record-form">
              <div className="form-group">
                <label>Record Type</label>
                <select
                  className="form-control"
                  value={newRecord.type}
                  onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                >
                  <option value="vitals">Vitals</option>
                  <option value="lab">Lab Report</option>
                  <option value="prescription">Prescription</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Add Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthProfile;
