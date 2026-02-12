;
(() => {
    const shiftLog = exports.shiftLog;
    const currentYear = exports.currentYear;
    const currentMonth = exports.currentMonth;
    // Elements
    const filterTypeElement = document.querySelector('#filter--filterType');
    const yearElement = document.querySelector('#filter--year');
    const monthElement = document.querySelector('#filter--month');
    const monthFilterContainer = document.querySelector('#container--monthFilter');
    const refreshButton = document.querySelector('#button--refresh');
    const loadingContainer = document.querySelector('#container--loading');
    const dashboardContainer = document.querySelector('#container--dashboard');
    // Set initial month
    monthElement.value = currentMonth.toString();
    // Chart instances
    let timeSeriesChart;
    let byAssignedToChart;
    let tagCloudChart;
    let hotZonesMap;
    let hotZonesLayer;
    // Toggle month filter visibility
    function toggleMonthFilter() {
        const filterType = filterTypeElement.value;
        if (filterType === 'month') {
            monthFilterContainer.classList.remove('is-hidden');
        }
        else {
            monthFilterContainer.classList.add('is-hidden');
        }
    }
    filterTypeElement.addEventListener('change', toggleMonthFilter);
    // Initialize charts
    function initializeCharts() {
        const timeSeriesElement = document.querySelector('#chart--timeSeries');
        if (timeSeriesElement !== null) {
            timeSeriesChart = echarts.init(timeSeriesElement);
        }
        const byAssignedToElement = document.querySelector('#chart--byAssignedTo');
        if (byAssignedToElement !== null) {
            byAssignedToChart = echarts.init(byAssignedToElement);
        }
        const tagCloudElement = document.querySelector('#chart--tagCloud');
        if (tagCloudElement !== null) {
            tagCloudChart = echarts.init(tagCloudElement);
        }
        // Initialize Leaflet map
        const mapElement = document.querySelector('#map--hotZones');
        if (mapElement !== null) {
            hotZonesMap = new L.Map('map--hotZones').setView([shiftLog.defaultLatitude, shiftLog.defaultLongitude], 13);
            new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(hotZonesMap);
            hotZonesLayer = new L.LayerGroup().addTo(hotZonesMap);
        }
    }
    // Update KPIs
    function updateKPIs(stats) {
        const totalOpened = stats.totalOpen + stats.totalClosed;
        document.querySelector('#kpi--totalOpened').textContent =
            totalOpened.toString();
        document.querySelector('#kpi--totalClosed').textContent =
            stats.totalClosed.toString();
        document.querySelector('#kpi--totalOverdue').textContent =
            stats.totalOverdue.toString();
        document.querySelector('#kpi--completionRate').textContent = `${stats.percentClosed.toFixed(1)}%`;
    }
    // Update time series chart
    function updateTimeSeriesChart(timeSeries) {
        if (timeSeriesChart === undefined) {
            return;
        }
        const categories = timeSeries.map((item) => item.periodLabel);
        const openData = timeSeries.map((item) => item.openCount);
        const closedData = timeSeries.map((item) => item.closedCount);
        timeSeriesChart.setOption({
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Open', 'Closed']
            },
            xAxis: {
                type: 'category',
                data: categories
            },
            yAxis: {
                type: 'value',
                minInterval: 1
            },
            series: [
                {
                    name: 'Open',
                    type: 'line',
                    data: openData,
                    smooth: true,
                    itemStyle: { color: '#48c774' }
                },
                {
                    name: 'Closed',
                    type: 'line',
                    data: closedData,
                    smooth: true,
                    itemStyle: { color: '#3298dc' }
                }
            ]
        });
    }
    // Update by assigned to chart
    function updateByAssignedToChart(byAssignedTo) {
        if (byAssignedToChart === undefined) {
            return;
        }
        const categories = byAssignedTo.map((item) => item.assignedToName);
        const openedData = byAssignedTo.map((item) => item.openedCount);
        const closedData = byAssignedTo.map((item) => item.closedCount);
        byAssignedToChart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Opened', 'Closed']
            },
            xAxis: {
                type: 'value',
                minInterval: 1
            },
            yAxis: {
                type: 'category',
                data: categories
            },
            series: [
                {
                    name: 'Opened',
                    type: 'bar',
                    data: openedData,
                    itemStyle: { color: '#48c774' }
                },
                {
                    name: 'Closed',
                    type: 'bar',
                    data: closedData,
                    itemStyle: { color: '#3298dc' }
                }
            ]
        });
    }
    // Update tag cloud chart
    function updateTagCloudChart(tags) {
        if (tagCloudChart === undefined) {
            return;
        }
        const wordCloudData = tags.map((tag) => ({
            name: tag.tagName,
            value: tag.count
        }));
        tagCloudChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}'
            },
            series: [
                {
                    type: 'wordCloud',
                    shape: 'circle',
                    keepAspect: false,
                    left: 'center',
                    top: 'center',
                    width: '100%',
                    height: '100%',
                    right: null,
                    bottom: null,
                    sizeRange: [12, 48],
                    rotationRange: [0, 0],
                    rotationStep: 0,
                    gridSize: 8,
                    drawOutOfBound: false,
                    layoutAnimation: true,
                    textStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        color: function () {
                            const colors = [
                                '#48c774',
                                '#3298dc',
                                '#ffdd57',
                                '#f14668',
                                '#00d1b2',
                                '#485fc7'
                            ];
                            return colors[Math.floor(Math.random() * colors.length)];
                        }
                    },
                    emphasis: {
                        focus: 'self',
                        textStyle: {
                            textShadowBlur: 10,
                            textShadowColor: '#333'
                        }
                    },
                    data: wordCloudData
                }
            ]
        });
    }
    // Update hot zones map
    function updateHotZonesMap(hotZones) {
        if (hotZonesMap === undefined || hotZonesLayer === undefined) {
            return;
        }
        // Clear existing markers
        hotZonesLayer.clearLayers();
        if (hotZones.length === 0) {
            return;
        }
        const bounds = [];
        // Custom icons based on intensity
        const getMarkerIcon = (count) => {
            const maxCount = Math.max(...hotZones.map((hz) => hz.count));
            const intensity = count / maxCount;
            let color = '#48c774'; // Green for low
            if (intensity > 0.66) {
                color = '#f14668'; // Red for high
            }
            else if (intensity > 0.33) {
                color = '#ffdd57'; // Yellow for medium
            }
            return new L.DivIcon({
                html: `<div style="background-color: ${color}; width: ${20 + count * 5}px; height: ${20 + count * 5}px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; font-size: 12px;">${count}</div>`,
                className: '',
                iconSize: [20 + count * 5, 20 + count * 5],
                iconAnchor: [(20 + count * 5) / 2, (20 + count * 5) / 2]
            });
        };
        for (const hotZone of hotZones) {
            const lat = hotZone.latitude;
            const lng = hotZone.longitude;
            const marker = new L.Marker([lat, lng], {
                icon: getMarkerIcon(hotZone.count)
            });
            const popupContent = `
        <div>
          <strong>${hotZone.count} ${cityssm.escapeHTML(hotZone.count === 1 ? shiftLog.workOrdersSectionNameSingular : shiftLog.workOrdersSectionName)}</strong><br/>
          Open: ${hotZone.openCount}<br/>
          Closed: ${hotZone.closedCount}
        </div>
      `;
            marker.bindPopup(popupContent);
            hotZonesLayer.addLayer(marker);
            bounds.push([lat, lng]);
        }
        // Fit map to bounds
        if (bounds.length > 0) {
            hotZonesMap.fitBounds(bounds);
        }
    }
    // Load data
    function loadData() {
        loadingContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        const filterType = filterTypeElement.value;
        const year = yearElement.value;
        const month = monthElement.value;
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetWorkOrderAccomplishmentData`, {
            filterType,
            year,
            month: filterType === 'month' ? month : undefined
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.data !== undefined) {
                const data = responseJSON.data;
                // Update KPIs
                updateKPIs(data.stats);
                // Update charts
                updateTimeSeriesChart(data.timeSeries);
                updateByAssignedToChart(data.byAssignedTo);
                updateTagCloudChart(data.tags);
                updateHotZonesMap(data.hotZones);
                loadingContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
            }
            else {
                cityssm.alertModal('Error', responseJSON.errorMessage ?? 'Failed to load accomplishment data', 'OK', 'danger');
                loadingContainer.style.display = 'none';
            }
        });
    }
    // Event listeners
    refreshButton.addEventListener('click', loadData);
    // Initialize
    initializeCharts();
    toggleMonthFilter();
    loadData();
})();
export {};
