// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const userGroupsContainerElement = document.querySelector('#container--userGroups');
    function deleteUserGroup(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userGroupId = buttonElement.dataset.userGroupId;
        if (userGroupId === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete User Group',
            message: 'Are you sure you want to delete this user group?',
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete User Group',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteUserGroup`, {
                        userGroupId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.userGroups !== undefined) {
                                exports.userGroups = responseJSON.userGroups;
                                renderUserGroups(responseJSON.userGroups);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'User Group Deleted',
                                message: 'User group has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting User Group',
                                message: 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editUserGroup(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userGroupId = buttonElement.dataset.userGroupId;
        if (userGroupId === undefined) {
            return;
        }
        const userGroup = exports.userGroups.find((ug) => ug.userGroupId.toString() === userGroupId);
        if (userGroup === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateUserGroup(submitEvent) {
            submitEvent.preventDefault();
            const updateForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateUserGroup`, updateForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.userGroups !== undefined) {
                        exports.userGroups = responseJSON.userGroups;
                        renderUserGroups(responseJSON.userGroups);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'User Group Updated',
                        message: 'User group has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating User Group',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUserGroups-edit', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('[name="userGroupId"]').value = userGroupId;
                modalElement.querySelector('[name="userGroupName"]').value = userGroup.userGroupName;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateUserGroup);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function manageMembers(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const userGroupId = buttonElement.dataset.userGroupId;
        if (userGroupId === undefined) {
            return;
        }
        const userGroup = exports.userGroups.find((ug) => ug.userGroupId.toString() === userGroupId);
        if (userGroup === undefined) {
            return;
        }
        // let closeModalFunction: () => void
        let currentMembers = [];
        /*
        function refreshMembers(): void {
          fetch(`${shiftLog.urlPrefix}/admin/userGroup/${userGroupId}`)
            .then(async (response) => await response.json())
            .then((responseJSON: { userGroup?: UserGroup }) => {
              if (responseJSON.userGroup !== undefined) {
                currentMembers = responseJSON.userGroup.members ?? []
                renderMembersList()
              }
            })
            .catch(() => {
              // Error handling
            })
        }
        */
        function renderMembersList() {
            const modalElement = document.querySelector('.modal.is-active');
            const membersContainer = modalElement.querySelector('#container--members');
            if (currentMembers.length === 0) {
                membersContainer.innerHTML =
                    '<p class="has-text-grey">No members in this group.</p>';
                return;
            }
            const listHtml = currentMembers
                .map((userName) => /* html */ `
            <div class="field is-grouped">
              <div class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  value="${cityssm.escapeHTML(userName)}"
                  readonly
                />
              </div>
              <div class="control">
                <button class="button is-danger remove-member" data-user-name="${cityssm.escapeHTML(userName)}" type="button">
                  <span class="icon">
                    <i class="fa-solid fa-times"></i>
                  </span>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          `)
                .join('');
            // eslint-disable-next-line no-unsanitized/property
            membersContainer.innerHTML = listHtml;
            // Add event listeners for remove buttons
            const removeButtons = membersContainer.querySelectorAll('.remove-member');
            for (const button of removeButtons) {
                button.addEventListener('click', removeMember);
            }
        }
        function addMember(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            const userName = addForm.querySelector('[name="userName"]').value;
            if (userName === '') {
                return;
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddUserGroupMember`, {
                userGroupId,
                userName
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = responseJSON.userGroup.members ?? [];
                        renderMembersList();
                        // Update the user group in the main list and re-render
                        const groupIndex = exports.userGroups.findIndex((ug) => ug.userGroupId.toString() === userGroupId);
                        if (groupIndex !== -1 &&
                            responseJSON.userGroup.memberCount !== undefined) {
                            exports.userGroups[groupIndex].memberCount =
                                responseJSON.userGroup.memberCount;
                            renderUserGroups(exports.userGroups);
                        }
                    }
                    // Reset the form
                    ;
                    addForm.querySelector('[name="userName"]').value = '';
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Added',
                        message: 'User has been added to the group.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Member',
                        message: 'Please try again.'
                    });
                }
            });
        }
        function removeMember(removeMemberClickEvent) {
            const removeButton = removeMemberClickEvent.currentTarget;
            const userName = removeButton.dataset.userName;
            if (userName === undefined) {
                return;
            }
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteUserGroupMember`, {
                userGroupId,
                userName
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = responseJSON.userGroup.members ?? [];
                        renderMembersList();
                        // Update the user group in the main list and re-render
                        const groupIndex = exports.userGroups.findIndex((ug) => ug.userGroupId.toString() === userGroupId);
                        if (groupIndex !== -1 &&
                            responseJSON.userGroup.memberCount !== undefined) {
                            exports.userGroups[groupIndex].memberCount =
                                responseJSON.userGroup.memberCount;
                            renderUserGroups(exports.userGroups);
                        }
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Removed',
                        message: 'User has been removed from the group.'
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
        cityssm.openHtmlModal('adminUserGroups-members', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#span--groupName').textContent = userGroup.userGroupName;
                // Populate user dropdown
                const userSelect = modalElement.querySelector('[name="userName"]');
                // eslint-disable-next-line no-unsanitized/property
                userSelect.innerHTML =
                    '<option value="">Select a user...</option>' +
                        exports.users
                            .map((user) => /*html*/ `
                <option value="${cityssm.escapeHTML(user.userName)}">
                  ${cityssm.escapeHTML(user.userName)}
                </option>
              `)
                            .join('');
                // Get current members
                fetch(`${shiftLog.urlPrefix}/admin/userGroup/${userGroupId}`)
                    .then(async (response) => await response.json())
                    .then((responseJSON) => {
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = responseJSON.userGroup.members ?? [];
                        renderMembersList();
                    }
                })
                    .catch(() => {
                    // Error handling
                });
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                // closeModalFunction = _closeModalFunction
                modalElement
                    .querySelector('#form--addMember')
                    ?.addEventListener('submit', addMember);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function buildUserGroupRowElement(userGroup) {
        const rowElement = document.createElement('tr');
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /*html*/ `
      <td>${cityssm.escapeHTML(userGroup.userGroupName)}</td>
      <td class="has-text-centered">${userGroup.memberCount ?? 0}</td>
      <td class="has-text-centered">
        <div class="buttons is-justify-content-center">
          <button
            class="button is-small is-info manage-members"
            data-user-group-id="${userGroup.userGroupId}"
            title="Manage Members"
          >
            <span class="icon">
              <i class="fa-solid fa-users"></i>
            </span>
            <span>Members</span>
          </button>
          <button
            class="button is-small is-primary edit-user-group"
            data-user-group-id="${userGroup.userGroupId}"
            title="Edit User Group"
          >
            <span class="icon">
              <i class="fa-solid fa-edit"></i>
            </span>
            <span>Edit</span>
          </button>
          <button
            class="button is-small is-danger delete-user-group"
            data-user-group-id="${userGroup.userGroupId}"
            title="Delete User Group"
          >
            <span class="icon">
              <i class="fa-solid fa-trash"></i>
            </span>
            <span>Delete</span>
          </button>
        </div>
      </td>
    `;
        return rowElement;
    }
    function renderUserGroups(userGroups) {
        if (userGroups.length === 0) {
            userGroupsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">No user groups found.</div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Group Name</th>
          <th class="has-text-centered">Members</th>
          <th class="has-text-centered">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        for (const userGroup of userGroups) {
            const rowElement = buildUserGroupRowElement(userGroup);
            tableElement.querySelector('tbody')?.append(rowElement);
        }
        // Add event listeners
        const manageMembersButtons = tableElement.querySelectorAll('.manage-members');
        for (const button of manageMembersButtons) {
            button.addEventListener('click', manageMembers);
        }
        const editButtons = tableElement.querySelectorAll('.edit-user-group');
        for (const button of editButtons) {
            button.addEventListener('click', editUserGroup);
        }
        const deleteButtons = tableElement.querySelectorAll('.delete-user-group');
        for (const button of deleteButtons) {
            button.addEventListener('click', deleteUserGroup);
        }
        userGroupsContainerElement.replaceChildren(tableElement);
    }
    document
        .querySelector('#button--addUserGroup')
        ?.addEventListener('click', () => {
        let closeModalFunction;
        function doAddUserGroup(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddUserGroup`, addForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    exports.userGroups = responseJSON.userGroups;
                    renderUserGroups(responseJSON.userGroups);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'User Group Added',
                        message: 'User group has been successfully created.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding User Group',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUserGroups-add', {
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddUserGroup);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderUserGroups(exports.userGroups);
})();
