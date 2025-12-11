/* eslint-disable max-lines */
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Tag } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
  tags: Tag[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const tagsContainerElement = document.querySelector(
    '#container--tags'
  ) as HTMLDivElement

  // Pagination settings
  const ITEMS_PER_PAGE = 20
  let currentPage = 1
  let currentFilteredTags: Tag[] = exports.tags

  function pageSelect(pageNumber: number): void {
    currentPage = pageNumber
    renderTagsWithPagination(currentFilteredTags)
  }

  function deleteTag(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tagName = buttonElement.dataset.tagName
    if (tagName === undefined) {
      return
    }

    const tag = exports.tags.find(
      (possibleTag) => possibleTag.tagName === tagName
    )

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Tag',

      message: `Are you sure you want to delete tag "${tag?.tagName ?? ''}"? This action cannot be undone.`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete Tag',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteTag`,
            { tagName },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                message?: string
                tags?: Tag[]
              }

              if (responseJSON.success) {
                if (responseJSON.tags !== undefined) {
                  exports.tags = responseJSON.tags
                  currentFilteredTags = responseJSON.tags
                  currentPage = 1
                  renderTagsWithPagination(responseJSON.tags)
                }
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Tag Deleted',
                  message: 'Tag has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Tag',
                  message: responseJSON.message ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function editTag(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tagName = buttonElement.dataset.tagName
    if (tagName === undefined) {
      return
    }
    const tag = exports.tags.find(
      (possibleTag) => possibleTag.tagName === tagName
    )

    if (tag === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateTag(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateTag`,
        editForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            message?: string
            tags?: Tag[]
          }

          if (responseJSON.success) {
            closeModalFunction()
            if (responseJSON.tags !== undefined) {
              exports.tags = responseJSON.tags
              currentFilteredTags = responseJSON.tags
              currentPage = 1
              renderTagsWithPagination(responseJSON.tags)
            }
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Tag Updated',
              message: 'Tag has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Tag',
              message: responseJSON.message ?? 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminTags-edit', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('#editTag--tagName') as HTMLInputElement
        ).value = tag.tagName
        ;(
          modalElement.querySelector(
            '#editTag--tagNameDisplay'
          ) as HTMLInputElement
        ).value = tag.tagName
        ;(
          modalElement.querySelector(
            '#editTag--tagBackgroundColor'
          ) as HTMLInputElement
        ).value = `#${tag.tagBackgroundColor}`
        ;(
          modalElement.querySelector(
            '#editTag--tagTextColor'
          ) as HTMLInputElement
        ).value = `#${tag.tagTextColor}`

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateTag)
      },
      onshown(_modalElement, closeFunction) {
        closeModalFunction = closeFunction
      },

      onremoved() {
        document
          .querySelector('#button--addTag')
          ?.removeEventListener('click', editTag)
      }
    })
  }

  function addTag(): void {
    let closeModalFunction: () => void

    function doAddTag(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddTag`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            message?: string
            tags?: Tag[]
          }

          if (responseJSON.success) {
            closeModalFunction()
            if (responseJSON.tags !== undefined) {
              exports.tags = responseJSON.tags
              currentFilteredTags = responseJSON.tags
              currentPage = 1
              renderTagsWithPagination(responseJSON.tags)
            }
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Tag Added',
              message: 'Tag has been successfully added.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Tag',
              message: responseJSON.message ?? 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminTags-add', {
      onshow(modalElement) {
        modalElement.querySelector('form')?.addEventListener('submit', doAddTag)
      },
      onshown(_modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renderTagsWithPagination(tags: Tag[]): void {
    const totalItems = tags.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)

    // Clear container
    tagsContainerElement.innerHTML = ''

    if (tags.length === 0) {
      tagsContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">
            No tags found.
          </p>
        </div>
      `
      return
    }

    // Create table
    const tableElement = document.createElement('table')
    tableElement.className = 'table is-striped is-hoverable is-fullwidth'

    const thead = document.createElement('thead')
    thead.innerHTML = `
      <tr>
        <th>Tag Name</th>
        <th style="width: 200px;">Preview</th>
        <th style="width: 150px;">Background</th>
        <th style="width: 150px;">Text Color</th>
        <th style="width: 150px;"><span class="is-sr-only">Actions</span></th>
      </tr>
    `
    tableElement.append(thead)

    const tbody = document.createElement('tbody')

    for (let index = startIndex; index < endIndex; index += 1) {
      const tag = tags[index]

      const tr = document.createElement('tr')

      tr.innerHTML = `
        <td>${cityssm.escapeHTML(tag.tagName)}</td>
        <td>
          <span class="tag" style="background-color: #${cityssm.escapeHTML(tag.tagBackgroundColor)}; color: #${cityssm.escapeHTML(tag.tagTextColor)};">
            ${cityssm.escapeHTML(tag.tagName)}
          </span>
        </td>
        <td>
          <span style="color: #${cityssm.escapeHTML(tag.tagBackgroundColor)};">
            #${cityssm.escapeHTML(tag.tagBackgroundColor)}
          </span>
        </td>
        <td>
          <span style="color: #${cityssm.escapeHTML(tag.tagTextColor)};">
            #${cityssm.escapeHTML(tag.tagTextColor)}
          </span>
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button class="button is-info" data-tag-name="${cityssm.escapeHTML(tag.tagName)}" type="button">
              <span class="icon"><i class="fa-solid fa-pencil"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-danger" data-tag-name="${cityssm.escapeHTML(tag.tagName)}" type="button">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `

      tr.querySelector('.button.is-warning')?.addEventListener('click', editTag)
      tr.querySelector('.button.is-danger')?.addEventListener(
        'click',
        deleteTag
      )

      tbody.append(tr)
    }

    tableElement.append(tbody)
    tagsContainerElement.append(tableElement)

    // Add pagination if needed
    if (totalPages > 1) {
      const paginationElement = document.createElement('nav')
      paginationElement.className = 'pagination is-centered'
      paginationElement.setAttribute('role', 'navigation')
      paginationElement.setAttribute('aria-label', 'pagination')

      let paginationHTML = '<ul class="pagination-list">'

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        paginationHTML += `
          <li>
            <a class="pagination-link ${pageNumber === currentPage ? 'is-current' : ''}" 
               aria-label="Page ${pageNumber}" 
               data-page="${pageNumber}">
              ${pageNumber}
            </a>
          </li>
        `
      }

      paginationHTML += '</ul>'
      paginationElement.innerHTML = paginationHTML

      for (const link of paginationElement.querySelectorAll(
        '.pagination-link'
      )) {
        link.addEventListener('click', (clickEvent) => {
          const target = clickEvent.currentTarget as HTMLAnchorElement
          const pageNumber = Number(target.dataset.page)
          pageSelect(pageNumber)
        })
      }

      tagsContainerElement.append(paginationElement)
    }
  }

  function addTagFromWorkOrder(): void {
    let closeModalFunction: () => void = () => {
      // Initialized with no-op, will be assigned in onshown
    }

    function selectOrphanedTag(clickEvent: Event): void {
      const buttonElement = clickEvent.currentTarget as HTMLButtonElement
      const tagName = buttonElement.dataset.tagName

      if (tagName === undefined) {
        return
      }

      closeModalFunction()

      // Open the add tag modal with the tag name pre-filled
      let closeAddModalFunction: () => void

      cityssm.openHtmlModal('adminTags-add', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector('#addTag--tagName') as HTMLInputElement
          ).value = tagName
          ;(
            modalElement.querySelector('#addTag--tagName') as HTMLInputElement
          ).readOnly = true

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', (submitEvent) => {
              submitEvent.preventDefault()

              const addForm = submitEvent.currentTarget as HTMLFormElement

              cityssm.postJSON(
                `${shiftLog.urlPrefix}/admin/doAddTag`,
                addForm,
                (rawResponseJSON) => {
                  const responseJSON = rawResponseJSON as {
                    success: boolean
                    message?: string
                    tags?: Tag[]
                  }

                  if (responseJSON.success) {
                    closeAddModalFunction()
                    if (responseJSON.tags !== undefined) {
                      exports.tags = responseJSON.tags
                      currentFilteredTags = responseJSON.tags
                      currentPage = 1
                      renderTagsWithPagination(responseJSON.tags)
                    }
                    bulmaJS.alert({
                      contextualColorName: 'success',
                      title: 'Tag Added',
                      message: 'Tag has been successfully added to the system.'
                    })
                  } else {
                    bulmaJS.alert({
                      contextualColorName: 'danger',
                      title: 'Error Adding Tag',
                      message: responseJSON.message ?? 'Please try again.'
                    })
                  }
                }
              )
            })
        },
        onshown(_modalElement, closeFunction) {
          bulmaJS.toggleHtmlClipped()
          closeAddModalFunction = closeFunction
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    cityssm.openHtmlModal('adminTags-addFromWorkOrder', {
      onshow(modalElement) {
        const containerElement = modalElement.querySelector(
          '#container--orphanedTags'
        ) as HTMLDivElement

        containerElement.innerHTML = `
          <div class="message is-info">
            <p class="message-body">
              <span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span>
              Loading tags...
            </p>
          </div>
        `

        cityssm.postJSON(
          `${shiftLog.urlPrefix}/admin/doGetOrphanedTags`,
          {},
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              orphanedTags?: Array<{ tagName: string; usageCount: number }>
            }

            if (
              responseJSON.success &&
              responseJSON.orphanedTags !== undefined
            ) {
              if (responseJSON.orphanedTags.length === 0) {
                containerElement.innerHTML = `
                  <div class="message is-success">
                    <p class="message-body">
                      <span class="icon"><i class="fa-solid fa-check"></i></span>
                      All work order tags have system records.
                    </p>
                  </div>
                `
              } else {
                const tableElement = document.createElement('table')
                tableElement.className =
                  'table is-striped is-hoverable is-fullwidth'

                tableElement.innerHTML = /* html */ `
                  <thead>
                    <tr>
                      <th>Tag Name</th>
                      <th class="has-text-right" style="width: 120px;">Usage Count</th>
                      <th style="width: 100px;"><span class="is-sr-only">Actions</span></th>
                    </tr>
                  </thead>
                `

                const tbody = document.createElement('tbody')

                for (const orphanedTag of responseJSON.orphanedTags) {
                  const tr = document.createElement('tr')

                  tr.innerHTML = /* html */ `
                    <td>
                      <span class="tag is-light">
                        ${cityssm.escapeHTML(orphanedTag.tagName)}
                      </span>
                    </td>
                    <td class="has-text-right">
                      ${cityssm.escapeHTML(orphanedTag.usageCount.toString())}
                    </td>
                    <td class="has-text-right">
                      <button class="button is-primary is-small" data-tag-name="${cityssm.escapeHTML(orphanedTag.tagName)}" type="button">
                        <span class="icon"><i class="fa-solid fa-plus"></i></span>
                        <span>Add</span>
                      </button>
                    </td>
                  `

                  tr.querySelector('button')?.addEventListener(
                    'click',
                    selectOrphanedTag
                  )
                  tbody.append(tr)
                }

                tableElement.append(tbody)
                containerElement.innerHTML = ''
                containerElement.append(tableElement)
              }
            } else {
              containerElement.innerHTML = /* html */ `
                <div class="message is-danger">
                  <p class="message-body">
                    <span class="icon"><i class="fa-solid fa-exclamation-triangle"></i></span>
                    Failed to load orphaned tags.
                  </p>
                </div>
              `
            }
          }
        )
      },
      onshown(_modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  // Filter functionality
  const filterInput = document.querySelector(
    '#filter--tags'
  ) as HTMLInputElement
  filterInput?.addEventListener('keyup', () => {
    const filterValue = filterInput.value.toLowerCase()
    currentFilteredTags = exports.tags.filter((tag) =>
      tag.tagName.toLowerCase().includes(filterValue)
    )
    currentPage = 1
    renderTagsWithPagination(currentFilteredTags)
  })

  // Add tag button
  document.querySelector('#button--addTag')?.addEventListener('click', addTag)

  // Add tag from work order button
  document
    .querySelector('#button--addTagFromWorkOrder')
    ?.addEventListener('click', addTagFromWorkOrder)

  // Initial render
  renderTagsWithPagination(exports.tags)
})()
