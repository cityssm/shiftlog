/* eslint-disable max-lines */
(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Milestones functionality
     */
    const milestonesContainerElement = document.querySelector('#container--milestones');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (milestonesContainerElement === null) {
        return;
    }
    function formatDateTime(dateTimeString) {
        if (dateTimeString === null) {
            return '';
        }
        const date = new Date(dateTimeString);
        return `${cityssm.dateToString(date)} ${cityssm.dateToTimeString(date)}`;
    }
    function renderMilestones(milestones) {
        // Update milestones count (completed / total)
        const milestonesCountElement = document.querySelector('#milestonesCount');
        if (milestonesCountElement !== null) {
            const completedCount = milestones.filter((m) => m.milestoneCompleteDateTime !== null).length;
            milestonesCountElement.textContent = `${completedCount} / ${milestones.length}`;
        }
        if (milestones.length === 0) {
            milestonesContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No milestones have been added yet.</p>
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
          ${exports.isEdit ? '<th class="is-hidden-print" style="width: 30px;"></th>' : ''}
          <th>Title</th>
          <th class="is-hidden-touch">Assigned To</th>
          <th>Due Date</th>
          <th>Complete Date</th>
          ${exports.isEdit ? '<th class="is-hidden-print" style="width: 80px;"></th>' : ''}
        </tr>
      </thead>
      <tbody id="tbody--milestones"></tbody>
    `;
        milestonesContainerElement.replaceChildren(tableElement);
        const tbodyElement = tableElement.querySelector('#tbody--milestones');
        for (const milestone of milestones) {
            const trElement = document.createElement('tr');
            trElement.dataset.milestoneId = milestone.workOrderMilestoneId.toString();
            const isComplete = milestone.milestoneCompleteDateTime !== null;
            const isOverdue = !isComplete &&
                milestone.milestoneDueDateTime !== null &&
                new Date(milestone.milestoneDueDateTime) < new Date();
            const canEdit = exports.isEdit &&
                (exports.shiftLog.userCanManageWorkOrders ||
                    milestone.recordCreate_userName === exports.shiftLog.userName);
            // eslint-disable-next-line no-unsanitized/property
            trElement.innerHTML = /* html */ `
        ${exports.isEdit
                ? /* html */ `
              <td class="is-hidden-print">
                <span class="icon drag-handle" style="cursor: grab;">
                  <i class="fa-solid fa-grip-vertical"></i>
                </span>
              </td>
            `
                : ''}
        <td>
          <div>
            ${isComplete ? '<span class="icon has-text-success"><i class="fa-solid fa-check-circle"></i></span> ' : ''}
            ${isOverdue ? '<span class="icon has-text-danger"><i class="fa-solid fa-exclamation-circle"></i></span> ' : ''}
            <strong>${cityssm.escapeHTML(milestone.milestoneTitle)}</strong>
          </div>
          ${milestone.milestoneDescription
                ? /* html */ `
                <div class="is-size-7 has-text-grey">
                  ${cityssm.escapeHTML(milestone.milestoneDescription.slice(0, 100))}${milestone.milestoneDescription.length > 100 ? '…' : ''}
                </div>
              `
                : ''}
        </td>
        <td class="is-hidden-touch">
          ${milestone.assignedToName ? cityssm.escapeHTML(milestone.assignedToName) : '<span class="has-text-grey">(Not Assigned)</span>'}
        </td>
        <td>
          ${milestone.milestoneDueDateTime ? formatDateTime(milestone.milestoneDueDateTime) : '<span class="has-text-grey">-</span>'}
        </td>
        <td>
          ${milestone.milestoneCompleteDateTime
                ? formatDateTime(milestone.milestoneCompleteDateTime)
                : canEdit && exports.isEdit
                    ? /* html */ `
                  <button class="button is-small is-success is-light complete-milestone" type="button" title="Complete Milestone">
                    <span class="icon"><i class="fa-solid fa-check"></i></span>
                    <span>Mark as Complete</span>
                  </button>
                `
                    : '<span class="has-text-grey">-</span>'}
        </td>
        ${exports.isEdit
                ? /* html */ `
              <td class="is-hidden-print">
                ${canEdit
                    ? /* html */ `
                      <div class="buttons are-small is-justify-content-flex-end">
                        <button class="button edit-milestone" type="button" title="Edit">
                          <span class="icon"><i class="fa-solid fa-edit"></i></span>
                        </button>
                        <button class="button is-danger is-light delete-milestone" type="button" title="Delete">
                          <span class="icon"><i class="fa-solid fa-trash"></i></span>
                        </button>
                      </div>
                    `
                    : ''}
              </td>
            `
                : ''}
      `;
            // Add event listeners
            if (canEdit) {
                const editButton = trElement.querySelector('.edit-milestone');
                editButton.addEventListener('click', () => {
                    showEditMilestoneModal(milestone);
                });
                const deleteButton = trElement.querySelector('.delete-milestone');
                deleteButton.addEventListener('click', () => {
                    deleteMilestone(milestone.workOrderMilestoneId);
                });
                // Add complete button listener if milestone is not complete
                if (!isComplete) {
                    const completeButton = trElement.querySelector('.complete-milestone');
                    completeButton?.addEventListener('click', () => {
                        completeMilestone(milestone.workOrderMilestoneId);
                    });
                }
            }
            tbodyElement.append(trElement);
        }
        // Initialize sortable for reordering
        if (exports.isEdit && exports.shiftLog.userCanUpdateWorkOrders) {
            Sortable.create(tbodyElement, {
                handle: '.drag-handle',
                animation: 150,
                onEnd: () => {
                    saveMilestoneOrder();
                }
            });
        }
    }
    function saveMilestoneOrder() {
        const tbodyElement = document.querySelector('#tbody--milestones');
        if (tbodyElement === null)
            return;
        const rows = tbodyElement.querySelectorAll('tr');
        const milestoneOrders = [];
        for (const [index, row] of rows.entries()) {
            milestoneOrders.push({
                workOrderMilestoneId: row.dataset.milestoneId ?? '',
                orderNumber: index + 1
            });
        }
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestoneOrder`, { milestoneOrders }, (responseJSON) => {
            if (!responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to save milestone order.'
                });
            }
        });
    }
    const workOrderOpenDate = exports.workOrderOpenDateTime
        ? new Date(exports.workOrderOpenDateTime)
        : undefined;
    const dateTimePickerOptions = {
        allowInput: true,
        enableTime: true,
        nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
        prevArrow: '<i class="fa-solid fa-chevron-left"></i>',
        minuteIncrement: 1,
        minDate: workOrderOpenDate
    };
    function populateAssignedToSelect(selectElement) {
        for (const option of exports.assignedToOptions) {
            const optionElement = document.createElement('option');
            optionElement.value = option.assignedToId.toString();
            optionElement.textContent = option.assignedToName;
            selectElement.append(optionElement);
        }
    }
    function showAddMilestoneModal() {
        let closeModalFunction;
        function doAddMilestone(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderMilestone`, formElement, (responseJSON) => {
                if (responseJSON.success) {
                    closeModalFunction();
                    loadMilestones();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to add milestone.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('workOrders-addMilestone', {
            onshow(modalElement) {
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#addWorkOrderMilestone--workOrderId').value = workOrderId;
                // Populate Assigned To select
                const assignedToSelect = modalElement.querySelector('#addWorkOrderMilestone--assignedToId');
                populateAssignedToSelect(assignedToSelect);
                // Set the default value to the work order's "assigned to" value
                if (exports.workOrderAssignedToId !== null) {
                    assignedToSelect.value = exports.workOrderAssignedToId.toString();
                }
                // Initialize flatpickr on date fields
                flatpickr(modalElement.querySelector('#addWorkOrderMilestone--milestoneDueDateTimeString'), dateTimePickerOptions);
                const completeDatePicker = flatpickr(modalElement.querySelector('#addWorkOrderMilestone--milestoneCompleteDateTimeString'), {
                    ...dateTimePickerOptions,
                    maxDate: new Date()
                });
                // Add "Now" button handler for complete date
                modalElement
                    .querySelector('#addWorkOrderMilestone--setCompleteTimeNow')
                    ?.addEventListener('click', () => {
                    const now = new Date();
                    completeDatePicker.set('maxDate', now);
                    completeDatePicker.setDate(now, true);
                });
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddMilestone);
                modalElement.querySelector('#addWorkOrderMilestone--milestoneTitle').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                exports.shiftLog.clearUnsavedChanges('modal');
            }
        });
    }
    function showEditMilestoneModal(milestone) {
        let closeModalFunction;
        function doUpdateMilestone(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestone`, formElement, (responseJSON) => {
                if (responseJSON.success) {
                    closeModalFunction();
                    loadMilestones();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to update milestone.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('workOrders-editMilestone', {
            onshow(modalElement) {
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#editWorkOrderMilestone--workOrderMilestoneId').value = milestone.workOrderMilestoneId.toString();
                modalElement.querySelector('#editWorkOrderMilestone--milestoneTitle').value = milestone.milestoneTitle;
                modalElement.querySelector('#editWorkOrderMilestone--milestoneDescription').value = milestone.milestoneDescription;
                // Initialize flatpickr on date fields
                const dueDateInput = modalElement.querySelector('#editWorkOrderMilestone--milestoneDueDateTimeString');
                flatpickr(dueDateInput, {
                    ...dateTimePickerOptions,
                    defaultDate: milestone.milestoneDueDateTime
                        ? new Date(milestone.milestoneDueDateTime)
                        : undefined
                });
                const completeDateInput = modalElement.querySelector('#editWorkOrderMilestone--milestoneCompleteDateTimeString');
                const completeDatePicker = flatpickr(completeDateInput, {
                    ...dateTimePickerOptions,
                    defaultDate: milestone.milestoneCompleteDateTime
                        ? new Date(milestone.milestoneCompleteDateTime)
                        : undefined,
                    maxDate: new Date()
                });
                // Add "Now" button handler for complete date
                modalElement
                    .querySelector('#editWorkOrderMilestone--setCompleteTimeNow')
                    ?.addEventListener('click', () => {
                    const now = new Date();
                    completeDatePicker.set('maxDate', now);
                    completeDatePicker.setDate(now, true);
                });
                // Populate Assigned To select
                const assignedToSelect = modalElement.querySelector('#editWorkOrderMilestone--assignedToId');
                populateAssignedToSelect(assignedToSelect);
                // Set the selected option if there is one
                if (milestone.assignedToId !== null) {
                    assignedToSelect.value = milestone.assignedToId?.toString() ?? '';
                }
                // If no assignedTo is set, leave it as "(Not Assigned)" - don't default to work order's value
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateMilestone);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                exports.shiftLog.clearUnsavedChanges('modal');
            }
        });
    }
    function completeMilestone(workOrderMilestoneId) {
        bulmaJS.confirm({
            contextualColorName: 'success',
            title: 'Complete Milestone',
            message: 'Are you sure you want to complete this milestone?',
            okButton: {
                text: 'Complete Milestone',
                callbackFunction: () => {
                    // First, get the current milestone data
                    cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderMilestones`, {}, (milestonesResponseJSON) => {
                        const milestone = milestonesResponseJSON.milestones.find((m) => m.workOrderMilestoneId === workOrderMilestoneId);
                        if (!milestone) {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Failed to find milestone.'
                            });
                            return;
                        }
                        const now = new Date();
                        const completeDateTimeString = `${cityssm.dateToString(now)}T${cityssm.dateToTimeString(now)}`;
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestone`, {
                            workOrderMilestoneId,
                            milestoneTitle: milestone.milestoneTitle,
                            milestoneDescription: milestone.milestoneDescription,
                            milestoneDueDateTimeString: milestone.milestoneDueDateTime
                                ? typeof milestone.milestoneDueDateTime === 'string'
                                    ? new Date(milestone.milestoneDueDateTime)
                                        .toISOString()
                                        .slice(0, 16)
                                    : milestone.milestoneDueDateTime
                                        .toISOString()
                                        .slice(0, 16)
                                : '',
                            milestoneCompleteDateTimeString: completeDateTimeString,
                            assignedToId: milestone.assignedToId ?? ''
                        }, (responseJSON) => {
                            if (responseJSON.success) {
                                loadMilestones();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to complete milestone.'
                                });
                            }
                        });
                    });
                }
            }
        });
    }
    function deleteMilestone(workOrderMilestoneId) {
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: 'Delete Milestone',
            message: 'Are you sure you want to delete this milestone?',
            okButton: {
                text: 'Delete',
                callbackFunction: () => {
                    cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderMilestone`, {
                        workOrderMilestoneId
                    }, (responseJSON) => {
                        if (responseJSON.success) {
                            loadMilestones();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Failed to delete milestone.'
                            });
                        }
                    });
                }
            }
        });
    }
    function loadMilestones() {
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderMilestones`, {}, (responseJSON) => {
            renderMilestones(responseJSON.milestones);
        });
    }
    // Add milestone button
    document
        .querySelector('#button--addMilestone')
        ?.addEventListener('click', () => {
        showAddMilestoneModal();
    });
    // Load milestones initially
    loadMilestones();
})();
