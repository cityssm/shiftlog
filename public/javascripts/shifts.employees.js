// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    const shiftIdElement = document.querySelector('#shift--shiftId');
    const shiftId = shiftIdElement.value;
    const isEdit = document.querySelector('#button--addCrew') !== null;
    let shiftCrews = exports.shiftCrews;
    let shiftEmployees = exports.shiftEmployees;
    let shiftEquipment = exports.shiftEquipment;
    let availableCrews = [];
    let availableEmployees = [];
    let availableEquipment = [];
    /**
     * Switch to a specific tab
     * @param tabId - The ID of the tab content to show (e.g., 'tab-content--crews')
     */
    function switchToTab(tabId) {
        // Find the tab link for this content
        const tabLink = document.querySelector(`a[href="#${tabId}"]`);
        if (tabLink !== null) {
            // Remove is-active from all tabs
            const allTabLinks = document.querySelectorAll('#tab--employees .tabs a');
            for (const link of allTabLinks) {
                link.parentElement?.classList.remove('is-active');
            }
            // Set is-active on the selected tab
            tabLink.parentElement?.classList.add('is-active');
            // Hide all tab content
            const allTabContent = document.querySelectorAll('[id^="tab-content--crews"], [id^="tab-content--employees"], [id^="tab-content--equipment"]');
            for (const content of allTabContent) {
                content.classList.add('is-hidden');
            }
            // Show the selected tab content
            const selectedContent = document.querySelector(`#${tabId}`);
            if (selectedContent !== null) {
                selectedContent.classList.remove('is-hidden');
            }
        }
    }
    function updateCounts() {
        // Update count badges
        const crewsCountElement = document.querySelector('#crewsCount');
        if (crewsCountElement !== null) {
            crewsCountElement.textContent = shiftCrews.length.toString();
        }
        const employeesCountElement = document.querySelector('#employeesCount');
        if (employeesCountElement !== null) {
            employeesCountElement.textContent = shiftEmployees.length.toString();
        }
        const equipmentCountElement = document.querySelector('#equipmentCount');
        if (equipmentCountElement !== null) {
            equipmentCountElement.textContent = shiftEquipment.length.toString();
        }
        // Show/hide checkmark icon on main tab
        const hasEmployeesEquipmentIcon = document.querySelector('#icon--hasEmployeesEquipment');
        if (hasEmployeesEquipmentIcon !== null) {
            hasEmployeesEquipmentIcon.classList.toggle('is-hidden', !(shiftCrews.length > 0 ||
                shiftEmployees.length > 0 ||
                shiftEquipment.length > 0));
        }
    }
    function renderShiftCrews() {
        const containerElement = document.querySelector('#container--shiftCrews');
        if (shiftCrews.length === 0) {
            containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No crews assigned to this shift.</div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Crew</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tbodyElement = tableElement.querySelector('tbody');
        for (const crew of shiftCrews) {
            const rowElement = document.createElement('tr');
            rowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(crew.crewName ?? '')}</td>
        <td>
          <span class="crew-note" data-crew-id="${cityssm.escapeHTML(crew.crewId.toString())}">
            ${cityssm.escapeHTML(crew.shiftCrewNote)}
          </span>
        </td>
      `;
            if (isEdit) {
                rowElement.insertAdjacentHTML('beforeend', 
                /* html */ `
            <td class="has-text-right">
              <button
                class="button is-small is-light is-warning button--editCrewNote"
                data-crew-id="${cityssm.escapeHTML(crew.crewId.toString())}"
                type="button"
                title="Edit Note"
              >
                <i class="fa-solid fa-edit"></i>
              </button>
              <button
                class="button is-small is-light is-danger button--deleteCrew"
                data-crew-id="${cityssm.escapeHTML(crew.crewId.toString())}"
                type="button"
                title="Delete"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `);
            }
            tbodyElement.append(rowElement);
        }
        containerElement.replaceChildren(tableElement);
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
            containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No employees assigned to this shift.</div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Employee</th>
          <th>Crew</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const employee of shiftEmployees) {
            const rowElement = document.createElement('tr');
            rowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}</td>
        <td>${cityssm.escapeHTML(employee.crewName ?? '')}</td>
        <td>
          <span class="employee-note" data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}">
            ${cityssm.escapeHTML(employee.shiftEmployeeNote)}
          </span>
        </td>
      `;
            if (isEdit) {
                rowElement.insertAdjacentHTML('beforeend', 
                /* html */ `
            <td class="has-text-right">
              <button
                class="button is-small is-light is-info button--editEmployeeCrew"
                data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
                type="button"
                title="Change Crew"
              >
                <i class="fa-solid fa-users-gear"></i>
              </button> 
              <button
                class="button is-small is-light is-warning button--editEmployeeNote"
                data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
                type="button"
                title="Edit Note"
              >
                <i class="fa-solid fa-edit"></i>
              </button> 
              <button
                class="button is-small is-light is-danger button--deleteEmployee"
                data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
                type="button"
                title="Delete"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `);
            }
            tableBodyElement.append(rowElement);
        }
        containerElement.replaceChildren(tableElement);
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
            containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No equipment assigned to this shift.</div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Equipment</th>
          <th>Assigned Employee</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const equipment of shiftEquipment) {
            const rowElement = document.createElement('tr');
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(equipment.equipmentName ?? '')}</td>
        <td>
          ${(equipment.employeeLastName ?? '') === '' ? '' : cityssm.escapeHTML(`${equipment.employeeLastName ?? ''}, ${equipment.employeeFirstName ?? ''}`)}
        </td>
        <td>
          <span class="equipment-note" data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}">
            ${cityssm.escapeHTML(equipment.shiftEquipmentNote)}
          </span>
        </td>
      `;
            if (isEdit) {
                rowElement.insertAdjacentHTML('beforeend', 
                /* html */ `
            <td class="has-text-right">
              <button
                class="button is-small is-light is-info button--editEquipmentEmployee"
                data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}"
                type="button"
                title="Assign Employee"
              >
                <i class="fa-solid fa-user"></i>
              </button>
              <button
                class="button is-small is-light is-warning button--editEquipmentNote"
                data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}"
                type="button"
                title="Edit Note"
              >
                <i class="fa-solid fa-edit"></i>
              </button>
              <button
                class="button is-small is-light is-danger button--deleteEquipment"
                data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}"
                type="button"
                title="Delete"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `);
            }
            tableBodyElement.append(rowElement);
        }
        containerElement.replaceChildren(tableElement);
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
    function refreshCrewData() {
        cityssm.postJSON(`${urlPrefix}/doGetShiftCrews`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftCrews = responseJSON.shiftCrews;
            renderShiftCrews();
            updateCounts();
        });
    }
    function refreshEmployeeData() {
        cityssm.postJSON(`${urlPrefix}/doGetShiftEmployees`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftEmployees = responseJSON.shiftEmployees;
            renderShiftEmployees();
            updateCounts();
        });
    }
    function refreshEquipmentData() {
        cityssm.postJSON(`${urlPrefix}/doGetShiftEquipment`, { shiftId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            shiftEquipment = responseJSON.shiftEquipment;
            renderShiftEquipment();
            updateCounts();
        });
    }
    function refreshData() {
        refreshCrewData();
        refreshEmployeeData();
        refreshEquipmentData();
    }
    function loadAvailableData() {
        cityssm.postJSON(
        // eslint-disable-next-line no-secrets/no-secrets
        `${urlPrefix}/doGetAvailableCrewsEmployeesEquipment`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            availableCrews = responseJSON.crews;
            availableEmployees = responseJSON.employees;
            availableEquipment = responseJSON.equipment;
        });
    }
    function addCrew(clickEvent) {
        clickEvent.preventDefault();
        let formElement;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftCrew`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    switchToTab('tab-content--crews');
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
                    crewIdElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option value="${cityssm.escapeHTML(crew.crewId.toString())}">
                ${cityssm.escapeHTML(crew.crewName)}
              </option>
            `);
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
    function addEmployee(clickEvent) {
        clickEvent.preventDefault();
        let formElement;
        let closeModalFunction;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftEmployee`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    switchToTab('tab-content--employees');
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Employee added successfully'
                    });
                    closeModalFunction();
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
                    employeeNumberElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option value="${cityssm.escapeHTML(employee.employeeNumber)}">
                ${cityssm.escapeHTML(employee.lastName)},
                ${cityssm.escapeHTML(employee.firstName)}
                (${cityssm.escapeHTML(employee.employeeNumber)})
              </option>
            `);
                }
                const crewIdElement = modalElement.querySelector('select[name="crewId"]');
                for (const crew of shiftCrews) {
                    crewIdElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option value="${cityssm.escapeHTML(crew.crewId.toString())}">
                ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>
            `);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addEquipment(clickEvent) {
        clickEvent.preventDefault();
        let closeModalFunction;
        let formElement;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doAddShiftEquipment`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    switchToTab('tab-content--equipment');
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Equipment added successfully'
                    });
                    closeModalFunction();
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
                    equipmentNumberElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option value="${cityssm.escapeHTML(equipment.equipmentNumber)}">
                ${cityssm.escapeHTML(equipment.equipmentNumber)}
                -
                ${cityssm.escapeHTML(equipment.equipmentName)}
              </option>
            `);
                }
                const employeeNumberElement = modalElement.querySelector('select[name="employeeNumber"]');
                for (const employee of shiftEmployees) {
                    employeeNumberElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option value="${cityssm.escapeHTML(employee.employeeNumber)}">
                ${cityssm.escapeHTML(employee.lastName ?? '')},
                ${cityssm.escapeHTML(employee.firstName ?? '')}
                (${cityssm.escapeHTML(employee.employeeNumber)})
              </option>
            `);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
        let closeModalFunction;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftCrewNote`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    closeModalFunction();
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
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
        const employee = shiftEmployees.find((possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber);
        if (employee === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEmployee`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    closeModalFunction();
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
                    // eslint-disable-next-line no-unsanitized/method
                    crewIdElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option
                value="${cityssm.escapeHTML(crew.crewId.toString())}"
                ${selected ? ' selected' : ''}
              >
                ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>
            `);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
        const employee = shiftEmployees.find((possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber);
        if (employee === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEmployeeNote`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    closeModalFunction();
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
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
        const equipment = shiftEquipment.find((possibleEquipment) => possibleEquipment.equipmentNumber === equipmentNumber);
        if (equipment === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEquipment`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    closeModalFunction();
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
                    // eslint-disable-next-line no-unsanitized/method
                    employeeNumberElement.insertAdjacentHTML('beforeend', 
                    /* html */ `
              <option
                value="${cityssm.escapeHTML(employee.employeeNumber)}"
                ${selected ? ' selected' : ''}
              >
                ${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}
              </option>
            `);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
        const equipment = shiftEquipment.find((possibleEquipment) => possibleEquipment.equipmentNumber === equipmentNumber);
        if (equipment === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${urlPrefix}/doUpdateShiftEquipmentNote`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    refreshData();
                    closeModalFunction();
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
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
        const employee = shiftEmployees.find((possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber);
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
        const equipment = shiftEquipment.find((possibleEquipment) => possibleEquipment.equipmentNumber === equipmentNumber);
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
    function importFromPreviousShift(clickEvent) {
        clickEvent.preventDefault();
        let formElement;
        let closeModalFunction;
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
                    closeModalFunction();
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
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
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
    // Initial render
    renderShiftCrews();
    renderShiftEmployees();
    renderShiftEquipment();
    updateCounts();
})();
