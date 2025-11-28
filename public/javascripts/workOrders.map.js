const defaultZoom = 13;
// Leaflet icon dimensions
const iconSize = [25, 41];
const iconAnchor = [12, 41];
const popupAnchor = [1, -34];
const shadowSize = [41, 41];
(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}`;
    const workOrderTypeSelect = document.querySelector('#workOrderMap--workOrderTypeId');
    const assignedToSelect = document.querySelector('#workOrderMap--assignedToDataListItemId');
    const workOrderCountElement = document.querySelector('#container--workOrderCount');
    // Initialize map
    const map = new L.Map('map--workOrders').setView([shiftLog.defaultLatitude, shiftLog.defaultLongitude], defaultZoom);
    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Layer group to hold markers
    const markersLayer = new L.LayerGroup().addTo(map);
    // Custom icon for open work orders
    const openIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        popupAnchor,
        shadowSize,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
    // Custom icon for overdue work orders
    const overdueIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        popupAnchor,
        shadowSize,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
    function addMarkerToMap(workOrder, isOverdue, bounds) {
        const lat = workOrder.locationLatitude;
        const lng = workOrder.locationLongitude;
        const icon = isOverdue ? overdueIcon : openIcon;
        const marker = new L.Marker([lat, lng], { icon });
        // Build popup content
        const popupContent = document.createElement('div');
        popupContent.style.minWidth = '200px';
        const titleLink = document.createElement('a');
        titleLink.href = shiftLog.buildWorkOrderURL(workOrder.workOrderId);
        titleLink.textContent = workOrder.workOrderNumber;
        titleLink.style.fontWeight = 'bold';
        const typeSpan = document.createElement('span');
        typeSpan.textContent = workOrder.workOrderType ?? '(Unknown Type)';
        typeSpan.style.display = 'block';
        typeSpan.style.fontSize = '0.9em';
        typeSpan.style.color = '#666';
        const statusLine = document.createElement('div');
        statusLine.style.marginTop = '0.5em';
        if (isOverdue) {
            const overdueSpan = document.createElement('span');
            overdueSpan.textContent = 'Overdue';
            overdueSpan.style.color = '#cc0f35';
            overdueSpan.style.fontWeight = 'bold';
            statusLine.append(overdueSpan);
        }
        else {
            const openSpan = document.createElement('span');
            openSpan.textContent = 'Open';
            openSpan.style.color = '#48c774';
            statusLine.append(openSpan);
        }
        if (workOrder.workOrderDueDateTime !== null &&
            workOrder.workOrderDueDateTime !== undefined) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.textContent = ` - Due: ${cityssm.dateToString(new Date(workOrder.workOrderDueDateTime))}`;
            dueDateSpan.style.fontSize = '0.9em';
            statusLine.append(dueDateSpan);
        }
        const addressLine = document.createElement('div');
        addressLine.style.marginTop = '0.5em';
        addressLine.textContent =
            workOrder.locationAddress1 === '' ? '(No Address)' : workOrder.locationAddress1;
        if (workOrder.locationAddress2 !== '') {
            addressLine.textContent += ', ' + workOrder.locationAddress2;
        }
        const assignedLine = document.createElement('div');
        assignedLine.style.marginTop = '0.5em';
        assignedLine.style.fontSize = '0.9em';
        assignedLine.textContent = `Assigned to: ${workOrder.assignedToDataListItem ?? '(Not Assigned)'}`;
        popupContent.append(titleLink, typeSpan, statusLine, addressLine, assignedLine);
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
        bounds.push([lat, lng]);
    }
    function loadWorkOrders() {
        workOrderCountElement.textContent = 'Loading...';
        const filters = {
            limit: '-1',
            offset: '0',
            openClosedFilter: 'open'
        };
        const workOrderTypeId = workOrderTypeSelect.value;
        if (workOrderTypeId !== '') {
            filters.workOrderTypeId = workOrderTypeId;
        }
        const assignedToDataListItemId = assignedToSelect.value;
        if (assignedToDataListItemId !== '') {
            filters.assignedToDataListItemId = assignedToDataListItemId;
        }
        cityssm.postJSON(`${urlPrefix}/doSearchWorkOrders`, filters, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            // Clear existing markers
            markersLayer.clearLayers();
            const bounds = [];
            let displayedCount = 0;
            let overdueCount = 0;
            const now = new Date();
            for (const workOrder of responseJSON.workOrders) {
                // Skip work orders without coordinates
                if (workOrder.locationLatitude === null ||
                    workOrder.locationLatitude === undefined ||
                    workOrder.locationLongitude === null ||
                    workOrder.locationLongitude === undefined) {
                    continue;
                }
                displayedCount += 1;
                // Check if overdue
                let isOverdue = false;
                if (workOrder.workOrderDueDateTime !== null && workOrder.workOrderDueDateTime !== undefined) {
                    const dueDate = new Date(workOrder.workOrderDueDateTime);
                    isOverdue = dueDate < now;
                }
                if (isOverdue) {
                    overdueCount += 1;
                }
                addMarkerToMap(workOrder, isOverdue, bounds);
            }
            // Update count display
            if (displayedCount === 0) {
                workOrderCountElement.textContent =
                    'No open work orders with location data found.';
            }
            else {
                workOrderCountElement.textContent = `Showing ${displayedCount} open work order${displayedCount === 1 ? '' : 's'} with location data`;
                if (overdueCount > 0) {
                    workOrderCountElement.textContent += ` (${overdueCount} overdue)`;
                }
            }
            // Fit map to bounds if there are markers
            if (bounds.length > 0) {
                map.fitBounds(bounds);
            }
        });
    }
    // Event listeners for filters
    workOrderTypeSelect.addEventListener('change', loadWorkOrders);
    assignedToSelect.addEventListener('change', loadWorkOrders);
    // Initial load
    loadWorkOrders();
})();
