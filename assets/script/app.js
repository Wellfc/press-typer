'use strict';

import { onEvent, select } from './utils.js';
import { words, shuffleArray } from './array.js';
import Score from './Score.js';

const wordDisplay = select(".word-display");
const userInput = select(".user-input");
const scoreValue = select(".score-value");
const timerValueElement = select(".timer-value");
const gameOverMessage = select(".game-over-message");
const startButton = select(".start-button");
const restartButton = select(".restart-button");
const modal = select(".game-over-modal");
const closeModal = select(".close-modal");
const restartModal = select(".restart-modal");
const backgroundMusic = new Audio('./assets/audio/background-music.mp3');
backgroundMusic.type = 'audio/mp3';
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;

let currentWord;
let currentWordIndex = 0;
let timerValue = 99;
let timerInterval;
let playerScore;
userInput.disabled = true;

// Reset game variables
function resetGame() {
  currentWordIndex = 0;
  timerValue = 99;
  clearInterval(timerInterval);
  timerValueElement.textContent = timerValue;
  scoreValue.textContent = 0;
  gameOverMessage.textContent = "";
  modal.style.display = "none";
  userInput.value = "";
  userInput.disabled = true;
  wordDisplay.textContent = "Press Start to play";
  // wordDisplay.style.fontSize = "3rem";
  userInput.placeholder = "";
  backgroundMusic.currentTime = 0;
  backgroundMusic.pause();
}

// Start the timer
function startTimer() {
  timerValue = 10; // Change it for testing
  timerValueElement.textContent = timerValue;
  timerInterval = setInterval(function () {
    timerValue--;
    timerValueElement.textContent = timerValue;

    if (timerValue === 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

// Start the game
function startGame() {
  userInput.disabled = false;
  startTimer();
  backgroundMusic.play();

  startButton.classList.add("hidden");
  restartButton.classList.remove("hidden");
  wordDisplay.classList.remove("blinking");
  // wordDisplay.style.fontSize = "4rem";
  userInput.placeholder = "Type the word here";

  playerScore = new Score();

  // Shuffle the words array to get a random order
  const shuffledWords = shuffleArray(words);

  currentWord = shuffledWords[currentWordIndex];
  wordDisplay.textContent = currentWord;

  userInput.value = "";
  userInput.focus();
}

// Listen for input events
onEvent(userInput, 'input', function () {
  if (userInput.value.trim().toLowerCase() === currentWord) {
    playerScore.updateScore();
    scoreValue.textContent = playerScore.hits;

    if (playerScore.isMaxScore(words.length)) {
      clearInterval(timerInterval);
      endGame();
    } else {
      currentWordIndex = (currentWordIndex + 1) % words.length;
      const nextWord = words[currentWordIndex];
      currentWord = nextWord;
      wordDisplay.textContent = nextWord;
      userInput.value = "";
    }
  }
});

// End the game
function endGame() {
  backgroundMusic.pause();
  playerScore.calculatePercentage(words.length);

  gameOverMessage.innerHTML = `Your Final Score is ${playerScore.hits} out of ${words.length}.\nYour Percentage: ${playerScore.percentage}%`;

  startButton.classList.remove("hidden");
  restartButton.classList.add("hidden");
  wordDisplay.classList.add("blinking");

  // Show the modal
  modal.style.display = "flex";
}

function restartGame() {
  // Reset game variables
  resetGame();

  // Start a new game
  startGame();
}

// Listen for events
onEvent(startButton, 'click', startGame);
onEvent(restartButton, 'click', restartGame);
onEvent(restartModal, 'click', restartGame);
onEvent(closeModal, 'click', resetGame);
