import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { WorkOrderTag } from '../../types/record.types.js'

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

  /*
   * Tags functionality
   */

  const tagsContainerElement = document.querySelector(
    '#container--tags'
  ) as HTMLElement | null

  if (tagsContainerElement !== null) {
    function renderTags(tags: WorkOrderTag[]): void {
      // Update tags count
      const tagsCountElement = document.querySelector('#tagsCount')

      if (tagsCountElement !== null) {
        tagsCountElement.textContent = tags.length.toString()
      }

      if (tags.length === 0) {
        ;(tagsContainerElement as HTMLElement).innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No tags have been added yet.</p>
          </div>
        `
        return
      }

      ;(tagsContainerElement as HTMLElement).innerHTML = ''

      const tagsElement = document.createElement('div')
      tagsElement.className = 'tags'

      for (const tag of tags) {
        const tagElement = document.createElement('span')
        tagElement.className = 'tag is-medium'

        // Apply colors if available
        if (tag.tagBackgroundColor && tag.tagTextColor) {
          tagElement.style.backgroundColor = `#${tag.tagBackgroundColor}`
          tagElement.style.color = `#${tag.tagTextColor}`
        }

        const tagTextElement = document.createElement('span')
        tagTextElement.textContent = tag.tagName

        tagElement.append(tagTextElement)

        // Add delete button if in edit mode
        if (exports.isEdit) {
          const deleteButton = document.createElement('button')
          deleteButton.className = 'delete is-small'
          deleteButton.type = 'button'
          deleteButton.dataset.tagName = tag.tagName
          deleteButton.setAttribute('aria-label', `Remove tag ${tag.tagName}`)

          deleteButton.addEventListener('click', () => {
            deleteTag(tag.tagName)
          })

          tagElement.append(deleteButton)
        }

        tagsElement.append(tagElement)
      }

      tagsContainerElement?.append(tagsElement)
    }

    function deleteTag(tagName: string): void {
      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Remove Tag',

        message: `Are you sure you want to remove the tag "${tagName}" from this work order?`,
        okButton: {
          contextualColorName: 'warning',
          text: 'Remove Tag',

          callbackFunction() {
            cityssm.postJSON(
              `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderTag`,
              {
                workOrderId: Number.parseInt(workOrderId, 10),
                tagName
              },
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  message?: string
                  tags?: WorkOrderTag[]
                }

                if (responseJSON.success && responseJSON.tags !== undefined) {
                  renderTags(responseJSON.tags)
                  bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Tag Removed',

                    message:
                      'Tag has been successfully removed from this work order.'
                  })
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Removing Tag',

                    message:
                      responseJSON.message ??
                      'An error occurred while removing the tag.'
                  })
                }
              }
            )
          }
        }
      })
    }

    function addTag(): void {
      let closeModalFunction: () => void

      function doAddTag(submitEvent: Event): void {
        submitEvent.preventDefault()

        const formElement = submitEvent.currentTarget as HTMLFormElement
        const tagNameInput = formElement.querySelector(
          '#addWorkOrderTag--tagName'
        ) as HTMLInputElement

        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderTag`,
          {
            workOrderId: Number.parseInt(workOrderId, 10),
            tagName: tagNameInput.value
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              message?: string
              tags?: WorkOrderTag[]
            }

            if (responseJSON.success && responseJSON.tags !== undefined) {
              closeModalFunction()
              renderTags(responseJSON.tags)
              bulmaJS.alert({
                contextualColorName: 'success',
                title: 'Tag Added',

                message: 'Tag has been successfully added to this work order.'
              })
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Adding Tag',

                message:
                  responseJSON.message ??
                  'An error occurred while adding the tag.'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrders-addTag', {
        onshow(modalElement) {
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddTag)
        },
        onshown(_modalElement, closeFunction) {
          closeModalFunction = closeFunction

          bulmaJS.toggleHtmlClipped()
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function getTags(): void {
      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderTags`,
        {},
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            tags?: WorkOrderTag[]
          }

          if (responseJSON.success && responseJSON.tags !== undefined) {
            renderTags(responseJSON.tags)
          }
        }
      )
    }

    // Add tag button
    const addTagButton = document.querySelector('#button--addTag')
    if (addTagButton !== null) {
      addTagButton.addEventListener('click', addTag)
    }

    // Initial load
    getTags()
  }
})()
