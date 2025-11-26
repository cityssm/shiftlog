(() => {
    const workOrderTabsContainerElement = document.querySelector('#container--workOrderTabs');
    if (workOrderTabsContainerElement !== null) {
        exports.shiftLog.initializeRecordTabs(workOrderTabsContainerElement);
    }
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement !== null
        ? workOrderFormElement.querySelector('#workOrder--workOrderId').value
        : '';
    /*
     * Milestones functionality
     */
    const milestonesContainerElement = document.querySelector('#container--milestones');
    if (milestonesContainerElement !== null) {
        function formatDateTime(dateTimeString) {
            if (dateTimeString === null) {
                return '';
            }
            const date = new Date(dateTimeString);
            return cityssm.dateToString(date) + ' ' + cityssm.dateToTimeString(date);
        }
        function formatDateTimeForInput(dateTimeString) {
            if (dateTimeString === null) {
                return '';
            }
            const date = new Date(dateTimeString);
            return (cityssm.dateToString(date) + 'T' + cityssm.dateToTimeString(date));
        }
        function renderMilestones(milestones) {
            // Update milestones count
            const milestonesCountElement = document.querySelector('#milestonesCount');
            if (milestonesCountElement !== null) {
                milestonesCountElement.textContent = milestones.length.toString();
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
            tableElement.innerHTML = /* html */ `
        <thead>
          <tr>
            <th class="is-hidden-print" style="width: 30px;"></th>
            <th>Title</th>
            <th class="is-hidden-touch">Assigned To</th>
            <th>Due Date</th>
            <th>Complete Date</th>
            <th class="is-hidden-print" style="width: 80px;"></th>
          </tr>
        </thead>
        <tbody id="tbody--milestones"></tbody>
      `;
            milestonesContainerElement.replaceChildren(tableElement);
            const tbodyElement = tableElement.querySelector('#tbody--milestones');
            for (const milestone of milestones) {
                const trElement = document.createElement('tr');
                trElement.dataset.milestoneId =
                    milestone.workOrderMilestoneId.toString();
                const isComplete = milestone.milestoneCompleteDateTime !== null;
                const isOverdue = !isComplete &&
                    milestone.milestoneDueDateTime !== null &&
                    new Date(milestone.milestoneDueDateTime) < new Date();
                const canEdit = exports.shiftLog.userCanManageWorkOrders ||
                    milestone.recordCreate_userName === exports.shiftLog.userName;
                trElement.innerHTML = /* html */ `
          <td class="is-hidden-print">
            <span class="icon drag-handle" style="cursor: grab;">
              <i class="fa-solid fa-grip-vertical"></i>
            </span>
          </td>
          <td>
            <div>
              ${isComplete ? '<span class="icon has-text-success"><i class="fa-solid fa-check-circle"></i></span> ' : ''}
              ${isOverdue ? '<span class="icon has-text-danger"><i class="fa-solid fa-exclamation-circle"></i></span> ' : ''}
              <strong>${cityssm.escapeHTML(milestone.milestoneTitle)}</strong>
            </div>
            ${milestone.milestoneDescription
                    ? `<div class="is-size-7 has-text-grey">${cityssm.escapeHTML(milestone.milestoneDescription.slice(0, 100))}${milestone.milestoneDescription.length > 100 ? '…' : ''}</div>`
                    : ''}
          </td>
          <td class="is-hidden-touch">
            ${milestone.assignedToDataListItem ? cityssm.escapeHTML(milestone.assignedToDataListItem) : '<span class="has-text-grey">(Not Assigned)</span>'}
          </td>
          <td>
            ${milestone.milestoneDueDateTime ? formatDateTime(milestone.milestoneDueDateTime) : '<span class="has-text-grey">-</span>'}
          </td>
          <td>
            ${milestone.milestoneCompleteDateTime ? formatDateTime(milestone.milestoneCompleteDateTime) : '<span class="has-text-grey">-</span>'}
          </td>
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
                }
                tbodyElement.append(trElement);
            }
            // Initialize sortable for reordering
            if (exports.shiftLog.userCanUpdateWorkOrders) {
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
            rows.forEach((row, index) => {
                milestoneOrders.push({
                    workOrderMilestoneId: row.dataset.milestoneId ?? '',
                    orderNumber: index + 1
                });
            });
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestoneOrder`, { milestoneOrders }, (responseJSON) => {
                if (!responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to save milestone order.'
                    });
                }
            });
        }
        const dateTimePickerOptions = {
            allowInput: true,
            enableTime: true,
            nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
            prevArrow: '<i class="fa-solid fa-chevron-left"></i>',
            minuteIncrement: 1,
            minDate: exports.workOrderOpenDateTime || undefined
        };
        function populateAssignedToSelect(selectElement) {
            for (const option of exports.assignedToOptions) {
                const optionElement = document.createElement('option');
                optionElement.value = option.dataListItemId.toString();
                optionElement.textContent = option.dataListItem;
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
                    modalElement.querySelector('#addWorkOrderMilestone--workOrderId').value = workOrderId;
                    // Populate Assigned To select
                    const assignedToSelect = modalElement.querySelector('#addWorkOrderMilestone--assignedToDataListItemId');
                    populateAssignedToSelect(assignedToSelect);
                    // Initialize flatpickr on date fields
                    flatpickr(modalElement.querySelector('#addWorkOrderMilestone--milestoneDueDateTimeString'), dateTimePickerOptions);
                    flatpickr(modalElement.querySelector('#addWorkOrderMilestone--milestoneCompleteDateTimeString'), {
                        ...dateTimePickerOptions,
                        maxDate: new Date()
                    });
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddMilestone);
                    modalElement.querySelector('#addWorkOrderMilestone--milestoneTitle')?.focus();
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
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
                    flatpickr(completeDateInput, {
                        ...dateTimePickerOptions,
                        maxDate: new Date(),
                        defaultDate: milestone.milestoneCompleteDateTime
                            ? new Date(milestone.milestoneCompleteDateTime)
                            : undefined
                    });
                    // Populate Assigned To select
                    const assignedToSelect = modalElement.querySelector('#editWorkOrderMilestone--assignedToDataListItemId');
                    populateAssignedToSelect(assignedToSelect);
                    // Set the selected option if there is one
                    if (milestone.assignedToDataListItemId !== null) {
                        assignedToSelect.value = milestone.assignedToDataListItemId.toString();
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
                }
            });
        }
        function deleteMilestone(workOrderMilestoneId) {
            bulmaJS.confirm({
                title: 'Delete Milestone',
                message: 'Are you sure you want to delete this milestone?',
                contextualColorName: 'danger',
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
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderMilestones`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderMilestones(responseJSON.milestones);
                }
            });
        }
        // Add milestone button
        const addMilestoneButton = document.querySelector('#button--addMilestone');
        if (addMilestoneButton !== null) {
            addMilestoneButton.addEventListener('click', () => {
                showAddMilestoneModal();
            });
        }
        // Load milestones initially
        loadMilestones();
    }
    /*
     * Notes functionality
     */
    const notesContainerElement = document.querySelector('#container--notes');
    if (notesContainerElement !== null) {
        function truncateText(text, maxLength) {
            if (text.length <= maxLength) {
                return text;
            }
            return text.slice(0, maxLength) + '…';
        }
        function renderNotes(notes) {
            // Update notes count
            const notesCountElement = document.querySelector('#notesCount');
            if (notesCountElement !== null) {
                notesCountElement.textContent = notes.length.toString();
            }
            if (notes.length === 0) {
                notesContainerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No notes have been added yet.</p>
          </div>
        `;
                return;
            }
            notesContainerElement.innerHTML = '';
            for (const note of notes) {
                const noteElement = document.createElement('div');
                noteElement.className = 'box';
                const canEdit = exports.shiftLog.userCanManageWorkOrders ||
                    note.recordCreate_userName === exports.shiftLog.userName;
                const truncatedText = truncateText(note.noteText, 200);
                const needsExpand = note.noteText.length > 200;
                noteElement.innerHTML = /* html */ `
          <article class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong>
                  <small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small>
                  ${note.recordUpdate_dateTime !== note.recordCreate_dateTime
                    ? `<small class="has-text-grey">(edited)</small>`
                    : ''}
                  <br />
                  <span class="note-text">${cityssm.escapeHTML(truncatedText)}</span>
                  ${needsExpand
                    ? `<a href="#" class="view-full-note" data-note-sequence="${note.noteSequence}">View Full Note</a>`
                    : ''}
                </p>
              </div>
              ${canEdit
                    ? /* html */ `
                <nav class="level is-mobile">
                  <div class="level-left">
                    <a class="level-item edit-note" data-note-sequence="${note.noteSequence}">
                      <span class="icon is-small"><i class="fa-solid fa-edit"></i></span>
                    </a>
                    <a class="level-item delete-note" data-note-sequence="${note.noteSequence}">
                      <span class="icon is-small has-text-danger"><i class="fa-solid fa-trash"></i></span>
                    </a>
                  </div>
                </nav>
              `
                    : ''}
            </div>
          </article>
        `;
                // Add event listeners
                if (needsExpand) {
                    const viewFullLink = noteElement.querySelector('.view-full-note');
                    viewFullLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showFullNoteModal(note);
                    });
                }
                if (canEdit) {
                    const editLink = noteElement.querySelector('.edit-note');
                    editLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showEditNoteModal(note);
                    });
                    const deleteLink = noteElement.querySelector('.delete-note');
                    deleteLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        deleteNote(note.noteSequence);
                    });
                }
                notesContainerElement.append(noteElement);
            }
        }
        function showFullNoteModal(note) {
            const modalElement = document.createElement('div');
            modalElement.className = 'modal is-active';
            modalElement.innerHTML = /* html */ `
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Full Note</p>
            <button class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <p><strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong></p>
            <p><small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small></p>
            <div class="content mt-3">
              <p style="white-space: pre-wrap;">${cityssm.escapeHTML(note.noteText)}</p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button close-modal">Close</button>
          </footer>
        </div>
      `;
            document.body.append(modalElement);
            const closeButtons = modalElement.querySelectorAll('.delete, .close-modal, .modal-background');
            for (const button of closeButtons) {
                button.addEventListener('click', () => {
                    modalElement.remove();
                });
            }
        }
        function showEditNoteModal(note) {
            let closeModalFunction;
            function doUpdateNote(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`, formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadNotes();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to update note.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-editNote', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#editWorkOrderNote--workOrderId').value = workOrderId;
                    modalElement.querySelector('#editWorkOrderNote--noteSequence').value = note.noteSequence.toString();
                    modalElement.querySelector('#editWorkOrderNote--noteText').value = note.noteText;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doUpdateNote);
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function showAddNoteModal() {
            let closeModalFunction;
            function doAddNote(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`, formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        closeModalFunction();
                        formElement.reset();
                        loadNotes();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add note.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addNote', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#addWorkOrderNote--workOrderId').value = workOrderId;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddNote);
                    modalElement.querySelector('#addWorkOrderNote--noteText')?.focus();
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteNote(noteSequence) {
            bulmaJS.confirm({
                title: 'Delete Note',
                message: 'Are you sure you want to delete this note?',
                contextualColorName: 'danger',
                okButton: {
                    text: 'Delete',
                    callbackFunction: () => {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderNote`, {
                            workOrderId,
                            noteSequence
                        }, (responseJSON) => {
                            if (responseJSON.success) {
                                loadNotes();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to delete note.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function loadNotes() {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderNotes`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderNotes(responseJSON.notes);
                }
            });
        }
        // Add note button
        const addNoteButton = document.querySelector('#button--addNote');
        if (addNoteButton !== null) {
            addNoteButton.addEventListener('click', () => {
                showAddNoteModal();
            });
        }
        // Load notes initially
        loadNotes();
    }
})();
