(() => {
    const shiftLog = exports.shiftLog;
    const equipmentContainerElement = document.querySelector('#container--equipment');
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
                                renderEquipment(responseJSON.equipment);
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
                        renderEquipment(responseJSON.equipment);
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
                equipmentTypeSelect.innerHTML =
                    '<option value="">Select Equipment Type</option>';
                for (const equipmentType of exports.equipmentTypes) {
                    const option = document.createElement('option');
                    option.value = equipmentType.dataListItemId.toString();
                    option.textContent = equipmentType.dataListItem;
                    equipmentTypeSelect.append(option);
                }
                equipmentTypeSelect.value =
                    equipment.equipmentTypeDataListItemId.toString();
                // Populate user groups dropdown
                const userGroupSelect = modalElement.querySelector('[name="userGroupId"]');
                userGroupSelect.innerHTML = '<option value="">No User Group</option>';
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
        let tableHtml = /*html*/ `
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Equipment Number</th>
            <th>Equipment Name</th>
            <th>Description</th>
            <th>Type</th>
            <th>User Group</th>
            <th class="has-text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
        for (const equipment of equipmentList) {
            const equipmentType = exports.equipmentTypes.find((type) => type.dataListItemId === equipment.equipmentTypeDataListItemId);
            tableHtml += /*html*/ `
        <tr>
          <td>${cityssm.escapeHTML(equipment.equipmentNumber)}</td>
          <td>${cityssm.escapeHTML(equipment.equipmentName)}</td>
          <td>${cityssm.escapeHTML(equipment.equipmentDescription)}</td>
          <td>${cityssm.escapeHTML(equipmentType?.dataListItem ?? '')}</td>
          <td>${cityssm.escapeHTML(equipment.userGroupName ?? '')}</td>
          <td class="has-text-right">
            <div class="buttons is-right">
              <button class="button is-small is-info edit-equipment" 
                      data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}" 
                      type="button">
                <span class="icon is-small">
                  <i class="fa-solid fa-edit"></i>
                </span>
                <span>Edit</span>
              </button>
              <button class="button is-small is-danger delete-equipment" 
                      data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}" 
                      type="button">
                <span class="icon is-small">
                  <i class="fa-solid fa-trash"></i>
                </span>
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
        }
        tableHtml += /*html*/ `
        </tbody>
      </table>
    `;
        // eslint-disable-next-line no-unsanitized/property
        equipmentContainerElement.innerHTML = tableHtml;
        const editButtons = equipmentContainerElement.querySelectorAll('.edit-equipment');
        for (const button of [...editButtons]) {
            button.addEventListener('click', editEquipment);
        }
        const deleteButtons = equipmentContainerElement.querySelectorAll('.delete-equipment');
        for (const button of [...deleteButtons]) {
            button.addEventListener('click', deleteEquipment);
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
                        renderEquipment(responseJSON.equipment);
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
                equipmentTypeSelect.innerHTML =
                    '<option value="">Select Equipment Type</option>';
                for (const equipmentType of exports.equipmentTypes) {
                    const option = document.createElement('option');
                    option.value = equipmentType.dataListItemId.toString();
                    option.textContent = equipmentType.dataListItem;
                    equipmentTypeSelect.append(option);
                }
                // Populate user groups dropdown
                const userGroupSelect = modalElement.querySelector('[name="userGroupId"]');
                userGroupSelect.innerHTML = '<option value="">No User Group</option>';
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
    renderEquipment(exports.equipment);
})();
