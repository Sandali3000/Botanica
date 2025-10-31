/**
 * Botanica Environment Configuration Loader
 * Reads environment variables from .env file or browser config
 */

class EnvironmentConfig {
  constructor() {
    this.config = {};
    this.init();
  }

  /**
   * Initialize environment configuration
   */
  async init() {
    try {
      // First, try to load from .env file (development)
      await this.loadFromEnvFile();
    } catch (error) {
      console.debug('Could not load .env file (this is normal for production)');
    }

    // Always check for existing BOTANICA_CONFIG (window config takes precedence)
    if (window.BOTANICA_CONFIG) {
      this.config = { ...this.config, ...window.BOTANICA_CONFIG };
    }

    // Validate configuration
    this.validate();

    // Store back to window for backward compatibility
    window.BOTANICA_CONFIG = this.config;
  }

  /**
   * Load environment variables from .env file
   */
  async loadFromEnvFile() {
    try {
      const response = await fetch('.env.local');
      
      if (!response.ok) {
        // Try .env if .env.local doesn't exist
        const altResponse = await fetch('.env');
        if (!altResponse.ok) {
          throw new Error('No .env file found');
        }
        return this.parseEnvContent(await altResponse.text());
      }

      const envContent = await response.text();
      this.parseEnvContent(envContent);
    } catch (error) {
      console.debug('Could not load .env file:', error.message);
      throw error;
    }
  }

  /**
   * Parse .env file content
   */
  parseEnvContent(content) {
    const lines = content.split('\n');
    
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') {
        return;
      }

      // Parse key=value pairs
      const [key, ...valueParts] = line.split('=');
      const cleanKey = key.trim();
      let value = valueParts.join('=').trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Convert boolean strings
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      // Convert number strings
      if (!isNaN(value) && value !== '') {
        value = Number(value);
      }

      // Store in config
      if (cleanKey) {
        this.config[this.camelCase(cleanKey)] = value;
      }
    });
  }

  /**
   * Convert SNAKE_CASE to camelCase
   */
  camelCase(str) {
    return str.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Validate configuration
   */
  validate() {
    const required = ['geminiApiKey'];
    const missing = [];

    required.forEach(key => {
      if (!this.config[key] || this.config[key] === `your_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}_here`) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      console.warn(
        `⚠️ Botanica Chatbot: Missing configuration for: ${missing.join(', ')}\n` +
        `Please set up your .env.local file or BOTANICA_CONFIG.\n` +
        `Get a free API key at: https://aistudio.google.com/app/apikey`
      );
    }
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    return this.config[this.camelCase(key)] ?? defaultValue;
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    const key = this.get('geminiApiKey');
    return key && key !== 'your_gemini_api_key_here' && key !== '';
  }

  /**
   * Get Gemini API key
   */
  getGeminiApiKey() {
    return this.get('geminiApiKey', '');
  }
}

// Create global instance
window.botanicaEnv = new EnvironmentConfig();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.botanicaEnv.init();
  });
} else {
  window.botanicaEnv.init();
}
