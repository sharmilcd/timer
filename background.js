chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "cancel-timer") {
    chrome.alarms.clear("sleep-timer");
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "sleep-timer") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const video = document.querySelector("video");
          if (video) video.pause();
          document.getElementById("sleep-timer-overlay")?.remove();
        }
      });
    }
  }
});