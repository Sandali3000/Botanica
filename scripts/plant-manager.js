// Complete plant-manager.js with watering system
// Replace your entire plant-manager.js file with this code

class PlantManager {
  constructor() {
    this.plants = this.loadPlants();
    this.wateringHistory = this.loadWateringHistory();
    this.reminders = this.loadReminders();
    this.checkRemindersInterval = null;
    this.currentFilter = "all";
    this.currentSearch = "";
    this.currentLightFilter = "all";
    this.currentWateringFilter = "all";
    this.currentDifficultyFilter = "all";

    // Ensure older stored plants get default fields
    let migrated = false;
    this.plants = this.plants.map((p) => {
      const copy = { ...p };
      if (!copy.wateringFrequency) {
        copy.wateringFrequency = "weekly";
        migrated = true;
      }
      if (!copy.difficulty) {
        copy.difficulty = "easy";
        migrated = true;
      }
      if (!copy.light) {
        copy.light = "medium";
        migrated = true;
      }
      return copy;
    });
    if (migrated) this.saveToStorage();
  }

  // Initialize the watering management system
  init() {
    this.startReminderChecker();
    this.updateWateringIndicators();
    this.renderWateringNotifications();
  }

  // Load plants from localStorage
  loadPlants() {
    const stored = localStorage.getItem("botanica_plants");
    return stored ? JSON.parse(stored) : [];
  }

  // Save plants to localStorage
  savePlants() {
    localStorage.setItem("botanica_plants", JSON.stringify(this.plants));
  }

  // Load watering history
  loadWateringHistory() {
    const stored = localStorage.getItem("botanica_watering_history");
    return stored ? JSON.parse(stored) : {};
  }

  // Save watering history
  saveWateringHistory() {
    localStorage.setItem(
      "botanica_watering_history",
      JSON.stringify(this.wateringHistory)
    );
  }

  // Load reminders
  loadReminders() {
    const stored = localStorage.getItem("botanica_reminders");
    return stored ? JSON.parse(stored) : [];
  }

  // Save reminders
  saveReminders() {
    localStorage.setItem("botanica_reminders", JSON.stringify(this.reminders));
  }

  
  // Add plant
  addPlant(plantData) {
    const plant = {
      id: Date.now(),
      ...plantData,
      journal: plantData.journal || [],
      healthLogs: plantData.healthLogs || [],
    };

    this.plants.push(plant);
    this.savePlants();

    // Create watering reminder if schedule exists
    if (plant.wateringSchedule) {
      this.createReminder(plant.id);
    }

    return plant;
  }

  // Delete plant
  deletePlant(id) {
    this.plants = this.plants.filter((plant) => plant.id !== id);
    delete this.wateringHistory[id];
    this.reminders = this.reminders.filter((r) => r.plantId !== id);

    this.savePlants();
    this.saveWateringHistory();
    this.saveReminders();
    this.saveToStorage();
  }

  // Get plant by ID
  getPlantById(id) {
    return this.plants.find((plant) => plant.id == id);
  }

  // Set filter
  setFilter(filter) {
    this.currentFilter = filter;
  }

  // Set search
  setSearch(search) {
    this.currentSearch = search;
  }

  // Get recent plants
  getRecentPlants(limit = 6) {
    return [...this.plants]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Add health log
  addHealthLog(plantId, logData) {
    const plant = this.plants.find((p) => p.id == plantId);
    if (!plant) return false;

    if (!plant.healthLogs) plant.healthLogs = [];

    const log = {
      id: Date.now(),
      ...logData,
    };

    plant.healthLogs.unshift(log);
    this.savePlants();
    return log;
  }

  // Delete health log
  deleteHealthLog(plantId, logId) {
    const plant = this.plants.find((p) => p.id == plantId);
    if (!plant || !plant.healthLogs) return false;

    plant.healthLogs = plant.healthLogs.filter((l) => l.id != logId);
    this.savePlants();
    return true;
  }

  getHealthLogs(plantId) {
    const plant = this.getPlantById(plantId);
    return plant && plant.healthLogs ? plant.healthLogs : [];
  }

  //Convenience helpers
  addWateringEvent(plantId, { date, notes }) {
    return this.addHealthLog(plantId, { type: "watering", date, notes });
  }

  addFertilizerEvent(plantId, { date, notes }) {
    return this.addHealthLog(plantId, { type: "fertilizer", date, notes });
  }

  addGrowthPhoto(plantId, { date, notes, image }) {
    return this.addHealthLog(plantId, { type: "growth", date, notes, image });
  }

  addPestReport(plantId, { date, notes, image, details }) {
    return this.addHealthLog(plantId, {
      type: "pest",
      date,
      notes,
      image,
      details,
    });
  }

  getPlants() {
    let filteredPlants = this.plants;

    // Apply type filter
    if (this.currentFilter !== "all") {
      filteredPlants = filteredPlants.filter(
        (plant) => plant.type === this.currentFilter
      );
    }

    // Apply light filter
    if (this.currentLightFilter && this.currentLightFilter !== "all") {
      filteredPlants = filteredPlants.filter(
        (plant) => plant.light === this.currentLightFilter
      );
    }

    // Apply watering frequency filter
    if (this.currentWateringFilter && this.currentWateringFilter !== "all") {
      filteredPlants = filteredPlants.filter(
        (plant) => plant.wateringFrequency === this.currentWateringFilter
      );
    }

    // Apply difficulty filter
    if (
      this.currentDifficultyFilter &&
      this.currentDifficultyFilter !== "all"
    ) {
      filteredPlants = filteredPlants.filter(
        (plant) => plant.difficulty === this.currentDifficultyFilter
      );
    }

    // Apply search filter
    if (this.currentSearch) {
      const searchTerm = this.currentSearch.toLowerCase();
      filteredPlants = filteredPlants.filter(
        (plant) =>
          plant.name.toLowerCase().includes(searchTerm) ||
          (plant.species && plant.species.toLowerCase().includes(searchTerm)) ||
          (plant.notes && plant.notes.toLowerCase().includes(searchTerm))
      );
    }

    return filteredPlants;
  }

  getStats() {
    const total = this.plants.length;
    const needsWater = this.plants.filter(
      (plant) =>
        plant.notes &&
        (plant.notes.toLowerCase().includes("water") ||
          plant.notes.toLowerCase().includes("thirsty"))
    ).length;

    const lowLight = this.plants.filter(
      (plant) => plant.light === "low"
    ).length;

    return { total, needsWater, lowLight };
  }

  setLightFilter(light) {
    this.currentLightFilter = light;
  }

  setWateringFilter(freq) {
    this.currentWateringFilter = freq;
  }

  setDifficultyFilter(level) {
    this.currentDifficultyFilter = level;
  }

  saveToStorage() {
    localStorage.setItem("botanical-plants", JSON.stringify(this.plants));
  }

  /**
   * Adds a new journal entry to a specific plant.
   * @param {string} plantId - The ID of the plant.
   * @param {object} entryData - { note, image }
   */
  addJournalEntry(plantId, entryData) {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      note: entryData.note,
      image: entryData.image || null,
    };

    const plant = this.getPlantById(plantId);
    if (plant) {
      // Ensure journal array exists (for older plants loaded from storage)
      if (!plant.journal) {
        plant.journal = [];
      }
      // Add newest entry to the start of the array (reverse chronological)
      plant.journal.unshift(entry);
      this.saveToStorage();
      return entry;
    }
    return null;
  }

  /**
   * Deletes a specific journal entry from a plant.
   * @param {string} plantId - The ID of the plant.
   * @param {string} entryId - The ID of the entry to delete.
   */
  deleteJournalEntry(plantId, entryId) {
    const plant = this.getPlantById(plantId);
    if (plant && plant.journal) {
      const initialLength = plant.journal.length;
      plant.journal = plant.journal.filter((entry) => entry.id !== entryId);

      if (plant.journal.length < initialLength) {
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Export/Import functionality
  exportData() {
    const data = JSON.stringify(this.plants, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `botanical-plants-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // importData data
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedPlants = JSON.parse(e.target.result);

          if (Array.isArray(importedPlants)) {
            // Validate plant structure
            const validPlants = importedPlants.filter(
              (plant) => plant && plant.name && plant.type
            );
            this.plants = this.plants.concat(validPlants);
            this.saveToStorage();
            resolve(validPlants.length);
          } else {
            reject("Invalid data format");
          }
        } catch (error) {
          reject("Error parsing JSON");
        }
      };
      reader.readAsText(file);
    });
  }

  // Add or update plant with watering schedule
  addPlantWateringSchedule(plantId, schedule) {
    const plant = this.plants.find((p) => p.id === plantId);
    if (plant) {
      plant.wateringSchedule = {
        frequency: schedule.frequency || 7,
        lastWatered: schedule.lastWatered || new Date().toISOString(),
        reminderTime: schedule.reminderTime || "09:00",
        customDays: schedule.customDays || null,
        notes: schedule.notes || "",
      };
      this.savePlants();
      this.createReminder(plantId);
      return true;
    }
    return false;
  }

  // Mark plant as watered
  markAsWatered(plantId, notes = "") {
    const plant = this.plants.find((p) => p.id == plantId);
    if (!plant || !plant.wateringSchedule) return false;

    const now = new Date().toISOString();
    plant.wateringSchedule.lastWatered = now;

    // Add to history
    if (!this.wateringHistory[plantId]) {
      this.wateringHistory[plantId] = [];
    }

    this.wateringHistory[plantId].unshift({
      date: now,
      action: "watered",
      notes: notes,
      timestamp: Date.now(),
    });

    // Keep only last 100 entries per plant
    if (this.wateringHistory[plantId].length > 100) {
      this.wateringHistory[plantId] = this.wateringHistory[plantId].slice(
        0,
        100
      );
    }

    this.savePlants();
    this.saveWateringHistory();
    this.updateWateringIndicators();
    this.createReminder(plantId);

    return true;
  }

  // Calculate next watering date
  getNextWateringDate(plant) {
    if (!plant.wateringSchedule) return null;

    const lastWatered = new Date(plant.wateringSchedule.lastWatered);
    const frequency = plant.wateringSchedule.frequency;

    const nextDate = new Date(lastWatered);
    nextDate.setDate(nextDate.getDate() + frequency);

    return nextDate;
  }

  // Get days until next watering
  getDaysUntilWatering(plant) {
    const nextDate = this.getNextWateringDate(plant);
    if (!nextDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // Get watering status
  getWateringStatus(plant) {
    const days = this.getDaysUntilWatering(plant);
    if (days === null)
      return { status: "none", color: "gray", text: "No schedule" };

    if (days < 0) return { status: "overdue", color: "red", text: "Overdue!" };
    if (days === 0)
      return { status: "today", color: "red", text: "Water today" };
    if (days === 1)
      return { status: "tomorrow", color: "orange", text: "Water tomorrow" };
    if (days <= 3)
      return { status: "soon", color: "yellow", text: `${days} days` };

    return { status: "scheduled", color: "green", text: `${days} days` };
  }

  // Create reminder for plant
  createReminder(plantId) {
    const plant = this.plants.find((p) => p.id == plantId);
    if (!plant || !plant.wateringSchedule) return;

    const nextDate = this.getNextWateringDate(plant);
    if (!nextDate) return;

    // Remove existing reminder for this plant
    this.reminders = this.reminders.filter((r) => r.plantId != plantId);

    // Add new reminder
    this.reminders.push({
      plantId: plantId,
      plantName: plant.name,
      type: "watering",
      dueDate: nextDate.toISOString(),
      time: plant.wateringSchedule.reminderTime,
      enabled: true,
    });

    this.saveReminders();
  }

  // Check for due reminders
  checkReminders() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueReminders = [];

    this.reminders.forEach((reminder) => {
      if (!reminder.enabled) return;

      const dueDate = new Date(reminder.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Notify if due today or overdue
      if (diffDays <= 0) {
        dueReminders.push(reminder);
      }
    });

    return dueReminders;
  }

  // Start reminder checker (runs every minute)
  startReminderChecker() {
    if (this.checkRemindersInterval) {
      clearInterval(this.checkRemindersInterval);
    }

    // Check immediately
    this.renderWateringNotifications();

    // Then check every minute
    this.checkRemindersInterval = setInterval(() => {
      this.renderWateringNotifications();
    }, 60000);
  }

  // Render watering notifications in the UI
  renderWateringNotifications() {
    const dueReminders = this.checkReminders();
    const notificationArea = document.getElementById("watering-notifications");

    if (!notificationArea) return;

    if (dueReminders.length === 0) {
      notificationArea.innerHTML = "";
      notificationArea.style.display = "none";
      return;
    }

    notificationArea.style.display = "block";
    notificationArea.innerHTML = `
            <div class="notification-banner">
                <div class="notification-header">
                    <span class="notification-icon">💧</span>
                    <h3>Watering Reminders</h3>
                    <button onclick="plantManager.dismissAllNotifications()" class="dismiss-all">Dismiss All</button>
                </div>
                <div class="notification-list">
                    ${dueReminders
                      .map((reminder) => {
                        const plant = this.plants.find(
                          (p) => p.id == reminder.plantId
                        );
                        const days = plant
                          ? this.getDaysUntilWatering(plant)
                          : 0;
                        return `
                        <div class="notification-item" data-plant-id="${
                          reminder.plantId
                        }">
                            <div class="notification-content">
                                <strong>${reminder.plantName}</strong>
                                <span>needs watering ${
                                  days <= 0 ? "now" : "today"
                                }!</span>
                            </div>
                            <div class="notification-actions">
                                <button onclick="plantManager.quickWater('${
                                  reminder.plantId
                                }')" class="btn-water">
                                    💧 Water Now
                                </button>
                                <button onclick="plantManager.snoozeReminder('${
                                  reminder.plantId
                                }', 1)" class="btn-snooze">
                                    ⏰ Snooze 1d
                                </button>
                            </div>
                        </div>
                    `;
                      })
                      .join("")}
                </div>
            </div>
        `;
  }

  // Quick water action from notification
  quickWater(plantId) {
    if (this.markAsWatered(plantId, "Quick watered from notification")) {
      this.showToast("Plant watered successfully! 🌱");
      this.renderWateringNotifications();
      this.updatePlantCard(plantId);

      // Refresh the collection view if visible
      if (window.renderCollection) {
        window.renderCollection();
      }

      // Update dashboard if on dashboard
      if (window.app && window.app.currentPage === "dashboard") {
        window.app.updateDashboard();
      }
    }
  }

  // Snooze reminder
  snoozeReminder(plantId, days) {
    const plant = this.plants.find((p) => p.id == plantId);
    if (!plant || !plant.wateringSchedule) return;

    const lastWatered = new Date(plant.wateringSchedule.lastWatered);
    lastWatered.setDate(lastWatered.getDate() + days);
    plant.wateringSchedule.lastWatered = lastWatered.toISOString();

    this.savePlants();
    this.createReminder(plantId);
    this.renderWateringNotifications();
    this.showToast(`Reminder snoozed for ${days} day(s) ⏰`);
  }

  // Dismiss all notifications
  dismissAllNotifications() {
    const notificationArea = document.getElementById("watering-notifications");
    if (notificationArea) {
      notificationArea.style.display = "none";
    }
  }

  // Update watering indicators on plant cards
  updateWateringIndicators() {
    this.plants.forEach((plant) => {
      this.updatePlantCard(plant.id);
    });
  }

  // Update individual plant card
  updatePlantCard(plantId) {
    const plant = this.plants.find((p) => p.id == plantId);
    if (!plant) return;

    const card = document.querySelector(`[data-plant-id="${plantId}"]`);
    if (!card) return;

    const status = this.getWateringStatus(plant);
    const statusIndicator = card.querySelector(".watering-status");

    if (statusIndicator) {
      statusIndicator.className = `watering-status status-${status.status}`;
      statusIndicator.textContent = status.text;
    }
  }

  // Get watering history for a plant
  getPlantHistory(plantId, limit = 20) {
    return this.wateringHistory[plantId]?.slice(0, limit) || [];
  }

  // Get watering statistics
  getWateringStats(plantId) {
    const history = this.wateringHistory[plantId] || [];
    const plant = this.plants.find((p) => p.id == plantId);

    if (!plant || !plant.wateringSchedule || history.length < 2) {
      return null;
    }

    const dates = history.map((h) => new Date(h.date));
    let totalDays = 0;

    for (let i = 0; i < dates.length - 1; i++) {
      const diff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
      totalDays += diff;
    }

    const avgInterval = totalDays / (dates.length - 1);

    return {
      totalWaterings: history.length,
      averageInterval: Math.round(avgInterval),
      scheduledInterval: plant.wateringSchedule.frequency,
      consistency: Math.round(
        (1 -
          Math.abs(avgInterval - plant.wateringSchedule.frequency) /
            plant.wateringSchedule.frequency) *
          100
      ),
      lastWatered: history[0].date,
      nextWatering: this.getNextWateringDate(plant),
    };
  }

  // Export watering data
  exportWateringData(plantId = null) {
    const data = {
      exportDate: new Date().toISOString(),
      plants: plantId
        ? [this.plants.find((p) => p.id == plantId)]
        : this.plants,
      history: plantId
        ? { [plantId]: this.wateringHistory[plantId] }
        : this.wateringHistory,
      reminders: plantId
        ? this.reminders.filter((r) => r.plantId == plantId)
        : this.reminders,
    };

    return JSON.stringify(data, null, 2);
  }

  // Show toast notification
  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize the plant manager
const plantManager = new PlantManager();

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => plantManager.init());
} else {
  plantManager.init();
}
