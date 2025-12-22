"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a, _b;
    var shiftLog = exports.shiftLog;
    var tagsContainerElement = document.querySelector('#container--tags');
    // WCAG Contrast Calculation Functions
    var WCAG_AA_NORMAL_RATIO = 4.5;
    var WCAG_AAA_NORMAL_RATIO = 7;
    /**
     * Convert a hex color to RGB values
     */
    function hexToRgb(hex) {
        var cleanHex = hex.replace(/^#/, '');
        var bigint = Number.parseInt(cleanHex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return { r: r, g: g, b: b };
    }
    /**
     * Calculate relative luminance according to WCAG 2.0
     */
    function getRelativeLuminance(rgb) {
        var rsRGB = rgb.r / 255;
        var gsRGB = rgb.g / 255;
        var bsRGB = rgb.b / 255;
        var r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow(((rsRGB + 0.055) / 1.055), 2.4);
        var g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow(((gsRGB + 0.055) / 1.055), 2.4);
        var b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow(((bsRGB + 0.055) / 1.055), 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    /**
     * Calculate contrast ratio between two colors
     */
    function getContrastRatio(color1, color2) {
        var rgb1 = hexToRgb(color1);
        var rgb2 = hexToRgb(color2);
        var lum1 = getRelativeLuminance(rgb1);
        var lum2 = getRelativeLuminance(rgb2);
        var lighter = Math.max(lum1, lum2);
        var darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    /**
     * Get WCAG compliance level for a contrast ratio
     */
    function getWCAGCompliance(contrastRatio) {
        return {
            aa: contrastRatio >= WCAG_AA_NORMAL_RATIO,
            aaa: contrastRatio >= WCAG_AAA_NORMAL_RATIO
        };
    }
    /**
     * Update the preview and contrast information for a tag
     */
    function updateTagPreview(previewElement, contrastRatioElement, wcagAAElement, wcagAAAElement, backgroundColor, textColor, tagName) {
        previewElement.style.backgroundColor = backgroundColor;
        previewElement.style.color = textColor;
        if (tagName !== undefined) {
            previewElement.textContent = tagName;
        }
        var contrastRatio = getContrastRatio(backgroundColor, textColor);
        var compliance = getWCAGCompliance(contrastRatio);
        contrastRatioElement.textContent = contrastRatio.toFixed(2);
        wcagAAElement.innerHTML = compliance.aa
            ? '<span class="tag is-success">Pass</span>'
            : '<span class="tag is-danger">Fail</span>';
        wcagAAAElement.innerHTML = compliance.aaa
            ? '<span class="tag is-success">Pass</span>'
            : '<span class="tag is-danger">Fail</span>';
    }
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
                var tagNameInput = modalElement.querySelector('#editTag--tagName');
                var tagNameDisplayInput = modalElement.querySelector('#editTag--tagNameDisplay');
                var backgroundColorInput = modalElement.querySelector('#editTag--tagBackgroundColor');
                var textColorInput = modalElement.querySelector('#editTag--tagTextColor');
                var previewElement = modalElement.querySelector('#editTag--preview');
                var contrastRatioElement = modalElement.querySelector('#editTag--contrastRatio');
                var wcagAAElement = modalElement.querySelector('#editTag--wcagAA');
                var wcagAAAElement = modalElement.querySelector('#editTag--wcagAAA');
                tagNameInput.value = tag.tagName;
                tagNameDisplayInput.value = tag.tagName;
                backgroundColorInput.value = "#".concat(tag.tagBackgroundColor);
                textColorInput.value = "#".concat(tag.tagTextColor);
                // Update preview when colors change
                function updatePreview() {
                    updateTagPreview(previewElement, contrastRatioElement, wcagAAElement, wcagAAAElement, backgroundColorInput.value, textColorInput.value, tag.tagName);
                }
                // Initialize preview with current values
                updatePreview();
                // Add event listeners for real-time updates
                backgroundColorInput.addEventListener('input', updatePreview);
                textColorInput.addEventListener('input', updatePreview);
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateTag);
            },
            onshown: function (_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved: function () {
                var _a;
                bulmaJS.toggleHtmlClipped();
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
                var tagNameInput = modalElement.querySelector('#addTag--tagName');
                var backgroundColorInput = modalElement.querySelector('#addTag--tagBackgroundColor');
                var textColorInput = modalElement.querySelector('#addTag--tagTextColor');
                var previewElement = modalElement.querySelector('#addTag--preview');
                var contrastRatioElement = modalElement.querySelector('#addTag--contrastRatio');
                var wcagAAElement = modalElement.querySelector('#addTag--wcagAA');
                var wcagAAAElement = modalElement.querySelector('#addTag--wcagAAA');
                // Update preview when colors or name change
                function updatePreview() {
                    updateTagPreview(previewElement, contrastRatioElement, wcagAAElement, wcagAAAElement, backgroundColorInput.value, textColorInput.value, tagNameInput.value || 'Sample Tag');
                }
                // Initialize preview with default values
                updatePreview();
                // Add event listeners for real-time updates
                tagNameInput.addEventListener('input', updatePreview);
                backgroundColorInput.addEventListener('input', updatePreview);
                textColorInput.addEventListener('input', updatePreview);
                (_a = modalElement.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddTag);
            },
            onshown: function (_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
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
            tr.innerHTML = "\n        <td>".concat(cityssm.escapeHTML(tag.tagName), "</td>\n        <td>\n          <span class=\"tag\" style=\"background-color: #").concat(cityssm.escapeHTML(tag.tagBackgroundColor), "; color: #").concat(cityssm.escapeHTML(tag.tagTextColor), ";\">\n            ").concat(cityssm.escapeHTML(tag.tagName), "\n          </span>\n        </td>\n        <td>\n          <span style=\"color: #").concat(cityssm.escapeHTML(tag.tagBackgroundColor), ";\">\n            #").concat(cityssm.escapeHTML(tag.tagBackgroundColor), "\n          </span>\n        </td>\n        <td>\n          <span style=\"color: #").concat(cityssm.escapeHTML(tag.tagTextColor), ";\">\n            #").concat(cityssm.escapeHTML(tag.tagTextColor), "\n          </span>\n        </td>\n        <td class=\"has-text-right\">\n          <div class=\"buttons are-small is-right\">\n            <button class=\"button is-info\" data-tag-name=\"").concat(cityssm.escapeHTML(tag.tagName), "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-pencil\"></i></span>\n              <span>Edit</span>\n            </button>\n            <button class=\"button is-danger\" data-tag-name=\"").concat(cityssm.escapeHTML(tag.tagName), "\" type=\"button\">\n              <span class=\"icon\"><i class=\"fa-solid fa-trash\"></i></span>\n              <span>Delete</span>\n            </button>\n          </div>\n        </td>\n      ");
            (_a = tr.querySelector('.button.is-info')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', editTag);
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
                paginationHTML += /* html */ "\n          <li>\n            <a class=\"pagination-link ".concat(pageNumber === currentPage ? 'is-current' : '', "\" \n              data-page=\"").concat(pageNumber, "\" \n              aria-label=\"Page ").concat(pageNumber, "\"\n            >\n              ").concat(pageNumber, "\n            </a>\n          </li>\n        ");
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
        var closeModalFunction = function () {
            // Initialized with no-op, will be assigned in onshown
        };
        function selectOrphanedTag(clickEvent) {
            var buttonElement = clickEvent.currentTarget;
            var tagName = buttonElement.dataset.tagName;
            if (tagName === undefined) {
                return;
            }
            closeModalFunction();
            // Open the add tag modal with the tag name pre-filled
            var closeAddModalFunction;
            cityssm.openHtmlModal('adminTags-add', {
                onshow: function (modalElement) {
                    var _a;
                    ;
                    modalElement.querySelector('#addTag--tagName').value = tagName;
                    modalElement.querySelector('#addTag--tagName').readOnly = true;
                    (_a = modalElement
                        .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (submitEvent) {
                        submitEvent.preventDefault();
                        var addForm = submitEvent.currentTarget;
                        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddTag"), addForm, function (rawResponseJSON) {
                            var _a;
                            var responseJSON = rawResponseJSON;
                            if (responseJSON.success) {
                                closeAddModalFunction();
                                if (responseJSON.tags !== undefined) {
                                    exports.tags = responseJSON.tags;
                                    currentFilteredTags = responseJSON.tags;
                                    currentPage = 1;
                                    renderTagsWithPagination(responseJSON.tags);
                                }
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    title: 'Tag Added',
                                    message: 'Tag has been successfully added to the system.'
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
                    });
                },
                onshown: function (_modalElement, closeFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeAddModalFunction = closeFunction;
                },
                onremoved: function () {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        cityssm.openHtmlModal('adminTags-addFromWorkOrder', {
            onshow: function (modalElement) {
                var containerElement = modalElement.querySelector('#container--orphanedTags');
                containerElement.innerHTML = /* html */ "\n          <div class=\"message is-info\">\n            <p class=\"message-body\">\n              <span class=\"icon\"><i class=\"fa-solid fa-spinner fa-pulse\"></i></span>\n              Loading tags...\n            </p>\n          </div>\n        ";
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doGetOrphanedTags"), {}, function (rawResponseJSON) {
                    var _a;
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success &&
                        responseJSON.orphanedTags !== undefined) {
                        if (responseJSON.orphanedTags.length === 0) {
                            containerElement.innerHTML = /* html */ "\n                  <div class=\"message is-success\">\n                    <p class=\"message-body\">\n                      <span class=\"icon\"><i class=\"fa-solid fa-check\"></i></span>\n                      All work order tags have system records.\n                    </p>\n                  </div>\n                ";
                        }
                        else {
                            var tableElement = document.createElement('table');
                            tableElement.className =
                                'table is-striped is-hoverable is-fullwidth';
                            tableElement.innerHTML = /* html */ "\n                  <thead>\n                    <tr>\n                      <th>Tag Name</th>\n                      <th class=\"has-text-right\" style=\"width: 120px;\">Usage Count</th>\n                      <th style=\"width: 100px;\"><span class=\"is-sr-only\">Actions</span></th>\n                    </tr>\n                  </thead>\n                ";
                            var tbody = document.createElement('tbody');
                            for (var _i = 0, _b = responseJSON.orphanedTags; _i < _b.length; _i++) {
                                var orphanedTag = _b[_i];
                                var tr = document.createElement('tr');
                                tr.innerHTML = /* html */ "\n                    <td>\n                      <span class=\"tag is-light\">\n                        ".concat(cityssm.escapeHTML(orphanedTag.tagName), "\n                      </span>\n                    </td>\n                    <td class=\"has-text-right\">\n                      ").concat(cityssm.escapeHTML(orphanedTag.usageCount.toString()), "\n                    </td>\n                    <td class=\"has-text-right\">\n                      <button class=\"button is-primary is-small\" data-tag-name=\"").concat(cityssm.escapeHTML(orphanedTag.tagName), "\" type=\"button\">\n                        <span class=\"icon\"><i class=\"fa-solid fa-plus\"></i></span>\n                        <span>Add</span>\n                      </button>\n                    </td>\n                  ");
                                (_a = tr.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', selectOrphanedTag);
                                tbody.append(tr);
                            }
                            tableElement.append(tbody);
                            containerElement.innerHTML = '';
                            containerElement.append(tableElement);
                        }
                    }
                    else {
                        containerElement.innerHTML = /* html */ "\n                <div class=\"message is-danger\">\n                  <p class=\"message-body\">\n                    <span class=\"icon\"><i class=\"fa-solid fa-exclamation-triangle\"></i></span>\n                    Failed to load orphaned tags.\n                  </p>\n                </div>\n              ";
                    }
                });
            },
            onshown: function (_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    // Filter functionality
    var filterInput = document.querySelector('#filter--tags');
    filterInput.addEventListener('keyup', function () {
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
    (_b = document
        .querySelector('#button--addTagFromWorkOrder')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', addTagFromWorkOrder);
    // Initial render
    renderTagsWithPagination(exports.tags);
})();
