// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.shiftsRouter;
    const shiftIdElement = document.querySelector('#shift--shiftId');
    const shiftId = shiftIdElement.value;
    const isEdit = document.querySelector('#button--addCrew') !== null;
    let shiftCrews = [];
    let shiftEmployees = [];
    let shiftEquipment = [];
    let availableCrews = [];
    let availableEmployees = [];
    let availableEquipment = [];
    function renderShiftCrews() {
        const containerElement = document.querySelector('#container--shiftCrews');
        if (shiftCrews.length === 0) {
            containerElement.innerHTML = `<div class="message"><div class="message-body">No crews assigned to this shift.</div></div>`;
            return;
        }
        let html = '<table class="table is-fullwidth is-striped is-hoverable">';
        html += '<thead><tr><th>Crew</th><th>Note</th>';
        if (isEdit) {
            html += '<th class="has-text-right">Actions</th>';
        }
        html += '</tr></thead><tbody>';
        for (const crew of shiftCrews) {
            html += '<tr>';
            html += `<td>${cityssm.escapeHTML(crew.crewName ?? '')}</td>`;
            html += `<td><span class="crew-note" data-crew-id="${crew.crewId}">${cityssm.escapeHTML(crew.shiftCrewNote)}</span></td>`;
            if (isEdit) {
                html += '<td class="has-text-right">';
                html += `<button class="button is-small is-light is-warning button--editCrewNote" data-crew-id="${crew.crewId}" type="button" title="Edit Note"><i class="fa-solid fa-edit"></i></button> `;
                html += `<button class="button is-small is-light is-danger button--deleteCrew" data-crew-id="${crew.crewId}" type="button" title="Delete"><i class="fa-solid fa-trash"></i></button>`;
                html += '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        containerElement.innerHTML = html;
        if (isEdit) {
            const editNoteButtons = containerElement.querySelectorAll('.button--editCrewNote');
            for (const button of editNoteButtons) {
                button.addEventListener('click', editCrewNote);
            }
            const deleteButtons = containerElement.querySelectorAll('.button--deleteCrew');
            for (const button of deleteButtons) {
                button.addEventListener('click', deleteShiftCrew);
            }
        }
    }
    function renderShiftEmployees() {
        const containerElement = document.querySelector('#container--shiftEmployees');
        if (shiftEmployees.length === 0) {
            containerElement.innerHTML = `<div class="message"><div class="message-body">No employees assigned to this shift.</div></div>`;
            return;
        }
        let html = '<table class="table is-fullwidth is-striped is-hoverable">';
        html += '<thead><tr><th>Employee</th><th>Crew</th><th>Note</th>';
        if (isEdit) {
            html += '<th class="has-text-right">Actions</th>';
        }
        html += '</tr></thead><tbody>';
        for (const employee of shiftEmployees) {
            html += '<tr>';
            html += `<td>${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}</td>`;
            html += `<td>${cityssm.escapeHTML(employee.crewName ?? '')}</td>`;
            html += `<td><span class="employee-note" data-employee-number="${employee.employeeNumber}">${cityssm.escapeHTML(employee.shiftEmployeeNote)}</span></td>`;
            if (isEdit) {
                html += '<td class="has-text-right">';
                html += `<button class="button is-small is-light is-info button--editEmployeeCrew" data-employee-number="${employee.employeeNumber}" type="button" title="Change Crew"><i class="fa-solid fa-users-gear"></i></button> `;
                html += `<button class="button is-small is-light is-warning button--editEmployeeNote" data-employee-number="${employee.employeeNumber}" type="button" title="Edit Note"><i class="fa-solid fa-edit"></i></button> `;
                html += `<button class="button is-small is-light is-danger button--deleteEmployee" data-employee-number="${employee.employeeNumber}" type="button" title="Delete"><i class="fa-solid fa-trash"></i></button>`;
                html += '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        containerElement.innerHTML = html;
        if (isEdit) {
            const editCrewButtons = containerElement.querySelectorAll('.button--editEmployeeCrew');
            for (const button of editCrewButtons) {
                button.addEventListener('click', editEmployeeCrew);
            }
            const editNoteButtons = containerElement.querySelectorAll('.button--editEmployeeNote');
            for (const button of editNoteButtons) {
                button.addEventListener('click', editEmployeeNote);
            }
            const deleteButtons = containerElement.querySelectorAll('.button--deleteEmployee');
            for (const button of deleteButtons) {
                button.addEventListener('click', deleteShiftEmployee);
            }
        }
    }
    function renderShiftEquipment() {
        const containerElement = document.querySelector('#container--shiftEquipment');
        if (shiftEquipment.length === 0) {
            containerElement.innerHTML = `<div class="message"><div class="message-body">No equipment assigned to this shift.</div></div>`;
            return;
        }
        let html = '<table class="table is-fullwidth is-striped is-hoverable">';
        html +=
            '<thead><tr><th>Equipment</th><th>Assigned Employee</th><th>Note</th>';
        if (isEdit) {
            html += '<th class="has-text-right">Actions</th>';
        }
        html += '</tr></thead><tbody>';
        for (const equipment of shiftEquipment) {
            html += '<tr>';
            html += `<td>${cityssm.escapeHTML(equipment.equipmentName ?? '')}</td>`;
            html += `<td>${equipment.employeeLastName ? cityssm.escapeHTML(equipment.employeeLastName) + ', ' + cityssm.escapeHTML(equipment.employeeFirstName ?? '') : ''}</td>`;
            html += `<td><span class="equipment-note" data-equipment-number="${equipment.equipmentNumber}">${cityssm.escapeHTML(equipment.shiftEquipmentNote)}</span></td>`;
            if (isEdit) {
                html += '<td class="has-text-right">';
                html += `<button class="button is-small is-light is-info button--editEquipmentEmployee" data-equipment-number="${equipment.equipmentNumber}" type="button" title="Assign Employee"><i class="fa-solid fa-user"></i></button> `;
                html += `<button class="button is-small is-light is-warning button--editEquipmentNote" data-equipment-number="${equipment.equipmentNumber}" type="button" title="Edit Note"><i class="fa-solid fa-edit"></i></button> `;
                html += `<button class="button is-small is-light is-danger button--deleteEquipment" data-equipment-number="${equipment.equipmentNumber}" type="button" title="Delete"><i class="fa-solid fa-trash"></i></button>`;
                html += '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        containerElement.innerHTML = html;
        if (isEdit) {
            const editEmployeeButtons = containerElement.querySelectorAll('.button--editEquipmentEmployee');
            for (const button of editEmployeeButtons) {
                button.addEventListener('click', editEquipmentEmployee);
            }
            const editNoteButtons = containerElement.querySelectorAll('.button--editEquipmentNote');
            for (const button of editNoteButtons) {
                button.addEventListener('click', editEquipmentNote);
            }
            const deleteButtons = containerElement.querySelectorAll('.button--deleteEquipment');
            for (const button of deleteButtons) {
                button.addEventListener('click', deleteShiftEquipment);
            }
        }
    }
    function refreshData() {
        cityssm.postJSON(`${urlPrefix}/doGetShiftCrews`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftCrews = responseJSON.shiftCrews;
            renderShiftCrews();
        });
        cityssm.postJSON(`${urlPrefix}/doGetShiftEmployees`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftEmployees = responseJSON.shiftEmployees;
            renderShiftEmployees();
        });
        cityssm.postJSON(`${urlPrefix}/doGetShiftEquipment`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftEquipment = responseJSON.shiftEquipment;
            renderShiftEquipment();
        });
    }
    function loadAvailableData() {
        cityssm.postJSON(`${urlPrefix}/doGetAvailableCrewsEmployeesEquipment`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            availableCrews = responseJSON.crews;
            availableEmployees = responseJSON.employees;
            availableEquipment = responseJSON.equipment;
        });
    }
    function addCrew() {
        let formElement;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftCrew`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Crew added successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to add crew'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-addCrew', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                const crewIdElement = modalElement.querySelector('select[name="crewId"]');
                for (const crew of availableCrews) {
                    // Skip crews already added
                    if (shiftCrews.some((sc) => sc.crewId === crew.crewId)) {
                        continue;
                    }
                    crewIdElement.insertAdjacentHTML('beforeend', `<option value="${crew.crewId}">
              ${cityssm.escapeHTML(crew.crewName)}
              </option>`);
                }
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addEmployee() {
        let formElement;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftEmployee`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Employee added successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to add employee'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-addEmployee', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                const employeeNumberElement = modalElement.querySelector('select[name="employeeNumber"]');
                for (const employee of availableEmployees) {
                    // Skip employees already added
                    if (shiftEmployees.some((se) => se.employeeNumber === employee.employeeNumber)) {
                        continue;
                    }
                    employeeNumberElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(employee.employeeNumber)}">
              ${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)}
              </option>`);
                }
                const crewIdElement = modalElement.querySelector('select[name="crewId"]');
                for (const crew of shiftCrews) {
                    crewIdElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(crew.crewId.toString())}">
              ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>`);
                }
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addEquipment() {
        let formElement;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftEquipment`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Equipment added successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to add equipment'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-addEquipment', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                const equipmentNumberElement = modalElement.querySelector('select[name="equipmentNumber"]');
                for (const equipment of availableEquipment) {
                    // Skip equipment already added
                    if (shiftEquipment.some((se) => se.equipmentNumber === equipment.equipmentNumber)) {
                        continue;
                    }
                    equipmentNumberElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(equipment.equipmentNumber)}">
              ${cityssm.escapeHTML(equipment.equipmentName)}
              </option>`);
                }
                const employeeNumberElement = modalElement.querySelector('select[name="employeeNumber"]');
                for (const employee of shiftEmployees) {
                    employeeNumberElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(employee.employeeNumber)}">
              ${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}
              </option>`);
                }
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editCrewNote(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const crewId = buttonElement.dataset.crewId;
        const crew = shiftCrews.find((c) => c.crewId.toString() === crewId);
        if (crew === undefined) {
            return;
        }
        let formElement;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftCrewNote`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to update note'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-editCrewNote', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                modalElement.querySelector('input[name="crewId"]').value = crewId ?? '';
                modalElement.querySelector('textarea[name="shiftCrewNote"]').value = crew.shiftCrewNote;
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doUpdate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editEmployeeCrew(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeNumber = buttonElement.dataset.employeeNumber;
        const employee = shiftEmployees.find((e) => e.employeeNumber === employeeNumber);
        if (employee === undefined) {
            return;
        }
        let formElement;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEmployee`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to update crew'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-editEmployeeCrew', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                modalElement.querySelector('input[name="employeeNumber"]').value = employeeNumber ?? '';
                const crewIdElement = modalElement.querySelector('select[name="crewId"]');
                for (const crew of shiftCrews) {
                    const selected = crew.crewId === employee.crewId;
                    crewIdElement.insertAdjacentHTML('beforeend', `<option value="${crew.crewId}"${selected ? ' selected' : ''}>
              ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>`);
                }
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doUpdate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editEmployeeNote(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeNumber = buttonElement.dataset.employeeNumber;
        const employee = shiftEmployees.find((e) => e.employeeNumber === employeeNumber);
        if (employee === undefined) {
            return;
        }
        let formElement;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEmployeeNote`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to update note'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-editEmployeeNote', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                modalElement.querySelector('input[name="employeeNumber"]').value = employeeNumber ?? '';
                modalElement.querySelector('textarea[name="shiftEmployeeNote"]').value = employee.shiftEmployeeNote;
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doUpdate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editEquipmentEmployee(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const equipmentNumber = buttonElement.dataset.equipmentNumber;
        const equipment = shiftEquipment.find((e) => e.equipmentNumber === equipmentNumber);
        if (equipment === undefined) {
            return;
        }
        let formElement;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEquipment`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to update assignment'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-editEquipmentEmployee', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                modalElement.querySelector('input[name="equipmentNumber"]').value = equipmentNumber ?? '';
                const employeeNumberElement = modalElement.querySelector('select[name="employeeNumber"]');
                for (const employee of shiftEmployees) {
                    const selected = employee.employeeNumber === equipment.employeeNumber;
                    employeeNumberElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(employee.employeeNumber)}"${selected ? ' selected' : ''}>
              ${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}
              </option>`);
                }
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doUpdate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editEquipmentNote(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const equipmentNumber = buttonElement.dataset.equipmentNumber;
        const equipment = shiftEquipment.find((e) => e.equipmentNumber === equipmentNumber);
        if (equipment === undefined) {
            return;
        }
        let formElement;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEquipmentNote`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to update note'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-editEquipmentNote', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="shiftId"]').value = shiftId;
                modalElement.querySelector('input[name="equipmentNumber"]').value = equipmentNumber ?? '';
                modalElement.querySelector('textarea[name="shiftEquipmentNote"]').value = equipment.shiftEquipmentNote;
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doUpdate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteShiftCrew(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const crewId = buttonElement.dataset.crewId;
        const crew = shiftCrews.find((c) => c.crewId.toString() === crewId);
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Crew',
            message: `Are you sure you want to remove crew "${cityssm.escapeHTML(crew?.crewName ?? '')}" from this shift?`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete',
                callbackFunction: () => {
                    cityssm.postJSON(`${urlPrefix}/doDeleteShiftCrew`, {
                        shiftId,
                        crewId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            refreshData();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Crew removed successfully'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error',
                                message: 'Failed to remove crew'
                            });
                        }
                    });
                }
            }
        });
    }
    function deleteShiftEmployee(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeNumber = buttonElement.dataset.employeeNumber;
        const employee = shiftEmployees.find((e) => e.employeeNumber === employeeNumber);
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Employee',
            message: `Are you sure you want to remove employee "${cityssm.escapeHTML(employee?.lastName ?? '')}, ${cityssm.escapeHTML(employee?.firstName ?? '')}" from this shift?`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete',
                callbackFunction: () => {
                    cityssm.postJSON(`${urlPrefix}/doDeleteShiftEmployee`, {
                        shiftId,
                        employeeNumber
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            refreshData();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Employee removed successfully'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error',
                                message: 'Failed to remove employee'
                            });
                        }
                    });
                }
            }
        });
    }
    function deleteShiftEquipment(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const equipmentNumber = buttonElement.dataset.equipmentNumber;
        const equipment = shiftEquipment.find((e) => e.equipmentNumber === equipmentNumber);
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Equipment',
            message: `Are you sure you want to remove equipment "${cityssm.escapeHTML(equipment?.equipmentName ?? '')}" from this shift?`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete',
                callbackFunction: () => {
                    cityssm.postJSON(`${urlPrefix}/doDeleteShiftEquipment`, {
                        shiftId,
                        equipmentNumber
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            refreshData();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Equipment removed successfully'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error',
                                message: 'Failed to remove equipment'
                            });
                        }
                    });
                }
            }
        });
    }
    function importFromPreviousShift() {
        let formElement;
        function doImport(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doCopyFromPreviousShift`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Imported successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'Failed to import from previous shift'
                    });
                }
            });
        }
        cityssm.openHtmlModal('shifts-importFromPreviousShift', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('input[name="currentShiftId"]').value = shiftId;
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doImport);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    // Event listeners for add buttons
    if (isEdit) {
        document
            .querySelector('#button--addCrew')
            ?.addEventListener('click', addCrew);
        document
            .querySelector('#button--addEmployee')
            ?.addEventListener('click', addEmployee);
        document
            .querySelector('#button--addEquipment')
            ?.addEventListener('click', addEquipment);
        document
            .querySelector('#button--importFromPreviousShift')
            ?.addEventListener('click', importFromPreviousShift);
        loadAvailableData();
    }
    // Initial data load
    refreshData();
})();
