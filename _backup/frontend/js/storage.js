// Client-side storage utilities for non-volatile data persistence
class StorageManager {
  constructor() {
    this.storageTypes = this.detectStorageSupport();
    this.preferredStorage = this.selectBestStorage();
    console.log("Available storage:", this.storageTypes);
    console.log("Using storage:", this.preferredStorage);
  }

  detectStorageSupport() {
    const support = {
      localStorage: this.isLocalStorageAvailable(),
      sessionStorage: this.isSessionStorageAvailable(),
      indexedDB: this.isIndexedDBAvailable(),
      webSQL: this.isWebSQLAvailable(),
      cookies: true, // Always available
    };
    return support;
  }

  selectBestStorage() {
    // Priority: localStorage > sessionStorage > cookies (skip IndexedDB for <1K data)
    if (this.storageTypes.localStorage) return "localStorage";
    if (this.storageTypes.sessionStorage) return "sessionStorage";
    return "cookies";
  }

  // Check storage availability
  isLocalStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  isSessionStorageAvailable() {
    try {
      const test = "__storage_test__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  isIndexedDBAvailable() {
    return "indexedDB" in window && window.indexedDB !== null;
  }

  isWebSQLAvailable() {
    return "openDatabase" in window;
  }

  // Generic storage interface
  async store(key, data, options = {}) {
    const { persistent = true, expiryDays = null } = options;

    try {
      switch (this.preferredStorage) {
        case "indexedDB":
          return await this.storeInIndexedDB(key, data, options);
        case "localStorage":
          return this.storeInLocalStorage(key, data, options);
        case "sessionStorage":
          return this.storeInSessionStorage(key, data, options);
        default:
          return this.storeInCookies(key, data, options);
      }
    } catch (error) {
      console.error("Storage failed:", error);
      // Fallback to localStorage
      return this.storeInLocalStorage(key, data, options);
    }
  }

  async retrieve(key) {
    try {
      switch (this.preferredStorage) {
        case "indexedDB":
          return await this.retrieveFromIndexedDB(key);
        case "localStorage":
          return this.retrieveFromLocalStorage(key);
        case "sessionStorage":
          return this.retrieveFromSessionStorage(key);
        default:
          return this.retrieveFromCookies(key);
      }
    } catch (error) {
      console.error("Retrieval failed:", error);
      return null;
    }
  }

  async remove(key) {
    try {
      switch (this.preferredStorage) {
        case "indexedDB":
          return await this.removeFromIndexedDB(key);
        case "localStorage":
          return localStorage.removeItem(key);
        case "sessionStorage":
          return sessionStorage.removeItem(key);
        default:
          return this.removeFromCookies(key);
      }
    } catch (error) {
      console.error("Removal failed:", error);
    }
  }

  // localStorage implementation
  storeInLocalStorage(key, data, options = {}) {
    const { expiryDays } = options;
    const item = {
      data: data,
      timestamp: Date.now(),
      expiry: expiryDays ? Date.now() + expiryDays * 24 * 60 * 60 * 1000 : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  }

  retrieveFromLocalStorage(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);

      // Check expiry
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  // sessionStorage implementation
  storeInSessionStorage(key, data, options = {}) {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data: data,
        timestamp: Date.now(),
      })
    );
    return true;
  }

  retrieveFromSessionStorage(key) {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);
      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  // IndexedDB implementation (most robust for large data)
  async storeInIndexedDB(key, data, options = {}) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("AdditionPWA", 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["data"], "readwrite");
        const store = transaction.objectStore("data");

        const item = {
          key: key,
          data: data,
          timestamp: Date.now(),
          expiry: options.expiryDays
            ? Date.now() + options.expiryDays * 24 * 60 * 60 * 1000
            : null,
        };

        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("data")) {
          const store = db.createObjectStore("data", { keyPath: "key" });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async retrieveFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("AdditionPWA", 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["data"], "readonly");
        const store = transaction.objectStore("data");
        const getRequest = store.get(key);

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (!result) {
            resolve(null);
            return;
          }

          // Check expiry
          if (result.expiry && Date.now() > result.expiry) {
            this.removeFromIndexedDB(key);
            resolve(null);
            return;
          }

          resolve(result.data);
        };

        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  async removeFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("AdditionPWA", 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["data"], "readwrite");
        const store = transaction.objectStore("data");
        const deleteRequest = store.delete(key);

        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  // Cookie implementation (fallback)
  storeInCookies(key, data, options = {}) {
    const { expiryDays = 365 } = options;
    const expires = new Date();
    expires.setTime(expires.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    const cookieValue = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${key}=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    return true;
  }

  retrieveFromCookies(key) {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(c.substring(name.length, c.length));
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  }

  removeFromCookies(key) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Utility methods
  async clear() {
    switch (this.preferredStorage) {
      case "indexedDB":
        return this.clearIndexedDB();
      case "localStorage":
        return localStorage.clear();
      case "sessionStorage":
        return sessionStorage.clear();
      default:
        return this.clearCookies();
    }
  }

  async clearIndexedDB() {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase("AdditionPWA");
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  clearCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }

  // Get storage info
  async getStorageInfo() {
    const info = {
      type: this.preferredStorage,
      supported: this.storageTypes,
    };

    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        info.quota = estimate.quota;
        info.usage = estimate.usage;
        info.available = estimate.quota - estimate.usage;
      } catch (error) {
        console.log("Storage estimate not available");
      }
    }

    return info;
  }
}

// Application-specific storage wrapper
class CalculationStorage {
  constructor() {
    this.storage = new StorageManager();
    this.historyKey = "calculation_history";
    this.settingsKey = "app_settings";
    this.cacheKey = "offline_cache";
  }

  // Save calculation history locally
  async saveHistory(history) {
    return await this.storage.store(this.historyKey, history, {
      persistent: true,
    });
  }

  // Get calculation history
  async getHistory() {
    return (await this.storage.retrieve(this.historyKey)) || [];
  }

  // Add single calculation
  async addCalculation(calculation) {
    const history = await this.getHistory();
    const newCalculation = {
      ...calculation,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    history.push(newCalculation);
    await this.saveHistory(history);
    return newCalculation;
  }

  // Save app settings
  async saveSettings(settings) {
    return await this.storage.store(this.settingsKey, settings, {
      persistent: true,
    });
  }

  // Get app settings
  async getSettings() {
    return (await this.storage.retrieve(this.settingsKey)) || {};
  }

  // Cache data for offline use
  async cacheForOffline(data) {
    return await this.storage.store(this.cacheKey, data, {
      persistent: true,
      expiryDays: 7,
    });
  }

  // Get cached data
  async getCachedData() {
    return await this.storage.retrieve(this.cacheKey);
  }

  // Sync with server when online
  async syncWithServer() {
    if (!navigator.onLine) return false;

    try {
      const localHistory = await this.getHistory();
      const serverHistory = await window.API.getHistory();

      // Simple sync logic - merge and save
      const merged = this.mergeHistories(
        localHistory,
        serverHistory.calculations || []
      );
      await this.saveHistory(merged);

      return true;
    } catch (error) {
      console.error("Sync failed:", error);
      return false;
    }
  }

  mergeHistories(local, server) {
    // Simple merge - combine and deduplicate by timestamp
    const combined = [...local, ...server];
    const unique = combined.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.timestamp === item.timestamp)
    );
    return unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Clear all stored data
  async clearAll() {
    await this.storage.remove(this.historyKey);
    await this.storage.remove(this.settingsKey);
    await this.storage.remove(this.cacheKey);
  }

  // Get storage information
  async getStorageInfo() {
    return await this.storage.getStorageInfo();
  }
}

// Make available globally
window.CalculationStorage = new CalculationStorage();
