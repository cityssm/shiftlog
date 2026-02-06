"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var noteTypesContainerElement = document.querySelector('#container--noteTypes');
    var noteTypes = exports.noteTypes;
    var userGroups = exports.userGroups;
    var dataLists = exports.dataLists;
    function renderNoteTypes() {
        var panelElement = document.createElement('div');
        panelElement.className = 'panel';
        if (noteTypes.length === 0) {
            panelElement.innerHTML = "<div class=\"panel-block\">\n        <div class=\"message is-info\">\n          <p class=\"message-body\">\n            <strong>No note types available.</strong><br />\n            Click \"Add Note Type\" to create your first note type.\n          </p>\n        </div>\n      </div>";
        }
        else {
            for (var _i = 0, noteTypes_1 = noteTypes; _i < noteTypes_1.length; _i++) {
                var noteType = noteTypes_1[_i];
                var noteTypePanel = document.createElement('details');
                noteTypePanel.className = 'panel mb-5 collapsable-panel';
                noteTypePanel.dataset.noteTypeId = noteType.noteTypeId.toString();
                var summaryElement = document.createElement('summary');
                summaryElement.className = 'panel-heading is-clickable';
                var availabilityBadges = [];
                if (noteType.isAvailableWorkOrders) {
                    availabilityBadges.push('<span class="tag is-info is-light">Work Orders</span>');
                }
                if (noteType.isAvailableShifts) {
                    availabilityBadges.push('<span class="tag is-info is-light">Shifts</span>');
                }
                if (noteType.isAvailableTimesheets) {
                    availabilityBadges.push('<span class="tag is-info is-light">Timesheets</span>');
                }
                summaryElement.innerHTML = "\n          <span class=\"icon-text\">\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-chevron-right details-chevron\"></i>\n            </span>\n            <span class=\"has-text-weight-semibold mr-2\">\n              ".concat(cityssm.escapeHTML(noteType.noteType), "\n            </span>\n            <span class=\"tag is-rounded\">\n              ").concat(noteType.fields.length, " ").concat(noteType.fields.length === 1 ? 'field' : 'fields', "\n            </span>\n            ").concat(availabilityBadges.length > 0 ? "<span class=\"ml-2\">".concat(availabilityBadges.join(' '), "</span>") : '', "\n          </span>");
                noteTypePanel.append(summaryElement);
                // Action buttons panel
                var actionBlock = document.createElement('div');
                actionBlock.className = 'panel-block is-justify-content-space-between';
                actionBlock.innerHTML = "\n          <div>\n            <button class=\"button is-small is-light button--editNoteType\" data-note-type-id=\"".concat(noteType.noteTypeId, "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-pencil\"></i></span>\n              <span>Edit Note Type</span>\n            </button>\n          </div>\n          <div>\n            <button class=\"button is-success is-small button--addField\" data-note-type-id=\"").concat(noteType.noteTypeId, "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-plus\"></i></span>\n              <span>Add Field</span>\n            </button>\n            <button class=\"button is-danger is-small button--deleteNoteType\" data-note-type-id=\"").concat(noteType.noteTypeId, "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-trash\"></i></span>\n              <span>Delete</span>\n            </button>\n          </div>");
                noteTypePanel.append(actionBlock);
                // Fields table
                var tableBlock = document.createElement('div');
                tableBlock.className = 'panel-block p-0';
                if (noteType.fields.length === 0) {
                    tableBlock.innerHTML = "\n            <div class=\"box m-3\" style=\"width: 100%;\">\n              <p class=\"has-text-grey has-text-centered\">\n                No fields defined. Click \"Add Field\" to create fields for this note type.\n              </p>\n            </div>";
                }
                else {
                    var tableHTML = "\n            <div class=\"table-container\" style=\"width: 100%;\">\n              <table class=\"table is-striped is-hoverable is-fullwidth mb-0\">\n                <thead>\n                  <tr>\n                    <th>Label</th>\n                    <th>Type</th>\n                    <th>Help Text</th>\n                    <th>Required</th>\n                    <th class=\"has-text-centered\" style=\"width: 150px;\">Actions</th>\n                  </tr>\n                </thead>\n                <tbody>";
                    for (var _a = 0, _b = noteType.fields; _a < _b.length; _a++) {
                        var field = _b[_a];
                        tableHTML += "\n              <tr data-field-id=\"".concat(field.noteTypeFieldId, "\">\n                <td>").concat(cityssm.escapeHTML(field.fieldLabel), "</td>\n                <td><span class=\"tag\">").concat(cityssm.escapeHTML(field.fieldInputType), "</span></td>\n                <td class=\"is-size-7\">").concat(cityssm.escapeHTML(field.fieldHelpText), "</td>\n                <td class=\"has-text-centered\">\n                  ").concat(field.fieldValueRequired ? '<i class="fa-solid fa-check has-text-success"></i>' : '', "\n                </td>\n                <td class=\"has-text-centered\">\n                  <button class=\"button is-small is-light button--editField\" \n                    data-note-type-field-id=\"").concat(field.noteTypeFieldId, "\" \n                    data-note-type-id=\"").concat(noteType.noteTypeId, "\" \n                    type=\"button\">\n                    <span class=\"icon\"><i class=\"fa-solid fa-pencil\"></i></span>\n                  </button>\n                  <button class=\"button is-small is-danger button--deleteField\" \n                    data-note-type-field-id=\"").concat(field.noteTypeFieldId, "\" \n                    type=\"button\">\n                    <span class=\"icon\"><i class=\"fa-solid fa-trash\"></i></span>\n                  </button>\n                </td>\n              </tr>");
                    }
                    tableHTML += "\n                </tbody>\n              </table>\n            </div>";
                    tableBlock.innerHTML = tableHTML;
                }
                noteTypePanel.append(tableBlock);
                panelElement.append(noteTypePanel);
            }
        }
        noteTypesContainerElement.innerHTML = '';
        noteTypesContainerElement.append(panelElement);
        // Attach event listeners
        attachEventListeners();
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
        var addModalElement;
        function closeModal() {
            addModalElement.remove();
        }
        var userGroupOptionsHTML = "<option value=\"\">(Any User Group)</option>" +
            userGroups.map(function (group) { return "<option value=\"".concat(group.userGroupId, "\">").concat(cityssm.escapeHTML(group.userGroupName), "</option>"); }).join('');
        addModalElement = cityssm.openHtmlModal('add-noteType', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('#noteTypeAdd--noteType').focus();
            },
            onshown: function (_modalElement, closeModalFunction) {
                var formElement = addModalElement.querySelector('form');
                formElement.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddNoteType"), formElement, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            closeModalFunction();
                            renderNoteTypes();
                            bulmaJS.notification({
                                message: 'Note type added successfully.',
                                type: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Adding Note Type',
                                message: responseJSON.message
                            });
                        }
                    });
                });
            }
        });
        addModalElement.innerHTML = "\n      <form>\n        <div class=\"modal-card\">\n          <header class=\"modal-card-head\">\n            <p class=\"modal-card-title\">Add Note Type</p>\n            <button class=\"delete\" type=\"button\" aria-label=\"close\"></button>\n          </header>\n          <section class=\"modal-card-body\">\n            <div class=\"field\">\n              <label class=\"label\" for=\"noteTypeAdd--noteType\">\n                Note Type Name\n                <span class=\"has-text-danger\" title=\"Required\">*</span>\n              </label>\n              <div class=\"control\">\n                <input class=\"input\" id=\"noteTypeAdd--noteType\" name=\"noteType\" type=\"text\" required maxlength=\"100\" />\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\" for=\"noteTypeAdd--userGroupId\">User Group</label>\n              <div class=\"control\">\n                <div class=\"select is-fullwidth\">\n                  <select id=\"noteTypeAdd--userGroupId\" name=\"userGroupId\">\n                    ".concat(userGroupOptionsHTML, "\n                  </select>\n                </div>\n              </div>\n              <p class=\"help\">Restrict this note type to a specific user group.</p>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\">Availability</label>\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"isAvailableWorkOrders\" value=\"1\" />\n                  Available for Work Orders\n                </label>\n              </div>\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"isAvailableShifts\" value=\"1\" />\n                  Available for Shifts\n                </label>\n              </div>\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"isAvailableTimesheets\" value=\"1\" />\n                  Available for Timesheets\n                </label>\n              </div>\n            </div>\n          </section>\n          <footer class=\"modal-card-foot is-justify-content-end\">\n            <button class=\"button is-success\" type=\"submit\">\n              <span class=\"icon\"><i class=\"fa-solid fa-save\"></i></span>\n              <span>Add Note Type</span>\n            </button>\n            <button class=\"button\" type=\"button\" data-close>Cancel</button>\n          </footer>\n        </div>\n      </form>");
    }
    function openEditNoteTypeModal(clickEvent) {
        var _a;
        var noteTypeId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeId) !== null && _a !== void 0 ? _a : '', 10);
        var noteType = noteTypes.find(function (nt) { return nt.noteTypeId === noteTypeId; });
        if (noteType === undefined) {
            return;
        }
        var editModalElement;
        function closeModal() {
            editModalElement.remove();
        }
        var userGroupOptionsHTML = "<option value=\"\">(Any User Group)</option>" +
            userGroups.map(function (group) {
                var selected = group.userGroupId === noteType.userGroupId ? ' selected' : '';
                return "<option value=\"".concat(group.userGroupId, "\"").concat(selected, ">").concat(cityssm.escapeHTML(group.userGroupName), "</option>");
            }).join('');
        editModalElement = cityssm.openHtmlModal('edit-noteType', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('#noteTypeEdit--noteType').focus();
            },
            onshown: function (_modalElement, closeModalFunction) {
                var formElement = editModalElement.querySelector('form');
                formElement.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateNoteType"), formElement, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            closeModalFunction();
                            renderNoteTypes();
                            bulmaJS.notification({
                                message: 'Note type updated successfully.',
                                type: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Updating Note Type',
                                message: responseJSON.message
                            });
                        }
                    });
                });
            }
        });
        editModalElement.innerHTML = "\n      <form>\n        <input type=\"hidden\" name=\"noteTypeId\" value=\"".concat(noteType.noteTypeId, "\" />\n        <div class=\"modal-card\">\n          <header class=\"modal-card-head\">\n            <p class=\"modal-card-title\">Edit Note Type</p>\n            <button class=\"delete\" type=\"button\" aria-label=\"close\"></button>\n          </header>\n          <section class=\"modal-card-body\">\n            <div class=\"field\">\n              <label class=\"label\" for=\"noteTypeEdit--noteType\">\n                Note Type Name\n                <span class=\"has-text-danger\" title=\"Required\">*</span>\n              </label>\n              <div class=\"control\">\n                <input class=\"input\" id=\"noteTypeEdit--noteType\" name=\"noteType\" type=\"text\" required maxlength=\"100\" value=\"").concat(cityssm.escapeHTML(noteType.noteType), "\" />\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\" for=\"noteTypeEdit--userGroupId\">User Group</label>\n              <div class=\"control\">\n                <div class=\"select is-fullwidth\">\n                  <select id=\"noteTypeEdit--userGroupId\" name=\"userGroupId\">\n                    ").concat(userGroupOptionsHTML, "\n                  </select>\n                </div>\n              </div>\n              <p class=\"help\">Restrict this note type to a specific user group.</p>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\">Availability</label>\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"isAvailableWorkOrders\" value=\"1\" ").concat(noteType.isAvailableWorkOrders ? 'checked' : '', " />\n                  Available for Work Orders\n                </label>\n              </div>\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"isAvailableShifts\" value=\"1\" ").concat(noteType.isAvailableShifts ? 'checked' : '', " />\n                  Available for Shifts\n                </label>\n              </div>\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"isAvailableTimesheets\" value=\"1\" ").concat(noteType.isAvailableTimesheets ? 'checked' : '', " />\n                  Available for Timesheets\n                </label>\n              </div>\n            </div>\n          </section>\n          <footer class=\"modal-card-foot is-justify-content-end\">\n            <button class=\"button is-success\" type=\"submit\">\n              <span class=\"icon\"><i class=\"fa-solid fa-save\"></i></span>\n              <span>Save Changes</span>\n            </button>\n            <button class=\"button\" type=\"button\" data-close>Cancel</button>\n          </footer>\n        </div>\n      </form>");
    }
    function deleteNoteType(clickEvent) {
        var _a;
        var noteTypeId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeId) !== null && _a !== void 0 ? _a : '', 10);
        var noteType = noteTypes.find(function (nt) { return nt.noteTypeId === noteTypeId; });
        if (noteType === undefined) {
            return;
        }
        bulmaJS.confirm({
            title: 'Delete Note Type',
            message: "Are you sure you want to delete \"".concat(cityssm.escapeHTML(noteType.noteType), "\"?"),
            contextualColorName: 'danger',
            okButton: {
                text: 'Yes, Delete Note Type',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteNoteType"), { noteTypeId: noteTypeId }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            renderNoteTypes();
                            bulmaJS.notification({
                                message: 'Note type deleted successfully.',
                                type: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
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
        var addModalElement;
        function closeModal() {
            addModalElement.remove();
        }
        var dataListOptionsHTML = "<option value=\"\">(None)</option>" +
            dataLists.map(function (list) { return "<option value=\"".concat(cityssm.escapeHTML(list.dataListKey), "\">").concat(cityssm.escapeHTML(list.dataListName), "</option>"); }).join('');
        addModalElement = cityssm.openHtmlModal('add-field', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('#fieldAdd--fieldLabel').focus();
                // Handle field type changes
                var fieldTypeSelect = modalElement.querySelector('#fieldAdd--fieldInputType');
                var dataListField = modalElement.querySelector('#field--dataListKey');
                var minMaxFields = modalElement.querySelector('#fields--minMax');
                function updateFieldVisibility() {
                    var fieldType = fieldTypeSelect.value;
                    // Show/hide dataListKey for text and select
                    if (fieldType === 'text' || fieldType === 'select') {
                        dataListField.classList.remove('is-hidden');
                    }
                    else {
                        dataListField.classList.add('is-hidden');
                    }
                    // Show/hide min/max for text and number
                    if (fieldType === 'text' || fieldType === 'number') {
                        minMaxFields.classList.remove('is-hidden');
                    }
                    else {
                        minMaxFields.classList.add('is-hidden');
                    }
                }
                fieldTypeSelect.addEventListener('change', updateFieldVisibility);
                updateFieldVisibility();
            },
            onshown: function (_modalElement, closeModalFunction) {
                var formElement = addModalElement.querySelector('form');
                formElement.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddNoteTypeField"), formElement, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            closeModalFunction();
                            renderNoteTypes();
                            bulmaJS.notification({
                                message: 'Field added successfully.',
                                type: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Adding Field',
                                message: responseJSON.message
                            });
                        }
                    });
                });
            }
        });
        addModalElement.innerHTML = "\n      <form>\n        <input type=\"hidden\" name=\"noteTypeId\" value=\"".concat(noteTypeId, "\" />\n        <div class=\"modal-card\">\n          <header class=\"modal-card-head\">\n            <p class=\"modal-card-title\">Add Field</p>\n            <button class=\"delete\" type=\"button\" aria-label=\"close\"></button>\n          </header>\n          <section class=\"modal-card-body\">\n            <div class=\"field\">\n              <label class=\"label\" for=\"fieldAdd--fieldLabel\">\n                Field Label\n                <span class=\"has-text-danger\" title=\"Required\">*</span>\n              </label>\n              <div class=\"control\">\n                <input class=\"input\" id=\"fieldAdd--fieldLabel\" name=\"fieldLabel\" type=\"text\" required maxlength=\"100\" />\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\" for=\"fieldAdd--fieldInputType\">\n                Field Type\n                <span class=\"has-text-danger\" title=\"Required\">*</span>\n              </label>\n              <div class=\"control\">\n                <div class=\"select is-fullwidth\">\n                  <select id=\"fieldAdd--fieldInputType\" name=\"fieldInputType\" required>\n                    <option value=\"text\">Text (Single Line)</option>\n                    <option value=\"textbox\">Textbox (Multiple Lines)</option>\n                    <option value=\"number\">Number</option>\n                    <option value=\"date\">Date</option>\n                    <option value=\"select\">Select (Dropdown)</option>\n                  </select>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"field\" id=\"field--dataListKey\">\n              <label class=\"label\" for=\"fieldAdd--dataListKey\">Data List</label>\n              <div class=\"control\">\n                <div class=\"select is-fullwidth\">\n                  <select id=\"fieldAdd--dataListKey\" name=\"dataListKey\">\n                    ").concat(dataListOptionsHTML, "\n                  </select>\n                </div>\n              </div>\n              <p class=\"help\">For text fields with autocomplete or select dropdowns.</p>\n            </div>\n\n            <div id=\"fields--minMax\">\n              <div class=\"columns\">\n                <div class=\"column\">\n                  <div class=\"field\">\n                    <label class=\"label\" for=\"fieldAdd--fieldValueMin\">Minimum Value</label>\n                    <div class=\"control\">\n                      <input class=\"input\" id=\"fieldAdd--fieldValueMin\" name=\"fieldValueMin\" type=\"number\" />\n                    </div>\n                    <p class=\"help\">For text: min length. For number: min value.</p>\n                  </div>\n                </div>\n                <div class=\"column\">\n                  <div class=\"field\">\n                    <label class=\"label\" for=\"fieldAdd--fieldValueMax\">Maximum Value</label>\n                    <div class=\"control\">\n                      <input class=\"input\" id=\"fieldAdd--fieldValueMax\" name=\"fieldValueMax\" type=\"number\" />\n                    </div>\n                    <p class=\"help\">For text: max length. For number: max value.</p>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\" for=\"fieldAdd--fieldHelpText\">Help Text</label>\n              <div class=\"control\">\n                <textarea class=\"textarea\" id=\"fieldAdd--fieldHelpText\" name=\"fieldHelpText\" maxlength=\"500\"></textarea>\n              </div>\n              <p class=\"help\">Optional text to help users understand this field.</p>\n            </div>\n\n            <div class=\"field\">\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"fieldValueRequired\" value=\"1\" />\n                  Required Field\n                </label>\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"hasDividerAbove\" value=\"1\" />\n                  Show Divider Above Field\n                </label>\n              </div>\n            </div>\n          </section>\n          <footer class=\"modal-card-foot is-justify-content-end\">\n            <button class=\"button is-success\" type=\"submit\">\n              <span class=\"icon\"><i class=\"fa-solid fa-save\"></i></span>\n              <span>Add Field</span>\n            </button>\n            <button class=\"button\" type=\"button\" data-close>Cancel</button>\n          </footer>\n        </div>\n      </form>");
    }
    function openEditFieldModal(clickEvent) {
        var _a, _b, _c, _d;
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
        var editModalElement;
        function closeModal() {
            editModalElement.remove();
        }
        var dataListOptionsHTML = "<option value=\"\">(None)</option>" +
            dataLists.map(function (list) {
                var selected = list.dataListKey === field.dataListKey ? ' selected' : '';
                return "<option value=\"".concat(cityssm.escapeHTML(list.dataListKey), "\"").concat(selected, ">").concat(cityssm.escapeHTML(list.dataListName), "</option>");
            }).join('');
        var fieldTypeOptionsHTML = [
            { value: 'text', label: 'Text (Single Line)' },
            { value: 'textbox', label: 'Textbox (Multiple Lines)' },
            { value: 'number', label: 'Number' },
            { value: 'date', label: 'Date' },
            { value: 'select', label: 'Select (Dropdown)' }
        ].map(function (option) {
            var selected = option.value === field.fieldInputType ? ' selected' : '';
            return "<option value=\"".concat(option.value, "\"").concat(selected, ">").concat(option.label, "</option>");
        }).join('');
        editModalElement = cityssm.openHtmlModal('edit-field', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('#fieldEdit--fieldLabel').focus();
                // Handle field type changes
                var fieldTypeSelect = modalElement.querySelector('#fieldEdit--fieldInputType');
                var dataListField = modalElement.querySelector('#field--dataListKey');
                var minMaxFields = modalElement.querySelector('#fields--minMax');
                function updateFieldVisibility() {
                    var fieldType = fieldTypeSelect.value;
                    // Show/hide dataListKey for text and select
                    if (fieldType === 'text' || fieldType === 'select') {
                        dataListField.classList.remove('is-hidden');
                    }
                    else {
                        dataListField.classList.add('is-hidden');
                    }
                    // Show/hide min/max for text and number
                    if (fieldType === 'text' || fieldType === 'number') {
                        minMaxFields.classList.remove('is-hidden');
                    }
                    else {
                        minMaxFields.classList.add('is-hidden');
                    }
                }
                fieldTypeSelect.addEventListener('change', updateFieldVisibility);
                updateFieldVisibility();
            },
            onshown: function (_modalElement, closeModalFunction) {
                var formElement = editModalElement.querySelector('form');
                formElement.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateNoteTypeField"), formElement, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            closeModalFunction();
                            renderNoteTypes();
                            bulmaJS.notification({
                                message: 'Field updated successfully.',
                                type: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Updating Field',
                                message: responseJSON.message
                            });
                        }
                    });
                });
            }
        });
        editModalElement.innerHTML = "\n      <form>\n        <input type=\"hidden\" name=\"noteTypeFieldId\" value=\"".concat(field.noteTypeFieldId, "\" />\n        <div class=\"modal-card\">\n          <header class=\"modal-card-head\">\n            <p class=\"modal-card-title\">Edit Field</p>\n            <button class=\"delete\" type=\"button\" aria-label=\"close\"></button>\n          </header>\n          <section class=\"modal-card-body\">\n            <div class=\"field\">\n              <label class=\"label\" for=\"fieldEdit--fieldLabel\">\n                Field Label\n                <span class=\"has-text-danger\" title=\"Required\">*</span>\n              </label>\n              <div class=\"control\">\n                <input class=\"input\" id=\"fieldEdit--fieldLabel\" name=\"fieldLabel\" type=\"text\" required maxlength=\"100\" value=\"").concat(cityssm.escapeHTML(field.fieldLabel), "\" />\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\" for=\"fieldEdit--fieldInputType\">\n                Field Type\n                <span class=\"has-text-danger\" title=\"Required\">*</span>\n              </label>\n              <div class=\"control\">\n                <div class=\"select is-fullwidth\">\n                  <select id=\"fieldEdit--fieldInputType\" name=\"fieldInputType\" required>\n                    ").concat(fieldTypeOptionsHTML, "\n                  </select>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"field\" id=\"field--dataListKey\">\n              <label class=\"label\" for=\"fieldEdit--dataListKey\">Data List</label>\n              <div class=\"control\">\n                <div class=\"select is-fullwidth\">\n                  <select id=\"fieldEdit--dataListKey\" name=\"dataListKey\">\n                    ").concat(dataListOptionsHTML, "\n                  </select>\n                </div>\n              </div>\n              <p class=\"help\">For text fields with autocomplete or select dropdowns.</p>\n            </div>\n\n            <div id=\"fields--minMax\">\n              <div class=\"columns\">\n                <div class=\"column\">\n                  <div class=\"field\">\n                    <label class=\"label\" for=\"fieldEdit--fieldValueMin\">Minimum Value</label>\n                    <div class=\"control\">\n                      <input class=\"input\" id=\"fieldEdit--fieldValueMin\" name=\"fieldValueMin\" type=\"number\" value=\"").concat((_c = field.fieldValueMin) !== null && _c !== void 0 ? _c : '', "\" />\n                    </div>\n                    <p class=\"help\">For text: min length. For number: min value.</p>\n                  </div>\n                </div>\n                <div class=\"column\">\n                  <div class=\"field\">\n                    <label class=\"label\" for=\"fieldEdit--fieldValueMax\">Maximum Value</label>\n                    <div class=\"control\">\n                      <input class=\"input\" id=\"fieldEdit--fieldValueMax\" name=\"fieldValueMax\" type=\"number\" value=\"").concat((_d = field.fieldValueMax) !== null && _d !== void 0 ? _d : '', "\" />\n                    </div>\n                    <p class=\"help\">For text: max length. For number: max value.</p>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label class=\"label\" for=\"fieldEdit--fieldHelpText\">Help Text</label>\n              <div class=\"control\">\n                <textarea class=\"textarea\" id=\"fieldEdit--fieldHelpText\" name=\"fieldHelpText\" maxlength=\"500\">").concat(cityssm.escapeHTML(field.fieldHelpText), "</textarea>\n              </div>\n              <p class=\"help\">Optional text to help users understand this field.</p>\n            </div>\n\n            <div class=\"field\">\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"fieldValueRequired\" value=\"1\" ").concat(field.fieldValueRequired ? 'checked' : '', " />\n                  Required Field\n                </label>\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <div class=\"control\">\n                <label class=\"checkbox\">\n                  <input type=\"checkbox\" name=\"hasDividerAbove\" value=\"1\" ").concat(field.hasDividerAbove ? 'checked' : '', " />\n                  Show Divider Above Field\n                </label>\n              </div>\n            </div>\n          </section>\n          <footer class=\"modal-card-foot is-justify-content-end\">\n            <button class=\"button is-success\" type=\"submit\">\n              <span class=\"icon\"><i class=\"fa-solid fa-save\"></i></span>\n              <span>Save Changes</span>\n            </button>\n            <button class=\"button\" type=\"button\" data-close>Cancel</button>\n          </footer>\n        </div>\n      </form>");
    }
    function deleteField(clickEvent) {
        var _a;
        var fieldId = Number.parseInt((_a = clickEvent.currentTarget.dataset.noteTypeFieldId) !== null && _a !== void 0 ? _a : '', 10);
        bulmaJS.confirm({
            title: 'Delete Field',
            message: 'Are you sure you want to delete this field?',
            contextualColorName: 'danger',
            okButton: {
                text: 'Yes, Delete Field',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteNoteTypeField"), { noteTypeFieldId: fieldId }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            noteTypes = responseJSON.noteTypes;
                            renderNoteTypes();
                            bulmaJS.notification({
                                message: 'Field deleted successfully.',
                                type: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Deleting Field',
                                message: responseJSON.message
                            });
                        }
                    });
                }
            }
        });
    }
    // Initialize
    renderNoteTypes();
    // Add Note Type button
    (_a = document.querySelector('#button--addNoteType')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openAddNoteTypeModal);
})();
