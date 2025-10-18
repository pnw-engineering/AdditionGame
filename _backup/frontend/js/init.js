// Simple game initialization
console.log("🎮 TRULY Simple - Just load and play!");

window.addEventListener("DOMContentLoaded", () => {
  // Level 0 mode switch button
  const level0ModeBtn = document.getElementById("level0-mode-btn");
  if (level0ModeBtn) {
    level0ModeBtn.onclick = () => {
      if (
        window.additionGame &&
        typeof window.additionGame.level0PracticeMode !== "undefined"
      ) {
        window.additionGame.setLevel0Mode(
          !window.additionGame.level0PracticeMode
        );
      }
    };
  }
  // Level 0 number tile click listeners
  document
    .querySelectorAll("#level0-number-grid .number-tile")
    .forEach((tile) => {
      tile.onclick = () => {
        const number = parseInt(tile.getAttribute("data-number"), 10);
        if (
          window.additionGame &&
          typeof window.additionGame.handleLevel0Practice === "function"
        ) {
          window.additionGame.handleLevel0Practice(number);
        }
      };
    });
  // Back button event listeners
  const level0BackBtn = document.getElementById("level0-back-btn");
  if (level0BackBtn) {
    level0BackBtn.onclick = () => {
      console.log("🔙 Level 0 Back button clicked");
      window.additionGame.goToWelcomeFromLevel0();
    };
  }
  const level1BackBtn = document.getElementById("level1-back-btn");
  if (level1BackBtn) {
    level1BackBtn.onclick = () => {
      console.log("🔙 Level 1 Back button clicked");
      window.additionGame.goToWelcomeFromLevel1();
    };
  }
  // Initialize game and load persistent data
  if (window.AdditionGame) {
    console.log("� Initializing game...");
    window.additionGame = new window.AdditionGame();
    if (window.additionGame.loadPersistentData) {
      window.additionGame.loadPersistentData();
      console.log("🔄 Persistent data loaded:", {
        name: window.additionGame.playerName,
        stats: window.additionGame.stats,
        settings: window.additionGame.settings,
      });
      // Speak welcome message
      if (window.additionGame.settings.soundEnabled) {
        const message = window.additionGame.playerName
          ? `Welcome back, ${window.additionGame.playerName}!`
          : "Welcome to the Addition Game!";
        console.log("Speaking welcome:", message);
        window.additionGame.speak(message);
      }
    }
    // Attach welcome screen button listeners (robust)
    const clearNameBtn = document.getElementById("clear-user-name-btn");
    if (clearNameBtn) {
      clearNameBtn.onclick = () => {
        console.log("🧹 Clear Name button clicked");
        window.additionGame.clearPlayerName();
      };
    } else {
      console.warn("Clear Name button not found");
    }
    const speakNameBtn = document.getElementById("speak-name-btn");
    if (speakNameBtn) {
      speakNameBtn.onclick = () => {
        console.log("🎤 Speak Name button clicked");
        window.additionGame.startNameRecognition();
      };
    } else {
      console.warn("Speak Name button not found");
    }
    console.log("✅ Game ready!");
  } else {
    console.error("❌ AdditionGame not found");
  }

  // Start button for speech (to comply with browser autoplay policies)
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      console.log("🎤 Start button clicked");
      if (!window.additionGame.userName) {
        window.additionGame.promptForUserName();
      } else {
        window.additionGame.speak(
          "Welcome back! Let's play some number games."
        );
      }
    });
  } else {
    console.warn("Start button not found");
  }
});
