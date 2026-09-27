/**
 * NER-RouteIQ - Cargo & Shelf-Life Risk Engine (Nandini's Feature Module)
 * Calculates cargo spoilage risk based on transit delay and weather conditions.
 */

export function calculateSpoilageRisk(cargoType, delayHours, weatherRiskLevel) {
    let baseRisk = delayHours * 1.5;
    if (cargoType === 'perishable') baseRisk *= 2.0;
    if (weatherRiskLevel === 'high') baseRisk += 25;

    return {
        riskScore: Math.min(baseRisk, 100),
        status: baseRisk > 50 ? 'High Spoilage Risk' : 'Safe Transit'
    };
}
