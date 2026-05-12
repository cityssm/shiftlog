(() => {
    const shiftLog = exports.shiftLog;
    const filtersFormElement = document.querySelector('#form--workOrderSearch');
    const offsetInputElement = document.querySelector('#workOrderSearch--offset');
    const orderByInputElement = document.querySelector('#workOrderSearch--orderBy');
    const resultsContainerElement = document.querySelector('#container--workOrderSearchResults');
    const sortableColumns = {
        assignedToName: {
            defaultDirection: 'asc',
            label: 'Assigned To'
        },
        locationAddress1: {
            defaultDirection: 'asc',
            label: 'Location'
        },
        requestorName: {
            defaultDirection: 'asc',
            label: 'Requestor'
        },
        workOrderNumber: {
            defaultDirection: 'desc',
            label: shiftLog.workOrdersSectionNameSingular
        },
        workOrderOpenDateTime: {
            defaultDirection: 'desc',
            label: 'Open Date'
        }
    };
    function isValidHex(color) {
        return color !== undefined && /^[0-9a-f]{6}$/i.test(color);
    }
    function getCurrentSort() {
        const [column, direction = 'asc'] = orderByInputElement.value
            .trim()
            .split(/\s+/);
        if (Object.hasOwn(sortableColumns, column) &&
            (direction === 'asc' || direction === 'desc')) {
            return {
                column: column,
                direction
            };
        }
        return {
            column: 'workOrderOpenDateTime',
            direction: sortableColumns.workOrderOpenDateTime.defaultDirection
        };
    }
    function buildSortableHeaderHTML(column) {
        const currentSort = getCurrentSort();
        const isCurrentSort = currentSort.column === column;
        let ariaSort = 'none';
        let iconClass = 'fa-sort';
        if (isCurrentSort) {
            if (currentSort.direction === 'asc') {
                ariaSort = 'ascending';
                iconClass = 'fa-sort-up';
            }
            else {
                ariaSort = 'descending';
                iconClass = 'fa-sort-down';
            }
        }
        let nextDirection = sortableColumns[column].defaultDirection;
        if (isCurrentSort) {
            nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }
        const directionLabel = nextDirection === 'asc' ? 'ascending' : 'descending';
        const label = sortableColumns[column].label;
        return `
      <th aria-sort="${ariaSort}">
        <button
          class="button is-ghost has-text-weight-bold p-0"
          data-order-by-column="${column}"
          type="button"
          title="Sort by ${cityssm.escapeHTML(label)} ${directionLabel}"
          aria-label="Sort by ${cityssm.escapeHTML(label)} ${directionLabel}"
        >
          <span>${cityssm.escapeHTML(label)}</span>
          <span class="icon is-small" aria-hidden="true">
            <i class="fa-solid ${iconClass}"></i>
          </span>
        </button>
      </th>
    `;
    }
    function setSortOrder(column) {
        const currentSort = getCurrentSort();
        let nextDirection = sortableColumns[column].defaultDirection;
        if (currentSort.column === column) {
            nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }
        orderByInputElement.value = `${column} ${nextDirection}`;
        resetOffsetAndGetResults();
    }
    const showWorkOrderType = filtersFormElement.querySelector('#workOrderSearch--workOrderTypeId') !==
        null;
    function renderWorkOrdersTable(data) {
        if (data.workOrders.length === 0) {
            resultsContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">No records found.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable is-narrow';
        tableElement.innerHTML = `
      <thead>
        <tr>
          <th class="has-width-1">
            <span class="is-sr-only">Open / Closed</span>
          </th>
          ${buildSortableHeaderHTML('workOrderNumber')}
          ${buildSortableHeaderHTML('locationAddress1')}
          ${buildSortableHeaderHTML('workOrderOpenDateTime')}
          ${buildSortableHeaderHTML('requestorName')}
          ${buildSortableHeaderHTML('assignedToName')}
          <th>
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
        const currentUserEmailAddress = shiftLog.emailAddress.toLowerCase();
        for (const workOrder of data.workOrders) {
            const tableRowElement = document.createElement('tr');
            let openClosedIconHTML;
            if (workOrder.workOrderCloseDateTime !== null) {
                openClosedIconHTML =
                    '<span class="icon has-text-grey" title="Closed"><i class="fa-solid fa-stop"></i></span>';
            }
            else if (workOrder.workOrderDueDateTime !== null &&
                new Date(workOrder.workOrderDueDateTime) < new Date()) {
                openClosedIconHTML =
                    '<span class="icon has-text-danger" title="Overdue"><i class="fa-solid fa-exclamation-triangle"></i></span>';
            }
            else if (workOrder.isUpdated ?? false) {
                openClosedIconHTML =
                    '<span class="icon has-text-success" title="Open"><i class="fa-solid fa-play"></i></span>';
            }
            else {
                openClosedIconHTML =
                    '<span class="icon has-text-warning" title="New"><i class="fa-solid fa-star"></i></span>';
            }
            let extraDateHTML = '';
            if (workOrder.workOrderCloseDateTime !== null) {
                extraDateHTML = `<i class="fa-solid fa-stop" title="Close Date"></i> ${cityssm.dateToString(new Date(workOrder.workOrderCloseDateTime ?? ''))}`;
            }
            else if (workOrder.workOrderDueDateTime !== null) {
                extraDateHTML = `<i class="fa-solid fa-exclamation-triangle" title="Due Date"></i> ${cityssm.dateToString(new Date(workOrder.workOrderDueDateTime ?? ''))}`;
            }
            let tagsHTML = '';
            if (workOrder.tags && workOrder.tags.length > 0) {
                const tagsElements = workOrder.tags
                    .map((tag) => {
                    const backgroundColor = isValidHex(tag.tagBackgroundColor)
                        ? `#${tag.tagBackgroundColor}`
                        : '';
                    const textColor = isValidHex(tag.tagTextColor)
                        ? `#${tag.tagTextColor}`
                        : '';
                    const style = backgroundColor && textColor
                        ? `style="background-color: ${backgroundColor}; color: ${textColor};"`
                        : '';
                    return `<span class="tag is-small" ${style}>${cityssm.escapeHTML(tag.tagName)}</span>`;
                })
                    .join(' ');
                tagsHTML = `<div class="tags mt-1">${tagsElements}</div>`;
            }
            const attachmentIconHTML = workOrder.attachmentsCount && workOrder.attachmentsCount > 0
                ? `
            <span class="icon" title="${workOrder.attachmentsCount} attachment(s)">
              <i class="fa-solid fa-paperclip"></i>
            </span>
          `
                : '';
            const thumbnailIconHTML = workOrder.thumbnailAttachmentId
                ? `
          <a
            class="icon has-text-info"
            href="${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/attachments/${workOrder.thumbnailAttachmentId}/inline"
            title="View thumbnail image"
            target="_blank"
          >
            <i class="fa-solid fa-image"></i>
          </a>
        `
                : '';
            const notesIconHTML = workOrder.notesCount && workOrder.notesCount > 0
                ? `
            <span class="icon" title="${workOrder.notesCount} note(s)">
              <i class="fa-solid fa-note-sticky"></i>
            </span>
          `
                : '';
            const costsIconHTML = workOrder.costsCount &&
                workOrder.costsCount > 0 &&
                workOrder.costsTotal !== undefined
                ? `
            <span class="icon" title="Total Cost: $${workOrder.costsTotal.toFixed(2)}">
              <i class="fa-solid fa-dollar-sign"></i>
            </span>
          `
                : '';
            const equipmentIconHTML = workOrder.equipmentCount && workOrder.equipmentCount > 0
                ? `
            <span class="icon" title="${workOrder.equipmentCount} ${cityssm.escapeHTML(shiftLog.equipmentSectionName.toLowerCase())}">
              <i class="fa-solid ${shiftLog.equipmentIconClass}"></i>
            </span>
          `
                : '';
            tableRowElement.innerHTML = `
        <td class="has-text-centered">
          ${openClosedIconHTML}<br />
          ${workOrder.milestonesCount && workOrder.milestonesCount > 0
                ? `
                <span class="tag">
                  ${workOrder.milestonesCompletedCount} / ${workOrder.milestonesCount}
                </span>
              `
                : ''}
        </td>
        <td>
          <a class="has-text-weight-semibold" href="${shiftLog.buildWorkOrderURL(workOrder.workOrderId, exports.preferEdit)}">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a>
          ${thumbnailIconHTML}
          ${workOrder.workOrderTitle ? `<br /><span class="is-size-7 has-text-weight-semibold">${cityssm.escapeHTML(workOrder.workOrderTitle)}</span>` : ''}
          <br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(showWorkOrderType || workOrder.workOrderStatusDataListItem !== null || workOrder.workOrderPriorityDataListItem !== null ? (workOrder.workOrderType ?? '-') : '')}
            ${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem === null ? '' : ` - ${workOrder.workOrderStatusDataListItem}`)}
            ${cityssm.escapeHTML(workOrder.workOrderPriorityDataListItem === null ? '' : ` - ${workOrder.workOrderPriorityDataListItem}`)}
          </span>
          ${tagsHTML}
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1)}<br />
          <span class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(workOrder.locationAddress2)}
          </span>
        </td>
        <td>
          ${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}<br />
          <span class="is-size-7 has-text-grey">
            ${extraDateHTML}
          </span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.requestorName.trim() === '' ? '-' : workOrder.requestorName)}<br />
          <span class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(workOrder.requestorContactInfo.trim())}
          </span>
        </td>
        <td class="${currentUserEmailAddress !== '' && workOrder.assignedToEmailAddress?.toLowerCase() === currentUserEmailAddress ? 'has-background-primary-light' : ''}">
          ${cityssm.escapeHTML((workOrder.assignedToName ?? '') === '' ? '-' : (workOrder.assignedToName ?? ''))}
        </td>
        <td class="has-text-right">
          ${notesIconHTML}
          ${equipmentIconHTML}
          ${attachmentIconHTML}
          ${costsIconHTML}
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
        const sortButtons = tableElement.querySelectorAll('[data-order-by-column]');
        for (const sortButton of sortButtons) {
            sortButton.addEventListener('click', () => {
                const sortColumn = sortButton.dataset.orderByColumn;
                if (sortColumn !== undefined &&
                    Object.hasOwn(sortableColumns, sortColumn)) {
                    setSortOrder(sortColumn);
                }
            });
        }
        resultsContainerElement.replaceChildren(tableElement);
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
        resultsContainerElement.innerHTML = `
      <div class="has-text-centered py-5">
        <span class="icon is-large has-text-grey-lighter">
          <i class="fa-solid fa-spinner fa-pulse fa-2x"></i>
        </span>
      </div>
    `;
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doSearchWorkOrders`, filtersFormElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderWorkOrdersTable(responseJSON);
        });
    }
    filtersFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
    });
    function resetOffsetAndGetResults() {
        offsetInputElement.value = '0';
        getSearchResults();
    }
    const formElements = filtersFormElement.querySelectorAll('input, select');
    for (const formElement of formElements) {
        formElement.addEventListener('change', resetOffsetAndGetResults);
    }
    document
        .querySelector('#workOrderSearch--limit')
        ?.addEventListener('change', resetOffsetAndGetResults);
    const doRefreshCheckbox = document.querySelector('#workOrderSearch--doRefresh');
    const doRefreshSessionStorageKey = 'workOrderSearch--doRefresh';
    const savedDoRefresh = sessionStorage.getItem(doRefreshSessionStorageKey);
    if (savedDoRefresh !== null) {
        doRefreshCheckbox.checked = savedDoRefresh === 'true';
    }
    doRefreshCheckbox.addEventListener('change', () => {
        sessionStorage.setItem(doRefreshSessionStorageKey, doRefreshCheckbox.checked.toString());
    });
    setInterval(() => {
        if (doRefreshCheckbox.checked) {
            getSearchResults();
        }
    }, 60 * 1000);
    getSearchResults();
})();
