// Complete plant-manager.js with watering system
// Replace your entire plant-manager.js file with this code

class PlantManager {
    constructor() {
        this.plants = this.loadPlants();
        this.wateringHistory = this.loadWateringHistory();
        this.reminders = this.loadReminders();
        this.checkRemindersInterval = null;
    }

    // Initialize the watering management system
    init() {
        this.startReminderChecker();
        this.updateWateringIndicators();
        this.renderWateringNotifications();
    }

    // Load plants from localStorage
    loadPlants() {
        const stored = localStorage.getItem('botanica_plants');
        return stored ? JSON.parse(stored) : [];
    }

    // Save plants to localStorage
    savePlants() {
        localStorage.setItem('botanica_plants', JSON.stringify(this.plants));
    }

    // Load watering history
    loadWateringHistory() {
        const stored = localStorage.getItem('botanica_watering_history');
        return stored ? JSON.parse(stored) : {};
    }

    // Save watering history
    saveWateringHistory() {
        localStorage.setItem('botanica_watering_history', JSON.stringify(this.wateringHistory));
    }

    // Load reminders
    loadReminders() {
        const stored = localStorage.getItem('botanica_reminders');
        return stored ? JSON.parse(stored) : [];
    }

    // Save reminders
    saveReminders() {
        localStorage.setItem('botanica_reminders', JSON.stringify(this.reminders));
    }

    // Add plant
    addPlant(plant) {
        this.plants.push(plant);
        this.savePlants();
        
        // Create watering reminder if schedule exists
        if (plant.wateringSchedule) {
            this.createReminder(plant.id);
        }
    }

    // Delete plant
    deletePlant(id) {
        this.plants = this.plants.filter(plant => plant.id !== id);
        delete this.wateringHistory[id];
        this.reminders = this.reminders.filter(r => r.plantId !== id);
        
        this.savePlants();
        this.saveWateringHistory();
        this.saveReminders();
    }

    // Get plant by ID
    getPlant(id) {
        return this.plants.find(plant => plant.id === id);
    }

    // Add or update plant with watering schedule
    addPlantWateringSchedule(plantId, schedule) {
        const plant = this.plants.find(p => p.id === plantId);
        if (plant) {
            plant.wateringSchedule = {
                frequency: schedule.frequency || 7,
                lastWatered: schedule.lastWatered || new Date().toISOString(),
                reminderTime: schedule.reminderTime || '09:00',
                customDays: schedule.customDays || null,
                notes: schedule.notes || ''
            };
            this.savePlants();
            this.createReminder(plantId);
            return true;
        }
        return false;
    }

    // Mark plant as watered
    markAsWatered(plantId, notes = '') {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant || !plant.wateringSchedule) return false;

        const now = new Date().toISOString();
        plant.wateringSchedule.lastWatered = now;

        // Add to history
        if (!this.wateringHistory[plantId]) {
            this.wateringHistory[plantId] = [];
        }
        
        this.wateringHistory[plantId].unshift({
            date: now,
            action: 'watered',
            notes: notes,
            timestamp: Date.now()
        });

        // Keep only last 100 entries per plant
        if (this.wateringHistory[plantId].length > 100) {
            this.wateringHistory[plantId] = this.wateringHistory[plantId].slice(0, 100);
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
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Get watering status
    getWateringStatus(plant) {
        const days = this.getDaysUntilWatering(plant);
        if (days === null) return { status: 'none', color: 'gray', text: 'No schedule' };
        
        if (days < 0) return { status: 'overdue', color: 'red', text: 'Overdue!' };
        if (days === 0) return { status: 'today', color: 'red', text: 'Water today' };
        if (days === 1) return { status: 'tomorrow', color: 'orange', text: 'Water tomorrow' };
        if (days <= 3) return { status: 'soon', color: 'yellow', text: `${days} days` };
        
        return { status: 'scheduled', color: 'green', text: `${days} days` };
    }

    // Create reminder for plant
    createReminder(plantId) {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant || !plant.wateringSchedule) return;

        const nextDate = this.getNextWateringDate(plant);
        if (!nextDate) return;

        // Remove existing reminder for this plant
        this.reminders = this.reminders.filter(r => r.plantId !== plantId);

        // Add new reminder
        this.reminders.push({
            plantId: plantId,
            plantName: plant.name,
            type: 'watering',
            dueDate: nextDate.toISOString(),
            time: plant.wateringSchedule.reminderTime,
            enabled: true
        });

        this.saveReminders();
    }

    // Check for due reminders
    checkReminders() {
        const now = new Date();
        const dueReminders = [];

        this.reminders.forEach(reminder => {
            if (!reminder.enabled) return;

            const dueDate = new Date(reminder.dueDate);
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

        this.checkRemindersInterval = setInterval(() => {
            this.renderWateringNotifications();
        }, 60000); // Check every minute
    }

    // Render watering notifications in the UI
    renderWateringNotifications() {
        const dueReminders = this.checkReminders();
        const notificationArea = document.getElementById('watering-notifications');
        
        if (!notificationArea) return;

        if (dueReminders.length === 0) {
            notificationArea.innerHTML = '';
            notificationArea.style.display = 'none';
            return;
        }

        notificationArea.style.display = 'block';
        notificationArea.innerHTML = `
            <div class="notification-banner">
                <div class="notification-header">
                    <span class="notification-icon">💧</span>
                    <h3>Watering Reminders</h3>
                    <button onclick="plantManager.dismissAllNotifications()" class="dismiss-all">Dismiss All</button>
                </div>
                <div class="notification-list">
                    ${dueReminders.map(reminder => `
                        <div class="notification-item" data-plant-id="${reminder.plantId}">
                            <div class="notification-content">
                                <strong>${reminder.plantName}</strong>
                                <span>needs watering ${this.getDaysUntilWatering(this.plants.find(p => p.id === reminder.plantId)) <= 0 ? 'now' : 'today'}!</span>
                            </div>
                            <div class="notification-actions">
                                <button onclick="plantManager.quickWater('${reminder.plantId}')" class="btn-water">
                                    💧 Water Now
                                </button>
                                <button onclick="plantManager.snoozeReminder('${reminder.plantId}', 1)" class="btn-snooze">
                                    ⏰ Snooze 1d
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Quick water action from notification
    quickWater(plantId) {
        if (this.markAsWatered(plantId, 'Quick watered from notification')) {
            this.showToast('Plant watered successfully! 🌱');
            this.renderWateringNotifications();
            this.updatePlantCard(plantId);
            
            // Refresh the collection view if visible
            if (window.renderCollection) {
                window.renderCollection();
            }
        }
    }

    // Snooze reminder
    snoozeReminder(plantId, days) {
        const plant = this.plants.find(p => p.id === plantId);
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
        const notificationArea = document.getElementById('watering-notifications');
        if (notificationArea) {
            notificationArea.style.display = 'none';
        }
    }

    // Update watering indicators on plant cards
    updateWateringIndicators() {
        this.plants.forEach(plant => {
            this.updatePlantCard(plant.id);
        });
    }

    // Update individual plant card
    updatePlantCard(plantId) {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant) return;

        const card = document.querySelector(`[data-plant-id="${plantId}"]`);
        if (!card) return;

        const status = this.getWateringStatus(plant);
        const statusIndicator = card.querySelector('.watering-status');
        
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
        const plant = this.plants.find(p => p.id === plantId);
        
        if (!plant || !plant.wateringSchedule || history.length < 2) {
            return null;
        }

        const dates = history.map(h => new Date(h.date));
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
            consistency: Math.round((1 - Math.abs(avgInterval - plant.wateringSchedule.frequency) / plant.wateringSchedule.frequency) * 100),
            lastWatered: history[0].date,
            nextWatering: this.getNextWateringDate(plant)
        };
    }

    // Export watering data
    exportWateringData(plantId = null) {
        const data = {
            exportDate: new Date().toISOString(),
            plants: plantId 
                ? [this.plants.find(p => p.id === plantId)]
                : this.plants,
            history: plantId
                ? { [plantId]: this.wateringHistory[plantId] }
                : this.wateringHistory,
            reminders: plantId
                ? this.reminders.filter(r => r.plantId === plantId)
                : this.reminders
        };

        return JSON.stringify(data, null, 2);
    }

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the plant manager
const plantManager = new PlantManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => plantManager.init());
} else {
    plantManager.init();
}