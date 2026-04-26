import React, { useState, useEffect } from 'react';
import { symptomDecisionTree, firstAidGuides, phcDatabase, helplines, statesList, getDistrictsByState } from '../data/offline-data';
import './OfflineHealthKit.css';

// Medicine images
import paracetamolImg from '../assets/medicines/paracetamol.png';
import cetirizineImg from '../assets/medicines/cetirizine.png';
import orsImg from '../assets/medicines/ors.png';
import antacidImg from '../assets/medicines/antacid.png';
import coughSyrupImg from '../assets/medicines/cough_syrup.png';
import antisepticImg from '../assets/medicines/antiseptic_cream.png';

const medicineImages = {
  paracetamol: paracetamolImg,
  cetirizine: cetirizineImg,
  ors: orsImg,
  antacid: antacidImg,
  cough_syrup: coughSyrupImg,
  antiseptic_cream: antisepticImg,
};

const OfflineHealthKit = () => {
  const [activeTab, setActiveTab] = useState('symptom');
  const [symptomPath, setSymptomPath] = useState(['start']);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [phcState, setPhcState] = useState('');
  const [phcDistrict, setPhcDistrict] = useState('');
  const [smsSymptoms, setSmsSymptoms] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  const currentNode = symptomDecisionTree[symptomPath[symptomPath.length - 1]];

  const handleOption = (nextKey) => {
    setSymptomPath(prev => [...prev, nextKey]);
  };

  const goBack = () => {
    if (symptomPath.length > 1) setSymptomPath(prev => prev.slice(0, -1));
  };

  const resetSymptoms = () => setSymptomPath(['start']);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  const getSeverityLabel = (severity) => {
    switch(severity) {
      case 'critical': return 'CRITICAL — Seek Emergency Help';
      case 'high': return 'HIGH — See Doctor Urgently';
      case 'medium': return 'MODERATE — Visit PHC/Doctor';
      case 'low': return 'MILD — Home Care Possible';
      default: return 'Unknown';
    }
  };

  const generateSMS = () => {
    const text = `MEDLIFE HELP\nSymptoms: ${smsSymptoms}\nAge: __\nGender: __\nLocation: __\nDuration: __\nPlease advise.`;
    return `sms:108?body=${encodeURIComponent(text)}`;
  };

  const filteredPHCs = phcDatabase.filter(p => {
    if (phcState && p.state !== phcState) return false;
    if (phcDistrict && p.district !== phcDistrict) return false;
    return true;
  });

  const tabs = [
    { id: 'symptom', label: 'Symptom Checker' },
    { id: 'firstaid', label: 'First Aid' },
    { id: 'phc', label: 'PHC/CHC Finder' },
    { id: 'prevention', label: 'Health Tips' },
    { id: 'sms', label: 'SMS Doctor' },
    { id: 'helplines', label: 'Helplines' },
  ];

  const preventionTips = [
    {
      title: 'Safe Drinking Water',
      category: 'Daily Health',
      content: [
        'Always boil water for at least 1 minute before drinking if source is untreated',
        'Use alum (phitkari) to settle impurities — add a small piece to a bucket of water, stir and let it settle for 30 minutes',
        'Store drinking water in clean, covered containers',
        'Chlorine tablets (available free at PHC) can purify 20 litres of water',
        'Avoid drinking directly from handpumps near drainage or animal areas'
      ]
    },
    {
      title: 'Monsoon Disease Prevention',
      category: 'Seasonal',
      content: [
        'Dengue prevention: Empty all stagnant water containers weekly — coolers, pots, tyres, coconut shells',
        'Malaria prevention: Sleep under insecticide-treated mosquito nets (available free at PHC)',
        'Use mosquito repellent coils or liquid at dusk and dawn',
        'Avoid eating cut fruits or uncovered food from street vendors during monsoon',
        'Wear full-sleeve clothes and use footwear to avoid leptospirosis from waterlogged areas',
        'Wash vegetables with clean water + pinch of potassium permanganate (KMnO4) before cooking'
      ]
    },
    {
      title: 'Child Vaccination Schedule',
      category: 'Children',
      content: [
        'Birth: BCG, OPV-0, Hepatitis B — given at hospital/PHC on day of birth',
        '6 weeks: OPV-1, Pentavalent-1, Rotavirus-1, IPV-1, PCV-1',
        '10 weeks: OPV-2, Pentavalent-2, Rotavirus-2',
        '14 weeks: OPV-3, Pentavalent-3, Rotavirus-3, IPV-2, PCV-2',
        '9 months: MR-1 (Measles-Rubella), JE-1 (Japanese Encephalitis), PCV Booster',
        '16-24 months: DPT Booster-1, MR-2, OPV Booster, JE-2',
        '5-6 years: DPT Booster-2',
        'All vaccines are FREE at government hospitals and PHC/CHC under Universal Immunization Programme',
        'Keep the immunization card safe — needed for school admission'
      ]
    },
    {
      title: 'Nutrition on a Budget',
      category: 'Daily Health',
      content: [
        'Dal + Rice = complete protein — eat daily. Adding lemon increases iron absorption by 3x',
        'Seasonal local vegetables are cheapest and most nutritious — buy from weekly haats',
        'Eggs are the most affordable complete protein — 1 egg daily for children is ideal',
        'Jaggery (gur) is a cheap source of iron — better than refined sugar',
        'Sprouted moong/chana costs almost nothing and is highly nutritious — soak overnight, drain, keep covered for 24 hours',
        'Ragi/Nachni porridge for children under 5 — rich in calcium and iron',
        'Banana is the cheapest fruit in India — high in potassium and energy',
        'Government Anganwadi centres provide free supplementary nutrition for children under 6 and pregnant women'
      ]
    },
    {
      title: 'When to Visit PHC vs Hospital',
      category: 'Guidance',
      content: [
        'Visit PHC for: Fever, cold, cough, minor injuries, immunization, antenatal checkups, family planning',
        'Visit CHC for: X-ray needed, minor surgery, dental care, eye checkup, lab tests',
        'Visit District Hospital for: Surgery, delivery complications, fractures, severe infections, blood transfusion',
        'CALL 108 for: Chest pain, severe breathing difficulty, unconsciousness, heavy bleeding, poisoning, snake bite',
        'PHC/CHC services are free or very low cost under government schemes',
        'Ayushman Bharat card (PMJAY) covers up to Rs 5 lakh per family per year at empanelled hospitals — check eligibility at PHC'
      ]
    },
    {
      title: 'Hygiene in Low-Resource Settings',
      category: 'Daily Health',
      content: [
        'Handwashing with soap for 20 seconds before eating and after toilet — reduces diarrhea by 40%',
        'If soap unavailable, ash (from chulha) with water is an effective alternative',
        'Use toilet/latrine — open defecation spreads cholera, typhoid, and worm infections',
        'Menstrual hygiene: Change cloth/pad every 6 hours. Free sanitary pads available at many PHCs',
        'Cut nails weekly — long nails harbour germs and worm eggs',
        'Sun-dry washed clothes and bedsheets — UV light kills bacteria and fungi'
      ]
    },
    {
      title: 'Government Health Schemes',
      category: 'Financial Help',
      content: [
        'Ayushman Bharat (PMJAY): Free treatment up to Rs 5 lakh/year for eligible families at any empanelled hospital',
        'Janani Suraksha Yojana: Rs 1,400 cash for institutional delivery in rural areas',
        'National TB Elimination Programme: Free diagnosis and treatment + Rs 500/month nutrition support',
        'Rashtriya Bal Swasthya Karyakram: Free health screening for children 0-18 years at schools and Anganwadi',
        'Free dialysis under PMNDP at district hospitals',
        'Check eligibility at nearest PHC or call 14555 (Ayushman Bharat helpline)'
      ]
    }
  ];

  return (
    <div className="offline-kit">
      {/* Header */}
      <div className="page-header offline-header">
        <div className="container">
          <div className="offline-status-row">
            <h1>Offline Health Kit</h1>
            <div className={`connection-badge ${isOffline ? 'offline' : 'online'}`}>
              <span className="status-dot"></span>
              {isOffline ? 'Offline Mode' : 'Connected'}
            </div>
          </div>
          <p>Healthcare guidance that works without internet — designed for areas with limited connectivity.</p>
        </div>
      </div>

      <div className="container">
        {/* Tier-2/3 Impact Banner */}
        <div className="offline-banner">
          <div className="banner-text">
            <h3>Built for underserved communities</h3>
            <p>68% of India's population lives in areas with limited access to qualified doctors. This kit provides verified medical guidance, medicine information, and government health center data — all stored locally on your device. No internet, no data charges, no barriers.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="kit-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`kit-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="kit-content">

          {/* SYMPTOM CHECKER */}
          {activeTab === 'symptom' && (
            <div className="symptom-checker">
              <div className="checker-header">
                <h2>Offline Symptom Checker</h2>
                <p>Answer simple questions to get health guidance and medicine suggestions. No internet needed.</p>
              </div>

              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{width: `${Math.min(symptomPath.length * 20, 100)}%`}}></div>
              </div>

              {currentNode?.result ? (
                /* RESULT CARD */
                <div className="result-card" style={{'--severity-color': getSeverityColor(currentNode.severity)}}>
                  <div className="result-severity">
                    <span className="severity-badge" style={{background: getSeverityColor(currentNode.severity)}}>
                      {getSeverityLabel(currentNode.severity)}
                    </span>
                  </div>
                  <h3 className="result-title">{currentNode.title}</h3>
                  <p className="result-advice">{currentNode.advice}</p>

                  <div className="result-actions">
                    <h4>What To Do:</h4>
                    <ol>
                      {currentNode.actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ol>
                  </div>

                  {/* MEDICINE RECOMMENDATIONS */}
                  {currentNode.medicines && currentNode.medicines.length > 0 && (
                    <div className="medicine-section">
                      <h4>Suggested Medicines</h4>
                      <p className="medicine-disclaimer">These are commonly available over-the-counter medicines. Consult a local doctor or pharmacist before use. Show this to your nearest medical shop.</p>
                      <div className="medicine-grid">
                        {currentNode.medicines.map((med, i) => (
                          <div key={i} className="medicine-card">
                            {medicineImages[med.img] && (
                              <img src={medicineImages[med.img]} alt={med.name} className="medicine-img" />
                            )}
                            <div className="medicine-info">
                              <h5>{med.name}</h5>
                              <p className="medicine-dosage"><strong>Dosage:</strong> {med.dosage}</p>
                              <p className="medicine-use">{med.use}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentNode.whenToCall108 && (
                    <div className="emergency-call-box">
                      <h4>Call 108 if condition worsens</h4>
                      <a href="tel:108" className="call-108-btn">CALL 108 NOW</a>
                    </div>
                  )}

                  <div className="result-buttons">
                    <button className="btn btn-primary" onClick={resetSymptoms}>Check Another Symptom</button>
                    <button className="btn btn-secondary" onClick={() => setActiveTab('firstaid')}>View First Aid Guides</button>
                  </div>
                </div>
              ) : currentNode ? (
                /* QUESTION CARD */
                <div className="question-card">
                  <h3 className="question-text">{currentNode.question}</h3>
                  <div className="options-grid">
                    {currentNode.options.map((opt, i) => (
                      <button
                        key={i}
                        className="option-btn"
                        onClick={() => handleOption(opt.next)}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                  {symptomPath.length > 1 && (
                    <button className="btn btn-secondary back-btn" onClick={goBack}>Go Back</button>
                  )}
                </div>
              ) : null}

              <div className="disclaimer">
                This is for guidance only. It does not replace professional medical advice. Always consult a doctor for serious symptoms.
              </div>
            </div>
          )}

          {/* FIRST AID GUIDES */}
          {activeTab === 'firstaid' && (
            <div className="first-aid">
              <div className="checker-header">
                <h2>First Aid Guides</h2>
                <p>Step-by-step emergency guides that work offline. Be prepared for any situation.</p>
              </div>

              {selectedGuide ? (
                <div className="guide-detail">
                  <button className="btn btn-secondary" onClick={() => setSelectedGuide(null)}>Back to All Guides</button>
                  <div className="guide-card expanded">
                    <h3>{selectedGuide.title}</h3>
                    <span className="severity-badge small" style={{background: getSeverityColor(selectedGuide.severity)}}>
                      {selectedGuide.severity.toUpperCase()}
                    </span>
                    <ol className="guide-steps">
                      {selectedGuide.steps.map((step, i) => (
                        <li key={i} className="guide-step">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="guides-grid">
                  {firstAidGuides.map(guide => (
                    <button
                      key={guide.id}
                      className="guide-card-btn"
                      onClick={() => setSelectedGuide(guide)}
                    >
                      <h4>{guide.title}</h4>
                      <span className="guide-severity" style={{color: getSeverityColor(guide.severity)}}>
                        {guide.severity.toUpperCase()}
                      </span>
                      <span className="guide-arrow">&rarr;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PHC/CHC FINDER */}
          {activeTab === 'phc' && (
            <div className="phc-finder">
              <div className="checker-header">
                <h2>Government Health Center Finder</h2>
                <p>Find Primary Health Centers (PHC) and Community Health Centers (CHC) near you. Pre-loaded database — works offline.</p>
              </div>

              <div className="phc-filters">
                <select className="form-control" value={phcState} onChange={(e) => { setPhcState(e.target.value); setPhcDistrict(''); }}>
                  <option value="">All States</option>
                  {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-control" value={phcDistrict} onChange={(e) => setPhcDistrict(e.target.value)} disabled={!phcState}>
                  <option value="">All Districts</option>
                  {phcState && getDistrictsByState(phcState).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="phc-count">Showing {filteredPHCs.length} health centers</div>

              <div className="phc-list">
                {filteredPHCs.map((phc, i) => (
                  <div key={i} className="phc-card">
                    <div className="phc-top">
                      <h4>
                        <span className={`phc-type-badge ${phc.type.toLowerCase()}`}>{phc.type}</span>
                        {phc.name}
                      </h4>
                      <a href={`tel:${phc.phone}`} className="phc-call">Call</a>
                    </div>
                    <p className="phc-address">{phc.address}</p>
                    <p className="phc-state">{phc.district}, {phc.state}</p>
                    <div className="phc-services">
                      {phc.services.map((s, j) => (
                        <span key={j} className="service-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HEALTH TIPS & PREVENTION */}
          {activeTab === 'prevention' && (
            <div className="prevention-tab">
              <div className="checker-header">
                <h2>Health Tips & Prevention</h2>
                <p>Practical, verified health guidance for everyday life. Focused on affordable, accessible healthcare practices.</p>
              </div>

              <div className="prevention-grid">
                {preventionTips.map((tip, i) => (
                  <div key={i} className="prevention-card">
                    <div className="prevention-card-header">
                      <h4>{tip.title}</h4>
                      <span className="prevention-category">{tip.category}</span>
                    </div>
                    <ul className="prevention-list">
                      {tip.content.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SMS DOCTOR CONNECT */}
          {activeTab === 'sms' && (
            <div className="sms-doctor">
              <div className="checker-header">
                <h2>SMS Doctor Connect</h2>
                <p>No internet? Use SMS to reach a doctor. Describe your symptoms below and send via text message.</p>
              </div>

              <div className="sms-card">
                <div className="sms-steps">
                  <div className="sms-step"><span className="step-num">1</span> Describe your symptoms below</div>
                  <div className="sms-step"><span className="step-num">2</span> Click "Generate SMS" to create the message</div>
                  <div className="sms-step"><span className="step-num">3</span> Send the SMS to the medical helpline</div>
                  <div className="sms-step"><span className="step-num">4</span> A doctor will respond within 30 minutes</div>
                </div>

                <div className="form-group">
                  <label>Describe Your Symptoms</label>
                  <textarea
                    className="form-control"
                    placeholder="Example: I have had fever for 3 days with headache and body pain. I also feel very tired and have no appetite."
                    value={smsSymptoms}
                    onChange={(e) => setSmsSymptoms(e.target.value)}
                    rows={4}
                  />
                </div>

                {smsSymptoms && (
                  <div className="sms-preview">
                    <h4>Message Preview:</h4>
                    <div className="sms-message">
                      <p>MEDLIFE HELP</p>
                      <p>Symptoms: {smsSymptoms}</p>
                      <p>Age: __ | Gender: __ | Location: __</p>
                      <p>Duration: __</p>
                      <p>Please advise.</p>
                    </div>
                    <a href={generateSMS()} className="btn btn-primary btn-lg sms-send-btn">Open SMS App & Send</a>
                    <p className="sms-note">Fill in your age, gender, and location before sending.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HELPLINES */}
          {activeTab === 'helplines' && (
            <div className="helplines-tab">
              <div className="checker-header">
                <h2>Emergency & Health Helplines</h2>
                <p>Important phone numbers for medical emergencies and health support across India.</p>
              </div>

              <div className="helplines-grid">
                {helplines.map((h, i) => (
                  <a key={i} href={`tel:${h.number}`} className="helpline-card">
                    <div className="helpline-info">
                      <h4>{h.name}</h4>
                      <p className="helpline-desc">{h.desc}</p>
                    </div>
                    <div className="helpline-number">{h.number}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineHealthKit;
