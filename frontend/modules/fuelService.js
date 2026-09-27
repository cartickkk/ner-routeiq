// frontend/modules/fuelService.js

export function calculateFuelAndCarbon(distanceKm, terrainType = 'hilly', cargoWeightTons = 5) {
    // Base consumption: ~0.35 liters per km for heavy trucks, adjusted for terrain & weight
    let terrainMultiplier = 1.0;
    if (terrainType === 'hilly') terrainMultiplier = 1.35;      // Hilly Northeastern terrain
    if (terrainType === 'mountainous') terrainMultiplier = 1.6; // Extreme passes

    const fuelEfficiencyPerKm = 0.38 * terrainMultiplier * (1 + (cargoWeightTons * 0.05));
    const totalFuelLitres = distanceKm * fuelEfficiencyPerKm;
    
    // Diesel produces roughly 2.68 kg of CO2 per litre burned
    const carbonEmissionKg = totalFuelLitres * 2.68;
    const estimatedCostINR = totalFuelLitres * 95; // Average diesel cost approx ₹95/L

    return {
        distanceKm,
        totalFuelLitres: totalFuelLitres.toFixed(1),
        carbonEmissionKg: carbonEmissionKg.toFixed(1),
        estimatedCostINR: Math.round(estimatedCostINR),
        efficiencyRating: terrainMultiplier > 1.3 ? "Eco-Optimized Route Recommended" : "Standard Consumption"
    };
}
