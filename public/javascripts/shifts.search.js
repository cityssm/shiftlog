(() => {
    const shiftLog = exports.shiftLog;
    const filtersFormElement = document.querySelector('#form--shiftSearch');
    const offsetInputElement = document.querySelector('#searchSearch--offset');
    const resultsContainerElement = document.querySelector('#container--shiftSearchResults');
    function renderShiftsTable(data) {
        if (data.shifts.length === 0) {
            resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No records found.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable is-narrow';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Date</th>
          <th>Time</th>
          <th>Supervisor</th>
          <th class="has-width-1">
            <span class="is-sr-only">Properties</span>
          </th>
          <th class="has-width-1 is-hidden-print">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const shift of data.shifts) {
            const tableRowElement = document.createElement('tr');
            // Build counts icons HTML
            const workOrdersIconHTML = shift.workOrdersCount && shift.workOrdersCount > 0
                ? /* html */ `
            <span class="icon" title="${shift.workOrdersCount} work order(s)">
              <i class="fa-solid fa-clipboard-list"></i>
            </span>
          `
                : '';
            const employeesIconHTML = shift.employeesCount && shift.employeesCount > 0
                ? /* html */ `
            <span class="icon" title="${shift.employeesCount} employee(s)">
              <i class="fa-solid fa-users"></i>
            </span>
          `
                : '';
            const crewsIconHTML = shift.crewsCount && shift.crewsCount > 0
                ? /* html */ `
            <span class="icon" title="${shift.crewsCount} crew(s)">
              <i class="fa-solid fa-users-gear"></i>
            </span>
          `
                : '';
            const equipmentIconHTML = shift.equipmentCount && shift.equipmentCount > 0
                ? /* html */ `
            <span class="icon" title="${shift.equipmentCount} equipment">
              <i class="fa-solid fa-truck"></i>
            </span>
          `
                : '';
            const timesheetsIconHTML = shift.timesheetsCount && shift.timesheetsCount > 0
                ? /* html */ `
            <span class="icon" title="${shift.timesheetsCount} timesheet(s)">
              <i class="fa-solid fa-clock"></i>
            </span>
          `
                : '';
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ `
        <td>
          <a href="${shiftLog.buildShiftURL(shift.shiftId)}">
            ${cityssm.escapeHTML(shift.shiftId.toString())}
          </a>
        </td>
        <td>${cityssm.escapeHTML(shift.shiftTypeDataListItem ?? '(Unknown Shift Type)')}</td>
        <td>${cityssm.dateToString(new Date(shift.shiftDate))}</td>
        <td>${cityssm.escapeHTML(shift.shiftTimeDataListItem ?? '(Unknown Shift Time)')}</td>
        <td>
          ${cityssm.escapeHTML(shift.supervisorLastName ?? '')}, ${cityssm.escapeHTML(shift.supervisorFirstName ?? '')}
        </td>
        <td>
          ${workOrdersIconHTML}
          ${crewsIconHTML}
          ${employeesIconHTML}
          ${equipmentIconHTML}
          ${timesheetsIconHTML}
        </td>
        <td class="is-hidden-print">
          <a
            class="button is-small is-info is-light"
            href="${shiftLog.buildShiftURL(shift.shiftId)}/print"
            title="Print Shift"
            target="_blank"
          >
            <span class="icon is-small"><i class="fa-solid fa-print"></i></span>
          </a>
        </td>
      `;
            tableBodyElement.append(tableRowElement);
        }
        resultsContainerElement.replaceChildren(tableElement);
        // Pagination
        resultsContainerElement.append(shiftLog.buildPaginationControls({
            totalCount: data.totalCount,
            currentPageOrOffset: data.offset,
            itemsPerPageOrLimit: data.limit,
            clickHandler: (pageNumber) => {
                offsetInputElement.value = ((pageNumber - 1) * data.limit).toString();
                getSearchResults();
            }
        }));
    }
    function getSearchResults() {
        resultsContainerElement.innerHTML = /* html */ `
      <div class="has-text-centered py-5">
        <span class="icon is-large has-text-grey-lighter">
          <i class="fa-solid fa-spinner fa-pulse fa-2x"></i>
        </span>
      </div>
    `;
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doSearchShifts`, filtersFormElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderShiftsTable(responseJSON);
        });
    }
    filtersFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
    });
    const formElements = filtersFormElement.querySelectorAll('input, select');
    for (const formElement of formElements) {
        formElement.addEventListener('change', () => {
            offsetInputElement.value = '0';
            getSearchResults();
        });
    }
    getSearchResults();
})();
