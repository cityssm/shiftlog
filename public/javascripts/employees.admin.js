// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const employeesContainerElement = document.querySelector('#container--employees');
    // Pagination settings
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let currentFilteredEmployees = exports.employees;
    /**
     * Build pagination controls for employee list
     * Shows up to 10 page links including current page and neighboring pages
     */
    function buildPaginationControls(totalCount) {
        const paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered mt-4';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        let paginationHTML = '';
        // Previous button
        paginationHTML +=
            currentPage > 1
                ? `<a class="pagination-previous" href="#" data-page-number="${currentPage - 1}">Previous</a>`
                : '<a class="pagination-previous" disabled>Previous</a>';
        // Next button
        paginationHTML +=
            currentPage < totalPages
                ? `<a class="pagination-next" href="#" data-page-number="${currentPage + 1}">Next</a>`
                : '<a class="pagination-next" disabled>Next</a>';
        // Page numbers with smart ellipsis
        paginationHTML += '<ul class="pagination-list">';
        const maxVisiblePages = 10;
        let startPage = 1;
        let endPage = totalPages;
        if (totalPages > maxVisiblePages) {
            // Calculate range around current page
            const halfVisible = Math.floor(maxVisiblePages / 2);
            startPage = Math.max(1, currentPage - halfVisible);
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            // Adjust if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }
        // Always show first page
        if (startPage > 1) {
            paginationHTML += /* html */ `
        <li>
          <a class="pagination-link" data-page-number="1" href="#">1</a>
        </li>
      `;
            if (startPage > 2) {
                paginationHTML += /* html */ `
          <li>
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
        `;
            }
        }
        // Show page range
        for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
            paginationHTML +=
                pageNumber === currentPage
                    ? /* html */ `
            <li>
              <a class="pagination-link is-current" aria-current="page">${pageNumber}</a>
            </li>
          `
                    : /* html */ `
            <li>
              <a class="pagination-link" data-page-number="${pageNumber}" href="#">${pageNumber}</a>
            </li>
          `;
        }
        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML +=
                    '<li><span class="pagination-ellipsis">&hellip;</span></li>';
            }
            paginationHTML += `<li><a class="pagination-link" data-page-number="${totalPages}" href="#">${totalPages}</a></li>`;
        }
        paginationHTML += '</ul>';
        // eslint-disable-next-line no-unsanitized/property
        paginationElement.innerHTML = paginationHTML;
        // Event listeners
        const pageLinks = paginationElement.querySelectorAll('a.pagination-previous, a.pagination-next, a.pagination-link');
        for (const pageLink of pageLinks) {
            pageLink.addEventListener('click', pageSelect);
        }
        return paginationElement;
    }
    function pageSelect(event) {
        event.preventDefault();
        const target = event.currentTarget;
        const pageNumberString = target.dataset.pageNumber;
        if (pageNumberString !== undefined) {
            const pageNumber = Number.parseInt(pageNumberString, 10);
            currentPage = pageNumber;
            renderEmployeesWithPagination(currentFilteredEmployees);
        }
    }
    function deleteEmployee(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeNumber = buttonElement.dataset.employeeNumber;
        if (employeeNumber === undefined) {
            return;
        }
        const employee = exports.employees.find((possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber);
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
                                currentFilteredEmployees = responseJSON.employees;
                                currentPage = 1;
                                renderEmployeesWithPagination(responseJSON.employees);
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
                    // Update the employees list with the new data from the server
                    if (responseJSON.employees !== undefined) {
                        exports.employees = responseJSON.employees;
                        currentFilteredEmployees = responseJSON.employees;
                        currentPage = 1;
                        renderEmployeesWithPagination(responseJSON.employees);
                    }
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
                // Set employeeNumber field
                ;
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
            employeesContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <div class="message-body">
            No employees available.
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
    /**
     * Render employees with pagination
     */
    function renderEmployeesWithPagination(employees) {
        // Calculate pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedEmployees = employees.slice(startIndex, endIndex);
        // Render table
        renderEmployees(paginatedEmployees);
        // Add pagination controls if needed
        if (employees.length > ITEMS_PER_PAGE) {
            const paginationControls = buildPaginationControls(employees.length);
            employeesContainerElement.append(paginationControls);
        }
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
                        currentFilteredEmployees = responseJSON.employees;
                        currentPage = 1;
                        renderEmployeesWithPagination(responseJSON.employees);
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
    renderEmployeesWithPagination(exports.employees);
    /*
     * Filter employees with debouncing
     */
    const filterInput = document.querySelector('#filter--employees');
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
                    currentFilteredEmployees = exports.employees;
                    currentPage = 1;
                    renderEmployeesWithPagination(exports.employees);
                }
                else {
                    const filteredEmployees = exports.employees.filter((possibleEmployee) => {
                        const searchText = `${possibleEmployee.employeeNumber} ${possibleEmployee.firstName} ${possibleEmployee.lastName} ${possibleEmployee.userName ?? ''} ${possibleEmployee.phoneNumber ?? ''} ${possibleEmployee.emailAddress ?? ''}`.toLowerCase();
                        return searchText.includes(filterText);
                    });
                    currentFilteredEmployees = filteredEmployees;
                    currentPage = 1;
                    renderEmployeesWithPagination(filteredEmployees);
                }
            }, 300);
        });
    }
})();
