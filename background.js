let timerData = {
  timeRemaining: 25 * 60,
  isPaused: true,
  isRunning: false,
  focusActive: true,
};

// Load saved state
chrome.storage.local.get("timerData", (data) => {
  if (data.timerData) timerData = data.timerData;
});

// Alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "timerTick") updateTimer();
});

function updateTimer() {
  if (timerData.timeRemaining <= 0) {
    handleTimerEnd();
    return;
  }

  if (!timerData.isRunning || timerData.isPaused) return;

  timerData.timeRemaining--;
  chrome.storage.local.set({ timerData });
}

function handleTimerEnd() {
  chrome.alarms.clear("timerTick");

  chrome.notifications.create({
    type: "basic",
    iconUrl: "hello_extensions.png",
    title: "Timer Complete!",
    message: timerData.focusActive ? "Time to take a break!" : "Time to focus!",
  });

  timerData.focusActive = !timerData.focusActive;
  timerData.timeRemaining = timerData.focusActive ? 25 * 60 : 5 * 60;
  timerData.isRunning = false;
  timerData.isPaused = true;

  chrome.storage.local.set({ timerData });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "startTimer":
      timerData.isRunning = true;
      timerData.isPaused = false;
      chrome.alarms.create("timerTick", { periodInMinutes: 1 / 60 });
      chrome.storage.local.set({ timerData });
      break;

    case "pauseTimer":
      timerData.isPaused = !timerData.isPaused;
      chrome.storage.local.set({ timerData });
      sendResponse({ isPaused: timerData.isPaused });
      break;

    case "resetTimer":
      timerData.timeRemaining = message.time * 60;
      timerData.isRunning = false;
      timerData.isPaused = true;
      timerData.focusActive = message.isFocus;
      chrome.storage.local.set({ timerData });
      break;

    case "getTimerData":
      sendResponse(timerData);
      break;
  }
});
