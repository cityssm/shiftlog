"use strict";
/* eslint-disable max-lines -- Complex admin interface with multiple modals */
/* eslint-disable no-unsanitized/property -- Using cityssm.escapeHTML() for sanitization */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a, _b;
    var shiftLog = exports.shiftLog;
    var noteTypesContainerElement = document.querySelector('#container--noteTypes');
    var noteTypes = exports.noteTypes;
    var userGroups = exports.userGroups;
    var dataLists = exports.dataLists;
    // Track which panels are open
    var openPanels = new Set();
    // Track Sortable instances
    var sortableInstances = new Map();
    // Track current filter
    var availabilityFilter = '';
    function renderNoteTypes() {
        // Store currently open panels before re-rendering
        var openDetails = noteTypesContainerElement.querySelectorAll('details[open]');
        for (var _i = 0, openDetails_1 = openDetails; _i < openDetails_1.length; _i++) {
            var detail = openDetails_1[_i];
            var noteTypeId = detail.dataset.noteTypeId;
            if (noteTypeId) {
                openPanels.add(Number.parseInt(noteTypeId, 10));
            }
        }
        noteTypesContainerElement.innerHTML = '';
        // Filter note types based on availability
        var filteredNoteTypes = noteTypes.filter(function (noteType) {
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
            var emptyMessage = document.createElement('div');
            emptyMessage.className = 'panel-block is-block';
            emptyMessage.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <p class=\"message-body\">\n            <strong>No note types available.</strong><br />\n            Click \"Add Note Type\" to create your first note type.\n          </p>\n        </div>\n      ";
            noteTypesContainerElement.append(emptyMessage);
        }
        else {
            for (var _a = 0, filteredNoteTypes_1 = filteredNoteTypes; _a < filteredNoteTypes_1.length; _a++) {
                var noteType = filteredNoteTypes_1[_a];
                var noteTypePanel = document.createElement('details');
                noteTypePanel.className = 'panel mb-5 collapsable-panel';
                noteTypePanel.dataset.noteTypeId = noteType.noteTypeId.toString();
                // Restore open state
                if (openPanels.has(noteType.noteTypeId)) {
                    noteTypePanel.setAttribute('open', '');
                }
                var summaryElement = document.createElement('summary');
                summaryElement.className = 'panel-heading is-clickable';
                var availabilityBadges = [];
                if (noteType.isAvailableWorkOrders) {
                    availabilityBadges.push("<span class=\"tag is-info is-light\">".concat(cityssm.escapeHTML(shiftLog.workOrdersSectionName), "</span>"));
                }
                if (noteType.isAvailableShifts) {
                    availabilityBadges.push("<span class=\"tag is-info is-light\">".concat(cityssm.escapeHTML(shiftLog.shiftsSectionName), "</span>"));
                }
                if (noteType.isAvailableTimesheets) {
                    availabilityBadges.push("<span class=\"tag is-info is-light\">".concat(cityssm.escapeHTML(shiftLog.timesheetsSectionName), "</span>"));
                }
                summaryElement.innerHTML = /* html */ "\n          <span class=\"icon-text\">\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-chevron-right details-chevron\"></i>\n            </span>\n            <span class=\"has-text-weight-semibold mr-2\">\n              ".concat(cityssm.escapeHTML(noteType.noteType), "\n            </span>\n            <span class=\"tags\">\n              <span class=\"tag is-rounded ").concat(noteType.fields.length === 0 ? 'is-warning' : '', "\">\n                ").concat(noteType.fields.length, " ").concat(noteType.fields.length === 1 ? 'field' : 'fields', "\n              </span>\n              ").concat(availabilityBadges.length > 0 ? availabilityBadges.join(' ') : '', "\n            </span>\n          </span>\n        ");
                noteTypePanel.append(summaryElement);
                // Action buttons panel
                var actionBlock = document.createElement('div');
                actionBlock.className = 'panel-block is-justify-content-space-between';
                actionBlock.innerHTML = /* html */ "\n          <div>\n            <button class=\"button is-small is-info button--editNoteType\" data-note-type-id=\"".concat(noteType.noteTypeId, "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-pencil\"></i></span>\n              <span>Edit Note Type</span>\n            </button>\n          </div>\n          <div>\n            <button class=\"button is-success is-small button--addField\" data-note-type-id=\"").concat(noteType.noteTypeId, "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-plus\"></i></span>\n              <span>Add Field</span>\n            </button>\n            <button class=\"button is-danger is-small button--deleteNoteType\" data-note-type-id=\"").concat(noteType.noteTypeId, "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-trash\"></i></span>\n              <span>Delete</span>\n            </button>\n          </div>\n        ");
                noteTypePanel.append(actionBlock);
                // Fields table
                var tableBlock = document.createElement('div');
                tableBlock.className = 'panel-block p-0';
                if (noteType.fields.length === 0) {
                    tableBlock.innerHTML = /* html */ "\n            <div class=\"table-container\" style=\"width: 100%;\">\n              <table class=\"table is-striped is-hoverable is-fullwidth mb-0\">\n                <tbody>\n                  <tr>\n                    <td class=\"has-text-centered has-text-grey\" colspan=\"5\">\n                      No fields defined. Click \"Add Field\" to create fields for this note type.\n                    </td>\n                  </tr>\n                </tbody>\n              </table>\n            </div>\n          ";
                }
                else {
                    var tableHTML = /* html */ "\n            <div class=\"table-container\" style=\"width: 100%;\">\n              <table class=\"table is-striped is-hoverable is-fullwidth mb-0\">\n                <thead>\n                  <tr>\n                    <th class=\"has-text-centered\" style=\"width: 60px;\">Order</th>\n                    <th>Label</th>\n                    <th>Type</th>\n                    <th>Help Text</th>\n                    <th class=\"has-text-right\" style=\"width: 150px;\">\n                      <span class=\"is-sr-only\">Actions</span>\n                    </th>\n                  </tr>\n                </thead>\n                <tbody class=\"is-sortable\" id=\"noteTypeFields--".concat(noteType.noteTypeId, "\">\n          ");
                    for (var _b = 0, _c = noteType.fields; _b < _c.length; _b++) {
                        var field = _c[_b];
                        var dividerStyle = field.hasDividerAbove
                            ? ' style="border-top-width:5px"'
                            : '';
                        tableHTML += /* html */ "\n              <tr data-note-type-field-id=\"".concat(field.noteTypeFieldId, "\">\n                <td class=\"has-text-centered\">\n                  <span class=\"icon is-small has-text-grey handle\" style=\"cursor: move;\">\n                    <i class=\"fa-solid fa-grip-vertical\"></i>\n                  </span>\n                </td>\n                <td ").concat(dividerStyle, ">\n                  <span class=\"field-label\">").concat(cityssm.escapeHTML(field.fieldLabel), "</span>\n                  ").concat(field.fieldValueRequired ? '<span class="icon is-small has-text-success ml-1" title="Required"><i class="fa-solid fa-asterisk"></i></span>' : '', "\n                </td>\n                <td><span class=\"tag\">").concat(cityssm.escapeHTML(field.fieldInputType), "</span></td>\n                <td class=\"is-size-7\">").concat(cityssm.escapeHTML(field.fieldHelpText), "</td>\n                <td class=\"has-text-right\">\n                  <div class=\"buttons are-small is-right\">\n                    <button\n                      class=\"button is-info button--editField\"\n                      data-note-type-field-id=\"").concat(field.noteTypeFieldId, "\"\n                      data-note-type-id=\"").concat(noteType.noteTypeId, "\"\n                      type=\"button\"\n                      title=\"Edit\"\n                    >\n                      <span class=\"icon\"><i class=\"fa-solid fa-pencil\"></i></span>\n                    </button>\n                    <button\n                      class=\"button is-danger button--deleteField\"\n                      data-note-type-field-id=\"").concat(field.noteTypeFieldId, "\"\n                      type=\"button\"\n                      title=\"Delete\"\n                    >\n                      <span class=\"icon\"><i class=\"fa-solid fa-trash\"></i></span>\n                    </button>\n                  </div>\n                </td>\n              </tr>\n            ");
                    }
                    tableHTML += "\n                </tbody>\n              </table>\n            </div>";
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
        var editButtons = noteTypesContainerElement.querySelectorAll('.button--editNoteType');
        for (var _i = 0, editButtons_1 = editButtons; _i < editButtons_1.length; _i++) {
            var button = editButtons_1[_i];
            button.addEventListener('click', openEditNoteTypeModal);
        }
        // Delete Note Type buttons
        var deleteButtons = noteTypesContainerElement.querySelectorAll('.button--deleteNoteType');
        for (var _a = 0, deleteButtons_1 = deleteButtons; _a < deleteButtons_1.length; _a++) {
            var button = deleteButtons_1[_a];
            button.addEventListener('click', deleteNoteType);
        }
        // Add Field buttons
        var addFieldButtons = noteTypesContainerElement.querySelectorAll('.button--addField');
        for (var _b = 0, addFieldButtons_1 = addFieldButtons; _b < addFieldButtons_1.length; _b++) {
            var button = addFieldButtons_1[_b];
            button.addEventListener('click', openAddFieldModal);
        }
        // Edit Field buttons
        var editFieldButtons = noteTypesContainerElement.querySelectorAll('.button--editField');
        for (var _c = 0, editFieldButtons_1 = editFieldButtons; _c < editFieldButtons_1.length; _c++) {
            var button = editFieldButtons_1[_c];
            button.addEventListener('click', openEditFieldModal);
        }
        // Delete Field buttons
        var deleteFieldButtons = noteTypesContainerElement.querySelectorAll('.button--deleteField');
        for (var _d = 0, deleteFieldButtons_1 = deleteFieldButtons; _d < deleteFieldButtons_1.length; _d++) {
            var button = deleteFieldButtons_1[_d];
            button.addEventListener('click', deleteField);
        }
    }
    function openAddNoteTypeModal() {
        var formElement;
        var closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddNoteType"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
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
            onshow: function (modalElement) {
                shiftLog.populateSectionAliases(modalElement);
                formElement = modalElement.querySelector('form');
                var userGroupSelect = formElement.querySelector('#noteTypeAdd--userGroupId');
                for (var _i = 0, userGroups_1 = userGroups; _i < userGroups_1.length; _i++) {
                    var group = userGroups_1[_i];
                    var option = document.createElement('option');
                    option.value = group.userGroupId.toString();
                    option.textContent = group.userGroupName;
                    userGroupSelect.append(option);
                }
                formElement.addEventListener('submit', doAdd);
            },
            onshown: function (modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#noteTypeAdd--noteType').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditNoteTypeModal(clickEvent) {
        var _a;
        var noteTypeId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeId) !== null && _a !== void 0 ? _a : '', 10);
        var noteType = noteTypes.find(function (nt) { return nt.noteTypeId === noteTypeId; });
        if (noteType === undefined) {
            return;
        }
        var formElement;
        var closeModalFunction;
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateNoteType"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
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
            onshow: function (modalElement) {
                shiftLog.populateSectionAliases(modalElement);
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#noteTypeEdit--noteTypeId').value = noteType.noteTypeId.toString();
                formElement.querySelector('#noteTypeEdit--noteType').value = noteType.noteType;
                var userGroupSelect = formElement.querySelector('#noteTypeEdit--userGroupId');
                for (var _i = 0, userGroups_2 = userGroups; _i < userGroups_2.length; _i++) {
                    var group = userGroups_2[_i];
                    var option = document.createElement('option');
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
            onshown: function (modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#noteTypeEdit--noteType').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteNoteType(clickEvent) {
        var _a;
        var noteTypeId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeId) !== null && _a !== void 0 ? _a : '', 10);
        var noteType = noteTypes.find(function (nt) { return nt.noteTypeId === noteTypeId; });
        if (noteType === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: 'Delete Note Type',
            message: "Are you sure you want to delete \"".concat(cityssm.escapeHTML(noteType.noteType), "\"?"),
            okButton: {
                text: 'Yes, Delete Note Type',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteNoteType"), { noteTypeId: noteTypeId }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
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
        var _a;
        var noteTypeId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeId) !== null && _a !== void 0 ? _a : '', 10);
        var formElement;
        var closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddNoteTypeField"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
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
            onshow: function (modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#fieldAdd--noteTypeId').value = noteTypeId.toString();
                var dataListSelect = formElement.querySelector('#fieldAdd--dataListKey');
                for (var _i = 0, dataLists_1 = dataLists; _i < dataLists_1.length; _i++) {
                    var list = dataLists_1[_i];
                    var option = document.createElement('option');
                    option.value = list.dataListKey;
                    option.textContent = list.dataListName;
                    dataListSelect.append(option);
                }
                var fieldTypeSelect = formElement.querySelector('#fieldAdd--fieldInputType');
                var dataListField = formElement.querySelector('#field--dataListKey');
                var minMaxFields = formElement.querySelector('#fields--minMax');
                function updateFieldVisibility() {
                    var fieldType = fieldTypeSelect.value;
                    dataListField.classList.toggle('is-hidden', !(fieldType === 'text' || fieldType === 'select'));
                    minMaxFields.classList.toggle('is-hidden', !(fieldType === 'text' || fieldType === 'number'));
                }
                fieldTypeSelect.addEventListener('change', updateFieldVisibility);
                updateFieldVisibility();
                formElement.addEventListener('submit', doAdd);
            },
            onshown: function (modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#fieldAdd--fieldLabel').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditFieldModal(clickEvent) {
        var _a, _b;
        var fieldId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeFieldId) !== null && _a !== void 0 ? _a : '', 10);
        var noteTypeId = Number.parseInt((_b = clickEvent.currentTarget.dataset.noteTypeId) !== null && _b !== void 0 ? _b : '', 10);
        var noteType = noteTypes.find(function (nt) { return nt.noteTypeId === noteTypeId; });
        if (noteType === undefined) {
            return;
        }
        var field = noteType.fields.find(function (f) { return f.noteTypeFieldId === fieldId; });
        if (field === undefined) {
            return;
        }
        var formElement;
        var closeModalFunction;
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateNoteTypeField"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
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
            onshow: function (modalElement) {
                var _a, _b, _c, _d;
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#fieldEdit--noteTypeFieldId').value = field.noteTypeFieldId.toString();
                formElement.querySelector('#fieldEdit--fieldLabel').value = field.fieldLabel;
                var fieldTypeSelect = formElement.querySelector('#fieldEdit--fieldInputType');
                fieldTypeSelect.value = field.fieldInputType;
                var dataListSelect = formElement.querySelector('#fieldEdit--dataListKey');
                for (var _i = 0, dataLists_2 = dataLists; _i < dataLists_2.length; _i++) {
                    var list = dataLists_2[_i];
                    var option = document.createElement('option');
                    option.value = list.dataListKey;
                    option.textContent = list.dataListName;
                    if (list.dataListKey === field.dataListKey) {
                        option.selected = true;
                    }
                    dataListSelect.append(option);
                }
                ;
                formElement.querySelector('#fieldEdit--fieldValueMin').value = (_b = (_a = field.fieldValueMin) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                formElement.querySelector('#fieldEdit--fieldValueMax').value = (_d = (_c = field.fieldValueMax) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
                formElement.querySelector('#fieldEdit--fieldHelpText').value = field.fieldHelpText;
                formElement.querySelector('input[name="fieldValueRequired"]').checked = field.fieldValueRequired;
                formElement.querySelector('input[name="hasDividerAbove"]').checked = field.hasDividerAbove;
                var dataListField = formElement.querySelector('#field--dataListKey');
                var minMaxFields = formElement.querySelector('#fields--minMax');
                // Update field visibility based on the current field type (since it can't be changed)
                var fieldType = fieldTypeSelect.value;
                dataListField.classList.toggle('is-hidden', !(fieldType === 'text' || fieldType === 'select'));
                minMaxFields.classList.toggle('is-hidden', !(fieldType === 'text' || fieldType === 'number'));
                formElement.addEventListener('submit', doUpdate);
            },
            onshown: function (modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#fieldEdit--fieldLabel').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteField(clickEvent) {
        var _a;
        var fieldId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeFieldId) !== null && _a !== void 0 ? _a : '', 10);
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: 'Delete Field',
            message: 'Are you sure you want to delete this field?',
            okButton: {
                text: 'Yes, Delete Field',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteNoteTypeField"), { noteTypeFieldId: fieldId }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
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
        var _loop_1 = function (noteType) {
            var tbodyElement = document.querySelector("#noteTypeFields--".concat(noteType.noteTypeId));
            if (tbodyElement === null || noteType.fields.length === 0) {
                return "continue";
            }
            // Destroy existing Sortable instance before creating a new one
            var existingInstance = sortableInstances.get(noteType.noteTypeId);
            if (existingInstance !== undefined) {
                existingInstance.destroy();
            }
            // Create new Sortable instance
            var sortableInstance = Sortable.create(tbodyElement, {
                handle: '.handle',
                animation: 150,
                onEnd: function () {
                    // Get the new order
                    var rows = tbodyElement.querySelectorAll('tr[data-note-type-field-id]');
                    var noteTypeFieldIds = [];
                    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        var row = rows_1[_i];
                        var fieldId = row.dataset.noteTypeFieldId;
                        if (fieldId !== undefined) {
                            noteTypeFieldIds.push(Number.parseInt(fieldId, 10));
                        }
                    }
                    // Save the new order to the database
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doReorderNoteTypeFields"), {
                        noteTypeId: noteType.noteTypeId,
                        noteTypeFieldIds: noteTypeFieldIds
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
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
        };
        for (var _i = 0, noteTypes_1 = noteTypes; _i < noteTypes_1.length; _i++) {
            var noteType = noteTypes_1[_i];
            _loop_1(noteType);
        }
    }
    // Initialize
    renderNoteTypes();
    // Add Note Type button
    (_a = document
        .querySelector('#button--addNoteType')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openAddNoteTypeModal);
    // Availability filter
    (_b = document
        .querySelector('#filter--availability')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', function (event) {
        availabilityFilter = event.target.value;
        renderNoteTypes();
    });
})();
