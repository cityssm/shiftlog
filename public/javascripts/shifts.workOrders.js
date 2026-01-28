/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    const workOrdersUrlPrefix = `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}`;
    const shiftIdElement = document.querySelector('#shift--shiftId');
    const shiftId = shiftIdElement.value;
    const isEdit = document.querySelector('#button--addWorkOrder') !== null;
    let shiftWorkOrders = exports.shiftWorkOrders;
    let allMilestones = [];
    function updateCounts() {
        // Update count badges
        const workOrdersCountElement = document.querySelector('#workOrdersCount');
        if (workOrdersCountElement !== null) {
            workOrdersCountElement.textContent = shiftWorkOrders.length.toString();
        }
        const milestonesCountElement = document.querySelector('#milestonesCount');
        if (milestonesCountElement !== null) {
            milestonesCountElement.textContent = allMilestones.length.toString();
        }
        // Show/hide tasks icon indicator
        const hasTasksIconElement = document.querySelector('#icon--hasTasks');
        if (hasTasksIconElement !== null) {
            hasTasksIconElement.classList.toggle('is-hidden', shiftWorkOrders.length === 0);
        }
    }
    function renderShiftWorkOrders() {
        const containerElement = document.querySelector('#container--shiftWorkOrders');
        if (shiftWorkOrders.length === 0) {
            containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No work orders assigned to this shift.</div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Work Order #</th>
          <th>Type</th>
          <th>Status</th>
          <th>Details</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tbodyElement = tableElement.querySelector('tbody');
        for (const workOrder of shiftWorkOrders) {
            const trElement = document.createElement('tr');
            // eslint-disable-next-line no-unsanitized/property
            trElement.innerHTML = /* html */ `
        <td>
          <a href="${workOrdersUrlPrefix}/${workOrder.workOrderId}" target="_blank">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a>
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderType ?? '')}</td>
        <td>
          ${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '')}
          -
          ${cityssm.escapeHTML(workOrder.workOrderPriorityDataListItem ?? '')}
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderDetails.slice(0, 100))}${workOrder.workOrderDetails.length > 100 ? '...' : ''}</td>
        <td>${cityssm.escapeHTML(workOrder.shiftWorkOrderNote)}</td>
        ${isEdit
                ? /* html */ `
              <td class="has-text-right">
                <div class="buttons is-right">
                  <button
                    class="button is-small is-info button--editNote"
                    data-work-order-id="${workOrder.workOrderId}"
                    type="button"
                    aria-label="Edit Note"
                  >
                    <span class="icon is-small"><i class="fa-solid fa-pencil"></i></span>
                  </button>
                  <button
                    class="button is-small is-danger is-light button--delete"
                    data-work-order-id="${workOrder.workOrderId}"
                    type="button"
                    aria-label="Remove"
                  >
                    <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
                  </button>
                </div>
              </td>
            `
                : ''}
      `;
            tbodyElement.append(trElement);
        }
        containerElement.replaceChildren(tableElement);
        if (isEdit) {
            const editNoteButtons = containerElement.querySelectorAll('.button--editNote');
            for (const button of editNoteButtons) {
                button.addEventListener('click', editWorkOrderNote);
            }
            const deleteButtons = containerElement.querySelectorAll('.button--delete');
            for (const button of deleteButtons) {
                button.addEventListener('click', deleteShiftWorkOrder);
            }
        }
    }
    function renderMilestones() {
        const containerElement = document.querySelector('#container--shiftMilestones');
        if (allMilestones.length === 0) {
            containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No milestones on related work orders.</div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Work Order #</th>
          <th>Title</th>
          <th>Description</th>
          <th>Due Date</th>
          <th>Complete</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tbodyElement = tableElement.querySelector('tbody');
        for (const milestone of allMilestones) {
            const workOrder = shiftWorkOrders.find((wo) => wo.workOrderId === milestone.workOrderId);
            const trElement = document.createElement('tr');
            const isComplete = milestone.milestoneCompleteDateTime !== null &&
                milestone.milestoneCompleteDateTime !== undefined;
            // eslint-disable-next-line no-unsanitized/property
            trElement.innerHTML = /* html */ `
        <td>
          ${workOrder === undefined
                ? ''
                : /* html */ `
                <a href="${workOrdersUrlPrefix}/${workOrder.workOrderId}" target="_blank">
                  ${cityssm.escapeHTML(workOrder.workOrderNumber)}
                </a>
              `}
        </td>
        <td>${cityssm.escapeHTML(milestone.milestoneTitle)}</td>
        <td>${cityssm.escapeHTML(milestone.milestoneDescription)}</td>
        <td>${milestone.milestoneDueDateTime !== null && milestone.milestoneDueDateTime !== undefined ? new Date(milestone.milestoneDueDateTime).toLocaleString() : ''}</td>
        <td>
          ${isComplete
                ? /* html */ `<span class="icon has-text-success"><i class="fa-solid fa-check"></i></span> ${new Date(milestone.milestoneCompleteDateTime ?? '').toLocaleString()}`
                : ''}
        </td>
        ${isEdit && !isComplete
                ? /* html */ `
              <td class="has-text-right">
                <button
                  class="button is-small is-primary button--complete"
                  data-work-order-milestone-id="${milestone.workOrderMilestoneId}"
                  type="button"
                >
                  <span class="icon is-small"><i class="fa-solid fa-check"></i></span>
                  <span>Complete</span>
                </button>
              </td>
            `
                : isEdit
                    ? '<td></td>'
                    : ''}
      `;
            tbodyElement.append(trElement);
        }
        containerElement.replaceChildren(tableElement);
        if (isEdit) {
            const completeButtons = containerElement.querySelectorAll('.button--complete');
            for (const button of completeButtons) {
                button.addEventListener('click', completeMilestone);
            }
        }
    }
    function loadMilestones() {
        // Load milestones for all work orders
        allMilestones = [];
        if (shiftWorkOrders.length === 0) {
            renderMilestones();
            updateCounts();
            return;
        }
        let loadedCount = 0;
        for (const workOrder of shiftWorkOrders) {
            cityssm.postJSON(`${workOrdersUrlPrefix}/${workOrder.workOrderId}/doGetWorkOrderMilestones`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.milestones) {
                    allMilestones.push(...responseJSON.milestones);
                }
                loadedCount += 1;
                if (loadedCount === shiftWorkOrders.length) {
                    // Sort milestones by due date
                    allMilestones.sort((a, b) => {
                        if (a.milestoneDueDateTime === null ||
                            a.milestoneDueDateTime === undefined)
                            return 1;
                        if (b.milestoneDueDateTime === null ||
                            b.milestoneDueDateTime === undefined)
                            return -1;
                        return (new Date(a.milestoneDueDateTime).getTime() -
                            new Date(b.milestoneDueDateTime).getTime());
                    });
                    renderMilestones();
                    updateCounts();
                }
            });
        }
    }
    function addWorkOrder(clickEvent) {
        clickEvent.preventDefault();
        let closeModalFunction;
        let modalElement;
        function doSearch(formEvent) {
            formEvent.preventDefault();
            const searchForm = formEvent.currentTarget;
            const searchString = searchForm.querySelector('#addWorkOrder--searchString').value.trim();
            if (searchString.length < 2) {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    message: 'Please enter at least 2 characters to search.'
                });
                return;
            }
            const resultsContainer = modalElement.querySelector('#addWorkOrder--results');
            resultsContainer.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">Searching...</div>
        </div>
      `;
            cityssm.postJSON(`${workOrdersUrlPrefix}/doSearchWorkOrders`, {
                searchString,
                openClosedFilter: 'open',
                limit: 20,
                offset: 0
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (!responseJSON.success || responseJSON.workOrders.length === 0) {
                    resultsContainer.innerHTML = /* html */ `
              <div class="message is-warning">
                <div class="message-body">No open work orders found matching your search.</div>
              </div>
            `;
                    return;
                }
                // Render search results
                const tableElement = document.createElement('table');
                tableElement.className = 'table is-fullwidth is-striped is-hoverable';
                tableElement.innerHTML = /* html */ `
            <thead>
              <tr>
                <th>Work Order #</th>
                <th>Type</th>
                <th>Requestor</th>
                <th>Details</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          `;
                const tbodyElement = tableElement.querySelector('tbody');
                for (const workOrder of responseJSON.workOrders) {
                    const trElement = document.createElement('tr');
                    // eslint-disable-next-line no-unsanitized/property
                    trElement.innerHTML = /* html */ `
              <td>${cityssm.escapeHTML(workOrder.workOrderNumber)}</td>
              <td>${cityssm.escapeHTML(workOrder.workOrderType ?? '')}</td>
              <td>${cityssm.escapeHTML(workOrder.requestorName ?? '')}</td>
              <td>${cityssm.escapeHTML(workOrder.workOrderDetails.slice(0, 50))}${workOrder.workOrderDetails.length > 50 ? '...' : ''}</td>
              <td class="has-text-right">
                <button class="button is-small is-primary button--select" data-work-order-id="${workOrder.workOrderId}" type="button">
                  <span class="icon is-small"><i class="fa-solid fa-check"></i></span>
                  <span>Select</span>
                </button>
              </td>
            `;
                    tbodyElement.append(trElement);
                }
                resultsContainer.replaceChildren(tableElement);
                if (responseJSON.totalCount > 20) {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'message is-info mt-2';
                    messageElement.innerHTML = /* html */ `
              <div class="message-body">
                Showing 20 of ${cityssm.escapeHTML(responseJSON.totalCount.toString())} results.
                Refine your search to see more specific results.
              </div>
            `;
                    resultsContainer.append(messageElement);
                }
                // Add event listeners to select buttons
                const selectButtons = resultsContainer.querySelectorAll('.button--select');
                for (const button of selectButtons) {
                    button.addEventListener('click', (selectEvent) => {
                        selectEvent.preventDefault();
                        const selectedWorkOrderId = selectEvent.currentTarget.dataset.workOrderId;
                        const selectedWorkOrder = responseJSON.workOrders.find((possibleWorkOrder) => possibleWorkOrder.workOrderId.toString() ===
                            selectedWorkOrderId);
                        if (selectedWorkOrder !== undefined) {
                            selectWorkOrder(selectedWorkOrder);
                        }
                    });
                }
            });
        }
        function selectWorkOrder(workOrder) {
            // Hide search results and show the form
            const resultsContainer = modalElement.querySelector('#addWorkOrder--results');
            resultsContainer.classList.add('is-hidden');
            const addForm = modalElement.querySelector('#addWorkOrder--form');
            addForm.classList.remove('is-hidden');
            const submitButton = modalElement.querySelector('#addWorkOrder--submitButton');
            submitButton.classList.remove('is-hidden');
            modalElement.querySelector('#addWorkOrder--selectedWorkOrderId').value = workOrder.workOrderId.toString();
            const selectedWorkOrderDiv = modalElement.querySelector('#addWorkOrder--selectedWorkOrder');
            selectedWorkOrderDiv.innerHTML = /* html */ `
        <p class="mb-2">
          <strong>Work Order #${cityssm.escapeHTML(workOrder.workOrderNumber)}</strong>
        </p>
        <p class="mb-2">
          <strong>Type:</strong> ${cityssm.escapeHTML(workOrder.workOrderType ?? '')}
        </p>
        <p class="mb-2">
          <strong>Requestor:</strong> ${cityssm.escapeHTML(workOrder.requestorName ?? '')}
        </p>
        <p>
          <strong>Details:</strong> ${cityssm.escapeHTML(workOrder.workOrderDetails)}
        </p>
      `;
            modalElement.querySelector('#addWorkOrder--shiftWorkOrderNote').focus();
        }
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftWorkOrder`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.shiftWorkOrders) {
                    shiftWorkOrders = responseJSON.shiftWorkOrders;
                    renderShiftWorkOrders();
                    updateCounts();
                    loadMilestones();
                    closeModalFunction();
                }
                else {
                    const errorMessage = responseJSON.success === false
                        ? responseJSON.errorMessage
                        : 'An unknown error occurred.';
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Work Order',
                        message: errorMessage
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-addWorkOrder', {
            onshow(modalElementParameter) {
                modalElement = modalElementParameter;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
            },
            onshown(modalElementParameter, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement = modalElementParameter;
                const searchForm = modalElement.querySelector('#addWorkOrder--searchForm');
                searchForm.addEventListener('submit', doSearch);
                const addForm = modalElement.querySelector('#addWorkOrder--form');
                addForm.addEventListener('submit', doAdd);
                modalElement.querySelector('#addWorkOrder--searchString').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editWorkOrderNote(clickEvent) {
        clickEvent.preventDefault();
        const workOrderId = clickEvent.currentTarget.dataset
            .workOrderId;
        const workOrder = shiftWorkOrders.find((wo) => wo.workOrderId.toString() === workOrderId);
        if (workOrder === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            const note = formEvent.currentTarget.querySelector('[name="shiftWorkOrderNote"]').value;
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftWorkOrderNote`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    ;
                    workOrder.shiftWorkOrderNote = note;
                    renderShiftWorkOrders();
                    closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Note',
                        message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-editWorkOrderNote', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                modalElement.querySelector('input[name="workOrderId"]').value = workOrderId ?? '';
                modalElement.querySelector('textarea[name="shiftWorkOrderNote"]').value = workOrder.shiftWorkOrderNote;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                const formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doUpdate);
                modalElement.querySelector('textarea[name="shiftWorkOrderNote"]').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteShiftWorkOrder(clickEvent) {
        clickEvent.preventDefault();
        const workOrderId = clickEvent.currentTarget.dataset
            .workOrderId;
        const workOrder = shiftWorkOrders.find((wo) => wo.workOrderId.toString() === workOrderId);
        if (workOrder === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Remove Work Order from Shift',
            message: `Are you sure you want to remove Work Order #${workOrder.workOrderNumber} from this shift?`,
            okButton: {
                text: 'Remove',
                callbackFunction: () => {
                    cityssm.postJSON(`${urlPrefix}/doDeleteShiftWorkOrder`, { shiftId, workOrderId }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.shiftWorkOrders) {
                            shiftWorkOrders = responseJSON.shiftWorkOrders;
                            renderShiftWorkOrders();
                            updateCounts();
                            loadMilestones();
                        }
                        else {
                            const errorMessage = responseJSON.success === false
                                ? responseJSON.errorMessage
                                : 'An unknown error occurred.';
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Removing Work Order',
                                message: errorMessage
                            });
                        }
                    });
                }
            }
        });
    }
    function completeMilestone(clickEvent) {
        clickEvent.preventDefault();
        const workOrderMilestoneId = clickEvent.currentTarget
            .dataset.workOrderMilestoneId;
        const milestone = allMilestones.find((possibleMilestone) => possibleMilestone.workOrderMilestoneId.toString() ===
            workOrderMilestoneId);
        if (milestone === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'success',
            title: 'Complete Milestone',
            message: `Mark milestone "${milestone.milestoneTitle}" as complete?`,
            okButton: {
                text: 'Complete',
                callbackFunction: () => {
                    const currentDate = new Date();
                    const currentDateString = `${cityssm.dateToString(currentDate)} ${cityssm.dateToTimeString(currentDate)}`;
                    cityssm.postJSON(`${workOrdersUrlPrefix}/doUpdateWorkOrderMilestone`, {
                        workOrderId: milestone.workOrderId,
                        workOrderMilestoneId: milestone.workOrderMilestoneId,
                        milestoneTitle: milestone.milestoneTitle,
                        milestoneDescription: milestone.milestoneDescription,
                        milestoneDueDateTimeString: milestone.milestoneDueDateTime,
                        assignedToId: milestone.assignedToId,
                        milestoneCompleteDateTimeString: currentDateString
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            loadMilestones();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Completing Milestone',
                                message: 'An unknown error occurred.'
                            });
                        }
                    });
                }
            }
        });
    }
    if (isEdit) {
        document
            .querySelector('#button--addWorkOrder')
            ?.addEventListener('click', addWorkOrder);
    }
    // Initial render
    renderShiftWorkOrders();
    renderMilestones();
    updateCounts();
    loadMilestones();
})();
