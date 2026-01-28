"use strict";
/* eslint-disable max-lines -- Large file */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    // Track Sortable instances to prevent duplicates
    var sortableInstances = new Map();
    function updateItemCount(dataListKey, count) {
        var countElement = document.querySelector("#itemCount--".concat(dataListKey));
        if (countElement !== null) {
            countElement.textContent = count.toString();
        }
    }
    function renderDataListItems(dataListKey, items) {
        var _a;
        var tbodyElement = document.querySelector("#dataListItems--".concat(dataListKey));
        if (tbodyElement === null) {
            return;
        }
        // Update the item count tag
        updateItemCount(dataListKey, items.length);
        if (items.length === 0) {
            tbodyElement.innerHTML = /* html */ "\n        <tr>\n          <td class=\"has-text-centered has-text-grey\" colspan=\"4\">\n            No items in this list. Click \"Add Item\" to create one.\n          </td>\n        </tr>\n      ";
            return;
        }
        // Clear existing items
        tbodyElement.innerHTML = '';
        var _loop_1 = function (item) {
            var userGroup = item.userGroupId
                ? exports.userGroups.find(function (ug) { return ug.userGroupId === item.userGroupId; })
                : null;
            var userGroupDisplay = userGroup
                ? "<span class=\"tag is-info\">".concat(cityssm.escapeHTML(userGroup.userGroupName), "</span>")
                : '<span class="has-text-grey-light">-</span>';
            var tableRowElement = document.createElement('tr');
            tableRowElement.dataset.dataListItemId = item.dataListItemId.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ "\n        <td class=\"has-text-centered\">\n          <span class=\"icon is-small has-text-grey handle\" style=\"cursor: move;\">\n            <i class=\"fa-solid fa-grip-vertical\"></i>\n          </span>\n        </td>\n        <td>\n          <span class=\"item-text\">\n            ".concat(cityssm.escapeHTML(item.dataListItem), "\n          </span>\n        </td>\n        <td>\n          ").concat(userGroupDisplay, "\n        </td>\n        <td class=\"has-text-right\">\n          <div class=\"buttons are-small is-right\">\n            <button\n              class=\"button is-info button--editItem\"\n              data-data-list-key=\"").concat(cityssm.escapeHTML(dataListKey), "\"\n              data-data-list-item-id=\"").concat(item.dataListItemId, "\"\n              data-data-list-item=\"").concat(cityssm.escapeHTML(item.dataListItem), "\"\n              data-user-group-id=\"").concat((_a = item.userGroupId) !== null && _a !== void 0 ? _a : '', "\"\n              type=\"button\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-pencil\"></i>\n              </span>\n              <span>Edit</span>\n            </button>\n            <button\n              class=\"button is-danger button--deleteItem\"\n              data-data-list-key=\"").concat(cityssm.escapeHTML(dataListKey), "\"\n              data-data-list-item-id=\"").concat(item.dataListItemId, "\"\n              data-data-list-item=\"").concat(cityssm.escapeHTML(item.dataListItem), "\"\n              type=\"button\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-trash\"></i>\n              </span>\n              <span>Delete</span>\n            </button>\n          </div>\n        </td>\n      ");
            tbodyElement.append(tableRowElement);
        };
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            _loop_1(item);
        }
        // Re-attach event listeners
        attachEventListeners(dataListKey);
        // Re-initialize sortable
        initializeSortable(dataListKey);
    }
    function addDataListItem(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var dataListKey = buttonElement.dataset.dataListKey;
        if (dataListKey === undefined) {
            return;
        }
        var dataList = exports.dataLists.find(function (dl) { return dl.dataListKey === dataListKey; });
        if (dataList === undefined) {
            return;
        }
        var closeModalFunction;
        function doAddDataListItem(submitEvent) {
            var _a;
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            var formData = new FormData(addForm);
            var dataListItemToAdd = (_a = formData.get('dataListItem')) === null || _a === void 0 ? void 0 : _a.trim();
            if (dataListItemToAdd === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    title: 'Item Name Required',
                    message: 'Please enter an item name.'
                });
                return;
            }
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddDataListItem"), addForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.items !== undefined) {
                    closeModalFunction();
                    // Open the details panel if it's closed
                    var detailsElement = document.querySelector("details[data-data-list-key=\"".concat(dataListKey, "\"]"));
                    if (detailsElement !== null && !detailsElement.open) {
                        detailsElement.open = true;
                    }
                    renderDataListItems(dataListKey, responseJSON.items);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Item Added',
                        message: 'The item has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Item',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminDataLists-addItem', {
            onshow: function (modalElement) {
                var _a;
                // Set the modal title
                var titleElement = modalElement.querySelector('#addDataListItem--title');
                titleElement.textContent = "Add ".concat(dataList.dataListName, " Item");
                // Set the data list key
                var dataListKeyInput = modalElement.querySelector('#addDataListItem--dataListKey');
                dataListKeyInput.value = dataListKey;
                // Populate user group options
                var userGroupSelect = modalElement.querySelector('#addDataListItem--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (var _i = 0, _b = exports.userGroups; _i < _b.length; _i++) {
                    var userGroup = _b[_i];
                    var option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                // Attach form submit handler
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddDataListItem);
            },
            onshown: function (modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus the item name input
                var itemInput = modalElement.querySelector('#addDataListItem--dataListItem');
                itemInput.focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editDataListItem(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var dataListKey = buttonElement.dataset.dataListKey;
        var dataListItemId = buttonElement.dataset.dataListItemId;
        var dataListItem = buttonElement.dataset.dataListItem;
        var userGroupId = buttonElement.dataset.userGroupId;
        if (dataListKey === undefined ||
            dataListItemId === undefined ||
            dataListItem === undefined) {
            return;
        }
        var dataList = exports.dataLists.find(function (dl) { return dl.dataListKey === dataListKey; });
        if (dataList === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateDataListItem(submitEvent) {
            var _a;
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            var formData = new FormData(editForm);
            var dataListItem = (_a = formData.get('dataListItem')) === null || _a === void 0 ? void 0 : _a.trim();
            if (dataListItem === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    title: 'Item Name Required',
                    message: 'Please enter an item name.'
                });
                return;
            }
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateDataListItem"), editForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.items !== undefined) {
                    closeModalFunction();
                    renderDataListItems(dataListKey, responseJSON.items);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Item Updated',
                        message: 'The item has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Item',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminDataLists-editItem', {
            onshow: function (modalElement) {
                var _a;
                // Set the modal title
                var titleElement = modalElement.querySelector('#editDataListItem--title');
                titleElement.textContent = "Edit ".concat(dataList.dataListName, " Item");
                // Set the hidden fields
                var dataListKeyInput = modalElement.querySelector('#editDataListItem--dataListKey');
                dataListKeyInput.value = dataListKey;
                var dataListItemIdInput = modalElement.querySelector('#editDataListItem--dataListItemId');
                dataListItemIdInput.value = dataListItemId;
                // Set the item name
                var dataListItemInput = modalElement.querySelector('#editDataListItem--dataListItem');
                dataListItemInput.value = dataListItem;
                // Populate user group options
                var userGroupSelect = modalElement.querySelector('#editDataListItem--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (var _i = 0, _b = exports.userGroups; _i < _b.length; _i++) {
                    var userGroup = _b[_i];
                    var option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    if (userGroupId &&
                        Number.parseInt(userGroupId, 10) === userGroup.userGroupId) {
                        option.selected = true;
                    }
                    userGroupSelect.append(option);
                }
                // Attach form submit handler
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateDataListItem);
            },
            onshown: function (modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus and select the input
                var itemInput = modalElement.querySelector('#editDataListItem--dataListItem');
                itemInput.focus();
                itemInput.select();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteDataListItem(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var dataListKey = buttonElement.dataset.dataListKey;
        var dataListItemId = buttonElement.dataset.dataListItemId;
        var dataListItem = buttonElement.dataset.dataListItem;
        if (dataListKey === undefined ||
            dataListItemId === undefined ||
            dataListItem === undefined) {
            return;
        }
        var dataList = exports.dataLists.find(function (dl) { return dl.dataListKey === dataListKey; });
        if (dataList === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: "Delete ".concat(dataList.dataListName, " Item"),
            message: "Are you sure you want to delete \"".concat(dataListItem, "\"? This action cannot be undone."),
            okButton: {
                contextualColorName: 'danger',
                text: 'Delete Item',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteDataListItem"), {
                        dataListKey: dataListKey,
                        dataListItemId: Number.parseInt(dataListItemId, 10)
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.items !== undefined) {
                            renderDataListItems(dataListKey, responseJSON.items);
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Item Deleted',
                                message: 'The item has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Item',
                                message: 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function attachEventListeners(dataListKey) {
        var section = document.querySelector("[data-data-list-key=\"".concat(dataListKey, "\"]"));
        if (section === null) {
            return;
        }
        // Edit buttons
        var editButtons = section.querySelectorAll('.button--editItem');
        for (var _i = 0, editButtons_1 = editButtons; _i < editButtons_1.length; _i++) {
            var button = editButtons_1[_i];
            button.addEventListener('click', editDataListItem);
        }
        // Delete buttons
        var deleteButtons = section.querySelectorAll('.button--deleteItem');
        for (var _a = 0, deleteButtons_1 = deleteButtons; _a < deleteButtons_1.length; _a++) {
            var button = deleteButtons_1[_a];
            button.addEventListener('click', deleteDataListItem);
        }
    }
    function initializeSortable(dataListKey) {
        var tbodyElement = document.querySelector("#dataListItems--".concat(dataListKey));
        if (tbodyElement === null) {
            return;
        }
        // Check if the tbody has any sortable items (rows with data-data-list-item-id)
        var hasItems = tbodyElement.querySelectorAll('tr[data-data-list-item-id]').length > 0;
        if (!hasItems) {
            // Destroy existing instance if no items
            var existingInstance_1 = sortableInstances.get(dataListKey);
            if (existingInstance_1 !== undefined) {
                existingInstance_1.destroy();
                sortableInstances.delete(dataListKey);
            }
            return;
        }
        // Destroy existing Sortable instance before creating a new one
        var existingInstance = sortableInstances.get(dataListKey);
        if (existingInstance !== undefined) {
            existingInstance.destroy();
        }
        // Create new Sortable instance
        var sortableInstance = Sortable.create(tbodyElement, {
            handle: '.handle',
            animation: 150,
            onEnd: function () {
                // Get the new order
                var rows = tbodyElement.querySelectorAll('tr[data-data-list-item-id]');
                var dataListItemIds = [];
                for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                    var row = rows_1[_i];
                    var dataListItemId = row.dataset.dataListItemId;
                    if (dataListItemId !== undefined) {
                        dataListItemIds.push(Number.parseInt(dataListItemId, 10));
                    }
                }
                // Send to server
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doReorderDataListItems"), {
                    dataListKey: dataListKey,
                    dataListItemIds: dataListItemIds
                }, function (rawResponseJSON) {
                    var responseJSON = rawResponseJSON;
                    if (!responseJSON.success) {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Reordering Items',
                            message: 'Please refresh the page and try again.'
                        });
                    }
                });
            }
        });
        // Store the instance for future reference
        sortableInstances.set(dataListKey, sortableInstance);
    }
    // Initialize sortable for each data list
    for (var _i = 0, _a = exports.dataLists; _i < _a.length; _i++) {
        var dataList = _a[_i];
        initializeSortable(dataList.dataListKey);
        // Attach event listeners for this data list
        attachEventListeners(dataList.dataListKey);
    }
    // Add item buttons
    var addButtons = document.querySelectorAll('.button--addItem');
    for (var _b = 0, addButtons_1 = addButtons; _b < addButtons_1.length; _b++) {
        var button = addButtons_1[_b];
        button.addEventListener('click', addDataListItem);
    }
})();
//# sourceMappingURL=dataLists.admin.js.map