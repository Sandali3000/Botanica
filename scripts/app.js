class BotanicalApp {
  constructor() {
    // Some manager classes may be undefined if their files fail to load
    this.plantManager = (typeof PlantManager !== 'undefined') ? new PlantManager() : null;
    this.wishlistManager = (typeof WishlistManager !== 'undefined') ? new WishlistManager() : null;
    this.imageHandler = (typeof ImageHandler !== 'undefined') ? new ImageHandler() : null;
    this.currentPage = "dashboard";

  // Expose managers on window for inline handlers and other scripts
  window.plantManager = this.plantManager;
  window.wishlistManager = this.wishlistManager;
  window.imageHandler = this.imageHandler;

    this.init();
  }

  init() {
    this.loadThemePreference();
    this.bindEvents();
    
    // Setup dropdowns immediately
    this.setupDropdowns();
    
    this.showPage("dashboard");
    this.updateDashboard();
    this.initializeSearch();
    this.createFallingLeaves();
  }

  setupDropdowns() {
    console.log('=== DROPDOWN SETUP START ===');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    console.log('Found dropdowns:', dropdowns.length);
    
    if (dropdowns.length === 0) {
      console.error('ERROR: No dropdowns found in DOM!');
      return;
    }
    
    dropdowns.forEach((dropdown, index) => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      console.log(`Dropdown ${index}:`, {
        toggle: toggle ? 'FOUND' : 'MISSING',
        menu: menu ? 'FOUND' : 'MISSING',
        text: toggle ? toggle.textContent.trim() : 'N/A'
      });
      
      if (!toggle) {
        console.error(`ERROR: No toggle found for dropdown ${index}`);
        return;
      }
      
      // Add click handler with maximum priority
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('=== TOGGLE CLICKED ===', toggle.textContent.trim());
        
        // Close all dropdowns
        document.querySelectorAll('.nav-dropdown').forEach(d => {
          d.classList.remove('active');
        });
        
        // Open this one
        dropdown.classList.add('active');
        console.log('Dropdown opened, active class added');
      }, true); // Use capture phase
      
      // Handle dropdown items
      if (menu) {
        menu.querySelectorAll('.dropdown-item').forEach(item => {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            const page = item.dataset.page;
            
            console.log('Dropdown item clicked:', item.id || page);
            
            // Check if this is the music toggle button
            if (item.id === 'music-toggle-btn') {
              window.app.toggleMusicPanel();
              dropdown.classList.remove('active');
              return;
            }
            
            // Check if this is the theme toggle button
            if (item.id === 'theme-toggle-dropdown') {
              window.app.toggleTheme();
              dropdown.classList.remove('active');
              return;
            }
            
            if (page) {
              window.app.showPage(page);
              dropdown.classList.remove('active');
            }
          });
        });
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        d.classList.remove('active');
      });
    });
  }

  setupFooter() {
    const btn = document.getElementById('footer-toggle');
    const footer = document.querySelector('.footer');
    
    if (btn && footer) {
      btn.addEventListener('click', () => {
        footer.classList.toggle('collapsed');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        if (footer.classList.contains('collapsed')) {
          icon.className = 'fas fa-chevron-down';
          text.textContent = 'Show Footer';
        } else {
          icon.className = 'fas fa-chevron-up';
          text.textContent = 'Hide Footer';
        }
      });
    }
  }

  toggleMusicPanel() {
    console.log('=== TOGGLE MUSIC PANEL ===');
    let audioControls = document.querySelector('.audio-controls');
    const musicStatus = document.getElementById('music-status');
    const musicButton = document.getElementById('music-toggle-btn');
    
    console.log('Audio controls element:', audioControls ? 'FOUND' : 'NOT FOUND');
    console.log('Music status element:', musicStatus ? 'FOUND' : 'NOT FOUND');
    console.log('Window.audioManager exists:', typeof window.audioManager !== 'undefined');
    
    // If audio controls don't exist, try to initialize audio manager
    if (!audioControls) {
      console.log('AudioManager: Controls not found, attempting to initialize...');
      if (typeof AudioManager !== 'undefined') {
        try {
          window.audioManager = new AudioManager();
          audioControls = document.querySelector('.audio-controls');
          console.log('AudioManager: Created on demand, controls now:', audioControls ? 'FOUND' : 'STILL NOT FOUND');
        } catch (error) {
          console.error('AudioManager: Failed to create on demand:', error);
        }
      } else {
        console.error('AudioManager: Class not defined!');
      }
    }
    
    if (audioControls) {
      // Toggle visibility
      const wasVisible = audioControls.classList.contains('visible');
      
      if (wasVisible) {
        audioControls.classList.remove('visible');
      } else {
        audioControls.classList.add('visible');
      }
      
      const isVisible = audioControls.classList.contains('visible');
      
      console.log('Music panel is now:', isVisible ? 'VISIBLE ✅' : 'HIDDEN ❌');
      console.log('Classes on audio-controls:', audioControls.className);
      
      // Update status text
      if (musicStatus) {
        musicStatus.textContent = isVisible ? '(On)' : '(Off)';
        musicStatus.style.color = isVisible ? '#4CAF50' : '#999';
        musicStatus.style.fontWeight = isVisible ? 'bold' : 'normal';
        console.log('Status text updated to:', musicStatus.textContent);
      } else {
        console.error('Music status element not found!');
      }
      
      // Update button appearance
      if (musicButton) {
        if (isVisible) {
          musicButton.style.backgroundColor = '#e8f5e9';
          musicButton.style.color = '#4CAF50';
        } else {
          musicButton.style.backgroundColor = '';
          musicButton.style.color = '';
        }
      }
      
      if (isVisible) {
        this.showNotification('🎵 Music panel shown at bottom-left corner', 'success');
      } else {
        this.showNotification('Music panel hidden', 'info');
      }
    } else {
      console.error('❌ CRITICAL: Audio controls element could not be created!');
      console.error('Check if audio-manager.js is loaded and working');
      this.showNotification('❌ Music panel unavailable - check console for errors', 'error');
    }
  }

  setDefaultWateringDate() {
    // Set default date for last-watered input when page loads
    const lastWateredInput = document.getElementById("last-watered");
    if (lastWateredInput && !lastWateredInput.value) {
      lastWateredInput.value = new Date().toISOString().split("T")[0];
    }
  }

  initializeSearch() {
    this.searchInput = document.getElementById("site-search");
    this.searchResults = document.getElementById("search-results");
    this.searchButton = document.querySelector(".search-button");

    // Add event listeners
    this.searchInput.addEventListener(
      "input",
      this.debounce(() => this.handleSearch(), 300)
    );
    this.searchButton.addEventListener("click", () => this.handleSearch());

    // Close search results when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.searchInput.contains(e.target) &&
        !this.searchResults.contains(e.target)
      ) {
        this.searchResults.style.display = "none";
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== this.searchInput) {
        e.preventDefault();
        this.searchInput.focus();
      } else if (
        e.key === "Escape" &&
        this.searchResults.style.display !== "none"
      ) {
        this.searchResults.style.display = "none";
      }
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  handleSearch() {
    const query = this.searchInput.value.trim().toLowerCase();
    if (query.length === 0) {
      this.searchResults.style.display = "none";
      return;
    }

    const results = this.searchContent(query);
    this.displaySearchResults(results, query);
  }

  searchContent(query) {
    const results = [];

    // Search plants in collection
    const plants = this.plantManager.getAllPlants();
    plants.forEach((plant) => {
      if (
        this.matchesSearch(plant.name, query) ||
        this.matchesSearch(plant.species, query) ||
        this.matchesSearch(plant.description, query)
      ) {
        results.push({
          title: plant.name,
          category: "My Plants",
          type: "plant",
          data: plant,
        });
      }
    });

    // Search wishlist items
    const wishlist = this.wishlistManager.getWishlist();
    wishlist.forEach((item) => {
      if (
        this.matchesSearch(item.name, query) ||
        this.matchesSearch(item.notes, query)
      ) {
        results.push({
          title: item.name,
          category: "Wishlist",
          type: "wishlist",
          data: item,
        });
      }
    });

    // Search navigation items
    const navItems = [
      { name: "Dashboard", page: "dashboard" },
      { name: "My Plants", page: "collection" },
      { name: "Wishlist", page: "wishlist" },
      { name: "Add Plant", page: "add-plant" },
      { name: "Discover", page: "discover" },
      { name: "Calendar", page: "calendar" },
    ];

    navItems.forEach((item) => {
      if (this.matchesSearch(item.name, query)) {
        results.push({
          title: item.name,
          category: "Navigation",
          type: "page",
          data: item.page,
        });
      }
    });

    return results;
  }

  matchesSearch(text, query) {
    return text && text.toLowerCase().includes(query);
  }

  displaySearchResults(results, query) {
    if (results.length === 0) {
      this.searchResults.innerHTML =
        '<div class="search-result-item"><div class="search-result-title">No results found</div></div>';
      this.searchResults.style.display = "block";
      return;
    }

    const html = results
      .map((result) => {
        const highlightedTitle = this.highlightText(result.title, query);
        return `
        <div class="search-result-item" data-type="${result.type}" data-id="${
          result.type === "page" ? result.data : result.data.id
        }">
          <div class="search-result-title">${highlightedTitle}</div>
          <div class="search-result-category">${result.category}</div>
        </div>
      `;
      })
      .join("");

    this.searchResults.innerHTML = html;
    this.searchResults.style.display = "block";

    // Add click handlers to results
    this.searchResults
      .querySelectorAll(".search-result-item")
      .forEach((item) => {
        item.addEventListener("click", () => this.handleResultClick(item));
      });
  }

  highlightText(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  handleResultClick(resultElement) {
    const type = resultElement.dataset.type;
    const id = resultElement.dataset.id;

    switch (type) {
      case "page":
        this.showPage(id);
        break;
      case "plant":
        this.showPage("collection");
        // TODO: Scroll to and highlight the specific plant
        break;
      case "wishlist":
        this.showPage("wishlist");
        // TODO: Scroll to and highlight the specific wishlist item
        break;
    }

    // Clear search
    this.searchInput.value = "";
    this.searchResults.style.display = "none";
  }

  createFallingLeaves() {
    const fallingLeavesContainer = document.createElement("div");
    fallingLeavesContainer.className = "falling-leaves";
    document.body.appendChild(fallingLeavesContainer);

    const leafTypes = [
      "leaf-type-1",
      "leaf-type-2",
      "leaf-type-3",
      "leaf-type-4",
      "leaf-type-5",
    ];

    // Create 15 leaves for a gentle effect
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        this.createLeaf(fallingLeavesContainer, leafTypes);
      }, i * 800); // Stagger leaf creation
    }

    // Continuously create new leaves
    setInterval(() => {
      this.createLeaf(fallingLeavesContainer, leafTypes);
    }, 2000);
  }

  createLeaf(container, leafTypes) {
    const leaf = document.createElement("div");
    const leafType = leafTypes[Math.floor(Math.random() * leafTypes.length)];

    leaf.className = `leaf ${leafType}`;

    // Random properties for each leaf
    const left = Math.random() * 100; // 0-100% across screen
    const duration = 8 + Math.random() * 12; // 8-20 seconds
    const delay = Math.random() * 5; // 0-5 seconds delay
    const size = 0.5 + Math.random() * 1; // 0.5x to 1.5x size

    leaf.style.left = `${left}vw`;
    leaf.style.animationDuration = `${duration}s, ${duration / 2}s`;
    leaf.style.animationDelay = `${delay}s`;
    leaf.style.fontSize = `${size}em`;
    leaf.style.opacity = "0.7";

    container.appendChild(leaf);

    // Remove leaf after animation completes
    setTimeout(() => {
      if (leaf.parentNode) {
        leaf.remove();
      }
    }, (duration + delay) * 1000);
  }

  bindEvents() {
    // Footer navigation links
    document.querySelectorAll(".footer-nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Use .closest() to make sure we get the link
        const targetLink = e.target.closest(".footer-nav-link");
        if (!targetLink) return;

        const page = targetLink.getAttribute("data-page");
        console.log('Footer link clicked:', page);

        // --- THIS IS THE NEW LOGIC ---
        if (page && page === this.currentPage) {
          // Use your existing notification function
          this.showNotification("You are already on this page", "info");
        } else if (page) {
          this.showPage(page);
          // Scroll to top when navigating
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // --- END OF NEW LOGIC ---
      });
    });

    // --- NEW Contact Modal Listeners ---
    document
      .getElementById("contact-us-link")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.showContactModal();
      });

    document
      .getElementById("close-contact-modal")
      ?.addEventListener("click", () => {
        this.hideContactModal();
      });

    document.getElementById("contact-modal")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        this.hideContactModal();
      }
    });

    document.getElementById("contact-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Since there's no backend, we just simulate success
      this.showNotification("Message sent successfully! (Demo)", "success");
      document.getElementById("contact-form").reset();
      this.hideContactModal();
    });
    // --- END Contact Modal Listeners ---

    // Navigation - Use event delegation
    const navElement = document.querySelector(".nav");
    if (navElement) {
      navElement.addEventListener("click", (e) => {
        // Check if click is inside a dropdown
        if (e.target.closest('.nav-dropdown')) {
          console.log('Click inside dropdown, ignoring nav handler');
          return;
        }
        
        const btn = e.target.closest(".nav-btn");
        
        // Skip if it's a dropdown toggle
        if (btn && btn.classList.contains('dropdown-toggle')) {
          console.log('Dropdown toggle clicked, ignoring nav handler');
          return;
        }
        
        if (btn) {
          const page = btn.dataset.page;
          console.log('Nav button clicked:', page);

          if (page) {
            // --- THIS IS THE NEW LOGIC ---
            if (page === this.currentPage) {
              this.showNotification("You are already on this page", "info");
            } else {
              this.showPage(page);
            }
            // --- END OF NEW LOGIC ---
          }
        }
      });
    } else {
      console.warn('Nav element not found');
    }

    // Botanica logo click to return to dashboard
    document.querySelector(".logo").addEventListener("click", () => {
      this.showPage("dashboard");
    });

    // Theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    const sortPlants = document.getElementById("sort-plants");
    if (sortPlants) {
      sortPlants.addEventListener("change", (e) => {
        this.renderCollection();
      });
    }

    // Plant form submission
    const plantForm = document.getElementById("plant-form");
    if (plantForm) {
      plantForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePlantSubmit();
      });
    }

    // Wishlist form submission
    const wishlistForm = document.getElementById("wishlist-form");
    if (wishlistForm) {
      wishlistForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleWishlistSubmit();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.showPage("collection");
      });
    }

    // Search and filter controls
    const filterType = document.getElementById("filter-type");
    if (filterType) {
      filterType.addEventListener("change", (e) => {
        this.plantManager.setFilter(e.target.value);
        this.renderCollection();
      });
    }

    const searchPlants = document.getElementById("search-plants");
    if (searchPlants) {
      searchPlants.addEventListener("input", (e) => {
        this.plantManager.setSearch(e.target.value);
        this.renderCollection();
      });
    }

    // Additional filter controls: light, watering frequency, difficulty

    const filterLight = document.getElementById("filter-light");
    if (filterLight) {
      filterLight.addEventListener("change", (e) => {
        this.plantManager.setLightFilter(e.target.value);
        this.renderCollection();
      });
    }

    const filterWatering = document.getElementById("filter-watering");
    if (filterWatering) {
      filterWatering.addEventListener("change", (e) => {
        this.plantManager.setWateringFilter(e.target.value);
        this.renderCollection();
      });
    }

    const filterDifficulty = document.getElementById("filter-difficulty");
    if (filterDifficulty) {
      filterDifficulty.addEventListener("change", (e) => {
        this.plantManager.setDifficultyFilter(e.target.value);
        this.renderCollection();
      });
    }

    // Modal close events
    const closeModal = document.getElementById("close-modal");
    if (closeModal) {
      closeModal.addEventListener("click", () => {
        this.hideModal();
      });
    }

    const plantModal = document.getElementById("plant-modal");
    if (plantModal) {
      plantModal.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
          this.hideModal();
        }
      });
    }

    // Handle delete clicks within modal content
    document.getElementById("modal-content").addEventListener("click", (e) => {
      if (e.target.closest("#modal-delete-btn")) {
        // Delegated deletion is handled inside bindPlantDetailEvents now
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideModal(); // Close plant modal
        this.hideContactModal(); // Close contact modal
      }
    });
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (savedTheme === "light") {
      document.documentElement.removeAttribute("data-theme");
    }

    // Sync UI toggles (supports multiple toggle button variants)
    this.updateThemeToggleUI();
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");

    if (currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }

    // Update any visible toggle buttons/icons/text
    this.updateThemeToggleUI();
  }

  // Update the icon/text on any theme toggle elements that exist
  updateThemeToggleUI() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // Collect possible toggle elements
    const toggles = new Set();
    const byId = document.getElementById("theme-toggle");
    const byDropdown = document.getElementById("theme-toggle-dropdown");
    document.querySelectorAll(".theme-toggle").forEach(el => toggles.add(el));
    if (byId) toggles.add(byId);
    if (byDropdown) toggles.add(byDropdown);

    // Update all discovered toggle elements
    toggles.forEach((el) => {
      const icon = el.querySelector("i");
      const text = el.querySelector("span");
      if (icon) icon.className = `fas fa-${isDark ? "sun" : "moon"}`;
      if (text) text.textContent = isDark ? "Light Mode" : "Dark Mode";
    });
  }

  /**
   * Shows a specific page and runs page-specific initialization logic.
   * @param {string} pageName - The ID of the page element to show.
   */
  showPage(pageName) {
    // Update navigation buttons
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === pageName);
    });

    // Hide all pages
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active");
    });

    // Show target page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
      this.currentPage = pageName;
      targetPage.classList.add("active");

      // Page-specific initialization
      switch (pageName) {
        case "dashboard":
          this.updateDashboard();
          break;
        case "collection":
          this.renderCollection();
          break;
        case "wishlist":
          this.wishlistManager.renderWishlist(this.wishlistManager.getWishes());
          // Initialize image handler for the wishlist form
          if (this.imageHandler) {
            this.imageHandler.initHandler(
              "wish-upload-area",
              "wish-image",
              "wish-image-preview",
              "wish-remove-image",
              "wish-preview-img"
            );
            this.imageHandler.clearImage();
          }
          document.getElementById("wishlist-form")?.reset();
          break;
        case "add-plant":
          // Initialize image handler for the add plant form
          if (this.imageHandler) {
            this.imageHandler.initHandler(
              "upload-area",
              "plant-image",
              "image-preview",
              "remove-image",
              "preview-img"
            );
            this.imageHandler.clearImage();
          }
          document.getElementById("plant-form")?.reset();
          // Set default watering date
          this.setDefaultWateringDate();
          break;
        // No case needed for help-center, privacy-policy, or terms-of-service
        // as they are just simple content pages with no special init logic.
      }
    } else {
      console.error("Page not found:", pageName);
    }
  }

  updateDashboard() {
    if (!this.plantManager) {
      // Set zeros if plantManager is not available
      document.getElementById("total-plants").textContent = "0";
      document.getElementById("needs-water").textContent = "0";
      document.getElementById("low-light").textContent = "0";
      document.getElementById("recent-plants-grid").innerHTML = '<p style="text-align:center;color:var(--text-light);">Plant features temporarily unavailable</p>';
      return;
    }
    
    const stats = this.plantManager.getStats();

    // Update stats
    const totalPlants = document.getElementById("total-plants");
    const needsWater = document.getElementById("needs-water");
    const lowLight = document.getElementById("low-light");

    if (totalPlants) totalPlants.textContent = stats.total;
    if (needsWater) needsWater.textContent = stats.needsWater;
    if (lowLight) lowLight.textContent = stats.lowLight;

    this.renderRecentPlants();
  }

  renderRecentPlants() {
    const container = document.getElementById("recent-plants-grid");
    if (!container) return;

    const recentPlants = this.plantManager.getRecentPlants();

    if (recentPlants.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-seedling"></i>
                    <h3>No plants yet</h3>
                    <p>Add your first plant to get started!</p>
                    <button class="btn-primary" id="add-first-plant">
                        <i class="fas fa-plus"></i>
                        Add First Plant
                    </button>
                </div>
            `;

      // Add event listener to the new button
      const addFirstPlantBtn = document.getElementById("add-first-plant");
      if (addFirstPlantBtn) {
        addFirstPlantBtn.addEventListener("click", () => {
          this.showPage("add-plant");
        });
      }
      return;
    }

    container.innerHTML = recentPlants
      .map((plant) => this.createPlantCard(plant))
      .join("");
    this.bindPlantCardEvents(container);
  }

  renderCollection() {
    const container = document.getElementById("collection-grid");
    if (!container) return;

    if (!this.plantManager) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light);">Plant features temporarily unavailable</p>';
      return;
    }

    let plants = this.plantManager.getPlants();

    // Sort by dropdown selection
    const sortBy = document.getElementById("sort-plants")?.value || "name";
    plants.sort((a, b) => {
      if (sortBy === "dateAdded") {
        return new Date(b.createdAt) - new Date(a.createdAt); // newest first
      } else {
        return a[sortBy]?.toLowerCase() > b[sortBy]?.toLowerCase() ? 1 : -1;
      }
    });

    if (plants.length === 0) {
      const message =
        this.plantManager.currentSearch ||
        this.plantManager.currentFilter !== "all"
          ? "Try adjusting your search or filter"
          : "Start building your plant collection!";

      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-leaf"></i>
                    <h3>No plants found</h3>
                    <p>${message}</p>
                    <button class="btn-primary" id="add-new-plant">
                        <i class="fas fa-plus"></i>
                        Add New Plant
                    </button>
                </div>
            `;

      // Add event listener to the new button
      const addNewPlantBtn = document.getElementById("add-new-plant");
      if (addNewPlantBtn) {
        addNewPlantBtn.addEventListener("click", () => {
          this.showPage("add-plant");
        });
      }
      return;
    }

    container.innerHTML = plants
      .map((plant) => this.createPlantCard(plant))
      .join("");
    this.bindPlantCardEvents(container);

    window.renderCollection = () => this.renderCollection();
  }

  bindPlantCardEvents(container) {
    container.querySelectorAll(".plant-card").forEach((card) => {
      card.addEventListener("click", () => {
        const plantId = card.dataset.plantId;
        if (plantId) {
          this.showPlantDetail(plantId);
        }
      });
    });
  }

  createPlantCard(plant) {
    const lightIcons = {
      low: "fas fa-moon",
      medium: "fas fa-sun",
      bright: "fas fa-sun",
    };

    // Use placeholder if no image
    const imageSrc = plant.image || "assets/images/demo_pic.png";

    // Get watering status if schedule exists
    let wateringStatusHTML = "";
    if (plant.wateringSchedule && this.plantManager.getWateringStatus) {
      const status = this.plantManager.getWateringStatus(plant);
      wateringStatusHTML = `
        <div class="watering-status status-${status.status}">${status.text}</div>
        <button class="water-button" onclick="event.stopPropagation(); plantManager.quickWater('${plant.id}')">
          <span>💧</span> Mark as Watered
        </button>
      `;
    }

    return `
      <div class="plant-card" data-plant-id="${plant.id}">
        <img src="${imageSrc}" 
          alt="${this.escapeHtml(plant.name)}" 
          class="plant-image"
          onerror="this.src='https://via.placeholder.com/300x200/8bb574/ffffff?text=🌿'">
        <div class="plant-info">
          <h3 class="plant-name">${this.escapeHtml(plant.name)}</h3>
          ${
            plant.species
              ? `<p class="plant-species">${this.escapeHtml(plant.species)}</p>`
              : ""
          }
          <div class="plant-meta">
            <span class="plant-type">${this.escapeHtml(plant.type)}</span>
            <span class="plant-light">
              <i class="${lightIcons[plant.light] || "fas fa-sun"}"></i>
              ${this.escapeHtml(plant.light)}
            </span>
          </div>
          <div class="plant-badges">
            <span class="badge small">Water: ${this.escapeHtml(
              plant.wateringFrequency || "weekly"
            )}</span>
            <span class="badge small">${this.escapeHtml(
              plant.difficulty
                ? plant.difficulty.charAt(0).toUpperCase() +
                    plant.difficulty.slice(1)
                : "Easy"
            )}</span>
          </div>
          ${wateringStatusHTML}
        </div>
      </div>
    `;
  }

  async handlePlantSubmit() {
    // Validate image
    const imageValidation = this.imageHandler.validateImage();
    if (!imageValidation.valid) {
      this.showNotification(imageValidation.message, "error");
      return;
    }

    // Validate form
    const plantName = document.getElementById("plant-name");
    if (!plantName || !plantName.value.trim()) {
      this.showNotification("Please enter a plant name", "error");
      return;
    }

    // Check for unique plant name
    if (this.plantManager.hasPlantName(plantName.value)) {
      this.showNotification("Please use a unique plant name", "error");
      return;
    }

    // Get watering schedule data
    const wateringFrequency = document.getElementById("watering-frequency");
    const lastWatered = document.getElementById("last-watered");
    const reminderTime = document.getElementById("reminder-time");

    const wateringSchedule = {
      frequency: wateringFrequency ? parseInt(wateringFrequency.value) : 7,
      lastWatered:
        lastWatered && lastWatered.value
          ? lastWatered.value
          : new Date().toISOString().split("T")[0],
      reminderTime: reminderTime ? reminderTime.value : "09:00",
      notes: "",
    };

    // Get form data
    const plantData = {
      name: plantName.value.trim(),
      species: document.getElementById("plant-species").value.trim(),
      type: document.getElementById("plant-type").value,
      light: document.getElementById("light-requirement").value,
      notes: document.getElementById("plant-notes").value.trim(),
      image: this.imageHandler.getImageData(),
      createdAt: new Date().toISOString(),
      wateringSchedule: wateringSchedule, // ADD THIS LINE
    };

    try {
      // Add plant to collection
      this.plantManager.addPlant(plantData);

      // Show success message
      this.showNotification(
        "🌱 Plant added with watering schedule!",
        "success"
      );

      // Reset form and return to collection
      this.imageHandler.clearImage();
      document.getElementById("plant-form").reset();
      this.showPage("collection");

      // Update dashboard stats
      this.updateDashboard();
    } catch (error) {
      this.showNotification("Error adding plant: " + error.message, "error");
    }
  }

  /**
   * Handles the submission of the wishlist form.
   */
  async handleWishlistSubmit() {
    // Re-initialize image handler for the wishlist form
    this.imageHandler.initHandler(
      "wish-upload-area",
      "wish-image",
      "wish-image-preview",
      "wish-remove-image",
      "wish-preview-img"
    );

    // Validate image (it's optional)
    const imageValidation = this.imageHandler.validateImage();
    if (!imageValidation.valid) {
      this.showNotification(imageValidation.message, "error");
      return;
    }

    // Validate form
    const wishName = document.getElementById("wish-name");
    if (!wishName || !wishName.value.trim()) {
      this.showNotification("Please enter a plant name for your wish", "error");
      return;
    }

    const wishLink = document.getElementById("wish-link");

    // Get form data
    const wishData = {
      name: wishName.value.trim(),
      note: document.getElementById("wish-note").value.trim(),
      link: wishLink?.value.trim() || "",
      image: this.imageHandler.getImageData(),
      createdAt: new Date().toISOString(),
    };

    try {
      this.wishlistManager.addWish(wishData);

      this.showNotification("Wish added to your list!", "success");

      // Reset form and update view
      this.imageHandler.clearImage();
      document.getElementById("wishlist-form").reset();
      this.wishlistManager.renderWishlist(this.wishlistManager.getWishes());
    } catch (error) {
      this.showNotification("Error adding wish: " + error.message, "error");
    }
  }

  /**
   * Renders the detail view for a plant, including the Journal tab.
   * @param {string} plantId - The ID of the plant.
   */
  showPlantDetail(plantId) {
    const plant = this.plantManager.getPlantById(plantId);
    if (!plant) {
      this.showNotification("Plant not found", "error");
      return;
    }

    const lightIcons = {
      low: "fas fa-moon",
      medium: "fas fa-sun",
      bright: "fas fa-sun",
    };

    const modalContent = document.getElementById("modal-content");
    if (!modalContent) return;

    // Use placeholder if no image
    const imageSrc = plant.image || "assets/images/demo_pic.png";

    // --- Modal Structure with Tabs ---
    modalContent.innerHTML = `
            <div class="plant-detail-container" data-plant-id="${plantId}">
                <div class="detail-header">
                    <img src="${imageSrc}" 
                        alt="${plant.name}" 
                        class="detail-image"
                        onerror="this.src='https://via.placeholder.com/400x300/8bb574/ffffff?text=🌿'">
                    <div class="detail-info">
                        <h2>${this.escapeHtml(plant.name)}</h2>
                        ${
                          plant.species
                            ? `<p class="detail-species">${this.escapeHtml(
                                plant.species
                              )}</p>`
                            : ""
                        }
                        <div class="detail-meta">
                            <span class="detail-type">${this.escapeHtml(
                              plant.type
                            )}</span>
                            <span class="detail-light">
                                <i class="${
                                  lightIcons[plant.light] || "fas fa-sun"
                                }"></i> ${this.escapeHtml(plant.light)} Light
                            </span>
                            <span class="detail-watering">Water: ${this.escapeHtml(
                              plant.wateringFrequency || "weekly"
                            )}</span>
                            <span class="detail-difficulty">${this.escapeHtml(
                              plant.difficulty
                                ? plant.difficulty.charAt(0).toUpperCase() +
                                    plant.difficulty.slice(1)
                                : "Easy"
                            )}</span>
                        </div>
                        <p><small>Added: ${new Date(
                          plant.createdAt
                        ).toLocaleDateString()}</small></p>
                    </div>
                </div>

                <div class="detail-tabs">
                    <button class="tab-btn active" data-tab="info">Info</button>
          <button class="tab-btn" data-tab="journal">Journal (${
            plant.journal?.length || 0
          })</button>
          <button class="tab-btn" data-tab="health">Health (${
            plant.healthLogs?.length || 0
          })</button>
                </div>

                <div id="tab-info" class="tab-content active">
                    ${
                      plant.notes
                        ? `
                        <div class="detail-notes">
                            <h3>Care Notes</h3>
                            <p>${this.escapeHtml(plant.notes)}</p>
                        </div>`
                        : `<p class="empty-state-small">No specific care notes recorded.</p>`
                    }
                    <div class="form-actions">
                        <button class="btn-secondary" id="modal-delete-btn" data-plant-id="${plantId}">
                            <i class="fas fa-trash"></i> Delete Plant
                        </button>
                    </div>
                </div>

                <div id="tab-journal" class="tab-content">
                    <h3>New Journal Entry</h3>
                    <form id="journal-form" class="journal-form" data-plant-id="${plantId}">
                        <div class="form-group">
                            <label for="journal-note">Observation/Note *</label>
                            <textarea id="journal-note" rows="2" required placeholder="New leaf, watering, pest notice, etc."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="journal-image">Optional Photo Progress</label>
                            <div class="image-upload">
                                <div class="upload-area" id="journal-upload-area">
                                    <i class="fas fa-camera"></i>
                                    <p>Click to upload image</p>
                                    <input type="file" id="journal-image" accept="image/*" hidden />
                                </div>
                                <div class="image-preview hidden" id="journal-image-preview">
                                    <img id="journal-preview-img" src="" alt="Preview" />
                                    <button type="button" id="journal-remove-image" class="btn-remove">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions journal-actions">
                            <small class="date-display">Date: ${new Date().toLocaleDateString()}</small>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-pen"></i> Add Entry
                            </button>
                        </div>
                    </form>

                    <h3 class="journal-history-header">History</h3>
                    <div id="journal-entries-container" class="journal-entries-container">
                        ${this.renderJournalHistory(plant.journal || [])}
                    </div>
                </div>

        <div id="tab-health" class="tab-content">
          <h3>Record Health Event</h3>
          <form id="health-form" class="health-form" data-plant-id="${plantId}">
            <div class="form-group">
              <label for="health-type">Event Type *</label>
              <select id="health-type" required>
                <option value="watering">Watering</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="growth">Growth / Photo</option>
                <option value="pest">Pest / Disease</option>
                <option value="general">General</option>
              </select>
            </div>

            <div class="form-group">
              <label for="health-date">Date *</label>
              <input type="date" id="health-date" required value="${
                new Date().toISOString().split("T")[0]
              }" />
            </div>

            <div class="form-group">
              <label for="health-notes">Notes</label>
              <textarea id="health-notes" rows="2" placeholder="Notes about watering, fertilizer, pests, growth..."></textarea>
            </div>

            <div class="form-group">
              <label>Photo (optional)</label>
              <div class="image-upload">
                <div class="upload-area" id="health-upload-area">
                  <i class="fas fa-camera"></i>
                  <p>Click to upload image</p>
                  <input type="file" id="health-image" accept="image/*" hidden />
                </div>
                <div class="image-preview hidden" id="health-image-preview">
                  <img id="health-preview-img" src="" alt="Preview" />
                  <button type="button" id="health-remove-image" class="btn-remove">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions journal-actions">
              <button type="submit" class="btn-primary">
                <i class="fas fa-plus"></i> Add Health Log
              </button>
            </div>
          </form>

          <h3 class="health-history-header">Health History</h3>
          <div id="health-entries-container" class="health-entries-container">
            ${this.renderHealthHistory(plant.healthLogs || [])}
          </div>
        </div>
            </div>
        `;

    // Bind all necessary dynamic events
    this.bindPlantDetailEvents(plantId);

    // Initialize image handler for the journal form
    if (this.imageHandler) {
      this.imageHandler.initHandler(
        "journal-upload-area",
        "journal-image",
        "journal-image-preview",
        "journal-remove-image",
        "journal-preview-img"
      );
      this.imageHandler.clearImage();
    }

    // Initialize image handler for the health form (growth/pest photos)
    if (this.imageHandler) {
      this.imageHandler.initHandler(
        "health-upload-area",
        "health-image",
        "health-image-preview",
        "health-remove-image",
        "health-preview-img"
      );
      this.imageHandler.clearImage();
    }

    this.showModal();
  }

  /**
   * Creates the HTML for the journal entries list.
   * @param {Array<object>} journal - The array of entries.
   * @returns {string} HTML markup.
   */
  renderJournalHistory(journal) {
    if (journal.length === 0) {
      return `<div class="empty-state-small">No journal entries recorded yet.</div>`;
    }

    return journal
      .map(
        (entry) => `
            <div class="journal-card" data-entry-id="${entry.id}">
                <div class="journal-header">
                    <span class="journal-date">${new Date(
                      entry.date
                    ).toLocaleDateString()}</span>
                    <button class="btn-delete-entry" data-entry-id="${
                      entry.id
                    }" aria-label="Delete entry">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p class="journal-note">${this.escapeHtml(entry.note)}</p>
                ${
                  entry.image
                    ? `
                    <div class="journal-image-preview">
                        <img src="${entry.image}" alt="Progress photo">
                    </div>`
                    : ""
                }
            </div>
        `
      )
      .join("");
  }

  /**
   * Renders health logs history for a plant.
   * @param {Array<object>} logs
   * @returns {string}
   */
  renderHealthHistory(logs) {
    if (!logs || logs.length === 0) {
      return `<div class="empty-state-small">No health logs recorded yet.</div>`;
    }

    return logs
      .map(
        (log) => `
      <div class="health-card" data-log-id="${log.id}">
        <div class="health-header">
          <span class="health-type">${this.escapeHtml(log.type)}</span>
          <span class="health-date">${new Date(
            log.date
          ).toLocaleDateString()}</span>
          <button class="btn-delete-health" data-log-id="${
            log.id
          }" aria-label="Delete health log">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <p class="health-notes">${this.escapeHtml(log.notes || "")}</p>
        ${
          log.image
            ? `
          <div class="health-image-preview"><img src="${log.image}" alt="Health photo" /></div>
        `
            : ""
        }
      </div>
    `
      )
      .join("");
  }

  /**
   * Handles health form submission (watering, fertilizer, growth photo, pest report).
   * @param {string} plantId
   */
  async handleHealthSubmit(plantId) {
    // Ensure image handler targets the health form
    if (this.imageHandler) {
      this.imageHandler.initHandler(
        "health-upload-area",
        "health-image",
        "health-image-preview",
        "health-remove-image",
        "health-preview-img"
      );
    }

    const type = document.getElementById("health-type")?.value;
    const date = document.getElementById("health-date")?.value;
    const notes = document.getElementById("health-notes")?.value.trim();

    if (!type || !date) {
      this.showNotification("Please provide an event type and date.", "error");
      return;
    }

    const imageValidation = this.imageHandler
      ? this.imageHandler.validateImage()
      : { valid: true };
    if (this.imageHandler && !imageValidation.valid) {
      this.showNotification(imageValidation.message, "error");
      return;
    }

    const image = this.imageHandler ? this.imageHandler.getImageData() : null;

    const log = this.plantManager.addHealthLog(plantId, {
      type,
      date: new Date(date).toISOString(),
      notes,
      image,
    });

    if (log) {
      this.showNotification("Health log added!", "success");
      // Reset form UI
      document.getElementById("health-form")?.reset();
      if (this.imageHandler) this.imageHandler.clearImage();
      // Re-open the detail modal to refresh counts and history
      this.showPlantDetail(plantId);
    } else {
      this.showNotification("Error adding health log.", "error");
    }
  }

  /**
   * Deletes a health log with confirmation and re-renders the modal.
   * @param {string} plantId
   * @param {string} logId
   */
  async deleteHealthLog(plantId, logId) {
    if (
      await this.showCustomConfirm(
        "Are you sure you want to delete this health log?"
      )
    ) {
      const success = this.plantManager.deleteHealthLog(plantId, logId);
      if (success) {
        this.showNotification("Health log deleted.", "success");
        this.showPlantDetail(plantId);
      } else {
        this.showNotification("Error deleting health log.", "error");
      }
    }
  }

  /**
   * Binds events for the plant detail modal (tabs, form submission, delete).
   * @param {string} plantId - The ID of the plant currently displayed.
   */
  bindPlantDetailEvents(plantId) {
    // 1. Tab switching logic
    document.querySelectorAll(".detail-tabs .tab-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        document
          .querySelectorAll(".detail-tabs .tab-btn")
          .forEach((btn) => btn.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((content) => content.classList.remove("active"));

        e.target.classList.add("active");
        const targetId = e.target.getAttribute("data-tab");
        document.getElementById(`tab-${targetId}`).classList.add("active");
      });
    });

    // 2. Plant Delete Button (from Info tab)
    document
      .getElementById("modal-delete-btn")
      ?.addEventListener("click", () => {
        this.deletePlant(plantId);
      });

    // 3. Journal Form Submission
    document.getElementById("journal-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleJournalSubmit(plantId);
    });

    // 4. Journal Entry Delete Buttons (using delegation on the container)
    document
      .getElementById("journal-entries-container")
      ?.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-entry");
        if (deleteBtn) {
          const entryId = deleteBtn.dataset.entryId;
          this.deleteJournalEntry(plantId, entryId);
        }
      });

    // 5. Health form submission
    document.getElementById("health-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleHealthSubmit(plantId);
    });

    // 6. Health entry delete (delegation)
    document
      .getElementById("health-entries-container")
      ?.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-health");
        if (deleteBtn) {
          const logId = deleteBtn.dataset.logId;
          this.deleteHealthLog(plantId, logId);
        }
      });
  }

  /**
   * Handles the submission of a new journal entry.
   * @param {string} plantId - The ID of the plant.
   */
  async handleJournalSubmit(plantId) {
    // Re-initialize image handler to ensure it targets the journal form elements
    this.imageHandler.initHandler(
      "journal-upload-area",
      "journal-image",
      "journal-image-preview",
      "journal-remove-image",
      "journal-preview-img"
    );

    const noteInput = document.getElementById("journal-note");
    const imageValidation = this.imageHandler.validateImage();

    if (!noteInput.value.trim()) {
      this.showNotification("Journal note cannot be empty.", "error");
      return;
    }
    if (!imageValidation.valid) {
      this.showNotification(imageValidation.message, "error");
      return;
    }

    const entryData = {
      note: noteInput.value.trim(),
      image: this.imageHandler.getImageData(),
    };

    // Add entry via PlantManager
    const success = this.plantManager.addJournalEntry(plantId, entryData);

    if (success) {
      this.showNotification("Journal entry added!", "success");

      // Reset form and UI
      noteInput.value = "";
      this.imageHandler.clearImage();

      // Re-render the modal to show the new entry and updated count
      this.showPlantDetail(plantId);
    } else {
      this.showNotification("Error saving journal entry.", "error");
    }
  }

  /**
   * @param {string} message The message to display.
   * @returns {Promise<boolean>} A promise that resolves to true (if OK) or false (if Cancel).
   */
  showCustomConfirm(message) {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = `
      <div class="confirm-modal-overlay">
        <div class="confirm-modal-content">
          <p>${message}</p>
          <div class="confirm-modal-actions">
            <button id="confirm-modalOkBtn" class="confirm-btn confirm-btn-danger">Ok</button>
            <button id="confirm-modalCancelBtn" class="confirm-btn confirm-btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const modal = wrapper.firstElementChild;
    const okButton = modal.querySelector("#confirm-modalOkBtn");
    const cancelButton = modal.querySelector("#confirm-modalCancelBtn");

    document.body.appendChild(modal);
    modal.style.display = "flex";
    return new Promise((resolve) => {
      const onOk = () => {
        cleanup();
        resolve(true); // Return 'true'
      };
      const onCancel = () => {
        cleanup();
        resolve(false); // Return 'false'
      };
      const cleanup = () => {
        modal.remove();
        okButton.removeEventListener("click", onOk);
        cancelButton.removeEventListener("click", onCancel);
      };
      okButton.addEventListener("click", onOk);
      cancelButton.addEventListener("click", onCancel);
    });
  }

  /**
   * Deletes a journal entry and re-renders the detail modal.
   * @param {string} plantId - The ID of the plant.
   * @param {string} entryId - The ID of the entry to delete.
   */
  async deleteJournalEntry(plantId, entryId) {
    if (
      await this.showCustomConfirm(
        "Are you sure you want to delete this journal entry?"
      )
    ) {
      const success = this.plantManager.deleteJournalEntry(plantId, entryId);
      if (success) {
        this.showNotification("Journal entry deleted.", "success");
        // Re-render the modal to show the updated list
        this.showPlantDetail(plantId);
      } else {
        this.showNotification("Error deleting journal entry.", "error");
      }
    }
  }

  /**
   * Shows a modal detailing a single wishlist item.
   * @param {string} wishId - The ID of the wishlist item.
   */
  showWishDetail(wishId) {
    const wish = this.wishlistManager.getWishById(wishId);
    if (!wish) {
      this.showNotification("Wishlist item not found", "error");
      return;
    }

    const modalContent = document.getElementById("modal-content");
    if (!modalContent) return;

    // Use placeholder if no image
    const imageSrc = wish.image || "assets/images/demo_pic.png";

    // HTML for the Wishlist Detail Modal
    modalContent.innerHTML = `
            <div class_."wish-detail">
                <div class="detail-header">
                    <img src="${imageSrc}" 
                        alt="${this.escapeHtml(wish.name)}" 
                        class="detail-image"
                        onerror="this.src='https://via.placeholder.com/400x300/f39c12/ffffff?text=⭐'">
                    <div class="detail-info">
                        <h2>${this.escapeHtml(wish.name)}</h2>
                        <p><small>Added: ${new Date(
                          wish.createdAt
                        ).toLocaleDateString()}</small></p>
                        ${
                          wish.link
                            ? `<a href="${this.escapeHtml(
                                wish.link
                              )}" target="_blank" class="btn-primary modal-link"><i class="fas fa-shopping-cart"></i> View Store</a>`
                            : ""
                        }
                    </div>
                </div>
                ${
                  wish.note
                    ? `
                    <div class="detail-notes">
                        <h3>Notes</h3>
                        <p>${this.escapeHtml(wish.note)}</p>
                    </div>
                `
                    : ""
                }
                <div class="form-actions">
                    <button class_."btn-secondary" id="modal-edit-wish-btn" data-wish-id="${
                      wish.id
                    }">
                        <i class="fas fa-edit"></i>
                        Edit Wish (Future)
                    </button>
                    <button class="btn-secondary" id="modal-delete-wish-btn" data-wish-id="${
                      wish.id
                    }">
                        <i class="fas fa-trash"></i>
                        Delete Wish
                    </button>
                </div>
            </div>
        `;

    // Bind dynamic events inside the modal
    document
      .getElementById("modal-delete-wish-btn")
      ?.addEventListener("click", () => {
        this.deleteWish(wish.id);
      });

    document
      .getElementById("modal-edit-wish-btn")
      ?.addEventListener("click", () => {
        this.showNotification("Edit functionality is coming soon!", "info");
      });

    this.showModal();
  }

  async deletePlant(plantId) {
    if (
      await this.showCustomConfirm(
        "Are you sure you want to delete this plant? This action cannot be undone."
      )
    ) {
      this.plantManager.deletePlant(plantId);
      this.hideModal();
      this.showNotification("Plant deleted successfully", "success");

      // Update views
      if (this.currentPage === "dashboard") {
        this.updateDashboard();
      } else {
        this.renderCollection();
      }
    }
  }

  /**
   * Deletes a wishlist item by ID and updates the UI.
   * @param {string} wishId - The ID of the wishlist item.
   */
  async deleteWish(wishId) {
    if (
      await this.showCustomConfirm(
        "Are you sure you want to delete this wishlist item? This action cannot be undone."
      )
    ) {
      this.wishlistManager.deleteWish(wishId);
      this.hideModal();
      this.showNotification("Wishlist item removed", "success");

      // Update wishlist view
      if (this.currentPage === "wishlist") {
        this.wishlistManager.renderWishlist(this.wishlistManager.getWishes());
      }
    }
  }

  showModal() {
    const modal = document.getElementById("plant-modal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  hideModal() {
    const modal = document.getElementById("plant-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }

  // --- NEW Contact Modal Functions ---
  showContactModal() {
    const modal = document.getElementById("contact-modal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  hideContactModal() {
    const modal = document.getElementById("contact-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }
  // --- END Contact Modal Functions ---

  showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notif) => notif.remove());

    // Create new notification
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

    // Add styles if not already added
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--white);
                    padding: 1rem 1.5rem;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    border-left: 4px solid var(--accent);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                }
                .notification-success {
                    border-left-color: var(--secondary);
                }
                .notification-error {
                    border-left-color: #e74c3c;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-success i {
                    color: var(--secondary);
                }
                .notification-error i {
                    color: #e74c3c;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  }

  escapeHtml(unsafe) {
    if (typeof unsafe !== "string") return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Add empty state styles
const style = document.createElement("style");
style.textContent = `
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        grid-column: 1 / -1;
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
    }
    
    .empty-state i {
        font-size: 4rem;
        color: var(--accent);
        margin-bottom: 1rem;
    }
    
    .empty-state h3 {
        color: var(--primary);
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .empty-state p {
        color: var(--text-light);
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }
    
    .page {
        display: none;
    }
    
    .page.active {
        display: block;
        animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { transform: translateY(0); }
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new BotanicalApp();
  // Provide a compatibility alias used by some scripts (e.g., theme-debug)
  window.botanicalApp = window.app;
});
