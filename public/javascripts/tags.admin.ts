/* eslint-disable max-lines -- Large file */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddTagResponse } from '../../handlers/admin-post/doAddTag.js'
import type { DoAddTagAliasResponse } from '../../handlers/admin-post/doAddTagAlias.js'
import type { DoDeleteTagResponse } from '../../handlers/admin-post/doDeleteTag.js'
import type { DoDeleteTagAliasResponse } from '../../handlers/admin-post/doDeleteTagAlias.js'
import type { DoGetOrphanedTagsResponse } from '../../handlers/admin-post/doGetOrphanedTags.js'
import type { DoUpdateTagResponse } from '../../handlers/admin-post/doUpdateTag.js'
import type { DoUpdateTagAliasResponse } from '../../handlers/admin-post/doUpdateTagAlias.js'
import type { Tag, TagAlias } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
  tags: Tag[]
  tagAliases: TagAlias[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const tagsContainerElement = document.querySelector(
    '#container--tags'
  ) as HTMLDivElement
  const tagAliasesContainerElement = document.querySelector(
    '#container--tagAliases'
  ) as HTMLDivElement

  // WCAG Contrast Calculation Functions
  const WCAG_AA_NORMAL_RATIO = 4.5
  const WCAG_AAA_NORMAL_RATIO = 7

  /* eslint-disable @typescript-eslint/no-magic-numbers -- WCAG contrast ratios */

  /**
   * Convert a hex color to RGB values
   */
  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleanHex = hex.replace(/^#/, '')
    // Validate hex string
    if (!/^[\dA-F]{6}$/i.test(cleanHex)) {
      // Default to black if invalid
      return { r: 0, g: 0, b: 0 }
    }
    const bigint = Number.parseInt(cleanHex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  }

  /**
   * Validates a six-character hex colour value (without a leading #).
   * @param colorHex A six-character hex colour string.
   * @returns True when the value is a valid hex colour.
   */
  function isValidColorHex(colorHex: string): boolean {
    return /^[\dA-F]{6}$/i.test(colorHex)
  }

  /**
   * Calculate relative luminance according to WCAG 2.0
   */
  function getRelativeLuminance(rgb: {
    r: number
    g: number
    b: number
  }): number {
    const rsRGB = rgb.r / 255
    const gsRGB = rgb.g / 255
    const bsRGB = rgb.b / 255

    const r =
      rsRGB <= 0.039_28 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4
    const g =
      gsRGB <= 0.039_28 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4
    const b =
      bsRGB <= 0.039_28 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Calculate contrast ratio between two colors
   */
  function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)

    const lum1 = getRelativeLuminance(rgb1)
    const lum2 = getRelativeLuminance(rgb2)

    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /* eslint-enable @typescript-eslint/no-magic-numbers */

  /**
   * Get WCAG compliance level for a contrast ratio
   */
  function getWCAGCompliance(contrastRatio: number): {
    aa: boolean
    aaa: boolean
  } {
    return {
      aa: contrastRatio >= WCAG_AA_NORMAL_RATIO,
      aaa: contrastRatio >= WCAG_AAA_NORMAL_RATIO
    }
  }

  /**
   * Update the preview and contrast information for a tag
   */
  function updateTagPreview(
    elements: {
      previewElement: HTMLElement
      contrastRatioElement: HTMLElement
      wcagAAElement: HTMLElement
      wcagAAAElement: HTMLElement
    },
    backgroundColor: string,
    textColor: string,
    tagName?: string
  ): void {
    elements.previewElement.style.backgroundColor = backgroundColor
    elements.previewElement.style.color = textColor
    if (tagName !== undefined) {
      elements.previewElement.textContent = tagName
    }

    const contrastRatio = getContrastRatio(backgroundColor, textColor)
    const compliance = getWCAGCompliance(contrastRatio)

    elements.contrastRatioElement.textContent = contrastRatio.toFixed(2)

    // Clear existing content
    elements.wcagAAElement.textContent = ''
    elements.wcagAAAElement.textContent = ''

    // Create and append status badges
    const aaSpan = document.createElement('span')
    aaSpan.className = compliance.aa ? 'tag is-success' : 'tag is-danger'
    aaSpan.textContent = compliance.aa ? 'Pass' : 'Fail'
    elements.wcagAAElement.append(aaSpan)

    const aaaSpan = document.createElement('span')
    aaaSpan.className = compliance.aaa ? 'tag is-success' : 'tag is-danger'
    aaaSpan.textContent = compliance.aaa ? 'Pass' : 'Fail'
    elements.wcagAAAElement.append(aaaSpan)
  }

  // Pagination settings
  const ITEMS_PER_PAGE = 20
  let currentPage = 1
  let currentFilteredTags: Tag[] = exports.tags
  let currentAliasesPage = 1
  let currentFilteredTagAliases: TagAlias[] = exports.tagAliases

  function pageSelect(pageNumber: number): void {
    currentPage = pageNumber
    renderTagsWithPagination(currentFilteredTags)
  }

  function aliasesPageSelect(pageNumber: number): void {
    currentAliasesPage = pageNumber
    renderTagAliasesWithPagination(currentFilteredTagAliases)
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
              const responseJSON = rawResponseJSON as DoDeleteTagResponse
              if (responseJSON.success) {
                setTags(responseJSON.tags)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Tag Deleted',

                  message: 'Tag has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Tag',

                  message:
                    'message' in responseJSON
                      ? responseJSON.message
                      : 'Please try again.'
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
          const responseJSON = rawResponseJSON as DoUpdateTagResponse
          if (responseJSON.success) {
            closeModalFunction()
            setTags(responseJSON.tags)

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Tag Updated',

              message: 'Tag has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Tag',

              message:
                'message' in responseJSON
                  ? responseJSON.message
                  : 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminTags-edit', {
      onshow(modalElement) {
        const tagNameInput = modalElement.querySelector(
          '#editTag--tagName'
        ) as HTMLInputElement

        const tagNameDisplayInput = modalElement.querySelector(
          '#editTag--tagNameDisplay'
        ) as HTMLInputElement

        const backgroundColorInput = modalElement.querySelector(
          '#editTag--tagBackgroundColor'
        ) as HTMLInputElement

        const textColorInput = modalElement.querySelector(
          '#editTag--tagTextColor'
        ) as HTMLInputElement

        const previewElement = modalElement.querySelector(
          '#editTag--preview'
        ) as HTMLElement

        const contrastRatioElement = modalElement.querySelector(
          '#editTag--contrastRatio'
        ) as HTMLElement

        const wcagAAElement = modalElement.querySelector(
          '#editTag--wcagAA'
        ) as HTMLElement

        const wcagAAAElement = modalElement.querySelector(
          '#editTag--wcagAAA'
        ) as HTMLElement

        tagNameInput.value = tag.tagName
        tagNameDisplayInput.value = tag.tagName
        backgroundColorInput.value = `#${tag.tagBackgroundColor}`
        textColorInput.value = `#${tag.tagTextColor}`

        // Update preview when colors change
        function updatePreview(): void {
          updateTagPreview(
            {
              previewElement,
              contrastRatioElement,
              wcagAAElement,
              wcagAAAElement
            },
            backgroundColorInput.value,
            textColorInput.value,
            tag?.tagName
          )
        }

        // Initialize preview with current values
        updatePreview()

        // Add event listeners for real-time updates
        backgroundColorInput.addEventListener('input', updatePreview)
        textColorInput.addEventListener('input', updatePreview)

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateTag)
      },
      onshown(_modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()

        document
          .querySelector('#button--addTag')
          ?.removeEventListener('click', editTag)
      }
    })
  }

  /**
   * Set up the tag preview and WCAG contrast ratio updates for the add tag modal
   */
  function setupTagModalPreview(modalElement: HTMLElement): void {
    const tagNameInput = modalElement.querySelector(
      '#addTag--tagName'
    ) as HTMLInputElement

    const backgroundColorInput = modalElement.querySelector(
      '#addTag--tagBackgroundColor'
    ) as HTMLInputElement

    const textColorInput = modalElement.querySelector(
      '#addTag--tagTextColor'
    ) as HTMLInputElement

    const previewElement = modalElement.querySelector(
      '#addTag--preview'
    ) as HTMLElement

    const contrastRatioElement = modalElement.querySelector(
      '#addTag--contrastRatio'
    ) as HTMLElement

    const wcagAAElement = modalElement.querySelector(
      '#addTag--wcagAA'
    ) as HTMLElement

    const wcagAAAElement = modalElement.querySelector(
      '#addTag--wcagAAA'
    ) as HTMLElement

    // Update preview when colors or name change
    function updatePreview(): void {
      updateTagPreview(
        {
          previewElement,
          contrastRatioElement,
          wcagAAElement,
          wcagAAAElement
        },
        backgroundColorInput.value,
        textColorInput.value,
        tagNameInput.value || 'Sample Tag'
      )
    }

    // Initialize preview with default values
    updatePreview()

    // Add event listeners for real-time updates
    tagNameInput.addEventListener('input', updatePreview)
    backgroundColorInput.addEventListener('input', updatePreview)
    textColorInput.addEventListener('input', updatePreview)
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
          const responseJSON = rawResponseJSON as DoAddTagResponse
          if (responseJSON.success) {
            closeModalFunction()
            setTags(responseJSON.tags)

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Tag Added',

              message: 'Tag has been successfully added.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Tag',

              message:
                'message' in responseJSON
                  ? responseJSON.message
                  : 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminTags-add', {
      onshow(modalElement) {
        setupTagModalPreview(modalElement)

        modalElement.querySelector('form')?.addEventListener('submit', doAddTag)
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        // Focus the tag name input
        const tagNameInput = modalElement.querySelector(
          '#addTag--tagName'
        ) as HTMLInputElement
        tagNameInput.focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renderTagsWithPagination(tags: Tag[]): void {
    refreshTagSuggestionsList()

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
    thead.innerHTML = /* html */ `
      <tr>
        <th>Tag Name</th>
        <th style="width: 150px;">Background</th>
        <th style="width: 150px;">Text Color</th>
        <th style="width: 200px;">Preview</th>
        <th><span class="is-sr-only">Actions</span></th>
      </tr>
    `
    tableElement.append(thead)

    const tbody = document.createElement('tbody')

    for (let index = startIndex; index < endIndex; index += 1) {
      const tag = tags[index]

      const tr = document.createElement('tr')

      tr.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(tag.tagName)}</td>
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
        <td>
          <span class="tag" style="background-color: #${cityssm.escapeHTML(tag.tagBackgroundColor)}; color: #${cityssm.escapeHTML(tag.tagTextColor)};">
            ${cityssm.escapeHTML(tag.tagName)}
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

      tr.querySelector('.button.is-info')?.addEventListener('click', editTag)

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
        paginationHTML += /* html */ `
          <li>
            <a class="pagination-link ${pageNumber === currentPage ? 'is-current' : ''}"
              data-page="${pageNumber}"
              aria-label="Page ${pageNumber}"
            >
              ${pageNumber}
            </a>
          </li>
        `
      }

      paginationHTML += '</ul>'

      // eslint-disable-next-line no-unsanitized/property
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

  function setTagAliases(tagAliases: TagAlias[]): void {
    exports.tagAliases = tagAliases
    currentFilteredTagAliases = tagAliases
    currentAliasesPage = 1
    renderTagAliasesWithPagination(tagAliases)
  }

  /**
   * Rebuilds the tag alias list using the current filter input value.
   */
  function refreshTagAliasesTable(): void {
    const tagAliasesFilterInput = document.querySelector(
      '#filter--tagAliases'
    ) as HTMLInputElement
    const filterValue = tagAliasesFilterInput.value.toLowerCase()

    currentFilteredTagAliases = exports.tagAliases.filter(
      (tagAlias) =>
        tagAlias.tagNameAlias.toLowerCase().includes(filterValue) ||
        tagAlias.tagName.toLowerCase().includes(filterValue)
    )

    renderTagAliasesWithPagination(currentFilteredTagAliases)
  }

  /**
   * Updates tag state and re-renders both tag and tag alias tables.
   * @param tags Tag records returned from the server.
   */
  function setTags(tags: Tag[]): void {
    exports.tags = tags
    currentFilteredTags = tags
    currentPage = 1
    renderTagsWithPagination(tags)
    refreshTagAliasesTable()
  }

  /**
   * Refreshes the shared tag suggestions datalist on the main page.
   */
  function refreshTagSuggestionsList(): void {
    const tagNameSuggestionsElement = document.querySelector(
      '#tagNameSuggestions'
    ) as HTMLDataListElement
    tagNameSuggestionsElement.replaceChildren()

    for (const tag of exports.tags) {
      const optionElement = document.createElement('option')
      optionElement.value = tag.tagName
      tagNameSuggestionsElement.append(optionElement)
    }
  }

  function deleteTagAlias(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const tagNameAlias = buttonElement.dataset.tagNameAlias

    if (tagNameAlias === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Tag Alias',
      message: `Are you sure you want to delete tag alias "${tagNameAlias}"?`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete Tag Alias',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteTagAlias`,
            { tagNameAlias },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoDeleteTagAliasResponse

              if (responseJSON.success) {
                setTagAliases(responseJSON.tagAliases)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Tag Alias Deleted',
                  message: 'Tag alias has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Tag Alias',

                  message:
                    'message' in responseJSON
                      ? responseJSON.message
                      : 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function editTagAlias(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const tagNameAlias = buttonElement.dataset.tagNameAlias

    if (tagNameAlias === undefined) {
      return
    }

    const tagAlias = exports.tagAliases.find(
      (possibleTagAlias) => possibleTagAlias.tagNameAlias === tagNameAlias
    )

    if (tagAlias === undefined) {
      return
    }

    let closeModalFunction: () => void

    cityssm.openHtmlModal('adminTagAliases-edit', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('#editTagAlias--oldTagNameAlias') as HTMLInputElement
        ).value = tagAlias.tagNameAlias

        ;(
          modalElement.querySelector('#editTagAlias--tagNameAlias') as HTMLInputElement
        ).value = tagAlias.tagNameAlias

        ;(modalElement.querySelector('#editTagAlias--tagName') as HTMLInputElement).value =
          tagAlias.tagName

        modalElement.querySelector('form')?.addEventListener('submit', (event) => {
          event.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateTagAlias`,
            event.currentTarget as HTMLFormElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoUpdateTagAliasResponse

              if (responseJSON.success) {
                closeModalFunction()
                setTagAliases(responseJSON.tagAliases)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Tag Alias Updated',
                  message: 'Tag alias has been successfully updated.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Updating Tag Alias',
                  message:
                    'message' in responseJSON
                      ? responseJSON.message
                      : 'Please try again.'
                })
              }
            }
          )
        })
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        ;(
          modalElement.querySelector('#editTagAlias--tagNameAlias') as HTMLInputElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function addTagAlias(): void {
    let closeModalFunction: () => void

    cityssm.openHtmlModal('adminTagAliases-add', {
      onshow(modalElement) {
        modalElement.querySelector('form')?.addEventListener('submit', (event) => {
          event.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddTagAlias`,
            event.currentTarget as HTMLFormElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoAddTagAliasResponse

              if (responseJSON.success) {
                closeModalFunction()
                setTagAliases(responseJSON.tagAliases)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Tag Alias Added',
                  message: 'Tag alias has been successfully added.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Adding Tag Alias',
                  message:
                    'message' in responseJSON
                      ? responseJSON.message
                      : 'Please try again.'
                })
              }
            }
          )
        })
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        ;(
          modalElement.querySelector('#addTagAlias--tagNameAlias') as HTMLInputElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renderTagAliasesWithPagination(tagAliases: TagAlias[]): void {
    const totalItems = tagAliases.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (currentAliasesPage - 1) * ITEMS_PER_PAGE
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)

    tagAliasesContainerElement.innerHTML = ''

    if (tagAliases.length === 0) {
      tagAliasesContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">
            No tag aliases found.
          </p>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-striped is-hoverable is-fullwidth'
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Alias</th>
          <th>Maps to Tag</th>
          <th><span class="is-sr-only">Actions</span></th>
        </tr>
      </thead>
    `

    const tbody = document.createElement('tbody')

    for (let index = startIndex; index < endIndex; index += 1) {
      const tagAlias = tagAliases[index]
      const mappedTag = exports.tags.find((tag) => tag.tagName === tagAlias.tagName)
      const tr = document.createElement('tr')

      tr.innerHTML = /* html */ `
        <td>
          <span class="tag">${cityssm.escapeHTML(tagAlias.tagNameAlias)}</span>
        </td>
        <td>
          <span class="tag js-tag-alias-mapped-tag"></span>
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button class="button is-info" data-tag-name-alias="${cityssm.escapeHTML(tagAlias.tagNameAlias)}" type="button">
              <span class="icon"><i class="fa-solid fa-pencil"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-danger" data-tag-name-alias="${cityssm.escapeHTML(tagAlias.tagNameAlias)}" type="button">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `

      const mappedTagElement = tr.querySelector(
        '.js-tag-alias-mapped-tag'
      ) as HTMLSpanElement
      mappedTagElement.textContent = tagAlias.tagName

      const canApplyMappedTagColors =
        mappedTag !== undefined &&
        isValidColorHex(mappedTag.tagBackgroundColor) &&
        isValidColorHex(mappedTag.tagTextColor)

      if (canApplyMappedTagColors) {
        mappedTagElement.style.backgroundColor = `#${mappedTag.tagBackgroundColor}`
        mappedTagElement.style.color = `#${mappedTag.tagTextColor}`
      }

      tr.querySelector('.button.is-info')?.addEventListener('click', editTagAlias)
      tr
        .querySelector('.button.is-danger')
        ?.addEventListener('click', deleteTagAlias)

      tbody.append(tr)
    }

    tableElement.append(tbody)
    tagAliasesContainerElement.append(tableElement)

    if (totalPages > 1) {
      const paginationElement = document.createElement('nav')
      paginationElement.className = 'pagination is-centered'
      paginationElement.setAttribute('role', 'navigation')
      paginationElement.setAttribute('aria-label', 'pagination')

      let paginationHTML = '<ul class="pagination-list">'

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        paginationHTML += /* html */ `
          <li>
            <a class="pagination-link ${pageNumber === currentAliasesPage ? 'is-current' : ''}"
              data-page="${pageNumber}"
              aria-label="Page ${pageNumber}"
            >
              ${pageNumber}
            </a>
          </li>
        `
      }

      paginationHTML += '</ul>'

      // eslint-disable-next-line no-unsanitized/property
      paginationElement.innerHTML = paginationHTML

      for (const link of paginationElement.querySelectorAll(
        '.pagination-link'
      )) {
        link.addEventListener('click', (clickEvent) => {
          const target = clickEvent.currentTarget as HTMLAnchorElement
          const pageNumber = Number(target.dataset.page)
          aliasesPageSelect(pageNumber)
        })
      }

      tagAliasesContainerElement.append(paginationElement)
    }
  }

  function addUsedTags(event: Event): void {
    event.preventDefault()

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
          // Set tag name and make it readonly
          const tagNameInput = modalElement.querySelector(
            '#addTag--tagName'
          ) as HTMLInputElement
          tagNameInput.value = tagName
          tagNameInput.readOnly = true

          // Set up preview and event listeners
          setupTagModalPreview(modalElement)

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', (submitEvent) => {
              submitEvent.preventDefault()

              const addForm = submitEvent.currentTarget as HTMLFormElement

              cityssm.postJSON(
                `${shiftLog.urlPrefix}/admin/doAddTag`,
                addForm,
                (rawResponseJSON) => {
                  const responseJSON = rawResponseJSON as DoAddTagResponse
                  if (responseJSON.success) {
                    closeAddModalFunction()
                    setTags(responseJSON.tags)

                    bulmaJS.alert({
                      contextualColorName: 'success',
                      title: 'Tag Added',
                      message: 'Tag has been successfully added to the system.'
                    })
                  } else {
                    bulmaJS.alert({
                      contextualColorName: 'danger',
                      title: 'Error Adding Tag',
                      message:
                        'message' in responseJSON
                          ? responseJSON.message
                          : 'Please try again.'
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

    cityssm.openHtmlModal('adminTags-addUsedTags', {
      onshow(modalElement) {
        shiftLog.populateSectionAliases(modalElement)

        const containerElement = modalElement.querySelector(
          '#container--orphanedTags'
        ) as HTMLDivElement

        containerElement.innerHTML = /* html */ `
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
            const responseJSON = rawResponseJSON as DoGetOrphanedTagsResponse
            if (responseJSON.success) {
              if (responseJSON.orphanedTags.length === 0) {
                containerElement.innerHTML = /* html */ `
                  <div class="message is-success">
                    <p class="message-body">
                      <span class="icon"><i class="fa-solid fa-check"></i></span>
                      All used tags have system records.
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
                      <button class="button is-success is-small" data-tag-name="${cityssm.escapeHTML(orphanedTag.tagName)}" type="button">
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

  // Tab functionality
  const tabLinks = document.querySelectorAll('.tabs a')
  const tabContents = document.querySelectorAll('[id^="tab-"]')

  for (const tabLink of tabLinks) {
    tabLink.addEventListener('click', (event) => {
      event.preventDefault()

      const clickedLink = event.currentTarget as HTMLAnchorElement
      const tabId = clickedLink.getAttribute('href')

      if (tabId === null) {
        return
      }

      for (const tabParent of document.querySelectorAll('.tabs li')) {
        tabParent.classList.remove('is-active')
      }

      clickedLink.closest('li')?.classList.add('is-active')

      for (const tabContent of tabContents) {
        tabContent.classList.toggle('is-hidden', `#${tabContent.id}` !== tabId)
      }
    })
  }

  // Filter functionality (Tags)
  const filterInput = document.querySelector(
    '#filter--tags'
  ) as HTMLInputElement

  filterInput.addEventListener('keyup', () => {
    const filterValue = filterInput.value.toLowerCase()
    currentFilteredTags = exports.tags.filter((tag) =>
      tag.tagName.toLowerCase().includes(filterValue)
    )

    currentPage = 1
    renderTagsWithPagination(currentFilteredTags)
  })

  // Filter functionality (Tag Aliases)
  const tagAliasesFilterInput = document.querySelector(
    '#filter--tagAliases'
  ) as HTMLInputElement

  tagAliasesFilterInput.addEventListener('keyup', () => {
    currentAliasesPage = 1
    refreshTagAliasesTable()
  })

  // Add tag button
  document.querySelector('#button--addTag')?.addEventListener('click', addTag)

  // Add tag alias button
  document
    .querySelector('#button--addTagAlias')
    ?.addEventListener('click', addTagAlias)

  // Add used tags button
  document
    .querySelector('#button--addUsedTags')
    ?.addEventListener('click', addUsedTags)

  // Initial render
  renderTagsWithPagination(exports.tags)
  renderTagAliasesWithPagination(exports.tagAliases)
})()
