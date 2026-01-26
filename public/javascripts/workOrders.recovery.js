(() => {
    const resultsContainerElement = document.querySelector('#container--deletedRecordResults');
    function recoverWorkOrder(workOrderId) {
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Recover Work Order?',
            message: 'Are you sure you want to recover this work order?',
            okButton: {
                text: 'Yes, Recover',
                callbackFunction: () => {
                    cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doRecoverWorkOrder`, { workOrderId }, (response) => {
                        if (response.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Work Order Recovered',
                                message: 'The work order has been recovered successfully.',
                                okButton: {
                                    callbackFunction: () => {
                                        globalThis.location.href = response.redirectUrl;
                                    }
                                }
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error',
                                message: response.errorMessage ?? 'Failed to recover work order.'
                            });
                        }
                    });
                }
            }
        });
    }
    function renderDeletedRecordsTable(data) {
        if (data.workOrders.length === 0) {
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
          <th>Number</th>
          <th>Type</th>
          <th>Location</th>
          <th>Status</th>
          <th>Open Date</th>
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
        for (const workOrder of data.workOrders) {
            const tableRowElement = document.createElement('tr');
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ `
        <td>
          ${cityssm.escapeHTML(workOrder.workOrderNumber)}
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderType ?? '-')}</td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1)}
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}</td>
        <td>
          ${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}
        </td>
        <td>${cityssm.escapeHTML(workOrder.recordDelete_userName ?? '')}</td>
        <td>
          ${workOrder.recordDelete_dateTime ? cityssm.dateToString(new Date(workOrder.recordDelete_dateTime)) : ''}
        </td>
        <td>
          <button
            class="button is-small is-primary is-light"
            data-work-order-id="${workOrder.workOrderId}"
            type="button"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-undo"></i>
            </span>
            <span>Recover</span>
          </button>
        </td>
      `;
            const recoverButton = tableRowElement.querySelector('button');
            recoverButton.addEventListener('click', () => {
                recoverWorkOrder(workOrder.workOrderId);
            });
            tableBodyElement.append(tableRowElement);
        }
        resultsContainerElement.innerHTML = '';
        resultsContainerElement.append(tableElement);
    }
    function getDeletedRecords() {
        resultsContainerElement.innerHTML = /* html */ `
      <div class="message">
        <p class="message-body has-text-centered">
          <span class="icon"><i class="fa-solid fa-spinner fa-spin"></i></span>
          <span>Loading...</span>
        </p>
      </div>
    `;
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doGetDeletedWorkOrders`, {}, renderDeletedRecordsTable);
    }
    getDeletedRecords();
})();
