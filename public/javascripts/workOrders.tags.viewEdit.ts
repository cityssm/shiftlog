import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddWorkOrderTagResponse } from '../../handlers/workOrders-post/doAddWorkOrderTag.js'
import type { DoDeleteWorkOrderTagResponse } from '../../handlers/workOrders-post/doDeleteWorkOrderTag.js'
import type { DoGetSuggestedTagsResponse } from '../../handlers/workOrders-post/doGetSuggestedTags.js'
import type { DoGetWorkOrderTagsResponse } from '../../handlers/workOrders-post/doGetWorkOrderTags.js'
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
      if (tags.length === 0) {
        ;(tagsContainerElement as HTMLElement).innerHTML = /* html */ `
          <p class="has-text-grey">No tags have been added.</p>
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
          deleteButton.title = `Remove tag ${tag.tagName}`

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
                tagName,
                workOrderId: Number.parseInt(workOrderId, 10)
              },
              (responseJSON: DoDeleteWorkOrderTagResponse) => {
                if (responseJSON.success) {
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

                    message: responseJSON.errorMessage
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

      function renderSuggestedTags(
        containerElement: HTMLElement,
        suggestedTags: Array<{
          tagBackgroundColor?: string
          tagName: string
          tagTextColor?: string
          usageCount: number
        }>,
        getCloseFunction: () => () => void
      ): void {
        if (suggestedTags.length === 0) {
          containerElement.innerHTML = ''
          return
        }

        containerElement.innerHTML = /* html */ `
          <div class="field">
            <label class="label">Suggested Tags</label>
            <div class="control">
              <div class="tags" id="tags--suggested"></div>
            </div>
            <p class="help">Recently used tags that are not yet on this work order. Click to add.</p>
          </div>
        `

        const tagsElement = containerElement.querySelector(
          '#tags--suggested'
        ) as HTMLElement

        for (const suggestedTag of suggestedTags) {
          const tagElement = document.createElement('button')
          tagElement.className = 'tag is-medium is-clickable'
          tagElement.type = 'button'

          // Apply colors if available
          if (
            (suggestedTag.tagBackgroundColor?.length ?? 0) > 0 &&
            (suggestedTag.tagTextColor?.length ?? 0) > 0
          ) {
            tagElement.style.backgroundColor = `#${suggestedTag.tagBackgroundColor}`
            tagElement.style.color = `#${suggestedTag.tagTextColor}`
          }

          tagElement.textContent = suggestedTag.tagName

          const addSuggestedTag = (): void => {
            cityssm.postJSON(
              `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderTag`,
              {
                tagName: suggestedTag.tagName,
                workOrderId: Number.parseInt(workOrderId, 10)
              },
              (responseJSON: DoAddWorkOrderTagResponse) => {
                if (responseJSON.success) {
                  getCloseFunction()()
                  renderTags(responseJSON.tags)

                  bulmaJS.alert({
                    contextualColorName: 'success',
                    message:
                      'Tag has been successfully added to this work order.',
                    okButton: {
                      callbackFunction() {
                        addTag()
                      }
                    },
                    title: 'Tag Added'
                  })
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: responseJSON.errorMessage,
                    title: 'Error Adding Tag'
                  })
                }
              }
            )
          }

          tagElement.addEventListener('click', addSuggestedTag)

          tagsElement.append(tagElement)
        }
      }

      function doAddTag(submitEvent: Event): void {
        submitEvent.preventDefault()

        const formElement = submitEvent.currentTarget as HTMLFormElement
        const tagNameInput = formElement.querySelector(
          '#addWorkOrderTag--tagName'
        ) as HTMLInputElement

        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderTag`,
          {
            tagName: tagNameInput.value,
            workOrderId: Number.parseInt(workOrderId, 10)
          },
          (responseJSON: DoAddWorkOrderTagResponse) => {
            if (responseJSON.success) {
              closeModalFunction()
              renderTags(responseJSON.tags)

              bulmaJS.alert({
                contextualColorName: 'success',
                message: 'Tag has been successfully added to this work order.',
                title: 'Tag Added',

                okButton: {
                  callbackFunction() {
                    addTag()
                  }
                }
              })
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: responseJSON.errorMessage,
                title: 'Error Adding Tag'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrders-addTag', {
        onshow(modalElement) {
          exports.shiftLog.setUnsavedChanges('modal')

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddTag)

          // Fetch and render suggested tags
          const suggestedTagsContainer = modalElement.querySelector(
            '#container--suggestedTags'
          ) as HTMLElement | null

          if (suggestedTagsContainer !== null) {
            cityssm.postJSON(
              `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetSuggestedTags`,
              {},
              (responseJSON: DoGetSuggestedTagsResponse) => {
                renderSuggestedTags(
                  suggestedTagsContainer,
                  responseJSON.suggestedTags,
                  () => closeModalFunction
                )
              }
            )
          }
        },
        onshown(modalElement, closeFunction) {
          closeModalFunction = closeFunction
          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#addWorkOrderTag--tagName'
            ) as HTMLInputElement
          ).focus()
        },

        onremoved() {
          exports.shiftLog.clearUnsavedChanges('modal')
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function getTags(): void {
      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderTags`,
        {},
        (responseJSON: DoGetWorkOrderTagsResponse) => {
          renderTags(responseJSON.tags)
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
