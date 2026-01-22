const defaultZoom = 13;
// Leaflet icon dimensions
const iconSize = [25, 41];
const iconAnchor = [12, 41];
const popupAnchor = [1, -34];
const shadowSize = [41, 41];
;
(() => {
    const shiftLog = exports.shiftLog;
    const recentWorkOrders = exports.recentWorkOrders;
    const workOrderHighlightsPanelElement = document.querySelector('#panel--workOrderHighlights');
    const mapContainer = document.querySelector('#map--dashboardWorkOrders');
    if (mapContainer === null) {
        return;
    }
    const workOrderCountElement = document.querySelector('#container--workOrderCount');
    // Initialize map
    const map = new L.Map('map--dashboardWorkOrders').setView([shiftLog.defaultLatitude, shiftLog.defaultLongitude], defaultZoom);
    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Layer group to hold markers
    const markersLayer = new L.LayerGroup().addTo(map);
    // Custom icon for open work orders
    const openIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-green.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
    // Custom icon for overdue work orders
    const overdueIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-red.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
    // Custom icon for multiple work orders (orange)
    const multipleIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-orange.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
    // Custom icon for closed work orders (grey)
    const closedIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-grey.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
    function buildWorkOrderPopupContent(workOrder, isOverdue) {
        const workOrderDiv = document.createElement('div');
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
        if (workOrder.workOrderCloseDateTime !== null) {
            const closedSpan = document.createElement('span');
            closedSpan.textContent = 'Closed';
            closedSpan.style.color = '#7a7a7a';
            statusLine.append(closedSpan);
        }
        else if (isOverdue) {
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
        if (workOrder.workOrderOpenDateTime !== null &&
            workOrder.workOrderOpenDateTime !== undefined) {
            const openDateSpan = document.createElement('span');
            openDateSpan.textContent = ` - Opened: ${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}`;
            openDateSpan.style.fontSize = '0.9em';
            statusLine.append(openDateSpan);
        }
        const addressLine = document.createElement('div');
        addressLine.style.marginTop = '0.5em';
        addressLine.textContent =
            workOrder.locationAddress1 === ''
                ? '(No Address)'
                : workOrder.locationAddress1;
        if (workOrder.locationAddress2 !== '') {
            addressLine.textContent += `, ${workOrder.locationAddress2}`;
        }
        workOrderDiv.append(titleLink, typeSpan, statusLine, addressLine);
        return workOrderDiv;
    }
    function addMarkerToMap(workOrders, bounds) {
        const firstWorkOrder = workOrders[0].workOrder;
        const lat = firstWorkOrder.locationLatitude;
        const lng = firstWorkOrder.locationLongitude;
        // Determine the icon based on work order count and overdue status
        let icon;
        if (workOrders.length > 1) {
            // Multiple work orders at this location - use orange icon
            icon = multipleIcon;
        }
        else if (workOrders[0].workOrder.workOrderCloseDateTime !== null) {
            // Closed work order - use grey icon
            icon = closedIcon;
        }
        else if (workOrders[0].isOverdue) {
            // Overdue work order - use red icon
            icon = overdueIcon;
        }
        else {
            // Open work order - use green icon
            icon = openIcon;
        }
        const marker = new L.Marker([lat, lng], { icon });
        // Build popup content
        const popupContent = document.createElement('div');
        popupContent.style.minWidth = '200px';
        popupContent.style.maxHeight = '300px';
        popupContent.style.overflowY = 'auto';
        if (workOrders.length > 1) {
            // Add header for multiple work orders
            const headerDiv = document.createElement('div');
            headerDiv.style.marginBottom = '0.5em';
            headerDiv.style.paddingBottom = '0.5em';
            headerDiv.style.borderBottom = '1px solid #ccc';
            headerDiv.style.fontWeight = 'bold';
            headerDiv.textContent = `${workOrders.length} Work Orders at this Location`;
            popupContent.append(headerDiv);
        }
        // Add each work order to the popup
        for (const [index, item] of workOrders.entries()) {
            const workOrderDiv = buildWorkOrderPopupContent(item.workOrder, item.isOverdue);
            if (workOrders.length > 1 && index < workOrders.length - 1) {
                // Add separator between work orders
                workOrderDiv.style.paddingBottom = '0.5em';
                workOrderDiv.style.marginBottom = '0.5em';
                workOrderDiv.style.borderBottom = '1px solid #eee';
            }
            popupContent.append(workOrderDiv);
        }
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
        bounds.push([lat, lng]);
    }
    function loadWorkOrders() {
        workOrderCountElement.textContent = 'Loading...';
        // Clear existing markers
        markersLayer.clearLayers();
        const bounds = [];
        let displayedCount = 0;
        let overdueCount = 0;
        const now = new Date();
        // Group work orders by their coordinates
        const workOrdersByLocation = new Map();
        for (const workOrder of recentWorkOrders) {
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
            if (workOrder.workOrderDueDateTime !== null &&
                workOrder.workOrderDueDateTime !== undefined) {
                const dueDate = new Date(workOrder.workOrderDueDateTime);
                isOverdue = dueDate < now;
            }
            if (isOverdue) {
                overdueCount += 1;
            }
            // Create a location key from lat/lng
            const locationKey = `${workOrder.locationLatitude},${workOrder.locationLongitude}`;
            let locationWorkOrders = workOrdersByLocation.get(locationKey);
            if (locationWorkOrders === undefined) {
                locationWorkOrders = [];
                workOrdersByLocation.set(locationKey, locationWorkOrders);
            }
            locationWorkOrders.push({ workOrder, isOverdue });
        }
        // Add markers for each location (grouped work orders)
        for (const workOrders of workOrdersByLocation.values()) {
            addMarkerToMap(workOrders, bounds);
        }
        // Update count display
        if (displayedCount === 0) {
            workOrderCountElement.textContent =
                'No recent work orders with location data found.';
        }
        else {
            workOrderCountElement.textContent = `Showing ${displayedCount} recent work order${displayedCount === 1 ? '' : 's'} with location data`;
            if (overdueCount > 0) {
                workOrderCountElement.textContent += ` (${overdueCount} overdue)`;
            }
        }
        // Fit map to bounds if there are markers
        if (bounds.length > 0) {
            map.fitBounds(bounds);
        }
    }
    function toggleWorkOrderPanelTab(event) {
        event.preventDefault();
        const target = event.currentTarget;
        const panelTabElements = workOrderHighlightsPanelElement?.querySelectorAll('.panel-tabs a') ?? [];
        for (const panelTabElement of panelTabElements) {
            panelTabElement.classList.remove('is-active');
        }
        target.classList.add('is-active');
        const workOrderType = target.dataset.workOrderType ?? 'recent';
        // Toggle visibility between map (recent) and list (overdue)
        const panelBlockElements = (workOrderHighlightsPanelElement?.querySelectorAll('.panel-block[data-work-order-type]') ?? []);
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.classList.toggle('is-hidden', panelBlockElement.dataset.workOrderType !== workOrderType);
        }
    }
    const panelTabElements = workOrderHighlightsPanelElement?.querySelectorAll('.panel-tabs a') ?? [];
    for (const panelTabElement of panelTabElements) {
        panelTabElement.addEventListener('click', toggleWorkOrderPanelTab);
    }
    // Initial load
    loadWorkOrders();
})();
