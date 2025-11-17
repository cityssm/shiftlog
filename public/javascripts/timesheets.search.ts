// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import type { DateString } from '@cityssm/utils-datetime'
import { dateToString } from '@cityssm/utils-datetime'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Timesheet } from '../../types/record.types.js'

declare const cityssm: cityssmGlobal
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''
  const timesheetRouter =
    document.querySelector('main')?.dataset.timesheetRouter ?? ''

  const formElement = document.querySelector(
    '#form--timesheetSearch'
  ) as HTMLFormElement

  const searchResultsContainerElement = document.querySelector(
    '#container--timesheetSearchResults'
  ) as HTMLElement

  const offsetElement = formElement.querySelector(
    '#timesheetSearch--offset'
  ) as HTMLInputElement

  let currentTimesheetDateString: DateString = dateToString(new Date())

  function renderTimesheetResults(
    timesheets: Timesheet[],
    totalCount: number
  ): void {
    if (timesheets.length === 0) {
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no timesheets that meet the search criteria.</p>
      </div>`
      return
    }

    let resultsHTML = `<div class="panel">
      <div class="panel-heading">
        Search Results (${totalCount} result${totalCount === 1 ? '' : 's'})
      </div>`

    for (const timesheet of timesheets) {
      const timesheetDate =
        typeof timesheet.timesheetDate === 'string'
          ? new Date(timesheet.timesheetDate)
          : timesheet.timesheetDate

      resultsHTML += `<a class="panel-block" href="${urlPrefix}/${timesheetRouter}/${timesheet.timesheetId}">
        <div class="media">
          <div class="media-left">
            <i class="fa-solid fa-2x fa-clock"></i>
          </div>
          <div class="media-content">
            ${timesheet.timesheetTypeDataListItem ?? ''}${timesheet.timesheetTitle ? ': ' + timesheet.timesheetTitle : ''}<br />
            <small>
              <strong>Date:</strong> ${timesheetDate.toLocaleDateString()}
              | <strong>Supervisor:</strong> ${timesheet.supervisorFirstName ?? ''} ${timesheet.supervisorLastName ?? ''} (Emp #${timesheet.supervisorEmployeeNumber ?? ''})
            </small>
          </div>
        </div>
      </a>`
    }

    resultsHTML += '</div>'

    searchResultsContainerElement.innerHTML = resultsHTML
  }

  async function doSearch(): Promise<void> {
    const formData = new FormData(formElement)
    const searchData: Record<string, string> = {}

    for (const [key, value] of formData.entries()) {
      searchData[key] = value.toString()
    }

    try {
      const response = await fetch(
        `${urlPrefix}/${timesheetRouter}/doSearchTimesheets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchData)
        }
      )

      const result = await response.json()

      renderTimesheetResults(result.timesheets, result.totalCount)
    } catch {
      cityssm.alertModal(
        'Search Error',
        'An error occurred while searching for timesheets.',
        'error'
      )
    }
  }

  // Set up search on change
  formElement.addEventListener('change', () => {
    offsetElement.value = '0'
    void doSearch()
  })

  // Initial search with current date
  const timesheetDateStringElement = document.createElement('input')
  timesheetDateStringElement.name = 'timesheetDateString'
  timesheetDateStringElement.type = 'hidden'
  timesheetDateStringElement.value = currentTimesheetDateString
  formElement.insertAdjacentElement('afterbegin', timesheetDateStringElement)

  void doSearch()
})()
