/* eslint-disable max-lines -- Large file */
(() => {
    const shiftLog = exports.shiftLog;
    const tagsContainerElement = document.querySelector('#container--tags');
    // WCAG Contrast Calculation Functions
    const WCAG_AA_NORMAL_RATIO = 4.5;
    const WCAG_AAA_NORMAL_RATIO = 7;
    /* eslint-disable @typescript-eslint/no-magic-numbers -- WCAG contrast ratios */
    /**
     * Convert a hex color to RGB values
     */
    function hexToRgb(hex) {
        const cleanHex = hex.replace(/^#/v, '');
        // Validate hex string
        if (!/^[\dA-F]{6}$/iv.test(cleanHex)) {
            // Default to black if invalid
            return { r: 0, g: 0, b: 0 };
        }
        const bigint = Number.parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }
    /**
     * Calculate relative luminance according to WCAG 2.0
     */
    function getRelativeLuminance(rgb) {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        const r = rsRGB <= 0.039_28 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
        const g = gsRGB <= 0.039_28 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
        const b = bsRGB <= 0.039_28 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    /**
     * Calculate contrast ratio between two colors
     */
    function getContrastRatio(color1, color2) {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        const lum1 = getRelativeLuminance(rgb1);
        const lum2 = getRelativeLuminance(rgb2);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    /* eslint-enable @typescript-eslint/no-magic-numbers */
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
    function updateTagPreview(elements, backgroundColor, textColor, tagName) {
        elements.previewElement.style.backgroundColor = backgroundColor;
        elements.previewElement.style.color = textColor;
        if (tagName !== undefined) {
            elements.previewElement.textContent = tagName;
        }
        const contrastRatio = getContrastRatio(backgroundColor, textColor);
        const compliance = getWCAGCompliance(contrastRatio);
        elements.contrastRatioElement.textContent = contrastRatio.toFixed(2);
        // Clear existing content
        elements.wcagAAElement.textContent = '';
        elements.wcagAAAElement.textContent = '';
        // Create and append status badges
        const aaSpan = document.createElement('span');
        aaSpan.className = compliance.aa ? 'tag is-success' : 'tag is-danger';
        aaSpan.textContent = compliance.aa ? 'Pass' : 'Fail';
        elements.wcagAAElement.append(aaSpan);
        const aaaSpan = document.createElement('span');
        aaaSpan.className = compliance.aaa ? 'tag is-success' : 'tag is-danger';
        aaaSpan.textContent = compliance.aaa ? 'Pass' : 'Fail';
        elements.wcagAAAElement.append(aaaSpan);
    }
    // Pagination settings
    const ITEMS_PER_PAGE = 20;
    let currentPage = 1;
    let currentFilteredTags = exports.tags;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        renderTagsWithPagination(currentFilteredTags);
    }
    function deleteTag(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tagName = buttonElement.dataset.tagName;
        if (tagName === undefined) {
            return;
        }
        const tag = exports.tags.find((possibleTag) => possibleTag.tagName === tagName);
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Tag',
            message: `Are you sure you want to delete tag "${tag?.tagName ?? ''}"? This action cannot be undone.`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Tag',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteTag`, { tagName }, (responseJSON) => {
                        if (responseJSON.success) {
                            exports.tags = responseJSON.tags;
                            currentFilteredTags = responseJSON.tags;
                            currentPage = 1;
                            renderTagsWithPagination(responseJSON.tags);
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
                                message: 'message' in responseJSON
                                    ? responseJSON.message
                                    : 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editTag(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tagName = buttonElement.dataset.tagName;
        if (tagName === undefined) {
            return;
        }
        const tag = exports.tags.find((possibleTag) => possibleTag.tagName === tagName);
        if (tag === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateTag(submitEvent) {
            submitEvent.preventDefault();
            const editForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateTag`, editForm, (responseJSON) => {
                if (responseJSON.success) {
                    closeModalFunction();
                    exports.tags = responseJSON.tags;
                    currentFilteredTags = responseJSON.tags;
                    currentPage = 1;
                    renderTagsWithPagination(responseJSON.tags);
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
                        message: 'message' in responseJSON
                            ? responseJSON.message
                            : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminTags-edit', {
            onshow(modalElement) {
                const tagNameInput = modalElement.querySelector('#editTag--tagName');
                const tagNameDisplayInput = modalElement.querySelector('#editTag--tagNameDisplay');
                const backgroundColorInput = modalElement.querySelector('#editTag--tagBackgroundColor');
                const textColorInput = modalElement.querySelector('#editTag--tagTextColor');
                const previewElement = modalElement.querySelector('#editTag--preview');
                const contrastRatioElement = modalElement.querySelector('#editTag--contrastRatio');
                const wcagAAElement = modalElement.querySelector('#editTag--wcagAA');
                const wcagAAAElement = modalElement.querySelector('#editTag--wcagAAA');
                tagNameInput.value = tag.tagName;
                tagNameDisplayInput.value = tag.tagName;
                backgroundColorInput.value = `#${tag.tagBackgroundColor}`;
                textColorInput.value = `#${tag.tagTextColor}`;
                // Update preview when colors change
                function updatePreview() {
                    updateTagPreview({
                        previewElement,
                        contrastRatioElement,
                        wcagAAElement,
                        wcagAAAElement
                    }, backgroundColorInput.value, textColorInput.value, tag?.tagName);
                }
                // Initialize preview with current values
                updatePreview();
                // Add event listeners for real-time updates
                backgroundColorInput.addEventListener('input', updatePreview);
                textColorInput.addEventListener('input', updatePreview);
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateTag);
            },
            onshown(_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document
                    .querySelector('#button--addTag')
                    ?.removeEventListener('click', editTag);
            }
        });
    }
    /**
     * Set up the tag preview and WCAG contrast ratio updates for the add tag modal
     */
    function setupTagModalPreview(modalElement) {
        const tagNameInput = modalElement.querySelector('#addTag--tagName');
        const backgroundColorInput = modalElement.querySelector('#addTag--tagBackgroundColor');
        const textColorInput = modalElement.querySelector('#addTag--tagTextColor');
        const previewElement = modalElement.querySelector('#addTag--preview');
        const contrastRatioElement = modalElement.querySelector('#addTag--contrastRatio');
        const wcagAAElement = modalElement.querySelector('#addTag--wcagAA');
        const wcagAAAElement = modalElement.querySelector('#addTag--wcagAAA');
        // Update preview when colors or name change
        function updatePreview() {
            updateTagPreview({
                previewElement,
                contrastRatioElement,
                wcagAAElement,
                wcagAAAElement
            }, backgroundColorInput.value, textColorInput.value, tagNameInput.value || 'Sample Tag');
        }
        // Initialize preview with default values
        updatePreview();
        // Add event listeners for real-time updates
        tagNameInput.addEventListener('input', updatePreview);
        backgroundColorInput.addEventListener('input', updatePreview);
        textColorInput.addEventListener('input', updatePreview);
    }
    function addTag() {
        let closeModalFunction;
        function doAddTag(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddTag`, addForm, (responseJSON) => {
                if (responseJSON.success) {
                    closeModalFunction();
                    exports.tags = responseJSON.tags;
                    currentFilteredTags = responseJSON.tags;
                    currentPage = 1;
                    renderTagsWithPagination(responseJSON.tags);
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
                        message: 'message' in responseJSON
                            ? responseJSON.message
                            : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminTags-add', {
            onshow(modalElement) {
                setupTagModalPreview(modalElement);
                modalElement.querySelector('form')?.addEventListener('submit', doAddTag);
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus the tag name input
                const tagNameInput = modalElement.querySelector('#addTag--tagName');
                tagNameInput.focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderTagsWithPagination(tags) {
        const totalItems = tags.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
        // Clear container
        tagsContainerElement.innerHTML = '';
        if (tags.length === 0) {
            tagsContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">
            No tags found.
          </p>
        </div>
      `;
            return;
        }
        // Create table
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-striped is-hoverable is-fullwidth';
        const thead = document.createElement('thead');
        thead.innerHTML = /* html */ `
      <tr>
        <th>Tag Name</th>
        <th style="width: 150px;">Background</th>
        <th style="width: 150px;">Text Color</th>
        <th style="width: 200px;">Preview</th>
        <th><span class="is-sr-only">Actions</span></th>
      </tr>
    `;
        tableElement.append(thead);
        const tbody = document.createElement('tbody');
        for (let index = startIndex; index < endIndex; index += 1) {
            const tag = tags[index];
            const tr = document.createElement('tr');
            tr.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(tag.tagName)}</td>
        <td>
          <span style="color: #${cityssm.escapeHTML(tag.tagBackgroundColor)};">
            #${cityssm.escapeHTML(tag.tagBackgroundColor)}
          </span>
        </td>
        <td>
          <span style="color: #${cityssm.escapeHTML(tag.tagTextColor)};">
            #${cityssm.escapeHTML(tag.tagTextColor)}
          </span>
        </td>
        <td>
          <span class="tag" style="background-color: #${cityssm.escapeHTML(tag.tagBackgroundColor)}; color: #${cityssm.escapeHTML(tag.tagTextColor)};">
            ${cityssm.escapeHTML(tag.tagName)}
          </span>
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button class="button is-info" data-tag-name="${cityssm.escapeHTML(tag.tagName)}" type="button">
              <span class="icon"><i class="fa-solid fa-pencil"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-danger" data-tag-name="${cityssm.escapeHTML(tag.tagName)}" type="button">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;
            tr.querySelector('.button.is-info')?.addEventListener('click', editTag);
            tr.querySelector('.button.is-danger')?.addEventListener('click', deleteTag);
            tbody.append(tr);
        }
        tableElement.append(tbody);
        tagsContainerElement.append(tableElement);
        // Add pagination if needed
        if (totalPages > 1) {
            const paginationElement = document.createElement('nav');
            paginationElement.className = 'pagination is-centered';
            paginationElement.setAttribute('role', 'navigation');
            paginationElement.setAttribute('aria-label', 'pagination');
            let paginationHTML = '<ul class="pagination-list">';
            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                paginationHTML += /* html */ `
          <li>
            <a class="pagination-link ${pageNumber === currentPage ? 'is-current' : ''}" 
              data-page="${pageNumber}" 
              aria-label="Page ${pageNumber}"
            >
              ${pageNumber}
            </a>
          </li>
        `;
            }
            paginationHTML += '</ul>';
            // eslint-disable-next-line no-unsanitized/property
            paginationElement.innerHTML = paginationHTML;
            for (const link of paginationElement.querySelectorAll('.pagination-link')) {
                link.addEventListener('click', (clickEvent) => {
                    const target = clickEvent.currentTarget;
                    const pageNumber = Number(target.dataset.page);
                    pageSelect(pageNumber);
                });
            }
            tagsContainerElement.append(paginationElement);
        }
    }
    function addTagFromWorkOrder(event) {
        event.preventDefault();
        let closeModalFunction = () => {
            // Initialized with no-op, will be assigned in onshown
        };
        function selectOrphanedTag(clickEvent) {
            const buttonElement = clickEvent.currentTarget;
            const tagName = buttonElement.dataset.tagName;
            if (tagName === undefined) {
                return;
            }
            closeModalFunction();
            // Open the add tag modal with the tag name pre-filled
            let closeAddModalFunction;
            cityssm.openHtmlModal('adminTags-add', {
                onshow(modalElement) {
                    // Set tag name and make it readonly
                    const tagNameInput = modalElement.querySelector('#addTag--tagName');
                    tagNameInput.value = tagName;
                    tagNameInput.readOnly = true;
                    // Set up preview and event listeners
                    setupTagModalPreview(modalElement);
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', (submitEvent) => {
                        submitEvent.preventDefault();
                        const addForm = submitEvent.currentTarget;
                        cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddTag`, addForm, (responseJSON) => {
                            if (responseJSON.success) {
                                closeAddModalFunction();
                                exports.tags = responseJSON.tags;
                                currentFilteredTags = responseJSON.tags;
                                currentPage = 1;
                                renderTagsWithPagination(responseJSON.tags);
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
                                    message: 'message' in responseJSON
                                        ? responseJSON.message
                                        : 'Please try again.'
                                });
                            }
                        });
                    });
                },
                onshown(_modalElement, closeFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeAddModalFunction = closeFunction;
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        cityssm.openHtmlModal('adminTags-addFromWorkOrder', {
            onshow(modalElement) {
                shiftLog.populateSectionAliases(modalElement);
                const containerElement = modalElement.querySelector('#container--orphanedTags');
                containerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">
              <span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span>
              Loading tags...
            </p>
          </div>
        `;
                cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doGetOrphanedTags`, {}, (responseJSON) => {
                    if (responseJSON.success) {
                        if (responseJSON.orphanedTags.length === 0) {
                            containerElement.innerHTML = /* html */ `
                  <div class="message is-success">
                    <p class="message-body">
                      <span class="icon"><i class="fa-solid fa-check"></i></span>
                      All work order tags have system records.
                    </p>
                  </div>
                `;
                        }
                        else {
                            const tableElement = document.createElement('table');
                            tableElement.className =
                                'table is-striped is-hoverable is-fullwidth';
                            tableElement.innerHTML = /* html */ `
                  <thead>
                    <tr>
                      <th>Tag Name</th>
                      <th class="has-text-right" style="width: 120px;">Usage Count</th>
                      <th style="width: 100px;"><span class="is-sr-only">Actions</span></th>
                    </tr>
                  </thead>
                `;
                            const tbody = document.createElement('tbody');
                            for (const orphanedTag of responseJSON.orphanedTags) {
                                const tr = document.createElement('tr');
                                tr.innerHTML = /* html */ `
                    <td>
                      <span class="tag is-light">
                        ${cityssm.escapeHTML(orphanedTag.tagName)}
                      </span>
                    </td>
                    <td class="has-text-right">
                      ${cityssm.escapeHTML(orphanedTag.usageCount.toString())}
                    </td>
                    <td class="has-text-right">
                      <button class="button is-success is-small" data-tag-name="${cityssm.escapeHTML(orphanedTag.tagName)}" type="button">
                        <span class="icon"><i class="fa-solid fa-plus"></i></span>
                        <span>Add</span>
                      </button>
                    </td>
                  `;
                                tr.querySelector('button')?.addEventListener('click', selectOrphanedTag);
                                tbody.append(tr);
                            }
                            tableElement.append(tbody);
                            containerElement.innerHTML = '';
                            containerElement.append(tableElement);
                        }
                    }
                    else {
                        containerElement.innerHTML = /* html */ `
                <div class="message is-danger">
                  <p class="message-body">
                    <span class="icon"><i class="fa-solid fa-exclamation-triangle"></i></span>
                    Failed to load orphaned tags.
                  </p>
                </div>
              `;
                    }
                });
            },
            onshown(_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    // Filter functionality
    const filterInput = document.querySelector('#filter--tags');
    filterInput.addEventListener('keyup', () => {
        const filterValue = filterInput.value.toLowerCase();
        currentFilteredTags = exports.tags.filter((tag) => tag.tagName.toLowerCase().includes(filterValue));
        currentPage = 1;
        renderTagsWithPagination(currentFilteredTags);
    });
    // Add tag button
    document.querySelector('#button--addTag')?.addEventListener('click', addTag);
    // Add tag from work order button
    document
        .querySelector('#button--addTagFromWorkOrder')
        ?.addEventListener('click', addTagFromWorkOrder);
    // Initial render
    renderTagsWithPagination(exports.tags);
})();
