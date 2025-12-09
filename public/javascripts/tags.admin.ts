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
          modalElement.querySelector('#editTag--tagNameDisplay') as HTMLInputElement
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
        closeModalFunction = closeFunction
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
        <div class="message">
          <p class="message-body has-text-centered">
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
    tableElement.appendChild(thead)

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
            <button class="button is-warning" data-tag-name="${cityssm.escapeHTML(tag.tagName)}" type="button">
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
      tr.querySelector('.button.is-danger')?.addEventListener('click', deleteTag)

      tbody.appendChild(tr)
    }

    tableElement.appendChild(tbody)
    tagsContainerElement.appendChild(tableElement)

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

      paginationElement.querySelectorAll('.pagination-link').forEach((link) => {
        link.addEventListener('click', (clickEvent) => {
          const target = clickEvent.currentTarget as HTMLAnchorElement
          const pageNumber = Number(target.dataset.page)
          pageSelect(pageNumber)
        })
      })

      tagsContainerElement.appendChild(paginationElement)
    }
  }

  // Filter functionality
  const filterInput = document.querySelector('#filter--tags') as HTMLInputElement
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

  // Initial render
  renderTagsWithPagination(exports.tags)
})()
