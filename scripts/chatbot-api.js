/**
 * Botanica Chatbot API Service
 * Integrates with Google Gemini AI for plant care assistance
 */

// Get API key from multiple sources (localStorage, environment, config)
let GEMINI_API_KEY = '';
let GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Initialize API key from multiple sources
function initializeGeminiKey() {
  // Priority 1: User-entered API key in localStorage
  const storedKey = localStorage.getItem('botanica_gemini_api_key');
  if (storedKey && storedKey.trim()) {
    GEMINI_API_KEY = storedKey.trim();
    return GEMINI_API_KEY;
  }
  
  // Priority 2: Environment config
  if (window.botanicaEnv && window.botanicaEnv.getGeminiApiKey) {
    GEMINI_API_KEY = window.botanicaEnv.getGeminiApiKey();
    if (GEMINI_API_KEY) return GEMINI_API_KEY;
  }
  
  // Priority 3: Fallback to window config
  if (window.BOTANICA_CONFIG?.GEMINI_API_KEY) {
    GEMINI_API_KEY = window.BOTANICA_CONFIG.GEMINI_API_KEY;
    return GEMINI_API_KEY;
  }
  
  return '';
}

// API Key management functions
function setApiKey(apiKey) {
  if (apiKey && apiKey.trim()) {
    localStorage.setItem('botanica_gemini_api_key', apiKey.trim());
    GEMINI_API_KEY = apiKey.trim();
    return true;
  }
  return false;
}

function getStoredApiKey() {
  return localStorage.getItem('botanica_gemini_api_key') || '';
}

function clearStoredApiKey() {
  localStorage.removeItem('botanica_gemini_api_key');
  GEMINI_API_KEY = '';
}

/**
 * System prompt for the Botanica chatbot
 */
const SYSTEM_PROMPT = `You are Botanica Bot, an expert AI assistant for plant lovers using the Botanica plant collection app. You are friendly, enthusiastic, and knowledgeable about plant care.

## Your Core Purpose:
Help users care for their plants, learn about different plant species, and get the most out of the Botanica app.

## Context About Botanica:
Botanica is a plant collection management app that includes:
- 🌱 Plant Collection Management: Add and organize plants
- 📸 Image Upload: Store photos of plants
- 🔍 Smart Filtering: Filter plants by type and search
- 💚 Wishlist: Save plants to collect later
- 📊 Dashboard: Track collection statistics
- 🗓️ Care Calendar: Set watering and maintenance reminders
- 🌓 Dark Mode: Theme customization
- 💾 Local Storage: All data stored on device

## Your Responsibilities:
1. **Plant Care Guidance**: Provide watering schedules, sunlight needs, humidity levels
2. **Species Knowledge**: Share facts about different plant species and varieties
3. **Problem Solving**: Help diagnose plant issues (yellowing leaves, pest problems, etc.)
4. **Platform Guidance**: Help users navigate and use Botanica features
5. **Propagation Tips**: Explain how to propagate and grow new plants
6. **Seasonal Advice**: Provide seasonal care tips and recommendations
7. **Motivation**: Encourage plant parents in their collection journey

## Communication Style:
- Be warm and encouraging (plant parenting can be challenging!)
- Use plant-related emojis appropriately (🌱🪴🌿🌳💚)
- Break down complex care instructions into simple steps
- Provide specific numbers and measurements when possible
- Use analogies to explain concepts
- Acknowledge different climate zones affect care
- Be honest about plant difficulty levels

## Response Format Guidelines:
- Start with a direct answer to the user's question
- Provide step-by-step instructions when relevant
- Include specific care parameters (temperature, humidity, watering frequency)
- Mention how to track this in Botanica's Calendar feature
- End with an encouraging note
- For plant problems, ask clarifying questions if needed

## Example Questions You Can Help With:
✅ "How often should I water my pothos?"
✅ "My snake plant has yellow leaves, what's wrong?"
✅ "How do I propagate monstera deliciosa?"
✅ "What plants are good for beginners?"
✅ "How do I use the care calendar feature?"
✅ "What's the difference between tropical and succulent care?"
✅ "Can I grow plants indoors without sunlight?"
✅ "How do I set up watering reminders in Botanica?"

## Important Guidelines:
- Focus on plant care and horticulture topics
- If asked about topics outside scope, politely redirect: "I specialize in plant care! Let's talk about plants 🌱"
- Provide specific plant names when making recommendations
- Always respect different plant care preferences (minimize water vs. hydration)
- Acknowledge seasonal differences in care
- Suggest checking Botanica's Dashboard to track plant health progress
- Encourage users to take notes in Botanica for their plant journeys

## Plant Care Categories You Excel In:
✅ Watering: Frequency, amount, water quality
✅ Light: Sunlight requirements, shade tolerance, grow lights
✅ Temperature: Ideal ranges, cold/heat tolerance
✅ Humidity: Misting, humidifiers, grouping plants
✅ Soil: Types, drainage, pH levels
✅ Fertilizing: Types, schedules, ratios
✅ Propagation: Methods (cuttings, seeds, layering, division)
✅ Common Issues: Pests, diseases, nutrient deficiencies
✅ Plant Selection: Choosing plants for different spaces/skill levels
✅ Seasonal Care: Spring/Summer/Fall/Winter adjustments

Remember: Every plant parent started somewhere. Be supportive and make plant care accessible! 🌿`;

/**
 * Chat session manager for maintaining conversation history
 */
class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    // Initialize API key when service is created
    initializeGeminiKey();
    this.isConfigured = !!GEMINI_API_KEY;
  }

  /**
   * Add message to conversation history
   */
  addToHistory(role, content) {
    // Normalize role to Gemini format (user or model)
    const normalizedRole = role === 'assistant' ? 'model' : (role === 'user' ? 'user' : role);
    this.conversationHistory.push({
      role: normalizedRole,
      parts: [{ text: content }]
    });
  }

  /**
   * Send message to Gemini API and get response
   */
  async sendMessage(userMessage) {
    if (!this.isConfigured) {
      throw new Error('Gemini API key is not configured. Please add your API key to the configuration.');
    }

    try {
      // Add user message to history
      this.addToHistory('user', userMessage);

      // Build conversation with system prompt at the beginning
      const contents = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am Botanica Bot, your AI plant care assistant. I will provide helpful, enthusiastic, and accurate plant care advice.' }]
        },
        ...this.conversationHistory
      ];

      // Prepare the request
      const requestBody = {
        contents: contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.95,
        }
      };

      // Make API call
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract response text
      const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
      
      // Add assistant response to history
      this.addToHistory('model', assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Check if API is configured
   */
  isAPIConfigured() {
    return this.isConfigured;
  }

  /**
   * Update API key and reinitialize
   */
  updateApiKey(newApiKey) {
    if (setApiKey(newApiKey)) {
      initializeGeminiKey();
      this.isConfigured = !!GEMINI_API_KEY;
      return true;
    }
    return false;
  }

  /**
   * Get current API key (masked for security)
   */
  getCurrentApiKey() {
    const key = getStoredApiKey();
    if (!key) return '';
    return key.length > 8 ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : key;
  }
}

// Export the service and API key management functions
const chatbotService = new ChatbotService();

// Export functions for global access
window.ChatbotService = chatbotService;
window.setGeminiApiKey = setApiKey;
window.getStoredGeminiApiKey = getStoredApiKey;
window.clearGeminiApiKey = clearStoredApiKey;
