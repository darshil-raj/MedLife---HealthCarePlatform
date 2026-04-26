import React, { useState, useEffect } from 'react';
import { consultationsAPI } from '../api/medlife-api';
import rajeshImg from '../assets/images/rajeshkumar.webp';
import vikramImg from '../assets/images/vikramkumar.webp';
import rituImg from '../assets/images/rituverma.jpg';
import tarunImg from '../assets/images/tarunmehta.jpg';
import poojaImg from '../assets/images/Dr. Pooja Mishra.webp';
import priyaImg from '../assets/images/Dr. Priya Sharma.jpg';
import amitImg from '../assets/images/Dr. Amit Shah.jpg';
import sunitaImg from '../assets/images/Dr. Sunita Devi.jpg';
import ananyaImg from '../assets/images/Dr. Ananya Iyer.jpeg';
import raghavendraImg from '../assets/images/Dr.+Raghavendra+Rao.png';
import './Consultation.css';

const Consultation = () => {
  const doctorImages = {
    "Dr. Rajesh Kumar": rajeshImg,
    "Dr. Vikram Singh": vikramImg,
    "Dr. Ritu Verma": rituImg,
    "Dr. Tarun Mehta": tarunImg,
    "Dr. Pooja Mishra": poojaImg,
    "Dr. Priya Sharma": priyaImg,
    "Dr. Amit Shah": amitImg,
    "Dr. Sunita Devi": sunitaImg,
    "Dr. Ananya Iyer": ananyaImg,
    "Dr. Raghavendra Rao": raghavendraImg,
  };

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchConsultations();
  }, [filter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await consultationsAPI.getMyConsultations(params);
      setConsultations(response.data.consultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    
    try {
      await consultationsAPI.cancel(id);
      fetchConsultations();
    } catch (error) {
      alert('Failed to cancel consultation');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      completed: 'badge-primary',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading consultations...</p>
      </div>
    );
  }

  return (
    <div className="consultations">
      <div className="page-header">
        <div className="container">
          <h1>My Consultations</h1>
          <p>View and manage your appointments</p>
        </div>
      </div>

      <div className="container">
        <div className="filter-tabs">
          {['all', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {consultations.length > 0 ? (
          <div className="consultations-grid">
            {consultations.map(consultation => (
              <div key={consultation.id} className="consultation-detail-card card">
                <div className="consultation-header">
                  <img 
                    src={doctorImages[consultation.doctor.name] || "https://api.dicebear.com/7.x/avataaars/svg?seed=default-doctor"} 
                    alt={consultation.doctor.name}
                    className="doctor-photo-lg"
                  />
                  <div className="consultation-header-info">
                    <h3>{consultation.doctor.name}</h3>
                    <p className="specialization">{consultation.doctor.specialization}</p>
                    <p className="hospital">{consultation.doctor.hospital}</p>
                    <span className={`badge ${getStatusBadge(consultation.status)}`}>
                      {consultation.status}
                    </span>
                  </div>
                </div>

                <div className="consultation-details">
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{consultation.date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">{consultation.time_slot}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">{consultation.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Fee:</span>
                    <span className="value">₹{consultation.fee}</span>
                  </div>
                  {consultation.symptoms && (
                    <div className="detail-row">
                      <span className="label">Symptoms:</span>
                      <span className="value">{consultation.symptoms}</span>
                    </div>
                  )}
                </div>

                <div className="consultation-actions-row">
                  {consultation.status === 'confirmed' && consultation.meeting_link && (
                    <a 
                      href={consultation.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Join Consultation
                    </a>
                  )}
                  {consultation.status === 'confirmed' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleCancel(consultation.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">📅</div>
            <p>No consultations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
