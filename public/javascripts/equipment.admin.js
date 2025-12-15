(() => {
    const shiftLog = exports.shiftLog;
    const equipmentContainerElement = document.querySelector('#container--equipment');
    // Pagination settings
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let currentFilteredEquipment = exports.equipment;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        renderEquipmentWithPagination(currentFilteredEquipment);
    }
    function deleteEquipment(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const equipmentNumber = buttonElement.dataset.equipmentNumber;
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
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteEquipment`, {
                        equipmentNumber
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
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
        const buttonElement = clickEvent.currentTarget;
        const equipmentNumber = buttonElement.dataset.equipmentNumber;
        if (equipmentNumber === undefined) {
            return;
        }
        const equipment = exports.equipment.find((eq) => eq.equipmentNumber === equipmentNumber);
        if (equipment === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateEquipment(submitEvent) {
            submitEvent.preventDefault();
            const updateForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateEquipment`, updateForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
            onshow(modalElement) {
                ;
                modalElement.querySelector('[name="equipmentNumber"]').value = equipment.equipmentNumber;
                modalElement.querySelector('[name="recordSync_isSynced"]').checked = equipment.recordSync_isSynced;
                modalElement.querySelector('[name="equipmentName"]').value = equipment.equipmentName;
                modalElement.querySelector('[name="equipmentDescription"]').value = equipment.equipmentDescription;
                // Populate equipment types dropdown
                const equipmentTypeSelect = modalElement.querySelector('[name="equipmentTypeDataListItemId"]');
                for (const equipmentType of exports.equipmentTypes) {
                    const option = document.createElement('option');
                    option.value = equipmentType.dataListItemId.toString();
                    option.textContent = equipmentType.dataListItem;
                    equipmentTypeSelect.append(option);
                }
                equipmentTypeSelect.value =
                    equipment.equipmentTypeDataListItemId.toString();
                // Populate employee lists dropdown
                const employeeListSelect = modalElement.querySelector('[name="employeeListId"]');
                for (const employeeList of exports.employeeLists) {
                    const option = document.createElement('option');
                    option.value = employeeList.employeeListId.toString();
                    option.textContent = employeeList.employeeListName;
                    employeeListSelect.append(option);
                }
                employeeListSelect.value = equipment.employeeListId?.toString() ?? '';
                // Populate user groups dropdown
                const userGroupSelect = modalElement.querySelector('[name="userGroupId"]');
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
                userGroupSelect.value = equipment.userGroupId?.toString() ?? '';
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateEquipment);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderEquipment(equipmentList) {
        if (equipmentList.length === 0) {
            equipmentContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <div class="message-body">
            No equipment records available.
          </div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>
            <span class="is-sr-only">Sync Status</span>
          </th>
          <th>Equipment Number</th>
          <th>Equipment Name</th>
          <th>Description</th>
          <th>Type</th>
          <th>User Group</th>
          <th>
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tbodyElement = tableElement.querySelector('tbody');
        for (const equipment of equipmentList) {
            const rowElement = document.createElement('tr');
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = /*html*/ `
        <td>
          ${equipment.recordSync_isSynced
                ? /* html */ `
                <span class="is-size-7 has-text-grey" title="Synchronized">
                  <i class="fa-solid fa-arrows-rotate"></i>
                </span>
              `
                : ''}
        </td>
        <td>
          ${cityssm.escapeHTML(equipment.equipmentNumber)}
        </td>
        <td>${cityssm.escapeHTML(equipment.equipmentName)}</td>
        <td>${cityssm.escapeHTML(equipment.equipmentDescription)}</td>
        <td>${cityssm.escapeHTML(equipment.equipmentTypeDataListItem ?? '')}</td>
        <td>${cityssm.escapeHTML(equipment.userGroupName ?? '')}</td>
        <td class="has-text-right">
          <div class="buttons is-right">
            <button class="button is-small is-info edit-equipment" 
              data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}" 
              type="button"
            >
              <span class="icon is-small">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button class="button is-small is-danger delete-equipment" 
              data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}" 
              type="button"
            >
              <span class="icon is-small">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;
            tbodyElement.append(rowElement);
        }
        equipmentContainerElement.replaceChildren(tableElement);
        const editButtons = equipmentContainerElement.querySelectorAll('.edit-equipment');
        for (const button of editButtons) {
            button.addEventListener('click', editEquipment);
        }
        const deleteButtons = equipmentContainerElement.querySelectorAll('.delete-equipment');
        for (const button of deleteButtons) {
            button.addEventListener('click', deleteEquipment);
        }
    }
    /**
     * Render equipment with pagination
     */
    function renderEquipmentWithPagination(equipmentList) {
        // Calculate pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedEquipment = equipmentList.slice(startIndex, endIndex);
        // Render table
        renderEquipment(paginatedEquipment);
        // Add pagination controls if needed
        if (equipmentList.length > ITEMS_PER_PAGE) {
            const paginationControls = shiftLog.buildPaginationControls({
                totalCount: equipmentList.length,
                currentPageOrOffset: currentPage,
                itemsPerPageOrLimit: ITEMS_PER_PAGE,
                clickHandler: pageSelect
            });
            equipmentContainerElement.append(paginationControls);
        }
    }
    function addEquipment() {
        let closeModalFunction;
        function doAddEquipment(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddEquipment`, addForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
            onshow(modalElement) {
                ;
                modalElement.querySelector('[name="equipmentNumber"]').value = '';
                modalElement.querySelector('[name="equipmentName"]').value = '';
                modalElement.querySelector('[name="equipmentDescription"]').value = '';
                // Populate equipment types dropdown
                const equipmentTypeSelect = modalElement.querySelector('[name="equipmentTypeDataListItemId"]');
                for (const equipmentType of exports.equipmentTypes) {
                    const option = document.createElement('option');
                    option.value = equipmentType.dataListItemId.toString();
                    option.textContent = equipmentType.dataListItem;
                    equipmentTypeSelect.append(option);
                }
                // Populate employee lists dropdown
                const employeeListSelect = modalElement.querySelector('[name="employeeListId"]');
                for (const employeeList of exports.employeeLists) {
                    const option = document.createElement('option');
                    option.value = employeeList.employeeListId.toString();
                    option.textContent = employeeList.employeeListName;
                    employeeListSelect.append(option);
                }
                // Populate user groups dropdown
                const userGroupSelect = modalElement.querySelector('[name="userGroupId"]');
                for (const userGroup of exports.userGroups) {
                    const option = document.createElement('option');
                    option.value = userGroup.userGroupId.toString();
                    option.textContent = userGroup.userGroupName;
                    userGroupSelect.append(option);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddEquipment);
                modalElement.querySelector('[name="equipmentNumber"]').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    document
        .querySelector('#button--addEquipment')
        ?.addEventListener('click', addEquipment);
    renderEquipmentWithPagination(exports.equipment);
    /*
     * Filter equipment with debouncing
     */
    const filterInput = document.querySelector('#filter--equipment');
    let filterTimeout;
    if (filterInput !== null) {
        filterInput.addEventListener('input', () => {
            // Clear existing timeout
            if (filterTimeout !== undefined) {
                clearTimeout(filterTimeout);
            }
            // Set new timeout (debounce for 300ms)
            filterTimeout = setTimeout(() => {
                const filterText = filterInput.value.toLowerCase();
                if (filterText === '') {
                    currentFilteredEquipment = exports.equipment;
                    currentPage = 1;
                    renderEquipmentWithPagination(exports.equipment);
                }
                else {
                    const filteredEquipment = exports.equipment.filter((equipment) => {
                        const searchText = `${equipment.equipmentNumber} ${equipment.equipmentName} ${equipment.equipmentDescription} ${equipment.equipmentTypeDataListItem ?? ''}`.toLowerCase();
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
