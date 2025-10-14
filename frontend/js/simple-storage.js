// Simple localStorage-focused storage for <1K data - perfect for standalone operation
class SimpleStorage {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.fallbackData = new Map(); // In-memory fallback
    console.log("LocalStorage available:", this.isAvailable);
  }

  checkAvailability() {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn("LocalStorage not available, using memory fallback");
      return false;
    }
  }

  // Store data with optional expiry
  store(key, data, expiryDays = null) {
    const item = {
      data: data,
      timestamp: Date.now(),
      expiry: expiryDays ? Date.now() + expiryDays * 24 * 60 * 60 * 1000 : null,
    };

    if (this.isAvailable) {
      try {
        localStorage.setItem(key, JSON.stringify(item));
        return true;
      } catch (e) {
        console.warn("LocalStorage full, using memory fallback");
        this.fallbackData.set(key, item);
        return true;
      }
    } else {
      this.fallbackData.set(key, item);
      return true;
    }
  }

  // Retrieve data
  retrieve(key) {
    let item = null;

    if (this.isAvailable) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          item = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Error reading from localStorage");
      }
    }

    // Fallback to memory storage
    if (!item && this.fallbackData.has(key)) {
      item = this.fallbackData.get(key);
    }

    if (!item) return null;

    // Check expiry
    if (item.expiry && Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.data;
  }

  // Remove data
  remove(key) {
    if (this.isAvailable) {
      localStorage.removeItem(key);
    }
    this.fallbackData.delete(key);
  }

  // Clear all stored data
  clear() {
    if (this.isAvailable) {
      localStorage.clear();
    }
    this.fallbackData.clear();
  }

  // Get all keys
  keys() {
    const keys = new Set();

    if (this.isAvailable) {
      for (let i = 0; i < localStorage.length; i++) {
        keys.add(localStorage.key(i));
      }
    }

    this.fallbackData.forEach((value, key) => keys.add(key));

    return Array.from(keys);
  }

  // Get storage usage info
  getUsage() {
    let totalSize = 0;
    const itemSizes = {};

    if (this.isAvailable) {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = new Blob([localStorage[key]]).size;
          itemSizes[key] = size;
          totalSize += size;
        }
      }
    }

    // Add memory fallback sizes
    this.fallbackData.forEach((value, key) => {
      const size = new Blob([JSON.stringify(value)]).size;
      itemSizes[key] = size;
      totalSize += size;
    });

    return {
      totalBytes: totalSize,
      totalKB: Math.round((totalSize / 1024) * 100) / 100,
      itemSizes: itemSizes,
      isUsingFallback: !this.isAvailable || this.fallbackData.size > 0,
    };
  }
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

  // Save game statistics
  saveGameStats(stats) {
    return this.storage.store(this.keys.gameStats, stats);
  }

  // Get game statistics with defaults
  getGameStats() {
    const defaults = {
      totalProblems: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPlayTime: 0,
      level: 1,
      points: 0,
    };

    const saved = this.storage.retrieve(this.keys.gameStats) || {};
    return { ...defaults, ...saved };
  }

  // Update game stats after each problem
  updateStats(isCorrect, timeTaken) {
    const stats = this.getGameStats();

    stats.totalProblems++;
    if (isCorrect) {
      stats.correctAnswers++;
      stats.currentStreak++;
      stats.points += Math.max(10, 20 - Math.floor(timeTaken / 1000)); // Faster = more points
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.wrongAnswers++;
      stats.currentStreak = 0;
    }

    // Level up every 20 correct answers
    stats.level = Math.floor(stats.correctAnswers / 20) + 1;

    this.saveGameStats(stats);
    return stats;
  }

  // Save player progress (current session)
  saveProgress(progress) {
    return this.storage.store(this.keys.playerProgress, progress);
  }

  // Get player progress
  getProgress() {
    const defaults = {
      currentLevel: 1,
      questionsInSession: 0,
      sessionStartTime: Date.now(),
      difficulty: "easy",
    };

    const saved = this.storage.retrieve(this.keys.playerProgress) || {};
    return { ...defaults, ...saved };
  }

  // Save game settings
  saveSettings(settings) {
    return this.storage.store(this.keys.settings, settings);
  }

  // Get game settings with kid-friendly defaults
  getSettings() {
    const defaults = {
      soundEnabled: true,
      animationsEnabled: true,
      difficulty: "easy", // easy, medium, hard
      timeLimit: false,
      showHints: true,
      colorTheme: "rainbow",
      gameLevel: 0, // Start with level 0 (number recognition)
    };

    const saved = this.storage.retrieve(this.keys.settings) || {};
    return { ...defaults, ...saved };
  }

  // Achievement system
  checkAchievements(stats) {
    const achievements = this.getAchievements();
    const newAchievements = [];

    // First correct answer
    if (stats.correctAnswers >= 1 && !achievements.includes("first_correct")) {
      achievements.push("first_correct");
      newAchievements.push({
        id: "first_correct",
        name: "🎉 First Success!",
        description: "Got your first answer right!",
      });
    }

    // 10 in a row
    if (stats.currentStreak >= 10 && !achievements.includes("streak_10")) {
      achievements.push("streak_10");
      newAchievements.push({
        id: "streak_10",
        name: "🔥 On Fire!",
        description: "10 correct answers in a row!",
      });
    }

    // 50 correct answers total
    if (stats.correctAnswers >= 50 && !achievements.includes("total_50")) {
      achievements.push("total_50");
      newAchievements.push({
        id: "total_50",
        name: "⭐ Math Star!",
        description: "50 correct answers total!",
      });
    }

    // Level 5
    if (stats.level >= 5 && !achievements.includes("level_5")) {
      achievements.push("level_5");
      newAchievements.push({
        id: "level_5",
        name: "🚀 Level 5!",
        description: "Reached level 5!",
      });
    }

    this.saveAchievements(achievements);
    return newAchievements;
  }

  getAchievements() {
    return this.storage.retrieve(this.keys.achievements) || [];
  }

  saveAchievements(achievements) {
    return this.storage.store(this.keys.achievements, achievements);
  }

  // Reset progress (new game)
  resetProgress() {
    this.storage.remove(this.keys.gameStats);
    this.storage.remove(this.keys.playerProgress);
    this.storage.remove(this.keys.achievements);
  }

  // Get accuracy percentage
  getAccuracy() {
    const stats = this.getGameStats();
    if (stats.totalProblems === 0) return 0;
    return Math.round((stats.correctAnswers / stats.totalProblems) * 100);
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
