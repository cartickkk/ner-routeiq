export async function triggerEmergencyAlert(payload) {
    const WEBHOOK_URL = 'YOUR_MAKE_COM_WEBHOOK_URL'; // Replace with your Make.com Webhook URL later
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
