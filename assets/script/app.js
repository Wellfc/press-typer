'use strict';

import { onEvent, select, create } from './utils.js';
import { words, shuffleArray } from './array.js';
// import Score from './Score.js';

const wordDisplay = select(".word-display");
const userInput = select(".user-input");
const scoreValue = select(".score-value");
const timerValueElement = select(".timer-value");
const startButton = select(".start-button");
const restartButton = select(".restart-button");
const backgroundMusic = new Audio('./assets/audio/background-music.mp3');
backgroundMusic.type = 'audio/mp3';
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;
const scoreboardContainer = select(".scoreboard-container");
const scoreboardBtn = select(".scoreboard-btn");
const rankingList = select(".ranking-list");


let currentWord;
let currentWordIndex = 0;
let timerValue = 99;
let timerInterval;
let playerHits = 0;
let playerPercentage = 0;
let scores = loadScores() || [];

userInput.disabled = true;

// Reset game variables
function resetGame() {
  currentWordIndex = 0;
  timerValue = 99;
  clearInterval(timerInterval);
  timerValueElement.textContent = timerValue;
  scoreValue.textContent = 0;
  userInput.value = "";
  userInput.disabled = true;
  wordDisplay.textContent = "Press Start to play";
  userInput.placeholder = "";
  backgroundMusic.currentTime = 0;
  backgroundMusic.pause();
}

// Start the timer
function startTimer() {
  timerValue = 20; // Change it for testing
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
  slideOutScoreboard();

  startButton.classList.add("hidden");
  restartButton.classList.remove("hidden");
  scoreboardBtn.classList.add("hidden");
  wordDisplay.classList.remove("blinking");
  userInput.placeholder = "Type the word here";

  playerHits = 0;

  // Shuffle the words array to get a random order
  const shuffledWords = shuffleArray(words);

  currentWord = shuffledWords[currentWordIndex];
  wordDisplay.textContent = currentWord;

  userInput.value = "";
  userInput.focus();
}


// End the game
function endGame() {
  backgroundMusic.pause();

  playerPercentage = ((playerHits / words.length) * 100).toFixed(2);

  const formattedScore = createScore(playerHits, playerPercentage);
  // console.log(formattedScore);

  scores.push(formattedScore);

  // Sort scores in descending order based on hits
  scores.sort((a, b) => b.hits - a.hits);

  // Keep only the top 9 scores
  if (scores.length > 9) {
    scores = scores.splice(0, 9);
  }

  // Save scores to localStorage
  saveScores();

  // Display the ranking
  displayRanking();

  // Slide in the scoreboard
  slideInScoreboard();
  
  startButton.classList.remove("hidden");
  restartButton.classList.add("hidden");
  scoreboardBtn.classList.remove("hidden");
  wordDisplay.classList.add("blinking");

  resetGame();
}

// Restart the game
function restartGame() {
  // Reset game variables
  resetGame();

  // Slide out the scoreboard
  slideOutScoreboard();

  // Start a new game
  startGame();
}

// Create a score
function createScore(hits, percentage) {
   
  return {
    date: getDate(),
    hits,
    percentage,
  };
}

// Get the current date
function getDate() {
  const parameters = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return new Date().toLocaleDateString('en-ca', parameters);
}

// Load scores from localStorage
function loadScores() {
  const storedScores = localStorage.getItem('scores');
  return storedScores ? JSON.parse(storedScores) : [];
}

// Save scores to localStorage
function saveScores() {
  localStorage.setItem('scores', JSON.stringify(scores));
}

// Display the top scores in the scoreboard
function displayRanking() {
  // Clear existing ranking
  rankingList.innerHTML = "";
  // console.log(scores);

  // Slide in the scoreboard
  slideInScoreboard();

  if (scores.length === 0) {
    const noScoresMessage = create("li");
    noScoresMessage.textContent = "No games have been played yet";
    rankingList.appendChild(noScoresMessage);
  } else {
    // Display each score in the ranking
    scores.forEach((score, index) => {
      const rankingItem = create("li");
      rankingItem.innerHTML = `
        <span>#${index + 1}</span>
        <span>${score.hits.toString().padStart(2, '0')} hits</span>
        <span>${score.date}</span>
      `;
      
      rankingList.appendChild(rankingItem);
    });
  }
}

// Slide in the scoreboard
function slideInScoreboard() {
  scoreboardContainer.style.right = "0";
}

// Slide out the scoreboard
function slideOutScoreboard() {
  scoreboardContainer.style.right = "-300px";
}

// Listen for events
onEvent(startButton, 'click', startGame);
onEvent(restartButton, 'click', restartGame);
onEvent(scoreboardBtn, 'click', displayRanking);

// Close the scoreboard when the user presses the Escape key
onEvent(document, 'keydown', function (event) {
  if (event.key === "Escape") {
    slideOutScoreboard();
  }

});

// Close the scoreboard when the user clicks outside of it
onEvent(window, 'click', function (event) {
  const rect = scoreboardContainer.getBoundingClientRect();
  const computedRight = getComputedStyle(scoreboardContainer).right;

  // console.log("event.clientX:", event.clientX);
  // console.log("rect.left:", rect.left);
  // console.log("computedRight:", computedRight);

  if (event.clientX < rect.left && computedRight === "0px") {
    slideOutScoreboard();
  }
});

// Listen for input events
onEvent(userInput, 'input', function () {
  if (userInput.value.trim().toLowerCase() === currentWord) {
    playerHits++;
    scoreValue.textContent = playerHits;

    if (playerHits === words.length) {
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