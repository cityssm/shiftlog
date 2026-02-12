/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type FlatPickr from 'flatpickr'
import type Leaflet from 'leaflet'

import type { DoAddShiftAdhocTaskResponse } from '../../handlers/shifts-post/doAddShiftAdhocTask.js'
import type { DoCreateAdhocTaskResponse } from '../../handlers/shifts-post/doCreateAdhocTask.js'
import type { DoDeleteShiftAdhocTaskResponse } from '../../handlers/shifts-post/doDeleteShiftAdhocTask.js'
import type { DoGetAdhocTaskTypesResponse } from '../../handlers/shifts-post/doGetAdhocTaskTypes.js'
import type { DoGetAvailableAdhocTasksResponse } from '../../handlers/shifts-post/doGetAvailableAdhocTasks.js'
import type { DoUpdateAdhocTaskResponse } from '../../handlers/shifts-post/doUpdateAdhocTask.js'
import type { DoUpdateShiftAdhocTaskNoteResponse } from '../../handlers/shifts-post/doUpdateShiftAdhocTaskNote.js'
import type { AdhocTask } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const flatpickr: typeof FlatPickr
declare const L: typeof Leaflet

declare const exports: {
  shiftLog: ShiftLogGlobal

  shiftAdhocTasks: AdhocTask[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`

  const shiftIdElement = document.querySelector(
    '#shift--shiftId'
  ) as HTMLInputElement
  const shiftId = shiftIdElement.value

  const isEdit = document.querySelector('#button--createAdhocTask') !== null

  let shiftAdhocTasks = exports.shiftAdhocTasks
  let adhocTaskTypes: Array<{ dataListItem: string; dataListItemId: number }> =
    []

  // Load task types
  function loadAdhocTaskTypes(): void {
    cityssm.postJSON(
      `${urlPrefix}/doGetAdhocTaskTypes`,
      {},
      (responseJSON: DoGetAdhocTaskTypesResponse) => {
        adhocTaskTypes = responseJSON.adhocTaskTypes
      }
    )
  }

  function populateTaskTypeDropdown(
    selectElement: HTMLSelectElement,
    selectedId?: number
  ): void {
    // Clear existing options except the first one
    while (selectElement.options.length > 1) {
      selectElement.remove(1)
    }

    for (const taskType of adhocTaskTypes) {
      const option = document.createElement('option')
      option.value = taskType.dataListItemId.toString()
      option.textContent = taskType.dataListItem
      if (selectedId !== undefined && taskType.dataListItemId === selectedId) {
        option.selected = true
      }
      selectElement.append(option)
    }
  }

  function initializeMap(
    mapElementId: string,
    latitudeInput: HTMLInputElement,
    longitudeInput: HTMLInputElement,
    existingLat?: number | null,
    existingLng?: number | null
  ): void {
    let defaultLat = shiftLog.defaultLatitude
    let defaultLng = shiftLog.defaultLongitude
    let defaultZoom = 13

    if (
      existingLat !== null &&
      existingLat !== undefined &&
      existingLng !== null &&
      existingLng !== undefined
    ) {
      defaultLat = existingLat
      defaultLng = existingLng
      defaultZoom = 15
    }

    const map = new L.Map(mapElementId).setView(
      [defaultLat, defaultLng],
      defaultZoom
    )

    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    let marker: L.Marker | null = null

    if (
      existingLat !== null &&
      existingLat !== undefined &&
      existingLng !== null &&
      existingLng !== undefined
    ) {
      marker = new L.Marker([defaultLat, defaultLng]).addTo(map)
    }

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
        map.setView([lat, lng], 15)
      }
    }

    latitudeInput.addEventListener('change', updateMapFromInputs)
    longitudeInput.addEventListener('change', updateMapFromInputs)
  }

  function updateCount(): void {
    const adhocTasksCountElement = document.querySelector('#adhocTasksCount')
    if (adhocTasksCountElement !== null) {
      adhocTasksCountElement.textContent = shiftAdhocTasks.length.toString()
    }

    // Show/hide tasks icon indicator
    const hasTasksIconElement = document.querySelector('#icon--hasTasks')
    if (hasTasksIconElement !== null) {
      const hasAnyTasks =
        shiftAdhocTasks.length > 0 ||
        (document.querySelector('#workOrdersCount')?.textContent ?? '0') !== '0'
      hasTasksIconElement.classList.toggle('is-hidden', !hasAnyTasks)
    }
  }

  function renderShiftAdhocTasks(): void {
    const containerElement = document.querySelector(
      '#container--shiftAdhocTasks'
    ) as HTMLElement

    if (shiftAdhocTasks.length === 0) {
      containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">
            No ad hoc tasks assigned to this shift.
          </div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Type</th>
          <th>Description</th>
          <th>Location</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tbodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const task of shiftAdhocTasks) {
      const trElement = document.createElement('tr')

      const isComplete =
        task.taskCompleteDateTime !== null &&
        task.taskCompleteDateTime !== undefined

      let locationString = ''
      if (task.locationAddress1) {
        locationString = cityssm.escapeHTML(task.locationAddress1)
        if (task.locationAddress2) {
          locationString += `<br />${cityssm.escapeHTML(task.locationAddress2)}`
        }
      }

      if (task.fromLocationAddress1 || task.toLocationAddress1) {
        locationString += '<br /><small>'

        if (task.fromLocationAddress1) {
          locationString += `From: ${cityssm.escapeHTML(task.fromLocationAddress1)}`
        }

        if (task.toLocationAddress1) {
          if (task.fromLocationAddress1) locationString += '<br />'
          locationString += `To: ${cityssm.escapeHTML(task.toLocationAddress1)}`
        }

        locationString += '</small>'
      }

      const dueDateString =
        task.taskDueDateTime !== null && task.taskDueDateTime !== undefined
          ? cityssm.dateToString(new Date(task.taskDueDateTime))
          : ''

      const statusHtml = isComplete
        ? '<span class="tag is-success">Complete</span>'
        : dueDateString &&
            new Date(task.taskDueDateTime ?? '').getTime() < Date.now()
          ? '<span class="tag is-danger">Overdue</span>'
          : '<span class="tag is-warning">Pending</span>'

      // eslint-disable-next-line no-unsanitized/property
      trElement.innerHTML = /* html */ `
        <td>
          ${cityssm.escapeHTML(task.adhocTaskTypeDataListItem ?? '')}
        </td>
        <td>${cityssm.escapeHTML(task.taskDescription)}</td>
        <td>${locationString}</td>
        <td>${dueDateString}</td>
        <td>${statusHtml}</td>
        <td>${cityssm.escapeHTML(task.shiftAdhocTaskNote ?? '')}</td>
        ${
          isEdit
            ? /* html */ `
              <td class="has-text-right">
                <div class="buttons is-right">
                  ${
                    isComplete
                      ? ''
                      : /* html */ `
                        <button
                          class="button is-small is-info button--edit"
                          data-adhoc-task-id="${task.adhocTaskId}"
                          type="button"
                          aria-label="Edit Task"
                        >
                          <span class="icon is-small">
                            <i class="fa-solid fa-pencil"></i>
                          </span>
                        </button>
                      `
                  }
                  <button
                    class="button is-small is-info button--editNote"
                    data-adhoc-task-id="${task.adhocTaskId}"
                    type="button"
                    aria-label="Edit Note"
                  >
                    <span class="icon is-small">
                      <i class="fa-solid fa-comment"></i>
                    </span>
                  </button>
                  <button
                    class="button is-small is-danger is-light button--remove"
                    data-adhoc-task-id="${task.adhocTaskId}"
                    type="button"
                    aria-label="Remove"
                  >
                    <span class="icon is-small">
                      <i class="fa-solid fa-trash"></i>
                    </span>
                  </button>
                </div>
              </td>
            `
            : ''
        }
      `

      tbodyElement.append(trElement)
    }

    containerElement.replaceChildren(tableElement)

    if (isEdit) {
      const editButtons = containerElement.querySelectorAll('.button--edit')
      for (const button of editButtons) {
        button.addEventListener('click', editAdhocTask)
      }

      const editNoteButtons =
        containerElement.querySelectorAll('.button--editNote')
      for (const button of editNoteButtons) {
        button.addEventListener('click', editAdhocTaskNote)
      }

      const removeButtons = containerElement.querySelectorAll('.button--remove')
      for (const button of removeButtons) {
        button.addEventListener('click', removeAdhocTask)
      }
    }
  }

  function createAdhocTask(clickEvent: Event): void {
    clickEvent.preventDefault()

    let closeModalFunction: () => void
    let modalElement: HTMLElement

    if (adhocTaskTypes.length === 0) {
      bulmaJS.alert({
        contextualColorName: 'warning',
        title: 'No Task Types Available',
        message: 'Please create ad hoc task types before creating tasks.'
      })

      return
    }

    function doCreate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doCreateAdhocTask`,
        formEvent.currentTarget,
        (responseJSON: DoCreateAdhocTaskResponse) => {
          if (responseJSON.success) {
            shiftAdhocTasks = responseJSON.shiftAdhocTasks
            renderShiftAdhocTasks()
            updateCount()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Creating Task',

              message: responseJSON.errorMessage
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('shifts-createAdhocTask', {
      onshow(modalElementParameter) {
        modalElement = modalElementParameter
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId

        // Populate task types
        const taskTypeSelect = modalElement.querySelector(
          '#createAdhocTask--adhocTaskTypeDataListItemId'
        ) as HTMLSelectElement
        populateTaskTypeDropdown(taskTypeSelect)

        // Set default city/province
        const defaultCityProvince = shiftLog.defaultCityProvince ?? ''
        ;(
          modalElement.querySelector(
            '#createAdhocTask--locationCityProvince'
          ) as HTMLInputElement
        ).value = defaultCityProvince
        ;(
          modalElement.querySelector(
            '#createAdhocTask--fromLocationCityProvince'
          ) as HTMLInputElement
        ).value = defaultCityProvince
        ;(
          modalElement.querySelector(
            '#createAdhocTask--toLocationCityProvince'
          ) as HTMLInputElement
        ).value = defaultCityProvince
      },
      onshown(modalElementParameter, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction
        modalElement = modalElementParameter

        const formElement = modalElement.querySelector(
          'form'
        ) as HTMLFormElement
        formElement.addEventListener('submit', doCreate)

        // Initialize date picker
        const dueDateInput = modalElement.querySelector(
          '#createAdhocTask--taskDueDateTimeString'
        ) as HTMLInputElement

        flatpickr(dueDateInput, {
          allowInput: true,
          enableTime: true,
          minuteIncrement: 15,
          nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
          prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
        })

        // Initialize maps for all three locations
        initializeMap(
          'map--createAdhocTask--location',
          modalElement.querySelector(
            '#createAdhocTask--locationLatitude'
          ) as HTMLInputElement,
          modalElement.querySelector(
            '#createAdhocTask--locationLongitude'
          ) as HTMLInputElement
        )

        initializeMap(
          'map--createAdhocTask--fromLocation',
          modalElement.querySelector(
            '#createAdhocTask--fromLocationLatitude'
          ) as HTMLInputElement,
          modalElement.querySelector(
            '#createAdhocTask--fromLocationLongitude'
          ) as HTMLInputElement
        )

        initializeMap(
          'map--createAdhocTask--toLocation',
          modalElement.querySelector(
            '#createAdhocTask--toLocationLatitude'
          ) as HTMLInputElement,
          modalElement.querySelector(
            '#createAdhocTask--toLocationLongitude'
          ) as HTMLInputElement
        )

        // Setup toggle handlers for collapsible location sections
        function setupLocationToggle(
          toggleSelector: string,
          containerSelector: string
        ): void {
          const toggleButton = modalElement.querySelector(
            toggleSelector
          ) as HTMLButtonElement
          const container = modalElement.querySelector(
            containerSelector
          ) as HTMLElement

          toggleButton.addEventListener('click', () => {
            container.classList.toggle('is-hidden')
            const icon = toggleButton.querySelector('i')
            if (icon !== null) {
              if (container.classList.contains('is-hidden')) {
                icon.className = 'fa-solid fa-chevron-right'
              } else {
                icon.className = 'fa-solid fa-chevron-down'
              }
            }
          })
        }

        setupLocationToggle(
          '#toggle--createAdhocTask--fromLocation',
          '#container--createAdhocTask--fromLocation'
        )

        setupLocationToggle(
          '#toggle--createAdhocTask--toLocation',
          '#container--createAdhocTask--toLocation'
        )

        // Focus on task type
        ;(
          modalElement.querySelector(
            '#createAdhocTask--adhocTaskTypeDataListItemId'
          ) as HTMLSelectElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function editAdhocTask(clickEvent: Event): void {
    clickEvent.preventDefault()

    const adhocTaskId = (clickEvent.currentTarget as HTMLButtonElement).dataset
      .adhocTaskId

    const task = shiftAdhocTasks.find(
      (possibleTask) => possibleTask.adhocTaskId.toString() === adhocTaskId
    )

    if (task === undefined) {
      return
    }

    let closeModalFunction: () => void
    let modalElement: HTMLElement

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doUpdateAdhocTask`,
        formEvent.currentTarget,
        (responseJSON: DoUpdateAdhocTaskResponse) => {
          if (responseJSON.success) {
            shiftAdhocTasks = responseJSON.shiftAdhocTasks
            renderShiftAdhocTasks()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Task',

              message: responseJSON.errorMessage
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('shifts-editAdhocTask', {
      onshow(modalElementParameter) {
        modalElement = modalElementParameter
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector(
            'input[name="adhocTaskId"]'
          ) as HTMLInputElement
        ).value = adhocTaskId ?? ''

        // Populate task types
        const taskTypeSelect = modalElement.querySelector(
          'select[name="adhocTaskTypeDataListItemId"]'
        ) as HTMLSelectElement
        populateTaskTypeDropdown(
          taskTypeSelect,
          task.adhocTaskTypeDataListItemId
        )

        // Populate form
        ;(
          modalElement.querySelector(
            'textarea[name="taskDescription"]'
          ) as HTMLTextAreaElement
        ).value = task.taskDescription
        ;(
          modalElement.querySelector(
            'input[name="locationAddress1"]'
          ) as HTMLInputElement
        ).value = task.locationAddress1
        ;(
          modalElement.querySelector(
            'input[name="locationAddress2"]'
          ) as HTMLInputElement
        ).value = task.locationAddress2
        ;(
          modalElement.querySelector(
            'input[name="locationCityProvince"]'
          ) as HTMLInputElement
        ).value = task.locationCityProvince
        ;(
          modalElement.querySelector(
            'input[name="locationLatitude"]'
          ) as HTMLInputElement
        ).value = task.locationLatitude?.toString() ?? ''
        ;(
          modalElement.querySelector(
            'input[name="locationLongitude"]'
          ) as HTMLInputElement
        ).value = task.locationLongitude?.toString() ?? ''
        ;(
          modalElement.querySelector(
            'input[name="fromLocationAddress1"]'
          ) as HTMLInputElement
        ).value = task.fromLocationAddress1
        ;(
          modalElement.querySelector(
            'input[name="fromLocationAddress2"]'
          ) as HTMLInputElement
        ).value = task.fromLocationAddress2
        ;(
          modalElement.querySelector(
            'input[name="fromLocationCityProvince"]'
          ) as HTMLInputElement
        ).value = task.fromLocationCityProvince
        ;(
          modalElement.querySelector(
            'input[name="fromLocationLatitude"]'
          ) as HTMLInputElement
        ).value = task.fromLocationLatitude?.toString() ?? ''
        ;(
          modalElement.querySelector(
            'input[name="fromLocationLongitude"]'
          ) as HTMLInputElement
        ).value = task.fromLocationLongitude?.toString() ?? ''
        ;(
          modalElement.querySelector(
            'input[name="toLocationAddress1"]'
          ) as HTMLInputElement
        ).value = task.toLocationAddress1
        ;(
          modalElement.querySelector(
            'input[name="toLocationAddress2"]'
          ) as HTMLInputElement
        ).value = task.toLocationAddress2
        ;(
          modalElement.querySelector(
            'input[name="toLocationCityProvince"]'
          ) as HTMLInputElement
        ).value = task.toLocationCityProvince
        ;(
          modalElement.querySelector(
            'input[name="toLocationLatitude"]'
          ) as HTMLInputElement
        ).value = task.toLocationLatitude?.toString() ?? ''
        ;(
          modalElement.querySelector(
            'input[name="toLocationLongitude"]'
          ) as HTMLInputElement
        ).value = task.toLocationLongitude?.toString() ?? ''

        const dueDateInput = modalElement.querySelector(
          'input[name="taskDueDateTimeString"]'
        ) as HTMLInputElement

        if (
          task.taskDueDateTime !== null &&
          task.taskDueDateTime !== undefined
        ) {
          dueDateInput.value = cityssm.dateToString(
            new Date(task.taskDueDateTime)
          )
        }
      },
      onshown(modalElementParameter, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction
        modalElement = modalElementParameter

        const formElement = modalElement.querySelector(
          'form'
        ) as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)

        // Initialize date picker
        const dueDateInput = modalElement.querySelector(
          'input[name="taskDueDateTimeString"]'
        ) as HTMLInputElement

        flatpickr(dueDateInput, {
          allowInput: true,
          enableTime: true,
          minuteIncrement: 15,
          nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
          prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
        })

        // Initialize maps for all three locations
        initializeMap(
          'map--editAdhocTask--location',
          modalElement.querySelector(
            'input[name="locationLatitude"]'
          ) as HTMLInputElement,
          modalElement.querySelector(
            'input[name="locationLongitude"]'
          ) as HTMLInputElement,
          task.locationLatitude,
          task.locationLongitude
        )

        initializeMap(
          'map--editAdhocTask--fromLocation',
          modalElement.querySelector(
            'input[name="fromLocationLatitude"]'
          ) as HTMLInputElement,
          modalElement.querySelector(
            'input[name="fromLocationLongitude"]'
          ) as HTMLInputElement,
          task.fromLocationLatitude,
          task.fromLocationLongitude
        )

        initializeMap(
          'map--editAdhocTask--toLocation',
          modalElement.querySelector(
            'input[name="toLocationLatitude"]'
          ) as HTMLInputElement,
          modalElement.querySelector(
            'input[name="toLocationLongitude"]'
          ) as HTMLInputElement,
          task.toLocationLatitude,
          task.toLocationLongitude
        )

        // Setup toggle handlers for collapsible location sections
        function setupEditLocationToggle(
          toggleSelector: string,
          containerSelector: string
        ): void {
          const toggleButton = modalElement.querySelector(
            toggleSelector
          ) as HTMLButtonElement
          const container = modalElement.querySelector(
            containerSelector
          ) as HTMLElement

          toggleButton.addEventListener('click', () => {
            container.classList.toggle('is-hidden')
            const icon = toggleButton.querySelector('i')
            if (icon !== null) {
              if (container.classList.contains('is-hidden')) {
                icon.className = 'fa-solid fa-chevron-right'
              } else {
                icon.className = 'fa-solid fa-chevron-down'
              }
            }
          })
        }

        function hasLocationData(
          address1: string,
          address2: string,
          cityProvince: string,
          latitude: number | null | undefined,
          longitude: number | null | undefined
        ): boolean {
          return (
            address1 !== '' ||
            address2 !== '' ||
            cityProvince !== '' ||
            latitude !== null ||
            longitude !== null
          )
        }

        setupEditLocationToggle(
          '#toggle--editAdhocTask--fromLocation',
          '#container--editAdhocTask--fromLocation'
        )

        setupEditLocationToggle(
          '#toggle--editAdhocTask--toLocation',
          '#container--editAdhocTask--toLocation'
        )

        // Check if from/to locations have values and show sections if they do
        const fromLocationContainer = modalElement.querySelector(
          '#container--editAdhocTask--fromLocation'
        ) as HTMLElement
        const fromLocationToggle = modalElement.querySelector(
          '#toggle--editAdhocTask--fromLocation'
        ) as HTMLButtonElement

        if (
          hasLocationData(
            task.fromLocationAddress1,
            task.fromLocationAddress2,
            task.fromLocationCityProvince,
            task.fromLocationLatitude,
            task.fromLocationLongitude
          )
        ) {
          fromLocationContainer.classList.remove('is-hidden')
          const icon = fromLocationToggle.querySelector('i')
          if (icon !== null) {
            icon.className = 'fa-solid fa-chevron-down'
          }
        }

        const toLocationContainer = modalElement.querySelector(
          '#container--editAdhocTask--toLocation'
        ) as HTMLElement
        const toLocationToggle = modalElement.querySelector(
          '#toggle--editAdhocTask--toLocation'
        ) as HTMLButtonElement

        if (
          hasLocationData(
            task.toLocationAddress1,
            task.toLocationAddress2,
            task.toLocationCityProvince,
            task.toLocationLatitude,
            task.toLocationLongitude
          )
        ) {
          toLocationContainer.classList.remove('is-hidden')
          const icon = toLocationToggle.querySelector('i')
          if (icon !== null) {
            icon.className = 'fa-solid fa-chevron-down'
          }
        }
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function editAdhocTaskNote(clickEvent: Event): void {
    clickEvent.preventDefault()

    const adhocTaskId = (clickEvent.currentTarget as HTMLButtonElement).dataset
      .adhocTaskId

    const task = shiftAdhocTasks.find(
      (possibleTask) => possibleTask.adhocTaskId.toString() === adhocTaskId
    )

    if (task === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      const note = (
        (formEvent.currentTarget as HTMLFormElement).querySelector(
          '[name="shiftAdhocTaskNote"]'
        ) as HTMLTextAreaElement
      ).value

      cityssm.postJSON(
        `${urlPrefix}/doUpdateShiftAdhocTaskNote`,
        formEvent.currentTarget,
        (responseJSON: DoUpdateShiftAdhocTaskNoteResponse) => {
          if (responseJSON.success) {
            ;(task as AdhocTask).shiftAdhocTaskNote = note

            renderShiftAdhocTasks()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Note',

              message: responseJSON.errorMessage
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('shifts-editAdhocTaskNote', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector(
            'input[name="adhocTaskId"]'
          ) as HTMLInputElement
        ).value = adhocTaskId ?? ''
        ;(
          modalElement.querySelector(
            'textarea[name="shiftAdhocTaskNote"]'
          ) as HTMLTextAreaElement
        ).value = task.shiftAdhocTaskNote ?? ''
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        const formElement = modalElement.querySelector(
          'form'
        ) as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)
        ;(
          modalElement.querySelector(
            'textarea[name="shiftAdhocTaskNote"]'
          ) as HTMLTextAreaElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function addExistingAdhocTask(clickEvent: Event): void {
    clickEvent.preventDefault()

    let closeModalFunction: () => void
    let modalElement: HTMLElement

    // Load available tasks
    cityssm.postJSON(
      `${urlPrefix}/doGetAvailableAdhocTasks`,
      { shiftId },
      (responseJSON: DoGetAvailableAdhocTasksResponse) => {
        if (responseJSON.adhocTasks.length === 0) {
          bulmaJS.alert({
            contextualColorName: 'info',
            message: 'No incomplete ad hoc tasks available to add.'
          })
          return
        }

        function selectTask(task: AdhocTask): void {
          let selectedCloseModalFunction: () => void

          function doAdd(formEvent: Event): void {
            formEvent.preventDefault()

            cityssm.postJSON(
              `${urlPrefix}/doAddShiftAdhocTask`,
              formEvent.currentTarget,
              (addResponseJSON: DoAddShiftAdhocTaskResponse) => {
                if (addResponseJSON.success) {
                  shiftAdhocTasks = addResponseJSON.shiftAdhocTasks
                  renderShiftAdhocTasks()
                  updateCount()
                  selectedCloseModalFunction()
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Task',

                    message: addResponseJSON.errorMessage
                  })
                }
              }
            )
          }

          cityssm.openHtmlModal('shifts-addAdhocTask', {
            onshow(addModalElement) {
              ;(
                addModalElement.querySelector(
                  'input[name="shiftId"]'
                ) as HTMLInputElement
              ).value = shiftId
              ;(
                addModalElement.querySelector(
                  'input[name="adhocTaskId"]'
                ) as HTMLInputElement
              ).value = task.adhocTaskId.toString()

              // Display task details
              const detailsDiv = addModalElement.querySelector(
                '#addAdhocTask--taskDetails'
              ) as HTMLElement

              // eslint-disable-next-line no-unsanitized/property
              detailsDiv.innerHTML = /* html */ `
                <p class="mb-2">
                  <strong>Type:</strong>
                  ${cityssm.escapeHTML(task.adhocTaskTypeDataListItem ?? '')}
                </p>
                <p class="mb-2">
                  <strong>Description:</strong>
                  ${cityssm.escapeHTML(task.taskDescription)}
                </p>
                ${
                  task.locationAddress1
                    ? /* html */ `
                      <p class="mb-2">
                        <strong>Location:</strong>
                        ${cityssm.escapeHTML(task.locationAddress1)}
                      </p>
                    `
                    : ''
                }
                ${
                  task.taskDueDateTime
                    ? /* html */ `
                      <p class="mb-2">
                        <strong>Due:</strong>
                        ${cityssm.dateToString(new Date(task.taskDueDateTime))}
                      </p>
                    `
                    : ''
                }
              `
            },
            onshown(addModalElement, _selectedCloseModalFunction) {
              bulmaJS.toggleHtmlClipped()
              selectedCloseModalFunction = _selectedCloseModalFunction

              const formElement = addModalElement.querySelector(
                'form'
              ) as HTMLFormElement
              formElement.addEventListener('submit', doAdd)
              ;(
                addModalElement.querySelector(
                  'textarea[name="shiftAdhocTaskNote"]'
                ) as HTMLTextAreaElement
              ).focus()
            },

            onremoved() {
              bulmaJS.toggleHtmlClipped()
            }
          })
        }

        cityssm.openHtmlModal('shifts-selectAdhocTask', {
          onshow(selectModalElement) {
            modalElement = selectModalElement
          },
          onshown(selectModalElement, _closeModalFunction) {
            bulmaJS.toggleHtmlClipped()
            closeModalFunction = _closeModalFunction
            modalElement = selectModalElement

            // Render task list
            const tableElement = document.createElement('table')
            tableElement.className =
              'table is-fullwidth is-striped is-hoverable'

            tableElement.innerHTML = /* html */ `
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody></tbody>
            `

            const tbodyElement = tableElement.querySelector(
              'tbody'
            ) as HTMLTableSectionElement

            for (const task of responseJSON.adhocTasks) {
              const trElement = document.createElement('tr')

              const dueDateString =
                task.taskDueDateTime !== null &&
                task.taskDueDateTime !== undefined
                  ? cityssm.dateToString(new Date(task.taskDueDateTime))
                  : ''

              // eslint-disable-next-line no-unsanitized/property
              trElement.innerHTML = /* html */ `
                <td>
                  ${cityssm.escapeHTML(task.adhocTaskTypeDataListItem ?? '')}
                </td>
                <td>${cityssm.escapeHTML(task.taskDescription)}</td>
                <td>${cityssm.escapeHTML(task.locationAddress1)}</td>
                <td>${dueDateString}</td>
                <td class="has-text-right">
                  <button
                    class="button is-small is-primary button--select"
                    type="button"
                  >
                    <span class="icon is-small">
                      <i class="fa-solid fa-check"></i>
                    </span>
                    <span>Select</span>
                  </button>
                </td>
              `

              trElement
                .querySelector('.button--select')
                ?.addEventListener('click', () => {
                  closeModalFunction()
                  selectTask(task)
                })

              tbodyElement.append(trElement)
            }

            const container = modalElement.querySelector(
              '#selectAdhocTask--container'
            ) as HTMLElement
            container.replaceChildren(tableElement)
          },

          onremoved() {
            bulmaJS.toggleHtmlClipped()
          }
        })
      }
    )
  }

  function removeAdhocTask(clickEvent: Event): void {
    clickEvent.preventDefault()

    const adhocTaskId = (clickEvent.currentTarget as HTMLButtonElement).dataset
      .adhocTaskId

    const task = shiftAdhocTasks.find(
      (possibleTask) => possibleTask.adhocTaskId.toString() === adhocTaskId
    )

    if (task === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Remove Ad Hoc Task from Shift',

      message: /* html */ `
        Are you sure you want to remove this task
        from this shift?<br /><br />
        <strong>Would you like to:</strong><br />
        <label class="radio">
          <input name="deleteOption" type="radio" value="remove" checked />
          Just remove from this shift (keep available for other shifts)
        </label>
        <br />
        <label class="radio">
          <input name="deleteOption" type="radio" value="delete" />
          Delete the task entirely
        </label>
      `,
      messageIsHtml: true,

      okButton: {
        text: 'Remove',

        callbackFunction: () => {
          const deleteOption = (
            document.querySelector(
              'input[name="deleteOption"]:checked'
            ) as HTMLInputElement | null
          )?.value

          cityssm.postJSON(
            `${urlPrefix}/doDeleteShiftAdhocTask`,
            {
              adhocTaskId,
              shiftId,

              deleteTask: deleteOption === 'delete'
            },
            (responseJSON: DoDeleteShiftAdhocTaskResponse) => {
              if (responseJSON.success) {
                shiftAdhocTasks = responseJSON.shiftAdhocTasks
                renderShiftAdhocTasks()
                updateCount()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Removing Task',

                  message: responseJSON.errorMessage
                })
              }
            }
          )
        }
      }
    })
  }

  if (isEdit) {
    document
      .querySelector('#button--createAdhocTask')
      ?.addEventListener('click', createAdhocTask)

    document
      .querySelector('#button--addExistingAdhocTask')
      ?.addEventListener('click', addExistingAdhocTask)

    // Load task types for modals
    loadAdhocTaskTypes()
  }

  // Initial render
  renderShiftAdhocTasks()
  updateCount()
})()
