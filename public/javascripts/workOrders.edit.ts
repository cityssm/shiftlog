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
})()
