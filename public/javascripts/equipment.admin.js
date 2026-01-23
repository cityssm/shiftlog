"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var equipmentContainerElement = document.querySelector('#container--equipment');
    // Pagination settings
    var ITEMS_PER_PAGE = 10;
    var currentPage = 1;
    var currentFilteredEquipment = exports.equipment;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        renderEquipmentWithPagination(currentFilteredEquipment);
    }
    function deleteEquipment(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var equipmentNumber = buttonElement.dataset.equipmentNumber;
        if (equipmentNumber === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Equipment',
            message: 'Are you sure you want to delete this equipment?',
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Equipment',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteEquipment"), {
                        equipmentNumber: equipmentNumber
                    }, function (responseJSON) {
                        if (responseJSON.success) {
                            if (responseJSON.equipment !== undefined) {
                                exports.equipment = responseJSON.equipment;
                                currentFilteredEquipment = responseJSON.equipment;
                                currentPage = 1;
                                renderEquipmentWithPagination(responseJSON.equipment);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Equipment Deleted',
                                message: 'Equipment has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Equipment',
                                message: 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editEquipment(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var equipmentNumber = buttonElement.dataset.equipmentNumber;
        if (equipmentNumber === undefined) {
            return;
        }
        var equipment = exports.equipment.find(function (eq) { return eq.equipmentNumber === equipmentNumber; });
        if (equipment === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateEquipment(submitEvent) {
            submitEvent.preventDefault();
            var updateForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateEquipment"), updateForm, function (responseJSON) {
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.equipment !== undefined) {
                        exports.equipment = responseJSON.equipment;
                        currentFilteredEquipment = responseJSON.equipment;
                        currentPage = 1;
                        renderEquipmentWithPagination(responseJSON.equipment);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Equipment Updated',
                        message: 'Equipment has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Equipment',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEquipment-edit', {
            onshow: function (modalElement) {
                var _a, _b, _c, _d;
                ;
                modalElement.querySelector('[name="equipmentNumber"]').value = equipment.equipmentNumber;
                modalElement.querySelector('[name="recordSync_isSynced"]').checked = equipment.recordSync_isSynced;
                modalElement.querySelector('[name="equipmentName"]').value = equipment.equipmentName;
                modalElement.querySelector('[name="equipmentDescription"]').value = equipment.equipmentDescription;
                // Populate equipment types dropdown
                var equipmentTypeSelect = modalElement.querySelector('[name="equipmentTypeDataListItemId"]');
                for (var _i = 0, _e = exports.equipmentTypes; _i < _e.length; _i++) {
                    var equipmentType = _e[_i];
                    var option = document.createElement('option');
                    option.value = equipmentType.dataListItemId.toString();
                    option.textContent = equipmentType.dataListItem;
                    equipmentTypeSelect.append(option);
                }
                equipmentTypeSelect.value =
                    equipment.equipmentTypeDataListItemId.toString();
                // Populate employee lists dropdown
                var employeeListSelect = modalElement.querySelector('[name="employeeListId"]');
                for (var _f = 0, _g = exports.employeeLists; _f < _g.length; _f++) {
                    var employeeList = _g[_f];
                    var option = document.createElement('option');
                    option.value = employeeList.employeeListId.toString();
                    option.textContent = employeeList.employeeListName;
                    employeeListSelect.append(option);
                }
                employeeListSelect.value = (_b = (_a = equipment.employeeListId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                // Populate user groups dropdown
                var userGroupSelect = modalElement.querySelector('[name="userGroupId"]');
                for (var _h = 0, _j = exports.userGroups; _h < _j.length; _h++) {
                    var userGroup = _j[_h];
                    var option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                userGroupSelect.value = (_d = (_c = equipment.userGroupId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateEquipment);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderEquipment(equipmentList) {
        var _a, _b;
        if (equipmentList.length === 0) {
            equipmentContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <div class=\"message-body\">\n            No equipment records available.\n          </div>\n        </div>\n      ";
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th>\n            <span class=\"is-sr-only\">Sync Status</span>\n          </th>\n          <th>Equipment Number</th>\n          <th>Equipment Name</th>\n          <th>Description</th>\n          <th>Type</th>\n          <th>User Group</th>\n          <th>\n            <span class=\"is-sr-only\">Actions</span>\n          </th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        var tbodyElement = tableElement.querySelector('tbody');
        for (var _i = 0, equipmentList_1 = equipmentList; _i < equipmentList_1.length; _i++) {
            var equipment = equipmentList_1[_i];
            var rowElement = document.createElement('tr');
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = /* html */ "\n        <td>\n          ".concat(equipment.recordSync_isSynced
                ? /* html */ "\n                <span class=\"is-size-7 has-text-grey\" title=\"Synchronized\">\n                  <i class=\"fa-solid fa-arrows-rotate\"></i>\n                </span>\n              "
                : '', "\n        </td>\n        <td>\n          ").concat(cityssm.escapeHTML(equipment.equipmentNumber), "\n        </td>\n        <td>").concat(cityssm.escapeHTML(equipment.equipmentName), "</td>\n        <td>").concat(cityssm.escapeHTML(equipment.equipmentDescription), "</td>\n        <td>").concat(cityssm.escapeHTML((_a = equipment.equipmentTypeDataListItem) !== null && _a !== void 0 ? _a : ''), "</td>\n        <td>").concat(cityssm.escapeHTML((_b = equipment.userGroupName) !== null && _b !== void 0 ? _b : ''), "</td>\n        <td class=\"has-text-right\">\n          <div class=\"buttons is-right\">\n            <button class=\"button is-small is-info edit-equipment\" \n              data-equipment-number=\"").concat(cityssm.escapeHTML(equipment.equipmentNumber), "\" \n              type=\"button\"\n            >\n              <span class=\"icon is-small\">\n                <i class=\"fa-solid fa-pencil\"></i>\n              </span>\n              <span>Edit</span>\n            </button>\n            <button class=\"button is-small is-danger delete-equipment\" \n              data-equipment-number=\"").concat(cityssm.escapeHTML(equipment.equipmentNumber), "\" \n              type=\"button\"\n            >\n              <span class=\"icon is-small\">\n                <i class=\"fa-solid fa-trash\"></i>\n              </span>\n              <span>Delete</span>\n            </button>\n          </div>\n        </td>\n      ");
            tbodyElement.append(rowElement);
        }
        equipmentContainerElement.replaceChildren(tableElement);
        var editButtons = equipmentContainerElement.querySelectorAll('.edit-equipment');
        for (var _c = 0, editButtons_1 = editButtons; _c < editButtons_1.length; _c++) {
            var button = editButtons_1[_c];
            button.addEventListener('click', editEquipment);
        }
        var deleteButtons = equipmentContainerElement.querySelectorAll('.delete-equipment');
        for (var _d = 0, deleteButtons_1 = deleteButtons; _d < deleteButtons_1.length; _d++) {
            var button = deleteButtons_1[_d];
            button.addEventListener('click', deleteEquipment);
        }
    }
    /**
     * Render equipment with pagination
     */
    function renderEquipmentWithPagination(equipmentList) {
        // Calculate pagination
        var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        var endIndex = startIndex + ITEMS_PER_PAGE;
        var paginatedEquipment = equipmentList.slice(startIndex, endIndex);
        // Render table
        renderEquipment(paginatedEquipment);
        // Add pagination controls if needed
        if (equipmentList.length > ITEMS_PER_PAGE) {
            var paginationControls = shiftLog.buildPaginationControls({
                totalCount: equipmentList.length,
                currentPageOrOffset: currentPage,
                itemsPerPageOrLimit: ITEMS_PER_PAGE,
                clickHandler: pageSelect
            });
            equipmentContainerElement.append(paginationControls);
        }
    }
    function addEquipment() {
        var closeModalFunction;
        function doAddEquipment(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddEquipment"), addForm, function (responseJSON) {
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.equipment !== undefined) {
                        exports.equipment = responseJSON.equipment;
                        currentFilteredEquipment = responseJSON.equipment;
                        currentPage = 1;
                        renderEquipmentWithPagination(responseJSON.equipment);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Equipment Added',
                        message: 'Equipment has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Equipment',
                        message: 'Please check the equipment number is unique and try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEquipment-add', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('[name="equipmentNumber"]').value = '';
                modalElement.querySelector('[name="equipmentName"]').value = '';
                modalElement.querySelector('[name="equipmentDescription"]').value = '';
                // Populate equipment types dropdown
                var equipmentTypeSelect = modalElement.querySelector('[name="equipmentTypeDataListItemId"]');
                for (var _i = 0, _a = exports.equipmentTypes; _i < _a.length; _i++) {
                    var equipmentType = _a[_i];
                    var option = document.createElement('option');
                    option.value = equipmentType.dataListItemId.toString();
                    option.textContent = equipmentType.dataListItem;
                    equipmentTypeSelect.append(option);
                }
                // Populate employee lists dropdown
                var employeeListSelect = modalElement.querySelector('[name="employeeListId"]');
                for (var _b = 0, _c = exports.employeeLists; _b < _c.length; _b++) {
                    var employeeList = _c[_b];
                    var option = document.createElement('option');
                    option.value = employeeList.employeeListId.toString();
                    option.textContent = employeeList.employeeListName;
                    employeeListSelect.append(option);
                }
                // Populate user groups dropdown
                var userGroupSelect = modalElement.querySelector('[name="userGroupId"]');
                for (var _d = 0, _e = exports.userGroups; _d < _e.length; _d++) {
                    var userGroup = _e[_d];
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
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddEquipment);
                modalElement.querySelector('[name="equipmentNumber"]').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    (_a = document
        .querySelector('#button--addEquipment')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', addEquipment);
    renderEquipmentWithPagination(exports.equipment);
    /*
     * Filter equipment with debouncing
     */
    var filterInput = document.querySelector('#filter--equipment');
    var filterTimeout;
    if (filterInput !== null) {
        filterInput.addEventListener('input', function () {
            // Clear existing timeout
            if (filterTimeout !== undefined) {
                clearTimeout(filterTimeout);
            }
            // Set new timeout (debounce for 300ms)
            filterTimeout = setTimeout(function () {
                var filterText = filterInput.value.toLowerCase();
                if (filterText === '') {
                    currentFilteredEquipment = exports.equipment;
                    currentPage = 1;
                    renderEquipmentWithPagination(exports.equipment);
                }
                else {
                    var filteredEquipment = exports.equipment.filter(function (equipment) {
                        var _a;
                        var searchText = "".concat(equipment.equipmentNumber, " ").concat(equipment.equipmentName, " ").concat(equipment.equipmentDescription, " ").concat((_a = equipment.equipmentTypeDataListItem) !== null && _a !== void 0 ? _a : '').toLowerCase();
                        return searchText.includes(filterText);
                    });
                    currentFilteredEquipment = filteredEquipment;
                    currentPage = 1;
                    renderEquipmentWithPagination(filteredEquipment);
                }
            }, 300);
        });
    }
})();
//# sourceMappingURL=equipment.admin.js.map