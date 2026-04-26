const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// AI Symptom Checker
router.post('/check-symptoms', authenticateToken, (req, res) => {
  try {
    const { symptoms, message } = req.body;
    const user_id = req.user.id;

    if (!symptoms && !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please describe your symptoms' 
      });
    }

    const inputText = (symptoms || message).toLowerCase();
    
    // AI Analysis Logic
    const analysis = analyzeSymptoms(inputText);
    
    // Save to chat history
    db.ai_chat_history.create({
      user_id,
      message: inputText,
      response: analysis.response,
      symptoms_detected: JSON.stringify(analysis.symptoms),
      urgency_level: analysis.urgency
    });

    res.json({
      success: true,
      analysis: {
        symptoms_detected: analysis.symptoms,
        possible_conditions: analysis.conditions,
        urgency_level: analysis.urgency,
        recommended_action: analysis.action,
        response: analysis.response,
        suggested_specialists: analysis.specialists
      }
    });
  } catch (error) {
    console.error('AI symptom check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze symptoms' 
    });
  }
});

// Get chat history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20 } = req.query;

    const history = db.ai_chat_history.findByUserId(user_id, parseInt(limit));

    const parsedHistory = history.map(h => ({
      ...h,
      symptoms_detected: typeof h.symptoms_detected === 'string' ? 
        JSON.parse(h.symptoms_detected || '[]') : 
        (h.symptoms_detected || [])
    }));

    res.json({
      success: true,
      history: parsedHistory
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get chat history' 
    });
  }
});

// AI Chatbot endpoint
router.post('/chat', authenticateToken, (req, res) => {
  try {
    const { message } = req.body;
    const user_id = req.user.id;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a message' 
      });
    }

    const response = generateChatResponse(message.toLowerCase());

    // Save chat
    db.ai_chat_history.create({
      user_id,
      message,
      response: response.text,
      urgency_level: response.urgency || 'low'
    });

    res.json({
      success: true,
      response: response.text,
      suggestions: response.suggestions || [],
      urgency: response.urgency || 'low'
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process message' 
    });
  }
});

// Symptom analysis function
function analyzeSymptoms(text) {
  const symptoms = [];
  const conditions = [];
  let urgency = 'low';
  let action = '';
  let specialists = [];

  // Check for emergency symptoms
  const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'severe bleeding', 'unconscious', 'seizure', 'severe chest'];
  const hasEmergency = emergencyKeywords.some(keyword => text.includes(keyword));

  if (hasEmergency) {
    urgency = 'critical';
    action = 'EMERGENCY: Call 108 or go to nearest hospital immediately. Do not wait.';
    specialists = ['Emergency Medicine', 'Cardiologist'];
    return {
      symptoms: ['Emergency symptoms detected'],
      conditions: ['Potential life-threatening condition'],
      urgency,
      action,
      specialists,
      response: action
    };
  }

  // Analyze symptoms
  if (text.includes('fever') || text.includes('temperature')) {
    symptoms.push('Fever');
    conditions.push('Viral infection', 'Flu', 'COVID-19');
    specialists.push('General Physician');
  }

  if (text.includes('headache') || text.includes('head pain')) {
    symptoms.push('Headache');
    conditions.push('Migraine', 'Tension headache', 'Sinusitis');
    specialists.push('General Physician', 'Neurologist');
  }

  if (text.includes('cough') || text.includes('cold')) {
    symptoms.push('Cough/Cold');
    conditions.push('Common cold', 'Bronchitis', 'Allergic rhinitis');
    specialists.push('General Physician', 'Pulmonologist');
  }

  if (text.includes('stomach pain') || text.includes('abdominal pain') || text.includes('stomach ache')) {
    symptoms.push('Abdominal pain');
    conditions.push('Gastritis', 'Acidity', 'Food poisoning', 'Appendicitis');
    specialists.push('General Physician', 'Gastroenterologist');
  }

  if (text.includes('chest pain') || text.includes('chest tightness')) {
    symptoms.push('Chest discomfort');
    conditions.push('Acidity/GERD', 'Costochondritis', 'Angina');
    urgency = 'high';
    specialists.push('Cardiologist', 'General Physician');
  }

  if (text.includes('skin') || text.includes('rash') || text.includes('itching')) {
    symptoms.push('Skin issue');
    conditions.push('Allergic reaction', 'Eczema', 'Fungal infection');
    specialists.push('Dermatologist');
  }

  if (text.includes('joint pain') || text.includes('back pain') || text.includes('knee pain')) {
    symptoms.push('Musculoskeletal pain');
    conditions.push('Arthritis', 'Muscle strain', 'Osteoarthritis');
    specialists.push('Orthopedic Surgeon', 'Physiotherapist');
  }

  if (text.includes('diabetes') || text.includes('blood sugar')) {
    symptoms.push('Diabetes management');
    conditions.push('Type 2 Diabetes', 'Prediabetes');
    specialists.push('Diabetologist', 'Endocrinologist');
  }

  if (text.includes('anxiety') || text.includes('depression') || text.includes('stress') || text.includes('can\'t sleep')) {
    symptoms.push('Mental health concern');
    conditions.push('Anxiety disorder', 'Depression', 'Insomnia');
    specialists.push('Psychiatrist', 'Psychologist');
  }

  if (text.includes('pregnancy') || text.includes('period') || text.includes('menstrual')) {
    symptoms.push('Women\'s health');
    conditions.push('Hormonal imbalance', 'PCOS', 'Pregnancy-related');
    specialists.push('Gynecologist');
  }

  if (text.includes('child') || text.includes('baby') || text.includes('kid')) {
    specialists.push('Pediatrician');
  }

  // Default if no specific symptoms found
  if (symptoms.length === 0) {
    symptoms.push('General symptoms');
    conditions.push('Requires clinical evaluation');
    specialists.push('General Physician');
  }

  // Determine urgency and action
  if (symptoms.includes('Chest discomfort') || symptoms.includes('Emergency symptoms detected')) {
    urgency = 'high';
    action = 'Consult a doctor within 24 hours. If symptoms worsen, seek emergency care.';
  } else if (symptoms.length > 3) {
    urgency = 'medium';
    action = 'Schedule a consultation with a doctor within 2-3 days.';
  } else {
    urgency = 'low';
    action = 'Monitor symptoms. Consult a doctor if they persist for more than 3 days.';
  }

  // Generate response
  let response = `Based on your symptoms (${symptoms.join(', ')}), `;
  response += `I've identified possible conditions: ${conditions.join(', ')}. `;
  response += `Urgency level: ${urgency.toUpperCase()}. `;
  response += action;

  return {
    symptoms,
    conditions,
    urgency,
    action,
    specialists: [...new Set(specialists)],
    response
  };
}

// Chat response generator
function generateChatResponse(message) {
  const responses = {
    greeting: {
      patterns: ['hello', 'hi', 'hey', 'namaste'],
      text: 'Hello! I\'m your MedLife AI Health Assistant. How can I help you today? You can describe your symptoms or ask health-related questions.',
      suggestions: ['I have a headache', 'Check my symptoms', 'Find a doctor', 'Emergency help']
    },
    booking: {
      patterns: ['book', 'appointment', 'consultation', 'schedule'],
      text: 'I can help you book a consultation. Would you like to search for doctors by specialty or location?',
      suggestions: ['Find cardiologist', 'Doctors near me', 'Book video consultation']
    },
    emergency: {
      patterns: ['emergency', 'urgent', '108', 'ambulance', 'critical'],
      text: 'If this is a medical emergency, please call 108 immediately or press the SOS button in the app. Do not wait for online consultation.',
      urgency: 'critical',
      suggestions: ['Call Emergency', 'Find nearest hospital', 'SOS']
    },
    medicine: {
      patterns: ['medicine', 'medication', 'drug', 'tablet', 'pill'],
      text: 'I cannot prescribe medications. Please consult a doctor for proper diagnosis and prescription. Would you like to book a consultation?',
      suggestions: ['Book consultation', 'Find doctor', 'Check symptoms']
    },
    diet: {
      patterns: ['diet', 'food', 'eat', 'nutrition', 'weight'],
      text: 'For personalized diet advice, I recommend consulting our nutrition specialists. General tips: eat balanced meals, stay hydrated, and limit processed foods.',
      suggestions: ['Find nutritionist', 'Diet plan', 'Weight management']
    },
    thanks: {
      patterns: ['thank', 'thanks', 'dhanyavad'],
      text: 'You\'re welcome! Take care of your health. Is there anything else I can help you with?',
      suggestions: ['Check symptoms', 'Book appointment', 'No, thanks']
    }
  };

  // Check for matching patterns
  for (const [key, value] of Object.entries(responses)) {
    if (value.patterns.some(pattern => message.includes(pattern))) {
      return {
        text: value.text,
        suggestions: value.suggestions,
        urgency: value.urgency || 'low'
      };
    }
  }

  // Default response
  return {
    text: 'I understand. To better assist you, could you describe your symptoms in more detail? For example: where is the pain, when did it start, and how severe is it?',
    suggestions: ['I have fever', 'Chest pain', 'Skin problem', 'Mental health'],
    urgency: 'low'
  };
}

module.exports = router;
