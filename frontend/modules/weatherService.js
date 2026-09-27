export async function fetchWeather(lat = 26.1445, lon = 91.7362) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error("Weather fetch failed:", error);
        return { temperature: 24, windspeed: 12, weathercode: 0 };
    }
}
