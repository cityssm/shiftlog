;
(() => {
    const shiftLog = exports.shiftLog;
    const currentMonth = exports.currentMonth;
    const yearElement = document.querySelector('#filter--year');
    const monthElement = document.querySelector('#filter--month');
    const refreshButton = document.querySelector('#button--refresh');
    const loadingContainer = document.querySelector('#container--loading');
    const dashboardContainer = document.querySelector('#container--dashboard');
    monthElement.value = currentMonth.toString();
    let timeSeriesChart;
    let byAssignedToChart;
    let tagCloudChart;
    let hotZonesMap;
    let hotZonesLayer;
    function initializeCharts() {
        const mapElement = document.querySelector('#map--hotZones');
        if (mapElement !== null) {
            hotZonesMap = new L.Map('map--hotZones').setView([shiftLog.defaultLatitude, shiftLog.defaultLongitude], 13);
            new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(hotZonesMap);
        }
    }
    function updateKPIs(stats) {
        const totalOpened = stats.totalOpen + stats.totalClosed;
        document.querySelector('#kpi--totalOpened').textContent =
            totalOpened.toString();
        document.querySelector('#kpi--totalClosed').textContent =
            stats.totalClosed.toString();
        document.querySelector('#kpi--completionRate').textContent = `${stats.percentClosed.toFixed(1)}%`;
    }
    function updateTimeSeriesChart(timeSeries) {
        if (timeSeriesChart === undefined) {
            const timeSeriesElement = document.querySelector('#chart--timeSeries');
            if (timeSeriesElement === null) {
                return;
            }
            else {
                timeSeriesChart = echarts.init(timeSeriesElement);
            }
        }
        if (timeSeries.every((item) => item.openWorkOrdersCount === 0)) {
            timeSeriesChart.clear();
            timeSeriesChart.setOption({
                title: {
                    text: 'No data available',
                    left: 'center',
                    top: 'middle',
                    textStyle: {
                        color: '#999',
                        fontSize: 16
                    }
                }
            });
            return;
        }
        const categories = timeSeries.map((item) => item.periodLabel);
        const openData = timeSeries.map((item) => item.openWorkOrdersCount);
        timeSeriesChart.setOption({
            title: { show: false },
            legend: {
                data: ['Open Work Orders']
            },
            series: [
                {
                    data: openData,
                    itemStyle: { color: '#48c774' },
                    name: 'Open Work Orders',
                    smooth: true,
                    type: 'line'
                }
            ],
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                data: categories,
                show: true,
                type: 'category'
            },
            yAxis: {
                minInterval: 1,
                show: true,
                type: 'value'
            }
        });
    }
    function updateByAssignedToChart(byAssignedTo) {
        if (byAssignedToChart === undefined) {
            const byAssignedToElement = document.querySelector('#chart--byAssignedTo');
            if (byAssignedToElement === null) {
                return;
            }
            else {
                byAssignedToChart = echarts.init(byAssignedToElement);
            }
        }
        if (byAssignedTo.length === 0) {
            byAssignedToChart.clear();
            byAssignedToChart.setOption({
                title: {
                    text: 'No data available',
                    left: 'center',
                    top: 'middle',
                    textStyle: {
                        color: '#999',
                        fontSize: 16
                    }
                }
            });
            return;
        }
        const categories = byAssignedTo
            .map((item) => item.assignedToName)
            .toReversed();
        const openedData = byAssignedTo.map((item) => item.openedCount).toReversed();
        const closedData = byAssignedTo.map((item) => item.closedCount).toReversed();
        byAssignedToChart.setOption({
            title: { show: false },
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
                show: true,
                type: 'value'
            },
            yAxis: {
                data: categories,
                show: true,
                type: 'category'
            }
        });
    }
    function updateTagCloudChart(tags) {
        if (tagCloudChart === undefined) {
            const tagCloudElement = document.querySelector('#chart--tagCloud');
            if (tagCloudElement === null) {
                return;
            }
            else {
                tagCloudChart = echarts.init(tagCloudElement);
            }
        }
        if (tags.length === 0) {
            tagCloudChart.clear();
            tagCloudChart.setOption({
                title: {
                    text: 'No data available',
                    left: 'center',
                    top: 'middle',
                    textStyle: {
                        color: '#999',
                        fontSize: 16
                    }
                }
            });
            return;
        }
        const topTags = tags.slice(0, 20);
        const tagNames = topTags.map((tag) => tag.tagName).toReversed();
        const tagCounts = topTags.map((tag) => tag.count).toReversed();
        tagCloudChart.setOption({
            title: { show: false },
            series: [
                {
                    data: tagCounts,
                    itemStyle: {
                        color(parameters) {
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
                show: true,
                type: 'value'
            },
            yAxis: {
                axisLabel: {
                    interval: 0,
                    overflow: 'truncate',
                    width: 120
                },
                data: tagNames,
                show: true,
                type: 'category'
            }
        });
    }
    function updateHotZonesMap(hotZones) {
        if (hotZonesMap === undefined) {
            return;
        }
        hotZonesLayer ??= L.heatLayer([], {
            minOpacity: 0.7,
            max: 1,
            maxZoom: 17,
            blur: 15,
            gradient: {
                0: '#48c774',
                0.5: '#ffdd57',
                1: '#f14668'
            },
            radius: 25
        }).addTo(hotZonesMap);
        if (hotZones.length === 0) {
            hotZonesLayer.setLatLngs([]);
            const mapContainer = document.querySelector('#map--hotZones');
            if (mapContainer !== null) {
                const existingMessage = mapContainer.querySelector('.no-data-message');
                if (existingMessage === null) {
                    const noDataDiv = document.createElement('div');
                    noDataDiv.className = 'no-data-message';
                    noDataDiv.style.cssText =
                        'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background: white; padding: 20px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #999; font-size: 16px;';
                    noDataDiv.textContent = 'No data available';
                    mapContainer.append(noDataDiv);
                }
            }
            return;
        }
        const mapContainer = document.querySelector('#map--hotZones');
        if (mapContainer !== null) {
            mapContainer.querySelector('.no-data-message')?.remove();
        }
        const bounds = [];
        const maxCount = Math.max(...hotZones.map((hz) => hz.count));
        const heatData = hotZones.map((hotZone) => {
            const lat = hotZone.latitude;
            const lng = hotZone.longitude;
            const intensity = hotZone.count / maxCount;
            bounds.push([lat, lng]);
            return [lat, lng, intensity];
        });
        hotZonesLayer.setLatLngs(heatData);
        if (bounds.length > 0) {
            hotZonesMap.invalidateSize();
            hotZonesMap.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15
            });
        }
    }
    function loadData() {
        loadingContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        const year = yearElement.value;
        const month = monthElement.value;
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetWorkOrderAccomplishmentData`, {
            month,
            year
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.data !== undefined) {
                const data = responseJSON.data;
                loadingContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
                updateKPIs(data.stats);
                updateTimeSeriesChart(data.timeSeries);
                updateByAssignedToChart(data.byAssignedTo);
                updateTagCloudChart(data.tags);
                updateHotZonesMap(data.hotZones);
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
    refreshButton.addEventListener('click', loadData);
    initializeCharts();
    loadData();
})();
