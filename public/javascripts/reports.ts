import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal

  activeTab: string
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

  // eslint-disable-next-line unicorn/no-null
  let initialTabElement: HTMLElement | null = null

  if (exports.activeTab !== '') {
    initialTabElement = reportsContainerElement?.querySelector(
      `.menu-list a[href="#tab--${exports.activeTab}"]`
    ) as HTMLElement | null
  }

  initialTabElement ??= reportsContainerElement?.querySelector(
    '.menu-list a'
  ) as HTMLElement | null

  initialTabElement?.click()
})()
