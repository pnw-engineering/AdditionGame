// Simple localStorage-focused storage for <1K data - perfect for standalone operation
class SimpleStorage {
  // Basic key-value get
  get(key) {
    if (this.isAvailable) {
      try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (e) {
        return null;
      }
    } else {
      return this.fallbackData.has(key) ? this.fallbackData.get(key) : null;
    }
  }

  // Basic key-value set
  set(key, value) {
    if (this.isAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // fallback
        this.fallbackData.set(key, value);
      }
    } else {
      this.fallbackData.set(key, value);
    }
  }

  // Basic key-value remove
  remove(key) {
    if (this.isAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        this.fallbackData.delete(key);
      }
    } else {
      this.fallbackData.delete(key);
    }
  }
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.fallbackData = new Map(); // In-memory fallback
    console.log("LocalStorage available:", this.isAvailable);
  }

  checkAvailability() {
    try {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  // ...existing code...
}
// Application-specific storage for Addition Game
class AdditionGameStorage {
  constructor() {
    this.storage = new SimpleStorage();
    this.keys = {
      gameStats: "game_stats",
      playerProgress: "player_progress",
      settings: "game_settings",
      achievements: "achievements",
    };
  }
  // ...existing code...

  // Player name persistence
  getPlayerName() {
    return this.storage.get(this.keys.playerName) || "";
  }
  setPlayerName(name) {
    this.storage.set(this.keys.playerName, name);
  }
  clearPlayerName() {
    this.storage.remove(this.keys.playerName);
  }

  // Game stats persistence
  getGameStats() {
    return this.storage.get(this.keys.gameStats) || {};
  }
  setGameStats(stats) {
    this.storage.set(this.keys.gameStats, stats);
  }
  saveGameStats(stats) {
    this.storage.set(this.keys.gameStats, stats);
  }

  // Settings persistence
  getSettings() {
    return this.storage.get(this.keys.settings) || {};
  }
  setSettings(settings) {
    this.storage.set(this.keys.settings, settings);
  }
  saveSettings(settings) {
    this.storage.set(this.keys.settings, settings);
  }
  setGameStats(stats) {
    this.storage.set(this.keys.gameStats, stats);
  }
}
// Make available globally
window.AdditionGameStorage = new AdditionGameStorage();
// Quick game functions for convenience
window.saveGameResult = (isCorrect, timeTaken) => {
  return window.AdditionGameStorage.updateStats(isCorrect, timeTaken);
};
window.getGameStats = () => {
  return window.AdditionGameStorage.getGameStats();
};
window.getPlayerLevel = () => {
  return window.AdditionGameStorage.getGameStats().level;
};
window.getPlayerPoints = () => {
  return window.AdditionGameStorage.getGameStats().points;
};
