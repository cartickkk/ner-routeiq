export function calculateSpoilageRisk(cargoType, delayHours, weatherRiskScore) {
    let baseFactor = cargoType === 'perishable' ? 2.5 : 1.0;
    let spoilageScore = (delayHours * 1.5 * baseFactor) + (weatherRiskScore * 0.2);
    spoilageScore = Math.min(Math.round(spoilageScore), 100);

    return {
        spoilageScore,
        status: spoilageScore > 50 ? 'Critical Spoilage Risk' : 'Safe Transit'
    };
}
