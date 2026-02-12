;
(() => {
    const shiftLog = exports.shiftLog;
    const currentMonth = exports.currentMonth;
    // Elements
    const yearElement = document.querySelector('#filter--year');
    const monthElement = document.querySelector('#filter--month');
    const refreshButton = document.querySelector('#button--refresh');
    const loadingContainer = document.querySelector('#container--loading');
    const dashboardContainer = document.querySelector('#container--dashboard');
    // Set initial month
    monthElement.value = currentMonth.toString();
    // Chart instances
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeSeriesChart;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let byAssignedToChart;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tagCloudChart;
    let hotZonesMap;
    let hotZonesLayer;
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
            legend: {
                data: ['Open', 'Closed']
            },
            series: [
                {
                    data: openData,
                    itemStyle: { color: '#48c774' },
                    name: 'Open',
                    smooth: true,
                    type: 'line'
                },
                {
                    data: closedData,
                    itemStyle: { color: '#3298dc' },
                    name: 'Closed',
                    smooth: true,
                    type: 'line'
                }
            ],
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                data: categories,
                type: 'category'
            },
            yAxis: {
                minInterval: 1,
                type: 'value'
            }
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
            legend: {
                data: ['Opened', 'Closed']
            },
            series: [
                {
                    data: openedData,
                    itemStyle: { color: '#48c774' },
                    name: 'Opened',
                    type: 'bar'
                },
                {
                    data: closedData,
                    itemStyle: { color: '#3298dc' },
                    name: 'Closed',
                    type: 'bar'
                }
            ],
            tooltip: {
                axisPointer: {
                    type: 'shadow'
                },
                trigger: 'axis'
            },
            xAxis: {
                minInterval: 1,
                type: 'value'
            },
            yAxis: {
                data: categories,
                type: 'category'
            }
        });
    }
    // Update tag cloud chart
    function updateTagCloudChart(tags) {
        if (tagCloudChart === undefined) {
            return;
        }
        // Use top 20 tags for better visualization
        const topTags = tags.slice(0, 20);
        const tagNames = topTags.map((tag) => tag.tagName);
        const tagCounts = topTags.map((tag) => tag.count);
        tagCloudChart.setOption({
            series: [
                {
                    data: tagCounts,
                    itemStyle: {
                        color: function (parameters) {
                            const colors = [
                                '#48c774',
                                '#3298dc',
                                '#ffdd57',
                                '#f14668',
                                '#00d1b2',
                                '#485fc7',
                                '#b86bff',
                                '#ff6b9d'
                            ];
                            return colors[parameters.dataIndex % colors.length];
                        }
                    },
                    name: 'Count',
                    type: 'bar'
                }
            ],
            tooltip: {
                axisPointer: {
                    type: 'shadow'
                },
                trigger: 'axis'
            },
            xAxis: {
                minInterval: 1,
                type: 'value'
            },
            yAxis: {
                axisLabel: {
                    interval: 0,
                    overflow: 'truncate',
                    width: 120
                },
                data: tagNames,
                type: 'category'
            }
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
        const markerBaseSize = 20;
        const markerSizeMultiplier = 5;
        const highIntensityThreshold = 0.66;
        const mediumIntensityThreshold = 0.33;
        // Custom icons based on intensity
        const getMarkerIcon = (count) => {
            const maxCount = Math.max(...hotZones.map((hz) => hz.count));
            const intensity = count / maxCount;
            let color = '#48c774'; // Green for low
            if (intensity > highIntensityThreshold) {
                color = '#f14668'; // Red for high
            }
            else if (intensity > mediumIntensityThreshold) {
                color = '#ffdd57'; // Yellow for medium
            }
            const size = markerBaseSize + count * markerSizeMultiplier;
            return new L.DivIcon({
                className: '',
                html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; font-size: 12px;">${count}</div>`,
                iconAnchor: [size / 2, size / 2],
                iconSize: [size, size]
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
        const year = yearElement.value;
        const month = monthElement.value;
        cityssm.postJSON(
        // eslint-disable-next-line no-secrets/no-secrets -- route name, not a secret
        `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetWorkOrderAccomplishmentData`, {
            month,
            year
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
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: responseJSON.errorMessage ?? 'Failed to load accomplishment data',
                    title: 'Error'
                });
                loadingContainer.style.display = 'none';
            }
        });
    }
    // Event listeners
    refreshButton.addEventListener('click', loadData);
    // Initialize
    initializeCharts();
    loadData();
})();
