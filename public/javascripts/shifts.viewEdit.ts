import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftTabsContainerElement = document.querySelector(
    '#container--shiftTabs'
  )

  if (shiftTabsContainerElement !== null) {
    exports.shiftLog.initializeRecordTabs(
      shiftTabsContainerElement as HTMLElement
    )
  }
})()
