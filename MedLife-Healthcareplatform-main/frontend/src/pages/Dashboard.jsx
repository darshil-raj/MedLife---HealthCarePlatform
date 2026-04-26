import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthAPI, consultationsAPI } from '../api/medlife-api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthScore] = useState(78);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, upcomingRes] = await Promise.all([
        healthAPI.getDashboard(),
        consultationsAPI.getUpcoming()
      ]);
      
      setDashboard(dashboardRes.data.dashboard);
      setUpcoming(upcomingRes.data.consultations);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statsData = [
    { icon: '📋', label: 'Total Consultations', value: dashboard?.stats?.total_consultations || 0, color: '#0A6EBD', gradient: 'linear-gradient(135deg, #0A6EBD, #3D8FD4)' },
    { icon: '✅', label: 'Completed', value: dashboard?.stats?.completed_consultations || 0, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    { icon: '📅', label: 'Upcoming', value: dashboard?.stats?.upcoming_count || 0, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
    { icon: '🗂️', label: 'Health Records', value: dashboard?.health_records_count || 0, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  ];

  const quickActions = [
    { icon: '👨‍⚕️', label: 'Find Doctor', link: '/doctors', color: '#0A6EBD' },
    { icon: '🏥', label: 'Find Hospital', link: '/hospitals', color: '#00C9A7' },
    { icon: '🤖', label: 'AI Assistant', link: '/ai-assistant', color: '#8B5CF6' },
    { icon: '🚨', label: 'Emergency SOS', link: '/emergency', color: '#EF4444' },
    { icon: '📡', label: 'Offline Kit', link: '/offline-health-kit', color: '#10B981' },
    { icon: '👤', label: 'Health Profile', link: '/health-profile', color: '#F59E0B' },
  ];

  const recentActivity = [
    { icon: '📋', text: 'Consultation booked with Dr. Sharma', time: '2 hours ago', color: '#0A6EBD' },
    { icon: '🩺', text: 'Symptom check completed', time: '1 day ago', color: '#8B5CF6' },
    { icon: '📝', text: 'Health record updated', time: '3 days ago', color: '#10B981' },
    { icon: '🏥', text: 'Hospital search: Mumbai', time: '5 days ago', color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // SVG health score ring
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="dashboard">
      <div className="page-header dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div className="welcome-text">
              <div className="greeting-badge">{getGreeting()} 👋</div>
              <h1>Welcome back, <span className="user-name-gradient">{user?.name || 'User'}</span></h1>
              <p>Here's your health overview and recent activity</p>
            </div>
            <div className="health-score-ring">
              <svg viewBox="0 0 120 120" className="score-svg">
                <circle cx="60" cy="60" r="54" className="score-bg" />
                <circle
                  cx="60" cy="60" r="54"
                  className="score-fill"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="score-text">
                <span className="score-value">{healthScore}</span>
                <span className="score-label">Health Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats Grid */}
        <div className="dashboard-stats">
          {statsData.map((stat, i) => (
            <div key={i} className="dash-stat-card" style={{ '--stat-gradient': stat.gradient, '--stat-color': stat.color }}>
              <div className="stat-icon-circle">{stat.icon}</div>
              <div className="stat-content">
                <h3 className="stat-number">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
              <div className="stat-bg-glow"></div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dash-column">
            {/* Quick Actions */}
            <section className="dash-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="quick-actions-grid">
                {quickActions.map((action, i) => (
                  <Link key={i} to={action.link} className="quick-action-item" style={{ '--action-color': action.color }}>
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-label">{action.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Upcoming Consultations */}
            <section className="dash-section">
              <div className="section-header-row">
                <h2 className="section-title">Upcoming Consultations</h2>
                <Link to="/consultations" className="btn btn-sm btn-secondary">View All</Link>
              </div>
              
              {upcoming.length > 0 ? (
                <div className="consultations-list">
                  {upcoming.map((consultation) => (
                    <div key={consultation.id} className="dash-consultation-card">
                      <div className="consultation-info">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(consultation.doctor?.name || 'doctor')}`}
                          alt={consultation.doctor?.name}
                          className="doctor-avatar"
                        />
                        <div>
                          <h4>{consultation.doctor?.name}</h4>
                          <p className="text-muted">{consultation.doctor?.specialization}</p>
                          <p className="consultation-time">
                            {consultation.date} at {consultation.time_slot}
                          </p>
                        </div>
                      </div>
                      <div className="consultation-actions">
                        <span className={`badge badge-${consultation.type === 'video' ? 'primary' : 'success'}`}>
                          {consultation.type}
                        </span>
                        {consultation.meeting_link && (
                          <a
                            href={consultation.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">
                  <span className="empty-icon">📅 No appointments</span>
                  <p>No upcoming consultations</p>
                  <Link to="/doctors" className="btn btn-primary btn-sm">Book Now</Link>
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="dash-column dash-sidebar">
            {/* Health Profile Summary */}
            <section className="dash-section">
              <div className="section-header-row">
                <h2 className="section-title">Health Profile</h2>
                <Link to="/health-profile" className="btn btn-sm btn-secondary">Manage</Link>
              </div>
              <div className="profile-summary-card">
                <div className="profile-row">
                  <span className="profile-label">Age</span>
                  <span className="profile-value">{dashboard?.user?.age || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Gender</span>
                  <span className="profile-value">{dashboard?.user?.gender || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Blood Group</span>
                  <span className="profile-value">{dashboard?.user?.blood_group || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Location</span>
                  <span className="profile-value">{dashboard?.user?.location || '—'}</span>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="dash-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-timeline">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="activity-item" style={{ '--activity-color': activity.color }}>
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-text">
                        {activity.icon} {activity.text}
                      </p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Offline Kit Promo */}
            <section className="dash-section">
              <div className="offline-promo-card">
                <span className="promo-icon">📡</span>
                <h3>Offline Health Kit</h3>
                <p>Access symptom checker, first aid guides & PHC database — even without internet.</p>
                <Link to="/offline-health-kit" className="btn btn-primary btn-sm">Explore →</Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
