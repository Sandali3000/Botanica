/**
 * Botanica Chatbot Context
 * Manages chat state and message history
 */

class ChatbotContext {
  constructor() {
    this.messages = [
      {
        id: this.generateId(),
        role: 'assistant',
        content: '🌱 Hello! I\'m Botanica Bot, your AI plant care assistant. Ask me anything about plant care, species information, or how to use the Botanica app!\n\n💡 To enable AI responses, click the Settings (⚙️) button to configure your Gemini API key.',
        timestamp: Date.now()
      }
    ];
    this.isOpen = false;
    this.isLoading = false;
    this.error = null;
    this.listeners = [];
    this.messageCounter = 0;
  }

  /**
   * Generate unique message ID
   */
  generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${++this.messageCounter}`;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  /**
   * Get current state
   */
  getState() {
    return {
      messages: this.messages,
      isOpen: this.isOpen,
      isLoading: this.isLoading,
      error: this.error
    };
  }

  /**
   * Toggle chat visibility
   */
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.notifyListeners();
  }

  /**
   * Open chat
   */
  openChat() {
    this.isOpen = true;
    this.notifyListeners();
  }

  /**
   * Close chat
   */
  closeChat() {
    this.isOpen = false;
    this.notifyListeners();
  }

  /**
   * Add message to chat
   */
  addMessage(role, content) {
    const message = {
      id: this.generateId(),
      role: role,
      content: content,
      timestamp: Date.now()
    };
    this.messages.push(message);
    this.notifyListeners();
    return message;
  }

  /**
   * Update last message (for streaming responses)
   */
  updateLastMessage(content) {
    if (this.messages.length > 0) {
      this.messages[this.messages.length - 1].content = content;
      this.notifyListeners();
    }
  }

  /**
   * Set loading state
   */
  setIsLoading(loading) {
    this.isLoading = loading;
    this.notifyListeners();
  }

  /**
   * Set error
   */
  setError(error) {
    this.error = error;
    this.notifyListeners();
  }

  /**
   * Clear all messages and reset state
   */
  clearMessages() {
    this.messages = [
      {
        id: this.generateId(),
        role: 'assistant',
        content: '🌱 Chat cleared! What can I help you with today?\n\n💡 Don\'t forget to configure your API key in Settings if you haven\'t already.',
        timestamp: Date.now()
      }
    ];
    this.error = null;
    this.isLoading = false;
    this.notifyListeners();
  }
}

// Create global instance
window.chatbotContext = new ChatbotContext();
