/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const employeeListsContainerElement = document.querySelector('#container--employeeLists');
    // Track Sortable instances to prevent duplicates
    const sortableInstances = new Map();
    function deleteEmployeeList(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeListId = Number.parseInt(buttonElement.dataset.employeeListId ?? '', 10);
        const employeeList = exports.employeeLists.find((list) => list.employeeListId === employeeListId);
        if (employeeList === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Employee List',
            message: `Are you sure you want to delete the employee list "${cityssm.escapeHTML(employeeList.employeeListName)}"? This action cannot be undone.`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Employee List',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteEmployeeList`, {
                        employeeListId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.employeeLists !== undefined) {
                                exports.employeeLists = responseJSON.employeeLists;
                                renderEmployeeLists();
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Employee List Deleted',
                                message: 'Employee list has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Employee List',
                                message: 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editEmployeeList(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const employeeListId = Number.parseInt(buttonElement.dataset.employeeListId ?? '', 10);
        const employeeList = exports.employeeLists.find((list) => list.employeeListId === employeeListId);
        if (employeeList === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateEmployeeList`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.employeeLists !== undefined) {
                        exports.employeeLists = responseJSON.employeeLists;
                        renderEmployeeLists();
                    }
                    closeModalFunction();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee List Updated',
                        message: 'Employee list has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Employee List',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-edit', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('.modal-card-title').textContent = 'Edit Employee List';
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#employeeListEdit--employeeListId').value = employeeListId.toString();
                formElement.querySelector('#employeeListEdit--employeeListName').value = employeeList.employeeListName;
                formElement.querySelector('#employeeListEdit--userGroupId').value = (employeeList.userGroupId ?? '').toString();
                formElement.addEventListener('submit', doEdit);
            },
            onshown(_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addEmployeeList() {
        let formElement;
        let closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddEmployeeList`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.employeeLists !== undefined) {
                        exports.employeeLists = responseJSON.employeeLists;
                        renderEmployeeLists();
                    }
                    closeModalFunction();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee List Added',
                        message: 'Employee list has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Employee List',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-add', {
            onshow(modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
            },
            onshown(modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('input[name="employeeListName"]').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function loadEmployeeListDetails(employeeListId, panelElement) {
        cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doGetEmployeeList`, {
            employeeListId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.employeeList !== undefined) {
                renderEmployeeListMembers(responseJSON.employeeList, panelElement);
            }
        });
    }
    function deleteEmployeeListMember(employeeListId, employeeNumber, panelElement) {
        cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteEmployeeListMember`, {
            employeeListId,
            employeeNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.employeeList !== undefined) {
                renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Member Removed',
                    message: 'Employee has been removed from the list.'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Removing Member',
                    message: 'Please try again.'
                });
            }
        });
    }
    function addEmployeeListMember(employeeListId, panelElement) {
        let formElement;
        let closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            const formData = new FormData(formElement);
            const employeeNumber = formData.get('employeeNumber').trim();
            if (employeeNumber === '') {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Missing Employee',
                    message: 'Please select an employee.'
                });
                return;
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddEmployeeListMember`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.employeeList !== undefined) {
                    renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Added',
                        message: 'Employee has been added to the list.'
                    });
                    closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Member',
                        message: 'Please try again. The employee may already be in the list.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-addMember', {
            onshow(modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#employeeListMember--employeeListId').value = employeeListId.toString();
                // Populate employee select
                const selectElement = formElement.querySelector('#employeeListMember--employeeNumber');
                for (const employee of exports.employees) {
                    const optionElement = document.createElement('option');
                    optionElement.value = employee.employeeNumber;
                    optionElement.textContent = `${employee.firstName} ${employee.lastName} (${employee.employeeNumber})`;
                    selectElement.append(optionElement);
                }
                // Initialize flatpickr for seniority date
                const seniorityDateInput = formElement.querySelector('#employeeListMember--seniorityDate');
                globalThis.flatpickr(seniorityDateInput, {
                    dateFormat: 'Y-m-d',
                    allowInput: true
                });
                formElement.addEventListener('submit', doAdd);
            },
            onshown(_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editEmployeeListMember(employeeListId, employeeNumber, employeeList, panelElement) {
        const member = employeeList.members.find((m) => m.employeeNumber === employeeNumber);
        if (member === undefined) {
            return;
        }
        let formElement;
        let closeModalFunction;
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateEmployeeListMember`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success && responseJSON.employeeList !== undefined) {
                    renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Updated',
                        message: 'Employee list member has been updated.'
                    });
                    closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Member',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-editMember', {
            onshow(modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#employeeListMemberEdit--employeeListId').value = employeeListId.toString();
                formElement.querySelector('#employeeListMemberEdit--employeeNumber').value = employeeNumber;
                formElement.querySelector('#employeeListMemberEdit--employeeName').value =
                    `${member.firstName ?? ''} ${member.lastName ?? ''} (${employeeNumber})`;
                // Initialize flatpickr for seniority date
                const seniorityDateInput = formElement.querySelector('#employeeListMemberEdit--seniorityDate');
                // Set initial value
                if (member.seniorityDate) {
                    seniorityDateInput.value = cityssm.dateToString(new Date(member.seniorityDate));
                }
                globalThis.flatpickr(seniorityDateInput, {
                    dateFormat: 'Y-m-d',
                    allowInput: true
                });
                formElement.querySelector('#employeeListMemberEdit--seniorityOrderNumber').value = member.seniorityOrderNumber.toString();
                formElement.addEventListener('submit', doUpdate);
            },
            onshown(_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function initializeSortable(employeeListId, seniorityDate, panelElement) {
        // Sanitize dateKey for use in CSS selector (remove special characters)
        const sanitizedDateKey = seniorityDate
            ? seniorityDate.replaceAll(/[^a-z0-9\-]/giv, '-')
            : 'nodate';
        const containerId = `members--${employeeListId}--${sanitizedDateKey}`;
        const tbodyElement = document.querySelector(`#${containerId}`);
        if (tbodyElement === null) {
            return;
        }
        // Check if the tbody has any sortable items
        const hasItems = tbodyElement.querySelectorAll('tr[data-employee-number]').length > 0;
        if (!hasItems) {
            // Destroy existing instance if no items
            const existingInstance = sortableInstances.get(containerId);
            if (existingInstance !== undefined) {
                existingInstance.destroy();
                sortableInstances.delete(containerId);
            }
            return;
        }
        // Destroy existing Sortable instance before creating a new one
        const existingInstance = sortableInstances.get(containerId);
        if (existingInstance !== undefined) {
            existingInstance.destroy();
        }
        // Create new Sortable instance
        const sortableInstance = Sortable.create(tbodyElement, {
            handle: '.handle',
            animation: 150,
            onEnd() {
                // Get the new order
                const rows = tbodyElement.querySelectorAll('tr[data-employee-number]');
                const employeeNumbers = [];
                for (const row of rows) {
                    const employeeNumber = row.dataset.employeeNumber;
                    if (employeeNumber !== undefined) {
                        employeeNumbers.push(employeeNumber);
                    }
                }
                // Send to server
                cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doReorderEmployeeListMembers`, {
                    employeeListId,
                    employeeNumbers,
                    seniorityDate: seniorityDate ?? undefined
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success &&
                        responseJSON.employeeList !== undefined) {
                        renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Reordering Members',
                            message: 'Please refresh the page and try again.'
                        });
                    }
                });
            }
        });
        // Store the instance for future reference
        sortableInstances.set(containerId, sortableInstance);
    }
    function renderEmployeeListMembers(employeeList, panelElement) {
        const membersContainerElement = panelElement.querySelector('.panel-block-members');
        if (employeeList.members.length === 0) {
            membersContainerElement.innerHTML = /* html */ `
        <div class="panel-block">
          <p class="has-text-grey">
            No employees in this list. Click "Add Member" to add an employee.
          </p>
        </div>
      `;
            return;
        }
        // Group members by seniority date
        const membersByDate = new Map();
        for (const member of employeeList.members) {
            const dateKey = member.seniorityDate?.toString() ?? 'no-date';
            if (!membersByDate.has(dateKey)) {
                membersByDate.set(dateKey, []);
            }
            membersByDate.get(dateKey)?.push(member);
        }
        let membersHtml = '';
        for (const [dateKey, members] of membersByDate) {
            // Sanitize dateKey for use in CSS selector (remove special characters)
            const sanitizedDateKey = dateKey === 'no-date'
                ? 'nodate'
                : dateKey.replaceAll(/[^a-z0-9\-]/giv, '-');
            const containerId = `members--${employeeList.employeeListId}--${sanitizedDateKey}`;
            const dateDisplay = dateKey === 'no-date'
                ? 'No Seniority Date'
                : cityssm.dateToString(new Date(dateKey));
            membersHtml += `<div class="panel-block is-block p-0">
        <div class="px-4 py-2 has-background-light">
          <strong>${dateDisplay}</strong>
        </div>
        <div class="table-container" style="width: 100%;">
          <table class="table is-striped is-hoverable is-fullwidth mb-0">
            <thead>
              <tr>
                <th class="has-width-1">
                  <span class="is-sr-only">Order</span>
                </th>
                <th>Employee Name</th>
                <th>Employee Number</th>
                <th>
                  <span class="is-sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="is-sortable" id="${containerId}">`;
            for (const member of members) {
                membersHtml += /* html */ `
          <tr data-employee-number="${cityssm.escapeHTML(member.employeeNumber)}">
            <td class="has-text-centered">
              <span class="icon is-small has-text-grey handle" style="cursor: move;">
                <i class="fa-solid fa-grip-vertical"></i>
              </span>
            </td>
            <td>
              ${cityssm.escapeHTML(member.firstName ?? '')} ${cityssm.escapeHTML(member.lastName ?? '')}
            </td>
            <td>
              ${cityssm.escapeHTML(member.employeeNumber)}
            </td>
            <td class="has-text-right">
              <div class="buttons are-small is-justify-content-end mb-0">
                <button
                  class="button is-info button--editMember"
                  data-employee-number="${cityssm.escapeHTML(member.employeeNumber)}"
                  type="button"
                  aria-label="Edit"
                >
                  <span class="icon">
                    <i class="fa-solid fa-pencil"></i>
                  </span>
                </button>
                <button
                  class="button is-danger button--deleteMember"
                  data-employee-number="${cityssm.escapeHTML(member.employeeNumber)}"
                  type="button"
                  aria-label="Delete"
                >
                  <span class="icon">
                    <i class="fa-solid fa-trash"></i>
                  </span>
                </button>
              </div>
            </td>
          </tr>
        `;
            }
            membersHtml += `</tbody>
          </table>
        </div>
      </div>`;
        }
        // eslint-disable-next-line no-unsanitized/property
        membersContainerElement.innerHTML = membersHtml;
        // Add event listeners for edit buttons
        const editButtons = membersContainerElement.querySelectorAll('.button--editMember');
        for (const button of editButtons) {
            button.addEventListener('click', (clickEvent) => {
                const buttonElement = clickEvent.currentTarget;
                const employeeNumber = buttonElement.dataset.employeeNumber ?? '';
                editEmployeeListMember(employeeList.employeeListId, employeeNumber, employeeList, panelElement);
            });
        }
        // Add event listeners for delete buttons
        const deleteButtons = membersContainerElement.querySelectorAll('.button--deleteMember');
        for (const button of deleteButtons) {
            button.addEventListener('click', (clickEvent) => {
                const buttonElement = clickEvent.currentTarget;
                const employeeNumber = buttonElement.dataset.employeeNumber ?? '';
                const member = employeeList.members.find((m) => m.employeeNumber === employeeNumber);
                if (member === undefined) {
                    return;
                }
                bulmaJS.confirm({
                    contextualColorName: 'warning',
                    title: 'Remove Employee',
                    message: `Are you sure you want to remove ${cityssm.escapeHTML(member.firstName ?? '')} ${cityssm.escapeHTML(member.lastName ?? '')} from this list?`,
                    okButton: {
                        contextualColorName: 'warning',
                        text: 'Remove Employee',
                        callbackFunction() {
                            deleteEmployeeListMember(employeeList.employeeListId, employeeNumber, panelElement);
                        }
                    }
                });
            });
        }
        // Initialize sortable for each date group
        for (const [dateKey] of membersByDate) {
            initializeSortable(employeeList.employeeListId, dateKey === 'no-date' ? undefined : dateKey, panelElement);
        }
    }
    function renderEmployeeLists() {
        if (exports.employeeLists.length === 0) {
            employeeListsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">
            No employee lists available.
          </div>
        </div>
      `;
            return;
        }
        employeeListsContainerElement.innerHTML = '';
        for (const employeeList of exports.employeeLists) {
            const userGroup = employeeList.userGroupId !== undefined &&
                employeeList.userGroupId !== null
                ? exports.userGroups.find((ug) => ug.userGroupId === employeeList.userGroupId)
                : undefined;
            const panelElement = document.createElement('details');
            panelElement.className = 'panel mb-5 collapsable-panel';
            panelElement.dataset.employeeListId =
                employeeList.employeeListId.toString();
            // eslint-disable-next-line no-unsanitized/property
            panelElement.innerHTML = /* html */ `
        <summary class="panel-heading is-clickable">
          <span class="icon-text">
            <span class="icon">
              <i class="fa-solid fa-chevron-right details-chevron"></i>
            </span>
            <span class="has-text-weight-semibold mr-2">
              ${cityssm.escapeHTML(employeeList.employeeListName)}
            </span>
            ${userGroup === undefined
                ? ''
                : `<span class="tag is-info">${cityssm.escapeHTML(userGroup.userGroupName)}</span>`}
            <span class="tag is-rounded ml-2">${employeeList.memberCount ?? 0}</span>
          </span>
        </summary>
        <div class="panel-block is-justify-content-space-between is-align-items-center">
          <div class="buttons are-small mb-0">
            <button
              class="button is-primary button--addMember"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-plus"></i>
              </span>
              <span>Add Member</span>
            </button>
          </div>
          <div class="buttons are-small mb-0">
            <button
              class="button is-info button--editEmployeeList"
              data-employee-list-id="${employeeList.employeeListId}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit List</span>
            </button>
            <button
              class="button is-danger button--deleteEmployeeList"
              data-employee-list-id="${employeeList.employeeListId}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete List</span>
            </button>
          </div>
        </div>
        <div class="panel-block-members"></div>
      `;
            employeeListsContainerElement.append(panelElement);
            // Add event listeners
            panelElement
                .querySelector('.button--editEmployeeList')
                ?.addEventListener('click', editEmployeeList);
            panelElement
                .querySelector('.button--deleteEmployeeList')
                ?.addEventListener('click', deleteEmployeeList);
            panelElement
                .querySelector('.button--addMember')
                ?.addEventListener('click', () => {
                addEmployeeListMember(employeeList.employeeListId, panelElement);
            });
            // Load details when panel is opened
            panelElement.addEventListener('toggle', () => {
                if (panelElement.open) {
                    loadEmployeeListDetails(employeeList.employeeListId, panelElement);
                }
            });
        }
    }
    // Initialize
    renderEmployeeLists();
    document
        .querySelector('#button--addEmployeeList')
        ?.addEventListener('click', addEmployeeList);
})();
