export function initMap(elementId = 'map') {
    const map = L.map(elementId).setView([26.1445, 91.7362], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([26.1445, 91.7362]).addTo(map)
      .bindPopup('<b>NER-RouteIQ Hub</b><br />System Active.')
      .openPopup();

    return map;
}
