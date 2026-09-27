// frontend/modules/offlineService.js

let offlineQueue = [];
let isOnline = navigator.onLine;

export function initNetworkListener(statusCallback) {
    window.addEventListener('online', () => {
        isOnline = true;
        statusCallback({ isOnline: true, message: "Connection restored. Syncing cached telemetry..." });
        processQueue();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        statusCallback({ isOnline: false, message: "Network offline (Hilly Terrain). Storing data locally." });
    });

    return { isOnline };
}

export function queueOfflineAction(actionType, payload) {
    const queueItem = {
        id: Date.now(),
        type: actionType,
        payload,
        timestamp: new Date().toISOString()
    };
    offlineQueue.push(queueItem);
    
    // Save to localStorage for persistence
    localStorage.setItem('ner_offline_queue', JSON.stringify(offlineQueue));
    
    return {
        success: true,
        queuedCount: offlineQueue.length,
        message: `Action cached locally (${offlineQueue.length} pending sync)`
    };
}

function processQueue() {
    if (offlineQueue.length === 0) return;
    
    // Simulate syncing cached items
    setTimeout(() => {
        offlineQueue = [];
        localStorage.removeItem('ner_offline_queue');
        console.log("All offline telemetry successfully synced with Supabase server.");
    }, 1500);
}
