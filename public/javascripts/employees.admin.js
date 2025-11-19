(() => {
    const shiftLog = exports.shiftLog;
    const employeesContainerElement = document.querySelector('#container--employees');
    function deleteEmployee(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeNumber = buttonElement.dataset.employeeNumber;
        if (employeeNumber === undefined) {
            return;
        }
        const employee = exports.employees.find((employee) => employee.employeeNumber === employeeNumber);
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Employee',
            message: `Are you sure you want to delete employee "${employee?.firstName ?? ''} ${employee?.lastName ?? ''}" (${employeeNumber})? This action cannot be undone.`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Employee',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteEmployee`, {
                        employeeNumber
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            // Update the employees list with the new data from the server
                            if (responseJSON.employees !== undefined) {
                                exports.employees = responseJSON.employees;
                                renderEmployees(responseJSON.employees);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Employee Deleted',
                                message: 'Employee has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Employee',
                                message: responseJSON.message ?? 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editEmployee(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeNumber = buttonElement.dataset.employeeNumber;
        if (employeeNumber === undefined) {
            return;
        }
        // Find the employee in the current employees list
        const employee = exports.employees.find((employee) => employee.employeeNumber === employeeNumber);
        if (employee === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateEmployee(submitEvent) {
            submitEvent.preventDefault();
            const editForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateEmployee`, editForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    // Refresh the page to show updated data
                    location.reload();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Employee',
                        message: responseJSON.message ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployees-edit', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#span--employeeNumber').textContent = employeeNumber;
                modalElement.querySelector('#editEmployee--employeeNumber').value = employeeNumber;
                modalElement.querySelector('#editEmployee--firstName').value = employee.firstName;
                modalElement.querySelector('#editEmployee--lastName').value = employee.lastName;
                modalElement.querySelector('#editEmployee--userName').value = employee.userName ?? '';
                modalElement.querySelector('#editEmployee--isSupervisor').checked = employee.isSupervisor;
                modalElement.querySelector('#editEmployee--recordSync_isSynced').checked = employee.recordSync_isSynced;
                modalElement.querySelector('#editEmployee--phoneNumber').value = employee.phoneNumber ?? '';
                modalElement.querySelector('#editEmployee--phoneNumberAlternate').value = employee.phoneNumberAlternate ?? '';
                modalElement.querySelector('#editEmployee--emailAddress').value = employee.emailAddress ?? '';
                // Populate user groups dropdown
                const userGroupSelect = modalElement.querySelector('#editEmployee--userGroupId');
                for (const userGroup of exports.userGroups) {
                    const optionElement = document.createElement('option');
                    optionElement.value = userGroup.userGroupId.toString();
                    optionElement.textContent = userGroup.userGroupName;
                    if (employee.userGroupId !== null &&
                        employee.userGroupId !== undefined &&
                        employee.userGroupId === userGroup.userGroupId) {
                        optionElement.selected = true;
                    }
                    userGroupSelect.append(optionElement);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateEmployee);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function buildEmployeeRowElement(employee) {
        const rowElement = document.createElement('tr');
        rowElement.dataset.employeeNumber = employee.employeeNumber;
        const userGroup = exports.userGroups.find((ug) => ug.userGroupId === employee.userGroupId);
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /*html*/ `
      <td>${cityssm.escapeHTML(employee.employeeNumber)}</td>
      <td>${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)}</td>
      <td class="has-text-centered">
        ${employee.isSupervisor ? '<i class="fa-solid fa-check"></i>' : '-'}
      </td>
      <td>${cityssm.escapeHTML(employee.userName ?? '')}</td>
      <td>${cityssm.escapeHTML(employee.phoneNumber ?? '')}</td>
      <td>${cityssm.escapeHTML(employee.emailAddress ?? '')}</td>
      <td>${userGroup === undefined ? '' : cityssm.escapeHTML(userGroup.userGroupName)}</td>
      <td class="has-text-centered">
        <div class="buttons is-justify-content-center">
          <button
            class="button is-small is-info edit-employee"
            data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
            title="Edit Employee"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-pencil"></i>
            </span>
            <span>Edit</span>
          </button>
          <button
            class="button is-small is-danger delete-employee"
            data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
            title="Delete Employee"
          >
            Delete
          </button>
        </div>
      </td>
    `;
        return rowElement;
    }
    function renderEmployees(employees) {
        if (employees.length === 0) {
            employeesContainerElement.innerHTML = '<p>No employees found.</p>';
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>Employee Number</th>
          <th>Name</th>
          <th class="has-text-centered">Supervisor</th>
          <th>User Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>User Group</th>
          <th class="has-text-centered">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        for (const employee of employees) {
            const rowElement = buildEmployeeRowElement(employee);
            tableElement.querySelector('tbody')?.append(rowElement);
        }
        // Add event listeners for edit buttons
        for (const button of tableElement.querySelectorAll('.edit-employee')) {
            button.addEventListener('click', editEmployee);
        }
        // Add event listeners for delete buttons
        for (const button of tableElement.querySelectorAll('.delete-employee')) {
            button.addEventListener('click', deleteEmployee);
        }
        employeesContainerElement.replaceChildren(tableElement);
    }
    document
        .querySelector('#button--addEmployee')
        ?.addEventListener('click', () => {
        let closeModalFunction;
        function doAddEmployee(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddEmployee`, addForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    addForm.reset();
                    // Update the employees list with the new data from the server
                    if (responseJSON.employees !== undefined) {
                        exports.employees = responseJSON.employees;
                        renderEmployees(responseJSON.employees);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee Added',
                        message: 'Employee has been successfully added. You can now edit it to add more details.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Employee',
                        message: responseJSON.message ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployees-add', {
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddEmployee);
                modalElement.querySelector('#addEmployee--employeeNumber').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderEmployees(exports.employees);
})();
