(() => {
    // View page - map display for location
    const mapViewElement = document.querySelector('#map--locationView');
    if (mapViewElement !== null) {
        // @ts-expect-error - Leaflet is loaded via script tag
        const L = globalThis.L;
        const lat = Number.parseFloat(mapViewElement.dataset.lat ?? '0');
        const lng = Number.parseFloat(mapViewElement.dataset.lng ?? '0');
        const map = L.map('map--locationView').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([lat, lng]).addTo(map);
    }
})();
