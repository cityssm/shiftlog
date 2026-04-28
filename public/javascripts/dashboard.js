const defaultZoom = 13;
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
    const map = new L.Map('map--dashboardWorkOrders').setView([shiftLog.defaultLatitude, shiftLog.defaultLongitude], defaultZoom);
    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const markersLayer = new L.LayerGroup().addTo(map);
    const openIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-green.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
    const overdueIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-red.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
    const multipleIcon = new L.Icon({
        iconAnchor,
        iconSize,
        iconUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-icon-orange.png`,
        popupAnchor,
        shadowSize,
        shadowUrl: `${shiftLog.urlPrefix}/images/leaflet-color-markers/marker-shadow.png`
    });
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
        const workOrderTitleSpan = document.createElement('span');
        workOrderTitleSpan.textContent = workOrder.workOrderTitle ?? '';
        workOrderTitleSpan.style.display = workOrder.workOrderTitle ? 'block' : 'none';
        workOrderTitleSpan.style.fontWeight = 'bold';
        workOrderTitleSpan.style.fontSize = '0.9em';
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
        workOrderDiv.append(titleLink, workOrderTitleSpan, typeSpan, statusLine, addressLine);
        return workOrderDiv;
    }
    function addMarkerToMap(workOrders, bounds) {
        const firstWorkOrder = workOrders[0].workOrder;
        const lat = firstWorkOrder.locationLatitude;
        const lng = firstWorkOrder.locationLongitude;
        let icon;
        if (workOrders.length > 1) {
            icon = multipleIcon;
        }
        else if (workOrders[0].workOrder.workOrderCloseDateTime !== null) {
            icon = closedIcon;
        }
        else if (workOrders[0].isOverdue) {
            icon = overdueIcon;
        }
        else {
            icon = openIcon;
        }
        const marker = new L.Marker([lat, lng], { icon });
        const popupContent = document.createElement('div');
        popupContent.style.minWidth = '200px';
        popupContent.style.maxHeight = '300px';
        popupContent.style.overflowY = 'auto';
        if (workOrders.length > 1) {
            const headerDiv = document.createElement('div');
            headerDiv.style.marginBottom = '0.5em';
            headerDiv.style.paddingBottom = '0.5em';
            headerDiv.style.borderBottom = '1px solid #ccc';
            headerDiv.style.fontWeight = 'bold';
            headerDiv.textContent = `${workOrders.length} ${cityssm.escapeHTML(shiftLog.workOrdersSectionName)} at this Location`;
            popupContent.append(headerDiv);
        }
        for (const [index, item] of workOrders.entries()) {
            const workOrderDiv = buildWorkOrderPopupContent(item.workOrder, item.isOverdue);
            if (workOrders.length > 1 && index < workOrders.length - 1) {
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
        markersLayer.clearLayers();
        const bounds = [];
        let displayedCount = 0;
        let overdueCount = 0;
        const now = new Date();
        const workOrdersByLocation = new Map();
        for (const workOrder of recentWorkOrders) {
            if (workOrder.locationLatitude === null ||
                workOrder.locationLatitude === undefined ||
                workOrder.locationLongitude === null ||
                workOrder.locationLongitude === undefined) {
                continue;
            }
            displayedCount += 1;
            let isOverdue = false;
            if (workOrder.workOrderDueDateTime !== null &&
                workOrder.workOrderDueDateTime !== undefined) {
                const dueDate = new Date(workOrder.workOrderDueDateTime);
                isOverdue = dueDate < now;
            }
            if (isOverdue) {
                overdueCount += 1;
            }
            const locationKey = `${workOrder.locationLatitude},${workOrder.locationLongitude}`;
            let locationWorkOrders = workOrdersByLocation.get(locationKey);
            if (locationWorkOrders === undefined) {
                locationWorkOrders = [];
                workOrdersByLocation.set(locationKey, locationWorkOrders);
            }
            locationWorkOrders.push({ workOrder, isOverdue });
        }
        for (const workOrders of workOrdersByLocation.values()) {
            addMarkerToMap(workOrders, bounds);
        }
        if (displayedCount === 0) {
            workOrderCountElement.textContent = `No recently updated ${cityssm.escapeHTML(shiftLog.workOrdersSectionName.toLowerCase())} with location data found.`;
        }
        else {
            workOrderCountElement.textContent = `Showing ${displayedCount}
        recently updated
        ${displayedCount === 1 ? cityssm.escapeHTML(shiftLog.workOrdersSectionNameSingular.toLowerCase()) : cityssm.escapeHTML(shiftLog.workOrdersSectionName.toLowerCase())}
        with location data`;
            if (overdueCount > 0) {
                workOrderCountElement.textContent += ` (${overdueCount} overdue)`;
            }
        }
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
        const panelBlockElements = (workOrderHighlightsPanelElement?.querySelectorAll('.panel-block[data-work-order-type]') ?? []);
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.classList.toggle('is-hidden', panelBlockElement.dataset.workOrderType !== workOrderType);
        }
    }
    const panelTabElements = workOrderHighlightsPanelElement?.querySelectorAll('.panel-tabs a') ?? [];
    for (const panelTabElement of panelTabElements) {
        panelTabElement.addEventListener('click', toggleWorkOrderPanelTab);
    }
    loadWorkOrders();
})();
