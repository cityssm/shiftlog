(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    const milestonesContainerElement = document.querySelector('#container--milestones');
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
        const milestonesCountElement = document.querySelector('#milestonesCount');
        if (milestonesCountElement !== null) {
            const completedCount = milestones.filter((m) => m.milestoneCompleteDateTime !== null).length;
            milestonesCountElement.textContent = `${completedCount} / ${milestones.length}`;
        }
        if (milestones.length === 0) {
            milestonesContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">No milestones have been added yet.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = `
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
                new Date(milestone.milestoneDueDateTime ?? '') < new Date();
            const canEditMilestone = exports.isEdit &&
                (exports.shiftLog.userCanManageWorkOrders ||
                    milestone.recordCreate_userName === exports.shiftLog.userName);
            trElement.innerHTML = `
        ${exports.isEdit
                ? `
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
                ? `
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
                : canEditMilestone
                    ? `
                  <button class="button is-small is-success is-light complete-milestone" type="button" title="Complete Milestone">
                    <span class="icon"><i class="fa-solid fa-check"></i></span>
                    <span>Mark as Complete</span>
                  </button>
                `
                    : '<span class="has-text-grey">-</span>'}
        </td>
        ${exports.isEdit
                ? `
              <td class="is-hidden-print">
                ${canEditMilestone
                    ? `
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
            if (canEditMilestone) {
                trElement
                    .querySelector('.edit-milestone')
                    ?.addEventListener('click', () => {
                    showEditMilestoneModal(milestone);
                });
                trElement
                    .querySelector('.delete-milestone')
                    ?.addEventListener('click', () => {
                    deleteMilestone(milestone.workOrderMilestoneId);
                });
                trElement
                    .querySelector('.complete-milestone')
                    ?.addEventListener('click', () => {
                    completeMilestone(milestone.workOrderMilestoneId);
                });
            }
            tbodyElement.append(trElement);
        }
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
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestoneOrder`, { milestoneOrders }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
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
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderMilestone`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
                const assignedToSelect = modalElement.querySelector('#addWorkOrderMilestone--assignedToId');
                populateAssignedToSelect(assignedToSelect);
                if (exports.workOrderAssignedToId !== null) {
                    assignedToSelect.value = exports.workOrderAssignedToId.toString();
                }
                flatpickr(modalElement.querySelector('#addWorkOrderMilestone--milestoneDueDateTimeString'), dateTimePickerOptions);
                const completeDatePicker = flatpickr(modalElement.querySelector('#addWorkOrderMilestone--milestoneCompleteDateTimeString'), {
                    ...dateTimePickerOptions,
                    maxDate: new Date()
                });
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
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestone`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
                modalElement
                    .querySelector('#editWorkOrderMilestone--setCompleteTimeNow')
                    ?.addEventListener('click', () => {
                    const now = new Date();
                    completeDatePicker.set('maxDate', now);
                    completeDatePicker.setDate(now, true);
                });
                const assignedToSelect = modalElement.querySelector('#editWorkOrderMilestone--assignedToId');
                populateAssignedToSelect(assignedToSelect);
                if (milestone.assignedToId !== null) {
                    assignedToSelect.value = milestone.assignedToId?.toString() ?? '';
                }
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
                    cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderMilestones`, {}, (rawMilestonesResponseJSON) => {
                        const milestonesResponseJSON = rawMilestonesResponseJSON;
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
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
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
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
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
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderMilestones`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderMilestones(responseJSON.milestones);
        });
    }
    document
        .querySelector('#button--addMilestone')
        ?.addEventListener('click', () => {
        showAddMilestoneModal();
    });
    loadMilestones();
})();
