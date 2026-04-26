import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [counters, setCounters] = useState({ patients: 0, response: 0, preventable: 0 });

  useEffect(() => {
    const targets = { patients: 500, response: 47, preventable: 70 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        patients: Math.floor(targets.patients * ease),
        response: Math.floor(targets.response * ease),
        preventable: Math.floor(targets.preventable * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: '👨‍⚕️', title: 'Find Doctors', desc: 'Search 50+ specialist doctors across India. Real-time availability, verified reviews, instant booking.', link: '/doctors', color: '#0A6EBD' },
    { icon: '🏥', title: 'Hospital Finder', desc: 'Locate hospitals with real-time bed & ICU availability. Live-updated data from OpenStreetMap.', link: '/hospitals', color: '#00C9A7' },
    { icon: '🤖', title: 'AI Health Assistant', desc: 'Get instant symptom analysis and 24/7 multilingual health guidance powered by AI.', link: '/ai-assistant', color: '#8B5CF6' },
    { icon: '🚨', title: 'Emergency SOS', desc: 'One-tap emergency response. Dispatches ambulance and shares your GPS location instantly.', link: '/emergency', color: '#EF4444' },
    { icon: '📹', title: 'Teleconsultation', desc: 'Video, audio & chat consultations from home. Affordable care starting at ₹199.', link: '/consultations', color: '#F59E0B' },
    { icon: '📡', title: 'Offline Health Kit', desc: 'Healthcare for areas with no internet. Symptom checker, medicine info, first aid guides, PHC database.', link: '/offline-health-kit', color: '#10B981' },
  ];

  const stats = [
    { icon: '👨‍⚕️', value: '50+', label: 'Expert Doctors' },
    { icon: '🏥', value: '20+', label: 'Partner Hospitals' },
    { icon: '💬', value: '24/7', label: 'AI Health Support' },
    { icon: '🚑', value: '<5min', label: 'Emergency Response' },
  ];

  const bridgeFeatures = [
    { icon: '📡', title: 'Works Offline', desc: 'Symptom checker, medicine info, and first aid guides that work with zero internet connectivity' },
    { icon: '📱', title: 'SMS Doctor Connect', desc: 'Send symptoms via SMS to trained doctors when internet is not available' },
    { icon: '🏛️', title: 'PHC/CHC Database', desc: 'Pre-loaded database of 30,000+ government health centers searchable offline' },
    { icon: '👩‍⚕️', title: 'ASHA Worker Connect', desc: 'Directly connect with local ASHA workers and Auxiliary Nurse Midwives' },
    { icon: '🏕️', title: 'Health Camp Locator', desc: 'Find free government health camps, vaccination drives & NGO medical camps' },
    { icon: '💊', title: 'First Aid + Medicines', desc: 'Step-by-step guides for emergencies with recommended medicines and dosages' },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">🏥 Trusted by 10,000+ Users Across India</div>
              <h1>
                <span className="hero-line">Quality Healthcare</span>
                <span className="hero-line gradient-text">For Everyone,</span>
                <span className="hero-line">Everywhere.</span>
              </h1>
              <p className="hero-subtitle">
                MedLife bridges India's healthcare divide — connecting patients to doctors, hospitals, and health guidance, even in areas with <strong>no internet connectivity</strong>.
              </p>
              <div className="hero-buttons">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">Login</Link>
                  </>
                )}
                <Link to="/offline-health-kit" className="btn btn-secondary btn-lg">Try Offline Kit</Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-phone">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="phone-header-bar">
                    <span className="phone-logo-text">MedLife</span>
                    <span className="phone-time">2:30 PM</span>
                  </div>
                  <div className="phone-greeting">Good Morning,</div>
                  <div className="phone-name">Vijay</div>
                  <div className="phone-card-item">
                    <div className="phone-card-label">Next Consultation</div>
                    <div className="phone-card-val">Today, 2:30 PM</div>
                  </div>
                  <div className="phone-card-item accent">
                    <div className="phone-card-label">Health Score</div>
                    <div className="phone-card-val">85/100 ✨</div>
                  </div>
                  <div className="phone-sos-btn">EMERGENCY SOS</div>
                </div>
              </div>
              <div className="floating-tag tag-ai">Verified Doctors</div>
              <div className="floating-tag tag-emer">Emergency Ready</div>
              <div className="floating-tag tag-offline">Works Offline</div>
            </div>
          </div>

          {/* Crisis Stats */}
          <div className="crisis-stats">
            <div className="crisis-stat">
              <div className="crisis-number">{counters.patients}M+</div>
              <div className="crisis-label">Underserved patients in rural India</div>
              <div className="crisis-source">Source: WHO, 2022</div>
            </div>
            <div className="crisis-stat">
              <div className="crisis-number">{counters.response} min</div>
              <div className="crisis-label">Average emergency response delay</div>
              <div className="crisis-source">Source: Lancet, 2020</div>
            </div>
            <div className="crisis-stat">
              <div className="crisis-number">{counters.preventable}%</div>
              <div className="crisis-label">Health issues preventable with early care</div>
              <div className="crisis-source">Source: ICMR</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-head">
            <h2>Everything Healthcare, <span className="gradient-text">Reimagined</span> ✨</h2>
            <p>Six powerful tools designed for Bharat — from metro cities to remote villages.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <Link to={isAuthenticated ? f.link : (f.link === '/offline-health-kit' ? f.link : '/register')} key={i} className="feature-card card-hover" style={{'--accent-color': f.color}}>
                <div className="feature-icon-wrap">
                  <span className="feature-icon">{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bridging the Gap Section */}
      <section className="bridge-section">
        <div className="container">
          <div className="bridge-header">
            <div className="bridge-badge">🌍 Our Mission</div>
            <h2>Bridging India's <span className="gradient-text">Healthcare Divide</span></h2>
            <p>
              500 million Indians in Tier 2/3 cities lack access to quality healthcare. 
              Poor connectivity, no hospitals, no doctors. <strong>MedLife's Offline Health Kit</strong> changes that.
            </p>
          </div>
          <div className="bridge-grid">
            {bridgeFeatures.map((f, i) => (
              <div key={i} className="bridge-card">
                <div className="bridge-icon-circle">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="bridge-cta">
            <Link to="/offline-health-kit" className="btn btn-primary btn-lg">
              📡 Explore Offline Health Kit
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card-home">
                <span className="stat-icon-home">{s.icon}</span>
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Healthcare Experience?</h2>
            <p>Join thousands of users who trust MedLife for their healthcare needs — from city hospitals to village health centers.</p>
            <div className="cta-buttons">
              {!isAuthenticated && (
                <Link to="/register" className="cta-btn-main">Create Free Account →</Link>
              )}
              <Link to="/offline-health-kit" className="cta-btn-secondary">Try Offline Kit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-pulse"></div>
                <span>MedLife</span>
              </div>
              <p>Quality Healthcare For Everyone, Everywhere. Bridging India's healthcare divide with technology.</p>
            </div>
            <div className="footer-links-col">
              <h4>Platform</h4>
              <Link to="/doctors">Find Doctors</Link>
              <Link to="/hospitals">Hospitals</Link>
              <Link to="/ai-assistant">Health Assistant</Link>
              <Link to="/emergency">Emergency</Link>
            </div>
            <div className="footer-links-col">
              <h4>For Rural India</h4>
              <Link to="/offline-health-kit">Offline Health Kit</Link>
              <Link to="/offline-health-kit">Symptom Checker</Link>
              <Link to="/offline-health-kit">First Aid Guides</Link>
              <Link to="/offline-health-kit">PHC Database</Link>
            </div>
            <div className="footer-links-col">
              <h4>About</h4>
              <a href="#features">Features</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 MedLife Healthcare. Made with ❤️ for Bharat.</p>
            <p>SDG 3: Good Health and Well-being</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
