class AudioManager {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentTrackIndex = 0;
    this.soundEffectsEnabled = true;
    
    // Sound effects for button clicks
    this.soundEffects = {
      click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Soft click
      success: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'), // Success tone
      navigation: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'), // Soft navigation
      toggle: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'), // Toggle switch
      delete: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'), // Soft warning
      add: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'), // Positive chime
      modal: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Soft pop
    };
    
    // Set volume for sound effects (quieter than background music)
    Object.values(this.soundEffects).forEach(sound => {
      sound.volume = 0.15;
    });
    
    // Nature sound tracks (using royalty-free URLs)
    this.tracks = [
      {
        name: 'Forest Ambience',
        url: 'https://assets.mixkit.co/active_storage/sfx/2457/2457-preview.mp3',
        icon: 'fa-tree'
      },
      {
        name: 'Rain & Thunder',
        url: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3',
        icon: 'fa-cloud-rain'
      },
      {
        name: 'Ocean Waves',
        url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
        icon: 'fa-water'
      },
      {
        name: 'Birds Chirping',
        url: 'https://assets.mixkit.co/active_storage/sfx/1751/1751-preview.mp3',
        icon: 'fa-dove'
      },
      {
        name: 'Gentle Rain',
        url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3',
        icon: 'fa-cloud-rain'
      },
      {
        name: 'Wind Through Trees',
        url: 'https://assets.mixkit.co/active_storage/sfx/2008/2008-preview.mp3',
        icon: 'fa-wind'
      },
      {
        name: 'Garden Birds',
        url: 'https://assets.mixkit.co/active_storage/sfx/1752/1752-preview.mp3',
        icon: 'fa-leaf'
      },
      {
        name: 'Peaceful Stream',
        url: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3',
        icon: 'fa-water'
      },
      {
        name: 'Morning Birds',
        url: 'https://assets.mixkit.co/active_storage/sfx/1756/1756-preview.mp3',
        icon: 'fa-sun'
      },
      {
        name: 'Crickets Night',
        url: 'https://assets.mixkit.co/active_storage/sfx/1754/1754-preview.mp3',
        icon: 'fa-moon'
      },
      {
        name: 'Soft Rain',
        url: 'https://assets.mixkit.co/active_storage/sfx/2396/2396-preview.mp3',
        icon: 'fa-cloud-rain'
      },
      {
        name: 'Waterfall Flow',
        url: 'https://assets.mixkit.co/active_storage/sfx/2399/2399-preview.mp3',
        icon: 'fa-water'
      },
      {
        name: 'Lake Shore',
        url: 'https://assets.mixkit.co/active_storage/sfx/2398/2398-preview.mp3',
        icon: 'fa-water'
      },
      {
        name: 'Tropical Forest',
        url: 'https://assets.mixkit.co/active_storage/sfx/1750/1750-preview.mp3',
        icon: 'fa-tree'
      },
      {
        name: 'Zen Garden',
        url: 'https://assets.mixkit.co/active_storage/sfx/2397/2397-preview.mp3',
        icon: 'fa-spa'
      }
    ];
    
    this.init();
  }

  init() {
    // Create audio element
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = 0.3; // Set to 30% volume by default
    
    // Load saved preferences
    this.loadPreferences();
    
    // Create audio controls UI
    this.createAudioControls();
    
    // Bind events
    this.bindEvents();
    
    // Auto-play if previously enabled
    if (this.isPlaying) {
      this.play();
    }
  }

  loadPreferences() {
    const savedPlaying = localStorage.getItem('audio-playing');
    const savedMuted = localStorage.getItem('audio-muted');
    const savedVolume = localStorage.getItem('audio-volume');
    const savedTrack = localStorage.getItem('audio-track');
    const savedSoundEffects = localStorage.getItem('audio-sound-effects');
    
    this.isPlaying = savedPlaying === 'true';
    this.isMuted = savedMuted === 'true';
    this.soundEffectsEnabled = savedSoundEffects !== 'false'; // Default to true
    
    if (savedVolume) {
      this.audio.volume = parseFloat(savedVolume);
    }
    
    if (savedTrack) {
      this.currentTrackIndex = parseInt(savedTrack);
    }
    
    this.audio.src = this.tracks[this.currentTrackIndex].url;
  }

  savePreferences() {
    localStorage.setItem('audio-playing', this.isPlaying);
    localStorage.setItem('audio-muted', this.isMuted);
    localStorage.setItem('audio-volume', this.audio.volume);
    localStorage.setItem('audio-track', this.currentTrackIndex);
    localStorage.setItem('audio-sound-effects', this.soundEffectsEnabled);
  }

  createAudioControls() {
    console.log('AudioManager: Creating audio controls...');
    const controls = document.createElement('div');
    controls.className = 'audio-controls';
    controls.innerHTML = `
      <div class="audio-controls-wrapper">
        <button id="audio-toggle" class="audio-btn" title="Play/Pause">
          <i class="fas fa-${this.isPlaying ? 'pause' : 'play'}"></i>
        </button>
        <button id="audio-mute" class="audio-btn" title="Mute/Unmute">
          <i class="fas fa-${this.isMuted ? 'volume-mute' : 'volume-up'}"></i>
        </button>
        <button id="audio-prev" class="audio-btn" title="Previous Track">
          <i class="fas fa-backward"></i>
        </button>
        <button id="audio-next" class="audio-btn" title="Next Track">
          <i class="fas fa-forward"></i>
        </button>
        <button id="audio-effects-toggle" class="audio-btn ${this.soundEffectsEnabled ? 'active' : ''}" title="Toggle Sound Effects">
          <i class="fas fa-${this.soundEffectsEnabled ? 'bell' : 'bell-slash'}"></i>
        </button>
        <div class="audio-track-info">
          <i class="fas ${this.tracks[this.currentTrackIndex].icon}"></i>
          <span id="audio-track-name">${this.tracks[this.currentTrackIndex].name}</span>
        </div>
        <div class="audio-volume-control">
          <i class="fas fa-volume-down"></i>
          <input type="range" id="audio-volume" min="0" max="100" value="${this.audio.volume * 100}" />
          <i class="fas fa-volume-up"></i>
        </div>
      </div>
    `;
    
    // Add styles
    this.addStyles();
    
    // Append to body
    document.body.appendChild(controls);
    console.log('AudioManager: Audio controls added to DOM');
    console.log('AudioManager: Controls element:', controls);
  }

  addStyles() {
    if (document.getElementById('audio-controls-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'audio-controls-styles';
    styles.textContent = `
      .audio-controls {
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        z-index: 99999 !important;
        background: var(--white) !important;
        border-radius: 50px !important;
        padding: 12px 20px !important;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(10px) !important;
        border: 3px solid #4CAF50 !important;
        transition: all 0.3s ease !important;
        display: none !important;
        opacity: 0 !important;
        transform: translateY(20px) !important;
        pointer-events: none !important;
        min-width: 200px !important;
        max-width: 600px !important;
      }
      
      .audio-controls.visible {
        display: flex !important;
        opacity: 1 !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
        visibility: visible !important;
      }
      
      .audio-controls:hover {
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }

      .audio-controls-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .audio-btn {
        background: transparent;
        border: none;
        color: var(--primary);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 50%;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .audio-btn:hover {
        background: var(--light);
        color: var(--secondary);
        transform: scale(1.1);
      }

      .audio-btn:active {
        transform: scale(0.95);
      }

      .audio-btn.active {
        background: var(--secondary);
        color: var(--white);
      }

      .audio-btn.active:hover {
        background: var(--primary);
      }

      .audio-track-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        background: var(--light);
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--primary);
        white-space: nowrap;
      }

      .audio-track-info i {
        font-size: 1rem;
        color: var(--secondary);
      }

      .audio-volume-control {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
      }

      .audio-volume-control i {
        color: var(--text-light);
        font-size: 0.9rem;
      }

      #audio-volume {
        width: 80px;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--light);
        border-radius: 5px;
        outline: none;
        cursor: pointer;
      }

      #audio-volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: var(--secondary);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      #audio-volume::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: var(--secondary);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        transition: all 0.3s ease;
      }

      #audio-volume::-webkit-slider-thumb:hover {
        background: var(--primary);
        transform: scale(1.2);
      }

      #audio-volume::-moz-range-thumb:hover {
        background: var(--primary);
        transform: scale(1.2);
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .audio-controls {
          left: 10px;
          bottom: 80px;
          padding: 10px 15px;
        }

        .audio-controls-wrapper {
          gap: 6px;
        }

        .audio-btn {
          font-size: 1rem;
          padding: 6px 10px;
        }

        .audio-track-info {
          display: none;
        }

        .audio-volume-control {
          display: none;
        }
      }

      /* Dark mode support */
      [data-theme="dark"] .audio-controls {
        background: var(--white);
        border-color: rgba(255, 255, 255, 0.2);
      }

      [data-theme="dark"] .audio-btn {
        color: var(--primary);
      }

      [data-theme="dark"] .audio-btn:hover {
        background: var(--light);
        color: var(--text);
      }

      [data-theme="dark"] .audio-track-info {
        background: var(--light);
        color: var(--text);
      }
    `;
    
    document.head.appendChild(styles);
  }

  bindEvents() {
    // Play/Pause button
    document.getElementById('audio-toggle')?.addEventListener('click', () => {
      this.toggle();
    });

    // Mute button
    document.getElementById('audio-mute')?.addEventListener('click', () => {
      this.toggleMute();
    });

    // Previous track
    document.getElementById('audio-prev')?.addEventListener('click', () => {
      this.previousTrack();
    });

    // Next track
    document.getElementById('audio-next')?.addEventListener('click', () => {
      this.nextTrack();
    });

    // Sound effects toggle
    document.getElementById('audio-effects-toggle')?.addEventListener('click', () => {
      this.toggleSoundEffects();
    });

    // Volume control
    document.getElementById('audio-volume')?.addEventListener('input', (e) => {
      this.setVolume(e.target.value / 100);
    });

    // Handle audio errors
    this.audio.addEventListener('error', () => {
      console.warn('Audio failed to load, trying next track...');
      this.nextTrack();
    });

    // Handle audio end (shouldn't happen with loop, but just in case)
    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    // Add sound effects to all buttons on the page
    this.attachButtonSounds();
  }

  attachButtonSounds() {
    // Wait for DOM to be fully loaded
    setTimeout(() => {
      // Navigation buttons
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => this.playSound('navigation'));
      });

      // Primary buttons (Add, Submit, etc.)
      document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', () => this.playSound('add'));
      });

      // Secondary buttons (Cancel, Edit, etc.)
      document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => this.playSound('click'));
      });

      // Delete buttons
      document.querySelectorAll('[class*="delete"], [class*="remove"]').forEach(btn => {
        btn.addEventListener('click', () => this.playSound('delete'));
      });

      // Theme toggle
      document.getElementById('theme-toggle')?.addEventListener('click', () => {
        this.playSound('toggle');
      });

      // Modal triggers
      document.querySelectorAll('.plant-card, .wishlist-card').forEach(card => {
        card.addEventListener('click', () => this.playSound('modal'));
      });

      // Form submissions
      document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
          this.playSound('success');
        });
      });

      // Generic button clicks (fallback)
      document.querySelectorAll('button:not([id^="audio-"])').forEach(btn => {
        if (!btn.classList.contains('nav-btn') && 
            !btn.classList.contains('btn-primary') && 
            !btn.classList.contains('btn-secondary') &&
            !btn.id.includes('delete') &&
            !btn.id.includes('remove')) {
          btn.addEventListener('click', () => this.playSound('click'));
        }
      });

      // Add sound to dynamically created elements
      this.observeDOMChanges();
    }, 100);
  }

  observeDOMChanges() {
    // Observe DOM changes to add sounds to dynamically created buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if the added node is a button
            if (node.tagName === 'BUTTON') {
              this.addSoundToButton(node);
            }
            // Check for buttons within the added node
            node.querySelectorAll?.('button').forEach(btn => {
              this.addSoundToButton(btn);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  addSoundToButton(btn) {
    // Skip audio control buttons
    if (btn.id && btn.id.startsWith('audio-')) return;

    // Determine sound type based on button class/id
    let soundType = 'click';
    
    if (btn.classList.contains('btn-primary')) {
      soundType = 'add';
    } else if (btn.classList.contains('nav-btn')) {
      soundType = 'navigation';
    } else if (btn.id.includes('delete') || btn.id.includes('remove') || 
               btn.classList.contains('btn-delete') || btn.classList.contains('btn-remove')) {
      soundType = 'delete';
    } else if (btn.id === 'theme-toggle') {
      soundType = 'toggle';
    } else if (btn.classList.contains('modal-close')) {
      soundType = 'modal';
    }

    // Add event listener if not already added
    if (!btn.dataset.soundAttached) {
      btn.addEventListener('click', () => this.playSound(soundType));
      btn.dataset.soundAttached = 'true';
    }
  }

  playSound(type) {
    if (!this.soundEffectsEnabled) return;

    const sound = this.soundEffects[type];
    if (sound) {
      // Clone the audio to allow multiple simultaneous plays
      const soundClone = sound.cloneNode();
      soundClone.volume = sound.volume;
      soundClone.play().catch(err => {
        console.warn('Sound effect play failed:', err);
      });
    }
  }

  toggleSoundEffects() {
    this.soundEffectsEnabled = !this.soundEffectsEnabled;
    this.updateSoundEffectsButton();
    this.savePreferences();
    
    // Play a sound to confirm the toggle
    if (this.soundEffectsEnabled) {
      this.playSound('success');
    }
  }

  updateSoundEffectsButton() {
    const btn = document.getElementById('audio-effects-toggle');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-${this.soundEffectsEnabled ? 'bell' : 'bell-slash'}"></i>`;
      btn.title = this.soundEffectsEnabled ? 'Sound Effects On' : 'Sound Effects Off';
      
      if (this.soundEffectsEnabled) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  play() {
    const playPromise = this.audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updatePlayButton();
          this.savePreferences();
        })
        .catch((error) => {
          console.warn('Auto-play prevented:', error);
          this.isPlaying = false;
          this.updatePlayButton();
        });
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayButton();
    this.savePreferences();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.updateMuteButton();
    this.savePreferences();
  }

  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.savePreferences();
    
    // Update mute button if volume is 0
    if (this.audio.volume === 0 && !this.isMuted) {
      this.isMuted = true;
      this.audio.muted = true;
      this.updateMuteButton();
    } else if (this.audio.volume > 0 && this.isMuted) {
      this.isMuted = false;
      this.audio.muted = false;
      this.updateMuteButton();
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.loadTrack();
  }

  previousTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack();
  }

  loadTrack() {
    const wasPlaying = this.isPlaying;
    this.audio.src = this.tracks[this.currentTrackIndex].url;
    this.updateTrackInfo();
    this.savePreferences();
    
    if (wasPlaying) {
      this.play();
    }
  }

  updatePlayButton() {
    const btn = document.getElementById('audio-toggle');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-${this.isPlaying ? 'pause' : 'play'}"></i>`;
      btn.title = this.isPlaying ? 'Pause' : 'Play';
    }
  }

  updateMuteButton() {
    const btn = document.getElementById('audio-mute');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-${this.isMuted ? 'volume-mute' : 'volume-up'}"></i>`;
      btn.title = this.isMuted ? 'Unmute' : 'Mute';
    }
  }

  updateTrackInfo() {
    const trackName = document.getElementById('audio-track-name');
    const trackInfo = document.querySelector('.audio-track-info i');
    
    if (trackName) {
      trackName.textContent = this.tracks[this.currentTrackIndex].name;
    }
    
    if (trackInfo) {
      trackInfo.className = `fas ${this.tracks[this.currentTrackIndex].icon}`;
    }
  }

  // Public method to destroy the audio manager
  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    const controls = document.querySelector('.audio-controls');
    if (controls) {
      controls.remove();
    }
  }
}

// Initialize audio manager when DOM is ready
let audioManager = null;

function initAudioManager() {
  try {
    console.log('AudioManager: Starting initialization...');
    audioManager = new AudioManager();
    window.audioManager = audioManager;
    console.log('AudioManager: ✅ Initialized successfully');
    console.log('AudioManager: Controls in DOM:', document.querySelector('.audio-controls') ? 'YES' : 'NO');
  } catch (error) {
    console.error('AudioManager: ❌ Failed to initialize:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAudioManager);
} else {
  // DOM already loaded
  initAudioManager();
}

// Export for potential external use
window.AudioManager = AudioManager;