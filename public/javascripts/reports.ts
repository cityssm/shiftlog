import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const reportsContainerElement = document.querySelector(
    '#container--reportTabs'
  )

  if (reportsContainerElement !== null) {
    exports.shiftLog.initializeRecordTabs(
      reportsContainerElement as HTMLElement
    )
  }

  ;(
    reportsContainerElement?.querySelector('.menu-list a') as HTMLElement | null
  )?.click()
})()
