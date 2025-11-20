(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.timesheetsRouter;
    const formElement = document.querySelector('#form--timesheetSearch');
    const searchResultsContainerElement = document.querySelector('#container--timesheetSearchResults');
    const offsetElement = formElement.querySelector('#timesheetSearch--offset');
    const currentTimesheetDateString = cityssm.dateToString(new Date());
    function buildPaginationControls(totalCount, limit, offset) {
        const paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        let paginationHTML = '';
        // Previous button
        paginationHTML +=
            currentPage > 1
                ? `<a class="pagination-previous" href="#" data-page-number="${currentPage - 1}">Previous</a>`
                : `<a class="pagination-previous" disabled>Previous</a>`;
        // Next button
        paginationHTML +=
            currentPage < totalPages
                ? `<a class="pagination-next" href="#" data-page-number="${currentPage + 1}">Next</a>`
                : '<a class="pagination-next" disabled>Next</a>';
        // Page numbers
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
        // Event listeners
        const pageLinks = paginationElement.querySelectorAll('a.pagination-previous, a.pagination-next, a.pagination-link');
        for (const pageLink of pageLinks) {
            pageLink.addEventListener('click', (event) => {
                event.preventDefault();
                const target = event.currentTarget;
                const pageNumberString = target.dataset.pageNumber;
                if (pageNumberString !== undefined) {
                    const pageNumber = Number.parseInt(pageNumberString, 10);
                    offsetElement.value = ((pageNumber - 1) * limit).toString();
                    doSearch();
                }
            });
        }
        return paginationElement;
    }
    function renderTimesheetResults(data) {
        if (data.timesheets.length === 0) {
            searchResultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No records found.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Date</th>
          <th>Title</th>
          <th>Supervisor</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const timesheet of data.timesheets) {
            const timesheetDate = typeof timesheet.timesheetDate === 'string'
                ? new Date(timesheet.timesheetDate)
                : timesheet.timesheetDate;
            const tableRowElement = document.createElement('tr');
            tableRowElement.innerHTML = /* html */ `
        <td>
          <a href="${exports.shiftLog.buildTimesheetURL(timesheet.timesheetId)}">
            ${cityssm.escapeHTML(timesheet.timesheetId.toString())}
          </a>
        </td>
        <td>${cityssm.escapeHTML(timesheet.timesheetTypeDataListItem ?? '(Unknown Timesheet Type)')}</td>
        <td>${cityssm.dateToString(timesheetDate)}</td>
        <td>${cityssm.escapeHTML(timesheet.timesheetTitle === '' ? '(No Title)' : timesheet.timesheetTitle)}</td>
        <td>
          ${cityssm.escapeHTML(timesheet.supervisorLastName ?? '')}, ${cityssm.escapeHTML(timesheet.supervisorFirstName ?? '')}
        </td>
      `;
            tableBodyElement.append(tableRowElement);
        }
        searchResultsContainerElement.replaceChildren(tableElement);
        // Pagination
        searchResultsContainerElement.append(buildPaginationControls(data.totalCount, data.limit, data.offset));
    }
    function doSearch() {
        cityssm.postJSON(`${urlPrefix}/doSearchTimesheets`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderTimesheetResults(responseJSON);
        });
    }
    // Set up search on change
    formElement.addEventListener('change', () => {
        offsetElement.value = '0';
        doSearch();
    });
    // Initial search with current date
    const timesheetDateStringElement = document.createElement('input');
    timesheetDateStringElement.name = 'timesheetDateString';
    timesheetDateStringElement.type = 'hidden';
    timesheetDateStringElement.value = currentTimesheetDateString;
    formElement.prepend(timesheetDateStringElement);
    doSearch();
})();
