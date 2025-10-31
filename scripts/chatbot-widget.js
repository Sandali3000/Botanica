/**
 * Botanica Chatbot Widget
 * Floating chat interface for the plant care assistant
 */

class ChatbotWidget {
  constructor() {
    this.container = null;
    this.isInitialized = false;
    this.unsubscribe = null;
    this.showApiKeySetup = false;
    this.init();
  }

  /**
   * Initialize the chatbot widget
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  /**
   * Render the chatbot widget HTML
   */
  render() {
    // Create widget container
    this.container = document.createElement('div');
    this.container.id = 'botanica-chatbot-widget';
    this.container.innerHTML = `
      <!-- Chat Button -->
      <button class="chatbot-toggle-btn" id="chatbot-toggle" title="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chatbot-unread-badge" id="unread-badge" style="display: none;">1</span>
      </button>

      <!-- Chat Window -->
      <div class="chatbot-window" id="chatbot-window" style="display: none;">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header-content">
            <h3>🌱 Botanica Bot</h3>
            <p>Your plant care assistant</p>
          </div>
          <div class="chatbot-header-actions">
            <button class="chatbot-config-btn" id="chatbot-config" title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button class="chatbot-clear-btn" id="chatbot-clear" title="Clear chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6"></path>
              </svg>
            </button>
            <button class="chatbot-close-btn" id="chatbot-close" title="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- API Key Setup -->
        <div class="chatbot-api-setup" id="chatbot-api-setup" style="display: none;">
          <div class="api-setup-content">
            <h4>🔑 Setup Required</h4>
            <p>Enter your Gemini API key to enable AI plant assistance</p>
            
            <div class="api-current-key" id="api-current-key" style="display: none;">
              <p>Current key: <span id="masked-api-key"></span></p>
              <button class="api-key-clear" id="api-key-clear">Remove Key</button>
            </div>

            <div class="api-input-group">
              <input
                type="password"
                id="api-key-input"
                class="api-key-input"
                placeholder="Enter API key here..."
                autocomplete="off"
              />
              <button class="api-key-save" id="api-key-save">Save Key</button>
            </div>
            
            <div class="api-help">
              <p>How to get a free API key:</p>
              <ol>
                <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
                <li>Sign in with Google account</li>
                <li>Create API Key and copy it</li>
                <li>Paste above and save</li>
              </ol>
              <small>🔒 Stored locally, never shared</small>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Error Message -->
        <div class="chatbot-error" id="chatbot-error" style="display: none;"></div>

        <!-- Input Area -->
        <div class="chatbot-input-area">
          <input
            type="text"
            id="chatbot-input"
            class="chatbot-input"
            placeholder="Ask about plant care..."
            autocomplete="off"
          />
          <button class="chatbot-send-btn" id="chatbot-send" title="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Attach event listeners
    this.attachEventListeners();

    // Subscribe to context changes
    this.unsubscribe = window.chatbotContext.subscribe((state) => {
      this.updateUI(state);
    });

    // Render initial messages
    this.renderMessages(window.chatbotContext.messages);

    // Initialize API setup display
    this.updateApiSetupDisplay();

    this.isInitialized = true;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const clearBtn = document.getElementById('chatbot-clear');
    const configBtn = document.getElementById('chatbot-config');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    // API Key setup elements
    const apiKeySave = document.getElementById('api-key-save');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKeyClear = document.getElementById('api-key-clear');

    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleChat());
    if (closeBtn) closeBtn.addEventListener('click', () => this.toggleChat());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearChat());
    if (configBtn) configBtn.addEventListener('click', () => this.toggleApiSetup());
    if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // API Key setup event listeners
    if (apiKeySave) apiKeySave.addEventListener('click', () => this.saveApiKey());
    if (apiKeyInput) {
      apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveApiKey();
        }
      });
    }
    if (apiKeyClear) apiKeyClear.addEventListener('click', () => this.clearApiKey());

    // Add resize listener to keep widget in viewport
    window.addEventListener('resize', () => {
      const chatWindow = document.getElementById('chatbot-window');
      if (chatWindow && window.chatbotContext.isOpen) {
        this.ensureInViewport(chatWindow);
      }
    });
  }

  /**
   * Toggle chat visibility
   */
  toggleChat() {
    window.chatbotContext.toggleChat();
  }

  /**
   * Clear chat messages
   */
  clearChat() {
    window.chatbotContext.clearMessages();
  }

  /**
   * Toggle API key setup view
   */
  toggleApiSetup() {
    this.showApiKeySetup = !this.showApiKeySetup;
    this.updateApiSetupDisplay();
  }

  /**
   * Update API setup display
   */
  updateApiSetupDisplay() {
    const apiSetup = document.getElementById('chatbot-api-setup');
    const messages = document.getElementById('chatbot-messages');
    const inputArea = document.querySelector('.chatbot-input-area');
    const currentKeyDiv = document.getElementById('api-current-key');
    const maskedKeySpan = document.getElementById('masked-api-key');

    if (apiSetup && messages && inputArea) {
      if (this.showApiKeySetup) {
        apiSetup.style.display = 'block';
        messages.style.display = 'none';
        inputArea.style.display = 'none';
        
        // Show current API key if it exists
        const maskedKey = chatbotService.getCurrentApiKey();
        if (maskedKey && currentKeyDiv && maskedKeySpan) {
          maskedKeySpan.textContent = maskedKey;
          currentKeyDiv.style.display = 'block';
        } else if (currentKeyDiv) {
          currentKeyDiv.style.display = 'none';
        }
      } else {
        apiSetup.style.display = 'none';
        messages.style.display = 'block';
        inputArea.style.display = 'flex';
      }
    }
  }

  /**
   * Save API key
   */
  saveApiKey() {
    const input = document.getElementById('api-key-input');
    const apiKey = input?.value.trim();

    if (!apiKey) {
      alert('Please enter a valid API key');
      return;
    }

    if (chatbotService.updateApiKey(apiKey)) {
      input.value = '';
      this.showApiKeySetup = false;
      this.updateApiSetupDisplay();
      
      // Add welcome message
      window.chatbotContext.clearMessages();
      window.chatbotContext.addMessage('assistant', '🎉 Great! I\'m now ready to help you with plant care. What would you like to know?');
    } else {
      alert('❌ Failed to save API key. Please try again.');
    }
  }

  /**
   * Clear API key
   */
  clearApiKey() {
    if (window.clearGeminiApiKey) {
      window.clearGeminiApiKey();
    }
    chatbotService.isConfigured = false;
    this.updateApiSetupDisplay();
    
    // Add info message
    window.chatbotContext.clearMessages();
    window.chatbotContext.addMessage('assistant', 'ℹ️ AI assistance has been disabled. Configure your API key in Settings to re-enable.');
  }

  /**
   * Send message to chatbot
   */
  async sendMessage() {
    console.log('SendMessage function called');
    const input = document.getElementById('chatbot-input');
    const message = input?.value?.trim();

    if (!message) {
      console.log('No message to send');
      return;
    }

    if (window.chatbotContext?.isLoading) {
      console.log('Already loading, skipping');
      return;
    }

    // Clear input
    input.value = '';
    console.log('Sending message:', message);

    // Check if API is configured
    if (!chatbotService || !chatbotService.isAPIConfigured()) {
      console.log('API not configured, showing setup');
      if (window.chatbotContext) {
        window.chatbotContext.setError('⚠️ Gemini API key is not configured. Please configure your API key in Settings.');
        window.chatbotContext.addMessage('assistant', '🔧 Please configure your Gemini API key in Settings (gear icon) to enable AI assistance!');
      }
      this.showApiKeySetup = true;
      this.updateApiSetupDisplay();
      return;
    }

    // Add user message
    if (window.chatbotContext) {
      window.chatbotContext.addMessage('user', message);
      window.chatbotContext.setIsLoading(true);
      window.chatbotContext.setError(null);
    }

    try {
      console.log('Calling chatbot service...');
      // Get response from chatbot service
      const response = await chatbotService.sendMessage(message);
      console.log('Got response:', response);
      
      // Add assistant response
      if (window.chatbotContext) {
        window.chatbotContext.addMessage('assistant', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (window.chatbotContext) {
        window.chatbotContext.setError(error.message || 'Failed to get response. Please try again.');
        window.chatbotContext.addMessage('assistant', '❌ Sorry, I encountered an error. Please check your API key and try again.');
      }
    } finally {
      if (window.chatbotContext) {
        window.chatbotContext.setIsLoading(false);
      }
    }
  }

  /**
   * Render messages in the chat window
   */
  renderMessages(messages) {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = messages.map(msg => `
      <div class="chatbot-message chatbot-message-${msg.role}">
        <div class="chatbot-message-content">
          ${this.escapeHtml(msg.content)}
        </div>
      </div>
    `).join('');

    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Update UI based on context state
   */
  updateUI(state) {
    // Update messages
    this.renderMessages(state.messages);

    // Update window visibility
    const window = document.getElementById('chatbot-window');
    if (window) {
      window.style.display = state.isOpen ? 'flex' : 'none';
      
      // Ensure window stays in viewport
      if (state.isOpen) {
        this.ensureInViewport(window);
      }
    }

    // Update loading state
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    if (sendBtn && input) {
      sendBtn.disabled = state.isLoading;
      input.disabled = state.isLoading;
      input.placeholder = state.isLoading ? 'Thinking...' : 'Ask about plant care...';
    }

    // Update error display
    const errorContainer = document.getElementById('chatbot-error');
    if (errorContainer) {
      if (state.error) {
        errorContainer.textContent = state.error;
        errorContainer.style.display = 'block';
      } else {
        errorContainer.style.display = 'none';
      }
    }

    // Update unread badge
    const badge = document.getElementById('unread-badge');
    const toggleBtn = document.getElementById('chatbot-toggle');
    if (badge && toggleBtn && !state.isOpen && state.messages.length > 1) {
      const unreadCount = state.messages.filter(m => m.role === 'assistant').length;
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
      }
    } else if (badge && toggleBtn && state.isOpen) {
      badge.style.display = 'none';
    }
  }

  /**
   * Ensure chat window stays within viewport
   */
  ensureInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Check if window goes off the right edge
    if (rect.right > windowWidth) {
      element.style.right = '0.5rem';
      element.style.left = 'auto';
    }

    // Check if window goes off the bottom
    if (rect.bottom > windowHeight) {
      element.style.bottom = 'auto';
      element.style.top = '0.5rem';
    }

    // Check if window goes off the left edge
    if (rect.left < 0) {
      element.style.left = '0.5rem';
      element.style.right = 'auto';
    }

    // Check if window goes off the top
    if (rect.top < 0) {
      element.style.top = '0.5rem';
      element.style.bottom = 'auto';
    }
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Destroy the widget
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

// Initialize widget when DOM is ready
function initializeChatbot() {
  try {
    console.log('Initializing Botanica Chatbot...');
    window.chatbotWidget = new ChatbotWidget();
    console.log('Botanica Chatbot initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}
