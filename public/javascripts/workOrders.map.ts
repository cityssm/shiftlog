import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type Leaflet from 'leaflet'

import type { DoSearchWorkOrdersResponse } from '../../handlers/workOrders-post/doSearchWorkOrders.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const L: typeof Leaflet

declare const exports: {
  shiftLog: ShiftLogGlobal
}

const defaultZoom = 13

// Leaflet icon dimensions
const iconSize: [number, number] = [25, 41]
const iconAnchor: [number, number] = [12, 41]
const popupAnchor: [number, number] = [1, -34]
const shadowSize: [number, number] = [41, 41]

interface WorkOrderWithOverdue {
  workOrder: DoSearchWorkOrdersResponse['workOrders'][0]
  isOverdue: boolean
}

;(() => {
  const shiftLog = exports.shiftLog

  const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}`

  const workOrderTypeSelect = document.querySelector(
    '#workOrderMap--workOrderTypeId'
  ) as HTMLSelectElement

  const assignedToSelect = document.querySelector(
    '#workOrderMap--assignedToDataListItemId'
  ) as HTMLSelectElement

  const workOrderCountElement = document.querySelector(
    '#container--workOrderCount'
  ) as HTMLElement

  // Initialize map
  const map = new L.Map('map--workOrders').setView(
    [shiftLog.defaultLatitude, shiftLog.defaultLongitude],
    defaultZoom
  )

  new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  // Layer group to hold markers
  const markersLayer = new L.LayerGroup().addTo(map)

  // Custom icon for open work orders
  const openIcon = new L.Icon({
    iconAnchor,
    iconSize,
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    popupAnchor,
    shadowSize,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  // Custom icon for overdue work orders
  const overdueIcon = new L.Icon({
    iconAnchor,
    iconSize,
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    popupAnchor,
    shadowSize,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  // Custom icon for multiple work orders (orange)
  const multipleIcon = new L.Icon({
    iconAnchor,
    iconSize,
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    popupAnchor,
    shadowSize,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  function buildWorkOrderPopupContent(
    workOrder: DoSearchWorkOrdersResponse['workOrders'][0],
    isOverdue: boolean
  ): HTMLDivElement {
    const workOrderDiv = document.createElement('div')

    const titleLink = document.createElement('a')
    titleLink.href = shiftLog.buildWorkOrderURL(workOrder.workOrderId)
    titleLink.textContent = workOrder.workOrderNumber
    titleLink.style.fontWeight = 'bold'

    const typeSpan = document.createElement('span')
    typeSpan.textContent = workOrder.workOrderType ?? '(Unknown Type)'
    typeSpan.style.display = 'block'
    typeSpan.style.fontSize = '0.9em'
    typeSpan.style.color = '#666'

    const statusLine = document.createElement('div')
    statusLine.style.marginTop = '0.5em'

    if (isOverdue) {
      const overdueSpan = document.createElement('span')
      overdueSpan.textContent = 'Overdue'
      overdueSpan.style.color = '#cc0f35'
      overdueSpan.style.fontWeight = 'bold'
      statusLine.append(overdueSpan)
    } else {
      const openSpan = document.createElement('span')
      openSpan.textContent = 'Open'
      openSpan.style.color = '#48c774'
      statusLine.append(openSpan)
    }

    if (
      workOrder.workOrderDueDateTime !== null &&
      workOrder.workOrderDueDateTime !== undefined
    ) {
      const dueDateSpan = document.createElement('span')
      dueDateSpan.textContent = ` - Due: ${cityssm.dateToString(new Date(workOrder.workOrderDueDateTime as string))}`
      dueDateSpan.style.fontSize = '0.9em'
      statusLine.append(dueDateSpan)
    }

    const addressLine = document.createElement('div')
    addressLine.style.marginTop = '0.5em'
    addressLine.textContent =
      workOrder.locationAddress1 === '' ? '(No Address)' : workOrder.locationAddress1
    if (workOrder.locationAddress2 !== '') {
      addressLine.textContent += ', ' + workOrder.locationAddress2
    }

    const assignedLine = document.createElement('div')
    assignedLine.style.marginTop = '0.5em'
    assignedLine.style.fontSize = '0.9em'
    assignedLine.textContent = `Assigned to: ${workOrder.assignedToDataListItem ?? '(Not Assigned)'}`

    workOrderDiv.append(titleLink, typeSpan, statusLine, addressLine, assignedLine)

    return workOrderDiv
  }

  function addMarkerToMap(
    workOrders: WorkOrderWithOverdue[],
    bounds: L.LatLngTuple[]
  ): void {
    const firstWorkOrder = workOrders[0].workOrder
    const lat = firstWorkOrder.locationLatitude as number
    const lng = firstWorkOrder.locationLongitude as number

    // Determine the icon based on work order count and overdue status
    let icon: L.Icon
    if (workOrders.length > 1) {
      // Multiple work orders at this location - use orange icon
      icon = multipleIcon
    } else if (workOrders[0].isOverdue) {
      icon = overdueIcon
    } else {
      icon = openIcon
    }

    const marker = new L.Marker([lat, lng], { icon })

    // Build popup content
    const popupContent = document.createElement('div')
    popupContent.style.minWidth = '200px'
    popupContent.style.maxHeight = '300px'
    popupContent.style.overflowY = 'auto'

    if (workOrders.length > 1) {
      // Add header for multiple work orders
      const headerDiv = document.createElement('div')
      headerDiv.style.marginBottom = '0.5em'
      headerDiv.style.paddingBottom = '0.5em'
      headerDiv.style.borderBottom = '1px solid #ccc'
      headerDiv.style.fontWeight = 'bold'
      headerDiv.textContent = `${workOrders.length} Work Orders at this Location`
      popupContent.append(headerDiv)
    }

    // Add each work order to the popup
    workOrders.forEach((item, index) => {
      const workOrderDiv = buildWorkOrderPopupContent(item.workOrder, item.isOverdue)

      if (workOrders.length > 1 && index < workOrders.length - 1) {
        // Add separator between work orders
        workOrderDiv.style.paddingBottom = '0.5em'
        workOrderDiv.style.marginBottom = '0.5em'
        workOrderDiv.style.borderBottom = '1px solid #eee'
      }

      popupContent.append(workOrderDiv)
    })

    marker.bindPopup(popupContent)

    markersLayer.addLayer(marker)
    bounds.push([lat, lng])
  }

  function loadWorkOrders(): void {
    workOrderCountElement.textContent = 'Loading...'

    const filters: Record<string, string> = {
      limit: '-1',
      offset: '0',
      openClosedFilter: 'open'
    }

    const workOrderTypeId = workOrderTypeSelect.value
    if (workOrderTypeId !== '') {
      filters.workOrderTypeId = workOrderTypeId
    }

    const assignedToDataListItemId = assignedToSelect.value
    if (assignedToDataListItemId !== '') {
      filters.assignedToDataListItemId = assignedToDataListItemId
    }

    cityssm.postJSON(
      `${urlPrefix}/doSearchWorkOrders`,
      filters,
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as unknown as DoSearchWorkOrdersResponse

        // Clear existing markers
        markersLayer.clearLayers()

        const bounds: L.LatLngTuple[] = []
        let displayedCount = 0
        let overdueCount = 0

        const now = new Date()

        // Group work orders by their coordinates
        const workOrdersByLocation = new Map<string, WorkOrderWithOverdue[]>()

        for (const workOrder of responseJSON.workOrders) {
          // Skip work orders without coordinates
          if (
            workOrder.locationLatitude === null ||
            workOrder.locationLatitude === undefined ||
            workOrder.locationLongitude === null ||
            workOrder.locationLongitude === undefined
          ) {
            continue
          }

          displayedCount += 1

          // Check if overdue
          let isOverdue = false
          if (workOrder.workOrderDueDateTime !== null && workOrder.workOrderDueDateTime !== undefined) {
            const dueDate = new Date(workOrder.workOrderDueDateTime as string)
            isOverdue = dueDate < now
          }

          if (isOverdue) {
            overdueCount += 1
          }

          // Create a location key from lat/lng
          const locationKey = `${workOrder.locationLatitude},${workOrder.locationLongitude}`

          if (!workOrdersByLocation.has(locationKey)) {
            workOrdersByLocation.set(locationKey, [])
          }
          workOrdersByLocation.get(locationKey)!.push({ workOrder, isOverdue })
        }

        // Add markers for each location (grouped work orders)
        for (const workOrders of workOrdersByLocation.values()) {
          addMarkerToMap(workOrders, bounds)
        }

        // Update count display
        if (displayedCount === 0) {
          workOrderCountElement.textContent =
            'No open work orders with location data found.'
        } else {
          workOrderCountElement.textContent = `Showing ${displayedCount} open work order${displayedCount === 1 ? '' : 's'} with location data`
          if (overdueCount > 0) {
            workOrderCountElement.textContent += ` (${overdueCount} overdue)`
          }
        }

        // Fit map to bounds if there are markers
        if (bounds.length > 0) {
          map.fitBounds(bounds)
        }
      }
    )
  }

  // Event listeners for filters
  workOrderTypeSelect.addEventListener('change', loadWorkOrders)
  assignedToSelect.addEventListener('change', loadWorkOrders)

  // Initial load
  loadWorkOrders()
})()
