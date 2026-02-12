import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type Leaflet from 'leaflet'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const L: typeof Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const echarts: any

declare const exports: {
  shiftLog: ShiftLogGlobal
  currentYear: number
  currentMonth: number
}

interface WorkOrderAccomplishmentStats {
  totalOpen: number
  totalClosed: number
  totalOverdue: number
  percentClosed: number
}

interface WorkOrderTimeSeriesData {
  periodLabel: string
  openCount: number
  closedCount: number
}

interface WorkOrderByAssignedTo {
  assignedToName: string
  openedCount: number
  closedCount: number
}

interface WorkOrderTagStatistic {
  tagName: string
  count: number
}

interface WorkOrderHotZone {
  latitude: number
  longitude: number
  count: number
  openCount: number
  closedCount: number
}

interface WorkOrderAccomplishmentData {
  stats: WorkOrderAccomplishmentStats
  timeSeries: WorkOrderTimeSeriesData[]
  byAssignedTo: WorkOrderByAssignedTo[]
  tags: WorkOrderTagStatistic[]
  hotZones: WorkOrderHotZone[]
}

;(() => {
  const shiftLog = exports.shiftLog
  const currentYear = exports.currentYear
  const currentMonth = exports.currentMonth

  // Elements
  const filterTypeElement = document.querySelector(
    '#filter--filterType'
  ) as HTMLSelectElement
  const yearElement = document.querySelector(
    '#filter--year'
  ) as HTMLInputElement
  const monthElement = document.querySelector(
    '#filter--month'
  ) as HTMLSelectElement
  const monthFilterContainer = document.querySelector(
    '#container--monthFilter'
  ) as HTMLElement
  const refreshButton = document.querySelector(
    '#button--refresh'
  ) as HTMLButtonElement
  const loadingContainer = document.querySelector(
    '#container--loading'
  ) as HTMLElement
  const dashboardContainer = document.querySelector(
    '#container--dashboard'
  ) as HTMLElement

  // Set initial month
  monthElement.value = currentMonth.toString()

  // Chart instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timeSeriesChart: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let byAssignedToChart: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tagCloudChart: any
  let hotZonesMap: L.Map | undefined
  let hotZonesLayer: L.LayerGroup | undefined

  // Toggle month filter visibility
  function toggleMonthFilter(): void {
    const filterType = filterTypeElement.value
    if (filterType === 'month') {
      monthFilterContainer.classList.remove('is-hidden')
    } else {
      monthFilterContainer.classList.add('is-hidden')
    }
  }

  filterTypeElement.addEventListener('change', toggleMonthFilter)

  // Initialize charts
  function initializeCharts(): void {
    const timeSeriesElement = document.querySelector('#chart--timeSeries')
    if (timeSeriesElement !== null) {
      timeSeriesChart = echarts.init(timeSeriesElement as HTMLElement)
    }

    const byAssignedToElement = document.querySelector('#chart--byAssignedTo')
    if (byAssignedToElement !== null) {
      byAssignedToChart = echarts.init(byAssignedToElement as HTMLElement)
    }

    const tagCloudElement = document.querySelector('#chart--tagCloud')
    if (tagCloudElement !== null) {
      tagCloudChart = echarts.init(tagCloudElement as HTMLElement)
    }

    // Initialize Leaflet map
    const mapElement = document.querySelector('#map--hotZones')
    if (mapElement !== null) {
      hotZonesMap = new L.Map('map--hotZones').setView(
        [shiftLog.defaultLatitude, shiftLog.defaultLongitude],
        13
      )

      new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(hotZonesMap)

      hotZonesLayer = new L.LayerGroup().addTo(hotZonesMap)
    }
  }

  // Update KPIs
  function updateKPIs(stats: WorkOrderAccomplishmentStats): void {
    const totalOpened = stats.totalOpen + stats.totalClosed

    document.querySelector('#kpi--totalOpened')!.textContent =
      totalOpened.toString()
    document.querySelector('#kpi--totalClosed')!.textContent =
      stats.totalClosed.toString()
    document.querySelector('#kpi--totalOverdue')!.textContent =
      stats.totalOverdue.toString()
    document.querySelector(
      '#kpi--completionRate'
    )!.textContent = `${stats.percentClosed.toFixed(1)}%`
  }

  // Update time series chart
  function updateTimeSeriesChart(
    timeSeries: WorkOrderTimeSeriesData[]
  ): void {
    if (timeSeriesChart === undefined) {
      return
    }

    const categories = timeSeries.map((item) => item.periodLabel)
    const openData = timeSeries.map((item) => item.openCount)
    const closedData = timeSeries.map((item) => item.closedCount)

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
    })
  }

  // Update by assigned to chart
  function updateByAssignedToChart(
    byAssignedTo: WorkOrderByAssignedTo[]
  ): void {
    if (byAssignedToChart === undefined) {
      return
    }

    const categories = byAssignedTo.map((item) => item.assignedToName)
    const openedData = byAssignedTo.map((item) => item.openedCount)
    const closedData = byAssignedTo.map((item) => item.closedCount)

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
    })
  }

  // Update tag cloud chart
  function updateTagCloudChart(tags: WorkOrderTagStatistic[]): void {
    if (tagCloudChart === undefined) {
      return
    }

    // Use top 20 tags for better visualization
    const topTags = tags.slice(0, 20)
    const tagNames = topTags.map((tag) => tag.tagName)
    const tagCounts = topTags.map((tag) => tag.count)

    tagCloudChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'value',
        minInterval: 1
      },
      yAxis: {
        type: 'category',
        data: tagNames,
        axisLabel: {
          interval: 0,
          overflow: 'truncate',
          width: 120
        }
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: tagCounts,
          itemStyle: {
            color: function (params: { dataIndex: number }): string {
              const colors = [
                '#48c774',
                '#3298dc',
                '#ffdd57',
                '#f14668',
                '#00d1b2',
                '#485fc7',
                '#b86bff',
                '#ff6b9d'
              ]
              return colors[params.dataIndex % colors.length]
            }
          }
        }
      ]
    })
  }

  // Update hot zones map
  function updateHotZonesMap(hotZones: WorkOrderHotZone[]): void {
    if (hotZonesMap === undefined || hotZonesLayer === undefined) {
      return
    }

    // Clear existing markers
    hotZonesLayer.clearLayers()

    if (hotZones.length === 0) {
      return
    }

    const bounds: L.LatLngTuple[] = []

    // Custom icons based on intensity
    const getMarkerIcon = (count: number): L.DivIcon => {
      const maxCount = Math.max(...hotZones.map((hz) => hz.count))
      const intensity = count / maxCount

      let color = '#48c774' // Green for low
      if (intensity > 0.66) {
        color = '#f14668' // Red for high
      } else if (intensity > 0.33) {
        color = '#ffdd57' // Yellow for medium
      }

      return new L.DivIcon({
        html: `<div style="background-color: ${color}; width: ${20 + count * 5}px; height: ${20 + count * 5}px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; font-size: 12px;">${count}</div>`,
        className: '',
        iconSize: [20 + count * 5, 20 + count * 5],
        iconAnchor: [(20 + count * 5) / 2, (20 + count * 5) / 2]
      })
    }

    for (const hotZone of hotZones) {
      const lat = hotZone.latitude
      const lng = hotZone.longitude

      const marker = new L.Marker([lat, lng], {
        icon: getMarkerIcon(hotZone.count)
      })

      const popupContent = `
        <div>
          <strong>${hotZone.count} ${cityssm.escapeHTML(hotZone.count === 1 ? shiftLog.workOrdersSectionNameSingular : shiftLog.workOrdersSectionName)}</strong><br/>
          Open: ${hotZone.openCount}<br/>
          Closed: ${hotZone.closedCount}
        </div>
      `

      marker.bindPopup(popupContent)
      hotZonesLayer.addLayer(marker)
      bounds.push([lat, lng])
    }

    // Fit map to bounds
    if (bounds.length > 0) {
      hotZonesMap.fitBounds(bounds)
    }
  }

  // Load data
  function loadData(): void {
    loadingContainer.style.display = 'block'
    dashboardContainer.style.display = 'none'

    const filterType = filterTypeElement.value as 'month' | 'year'
    const year = yearElement.value
    const month = monthElement.value

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetWorkOrderAccomplishmentData`,
      {
        filterType,
        year,
        month: filterType === 'month' ? month : undefined
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          data?: WorkOrderAccomplishmentData
          errorMessage?: string
        }

        if (responseJSON.success && responseJSON.data !== undefined) {
          const data = responseJSON.data

          // Update KPIs
          updateKPIs(data.stats)

          // Update charts
          updateTimeSeriesChart(data.timeSeries)
          updateByAssignedToChart(data.byAssignedTo)
          updateTagCloudChart(data.tags)
          updateHotZonesMap(data.hotZones)

          loadingContainer.style.display = 'none'
          dashboardContainer.style.display = 'block'
        } else {
          bulmaJS.alert({
            title: 'Error',
            message:
              responseJSON.errorMessage ?? 'Failed to load accomplishment data',
            contextualColorName: 'danger'
          })
          loadingContainer.style.display = 'none'
        }
      }
    )
  }

  // Event listeners
  refreshButton.addEventListener('click', loadData)

  // Initialize
  initializeCharts()
  toggleMonthFilter()
  loadData()
})()
