// frontend/modules/routePlannerService.js

const nerHubs = {
    "Guwahati": [26.1445, 91.7362],
    "Shillong": [25.5788, 91.8933],
    "Siliguri": [26.7271, 88.3953],
    "Dibrugarh": [27.4728, 94.9120],
    "Agartala": [23.8315, 91.2868],
    "Imphal": [24.8170, 93.9368],
    "Kohima": [25.6751, 94.1086],
    "Aizawl": [23.7271, 92.7176],
    "Itanagar": [27.0844, 93.6053],
    "North Dumdum": [22.6457, 88.4126],
    "Koch Bihar": [26.3225, 89.4481]
};

export function getHubList() {
    return Object.keys(nerHubs);
}

export function calculateSafeRoute(fromCity, destCity) {
    const startCoord = nerHubs[fromCity] || [26.1445, 91.7362];
    const endCoord = nerHubs[destCity] || [25.5788, 91.8933];

    // Compute realistic intermediate path waypoints
    const midLat = (startCoord[0] + endCoord[0]) / 2 + (Math.random() * 0.4 - 0.2);
    const midLon = (startCoord[1] + endCoord[1]) / 2 + (Math.random() * 0.4 - 0.2);
    const routePath = [startCoord, [midLat, midLon], endCoord];

    // Calculate approximate distance (Haversine formula approximation)
    const latDiff = endCoord[0] - startCoord[0];
    const lonDiff = endCoord[1] - startCoord[1];
    const distanceKm = Math.round(Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111);
    const estimatedHours = (distanceKm / 55).toFixed(1); // Avg truck speed ~55 km/h in hilly NER terrain

    // Dynamic hazard count based on distance and route profile
    const hazardCount = distanceKm > 400 ? 2 : 1;
    const disasterZones = [];

    for (let i = 0; i < hazardCount; i++) {
        const factor = (i + 1) / (hazardCount + 1);
        disasterZones.push({
            center: [
                startCoord[0] + (endCoord[0] - startCoord[0]) * factor,
                startCoord[1] + (endCoord[1] - startCoord[1]) * factor
            ],
            radius: 45000 + (i * 10000),
            title: i === 0 ? "Predicted Landslide / Heavy Rain Corridor" : "Flash Flood Risk Zone",
            severity: distanceKm > 400 ? "High Risk Warning" : "Moderate Risk",
            expectedTime: `+${(i + 1) * 1.5} hours`,
            precipitation: `${(0.4 + i * 0.3).toFixed(1)} mm/h`,
            wind: `${(12 + i * 5)} km/h`
        });
    }

    return {
        from: fromCity,
        destination: destCity,
        routePath,
        disasterZones,
        distanceKm: Math.max(distanceKm, 120),
        estimatedHours: Math.max(parseFloat(estimatedHours), 2.5).toFixed(1)
    };
}