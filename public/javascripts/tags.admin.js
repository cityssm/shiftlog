"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a, _b;
    var shiftLog = exports.shiftLog;
    var tagsContainerElement = document.querySelector('#container--tags');
    // Pagination settings
    var ITEMS_PER_PAGE = 20;
    var currentPage = 1;
    var currentFilteredTags = exports.tags;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        renderTagsWithPagination(currentFilteredTags);
    }
    function deleteTag(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var tagName = buttonElement.dataset.tagName;
        if (tagName === undefined) {
            return;
        }
        var tag = exports.tags.find(function (possibleTag) { return possibleTag.tagName === tagName; });
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Tag',
            message: "Are you sure you want to delete tag \"".concat((_a = tag === null || tag === void 0 ? void 0 : tag.tagName) !== null && _a !== void 0 ? _a : '', "\"? This action cannot be undone."),
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Tag',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteTag"), { tagName: tagName }, function (rawResponseJSON) {
                        var _a;
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.tags !== undefined) {
                                exports.tags = responseJSON.tags;
                                currentFilteredTags = responseJSON.tags;
                                currentPage = 1;
                                renderTagsWithPagination(responseJSON.tags);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Tag Deleted',
                                message: 'Tag has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Tag',
                                message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editTag(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var tagName = buttonElement.dataset.tagName;
        if (tagName === undefined) {
            return;
        }
        var tag = exports.tags.find(function (possibleTag) { return possibleTag.tagName === tagName; });
        if (tag === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateTag(submitEvent) {
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateTag"), editForm, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.tags !== undefined) {
                        exports.tags = responseJSON.tags;
                        currentFilteredTags = responseJSON.tags;
                        currentPage = 1;
                        renderTagsWithPagination(responseJSON.tags);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Tag Updated',
                        message: 'Tag has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Tag',
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminTags-edit', {
            onshow: function (modalElement) {
                var _a;
                ;
                modalElement.querySelector('#editTag--tagName').value = tag.tagName;
                modalElement.querySelector('#editTag--tagNameDisplay').value = tag.tagName;
                modalElement.querySelector('#editTag--tagBackgroundColor').value = "#".concat(tag.tagBackgroundColor);
                modalElement.querySelector('#editTag--tagTextColor').value = "#".concat(tag.tagTextColor);
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateTag);
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            },
            onremoved: function () {
                var _a;
                (_a = document
                    .querySelector('#button--addTag')) === null || _a === void 0 ? void 0 : _a.removeEventListener('click', editTag);
            }
        });
    }
    function addTag() {
        var closeModalFunction;
        function doAddTag(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddTag"), addForm, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.tags !== undefined) {
                        exports.tags = responseJSON.tags;
                        currentFilteredTags = responseJSON.tags;
                        currentPage = 1;
                        renderTagsWithPagination(responseJSON.tags);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Tag Added',
                        message: 'Tag has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Tag',
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminTags-add', {
            onshow: function (modalElement) {
                var _a;
                (_a = modalElement.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddTag);
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            }
        });
    }
    function renderTagsWithPagination(tags) {
        var _a, _b;
        var totalItems = tags.length;
        var totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        var endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
        // Clear container
        tagsContainerElement.innerHTML = '';
        if (tags.length === 0) {
            tagsContainerElement.innerHTML = "\n        <div class=\"message is-info\">\n          <p class=\"message-body\">\n            No tags found.\n          </p>\n        </div>\n      ";
            return;
        }
        // Create table
        var tableElement = document.createElement('table');
        tableElement.className = 'table is-striped is-hoverable is-fullwidth';
        var thead = document.createElement('thead');
        thead.innerHTML = "\n      <tr>\n        <th>Tag Name</th>\n        <th style=\"width: 200px;\">Preview</th>\n        <th style=\"width: 150px;\">Background</th>\n        <th style=\"width: 150px;\">Text Color</th>\n        <th style=\"width: 150px;\"><span class=\"is-sr-only\">Actions</span></th>\n      </tr>\n    ";
        tableElement.append(thead);
        var tbody = document.createElement('tbody');
        for (var index = startIndex; index < endIndex; index += 1) {
            var tag = tags[index];
            var tr = document.createElement('tr');
            tr.innerHTML = "\n        <td>".concat(cityssm.escapeHTML(tag.tagName), "</td>\n        <td>\n          <span class=\"tag\" style=\"background-color: #").concat(cityssm.escapeHTML(tag.tagBackgroundColor), "; color: #").concat(cityssm.escapeHTML(tag.tagTextColor), ";\">\n            ").concat(cityssm.escapeHTML(tag.tagName), "\n          </span>\n        </td>\n        <td>\n          <span style=\"color: #").concat(cityssm.escapeHTML(tag.tagBackgroundColor), ";\">\n            #").concat(cityssm.escapeHTML(tag.tagBackgroundColor), "\n          </span>\n        </td>\n        <td>\n          <span style=\"color: #").concat(cityssm.escapeHTML(tag.tagTextColor), ";\">\n            #").concat(cityssm.escapeHTML(tag.tagTextColor), "\n          </span>\n        </td>\n        <td class=\"has-text-right\">\n          <div class=\"buttons are-small is-right\">\n            <button class=\"button is-warning\" data-tag-name=\"").concat(cityssm.escapeHTML(tag.tagName), "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-pencil\"></i></span>\n              <span>Edit</span>\n            </button>\n            <button class=\"button is-danger\" data-tag-name=\"").concat(cityssm.escapeHTML(tag.tagName), "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-trash\"></i></span>\n              <span>Delete</span>\n            </button>\n          </div>\n        </td>\n      ");
            (_a = tr.querySelector('.button.is-warning')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', editTag);
            (_b = tr.querySelector('.button.is-danger')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', deleteTag);
            tbody.append(tr);
        }
        tableElement.append(tbody);
        tagsContainerElement.append(tableElement);
        // Add pagination if needed
        if (totalPages > 1) {
            var paginationElement = document.createElement('nav');
            paginationElement.className = 'pagination is-centered';
            paginationElement.setAttribute('role', 'navigation');
            paginationElement.setAttribute('aria-label', 'pagination');
            var paginationHTML = '<ul class="pagination-list">';
            for (var pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                paginationHTML += "\n          <li>\n            <a class=\"pagination-link ".concat(pageNumber === currentPage ? 'is-current' : '', "\" \n               aria-label=\"Page ").concat(pageNumber, "\" \n               data-page=\"").concat(pageNumber, "\">\n              ").concat(pageNumber, "\n            </a>\n          </li>\n        ");
            }
            paginationHTML += '</ul>';
            paginationElement.innerHTML = paginationHTML;
            for (var _i = 0, _c = paginationElement.querySelectorAll('.pagination-link'); _i < _c.length; _i++) {
                var link = _c[_i];
                link.addEventListener('click', function (clickEvent) {
                    var target = clickEvent.currentTarget;
                    var pageNumber = Number(target.dataset.page);
                    pageSelect(pageNumber);
                });
            }
            tagsContainerElement.append(paginationElement);
        }
    }
    function addTagFromWorkOrder() {
        var closeModalFunction;
        function selectOrphanedTag(clickEvent) {
            var buttonElement = clickEvent.currentTarget;
            var tagName = buttonElement.dataset.tagName;
            if (tagName === undefined) {
                return;
            }
            closeModalFunction();
            // Open the add tag modal with the tag name pre-filled
            cityssm.openHtmlModal('adminTags-add', {
                onshow: function (modalElement) {
                    var _a;
                    ;
                    modalElement.querySelector('#addTag--tagName').value = tagName;
                    modalElement.querySelector('#addTag--tagName').readOnly = true;
                    (_a = modalElement.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (submitEvent) {
                        submitEvent.preventDefault();
                        var addForm = submitEvent.currentTarget;
                        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddTag"), addForm, function (rawResponseJSON) {
                            var _a, _b;
                            var responseJSON = rawResponseJSON;
                            if (responseJSON.success) {
                                ;
                                (_a = modalElement.closest('.modal').querySelector('.is-close-modal-button')) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event('click'));
                                if (responseJSON.tags !== undefined) {
                                    exports.tags = responseJSON.tags;
                                    currentFilteredTags = responseJSON.tags;
                                    currentPage = 1;
                                    renderTagsWithPagination(responseJSON.tags);
                                }
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    title: 'Tag Added',
                                    message: 'Tag has been successfully added from work order.'
                                });
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Error Adding Tag',
                                    message: (_b = responseJSON.message) !== null && _b !== void 0 ? _b : 'Please try again.'
                                });
                            }
                        });
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminTags-addFromWorkOrder', {
            onshow: function (modalElement) {
                var containerElement = modalElement.querySelector('#container--orphanedTags');
                containerElement.innerHTML = "\n          <div class=\"message is-info\">\n            <p class=\"message-body\">\n              <span class=\"icon\"><i class=\"fa-solid fa-spinner fa-pulse\"></i></span>\n              Loading tags...\n            </p>\n          </div>\n        ";
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doGetOrphanedTags"), {}, function (rawResponseJSON) {
                    var _a;
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success && responseJSON.orphanedTags !== undefined) {
                        if (responseJSON.orphanedTags.length === 0) {
                            containerElement.innerHTML = "\n                  <div class=\"message is-success\">\n                    <p class=\"message-body\">\n                      <span class=\"icon\"><i class=\"fa-solid fa-check\"></i></span>\n                      All work order tags have system records.\n                    </p>\n                  </div>\n                ";
                        }
                        else {
                            var tableElement = document.createElement('table');
                            tableElement.className = 'table is-striped is-hoverable is-fullwidth';
                            tableElement.innerHTML = "\n                  <thead>\n                    <tr>\n                      <th>Tag Name</th>\n                      <th style=\"width: 120px;\">Usage Count</th>\n                      <th style=\"width: 100px;\"><span class=\"is-sr-only\">Actions</span></th>\n                    </tr>\n                  </thead>\n                ";
                            var tbody = document.createElement('tbody');
                            for (var _i = 0, _b = responseJSON.orphanedTags; _i < _b.length; _i++) {
                                var orphanedTag = _b[_i];
                                var tr = document.createElement('tr');
                                tr.innerHTML = "\n                    <td>".concat(cityssm.escapeHTML(orphanedTag.tagName), "</td>\n                    <td>").concat(orphanedTag.usageCount, "</td>\n                    <td class=\"has-text-right\">\n                      <button class=\"button is-primary is-small\" data-tag-name=\"").concat(cityssm.escapeHTML(orphanedTag.tagName), "\" type=\"button\">\n                        <span class=\"icon\"><i class=\"fa-solid fa-plus\"></i></span>\n                        <span>Add</span>\n                      </button>\n                    </td>\n                  ");
                                (_a = tr.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', selectOrphanedTag);
                                tbody.append(tr);
                            }
                            tableElement.append(tbody);
                            containerElement.innerHTML = '';
                            containerElement.append(tableElement);
                        }
                    }
                    else {
                        containerElement.innerHTML = "\n                <div class=\"message is-danger\">\n                  <p class=\"message-body\">\n                    <span class=\"icon\"><i class=\"fa-solid fa-exclamation-triangle\"></i></span>\n                    Failed to load orphaned tags.\n                  </p>\n                </div>\n              ";
                    }
                });
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            }
        });
    }
    // Filter functionality
    var filterInput = document.querySelector('#filter--tags');
    filterInput === null || filterInput === void 0 ? void 0 : filterInput.addEventListener('keyup', function () {
        var filterValue = filterInput.value.toLowerCase();
        currentFilteredTags = exports.tags.filter(function (tag) {
            return tag.tagName.toLowerCase().includes(filterValue);
        });
        currentPage = 1;
        renderTagsWithPagination(currentFilteredTags);
    });
    // Add tag button
    (_a = document.querySelector('#button--addTag')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', addTag);
    // Add tag from work order button
    (_b = document.querySelector('#button--addTagFromWorkOrder')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', addTagFromWorkOrder);
    // Initial render
    renderTagsWithPagination(exports.tags);
})();
