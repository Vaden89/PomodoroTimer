const body = document.body;
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-timer-btn");
const pauseBtn = document.getElementById("pause-timer-btn");
const focusBtn = document.getElementById("focus-timer-nav-btn");
const restBtn = document.getElementById("rest-timer-nav-btn");

setInterval(() => refreshTimer(), 1000);

function refreshTimer() {
  chrome.runtime.sendMessage({ type: "getTimerData" }, (data) => {
    updateDisplay(data.timeRemaining);
    updateUIState(data);
  });
}

function updateDisplay(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${mins}:${secs}`;
}

function updateUIState(data) {
  pauseBtn.textContent = data.isPaused ? "Resume" : "Pause";
  startBtn.classList.toggle("hidden", data.isRunning);
  pauseBtn.classList.toggle("hidden", !data.isRunning);

  const isFocus = data.focusActive;
  body.style.background = isFocus ? "#d74141" : "#38858a";
  pauseBtn.style.color = isFocus ? "#d74141" : "#38858a";
  focusBtn.classList.toggle("active", isFocus);
  restBtn.classList.toggle("active", !isFocus);
}

// Event handlers
startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "startTimer" });
});

pauseBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "pauseTimer" });
});

focusBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "resetTimer",
    time: 25,
    isFocus: true,
  });
  pauseBtn.style.color = "#d74141";
  startBtn.style.color = "#d74141";
});

restBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "resetTimer",
    time: 5,
    isFocus: false,
  });
  pauseBtn.style.color = "#38858a";
  startBtn.style.color = "#38858a";
});

refreshTimer();
