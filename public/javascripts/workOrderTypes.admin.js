"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var workOrderTypes = exports.workOrderTypes;
    var tbodyElement = document.querySelector('#tbody--workOrderTypes');
    function renderWorkOrderTypes() {
        var _a, _b, _c, _d;
        if (workOrderTypes.length === 0) {
            tbodyElement.innerHTML = "<tr id=\"tr--noWorkOrderTypes\">\n        <td colspan=\"5\" class=\"has-text-centered has-text-grey\">\n          No work order types found. Click \"Add Work Order Type\" to create one.\n        </td>\n      </tr>";
            return;
        }
        // Clear existing
        tbodyElement.innerHTML = '';
        for (var _i = 0, workOrderTypes_1 = workOrderTypes; _i < workOrderTypes_1.length; _i++) {
            var workOrderType = workOrderTypes_1[_i];
            var userGroupDisplay = ((_a = workOrderType.userGroupName) !== null && _a !== void 0 ? _a : '') === ''
                ? '<span class="has-text-grey-light">-</span>'
                : "<span class=\"tag is-info\">".concat(cityssm.escapeHTML((_b = workOrderType.userGroupName) !== null && _b !== void 0 ? _b : ''), "</span>");
            var rowElement = document.createElement('tr');
            rowElement.dataset.workOrderTypeId =
                workOrderType.workOrderTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = /* html */ "\n        <td class=\"has-text-centered\">\n          <span class=\"icon is-small has-text-grey handle\" style=\"cursor: move;\">\n            <i class=\"fa-solid fa-grip-vertical\"></i>\n          </span>\n        </td>\n        <td>\n          <span class=\"work-order-type-name\">\n            ".concat(cityssm.escapeHTML(workOrderType.workOrderType), "\n          </span>\n        </td>\n        <td>\n          <span class=\"work-order-number-prefix\">\n            ").concat(cityssm.escapeHTML(workOrderType.workOrderNumberPrefix), "\n          </span>\n        </td>\n        <td>\n          ").concat(userGroupDisplay, "\n        </td>\n        <td class=\"has-text-right\">\n          <div class=\"buttons are-small is-right\">\n            <button\n              class=\"button is-info button--editWorkOrderType\"\n              data-work-order-type-id=\"").concat(workOrderType.workOrderTypeId, "\"\n              data-work-order-type=\"").concat(cityssm.escapeHTML(workOrderType.workOrderType), "\"\n              data-work-order-number-prefix=\"").concat(cityssm.escapeHTML(workOrderType.workOrderNumberPrefix), "\"\n              data-due-days=\"").concat((_c = workOrderType.dueDays) !== null && _c !== void 0 ? _c : '', "\"\n              data-user-group-id=\"").concat((_d = workOrderType.userGroupId) !== null && _d !== void 0 ? _d : '', "\"\n              type=\"button\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-pencil\"></i>\n              </span>\n              <span>Edit</span>\n            </button>\n            <button\n              class=\"button is-danger button--deleteWorkOrderType\"\n              data-work-order-type-id=\"").concat(workOrderType.workOrderTypeId, "\"\n              data-work-order-type=\"").concat(cityssm.escapeHTML(workOrderType.workOrderType), "\"\n              type=\"button\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-trash\"></i>\n              </span>\n              <span>Delete</span>\n            </button>\n          </div>\n        </td>\n      ");
            tbodyElement.append(rowElement);
        }
        attachEventListeners();
        initializeSortable();
    }
    function addWorkOrderType() {
        var closeModalFunction;
        function doAddWorkOrderType(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddWorkOrderType"), addForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success &&
                    responseJSON.workOrderTypes !== undefined) {
                    closeModalFunction();
                    workOrderTypes = responseJSON.workOrderTypes;
                    renderWorkOrderTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'The work order type has been successfully added.',
                        title: 'Work Order Type Added'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Work Order Type',
                        message: 'An error occurred. Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminWorkOrderTypes-add', {
            onshow: function (modalElement) {
                // Populate user group options
                var userGroupSelect = modalElement.querySelector('#addWorkOrderType--userGroupId');
                for (var _i = 0, _a = exports.userGroups; _i < _a.length; _i++) {
                    var userGroup = _a[_i];
                    var option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddWorkOrderType);
                modalElement.querySelector('#addWorkOrderType--workOrderType').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editWorkOrderType(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var workOrderTypeId = buttonElement.dataset.workOrderTypeId;
        var currentWorkOrderType = buttonElement.dataset.workOrderType;
        var currentWorkOrderNumberPrefix = buttonElement.dataset.workOrderNumberPrefix;
        var currentDueDays = buttonElement.dataset.dueDays;
        var currentUserGroupId = buttonElement.dataset.userGroupId;
        if (workOrderTypeId === undefined ||
            currentWorkOrderType === undefined ||
            currentWorkOrderNumberPrefix === undefined) {
            return;
        }
        // Get the current moreInfoFormNames from the workOrderTypes array
        var workOrderTypeData = workOrderTypes.find(function (wot) { return wot.workOrderTypeId === Number.parseInt(workOrderTypeId, 10); });
        var currentMoreInfoFormNames = (_a = workOrderTypeData === null || workOrderTypeData === void 0 ? void 0 : workOrderTypeData.moreInfoFormNames) !== null && _a !== void 0 ? _a : [];
        var closeModalFunction;
        function doUpdateWorkOrderType(submitEvent) {
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            // Collect milestone data
            var modalElement = editForm.closest('.modal');
            var milestoneItems = modalElement.querySelectorAll('.milestone-item');
            var milestones = [];
            for (var _i = 0, _a = milestoneItems.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], index = _b[0], item = _b[1];
                var titleInput = item.querySelector('.milestone-title');
                var descriptionInput = item.querySelector('.milestone-description');
                var dueDaysInput = item.querySelector('.milestone-due-days');
                var title = titleInput.value.trim();
                if (title !== '') {
                    var dueDaysValue = dueDaysInput.value.trim();
                    milestones.push({
                        milestoneTitle: title,
                        milestoneDescription: descriptionInput.value.trim(),
                        dueDays: dueDaysValue === '' ? null : Number.parseInt(dueDaysValue, 10),
                        orderNumber: index
                    });
                }
            }
            // Add milestones as hidden input to form
            var existingMilestonesInput = editForm.querySelector('input[name="defaultMilestones"]');
            if (existingMilestonesInput !== null) {
                existingMilestonesInput.remove();
            }
            var milestonesInput = document.createElement('input');
            milestonesInput.type = 'hidden';
            milestonesInput.name = 'defaultMilestones';
            milestonesInput.value = JSON.stringify(milestones);
            editForm.append(milestonesInput);
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateWorkOrderType"), editForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success &&
                    responseJSON.workOrderTypes !== undefined) {
                    closeModalFunction();
                    workOrderTypes = responseJSON.workOrderTypes;
                    renderWorkOrderTypes();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'The work order type has been successfully updated.',
                        title: 'Work Order Type Updated'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'An error occurred. Please try again.',
                        title: 'Error Updating Work Order Type'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminWorkOrderTypes-edit', {
            onshow: function (modalElement) {
                var _a, _b;
                // Set form values
                ;
                modalElement.querySelector('#editWorkOrderType--workOrderTypeId').value = workOrderTypeId;
                modalElement.querySelector('#editWorkOrderType--workOrderType').value = currentWorkOrderType;
                modalElement.querySelector('#editWorkOrderType--workOrderNumberPrefix').value = currentWorkOrderNumberPrefix;
                modalElement.querySelector('#editWorkOrderType--dueDays').value = currentDueDays !== null && currentDueDays !== void 0 ? currentDueDays : '';
                // Populate user group options
                var userGroupSelect = modalElement.querySelector('#editWorkOrderType--userGroupId');
                for (var _i = 0, _c = exports.userGroups; _i < _c.length; _i++) {
                    var userGroup = _c[_i];
                    var option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    if (currentUserGroupId !== undefined &&
                        currentUserGroupId !== '' &&
                        Number.parseInt(currentUserGroupId, 10) === userGroup.userGroupId) {
                        option.selected = true;
                    }
                    userGroupSelect.append(option);
                }
                // Populate more info forms checkboxes
                var moreInfoFormsContainer = modalElement.querySelector('#editWorkOrderType--moreInfoForms');
                var availableForms = exports.availableWorkOrderMoreInfoForms;
                var formKeys = Object.keys(availableForms);
                if (formKeys.length === 0) {
                    moreInfoFormsContainer.innerHTML =
                        '<span class="has-text-grey">No additional forms available.</span>';
                }
                else {
                    var formsHtml = '';
                    for (var _d = 0, formKeys_1 = formKeys; _d < formKeys_1.length; _d++) {
                        var formKey = formKeys_1[_d];
                        var formLabel = availableForms[formKey].formName;
                        var isChecked = currentMoreInfoFormNames.includes(formKey);
                        formsHtml += /* html */ "\n              <label class=\"checkbox is-block mb-2\">\n                <input\n                  name=\"moreInfoFormNames\"\n                  type=\"checkbox\"\n                  value=\"".concat(cityssm.escapeHTML(formKey), "\"\n                  ").concat(isChecked ? 'checked' : '', "\n                />\n                ").concat(cityssm.escapeHTML(formLabel), "\n              </label>\n            ");
                    }
                    // eslint-disable-next-line no-unsanitized/property
                    moreInfoFormsContainer.innerHTML = formsHtml;
                }
                // Populate default milestones
                var currentDefaultMilestones = (_a = workOrderTypeData === null || workOrderTypeData === void 0 ? void 0 : workOrderTypeData.defaultMilestones) !== null && _a !== void 0 ? _a : [];
                var defaultMilestonesContainer = modalElement.querySelector('#editWorkOrderType--defaultMilestones');
                function renderDefaultMilestones() {
                    var milestones = defaultMilestonesContainer.querySelectorAll('.milestone-item');
                    if (milestones.length === 0) {
                        defaultMilestonesContainer.innerHTML =
                            '<p class="has-text-grey is-size-7 mb-2">No default milestones. Click "Add Milestone" to create one.</p>';
                    }
                }
                function addMilestoneItem(title, description, dueDays, orderNumber) {
                    var _a;
                    if (title === void 0) { title = ''; }
                    if (description === void 0) { description = ''; }
                    if (dueDays === void 0) { dueDays = null; }
                    if (orderNumber === void 0) { orderNumber = 0; }
                    var milestoneElement = document.createElement('div');
                    milestoneElement.className = 'milestone-item box p-3 mb-2';
                    milestoneElement.dataset.orderNumber = orderNumber.toString();
                    // eslint-disable-next-line no-unsanitized/property
                    milestoneElement.innerHTML = /* html */ "\n            <div class=\"is-flex is-align-items-start\">\n              <span class=\"icon is-small has-text-grey milestone-handle mr-2\" style=\"cursor: move;\">\n                <i class=\"fa-solid fa-grip-vertical\"></i>\n              </span>\n              <div class=\"is-flex-grow-1\">\n                <div class=\"field mb-2\">\n                  <label class=\"label is-size-7\">Milestone Title</label>\n                  <div class=\"control\">\n                    <input\n                      class=\"input is-small milestone-title\"\n                      type=\"text\"\n                      maxlength=\"100\"\n                      placeholder=\"e.g., Design Review, Approval, Completion\"\n                      value=\"".concat(cityssm.escapeHTML(title), "\"\n                      required\n                    />\n                  </div>\n                </div>\n                <div class=\"field mb-2\">\n                  <label class=\"label is-size-7\">Milestone Description (Optional)</label>\n                  <div class=\"control\">\n                    <textarea\n                      class=\"textarea is-small milestone-description\"\n                      rows=\"2\"\n                      placeholder=\"Description of this milestone...\"\n                    >").concat(cityssm.escapeHTML(description), "</textarea>\n                  </div>\n                </div>\n                <div class=\"field mb-0\">\n                  <label class=\"label is-size-7\">Days Until Due (Optional)</label>\n                  <div class=\"control\">\n                    <input\n                      class=\"input is-small milestone-due-days\"\n                      type=\"number\"\n                      min=\"0\"\n                      step=\"1\"\n                      placeholder=\"Number of days\"\n                      value=\"").concat(dueDays !== null && dueDays !== void 0 ? dueDays : '', "\"\n                    />\n                  </div>\n                  <p class=\"help is-size-7\">\n                    If specified, the milestone due date will be automatically set this many days after the work order open date.\n                  </p>\n                </div>\n              </div>\n              <button\n                class=\"button is-small is-danger ml-2 remove-milestone-button\"\n                type=\"button\"\n                title=\"Remove Milestone\"\n              >\n                <span class=\"icon is-small\">\n                  <i class=\"fa-solid fa-times\"></i>\n                </span>\n              </button>\n            </div>\n          ");
                    // Add remove button event
                    (_a = milestoneElement
                        .querySelector('.remove-milestone-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                        milestoneElement.remove();
                        renderDefaultMilestones();
                    });
                    defaultMilestonesContainer.append(milestoneElement);
                }
                // Clear container and add existing milestones
                defaultMilestonesContainer.innerHTML = '';
                for (var _e = 0, _f = currentDefaultMilestones.entries(); _e < _f.length; _e++) {
                    var _g = _f[_e], index = _g[0], milestone = _g[1];
                    addMilestoneItem(milestone.milestoneTitle, milestone.milestoneDescription, milestone.dueDays, index);
                }
                renderDefaultMilestones();
                // Initialize sortable for milestones
                Sortable.create(defaultMilestonesContainer, {
                    animation: 150,
                    handle: '.milestone-handle',
                    onEnd: function () {
                        // Update order numbers after sorting
                        var items = defaultMilestonesContainer.querySelectorAll('.milestone-item');
                        for (var _i = 0, _a = items.entries(); _i < _a.length; _i++) {
                            var _b = _a[_i], index = _b[0], item = _b[1];
                            ;
                            item.dataset.orderNumber = index.toString();
                        }
                    }
                });
                // Add milestone button event
                (_b = modalElement
                    .querySelector('#editWorkOrderType--addMilestoneButton')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
                    var currentCount = defaultMilestonesContainer.querySelectorAll('.milestone-item').length;
                    addMilestoneItem('', '', null, currentCount);
                    renderDefaultMilestones();
                });
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateWorkOrderType);
                var typeInputElement = modalElement.querySelector('#editWorkOrderType--workOrderType');
                typeInputElement.focus();
                typeInputElement.select();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteWorkOrderType(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var workOrderTypeId = buttonElement.dataset.workOrderTypeId;
        var workOrderType = buttonElement.dataset.workOrderType;
        if (workOrderTypeId === undefined || workOrderType === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            message: "Are you sure you want to delete \"".concat(workOrderType, "\"? This action cannot be undone."),
            okButton: {
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteWorkOrderType"), {
                        workOrderTypeId: Number.parseInt(workOrderTypeId, 10)
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success &&
                            responseJSON.workOrderTypes !== undefined) {
                            workOrderTypes = responseJSON.workOrderTypes;
                            renderWorkOrderTypes();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'The work order type has been successfully deleted.',
                                title: 'Work Order Type Deleted'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'An error occurred. Please try again.',
                                title: 'Error Deleting Work Order Type'
                            });
                        }
                    });
                },
                contextualColorName: 'danger',
                text: 'Delete Work Order Type'
            },
            title: 'Delete Work Order Type'
        });
    }
    function attachEventListeners() {
        // Edit buttons
        var editButtons = document.querySelectorAll('.button--editWorkOrderType');
        for (var _i = 0, editButtons_1 = editButtons; _i < editButtons_1.length; _i++) {
            var button = editButtons_1[_i];
            button.addEventListener('click', editWorkOrderType);
        }
        // Delete buttons
        var deleteButtons = document.querySelectorAll('.button--deleteWorkOrderType');
        for (var _a = 0, deleteButtons_1 = deleteButtons; _a < deleteButtons_1.length; _a++) {
            var button = deleteButtons_1[_a];
            button.addEventListener('click', deleteWorkOrderType);
        }
    }
    function initializeSortable() {
        if (workOrderTypes.length > 0) {
            Sortable.create(tbodyElement, {
                animation: 150,
                handle: '.handle',
                onEnd: function () {
                    // Get the new order
                    var rows = tbodyElement.querySelectorAll('tr[data-work-order-type-id]');
                    var workOrderTypeIds = [];
                    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        var row = rows_1[_i];
                        var id = row.dataset.workOrderTypeId;
                        if (id !== undefined) {
                            workOrderTypeIds.push(Number.parseInt(id, 10));
                        }
                    }
                    // Send to server
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doReorderWorkOrderTypes"), {
                        workOrderTypeIds: workOrderTypeIds
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (!responseJSON.success) {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Please refresh the page and try again.',
                                title: 'Error Reordering Work Order Types'
                            });
                        }
                    });
                }
            });
        }
    }
    // Add work order type button
    var addButton = document.querySelector('#button--addWorkOrderType');
    if (addButton !== null) {
        addButton.addEventListener('click', addWorkOrderType);
    }
    // Initialize
    attachEventListeners();
    initializeSortable();
})();
