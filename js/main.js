// Animation variables
const circles = document.querySelectorAll('.circle');
const watchFace = document.querySelector('.watch-face');
const animatedElement = document.querySelector('.circle');
const animationDurationMS = getAnimationDuration(animatedElement);

// Front end variables
const breathCounter = document.getElementsByClassName('breath-count')[0];
const timerDisplay = document.getElementById('breath-timer');
const mainButtons = document.getElementById('main-buttons');
const startButton = document.getElementById('start-button');
const skipButton = document.getElementById('skip-button');
const resetButton = document.getElementById('reset-button');
const themeToggleButton = document.getElementById('theme-toggle');
const openOverlayButton = document.getElementById('open-overlay-button');
const closeOverlayButton = document.getElementById('close-overlay-button');

//////////////////////
// Time for each step
//////////////////////
let exhaleHoldTimes = {
  roundOne: '0:60:00',
  roundTwo: '1:15:00',
  roundThree: '1:30:00',
};

const breathsPerRound = 1;

function setInhaleHoldTime() {
  inhaleHoldTime = 16;
}

// Run on page load
setInhaleHoldTime();

// Local storage
const currentTheme = localStorage.getItem('theme');

// Function related variables
let startTime;
let instructionTimerInterval;
let timerInterval;
let countdownInterval;
let timeElapsed;
let numberOfBreaths = 0;
let exerciseRound = 0;
let instructionIndex = 0;

// Page theme
// Apply the saved theme on page load
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

// Toggle theme on button click
themeToggleButton.addEventListener('click', function() {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
  } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
  }
});

// Toggle visibility/state of an element
function toggleElementState(element, action) {
  if (!element) return;

  switch (action) {
    case 'enable':
      element.removeAttribute('disabled');
      break;
    case 'disable':
      element.setAttribute('disabled', '');
      break;
    case 'show':
      element.style.display = 'inline'; // 'block', 'inline', 'flex', etc.
      break;
    case 'displayNone':
      element.style.display = 'none';
      break;
    case 'hidden':
      element.style.visibility = 'hidden';
      break;
    default:
      console.error('Invalid action specified');
  }
}

// Animation
function startAnimation() {
  toggleElementState(startButton, 'displayNone');
  toggleElementState(skipButton, 'show');
  inhaleInstructions();
  startInstructionTimer();
  exerciseRound++;
  // Set animation play state to running for each circle and the watch-face
  circles.forEach(circle => {
    circle.style.animationPlayState = 'running';
  });
  watchFace.style.animationPlayState = 'running';
}

function pauseAnimation() {
  circles.forEach(circle => {
      circle.style.animationPlayState = 'paused';
  });
  watchFace.style.animationPlayState = 'paused';
}


// Instructional text
// Get the animation length
function getAnimationDuration(element) {
  // Get computed styles of the element
  const style = window.getComputedStyle(element);

  // Extract animation duration
  let duration = style.animationDuration;

  // Convert duration to milliseconds
  if (duration.indexOf("ms") !== -1) {
      // For milliseconds
      duration = parseFloat(duration) || 0;
  } else if (duration.indexOf("s") !== -1) {
      // For seconds
      duration = parseFloat(duration) * 1000 || 0;
  }

  return duration;
}

// Timer: starts when animation begins
function startInstructionTimer() {
  
  startTime = Date.now();
  instructionTimerInterval = setInterval(displayInstructions, 2000);
}

function stopInstructionTimer() {
  clearInterval(instructionTimerInterval);
}

// Display the instructions
function displayInstructions() {
  instructionIndex++;
  if (instructionIndex % 2 === 0) {
    inhaleInstructions();
  } else {
    exhaleInstructions();
  }
}

function inhaleInstructions() {
  document.getElementById('breath-instructions').innerText = 'breathe in';
}

function exhaleInstructions() {
  document.getElementById('breath-instructions').innerText = 'breathe out';
}

function exhaleHoldInstructions() {
  document.getElementById('breath-instructions').innerText = 'exhale and hold';
}

function inhaleHoldInstructions() {
  document.getElementById('breath-instructions').innerText = 'inhale and hold';
}

// At X nunberOfBreaths: stop animation AND start timer
animatedElement.addEventListener('animationiteration', () => {
  numberOfBreaths++;
  breathCounter.innerHTML = numberOfBreaths;

  if (numberOfBreaths === breathsPerRound) {
    pauseAnimation();
    stopInstructionTimer();
    startTimer();
    exhaleHoldInstructions();
  }
});


// Breath Counter
function clearnumberOfBreaths() {
  numberOfBreaths = 0;
  breathCounter.innerHTML = numberOfBreaths;
}


// Breath hold timer

// Start Inhale hold timer
function startCountdownTimer() {
  countdownInterval = setInterval(countdownTimer, 1000);
}
// Inhale hold timer 
function countdownTimer() {
  inhaleHoldTime = inhaleHoldTime - 1;
  if (inhaleHoldTime <= 0 && exerciseRound <= 2) {
    clearInterval(countdownInterval);
    resetRound();
  } else if (inhaleHoldTime <= 0 && exerciseRound === 3) {
    completed();
  }
  timerDisplay.innerText = inhaleHoldTime;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
  inhaleHoldInstructions();
  clearInterval(timerInterval);
}

function formatTime(duration) {
  // Calculate minutes, seconds, and milliseconds
  let minutes = Math.floor(duration / 60000);
  let seconds = Math.floor((duration % 60000) / 1000);
  let milliseconds = duration % 1000;

  // Format
  let formattedMinutes = String(minutes);
  let formattedSeconds = String(seconds).padStart(2, '0');
  let formattedMilliseconds = String(milliseconds).padStart(3, '0').substring(0, 2);
  timeElapsed = `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;

  roundAutomation();
  return timeElapsed;
}

function updateTimer() {
  let now = Date.now();
  let elapsedTime = now - startTime;

  // Display the formatted time
  timerDisplay.innerText = formatTime(elapsedTime);
}


// Breath rounds
function resetRound() {
  stopTimer();
  clearnumberOfBreaths();
  startAnimation();
  instructionIndex = 0;
}

// Start breathing again after XX amount of time
function roundAutomation() {
  toggleElementState(skipButton, 'enable');
  if (exerciseRound === 1 && timeElapsed === exhaleHoldTimes.roundOne) {
    toggleElementState(skipButton, 'disable');
    stopTimer();
    startCountdownTimer();
  } else if (exerciseRound === 2 && timeElapsed === exhaleHoldTimes.roundTwo) {
    toggleElementState(skipButton, 'disable');
    setInhaleHoldTime();
    stopTimer();
    startCountdownTimer();
  } else if (exerciseRound === 3 && timeElapsed === exhaleHoldTimes.roundThree) {
    toggleElementState(skipButton, 'disable');
    setInhaleHoldTime();
    stopTimer();
    startCountdownTimer();
  }
}

// Stop & Reset Button (refresh page)
function refreshPage() {
  location.reload();
}

// Completed function
function completed() {
  clearInterval(countdownInterval);
  toggleElementState(mainButtons, 'hidden');
  toggleElementState(breathCounter, 'hidden');
  toggleElementState(timerDisplay, 'hidden');
  document.getElementById('breath-instructions').innerText = 'complete!';
}

// Skip button
function skipBreathHold() {
  if (exerciseRound <= 2) {
    setInhaleHoldTime();
    stopTimer();
    startCountdownTimer();
  } else if (exerciseRound === 3) {
    setInhaleHoldTime();
    stopTimer();
    startCountdownTimer();
  }
}

// Overlay
window.onload = function() {
  if (!document.cookie.includes('overlayShown=true')) {
      showOverlay();
  }
};

function showOverlay() {
  document.getElementById('overlay').style.display = 'flex';
}

function hideOverlay() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('overlay').setAttribute('aria-hidden', 'true');
  document.cookie = "overlayShown=true; max-age=86400"; // Expires after 1 day
}


// Event listeners
openOverlayButton.onclick = showOverlay;
closeOverlayButton.onclick = hideOverlay;
startButton.onclick = startAnimation;
skipButton.onclick = skipBreathHold;
resetButton.onclick = refreshPage;