(() => {
    const shiftLog = exports.shiftLog;
    const usersContainerElement = document.querySelector('#container--users');
    function deleteUser(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userName = buttonElement.dataset.userName;
        if (userName === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete User',
            message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete User',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteUser`, {
                        userName
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            // Update the users list with the new data from the server
                            if (responseJSON.users !== undefined) {
                                renderUsers(responseJSON.users);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'User Deleted',
                                message: 'User has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting User',
                                message: responseJSON.message ?? 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function toggleUserPermission(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userName = buttonElement.dataset.userName;
        const permission = buttonElement.dataset.permission;
        if (userName === undefined || permission === undefined) {
            return;
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doToggleUserPermission`, {
            permissionField: permission,
            userName
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderUsers(responseJSON.users);
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Permission',
                    message: responseJSON.message ?? 'Please try again.'
                });
            }
        });
    }
    function editUserSettings(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userName = buttonElement.dataset.userName;
        if (userName === undefined) {
            return;
        }
        // Find the user in the current users list
        const user = exports.users.find((u) => u.userName === userName);
        if (user === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateUserSettings(submitEvent) {
            submitEvent.preventDefault();
            const settingsForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateUserSettings`, settingsForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    // Update the users list with the new data from the server
                    if (responseJSON.users !== undefined) {
                        exports.users = responseJSON.users;
                        renderUsers(responseJSON.users);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Settings Updated',
                        message: 'User settings have been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Settings',
                        message: responseJSON.message ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUsers-settings', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#span--userName').textContent = userName;
                modalElement.querySelector('[name="userName"]').value = userName;
                // Pre-populate settings fields
                const settings = user.userSettings ?? {};
                // Dynamically generate form fields for all user settings
                const containerElement = modalElement.querySelector('#container--userSettings');
                containerElement.innerHTML = '';
                for (const settingKey of exports.userSettingKeys) {
                    const fieldElement = document.createElement('div');
                    fieldElement.className = 'field';
                    const isApiKey = settingKey === 'apiKey';
                    const settingValue = settings[settingKey] ?? '';
                    // eslint-disable-next-line no-unsanitized/property
                    fieldElement.innerHTML = /*html*/ `
            <label class="label" for="${cityssm.escapeHTML(settingKey)}">${cityssm.escapeHTML(settingKey)}</label>
            <div class="control">
              <input
                class="input"
                id="${cityssm.escapeHTML(settingKey)}"
                name="${cityssm.escapeHTML(settingKey)}"
                type="text"
                value="${cityssm.escapeHTML(settingValue)}"
                ${isApiKey ? 'readonly' : ''}
              />
            </div>
          `;
                    containerElement.append(fieldElement);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateUserSettings);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    const activePermissionClass = 'is-success';
    const inactivePermissionClass = 'is-light';
    function buildUserRowElement(user) {
        const rowElement = document.createElement('tr');
        rowElement.dataset.userName = user.userName;
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /*html*/ `
      <th>${cityssm.escapeHTML(user.userName)}</th>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.isActive ? activePermissionClass : inactivePermissionClass}"
          data-permission="isActive"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Active Status"
        >
          ${user.isActive ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <button
          class="button is-small permission-toggle ${user.isAdmin ? activePermissionClass : inactivePermissionClass}"
          data-permission="isAdmin"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Is Admin"
        >
          ${user.isAdmin ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered">
        <div class="buttons is-justify-content-center">
          <button
            class="button is-small is-info edit-user-settings"
            data-user-name="${cityssm.escapeHTML(user.userName)}"
            title="Edit User Settings"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-cog"></i>
            </span>
            <span>Settings</span>
          </button>
          <button
            class="button is-small is-danger delete-user"
            data-user-name="${cityssm.escapeHTML(user.userName)}"
            title="Delete User"
          >
            Delete
          </button>
        </div>
      </td>
    `;
        return rowElement;
    }
    function renderUsers(users) {
        if (users.length === 0) {
            usersContainerElement.innerHTML = '<p>No users found.</p>';
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>User Name</th>
          <th class="has-text-centered">Can Login</th>
          <th class="has-text-centered">Is Admin</th>
          <th class="has-text-centered">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        for (const user of users) {
            const rowElement = buildUserRowElement(user);
            tableElement.querySelector('tbody')?.append(rowElement);
        }
        // Add event listeners for permission toggles
        for (const button of tableElement.querySelectorAll('.permission-toggle')) {
            button.addEventListener('click', toggleUserPermission);
        }
        // Add event listeners for edit settings buttons
        for (const button of tableElement.querySelectorAll('.edit-user-settings')) {
            button.addEventListener('click', editUserSettings);
        }
        // Add event listeners for delete buttons
        for (const button of tableElement.querySelectorAll('.delete-user')) {
            button.addEventListener('click', deleteUser);
        }
        usersContainerElement.replaceChildren(tableElement);
    }
    document.querySelector('#button--addUser')?.addEventListener('click', () => {
        let closeModalFunction;
        function doAddUser(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddUser`, addForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    exports.users = responseJSON.users;
                    renderUsers(responseJSON.users);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding User',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUsers-add', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#span--domain').textContent = `${exports.domain}\\`;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddUser);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderUsers(exports.users);
})();
