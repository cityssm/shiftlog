;(() => {
  const workOrderHighlightsPanelElement = document.querySelector(
    '#panel--workOrderHighlights'
  ) as HTMLElement | null

  if (workOrderHighlightsPanelElement === null) {
    return
  }

  function toggleWorkOrderPanelTab(event: Event): void {
    event.preventDefault()

    const target = event.currentTarget as HTMLAnchorElement

    const panelTabElements =
      workOrderHighlightsPanelElement.querySelectorAll('.panel-tabs a')

    for (const panelTabElement of panelTabElements) {
      panelTabElement.classList.remove('is-active')
    }

    target.classList.add('is-active')

    const workOrderType = target.dataset.workOrderType ?? 'recent'

    const panelBlockElements =
      workOrderHighlightsPanelElement.querySelectorAll(
        '.panel-block[data-work-order-type]'
      )

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.classList.toggle(
        'is-hidden',
        (panelBlockElement as HTMLElement).dataset.workOrderType !== workOrderType
      )
    }
  }

  const panelTabElements =
    workOrderHighlightsPanelElement.querySelectorAll('.panel-tabs a')

  for (const panelTabElement of panelTabElements) {
    panelTabElement.addEventListener('click', toggleWorkOrderPanelTab)
  }
})()
