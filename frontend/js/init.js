// Simple game initialization
console.log("🎮 TRULY Simple - Just load and play!");

// Wait for all scripts to load, then initialize
window.addEventListener("load", () => {
  setTimeout(() => {
    if (window.AdditionGame) {
      console.log("🎯 Initializing game...");
      window.additionGame = new window.AdditionGame();
      console.log("✅ Game ready!");
    } else {
      console.error("❌ AdditionGame not found");
    }
  }, 100);
});
