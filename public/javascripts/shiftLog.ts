import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: Partial<ShiftLogGlobal>
}
;(() => {
  /*
   * Unsaved Changes
   */

  let _hasUnsavedChanges = false

  function setUnsavedChanges(): void {
    if (!hasUnsavedChanges()) {
      _hasUnsavedChanges = true
      cityssm.enableNavBlocker()
    }
  }

  function clearUnsavedChanges(): void {
    _hasUnsavedChanges = false
    cityssm.disableNavBlocker()
  }

  function hasUnsavedChanges(): boolean {
    return _hasUnsavedChanges
  }

  /*
   * Record Menu Tabs
   */

  function initializeRecordTabs(tabsContainerElement: HTMLElement): void {
    const menuTabElements: NodeListOf<HTMLAnchorElement> =
      tabsContainerElement.querySelectorAll('.menu a')

    const tabContainerElements: NodeListOf<HTMLElement> =
      tabsContainerElement.querySelectorAll('.tabs-container > div')

    function doSelectTab(clickEvent: Event): void {
      clickEvent.preventDefault()

      // Remove .is-active from all tabs
      for (const menuTabElement of menuTabElements) {
        menuTabElement.classList.remove('is-active')
      }

      // Set .is-active on clicked tab
      const selectedTabElement = clickEvent.currentTarget as HTMLAnchorElement
      selectedTabElement.classList.add('is-active')

      // Hide all but selected tab
      const selectedTabContainerId = selectedTabElement.href.slice(
        Math.max(0, selectedTabElement.href.indexOf('#') + 1)
      )

      for (const tabContainerElement of tabContainerElements) {
        tabContainerElement.classList.toggle(
          'is-hidden',
          tabContainerElement.id !== selectedTabContainerId
        )
      }
    }

    for (const menuTabElement of menuTabElements) {
      menuTabElement.addEventListener('click', doSelectTab)
    }
  }

  /*
   * URL builders
   */

  function buildShiftURL(shiftId: number, edit = false): string {
    return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/${shiftId.toString()}${edit ? '/edit' : ''}`
  }

  function buildWorkOrderURL(workOrderId: number, edit = false): string {
    return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId.toString()}${edit ? '/edit' : ''}`
  }

  function buildTimesheetURL(timesheetId: number, edit = false): string {
    return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/${timesheetId.toString()}${edit ? '/edit' : ''}`
  }

  /*
   * Declare shiftLog
   */

  exports.shiftLog = {
    ...exports.shiftLog,

    clearUnsavedChanges,
    hasUnsavedChanges,
    setUnsavedChanges,

    buildShiftURL,
    buildTimesheetURL,
    buildWorkOrderURL,

    initializeRecordTabs
  }
})()
