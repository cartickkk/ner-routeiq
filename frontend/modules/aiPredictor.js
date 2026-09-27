export function evaluateRisk(weatherData) {
    let riskLevel = "Low";
    let score = 15;

    if (weatherData.windspeed > 25 || weatherData.weathercode >= 61) {
        riskLevel = "High Landslide/Flood Risk";
        score = 85;
    } else if (weatherData.windspeed > 15) {
        riskLevel = "Moderate Risk";
        score = 45;
    }

    return { riskLevel, score };
}
