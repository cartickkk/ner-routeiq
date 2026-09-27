export async function triggerEmergencyAlert(payload) {
    const WEBHOOK_URL = 'https://hook.eu1.make.com/xq7iotlsa8ra3vx28o4687u3xhcqcbt3'; // Replace with your Make.com Webhook URL later
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.text();
    } catch (error) {
        console.error("Failed to trigger webhook:", error);
    }
}
