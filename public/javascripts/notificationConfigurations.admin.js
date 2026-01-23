"use strict";
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var notificationConfigurations = exports.notificationConfigurations;
    var tbodyElement = document.querySelector('#tbody--notificationConfigurations');
    function getNotificationTypeDetail(notificationType, notificationTypeFormJson) {
        var _a, _b, _c;
        try {
            var config = JSON.parse(notificationTypeFormJson);
            switch (notificationType) {
                case 'email': {
                    var emails = (_a = config.recipientEmails) !== null && _a !== void 0 ? _a : [];
                    return "Recipients: ".concat(cityssm.escapeHTML(emails.length > 0 ? emails[0] : '')).concat(emails.length > 1 ? ", +".concat(emails.length - 1, " more") : '');
                }
                case 'msTeams': {
                    var url = (_b = config.webhookUrl) !== null && _b !== void 0 ? _b : '';
                    var displayUrl = url.length > 40 ? "".concat(url.slice(0, 40), "...") : url;
                    return "Webhook: ".concat(cityssm.escapeHTML(displayUrl));
                }
                case 'ntfy': {
                    return "Topic: ".concat(cityssm.escapeHTML((_c = config.topic) !== null && _c !== void 0 ? _c : ''));
                }
                // No default
            }
        }
        catch (_d) {
            // ignore parse errors
        }
        return '';
    }
    function renderNotificationConfigurations() {
        var _a, _b, _c, _d;
        if (notificationConfigurations.length === 0) {
            tbodyElement.innerHTML = /* html */ "\n        <tr id=\"tr--noNotificationConfigurations\">\n          <td class=\"has-text-centered has-text-grey\" colspan=\"5\">\n            No notification configurations found. Click \"Add Notification Configuration\" to create one.\n          </td>\n        </tr>\n      ";
            return;
        }
        // Clear existing
        tbodyElement.innerHTML = '';
        var _loop_1 = function (config) {
            var assignedTo = exports.assignedToList.find(function (at) { return at.assignedToId === config.assignedToId; });
            var assignedToDisplay = assignedTo === undefined
                ? '<span class="has-text-grey-light">All</span>'
                : "<span class=\"assigned-to-name\">".concat(cityssm.escapeHTML(assignedTo.assignedToName), "</span>");
            var notificationTypeDetail = getNotificationTypeDetail(config.notificationType, config.notificationTypeFormJson);
            var rowElement = document.createElement('tr');
            rowElement.dataset.notificationConfigurationId =
                config.notificationConfigurationId.toString();
            // eslint-disable-next-line no-unsanitized/property
            rowElement.innerHTML = /* html */ "\n        <td>\n          <span class=\"notification-queue\">\n            ".concat(cityssm.escapeHTML(config.notificationQueue), "\n          </span>\n        </td>\n        <td>\n          <span class=\"notification-type\">\n            ").concat(cityssm.escapeHTML(config.notificationType), "\n          </span>\n          ").concat(notificationTypeDetail ? "<br /><span class=\"is-size-7 has-text-grey\">".concat(notificationTypeDetail, "</span>") : '', "\n        </td>\n        <td>\n          ").concat(assignedToDisplay, "\n        </td>\n        <td class=\"has-text-centered\">\n          ").concat(config.isActive
                ? '<span class="tag is-success">Active</span>'
                : '<span class="tag">Inactive</span>', "\n        </td>\n        <td class=\"has-text-right\">\n          <div class=\"buttons are-small is-right\">\n            <button\n              class=\"button is-light button--toggleIsActive\"\n              data-notification-configuration-id=\"").concat(config.notificationConfigurationId, "\"\n              data-is-active=\"").concat(config.isActive ? '1' : '0', "\"\n              type=\"button\"\n              title=\"").concat(config.isActive ? 'Deactivate' : 'Activate', "\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-toggle-").concat(config.isActive ? 'on' : 'off', "\"></i>\n              </span>\n              <span>Toggle Active</span>\n            </button>\n            <button\n              class=\"button is-info button--editNotificationConfiguration\"\n              data-notification-configuration-id=\"").concat(config.notificationConfigurationId, "\"\n              data-notification-queue=\"").concat(cityssm.escapeHTML(config.notificationQueue), "\"\n              data-notification-type=\"").concat(cityssm.escapeHTML(config.notificationType), "\"\n              data-notification-type-form-json=\"").concat(cityssm.escapeHTML(config.notificationTypeFormJson), "\"\n              data-assigned-to-id=\"").concat((_a = config.assignedToId) !== null && _a !== void 0 ? _a : '', "\"\n              data-is-active=\"").concat(config.isActive ? '1' : '0', "\"\n              type=\"button\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-pencil\"></i>\n              </span>\n              <span>Edit</span>\n            </button>\n            <button\n              class=\"button is-danger button--deleteNotificationConfiguration\"\n              data-notification-configuration-id=\"").concat(config.notificationConfigurationId, "\"\n              data-notification-queue=\"").concat(cityssm.escapeHTML(config.notificationQueue), "\"\n              type=\"button\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-trash\"></i>\n              </span>\n              <span>Delete</span>\n            </button>\n          </div>\n        </td>\n      ");
            (_b = rowElement
                .querySelector('.button--toggleIsActive')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', toggleIsActive);
            (_c = rowElement
                .querySelector('.button--editNotificationConfiguration')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', editNotificationConfiguration);
            (_d = rowElement
                .querySelector('.button--deleteNotificationConfiguration')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', deleteNotificationConfiguration);
            tbodyElement.append(rowElement);
        };
        for (var _i = 0, notificationConfigurations_1 = notificationConfigurations; _i < notificationConfigurations_1.length; _i++) {
            var config = notificationConfigurations_1[_i];
            _loop_1(config);
        }
    }
    function toggleIsActive(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var notificationConfigurationId = buttonElement.dataset.notificationConfigurationId;
        if (notificationConfigurationId === undefined) {
            return;
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doToggleNotificationConfigurationIsActive"), {
            notificationConfigurationId: notificationConfigurationId
        }, function (responseJSON) {
            if (responseJSON.success) {
                var configIndex = notificationConfigurations.findIndex(function (c) {
                    return c.notificationConfigurationId ===
                        Number.parseInt(notificationConfigurationId, 10);
                });
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
        var _a, _b, _c;
        var formContainer = modalElement.querySelector('#notificationTypeFormContainer');
        formContainer.innerHTML = '';
        var config;
        if (existingConfig) {
            try {
                config = JSON.parse(existingConfig);
            }
            catch (_d) {
                // ignore parse errors
            }
        }
        switch (notificationType) {
            case 'email': {
                var emailConfig = config;
                formContainer.innerHTML = /* html */ "\n          <div class=\"field\">\n            <label class=\"label\" for=\"notificationTypeForm--recipientEmails\">\n              Recipient Email Addresses\n              <span class=\"has-text-weight-normal is-size-7\">(comma-separated)</span>\n            </label>\n            <div class=\"control\">\n              <input\n                class=\"input\"\n                id=\"notificationTypeForm--recipientEmails\"\n                name=\"recipientEmails\"\n                type=\"text\"\n                value=\"".concat(cityssm.escapeHTML((_a = emailConfig === null || emailConfig === void 0 ? void 0 : emailConfig.recipientEmails.join(', ')) !== null && _a !== void 0 ? _a : ''), "\"\n                required\n              />\n            </div>\n          </div>\n        ");
                break;
            }
            case 'msTeams': {
                var msTeamsConfig = config;
                formContainer.innerHTML = /* html */ "\n          <div class=\"field\">\n            <label class=\"label\" for=\"notificationTypeForm--webhookUrl\">\n              Microsoft Teams Webhook URL\n            </label>\n            <div class=\"control\">\n              <input\n                class=\"input\"\n                id=\"notificationTypeForm--webhookUrl\"\n                name=\"webhookUrl\"\n                type=\"url\"\n                value=\"".concat(cityssm.escapeHTML((_b = msTeamsConfig === null || msTeamsConfig === void 0 ? void 0 : msTeamsConfig.webhookUrl) !== null && _b !== void 0 ? _b : ''), "\"\n                required\n              />\n            </div>\n          </div>\n        ");
                break;
            }
            case 'ntfy': {
                var ntfyConfig = config;
                formContainer.innerHTML = /* html */ "\n          <div class=\"field\">\n            <label class=\"label\" for=\"notificationTypeForm--topic\">\n              Ntfy Topic\n            </label>\n            <div class=\"control\">\n              <input\n                class=\"input\"\n                id=\"notificationTypeForm--topic\"\n                name=\"topic\"\n                type=\"text\"\n                value=\"".concat(cityssm.escapeHTML((_c = ntfyConfig === null || ntfyConfig === void 0 ? void 0 : ntfyConfig.topic) !== null && _c !== void 0 ? _c : ''), "\"\n                required\n              />\n            </div>\n          </div>\n        ");
                break;
            }
        }
    }
    function addNotificationConfiguration() {
        var closeModalFunction;
        function doAddNotificationConfiguration(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            // Build notification type form JSON
            var notificationType = addForm.querySelector('#addNotificationConfiguration--notificationType').value;
            var notificationTypeFormJson = '{}';
            switch (notificationType) {
                case 'email': {
                    var recipientEmailsString = addForm.querySelector('#notificationTypeForm--recipientEmails').value;
                    notificationTypeFormJson = JSON.stringify({
                        recipientEmails: recipientEmailsString
                            .split(',')
                            .map(function (recipientEmail) { return recipientEmail.trim(); })
                            .filter(function (recipientEmail) { return recipientEmail !== ''; })
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
            var formData = {
                notificationQueue: addForm.querySelector('#addNotificationConfiguration--notificationQueue').value,
                notificationType: notificationType,
                notificationTypeFormJson: notificationTypeFormJson,
                assignedToId: addForm.querySelector('#addNotificationConfiguration--assignedToId').value,
                isActive: addForm.querySelector('#addNotificationConfiguration--isActive').checked
            };
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddNotificationConfiguration"), formData, function (responseJSON) {
                var _a;
                if (responseJSON.success &&
                    responseJSON.notificationConfigurationId) {
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
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'An error occurred.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminNotificationConfiguration-add', {
            onshow: function (modalElement) {
                // Populate notification queue options
                var queueSelect = modalElement.querySelector('#addNotificationConfiguration--notificationQueue');
                for (var _i = 0, _a = exports.notificationQueueTypes; _i < _a.length; _i++) {
                    var queueType = _a[_i];
                    var option = document.createElement('option');
                    option.value = queueType;
                    option.textContent = queueType;
                    queueSelect.append(option);
                }
                // Populate notification type options
                var typeSelect = modalElement.querySelector('#addNotificationConfiguration--notificationType');
                for (var _b = 0, _c = exports.notificationTypes; _b < _c.length; _b++) {
                    var type = _c[_b];
                    var option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    typeSelect.append(option);
                }
                // Populate assigned to options
                var assignedToSelect = modalElement.querySelector('#addNotificationConfiguration--assignedToId');
                for (var _d = 0, _e = exports.assignedToList; _d < _e.length; _d++) {
                    var assignedTo = _e[_d];
                    var option = document.createElement('option');
                    option.value = assignedTo.assignedToId.toString();
                    option.textContent = assignedTo.assignedToName;
                    assignedToSelect.append(option);
                }
                // Handle notification type change
                typeSelect.addEventListener('change', function () {
                    renderNotificationTypeForm(modalElement, typeSelect.value);
                });
                // Render initial form
                renderNotificationTypeForm(modalElement, typeSelect.value);
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddNotificationConfiguration);
                // Focus the notification queue field
                var queueSelect = modalElement.querySelector('#addNotificationConfiguration--notificationQueue');
                queueSelect.focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function editNotificationConfiguration(clickEvent) {
        var _a, _b, _c;
        var buttonElement = clickEvent.currentTarget;
        var notificationConfigurationId = buttonElement.dataset.notificationConfigurationId;
        var currentNotificationQueue = (_a = buttonElement.dataset.notificationQueue) !== null && _a !== void 0 ? _a : '';
        var currentNotificationType = (_b = buttonElement.dataset.notificationType) !== null && _b !== void 0 ? _b : '';
        var currentNotificationTypeFormJson = (_c = buttonElement.dataset.notificationTypeFormJson) !== null && _c !== void 0 ? _c : '{}';
        var currentAssignedToId = buttonElement.dataset.assignedToId;
        var currentIsActive = buttonElement.dataset.isActive === '1';
        if (notificationConfigurationId === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateNotificationConfiguration(submitEvent) {
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            // Build notification type form JSON
            var notificationType = editForm.querySelector('#editNotificationConfiguration--notificationType').value;
            var notificationTypeFormJson = '{}';
            switch (notificationType) {
                case 'email': {
                    var recipientEmailsString = editForm.querySelector('#notificationTypeForm--recipientEmails').value;
                    notificationTypeFormJson = JSON.stringify({
                        recipientEmails: recipientEmailsString
                            .split(',')
                            .map(function (recipientEmail) { return recipientEmail.trim(); })
                            .filter(function (recipientEmail) { return recipientEmail !== ''; })
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
            var formData = {
                notificationConfigurationId: notificationConfigurationId,
                notificationQueue: editForm.querySelector('#editNotificationConfiguration--notificationQueue').value,
                notificationType: notificationType,
                notificationTypeFormJson: notificationTypeFormJson,
                assignedToId: editForm.querySelector('#editNotificationConfiguration--assignedToId').value,
                isActive: editForm.querySelector('#editNotificationConfiguration--isActive').checked
            };
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateNotificationConfiguration"), formData, function (responseJSON) {
                if (responseJSON.success) {
                    var configIndex = notificationConfigurations.findIndex(function (c) {
                        return notificationConfigurationId !== undefined &&
                            c.notificationConfigurationId ===
                                Number.parseInt(notificationConfigurationId, 10);
                    });
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
            onshow: function (modalElement) {
                // Populate notification queue options
                var queueSelect = modalElement.querySelector('#editNotificationConfiguration--notificationQueue');
                for (var _i = 0, _a = exports.notificationQueueTypes; _i < _a.length; _i++) {
                    var queueType = _a[_i];
                    var option = document.createElement('option');
                    option.value = queueType;
                    option.textContent = queueType;
                    if (queueType === currentNotificationQueue) {
                        option.selected = true;
                    }
                    queueSelect.append(option);
                }
                // Populate notification type options
                var typeSelect = modalElement.querySelector('#editNotificationConfiguration--notificationType');
                for (var _b = 0, _c = exports.notificationTypes; _b < _c.length; _b++) {
                    var type = _c[_b];
                    var option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    if (type === currentNotificationType) {
                        option.selected = true;
                    }
                    typeSelect.append(option);
                }
                // Populate assigned to options
                var assignedToSelect = modalElement.querySelector('#editNotificationConfiguration--assignedToId');
                for (var _d = 0, _e = exports.assignedToList; _d < _e.length; _d++) {
                    var assignedTo = _e[_d];
                    var option = document.createElement('option');
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
                typeSelect.addEventListener('change', function () {
                    renderNotificationTypeForm(modalElement, typeSelect.value);
                });
                // Render initial form with existing data
                renderNotificationTypeForm(modalElement, currentNotificationType, currentNotificationTypeFormJson);
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateNotificationConfiguration);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteNotificationConfiguration(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var notificationConfigurationId = buttonElement.dataset.notificationConfigurationId;
        var notificationQueue = (_a = buttonElement.dataset.notificationQueue) !== null && _a !== void 0 ? _a : '';
        if (notificationConfigurationId === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Notification Configuration',
            message: "Are you sure you want to delete the notification configuration for \"".concat(cityssm.escapeHTML(notificationQueue), "\"?"),
            okButton: {
                text: 'Yes, Delete Configuration',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteNotificationConfiguration"), {
                        notificationConfigurationId: notificationConfigurationId
                    }, function (responseJSON) {
                        if (responseJSON.success) {
                            notificationConfigurations = notificationConfigurations.filter(function (c) {
                                return c.notificationConfigurationId !==
                                    Number.parseInt(notificationConfigurationId, 10);
                            });
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
    (_a = document
        .querySelector('#button--addNotificationConfiguration')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', addNotificationConfiguration);
    renderNotificationConfigurations();
})();
//# sourceMappingURL=notificationConfigurations.admin.js.map