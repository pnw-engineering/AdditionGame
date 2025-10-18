// Client-side storage utilities for non-volatile data persistence
class StorageManager {
  constructor() {
    this.storageTypes = this.detectStorageSupport();
    this.preferredStorage = this.selectBestStorage();
    console.log("Available storage:", this.storageTypes);
    console.log("Using storage:", this.preferredStorage);
  }
  // ...existing code...
}
// Application-specific storage wrapper
class CalculationStorage {
  constructor() {
    this.storage = new StorageManager();
    this.historyKey = "calculation_history";
    this.settingsKey = "app_settings";
    this.cacheKey = "offline_cache";
  }
  // ...existing code...
}
// Make available globally
window.CalculationStorage = new CalculationStorage();
