"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var workOrderFormElement = document.querySelector('#form--workOrder');
    var workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Tags functionality
     */
    var tagsContainerElement = document.querySelector('#container--tags');
    if (tagsContainerElement !== null) {
        function renderTags(tags) {
            // Update tags count
            var tagsCountElement = document.querySelector('#tagsCount');
            if (tagsCountElement !== null) {
                tagsCountElement.textContent = tags.length.toString();
            }
            if (tags.length === 0) {
                tagsContainerElement.innerHTML = /* html */ "\n          <div class=\"message is-info\">\n            <p class=\"message-body\">No tags have been added yet.</p>\n          </div>\n        ";
                return;
            }
            tagsContainerElement.innerHTML = '';
            var tagsElement = document.createElement('div');
            tagsElement.className = 'tags';
            var _loop_1 = function (tag) {
                var tagElement = document.createElement('span');
                tagElement.className = 'tag is-medium';
                // Apply colors if available
                if (tag.tagBackgroundColor && tag.tagTextColor) {
                    tagElement.style.backgroundColor = "#".concat(tag.tagBackgroundColor);
                    tagElement.style.color = "#".concat(tag.tagTextColor);
                }
                var tagTextElement = document.createElement('span');
                tagTextElement.textContent = tag.tagName;
                tagElement.appendChild(tagTextElement);
                // Add delete button if in edit mode
                if (exports.isEdit) {
                    var deleteButton = document.createElement('button');
                    deleteButton.className = 'delete is-small';
                    deleteButton.type = 'button';
                    deleteButton.setAttribute('data-tag-name', tag.tagName);
                    deleteButton.setAttribute('aria-label', "Remove tag ".concat(tag.tagName));
                    deleteButton.addEventListener('click', function () {
                        deleteTag(tag.tagName);
                    });
                    tagElement.appendChild(deleteButton);
                }
                tagsElement.appendChild(tagElement);
            };
            for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                var tag = tags_1[_i];
                _loop_1(tag);
            }
            tagsContainerElement.appendChild(tagsElement);
        }
        function deleteTag(tagName) {
            bulmaJS.confirm({
                contextualColorName: 'warning',
                title: 'Remove Tag',
                message: "Are you sure you want to remove the tag \"".concat(tagName, "\" from this work order?"),
                okButton: {
                    contextualColorName: 'warning',
                    text: 'Remove Tag',
                    callbackFunction: function () {
                        cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doDeleteWorkOrderTag"), {
                            workOrderId: Number.parseInt(workOrderId, 10),
                            tagName: tagName
                        }, function (rawResponseJSON) {
                            var _a;
                            var responseJSON = rawResponseJSON;
                            if (responseJSON.success && responseJSON.tags !== undefined) {
                                renderTags(responseJSON.tags);
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    title: 'Tag Removed',
                                    message: 'Tag has been successfully removed from this work order.'
                                });
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Error Removing Tag',
                                    message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'An error occurred while removing the tag.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function addTag() {
            var closeModalFunction;
            function doAddTag(submitEvent) {
                submitEvent.preventDefault();
                var formElement = submitEvent.currentTarget;
                var tagNameInput = formElement.querySelector('#addWorkOrderTag--tagName');
                cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doAddWorkOrderTag"), {
                    workOrderId: Number.parseInt(workOrderId, 10),
                    tagName: tagNameInput.value
                }, function (rawResponseJSON) {
                    var _a;
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success && responseJSON.tags !== undefined) {
                        closeModalFunction();
                        renderTags(responseJSON.tags);
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            title: 'Tag Added',
                            message: 'Tag has been successfully added to this work order.'
                        });
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Adding Tag',
                            message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'An error occurred while adding the tag.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addTag', {
                onshow: function (modalElement) {
                    var _a;
                    (_a = modalElement
                        .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddTag);
                },
                onshown: function (_modalElement, closeFunction) {
                    closeModalFunction = closeFunction;
                }
            });
        }
        function getTags() {
            cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/").concat(workOrderId, "/doGetWorkOrderTags"), {}, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.tags !== undefined) {
                    renderTags(responseJSON.tags);
                }
            });
        }
        // Add tag button
        var addTagButton = document.querySelector('#button--addTag');
        if (addTagButton !== null) {
            addTagButton.addEventListener('click', addTag);
        }
        // Initial load
        getTags();
    }
})();
