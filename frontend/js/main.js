// Addition Game for Elementary Kids - Single Screen Implementation
class AdditionGame {
  handleLevel0Practice(number) {
    // Announce the number touched only once
    const instruction = document.getElementById("level0-instruction");
    if (instruction)
      instruction.textContent = `That is the number ${number}. Touch another number!`;
    if (!this.settings.quietMode) {
      // Cancel any ongoing speech before speaking the new number
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      this.speak(`That is the number ${number}. Touch another number!`);
    }
  }
  setLevel0Mode(practice) {
    this.level0PracticeMode = practice;
    // Cancel any ongoing speech immediately when toggling mode
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const btn = document.getElementById("level0-mode-btn");
    const instruction = document.getElementById("level0-instruction");
    if (btn) {
      btn.textContent = practice
        ? "Switch to Test Mode"
        : "Switch to Practice Mode";
    }
    if (practice) {
      // Practice mode: prompt and wait for touch
      if (instruction)
        instruction.textContent =
          "Touch a number and I will tell you what it is.";
      this.clearLevel0PromptTimer();
      if (!this.settings.quietMode) {
        this.speak("Touch a number and I will tell you what it is.");
      }
    } else {
      // Test mode: start normal prompt loop
      this.generateAndPromptLevel0Number();
    }
  }
  // Level 0 - Number Recognition Methods
  initLevel0() {
    this.resetLevel0Stats();
    this.updateLevel0Display();
    this.clearLevel0PromptTimer();
    this.setLevel0Mode(true); // Start in practice mode
  }
  // Utility: Format matrix for display
  formatMatrix(matrix) {
    if (Array.isArray(matrix[0])) {
      // 2D matrix (Level 1)
      return matrix.map((row) => row.join(", ")).join(" | ");
    } else {
      // 1D array (Level 0)
      return matrix.join(", ");
    }
  }

  // Utility: Record a try for a given level/problem
  recordTry(level, i, j) {
    if (level === 0) {
      this.progressMatrix[0].tries[i]++;
    } else if (level === 1) {
      this.progressMatrix[1].tries[i][j]++;
    }
  }

  // Utility: Record an error for a given level/problem
  recordError(level, i, j) {
    if (level === 0) {
      this.progressMatrix[0].errors[i]++;
    } else if (level === 1) {
      this.progressMatrix[1].errors[i][j]++;
    }
  }

  // Utility: Decrement error count (minimum 0)
  decrementError(level, i, j) {
    if (level === 0) {
      this.progressMatrix[0].errors[i] = Math.max(
        0,
        this.progressMatrix[0].errors[i] - 1
      );
    } else if (level === 1) {
      this.progressMatrix[1].errors[i][j] = Math.max(
        0,
        this.progressMatrix[1].errors[i][j] - 1
      );
    }
  }
  // Load settings from storage
  loadSettings() {
    this.settings = this.gameStorage.getSettings();
    // Add any additional settings logic here if needed
  }
  // Show the requested screen and hide others
  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.add("hidden");
    });
    // Show the requested screen
    const target = document.getElementById(screenId);
    if (target) target.classList.remove("hidden");
  }
  // Level 0 prompt repeat timer
  level0PromptTimer = null;
  level0PracticeMode = true;
  constructor() {
    this.currentProblem = null;
    this.startTime = null;
    this.gameStorage = window.AdditionGameStorage;
    this.settings = this.gameStorage.getSettings();
    this.stats = this.gameStorage.getGameStats();
    this.currentGameLevel = this.settings.gameLevel || 0;
    this.speechSynthesis = window.speechSynthesis;

    // Testing mode for scoring logic observation
    this.autoTestMode = false;
    this.autoTestInterval = null;
    this.autoAnswerDelay = 100; // Fast speed for rapid testing

    // Backend Guidelines: Internal Scoring Arrays
    // Simple tracking for adaptive problem selection
    this.progressMatrix = {
      // Level 0 (Number Recognition): 1D array for numbers 0-9
      0: {
        tries: Array(10).fill(0),
        errors: Array(10).fill(0),
      },
      // Level 1 (Single Addition): 10x10 matrix for number combinations
      1: {
        tries: Array(10)
          .fill(null)
          .map(() => Array(10).fill(0)),
        errors: Array(10)
          .fill(null)
          .map(() => Array(10).fill(0)),
      },
    }; // Level definitions
    this.levels = {
      0: {
        name: "Number Recognition",
        description: "Touch the number you hear! 🔢",
        icon: "🔤",
      },
      1: {
        name: "Single Digit Addition",
        description: "Add two numbers (0-9) 🧮",
        icon: "➕",
      },
    };

    // Personalization: User Name
    this.userName = localStorage.getItem("userName") || "";

    this.init();
  }

  init() {
    this.showScreen("welcome-screen");
    this.setupEventListeners();
    this.loadSettings();
    this.checkOnlineStatus();
    this.updateScoringDisplays();

    // Personalization: Show name on all screens
    this.updateUserNameDisplay();
    // If not entered, prompt for name
    if (!this.userName) {
      setTimeout(() => {
        this.promptForUserName();
      }, 500);
    }

    // Hide scoring displays (only show during auto-test)
    setTimeout(() => {
      this.hideScoringDisplays();
    }, 100);
  }

  updateScoringDisplays(specificLevel = null) {
    // Update displays for specific level or all levels
    const levelsToUpdate =
      specificLevel !== null
        ? [specificLevel.toString()]
        : Object.keys(this.progressMatrix);

    levelsToUpdate.forEach((level) => {
      const hitsDisplay = document.getElementById(`level${level}-hits-display`);
      const errorsDisplay = document.getElementById(
        `level${level}-errors-display`
      );

      if (hitsDisplay) {
        const formattedTries = this.formatMatrix(
          this.progressMatrix[level].tries
        );
        hitsDisplay.textContent = formattedTries;
      }
      if (errorsDisplay) {
        const formattedErrors = this.formatMatrix(
          this.progressMatrix[level].errors
        );
        errorsDisplay.textContent = formattedErrors;
      }
    });
  }

  setupEventListeners() {
    // Personalization: Clear Name button
    const clearNameBtn = document.getElementById("clear-user-name-btn");
    if (clearNameBtn) {
      clearNameBtn.addEventListener("click", () => {
        this.clearUserName();
      });
    }
    // Welcome Screen - Level Selection
    document.querySelectorAll(".level-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const level = parseInt(e.currentTarget.dataset.level);
        this.startLevel(level);
      });
    });

    // Settings Button
    // Welcome Screen Settings - Auto-save on change
    const quietMode = document.getElementById("quiet-mode");
    if (quietMode) {
      quietMode.addEventListener("change", (e) => {
        this.settings.quietMode = e.target.checked;
        this.gameStorage.saveSettings(this.settings);
      });
    }

    const difficulty = document.getElementById("difficulty-level");
    if (difficulty) {
      difficulty.addEventListener("change", (e) => {
        this.settings.difficulty = e.target.value;
        this.gameStorage.saveSettings(this.settings);
      });
    }

    // Theme Selector - Live Preview and Auto-save
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.settings.theme = e.target.value;
        this.applyTheme(e.target.value);
        this.gameStorage.saveSettings(this.settings);
      });
    }

    // Level 0 - Number Recognition
    const level0BackBtn = document.getElementById("level0-back-btn");
    if (level0BackBtn) {
      level0BackBtn.addEventListener("click", () => {
        this.showScreen("welcome-screen");
      });
    }

    const level0PlayBtn = document.getElementById("level0-play-btn");
    if (level0PlayBtn) {
      level0PlayBtn.addEventListener("click", () => {
        this.playLevel0Number();
      });
    }

    const level0HintBtn = document.getElementById("level0-hint-btn");
    if (level0HintBtn) {
      level0HintBtn.addEventListener("click", () => {
        this.showLevel0Hint();
      });
    }

    document
      .querySelectorAll("#level0-number-grid .number-tile")
      .forEach((tile) => {
        tile.addEventListener("click", (e) => {
          const number = parseInt(e.currentTarget.dataset.number);
          if (this.level0PracticeMode) {
            this.handleLevel0Practice(number);
          } else {
            this.checkLevel0Answer(number);
          }
        });
      });

    // Level 1 - Addition
    const level1BackBtn = document.getElementById("level1-back-btn");
    if (level1BackBtn) {
      level1BackBtn.addEventListener("click", () => {
        this.showScreen("welcome-screen");
      });
    }

    const level1SubmitBtn = document.getElementById("level1-submit-btn");
    if (level1SubmitBtn) {
      level1SubmitBtn.addEventListener("click", () => {
        this.checkLevel1Answer();
      });
    }

    const level1HintBtn = document.getElementById("level1-hint-btn");
    if (level1HintBtn) {
      level1HintBtn.addEventListener("click", () => {
        this.toggleLevel1Hint();
      });
    }

    const level1NewProblemBtn = document.getElementById(
      "level1-new-problem-btn"
    );
    if (level1NewProblemBtn) {
      level1NewProblemBtn.addEventListener("click", () => {
        this.generateLevel1Problem();
      });
    }

    const level1AnswerInput = document.getElementById("level1-answer-input");
    if (level1AnswerInput) {
      level1AnswerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.checkLevel1Answer();
        }
      });
    }

    // Level 1 Speech Recognition Button
    const level1SpeechBtn = document.getElementById("level1-speech-btn");
    if (level1SpeechBtn) {
      level1SpeechBtn.addEventListener("click", () => {
        this.listenForLevel1Answer();
      });
    }

    // Auto-test controls
    const startAutoTestBtn = document.getElementById("start-auto-test-btn");
    if (startAutoTestBtn) {
      startAutoTestBtn.addEventListener("click", () => {
        this.startAutoTest();
        startAutoTestBtn.classList.add("hidden");
        const stopBtn = document.getElementById("stop-auto-test-btn");
        if (stopBtn) stopBtn.classList.remove("hidden");
      });
    }

    const stopAutoTestBtn = document.getElementById("stop-auto-test-btn");
    if (stopAutoTestBtn) {
      stopAutoTestBtn.addEventListener("click", () => {
        this.stopAutoTest();
        stopAutoTestBtn.classList.add("hidden");
        const startBtn = document.getElementById("start-auto-test-btn");
        if (startBtn) startBtn.classList.remove("hidden");
      });
    }

    // Level 0 - Reset Button
    const level0ResetBtn = document.getElementById("level0-reset-btn");
    if (level0ResetBtn) {
      level0ResetBtn.addEventListener("click", () => {
        this.stats.level0.correct = 0;
        this.stats.level0.wrong = 0;
        this.progressMatrix[0].tries = Array(10).fill(0);
        this.progressMatrix[0].errors = Array(10).fill(0);
        this.updateLevel0Display();
        this.updateScoringDisplays(0);
        this.gameStorage.saveGameStats(this.stats);
      });
    }

    // Level 1 - Reset Button
    const level1ResetBtn = document.getElementById("level1-reset-btn");
    if (level1ResetBtn) {
      level1ResetBtn.addEventListener("click", () => {
        this.stats.level1.correct = 0;
        this.stats.level1.wrong = 0;
        this.progressMatrix[0].tries = Array(10).fill(0);
        this.progressMatrix[0].errors = Array(10).fill(0);
        this.updateLevel1Display();
        this.updateScoringDisplays(0);
        this.gameStorage.saveGameStats(this.stats);
      });
    }

    // Level 0 Practice/Test Toggle
    const level0ModeBtn = document.getElementById("level0-mode-btn");
    if (level0ModeBtn) {
      level0ModeBtn.addEventListener("click", () => {
        this.setLevel0Mode(!this.level0PracticeMode);
      });
    }
  }

  // Level 1: Listen for spoken answer and fill input
  listenForLevel1Answer() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    console.log("[Level 1] Speech recognition started");

    recognition.onresult = (event) => {
      console.log("[Level 1] Speech recognition result:", event);
      let spoken = event.results[0][0].transcript.trim().toLowerCase();
      // Extract first number from spoken string
      let answer = null;
      const digitMatch = spoken.match(/\d+/);
      if (digitMatch) {
        answer = digitMatch[0];
      } else {
        // Try to convert number words to digits
        const numberWords = {
          zero: 0,
          one: 1,
          two: 2,
          three: 3,
          four: 4,
          five: 5,
          six: 6,
          seven: 7,
          eight: 8,
          nine: 9,
          ten: 10,
          eleven: 11,
          twelve: 12,
          thirteen: 13,
          fourteen: 14,
          fifteen: 15,
          sixteen: 16,
          seventeen: 17,
          eighteen: 18,
        };
        for (const [word, num] of Object.entries(numberWords)) {
          if (spoken.includes(word)) {
            answer = num;
            break;
          }
        }
      }
      if (answer !== null) {
        const input = document.getElementById("level1-answer-input");
        if (input) {
          input.value = answer;
          input.focus();
        }
        this.checkLevel1Answer();
      } else {
        this.showLevel1Feedback(
          "Sorry, I didn't hear a number. Please try again.",
          "incorrect"
        );
      }
    };
    recognition.onerror = (err) => {
      console.log("[Level 1] Speech recognition error:", err);
      this.showLevel1Feedback(
        "Speech recognition error. Please try again.",
        "incorrect"
      );
    };
    recognition.onend = () => {
      console.log("[Level 1] Speech recognition ended");
    };
    recognition.onaudiostart = () => {
      console.log("[Level 1] Speech recognition audio started");
    };
    recognition.onspeechstart = () => {
      console.log("[Level 1] Speech recognition speech started");
    };
    recognition.onspeechend = () => {
      console.log("[Level 1] Speech recognition speech ended");
    };
    recognition.start();
    this.showLevel1Feedback("Listening... Please say your answer.", "hint");
  }

  // ...existing code...
  // }

  startLevel(level) {
    this.currentGameLevel = level;
    this.settings.gameLevel = level;
    this.gameStorage.saveSettings(this.settings);

    if (level === 0) {
      this.showScreen("level0-screen");
      this.initLevel0();
    } else if (level === 1) {
      this.showScreen("level1-screen");
      this.initLevel1();
    }
  }

  // Clear the repeat timer
  clearLevel0PromptTimer() {
    if (this.level0PromptTimer) {
      clearTimeout(this.level0PromptTimer);
      this.level0PromptTimer = null;
    }
  }

  checkLevel0Answer(selectedNumber) {
    if (!this.currentProblem) {
      this.showLevel0Feedback("Click 'Play Number' first!", "incorrect");
      return;
    }

    const isCorrect = selectedNumber === this.currentProblem.targetNumber;
    const tile = document.querySelector(`[data-number="${selectedNumber}"]`);

    if (!this._level0FeedbackSpoken) this._level0FeedbackSpoken = false;
    if (isCorrect) {
      this.clearLevel0PromptTimer();
      if (tile) tile.classList.add("correct");
      this.stats.level0.correct++;
      this.recordTry(0, this.currentProblem.targetNumber, 0);
      this.decrementError(0, this.currentProblem.targetNumber, 0);
      this.showLevel0Feedback(
        `🎉 Correct! You found ${selectedNumber}!`,
        "correct"
      );
      if (!this.settings.quietMode && !this._level0FeedbackSpoken) {
        this.speak("Good job!", undefined, 1);
        this._level0FeedbackSpoken = true;
      }
      setTimeout(() => {
        this.resetLevel0Tiles();
        this.clearLevel0Feedback();
        const instruction = document.getElementById("level0-instruction");
        if (instruction) {
          instruction.textContent = "Great job!";
        }
        // Automatically start next round
        this.generateAndPromptLevel0Number();
      }, 2000);
    } else {
      if (tile) tile.classList.add("incorrect");
      this.stats.level0.wrong++;
      this.recordTry(0, this.currentProblem.targetNumber, 0);
      this.recordError(0, this.currentProblem.targetNumber, 0);
      const errorMsg = `Try again! That was ${selectedNumber}, but we're looking for ${this.currentProblem.targetNumber}.`;
      this.showLevel0Feedback(errorMsg, "incorrect");
      if (!this.settings.quietMode && !this._level0FeedbackSpoken) {
        this.speak(errorMsg, undefined, 1);
        this._level0FeedbackSpoken = true;
      }
      setTimeout(() => {
        if (tile) tile.classList.remove("incorrect");
      }, 1000);
    }
    this.updateLevel0Display();
    this.gameStorage.saveGameStats(this.stats);
  }

  showLevel0Hint() {
    if (!this.currentProblem) {
      this.showLevel0Feedback(
        "Click 'Play Number' first to get a hint!",
        "incorrect"
      );
      return;
    }

    const instruction = document.getElementById("level0-instruction");
    if (instruction) {
      instruction.textContent = `Hint: Look for the number ${this.currentProblem.targetNumber}! 👀`;
    }
  }

  resetLevel0Tiles() {
    document
      .querySelectorAll("#level0-number-grid .number-tile")
      .forEach((tile) => {
        tile.classList.remove("correct", "incorrect", "selected");
      });
  }

  clearLevel0Feedback() {
    const feedbackArea = document.getElementById("level0-feedback-area");
    if (feedbackArea) {
      feedbackArea.innerHTML = "";
    }
  }

  showLevel0Feedback(message, type) {
    const feedbackArea = document.getElementById("level0-feedback-area");
    if (feedbackArea) {
      feedbackArea.innerHTML = `
        <div class="feedback ${type}">
          <div class="feedback-text">${message}</div>
        </div>
      `;
    }
  }

  resetLevel0Stats() {
    if (!this.stats.level0) {
      this.stats.level0 = { correct: 0, wrong: 0 };
    }
  }

  updateLevel0Display() {
    const total = this.stats.level0.correct + this.stats.level0.wrong;
    const accuracy =
      total > 0 ? Math.round((this.stats.level0.correct / total) * 100) : 100;

    const correctEl = document.getElementById("level0-correct");
    const wrongEl = document.getElementById("level0-wrong");
    const accuracyEl = document.getElementById("level0-accuracy");

    if (correctEl) correctEl.textContent = this.stats.level0.correct;
    if (wrongEl) wrongEl.textContent = this.stats.level0.wrong;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
  }

  // Level 1 - Addition Methods
  initLevel1() {
    this.resetLevel1Stats();
    this.updateLevel1Display();
    this.generateLevel1Problem();
  }

  generateLevel1Problem() {
    // Intelligent selection: prioritize least-attempted combinations
    const { num1, num2 } = this.selectBalancedCombination();

    this.currentProblem = {
      num1: num1,
      num2: num2,
      correctAnswer: num1 + num2,
      startTime: Date.now(),
    };

    const num1El = document.getElementById("level1-num1");
    const num2El = document.getElementById("level1-num2");
    const answerInput = document.getElementById("level1-answer-input");

    if (num1El) num1El.textContent = num1;
    if (num2El) num2El.textContent = num2;
    if (answerInput) {
      answerInput.value = "";
      // Skip focus during auto-test to prevent screen jumping
      if (!this.autoTestMode) {
        answerInput.focus();
      }
    }

    this.clearLevel1Feedback();

    // Update hint content if hint is currently visible
    const helper = document.getElementById("level1-visual-helper");
    if (helper && !helper.classList.contains("hidden")) {
      this.showLevel1Hint();
    }
  }

  // Backend Guidelines: Balanced Combination Selection
  // Selects number combinations using intelligent algorithm to ensure even coverage
  // Prioritizes combinations with errors by using success score (tries - errors)
  selectBalancedCombination() {
    const triesMatrix = this.progressMatrix[1].tries;
    const errorsMatrix = this.progressMatrix[1].errors;

    // Calculate success score matrix (tries - errors)
    // Lower scores indicate combinations needing more practice
    const successMatrix = triesMatrix.map((row, i) =>
      row.map((tries, j) => tries - errorsMatrix[i][j])
    );

    // Step 1: Calculate sum of success scores for each row (num1)
    const rowSums = successMatrix.map((row) =>
      row.reduce((sum, val) => sum + val, 0)
    );

    // Step 2: Find minimum row sum and all rows with that sum
    const minRowSum = Math.min(...rowSums);
    const candidateRows = [];
    for (let i = 0; i < rowSums.length; i++) {
      if (rowSums[i] === minRowSum) {
        candidateRows.push(i);
      }
    }

    // Step 3: Randomly select one of the lowest-scoring rows
    const selectedRow =
      candidateRows[Math.floor(Math.random() * candidateRows.length)];

    // Step 4: Within selected row, find all columns with minimum success score
    const rowData = successMatrix[selectedRow];
    const minColValue = Math.min(...rowData);
    const candidateCols = [];
    for (let j = 0; j < rowData.length; j++) {
      if (rowData[j] === minColValue) {
        candidateCols.push(j);
      }
    }

    // Step 5: Randomly select one of the lowest-scoring columns
    const selectedCol =
      candidateCols[Math.floor(Math.random() * candidateCols.length)];

    const tries = triesMatrix[selectedRow][selectedCol];
    const errors = errorsMatrix[selectedRow][selectedCol];
    const successScore = successMatrix[selectedRow][selectedCol];

    return {
      num1: selectedRow,
      num2: selectedCol,
    };
  }

  checkLevel1Answer() {
    const input = document.getElementById("level1-answer-input");
    if (!input) return;

    const userAnswer = parseInt(input.value);

    if (isNaN(userAnswer)) {
      this.showLevel1Feedback("Please enter a number!", "incorrect");
      return;
    }

    const isCorrect = userAnswer === this.currentProblem.correctAnswer;

    if (isCorrect) {
      this.stats.level1.correct++;

      // Backend Guidelines: Record try (+1 attempt)
      this.recordTry(1, this.currentProblem.num1, this.currentProblem.num2);

      // Backend Guidelines: Decrement error count for correct answers (minimum 0)
      this.decrementError(
        1,
        this.currentProblem.num1,
        this.currentProblem.num2
      );

      this.showLevel1Feedback(
        `🎉 Excellent! ${this.currentProblem.num1} + ${this.currentProblem.num2} = ${this.currentProblem.correctAnswer}`,
        "correct"
      );

      setTimeout(
        () => {
          this.generateLevel1Problem();
        },
        this.autoTestMode ? 50 : 2000
      );
    } else {
      this.stats.level1.wrong++;

      // Backend Guidelines: Record try (+1 attempt) and error (-1 point, minimum 0)
      this.recordTry(1, this.currentProblem.num1, this.currentProblem.num2);
      this.recordError(1, this.currentProblem.num1, this.currentProblem.num2);

      this.showLevel1Feedback(
        `Not quite! ${this.currentProblem.num1} + ${this.currentProblem.num2} = ${this.currentProblem.correctAnswer}, not ${userAnswer}. Try the next one!`,
        "incorrect"
      );

      setTimeout(
        () => {
          this.generateLevel1Problem();
        },
        this.autoTestMode ? 50 : 2000
      );
    }

    this.updateLevel1Display();
    this.gameStorage.saveGameStats(this.stats);
  }

  showLevel1Hint() {
    const helper = document.getElementById("level1-visual-helper");
    if (helper) {
      helper.classList.remove("hidden");
      helper.innerHTML = `
        <div class="visual-dots">
          <div class="dot-group">
            ${Array(this.currentProblem.num1)
              .fill("")
              .map(() => '<span class="dot blue">●</span>')
              .join("")}
          </div>
          <span class="plus-sign">+</span>
          <div class="dot-group">
            ${Array(this.currentProblem.num2)
              .fill("")
              .map(() => '<span class="dot red">●</span>')
              .join("")}
          </div>
        </div>
      `;
    }
  }

  hideLevel1Hint() {
    const helper = document.getElementById("level1-visual-helper");
    if (helper) {
      helper.classList.add("hidden");
    }
  }

  toggleLevel1Hint() {
    const helper = document.getElementById("level1-visual-helper");
    if (helper) {
      if (helper.classList.contains("hidden")) {
        helper.classList.remove("hidden");
        this.showLevel1Hint();
      } else {
        helper.classList.add("hidden");
      }
    }
  }

  clearLevel1Feedback() {
    const feedbackArea = document.getElementById("level1-feedback-area");
    if (feedbackArea) {
      feedbackArea.innerHTML = "";
    }
  }

  showLevel1Feedback(message, type) {
    const feedbackArea = document.getElementById("level1-feedback-area");
    if (feedbackArea) {
      feedbackArea.innerHTML = `
        <div class="feedback ${type}">
          <div class="feedback-text">${message}</div>
        </div>
      `;
    }
  }

  resetLevel1Stats() {
    if (!this.stats.level1) {
      this.stats.level1 = { correct: 0, wrong: 0 };
    }
  }

  updateLevel1Display() {
    const total = this.stats.level1.correct + this.stats.level1.wrong;
    const accuracy =
      total > 0 ? Math.round((this.stats.level1.correct / total) * 100) : 100;

    const correctEl = document.getElementById("level1-correct");
    const wrongEl = document.getElementById("level1-wrong");
    const accuracyEl = document.getElementById("level1-accuracy");

    if (correctEl) correctEl.textContent = this.stats.level1.correct;
    if (wrongEl) wrongEl.textContent = this.stats.level1.wrong;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
  }

  // Testing Mode Methods for Scoring Logic Observation
  startAutoTest() {
    this.autoTestMode = true;

    // Show scoring displays during testing
    this.showScoringDisplays();

    // Show Level 1 if not already showing
    if (
      !document.getElementById("level1-screen").classList.contains("hidden")
    ) {
      this.generateLevel1Problem();
    } else {
      this.showScreen("level1-screen");
      this.generateLevel1Problem();
    }

    this.scheduleAutoAnswer();
  }

  stopAutoTest() {
    this.autoTestMode = false;

    // Hide scoring displays when not testing
    this.hideScoringDisplays();

    if (this.autoTestInterval) {
      clearTimeout(this.autoTestInterval);
      this.autoTestInterval = null;
    }
  }

  // Scoring Display Visibility Control
  showScoringDisplays() {
    const displays = document.querySelectorAll(".scoring-display");
    displays.forEach((display) => {
      display.classList.remove("hidden");
    });
  }

  hideScoringDisplays() {
    // Only hide if auto-test is not running
    if (this.autoTestMode) {
      return;
    }

    const displays = document.querySelectorAll(".scoring-display");
    displays.forEach((display) => {
      display.classList.add("hidden");
    });
  }

  scheduleAutoAnswer() {
    if (!this.autoTestMode) return;

    this.autoTestInterval = setTimeout(() => {
      this.generateAutoAnswer();
    }, this.autoAnswerDelay);
  }

  generateAutoAnswer() {
    if (!this.autoTestMode || !this.currentProblem) return;

    const input = document.getElementById("level1-answer-input");
    if (!input) return;

    let answer;
    const errorRate = 0.1; // 10% error rate

    if (Math.random() < errorRate) {
      // Generate wrong answer (within reasonable range)
      const correctAnswer = this.currentProblem.correctAnswer;
      const wrongOptions = [];

      // Add some plausible wrong answers
      for (
        let i = Math.max(0, correctAnswer - 3);
        i <= correctAnswer + 3;
        i++
      ) {
        if (i !== correctAnswer && i >= 0 && i <= 18) {
          wrongOptions.push(i);
        }
      }

      answer =
        wrongOptions.length > 0
          ? wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
          : correctAnswer + 1;
    } else {
      // Generate correct answer
      answer = this.currentProblem.correctAnswer;
    }

    // Fill the input and trigger answer check
    input.value = answer;
    this.checkLevel1Answer();

    // Schedule next auto answer only if we're still in auto-test mode
    // The timeout accounts for feedback display time
    if (this.autoTestMode) {
      setTimeout(() => {
        this.scheduleAutoAnswer();
      }, 200); // Fast iteration for rapid testing
    }
  }

  // Utility Methods
  // Personalization: Update name display everywhere
  updateUserNameDisplay() {
    // Always use the latest userName, fallback to localStorage if needed
    let name = this.userName;
    if (!name) {
      name = localStorage.getItem("userName") || "";
    }
    const displayName = name && name.length > 0 ? name : "Not Entered";
    const nameDisplay = document.getElementById("user-name-display");
    if (nameDisplay) nameDisplay.textContent = displayName;
    const level0Name = document.getElementById("level0-user-name");
    if (level0Name) level0Name.textContent = displayName;
    const level1Name = document.getElementById("level1-user-name");
    if (level1Name) level1Name.textContent = displayName;
  }

  // Personalization: Prompt for name with TTS and speech recognition
  promptForUserName() {
    this.speak(
      "Hi, I'm going to play some number games with you. What's your name?",
      () => {
        this.listenForUserName();
      },
      1
    );
  }

  listenForUserName() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let spoken = event.results[0][0].transcript.trim();
      // Remove any leading greeting if present (e.g., "I'm going to play ...")
      // Only keep the first word if the phrase is long and not a likely name
      if (spoken.toLowerCase().startsWith("i'm going to play")) {
        spoken = spoken.replace(/^i'm going to play/i, "").trim();
      }
      // If the phrase is more than 2 words, just use the first word
      const words = spoken.split(" ");
      if (words.length > 2) {
        spoken = words[0];
      }
      this.userName = spoken.charAt(0).toUpperCase() + spoken.slice(1);
      localStorage.setItem("userName", this.userName);
      this.updateUserNameDisplay();
      this.speak(
        `Hi ${this.userName}, let's get started. First pick the level.`,
        undefined,
        1
      );
    };
    recognition.onerror = () => {
      this.speak(
        "Sorry, I didn't catch that. Please say your name again.",
        () => {
          setTimeout(() => {
            this.listenForUserName();
          }, 5000);
        },
        1
      );
    };
    recognition.start();
  }

  clearUserName() {
    this.userName = "";
    localStorage.removeItem("userName");
    this.updateUserNameDisplay();
    this.promptForUserName();
  }
  speak(text, onEndCallback, repeatCountOverride) {
    if (this.speechSynthesis && !this.settings.quietMode) {
      const speakWithVoice = (onEndCallback, repeatCountOverride) => {
        const voices = this.speechSynthesis.getVoices();
        // Prefer English, female/child, slowest rate
        let selected = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.toLowerCase().includes("child") ||
              v.name.toLowerCase().includes("female"))
        );
        if (!selected)
          selected = voices.find(
            (v) =>
              v.lang.startsWith("en") && v.name.toLowerCase().includes("girl")
          );
        if (!selected) selected = voices.find((v) => v.lang.startsWith("en"));
        if (!selected) selected = voices[0];
        // Force US English female voice, fallback to Zira, then any US English
        let preferred = voices.find(
          (v) => v.name === "Microsoft Zira - English (United States)"
        );
        if (!preferred)
          preferred = voices.find(
            (v) => v.lang === "en-US" && v.name.toLowerCase().includes("female")
          );
        if (!preferred)
          preferred = voices.find(
            (v) => v.lang === "en-US" && v.name.toLowerCase().includes("zira")
          );
        if (!preferred)
          preferred = voices.find(
            (v) => v.lang === "en-US" && v.name.toLowerCase().includes("woman")
          );
        if (!preferred) preferred = voices.find((v) => v.lang === "en-US");
        if (!preferred) preferred = voices.find((v) => v.lang.startsWith("en"));

        setTimeout(() => {
          const repeatCount =
            typeof repeatCountOverride === "number" ? repeatCountOverride : 2;
          let finishedCount = 0;
          for (let i = 0; i < repeatCount; i++) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = preferred;
            utterance.rate = 0.75; // Slightly faster for clarity
            utterance.pitch = 1.1; // Lower pitch for clarity
            utterance.volume = 1.0;
            utterance.onstart = () => {};
            utterance.onend = () => {
              finishedCount++;
              if (
                finishedCount === repeatCount &&
                typeof onEndCallback === "function"
              ) {
                onEndCallback();
              }
            };
            this.speechSynthesis.speak(utterance);
          }
        }, 350); // 350ms pause before speaking
      };
      // Some browsers need voices to be loaded asynchronously
      if (this.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () =>
          speakWithVoice(onEndCallback, repeatCountOverride);
      } else {
        speakWithVoice(onEndCallback, repeatCountOverride);
      }
    }
  }

  // Theme Management Methods
  applyTheme(theme) {
    const html = document.documentElement;

    // Remove existing theme attributes
    html.removeAttribute("data-theme");

    if (theme === "auto") {
      // Use system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        html.setAttribute("data-theme", "dark");
      } else {
        html.setAttribute("data-theme", "light");
      }

      // Listen for system theme changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", (e) => {
          if (this.settings.theme === "auto") {
            html.setAttribute("data-theme", e.matches ? "dark" : "light");
          }
        });
      }
    } else {
      // Use explicit theme
      html.setAttribute("data-theme", theme);
    }
  }

  checkOnlineStatus() {
    // Placeholder for online/offline status
  }

  initUserName() {
    // Load from storage
    this.userName = localStorage.getItem("userName") || "";
    this.updateUserNameDisplay();

    // If not entered, prompt for name
    if (!this.userName) {
      this.promptForUserName();
    }
  }

  // ...existing code...
}
// Make AdditionGame globally available
window.AdditionGame = AdditionGame;
