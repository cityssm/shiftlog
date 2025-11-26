;(() => {
  /*
   * Make form read only
   */

  const formElement = document.querySelector(
    '#form--timesheet'
  ) as HTMLFormElement | null

  formElement?.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  const inputElements = formElement?.querySelectorAll(
    'input, select, textarea'
  ) as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

  for (const inputElement of inputElements) {
    inputElement.disabled = true

    if (inputElement.tagName.toLowerCase() !== 'select') {
      ;(inputElement as HTMLInputElement | HTMLTextAreaElement).readOnly = true
    }
  }
})()
