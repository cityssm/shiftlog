// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
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
            #${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a>
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderType ?? '')}</td>
        <td>${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '')}</td>
        <td>${cityssm.escapeHTML(workOrder.workOrderDetails.substring(0, 100))}${workOrder.workOrderDetails.length > 100 ? '...' : ''}</td>
        <td>${cityssm.escapeHTML(workOrder.shiftWorkOrderNote)}</td>
        ${isEdit
                ? /* html */ `
          <td class="has-text-right">
            <div class="buttons is-right">
              <button class="button is-small is-info button--editNote" data-work-order-id="${workOrder.workOrderId}" type="button" aria-label="Edit Note">
                <span class="icon is-small"><i class="fa-solid fa-pencil"></i></span>
              </button>
              <button class="button is-small is-danger is-light button--delete" data-work-order-id="${workOrder.workOrderId}" type="button" aria-label="Remove">
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
            const isComplete = milestone.milestoneCompleteDateTime !== null && milestone.milestoneCompleteDateTime !== undefined;
            // eslint-disable-next-line no-unsanitized/property
            trElement.innerHTML = /* html */ `
        <td>
          ${workOrder !== undefined
                ? /* html */ `<a href="${workOrdersUrlPrefix}/${workOrder.workOrderId}" target="_blank">#${cityssm.escapeHTML(workOrder.workOrderNumber)}</a>`
                : ''}
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
            <button class="button is-small is-success button--complete" data-milestone-id="${milestone.milestoneId}" type="button">
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
    function refreshWorkOrderData() {
        cityssm.postJSON(`${urlPrefix}/doGetShiftWorkOrders`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftWorkOrders = responseJSON.shiftWorkOrders;
            renderShiftWorkOrders();
            updateCounts();
            loadMilestones();
        });
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
                        if (a.milestoneDueDateTime === null || a.milestoneDueDateTime === undefined)
                            return 1;
                        if (b.milestoneDueDateTime === null || b.milestoneDueDateTime === undefined)
                            return -1;
                        return new Date(a.milestoneDueDateTime).getTime() - new Date(b.milestoneDueDateTime).getTime();
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
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Work Order',
                        message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-addWorkOrder', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                const formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
                modalElement.querySelector('input[name="workOrderId"]').focus();
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
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftWorkOrderNote`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    const note = formEvent.currentTarget.querySelector('[name="shiftWorkOrderNote"]').value;
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
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Removing Work Order',
                                message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                            });
                        }
                    });
                }
            }
        });
    }
    function completeMilestone(clickEvent) {
        clickEvent.preventDefault();
        const milestoneId = clickEvent.currentTarget.dataset
            .milestoneId;
        const milestone = allMilestones.find((m) => m.milestoneId.toString() === milestoneId);
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
                    cityssm.postJSON(`${workOrdersUrlPrefix}/doUpdateWorkOrderMilestone`, {
                        workOrderId: milestone.workOrderId,
                        milestoneId: milestone.milestoneId,
                        milestoneTitle: milestone.milestoneTitle,
                        milestoneDescription: milestone.milestoneDescription,
                        milestoneDueDateTimeString: '',
                        assignedToDataListItemId: milestone.assignedToDataListItemId,
                        milestoneCompleteDateTimeString: new Date().toISOString().slice(0, 16)
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            loadMilestones();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Completing Milestone',
                                message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                            });
                        }
                    });
                }
            }
        });
    }
    /*
     * Initialize tabs
     */
    const tabsContainerElement = document.querySelector('#tab-content--workOrders');
    if (tabsContainerElement !== null) {
        const tabLinks = document.querySelectorAll('#tab--tasks .tabs a');
        for (const tabLink of tabLinks) {
            tabLink.addEventListener('click', (clickEvent) => {
                clickEvent.preventDefault();
                const targetId = tabLink.getAttribute('href') ?? '';
                // Update active link
                for (const link of tabLinks) {
                    if (link.getAttribute('href') === targetId) {
                        link.parentElement?.classList.add('is-active');
                    }
                    else {
                        link.parentElement?.classList.remove('is-active');
                    }
                }
                // Show/hide tabs
                const allTabContent = document.querySelectorAll('[id^="tab-content--"]');
                for (const tabContent of allTabContent) {
                    if (`#${tabContent.id}` === targetId) {
                        tabContent.classList.remove('is-hidden');
                    }
                    else {
                        tabContent.classList.add('is-hidden');
                    }
                }
            });
        }
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
