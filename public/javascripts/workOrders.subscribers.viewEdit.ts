import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddWorkOrderSubscriberResponse } from '../../handlers/workOrders-post/doAddWorkOrderSubscriber.js'
import type { DoDeleteWorkOrderSubscriberResponse } from '../../handlers/workOrders-post/doDeleteWorkOrderSubscriber.js'
import type { DoGetWorkOrderSubscribersResponse } from '../../handlers/workOrders-post/doGetWorkOrderSubscribers.js'
import type { WorkOrderSubscriber } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal

  isEdit: boolean
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const workOrderFormElement = document.querySelector(
    '#form--workOrder'
  ) as HTMLFormElement | null

  const workOrderId =
    workOrderFormElement === null
      ? ''
      : (
          workOrderFormElement.querySelector(
            '#workOrder--workOrderId'
          ) as HTMLInputElement
        ).value

  const subscribersContainerElement = document.querySelector(
    '#container--subscribers'
  ) as HTMLElement

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive check for null
  if (subscribersContainerElement === null) {
    return
  }

  function renderSubscribers(subscribers: WorkOrderSubscriber[]): void {
    const subscribersCountElement = document.querySelector('#subscribersCount')

    if (subscribersCountElement !== null) {
      subscribersCountElement.textContent = subscribers.length.toString()
    }

    if (subscribers.length === 0) {
      subscribersContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No subscribers have been added.</p>
        </div>
      `
      return
    }

    subscribersContainerElement.innerHTML = ''

    const listElement = document.createElement('div')
    listElement.className = 'content'

    const ulElement = document.createElement('ul')
    ulElement.className = 'is-size-5'

    for (const subscriber of subscribers) {
      const liElement = document.createElement('li')

      const emailLinkElement = document.createElement('a')
      emailLinkElement.href = `mailto:${subscriber.subscriberEmailAddress}`
      emailLinkElement.textContent = subscriber.subscriberEmailAddress

      liElement.append(emailLinkElement)

      if (exports.isEdit) {
        const removeButtonElement = document.createElement('button')
        removeButtonElement.className =
          'button is-small is-danger is-light ml-2'
        removeButtonElement.type = 'button'
        removeButtonElement.innerHTML = /* html */ `
          <span class="icon is-small"><i class="fa-solid fa-xmark"></i></span>
          <span>Remove</span>
        `

        removeButtonElement.addEventListener('click', () => {
          deleteSubscriber(
            subscriber.subscriberSequence,
            subscriber.subscriberEmailAddress
          )
        })

        liElement.append(removeButtonElement)
      }

      ulElement.append(liElement)
    }

    listElement.append(ulElement)
    subscribersContainerElement.append(listElement)
  }

  function getSubscribers(): void {
    cityssm.postJSON(
      `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderSubscribers`,
      {},
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as DoGetWorkOrderSubscribersResponse
        renderSubscribers(responseJSON.subscribers)
      }
    )
  }

  function deleteSubscriber(
    subscriberSequence: number,
    subscriberEmailAddress: string
  ): void {
    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Remove Subscriber',

      message: `Are you sure you want to remove "${subscriberEmailAddress}"?`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Remove Subscriber',

        callbackFunction() {
          cityssm.postJSON(
            `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderSubscriber`,
            {
              subscriberSequence,
              workOrderId: Number.parseInt(workOrderId, 10)
            },
            (rawResponseJSON) => {
              const responseJSON =
                rawResponseJSON as DoDeleteWorkOrderSubscriberResponse

              if (responseJSON.success) {
                renderSubscribers(responseJSON.subscribers)
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Removing Subscriber',

                  message: responseJSON.errorMessage
                })
              }
            }
          )
        }
      }
    })
  }

  function addSubscriber(): void {
    let closeModalFunction: () => void

    function doAddSubscriber(submitEvent: Event): void {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement
      const subscriberEmailAddressInput = formElement.querySelector(
        '#addWorkOrderSubscriber--subscriberEmailAddress'
      ) as HTMLInputElement

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderSubscriber`,
        {
          subscriberEmailAddress: subscriberEmailAddressInput.value,
          workOrderId: Number.parseInt(workOrderId, 10)
        },
        (rawResponseJSON) => {
          const responseJSON =
            rawResponseJSON as DoAddWorkOrderSubscriberResponse

          if (responseJSON.success) {
            closeModalFunction()
            renderSubscribers(responseJSON.subscribers)

            bulmaJS.alert({
              contextualColorName: 'success',
              message:
                'Subscriber has been successfully added to this work order.',
              title: 'Subscriber Added'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              message: responseJSON.errorMessage,
              title: 'Error Adding Subscriber'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('workOrders-addSubscriber', {
      onshow(modalElement) {
        exports.shiftLog.setUnsavedChanges('modal')

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddSubscriber)
      },
      onshown(modalElement, closeFunction) {
        closeModalFunction = closeFunction
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#addWorkOrderSubscriber--subscriberEmailAddress'
          ) as HTMLInputElement
        ).focus()
      },
      onremoved() {
        exports.shiftLog.clearUnsavedChanges('modal')
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  document
    .querySelector('#button--addSubscriber')
    ?.addEventListener('click', addSubscriber)

  getSubscribers()
})()
