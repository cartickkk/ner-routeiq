// frontend/modules/routePlannerService.js

// Mock coordinate database for NER corridors & major hubs
const locationCoords = {
    "north dumdum": [22.6457, 88.4126],
    "guwahati": [26.1445, 91.7362],
    "siliguri": [26.7271, 88.3953],
    "shillong": [25.5788, 91.8933],
    "dibrugarh": [27.4728, 94.9120],
    "kochi bihar": [26.3225, 89.4481],
    "agartala": [23.8315, 91.2868],
    "imphal": [24.8170, 93.9368]
};

export function calculateSafeRoute(fromCity, destCity) {
    const fromKey = fromCity.toLowerCase().trim();
    const destKey = destCity.toLowerCase().trim();

    // Default coordinates if city not found
    const startCoord = locationCoords[fromKey] || [22.6457, 88.4126];
    const endCoord = locationCoords[destKey] || [26.1445, 91.7362];

    // Generate intermediate path points for polyline effect
    const midCoord1 = [
        startCoord[0] + (endCoord[0] - startCoord[0]) * 0.4 + 0.5,
        startCoord[1] + (endCoord[1] - startCoord[1]) * 0.3 - 1.2
    ];
    const midCoord2 = [
        startCoord[0] + (endCoord[0] - startCoord[0]) * 0.7 - 0.3,
        startCoord[1] + (endCoord[1] - startCoord[1]) * 0.8 + 0.8
    ];

    const routePath = [startCoord, midCoord1, midCoord2, endCoord];

    // Simulated disaster zones along route
    const disasterZones = [
        {
            center: midCoord1,
            radius: 55000, // meters
            title: "Predicted Thunderstorm / Heavy Rain",
            severity: "Moderate Risk",
            expectedTime: "+2 hours",
            precipitation: "0.3 mm/h",
            wind: "6.3 km/h"
        }
    ];

    return {
        from: fromCity,
        destination: destCity,
        routePath,
        disasterZones,
        distanceKm: Math.round(Math.random() * 300 + 350),
        estimatedHours: (Math.random() * 4 + 6).toFixed(1)
    };
}
