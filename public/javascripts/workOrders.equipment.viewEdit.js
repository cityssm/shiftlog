(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    const equipmentContainerElement = document.querySelector('#container--equipment');
    if (equipmentContainerElement !== null) {
        let availableEquipment = [];
        function renderEquipment(workOrderEquipment) {
            const equipmentCountElement = document.querySelector('#equipmentCount');
            if (equipmentCountElement !== null) {
                equipmentCountElement.textContent = workOrderEquipment.length.toString();
            }
            if (workOrderEquipment.length === 0) {
                equipmentContainerElement.innerHTML = `
          <div class="message is-info">
            <p class="message-body">No equipment has been added yet.</p>
          </div>
        `;
                return;
            }
            const tableElement = document.createElement('table');
            tableElement.className = 'table is-fullwidth is-striped is-hoverable';
            tableElement.innerHTML = `
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Note</th>
            <th class="is-hidden-touch">Added By</th>
            <th class="is-hidden-touch">Added On</th>
            ${exports.isEdit ? '<th class="is-hidden-print" style="width: 120px;"></th>' : ''}
          </tr>
        </thead>
        <tbody></tbody>
      `;
            const tableBodyElement = tableElement.querySelector('tbody');
            for (const equipment of workOrderEquipment) {
                const tableRowElement = document.createElement('tr');
                tableRowElement.innerHTML = `
          <td>
            ${cityssm.escapeHTML(equipment.equipmentName ?? '')}
            <div class="is-size-7 has-text-grey">
              ${cityssm.escapeHTML(equipment.equipmentNumber)}
            </div>
          </td>
          <td>${cityssm.escapeHTML(equipment.workOrderEquipmentNote)}</td>
          <td class="is-hidden-touch">${cityssm.escapeHTML(equipment.recordCreate_userName ?? '')}</td>
          <td class="is-hidden-touch">${cityssm.dateToString(new Date(equipment.recordCreate_dateTime ?? ''))}</td>
          ${exports.isEdit
                    ? `
                <td class="is-hidden-print">
                  <div class="buttons are-small is-justify-content-end">
                    <button
                      class="button edit-equipment-note"
                      data-equipment-number="${equipment.equipmentNumber}"
                      type="button"
                      title="Edit Note"
                    >
                      <span class="icon"><i class="fa-solid fa-edit"></i></span>
                    </button>
                    <button
                      class="button is-danger is-light delete-equipment"
                      data-equipment-number="${equipment.equipmentNumber}"
                      type="button"
                      title="Delete"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              `
                    : ''}
        `;
                if (exports.isEdit) {
                    const editButton = tableRowElement.querySelector('.edit-equipment-note');
                    editButton.addEventListener('click', () => {
                        showEditEquipmentNoteModal(equipment);
                    });
                    const deleteButton = tableRowElement.querySelector('.delete-equipment');
                    deleteButton.addEventListener('click', () => {
                        deleteEquipment(equipment.equipmentNumber);
                    });
                }
                tableBodyElement.append(tableRowElement);
            }
            equipmentContainerElement.replaceChildren(tableElement);
        }
        function loadEquipment() {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderEquipment`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                availableEquipment = responseJSON.availableEquipment;
                renderEquipment(responseJSON.workOrderEquipment);
            });
        }
        function showAddEquipmentModal(clickEvent) {
            clickEvent?.preventDefault();
            let closeModalFunction;
            function doAddEquipment(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderEquipment`, formElement, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        closeModalFunction();
                        formElement.reset();
                        loadEquipment();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: responseJSON.errorMessage,
                            title: 'Error Adding Equipment'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addEquipment', {
                onshow(modalElement) {
                    exports.shiftLog.setUnsavedChanges('modal');
                    modalElement.querySelector('#addWorkOrderEquipment--workOrderId').value = workOrderId;
                    const equipmentSelectElement = modalElement.querySelector('#addWorkOrderEquipment--equipmentNumber');
                    equipmentSelectElement.innerHTML = '<option value="">(Select Equipment)</option>';
                    for (const equipment of availableEquipment) {
                        equipmentSelectElement.append(new Option(`${equipment.equipmentName} (${equipment.equipmentNumber})`, equipment.equipmentNumber));
                    }
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddEquipment);
                    modalElement.querySelector('#addWorkOrderEquipment--equipmentNumber').focus();
                },
                onremoved() {
                    exports.shiftLog.clearUnsavedChanges('modal');
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function showEditEquipmentNoteModal(equipment) {
            let closeModalFunction;
            function doUpdateEquipmentNote(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderEquipmentNote`, formElement, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadEquipment();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: responseJSON.errorMessage,
                            title: 'Error Updating Note'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-editEquipmentNote', {
                onshow(modalElement) {
                    exports.shiftLog.setUnsavedChanges('modal');
                    modalElement.querySelector('#editWorkOrderEquipmentNote--workOrderId').value = workOrderId;
                    modalElement.querySelector('#editWorkOrderEquipmentNote--equipmentNumber').value = equipment.equipmentNumber;
                    modalElement.querySelector('#editWorkOrderEquipmentNote--workOrderEquipmentNote').value = equipment.workOrderEquipmentNote;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doUpdateEquipmentNote);
                    modalElement.querySelector('#editWorkOrderEquipmentNote--workOrderEquipmentNote').focus();
                },
                onremoved() {
                    exports.shiftLog.clearUnsavedChanges('modal');
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteEquipment(equipmentNumber) {
            bulmaJS.confirm({
                contextualColorName: 'danger',
                message: 'Are you sure you want to remove this equipment?',
                okButton: {
                    text: 'Delete',
                    callbackFunction() {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderEquipment`, {
                            equipmentNumber,
                            workOrderId: Number.parseInt(workOrderId, 10)
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            if (responseJSON.success) {
                                loadEquipment();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: responseJSON.errorMessage,
                                    title: 'Error Deleting Equipment'
                                });
                            }
                        });
                    }
                },
                title: 'Delete Equipment'
            });
        }
        document
            .querySelector('#button--addEquipment')
            ?.addEventListener('click', showAddEquipmentModal);
        loadEquipment();
    }
})();
