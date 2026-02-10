/* eslint-disable max-lines -- Complex admin interface with multiple modals */
/* eslint-disable no-unsanitized/property -- Using cityssm.escapeHTML() for sanitization */
(() => {
    const shiftLog = exports.shiftLog;
    const noteTypesContainerElement = document.querySelector('#container--noteTypes');
    let noteTypes = exports.noteTypes;
    const userGroups = exports.userGroups;
    const dataLists = exports.dataLists;
    // Track which panels are open
    const openPanels = new Set();
    // Track Sortable instances
    const sortableInstances = new Map();
    // Track current filter
    let availabilityFilter = '';
    function renderNoteTypes() {
        // Store currently open panels before re-rendering
        const openDetails = noteTypesContainerElement.querySelectorAll('details[open]');
        for (const detail of openDetails) {
            const noteTypeId = detail.dataset.noteTypeId;
            if (noteTypeId) {
                openPanels.add(Number.parseInt(noteTypeId, 10));
            }
        }
        noteTypesContainerElement.innerHTML = '';
        // Filter note types based on availability
        const filteredNoteTypes = noteTypes.filter((noteType) => {
            if (availabilityFilter === '') {
                return true;
            }
            if (availabilityFilter === 'workOrders') {
                return noteType.isAvailableWorkOrders;
            }
            if (availabilityFilter === 'shifts') {
                return noteType.isAvailableShifts;
            }
            if (availabilityFilter === 'timesheets') {
                return noteType.isAvailableTimesheets;
            }
            return true;
        });
        if (filteredNoteTypes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'panel-block is-block';
            emptyMessage.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">
            <strong>No note types available.</strong><br />
            Click "Add Note Type" to create your first note type.
          </p>
        </div>
      `;
            noteTypesContainerElement.append(emptyMessage);
        }
        else {
            for (const noteType of filteredNoteTypes) {
                const noteTypePanel = document.createElement('details');
                noteTypePanel.className = 'panel mb-5 collapsable-panel';
                noteTypePanel.dataset.noteTypeId = noteType.noteTypeId.toString();
                // Restore open state
                if (openPanels.has(noteType.noteTypeId)) {
                    noteTypePanel.setAttribute('open', '');
                }
                const summaryElement = document.createElement('summary');
                summaryElement.className = 'panel-heading is-clickable';
                const availabilityBadges = [];
                if (noteType.isAvailableWorkOrders) {
                    availabilityBadges.push(`<span class="tag is-info is-light">${cityssm.escapeHTML(shiftLog.workOrdersSectionName)}</span>`);
                }
                if (noteType.isAvailableShifts) {
                    availabilityBadges.push(`<span class="tag is-info is-light">${cityssm.escapeHTML(shiftLog.shiftsSectionName)}</span>`);
                }
                if (noteType.isAvailableTimesheets) {
                    availabilityBadges.push(`<span class="tag is-info is-light">${cityssm.escapeHTML(shiftLog.timesheetsSectionName)}</span>`);
                }
                summaryElement.innerHTML = /* html */ `
          <span class="icon-text">
            <span class="icon">
              <i class="fa-solid fa-chevron-right details-chevron"></i>
            </span>
            <span class="has-text-weight-semibold mr-2">
              ${cityssm.escapeHTML(noteType.noteType)}
            </span>
            <span class="tags">
              <span class="tag is-rounded ${noteType.fields.length === 0 ? 'is-warning' : ''}">
                ${noteType.fields.length} ${noteType.fields.length === 1 ? 'field' : 'fields'}
              </span>
              ${availabilityBadges.length > 0 ? availabilityBadges.join(' ') : ''}
            </span>
          </span>
        `;
                noteTypePanel.append(summaryElement);
                // Action buttons panel
                const actionBlock = document.createElement('div');
                actionBlock.className = 'panel-block is-justify-content-space-between';
                actionBlock.innerHTML = /* html */ `
          <div>
            <button class="button is-small is-info button--editNoteType" data-note-type-id="${noteType.noteTypeId}" type="button">
              <span class="icon"><i class="fa-solid fa-pencil"></i></span>
              <span>Edit Note Type</span>
            </button>
          </div>
          <div>
            <button class="button is-success is-small button--addField" data-note-type-id="${noteType.noteTypeId}" type="button">
              <span class="icon"><i class="fa-solid fa-plus"></i></span>
              <span>Add Field</span>
            </button>
            <button class="button is-danger is-small button--deleteNoteType" data-note-type-id="${noteType.noteTypeId}" type="button">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
              <span>Delete</span>
            </button>
          </div>
        `;
                noteTypePanel.append(actionBlock);
                // Fields table
                const tableBlock = document.createElement('div');
                tableBlock.className = 'panel-block p-0';
                if (noteType.fields.length === 0) {
                    tableBlock.innerHTML = /* html */ `
            <div class="table-container" style="width: 100%;">
              <table class="table is-striped is-hoverable is-fullwidth mb-0">
                <tbody>
                  <tr>
                    <td class="has-text-centered has-text-grey" colspan="5">
                      No fields defined. Click "Add Field" to create fields for this note type.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
                }
                else {
                    let tableHTML = /* html */ `
            <div class="table-container" style="width: 100%;">
              <table class="table is-striped is-hoverable is-fullwidth mb-0">
                <thead>
                  <tr>
                    <th class="has-text-centered" style="width: 60px;">Order</th>
                    <th>Label</th>
                    <th>Type</th>
                    <th>Help Text</th>
                    <th class="has-text-right" style="width: 150px;">
                      <span class="is-sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="is-sortable" id="noteTypeFields--${noteType.noteTypeId}">
          `;
                    for (const field of noteType.fields) {
                        const dividerStyle = field.hasDividerAbove
                            ? ' style="border-top-width:5px"'
                            : '';
                        tableHTML += /* html */ `
              <tr data-note-type-field-id="${field.noteTypeFieldId}">
                <td class="has-text-centered">
                  <span class="icon is-small has-text-grey handle" style="cursor: move;">
                    <i class="fa-solid fa-grip-vertical"></i>
                  </span>
                </td>
                <td ${dividerStyle}>
                  <span class="field-label">${cityssm.escapeHTML(field.fieldLabel)}</span>
                  ${field.fieldValueRequired ? '<span class="icon is-small has-text-success ml-1" title="Required"><i class="fa-solid fa-asterisk"></i></span>' : ''}
                </td>
                <td><span class="tag">${cityssm.escapeHTML(field.fieldInputType)}</span></td>
                <td class="is-size-7">${cityssm.escapeHTML(field.fieldHelpText)}</td>
                <td class="has-text-right">
                  <div class="buttons are-small is-right">
                    <button
                      class="button is-info button--editField"
                      data-note-type-field-id="${field.noteTypeFieldId}"
                      data-note-type-id="${noteType.noteTypeId}"
                      type="button"
                      title="Edit"
                    >
                      <span class="icon"><i class="fa-solid fa-pencil"></i></span>
                    </button>
                    <button
                      class="button is-danger button--deleteField"
                      data-note-type-field-id="${field.noteTypeFieldId}"
                      type="button"
                      title="Delete"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              </tr>
            `;
                    }
                    tableHTML += `
                </tbody>
              </table>
            </div>`;
                    tableBlock.innerHTML = tableHTML;
                }
                noteTypePanel.append(tableBlock);
                noteTypesContainerElement.append(noteTypePanel);
            }
        }
        // Attach event listeners
        attachEventListeners();
        // Initialize Sortable for each note type with fields
        initializeSortables();
    }
    function attachEventListeners() {
        // Edit Note Type buttons
        const editButtons = noteTypesContainerElement.querySelectorAll('.button--editNoteType');
        for (const button of editButtons) {
            button.addEventListener('click', openEditNoteTypeModal);
        }
        // Delete Note Type buttons
        const deleteButtons = noteTypesContainerElement.querySelectorAll('.button--deleteNoteType');
        for (const button of deleteButtons) {
            button.addEventListener('click', deleteNoteType);
        }
        // Add Field buttons
        const addFieldButtons = noteTypesContainerElement.querySelectorAll('.button--addField');
        for (const button of addFieldButtons) {
            button.addEventListener('click', openAddFieldModal);
        }
        // Edit Field buttons
        const editFieldButtons = noteTypesContainerElement.querySelectorAll('.button--editField');
        for (const button of editFieldButtons) {
            button.addEventListener('click', openEditFieldModal);
        }
        // Delete Field buttons
        const deleteFieldButtons = noteTypesContainerElement.querySelectorAll('.button--deleteField');
        for (const button of deleteFieldButtons) {
            button.addEventListener('click', deleteField);
        }
    }
    function openAddNoteTypeModal() {
        let formElement;
        let closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddNoteType`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    noteTypes = responseJSON.noteTypes;
                    closeModalFunction();
                    renderNoteTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Note type added successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Note Type',
                        message: responseJSON.message
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNoteTypes-add', {
            onshow(modalElement) {
                shiftLog.populateSectionAliases(modalElement);
                formElement = modalElement.querySelector('form');
                const userGroupSelect = formElement.querySelector('#noteTypeAdd--userGroupId');
                for (const group of userGroups) {
                    const option = document.createElement('option');
                    option.value = group.userGroupId.toString();
                    option.textContent = group.userGroupName;
                    userGroupSelect.append(option);
                }
                formElement.addEventListener('submit', doAdd);
            },
            onshown(modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#noteTypeAdd--noteType').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditNoteTypeModal(clickEvent) {
        const noteTypeId = Number.parseInt(clickEvent.currentTarget.dataset.noteTypeId ?? '', 10);
        const noteType = noteTypes.find((nt) => nt.noteTypeId === noteTypeId);
        if (noteType === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateNoteType`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    noteTypes = responseJSON.noteTypes;
                    closeModalFunction();
                    renderNoteTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Note type updated successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Note Type',
                        message: responseJSON.message
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNoteTypes-edit', {
            onshow(modalElement) {
                shiftLog.populateSectionAliases(modalElement);
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#noteTypeEdit--noteTypeId').value = noteType.noteTypeId.toString();
                formElement.querySelector('#noteTypeEdit--noteType').value = noteType.noteType;
                const userGroupSelect = formElement.querySelector('#noteTypeEdit--userGroupId');
                for (const group of userGroups) {
                    const option = document.createElement('option');
                    option.value = group.userGroupId.toString();
                    option.textContent = group.userGroupName;
                    if (group.userGroupId === noteType.userGroupId) {
                        option.selected = true;
                    }
                    userGroupSelect.append(option);
                }
                ;
                formElement.querySelector('input[name="isAvailableWorkOrders"]').checked = noteType.isAvailableWorkOrders;
                formElement.querySelector('input[name="isAvailableShifts"]').checked = noteType.isAvailableShifts;
                formElement.querySelector('input[name="isAvailableTimesheets"]').checked = noteType.isAvailableTimesheets;
                formElement.addEventListener('submit', doUpdate);
            },
            onshown(modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#noteTypeEdit--noteType').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteNoteType(clickEvent) {
        const noteTypeId = Number.parseInt(clickEvent.currentTarget.dataset.noteTypeId ?? '', 10);
        const noteType = noteTypes.find((nt) => nt.noteTypeId === noteTypeId);
        if (noteType === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: 'Delete Note Type',
            message: `Are you sure you want to delete "${cityssm.escapeHTML(noteType.noteType)}"?`,
            okButton: {
                text: 'Yes, Delete Note Type',
                callbackFunction: () => {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteNoteType`, { noteTypeId }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            renderNoteTypes();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Note type deleted successfully.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Note Type',
                                message: responseJSON.message
                            });
                        }
                    });
                }
            }
        });
    }
    function openAddFieldModal(clickEvent) {
        const noteTypeId = Number.parseInt(clickEvent.currentTarget.dataset.noteTypeId ?? '', 10);
        let formElement;
        let closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddNoteTypeField`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    noteTypes = responseJSON.noteTypes;
                    closeModalFunction();
                    renderNoteTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Field added successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Field',
                        message: responseJSON.message
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNoteTypes-addField', {
            onshow(modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#fieldAdd--noteTypeId').value = noteTypeId.toString();
                const dataListSelect = formElement.querySelector('#fieldAdd--dataListKey');
                for (const list of dataLists) {
                    const option = document.createElement('option');
                    option.value = list.dataListKey;
                    option.textContent = list.dataListName;
                    dataListSelect.append(option);
                }
                const fieldTypeSelect = formElement.querySelector('#fieldAdd--fieldInputType');
                const dataListField = formElement.querySelector('#field--dataListKey');
                const minMaxFields = formElement.querySelector('#fields--minMax');
                const unitPrefixSuffixFields = formElement.querySelector('#fields--unitPrefixSuffix');
                function updateFieldVisibility() {
                    const fieldType = fieldTypeSelect.value;
                    const isTextOrSelect = fieldType === 'text' || fieldType === 'select';
                    const isTextOrNumber = fieldType === 'text' || fieldType === 'number';
                    dataListField.classList.toggle('is-hidden', !isTextOrSelect);
                    minMaxFields.classList.toggle('is-hidden', !isTextOrNumber);
                    unitPrefixSuffixFields.classList.toggle('is-hidden', !isTextOrNumber);
                }
                fieldTypeSelect.addEventListener('change', updateFieldVisibility);
                updateFieldVisibility();
                formElement.addEventListener('submit', doAdd);
            },
            onshown(modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#fieldAdd--fieldLabel').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditFieldModal(clickEvent) {
        const fieldId = Number.parseInt(clickEvent.currentTarget.dataset.noteTypeFieldId ??
            '', 10);
        const noteTypeId = Number.parseInt(clickEvent.currentTarget.dataset.noteTypeId ?? '', 10);
        const noteType = noteTypes.find((nt) => nt.noteTypeId === noteTypeId);
        if (noteType === undefined) {
            return;
        }
        const field = noteType.fields.find((f) => f.noteTypeFieldId === fieldId);
        if (field === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateNoteTypeField`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    noteTypes = responseJSON.noteTypes;
                    closeModalFunction();
                    renderNoteTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Field updated successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Field',
                        message: responseJSON.message
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNoteTypes-editField', {
            onshow(modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#fieldEdit--noteTypeFieldId').value = field.noteTypeFieldId.toString();
                formElement.querySelector('#fieldEdit--fieldLabel').value = field.fieldLabel;
                const fieldTypeSelect = formElement.querySelector('#fieldEdit--fieldInputType');
                fieldTypeSelect.value = field.fieldInputType;
                const dataListSelect = formElement.querySelector('#fieldEdit--dataListKey');
                for (const list of dataLists) {
                    const option = document.createElement('option');
                    option.value = list.dataListKey;
                    option.textContent = list.dataListName;
                    if (list.dataListKey === field.dataListKey) {
                        option.selected = true;
                    }
                    dataListSelect.append(option);
                }
                ;
                formElement.querySelector('#fieldEdit--fieldValueMin').value = field.fieldValueMin?.toString() ?? '';
                formElement.querySelector('#fieldEdit--fieldValueMax').value = field.fieldValueMax?.toString() ?? '';
                formElement.querySelector('#fieldEdit--fieldUnitPrefix').value = field.fieldUnitPrefix;
                formElement.querySelector('#fieldEdit--fieldUnitSuffix').value = field.fieldUnitSuffix;
                formElement.querySelector('#fieldEdit--fieldHelpText').value = field.fieldHelpText;
                formElement.querySelector('input[name="fieldValueRequired"]').checked = field.fieldValueRequired;
                formElement.querySelector('input[name="hasDividerAbove"]').checked = field.hasDividerAbove;
                const dataListField = formElement.querySelector('#field--dataListKey');
                const minMaxFields = formElement.querySelector('#fields--minMax');
                const unitPrefixSuffixFields = formElement.querySelector('#fields--unitPrefixSuffix');
                // Update field visibility based on the current field type (since it can't be changed)
                const fieldType = fieldTypeSelect.value;
                const isTextOrSelect = fieldType === 'text' || fieldType === 'select';
                const isTextOrNumber = fieldType === 'text' || fieldType === 'number';
                dataListField.classList.toggle('is-hidden', !isTextOrSelect);
                minMaxFields.classList.toggle('is-hidden', !isTextOrNumber);
                unitPrefixSuffixFields.classList.toggle('is-hidden', !isTextOrNumber);
                formElement.addEventListener('submit', doUpdate);
            },
            onshown(modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#fieldEdit--fieldLabel').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteField(clickEvent) {
        const fieldId = Number.parseInt(clickEvent.currentTarget.dataset.noteTypeFieldId ??
            '', 10);
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: 'Delete Field',
            message: 'Are you sure you want to delete this field?',
            okButton: {
                text: 'Yes, Delete Field',
                callbackFunction: () => {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteNoteTypeField`, { noteTypeFieldId: fieldId }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            renderNoteTypes();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Field deleted successfully.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Field',
                                message: responseJSON.message
                            });
                        }
                    });
                }
            }
        });
    }
    function initializeSortables() {
        for (const noteType of noteTypes) {
            const tbodyElement = document.querySelector(`#noteTypeFields--${noteType.noteTypeId}`);
            if (tbodyElement === null || noteType.fields.length === 0) {
                continue;
            }
            // Destroy existing Sortable instance before creating a new one
            const existingInstance = sortableInstances.get(noteType.noteTypeId);
            if (existingInstance !== undefined) {
                existingInstance.destroy();
            }
            // Create new Sortable instance
            const sortableInstance = Sortable.create(tbodyElement, {
                handle: '.handle',
                animation: 150,
                onEnd() {
                    // Get the new order
                    const rows = tbodyElement.querySelectorAll('tr[data-note-type-field-id]');
                    const noteTypeFieldIds = [];
                    for (const row of rows) {
                        const fieldId = row.dataset.noteTypeFieldId;
                        if (fieldId !== undefined) {
                            noteTypeFieldIds.push(Number.parseInt(fieldId, 10));
                        }
                    }
                    // Save the new order to the database
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doReorderNoteTypeFields`, {
                        noteTypeId: noteType.noteTypeId,
                        noteTypeFieldIds
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.noteTypes !== undefined) {
                            noteTypes = responseJSON.noteTypes;
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Field order saved successfully.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Saving Field Order',
                                message: 'An error occurred while saving the field order. Please try again.'
                            });
                            // Refresh to restore original order
                            renderNoteTypes();
                        }
                    });
                }
            });
            // Store the instance for future reference
            sortableInstances.set(noteType.noteTypeId, sortableInstance);
        }
    }
    // Initialize
    renderNoteTypes();
    // Add Note Type button
    document
        .querySelector('#button--addNoteType')
        ?.addEventListener('click', openAddNoteTypeModal);
    // Availability filter
    document
        .querySelector('#filter--availability')
        ?.addEventListener('change', (event) => {
        availabilityFilter = event.target.value;
        renderNoteTypes();
    });
})();
