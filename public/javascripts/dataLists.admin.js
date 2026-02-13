/* eslint-disable max-lines -- Large file */
/**
 * Updates the icon preview in a modal
 * @param modalElement - The modal element containing the inputs
 * @param modalPrefix - The prefix for the input IDs ('addDataListItem' or 'editDataListItem')
 */
function updateIconPreview(modalElement, modalPrefix) {
    const colorInput = modalElement.querySelector(`#${modalPrefix}--colorHex`);
    const iconInput = modalElement.querySelector(`#${modalPrefix}--iconClass`);
    const previewElement = modalElement.querySelector(`#${modalPrefix}--iconPreview`);
    if (colorInput === null ||
        iconInput === null ||
        previewElement === null) {
        return;
    }
    // Get color value (color input returns #RRGGBB format)
    const colorValue = colorInput.value;
    // Get icon class and validate
    const iconClassTrimmed = iconInput.value.trim();
    const iconClass = /^[\da-z\-]+$/v.test(iconClassTrimmed)
        ? iconClassTrimmed
        : 'circle';
    // Update preview - recreate the icon element since Font Awesome modifies it via JS
    const iconContainer = previewElement.querySelector('.icon');
    if (iconContainer === null) {
        return;
    }
    // Create new icon element
    const newIcon = document.createElement('i');
    newIcon.className = `fa-solid fa-${iconClass}`;
    iconContainer.replaceChildren(newIcon);
    // Set the color on the preview element
    previewElement.style.color = colorValue;
}
/**
 * Sets up color and icon change listeners for a modal
 * @param modalElement - The modal element containing the inputs
 * @param modalPrefix - The prefix for the input IDs ('addDataListItem' or 'editDataListItem')
 */
function setupIconPreviewListeners(modalElement, modalPrefix) {
    const colorInput = modalElement.querySelector(`#${modalPrefix}--colorHex`);
    const iconInput = modalElement.querySelector(`#${modalPrefix}--iconClass`);
    if (colorInput === null || iconInput === null) {
        return;
    }
    // Update preview when color changes
    colorInput.addEventListener('input', () => {
        updateIconPreview(modalElement, modalPrefix);
    });
    // Update preview when icon class changes
    iconInput.addEventListener('input', () => {
        updateIconPreview(modalElement, modalPrefix);
    });
    // Initial preview update
    updateIconPreview(modalElement, modalPrefix);
}
;
(() => {
    const shiftLog = exports.shiftLog;
    // Track Sortable instances to prevent duplicates
    const sortableInstances = new Map();
    function updateItemCount(dataListKey, count) {
        const countElement = document.querySelector(`#itemCount--${dataListKey}`);
        if (countElement !== null) {
            countElement.textContent = count.toString();
            countElement.classList.toggle('is-warning', count === 0);
        }
    }
    function renderDataListItems(dataListKey, items) {
        const tbodyElement = document.querySelector(`#dataListItems--${dataListKey}`);
        if (tbodyElement === null) {
            return;
        }
        // Update the item count tag
        updateItemCount(dataListKey, items.length);
        if (items.length === 0) {
            tbodyElement.innerHTML = /* html */ `
        <tr>
          <td class="has-text-centered has-text-grey" colspan="5">
            No items in this list. Click "Add Item" to create one.
          </td>
        </tr>
      `;
            return;
        }
        // Clear existing items
        tbodyElement.innerHTML = '';
        for (const item of items) {
            const userGroup = item.userGroupId
                ? exports.userGroups.find((ug) => ug.userGroupId === item.userGroupId)
                : null;
            const userGroupDisplay = userGroup
                ? `<span class="tag is-info">${cityssm.escapeHTML(userGroup.userGroupName)}</span>`
                : '<span class="has-text-grey-light">-</span>';
            // Sanitize colorHex (must be 6 hex digits)
            const colorHexTrimmed = (item.colorHex || '').trim();
            const colorHex = /^[\da-f]{6}$/iv.test(colorHexTrimmed)
                ? colorHexTrimmed
                : '000000';
            // Sanitize iconClass (only allow lowercase letters, hyphens, and numbers)
            const iconClassTrimmed = (item.iconClass || '').trim();
            const iconClass = /^[\da-z\-]+$/v.test(iconClassTrimmed)
                ? iconClassTrimmed
                : 'circle';
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.dataListItemId = item.dataListItemId.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ `
        <td class="has-text-centered">
          <span class="icon is-small has-text-grey handle" style="cursor: move;">
            <i class="fa-solid fa-grip-vertical"></i>
          </span>
        </td>
        <td class="has-text-centered">
          <span class="icon is-small" style="color: #${cityssm.escapeHTML(colorHex)};">
            <i class="fa-solid fa-${cityssm.escapeHTML(iconClass)}"></i>
          </span>
        </td>
        <td>
          <span class="item-text">
            ${cityssm.escapeHTML(item.dataListItem)}
          </span>
        </td>
        <td>
          ${userGroupDisplay}
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button
              class="button is-info button--editItem"
              data-data-list-key="${cityssm.escapeHTML(dataListKey)}"
              data-data-list-item-id="${item.dataListItemId}"
              data-data-list-item="${cityssm.escapeHTML(item.dataListItem)}"
              data-color-hex="${cityssm.escapeHTML(colorHex)}"
              data-icon-class="${cityssm.escapeHTML(iconClass)}"
              data-user-group-id="${item.userGroupId ?? ''}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button
              class="button is-danger button--deleteItem"
              data-data-list-key="${cityssm.escapeHTML(dataListKey)}"
              data-data-list-item-id="${item.dataListItemId}"
              data-data-list-item="${cityssm.escapeHTML(item.dataListItem)}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;
            tbodyElement.append(tableRowElement);
        }
        // Re-attach event listeners
        attachEventListeners(dataListKey);
        // Re-initialize sortable
        initializeSortable(dataListKey);
    }
    function renderAllDataLists(dataLists) {
        // Update the global dataLists
        exports.dataLists = dataLists;
        // Find the container that holds all the detail panels
        const messageBlock = document.querySelector('.message.is-info');
        if (messageBlock === null) {
            // Fallback to page reload if we can't find the container
            globalThis.location.reload();
            return;
        }
        // Get the parent that contains all the panels
        const panelsContainer = messageBlock.parentElement;
        if (panelsContainer === null) {
            globalThis.location.reload();
            return;
        }
        // Remove all existing panels
        const existingPanels = panelsContainer.querySelectorAll('details.panel');
        for (const panel of existingPanels) {
            panel.remove();
        }
        // Re-render all panels from scratch
        for (const dataList of dataLists) {
            const panelHtml = /* html */ `
        <details class="panel mb-5 collapsable-panel" data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}" data-is-system-list="${dataList.isSystemList}">
          <summary class="panel-heading is-clickable">
            <span class="icon-text">
              <span class="icon">
                <i class="fa-solid fa-chevron-right details-chevron"></i>
              </span>
              <span class="has-text-weight-semibold mr-2">
                ${cityssm.escapeHTML(dataList.dataListName)}
              </span>
              <span class="tag is-rounded ${dataList.items.length === 0 ? 'is-warning' : ''}" id="itemCount--${cityssm.escapeHTML(dataList.dataListKey)}">
                ${dataList.items.length}
              </span>
              ${dataList.isSystemList ? '' : '<span class="tag is-info is-light ml-2">Custom</span>'}
            </span>
          </summary>
          <div class="panel-block is-block">
            <div class="columns is-mobile">
              ${dataList.isSystemList
                ? ''
                : /* html */ `
                    <div class="column is-narrow">
                      <button
                        class="button is-info is-small button--renameDataList"
                        data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                        data-data-list-name="${cityssm.escapeHTML(dataList.dataListName)}"
                        type="button"
                      >
                        <span class="icon">
                          <i class="fa-solid fa-pencil"></i>
                        </span>
                        <span>Rename List</span>
                      </button>

                      <button
                        class="button is-danger is-small button--deleteDataList"
                        data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                        data-data-list-name="${cityssm.escapeHTML(dataList.dataListName)}"
                        type="button"
                      >
                        <span class="icon">
                          <i class="fa-solid fa-trash"></i>
                        </span>
                        <span>Delete List</span>
                      </button>
                    </div>
                  `}
              <div class="column">
                <div class="field has-addons is-justify-content-flex-end">
                  <div class="control">
                    <button
                      class="button is-success is-small button--addItem"
                      data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                      type="button"
                    >
                      <span class="icon">
                        <i class="fa-solid fa-plus"></i>
                      </span>
                      <span>Add Item</span>
                    </button>
                  </div>
                  <div class="control">
                    <div class="dropdown is-right">
                      <div class="dropdown-trigger">
                        <button
                          class="button is-success is-small"
                          type="button"
                          aria-haspopup="true"
                          aria-controls="dropdown-menu-${cityssm.escapeHTML(dataList.dataListKey)}"
                        >
                          <span class="icon is-small">
                            <i class="fa-solid fa-angle-down" aria-hidden="true"></i>
                          </span>
                        </button>
                      </div>
                      <div class="dropdown-menu" id="dropdown-menu-${cityssm.escapeHTML(dataList.dataListKey)}" role="menu">
                        <div class="dropdown-content">
                          <a
                            class="dropdown-item button--addMultipleItems"
                            data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                            href="#"
                          >
                            <span class="icon">
                              <i class="fa-solid fa-plus"></i>
                            </span>
                            <span>Add Multiple Items</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="panel-block p-0">
            <div class="table-container" style="width: 100%;">
              <table class="table is-striped is-hoverable is-fullwidth mb-0">
                <thead>
                  <tr>
                    <th class="has-text-centered" style="width: 60px;">Order</th>
                    <th class="has-text-centered" style="width: 60px;">Icon</th>
                    <th>Item</th>
                    <th style="width: 180px;">User Group</th>
                    <th>
                      <span class="is-sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="is-sortable" id="dataListItems--${cityssm.escapeHTML(dataList.dataListKey)}">
                </tbody>
              </table>
            </div>
          </div>
        </details>
      `;
            const tempDiv = document.createElement('div');
            // eslint-disable-next-line no-unsanitized/property
            tempDiv.innerHTML = panelHtml;
            const panelElement = tempDiv.firstElementChild;
            if (panelElement !== null) {
                panelsContainer.append(panelElement);
                // Render items for this list (use items variable which has the default)
                renderDataListItems(dataList.dataListKey, dataList.items);
                // Initialize sortable for this list
                initializeSortable(dataList.dataListKey);
            }
        }
        // Re-attach all event listeners
        bulmaJS.init(panelsContainer); // Re-initialize dropdowns for new content
        attachAllEventListeners();
    }
    function attachAllEventListeners() {
        // Add Data List button
        const addDataListButton = document.querySelector('.button--addDataList');
        if (addDataListButton !== null) {
            addDataListButton.addEventListener('click', addDataList);
        }
        // Rename Data List buttons
        const renameButtons = document.querySelectorAll('.button--renameDataList');
        for (const button of renameButtons) {
            button.addEventListener('click', renameDataList);
        }
        // Delete Data List buttons
        const deleteDataListButtons = document.querySelectorAll('.button--deleteDataList');
        for (const button of deleteDataListButtons) {
            button.addEventListener('click', deleteDataList);
        }
        // Add item buttons
        const addButtons = document.querySelectorAll('.button--addItem');
        for (const button of addButtons) {
            button.addEventListener('click', addDataListItem);
        }
        // Add multiple items buttons
        const addMultipleButtons = document.querySelectorAll('.button--addMultipleItems');
        for (const button of addMultipleButtons) {
            button.addEventListener('click', addMultipleDataListItems);
        }
        // Re-attach event listeners for each data list's items
        for (const dataList of exports.dataLists) {
            attachEventListeners(dataList.dataListKey);
        }
    }
    function addDataList(clickEvent) {
        clickEvent.preventDefault();
        let closeModalFunction;
        function doAddDataList(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            const formData = new FormData(addForm);
            const dataListKeySuffix = formData.get('dataListKey')?.trim();
            const dataListName = formData.get('dataListName')?.trim();
            if (dataListKeySuffix === '' || dataListName === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    message: 'Please fill in all required fields.',
                    title: 'Required Fields'
                });
                return;
            }
            // Prepend "user-" to the key
            const dataListKey = `user-${dataListKeySuffix}`;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddDataList`, {
                dataListKey,
                dataListName
            }, (responseJSON) => {
                if (responseJSON.success && responseJSON.dataLists !== undefined) {
                    closeModalFunction();
                    // Render the updated list
                    renderAllDataLists(responseJSON.dataLists);
                    const message = responseJSON.wasRecovered
                        ? 'The previously deleted data list has been recovered.'
                        : 'The data list has been successfully created.';
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: responseJSON.wasRecovered
                            ? 'Data List Recovered'
                            : 'Data List Created',
                        message
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Creating Data List',
                        message: responseJSON.errorMessage ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminDataLists-addDataList', {
            onshow(modalElement) {
                // Attach form submit handler
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddDataList);
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus the key input
                const keyInput = modalElement.querySelector('#addDataList--dataListKey');
                keyInput.focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renameDataList(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const dataListKey = buttonElement.dataset.dataListKey;
        const dataListName = buttonElement.dataset.dataListName;
        if (dataListKey === undefined || dataListName === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateDataList(submitEvent) {
            submitEvent.preventDefault();
            const editForm = submitEvent.currentTarget;
            const formData = new FormData(editForm);
            const newDataListName = formData.get('dataListName')?.trim();
            if (newDataListName === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    message: 'Please enter a display name.',
                    title: 'Name Required'
                });
                return;
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateDataList`, editForm, (responseJSON) => {
                if (responseJSON.success && responseJSON.dataLists !== undefined) {
                    closeModalFunction();
                    renderAllDataLists(responseJSON.dataLists);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Data List Renamed',
                        message: 'The data list has been successfully renamed.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Renaming Data List',
                        message: responseJSON.errorMessage ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminDataLists-editDataList', {
            onshow(modalElement) {
                // Set the data list key
                const dataListKeyInput = modalElement.querySelector('#editDataList--dataListKey');
                dataListKeyInput.value = dataListKey;
                // Set the data list name
                const dataListNameInput = modalElement.querySelector('#editDataList--dataListName');
                dataListNameInput.value = dataListName;
                // Attach form submit handler
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateDataList);
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus and select the input
                const nameInput = modalElement.querySelector('#editDataList--dataListName');
                nameInput.focus();
                nameInput.select();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteDataList(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const dataListKey = buttonElement.dataset.dataListKey;
        const dataListName = buttonElement.dataset.dataListName;
        if (dataListKey === undefined || dataListName === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Data List',
            message: `Are you sure you want to delete "${dataListName}"? This will also delete all items in this list. This action cannot be undone.`,
            okButton: {
                text: 'Delete Data List',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteDataList`, {
                        dataListKey
                    }, (responseJSON) => {
                        if (responseJSON.success &&
                            responseJSON.dataLists !== undefined) {
                            // Render the updated list
                            renderAllDataLists(responseJSON.dataLists);
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Data List Deleted',
                                message: 'The data list has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Data List',
                                message: responseJSON.errorMessage ?? 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function addDataListItem(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const dataListKey = buttonElement.dataset.dataListKey;
        if (dataListKey === undefined) {
            return;
        }
        const dataList = exports.dataLists.find((dl) => dl.dataListKey === dataListKey);
        if (dataList === undefined) {
            return;
        }
        let closeModalFunction;
        function doAddDataListItem(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            const formData = new FormData(addForm);
            const dataListItemToAdd = formData.get('dataListItem')?.trim();
            if (dataListItemToAdd === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    title: 'Item Name Required',
                    message: 'Please enter an item name.'
                });
                return;
            }
            // Convert color from #RRGGBB format to RRGGBB format
            const colorHexValue = formData.get('colorHex');
            if (colorHexValue?.startsWith('#')) {
                formData.set('colorHex', colorHexValue.slice(1));
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddDataListItem`, addForm, (responseJSON) => {
                if (responseJSON.success && responseJSON.items !== undefined) {
                    closeModalFunction();
                    // Open the details panel if it's closed
                    const detailsElement = document.querySelector(`details[data-data-list-key="${dataListKey}"]`);
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
            onshow(modalElement) {
                // Set the modal title
                const titleElement = modalElement.querySelector('#addDataListItem--title');
                titleElement.textContent = `Add "${dataList.dataListName}" Item`;
                // Set the data list key
                const dataListKeyInput = modalElement.querySelector('#addDataListItem--dataListKey');
                dataListKeyInput.value = dataListKey;
                // Populate user group options
                const userGroupSelect = modalElement.querySelector('#addDataListItem--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                // Attach form submit handler
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddDataListItem);
                // Setup icon preview listeners
                setupIconPreviewListeners(modalElement, 'addDataListItem');
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus the item name input
                const itemInput = modalElement.querySelector('#addDataListItem--dataListItem');
                itemInput.focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addMultipleDataListItems(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const dataListKey = buttonElement.dataset.dataListKey;
        if (dataListKey === undefined) {
            return;
        }
        const dataList = exports.dataLists.find((dl) => dl.dataListKey === dataListKey);
        if (dataList === undefined) {
            return;
        }
        let closeModalFunction;
        function doAddMultipleDataListItems(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            const formData = new FormData(addForm);
            const dataListItemsToAdd = formData.get('dataListItems')?.trim();
            if (dataListItemsToAdd === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    message: 'Please enter at least one item name.',
                    title: 'Items Required'
                });
                return;
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddMultipleDataListItems`, addForm, (responseJSON) => {
                if (responseJSON.success && responseJSON.items !== undefined) {
                    closeModalFunction();
                    // Open the details panel if it's closed
                    const detailsElement = document.querySelector(`details[data-data-list-key="${dataListKey}"]`);
                    if (detailsElement !== null && !detailsElement.open) {
                        detailsElement.open = true;
                    }
                    renderDataListItems(dataListKey, responseJSON.items);
                    const addedCount = responseJSON.addedCount ?? 0;
                    const skippedCount = responseJSON.skippedCount ?? 0;
                    let message = '';
                    if (addedCount > 0) {
                        message += `${addedCount} item${addedCount === 1 ? '' : 's'} successfully added.`;
                    }
                    if (skippedCount > 0) {
                        if (message !== '') {
                            message += '<br>';
                        }
                        message += `${skippedCount} item${skippedCount === 1 ? '' : 's'} skipped (already exists).`;
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Items Added',
                        message,
                        messageIsHtml: true
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Items',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminDataLists-addMultipleItems', {
            onshow(modalElement) {
                // Set the modal title
                const titleElement = modalElement.querySelector('#addMultipleDataListItems--title');
                titleElement.textContent = `Add Multiple ${dataList.dataListName} Items`;
                // Set the data list key
                const dataListKeyInput = modalElement.querySelector('#addMultipleDataListItems--dataListKey');
                dataListKeyInput.value = dataListKey;
                // Populate user group options
                const userGroupSelect = modalElement.querySelector('#addMultipleDataListItems--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                // Attach form submit handler
                modalElement
                    .querySelector('#form--addMultipleDataListItems')
                    ?.addEventListener('submit', doAddMultipleDataListItems);
                // Focus the textarea
                const textareaInput = modalElement.querySelector('#addMultipleDataListItems--dataListItems');
                textareaInput.focus();
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
    function editDataListItem(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const dataListKey = buttonElement.dataset.dataListKey;
        const dataListItemId = buttonElement.dataset.dataListItemId;
        const dataListItem = buttonElement.dataset.dataListItem;
        const colorHex = buttonElement.dataset.colorHex;
        const iconClass = buttonElement.dataset.iconClass;
        const userGroupId = buttonElement.dataset.userGroupId;
        if (dataListKey === undefined ||
            dataListItemId === undefined ||
            dataListItem === undefined) {
            return;
        }
        const dataList = exports.dataLists.find((dl) => dl.dataListKey === dataListKey);
        if (dataList === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateDataListItem(submitEvent) {
            submitEvent.preventDefault();
            const editForm = submitEvent.currentTarget;
            const formData = new FormData(editForm);
            const dataListItem = formData.get('dataListItem')?.trim();
            if (dataListItem === '') {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    title: 'Item Name Required',
                    message: 'Please enter an item name.'
                });
                return;
            }
            // Convert color from #RRGGBB format to RRGGBB format
            const colorHexValue = formData.get('colorHex');
            if (colorHexValue?.startsWith('#')) {
                formData.set('colorHex', colorHexValue.slice(1));
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateDataListItem`, editForm, (responseJSON) => {
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
            onshow(modalElement) {
                // Set the modal title
                const titleElement = modalElement.querySelector('#editDataListItem--title');
                titleElement.textContent = `Edit "${dataList.dataListName}" Item`;
                // Set the hidden fields
                const dataListKeyInput = modalElement.querySelector('#editDataListItem--dataListKey');
                dataListKeyInput.value = dataListKey;
                const dataListItemIdInput = modalElement.querySelector('#editDataListItem--dataListItemId');
                dataListItemIdInput.value = dataListItemId;
                // Set the item name
                const dataListItemInput = modalElement.querySelector('#editDataListItem--dataListItem');
                dataListItemInput.value = dataListItem;
                // Set the colorHex (convert from RRGGBB format to #RRGGBB format for color input)
                const colorHexInput = modalElement.querySelector('#editDataListItem--colorHex');
                const colorHexValue = colorHex ?? '000000';
                colorHexInput.value = colorHexValue.startsWith('#')
                    ? colorHexValue
                    : `#${colorHexValue}`;
                // Set the iconClass
                const iconClassInput = modalElement.querySelector('#editDataListItem--iconClass');
                iconClassInput.value = iconClass ?? 'circle';
                // Populate user group options
                const userGroupSelect = modalElement.querySelector('#editDataListItem--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    if (userGroupId &&
                        Number.parseInt(userGroupId, 10) === userGroup.userGroupId) {
                        option.selected = true;
                    }
                    userGroupSelect.append(option);
                }
                // Attach form submit handler
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateDataListItem);
                // Setup icon preview listeners
                setupIconPreviewListeners(modalElement, 'editDataListItem');
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                // Focus and select the input
                const itemInput = modalElement.querySelector('#editDataListItem--dataListItem');
                itemInput.focus();
                itemInput.select();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteDataListItem(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const dataListKey = buttonElement.dataset.dataListKey;
        const dataListItemId = buttonElement.dataset.dataListItemId;
        const dataListItem = buttonElement.dataset.dataListItem;
        if (dataListKey === undefined ||
            dataListItemId === undefined ||
            dataListItem === undefined) {
            return;
        }
        const dataList = exports.dataLists.find((dl) => dl.dataListKey === dataListKey);
        if (dataList === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: `Delete "${dataList.dataListName}" Item`,
            message: `Are you sure you want to delete "${dataListItem}"? This action cannot be undone.`,
            okButton: {
                text: 'Delete Item',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteDataListItem`, {
                        dataListItemId: Number.parseInt(dataListItemId, 10),
                        dataListKey
                    }, (responseJSON) => {
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
        const section = document.querySelector(`[data-data-list-key="${dataListKey}"]`);
        if (section === null) {
            return;
        }
        // Edit buttons
        const editButtons = section.querySelectorAll('.button--editItem');
        for (const button of editButtons) {
            button.addEventListener('click', editDataListItem);
        }
        // Delete buttons
        const deleteButtons = section.querySelectorAll('.button--deleteItem');
        for (const button of deleteButtons) {
            button.addEventListener('click', deleteDataListItem);
        }
    }
    function initializeSortable(dataListKey) {
        const tbodyElement = document.querySelector(`#dataListItems--${dataListKey}`);
        if (tbodyElement === null) {
            return;
        }
        // Check if the tbody has any sortable items (rows with data-data-list-item-id)
        const hasItems = tbodyElement.querySelectorAll('tr[data-data-list-item-id]').length > 0;
        if (!hasItems) {
            // Destroy existing instance if no items
            const existingInstance = sortableInstances.get(dataListKey);
            if (existingInstance !== undefined) {
                existingInstance.destroy();
                sortableInstances.delete(dataListKey);
            }
            return;
        }
        // Destroy existing Sortable instance before creating a new one
        const existingInstance = sortableInstances.get(dataListKey);
        if (existingInstance !== undefined) {
            existingInstance.destroy();
        }
        // Create new Sortable instance
        const sortableInstance = Sortable.create(tbodyElement, {
            animation: 150,
            handle: '.handle',
            onEnd() {
                // Get the new order
                const rows = tbodyElement.querySelectorAll('tr[data-data-list-item-id]');
                const dataListItemIds = [];
                for (const row of rows) {
                    const dataListItemId = row.dataset.dataListItemId;
                    if (dataListItemId !== undefined) {
                        dataListItemIds.push(Number.parseInt(dataListItemId, 10));
                    }
                }
                // Send to server
                cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doReorderDataListItems`, {
                    dataListItemIds,
                    dataListKey
                }, (responseJSON) => {
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
    renderAllDataLists(exports.dataLists);
})();
