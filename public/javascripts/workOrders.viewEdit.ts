import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const workOrderTabsContainerElement = document.querySelector(
    '#container--workOrderTabs'
  )

  if (workOrderTabsContainerElement !== null) {
    exports.shiftLog.initializeRecordTabs(
      workOrderTabsContainerElement as HTMLElement
    )
  }
})()
