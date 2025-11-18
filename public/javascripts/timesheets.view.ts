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

  const formElements = formElement?.querySelectorAll(
    'input, select, textarea'
  ) as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

  for (const formElement of formElements) {
    formElement.disabled = true

    if (formElement.tagName.toLowerCase() !== 'select') {
      ;(formElement as HTMLInputElement | HTMLTextAreaElement).readOnly = true
    }
  }
})()
