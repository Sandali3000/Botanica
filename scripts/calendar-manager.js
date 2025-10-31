// calendar.js — Botanica Care Calendar
class CalendarManager {
  constructor() {
    this.reminders = JSON.parse(localStorage.getItem('plantReminders')) || [];
    this.currentDate = new Date();
    this.initializeNotifications();
  }

  async initializeNotifications() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }

  addReminder(plantId, taskType, dueDate, frequency) {
    const reminder = {
      id: Date.now(),
      plantId,
      taskType,
      dueDate: new Date(dueDate),
      frequency,
      completed: false,
      createdAt: new Date()
    };

    this.reminders.push(reminder);
    this.saveReminders();
    this.scheduleNotification(reminder);
    return reminder;
  }

  getUpcomingReminders() {
    const now = new Date();
    return this.reminders
      .filter(r => !r.completed && r.dueDate >= now)
      .sort((a, b) => a.dueDate - b.dueDate);
  }

  completeReminder(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.completed = true;
      if (reminder.frequency) {
        const nextDue = this.calculateNextDueDate(reminder.dueDate, reminder.frequency);
        this.addReminder(reminder.plantId, reminder.taskType, nextDue, reminder.frequency);
      }
      this.saveReminders();
    }
  }

  calculateNextDueDate(date, freq) {
    const d = new Date(date);
    switch (freq) {
      case 'daily': d.setDate(d.getDate() + 1); break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'biweekly': d.setDate(d.getDate() + 14); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
    }
    return d;
  }

  scheduleNotification(reminder) {
    const now = new Date();
    const delay = reminder.dueDate - now;
    if (delay > 0 && 'Notification' in window) {
      setTimeout(() => {
        const plant = this.getPlantById(reminder.plantId);
        if (plant && Notification.permission === 'granted') {
          new Notification('Plant Care Reminder', {
            body: `Time to ${reminder.taskType} your ${plant.name}!`,
            icon: '/assets/icons/leaf.png'
          });
        }
      }, delay);
    }
  }

  getPlantById(id) {
    // ✅ Fixed: Use the correct storage key
    const plants = JSON.parse(localStorage.getItem('botanical-plants')) || [];
    return plants.find(p => p.id === id);
  }

  saveReminders() {
    localStorage.setItem('plantReminders', JSON.stringify(this.reminders));
  }

  generateCalendarMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = lastDay.getDate();
    const startDay = firstDay.getDay();

    const calendar = [];
    let week = new Array(7).fill(null);

    for (let i = 0; i < startDay; i++) week[i] = null;

    for (let day = 1; day <= days; day++) {
      const weekDay = (startDay + day - 1) % 7;
      week[weekDay] = {
        day,
        reminders: this.getRemindersForDate(new Date(year, month, day))
      };
      if (weekDay === 6 || day === days) {
        calendar.push(week);
        week = new Array(7).fill(null);
      }
    }
    return calendar;
  }

  getRemindersForDate(date) {
    return this.reminders.filter(r => {
      const rd = new Date(r.dueDate);
      return (
        rd.getDate() === date.getDate() &&
        rd.getMonth() === date.getMonth() &&
        rd.getFullYear() === date.getFullYear()
      );
    });
  }

  deleteReminder(id) {
    this.reminders = this.reminders.filter(r => r.id !== id);
    this.saveReminders();
  }
}

const calendarManager = new CalendarManager();

// ---- UI Rendering ----
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('calendar-grid');
  const monthLabel = document.getElementById('current-month');
  const upcoming = document.getElementById('upcoming-reminders');
  const prev = document.getElementById('prev-month');
  const next = document.getElementById('next-month');
  const addBtn = document.getElementById('add-reminder');

  if (!grid) return;

  let year = calendarManager.currentDate.getFullYear();
  let month = calendarManager.currentDate.getMonth();

  function renderCalendar() {
    const label = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    monthLabel.textContent = label;

    const cal = calendarManager.generateCalendarMonth(year, month);
    grid.innerHTML = '';

    cal.forEach(week => {
      week.forEach(dayObj => {
        const div = document.createElement('div');
        div.classList.add('calendar-day');

        if (dayObj) {
          const date = new Date(year, month, dayObj.day);
          if (new Date().toDateString() === date.toDateString()) div.classList.add('today');
          div.innerHTML = `<span class="date">${dayObj.day}</span>`;
          const remContainer = document.createElement('div');
          remContainer.classList.add('reminders');

          dayObj.reminders.forEach(r => {
            const plant = calendarManager.getPlantById(r.plantId);
            const remDiv = document.createElement('div');
            remDiv.classList.add('reminder-item');
            remDiv.textContent = `${r.taskType} (${plant?.name || 'Plant'})`;
            remContainer.appendChild(remDiv);
          });
          div.appendChild(remContainer);
        }
        grid.appendChild(div);
      });
    });

    renderUpcoming();
  }

  function renderUpcoming() {
    const reminders = calendarManager.getUpcomingReminders();
    upcoming.innerHTML = reminders.length
      ? reminders.map(r => {
          const p = calendarManager.getPlantById(r.plantId);
          const date = new Date(r.dueDate).toLocaleDateString();
          return `
            <div class="reminder-card">
              <div><strong>${p?.name || 'Plant'}</strong></div>
              <div>${r.taskType}</div>
              <div class="date">${date}</div>
            </div>`;
        }).join('')
      : '<p>No upcoming reminders 🌿</p>';
  }

  prev.addEventListener('click', () => {
    month--;
    if (month < 0) { month = 11; year--; }
    renderCalendar();
  });

  next.addEventListener('click', () => {
    month++;
    if (month > 11) { month = 0; year++; }
    renderCalendar();
  });

  addBtn.addEventListener('click', () => {
    const date = prompt("Enter due date (YYYY-MM-DD):");
    const task = prompt("Enter task type (watering, fertilizing, etc):");
    const freq = prompt("Enter frequency (daily, weekly, biweekly, monthly):");

    const plants = JSON.parse(localStorage.getItem('botanical-plants')) || [];

    if (!plants.length) {
      alert("Please add a plant first!");
      return;
    }

    let plant = plants[0];
    if (plants.length > 1) {
      const names = plants.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
      const choice = prompt(`Select a plant:\n${names}`);
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < plants.length) {
        plant = plants[index];
      } else {
        alert("Invalid choice. Reminder not added.");
        return;
      }
    }

    calendarManager.addReminder(plant.id, task, date, freq);
    renderCalendar();
  });

  // Initial render
  renderCalendar();
});
