"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines, unicorn/no-null */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
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
            tbodyElement.innerHTML = "<tr>\n        <td colspan=\"4\" class=\"has-text-centered has-text-grey\">\n          No items in this list. Click \"Add Item\" to create one.\n        </td>\n      </tr>";
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
        var itemInputElement;
        var userGroupSelectElement;
        // Build user group options
        var userGroupOptions = '<option value="">None (Available to All)</option>';
        for (var _i = 0, _a = exports.userGroups; _i < _a.length; _i++) {
            var userGroup = _a[_i];
            userGroupOptions += "<option value=\"".concat(userGroup.userGroupId, "\">").concat(cityssm.escapeHTML(userGroup.userGroupName), "</option>");
        }
        bulmaJS.confirm({
            contextualColorName: 'primary',
            message: /* html */ "\n        <div class=\"field\">\n          <label class=\"label\">Item Name</label>\n          <div class=\"control\">\n            <input\n              class=\"input\"\n              id=\"input--newItem\"\n              type=\"text\"\n              required\n            />\n          </div>\n        </div>\n        <div class=\"field\">\n          <label class=\"label\">User Group (Optional)</label>\n          <div class=\"control\">\n            <div class=\"select is-fullwidth\">\n              <select id=\"select--userGroup\">\n                ".concat(userGroupOptions, "\n              </select>\n            </div>\n          </div>\n          <p class=\"help\">If specified, only members of this user group will see this item.</p>\n        </div>\n      "),
            messageIsHtml: true,
            okButton: {
                text: 'Add Item',
                callbackFunction: function () {
                    var dataListItem = itemInputElement.value.trim();
                    if (dataListItem === '') {
                        bulmaJS.alert({
                            contextualColorName: 'warning',
                            title: 'Item Name Required',
                            message: 'Please enter an item name.'
                        });
                        return;
                    }
                    var userGroupIdValue = userGroupSelectElement.value;
                    var userGroupId = userGroupIdValue
                        ? Number.parseInt(userGroupIdValue, 10)
                        : null;
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddDataListItem"), {
                        dataListKey: dataListKey,
                        dataListItem: dataListItem,
                        userGroupId: userGroupId
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.items !== undefined) {
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
            },
            title: "Add ".concat(dataList.dataListName, " Item")
        });
        itemInputElement = document.querySelector('#input--newItem');
        userGroupSelectElement = document.querySelector('#select--userGroup');
        itemInputElement.focus();
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
        var itemInputElement;
        var userGroupSelectElement;
        // Build user group options
        var userGroupOptions = '<option value="">None (Available to All)</option>';
        for (var _i = 0, _a = exports.userGroups; _i < _a.length; _i++) {
            var userGroup = _a[_i];
            var selected = userGroupId &&
                Number.parseInt(userGroupId, 10) === userGroup.userGroupId
                ? 'selected'
                : '';
            userGroupOptions += "<option value=\"".concat(userGroup.userGroupId, "\" ").concat(selected, ">").concat(cityssm.escapeHTML(userGroup.userGroupName), "</option>");
        }
        bulmaJS.confirm({
            contextualColorName: 'info',
            title: "Edit ".concat(dataList.dataListName, " Item"),
            message: /* html */ "\n        <div class=\"field\">\n          <label class=\"label\">Item Name</label>\n          <div class=\"control\">\n            <input\n              class=\"input\"\n              id=\"input--editItem\"\n              type=\"text\"\n              value=\"".concat(cityssm.escapeHTML(dataListItem), "\"\n              required\n            />\n          </div>\n        </div>\n        <div class=\"field\">\n          <label class=\"label\">User Group (Optional)</label>\n          <div class=\"control\">\n            <div class=\"select is-fullwidth\">\n              <select id=\"select--editUserGroup\">\n                ").concat(userGroupOptions, "\n              </select>\n            </div>\n          </div>\n          <p class=\"help\">If specified, only members of this user group will see this item.</p>\n        </div>\n      "),
            messageIsHtml: true,
            okButton: {
                text: 'Update Item',
                callbackFunction: function () {
                    var newDataListItem = itemInputElement.value.trim();
                    if (newDataListItem === '') {
                        bulmaJS.alert({
                            contextualColorName: 'warning',
                            title: 'Item Name Required',
                            message: 'Please enter an item name.'
                        });
                        return;
                    }
                    var userGroupIdValue = userGroupSelectElement.value;
                    var newUserGroupId = userGroupIdValue
                        ? Number.parseInt(userGroupIdValue, 10)
                        : null;
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateDataListItem"), {
                        dataListKey: dataListKey,
                        dataListItemId: Number.parseInt(dataListItemId, 10),
                        dataListItem: newDataListItem,
                        userGroupId: newUserGroupId
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.items !== undefined) {
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
            }
        });
        itemInputElement = document.querySelector('#input--editItem');
        userGroupSelectElement = document.querySelector('#select--editUserGroup');
        itemInputElement.focus();
        itemInputElement.select();
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
            return;
        }
        Sortable.create(tbodyElement, {
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
