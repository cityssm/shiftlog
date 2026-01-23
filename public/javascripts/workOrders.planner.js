(() => {
    const shiftLog = exports.shiftLog;
    const filtersFormElement = document.querySelector('#form--workOrderPlanner');
    const dateFilterElement = document.querySelector('#workOrderPlanner--dateFilter');
    const daysThresholdElement = document.querySelector('#workOrderPlanner--daysThreshold');
    const offsetInputElement = document.querySelector('#workOrderPlanner--offset');
    const resultsContainerElement = document.querySelector('#container--workOrderPlannerResults');
    // Enable/disable days threshold based on date filter selection
    dateFilterElement.addEventListener('change', () => {
        const requiresDays = [
            'dueInDays',
            'milestonesDueInDays',
            'noUpdatesForDays',
            'openForDays'
        ].includes(dateFilterElement.value);
        daysThresholdElement.disabled = !requiresDays;
        if (requiresDays && daysThresholdElement.value === '') {
            daysThresholdElement.value = '7';
        }
    });
    function renderWorkOrdersTable(data) {
        if (data.workOrders.length === 0) {
            resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">
            No ${cityssm.escapeHTML(shiftLog.workOrdersSectionName.toLowerCase())} found matching the selected criteria.
          </p>
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
          <th class="has-width-1">
            <span class="is-sr-only">Priority</span>
          </th>
          <th>Number</th>
          <th>Location</th>
          <th>Status</th>
          <th>Open Date</th>
          <th>Due Date</th>
          <th>Requestor</th>
          <th>Assigned To</th>
          <th class="has-width-1 is-hidden-print">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const workOrder of data.workOrders) {
            const tableRowElement = document.createElement('tr');
            let priorityIconHTML = '<span class="icon has-text-success" title="Open"><i class="fa-solid fa-circle"></i></span>';
            const now = new Date();
            const isOverdue = workOrder.workOrderDueDateTime !== null &&
                new Date(workOrder.workOrderDueDateTime) < now;
            if (isOverdue) {
                priorityIconHTML =
                    '<span class="icon has-text-danger" title="Overdue"><i class="fa-solid fa-exclamation-triangle"></i></span>';
                tableRowElement.classList.add('has-background-danger-light');
            }
            const openDate = cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime));
            const daysOpen = Math.floor((now.getTime() -
                new Date(workOrder.workOrderOpenDateTime).getTime()) /
                (1000 * 60 * 60 * 24));
            const dueDateHTML = workOrder.workOrderDueDateTime === null
                ? '-'
                : cityssm.dateToString(new Date(workOrder.workOrderDueDateTime));
            const milestonesHTML = workOrder.milestonesCount && workOrder.milestonesCount > 0
                ? /* html */ `
            <span class="tag ${workOrder.overdueMilestonesCount && workOrder.overdueMilestonesCount > 0 ? 'is-danger' : 'is-info'}">
              ${workOrder.milestonesCompletedCount} / ${workOrder.milestonesCount}
            </span>
          `
                : '';
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ `
        <td class="has-text-centered">
          ${priorityIconHTML}<br />
          ${milestonesHTML}
        </td>
        <td>
          <a class="has-text-weight-semibold" href="${shiftLog.buildWorkOrderURL(workOrder.workOrderId)}">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a><br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(workOrder.workOrderType ?? '-')}
          </span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1)}<br />
          <span class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(workOrder.locationAddress2)}
          </span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}<br />
          <span class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(workOrder.workOrderPriorityDataListItem ?? '(No Priority)')}
          </span>
        </td>
        <td>
          ${openDate}<br />
          <span class="is-size-7 has-text-grey">
            (${daysOpen} ${daysOpen === 1 ? 'day' : 'days'} ago)
          </span>
        </td>
        <td class="${isOverdue ? 'has-text-danger has-text-weight-bold' : ''}">
          ${dueDateHTML}
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.requestorName.trim() === '' ? '-' : workOrder.requestorName)}
        </td>
        <td>
          ${cityssm.escapeHTML((workOrder.assignedToName ?? '') === '' ? '(Unassigned)' : (workOrder.assignedToName ?? ''))}
        </td>
        <td class="is-hidden-print">
          <a
            class="button is-small is-info is-light"
            href="${shiftLog.buildWorkOrderURL(workOrder.workOrderId)}/print"
            title="Print Work Order"
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
                getPlannerResults();
            }
        }));
    }
    function getPlannerResults() {
        resultsContainerElement.innerHTML = /* html */ `
      <div class="has-text-centered py-5">
        <span class="icon is-large has-text-grey-lighter">
          <i class="fa-solid fa-spinner fa-pulse fa-2x"></i>
        </span>
      </div>
    `;
        // Handle "unassigned" special value
        const formData = new FormData(filtersFormElement);
        const requestData = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'assignedToId' && value === 'unassigned') {
                requestData.includeUnassigned = true;
            }
            else {
                requestData[key] = value;
            }
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetWorkOrdersForPlanner`, requestData, (responseJSON) => {
            renderWorkOrdersTable(responseJSON);
        });
    }
    filtersFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
    });
    const formElements = filtersFormElement.querySelectorAll('input, select');
    for (const formElement of formElements) {
        formElement.addEventListener('change', () => {
            offsetInputElement.value = '0';
            getPlannerResults();
        });
    }
    getPlannerResults();
})();
export {};
