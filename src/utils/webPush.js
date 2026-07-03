const VAPID_PUBLIC_KEY = "BEhnBs-FHnATTPJPxL_qiEcAHRMcOqmJRX0aZquqn5wpuo_-gQ3cbhYb-tYNLc9NHouAi_NFWYibY5cprEevrBM";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function enableNotifications(authToken) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Push notifications aren't supported on this browser.");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service Worker registered:", registration);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Notification permission denied.");
      return false;
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.log("No existing subscription found, creating new one...");
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } else {
      console.log("Reusing existing push subscription.");
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      },
      body: JSON.stringify(subscription),
    });

    if (res.ok) {
      console.log("Successfully subscribed to Web Push reminders.");
      return true;
    } else {
      console.error("Failed to register push subscription on backend.");
      return false;
    }
  } catch (err) {
    console.error("Error setting up push notifications:", err);
    return false;
  }
}

export function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (frequency, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = audioCtx.currentTime;
    playNote(880, now, 0.3);       // A5 note
    playNote(1320, now + 0.12, 0.4); // E6 note
  } catch (e) {
    console.warn("Web Audio API not supported or blocked by user gesture:", e);
  }
}
