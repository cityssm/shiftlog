import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type Leaflet from 'leaflet'

import type { Location } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const L: typeof Leaflet

declare const exports: {
  shiftLog: ShiftLogGlobal

  locations: Location[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const locationsContainerElement = document.querySelector(
    '#container--locations'
  ) as HTMLDivElement

  // Default map coordinates (Sault Ste. Marie)
  const DEFAULT_MAP_ZOOM = 13
  const DETAIL_MAP_ZOOM = 15

  // Pagination settings
  const ITEMS_PER_PAGE = 10
  let currentPage = 1
  let currentFilteredLocations: Location[] = exports.locations

  function pageSelect(pageNumber: number): void {
    currentPage = pageNumber
    renderLocationsWithPagination(currentFilteredLocations)
  }

  /**
   * Initialize a Leaflet map picker for location coordinate selection
   */
  function initializeLocationMapPicker(
    mapElementId: string,
    latitudeInput: HTMLInputElement,
    longitudeInput: HTMLInputElement
  ): void {
    // Use existing coordinates or default to SSM
    let defaultLat = shiftLog.defaultLatitude
    let defaultLng = shiftLog.defaultLongitude
    let defaultZoom = DEFAULT_MAP_ZOOM

    if (latitudeInput.value !== '' && longitudeInput.value !== '') {
      defaultLat = Number.parseFloat(latitudeInput.value)
      defaultLng = Number.parseFloat(longitudeInput.value)
      defaultZoom = DETAIL_MAP_ZOOM
    }

    const map = new L.Map(mapElementId).setView(
      [defaultLat, defaultLng],
      defaultZoom
    )

    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // eslint-disable-next-line unicorn/no-null
    let marker: L.Marker | null = null

    // Add existing marker if coordinates are set
    if (latitudeInput.value !== '' && longitudeInput.value !== '') {
      marker = new L.Marker([defaultLat, defaultLng]).addTo(map)
    }

    // Handle map click to set coordinates
    map.on('click', (event: { latlng: { lat: number; lng: number } }) => {
      const lat = event.latlng.lat
      const lng = event.latlng.lng

      latitudeInput.value = lat.toFixed(7)
      longitudeInput.value = lng.toFixed(7)

      if (marker !== null) {
        map.removeLayer(marker)
      }

      marker = new L.Marker([lat, lng]).addTo(map)
    })

    // Update map when coordinates are manually entered
    function updateMapFromInputs(): void {
      const lat = Number.parseFloat(latitudeInput.value)
      const lng = Number.parseFloat(longitudeInput.value)

      if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        if (marker !== null) {
          map.removeLayer(marker)
        }

        marker = new L.Marker([lat, lng]).addTo(map)
        map.setView([lat, lng], DETAIL_MAP_ZOOM)
      }
    }

    latitudeInput.addEventListener('change', updateMapFromInputs)
    longitudeInput.addEventListener('change', updateMapFromInputs)
  }

  function deleteLocation(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const locationId = buttonElement.dataset.locationId
    if (locationId === undefined) {
      return
    }

    const location = exports.locations.find(
      (possibleLocation) => possibleLocation.locationId === Number(locationId)
    )

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Location',

      message: `Are you sure you want to delete location "${location?.address1 ?? ''}"? This action cannot be undone.`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete Location',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteLocation`,
            {
              locationId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                message?: string
                locations?: Location[]
              }

              if (responseJSON.success) {
                if (responseJSON.locations !== undefined) {
                  exports.locations = responseJSON.locations
                  currentFilteredLocations = responseJSON.locations
                  currentPage = 1
                  renderLocationsWithPagination(responseJSON.locations)
                }
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Location Deleted',

                  message: 'Location has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Location',

                  message: responseJSON.message ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function editLocation(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const locationId = buttonElement.dataset.locationId
    if (locationId === undefined) {
      return
    }
    const location = exports.locations.find(
      (possibleLocation) => possibleLocation.locationId === Number(locationId)
    )

    if (location === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateLocation(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateLocation`,
        editForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            message?: string
            locations?: Location[]
          }

          if (responseJSON.success) {
            closeModalFunction()
            if (responseJSON.locations !== undefined) {
              exports.locations = responseJSON.locations
              currentFilteredLocations = responseJSON.locations
              currentPage = 1
              renderLocationsWithPagination(responseJSON.locations)
            }
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Location Updated',

              message: 'Location has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Location',

              message: responseJSON.message ?? 'Please try again.'
            })
          }
        }
      )
    }
    cityssm.openHtmlModal('adminLocations-edit', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#editLocation--locationId'
          ) as HTMLInputElement
        ).value = location.locationId.toString()
        ;(
          modalElement.querySelector(
            '#editLocation--address1'
          ) as HTMLInputElement
        ).value = location.address1
        ;(
          modalElement.querySelector(
            '#editLocation--address2'
          ) as HTMLInputElement
        ).value = location.address2
        ;(
          modalElement.querySelector(
            '#editLocation--cityProvince'
          ) as HTMLInputElement
        ).value = location.cityProvince
        ;(
          modalElement.querySelector(
            '#editLocation--latitude'
          ) as HTMLInputElement
        ).value = location.latitude?.toString() ?? ''
        ;(
          modalElement.querySelector(
            '#editLocation--longitude'
          ) as HTMLInputElement
        ).value = location.longitude?.toString() ?? ''
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateLocation)

        // Initialize map picker
        const mapPickerElement = modalElement.querySelector(
          '#map--editLocationPicker'
        ) as HTMLElement | null

        if (mapPickerElement !== null) {
          initializeLocationMapPicker(
            'map--editLocationPicker',
            modalElement.querySelector(
              '#editLocation--latitude'
            ) as HTMLInputElement,
            modalElement.querySelector(
              '#editLocation--longitude'
            ) as HTMLInputElement
          )
        }
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }
  function buildLocationRowElement(location: Location): HTMLTableRowElement {
    const rowElement = document.createElement('tr')

    rowElement.dataset.locationId = location.locationId.toString()
    // eslint-disable-next-line no-unsanitized/property
    rowElement.innerHTML = /* html */ `
      <td class="has-text-centered has-width-1">
        ${
          location.recordSync_isSynced
            ? /* html */ `
              <span class="is-size-7 has-text-grey" title="Synchronized">
                <i class="fa-solid fa-arrows-rotate"></i>
              </span>
            `
            : ''
        }
      </td>
      <td>${cityssm.escapeHTML(location.address1)}</td>
      <td>${cityssm.escapeHTML(location.address2)}</td>
      <td>${cityssm.escapeHTML(location.cityProvince)}</td>
      <td class="has-text-centered">
        ${location.latitude !== null && location.longitude !== null ? '<i class="fa-solid fa-check"></i>' : '-'}
      </td>
      <td class="has-text-right">
        <div class="buttons is-right">
          <button
            class="button is-small is-info edit-location"
            data-location-id="${location.locationId}"
            title="Edit Location"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-pencil"></i>
            </span>
            <span>Edit</span>
          </button>
          <button
            class="button is-small is-danger delete-location"
            data-location-id="${location.locationId}"
            title="Delete Location"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-trash"></i>
            </span>
            <span>Delete</span>
          </button>
        </div>
      </td>
    `
    return rowElement
  }

  function renderLocations(locations: Location[]): void {
    if (locations.length === 0) {
      locationsContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <div class="message-body">
            No locations available.
          </div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className =
      'table is-fullwidth is-striped is-hoverable has-sticky-header'

    tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>
            <span class="is-sr-only">Sync Status</span>
          </th>
          <th>Address Line 1</th>
          <th>Address Line 2</th>
          <th>City/Province</th>
          <th class="has-text-centered">Coordinates</th>
          <th class="has-text-centered">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const location of locations) {
      const rowElement = buildLocationRowElement(location)
      tableElement.querySelector('tbody')?.append(rowElement)
    }

    // Add event listeners for edit buttons
    for (const button of tableElement.querySelectorAll('.edit-location')) {
      button.addEventListener('click', editLocation)
    }

    // Add event listeners for delete buttons
    for (const button of tableElement.querySelectorAll('.delete-location')) {
      button.addEventListener('click', deleteLocation)
    }

    locationsContainerElement.replaceChildren(tableElement)
  }

  /**
   * Render locations with pagination
   */
  function renderLocationsWithPagination(locations: Location[]): void {
    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    const paginatedLocations = locations.slice(startIndex, endIndex)

    // Render table
    renderLocations(paginatedLocations)

    // Add pagination controls if needed
    if (locations.length > ITEMS_PER_PAGE) {
      const paginationControls = shiftLog.buildPaginationControls({
        totalCount: locations.length,
        currentPageOrOffset: currentPage,
        itemsPerPageOrLimit: ITEMS_PER_PAGE,
        clickHandler: pageSelect
      })

      locationsContainerElement.append(paginationControls)
    }
  }

  document
    .querySelector('#button--addLocation')
    ?.addEventListener('click', () => {
      let closeModalFunction: () => void

      function doAddLocation(submitEvent: Event): void {
        submitEvent.preventDefault()

        const addForm = submitEvent.currentTarget as HTMLFormElement
        cityssm.postJSON(
          `${shiftLog.urlPrefix}/admin/doAddLocation`,
          addForm,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              message?: string
              locations?: Location[]
            }

            if (responseJSON.success) {
              closeModalFunction()

              addForm.reset()

              if (responseJSON.locations !== undefined) {
                exports.locations = responseJSON.locations
                currentFilteredLocations = responseJSON.locations
                currentPage = 1
                renderLocationsWithPagination(responseJSON.locations)
              }
              bulmaJS.alert({
                contextualColorName: 'success',
                title: 'Location Added',

                message: 'Location has been successfully added.'
              })
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Adding Location',

                message: responseJSON.message ?? 'Please try again.'
              })
            }
          }
        )
      }
      cityssm.openHtmlModal('adminLocations-add', {
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddLocation)
          ;(
            modalElement.querySelector(
              '#addLocation--address1'
            ) as HTMLInputElement
          ).focus()

          // Initialize map picker
          const mapPickerElement = modalElement.querySelector(
            '#map--addLocationPicker'
          ) as HTMLElement | null

          if (mapPickerElement !== null) {
            initializeLocationMapPicker(
              'map--addLocationPicker',
              modalElement.querySelector(
                '#addLocation--latitude'
              ) as HTMLInputElement,
              modalElement.querySelector(
                '#addLocation--longitude'
              ) as HTMLInputElement
            )
          }
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })
  renderLocationsWithPagination(exports.locations)
  /*
   * Filter locations with debouncing
   */
  const filterInput = document.querySelector(
    '#filter--locations'
  ) as HTMLInputElement | null
  // eslint-disable-next-line unicorn/no-null
  let filterTimeout: ReturnType<typeof setTimeout> | null = null

  if (filterInput !== null) {
    filterInput.addEventListener('input', () => {
      // Clear existing timeout
      if (filterTimeout !== null) {
        clearTimeout(filterTimeout)
      }

      // Set new timeout (debounce for 300ms)
      filterTimeout = setTimeout(() => {
        const filterText = filterInput.value.toLowerCase()

        if (filterText === '') {
          currentFilteredLocations = exports.locations
          currentPage = 1
          renderLocationsWithPagination(exports.locations)
        } else {
          const filteredLocations = exports.locations.filter((location) => {
            const searchText =
              `${location.address1} ${location.address2} ${location.cityProvince}`.toLowerCase()
            return searchText.includes(filterText)
          })

          currentFilteredLocations = filteredLocations
          currentPage = 1
          renderLocationsWithPagination(filteredLocations)
        }
      }, 300)
    })
  }
})()
