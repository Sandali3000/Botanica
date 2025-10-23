class BotanicalApp {
  constructor() {
    this.plantManager = new PlantManager();
    this.imageHandler = new ImageHandler();
    this.currentPage = "dashboard";

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadThemePreference(); // Add this line
    this.showPage("dashboard");
    this.updateDashboard();
  }

  bindEvents() {
    console.log("Binding events..."); // Debug log

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
        console.log("Navigation clicked:", page); // Debug log
        this.showPage(page);
      }
    });

    // Botanica logo click - Add this section
    document.querySelector(".logo").addEventListener("click", () => {
      this.showPage("dashboard");
    });

    // Theme toggle - Add this
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

    // Plant form
    const plantForm = document.getElementById("plant-form");
    if (plantForm) {
      plantForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePlantSubmit();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.showPage("collection");
      });
    }

    // Search and filter
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

    // Modal
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

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideModal();
      }
    });
  }

  // Add these new methods for theme handling
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

  // Rest of your existing methods remain exactly the same
  showPage(pageName) {
    console.log("Showing page:", pageName); // Debug log

    // Update navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === pageName);
    });

    // Hide all pages first
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active");
    });

    // Show target page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
      targetPage.classList.add("active");
      this.currentPage = pageName;

      // Page-specific initialization
      switch (pageName) {
        case "dashboard":
          this.updateDashboard();
          break;
        case "collection":
          this.renderCollection();
          break;
        case "add-plant":
          // Ensure image handler is initialized
          if (this.imageHandler) {
            this.imageHandler.clearImage();
          }
          const plantForm = document.getElementById("plant-form");
          if (plantForm) {
            plantForm.reset();
          }
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
                        <span id="add-first-plant-text">Add First Plant</span>
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
    const imageSrc =
      plant.image ||
      "https://via.placeholder.com/400x300/8bb574/ffffff?text=🌿";

    modalContent.innerHTML = `
            <div class="plant-detail">
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
                            <span class="detail-type">${plant.type}</span>
                            <span class="detail-light">
                                <i class="${
                                  lightIcons[plant.light] || "fas fa-sun"
                                }"></i>
                                ${plant.light} Light
                            </span>
                        </div>
                        <p><small>Added: ${new Date(
                          plant.createdAt
                        ).toLocaleDateString()}</small></p>
                    </div>
                </div>
                ${
                  plant.notes
                    ? `
                    <div class="detail-notes">
                        <h3>Care Notes</h3>
                        <p>${this.escapeHtml(plant.notes)}</p>
                    </div>
                `
                    : ""
                }
                <div class="form-actions">
                    <button class="btn-secondary" id="modal-delete-btn">
                        <i class="fas fa-trash"></i>
                        Delete Plant
                    </button>
                </div>
            </div>
        `;

    // Add event listener to delete button
    const deleteBtn = document.getElementById("modal-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.deletePlant(plant.id);
      });
    }

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
        to { opacity: 1; transform: translateY(0); }
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing app...");
  window.app = new BotanicalApp();
});
