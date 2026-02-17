import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  const shiftTabsContainerElement = document.querySelector(
    '#container--shiftTabs'
  )

  if (shiftTabsContainerElement !== null) {
    shiftLog.initializeRecordTabs(shiftTabsContainerElement as HTMLElement)

    // Update Edit button href to preserve the selected tab
    const editButtonLink = document.querySelector(
      'a.button[href$="/edit"]'
    ) as HTMLAnchorElement | null

    if (editButtonLink !== null) {
      const menuTabLinks = shiftTabsContainerElement.querySelectorAll('.menu a')

      // Set initial hash on Edit button based on active tab
      const activeTabLink = shiftTabsContainerElement.querySelector(
        '.menu a.is-active'
      ) as HTMLAnchorElement | null

      if (activeTabLink !== null) {
        const tabHash = activeTabLink.getAttribute('href') ?? ''
        const baseHref = editButtonLink.href.split('#')[0]
        editButtonLink.href = baseHref + tabHash
      }

      // Update Edit button href when tabs are clicked
      for (const menuTabLink of menuTabLinks) {
        menuTabLink.addEventListener('click', (clickEvent) => {
          const target = clickEvent.currentTarget as HTMLAnchorElement
          const tabHash = target.getAttribute('href') ?? ''

          // Update the Edit button href to include the selected tab hash
          const baseHref = editButtonLink.href.split('#')[0]
          editButtonLink.href = baseHref + tabHash
        })
      }
    }
  }
})()
