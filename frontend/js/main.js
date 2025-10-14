// Addition Game for Elementary Kids - Single Screen Implementation
class AdditionGame {
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

    this.init();
  }

  init() {
    console.log("Addition Game initialized! 🎮");
    this.showScreen("welcome-screen");
    this.setupEventListeners();
    this.loadSettings();
    this.checkOnlineStatus();
    this.updateScoringDisplays();

    // Initially hide scoring displays (only show during auto-test)
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => {
      this.hideScoringDisplays();
    }, 100);
  }

  // Backend Guidelines: Scoring Array Management
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

  // Format matrix for clean display - handles both 1D and 2D arrays
  formatMatrix(matrix) {
    // Check if it's a 1D array (Level 0) or 2D array (Level 1)
    const is1D = !Array.isArray(matrix[0]);

    if (is1D) {
      // Format as single row
      return matrix.map((value) => value.toString().padStart(2, " ")).join(" ");
    } else {
      // Format as multiple rows
      return matrix
        .map((row) => {
          return row
            .map((value) => value.toString().padStart(2, " "))
            .join(" ");
        })
        .join("\n");
    }
  }

  // Backend Guidelines: Record attempt (+1 try regardless of correct/incorrect)
  recordTry(level, num1, num2 = 0) {
    if (this.progressMatrix[level]) {
      if (level == 0) {
        // Level 0: 1D array, num1 is the number index (0-9)
        if (num1 < this.progressMatrix[level].tries.length) {
          this.progressMatrix[level].tries[num1] += 1;
        }
      } else {
        // Level 1+: 2D array, num1 + num2 combinations
        if (
          this.progressMatrix[level].tries[num1] &&
          num2 < this.progressMatrix[level].tries[num1].length
        ) {
          this.progressMatrix[level].tries[num1][num2] += 1;
        }
      }
      this.updateScoringDisplays(level);
    }
  }

  // Backend Guidelines: Record incorrect answer (+1 error count)
  recordError(level, num1, num2 = 0) {
    if (this.progressMatrix[level]) {
      if (level == 0) {
        // Level 0: 1D array, num1 is the number index (0-9)
        if (num1 < this.progressMatrix[level].errors.length) {
          this.progressMatrix[level].errors[num1] = Math.max(
            0,
            this.progressMatrix[level].errors[num1] + 1
          );
        }
      } else {
        // Level 1+: 2D array, num1 + num2 combinations
        if (
          this.progressMatrix[level].errors[num1] &&
          num2 < this.progressMatrix[level].errors[num1].length
        ) {
          this.progressMatrix[level].errors[num1][num2] = Math.max(
            0,
            this.progressMatrix[level].errors[num1][num2] + 1
          );
        }
      }
      this.updateScoringDisplays(level);
    }
  }

  // Backend Guidelines: Decrement error count for correct answers (minimum 0)
  decrementError(level, num1, num2 = 0) {
    if (this.progressMatrix[level]) {
      if (level == 0) {
        // Level 0: 1D array, num1 is the number index (0-9)
        if (num1 < this.progressMatrix[level].errors.length) {
          this.progressMatrix[level].errors[num1] = Math.max(
            0,
            this.progressMatrix[level].errors[num1] - 1
          );
        }
      } else {
        // Level 1+: 2D array, num1 + num2 combinations
        if (
          this.progressMatrix[level].errors[num1] &&
          num2 < this.progressMatrix[level].errors[num1].length
        ) {
          this.progressMatrix[level].errors[num1][num2] = Math.max(
            0,
            this.progressMatrix[level].errors[num1][num2] - 1
          );
        }
      }
      this.updateScoringDisplays(level);
    }
  }

  // Screen Management - Single Use Principle
  showScreen(screenId) {
    // Stop auto-test when leaving Level 1
    if (this.autoTestMode && screenId !== "level1-screen") {
      this.stopAutoTest();
      // Reset button visibility
      const startBtn = document.getElementById("start-auto-test-btn");
      const stopBtn = document.getElementById("stop-auto-test-btn");
      if (startBtn) startBtn.classList.remove("hidden");
      if (stopBtn) stopBtn.classList.add("hidden");
    }

    // Hide all screens
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      screen.classList.add("hidden");
    });

    // Show the requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove("hidden");
    }

    // Update scoring displays when showing game screens
    if (screenId.includes("level")) {
      // Extract level number from screenId (e.g., "level0-screen" -> 0)
      const levelMatch = screenId.match(/level(\d+)/);
      if (levelMatch) {
        const currentLevel = parseInt(levelMatch[1]);
        this.updateScoringDisplays(currentLevel);
      }

      // Hide scoring displays unless auto-test is running
      if (!this.autoTestMode) {
        this.hideScoringDisplays();
      }
    }

    console.log(`Showing screen: ${screenId}`);
  }

  loadSettings() {
    // Load settings into settings screen
    const quietMode = document.getElementById("quiet-mode");
    const difficulty = document.getElementById("difficulty-level");
    const themeSelect = document.getElementById("theme-select");

    if (quietMode) quietMode.checked = this.settings.quietMode || false;
    if (difficulty) difficulty.value = this.settings.difficulty || "easy";
    if (themeSelect) themeSelect.value = this.settings.theme || "auto";

    // Apply the current theme
    this.applyTheme(this.settings.theme || "auto");
  }

  setupEventListeners() {
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
          this.checkLevel0Answer(number);
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
  }

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

  // Level 0 - Number Recognition Methods
  initLevel0() {
    this.resetLevel0Stats();
    this.updateLevel0Display();
    const instruction = document.getElementById("level0-instruction");
    if (instruction) {
      instruction.textContent =
        "Click 'Play Number' to hear a number, then touch it!";
    }
  }

  playLevel0Number() {
    this.currentProblem = {
      targetNumber: Math.floor(Math.random() * 10),
      startTime: Date.now(),
    };

    this.clearLevel0Feedback();
    this.resetLevel0Tiles();

    const instruction = document.getElementById("level0-instruction");
    if (instruction) {
      instruction.textContent =
        "Listen carefully and touch the number you hear!";
    }

    if (!this.settings.quietMode) {
      this.speak(this.currentProblem.targetNumber.toString());
    } else if (instruction) {
      instruction.textContent = `Find the number: ${this.currentProblem.targetNumber}`;
    }
  }

  checkLevel0Answer(selectedNumber) {
    if (!this.currentProblem) {
      this.showLevel0Feedback("Click 'Play Number' first!", "incorrect");
      return;
    }

    const isCorrect = selectedNumber === this.currentProblem.targetNumber;
    const tile = document.querySelector(`[data-number="${selectedNumber}"]`);

    if (isCorrect) {
      if (tile) tile.classList.add("correct");
      this.stats.level0.correct++;

      // Backend Guidelines: Record try (+1 attempt)
      this.recordTry(0, this.currentProblem.targetNumber, 0);

      // Backend Guidelines: Decrement error count for correct answers (minimum 0)
      this.decrementError(0, this.currentProblem.targetNumber, 0);

      this.showLevel0Feedback(
        `🎉 Correct! You found ${selectedNumber}!`,
        "correct"
      );

      setTimeout(() => {
        this.resetLevel0Tiles();
        this.clearLevel0Feedback();
        const instruction = document.getElementById("level0-instruction");
        if (instruction) {
          instruction.textContent =
            "Great job! Click 'Play Number' for another one!";
        }
      }, 2000);
    } else {
      if (tile) tile.classList.add("incorrect");
      this.stats.level0.wrong++;

      // Backend Guidelines: Record try (+1 attempt) and error (+1 error count)
      this.recordTry(0, this.currentProblem.targetNumber, 0);
      this.recordError(0, this.currentProblem.targetNumber, 0);

      this.showLevel0Feedback(
        `Try again! That was ${selectedNumber}, but we're looking for ${this.currentProblem.targetNumber}.`,
        "incorrect"
      );

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

    console.log(
      `🎯 Error-aware selection: Row ${selectedRow} (sum: ${rowSums[selectedRow]}) + Col ${selectedCol} (tries: ${tries}, errors: ${errors}, score: ${successScore})`
    );

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
    console.log("🧪 Starting auto-test mode with 10% error rate");
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
    console.log("🛑 Stopping auto-test mode");
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
    console.log("📊 Scoring displays shown for auto-test mode");
  }

  hideScoringDisplays() {
    // Only hide if auto-test is not running
    if (this.autoTestMode) {
      console.log("🙈 Skipping hide - auto-test is active");
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

      console.log(
        `🔴 Auto-generated WRONG answer: ${answer} (correct: ${correctAnswer})`
      );
    } else {
      // Generate correct answer
      answer = this.currentProblem.correctAnswer;
      console.log(`🟢 Auto-generated CORRECT answer: ${answer}`);
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
  speak(text) {
    if (this.speechSynthesis && !this.settings.quietMode) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      this.speechSynthesis.speak(utterance);
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

    console.log(`Theme applied: ${theme}`);
  }

  checkOnlineStatus() {
    // Placeholder for online/offline status
    console.log("Online status:", navigator.onLine);
  }
}

// Make AdditionGame globally available
window.AdditionGame = AdditionGame;
