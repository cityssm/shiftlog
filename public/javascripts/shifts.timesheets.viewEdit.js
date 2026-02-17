(() => {
    const shiftLog = exports.shiftLog;
    const shiftId = document.querySelector('#shift--shiftId').value;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    function loadShiftTimesheets() {
        const container = document.querySelector('#container--shiftTimesheets');
        if (!container)
            return;
        cityssm.postJSON(`${urlPrefix}/doGetShiftTimesheets`, { shiftId: shiftId }, (responseJSON) => {
            // Update the indicator icon
            const indicatorIcon = document.querySelector('#icon--hasTimesheets');
            if (indicatorIcon && responseJSON.timesheets.length > 0) {
                indicatorIcon.classList.remove('is-hidden');
            }
            if (responseJSON.timesheets.length === 0) {
                container.innerHTML = /* html */ `
            <div class="message is-info">
              <p class="message-body">
                No related ${cityssm.escapeHTML(shiftLog.timesheetsSectionName.toLowerCase())} found for this shift.
              </p>
            </div>
          `;
                return;
            }
            const tableContainerElement = document.createElement('div');
            tableContainerElement.className = 'table-container';
            tableContainerElement.innerHTML = /* html */ `
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Timesheet ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Title</th>
                <th>Supervisor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        `;
            for (const timesheet of responseJSON.timesheets) {
                const timesheetDate = new Date(timesheet.timesheetDate).toLocaleDateString();
                const timesheetUrl = shiftLog.buildTimesheetURL(timesheet.timesheetId);
                let statusBadge;
                if (timesheet.recordSubmitted_dateTime) {
                    statusBadge = '<span class="tag is-success">Submitted</span>';
                }
                else if (timesheet.employeesEntered_dateTime ||
                    timesheet.equipmentEntered_dateTime) {
                    statusBadge = '<span class="tag is-warning">Data Entered</span>';
                }
                else {
                    statusBadge = '<span class="tag is-info">Draft</span>';
                }
                const tableRowElement = document.createElement('tr');
                // eslint-disable-next-line no-unsanitized/property
                tableRowElement.innerHTML = /* html */ `
            <td>
              <a href="${cityssm.escapeHTML(timesheetUrl)}">
                #${cityssm.escapeHTML(timesheet.timesheetId.toString())}
              </a>
            </td>
            <td>${cityssm.escapeHTML(timesheetDate)}</td>
            <td>
              ${cityssm.escapeHTML(timesheet.timesheetTypeDataListItem ?? '')}
            </td>
            <td>
              ${cityssm.escapeHTML(timesheet.timesheetTitle)}
            </td>
            <td>
              ${cityssm.escapeHTML(`${timesheet.supervisorLastName ?? ''},
                ${timesheet.supervisorFirstName ?? ''}`)}
            </td>
            <td>${statusBadge}</td>
          `;
                tableContainerElement.querySelector('tbody')?.append(tableRowElement);
            }
            container.replaceChildren(tableContainerElement);
        });
    }
    loadShiftTimesheets();
})();
