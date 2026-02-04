/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    let notificationConfigurations = exports.notificationConfigurations;
    const tbodyElement = document.querySelector('#tbody--notificationConfigurations');
    function getNotificationTypeDetail(notificationType, notificationTypeFormJson) {
        try {
            const config = JSON.parse(notificationTypeFormJson);
            switch (notificationType) {
                case 'email': {
                    const emails = config.recipientEmails ?? [];
                    return `Recipients: ${cityssm.escapeHTML(emails.length > 0 ? emails[0] : '')}${emails.length > 1 ? `, +${emails.length - 1} more` : ''}`;
                }
                case 'msTeams': {
                    const url = config.webhookUrl ?? '';
                    const displayUrl = url.length > 40 ? `${url.slice(0, 40)}...` : url;
                    return `Webhook: ${cityssm.escapeHTML(displayUrl)}`;
                }
                case 'ntfy': {
                    return `Topic: ${cityssm.escapeHTML(config.topic ?? '')}`;
                }
                // No default
            }
        }
        catch {
            // ignore parse errors
        }
        return '';
    }
    function renderNotificationConfigurations() {
        if (notificationConfigurations.length === 0) {
            tbodyElement.innerHTML = /* html */ `
        <tr id="tr--noNotificationConfigurations">
          <td class="has-text-centered has-text-grey" colspan="5">
            No notification configurations found. Click "Add Notification Configuration" to create one.
          </td>
        </tr>
      `;
            return;
        }
        // Clear existing
        tbodyElement.innerHTML = '';
        for (const config of notificationConfigurations) {
            const assignedTo = exports.assignedToList.find((at) => at.assignedToId === config.assignedToId);
            const assignedToDisplay = assignedTo === undefined
                ? '<span class="has-text-grey-light">All</span>'
                : `<span class="assigned-to-name">${cityssm.escapeHTML(assignedTo.assignedToName)}</span>`;
            const notificationTypeDetail = getNotificationTypeDetail(config.notificationType, config.notificationTypeFormJson);
            const rowElement = document.createElement('tr');
            rowElement.dataset.notificationConfigurationId =
                config.notificationConfigurationId.toString();
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = /* html */ `
        <td>
          <span class="notification-queue">
            ${cityssm.escapeHTML(config.notificationQueue)}
          </span>
        </td>
        <td>
          <span class="notification-type">
            ${cityssm.escapeHTML(config.notificationType)}
          </span>
          ${notificationTypeDetail ? `<br /><span class="is-size-7 has-text-grey">${notificationTypeDetail}</span>` : ''}
        </td>
        <td>
          ${assignedToDisplay}
        </td>
        <td class="has-text-centered">
          ${config.isActive
                ? '<span class="tag is-success">Active</span>'
                : '<span class="tag">Inactive</span>'}
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button
              class="button is-light button--toggleIsActive"
              data-notification-configuration-id="${config.notificationConfigurationId}"
              data-is-active="${config.isActive ? '1' : '0'}"
              type="button"
              title="${config.isActive ? 'Deactivate' : 'Activate'}"
            >
              <span class="icon">
                <i class="fa-solid fa-toggle-${config.isActive ? 'on' : 'off'}"></i>
              </span>
              <span>Toggle Active</span>
            </button>
            <button
              class="button is-info button--editNotificationConfiguration"
              data-notification-configuration-id="${config.notificationConfigurationId}"
              data-notification-queue="${cityssm.escapeHTML(config.notificationQueue)}"
              data-notification-type="${cityssm.escapeHTML(config.notificationType)}"
              data-notification-type-form-json="${cityssm.escapeHTML(config.notificationTypeFormJson)}"
              data-assigned-to-id="${config.assignedToId ?? ''}"
              data-is-active="${config.isActive ? '1' : '0'}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button
              class="button is-danger button--deleteNotificationConfiguration"
              data-notification-configuration-id="${config.notificationConfigurationId}"
              data-notification-queue="${cityssm.escapeHTML(config.notificationQueue)}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;
            rowElement
                .querySelector('.button--toggleIsActive')
                ?.addEventListener('click', toggleIsActive);
            rowElement
                .querySelector('.button--editNotificationConfiguration')
                ?.addEventListener('click', editNotificationConfiguration);
            rowElement
                .querySelector('.button--deleteNotificationConfiguration')
                ?.addEventListener('click', deleteNotificationConfiguration);
            tbodyElement.append(rowElement);
        }
    }
    function toggleIsActive(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const notificationConfigurationId = buttonElement.dataset.notificationConfigurationId;
        if (notificationConfigurationId === undefined) {
            return;
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doToggleNotificationConfigurationIsActive`, {
            notificationConfigurationId
        }, (responseJSON) => {
            if (responseJSON.success) {
                const configIndex = notificationConfigurations.findIndex((c) => c.notificationConfigurationId ===
                    Number.parseInt(notificationConfigurationId, 10));
                if (configIndex !== -1) {
                    notificationConfigurations[configIndex].isActive =
                        !notificationConfigurations[configIndex].isActive;
                    renderNotificationConfigurations();
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Toggling Status',
                    message: 'An error occurred toggling the active status.'
                });
            }
        });
    }
    function renderNotificationTypeForm(modalElement, notificationType, existingConfig) {
        const formContainer = modalElement.querySelector('#notificationTypeFormContainer');
        formContainer.innerHTML = '';
        let config;
        if (existingConfig) {
            try {
                config = JSON.parse(existingConfig);
            }
            catch {
                // ignore parse errors
            }
        }
        switch (notificationType) {
            case 'email': {
                const emailConfig = config;
                formContainer.innerHTML = /* html */ `
          <div class="field">
            <label class="label" for="notificationTypeForm--recipientEmails">
              Recipient Email Addresses
              <span class="has-text-weight-normal is-size-7">(comma-separated)</span>
            </label>
            <div class="control">
              <input
                class="input"
                id="notificationTypeForm--recipientEmails"
                name="recipientEmails"
                type="text"
                value="${cityssm.escapeHTML(emailConfig?.recipientEmails.join(', ') ?? '')}"
                required
              />
            </div>
          </div>
        `;
                break;
            }
            case 'msTeams': {
                const msTeamsConfig = config;
                // eslint-disable-next-line no-secrets/no-secrets
                formContainer.innerHTML = /* html */ `
          <div class="field">
            <label class="label" for="notificationTypeForm--webhookUrl">
              Microsoft Teams Webhook URL
            </label>
            <div class="control">
              <input
                class="input"
                id="notificationTypeForm--webhookUrl"
                name="webhookUrl"
                type="url"
                value="${cityssm.escapeHTML(msTeamsConfig?.webhookUrl ?? '')}"
                required
              />
            </div>
          </div>
        `;
                break;
            }
            case 'ntfy': {
                const ntfyConfig = config;
                formContainer.innerHTML = /* html */ `
          <div class="field">
            <label class="label" for="notificationTypeForm--topic">
              Ntfy Topic
            </label>
            <div class="control">
              <input
                class="input"
                id="notificationTypeForm--topic"
                name="topic"
                type="text"
                value="${cityssm.escapeHTML(ntfyConfig?.topic ?? '')}"
                required
              />
            </div>
          </div>
        `;
                break;
            }
        }
    }
    function addNotificationConfiguration() {
        let closeModalFunction;
        function doAddNotificationConfiguration(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            // Build notification type form JSON
            const notificationType = addForm.querySelector('#addNotificationConfiguration--notificationType').value;
            let notificationTypeFormJson = '{}';
            switch (notificationType) {
                case 'email': {
                    const recipientEmailsString = addForm.querySelector('#notificationTypeForm--recipientEmails').value;
                    notificationTypeFormJson = JSON.stringify({
                        recipientEmails: recipientEmailsString
                            .split(',')
                            .map((recipientEmail) => recipientEmail.trim())
                            .filter((recipientEmail) => recipientEmail !== '')
                    });
                    break;
                }
                case 'msTeams': {
                    notificationTypeFormJson = JSON.stringify({
                        webhookUrl: addForm.querySelector('#notificationTypeForm--webhookUrl').value
                    });
                    break;
                }
                case 'ntfy': {
                    notificationTypeFormJson = JSON.stringify({
                        topic: addForm.querySelector('#notificationTypeForm--topic').value
                    });
                    break;
                }
            }
            const formData = {
                notificationQueue: addForm.querySelector('#addNotificationConfiguration--notificationQueue').value,
                notificationType,
                notificationTypeFormJson,
                assignedToId: addForm.querySelector('#addNotificationConfiguration--assignedToId').value,
                isActive: addForm.querySelector('#addNotificationConfiguration--isActive').checked
            };
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddNotificationConfiguration`, formData, (responseJSON) => {
                if (responseJSON.success) {
                    notificationConfigurations.push({
                        notificationConfigurationId: responseJSON.notificationConfigurationId,
                        notificationQueue: formData.notificationQueue,
                        notificationType: formData.notificationType,
                        notificationTypeFormJson: formData.notificationTypeFormJson,
                        assignedToId: formData.assignedToId === ''
                            ? undefined
                            : Number.parseInt(formData.assignedToId, 10),
                        isActive: formData.isActive
                    });
                    renderNotificationConfigurations();
                    closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Configuration',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNotificationConfiguration-add', {
            onshow(modalElement) {
                // Populate notification queue options
                const queueSelect = modalElement.querySelector('#addNotificationConfiguration--notificationQueue');
                for (const queueType of exports.notificationQueueTypes) {
                    const option = document.createElement('option');
                    option.value = queueType;
                    option.textContent = queueType;
                    queueSelect.append(option);
                }
                // Populate notification type options
                const typeSelect = modalElement.querySelector('#addNotificationConfiguration--notificationType');
                for (const type of exports.notificationTypes) {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    typeSelect.append(option);
                }
                // Populate assigned to options
                const assignedToSelect = modalElement.querySelector('#addNotificationConfiguration--assignedToId');
                for (const assignedTo of exports.assignedToList) {
                    const option = document.createElement('option');
                    option.value = assignedTo.assignedToId.toString();
                    option.textContent = assignedTo.assignedToName;
                    assignedToSelect.append(option);
                }
                // Handle notification type change
                typeSelect.addEventListener('change', () => {
                    renderNotificationTypeForm(modalElement, typeSelect.value);
                });
                // Render initial form
                renderNotificationTypeForm(modalElement, typeSelect.value);
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddNotificationConfiguration);
                // Focus the notification queue field
                const queueSelect = modalElement.querySelector('#addNotificationConfiguration--notificationQueue');
                queueSelect.focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editNotificationConfiguration(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const notificationConfigurationId = buttonElement.dataset.notificationConfigurationId;
        const currentNotificationQueue = buttonElement.dataset.notificationQueue ?? '';
        const currentNotificationType = buttonElement.dataset.notificationType ?? '';
        const currentNotificationTypeFormJson = buttonElement.dataset.notificationTypeFormJson ?? '{}';
        const currentAssignedToId = buttonElement.dataset.assignedToId;
        const currentIsActive = buttonElement.dataset.isActive === '1';
        if (notificationConfigurationId === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateNotificationConfiguration(submitEvent) {
            submitEvent.preventDefault();
            const editForm = submitEvent.currentTarget;
            // Build notification type form JSON
            const notificationType = editForm.querySelector('#editNotificationConfiguration--notificationType').value;
            let notificationTypeFormJson = '{}';
            switch (notificationType) {
                case 'email': {
                    const recipientEmailsString = editForm.querySelector('#notificationTypeForm--recipientEmails').value;
                    notificationTypeFormJson = JSON.stringify({
                        recipientEmails: recipientEmailsString
                            .split(',')
                            .map((recipientEmail) => recipientEmail.trim())
                            .filter((recipientEmail) => recipientEmail !== '')
                    });
                    break;
                }
                case 'msTeams': {
                    notificationTypeFormJson = JSON.stringify({
                        webhookUrl: editForm.querySelector('#notificationTypeForm--webhookUrl').value
                    });
                    break;
                }
                case 'ntfy': {
                    notificationTypeFormJson = JSON.stringify({
                        topic: editForm.querySelector('#notificationTypeForm--topic').value
                    });
                    break;
                }
            }
            const formData = {
                notificationConfigurationId,
                notificationQueue: editForm.querySelector('#editNotificationConfiguration--notificationQueue').value,
                notificationType,
                notificationTypeFormJson,
                assignedToId: editForm.querySelector('#editNotificationConfiguration--assignedToId').value,
                isActive: editForm.querySelector('#editNotificationConfiguration--isActive').checked
            };
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateNotificationConfiguration`, formData, (responseJSON) => {
                if (responseJSON.success) {
                    const configIndex = notificationConfigurations.findIndex((c) => notificationConfigurationId !== undefined &&
                        c.notificationConfigurationId ===
                            Number.parseInt(notificationConfigurationId, 10));
                    if (configIndex !== -1) {
                        notificationConfigurations[configIndex].notificationQueue =
                            formData.notificationQueue;
                        notificationConfigurations[configIndex].notificationType =
                            formData.notificationType;
                        notificationConfigurations[configIndex].notificationTypeFormJson =
                            formData.notificationTypeFormJson;
                        notificationConfigurations[configIndex].assignedToId =
                            formData.assignedToId === ''
                                ? undefined
                                : Number.parseInt(formData.assignedToId, 10);
                        notificationConfigurations[configIndex].isActive =
                            formData.isActive;
                    }
                    renderNotificationConfigurations();
                    closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Configuration',
                        message: 'An error occurred updating the configuration.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNotificationConfiguration-edit', {
            onshow(modalElement) {
                // Populate notification queue options
                const queueSelect = modalElement.querySelector('#editNotificationConfiguration--notificationQueue');
                for (const queueType of exports.notificationQueueTypes) {
                    const option = document.createElement('option');
                    option.value = queueType;
                    option.textContent = queueType;
                    if (queueType === currentNotificationQueue) {
                        option.selected = true;
                    }
                    queueSelect.append(option);
                }
                // Populate notification type options
                const typeSelect = modalElement.querySelector('#editNotificationConfiguration--notificationType');
                for (const type of exports.notificationTypes) {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    if (type === currentNotificationType) {
                        option.selected = true;
                    }
                    typeSelect.append(option);
                }
                // Populate assigned to options
                const assignedToSelect = modalElement.querySelector('#editNotificationConfiguration--assignedToId');
                for (const assignedTo of exports.assignedToList) {
                    const option = document.createElement('option');
                    option.value = assignedTo.assignedToId.toString();
                    option.textContent = assignedTo.assignedToName;
                    if (currentAssignedToId &&
                        assignedTo.assignedToId === Number.parseInt(currentAssignedToId, 10)) {
                        option.selected = true;
                    }
                    assignedToSelect.append(option);
                }
                // Set isActive checkbox
                ;
                modalElement.querySelector('#editNotificationConfiguration--isActive').checked = currentIsActive;
                // Handle notification type change
                typeSelect.addEventListener('change', () => {
                    renderNotificationTypeForm(modalElement, typeSelect.value);
                });
                // Render initial form with existing data
                renderNotificationTypeForm(modalElement, currentNotificationType, currentNotificationTypeFormJson);
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateNotificationConfiguration);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteNotificationConfiguration(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const notificationConfigurationId = buttonElement.dataset.notificationConfigurationId;
        const notificationQueue = buttonElement.dataset.notificationQueue ?? '';
        if (notificationConfigurationId === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Notification Configuration',
            message: `Are you sure you want to delete the notification configuration for "${cityssm.escapeHTML(notificationQueue)}"?`,
            okButton: {
                text: 'Yes, Delete Configuration',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteNotificationConfiguration`, {
                        notificationConfigurationId
                    }, (responseJSON) => {
                        if (responseJSON.success) {
                            notificationConfigurations = notificationConfigurations.filter((c) => c.notificationConfigurationId !==
                                Number.parseInt(notificationConfigurationId, 10));
                            renderNotificationConfigurations();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Configuration',
                                message: 'An error occurred deleting the configuration.'
                            });
                        }
                    });
                }
            }
        });
    }
    document
        .querySelector('#button--addNotificationConfiguration')
        ?.addEventListener('click', addNotificationConfiguration);
    renderNotificationConfigurations();
})();
