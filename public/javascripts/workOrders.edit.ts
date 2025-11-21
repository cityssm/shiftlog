import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type FlatPickr from 'flatpickr'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const flatpickr: typeof FlatPickr

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.workOrdersRouter

  const workOrderFormElement = document.querySelector(
    '#form--workOrder'
  ) as HTMLFormElement

  const workOrderId = (
    workOrderFormElement.querySelector(
      '#workOrder--workOrderId'
    ) as HTMLInputElement
  ).value

  const workOrderCloseDateTimeStringElement =
    workOrderFormElement.querySelector(
      '#workOrder--workOrderCloseDateTimeString'
    ) as HTMLInputElement

  const isCreate = workOrderId === ''

  function updateWorkOrder(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${urlPrefix}/${isCreate ? 'doCreateWorkOrder' : 'doUpdateWorkOrder'}`,
      workOrderFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          workOrderId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          if (isCreate && responseJSON.workOrderId !== undefined) {
            globalThis.location.href = shiftLog.buildWorkOrderURL(
              responseJSON.workOrderId,
              true
            )
          } else if (workOrderCloseDateTimeStringElement.value === '') {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Updated Successfully'
            })
          } else {
            globalThis.location.href = shiftLog.buildWorkOrderURL(
              Number(workOrderId)
            )
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Update Error',

            message: responseJSON.errorMessage ?? 'An unknown error occurred.'
          })
        }
      }
    )
  }

  workOrderFormElement.addEventListener('submit', updateWorkOrder)

  /*
   * Set up date-time pickers
   */

  const dateTimePickerOptions = {
    allowInput: true,
    enableTime: true,

    nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
    prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
  } satisfies Partial<FlatPickr.Options.Options>

  const workOrderOpenDateTimeStringElement = workOrderFormElement.querySelector(
    '#workOrder--workOrderOpenDateTimeString'
  ) as HTMLInputElement

  const workOrderDueDateTimeStringElement = workOrderFormElement.querySelector(
    '#workOrder--workOrderDueDateTimeString'
  ) as HTMLInputElement

  const workOrderDueDateTimePicker = flatpickr(
    workOrderDueDateTimeStringElement,
    {
      ...dateTimePickerOptions,
      minDate: workOrderOpenDateTimeStringElement.valueAsDate ?? ''
    }
  )

  const workOrderCloseDateTimePicker = flatpickr(
    workOrderCloseDateTimeStringElement,
    {
      ...dateTimePickerOptions,
      maxDate: new Date(),
      minDate: workOrderOpenDateTimeStringElement.valueAsDate ?? '',
    }
  )

  flatpickr(workOrderOpenDateTimeStringElement, {
    ...dateTimePickerOptions,
    maxDate: new Date(),
    onChange: (selectedDates) => {
      if (selectedDates.length > 0) {
        const selectedDate = selectedDates[0]

        if (workOrderDueDateTimePicker.selectedDates.length > 0) {
          const dueDate = workOrderDueDateTimePicker.selectedDates[0]
          if (dueDate < selectedDate) {
            bulmaJS.alert({
              contextualColorName: 'warning',
              message:
                'Due Date/Time reset because it was before the Open Date/Time.'
            })

            workOrderDueDateTimePicker.setDate(selectedDate, true)
          }
        }

        workOrderDueDateTimePicker.set('minDate', selectedDate)

        workOrderCloseDateTimePicker.set('minDate', selectedDate)
      }
    }
  })

  /*
   * Set up map for location picker
   */

  const mapPickerElement = document.querySelector('#map--locationPicker') as HTMLElement | null
  
  if (mapPickerElement !== null) {
    // @ts-expect-error - Leaflet is loaded via script tag
    const L = globalThis.L

    const latitudeInput = workOrderFormElement.querySelector('#workOrder--locationLatitude') as HTMLInputElement
    const longitudeInput = workOrderFormElement.querySelector('#workOrder--locationLongitude') as HTMLInputElement

    // Default to SSM or use existing coordinates
    let defaultLat = 46.5136
    let defaultLng = -84.3422
    let defaultZoom = 13

    if (latitudeInput.value !== '' && longitudeInput.value !== '') {
      defaultLat = Number.parseFloat(latitudeInput.value)
      defaultLng = Number.parseFloat(longitudeInput.value)
      defaultZoom = 15
    }

    const map = L.map('map--locationPicker').setView([defaultLat, defaultLng], defaultZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    let marker: typeof L.marker | null = null

    if (latitudeInput.value !== '' && longitudeInput.value !== '') {
      marker = L.marker([defaultLat, defaultLng]).addTo(map)
    }

    map.on('click', (event: { latlng: { lat: number, lng: number } }) => {
      const lat = event.latlng.lat
      const lng = event.latlng.lng

      latitudeInput.value = lat.toFixed(7)
      longitudeInput.value = lng.toFixed(7)

      if (marker !== null) {
        map.removeLayer(marker)
      }

      marker = L.marker([lat, lng]).addTo(map)
    })

    // Update map when coordinates are manually entered
    function updateMapFromInputs(): void {
      const lat = Number.parseFloat(latitudeInput.value)
      const lng = Number.parseFloat(longitudeInput.value)

      if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        if (marker !== null) {
          map.removeLayer(marker)
        }

        marker = L.marker([lat, lng]).addTo(map)
        map.setView([lat, lng], 15)
      }
    }

    latitudeInput.addEventListener('change', updateMapFromInputs)
    longitudeInput.addEventListener('change', updateMapFromInputs)
  }

  // View-only map
  const mapViewElement = document.querySelector('#map--locationView') as HTMLElement | null

  if (mapViewElement !== null) {
    // @ts-expect-error - Leaflet is loaded via script tag
    const L = globalThis.L

    const lat = Number.parseFloat(mapViewElement.dataset.lat ?? '0')
    const lng = Number.parseFloat(mapViewElement.dataset.lng ?? '0')

    const map = L.map('map--locationView').setView([lat, lng], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    L.marker([lat, lng]).addTo(map)
  }
})()
