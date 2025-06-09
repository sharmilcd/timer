let countdownInterval;

function startSleepTimer(minutes) {
  const delayInMinutes = minutes;
  const showOverlay = document.getElementById("videoOverlayToggle").checked;
  document.getElementById("status").textContent = `Timer set for ${minutes} min`;

  chrome.alarms.create("sleep-timer", { delayInMinutes });

  // Inject overlay if needed
  if (showOverlay) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (mins) => {
          // Remove old bar if exists
          document.getElementById("sleep-timer-overlay")?.remove();

          const bar = document.createElement("div");
          bar.id = "sleep-timer-overlay";
          bar.style.position = "fixed";
          bar.style.top = "10px";
          bar.style.right = "10px";
          bar.style.width = "200px";
          bar.style.height = "30px";
          bar.style.background = "rgba(0, 0, 0, 0.7)";
          bar.style.borderRadius = "6px";
          bar.style.zIndex = "9999";
          bar.style.display = "flex";
          bar.style.alignItems = "center";
          bar.style.justifyContent = "space-between";
          bar.style.padding = "4px 8px";
          bar.style.color = "white";
          bar.style.fontSize = "12px";
          bar.style.fontFamily = "sans-serif";
          bar.style.boxShadow = "0 0 8px rgba(0,0,0,0.5)";

          // Label
          const label = document.createElement("span");
          label.textContent = "⏳ Timer";

          // Progress bar
          const progress = document.createElement("div");
          progress.style.flex = "1";
          progress.style.height = "6px";
          progress.style.background = "#444";
          progress.style.borderRadius = "3px";
          progress.style.margin = "0 8px";
          progress.style.overflow = "hidden";

          const fill = document.createElement("div");
          fill.style.height = "100%";
          fill.style.width = "0%";
          fill.style.background = "#00e676";
          fill.style.transition = "width 1s linear";
          progress.appendChild(fill);

          // Cancel button
          const cancel = document.createElement("span");
          cancel.textContent = "✕";
          cancel.style.cursor = "pointer";
          cancel.style.marginLeft = "8px";
          cancel.style.fontSize = "16px";

          cancel.onclick = () => {
            clearInterval(interval);
            bar.remove();
            chrome.runtime.sendMessage({ action: "cancel-timer" });
          };

          bar.append(label, progress, cancel);
          document.body.appendChild(bar);

          let total = mins * 60;
          let current = 0;

          const interval = setInterval(() => {
            current++;
            fill.style.width = `${(current / total) * 100}%`;

            if (current >= total) {
              clearInterval(interval);
              bar.remove();
            }
          }, 1000);
        },
        args: [minutes]
      });
    });
  }
}

// Manual input
document.getElementById("start").addEventListener("click", () => {
  const minutes = parseInt(document.getElementById("minutes").value);
  if (!minutes || minutes <= 0) {
    document.getElementById("status").textContent = "Enter a valid time.";
    return;
  }
  startSleepTimer(minutes);
});

// Preset buttons
document.querySelectorAll(".preset").forEach(btn => {
  btn.addEventListener("click", () => {
    const minutes = parseInt(btn.getAttribute("data-min"));
    startSleepTimer(minutes);
  });
});