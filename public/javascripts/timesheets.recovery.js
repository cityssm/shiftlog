(() => {
    const filtersFormElement = document.querySelector('#form--deletedRecordSearch');
    const offsetInputElement = document.querySelector('#deletedRecordSearch--offset');
    const resultsContainerElement = document.querySelector('#container--deletedRecordResults');
    function buildPaginationControls(totalCount, limit, offset) {
        const paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        let paginationHTML = '';
        paginationHTML +=
            currentPage > 1
                ? `<a class="pagination-previous" href="#" data-page-number="${currentPage - 1}">Previous</a>`
                : '<a class="pagination-previous" disabled>Previous</a>';
        paginationHTML +=
            currentPage < totalPages
                ? `<a class="pagination-next" href="#" data-page-number="${currentPage + 1}">Next</a>`
                : '<a class="pagination-next" disabled>Next</a>';
        paginationHTML += '<ul class="pagination-list">';
        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
            paginationHTML +=
                pageNumber === currentPage
                    ? `<li><a class="pagination-link is-current" aria-current="page">${pageNumber}</a></li>`
                    : `<li><a class="pagination-link" href="#" data-page-number="${pageNumber}">${pageNumber}</a></li>`;
        }
        paginationHTML += '</ul>';
        // eslint-disable-next-line no-unsanitized/property
        paginationElement.innerHTML = paginationHTML;
        const pageLinks = paginationElement.querySelectorAll('a.pagination-previous, a.pagination-next, a.pagination-link');
        for (const pageLink of pageLinks) {
            pageLink.addEventListener('click', (event) => {
                event.preventDefault();
                const target = event.currentTarget;
                const pageNumberString = target.dataset.pageNumber;
                if (pageNumberString !== undefined) {
                    const pageNumber = Number.parseInt(pageNumberString, 10);
                    offsetInputElement.value = ((pageNumber - 1) * limit).toString();
                    getDeletedRecords();
                }
            });
        }
        return paginationElement;
    }
    function recoverTimesheet(timesheetId) {
        cityssm.confirmModal('Recover Timesheet?', 'Are you sure you want to recover this timesheet?', 'Yes, Recover', 'warning', async () => {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/timesheets/doRecoverTimesheet`, { timesheetId }, (response) => {
                if (response.success) {
                    cityssm.alertModal('Timesheet Recovered', 'The timesheet has been recovered successfully.', 'success', () => {
                        window.location.href = response.redirectUrl;
                    });
                }
                else {
                    cityssm.alertModal('Error', response.errorMessage ?? 'Failed to recover timesheet.', 'danger');
                }
            });
        });
    }
    function renderDeletedRecordsTable(data) {
        if (data.timesheets.length === 0) {
            resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No deleted records found.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable is-narrow';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Supervisor</th>
          <th>Details</th>
          <th>Deleted By</th>
          <th>Deleted Date</th>
          <th class="has-width-1">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const timesheet of data.timesheets) {
            const tableRowElement = document.createElement('tr');
            const supervisorName = timesheet.supervisorEmployeeSurname || timesheet.supervisorEmployeeGivenName
                ? `${timesheet.supervisorEmployeeSurname ?? ''}, ${timesheet.supervisorEmployeeGivenName ?? ''}`
                : timesheet.supervisorEmployeeNumber ?? '-';
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ `
        <td>
          ${cityssm.dateToString(new Date(timesheet.timesheetDate))}
        </td>
        <td>${cityssm.escapeHTML(timesheet.timesheetTypeDataListItem ?? '-')}</td>
        <td>${cityssm.escapeHTML(supervisorName)}</td>
        <td>${cityssm.escapeHTML((timesheet.timesheetDetails ?? '').substring(0, 100))}${(timesheet.timesheetDetails ?? '').length > 100 ? '...' : ''}</td>
        <td>${cityssm.escapeHTML(timesheet.recordDelete_userName ?? '')}</td>
        <td>
          ${timesheet.recordDelete_dateTime ? cityssm.dateToString(new Date(timesheet.recordDelete_dateTime)) : ''}
        </td>
        <td>
          <button
            class="button is-small is-success is-light"
            data-timesheet-id="${timesheet.timesheetId}"
            type="button">
            <span class="icon is-small">
              <i class="fa-solid fa-undo"></i>
            </span>
            <span>Recover</span>
          </button>
        </td>
      `;
            const recoverButton = tableRowElement.querySelector('button');
            recoverButton.addEventListener('click', () => {
                recoverTimesheet(timesheet.timesheetId);
            });
            tableBodyElement.append(tableRowElement);
        }
        resultsContainerElement.innerHTML = '';
        resultsContainerElement.append(tableElement);
        const formData = new FormData(filtersFormElement);
        const limit = Number.parseInt(formData.get('limit'), 10);
        const offset = Number.parseInt(formData.get('offset'), 10);
        if (data.totalCount > limit) {
            resultsContainerElement.append(buildPaginationControls(data.totalCount, limit, offset));
        }
    }
    async function getDeletedRecords() {
        resultsContainerElement.innerHTML = /* html */ `
      <div class="message">
        <p class="message-body has-text-centered">
          <span class="icon"><i class="fa-solid fa-spinner fa-spin"></i></span>
          <span>Loading...</span>
        </p>
      </div>
    `;
        const formData = new FormData(filtersFormElement);
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/timesheets/doGetDeletedTimesheets`, formData, renderDeletedRecordsTable);
    }
    getDeletedRecords();
})();
