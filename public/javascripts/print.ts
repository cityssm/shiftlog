;(() => {
  function removeReportBlock(event: Event): void {
    const buttonElement = event.currentTarget as HTMLButtonElement
    const reportBlockElement = buttonElement.closest(
      '.report-block'
    ) as HTMLDivElement

    reportBlockElement.remove()
  }

  const deleteReportBlockButtonElements = document.querySelectorAll(
    '.is-delete-report-block-button'
  )

  for (const buttonElement of deleteReportBlockButtonElements) {
    buttonElement.addEventListener('click', removeReportBlock)
  }
})()
