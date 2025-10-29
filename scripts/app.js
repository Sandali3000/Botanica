class BotanicalApp {
  constructor() {
    this.plantManager = new PlantManager();
    this.wishlistManager = new WishlistManager();
    this.imageHandler = new ImageHandler();
    this.currentPage = "dashboard";

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadThemePreference();
    this.showPage("dashboard");
    this.updateDashboard();

    this.createFallingLeaves();
  }

  createFallingLeaves() {
    const fallingLeavesContainer = document.createElement('div');
    fallingLeavesContainer.className = 'falling-leaves';
    document.body.appendChild(fallingLeavesContainer);

    const leafTypes = ['leaf-type-1', 'leaf-type-2', 'leaf-type-3', 'leaf-type-4', 'leaf-type-5'];

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
    const leaf = document.createElement('div');
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
    leaf.style.opacity = '0.7';

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
        const page = e.target.getAttribute("data-page");
        this.showPage(page);
      });
    });

    // Navigation - Use event delegation
    document.querySelector(".nav").addEventListener("click", (e) => {
      if (e.target.closest(".nav-btn")) {
        const btn = e.target.closest(".nav-btn");
        const page = btn.dataset.page;

        if (page) {
          this.showPage(page);
        }
      }
    });

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
  const editBtn = document.getElementById('editPlantBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (this.currentPlantId) {
          this.openEditForm(this.currentPlantId);
        }
      });
     

    // Handle delete clicks within modal content
    document.getElementById("modal-content").addEventListener("click", (e) => {
      if (e.target.closest("#modal-delete-btn")) {
        // Delegated deletion is handled inside bindPlantDetailEvents now
      }
    });
  
    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideModal();
      }
    });
  }
    
  handlePlantSubmit(e) {
  const form = e.target;
  const editId = form.dataset.editId;

  const plantData = {
    id: editId || Date.now().toString(),
    name: document.getElementById('plantName').value,
    species: document.getElementById('plantSpecies').value,
    type: document.getElementById('plantType').value,
    notes: document.getElementById('plantNotes').value,
    image: this.selectedImage || (editId ? this.getPlantById(editId).image : '')
  };

  if (editId) {
    this.updatePlant(plantData);
    delete form.dataset.editId;
    document.getElementById('addPlantBtn').textContent = 'Add to Collection';
  } else {
    this.addPlant(plantData);
  }

  this.renderPlants();
  form.reset();
  this.closeModal('addPlantModal');
}


  loadThemePreference() {
    const savedTheme = localStorage.getItem("theme");
    const themeToggle = document.getElementById("theme-toggle");

    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (themeToggle) {
        themeToggle.querySelector("i").className = "fas fa-sun";
        themeToggle.querySelector("span").textContent = "Light Mode";
      }
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const themeToggle = document.getElementById("theme-toggle");
    const icon = themeToggle.querySelector("i");

    if (currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      icon.className = "fas fa-moon";
      themeToggle.querySelector("span").textContent = "Dark Mode";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      icon.className = "fas fa-sun";
      themeToggle.querySelector("span").textContent = "Light Mode";
    }

    // Save preference to localStorage
    localStorage.setItem(
      "theme",
      document.documentElement.getAttribute("data-theme") || "light"
    );
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
            this.imageHandler.initHandler("wish-upload-area", "wish-image", "wish-image-preview", "wish-remove-image", "wish-preview-img");
            this.imageHandler.clearImage();
          }
          document.getElementById("wishlist-form")?.reset();
          break;
        case "add-plant":
          // Initialize image handler for the add plant form
          if (this.imageHandler) {
            this.imageHandler.initHandler("upload-area", "plant-image", "image-preview", "remove-image", "preview-img");
            this.imageHandler.clearImage();
          }
          document.getElementById("plant-form")?.reset();
          break;
      }
    } else {
      console.error("Page not found:", pageName);
    }
  }

  updateDashboard() {
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
    const imageSrc =
      plant.image ||
      "https://via.placeholder.com/300x200/8bb574/ffffff?text=🌿";

    return `
            <div class="plant-card" data-plant-id="${plant.id}">
                <img src="${imageSrc}" 
                    alt="${plant.name}" 
                    class="plant-image"
                    onerror="this.src='https://via.placeholder.com/300x200/8bb574/ffffff?text=🌿'">
                <div class="plant-info">
                    <h3 class="plant-name">${this.escapeHtml(plant.name)}</h3>
                    ${
                      plant.species
                        ? `<p class="plant-species">${this.escapeHtml(
                              plant.species
                            )}</p>`
                        : ""
                    }
                    <div class="plant-meta">
                        <span class="plant-type">${plant.type}</span>
                        <span class="plant-light">
                            <i class="${
                              lightIcons[plant.light] || "fas fa-sun"
                            }"></i>
                            ${plant.light}
                        </span>
                    </div>
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

    // Get form data
    const plantData = {
      name: plantName.value.trim(),
      species: document.getElementById("plant-species").value.trim(),
      type: document.getElementById("plant-type").value,
      light: document.getElementById("light-requirement").value,
      notes: document.getElementById("plant-notes").value.trim(),
      image: this.imageHandler.getImageData(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Add plant to collection
      this.plantManager.addPlant(plantData);

      // Show success message
      this.showNotification("Plant added successfully!", "success");

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
    this.imageHandler.initHandler("wish-upload-area", "wish-image", "wish-image-preview", "wish-remove-image", "wish-preview-img");

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
    const imageSrc = plant.image || "https://via.placeholder.com/400x300/8bb574/ffffff?text=🌿";
    
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
                        ${plant.species ? `<p class="detail-species">${this.escapeHtml(plant.species)}</p>` : ""}
                        <div class="detail-meta">
                            <span class="detail-type">${plant.type}</span>
                            <span class="detail-light">
                                <i class="${lightIcons[plant.light] || "fas fa-sun"}"></i> ${plant.light} Light
                            </span>
                        </div>
                        <p><small>Added: ${new Date(plant.createdAt).toLocaleDateString()}</small></p>
                    </div>
                </div>

                <div class="detail-tabs">
                    <button class="tab-btn active" data-tab="info">Info</button>
                    <button class="tab-btn" data-tab="journal">Journal (${plant.journal?.length || 0})</button>
                </div>

                <div id="tab-info" class="tab-content active">
                    ${plant.notes ? `
                        <div class="detail-notes">
                            <h3>Care Notes</h3>
                            <p>${this.escapeHtml(plant.notes)}</p>
                        </div>` : `<p class="empty-state-small">No specific care notes recorded.</p>`
                    }
                    <div class="form-actions">
                        <button id="editPlantBtn" class="btn edit-btn">Edit</button>
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
            </div>
        `;
        
        // Bind all necessary dynamic events
        this.bindPlantDetailEvents(plantId);
        
        // Initialize image handler for the journal form
        if (this.imageHandler) {
            this.imageHandler.initHandler("journal-upload-area", "journal-image", "journal-image-preview", "journal-remove-image", "journal-preview-img");
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
    
    return journal.map(entry => `
            <div class="journal-card" data-entry-id="${entry.id}">
                <div class="journal-header">
                    <span class="journal-date">${new Date(entry.date).toLocaleDateString()}</span>
                    <button class="btn-delete-entry" data-entry-id="${entry.id}" aria-label="Delete entry">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p class="journal-note">${this.escapeHtml(entry.note)}</p>
                ${entry.image ? `
                    <div class="journal-image-preview">
                        <img src="${entry.image}" alt="Progress photo">
                    </div>` : ''}
            </div>
        `).join('');
  }

  /**
   * Binds events for the plant detail modal (tabs, form submission, delete).
   * @param {string} plantId - The ID of the plant currently displayed.
   */
  bindPlantDetailEvents(plantId) {
    // 1. Tab switching logic
    document.querySelectorAll('.detail-tabs .tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.detail-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-tab');
            document.getElementById(`tab-${targetId}`).classList.add('active');
        });
    });

    // 2. Plant Delete Button (from Info tab)
    document.getElementById("modal-delete-btn")?.addEventListener("click", () => {
        this.deletePlant(plantId);
    });
    // 3. Plant Edit Button (from Info tab)
    const editBtn = document.getElementById("editPlantBtn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            this.openEditForm(plantId);
        });
    }

    // 4. Journal Form Submission
    document.getElementById("journal-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleJournalSubmit(plantId);
    });

    // 5. Journal Entry Delete Buttons (using delegation on the container)
    document.getElementById("journal-entries-container")?.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest('.btn-delete-entry');
        if (deleteBtn) {
            const entryId = deleteBtn.dataset.entryId;
            this.deleteJournalEntry(plantId, entryId);
        }
    });
  }

  /**
   * Handles the submission of a new journal entry.
   * @param {string} plantId - The ID of the plant.
   */
  async handleJournalSubmit(plantId) {
    // Re-initialize image handler to ensure it targets the journal form elements
    this.imageHandler.initHandler("journal-upload-area", "journal-image", "journal-image-preview", "journal-remove-image", "journal-preview-img");

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
      noteInput.value = '';
      this.imageHandler.clearImage();
      
      // Re-render the modal to show the new entry and updated count
      this.showPlantDetail(plantId); 
    } else {
      this.showNotification("Error saving journal entry.", "error");
    }
  }

  /**
   * Deletes a journal entry and re-renders the detail modal.
   * @param {string} plantId - The ID of the plant.
   * @param {string} entryId - The ID of the entry to delete.
   */
  deleteJournalEntry(plantId, entryId) {
    if (confirm("Are you sure you want to delete this journal entry?")) {
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
    const imageSrc =
      wish.image ||
      "https://via.placeholder.com/400x300/f39c12/ffffff?text=⭐";

    // HTML for the Wishlist Detail Modal
    modalContent.innerHTML = `
            <div class="wish-detail">
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
                            ? `<a href="${this.escapeHtml(wish.link)}" target="_blank" class="btn-primary modal-link"><i class="fas fa-shopping-cart"></i> View Store</a>`
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
                    <button class="btn-secondary" id="modal-edit-wish-btn" data-wish-id="${wish.id}">
                        <i class="fas fa-edit"></i>
                        Edit Wish (Future)
                    </button>
                    <button class="btn-secondary" id="modal-delete-wish-btn" data-wish-id="${wish.id}">
                        <i class="fas fa-trash"></i>
                        Delete Wish
                    </button>
                </div>
            </div>
        `;

    // Bind dynamic events inside the modal
    document.getElementById("modal-delete-wish-btn")?.addEventListener("click", () => {
      this.deleteWish(wish.id);
    });

    document.getElementById("modal-edit-wish-btn")?.addEventListener("click", () => {
      this.showNotification("Edit functionality is coming soon!", "info");
    });

    this.showModal();
  }

  deletePlant(plantId) {
    if (
      confirm(
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
  deleteWish(wishId) {
    if (
      confirm(
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
});
