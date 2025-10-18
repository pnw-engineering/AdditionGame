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
        console.log(
          "Mode button clicked, current mode:",
          window.additionGame.level0PracticeMode
        );
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
    console.log("🏯 Initializing game...");
    window.additionGame = new window.AdditionGame();
    console.log(
      "🔄 Game initialized with settings:",
      window.additionGame.settings
    );

    // Update interaction prompt based on whether user has a name
    const interactionMessage = document.getElementById("interaction-message");
    if (interactionMessage) {
      if (!window.additionGame.userName) {
        interactionMessage.textContent =
          "Click anywhere to begin the Addition Game and tell me your name!";
      } else {
        interactionMessage.textContent =
          "Click anywhere to begin the Addition Game";
      }
    }

    // Set up user interaction detection for speech
    let speechEnabled = false;
    const enableSpeech = () => {
      if (!speechEnabled) {
        speechEnabled = true;
        console.log("🎤 Speech enabled after user interaction");

        // Hide the interaction prompt
        const prompt = document.getElementById("interaction-prompt");
        if (prompt) {
          prompt.classList.add("hidden");
        }

        // Now play the welcome message (only for returning users)
        if (
          window.additionGame.settings &&
          !window.additionGame.settings.quietMode &&
          window.additionGame.userName
        ) {
          const message = `Welcome back, ${window.additionGame.userName}!`;
          console.log("Speaking welcome:", message);
          window.additionGame.speak(message);
        }

        // Check if we need to prompt for name after speech is enabled
        if (!window.additionGame.userName) {
          setTimeout(() => {
            window.additionGame.promptForUserName();
          }, 1000); // Wait a bit after welcome message
        }

        // Remove the listeners after first interaction
        document.removeEventListener("click", enableSpeech);
        document.removeEventListener("keydown", enableSpeech);
        document.removeEventListener("touchstart", enableSpeech);
      }
    };

    // Listen for first user interaction
    document.addEventListener("click", enableSpeech, { once: true });
    document.addEventListener("keydown", enableSpeech, { once: true });
    document.addEventListener("touchstart", enableSpeech, { once: true });
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
    console.log("✅ Game ready!");
  } else {
    console.error("❌ AdditionGame not found");
  }
});
