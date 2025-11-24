import type Leaflet from 'leaflet'

declare const L: typeof Leaflet
;(() => {
  // View page - map display for location
  const mapViewElement = document.querySelector(
    '#map--locationView'
  ) as HTMLElement | null

  if (mapViewElement !== null) {
    const lat = Number.parseFloat(mapViewElement.dataset.lat ?? '0')
    const lng = Number.parseFloat(mapViewElement.dataset.lng ?? '0')

    const map = new L.Map('map--locationView').setView([lat, lng], 15)

    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    new L.Marker([lat, lng]).addTo(map)
  }
})()
