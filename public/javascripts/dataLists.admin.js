let availableIcons = null;
let iconsFetching = false;
async function populateIconDatalist() {
    if (availableIcons === null && !iconsFetching) {
        iconsFetching = true;
        try {
            const { getIconListByStyle } = await import('@cityssm/fontawesome-free-lists');
            availableIcons = await getIconListByStyle('solid', '7.2.0');
        }
        catch {
            availableIcons = [];
        }
        finally {
            iconsFetching = false;
        }
    }
    const datalist = document.querySelector('#iconClass-datalist');
    if (datalist !== null && availableIcons.length > 0) {
        datalist.innerHTML = '';
        for (const icon of availableIcons) {
            const option = document.createElement('option');
            option.value = icon;
            datalist.append(option);
        }
    }
}
function updateIconPreview(modalElement, modalPrefix) {
    const colorInput = modalElement.querySelector(`#${modalPrefix}--colorHex`);
    const iconInput = modalElement.querySelector(`#${modalPrefix}--iconClass`);
    const previewElement = modalElement.querySelector(`#${modalPrefix}--iconPreview`);
    if (colorInput !== null &&
        iconInput !== null &&
        previewElement !== null) {
        const colorValue = colorInput.value;
        const iconClassTrimmed = iconInput.value.trim();
        const iconClass = /^[\da-z\-]+$/v.test(iconClassTrimmed)
            ? iconClassTrimmed
            : 'circle';
        const iconElement = previewElement.querySelector('i');
        if (iconElement !== null) {
            iconElement.className = `fa-solid fa-${iconClass}`;
            previewElement.style.color = colorValue;
        }
    }
}
function setupIconPreviewListeners(modalElement, modalPrefix) {
    const colorInput = modalElement.querySelector(`#${modalPrefix}--colorHex`);
    const iconInput = modalElement.querySelector(`#${modalPrefix}--iconClass`);
    if (colorInput !== null && iconInput !== null) {
        colorInput.addEventListener('input', () => {
            updateIconPreview(modalElement, modalPrefix);
        });
        iconInput.addEventListener('input', () => {
            updateIconPreview(modalElement, modalPrefix);
        });
        updateIconPreview(modalElement, modalPrefix);
    }
}
;
(() => {
    const shiftLog = exports.shiftLog;
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
        updateItemCount(dataListKey, items.length);
        if (items.length === 0) {
            tbodyElement.innerHTML = `
        <tr>
          <td class="has-text-centered has-text-grey" colspan="5">
            No items in this list. Click "Add Item" to create one.
          </td>
        </tr>
      `;
            return;
        }
        tbodyElement.innerHTML = '';
        for (const item of items) {
            const userGroup = item.userGroupId
                ? exports.userGroups.find((ug) => ug.userGroupId === item.userGroupId)
                : null;
            const userGroupDisplay = userGroup
                ? `<span class="tag is-info">${cityssm.escapeHTML(userGroup.userGroupName)}</span>`
                : '<span class="has-text-grey-light">-</span>';
            const colorHexTrimmed = (item.colorHex || '').trim();
            const colorHex = /^[\da-f]{6}$/iv.test(colorHexTrimmed)
                ? colorHexTrimmed
                : '000000';
            const iconClassTrimmed = (item.iconClass || '').trim();
            const iconClass = /^[\da-z\-]+$/v.test(iconClassTrimmed)
                ? iconClassTrimmed
                : 'circle';
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.dataListItemId = item.dataListItemId.toString();
            tableRowElement.innerHTML = `
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
        attachEventListeners(dataListKey);
        initializeSortable(dataListKey);
    }
    function renderAllDataLists(dataLists) {
        exports.dataLists = dataLists;
        const messageBlock = document.querySelector('.message.is-info');
        if (messageBlock === null) {
            globalThis.location.reload();
            return;
        }
        const panelsContainer = messageBlock.parentElement;
        if (panelsContainer === null) {
            globalThis.location.reload();
            return;
        }
        const existingPanels = panelsContainer.querySelectorAll('details.panel');
        for (const panel of existingPanels) {
            panel.remove();
        }
        for (const dataList of dataLists) {
            const panelHtml = `
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
                : `
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
            tempDiv.innerHTML = panelHtml;
            const panelElement = tempDiv.firstElementChild;
            if (panelElement !== null) {
                panelsContainer.append(panelElement);
                renderDataListItems(dataList.dataListKey, dataList.items);
                initializeSortable(dataList.dataListKey);
            }
        }
        bulmaJS.init(panelsContainer);
        attachAllEventListeners();
    }
    function attachAllEventListeners() {
        const addDataListButton = document.querySelector('.button--addDataList');
        if (addDataListButton !== null) {
            addDataListButton.addEventListener('click', addDataList);
        }
        const renameButtons = document.querySelectorAll('.button--renameDataList');
        for (const button of renameButtons) {
            button.addEventListener('click', renameDataList);
        }
        const deleteDataListButtons = document.querySelectorAll('.button--deleteDataList');
        for (const button of deleteDataListButtons) {
            button.addEventListener('click', deleteDataList);
        }
        const addButtons = document.querySelectorAll('.button--addItem');
        for (const button of addButtons) {
            button.addEventListener('click', addDataListItem);
        }
        const addMultipleButtons = document.querySelectorAll('.button--addMultipleItems');
        for (const button of addMultipleButtons) {
            button.addEventListener('click', addMultipleDataListItems);
        }
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
                    title: 'Required Fields',
                    message: 'Please fill in all required fields.'
                });
                return;
            }
            const dataListKey = `user-${dataListKeySuffix}`;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddDataList`, {
                dataListKey,
                dataListName
            }, (responseJSON) => {
                if (responseJSON.success && responseJSON.dataLists !== undefined) {
                    closeModalFunction();
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
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddDataList);
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
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
                    title: 'Name Required',
                    message: 'Please enter a display name.'
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
                const dataListKeyInput = modalElement.querySelector('#editDataList--dataListKey');
                dataListKeyInput.value = dataListKey;
                const dataListNameInput = modalElement.querySelector('#editDataList--dataListName');
                dataListNameInput.value = dataListName;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateDataList);
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
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
            const colorHexValue = formData.get('colorHex');
            if (colorHexValue?.startsWith('#') === true) {
                formData.set('colorHex', colorHexValue.slice(1));
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddDataListItem`, addForm, (responseJSON) => {
                if (responseJSON.success && responseJSON.items !== undefined) {
                    closeModalFunction();
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
                const titleElement = modalElement.querySelector('#addDataListItem--title');
                titleElement.textContent = `Add "${dataList.dataListName}" Item`;
                const dataListKeyInput = modalElement.querySelector('#addDataListItem--dataListKey');
                dataListKeyInput.value = dataListKey;
                populateIconDatalist().catch(() => {
                });
                const userGroupSelect = modalElement.querySelector('#addDataListItem--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddDataListItem);
                setupIconPreviewListeners(modalElement, 'addDataListItem');
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
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
                    title: 'Items Required',
                    message: 'Please enter at least one item name.'
                });
                return;
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddMultipleDataListItems`, addForm, (responseJSON) => {
                if (responseJSON.success && responseJSON.items !== undefined) {
                    closeModalFunction();
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
                const titleElement = modalElement.querySelector('#addMultipleDataListItems--title');
                titleElement.textContent = `Add Multiple ${dataList.dataListName} Items`;
                const dataListKeyInput = modalElement.querySelector('#addMultipleDataListItems--dataListKey');
                dataListKeyInput.value = dataListKey;
                const userGroupSelect = modalElement.querySelector('#addMultipleDataListItems--userGroupId');
                userGroupSelect.innerHTML =
                    '<option value="">None (Available to All)</option>';
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                modalElement
                    .querySelector('#form--addMultipleDataListItems')
                    ?.addEventListener('submit', doAddMultipleDataListItems);
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
            const colorHexValue = formData.get('colorHex');
            if (colorHexValue?.startsWith('#') === true) {
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
                const titleElement = modalElement.querySelector('#editDataListItem--title');
                titleElement.textContent = `Edit "${dataList.dataListName}" Item`;
                const dataListKeyInput = modalElement.querySelector('#editDataListItem--dataListKey');
                dataListKeyInput.value = dataListKey;
                const dataListItemIdInput = modalElement.querySelector('#editDataListItem--dataListItemId');
                dataListItemIdInput.value = dataListItemId;
                const dataListItemInput = modalElement.querySelector('#editDataListItem--dataListItem');
                dataListItemInput.value = dataListItem;
                const colorHexInput = modalElement.querySelector('#editDataListItem--colorHex');
                const colorHexValue = colorHex ?? '000000';
                colorHexInput.value = colorHexValue.startsWith('#')
                    ? colorHexValue
                    : `#${colorHexValue}`;
                const iconClassInput = modalElement.querySelector('#editDataListItem--iconClass');
                iconClassInput.value = iconClass ?? 'circle';
                populateIconDatalist().catch(() => {
                });
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
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateDataListItem);
                setupIconPreviewListeners(modalElement, 'editDataListItem');
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
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
                        dataListKey,
                        dataListItemId: Number.parseInt(dataListItemId, 10)
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
        const editButtons = section.querySelectorAll('.button--editItem');
        for (const button of editButtons) {
            button.addEventListener('click', editDataListItem);
        }
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
        const hasItems = tbodyElement.querySelectorAll('tr[data-data-list-item-id]').length > 0;
        if (!hasItems) {
            const existingInstance = sortableInstances.get(dataListKey);
            if (existingInstance !== undefined) {
                existingInstance.destroy();
                sortableInstances.delete(dataListKey);
            }
            return;
        }
        const existingInstance = sortableInstances.get(dataListKey);
        if (existingInstance !== undefined) {
            existingInstance.destroy();
        }
        const sortableInstance = Sortable.create(tbodyElement, {
            handle: '.handle',
            animation: 150,
            onEnd() {
                const rows = tbodyElement.querySelectorAll('tr[data-data-list-item-id]');
                const dataListItemIds = [];
                for (const row of rows) {
                    const dataListItemId = row.dataset.dataListItemId;
                    if (dataListItemId !== undefined) {
                        dataListItemIds.push(Number.parseInt(dataListItemId, 10));
                    }
                }
                cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doReorderDataListItems`, {
                    dataListKey,
                    dataListItemIds
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
        sortableInstances.set(dataListKey, sortableInstance);
    }
    renderAllDataLists(exports.dataLists);
})();
