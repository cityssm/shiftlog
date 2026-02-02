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
            if (tags.length === 0) {
                ;
                tagsContainerElement.innerHTML = /* html */ "\n          <p class=\"has-text-grey\">No tags have been added.</p>\n        ";
                return;
            }
            ;
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
                tagElement.append(tagTextElement);
                // Add delete button if in edit mode
                if (exports.isEdit) {
                    var deleteButton = document.createElement('button');
                    deleteButton.className = 'delete is-small';
                    deleteButton.type = 'button';
                    deleteButton.dataset.tagName = tag.tagName;
                    deleteButton.title = "Remove tag ".concat(tag.tagName);
                    deleteButton.addEventListener('click', function () {
                        deleteTag(tag.tagName);
                    });
                    tagElement.append(deleteButton);
                }
                tagsElement.append(tagElement);
            };
            for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                var tag = tags_1[_i];
                _loop_1(tag);
            }
            tagsContainerElement === null || tagsContainerElement === void 0 ? void 0 : tagsContainerElement.append(tagsElement);
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
                        }, function (responseJSON) {
                            if (responseJSON.success) {
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
                                    message: responseJSON.errorMessage
                                });
                            }
                        });
                    }
                }
            });
        }
        function addTag() {
            var closeModalFunction;
            function renderSuggestedTags(containerElement, suggestedTags) {
                if (suggestedTags.length === 0) {
                    containerElement.innerHTML = '';
                    return;
                }
                containerElement.innerHTML = /* html */ "\n          <div class=\"field\">\n            <label class=\"label\">Suggested Tags</label>\n            <div class=\"control\">\n              <div class=\"tags\" id=\"tags--suggested\"></div>\n            </div>\n            <p class=\"help\">Recently used tags that are not yet on this work order. Click to add.</p>\n          </div>\n        ";
                var tagsElement = containerElement.querySelector('#tags--suggested');
                var _loop_2 = function (suggestedTag) {
                    var tagElement = document.createElement('button');
                    tagElement.className = 'tag is-medium is-clickable';
                    tagElement.type = 'button';
                    // Apply colors if available
                    if (suggestedTag.tagBackgroundColor !== undefined &&
                        suggestedTag.tagBackgroundColor !== null &&
                        suggestedTag.tagTextColor !== undefined &&
                        suggestedTag.tagTextColor !== null) {
                        tagElement.style.backgroundColor = "#".concat(suggestedTag.tagBackgroundColor);
                        tagElement.style.color = "#".concat(suggestedTag.tagTextColor);
                    }
                    tagElement.textContent = suggestedTag.tagName;
                    tagElement.addEventListener('click', function () {
                        cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doAddWorkOrderTag"), {
                            workOrderId: Number.parseInt(workOrderId, 10),
                            tagName: suggestedTag.tagName
                        }, function (responseJSON) {
                            if (responseJSON.success) {
                                closeModalFunction();
                                renderTags(responseJSON.tags);
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    title: 'Tag Added',
                                    message: 'Tag has been successfully added to this work order.',
                                    okButton: {
                                        callbackFunction: function () {
                                            addTag();
                                        }
                                    }
                                });
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Error Adding Tag',
                                    message: responseJSON.errorMessage
                                });
                            }
                        });
                    });
                    tagsElement.append(tagElement);
                };
                for (var _i = 0, suggestedTags_1 = suggestedTags; _i < suggestedTags_1.length; _i++) {
                    var suggestedTag = suggestedTags_1[_i];
                    _loop_2(suggestedTag);
                }
            }
            function doAddTag(submitEvent) {
                submitEvent.preventDefault();
                var formElement = submitEvent.currentTarget;
                var tagNameInput = formElement.querySelector('#addWorkOrderTag--tagName');
                cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doAddWorkOrderTag"), {
                    workOrderId: Number.parseInt(workOrderId, 10),
                    tagName: tagNameInput.value
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        closeModalFunction();
                        renderTags(responseJSON.tags);
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            title: 'Tag Added',
                            message: 'Tag has been successfully added to this work order.',
                            okButton: {
                                callbackFunction: function () {
                                    addTag();
                                }
                            }
                        });
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Adding Tag',
                            message: responseJSON.errorMessage
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addTag', {
                onshow: function (modalElement) {
                    var _a;
                    exports.shiftLog.setUnsavedChanges('modal');
                    (_a = modalElement
                        .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddTag);
                    // Fetch and render suggested tags
                    var suggestedTagsContainer = modalElement.querySelector('#container--suggestedTags');
                    if (suggestedTagsContainer !== null) {
                        cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/").concat(workOrderId, "/doGetSuggestedTags"), {}, function (responseJSON) {
                            renderSuggestedTags(suggestedTagsContainer, responseJSON.suggestedTags);
                        });
                    }
                },
                onshown: function (modalElement, closeFunction) {
                    closeModalFunction = closeFunction;
                    bulmaJS.toggleHtmlClipped();
                    modalElement.querySelector('#addWorkOrderTag--tagName').focus();
                },
                onremoved: function () {
                    exports.shiftLog.clearUnsavedChanges('modal');
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function getTags() {
            cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/").concat(workOrderId, "/doGetWorkOrderTags"), {}, function (responseJSON) {
                renderTags(responseJSON.tags);
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
