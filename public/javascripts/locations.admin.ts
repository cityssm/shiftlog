import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Location } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal

  locations: Location[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const locationsContainerElement = document.querySelector(
    '#container--locations'
  )

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

      message: `Are you sure you want to delete location "${location?.locationName ?? ''}"? This action cannot be undone.`,
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
                  renderLocations(responseJSON.locations)
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
              renderLocations(responseJSON.locations)
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
        ;(modalElement.querySelector('#editLocation--locationId') as HTMLInputElement).value =
          location.locationId.toString()

        ;(modalElement.querySelector('#editLocation--locationName') as HTMLInputElement).value =
          location.locationName

        ;(modalElement.querySelector('#editLocation--address1') as HTMLInputElement).value =
          location.address1

        ;(modalElement.querySelector('#editLocation--address2') as HTMLInputElement).value =
          location.address2

        ;(modalElement.querySelector('#editLocation--cityProvince') as HTMLInputElement).value =
          location.cityProvince

        ;(modalElement.querySelector('#editLocation--latitude') as HTMLInputElement).value =
          location.latitude?.toString() ?? ''

        ;(modalElement.querySelector('#editLocation--longitude') as HTMLInputElement).value =
          location.longitude?.toString() ?? ''
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateLocation)
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
      <td>${cityssm.escapeHTML(location.locationName)}</td>
      <td>${cityssm.escapeHTML(location.address1)}</td>
      <td>${cityssm.escapeHTML(location.address2)}</td>
      <td>${cityssm.escapeHTML(location.cityProvince)}</td>
      <td class="has-text-centered">
        ${location.latitude !== null && location.longitude !== null ? '<i class="fa-solid fa-check"></i>' : '-'}
      </td>
      <td class="has-text-centered">
        <div class="buttons is-justify-content-center">
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
            Delete
          </button>
        </div>
      </td>
    `
    return rowElement
  }

  function renderLocations(locations: Location[]): void {
    if (locations.length === 0) {
      locationsContainerElement.innerHTML = '<p>No locations found.</p>'
      return
    }
    const tableElement = document.createElement('table')
    tableElement.className =
      'table is-fullwidth is-striped is-hoverable has-sticky-header'
    tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>Location Name</th>
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
                renderLocations(responseJSON.locations)
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

          ;(modalElement.querySelector('#addLocation--locationName') as HTMLInputElement).focus()
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })
  renderLocations(exports.locations)
  /*
   * Filter locations
   */
  const filterInput = document.querySelector('#filter--locations') as HTMLInputElement | null

  if (filterInput !== null) {
    filterInput.addEventListener('input', () => {
      const filterText = filterInput.value.toLowerCase()

      if (filterText === '') {
        renderLocations(exports.locations)
      } else {
        const filteredLocations = exports.locations.filter((location) => {
          const searchText =
            `${location.locationName} ${location.address1} ${location.address2} ${location.cityProvince}`.toLowerCase()
          return searchText.includes(filterText)
        })

        renderLocations(filteredLocations)
      }
    })
  }
})()
