// ---- Screen Wake Lock ----
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && fullscreen() && wakeLock !== null) {
        enableWakeLock();
    }
    return true;
});

let wakeLock = null;

async function enableWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Wake Lock ON");
        }
    } catch (err) {
        console.error("WakeLock error:", err);
    }
}

function disableWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        console.log("Wake Lock OFF");
    }
}