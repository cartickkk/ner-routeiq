// frontend/modules/mapService.js

let mapInstance = null;
let routeLayerGroup = null;

export function initMap(containerId) {
    if (mapInstance) return mapInstance;

    mapInstance = L.map(containerId).setView([26.1445, 91.7362], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    routeLayerGroup = L.layerGroup().addTo(mapInstance);

    L.marker([26.1445, 91.7362]).addTo(routeLayerGroup)
        .bindPopup("<b>NER-RouteIQ Hub</b><br>System Active");

    return mapInstance;
}

export function drawRouteOnMap(routeData) {
    if (!mapInstance || !routeLayerGroup) return;

    routeLayerGroup.clearLayers();

    const { routePath, disasterZones, from, destination } = routeData;

    // Start & Destination Markers
    L.marker(routePath[0]).addTo(routeLayerGroup)
        .bindPopup(`<b style="color: #2563eb;">🟢 Origin:</b> ${from}`);
    L.marker(routePath[routePath.length - 1]).addTo(routeLayerGroup)
        .bindPopup(`<b style="color: #10b981;">🏁 Destination:</b> ${destination}`);

    // Fit bounds immediately to route area
    mapInstance.fitBounds(L.polyline(routePath).getBounds(), { padding: [60, 60] });

    // --- 1. SLOWED-DOWN ANIMATED ROUTE DRAWING ---
    const animatedPoints = [routePath[0]];
    const mainPolyline = L.polyline(animatedPoints, { color: '#2563eb', weight: 4, opacity: 0.9, dashArray: '8, 8' });
    const glowLine = L.polyline(animatedPoints, { color: '#60a5fa', weight: 8, opacity: 0.4 });
    
    routeLayerGroup.addLayer(glowLine);
    routeLayerGroup.addLayer(mainPolyline);

    let step = 0;
    const totalSteps = 50; // Increased steps for slower, smoother motion
    const fullStart = routePath[0];
    const fullEnd = routePath[routePath.length - 1];

    const drawInterval = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        
        const currentLat = fullStart[0] + (fullEnd[0] - fullStart[0]) * progress;
        const currentLon = fullStart[1] + (fullEnd[1] - fullStart[1]) * progress;
        
        animatedPoints.push([currentLat, currentLon]);
        mainPolyline.setLatLngs(animatedPoints);
        glowLine.setLatLngs(animatedPoints);

        if (step >= totalSteps) {
            clearInterval(drawInterval);
            mainPolyline.setLatLngs(routePath);
            glowLine.setLatLngs(routePath);

            // --- 2. DELAYED BUBBLE DROP ANIMATION (Triggers after line completes) ---
            setTimeout(() => {
                disasterZones.forEach(zone => {
                    let currentRadius = 100;
                    const targetRadius = zone.radius;

                    const outerGlow = L.circle(zone.center, {
                        color: '#a855f7',
                        fillColor: '#c084fc',
                        fillOpacity: 0.1,
                        radius: currentRadius * 1.25,
                        weight: 1
                    }).addTo(routeLayerGroup);

                    const hazardCircle = L.circle(zone.center, {
                        color: '#7e22ce',
                        fillColor: '#9333ea',
                        fillOpacity: 0.45,
                        radius: currentRadius,
                        dashArray: '6, 6',
                        weight: 2
                    }).addTo(routeLayerGroup);

                    let bubbleStep = 0;
                    const bubbleSteps = 30; // Slower, graceful drop expansion
                    const bubbleInterval = setInterval(() => {
                        bubbleStep++;
                        const easeProgress = bubbleStep / bubbleSteps;
                        currentRadius = targetRadius * (1 + Math.sin(easeProgress * Math.PI) * 0.12 * (1 - easeProgress));
                        if (bubbleStep >= bubbleSteps) currentRadius = targetRadius;

                        hazardCircle.setRadius(currentRadius);
                        outerGlow.setRadius(currentRadius * 1.25);

                        if (bubbleStep >= bubbleSteps) {
                            clearInterval(bubbleInterval);
                            hazardCircle.bindPopup(`
                                <div style="font-family: sans-serif; max-width: 210px; padding: 4px;">
                                    <b style="color: #7e22ce; font-size: 0.95rem;">⚠️ ${zone.title}</b><br>
                                    <span style="color: #dc2626; font-weight: bold; font-size: 0.85rem;">${zone.severity}</span>
                                    <hr style="margin: 6px 0; border-color: #e2e8f0;">
                                    <b>ETA to Hazard:</b> ${zone.expectedTime}<br>
                                    <b>Precipitation:</b> ${zone.precipitation}<br>
                                    <b>Wind Velocity:</b> ${zone.wind}
                                </div>
                            `);
                        }
                    }, 35);
                });
            }, 300); // 300ms pause after route line finishes drawing
        }
    }, 40); // 40ms interval per step for a relaxed, deliberate drawing pace
}